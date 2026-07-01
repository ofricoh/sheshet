/* ============================================================
   PLOTTER MACHINE — ARTBOARD
   ------------------------------------------------------------
   One shared coordinate space for every layer.

   The whole "nothing is repositioned in JS" rule reduces to a
   single decision: every layer is mounted as an inline <svg>
   carrying the SAME artboard viewBox and the SAME
   preserveAspectRatio. The browser then maps artboard units →
   screen identically for all layers, so artwork lands exactly
   where Illustrator placed it. There is no per-layer fitting,
   no centering math, no bbox logic.

   Layers stack in score order: first = back, last = front.
   ============================================================ */

(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  /**
   * Create stacked layer <svg> elements inside a container.
   *
   * @param {HTMLElement} container
   * @param {Scene} scene
   * @param {object} [opts]
   * @param {string} [opts.preserveAspectRatio="xMidYMid meet"]
   * @returns {Map<string, SVGSVGElement>} layer id → mounted <svg>
   */
  function mount(container, scene, opts) {
    const cfg = Object.assign(
      { preserveAspectRatio: "xMidYMid meet" },
      opts
    );

    const { artboard } = scene;
    const viewBox = `${artboard.x} ${artboard.y} ${artboard.w} ${artboard.h}`;
    const surfaces = new Map();

    scene.layers.forEach((layer, index) => {
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", viewBox);
      svg.setAttribute("preserveAspectRatio", cfg.preserveAspectRatio);
      svg.classList.add("plotter-layer");
      svg.dataset.layerId = layer.id;

      Object.assign(svg.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: String(index + 1),
      });

      container.appendChild(svg);
      surfaces.set(layer.id, svg);
    });

    return surfaces;
  }

  global.PlotterArtboard = { mount, SVG_NS };
})(window);
