/* ============================================================
   PLOTTER MACHINE — ENTRY
   ------------------------------------------------------------
   Public API:

     PlotterMachine.boot(container, { baseDir, score, transport })
       → full audio-driven composition

     PlotterMachine.render(container, { baseDir, score })
       → static load + pens at 0 (test harness / preview)
   ============================================================ */

(function (global) {
  "use strict";

  async function render(container, options) {
    if (!container) throw new Error("[plotter] missing container element");

    const { baseDir, score, style, artboard } = options || {};
    if (!score || !Array.isArray(score.layers)) {
      throw new Error("[plotter] score.layers[] is required");
    }

    const scene = await global.PlotterLoader.loadScene({
      baseDir,
      layers: score.layers,
      artboard,
    });

    if (global.PlotterScheduler?.applyUnitFilters) {
      global.PlotterScheduler.applyUnitFilters(scene, score);
    }

    const surfaces = global.PlotterArtboard.mount(container, scene);
    const layerHandles = new Map();
    const allUnits = [];

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

      const units = unitHandles.map((handle) => {
        const drawer = global.PlotterPen.create(handle);
        const unit = { id: handle.id, handle, drawer };
        allUnits.push(unit);
        return unit;
      });

      layerHandles.set(layer.id, { svg, units });
    }

    return { scene, surfaces, layers: layerHandles, allUnits };
  }

  function boot(container, options) {
    return global.PlotterConductor.boot(container, options);
  }

  function resolveStyle(globalStyle, score, layerId) {
    const songDefault = score.style || {};
    const layerEntry =
      (score.layers || []).find((l) => (l.id || l.file) && matchesLayer(l, layerId)) ||
      {};
    return Object.assign({}, globalStyle, songDefault, layerEntry.style);
  }

  function matchesLayer(entry, layerId) {
    const id = entry.id || (entry.file || "").replace(/\.[^.]+$/, "");
    return id === layerId;
  }

  global.PlotterMachine = { render, boot };
})(window);
