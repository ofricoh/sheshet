/* ============================================================
   PLOTTER MACHINE — SCHEDULER
   ------------------------------------------------------------
   Turns a layer's creative timing + strategy into per-Unit
   schedules once at load, then evaluates pure progress at
   any song time t.

   progress = f(t)  — scrubbable, no accumulated state.
   ============================================================ */

(function (global) {
  "use strict";

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  /** Seeded-ish shuffle using Math.random (new order every load). */
  function shuffle(items, rng) {
    const rand = typeof rng === "function" ? rng : Math.random;
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function createRng(seed) {
    if (seed == null) return Math.random;
    let s = seed >>> 0;
    return function rng() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /**
   * Evaluate a Unit's ink progress at song time t.
   * @returns {{ progress: number, phase: "draw"|"erase"|"idle" }}
   */
  function unitStateAt(schedule, t) {
    if (!schedule) return { progress: 0, phase: "idle" };

    const draw = schedule.draw;
    if (!draw || t < draw.start) return { progress: 0, phase: "idle" };

    const erase = schedule.erase;
    if (erase && t >= erase.start) {
      const e = clamp01((t - erase.start) / Math.max(erase.duration, 1e-6));
      if (e >= 1) return { progress: 0, phase: "idle" };
      return { progress: 1 - e, phase: "erase" };
    }

    if (t >= draw.start + draw.duration) {
      return { progress: 1, phase: "draw" };
    }

    return {
      progress: clamp01((t - draw.start) / Math.max(draw.duration, 1e-6)),
      phase: "draw",
    };
  }

  /** @deprecated use unitStateAt */
  function unitProgressAt(schedule, t) {
    return unitStateAt(schedule, t).progress;
  }

  function pathDrawDirection(el, rng) {
    const PathUtils = global.PlotterPathUtils;
    if (!PathUtils || !el) return { phase: 0, reverse: false };

    const startPhase = PathUtils.fieldStartPhase(el, rng);
    if (startPhase >= 0.5) {
      return { phase: 0, reverse: true };
    }
    if (startPhase > 0.02) {
      return { phase: startPhase, reverse: false };
    }
    return { phase: 0, reverse: false };
  }

  function unitDrawDirection(handle, rng) {
    const paths = (handle && handle.paths) || [];
    if (!paths.length) {
      return { phases: [0], reverses: [false] };
    }

    const phases = [];
    const reverses = [];
    for (const el of paths) {
      const dir = pathDrawDirection(el, rng);
      phases.push(dir.phase);
      reverses.push(dir.reverse);
    }
    return { phases, reverses };
  }

  /**
   * Queue-based pool scheduler.
   * Only maxConcurrent units draw at once; the next unit waits
   * for a slot to open (+ optional stagger). Spreads work across
   * the window without bunching everything at the start.
   */
  function schedulePoolQueue(order, durations, drawAt, drawUntil, pool, rng) {
    const maxConcurrent = pool.maxConcurrent ?? 3;
    const staggerRange = pool.staggerRange || [0.08, 0.65];
    const minDuration = pool.minDuration ?? 0.25;
    const drawWindow = Math.max(0.1, drawUntil - drawAt);

    const starts = new Array(order.length);
    const active = [];
    let queue = 0;
    let clock = drawAt;

    while (queue < order.length) {
      while (active.length && active[0].end <= clock) {
        active.shift();
      }

      if (active.length < maxConcurrent) {
        starts[queue] = clock;
        active.push({ end: clock + durations[queue] });
        active.sort((a, b) => a.end - b.end);
        queue++;

        if (queue < order.length && active.length < maxConcurrent) {
          clock += lerp(staggerRange[0], staggerRange[1], rng());
        }
      } else {
        clock =
          active[0].end + lerp(staggerRange[0], staggerRange[1], rng());
      }
    }

    let lastFinish = drawAt;
    for (let i = 0; i < order.length; i++) {
      lastFinish = Math.max(lastFinish, starts[i] + durations[i]);
    }

    if (lastFinish > drawUntil) {
      const overflow = lastFinish - drawUntil;
      const scale = drawWindow / (lastFinish - drawAt);
      for (let i = 0; i < order.length; i++) {
        starts[i] = drawAt + (starts[i] - drawAt) * scale;
        durations[i] = Math.max(minDuration, durations[i] * scale);
      }
      lastFinish = drawAt;
      for (let i = 0; i < order.length; i++) {
        lastFinish = Math.max(lastFinish, starts[i] + durations[i]);
      }
      if (lastFinish > drawUntil + overflow * 0.01) {
        const durScale = drawWindow / (lastFinish - drawAt);
        for (let i = 0; i < order.length; i++) {
          durations[i] = Math.max(minDuration, durations[i] * durScale);
        }
      }
    }

    return { starts, durations };
  }

  /**
   * Guarantee every unit finishes drawing by drawUntil.
   * Used when the pool minDuration floor would otherwise
   * leave strokes still building past the build window.
   */
  function enforceDrawWindow(starts, durations, drawAt, drawUntil, floor) {
    const minDuration = floor ?? 0.2;
    const drawWindow = Math.max(0.1, drawUntil - drawAt);

    let lastFinish = drawAt;
    for (let i = 0; i < durations.length; i++) {
      lastFinish = Math.max(lastFinish, starts[i] + durations[i]);
    }
    if (lastFinish <= drawUntil) return;

    const scale = drawWindow / (lastFinish - drawAt);
    for (let i = 0; i < durations.length; i++) {
      starts[i] = drawAt + (starts[i] - drawAt) * scale;
      durations[i] = Math.max(minDuration, durations[i] * scale);
    }

    lastFinish = drawAt;
    for (let i = 0; i < durations.length; i++) {
      lastFinish = Math.max(lastFinish, starts[i] + durations[i]);
    }
    if (lastFinish <= drawUntil) return;

    const durScale = drawWindow / (lastFinish - drawAt);
    for (let i = 0; i < durations.length; i++) {
      durations[i] = Math.max(minDuration, durations[i] * durScale);
    }
  }

  /* ----------------------------------------------------------
     STRATEGY: organic-pool
     Random order, limited concurrency, varied speed/duration.
     For calm overlapping pen activity (irrigation circles).
     ---------------------------------------------------------- */

  function scheduleOrganicPool(units, layerDef, rng) {
    const drawAt = layerDef.draw?.at ?? 0;
    const drawUntil =
      layerDef.draw?.until ??
      drawAt + (layerDef.draw?.duration ?? 14);
    const eraseFrom = layerDef.erase?.from ?? drawUntil;
    const eraseUntil =
      layerDef.erase?.until ?? eraseFrom + 17;

    const pool = layerDef.pool || {};
    const speedRange = pool.speedRange || [0.72, 1.28];
    const durationRange = pool.durationRange || [1.6, 4.2];

    const order = shuffle(units, rng);
    const durations = order.map(() => {
      const speed = lerp(speedRange[0], speedRange[1], rng());
      const base = lerp(durationRange[0], durationRange[1], rng());
      return base / speed;
    });

    const { starts } = schedulePoolQueue(
      order,
      durations,
      drawAt,
      drawUntil,
      pool,
      rng
    );

    const eraseStarts = order.map(() =>
      lerp(eraseFrom, eraseUntil - 1.2, rng())
    );
    const eraseDurations = order.map(() => lerp(1.4, 4.5, rng()));

    for (let i = 0; i < order.length; i++) {
      if (eraseStarts[i] + eraseDurations[i] > eraseUntil) {
        eraseDurations[i] = Math.max(0.4, eraseUntil - eraseStarts[i]);
      }
    }

    return order.map((unit, i) => ({
      unitId: unit.id,
      draw: {
        start: starts[i],
        duration: durations[i],
        phase: rng(),
      },
      erase: {
        start: eraseStarts[i],
        duration: eraseDurations[i],
      },
    }));
  }

  /* ----------------------------------------------------------
     STRATEGY: edge-stagger
     Random order, gentle stagger, random endpoint per line.
     For field textures that gradually fill the landscape.
     ---------------------------------------------------------- */

  function scheduleEdgeStagger(units, layerDef, rng, handlesById) {
    const drawAt = layerDef.draw?.at ?? 0;
    const drawUntil =
      layerDef.draw?.until ??
      drawAt + (layerDef.draw?.duration ?? 14);
    const eraseFrom = layerDef.erase?.from ?? null;
    const eraseUntil = layerDef.erase?.until ?? null;

    const pool = layerDef.pool || {};
    const durationRange = pool.durationRange || [0.35, 1.4];
    const eraseDurationRange = pool.eraseDurationRange || [0.35, 1.2];

    const order = shuffle(units, rng);
    const durations = order.map(() =>
      lerp(durationRange[0], durationRange[1], rng())
    );

    const { starts } = schedulePoolQueue(
      order,
      durations,
      drawAt,
      drawUntil,
      pool,
      rng
    );

    let eraseStarts = null;
    let eraseDurations = null;

    if (eraseFrom != null && eraseUntil != null) {
      const eraseWindow = Math.max(0.1, eraseUntil - eraseFrom);
      eraseDurations = order.map(() =>
        lerp(eraseDurationRange[0], eraseDurationRange[1], rng())
      );
      eraseStarts = order.map(() =>
        lerp(eraseFrom, eraseUntil - eraseDurationRange[1], rng())
      );

      for (let i = 0; i < order.length; i++) {
        if (eraseStarts[i] + eraseDurations[i] > eraseUntil) {
          eraseDurations[i] = Math.max(0.25, eraseUntil - eraseStarts[i]);
        }
      }

      let lastFinish = eraseFrom;
      for (let i = 0; i < order.length; i++) {
        lastFinish = Math.max(lastFinish, eraseStarts[i] + eraseDurations[i]);
      }
      if (lastFinish > eraseUntil) {
        const scale = eraseWindow / (lastFinish - eraseFrom);
        for (let i = 0; i < order.length; i++) {
          eraseStarts[i] = eraseFrom + (eraseStarts[i] - eraseFrom) * scale;
          eraseDurations[i] = Math.max(0.25, eraseDurations[i] * scale);
        }
      }
    }

    return order.map((unit, i) => {
      const handle = handlesById && handlesById.get(unit.id);
      const dir = unitDrawDirection(handle, rng);

      return {
        unitId: unit.id,
        draw: {
          start: starts[i],
          duration: durations[i],
          phase: dir.phases.length === 1 ? dir.phases[0] : dir.phases,
          reverse: dir.reverses.length === 1 ? dir.reverses[0] : dir.reverses,
          phases: dir.phases,
          reverses: dir.reverses,
        },
        erase:
          eraseStarts && eraseDurations
            ? { start: eraseStarts[i], duration: eraseDurations[i] }
            : null,
      };
    });
  }

  /* ----------------------------------------------------------
     STRATEGY: flute-living
     The flute draws in slowly, vibrates in place while the
     stem plays, then erases along each path's draw direction.
     ---------------------------------------------------------- */

  function scheduleFluteLiving(units, layerDef, rng, handlesById) {
    const drawAt = layerDef.draw?.at ?? 27;
    const drawUntil = layerDef.draw?.until ?? 49;
    const eraseUntil = layerDef.erase?.until ?? drawUntil;
    const pool = layerDef.pool || {};
    const durationRange = pool.durationRange || [2.4, 5.2];
    const eraseDurationRange = pool.eraseDurationRange || [0.55, 1.8];
    const eraseBudget = pool.eraseBudget ?? 5.5;
    const drawEndCap = Math.min(
      drawAt + (pool.drawWindow ?? eraseUntil - drawAt - eraseBudget),
      eraseUntil - eraseBudget
    );

    const order = shuffle(units, rng);
    const durations = order.map(() =>
      lerp(durationRange[0], durationRange[1], rng())
    );

    const { starts } = schedulePoolQueue(
      order,
      durations,
      drawAt,
      drawEndCap,
      Object.assign({ maxConcurrent: 3, staggerRange: [0.55, 1.2] }, pool),
      rng
    );

    let lastFinish = drawAt;
    for (let i = 0; i < order.length; i++) {
      lastFinish = Math.max(lastFinish, starts[i] + durations[i]);
    }

    const eraseFrom =
      layerDef.erase?.from != null ? layerDef.erase.from : lastFinish;
    const eraseWindow = Math.max(0.5, eraseUntil - eraseFrom);

    const eraseDurations = order.map(() =>
      lerp(eraseDurationRange[0], eraseDurationRange[1], rng())
    );
    const eraseStarts = order.map(() =>
      lerp(eraseFrom, eraseUntil - eraseDurationRange[1], rng())
    );

    for (let i = 0; i < order.length; i++) {
      if (eraseStarts[i] + eraseDurations[i] > eraseUntil) {
        eraseDurations[i] = Math.max(0.35, eraseUntil - eraseStarts[i]);
      }
    }

    let eraseLastFinish = eraseFrom;
    for (let i = 0; i < order.length; i++) {
      eraseLastFinish = Math.max(
        eraseLastFinish,
        eraseStarts[i] + eraseDurations[i]
      );
    }
    if (eraseLastFinish > eraseUntil) {
      const scale = eraseWindow / (eraseLastFinish - eraseFrom);
      for (let i = 0; i < order.length; i++) {
        eraseStarts[i] = eraseFrom + (eraseStarts[i] - eraseFrom) * scale;
        eraseDurations[i] = Math.max(0.35, eraseDurations[i] * scale);
      }
    }

    return order.map((unit, i) => {
      const handle = handlesById && handlesById.get(unit.id);
      const dir = unitDrawDirection(handle, rng);

      return {
        unitId: unit.id,
        draw: {
          start: starts[i],
          duration: durations[i],
          phase: dir.phases.length === 1 ? dir.phases[0] : dir.phases,
          reverse: dir.reverses.length === 1 ? dir.reverses[0] : dir.reverses,
          phases: dir.phases,
          reverses: dir.reverses,
        },
        erase: {
          start: eraseStarts[i],
          duration: eraseDurations[i],
        },
      };
    });
  }

  /* ----------------------------------------------------------
     STRATEGY: tree-breath
     Calm scattered build — several tree shapes draw at once
     from random places. Optional scheduled erase after the
     build window closes (e.g. cymbal-section collapse).
     ---------------------------------------------------------- */

  function scheduleTreeBreath(units, layerDef, rng, handlesById) {
    const drawAt = layerDef.draw?.at ?? 49;
    const drawUntil =
      layerDef.draw?.until ??
      drawAt + (layerDef.draw?.duration ?? 25);
    const eraseFrom = layerDef.erase?.from ?? null;
    const eraseUntil = layerDef.erase?.until ?? null;

    const pool = layerDef.pool || {};
    const durationRange = pool.durationRange || [5, 11];
    const eraseDurationRange = pool.eraseDurationRange || [0.18, 0.55];

    const order = shuffle(units, rng);
    const durations = order.map(() =>
      lerp(durationRange[0], durationRange[1], rng())
    );

    const { starts, durations: drawDurations } = schedulePoolQueue(
      order,
      durations,
      drawAt,
      drawUntil,
      Object.assign(
        { maxConcurrent: 4, staggerRange: [1.2, 2.8], minDuration: 3.5 },
        pool
      ),
      rng
    );
    enforceDrawWindow(starts, drawDurations, drawAt, drawUntil, 0.2);

    let eraseStarts = null;
    let eraseDurations = null;

    if (eraseFrom != null && eraseUntil != null) {
      const eraseWindow = Math.max(0.1, eraseUntil - eraseFrom);
      eraseDurations = order.map(() =>
        lerp(eraseDurationRange[0], eraseDurationRange[1], rng())
      );
      eraseStarts = order.map(() =>
        lerp(eraseFrom, eraseUntil - eraseDurationRange[1], rng())
      );

      for (let i = 0; i < order.length; i++) {
        if (eraseStarts[i] + eraseDurations[i] > eraseUntil) {
          eraseDurations[i] = Math.max(0.12, eraseUntil - eraseStarts[i]);
        }
      }

      let lastFinish = eraseFrom;
      for (let i = 0; i < order.length; i++) {
        lastFinish = Math.max(lastFinish, eraseStarts[i] + eraseDurations[i]);
      }
      if (lastFinish > eraseUntil) {
        const scale = eraseWindow / (lastFinish - eraseFrom);
        for (let i = 0; i < order.length; i++) {
          eraseStarts[i] = eraseFrom + (eraseStarts[i] - eraseFrom) * scale;
          eraseDurations[i] = Math.max(0.12, eraseDurations[i] * scale);
        }
      }
    }

    return order.map((unit, i) => {
      const handle = handlesById && handlesById.get(unit.id);
      const dir = unitDrawDirection(handle, rng);

      return {
        unitId: unit.id,
        draw: {
          start: starts[i],
          duration: drawDurations[i],
          phase: dir.phases.length === 1 ? dir.phases[0] : dir.phases,
          reverse: dir.reverses.length === 1 ? dir.reverses[0] : dir.reverses,
          phases: dir.phases,
          reverses: dir.reverses,
        },
        erase:
          eraseStarts && eraseDurations
            ? { start: eraseStarts[i], duration: eraseDurations[i] }
            : null,
      };
    });
  }

  /* ----------------------------------------------------------
     STRATEGY: road-inward
     Roads enter from the outer record edge — each path draws
     from its outside endpoint toward the center, then erases
     back out along the same pen direction.
     ---------------------------------------------------------- */

  function unitRoadInwardDirection(handle, center) {
    const PathUtils = global.PlotterPathUtils;
    const paths = (handle && handle.paths) || [];
    if (!paths.length) {
      return { phases: [0], reverses: [false] };
    }

    const phases = [];
    const reverses = [];
    for (const el of paths) {
      const dir = PathUtils
        ? PathUtils.outerInwardDirection(el, center)
        : { phase: 0, reverse: false };
      phases.push(dir.phase);
      reverses.push(dir.reverse);
    }
    return { phases, reverses };
  }

  function scheduleRoadInward(units, layerDef, rng, handlesById) {
    const drawAt = layerDef.draw?.at ?? 80;
    const drawUntil =
      layerDef.draw?.until ??
      drawAt + (layerDef.draw?.duration ?? 6);
    const eraseFrom = layerDef.erase?.from ?? null;
    const eraseUntil = layerDef.erase?.until ?? null;

    const pool = layerDef.pool || {};
    const durationRange = pool.durationRange || [1.8, 4.5];
    const eraseDurationRange = pool.eraseDurationRange || [0.25, 0.75];

    const centerDef = layerDef.center;
    const recordCenter = centerDef
      ? { x: centerDef.x, y: centerDef.y }
      : { x: 965.18, y: 964.36 };

    const order = shuffle(units, rng);
    const durations = order.map(() =>
      lerp(durationRange[0], durationRange[1], rng())
    );

    const { starts, durations: drawDurations } = schedulePoolQueue(
      order,
      durations,
      drawAt,
      drawUntil,
      Object.assign(
        { maxConcurrent: 3, staggerRange: [0.35, 1.1], minDuration: 0.8 },
        pool
      ),
      rng
    );
    enforceDrawWindow(starts, drawDurations, drawAt, drawUntil, 0.25);

    let eraseStarts = null;
    let eraseDurations = null;

    if (eraseFrom != null && eraseUntil != null) {
      const eraseWindow = Math.max(0.1, eraseUntil - eraseFrom);
      eraseDurations = order.map(() =>
        lerp(eraseDurationRange[0], eraseDurationRange[1], rng())
      );
      eraseStarts = order.map(() =>
        lerp(eraseFrom, eraseUntil - eraseDurationRange[1], rng())
      );

      for (let i = 0; i < order.length; i++) {
        if (eraseStarts[i] + eraseDurations[i] > eraseUntil) {
          eraseDurations[i] = Math.max(0.15, eraseUntil - eraseStarts[i]);
        }
      }

      let lastFinish = eraseFrom;
      for (let i = 0; i < order.length; i++) {
        lastFinish = Math.max(lastFinish, eraseStarts[i] + eraseDurations[i]);
      }
      if (lastFinish > eraseUntil) {
        const scale = eraseWindow / (lastFinish - eraseFrom);
        for (let i = 0; i < order.length; i++) {
          eraseStarts[i] = eraseFrom + (eraseStarts[i] - eraseFrom) * scale;
          eraseDurations[i] = Math.max(0.15, eraseDurations[i] * scale);
        }
      }
    }

    return order.map((unit, i) => {
      const handle = handlesById && handlesById.get(unit.id);
      const dir = unitRoadInwardDirection(handle, recordCenter);

      return {
        unitId: unit.id,
        draw: {
          start: starts[i],
          duration: drawDurations[i],
          phase: dir.phases.length === 1 ? dir.phases[0] : dir.phases,
          reverse: dir.reverses.length === 1 ? dir.reverses[0] : dir.reverses,
          phases: dir.phases,
          reverses: dir.reverses,
        },
        erase:
          eraseStarts && eraseDurations
            ? { start: eraseStarts[i], duration: eraseDurations[i] }
            : null,
      };
    });
  }

  /* ----------------------------------------------------------
     STRATEGY: burst-settle
     Energetic multi-pen burst in the first ~second, then a
     gradually slower, calmer build until the window closes.
     ---------------------------------------------------------- */

  function scheduleBurstSettle(units, layerDef, rng, handlesById) {
    const drawAt = layerDef.draw?.at ?? 92;
    const drawUntil =
      layerDef.draw?.until ??
      drawAt + (layerDef.draw?.duration ?? 7.5);

    const pool = layerDef.pool || {};
    const burstUntil = pool.burstUntil ?? drawAt + 1;
    const burstShare = pool.burstShare ?? 0.4;

    const burstPool = Object.assign(
      {
        maxConcurrent: 6,
        durationRange: [0.22, 0.72],
        minDuration: 0.18,
        staggerRange: [0.04, 0.18],
      },
      pool.burst || {}
    );

    const settlePool = Object.assign(
      {
        maxConcurrent: 3,
        durationRange: [1.4, 5.2],
        minDuration: 0.9,
        staggerRange: [0.35, 1.15],
      },
      pool.settle || {}
    );

    const order = shuffle(units, rng);
    const burstCount = Math.max(
      1,
      Math.min(
        order.length - 1,
        Math.round(order.length * burstShare)
      )
    );

    const burstUnits = order.slice(0, burstCount);
    const settleUnits = order.slice(burstCount);

    const burstDurations = burstUnits.map(() =>
      lerp(
        burstPool.durationRange[0],
        burstPool.durationRange[1],
        rng()
      )
    );

    const { starts: burstStarts, durations: burstDrawDurations } =
      schedulePoolQueue(
        burstUnits,
        burstDurations,
        drawAt,
        burstUntil,
        burstPool,
        rng
      );

    const settleDurationRange = settlePool.durationRange || [1.4, 5.2];
    const settleDurations = settleUnits.map((_, idx) => {
      const settleT =
        settleUnits.length > 1 ? idx / (settleUnits.length - 1) : 0;
      const base = lerp(
        settleDurationRange[0],
        settleDurationRange[1],
        settleT
      );
      const spread =
        settleDurationRange[1] - settleDurationRange[0];
      const jitter = lerp(-0.12, 0.12, rng()) * spread;
      return Math.max(settlePool.minDuration ?? 0.9, base + jitter);
    });

    const { starts: settleStarts, durations: settleDrawDurations } =
      schedulePoolQueue(
        settleUnits,
        settleDurations,
        burstUntil,
        drawUntil,
        settlePool,
        rng
      );

    enforceDrawWindow(
      settleStarts,
      settleDrawDurations,
      burstUntil,
      drawUntil,
      settlePool.minDuration ?? 0.9
    );

    const startsById = new Map();
    const durationsById = new Map();

    burstUnits.forEach((unit, i) => {
      startsById.set(unit.id, burstStarts[i]);
      durationsById.set(unit.id, burstDrawDurations[i]);
    });
    settleUnits.forEach((unit, i) => {
      startsById.set(unit.id, settleStarts[i]);
      durationsById.set(unit.id, settleDrawDurations[i]);
    });

    const eraseFrom = layerDef.erase?.from ?? null;
    const eraseUntil = layerDef.erase?.until ?? null;
    let eraseSchedules = null;

    if (eraseFrom != null && eraseUntil != null) {
      const eraseDurationRange = pool.eraseDurationRange || [0.06, 0.1];
      const eraseDuration = Math.max(
        0.04,
        Math.min(
          pool.eraseDuration ??
            lerp(eraseDurationRange[0], eraseDurationRange[1], 0.5),
          eraseUntil - eraseFrom
        )
      );

      eraseSchedules = order.map(() => ({
        start: eraseFrom,
        duration: eraseDuration,
      }));
    }

    return order.map((unit, i) => {
      const handle = handlesById && handlesById.get(unit.id);
      const dir = unitDrawDirection(handle, rng);

      return {
        unitId: unit.id,
        draw: {
          start: startsById.get(unit.id),
          duration: durationsById.get(unit.id),
          phase: dir.phases.length === 1 ? dir.phases[0] : dir.phases,
          reverse: dir.reverses.length === 1 ? dir.reverses[0] : dir.reverses,
          phases: dir.phases,
          reverses: dir.reverses,
        },
        erase: eraseSchedules ? eraseSchedules[i] : null,
      };
    });
  }

  const STRATEGIES = {
    "organic-pool": scheduleOrganicPool,
    "edge-stagger": scheduleEdgeStagger,
    "flute-living": scheduleFluteLiving,
    "tree-breath": scheduleTreeBreath,
    "road-inward": scheduleRoadInward,
    "burst-settle": scheduleBurstSettle,
  };

  function registerStrategy(name, fn) {
    STRATEGIES[name] = fn;
  }

  /**
   * Build per-Unit schedules for every layer in the score.
   */
  function buildSchedules(scene, score, layerHandles, seed) {
    const rng = createRng(seed);
    const byLayer = new Map();

    for (const layer of scene.layers) {
      const layerDef =
        (score.layers || []).find((entry) => {
          const id =
            entry.id || String(entry.file || "").replace(/\.[^.]+$/, "");
          return id === layer.id;
        }) || {};

      const strategyName = layerDef.strategy || "parallel";
      const fn = STRATEGIES[strategyName];

      if (!fn) {
        console.warn(`[scheduler] unknown strategy "${strategyName}"`);
        continue;
      }

      const handles = layerHandles.get(layer.id);
      const handlesById = new Map();
      if (handles && handles.units) {
        for (const u of handles.units) handlesById.set(u.id, u.handle);
      }

      const schedules = fn(layer.units, layerDef, rng, handlesById);
      const map = new Map();
      for (const s of schedules) map.set(s.unitId, s);
      byLayer.set(layer.id, map);
    }

    return byLayer;
  }

  global.PlotterScheduler = {
    buildSchedules,
    unitProgressAt,
    unitStateAt,
    registerStrategy,
    STRATEGIES,
  };
})(window);
