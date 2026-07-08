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

  let sharedCtx = null;

  function getSharedContext() {
    if (sharedCtx) return sharedCtx;
    const AudioCtx = global.AudioContext || global.webkitAudioContext;
    if (!AudioCtx) return null;
    sharedCtx = new AudioCtx();
    return sharedCtx;
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
    wind: {
      smoothing: 0.48,
      envelopeFollow: 0.46,
      resonanceFollow: 0.52,
      slowFollow: 0.08,
    },
    guitar: {
      smoothing: 0.38,
      envelopeFollow: 0.52,
      resonanceFollow: 0.48,
      slowFollow: 0.07,
    },
    bass: {
      smoothing: 0.62,
      envelopeFollow: 0.34,
      resonanceFollow: 0.28,
      slowFollow: 0.1,
    },
    piano: {
      smoothing: 0.28,
      envelopeFollow: 0.58,
      resonanceFollow: 0.42,
      slowFollow: 0.05,
    },
    drums: {
      smoothing: 0.45,
      envelopeFollow: 0.48,
      resonanceFollow: 0.35,
      slowFollow: 0.06,
    },
    strings: {
      smoothing: 0.52,
      envelopeFollow: 0.4,
      resonanceFollow: 0.48,
      slowFollow: 0.09,
    },
    other: {
      smoothing: 0.5,
      envelopeFollow: 0.44,
      resonanceFollow: 0.4,
      slowFollow: 0.07,
    },
  };

  function createAnalyser(options) {
    const audio = options && options.audio;
    if (!audio) return null;

    const ctx = getSharedContext();
    if (!ctx) {
      console.warn("[audio-analyser] Web Audio API unavailable");
      return null;
    }

    const profileName = (options && options.profile) || "default";
    const profile = PROFILES[profileName] || PROFILES.default;
    const isFlute = profileName === "flute" || profileName === "wind";
    const isGuitar = profileName === "guitar";
    const isBass = profileName === "bass";
    const isPiano = profileName === "piano";
    const isStrings = profileName === "strings";
    const isOther = profileName === "other";
    const isDrums = profileName === "drums";
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
        rmsJump *
          (isFlute ? 20 : isPiano ? 24 : isGuitar ? 18 : 14) +
          hiJump *
            (isFlute ? 8 : isGuitar ? 14 : isPiano ? 6 : 10) +
          midFlux *
            (isFlute ? 16 : isPiano ? 20 : isGuitar ? 4 : 0) +
          rms * (isBass ? 2.4 : 1.8) +
          hi * (isGuitar ? 0.72 : 0.55)
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

      const guitar = clamp01(
        hi * (isGuitar ? 0.78 : 0.65) +
          mid * 0.25 +
          attack * (isGuitar ? 0.88 : 0.75) +
          hiJump * (isGuitar ? 9 : 0)
      );
      const bass = clamp01(
        lo * (isBass ? 1.35 : 1.05) +
          rms * (isBass ? 1.05 : 0.65) +
          mid * 0.08
      );
      const piano = clamp01(
        mid * (isPiano ? 1.05 : 0.72) +
          attack * (isPiano ? 1.05 : 0.82) +
          midFlux * (isPiano ? 16 : 8) +
          rmsJump * (isPiano ? 14 : 6)
      );
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
        bass,
        piano,
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

      if (isGuitar) {
        const live = clamp01(
          hi * 1.05 + mid * 0.42 + attack * 0.72 + hiJump * 10
        );
        const transient = clamp01(hiJump * 16 + attack * 0.85 + rmsJump * 8);
        const dynamics = clamp01(
          (live - slowEnvelope) / (slowEnvelope * 0.38 + 0.05)
        );
        out.live = live;
        out.transient = transient;
        out.dynamics = dynamics;
        out.guitar = clamp01(
          live * 0.55 + transient * 0.28 + dynamics * 0.22
        );
      }

      if (isBass) {
        const live = clamp01(lo * 1.25 + rms * 1.05 + mid * 0.12);
        const transient = clamp01(rmsJump * 12 + midFlux * 6 + attack * 0.35);
        const dynamics = clamp01(
          (live - slowEnvelope) / (slowEnvelope * 0.35 + 0.05)
        );
        out.live = live;
        out.transient = transient;
        out.dynamics = dynamics;
        out.bass = clamp01(live * 0.62 + transient * 0.18 + dynamics * 0.2);
      }

      if (isPiano) {
        const live = clamp01(
          mid * 1.15 + attack * 0.95 + midFlux * 14 + rmsJump * 10
        );
        const transient = clamp01(
          midFlux * 20 + rmsJump * 18 + attack * 0.92
        );
        const dynamics = clamp01(
          (live - slowEnvelope) / (slowEnvelope * 0.32 + 0.04)
        );
        out.live = live;
        out.transient = transient;
        out.dynamics = dynamics;
        out.piano = clamp01(
          live * 0.5 + transient * 0.34 + dynamics * 0.24
        );
      }

      if (isStrings) {
        const live = clamp01(
          mid * 0.95 + hi * 0.55 + spectral * 0.42 + rms * 1.1
        );
        const transient = clamp01(
          midFlux * 10 + hiJump * 8 + attack * 0.55
        );
        const dynamics = clamp01(
          (live - slowEnvelope) / (slowEnvelope * 0.36 + 0.05)
        );
        out.live = live;
        out.transient = transient;
        out.dynamics = dynamics;
        out.resonance = clamp01(
          resonance * 0.45 + live * 0.35 + spectral * 0.2
        );
      }

      if (isOther) {
        const live = clamp01(
          spectral * 0.82 + mid * 0.72 + hi * 0.28 + rms * 1.35
        );
        const transient = clamp01(
          midFlux * 12 + rmsJump * 10 + attack * 0.65 + hiJump * 6
        );
        const dynamics = clamp01(
          (live - slowEnvelope) / (slowEnvelope * 0.34 + 0.05)
        );
        out.live = live;
        out.transient = transient;
        out.dynamics = dynamics;
      }

      if (isDrums) {
        const live = clamp01(
          rms * 3.0 + hi * 0.62 + attack * 0.85 + hiJump * 8
        );
        const transient = clamp01(
          rmsJump * 18 + hiJump * 14 + attack * 0.9
        );
        const dynamics = clamp01(
          (live - slowEnvelope) / (slowEnvelope * 0.3 + 0.04)
        );
        out.live = live;
        out.transient = transient;
        out.dynamics = dynamics;
        out.drums = clamp01(
          live * 0.55 + transient * 0.32 + dynamics * 0.18
        );
      }

      return out;
    }

    return { ctx, resume, sample };
  }

  global.PlotterAudioAnalyser = { createAnalyser };
})(window);
