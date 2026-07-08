/* ============================================================
   PLOTTER — track-to-track carousel transition
   Reuses the intro’s physical record motion: slide + spin.
   ============================================================ */

(function (global) {
  "use strict";

  const STORAGE_KEY = "sheshet_track_transition";

  const TRACK_TRANSITION = {
    durationMs: 1200,
    easing: "ease",
    slideDistance: "105vw",
  };

  /** Label orientation when the record is at rest (matches a fresh page load). */
  const RESTING_ANGLE = 0;

  function readTransitionPayload() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function clearTransitionPayload() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function writeTransitionPayload(payload) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function getMainAudio() {
    return document.querySelector(
      ".plotter-page audio:not([muted])"
    );
  }

  function captureSpinAngle(spinEl) {
    if (!spinEl) return 0;

    const matrix = new DOMMatrixReadOnly(getComputedStyle(spinEl).transform);
    if (matrix.isIdentity) return 0;

    return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
  }

  function getSpinDurationSec(spinEl) {
    const inline = spinEl?.style.animationDuration;
    if (inline) {
      const parsed = parseFloat(inline);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    const fromCss = getComputedStyle(document.documentElement)
      .getPropertyValue("--plotter-spin-duration")
      .trim();

    if (fromCss.endsWith("s")) {
      const parsed = parseFloat(fromCss);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    return 120;
  }

  function removeTransitionSpinStyle() {
    document.getElementById("track-transition-spin")?.remove();
  }

  function keepSpinRunning(spinEl, angleDeg) {
    if (!spinEl) return;

    const durationSec = getSpinDurationSec(spinEl);
    const normalized = ((angleDeg % 360) + 360) % 360;
    const delaySec = -((normalized / 360) * durationSec);

    spinEl.style.animationDuration = `${durationSec}s`;
    spinEl.style.animationDelay = `${delaySec}s`;
    spinEl.style.animationPlayState = "running";
  }

  function applyContinuousSpin(spinEl, angleDeg, playing) {
    if (!spinEl) return;

    removeTransitionSpinStyle();

    const durationSec = getSpinDurationSec(spinEl);
    const normalized = ((angleDeg % 360) + 360) % 360;
    const delaySec = -((normalized / 360) * durationSec);

    spinEl.style.animation = "none";
    spinEl.style.transform = `rotate(${normalized}deg)`;

    spinEl.offsetHeight;

    spinEl.style.animation = `spin ${durationSec}s linear infinite`;
    spinEl.style.animationDelay = `${delaySec}s`;
    spinEl.style.animationPlayState = playing ? "running" : "paused";
    spinEl.style.transform = "";
  }

  function parseSlideDistancePx(slideDistance) {
    const match = String(slideDistance).match(/^([\d.]+)(vw|vh|px)$/);
    if (!match) return window.innerWidth;

    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === "vw") return (value / 100) * window.innerWidth;
    if (unit === "vh") return (value / 100) * window.innerHeight;
    return value;
  }

  function getRecordRadiusPx() {
    const spinEl = document.getElementById("plotterSpinGroup");
    if (!spinEl) return 0;
    return spinEl.getBoundingClientRect().width / 2;
  }

  /** Rolling rotation (deg) for a disc travelling `slideDistance` without slipping. */
  function computeRollDegrees(slideDistance, direction) {
    const slidePx = parseSlideDistancePx(slideDistance);
    const radiusPx = getRecordRadiusPx();
    if (!radiusPx) return direction === "next" ? 360 : -360;

    const rollDeg = (slidePx / radiusPx) * (180 / Math.PI);
    return direction === "next" ? rollDeg : -rollDeg;
  }

  function freezeSpinAtCurrentAngle(spinEl) {
    if (!spinEl) return 0;

    const angleDeg = captureSpinAngle(spinEl);
    removeTransitionSpinStyle();

    spinEl.getAnimations().forEach((animation) => animation.cancel());
    spinEl.style.animation = "none";
    spinEl.style.transform = `rotate(${angleDeg}deg)`;
    spinEl.offsetHeight;

    return angleDeg;
  }

  function animateViewport(viewport, keyframes, durationMs) {
    return viewport
      .animate(keyframes, {
        duration: durationMs,
        easing: TRACK_TRANSITION.easing,
        fill: "forwards",
      })
      .finished.catch(() => {});
  }

  function animateSpinRoll(spinEl, fromDeg, toDeg, durationMs) {
    if (!spinEl) return Promise.resolve();

    return spinEl
      .animate(
        [
          { transform: `rotate(${fromDeg}deg)` },
          { transform: `rotate(${toDeg}deg)` },
        ],
        {
          duration: durationMs,
          easing: TRACK_TRANSITION.easing,
          fill: "forwards",
        }
      )
      .finished.catch(() => {});
  }

  function resumePlaybackIfNeeded(wasPlaying) {
    if (!wasPlaying) return;

    const audio = getMainAudio();
    if (!audio) return;

    audio.play().catch(() => {});
  }

  function navigateWithTransition(href, direction) {
    const viewport = document.querySelector(".plotter-viewport");
    const spinEl = document.getElementById("plotterSpinGroup");
    const audio = getMainAudio();

    if (!viewport || !href || !direction) {
      window.location.href = href;
      return;
    }

    document.body.classList.add("is-track-transition");

    const wasPlaying = Boolean(audio && !audio.paused);

    if (audio && wasPlaying) {
      audio.pause();
    }

    const startAngle = freezeSpinAtCurrentAngle(spinEl);
    const rollDeg = computeRollDegrees(
      TRACK_TRANSITION.slideDistance,
      direction
    );
    const endAngle = startAngle + rollDeg;

    const exitX =
      direction === "next"
        ? `translateX(${TRACK_TRANSITION.slideDistance})`
        : `translateX(calc(-1 * ${TRACK_TRANSITION.slideDistance}))`;

    Promise.all([
      animateViewport(
        viewport,
        [{ transform: "translateX(0)" }, { transform: exitX }],
        TRACK_TRANSITION.durationMs
      ),
      animateSpinRoll(
        spinEl,
        startAngle,
        endAngle,
        TRACK_TRANSITION.durationMs
      ),
    ]).then(() => {
      writeTransitionPayload({
        direction,
        rollDeg,
        wasPlaying,
      });
      window.location.href = href;
    });
  }

  function finishEnterTransition(payload) {
    const viewport = document.querySelector(".plotter-viewport");
    const spinEl = document.getElementById("plotterSpinGroup");

    document.documentElement.classList.remove("track-transition-enter");
    delete document.documentElement.dataset.trackEnter;

    if (viewport) {
      viewport.getAnimations().forEach((animation) => animation.cancel());
      viewport.style.transform = "";
    }

    if (spinEl) {
      spinEl.getAnimations().forEach((animation) => animation.cancel());
      spinEl.style.transform = "";
    }

    applyContinuousSpin(
      spinEl,
      RESTING_ANGLE,
      payload.wasPlaying
    );
    removeTransitionSpinStyle();
    clearTransitionPayload();

    resumePlaybackIfNeeded(payload.wasPlaying);
  }

  function initEnterTransition() {
    const payload = readTransitionPayload();
    if (!payload || !payload.direction) return;

    const viewport = document.querySelector(".plotter-viewport");
    const spinEl = document.getElementById("plotterSpinGroup");

    if (!viewport) {
      clearTransitionPayload();
      return;
    }

    document.documentElement.classList.add("track-transition-enter");
    document.documentElement.dataset.trackEnter = payload.direction;
    document.body.classList.add("is-track-transition");

    const rollDeg =
      typeof payload.rollDeg === "number"
        ? payload.rollDeg
        : computeRollDegrees(
            TRACK_TRANSITION.slideDistance,
            payload.direction
          );
    const startAngle = RESTING_ANGLE - rollDeg;

    freezeSpinAtCurrentAngle(spinEl);
    if (spinEl) {
      spinEl.style.transform = `rotate(${startAngle}deg)`;
    }

    const enterFrom =
      payload.direction === "next"
        ? `translateX(calc(-1 * ${TRACK_TRANSITION.slideDistance}))`
        : `translateX(${TRACK_TRANSITION.slideDistance})`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Promise.all([
          animateViewport(
            viewport,
            [{ transform: enterFrom }, { transform: "translateX(0)" }],
            TRACK_TRANSITION.durationMs
          ),
          animateSpinRoll(
            spinEl,
            startAngle,
            RESTING_ANGLE,
            TRACK_TRANSITION.durationMs
          ),
        ]).then(() => {
          document.body.classList.remove("is-track-transition");
          finishEnterTransition(payload);
        });
      });
    });
  }

  global.PlotterTrackTransition = {
    STORAGE_KEY,
    TRACK_TRANSITION,
    navigateWithTransition,
    initEnterTransition,
    applyContinuousSpin,
    captureSpinAngle,
  };

  if (document.body.classList.contains("plotter-page")) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initEnterTransition);
    } else {
      initEnterTransition();
    }
  }
})(window);
