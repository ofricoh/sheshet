/* ============================================================
   F MINOR (פה מינור) — Plotter Machine score
   ------------------------------------------------------------
   Slow closing chapter — a walk through layered Jerusalem.
   Creative instructions only; the engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = false;

/** Matches audio file duration (~6:26). */
const FMINOR_SPIN_DURATION_SEC = 314;

const FMINOR_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Outskirts texture clears as the city streets take over. */
const FMINOR_FIELDS_OPENING_EXIT = {
  from: 78,
  until: 108,
};

/** First street passage — room before the house rises. */
const FMINOR_STREET_OPENING_EXIT = {
  from: 132,
  until: 158,
};

/** Bezalel hands off to Rahavia. */
const FMINOR_BEZALEL_HANDOFF = {
  from: 218,
  until: 244,
};

/** House clears before the traffic section. */
const FMINOR_HOUSE_MID_EXIT = {
  from: 232,
  until: 262,
};

/** Rahavia fades as cars enter the frame. */
const FMINOR_RAHAVIA_EXIT = {
  from: 258,
  until: 284,
};

/** Cars dissolve into the second street passage. */
const FMINOR_CARS_EXIT = {
  from: 308,
  until: 332,
};

/** Street return clears for the panoramic all-layer. */
const FMINOR_STREET_RETURN_EXIT = {
  from: 322,
  until: 348,
};

/** Final exhale — rapid path erase, not a hard cut. */
const FMINOR_FINAL_EXIT = {
  from: 368,
  until: 384,
};

/** Per-unit erase speed for the closing clear. */
const FMINOR_FINAL_ERASE_RANGE = [0.55, 1.85];

/** Sparse hatching — terrain at the edge of the city. */
const FMINOR_FIELDS_POOL = {
  maxConcurrent: 1,
  speedRange: [0.3, 0.55],
  durationRange: [2.6, 6.2],
  minDuration: 1.9,
  staggerRange: [0.65, 1.85],
  eraseDurationRange: [2.0, 5.4],
};

/** Urban edge geometry — readable stagger, never rushed. */
const FMINOR_EDGE = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 2,
    durationRange: [2.6, 7.2],
    minDuration: 1.8,
    staggerRange: [0.75, 2.1],
    eraseDurationRange: [1.6, 4.8],
  },
};

/** Slower architectural pool — houses, neighborhoods. */
const FMINOR_EDGE_SLOW = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 2,
    durationRange: [3.0, 8.6],
    minDuration: 2.2,
    staggerRange: [0.9, 2.5],
    eraseDurationRange: [2.2, 6.0],
  },
};

/** Traffic fragments — slightly tighter, still restrained. */
const FMINOR_CARS_POOL = {
  maxConcurrent: 2,
  durationRange: [1.8, 5.4],
  minDuration: 1.3,
  staggerRange: [0.45, 1.35],
  eraseDurationRange: [1.2, 3.6],
};

/** Main-mix draw speed + gentle ink breath. */
const FMINOR_MIX_REACT = {
  drawSpeed: {
    source: "other",
    longLineShare: 0.28,
    slowMult: 0.48,
    fastMult: 1.85,
    dynamicsWeight: 0.52,
    follow: 0.14,
  },
  inkBreath: {
    source: "other",
    intensityIdle: 0.22,
    depthRangeIdle: [0.008, 0.022],
    depthRange: [0.018, 0.042],
    energy: 0.38,
    dynamicsWeight: 0.38,
    speedIdle: 0.45,
    speed: 1.15,
  },
};

/** Rahavia storm — dense instrumental passage (04:45 → 05:00). */
const FMINOR_RAHAVIA_STORM_EXIT = {
  from: 298,
  until: 300,
};

/** Shared living-cycle pool — rapid draw/erase loops, no pops. */
const FMINOR_RAHAVIA_STORM = {
  strategy: "living-cycle",
  draw: { at: 285, until: 298 },
  erase: FMINOR_RAHAVIA_STORM_EXIT,
  pool: {
    maxConcurrent: 5,
    cyclesPerUnit: [3, 5],
    finalClearSec: 0.75,
    durationRange: [0.32, 0.95],
    eraseDurationRange: [0.26, 0.72],
    holdRange: [0.04, 0.22],
    gapRange: [0.06, 0.28],
    staggerRange: [0.03, 0.14],
    minDuration: 0.2,
  },
  modulation: {
    drawSpeed: {
      ...FMINOR_MIX_REACT.drawSpeed,
      from: 285,
      until: 298,
      slowMult: 0.58,
      fastMult: 2.85,
      dynamicsWeight: 0.68,
      follow: 0.2,
    },
  },
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const FMINOR_SCORE = {
  style: FMINOR_STYLE,
  artboard: { x: 0, y: 0, w: 1962.4, h: 2005.15 },
  layers: [
    /* Layer 1 — fields (00:00 → 00:42, outskirts hatching; fade 01:18 → 01:48) */
    {
      file: "fminor_fields.svg",
      strategy: "organic-pool",
      draw: { at: 0, until: 42, naturalPace: true },
      erase: FMINOR_FIELDS_OPENING_EXIT,
      pool: FMINOR_FIELDS_POOL,
    },

    /* Layer 2 — street opening (00:38 → 01:35, paths into the city) */
    {
      id: "fminor_street_opening",
      file: "fminor_street.svg",
      ...FMINOR_EDGE,
      draw: { at: 38, until: 95 },
      erase: FMINOR_STREET_OPENING_EXIT,
      pool: {
        ...FMINOR_EDGE.pool,
        maxConcurrent: 2,
        durationRange: [3.2, 8.8],
        minDuration: 2.4,
        staggerRange: [0.85, 2.2],
        eraseDurationRange: [2.4, 6.2],
      },
      modulation: {
        drawSpeed: { ...FMINOR_MIX_REACT.drawSpeed, from: 38, until: 95 },
        inkBreath: { ...FMINOR_MIX_REACT.inkBreath, from: 38, until: 132 },
      },
    },

    /* Layer 2 echo — street offset copy (01:42 → 02:08, simultaneous with opening) */
    {
      id: "fminor_street_opening_echo",
      file: "fminor_street.svg",
      transform: { x: -428, y: 362, rotate: 53 },
      ...FMINOR_EDGE,
      draw: { at: 102, until: 128 },
      erase: FMINOR_STREET_OPENING_EXIT,
      pool: {
        ...FMINOR_EDGE.pool,
        maxConcurrent: 2,
        durationRange: [3.2, 8.8],
        minDuration: 2.4,
        staggerRange: [0.85, 2.2],
        eraseDurationRange: [2.4, 6.2],
      },
      modulation: {
        drawSpeed: { ...FMINOR_MIX_REACT.drawSpeed, from: 102, until: 128 },
        inkBreath: { ...FMINOR_MIX_REACT.inkBreath, from: 102, until: 132 },
      },
    },

    /* Layer 3 — house (01:25 → 02:25, first architectural fragment) */
    {
      file: "fminor_house.svg",
      ...FMINOR_EDGE_SLOW,
      draw: { at: 85, until: 145 },
      erase: FMINOR_HOUSE_MID_EXIT,
      pool: {
        ...FMINOR_EDGE_SLOW.pool,
        maxConcurrent: 2,
        durationRange: [3.4, 9.2],
        minDuration: 2.4,
        staggerRange: [0.95, 2.6],
        eraseDurationRange: [2.6, 6.8],
      },
      modulation: {
        drawSpeed: { ...FMINOR_MIX_REACT.drawSpeed, from: 85, until: 145 },
        inkBreath: { ...FMINOR_MIX_REACT.inkBreath, from: 85, until: 175 },
      },
    },

    /* Layer 4 — bezalel (02:05 → 03:05, arts quarter near the old city) */
    {
      file: "fminor_bezalel.svg",
      ...FMINOR_EDGE_SLOW,
      draw: { at: 125, until: 185, naturalPace: true },
      erase: FMINOR_BEZALEL_HANDOFF,
      pool: {
        ...FMINOR_EDGE_SLOW.pool,
        maxConcurrent: 2,
        durationRange: [3.6, 9.8],
        minDuration: 2.6,
        staggerRange: [1.0, 2.8],
        eraseDurationRange: [2.8, 7.2],
      },
      modulation: {
        drawSpeed: {
          ...FMINOR_MIX_REACT.drawSpeed,
          from: 125,
          until: 185,
          slowMult: 0.44,
          fastMult: 1.65,
        },
        inkBreath: { ...FMINOR_MIX_REACT.inkBreath, from: 125, until: 218 },
      },
    },

    /* Layer 5 — rahavia (02:55 → 03:55, residential walk) */
    {
      file: "fminor_rahavia.svg",
      ...FMINOR_EDGE,
      draw: { at: 175, until: 235 },
      erase: FMINOR_RAHAVIA_EXIT,
      pool: {
        ...FMINOR_EDGE.pool,
        maxConcurrent: 2,
        durationRange: [3.0, 8.0],
        minDuration: 2.1,
        staggerRange: [0.85, 2.35],
        eraseDurationRange: [2.4, 6.4],
      },
      modulation: {
        drawSpeed: { ...FMINOR_MIX_REACT.drawSpeed, from: 175, until: 235 },
        inkBreath: { ...FMINOR_MIX_REACT.inkBreath, from: 175, until: 258 },
      },
    },

    /* Layer 6 — cars (03:45 → 04:45, urban motion on the avenues) */
    {
      file: "fminor_cars.svg",
      strategy: "edge-stagger",
      draw: { at: 225, until: 285 },
      erase: FMINOR_CARS_EXIT,
      pool: FMINOR_CARS_POOL,
      modulation: {
        drawSpeed: {
          ...FMINOR_MIX_REACT.drawSpeed,
          from: 225,
          until: 285,
          slowMult: 0.52,
          fastMult: 2.05,
          dynamicsWeight: 0.58,
        },
        inkBreath: {
          ...FMINOR_MIX_REACT.inkBreath,
          from: 225,
          until: 308,
          energy: 0.42,
          depthRange: [0.022, 0.048],
        },
      },
    },

    /* Layer 2 return — street (04:25 → 05:25, second passage deeper in) */
    {
      id: "fminor_street_return",
      file: "fminor_street.svg",
      ...FMINOR_EDGE,
      draw: { at: 265, until: 325 },
      erase: FMINOR_STREET_RETURN_EXIT,
      pool: {
        ...FMINOR_EDGE.pool,
        maxConcurrent: 2,
        durationRange: [2.8, 7.6],
        minDuration: 2.0,
        staggerRange: [0.8, 2.0],
        eraseDurationRange: [2.2, 5.8],
      },
      modulation: {
        drawSpeed: { ...FMINOR_MIX_REACT.drawSpeed, from: 265, until: 325 },
        inkBreath: { ...FMINOR_MIX_REACT.inkBreath, from: 265, until: 348 },
      },
    },

    /* Rahavia storm — rotated duplicates (04:45 → 05:00, dense passage) */
    {
      id: "fminor_rahavia_storm_a",
      file: "fminor_rahavia.svg",
      ...FMINOR_RAHAVIA_STORM,
    },
    {
      id: "fminor_rahavia_storm_b",
      file: "fminor_rahavia.svg",
      transform: { rotate: 73 },
      ...FMINOR_RAHAVIA_STORM,
      draw: { at: 285, until: 298 },
    },
    {
      id: "fminor_rahavia_storm_c",
      file: "fminor_rahavia.svg",
      transform: { rotate: 146 },
      ...FMINOR_RAHAVIA_STORM,
      draw: { at: 286, until: 298 },
    },
    {
      id: "fminor_rahavia_storm_d",
      file: "fminor_rahavia.svg",
      transform: { rotate: -97 },
      ...FMINOR_RAHAVIA_STORM,
      draw: { at: 286, until: 298 },
    },
    {
      id: "fminor_rahavia_storm_e",
      file: "fminor_rahavia.svg",
      transform: { rotate: 52 },
      ...FMINOR_RAHAVIA_STORM,
      draw: { at: 287, until: 298 },
      pool: {
        ...FMINOR_RAHAVIA_STORM.pool,
        maxConcurrent: 6,
        staggerRange: [0.02, 0.1],
      },
    },
    {
      id: "fminor_rahavia_storm_f",
      file: "fminor_rahavia.svg",
      transform: { rotate: -168 },
      ...FMINOR_RAHAVIA_STORM,
      draw: { at: 287, until: 298 },
      pool: {
        ...FMINOR_RAHAVIA_STORM.pool,
        maxConcurrent: 6,
        staggerRange: [0.02, 0.1],
      },
    },

    /* Layer 7 — all (05:10 → 06:05, panoramic city silhouette) */
    {
      file: "fminor_all.svg",
      strategy: "long-first",
      draw: { at: 310, until: 365, naturalPace: true },
      erase: FMINOR_FINAL_EXIT,
      pool: {
        maxConcurrent: 1,
        speedRange: [0.88, 1.02],
        durationRange: [48, 54],
        minDuration: 46,
        staggerRange: [0.5, 1.4],
        eraseDurationRange: [1.2, 3.6],
      },
      modulation: {
        drawSpeed: {
          ...FMINOR_MIX_REACT.drawSpeed,
          from: 310,
          until: 365,
          slowMult: 0.42,
          fastMult: 1.55,
          dynamicsWeight: 0.48,
        },
        inkBreath: {
          ...FMINOR_MIX_REACT.inkBreath,
          from: 310,
          until: 378,
          energy: 0.32,
          depthRange: [0.012, 0.032],
        },
      },
    },

    /* Layer 1 return — fields coda (05:35 → 06:05, last breath of terrain) */
    {
      id: "fminor_fields_coda",
      file: "fminor_fields.svg",
      strategy: "organic-pool",
      draw: { at: 335, until: 365 },
      erase: FMINOR_FINAL_EXIT,
      pool: {
        ...FMINOR_FIELDS_POOL,
        maxConcurrent: 1,
        speedRange: [0.28, 0.48],
        durationRange: [2.2, 5.4],
        minDuration: 1.6,
        staggerRange: [0.75, 2.0],
        eraseDurationRange: FMINOR_FINAL_ERASE_RANGE,
      },
    },

    /* Layer 3 return — house coda (05:45 → 06:05, final structure) */
    {
      id: "fminor_house_coda",
      file: "fminor_house.svg",
      ...FMINOR_EDGE_SLOW,
      draw: { at: 345, until: 365 },
      erase: FMINOR_FINAL_EXIT,
      pool: {
        ...FMINOR_EDGE_SLOW.pool,
        maxConcurrent: 1,
        durationRange: [2.4, 6.8],
        minDuration: 1.8,
        staggerRange: [0.7, 1.85],
        eraseDurationRange: FMINOR_FINAL_ERASE_RANGE,
      },
      modulation: {
        inkBreath: {
          ...FMINOR_MIX_REACT.inkBreath,
          from: 345,
          until: 378,
          energy: 0.28,
          depthRange: [0.01, 0.028],
        },
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("fminorAudio");

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

  PlotterMachine.boot(mount, {
    baseDir: "../assets/svg/songs/fminor",
    score: FMINOR_SCORE,
    style: FMINOR_STYLE,
    transport: {
      audio,
      playButton: playBtn,
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: FMINOR_SPIN_DURATION_SEC,
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
      console.error("[fminor] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

});
