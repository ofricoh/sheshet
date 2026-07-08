/* ============================================================
   SEVENEIGHT (7/8) — Plotter Machine score
   ------------------------------------------------------------
   Creative instructions only. The engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = false;

/** Matches album track listing (4:09). */
const SEVENEIGHT_SPIN_DURATION_SEC = 203;

const SEVENEIGHT_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Shared fade-out for opening act (layers 1–3). */
const SEVENEIGHT_OPENING_FADE = {
  from: 35,
  until: 48.2,
};

/**
 * Bus-stop circles — one at a time, shuffled across the artwork.
 * Reused for each bus reprise with separate layer ids.
 */
const SEVENEIGHT_BUS_LAYER = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 1,
    durationRange: [0.1, 0.32],
    minDuration: 0.08,
    staggerRange: [0.04, 0.14],
    eraseDurationRange: [0.06, 0.22],
  },
};

/** Short bus burst (finale). */
const SEVENEIGHT_BUS_QUICK = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 1,
    durationRange: [0.08, 0.22],
    minDuration: 0.06,
    staggerRange: [0.03, 0.1],
    eraseDurationRange: [0.04, 0.12],
  },
};

/** Quick simultaneous clear (nahalal + section handoff). */
const SEVENEIGHT_PAIR_VANISH = {
  from: 154.5,
  until: 154.95,
};

/** Hard cut — every remaining stroke gone by 04:05:00. */
const SEVENEIGHT_FINAL_WIPE = {
  from: 243.5,
  until: 245,
};

/** Per-unit erase speed for the final synchronous clear. */
const SEVENEIGHT_FINAL_ERASE_RANGE = [0.03, 0.1];

/** Fast road burst (coda reprise). */
const SEVENEIGHT_ROAD_FAST = {
  maxConcurrent: 6,
  durationRange: [0.35, 1.1],
  minDuration: 0.25,
  staggerRange: [0.08, 0.35],
  eraseDurationRange: [0.2, 0.6],
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const SEVENEIGHT_SCORE = {
  style: SEVENEIGHT_STYLE,
  layers: [
    /* Layer 1 — smallfields (00:00 → 00:22, fade 00:35 → 00:48:20) */
    {
      file: "seveneight_smallfields.svg",
      strategy: "organic-pool",
      draw: { at: 0, until: 22 },
      erase: SEVENEIGHT_OPENING_FADE,
      pool: {
        maxConcurrent: 1,
        speedRange: [0.42, 0.68],
        durationRange: [2.8, 5.6],
        minDuration: 2.0,
        staggerRange: [0.45, 1.4],
      },
    },

    /* Layer 2 — road (00:13 → 00:29:80, vocal-reactive, shared fade) */
    {
      file: "seveneight_road.svg",
      strategy: "edge-stagger",
      draw: { at: 13, until: 29.8 },
      erase: SEVENEIGHT_OPENING_FADE,
      pool: {
        maxConcurrent: 5,
        durationRange: [0.7, 2.2],
        minDuration: 0.45,
        staggerRange: [0.15, 0.85],
        eraseDurationRange: [0.45, 1.6],
      },
      modulation: {
        drawSpeed: {
          from: 13,
          until: 29.8,
          source: "other",
          longLineShare: 0.32,
          slowMult: 0.42,
          fastMult: 2.35,
          dynamicsWeight: 0.62,
          follow: 0.16,
        },
      },
    },

    /* Layer 3 — bus opening (00:30 → 00:35, shared fade) */
    {
      id: "seveneight_bus_opening",
      file: "seveneight_bus.svg",
      ...SEVENEIGHT_BUS_LAYER,
      draw: { at: 30, until: 35 },
      erase: SEVENEIGHT_OPENING_FADE,
    },

    /* Layer 4 — section (00:48:24 → 01:00:00, crossfade out with streets) */
    {
      file: "seveneight_section.svg",
      strategy: "edge-stagger",
      draw: { at: 48.24, until: 60 },
      erase: { from: 82.04, until: 94.5 },
      pool: {
        maxConcurrent: 4,
        durationRange: [0.55, 1.65],
        minDuration: 0.35,
        staggerRange: [0.12, 0.55],
        eraseDurationRange: [0.35, 1.1],
      },
    },

    /* Layer 3 return — bus (01:00 → 01:05:04) */
    {
      id: "seveneight_bus_return_1",
      file: "seveneight_bus.svg",
      ...SEVENEIGHT_BUS_LAYER,
      draw: { at: 60, until: 65.04 },
      erase: { from: 65.04, until: 65.12 },
    },

    /* Layer 5 — house (01:05:04 → 01:17:90, stays under streets, gone by 01:43:40) */
    {
      file: "seveneight_house.svg",
      strategy: "edge-stagger",
      draw: { at: 65.04, until: 77.9 },
      erase: { from: 97.5, until: 103.4 },
      pool: {
        maxConcurrent: 3,
        durationRange: [1.4, 4.2],
        minDuration: 0.9,
        staggerRange: [0.35, 1.05],
        eraseDurationRange: [0.2, 0.55],
      },
    },

    /* Layer 3 return — bus (01:17:90 → 01:22:00, gone by 01:22) */
    {
      id: "seveneight_bus_return_2",
      file: "seveneight_bus.svg",
      ...SEVENEIGHT_BUS_LAYER,
      draw: { at: 77.9, until: 81.2 },
      erase: { from: 81.2, until: 82 },
    },

    /* Layer 6 — streets (01:22:04 → 01:37:50, draw then erase) */
    {
      file: "seveneight_streets.svg",
      strategy: "edge-stagger",
      draw: { at: 82.04, until: 94.5 },
      erase: { from: 94.5, until: 97.5 },
      pool: {
        maxConcurrent: 4,
        durationRange: [0.65, 2.0],
        minDuration: 0.4,
        staggerRange: [0.2, 0.75],
        eraseDurationRange: [0.35, 1.0],
      },
    },

    /* Layer 7 — high (01:43:42 → 01:56:30) */
    {
      file: "seveneight_high.svg",
      strategy: "organic-pool",
      draw: { at: 103.42, until: 116.3 },
      erase: { from: 120.1, until: 135 },
      pool: {
        maxConcurrent: 2,
        speedRange: [0.48, 0.78],
        durationRange: [2.4, 5.8],
        minDuration: 1.8,
        staggerRange: [0.35, 1.2],
      },
    },

    /* Layer 3 return — bus (01:56:32 → 02:00:00) */
    {
      id: "seveneight_bus_return_3",
      file: "seveneight_bus.svg",
      ...SEVENEIGHT_BUS_LAYER,
      draw: { at: 116.32, until: 119.5 },
      erase: { from: 119.5, until: 120 },
    },

    /* Layer 8 — bigfields (02:00:10 → 02:15:00, gone by 02:22:00) */
    {
      file: "seveneight_bigfields.svg",
      strategy: "organic-pool",
      draw: { at: 120.1, until: 135 },
      erase: { from: 138, until: 142 },
      pool: {
        maxConcurrent: 2,
        speedRange: [0.42, 0.68],
        durationRange: [2.6, 6.2],
        minDuration: 1.9,
        staggerRange: [0.4, 1.3],
      },
    },

    /* Final bus (02:16:00 → 02:18:00) */
    {
      id: "seveneight_bus_finale",
      file: "seveneight_bus.svg",
      ...SEVENEIGHT_BUS_QUICK,
      draw: { at: 136, until: 137.6 },
      erase: { from: 137.6, until: 138 },
    },

    /* Nahalal (02:22:00 → 02:34:00, section stacks on top mid-window) */
    {
      id: "seveneight_nahalal",
      file: "seveneight_nahalal.svg",
      strategy: "organic-pool",
      draw: { at: 142, until: 154 },
      erase: SEVENEIGHT_PAIR_VANISH,
      pool: {
        maxConcurrent: 2,
        speedRange: [0.44, 0.72],
        durationRange: [2.5, 6.0],
        minDuration: 1.8,
        staggerRange: [0.38, 1.25],
      },
    },

    /* Layer 4 return — section over nahalal (~02:28 → 02:34:50) */
    {
      id: "seveneight_section_return",
      file: "seveneight_section.svg",
      strategy: "edge-stagger",
      draw: { at: 148, until: 154 },
      erase: SEVENEIGHT_PAIR_VANISH,
      pool: {
        maxConcurrent: 4,
        durationRange: [0.55, 1.65],
        minDuration: 0.35,
        staggerRange: [0.12, 0.55],
        eraseDurationRange: [0.08, 0.22],
      },
    },

    /* Layer 2 return — road (02:34:50 → 02:47:00, fades as high returns) */
    {
      id: "seveneight_road_return",
      file: "seveneight_road.svg",
      strategy: "edge-stagger",
      draw: { at: 154.5, until: 165 },
      erase: { from: 180, until: 183 },
      pool: {
        maxConcurrent: 5,
        durationRange: [0.7, 2.2],
        minDuration: 0.45,
        staggerRange: [0.15, 0.85],
        eraseDurationRange: [0.2, 0.65],
      },
    },

    /* Layer 5 return — house (02:47:00 → 03:00:00, slow erase 03:13 → 03:26) */
    {
      id: "seveneight_house_return",
      file: "seveneight_house.svg",
      strategy: "edge-stagger",
      draw: { at: 167, until: 177 },
      erase: { from: 193, until: 206 },
      pool: {
        maxConcurrent: 3,
        durationRange: [1.4, 4.2],
        minDuration: 0.9,
        staggerRange: [0.35, 1.05],
        eraseDurationRange: [0.45, 1.35],
      },
    },

    /* Layer 7 return — high over house (03:00 → 03:13, hands off to streets) */
    {
      id: "seveneight_high_return",
      file: "seveneight_high.svg",
      strategy: "organic-pool",
      draw: { at: 180, until: 193 },
      erase: { from: 206, until: 216 },
      pool: {
        maxConcurrent: 2,
        speedRange: [0.48, 0.78],
        durationRange: [2.4, 5.8],
        minDuration: 1.8,
        staggerRange: [0.35, 1.2],
      },
    },

    /* Bigfields return — builds with streets (03:26:00 → 03:43:00) */
    {
      id: "seveneight_bigfields_return",
      file: "seveneight_bigfields.svg",
      strategy: "organic-pool",
      draw: { at: 206, until: 223 },
      erase: SEVENEIGHT_FINAL_WIPE,
      pool: {
        maxConcurrent: 2,
        speedRange: [0.42, 0.68],
        durationRange: [2.6, 6.2],
        minDuration: 1.9,
        staggerRange: [0.4, 1.3],
      },
    },

    /* Layer 6 return — streets + bigfields (03:26:00 → 03:43:00) */
    {
      id: "seveneight_streets_return",
      file: "seveneight_streets.svg",
      strategy: "edge-stagger",
      draw: { at: 206, until: 223 },
      erase: SEVENEIGHT_FINAL_WIPE,
      pool: {
        maxConcurrent: 4,
        durationRange: [0.65, 2.0],
        minDuration: 0.4,
        staggerRange: [0.2, 0.75],
        eraseDurationRange: SEVENEIGHT_FINAL_ERASE_RANGE,
      },
    },

    /* Layer 2 return — road fast (03:43:00 → 03:47:00) */
    {
      id: "seveneight_road_return_2",
      file: "seveneight_road.svg",
      strategy: "edge-stagger",
      draw: { at: 223, until: 227 },
      erase: SEVENEIGHT_FINAL_WIPE,
      pool: {
        ...SEVENEIGHT_ROAD_FAST,
        eraseDurationRange: SEVENEIGHT_FINAL_ERASE_RANGE,
      },
    },

    /* Layer 1 return — smallfields (03:47:00 → final wipe) */
    {
      id: "seveneight_smallfields_coda",
      file: "seveneight_smallfields.svg",
      strategy: "organic-pool",
      draw: { at: 227, until: 238 },
      erase: SEVENEIGHT_FINAL_WIPE,
      pool: {
        maxConcurrent: 1,
        speedRange: [0.42, 0.68],
        durationRange: [2.8, 5.6],
        minDuration: 2.0,
        staggerRange: [0.45, 1.4],
      },
    },

    /* Layer 3 return — bus coda (03:47:00 → final wipe) */
    {
      id: "seveneight_bus_coda",
      file: "seveneight_bus.svg",
      ...SEVENEIGHT_BUS_LAYER,
      draw: { at: 227, until: 238 },
      erase: SEVENEIGHT_FINAL_WIPE,
      pool: {
        ...SEVENEIGHT_BUS_LAYER.pool,
        eraseDurationRange: [0.03, 0.08],
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("seveneightAudio");

  if (SHOW_DEBUG_TIMECODE && audio && window.PlotterDebugTimecode) {
    PlotterDebugTimecode.attach({
      audio,
      anchor: document.body,
      placement: "append",
    });
  }

  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    playBtn.disabled = true;
    playBtn.setAttribute("aria-busy", "true");
  }

  const vocalStem = document.getElementById("seveneightVocalStem");
  const analysisStems = vocalStem
    ? [{ id: "flute", audio: vocalStem }]
    : [];

  PlotterMachine.boot(mount, {
    baseDir: "../assets/svg/songs/seveneight",
    score: SEVENEIGHT_SCORE,
    style: SEVENEIGHT_STYLE,
    transport: {
      audio,
      analysisStems,
      playButton: playBtn,
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: SEVENEIGHT_SPIN_DURATION_SEC,
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
      console.error("[seveneight] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

});
