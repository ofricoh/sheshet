/* ============================================================
   PLOTTER MACHINE — CONDUCTOR
   ------------------------------------------------------------
   Wires loader → artboard → renderer → scheduler → pen →
   transport into one running composition.

   visualState = f(currentTime) for every Unit.
   ============================================================ */

(function (global) {
  "use strict";

  function extendScheduleBounds(sched, acc) {
    if (!sched) return;

    if (sched.cycles?.length) {
      for (const cycle of sched.cycles) {
        if (cycle.draw) {
          acc(cycle.draw.start, cycle.draw.start + cycle.draw.duration);
        }
        if (cycle.erase) {
          acc(cycle.erase.start, cycle.erase.start + cycle.erase.duration);
        }
      }
      return;
    }

    if (sched.draw) {
      acc(sched.draw.start, sched.draw.start + sched.draw.duration);
    }
    if (sched.erase) {
      acc(sched.erase.start, sched.erase.start + sched.erase.duration);
    }
  }

  /** Per-layer [min, max] song time where any unit may be visible. */
  function computeLayerActiveBounds(schedules) {
    const bounds = new Map();

    for (const [layerId, schedMap] of schedules) {
      let minT = Infinity;
      let maxT = -Infinity;

      for (const sched of schedMap.values()) {
        extendScheduleBounds(sched, (start, end) => {
          minT = Math.min(minT, start);
          maxT = Math.max(maxT, end);
        });
      }

      if (Number.isFinite(minT)) {
        bounds.set(layerId, { min: minT, max: maxT });
      }
    }

    return bounds;
  }

  function layerActiveAt(bounds, layerId, t) {
    const window = bounds.get(layerId);
    if (!window) return true;
    return t >= window.min - 0.05 && t <= window.max + 0.05;
  }

  /** Active draw spec for living-cycle layers (pen direction changes per pass). */
  function activeDrawSpec(sched, t) {
    if (!sched) return null;

    if (sched.cycles?.length) {
      const cycles = sched.cycles
        .filter((c) => c.draw)
        .slice()
        .sort((a, b) => a.draw.start - b.draw.start);

      for (const cycle of cycles) {
        const eraseEnd = cycle.erase
          ? cycle.erase.start + cycle.erase.duration
          : null;
        if (t >= cycle.draw.start && (eraseEnd == null || t <= eraseEnd)) {
          return cycle.draw;
        }
      }
      return null;
    }

    return sched.draw || null;
  }

  function syncPenDirection(unit, drawSpec) {
    if (!drawSpec || typeof unit.drawer.setDirection !== "function") return;

    const cycleKey =
      drawSpec.start +
      "\0" +
      (drawSpec.phase ?? "") +
      "\0" +
      (drawSpec.reverse ?? "") +
      "\0" +
      JSON.stringify(drawSpec.phases ?? "") +
      "\0" +
      JSON.stringify(drawSpec.reverses ?? "");

    if (unit._penCycleKey === cycleKey) return;
    unit._penCycleKey = cycleKey;

    unit.drawer.setDirection({
      phases: drawSpec.phases,
      reverses: drawSpec.reverses,
      phase: drawSpec.phase,
      reverse: drawSpec.reverse,
    });
  }

  function renderFrame(t, layerHandles, schedules, modulation, layerBounds) {
    const Scheduler = global.PlotterScheduler;
    const overrides =
      modulation && typeof modulation.getDrawOverrides === "function"
        ? modulation.getDrawOverrides(t)
        : null;

    for (const lh of layerHandles.values()) {
      if (layerBounds && !layerActiveAt(layerBounds, lh.id, t)) continue;

      const schedMap = schedules.get(lh.id);
      if (!schedMap) continue;

      for (const unit of lh.units) {
        const sched = schedMap.get(unit.id);
        const overrideKey = lh.id + "\0" + unit.id;
        const override = overrides && overrides.get(overrideKey);

        let state = Scheduler.unitStateAt(sched, t);

        if (!override) {
          syncPenDirection(unit, activeDrawSpec(sched, t));

          const cache = unit._renderCache;
          if (
            cache &&
            cache.progress === state.progress &&
            cache.phase === state.phase
          ) {
            continue;
          }
        }

        if (override) {
          state = Object.assign({}, state, override);
        }

        unit.drawer.draw(state.progress, { phase: state.phase });
        unit._renderCache = {
          progress: state.progress,
          phase: state.phase,
        };
      }
    }

    if (modulation) modulation.apply(t);
  }

  function applyLayerSurfaceStyles(score, layerHandles, style) {
    for (const lh of layerHandles.values()) {
      const layerStyle = resolveStyle(style, score, lh.id);
      if (layerStyle.mixBlendMode) {
        lh.svg.style.mixBlendMode = layerStyle.mixBlendMode;
      }
    }
  }

  /**
   * Boot a full plotter composition.
   *
   * @param {HTMLElement} container
   * @param {object} options
   * @param {string} options.baseDir
   * @param {object} options.score
   * @param {object} [options.style]
   * @param {object} [options.transport]
   * @param {number} [options.seed] optional deterministic shuffle
   */
  async function boot(container, options) {
    if (!container) throw new Error("[plotter] missing container");

    const { baseDir, score, style, transport: transportOpts, seed } =
      options || {};

    if (!score || !Array.isArray(score.layers)) {
      throw new Error("[plotter] score.layers[] is required");
    }

    console.log("[plotter:boot] loading scene…");
    const scene = await global.PlotterLoader.loadScene({
      baseDir,
      layers: score.layers,
      artboard: score.artboard,
    });
    console.log(
      "[plotter:boot] scene ready —",
      scene.layers.length,
      "layer(s):",
      scene.layers.map((l) => l.id).join(", ")
    );

    if (global.PlotterScheduler?.applyUnitFilters) {
      global.PlotterScheduler.applyUnitFilters(scene, score);
    }

    const surfaces = global.PlotterArtboard.mount(container, scene);
    const layerHandles = new Map();

    for (const layer of scene.layers) {
      const svg = surfaces.get(layer.id);
      const layerDef =
        (global.PlotterScheduler &&
          global.PlotterScheduler.findScoreLayer(score, layer.id)) ||
        {};
      const layerStyle = resolveStyle(style, score, layer.id);
      const unitHandles = global.PlotterRendererSVG.renderLayer(
        svg,
        layer,
        layerStyle,
        { artboard: scene.artboard, transform: layerDef.transform }
      );

      layerHandles.set(layer.id, {
        id: layer.id,
        svg,
        units: unitHandles.map((handle) => ({
          id: handle.id,
          handle,
          drawer: null,
        })),
      });
    }

    applyLayerSurfaceStyles(score, layerHandles, style);

    const schedules = global.PlotterScheduler.buildSchedules(
      scene,
      score,
      layerHandles,
      seed
    );
    const layerBounds = computeLayerActiveBounds(schedules);

    for (const lh of layerHandles.values()) {
      const schedMap = schedules.get(lh.id) || new Map();
      const layerDef =
        (global.PlotterScheduler &&
          global.PlotterScheduler.findScoreLayer(score, lh.id)) ||
        {};
      const layerStyle = resolveStyle(style, score, lh.id);
      for (const unit of lh.units) {
        const sched = schedMap.get(unit.id);
        const draw = (sched && sched.draw) || {};
        unit.drawer = global.PlotterPen.create(unit.handle, {
          phase: draw.phases ?? draw.phase ?? 0,
          reverse: draw.reverses ?? draw.reverse ?? false,
          initialProgress: 0,
          renderMode: layerStyle.renderMode || "stroke",
        });
      }
    }

    let modulation = null;
    if (global.PlotterModulation) {
      modulation = global.PlotterModulation.createController(
        score,
        layerHandles,
        schedules
      );
    }

    let analysers = null;
    const analysisStems = buildAnalysisStems(transportOpts);
    if (analysisStems.length && global.PlotterAudioAnalyser) {
      analysers = {};
      for (const stem of analysisStems) {
        try {
          analysers[stem.id] = global.PlotterAudioAnalyser.createAnalyser({
            audio: stem.audio,
            profile: stem.id,
          });
        } catch (err) {
          console.warn(
            `[plotter:boot] analyser "${stem.id}" unavailable:`,
            err.message
          );
          analysers[stem.id] = null;
        }
      }
      if (modulation) {
        modulation.setAudioSample(() => {
          const out = {};
          for (const [id, a] of Object.entries(analysers)) {
            if (a) out[id] = a.sample();
          }
          return out;
        });
      }
    }

    const drawFrame = (time) =>
      renderFrame(time, layerHandles, schedules, modulation, layerBounds);

    let transport = null;
    if (transportOpts) {
      console.log("[plotter:boot] wiring transport…");
      transport = new global.PlotterTransport(
        Object.assign({}, transportOpts, { analysers })
      );
      transport.onTime(drawFrame);
      transport.start();
      transport._emit();
      console.log("[plotter:boot] transport ready");
    } else {
      drawFrame(0);
    }

    return {
      scene,
      layerHandles,
      schedules,
      transport,
      modulation,
      analysers,
      render(t) {
        drawFrame(t);
      },
      destroy() {
        if (transport) transport.destroy();
        container.innerHTML = "";
      },
    };
  }

  function resolveStyle(globalStyle, score, layerId) {
    const songDefault = score.style || {};
    const layerEntry =
      (score.layers || []).find((entry) => {
        const id =
          entry.id || String(entry.file || "").replace(/\.[^.]+$/, "");
        return id === layerId;
      }) || {};
    return Object.assign({}, globalStyle, songDefault, layerEntry.style);
  }

  function buildAnalysisStems(transportOpts) {
    if (!transportOpts) return [];
    if (Array.isArray(transportOpts.analysisStems)) {
      return transportOpts.analysisStems.filter((s) => s && s.audio);
    }
    if (transportOpts.analysisAudio) {
      return [{ id: "flute", audio: transportOpts.analysisAudio }];
    }
    return [];
  }

  global.PlotterConductor = { boot, renderFrame };
})(window);
