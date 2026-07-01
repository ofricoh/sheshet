/* ============================================================
   PLOTTER MACHINE — SCENE MODEL
   ------------------------------------------------------------
   Plain data structures the engine runs on. These are GENERATED
   by the loader/resolver from a song score — never authored by
   hand.

       Scene
         ├─ artboard { x, y, w, h }      ← read from the artwork
         └─ layers[]
              ├─ id                      ← from the score / filename
              └─ units[]                 ← one <g> (or loose path)
                   ├─ id
                   └─ nodes[]            ← raw SVG geometry nodes

   No song-specific logic lives here. No project values are
   hardcoded — the artboard is whatever the artwork declares.
   ============================================================ */

(function (global) {
  "use strict";

  const VIEWBOX_EPSILON = 0.01;

  /** Parse an SVG element's viewBox into { x, y, w, h } or null. */
  function parseViewBox(svgEl) {
    if (!svgEl) return null;

    const raw = svgEl.getAttribute("viewBox");
    if (raw) {
      const parts = raw.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
      }
    }

    // Fall back to width/height if viewBox is missing.
    const w = parseFloat(svgEl.getAttribute("width"));
    const h = parseFloat(svgEl.getAttribute("height"));
    if (Number.isFinite(w) && Number.isFinite(h)) {
      return { x: 0, y: 0, w, h };
    }

    return null;
  }

  /** True if two viewBoxes describe the same coordinate space. */
  function sameViewBox(a, b) {
    if (!a || !b) return false;
    return (
      Math.abs(a.x - b.x) < VIEWBOX_EPSILON &&
      Math.abs(a.y - b.y) < VIEWBOX_EPSILON &&
      Math.abs(a.w - b.w) < VIEWBOX_EPSILON &&
      Math.abs(a.h - b.h) < VIEWBOX_EPSILON
    );
  }

  function viewBoxToString(vb) {
    if (!vb) return "(none)";
    return `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;
  }

  function createScene(artboard) {
    return { artboard: artboard || null, layers: [] };
  }

  global.PlotterScene = {
    VIEWBOX_EPSILON,
    parseViewBox,
    sameViewBox,
    viewBoxToString,
    createScene,
  };
})(window);
