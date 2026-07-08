/* ============================================================
   AUTUMN NIGHTS (בלילות הסתיו) — Plotter Machine score
   ------------------------------------------------------------
   First-pass full-song choreography. Creative instructions
   only; the engine resolves unit schedules and pen phases.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = false;

/** Matches audio file duration (~4:39). */
const AUTUMNNIGHTS_SPIN_DURATION_SEC = 227;

const AUTUMNNIGHTS_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Mid-song handoff — street + kvish clear before the gallop. */
const AUTUMNNIGHTS_MID_CLEAR = {
  from: 118,
  until: 122,
};

/** Bridge exhale before the road + water return. */
const AUTUMNNIGHTS_BRIDGE_HANDOFF = {
  from: 200,
  until: 204,
};

/** Final synchronous clear — canvas empty before the record ends. */
const AUTUMNNIGHTS_FINAL_WIPE = {
  from: 273,
  until: 278.5,
};

const AUTUMNNIGHTS_FINAL_ERASE_RANGE = [0.04, 0.14];

/** Synchronized fast line-erase for opening road + kvish. */
const AUTUMNNIGHTS_ROAD_KVISH_CLEAR = {
  from: 52,
  until: 56,
};

const AUTUMNNIGHTS_ROAD_KVISH_ERASE_RANGE = [0.35, 0.75];

/** Quick paired line-erase for guitar-section place + high. */
const AUTUMNNIGHTS_PLACE_HIGH_CLEAR = {
  from: 130,
  until: 132,
};

const AUTUMNNIGHTS_PLACE_HIGH_ERASE_RANGE = [0.08, 0.22];

/** Guitar-reactive draw + subtle ink movement. */
const AUTUMNNIGHTS_GUITAR_REACT = {
  drawSpeed: {
    source: "guitar",
    longLineShare: 0.28,
    slowMult: 0.52,
    fastMult: 1.95,
    dynamicsWeight: 0.55,
    follow: 0.14,
  },
  inkBreath: {
    source: "guitar",
    intensityIdle: 0.22,
    depthRangeIdle: [0.008, 0.02],
    depthRange: [0.035, 0.07],
    energy: 0.32,
    dynamicsWeight: 0.4,
    speedIdle: 0.5,
    speed: 1.35,
  },
};

/** Wide field texture — sparse, slow organic pool. */
const AUTUMNNIGHTS_FIELDS_POOL = {
  maxConcurrent: 1,
  speedRange: [0.36, 0.58],
  durationRange: [2.6, 6.4],
  minDuration: 1.9,
  staggerRange: [0.55, 1.45],
  eraseDurationRange: [1.4, 3.6],
};

/** Wind / forest line hatching. */
const AUTUMNNIGHTS_LINES_POOL = {
  maxConcurrent: 2,
  speedRange: [0.4, 0.66],
  durationRange: [1.6, 4.2],
  minDuration: 1.1,
  staggerRange: [0.3, 0.95],
  eraseDurationRange: [0.75, 2.2],
};

/** Urban edge geometry — readable stagger. */
const AUTUMNNIGHTS_EDGE = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 3,
    durationRange: [1.3, 4.0],
    minDuration: 0.8,
    staggerRange: [0.28, 0.9],
    eraseDurationRange: [0.5, 1.45],
  },
};

/** Rhythmic gallop / motion — tighter pool. */
const AUTUMNNIGHTS_EDGE_FAST = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 4,
    durationRange: [0.7, 2.2],
    minDuration: 0.45,
    staggerRange: [0.14, 0.55],
    eraseDurationRange: [0.28, 0.95],
  },
};

/** Audio-reactive draw speed (main mix → "other" stem). */
const AUTUMNNIGHTS_VOCAL_SPEED = {
  drawSpeed: {
    source: "other",
    longLineShare: 0.32,
    slowMult: 0.44,
    fastMult: 2.2,
    dynamicsWeight: 0.6,
    follow: 0.15,
  },
};

/** Subtle water tremble on completed ink. */
const AUTUMNNIGHTS_WATER_TREMBLE = {
  tremble: {
    source: "other",
    maxPx: 1.35,
    minPx: 0.04,
    freq1: 38,
    freq2: 53,
    freq3: 24,
  },
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const AUTUMNNIGHTS_SCORE = {
  style: AUTUMNNIGHTS_STYLE,
  artboard: { x: 0, y: 0, w: 2012.54, h: 1984.85 },
  layers: [
    /* Layer 3 — place (00:00 → 00:24, establish atmosphere; fade 00:25 → 00:41) */
    {
      file: "autumnnights_place.svg",
      ...AUTUMNNIGHTS_EDGE,
      draw: { at: 0, until: 24, naturalPace: true },
      erase: { from: 25, until: 41 },
      pool: {
        maxConcurrent: 2,
        durationRange: [2.4, 5.8],
        minDuration: 1.6,
        staggerRange: [0.55, 1.35],
        eraseDurationRange: [2.2, 5.5],
      },
    },

    /* Layer 9 — road opening (00:24 → 00:41; line-erase 00:52 → 00:56) */
    {
      id: "autumnnights_road_opening",
      file: "autumnnights_road.svg",
      strategy: "long-first",
      draw: { at: 24, until: 41 },
      erase: AUTUMNNIGHTS_ROAD_KVISH_CLEAR,
      pool: {
        maxConcurrent: 3,
        durationRange: [3.5, 6],
        minDuration: 2.5,
        staggerRange: [0.08, 0.25],
        eraseDurationRange: AUTUMNNIGHTS_ROAD_KVISH_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: {
          ...AUTUMNNIGHTS_VOCAL_SPEED.drawSpeed,
          from: 24,
          until: 41,
          slowMult: 0.78,
          fastMult: 1.55,
          dynamicsWeight: 0.42,
        },
      },
    },

    /* Layer 6 — kvish opening (over road once road completes; shared erase) */
    {
      id: "autumnnights_kvish_opening",
      file: "autumnnights_kvish.svg",
      ...AUTUMNNIGHTS_EDGE,
      draw: { at: 41, until: 51 },
      erase: AUTUMNNIGHTS_ROAD_KVISH_CLEAR,
      pool: {
        ...AUTUMNNIGHTS_EDGE.pool,
        maxConcurrent: 3,
        durationRange: [1.0, 2.8],
        minDuration: 0.65,
        staggerRange: [0.18, 0.55],
        eraseDurationRange: AUTUMNNIGHTS_ROAD_KVISH_ERASE_RANGE,
      },
    },

    /* Layer 4 — wave (00:56 → 01:10 draw; line-erase 01:10 → 01:12) */
    {
      file: "autumnnights_wave.svg",
      ...AUTUMNNIGHTS_EDGE_FAST,
      draw: { at: 56, until: 70 },
      erase: { from: 70, until: 72 },
      pool: {
        ...AUTUMNNIGHTS_EDGE_FAST.pool,
        maxConcurrent: 3,
        durationRange: [1.05, 2.9],
        minDuration: 0.65,
        staggerRange: [0.22, 0.65],
        eraseDurationRange: [0.08, 0.22],
      },
      modulation: {
        ...AUTUMNNIGHTS_WATER_TREMBLE,
        tremble: { ...AUTUMNNIGHTS_WATER_TREMBLE.tremble, from: 56, until: 72 },
        drawSpeed: {
          ...AUTUMNNIGHTS_VOCAL_SPEED.drawSpeed,
          from: 56,
          until: 70,
          slowMult: 0.62,
          fastMult: 2.05,
          dynamicsWeight: 0.65,
          follow: 0.17,
        },
      },
    },

    /* Layer 7 — high (01:12 → 01:18 draw; line-erase 01:18 → 01:24) */
    {
      id: "autumnnights_high_opening",
      file: "autumnnights_high.svg",
      ...AUTUMNNIGHTS_EDGE,
      draw: { at: 72, until: 78, naturalPace: true },
      erase: { from: 78, until: 84 },
      pool: {
        maxConcurrent: 2,
        durationRange: [1.6, 4.2],
        minDuration: 1.1,
        staggerRange: [0.4, 1.05],
        eraseDurationRange: [0.35, 0.75],
      },
    },

    /* Layer 8 — pesel (01:26 → 01:37; slow line-erase 01:37 → 01:40) */
    {
      id: "autumnnights_pesel_middle",
      file: "autumnnights_pesel.svg",
      strategy: "long-first",
      draw: { at: 86, until: 97, naturalPace: true },
      erase: { from: 97, until: 100 },
      pool: {
        maxConcurrent: 1,
        durationRange: [4.0, 9.0],
        minDuration: 3.0,
        staggerRange: [0.55, 1.4],
        eraseDurationRange: [1.1, 2.6],
      },
    },

    /* Layer 2 — lines gs (01:41 → finish; quick out, then place enters) */
    {
      id: "autumnnights_lines_guitar",
      file: "autumnnights_lines.svg",
      strategy: "organic-pool",
      draw: { at: 101, until: 108 },
      erase: { from: 108, until: 109 },
      pool: {
        ...AUTUMNNIGHTS_LINES_POOL,
        eraseDurationRange: [0.12, 0.32],
      },
    },

    /* Layer 3 — place guitar (after lines; guitar rhythm until 01:57:00) */
    {
      id: "autumnnights_place_guitar",
      file: "autumnnights_place.svg",
      ...AUTUMNNIGHTS_EDGE,
      draw: { at: 109, until: 116 },
      erase: AUTUMNNIGHTS_PLACE_HIGH_CLEAR,
      pool: {
        ...AUTUMNNIGHTS_EDGE.pool,
        eraseDurationRange: AUTUMNNIGHTS_PLACE_HIGH_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: {
          ...AUTUMNNIGHTS_GUITAR_REACT.drawSpeed,
          from: 109,
          until: 117,
        },
        inkBreath: {
          ...AUTUMNNIGHTS_GUITAR_REACT.inkBreath,
          from: 109,
          until: 130,
        },
      },
    },

    /* Layer 7 — high guitar (01:57 on place; shared quick erase 02:10 → 02:12) */
    {
      id: "autumnnights_high_guitar",
      file: "autumnnights_high.svg",
      ...AUTUMNNIGHTS_EDGE_FAST,
      draw: { at: 117, until: 128 },
      erase: AUTUMNNIGHTS_PLACE_HIGH_CLEAR,
      pool: {
        ...AUTUMNNIGHTS_EDGE_FAST.pool,
        eraseDurationRange: AUTUMNNIGHTS_PLACE_HIGH_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: {
          ...AUTUMNNIGHTS_GUITAR_REACT.drawSpeed,
          from: 117,
          until: 130,
        },
        inkBreath: {
          ...AUTUMNNIGHTS_GUITAR_REACT.inkBreath,
          from: 117,
          until: 130,
        },
      },
    },

    /* Layer 2 return — lines (02:38 → 02:58, bridge texture) */
    {
      id: "autumnnights_lines_return",
      file: "autumnnights_lines.svg",
      strategy: "organic-pool",
      draw: { at: 158, until: 178 },
      erase: { from: 184, until: 194 },
      pool: AUTUMNNIGHTS_LINES_POOL,
    },

    /* Layer 1 return — fields (02:54 → 03:16, autumn landscape again) */
    {
      id: "autumnnights_fields_return",
      file: "autumnnights_fields.svg",
      strategy: "organic-pool",
      draw: { at: 174, until: 196 },
      erase: AUTUMNNIGHTS_BRIDGE_HANDOFF,
      pool: AUTUMNNIGHTS_FIELDS_POOL,
    },

    /* Layer 9 — road (03:18 → 03:34, bare road — three long strokes) */
    {
      file: "autumnnights_road.svg",
      strategy: "long-first",
      draw: { at: 198, until: 214, naturalPace: true },
      erase: { from: 218, until: 224 },
      pool: {
        maxConcurrent: 1,
        speedRange: [0.88, 1.02],
        durationRange: [14, 16],
        minDuration: 13,
        staggerRange: [0.4, 1.0],
        eraseDurationRange: [0.35, 0.85],
      },
    },

    /* Layer 4 return — wave (03:32 → 03:52, water motif reprise) */
    {
      id: "autumnnights_wave_return",
      file: "autumnnights_wave.svg",
      ...AUTUMNNIGHTS_EDGE,
      draw: { at: 212, until: 232 },
      erase: { from: 236, until: 244 },
      modulation: {
        ...AUTUMNNIGHTS_WATER_TREMBLE,
        tremble: { ...AUTUMNNIGHTS_WATER_TREMBLE.tremble, from: 212, until: 244 },
      },
    },

    /* Layer 5 return — street (03:50 → 04:10, tired walker) */
    {
      id: "autumnnights_street_return",
      file: "autumnnights_street.svg",
      ...AUTUMNNIGHTS_EDGE,
      draw: { at: 230, until: 250 },
      erase: { from: 254, until: 262 },
    },

    /* Layer 3 return — place (04:06 → 04:26, memory of place) */
    {
      id: "autumnnights_place_return",
      file: "autumnnights_place.svg",
      ...AUTUMNNIGHTS_EDGE,
      draw: { at: 246, until: 266 },
      erase: AUTUMNNIGHTS_FINAL_WIPE,
      pool: {
        ...AUTUMNNIGHTS_EDGE.pool,
        eraseDurationRange: AUTUMNNIGHTS_FINAL_ERASE_RANGE,
      },
    },

    /* Layer 7 return — high (04:08 → 04:30, final gallop) */
    {
      id: "autumnnights_high_return",
      file: "autumnnights_high.svg",
      ...AUTUMNNIGHTS_EDGE_FAST,
      draw: { at: 248, until: 270 },
      erase: AUTUMNNIGHTS_FINAL_WIPE,
      pool: {
        ...AUTUMNNIGHTS_EDGE_FAST.pool,
        eraseDurationRange: AUTUMNNIGHTS_FINAL_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: {
          ...AUTUMNNIGHTS_VOCAL_SPEED.drawSpeed,
          from: 248,
          until: 270,
        },
      },
    },

    /* Layer 8 return — pesel coda (04:18 → 04:34, tremor through the flesh) */
    {
      id: "autumnnights_pesel_coda",
      file: "autumnnights_pesel.svg",
      strategy: "long-first",
      draw: { at: 258, until: 274, naturalPace: true },
      erase: AUTUMNNIGHTS_FINAL_WIPE,
      pool: {
        maxConcurrent: 1,
        durationRange: [3.8, 8.6],
        minDuration: 2.6,
        staggerRange: [0.85, 2.1],
        eraseDurationRange: AUTUMNNIGHTS_FINAL_ERASE_RANGE,
      },
    },

    /* Layer 2 coda — lines (04:28 → end, last breath of ink) */
    {
      id: "autumnnights_lines_coda",
      file: "autumnnights_lines.svg",
      strategy: "organic-pool",
      draw: { at: 266, until: 277 },
      erase: AUTUMNNIGHTS_FINAL_WIPE,
      pool: {
        ...AUTUMNNIGHTS_LINES_POOL,
        maxConcurrent: 1,
        staggerRange: [0.55, 1.2],
        eraseDurationRange: AUTUMNNIGHTS_FINAL_ERASE_RANGE,
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("autumnnightsAudio");

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
    baseDir: "../assets/svg/songs/autumnnights",
    score: AUTUMNNIGHTS_SCORE,
    style: AUTUMNNIGHTS_STYLE,
    transport: {
      audio,
      playButton: playBtn,
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: AUTUMNNIGHTS_SPIN_DURATION_SEC,
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
      console.error("[autumnnights] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

});
