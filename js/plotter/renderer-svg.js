/* ============================================================
   PLOTTER MACHINE — SVG RENDERER (substrate)
   ------------------------------------------------------------
   Mounts a layer's Units into its <svg> surface and applies the
   pen-plotter stroke look (fill removed, single stroke colour
   and width). Each Unit becomes a <g data-unit-id>, so the
   Illustrator hierarchy survives as live DOM and every Unit can
   later be drawn (stroke-dashoffset) and modulated (transform)
   independently.

   Milestone 1: static mount + styling only. The drawing
   animation and audio modulation hang off these same Unit groups
   in later milestones — no structural change required.
   ============================================================ */

(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  const DEFAULT_STYLE = {
    stroke: "#FAFAFA",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  /**
   * Render every Unit of a layer into its surface <svg>.
   *
   * @param {SVGSVGElement} svg  the layer surface from PlotterArtboard.mount
   * @param {object} layer       scene layer { id, units[] }
   * @param {object} [style]     stroke style overrides
   * @returns {Array} unit handles { id, group, paths }
   */
  function renderLayer(svg, layer, style) {
    const cfg = Object.assign({}, DEFAULT_STYLE, style);
    const handles = [];

    for (const unit of layer.units) {
      const group = document.createElementNS(SVG_NS, "g");
      group.dataset.unitId = unit.id;
      group.style.transformBox = "fill-box";
      group.style.transformOrigin = "center";

      const paths = [];
      for (const node of unit.nodes) {
        const el = node.cloneNode(true);
        applyStroke(el, cfg);
        group.appendChild(el);
        paths.push(el);
      }

      svg.appendChild(group);
      handles.push({ id: unit.id, group, paths });
    }

    return handles;
  }

  function applyStroke(el, cfg) {
    // Pen plotter draws lines, not fills.
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", cfg.stroke);
    el.setAttribute("stroke-width", String(cfg.strokeWidth));
    el.setAttribute("stroke-linecap", cfg.strokeLinecap);
    el.setAttribute("stroke-linejoin", cfg.strokeLinejoin);
    // NOTE: intentionally no `vector-effect: non-scaling-stroke`.
    // It makes the browser interpret stroke-dasharray in screen px
    // while getTotalLength() stays in user units — which breaks the
    // pen's dash-draw math. Stroke width scales with the artboard,
    // which is uniform across all layers.
  }

  global.PlotterRendererSVG = { renderLayer, DEFAULT_STYLE };
})(window);
