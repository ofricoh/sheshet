/* ============================================================
   PLOTTER MACHINE — AUDIO ANALYSER
   ------------------------------------------------------------
   Reads a muted, synced audio stem for visual modulation only.
   The stem is never routed to speakers — only the master mix
   is audible during playback.
   ============================================================ */

(function (global) {
  "use strict";

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  const PROFILES = {
    default: {
      smoothing: 0.82,
      envelopeFollow: 0.18,
      resonanceFollow: 0.22,
      slowFollow: 0.06,
    },
    flute: {
      smoothing: 0.48,
      envelopeFollow: 0.46,
      resonanceFollow: 0.52,
      slowFollow: 0.08,
    },
  };

  function createAnalyser(options) {
    const audio = options && options.audio;
    if (!audio) return null;

    const AudioCtx = global.AudioContext || global.webkitAudioContext;
    if (!AudioCtx) {
      console.warn("[audio-analyser] Web Audio API unavailable");
      return null;
    }

    const profileName = (options && options.profile) || "default";
    const profile = PROFILES[profileName] || PROFILES.default;
    const isFlute = profileName === "flute";

    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = profile.smoothing;

    try {
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
    } catch (err) {
      console.warn(
        "[audio-analyser] could not attach stem — analysis disabled:",
        err.message
      );
      return null;
    }

    const timeData = new Uint8Array(analyser.fftSize);
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    let envelope = 0;
    let slowEnvelope = 0;
    let prevRms = 0;
    let prevHi = 0;
    let prevMid = 0;

    function resume() {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    }

    function sample() {
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / timeData.length);

      const binCount = freqData.length;
      const loEnd = Math.floor(binCount * 0.08);
      const midEnd = Math.floor(binCount * 0.45);
      let lo = 0;
      let mid = 0;
      let hi = 0;

      for (let i = 0; i < binCount; i++) {
        const v = freqData[i] / 255;
        if (i < loEnd) lo += v;
        else if (i < midEnd) mid += v;
        else hi += v;
      }

      lo /= loEnd || 1;
      mid /= midEnd - loEnd || 1;
      hi /= binCount - midEnd || 1;

      const spectral = clamp01(mid * 0.55 + hi * 0.35 + lo * 0.1);
      const hiJump = Math.max(0, hi - prevHi);
      const rmsJump = Math.max(0, rms - prevRms);
      const midFlux = Math.max(0, mid - prevMid);

      const attack = clamp01(
        rmsJump * (isFlute ? 20 : 14) +
          hiJump * (isFlute ? 8 : 10) +
          midFlux * (isFlute ? 16 : 0) +
          rms * 1.8 +
          hi * 0.55
      );

      prevRms = rms;
      prevHi = hi;
      prevMid = mid;

      const target = clamp01(
        rms * (isFlute ? 3.1 : 2.8) + spectral * (isFlute ? 0.85 : 0.75)
      );
      envelope += (target - envelope) * profile.envelopeFollow;
      slowEnvelope += (target - slowEnvelope) * profile.slowFollow;

      let resonance = clamp01(spectral * 0.7 + rms * 1.6);
      resonance += (target - resonance) * profile.resonanceFollow;

      const guitar = clamp01(hi * 0.65 + mid * 0.25 + attack * 0.75);
      const cymbal = clamp01(hi * 0.72 + attack * 0.88 + hiJump * 11);
      const drums = clamp01(rms * 2.4 + hi * 0.45 + attack * 0.55);
      const cue = clamp01(rms * 2.6 + mid * 0.55 + hi * 0.35 + attack * 0.4);

      const out = {
        rms,
        envelope,
        bands: { lo, mid, hi },
        spectral,
        attack,
        flute: clamp01(mid * 0.85 + rms * 1.4),
        resonance,
        guitar,
        cymbal,
        drums,
        cue,
      };

      if (isFlute) {
        const live = clamp01(
          rms * 3.0 +
            mid * 1.45 +
            hi * 0.28 +
            attack * 0.55 +
            midFlux * 9
        );
        const transient = clamp01(
          rmsJump * 22 + midFlux * 18 + attack * 0.9
        );
        const dynamics = clamp01(
          (live - slowEnvelope) / (slowEnvelope * 0.42 + 0.05)
        );

        out.live = live;
        out.transient = transient;
        out.dynamics = dynamics;
        out.flute = clamp01(
          live * 0.48 + transient * 0.3 + dynamics * 0.22
        );
        out.resonance = clamp01(
          resonance * 0.35 + live * 0.4 + transient * 0.25
        );
      }

      return out;
    }

    return { ctx, resume, sample };
  }

  global.PlotterAudioAnalyser = { createAnalyser };
})(window);
