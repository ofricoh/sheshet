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
  function renderLayer(svg, layer, style, opts) {
    const cfg = Object.assign({}, DEFAULT_STYLE, style);
    const handles = [];
    const mountOpts = opts || {};
    const { artboard, transform } = mountOpts;

    let parent = svg;
    if (transform && artboard) {
      const tx = transform.x ?? 0;
      const ty = transform.y ?? 0;
      const rot = transform.rotate;
      if (tx || ty || rot != null) {
        const wrap = document.createElementNS(SVG_NS, "g");
        const cx = artboard.x + artboard.w / 2;
        const cy = artboard.y + artboard.h / 2;
        const parts = [];
        if (tx || ty) parts.push(`translate(${tx} ${ty})`);
        if (rot != null) parts.push(`rotate(${rot} ${cx} ${cy})`);
        wrap.setAttribute("transform", parts.join(" "));
        svg.appendChild(wrap);
        parent = wrap;
      }
    }

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

      parent.appendChild(group);
      handles.push({ id: unit.id, group, paths });
    }

    return handles;
  }

  function applyStroke(el, cfg) {
    if (cfg.renderMode === "fill") {
      el.setAttribute("fill", cfg.fill || cfg.stroke || DEFAULT_STYLE.stroke);
      el.setAttribute("stroke", "none");
      el.style.opacity = "0";
      return;
    }

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

  global.PlotterRendererSVG = { renderLayer, DEFAULT_STYLE, applyStroke };
})(window);
