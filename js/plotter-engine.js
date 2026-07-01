/* ============================================================
   SVG RENDERER
   ------------------------------------------------------------
   Generic SVG-to-canvas stroke renderer.

   Loads an SVG file, samples its paths, and draws them at a
   given progress (0..1). Pure rendering only — no audio, no
   transport, no timeline logic.
   ============================================================ */

(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function seededNoise(x, seed) {
    const s = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  }

  function smoothNoise(x, seed) {
    const i = Math.floor(x);
    const f = x - i;
    const t = f * f * (3 - 2 * f);
    return lerp(seededNoise(i, seed), seededNoise(i + 1, seed), t);
  }

  class SvgRenderer {
    constructor(config) {
      const defaults = {
        svgUrl: "",
        canvas: null,
        lineWidth: 1.4,
        lineColor: "#FAFAFA",
        svgScale: 1,
        svgPosition: { x: 0, y: 0 },
        svgRotation: 0,
        svgTransformOrigin: { x: 50, y: 50 },
        flipHorizontal: false,
        imperfection: 0,
        layoutFit: 0.88,
        pathSampleSpacing: 2.5,
      };

      this.config = Object.assign({}, defaults, config);
      this.config.svgPosition = Object.assign(
        { x: 0, y: 0 },
        config && config.svgPosition
      );

      this.ctx = this.config.canvas
        ? this.config.canvas.getContext("2d")
        : null;

      this.points = [];
      this.pathStarts = new Set([0]);
      this.pathSegments = [];
      this.bbox = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      this.transform = null;

      this._onResize = this._onResize.bind(this);
    }

    async init() {
      const t = this.config.timingPrefix;

      if (t) performance.mark(`${t}:renderer-init-start`);

      await this._loadPath();

      if (t) performance.mark(`${t}:path-segments-start`);
      this._buildPathSegments();
      if (t) performance.mark(`${t}:path-segments-end`);

      if (t) performance.mark(`${t}:canvas-resize-start`);
      this._resizeCanvas();
      this._computeTransform();
      if (t) performance.mark(`${t}:canvas-resize-end`);

      window.addEventListener("resize", this._onResize);

      if (t) {
        performance.mark(`${t}:renderer-init-end`);
        performance.measure(
          `${t}:path-segments`,
          `${t}:path-segments-start`,
          `${t}:path-segments-end`
        );
        performance.measure(
          `${t}:canvas-resize`,
          `${t}:canvas-resize-start`,
          `${t}:canvas-resize-end`
        );
        performance.measure(
          `${t}:renderer-init-total`,
          `${t}:renderer-init-start`,
          `${t}:renderer-init-end`
        );
      }

      return this;
    }

    /** Size and clear the canvas before path data is ready. */
    prepareCanvas() {
      this._resizeCanvas();
      if (!this.ctx) return;
      const { w, h } = this._getDrawSurface();
      this.ctx.clearRect(0, 0, w, h);
    }

    destroy() {
      window.removeEventListener("resize", this._onResize);
    }

    resize() {
      this._resizeCanvas();
      this._computeTransform();
    }

    /**
     * Draw the SVG at the given visual state.
     * @param {{ strokeProgress?: number, opacity?: number, scale?: number }} state
     */
    draw(state) {
      if (!this.ctx) return;

      const strokeProgress = clamp(state?.strokeProgress ?? 0, 0, 1);
      const opacity = clamp(state?.opacity ?? 1, 0, 1);
      const scale = state?.scale ?? 1;

      const ctx = this.ctx;
      const { w, h } = this._getDrawSurface();
      ctx.clearRect(0, 0, w, h);

      if (opacity <= 0 || strokeProgress <= 0) return;
      if (!this.pathSegments.length) return;

      ctx.save();
      ctx.globalAlpha = opacity;

      const rot = this.config.svgRotation || 0;
      const origin = this.config.svgTransformOrigin || { x: 50, y: 50 };
      const ox = (origin.x / 100) * w;
      const oy = (origin.y / 100) * h;

      ctx.translate(ox, oy);
      if (scale !== 1) ctx.scale(scale, scale);
      if (rot) ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-ox, -oy);

      ctx.lineWidth = this.config.lineWidth;
      ctx.strokeStyle = this.config.lineColor;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let i = 0; i < this.pathSegments.length; i++) {
        this._strokeSegment(this.pathSegments[i], strokeProgress);
      }

      ctx.restore();
    }

    async _loadPath() {
      const t = this.config.timingPrefix;

      if (t) performance.mark(`${t}:svg-fetch-start`);
      const res = await fetch(this.config.svgUrl);
      const text = await res.text();
      if (t) {
        performance.mark(`${t}:svg-fetch-end`);
        performance.measure(
          `${t}:svg-fetch`,
          `${t}:svg-fetch-start`,
          `${t}:svg-fetch-end`
        );
      }

      if (t) performance.mark(`${t}:svg-parse-start`);
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      const pathEls = [...doc.querySelectorAll("path")];
      if (t) {
        performance.mark(`${t}:svg-parse-end`);
        performance.measure(
          `${t}:svg-parse`,
          `${t}:svg-parse-start`,
          `${t}:svg-parse-end`
        );
      }

      if (t) performance.mark(`${t}:path-sample-start`);

      const measureSvg = document.createElementNS(SVG_NS, "svg");
      measureSvg.setAttribute("width", "0");
      measureSvg.setAttribute("height", "0");
      measureSvg.style.position = "absolute";
      measureSvg.style.left = "-99999px";
      measureSvg.style.visibility = "hidden";
      document.body.appendChild(measureSvg);

      const spacing = this.config.pathSampleSpacing;
      const points = [];
      const pathStarts = new Set([0]);

      for (const src of pathEls) {
        const d = src.getAttribute("d");
        if (!d) continue;

        const p = document.createElementNS(SVG_NS, "path");
        p.setAttribute("d", d);
        measureSvg.appendChild(p);

        const len = p.getTotalLength();
        const group = [];
        if (len > 0) {
          const steps = Math.max(2, Math.ceil(len / spacing));
          for (let i = 0; i <= steps; i++) {
            const pt = p.getPointAtLength((i / steps) * len);
            group.push({ x: pt.x, y: pt.y });
          }
        }
        measureSvg.removeChild(p);

        if (group.length === 0) continue;
        if (points.length > 0) pathStarts.add(points.length);
        points.push(...this._applyImperfection(group));
      }

      document.body.removeChild(measureSvg);

      this.points = points;
      this.pathStarts = pathStarts;
      this._computeBBox();

      if (this.config.flipHorizontal) {
        this._flipPathsHorizontal();
      }

      if (t) {
        performance.mark(`${t}:path-sample-end`);
        performance.measure(
          `${t}:path-sample`,
          `${t}:path-sample-start`,
          `${t}:path-sample-end`
        );
      }
    }

    _buildPathSegments() {
      const starts = [...this.pathStarts].sort((a, b) => a - b);
      this.pathSegments = [];

      for (let i = 0; i < starts.length; i++) {
        const startIdx = starts[i];
        const endIdx = (starts[i + 1] ?? this.points.length) - 1;
        const pointCount = endIdx - startIdx + 1;

        const localCum = new Float64Array(pointCount);
        let localTotal = 0;

        for (let j = startIdx + 1; j <= endIdx; j++) {
          localTotal += Math.hypot(
            this.points[j].x - this.points[j - 1].x,
            this.points[j].y - this.points[j - 1].y
          );
          localCum[j - startIdx] = localTotal;
        }

        this.pathSegments.push({
          startIdx,
          endIdx,
          localCum,
          length: localTotal,
        });
      }
    }

    _applyImperfection(points) {
      const amp = this.config.imperfection;
      if (amp <= 0 || points.length < 2) return points;

      let dist = 0;
      const out = [];

      for (let i = 0; i < points.length; i++) {
        const prev = points[Math.max(0, i - 1)];
        const next = points[Math.min(points.length - 1, i + 1)];

        if (i > 0) {
          dist += Math.hypot(
            points[i].x - points[i - 1].x,
            points[i].y - points[i - 1].y
          );
        }

        let tx = next.x - prev.x;
        let ty = next.y - prev.y;
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        const nx = -ty;
        const ny = tx;

        const wobble =
          smoothNoise(dist * 0.05, 1) * 0.55 +
          smoothNoise(dist * 0.17, 2) * 0.3 +
          smoothNoise(dist * 0.5, 3) * 0.15;

        out.push({
          x: points[i].x + nx * wobble * amp,
          y: points[i].y + ny * wobble * amp,
        });
      }

      return out;
    }

    _flipPathsHorizontal() {
      const cx = (this.bbox.minX + this.bbox.maxX) / 2;
      for (const p of this.points) {
        p.x = cx - (p.x - cx);
      }
      this._computeBBox();
    }

    _computeBBox() {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const p of this.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      this.bbox = { minX, minY, maxX, maxY };
    }

    _getDrawSurface() {
      const canvas = this.config.canvas;
      if (!canvas) {
        return { w: window.innerWidth, h: window.innerHeight };
      }
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      return { w, h };
    }

    _resizeCanvas() {
      const canvas = this.config.canvas;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const { w, h } = this._getDrawSurface();
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    _computeTransform() {
      const { w, h } = this._getDrawSurface();
      const bw = this.bbox.maxX - this.bbox.minX || 1;
      const bh = this.bbox.maxY - this.bbox.minY || 1;

      const fitFactor = this.config.layoutFit ?? 0.88;
      const fit = Math.min((w * fitFactor) / bw, (h * fitFactor) / bh);
      const scale = fit * this.config.svgScale;

      const cx = (this.bbox.minX + this.bbox.maxX) / 2;
      const cy = (this.bbox.minY + this.bbox.maxY) / 2;

      this.transform = {
        scale,
        offsetX: w / 2 + this.config.svgPosition.x - cx * scale,
        offsetY: h / 2 + this.config.svgPosition.y - cy * scale,
      };
    }

    _toScreen(pt) {
      return {
        x: pt.x * this.transform.scale + this.transform.offsetX,
        y: pt.y * this.transform.scale + this.transform.offsetY,
      };
    }

    _strokeSegment(seg, drawProgress) {
      const ctx = this.ctx;
      const { startIdx, endIdx, localCum, length } = seg;
      if (drawProgress <= 0 || length <= 0 || endIdx <= startIdx) return;

      const targetLen = drawProgress * length;
      const pointCount = endIdx - startIdx + 1;

      ctx.beginPath();
      let started = false;

      for (let j = 0; j < pointCount; j++) {
        const i = startIdx + j;
        const localLen = localCum[j];

        if (localLen > targetLen) {
          if (j > 0) {
            const prevLen = localCum[j - 1];
            const segLen = localLen - prevLen;
            if (segLen > 0 && targetLen >= prevLen) {
              const t = clamp((targetLen - prevLen) / segLen, 0, 1);
              const pt = {
                x: lerp(this.points[i - 1].x, this.points[i].x, t),
                y: lerp(this.points[i - 1].y, this.points[i].y, t),
              };
              const s = this._toScreen(pt);
              if (started) ctx.lineTo(s.x, s.y);
            }
          }
          break;
        }

        const s = this._toScreen(this.points[i]);
        if (!started) {
          ctx.moveTo(s.x, s.y);
          started = true;
        } else {
          ctx.lineTo(s.x, s.y);
        }
      }

      if (started) ctx.stroke();
    }

    _onResize() {
      this.resize();
    }

    applyTransform(transform) {
      if (!transform) return;
      Object.assign(this.config, {
        svgScale: transform.scale ?? this.config.svgScale,
        svgPosition: transform.position ?? this.config.svgPosition,
        svgRotation: transform.rotation ?? this.config.svgRotation,
        svgTransformOrigin:
          transform.origin ?? this.config.svgTransformOrigin,
      });
      this._computeTransform();
    }
  }

  global.SvgRenderer = SvgRenderer;
  global.PlotterEngine = SvgRenderer;
})(window);
