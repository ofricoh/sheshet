/* ============================================================
   PLOTTER MACHINE — PATH UTILITIES
   ------------------------------------------------------------
   Geometry helpers for scheduling. No song logic — only
   measurements on SVG elements (edge phase, orientation).
   ============================================================ */

(function (global) {
  "use strict";

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  /**
   * Find the point along a path closest to an edge of its bbox.
   * @param {SVGGeometryElement} el
   * @param {"left"|"right"|"top"|"bottom"} edge
   * @returns {number} phase 0..1
   */
  function phaseAtEdge(el, edge) {
    if (!el || typeof el.getTotalLength !== "function") return 0;

    let len = 0;
    try {
      len = el.getTotalLength();
    } catch (_) {
      return 0;
    }
    if (!(len > 0)) return 0;

    const steps = 72;
    let bestT = 0;
    let bestScore = Infinity;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = el.getPointAtLength(t * len);
      let score;

      switch (edge) {
        case "left":
          score = pt.x;
          break;
        case "right":
          score = -pt.x;
          break;
        case "top":
          score = pt.y;
          break;
        case "bottom":
          score = -pt.y;
          break;
        default:
          score = t;
      }

      if (score < bestScore) {
        bestScore = score;
        bestT = t;
      }
    }

    return bestT;
  }

  /**
   * Classify a path as horizontal, vertical, or diagonal from its
   * opening segment direction.
   */
  function classifyOrientation(el) {
    if (!el || typeof el.getTotalLength !== "function") {
      return "diagonal";
    }

    let len = 0;
    try {
      len = el.getTotalLength();
    } catch (_) {
      return "diagonal";
    }
    if (!(len > 0)) return "diagonal";

    const p0 = el.getPointAtLength(0);
    const p1 = el.getPointAtLength(Math.min(len * 0.2, len));
    const dx = Math.abs(p1.x - p0.x);
    const dy = Math.abs(p1.y - p0.y);

    if (dx > dy * 1.35) return "horizontal";
    if (dy > dx * 1.35) return "vertical";
    return "diagonal";
  }

  /**
   * Pick a draw-start phase for a field path based on orientation.
   * Horizontal → left or right; vertical → top or bottom;
   * diagonal → path origin (Illustrator draw direction).
   */
  function fieldStartPhase(el, rng) {
    const orient = classifyOrientation(el);
    const pick = typeof rng === "function" ? rng : Math.random;

    if (orient === "horizontal") {
      return phaseAtEdge(el, pick() < 0.5 ? "left" : "right");
    }
    if (orient === "vertical") {
      return phaseAtEdge(el, pick() < 0.5 ? "top" : "bottom");
    }
    // Diagonal: start along the path's authored direction.
    return 0;
  }

  /** Average phase across all measurable paths in a unit handle. */
  function unitFieldPhase(handle, rng) {
    const paths = handle && handle.paths ? handle.paths : [];
    if (!paths.length) return 0;

    let sum = 0;
    let count = 0;
    for (const el of paths) {
      sum += fieldStartPhase(el, rng);
      count++;
    }
    return count ? sum / count : 0;
  }

  /**
   * Pick the path endpoint farthest from the record center and
   * return pen options that grow ink inward from that outer point.
   * @param {SVGGeometryElement} el
   * @param {{ x: number, y: number }} [center]
   */
  function outerInwardDirection(el, center) {
    if (!el || typeof el.getTotalLength !== "function") {
      return { phase: 0, reverse: false };
    }

    let len = 0;
    try {
      len = el.getTotalLength();
    } catch (_) {
      return { phase: 0, reverse: false };
    }
    if (!(len > 0)) return { phase: 0, reverse: false };

    const cx = center?.x ?? 965.18;
    const cy = center?.y ?? 964.36;

    const p0 = el.getPointAtLength(0);
    const p1 = el.getPointAtLength(len);
    const d0 = (p0.x - cx) ** 2 + (p0.y - cy) ** 2;
    const d1 = (p1.x - cx) ** 2 + (p1.y - cy) ** 2;

    if (Math.abs(d1 - d0) < 1) {
      if (d1 >= d0) return { phase: 0, reverse: true };
      return { phase: 0, reverse: false };
    }

    if (d1 > d0) return { phase: 0, reverse: true };
    return { phase: 0, reverse: false };
  }

  global.PlotterPathUtils = {
    phaseAtEdge,
    classifyOrientation,
    fieldStartPhase,
    unitFieldPhase,
    outerInwardDirection,
    clamp01,
  };
})(window);
