/* ============================================================
   PLOTTER MACHINE — MODULATION
   ------------------------------------------------------------
   Layer-level audio reactions:
     • tremble   — anchored vibration (flute)
     • flicker   — brief pen unplot on completed shapes (guitar)
     • eraseCue  — audio-triggered fast layer erase (guitar)
   ============================================================ */

(function (global) {
  "use strict";

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function hashUnitId(id) {
    let h = 0;
    const s = String(id || "");
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function seededRand(seed) {
    const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function unitKey(layerId, unitId) {
    return layerId + "\0" + unitId;
  }

  function resolveStemAudio(samples, source) {
    if (!samples) return null;
    const key = source === "other" ? "flute" : source;
    if (typeof samples === "object" && samples[key]) return samples[key];
    if (typeof samples === "object" && samples[source]) return samples[source];
    return samples;
  }

  /** Responsive drive level for tremble modulation. */
  function resolveTrembleLevel(stem) {
    if (!stem) return 0;

    if (stem.live != null) {
      return clamp01(
        stem.live * 0.52 +
          (stem.transient ?? stem.attack ?? 0) * 0.28 +
          (stem.dynamics ?? 0) * 0.2
      );
    }

    return (
      stem.resonance ?? stem.spectral ?? stem.flute ?? stem.envelope ?? 0
    );
  }

  function strokeVibration(t, pathIndex, audioLevel, cfg) {
    const maxPx = cfg.maxPx ?? 1.5;
    const minPx = cfg.minPx ?? 0.04;
    const level = clamp01(audioLevel);
    const amp = minPx + level * maxPx;
    if (amp < 0.01) return { x: 0, y: 0 };

    const seed = pathIndex * 0.137;
    const f1 = cfg.freq1 ?? 44;
    const f2 = cfg.freq2 ?? 61;
    const f3 = cfg.freq3 ?? 27;

    const x =
      amp *
      (Math.sin(t * f1 + seed) * 0.52 +
        Math.sin(t * f2 + seed * 2.17) * 0.28 +
        Math.sin(t * f3 + seed * 0.83) * 0.2);

    const y =
      amp *
      (Math.cos(t * f1 * 1.03 + seed + 1.1) * 0.52 +
        Math.cos(t * f2 * 0.91 + seed * 1.73) * 0.28 +
        Math.cos(t * f3 * 1.07 + seed * 0.61) * 0.2);

    return { x, y };
  }

  function unitInkVisible(sched, t) {
    if (!sched) return false;
    const state = global.PlotterScheduler.unitStateAt(sched, t);
    return state.progress > 0.001;
  }

  /** Shape finished its draw phase and is not in scheduled erase. */
  function unitFullyDrawn(sched, t) {
    if (!sched || !sched.draw) return false;
    if (t < sched.draw.start + sched.draw.duration) return false;
    const erase = sched.erase;
    if (erase && t >= erase.start) return false;
    return global.PlotterScheduler.unitStateAt(sched, t).progress > 0.01;
  }

  function pickUnits(ids, count, seed) {
    const ranked = ids
      .map((id) => ({ id, r: seededRand(hashUnitId(id) + seed) }))
      .sort((a, b) => a.r - b.r);
    return ranked.slice(0, count).map((x) => x.id);
  }

  function createFlickerState() {
    return {
      active: new Map(),
      recent: [],
      lastBurst: -999,
      burstCount: 0,
    };
  }

  function markRecent(recent, id, maxLen) {
    recent.push(id);
    while (recent.length > maxLen) recent.shift();
  }

  function updateFlicker(state, layerId, lh, schedMap, t, cfg, guitarAudio) {
    if (!cfg || !guitarAudio) return;

    for (const [id, end] of state.active) {
      if (t >= end) state.active.delete(id);
    }

    const attack =
      guitarAudio.attack ??
      guitarAudio.guitar ??
      guitarAudio.envelope ??
      0;
    if (attack < (cfg.attackThreshold ?? 0.32)) return;

    const completed = [];
    for (const unit of lh.units) {
      const sched = schedMap.get(unit.id);
      if (!unitFullyDrawn(sched, t)) continue;
      if (state.active.has(unit.id)) continue;
      completed.push(unit.id);
    }
    if (!completed.length) return;

    const recentSet = new Set(state.recent);
    const pool = completed.filter((id) => !recentSet.has(id));
    const pickFrom = pool.length ? pool : completed;

    for (const win of cfg.windows || []) {
      if (t < win.from || t > win.until) continue;

      const minGap = win.minGap ?? (win.interval ?? 0.38);
      if (t - state.lastBurst < minGap) continue;

      const countRange = win.count || [2, 4];
      const count = Math.min(
        pickFrom.length,
        Math.floor(
          lerp(
            countRange[0],
            countRange[1] + 0.999,
            seededRand(t * 19.7 + state.burstCount)
          )
        )
      );
      if (count < 1) continue;

      const blinkRange = win.blinkDuration || [0.05, 0.11];
      const blink =
        lerp(blinkRange[0], blinkRange[1], seededRand(t * 7.3 + win.from));

      const chosen = pickUnits(pickFrom, count, t * 13.1 + state.burstCount);
      for (const id of chosen) {
        state.active.set(id, t + blink);
        markRecent(state.recent, id, cfg.recentMemory ?? 24);
      }

      state.lastBurst = t;
      state.burstCount++;
      break;
    }
  }

  function createEraseCueState() {
    return { triggered: false, start: null };
  }

  function resolveEraseLevel(stemAudio, cfg) {
    if (!stemAudio) return 0;
    const key = cfg.level ?? cfg.metric;
    if (key && stemAudio[key] != null) return stemAudio[key];
    return (
      stemAudio.cue ??
      stemAudio.cymbal ??
      stemAudio.drums ??
      stemAudio.guitar ??
      stemAudio.attack ??
      stemAudio.envelope ??
      0
    );
  }

  function updateEraseCue(state, t, cfg, stemAudio) {
    if (!cfg || state.triggered) return;

    const until = cfg.until ?? cfg.window?.until ?? 79;
    const from = cfg.window?.from ?? 76;

    if (t > until) {
      state.triggered = true;
      state.start = from;
      return;
    }

    if (t < from) return;

    const level = resolveEraseLevel(stemAudio, cfg);

    if (level >= (cfg.threshold ?? 0.38)) {
      state.triggered = true;
      state.start = t;
    }
  }

  function createController(score, layerHandles, schedules) {
    const layerDefs = new Map();
    for (const entry of score.layers || []) {
      const id = entry.id || String(entry.file || "").replace(/\.[^.]+$/, "");
      if (entry.modulation) layerDefs.set(id, entry.modulation);
    }

    const flickerStates = new Map();
    const eraseCueStates = new Map();
    let audioSample = null;
    const drawOverrides = new Map();

    function ensureFlicker(layerId) {
      if (!flickerStates.has(layerId)) {
        flickerStates.set(layerId, createFlickerState());
      }
      return flickerStates.get(layerId);
    }

    function ensureEraseCue(layerId) {
      if (!eraseCueStates.has(layerId)) {
        eraseCueStates.set(layerId, createEraseCueState());
      }
      return eraseCueStates.get(layerId);
    }

    function buildDrawOverrides(t) {
      drawOverrides.clear();
      const samples =
        typeof audioSample === "function" ? audioSample() : null;

      for (const [layerId, mod] of layerDefs) {
        const lh = layerHandles.get(layerId);
        const schedMap = schedules.get(layerId);
        if (!lh || !schedMap) continue;

        const flickerCfg = mod.flicker;
        if (flickerCfg && t >= (flickerCfg.from ?? 0) && t <= (flickerCfg.until ?? Infinity)) {
          const guitar = resolveStemAudio(samples, flickerCfg.source ?? "guitar");
          const flicker = ensureFlicker(layerId);
          const eraseCue = mod.eraseCue ? ensureEraseCue(layerId) : null;
          if (!eraseCue || !eraseCue.triggered) {
            updateFlicker(flicker, layerId, lh, schedMap, t, flickerCfg, guitar);
          }
          for (const [unitId, end] of flicker.active) {
            if (t < end) {
              drawOverrides.set(unitKey(layerId, unitId), {
                progress: 0,
                phase: "draw",
              });
            }
          }
        }

        const eraseCfg = mod.eraseCue;
        if (eraseCfg) {
          const stem = resolveStemAudio(samples, eraseCfg.source ?? "guitar");
          const cue = ensureEraseCue(layerId);
          updateEraseCue(cue, t, eraseCfg, stem);

          if (cue.triggered && cue.start != null) {
            const until = eraseCfg.until ?? eraseCfg.window?.until ?? 79;
            const stagger = eraseCfg.stagger ?? 0.35;

            for (const unit of lh.units) {
              const sched = schedMap.get(unit.id);
              if (!sched) continue;
              const base = global.PlotterScheduler.unitStateAt(sched, t);
              if (base.progress <= 0.001 && t > until) continue;

              const unitStart =
                cue.start + seededRand(hashUnitId(unit.id) * 1.7) * stagger;
              if (t < unitStart) continue;

              const e = clamp01((t - unitStart) / Math.max(0.12, until - unitStart));
              if (e >= 1) continue;

              drawOverrides.set(unitKey(layerId, unit.id), {
                progress: 1 - e,
                phase: "erase",
              });
            }
          }
        }
      }

      return drawOverrides;
    }

    return {
      setAudioSample(fn) {
        audioSample = fn;
      },

      getDrawOverrides(t) {
        return buildDrawOverrides(t);
      },

      apply(t) {
        const samples =
          typeof audioSample === "function" ? audioSample() : null;

        for (const [layerId, mod] of layerDefs) {
          const lh = layerHandles.get(layerId);
          if (!lh) continue;

          const trembleCfg = mod.tremble;
          if (!trembleCfg) continue;

          const activeFrom = trembleCfg.from ?? mod.from ?? 0;
          const activeUntil = trembleCfg.until ?? mod.until ?? Infinity;

          const stem = resolveStemAudio(samples, trembleCfg.source ?? "flute");
          const energy = trembleCfg.energy ?? 1;
          const level = clamp01(resolveTrembleLevel(stem) * energy);

          for (const unit of lh.units) {
            const paths = unit.handle.paths || [];
            const sched = schedules.get(layerId)?.get(unit.id);
            const visible = unitInkVisible(sched, t);

            if (!visible || t < activeFrom || t > activeUntil) {
              for (const path of paths) path.style.transform = "";
              continue;
            }

            const base = hashUnitId(unit.id);
            for (let pi = 0; pi < paths.length; pi++) {
              const vib = strokeVibration(t, base + pi * 13, level, trembleCfg);
              paths[pi].style.transform = `translate(${vib.x} ${vib.y})`;
            }
          }
        }
      },
    };
  }

  global.PlotterModulation = {
    createController,
    strokeVibration,
  };
})(window);
