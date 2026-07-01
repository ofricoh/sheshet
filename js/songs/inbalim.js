/* ============================================================
   INBALIM — Plotter Machine score
   ------------------------------------------------------------
   Creative instructions only. The engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

const INBALIM_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const INBALIM_SCORE = {
  style: INBALIM_STYLE,
  layers: [
    {
      file: "inbalim_rounds.svg",
      strategy: "organic-pool",
      draw: { at: 0, until: 14 },
      erase: { from: 10, until: 27 },
      pool: {
        maxConcurrent: 1,
        speedRange: [0.45, 0.72],
        durationRange: [3.2, 6.0],
        minDuration: 2.4,
        staggerRange: [0.55, 1.6],
      },
    },
    {
      file: "inbalim_fileds.svg",
      strategy: "edge-stagger",
      draw: { at: 13, until: 27 },
      erase: { from: 27, until: 32 },
      style: {
        strokeLinecap: "butt",
        strokeLinejoin: "miter",
      },
      pool: {
        maxConcurrent: 4,
        durationRange: [0.7, 2.0],
        minDuration: 0.45,
        staggerRange: [0.3, 1.0],
        eraseDurationRange: [0.4, 1.4],
      },
    },
    {
      file: "inbalim_high.svg",
      strategy: "flute-living",
      draw: { at: 27, until: 49 },
      erase: { until: 49 },
      pool: {
        maxConcurrent: 3,
        drawWindow: 17,
        eraseBudget: 5.5,
        durationRange: [3.2, 6.8],
        minDuration: 2.4,
        staggerRange: [0.55, 1.2],
        eraseDurationRange: [0.55, 1.5],
      },
      modulation: {
        tremble: {
          from: 27,
          until: 49,
          source: "flute",
          maxPx: 1.5,
          minPx: 0.05,
          freq1: 44,
          freq2: 61,
          freq3: 27,
        },
      },
    },
    {
      file: "inbalim_trees.svg",
      strategy: "tree-breath",
      draw: { at: 49, until: 75.5 },
      erase: { from: 76.5, until: 80 },
      pool: {
        maxConcurrent: 4,
        durationRange: [5, 11],
        minDuration: 3.5,
        staggerRange: [1.2, 2.8],
        eraseDurationRange: [0.18, 0.55],
      },
      modulation: {
        flicker: {
          from: 56,
          until: 66,
          source: "guitar",
          attackThreshold: 0.28,
          recentMemory: 32,
          windows: [
            {
              from: 56,
              until: 58,
              count: [6, 7],
              blinkDuration: [0.05, 0.12],
              minGap: 0.3,
            },
            {
              from: 63,
              until: 64.5,
              count: [6, 7],
              blinkDuration: [0.05, 0.11],
              minGap: 0.32,
            },
            {
              from: 63,
              until: 66,
              count: [2, 4],
              blinkDuration: [0.04, 0.1],
              minGap: 0.38,
            },
          ],
        },
      },
    },
    {
      file: "inbalim_road.svg",
      strategy: "road-inward",
      draw: { at: 79.5, until: 86 },
      erase: { from: 87, until: 88.5 },
      pool: {
        maxConcurrent: 3,
        durationRange: [2.1, 5.2],
        minDuration: 1.0,
        staggerRange: [0.4, 1.2],
        eraseDurationRange: [0.25, 0.75],
      },
    },
    {
      file: "inbalim_water.svg",
      strategy: "edge-stagger",
      draw: { at: 92, until: 98.5 },
      erase: { from: 98.55, until: 99 },
      pool: {
        maxConcurrent: 4,
        durationRange: [1.0, 3.6],
        minDuration: 0.55,
        staggerRange: [0.2, 0.85],
        eraseDurationRange: [0.08, 0.22],
      },
    },
    {
      file: "inbalim_house.svg",
      strategy: "burst-settle",
      draw: { at: 92, until: 98.5 },
      erase: { from: 98.55, until: 99 },
      pool: {
        burstUntil: 93,
        burstShare: 0.4,
        eraseDuration: 0.08,
        burst: {
          maxConcurrent: 6,
          durationRange: [0.22, 0.72],
          minDuration: 0.18,
          staggerRange: [0.04, 0.18],
        },
        settle: {
          maxConcurrent: 3,
          durationRange: [1.4, 5.0],
          minDuration: 0.9,
          staggerRange: [0.35, 1.1],
        },
      },
    },
    {
      id: "inbalim_high_echo",
      file: "inbalim_high.svg",
      strategy: "flute-living",
      draw: { at: 100, until: 106.5 },
      erase: { until: 107 },
      pool: {
        maxConcurrent: 6,
        drawWindow: 5.2,
        eraseBudget: 0.5,
        durationRange: [0.65, 2.1],
        minDuration: 0.4,
        staggerRange: [0.1, 0.35],
        eraseDurationRange: [0.1, 0.28],
      },
      modulation: {
        tremble: {
          from: 100,
          until: 107,
          source: "other",
          energy: 1.35,
          maxPx: 2.5,
          minPx: 0.1,
          freq1: 52,
          freq2: 78,
          freq3: 34,
        },
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    playBtn.disabled = true;
    playBtn.setAttribute("aria-busy", "true");
  }

  PlotterMachine.boot(mount, {
    baseDir: "../assets/svg/songs/inbalim",
    score: INBALIM_SCORE,
    style: INBALIM_STYLE,
    transport: {
      audio: document.getElementById("inbalimAudio"),
      analysisStems: [
        {
          id: "flute",
          audio: document.getElementById("inbalimFluteStem"),
        },
        {
          id: "guitar",
          audio: document.getElementById("inbalimGuitarStem"),
        },
        {
          id: "drums",
          audio: document.getElementById("inbalimDrumsStem"),
        },
      ],
      playButton: playBtn,
      pauseButton: document.getElementById("pauseBtn"),
      timeline: document.getElementById("timeline"),
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: 120,
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
      console.error("[inbalim] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (typeof markTrackListened === "function") {
        markTrackListened("track-a1");
      }
    });
  }
});
