/* ============================================================
   PLOTTER MACHINE — PEN (drawing primitive)
   ------------------------------------------------------------
   Generic pen-plotter drawing primitive.

       create(unit, options)  → Drawer
       drawer.draw(progress)    → render Unit at 0..1

   Modes (per path segment):
     forward  — ink grows from path start (t = 0)
     reverse  — ink grows from path end (t = 1)
     wrap     — ink grows from a phase point (closed loops)

   Pure rendering — no timing or song knowledge.
   ============================================================ */

(function (global) {
  "use strict";

  const GEOMETRY_SELECTOR =
    "path, line, polyline, polygon, rect, circle, ellipse";

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function isMeasurable(el) {
    return el && typeof el.getTotalLength === "function";
  }

  function resolveElements(target) {
    if (!target) return [];
    if (Array.isArray(target)) return target;
    if (Array.isArray(target.paths)) return target.paths;
    if (target.group && target.group.querySelectorAll) {
      return Array.from(target.group.querySelectorAll(GEOMETRY_SELECTOR));
    }
    if (target.querySelectorAll) {
      return Array.from(target.querySelectorAll(GEOMETRY_SELECTOR));
    }
    return [];
  }

  function normalizeList(value, count, fallback) {
    if (Array.isArray(value)) return value;
    if (typeof value === "boolean" || typeof value === "number") {
      const out = new Array(count);
      for (let i = 0; i < count; i++) out[i] = value;
      return out;
    }
    return new Array(count).fill(fallback);
  }

  /** Fully conceal a segment. Wrap mode uses dash "0, len" which round caps render as dots. */
  function hideSegment(s) {
    s.el.style.strokeDasharray = String(s.len);
    s.el.style.strokeDashoffset = String(s.len);
  }

  /**
   * @param {object|Element|Element[]} target
   * @param {object} [options]
   * @param {number} [options.initialProgress=0]
   * @param {number|number[]} [options.phase] wrap origin 0..1 (closed paths)
   * @param {boolean|boolean[]} [options.reverse] draw from path end
   */
  function create(target, options) {
    const opts = Object.assign(
      { initialProgress: 0, phase: 0, reverse: false, renderMode: "stroke" },
      options
    );
    const fillMode = opts.renderMode === "fill";

    const elements = resolveElements(target);
    const phaseList = normalizeList(opts.phases ?? opts.phase, elements.length, 0);
    const reverseList = normalizeList(
      opts.reverses ?? opts.reverse,
      elements.length,
      false
    );

    const segments = [];
    const drawable = new Set();

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!isMeasurable(el)) continue;

      let len = 0;
      try {
        len = el.getTotalLength();
      } catch (_) {
        len = 0;
      }
      if (!(len > 0)) continue;

      const phase = clamp01(phaseList[i] ?? 0);
      const reverse = Boolean(reverseList[i]);

      segments.push({
        el,
        len,
        phase,
        reverse,
        // wrap = random start on a closed outline (circles)
        wrap: phase > 0 && !reverse,
      });
      drawable.add(el);
    }

    for (const el of elements) {
      if (drawable.has(el)) continue;
      el.style.visibility = "hidden";
    }

    const drawer = {
      id: (target && target.id) || null,
      totalLength: segments.reduce((sum, s) => sum + s.len, 0),
      segmentCount: segments.length,

      /**
       * @param {number} progress 0..1 ink amount
       * @param {object} [opts]
       * @param {"draw"|"erase"} [opts.phase="draw"]
       */
      draw(progress, opts) {
        const p = clamp01(progress);

        if (fillMode) {
          const erasing = opts && opts.phase === "erase";
          const visible = erasing ? p > 0 : p > 0;
          for (let i = 0; i < segments.length; i++) {
            segments[i].el.style.opacity = visible ? "1" : "0";
          }
          return p;
        }

        const erasing = opts && opts.phase === "erase";

        for (let i = 0; i < segments.length; i++) {
          const s = segments[i];
          const visible = p * s.len;

          if (visible <= 0) {
            hideSegment(s);
            continue;
          }

          if (erasing) {
            if (s.wrap) {
              const gap = Math.max(0.001, s.len - visible);
              const tail = s.len - visible;
              s.el.style.strokeDasharray = `${visible} ${gap}`;
              s.el.style.strokeDashoffset = String(
                s.len - s.phase * s.len - tail
              );
            } else if (s.reverse) {
              s.el.style.strokeDasharray = `${visible} ${s.len}`;
              s.el.style.strokeDashoffset = "0";
            } else {
              s.el.style.strokeDasharray = `${visible} ${s.len}`;
              s.el.style.strokeDashoffset = String(-(s.len - visible));
            }
          } else if (s.wrap) {
            const gap = Math.max(0.001, s.len - visible);
            s.el.style.strokeDasharray = `${visible} ${gap}`;
            s.el.style.strokeDashoffset = String(s.len - s.phase * s.len);
          } else if (s.reverse) {
            s.el.style.strokeDasharray = String(s.len);
            s.el.style.strokeDashoffset = String(visible - s.len);
          } else {
            s.el.style.strokeDasharray = String(s.len);
            s.el.style.strokeDashoffset = String(s.len - visible);
          }
        }

        return p;
      },
    };

    drawer.draw(opts.initialProgress);
    return drawer;
  }

  global.PlotterPen = { create, GEOMETRY_SELECTOR };
})(window);
