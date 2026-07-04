/* ============================================================
   PLOTTER MACHINE — CONDUCTOR
   ------------------------------------------------------------
   Wires loader → artboard → renderer → scheduler → pen →
   transport into one running composition.

   visualState = f(currentTime) for every Unit.
   ============================================================ */

(function (global) {
  "use strict";

  function renderFrame(t, layerHandles, schedules, modulation) {
    const Scheduler = global.PlotterScheduler;
    const overrides =
      modulation && typeof modulation.getDrawOverrides === "function"
        ? modulation.getDrawOverrides(t)
        : null;

    for (const lh of layerHandles.values()) {
      const schedMap = schedules.get(lh.id);
      if (!schedMap) continue;

      for (const unit of lh.units) {
        const sched = schedMap.get(unit.id);
        let state = Scheduler.unitStateAt(sched, t);

        if (overrides) {
          const key = lh.id + "\0" + unit.id;
          const o = overrides.get(key);
          if (o) state = Object.assign({}, state, o);
        }

        unit.drawer.draw(state.progress, { phase: state.phase });
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

    let transport = null;
    if (transportOpts) {
      console.log("[plotter:boot] wiring transport…");
      transport = new global.PlotterTransport(
        Object.assign({}, transportOpts, { analysers })
      );
      transport.onTime((t) =>
        renderFrame(t, layerHandles, schedules, modulation)
      );
      transport.start();
      transport._emit();
      console.log("[plotter:boot] transport ready");
    } else {
      renderFrame(0, layerHandles, schedules, modulation);
    }

    return {
      scene,
      layerHandles,
      schedules,
      transport,
      modulation,
      analysers,
      render(t) {
        renderFrame(t, layerHandles, schedules, modulation);
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
