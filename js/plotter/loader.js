/* ============================================================
   PLOTTER MACHINE — LOADER
   ------------------------------------------------------------
   Reads per-layer Illustrator SVG exports and rebuilds the
   Song → Layer → Unit → Paths hierarchy into a Scene.

   Export contract (per layer file):
     • root <svg> carries the shared artboard viewBox
     • a top-level <g> = one Animation Unit (id from id/data-name)
     • a loose top-level shape (no group) = a single-shape Unit
     • the Unit boundary is the FIRST group level; anything nested
       deeper is flattened into that Unit's geometry

   The loader VALIDATES that every layer shares one viewBox — the
   guarantee that makes "nothing is repositioned in JS" true. A
   layer that disagrees is rejected with a clear warning instead
   of silently drifting out of place.
   ============================================================ */

(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  // Geometry elements that can be drawn by the pen plotter.
  const GEOMETRY_TAGS = new Set([
    "path",
    "line",
    "polyline",
    "polygon",
    "rect",
    "circle",
    "ellipse",
  ]);

  // Elements that never represent drawable artwork.
  const IGNORED_TAGS = new Set([
    "defs",
    "style",
    "metadata",
    "title",
    "desc",
    "clipPath",
    "mask",
    "symbol",
    "filter",
  ]);

  function tagOf(node) {
    return node && node.tagName ? node.tagName.toLowerCase() : "";
  }

  function unitName(node, fallbackIndex) {
    const id =
      node.getAttribute("id") ||
      node.getAttribute("data-name") ||
      "";
    return id.trim() || `unit-${String(fallbackIndex + 1).padStart(2, "0")}`;
  }

  async function fetchSvgRoot(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`[loader] ${res.status} fetching ${url}`);
    }
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");

    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error(`[loader] malformed SVG: ${url}`);
    }

    const root = doc.documentElement;
    if (!root || tagOf(root) !== "svg") {
      throw new Error(`[loader] root element is not <svg>: ${url}`);
    }
    return root;
  }

  /**
   * Walk the root's direct children and group them into Units.
   * First-level <g> → one Unit. Loose geometry → its own Unit.
   */
  function extractUnits(svgRoot, options) {
    const minLength = options && options.geometryMinLength;
    const units = [];

    for (const child of Array.from(svgRoot.children)) {
      const tag = tagOf(child);
      if (IGNORED_TAGS.has(tag)) continue;

      if (tag === "g") {
        const nodes = collectGeometry(child, minLength);
        if (!nodes.length) continue;
        units.push({ id: unitName(child, units.length), nodes });
      } else if (keepGeometry(child, minLength)) {
        units.push({
          id: unitName(child, units.length),
          nodes: [child.cloneNode(true)],
        });
      }
    }

    return units;
  }

  function isDrawableGeometry(el, minLength) {
    const PathUtils = global.PlotterPathUtils;
    if (PathUtils && typeof PathUtils.isDrawableGeometry === "function") {
      return PathUtils.isDrawableGeometry(el, minLength);
    }
    return true;
  }

  function keepGeometry(node, minLength) {
    if (!GEOMETRY_TAGS.has(tagOf(node))) return false;
    return isDrawableGeometry(node, minLength);
  }

  /** Deep-collect every drawable shape inside a unit group. */
  function collectGeometry(groupEl, minLength) {
    const out = [];
    const walk = (el) => {
      for (const node of Array.from(el.children)) {
        const tag = tagOf(node);
        if (IGNORED_TAGS.has(tag)) continue;
        if (tag === "g") {
          walk(node);
        } else if (keepGeometry(node, minLength)) {
          out.push(node.cloneNode(true));
        }
      }
    };
    walk(groupEl);
    return out;
  }

  function warnViewBoxMismatch(layer, entry, artboard, Scene) {
    const filename = entry.file || layer.file || layer.id;
    const expected = Scene.viewBoxToString(artboard);
    const actual = Scene.viewBoxToString(layer.viewBox);
    const allowed = !!entry.allowViewBoxMismatch;

    if (allowed) {
      console.warn(
        `[loader] viewBox mismatch — layer LOADED (allowViewBoxMismatch enabled)\n` +
          `  file:     ${filename}\n` +
          `  expected: ${expected}\n` +
          `  actual:   ${actual}\n` +
          `  → Layer is included, but artwork may be misaligned. Re-export on the song artboard when possible.`
      );
      return;
    }

    console.warn(
      `[loader] viewBox mismatch — layer SKIPPED\n` +
        `  file:     ${filename}\n` +
        `  expected: ${expected}\n` +
        `  actual:   ${actual}\n` +
        `  → Nothing from this file will appear during playback. Re-export on the song artboard, or set allowViewBoxMismatch: true in the score.`
    );
  }

  /**
   * Load an ordered list of layers into a Scene.
   *
   * @param {object} options
   * @param {string} options.baseDir  directory holding the layer SVGs
   * @param {Array<{file:string,id?:string}>} options.layers  ordered layers
   * @param {{x,y,w,h}} [options.artboard] optional declared artboard to validate against
   * @returns {Promise<Scene>}
   */
  async function loadScene(options) {
    const { baseDir, layers: layerList, artboard: declared } = options;
    const Scene = global.PlotterScene;

    const results = await Promise.all(
      layerList.map(async (entry) => {
        const url = joinPath(baseDir, entry.file);
        try {
          const root = await fetchSvgRoot(url);
          const viewBox = Scene.parseViewBox(root);
          if (!viewBox) {
            throw new Error(`no viewBox/size on ${url}`);
          }
          const id =
            (entry.id && entry.id.trim()) || fileStem(entry.file);
          return {
            id,
            file: entry.file,
            url,
            viewBox,
            units: extractUnits(root, {
              geometryMinLength: entry.geometryMinLength,
            }),
          };
        } catch (err) {
          console.warn(
            `[loader] skipping layer "${entry.file}" (${url}): ${err.message}`
          );
          return null;
        }
      })
    );

    const loaded = results.filter(Boolean);
    if (!loaded.length) {
      throw new Error("[loader] no layers could be loaded");
    }

    // The artboard is whatever the artwork declares — never hardcoded.
    const artboard = declared || loaded[0].viewBox;

    const scene = Scene.createScene(artboard);
    for (const layer of loaded) {
      const entry =
        layerList.find(
          (item) =>
            (item.id && item.id === layer.id) ||
            fileStem(item.file) === layer.id
        ) || {};

      if (!Scene.sameViewBox(layer.viewBox, artboard)) {
        warnViewBoxMismatch(layer, entry, artboard, Scene);
        if (!entry.allowViewBoxMismatch) {
          continue;
        }
      }
      scene.layers.push({
        id: layer.id,
        file: layer.file,
        url: layer.url,
        units: layer.units,
      });
    }

    return scene;
  }

  function joinPath(dir, file) {
    if (!dir) return file;
    return dir.endsWith("/") ? dir + file : `${dir}/${file}`;
  }

  function fileStem(file) {
    const base = String(file).split("/").pop() || file;
    return base.replace(/\.[^.]+$/, "");
  }

  global.PlotterLoader = { loadScene, SVG_NS, GEOMETRY_TAGS };
})(window);
