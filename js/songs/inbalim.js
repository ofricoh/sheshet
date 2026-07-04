/* ============================================================
   INBALIM — Plotter Machine score
   ------------------------------------------------------------
   Creative instructions only. The engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = true;

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
      erase: { from: 21.56, until: 26.56 },
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
        drawSpeed: {
          from: 27,
          until: 49,
          source: "flute",
          longLineShare: 0.32,
          slowMult: 0.42,
          fastMult: 2.35,
          dynamicsWeight: 0.62,
          follow: 0.16,
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
      draw: { at: 88.6, until: 95.1 },
      erase: { from: 99.35, until: 99.8 },
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
      erase: { from: 99.72, until: 99.8 },
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
      draw: { at: 101, until: 107.5 },
      erase: { until: 108 },
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
          from: 101,
          until: 108,
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
    {
      file: "inbalim_strips.svg",
      strategy: "edge-stagger",
      draw: { at: 106, until: 115.5 },
      erase: { from: 116, until: 119.5 },
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
      modulation: {
        tremble: {
          from: 106,
          until: 119.5,
          source: "flute",
          energy: 0.55,
          maxPx: 0.35,
          minPx: 0.07,
          freq1: 38,
          freq2: 52,
          freq3: 22,
        },
      },
    },
    {
      file: "inbalim_walk.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 119, until: 125 },
      erase: { from: 125, until: 125.5 },
      pool: {
        maxConcurrent: 4,
        durationRange: [0.9, 2.4],
        minDuration: 0.55,
        staggerRange: [0.25, 0.85],
        eraseDurationRange: [0.06, 0.18],
      },
      modulation: {
        drawSpeed: {
          from: 119,
          until: 125,
          source: "guitar",
          longLineShare: 0.28,
          slowMult: 0.5,
          fastMult: 2.1,
          dynamicsWeight: 0.58,
          follow: 0.14,
        },
      },
    },
    {
      file: "inbalim_way.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 125, until: 131 },
      erase: { from: 131, until: 131.5 },
      pool: {
        maxConcurrent: 3,
        durationRange: [1.2, 3.8],
        minDuration: 0.8,
        staggerRange: [0.3, 1.0],
        eraseDurationRange: [0.06, 0.18],
      },
      modulation: {
        drawSpeed: {
          from: 125,
          until: 131,
          source: "guitar",
          longLineShare: 0.28,
          slowMult: 0.5,
          fastMult: 2.1,
          dynamicsWeight: 0.58,
          follow: 0.14,
        },
      },
    },
    {
      file: "inbalim_home.svg",
      allowViewBoxMismatch: true,
      strategy: "tree-breath",
      draw: { at: 131, until: 155.2 },
      erase: { from: 157, until: 176 },
      pool: {
        maxConcurrent: 4,
        durationRange: [4.5, 10],
        minDuration: 3.0,
        staggerRange: [1.0, 2.5],
        eraseDurationRange: [0.2, 0.6],
      },
      modulation: {
        inkBreath: {
          from: 131,
          until: 157,
          source: "guitar",
          intensityIdle: 0.25,
          depthRangeIdle: [0.01, 0.025],
          depthRange: [0.04, 0.08],
          energy: 0.35,
          dynamicsWeight: 0.42,
          speedIdle: 0.55,
          speed: 1.5,
        },
      },
    },
    {
      id: "inbalim_high_finale",
      file: "inbalim_high.svg",
      strategy: "flute-living",
      draw: { at: 157, until: 176 },
      erase: { until: 178 },
      pool: {
        maxConcurrent: 3,
        drawWindow: 16,
        eraseBudget: 2,
        durationRange: [2.8, 7.5],
        minDuration: 2.0,
        staggerRange: [0.7, 1.6],
        eraseDurationRange: [0.35, 0.9],
      },
      modulation: {
        tremble: {
          from: 157,
          until: 178,
          source: "flute",
          maxPx: 1.8,
          minPx: 0.06,
          freq1: 44,
          freq2: 61,
          freq3: 27,
        },
        drawSpeed: {
          from: 157,
          until: 176,
          source: "flute",
          longLineShare: 0.32,
          slowMult: 0.32,
          fastMult: 2.6,
          dynamicsWeight: 0.68,
          follow: 0.18,
        },
      },
    },
    {
      id: "inbalim_fields_return",
      file: "inbalim_fileds.svg",
      strategy: "edge-stagger",
      draw: { at: 178, until: 186 },
      erase: { from: 190, until: 195 },
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
      id: "inbalim_strips_return",
      file: "inbalim_strips.svg",
      strategy: "edge-stagger",
      draw: { at: 190, until: 195 },
      erase: { from: 197, until: 200 },
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
      modulation: {
        tremble: {
          from: 190,
          until: 200,
          source: "flute",
          energy: 0.55,
          maxPx: 0.35,
          minPx: 0.07,
          freq1: 38,
          freq2: 52,
          freq3: 22,
        },
      },
    },
    {
      id: "inbalim_rounds_finale",
      file: "inbalim_rounds.svg",
      strategy: "organic-pool",
      draw: { at: 200.05, until: 208 },
      erase: { from: 210, until: 212 },
      pool: {
        maxConcurrent: 1,
        speedRange: [0.45, 0.72],
        durationRange: [3.2, 6.0],
        minDuration: 2.4,
        staggerRange: [0.55, 1.6],
      },
    },
    {
      id: "inbalim_house_finale",
      file: "inbalim_house.svg",
      strategy: "burst-settle",
      draw: { at: 202.05, until: 209 },
      erase: { from: 210, until: 212 },
      pool: {
        burstUntil: 203.05,
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
      id: "inbalim_water_finale",
      file: "inbalim_water.svg",
      strategy: "edge-stagger",
      draw: { at: 204.05, until: 209.5 },
      erase: { from: 210, until: 212 },
      pool: {
        maxConcurrent: 4,
        durationRange: [1.0, 3.6],
        minDuration: 0.55,
        staggerRange: [0.2, 0.85],
        eraseDurationRange: [0.08, 0.22],
      },
    },
    {
      id: "inbalim_way_finale",
      file: "inbalim_way.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 206.05, until: 209.8 },
      erase: { from: 210, until: 212 },
      pool: {
        maxConcurrent: 3,
        durationRange: [1.2, 3.8],
        minDuration: 0.8,
        staggerRange: [0.3, 1.0],
        eraseDurationRange: [0.06, 0.18],
      },
      modulation: {
        drawSpeed: {
          from: 206.05,
          until: 210,
          source: "guitar",
          longLineShare: 0.28,
          slowMult: 0.5,
          fastMult: 2.1,
          dynamicsWeight: 0.58,
          follow: 0.14,
        },
      },
    },
    {
      id: "inbalim_walk_coda",
      file: "inbalim_walk.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 213, until: 219 },
      erase: { from: 221, until: 223 },
      pool: {
        maxConcurrent: 4,
        durationRange: [0.9, 2.4],
        minDuration: 0.55,
        staggerRange: [0.25, 0.85],
        eraseDurationRange: [0.06, 0.18],
      },
      modulation: {
        drawSpeed: {
          from: 213,
          until: 221,
          source: "guitar",
          longLineShare: 0.28,
          slowMult: 0.5,
          fastMult: 2.1,
          dynamicsWeight: 0.58,
          follow: 0.14,
        },
      },
    },
    {
      id: "inbalim_road_coda",
      file: "inbalim_road.svg",
      strategy: "road-inward",
      draw: { at: 217.5, until: 227 },
      erase: { from: 229, until: 231.5 },
      pool: {
        maxConcurrent: 3,
        durationRange: [2.1, 5.2],
        minDuration: 1.0,
        staggerRange: [0.4, 1.2],
        eraseDurationRange: [0.25, 0.75],
      },
    },
    {
      id: "inbalim_trees_coda",
      file: "inbalim_trees.svg",
      strategy: "tree-breath",
      draw: { at: 233, until: 245 },
      erase: { from: 248, until: 251 },
      pool: {
        maxConcurrent: 3,
        durationRange: [4.5, 8],
        minDuration: 3.0,
        staggerRange: [1.0, 2.2],
        eraseDurationRange: [0.2, 0.5],
      },
    },
    {
      id: "inbalim_way_coda",
      file: "inbalim_way.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 250, until: 256 },
      erase: { from: 257, until: 258.5 },
      pool: {
        maxConcurrent: 3,
        durationRange: [1.2, 3.8],
        minDuration: 0.8,
        staggerRange: [0.3, 1.0],
        eraseDurationRange: [0.06, 0.18],
      },
      modulation: {
        drawSpeed: {
          from: 250,
          until: 257,
          source: "guitar",
          longLineShare: 0.28,
          slowMult: 0.5,
          fastMult: 2.1,
          dynamicsWeight: 0.58,
          follow: 0.14,
        },
      },
    },
    {
      id: "inbalim_water_coda",
      file: "inbalim_water.svg",
      strategy: "edge-stagger",
      draw: { at: 256.5, until: 262.5 },
      erase: { from: 263.5, until: 265.5 },
      pool: {
        maxConcurrent: 4,
        durationRange: [1.0, 3.6],
        minDuration: 0.55,
        staggerRange: [0.2, 0.85],
        eraseDurationRange: [0.08, 0.22],
      },
    },
    {
      id: "inbalim_rounds_coda",
      file: "inbalim_rounds.svg",
      strategy: "organic-pool",
      draw: { at: 262, until: 282 },
      erase: { from: 298.5, until: 303.5 },
      style: {
        strokeWidth: 1.0,
      },
      pool: {
        maxConcurrent: 1,
        speedRange: [0.32, 0.52],
        durationRange: [4.8, 7.5],
        minDuration: 3.2,
        staggerRange: [1.1, 2.4],
      },
    },
    {
      id: "inbalim_home_coda",
      file: "inbalim_home.svg",
      allowViewBoxMismatch: true,
      strategy: "tree-breath",
      draw: { at: 264.5, until: 293 },
      erase: { from: 298.5, until: 303.5 },
      pool: {
        maxConcurrent: 3,
        durationRange: [5.5, 11],
        minDuration: 3.5,
        staggerRange: [1.2, 2.8],
        eraseDurationRange: [0.35, 0.85],
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("inbalimAudio");

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
      spinDurationSec: 304,
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
