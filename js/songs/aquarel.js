/* ============================================================
   AQUAREL (צבעים) — Plotter Machine score
   ------------------------------------------------------------
   Creative instructions only. The engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = true;

/** Matches album track listing (6:47). */
const AQUAREL_SPIN_DURATION_SEC = 407;

const AQUAREL_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Kineret + deadsea — quick simultaneous clear at 00:37:00. */
const AQUAREL_OPENING_VANISH = {
  from: 37,
  until: 37.65,
};

/** Bus + work — fast clear between 00:46:00 and 00:48:00. */
const AQUAREL_BUS_WORK_CLEAR = {
  from: 46,
  until: 48,
};

/** Shared pen settings so bus + work feel like one composition. */
const AQUAREL_BUS_WORK_LAYER = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 4,
    durationRange: [1.0, 3.2],
    minDuration: 0.6,
    staggerRange: [0.18, 0.7],
    eraseDurationRange: [0.14, 0.42],
  },
};

/** Shimshit → rounds handoff at 01:24:00. */
const AQUAREL_SHIMSHIT_HANDOFF = {
  from: 84,
  until: 84.55,
};

/** Telaviv → ashdod handoff at 01:46:00. */
const AQUAREL_TELAVIV_HANDOFF = {
  from: 106,
  until: 106.5,
};

/** Ashdod disappears completely at 02:21:00. */
const AQUAREL_ASHDOD_EXIT = {
  from: 141,
  until: 141.35,
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const AQUAREL_SCORE = {
  style: AQUAREL_STYLE,
  artboard: { x: 0, y: 0, w: 2034.88, h: 1995.2 },
  layers: [
    /* Layer 1 — kineret (00:00 → 00:09, hold, vanish 00:37) */
    {
      file: "aquarel_kineret.svg",
      strategy: "organic-pool",
      draw: { at: 0, until: 9, naturalPace: true },
      erase: AQUAREL_OPENING_VANISH,
      pool: {
        maxConcurrent: 1,
        speedRange: [0.92, 1.05],
        durationRange: [7.2, 8.6],
        minDuration: 6.8,
        staggerRange: [0.35, 1.0],
        eraseDurationRange: [0.12, 0.35],
      },
    },

    /* Layer 2 — deadsea (00:09 → ~00:32, on top of kineret, vanish 00:37) */
    {
      file: "aquarel_deadsea.svg",
      strategy: "organic-pool",
      draw: { at: 9, until: 32, naturalPace: true },
      erase: AQUAREL_OPENING_VANISH,
      pool: {
        maxConcurrent: 2,
        speedRange: [0.48, 0.72],
        durationRange: [2.8, 6.2],
        minDuration: 2.0,
        staggerRange: [0.45, 1.35],
        eraseDurationRange: [0.12, 0.35],
      },
    },

    /* Layer 3 — bus (00:37 → 00:46, shared clear 00:46 → 00:48) */
    {
      file: "aquarel_bus.svg",
      ...AQUAREL_BUS_WORK_LAYER,
      draw: { at: 37, until: 46 },
      erase: AQUAREL_BUS_WORK_CLEAR,
    },

    /* Layer 4 — work (00:37 → 00:46, shared clear 00:46 → 00:48) */
    {
      file: "aquarel_work.svg",
      ...AQUAREL_BUS_WORK_LAYER,
      draw: { at: 37, until: 46 },
      erase: AQUAREL_BUS_WORK_CLEAR,
    },

    /* Layer 5 — shimshit (00:48 → 01:15, music-reactive, handoff 01:24) */
    {
      file: "aquarel_shimshit.svg",
      strategy: "flute-living",
      draw: { at: 48, until: 75 },
      erase: AQUAREL_SHIMSHIT_HANDOFF,
      pool: {
        maxConcurrent: 3,
        drawWindow: 22,
        eraseBudget: 1.8,
        durationRange: [3.0, 6.8],
        minDuration: 2.2,
        staggerRange: [0.5, 1.15],
        eraseDurationRange: [0.28, 0.75],
      },
      modulation: {
        tremble: {
          from: 48,
          until: 75,
          source: "flute",
          maxPx: 1.5,
          minPx: 0.05,
          freq1: 44,
          freq2: 61,
          freq3: 27,
        },
        drawSpeed: {
          from: 48,
          until: 75,
          source: "flute",
          longLineShare: 0.32,
          slowMult: 0.42,
          fastMult: 2.35,
          dynamicsWeight: 0.62,
          follow: 0.16,
        },
      },
    },

    /* Layer 6 — rounds (01:24 → ~01:30, fade out 01:26 → 01:45) */
    {
      file: "aquarel_rounds.svg",
      strategy: "edge-stagger",
      draw: { at: 84, until: 92 },
      erase: { from: 86, until: 105 },
      pool: {
        maxConcurrent: 3,
        durationRange: [1.2, 3.4],
        minDuration: 0.75,
        staggerRange: [0.25, 0.85],
        eraseDurationRange: [0.55, 1.65],
      },
    },

    /* Layer 7 — telaviv (01:26 → 01:45 crossfade, handoff 01:46) */
    {
      file: "aquarel_telaviv.svg",
      strategy: "edge-stagger",
      draw: { at: 86, until: 105 },
      erase: AQUAREL_TELAVIV_HANDOFF,
      pool: {
        maxConcurrent: 3,
        durationRange: [1.4, 4.0],
        minDuration: 0.85,
        staggerRange: [0.3, 0.95],
        eraseDurationRange: [0.18, 0.48],
      },
    },

    /* Layer 8 — ashdod (01:46 → ~02:08, hold, gone at 02:21) */
    {
      file: "aquarel_ashdod.svg",
      strategy: "organic-pool",
      draw: { at: 106, until: 128, naturalPace: true },
      erase: AQUAREL_ASHDOD_EXIT,
      pool: {
        maxConcurrent: 2,
        speedRange: [0.5, 0.78],
        durationRange: [2.6, 6.4],
        minDuration: 1.9,
        staggerRange: [0.4, 1.2],
        eraseDurationRange: [0.08, 0.22],
      },
    },

    /* Later sections — not scheduled yet */
    { file: "aquarel_dalia.svg", placeholder: true },
    { file: "aquarel_eilat.svg", placeholder: true },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("aquarelAudio");

  if (SHOW_DEBUG_TIMECODE && audio && window.PlotterDebugTimecode) {
    PlotterDebugTimecode.attach({
      audio,
      anchor: document.querySelector(".plotter-timeline-wrap"),
    });
  }

  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    playBtn.disabled = true;
    playBtn.setAttribute("aria-busy", "true");
  }

  const fluteStem = document.getElementById("aquarelFluteStem");
  const analysisStems = fluteStem
    ? [{ id: "flute", audio: fluteStem }]
    : [];

  PlotterMachine.boot(mount, {
    baseDir: "../assets/svg/songs/aquarel",
    score: AQUAREL_SCORE,
    style: AQUAREL_STYLE,
    transport: {
      audio,
      analysisStems,
      playButton: playBtn,
      pauseButton: document.getElementById("pauseBtn"),
      timeline: document.getElementById("timeline"),
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: AQUAREL_SPIN_DURATION_SEC,
    },
  })
    .then(() => {
      console.log("[plotter:boot] complete — Play is ready");
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    })
    .catch((err) => {
      console.error("[aquarel] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (typeof markTrackListened === "function") {
        markTrackListened("track-a2");
      }
    });
  }
});
