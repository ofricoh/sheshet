/* ============================================================
   PLOTTER MACHINE — TRANSPORT
   ------------------------------------------------------------
   Master clock from an audio element. Play, pause, scrub.
   No visual logic — only time.
   ============================================================ */

(function (global) {
  "use strict";

  class Transport {
    constructor(options) {
      this.audio = options.audio;
      this.analysisAudios = normalizeAnalysisAudios(options);
      this.analysers = options.analysers || null;
      this.playButton = options.playButton || null;
      this.pauseButton = options.pauseButton || null;
      this.timeline = options.timeline || null;
      this.spinElement = options.spinElement || null;
      this.spinDurationSec = options.spinDurationSec ?? 10;

      this.isPlaying = false;
      this._scrubbing = false;
      this._onTime = null;
      this._raf = null;
      this._lastT = -1;

      this._tick = this._tick.bind(this);
      this._wire();
    }

    onTime(fn) {
      this._onTime = fn;
    }

    currentTime() {
      return this.audio ? this.audio.currentTime || 0 : 0;
    }

    duration() {
      const d = this.audio && this.audio.duration;
      return d && !isNaN(d) ? d : 0;
    }

    start() {
      if (this._raf) return;
      console.log("[plotter:play] animation loop starting");
      this._raf = requestAnimationFrame(this._tick);
    }

    stop() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
    }

    destroy() {
      this.stop();
    }

    _emit() {
      const t = this.currentTime();
      if (typeof this._onTime === "function") this._onTime(t);
      this._lastT = t;
    }

    _tick() {
      try {
        const t = this.currentTime();

        if (
          this.isPlaying ||
          this._scrubbing ||
          Math.abs(t - this._lastT) > 1e-4
        ) {
          this._emit();
        }

        if (this.isPlaying && this.timeline && !this._scrubbing) {
          const dur = this.duration();
          if (dur) this.timeline.value = String((t / dur) * 1000);
        }
      } catch (err) {
        console.error(
          "[plotter:transport] frame error:",
          err && err.message ? err.message : err
        );
      }

      this._raf = requestAnimationFrame(this._tick);
    }

    _syncAnalysisAudio() {
      if (!this.audio) return;
      for (const el of this.analysisAudios) {
        if (!el) continue;
        if (Math.abs(el.currentTime - this.audio.currentTime) > 0.04) {
          el.currentTime = this.audio.currentTime;
        }
      }
    }

    _resumeAnalysers() {
      if (!this.analysers) return;
      for (const a of Object.values(this.analysers)) {
        if (a && typeof a.resume === "function") a.resume();
      }
    }

    _playAnalysisAudios() {
      for (const el of this.analysisAudios) {
        if (!el) continue;
        el.play().catch((err) => {
          console.warn(
            "[plotter:play] analysis stem play failed:",
            el.id || el.src,
            err && err.message ? err.message : err
          );
        });
      }
    }

    _pauseAnalysisAudios() {
      for (const el of this.analysisAudios) {
        if (el) el.pause();
      }
    }

    _setSpinning(on) {
      if (!this.spinElement) return;
      this.spinElement.style.animationDuration = this.spinDurationSec + "s";
      this.spinElement.style.animationPlayState = on ? "running" : "paused";
    }

    _setPlaying(on) {
      this.isPlaying = on;
      this._setSpinning(on);
    }

    _wire() {
      const { audio, playButton, pauseButton, timeline } = this;

      if (playButton && audio) {
        playButton.addEventListener("click", () => {
          console.log("[plotter:play] click");
          this._syncAnalysisAudio();
          console.log("[plotter:play] analysis stems synced");
          this._resumeAnalysers();
          console.log("[plotter:play] AudioContext resume requested");
          audio
            .play()
            .then(() => {
              console.log(
                "[plotter:play] master audio playing at",
                audio.currentTime.toFixed(2) + "s"
              );
            })
            .catch((err) => {
              console.warn(
                "[plotter:play] master audio.play() failed:",
                err && err.message ? err.message : err
              );
            });
          this._playAnalysisAudios();
          console.log("[plotter:play] analysis stems play requested");
          this._setPlaying(true);
          console.log(
            "[plotter:play] timeline loop active, isPlaying=",
            this.isPlaying
          );
        });
      }

      if (pauseButton && audio) {
        pauseButton.addEventListener("click", () => {
          audio.pause();
          this._pauseAnalysisAudios();
          this._setPlaying(false);
        });
      }

      if (audio) {
        audio.addEventListener("play", () => {
          this._syncAnalysisAudio();
          this._resumeAnalysers();
          this._playAnalysisAudios();
          this._setPlaying(true);
        });
        audio.addEventListener("pause", () => this._setPlaying(false));
        audio.addEventListener("ended", () => this._setPlaying(false));
        audio.addEventListener("loadedmetadata", () => this._emit());
        audio.addEventListener("seeked", () => {
          this._syncAnalysisAudio();
          this._emit();
        });
      }

      if (timeline && audio) {
        timeline.addEventListener("input", () => {
          this._scrubbing = true;
          const dur = this.duration();
          if (dur) {
            audio.currentTime =
              (parseFloat(timeline.value) / 1000) * dur;
            this._syncAnalysisAudio();
            this._emit();
          }
        });
        timeline.addEventListener("change", () => {
          this._scrubbing = false;
        });
      }
    }
  }

  function normalizeAnalysisAudios(options) {
    if (!options) return [];
    if (Array.isArray(options.analysisAudios) && options.analysisAudios.length) {
      return options.analysisAudios.filter(Boolean);
    }
    if (Array.isArray(options.analysisStems) && options.analysisStems.length) {
      return options.analysisStems.map((s) => s && s.audio).filter(Boolean);
    }
    if (options.analysisAudio) return [options.analysisAudio];
    return [];
  }

  global.PlotterTransport = Transport;
})(window);
