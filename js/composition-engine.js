/* ============================================================
   COMPOSITION ENGINE
   ------------------------------------------------------------
   Timeline-driven multi-layer SVG composition.

   visualState = f(currentTime)

   Each layer declares enter / hold / exit phases with timing,
   easing, and render mode. Scrubbing reconstructs the frame
   instantly — no accumulated animation state.
   ============================================================ */

(function (global) {
  "use strict";

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  /* ----------------------------------------------------------
     Easing
     ---------------------------------------------------------- */

  const EASINGS = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - (1 - t) * (1 - t),
    easeInOut: (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  };

  function applyEasing(name, t) {
    const fn = EASINGS[name] || EASINGS.linear;
    return fn(clamp(t, 0, 1));
  }

  /* ----------------------------------------------------------
     Render modes — pluggable; add new modes here only.
     Each mode maps phase progress to visual properties.
     ---------------------------------------------------------- */

  const RENDER_MODES = {
    stroke: {
      enter(progress) {
        return { strokeProgress: progress, opacity: 1, scale: 1 };
      },
      hold() {
        return { strokeProgress: 1, opacity: 1, scale: 1 };
      },
      exit(progress) {
        return { strokeProgress: 1 - progress, opacity: 1, scale: 1 };
      },
    },

    fade: {
      enter(progress) {
        return { strokeProgress: 1, opacity: progress, scale: 1 };
      },
      hold() {
        return { strokeProgress: 1, opacity: 1, scale: 1 };
      },
      exit(progress) {
        return { strokeProgress: 1, opacity: 1 - progress, scale: 1 };
      },
    },

    scale: {
      enter(progress) {
        return { strokeProgress: 1, opacity: 1, scale: progress };
      },
      hold() {
        return { strokeProgress: 1, opacity: 1, scale: 1 };
      },
      exit(progress) {
        return { strokeProgress: 1, opacity: 1, scale: 1 - progress };
      },
    },
  };

  /**
   * Evaluate a layer timeline at time t (seconds).
   * @returns {{ visible: boolean, phase: string, renderState: object } | null}
   */
  function evaluateTimeline(timeline, t) {
    if (!timeline || !timeline.enter) return null;

    const enterAt = timeline.enter.at ?? 0;
    const enterDuration = timeline.enter.duration ?? 0;
    const enterEnd = enterAt + enterDuration;

    const exitAt =
      timeline.exit?.at ??
      timeline.hold?.until ??
      Infinity;
    const exitDuration = timeline.exit?.duration ?? 0;
    const exitEnd = exitAt + exitDuration;

    if (t < enterAt) {
      return { visible: false, phase: "before", renderState: null };
    }

    if (t < enterEnd) {
      const raw = enterDuration > 0 ? (t - enterAt) / enterDuration : 1;
      const progress = applyEasing(timeline.enter.easing, raw);
      const mode = timeline.enter.mode || "stroke";
      const handler = RENDER_MODES[mode] || RENDER_MODES.stroke;
      return {
        visible: true,
        phase: "enter",
        renderState: handler.enter(progress),
      };
    }

    if (t < exitAt) {
      const mode = timeline.enter.mode || "stroke";
      const handler = RENDER_MODES[mode] || RENDER_MODES.stroke;
      return {
        visible: true,
        phase: "hold",
        renderState: handler.hold(),
      };
    }

    if (t < exitEnd) {
      const raw = exitDuration > 0 ? (t - exitAt) / exitDuration : 1;
      const progress = applyEasing(timeline.exit.easing, raw);
      const mode = timeline.exit.mode || timeline.enter.mode || "fade";
      const handler = RENDER_MODES[mode] || RENDER_MODES.fade;
      return {
        visible: true,
        phase: "exit",
        renderState: handler.exit(progress),
      };
    }

    return { visible: false, phase: "after", renderState: null };
  }

  /* ----------------------------------------------------------
     Startup timing (DevTools → Performance → User timing)
     ---------------------------------------------------------- */

  const TIMING_ROOT = "inbalim";

  function safeMeasure(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
    } catch (_) {
      /* marks may be missing if init aborted early */
    }
  }

  function logStartupTimings() {
    const entries = performance
      .getEntriesByType("measure")
      .filter((e) => e.name.startsWith(`${TIMING_ROOT}:`))
      .map((e) => ({ phase: e.name.replace(`${TIMING_ROOT}:`, ""), ms: e.duration.toFixed(1) }))
      .sort((a, b) => parseFloat(b.ms) - parseFloat(a.ms));

    if (entries.length) {
      console.table(entries);
    }
  }

  /* ----------------------------------------------------------
     Composition
     ---------------------------------------------------------- */

  class Composition {
    /**
     * @param {object} options
     * @param {Array} options.layers — declarative layer definitions
     * @param {HTMLAudioElement} options.audioElement — master clock
     * @param {HTMLAudioElement} [options.syncAudioElement] — secondary stem
     * @param {HTMLInputElement} [options.timeline]
     * @param {HTMLElement} [options.playButton]
     * @param {HTMLElement} [options.pauseButton]
     * @param {HTMLElement} [options.spinGroupElement]
     * @param {HTMLElement} [options.labelElement]
     * @param {number} [options.recordRotationSpeed]
     */
    constructor(options) {
      this.options = options;
      this.layers = [];
      this.isPlaying = false;
      this._scrubbing = false;
      this._raf = null;
      this._lastTime = -1;

      this._onResize = this._onResize.bind(this);
      this._tick = this._tick.bind(this);
    }

    /**
     * Wire transport immediately; load SVG renderers in the background.
     * Resolves as soon as controls are live — does not wait for path sampling.
     */
    init() {
      performance.mark(`${TIMING_ROOT}:composition-init-start`);

      const { layers: layerDefs } = this.options;

      for (const def of layerDefs) {
        const canvas = def.canvas;
        this._prepareLayerCanvas(canvas);

        this.layers.push({
          id: def.id,
          timeline: def.timeline,
          def,
          canvas,
          renderer: null,
          ready: false,
        });
      }

      this._wireTransport();
      performance.mark(`${TIMING_ROOT}:transport-wired`);
      safeMeasure(
        `${TIMING_ROOT}:transport-wiring`,
        `${TIMING_ROOT}:composition-init-start`,
        `${TIMING_ROOT}:transport-wired`
      );

      window.addEventListener("resize", this._onResize);
      this._raf = requestAnimationFrame(this._tick);

      performance.mark(`${TIMING_ROOT}:sync-init-end`);
      safeMeasure(
        `${TIMING_ROOT}:sync-init-total`,
        `${TIMING_ROOT}:composition-init-start`,
        `${TIMING_ROOT}:sync-init-end`
      );

      this._loadLayersAsync();

      return this;
    }

    async _loadLayersAsync() {
      performance.mark(`${TIMING_ROOT}:layers-load-start`);

      try {
        await Promise.all(
          this.layers.map((layer) => this._initLayer(layer))
        );

        performance.mark(`${TIMING_ROOT}:first-render-start`);
        this.render(this._currentTime());
        performance.mark(`${TIMING_ROOT}:first-render-end`);
        safeMeasure(
          `${TIMING_ROOT}:first-render`,
          `${TIMING_ROOT}:first-render-start`,
          `${TIMING_ROOT}:first-render-end`
        );

        performance.mark(`${TIMING_ROOT}:layers-load-end`);
        safeMeasure(
          `${TIMING_ROOT}:layers-load-total`,
          `${TIMING_ROOT}:layers-load-start`,
          `${TIMING_ROOT}:layers-load-end`
        );
        safeMeasure(
          `${TIMING_ROOT}:composition-init-total`,
          `${TIMING_ROOT}:composition-init-start`,
          `${TIMING_ROOT}:layers-load-end`
        );

        logStartupTimings();
      } catch (err) {
        console.warn("[Composition] layer init failed:", err);
      }
    }

    async _initLayer(layer) {
      const def = layer.def;
      const timingPrefix = `${TIMING_ROOT}:layer:${layer.id}`;

      const renderer = new global.SvgRenderer({
        svgUrl: def.svgUrl,
        canvas: layer.canvas,
        lineWidth: def.lineWidth,
        lineColor: def.lineColor,
        svgScale: def.transform?.scale ?? 1,
        svgPosition: def.transform?.position ?? { x: 0, y: 0 },
        svgRotation: def.transform?.rotation ?? 0,
        svgTransformOrigin: def.transform?.origin ?? { x: 50, y: 50 },
        flipHorizontal: def.flipHorizontal ?? false,
        imperfection: def.imperfection ?? 0,
        timingPrefix,
      });

      await renderer.init();

      layer.renderer = renderer;
      layer.ready = true;
    }

    _prepareLayerCanvas(canvas) {
      if (!canvas) return;

      const renderer = new global.SvgRenderer({ canvas });
      renderer.prepareCanvas();
      canvas.style.opacity = "0";
    }

    destroy() {
      if (this._raf) cancelAnimationFrame(this._raf);
      window.removeEventListener("resize", this._onResize);
      for (const layer of this.layers) {
        if (layer.renderer) layer.renderer.destroy();
      }
    }

    /** Pure function: render all layers at time t (seconds). */
    render(t) {
      for (const layer of this.layers) {
        const canvas = layer.canvas;

        if (!layer.ready || !layer.renderer) {
          if (canvas) canvas.style.opacity = "0";
          continue;
        }

        const result = evaluateTimeline(layer.timeline, t);

        if (!result || !result.visible || !result.renderState) {
          layer.renderer.draw({
            strokeProgress: 0,
            opacity: 0,
            scale: 0,
          });
          if (canvas) canvas.style.opacity = "0";
          continue;
        }

        if (canvas) canvas.style.opacity = "1";
        layer.renderer.draw(result.renderState);
      }

      this._lastTime = t;
    }

    _currentTime() {
      const audio = this.options.audioElement;
      return audio ? audio.currentTime || 0 : 0;
    }

    _duration() {
      const audio = this.options.audioElement;
      return audio && !isNaN(audio.duration) ? audio.duration : 0;
    }

    _wireTransport() {
      const {
        audioElement,
        syncAudioElement,
        timeline,
        playButton,
        pauseButton,
        spinGroupElement,
        labelElement,
        recordRotationSpeed,
      } = this.options;

      const syncSecondary = () => {
        if (!syncAudioElement || !audioElement) return;
        if (
          Math.abs(syncAudioElement.currentTime - audioElement.currentTime) >
          0.04
        ) {
          syncAudioElement.currentTime = audioElement.currentTime;
        }
      };

      const spinTarget = labelElement || spinGroupElement;

      const setSpinning = (on) => {
        if (!spinTarget) return;
        const dur = (recordRotationSpeed ?? 10) + "s";
        spinTarget.style.animationDuration = dur;
        spinTarget.style.animationPlayState = on ? "running" : "paused";
      };

      const setPlaying = (on) => {
        this.isPlaying = on;
        setSpinning(on);
      };

      if (playButton && audioElement) {
        playButton.addEventListener("click", () => {
          syncSecondary();
          audioElement.play().catch(() => {});
          if (syncAudioElement) syncAudioElement.play().catch(() => {});
          setPlaying(true);
        });
      }

      if (pauseButton && audioElement) {
        pauseButton.addEventListener("click", () => {
          audioElement.pause();
          if (syncAudioElement) syncAudioElement.pause();
          setPlaying(false);
        });
      }

      if (audioElement) {
        audioElement.addEventListener("play", () => setPlaying(true));
        audioElement.addEventListener("pause", () => setPlaying(false));
        audioElement.addEventListener("ended", () => setPlaying(false));
        audioElement.addEventListener("loadedmetadata", () => {
          this.render(this._currentTime());
        });
        audioElement.addEventListener("seeked", () => {
          syncSecondary();
          this.render(this._currentTime());
        });
      }

      if (timeline && audioElement) {
        timeline.addEventListener("input", () => {
          this._scrubbing = true;
          const dur = this._duration();
          if (dur) {
            const t = (parseFloat(timeline.value) / 1000) * dur;
            audioElement.currentTime = t;
            syncSecondary();
            this.render(t);
          }
        });

        timeline.addEventListener("change", () => {
          this._scrubbing = false;
        });
      }
    }

    _tick() {
      const t = this._currentTime();

      if (
        this.isPlaying ||
        this._scrubbing ||
        Math.abs(t - this._lastTime) > 1e-4
      ) {
        this.render(t);
      }

      const { timeline } = this.options;
      if (this.isPlaying && timeline && !this._scrubbing) {
        const dur = this._duration();
        if (dur) timeline.value = (t / dur) * 1000;
      }

      this._raf = requestAnimationFrame(this._tick);
    }

    _onResize() {
      for (const layer of this.layers) {
        if (!layer.ready || !layer.renderer) {
          this._prepareLayerCanvas(layer.canvas);
          continue;
        }

        const def = layer.def;
        if (typeof def.readTransform === "function") {
          layer.renderer.applyTransform(def.readTransform());
        }
        layer.renderer.resize();
      }
      this.render(this._currentTime());
    }

    /** Re-apply transforms from external source (e.g. CSS vars). */
    refreshTransforms(getTransformForLayer) {
      for (const layer of this.layers) {
        if (!layer.ready || !layer.renderer) continue;
        if (typeof getTransformForLayer === "function") {
          layer.renderer.applyTransform(getTransformForLayer(layer.id));
        }
      }
      this.render(this._currentTime());
    }
  }

  global.Composition = Composition;
  global.evaluateTimeline = evaluateTimeline;
  global.RENDER_MODES = RENDER_MODES;
  global.TIMELINE_EASINGS = EASINGS;
  global.logInbalimStartupTimings = logStartupTimings;
})(window);
