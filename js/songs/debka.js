/* ============================================================
   DEBKA (דבקה) — Plotter Machine score
   ------------------------------------------------------------
   Phase 1 choreography. Creative instructions only; the
   engine resolves timing, strategies, unit schedules, and
   pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = true;

/** Matches audio file duration (~6:16). */
const DEBKA_SPIN_DURATION_SEC = 376;

const DEBKA_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Water fades gradually while the opening bus draws (00:24 → 00:51). */
const DEBKA_WATER_HANDOFF = {
  from: 24,
  until: 51,
};

/** Opening bus clears completely by 00:51:00. */
const DEBKA_BUS_OPENING_EXIT = {
  from: 49,
  until: 51,
};

/** Layers 3 & 4 — shared natural fade (01:40 → 01:45). */
const DEBKA_LAYER3_4_HANDOFF = {
  from: 100,
  until: 105,
};

/** Trees clear before the long Layer 4 passage (02:04:00). */
const DEBKA_TREES_CLEAR = {
  from: 122,
  until: 126,
};

/** Flute lines exit before the tree section (01:52:00). */
const DEBKA_LINES_EXIT = {
  from: 110,
  until: 112,
};

/** Layer 10 (high) clears with the relay section (02:57:00). */
const DEBKA_LINES_RELAY_EXIT = {
  from: 176,
  until: 177,
};

/** House — symmetrical draw/erase cycle ending at 03:08:00. */
const DEBKA_HOUSE_EXIT = {
  until: 188,
  mirrorDraw: true,
};

/** Shared artboard center for road-inward passes. */
const DEBKA_ROAD_CENTER = { x: 960.3, y: 967.33 };

/** Gentle exit — enough room for every stroke to finish erasing. */
const DEBKA_SOFT_EXIT = (from, until) => ({ from, until });

/** Main-mix draw-speed reaction (water, opening bus). */
const DEBKA_MIX_REACT = {
  drawSpeed: {
    source: "other",
    longLineShare: 0.32,
    slowMult: 0.42,
    fastMult: 2.35,
    dynamicsWeight: 0.62,
    follow: 0.16,
  },
};

/** Flute draw-speed + tremble (lines passages). */
const DEBKA_FLUTE_REACT = {
  tremble: {
    source: "flute",
    maxPx: 1.5,
    minPx: 0.05,
    freq1: 44,
    freq2: 61,
    freq3: 27,
  },
  drawSpeed: {
    source: "flute",
    longLineShare: 0.32,
    slowMult: 0.42,
    fastMult: 2.35,
    dynamicsWeight: 0.62,
    follow: 0.16,
  },
};

/** Electric-guitar sync (03:09 → 03:41). */
const DEBKA_GUITAR_REACT = {
  drawSpeed: {
    source: "guitar",
    longLineShare: 0.3,
    slowMult: 0.46,
    fastMult: 2.25,
    dynamicsWeight: 0.6,
    follow: 0.18,
  },
  tremble: {
    source: "guitar",
    maxPx: 1.85,
    minPx: 0.06,
    freq1: 48,
    freq2: 67,
    freq3: 31,
    energy: 1.1,
  },
  inkBreath: {
    source: "guitar",
    energy: 0.28,
    intensityIdle: 0.2,
    depthRange: [0.03, 0.065],
    speed: 1.45,
  },
};

/** Bass-reactive pulse for dense layered sections. */
const DEBKA_BASS_REACT = {
  inkBreath: {
    source: "bass",
    energy: 0.58,
    intensityIdle: 0.24,
    depthRange: [0.04, 0.09],
    speed: 1.25,
    dynamicsWeight: 0.52,
  },
  drawSpeed: {
    source: "bass",
    longLineShare: 0.28,
    slowMult: 0.52,
    fastMult: 1.95,
    dynamicsWeight: 0.52,
    follow: 0.15,
  },
};

/** Piano-rhythmic burst (03:46 onward). */
const DEBKA_PIANO_REACT = {
  drawSpeed: {
    source: "piano",
    longLineShare: 0.38,
    slowMult: 0.72,
    fastMult: 3.75,
    dynamicsWeight: 0.7,
    follow: 0.24,
    energy: 1.2,
  },
};

/** Fast edge pool for piano-locked plotting. */
const DEBKA_PIANO_FAST = {
  maxConcurrent: 8,
  durationRange: [0.08, 0.32],
  minDuration: 0.06,
  staggerRange: [0.02, 0.09],
  eraseDurationRange: [0.08, 0.28],
};

/** Dense overlapping pool for chaotic coda passages (03:46 → 03:58). */
const DEBKA_CHAOS_DENSE = {
  maxConcurrent: 7,
  durationRange: [0.12, 0.45],
  minDuration: 0.07,
  staggerRange: [0.02, 0.1],
  eraseDurationRange: [0.1, 0.3],
};

/** Piano storm peak — full stack on screen (03:58:00). */
const DEBKA_PIANO_PEAK = 238;

/** Cascading independent fade after the piano peak (03:58 → 04:15). */
const DEBKA_PIANO_FADE = (from, until) => ({ from, until });

/** Guitar coda — architectural house chaos (04:15 → 04:30). */
const DEBKA_GUITAR_CODA = { from: 255, until: 270 };

/** Shared exit for all guitar-coda house layers (04:28 → 04:30). */
const DEBKA_GUITAR_CODA_ERASE = DEBKA_SOFT_EXIT(268, 270);

/** Guitar coda activity boost (04:20). */
const DEBKA_GUITAR_CODA_BOOST = 260;

/** Unified bus-drum storm exit (05:02 → 05:06). */
const DEBKA_BUS_UNIFIED_ERASE = DEBKA_SOFT_EXIT(302, 306);

/** Condensed coda pacing boundary (05:21). */
const DEBKA_MID_CODA_FAST_UNTIL = 321;

/** Final lines passage (06:08 → end; erase unchanged at 06:00–06:05). */
const DEBKA_LINES_FINALE_START = 368;
const DEBKA_LINES_FINALE_ERASE = DEBKA_SOFT_EXIT(360, 365);

/** Fast pool for the condensed 05:06 → 05:21 stretch. */
const DEBKA_MID_CODA_FAST = {
  maxConcurrent: 5,
  durationRange: [0.22, 0.75],
  minDuration: 0.14,
  staggerRange: [0.025, 0.1],
  eraseDurationRange: [0.18, 0.5],
};

/** House/building burst pool for the guitar coda. */
const DEBKA_HOUSE_CODA_BURST = {
  maxConcurrent: 14,
  durationRange: [0.06, 0.26],
  minDuration: 0.05,
  staggerRange: [0.008, 0.045],
  eraseDurationRange: [0.05, 0.18],
};

/**
 * Samba-style drum-circle field — many circles drawing, flashing,
 * and erasing in rapid overlap (04:45 → 05:02).
 */
const DEBKA_DRUM_BURST = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 20,
    durationRange: [0.04, 0.22],
    minDuration: 0.03,
    staggerRange: [0.004, 0.028],
    eraseDurationRange: [0.03, 0.12],
  },
};

/** Drum-stem reactive pulse (analysis only; listener hears the mix). */
const DEBKA_DRUM_REACT = {
  inkBreath: {
    source: "drums",
    intensityIdle: 0.38,
    depthRangeIdle: [0.025, 0.05],
    depthRange: [0.09, 0.16],
    energy: 0.72,
    dynamicsWeight: 0.58,
    speedIdle: 0.9,
    speed: 2.6,
    freq1: 0.44,
    freq2: 0.62,
    freq3: 0.36,
    freqSpread: 0.24,
    travel: 2.2,
  },
  drawSpeed: {
    source: "drums",
    longLineShare: 0.18,
    slowMult: 0.58,
    fastMult: 3.8,
    dynamicsWeight: 0.68,
    follow: 0.24,
    energy: 1.35,
  },
};

/**
 * Bus-stop relay — one circle at a time; each stroke waits for
 * the next before disappearing (02:22 → 02:57).
 */
const DEBKA_BUS_RELAY = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 1,
    durationRange: [0.1, 0.3],
    minDuration: 0.08,
    staggerRange: [0.05, 0.18],
    eraseDurationRange: [0.04, 0.14],
  },
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const DEBKA_SCORE = {
  style: DEBKA_STYLE,
  artboard: { x: 0, y: 0, w: 1920.6, h: 1934.66 },
  layers: [
    /* Layer 1 — water (00:00 → 00:24 full draw; slow fade 00:24 → 00:51) */
    {
      file: "debka_water.svg",
      strategy: "organic-pool",
      draw: { at: 0, until: 24 },
      erase: DEBKA_WATER_HANDOFF,
      pool: {
        maxConcurrent: 2,
        speedRange: [0.44, 0.72],
        durationRange: [2.6, 6.2],
        minDuration: 1.9,
        staggerRange: [0.4, 1.25],
        eraseDurationRange: [0.45, 1.6],
      },
      modulation: {
        drawSpeed: { ...DEBKA_MIX_REACT.drawSpeed, from: 0, until: 24 },
      },
    },

    /* Layer 2 — bus opening (00:24 → 00:51 draw; quick erase 00:49 → 00:51) */
    {
      id: "debka_bus_opening",
      file: "debka_bus.svg",
      strategy: "edge-stagger",
      draw: { at: 24, until: 51 },
      erase: DEBKA_BUS_OPENING_EXIT,
      pool: {
        maxConcurrent: 3,
        durationRange: [0.85, 2.5],
        minDuration: 0.55,
        staggerRange: [0.15, 0.8],
        eraseDurationRange: [0.35, 0.95],
      },
      modulation: {
        drawSpeed: { ...DEBKA_MIX_REACT.drawSpeed, from: 24, until: 51 },
      },
    },

    /* Layer 3 (00:52:40 → 01:40; shared erase with Layer 4) */
    {
      id: "debka_layer3",
      file: "debka_layer3.svg",
      allowViewBoxMismatch: true,
      strategy: "organic-pool",
      draw: { at: 52.4, until: 100, naturalPace: true },
      erase: DEBKA_LAYER3_4_HANDOFF,
      pool: {
        maxConcurrent: 2,
        speedRange: [0.44, 0.72],
        durationRange: [2.6, 6.2],
        minDuration: 1.9,
        staggerRange: [0.4, 1.25],
        eraseDurationRange: [1.4, 3.2],
      },
      modulation: {
        drawSpeed: { ...DEBKA_MIX_REACT.drawSpeed, from: 52.4, until: 100 },
      },
    },

    /* Layer 4 (01:16 → 01:40 over Layer 3; shared erase) */
    {
      id: "debka_layer4",
      file: "debka_layer4.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 76, until: 98 },
      erase: DEBKA_LAYER3_4_HANDOFF,
      pool: {
        maxConcurrent: 6,
        durationRange: [0.75, 2.1],
        minDuration: 0.45,
        staggerRange: [0.06, 0.28],
        eraseDurationRange: [1.4, 3.2],
      },
      modulation: {
        drawSpeed: { ...DEBKA_MIX_REACT.drawSpeed, from: 76, until: 98 },
      },
    },

    /* Layer 5 — lines / flute (01:46 → 01:52, unhurried draw) */
    {
      file: "debka_lines.svg",
      strategy: "edge-stagger",
      draw: { at: 106, until: 109.5 },
      erase: DEBKA_LINES_EXIT,
      pool: {
        maxConcurrent: 3,
        durationRange: [0.85, 2.2],
        minDuration: 0.55,
        staggerRange: [0.15, 0.55],
        eraseDurationRange: [0.55, 1.35],
      },
      modulation: {
        tremble: { ...DEBKA_FLUTE_REACT.tremble, from: 106, until: 112 },
        drawSpeed: { ...DEBKA_FLUTE_REACT.drawSpeed, from: 106, until: 109.5 },
      },
    },

    /* Layer 6 — trees (01:53 → 01:58, hold under Layer 4) */
    {
      file: "debka_trees.svg",
      strategy: "tree-breath",
      draw: { at: 113, until: 118 },
      erase: DEBKA_TREES_CLEAR,
      pool: {
        maxConcurrent: 3,
        durationRange: [3.5, 7.5],
        minDuration: 2.5,
        staggerRange: [0.8, 2.0],
        eraseDurationRange: [0.55, 1.35],
      },
    },

    /* Layer 4 living passage (01:58 → 02:22, playful redraw) */
    {
      id: "debka_layer4_living",
      file: "debka_layer4.svg",
      allowViewBoxMismatch: true,
      strategy: "living-cycle",
      draw: { at: 118, until: 142 },
      erase: { until: 142 },
      pool: {
        maxConcurrent: 4,
        cyclesPerUnit: [2, 3],
        finalClearSec: 2.5,
        durationRange: [2.2, 4.8],
        eraseDurationRange: [1.8, 3.4],
        holdRange: [0.5, 1.4],
        gapRange: [0.6, 2.0],
        staggerRange: [0.35, 1.1],
        minDuration: 1.6,
      },
      modulation: {
        drawSpeed: { ...DEBKA_MIX_REACT.drawSpeed, from: 118, until: 139 },
      },
    },

    /* Layer 9 — bus relay (02:22 → 02:57) */
    {
      id: "debka_bus_relay",
      file: "debka_bus.svg",
      ...DEBKA_BUS_RELAY,
      draw: { at: 142, until: 177 },
      erase: { from: 142, until: 177 },
    },

    /* Layer 7 — home over bus relay (02:22 → 02:57) */
    {
      file: "debka_home.svg",
      strategy: "edge-stagger",
      draw: { at: 142, until: 177 },
      erase: DEBKA_LINES_RELAY_EXIT,
      pool: {
        maxConcurrent: 3,
        durationRange: [1.2, 3.4],
        minDuration: 0.75,
        staggerRange: [0.25, 0.85],
        eraseDurationRange: [0.08, 0.22],
      },
    },

    /* Layer 10 — high over bus relay (02:33 → 02:57) */
    {
      id: "debka_high",
      file: "debka_high.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 153, until: 177 },
      erase: DEBKA_LINES_RELAY_EXIT,
      pool: {
        maxConcurrent: 4,
        durationRange: [0.55, 1.65],
        minDuration: 0.35,
        staggerRange: [0.1, 0.45],
        eraseDurationRange: [0.08, 0.22],
      },
      modulation: {
        drawSpeed: { ...DEBKA_FLUTE_REACT.drawSpeed, from: 153, until: 177 },
      },
    },

    /* Layer 11 — house (02:57 → 03:08, burst draw then mirrored erase) */
    {
      file: "debka_house.svg",
      strategy: "burst-settle",
      draw: { at: 177, until: 182.5 },
      erase: DEBKA_HOUSE_EXIT,
      pool: {
        burstUntil: 178.2,
        burstShare: 0.55,
        burst: {
          maxConcurrent: 8,
          durationRange: [0.12, 0.42],
          minDuration: 0.1,
          staggerRange: [0.02, 0.1],
        },
        settle: {
          maxConcurrent: 4,
          durationRange: [0.45, 1.4],
          minDuration: 0.3,
          staggerRange: [0.08, 0.28],
        },
      },
    },

    /* ── Coda (03:08 → end) ─────────────────────────────────── */

    /* High — electric guitar sync (03:09 → 03:41) */
    {
      id: "debka_high_guitar",
      file: "debka_high.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 189, until: 218 },
      erase: DEBKA_SOFT_EXIT(217, 221),
      pool: {
        maxConcurrent: 4,
        durationRange: [0.65, 1.85],
        minDuration: 0.4,
        staggerRange: [0.12, 0.48],
        eraseDurationRange: [0.65, 1.45],
      },
      modulation: {
        tremble: { ...DEBKA_GUITAR_REACT.tremble, from: 189, until: 221 },
        drawSpeed: { ...DEBKA_GUITAR_REACT.drawSpeed, from: 189, until: 218 },
        inkBreath: { ...DEBKA_GUITAR_REACT.inkBreath, from: 189, until: 221 },
      },
    },

    /* House — bass pulse under guitar (03:10 → 03:40) */
    {
      id: "debka_house_guitar",
      file: "debka_house.svg",
      strategy: "edge-stagger",
      draw: { at: 190, until: 216 },
      erase: DEBKA_SOFT_EXIT(217, 222),
      pool: {
        maxConcurrent: 4,
        durationRange: [1.0, 2.8],
        minDuration: 0.65,
        staggerRange: [0.2, 0.75],
        eraseDurationRange: [0.65, 1.45],
      },
      modulation: {
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 190, until: 222 },
        drawSpeed: { ...DEBKA_BASS_REACT.drawSpeed, from: 190, until: 216 },
      },
    },

    /* Home — bass squares (03:12 → 03:41) */
    {
      id: "debka_home_guitar",
      file: "debka_home.svg",
      strategy: "edge-stagger",
      draw: { at: 192, until: 218 },
      erase: DEBKA_SOFT_EXIT(217, 222),
      pool: {
        maxConcurrent: 3,
        durationRange: [0.9, 2.4],
        minDuration: 0.55,
        staggerRange: [0.18, 0.65],
        eraseDurationRange: [0.6, 1.35],
      },
      modulation: {
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 192, until: 222 },
      },
    },

    /* Other — bass graphic accents (03:09 → 03:41) */
    {
      id: "debka_other_guitar",
      file: "debka_other.svg",
      strategy: "edge-stagger",
      draw: { at: 189, until: 217 },
      erase: DEBKA_SOFT_EXIT(217, 222),
      pool: {
        maxConcurrent: 3,
        durationRange: [0.75, 2.1],
        minDuration: 0.45,
        staggerRange: [0.12, 0.55],
        eraseDurationRange: [0.55, 1.25],
      },
      modulation: {
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 189, until: 222 },
        drawSpeed: { ...DEBKA_BASS_REACT.drawSpeed, from: 189, until: 217 },
      },
    },

    /* Bus — bass relay under guitar chaos (03:14 → 03:40) */
    {
      id: "debka_bus_guitar",
      file: "debka_bus.svg",
      ...DEBKA_BUS_RELAY,
      draw: { at: 194, until: 218 },
      erase: { from: 194, until: 222 },
      pool: {
        ...DEBKA_BUS_RELAY.pool,
        eraseDurationRange: [0.35, 0.85],
      },
      modulation: {
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 194, until: 222 },
      },
    },

    /* Road — handoff out of guitar section (03:18 → 03:44) */
    {
      id: "debka_road_guitar",
      file: "debka_road.svg",
      strategy: "road-inward",
      center: DEBKA_ROAD_CENTER,
      draw: { at: 198, until: 220 },
      erase: DEBKA_SOFT_EXIT(220, 225),
      pool: {
        maxConcurrent: 3,
        durationRange: [1.8, 4.5],
        minDuration: 1.0,
        staggerRange: [0.3, 1.0],
        eraseDurationRange: [0.65, 1.45],
      },
      modulation: {
        drawSpeed: { ...DEBKA_GUITAR_REACT.drawSpeed, from: 198, until: 220 },
      },
    },

    /* Layer 4 — piano burst (03:46 → 03:58 peak; cascade fade 03:58 → 04:09) */
    {
      id: "debka_layer4_piano",
      file: "debka_layer4.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 226, until: DEBKA_PIANO_PEAK },
      erase: DEBKA_PIANO_FADE(239, 249),
      pool: {
        ...DEBKA_PIANO_FAST,
        eraseDurationRange: [0.35, 1.05],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 226, until: DEBKA_PIANO_PEAK },
      },
    },

    /* Layer 3 — piano undercurrent (03:46 → 03:58; fade 03:58 → 04:07) */
    {
      id: "debka_layer3_piano",
      file: "debka_layer3.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 226, until: DEBKA_PIANO_PEAK },
      erase: DEBKA_PIANO_FADE(238, 247),
      pool: {
        ...DEBKA_CHAOS_DENSE,
        eraseDurationRange: [0.45, 1.25],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 226, until: DEBKA_PIANO_PEAK },
      },
    },

    /* House — piano staccato (03:46 → 03:58; first to peel off 03:58 → 04:04) */
    {
      id: "debka_house_piano",
      file: "debka_house.svg",
      strategy: "burst-settle",
      draw: { at: 226, until: DEBKA_PIANO_PEAK },
      erase: DEBKA_PIANO_FADE(238, 244),
      pool: {
        burstUntil: 228.5,
        burstShare: 0.68,
        burst: {
          maxConcurrent: 10,
          durationRange: [0.06, 0.24],
          minDuration: 0.05,
          staggerRange: [0.01, 0.06],
        },
        settle: {
          maxConcurrent: 6,
          durationRange: [0.18, 0.62],
          minDuration: 0.12,
          staggerRange: [0.03, 0.12],
        },
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 226, until: DEBKA_PIANO_PEAK },
      },
    },

    /* Home — bass squares under piano chaos (03:47 → 03:58; fade 04:01 → 04:11) */
    {
      id: "debka_home_piano",
      file: "debka_home.svg",
      strategy: "edge-stagger",
      draw: { at: 227, until: DEBKA_PIANO_PEAK },
      erase: DEBKA_PIANO_FADE(241, 251),
      pool: {
        ...DEBKA_CHAOS_DENSE,
        eraseDurationRange: [0.5, 1.35],
      },
      modulation: {
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 227, until: 251 },
        drawSpeed: { ...DEBKA_BASS_REACT.drawSpeed, from: 227, until: DEBKA_PIANO_PEAK },
      },
    },

    /* High — piano + bass overlap (03:46 → 03:58; fade 04:02 → 04:12) */
    {
      id: "debka_high_piano",
      file: "debka_high.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 226, until: DEBKA_PIANO_PEAK },
      erase: DEBKA_PIANO_FADE(242, 252),
      pool: {
        ...DEBKA_CHAOS_DENSE,
        eraseDurationRange: [0.45, 1.2],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 226, until: DEBKA_PIANO_PEAK },
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 228, until: 252 },
      },
    },

    /* Other — graphic accents in the piano storm (03:48 → 03:58; fade 04:03 → 04:13) */
    {
      id: "debka_other_piano",
      file: "debka_other.svg",
      strategy: "edge-stagger",
      draw: { at: 228, until: DEBKA_PIANO_PEAK },
      erase: DEBKA_PIANO_FADE(243, 253),
      pool: {
        ...DEBKA_CHAOS_DENSE,
        eraseDurationRange: [0.4, 1.15],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 228, until: DEBKA_PIANO_PEAK },
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 228, until: 253 },
      },
    },

    /* Lines — piano rhythm (03:48 → 03:58; fade 04:04 → 04:14) */
    {
      id: "debka_lines_piano",
      file: "debka_lines.svg",
      strategy: "edge-stagger",
      draw: { at: 228, until: 237 },
      erase: DEBKA_PIANO_FADE(244, 254),
      pool: {
        ...DEBKA_PIANO_FAST,
        eraseDurationRange: [0.35, 1.0],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 228, until: 237 },
      },
    },

    /* Road — inward passes through the piano density (03:50 → 03:58; fade 04:05 → 04:14) */
    {
      id: "debka_road_piano",
      file: "debka_road.svg",
      strategy: "road-inward",
      center: DEBKA_ROAD_CENTER,
      draw: { at: 230, until: 237 },
      erase: DEBKA_PIANO_FADE(245, 254),
      pool: {
        maxConcurrent: 5,
        durationRange: [0.9, 2.6],
        minDuration: 0.55,
        staggerRange: [0.08, 0.35],
        eraseDurationRange: [0.45, 1.15],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 230, until: 237 },
      },
    },

    /* Trees — quick foliage burst in the piano storm (03:52 → 03:58; fade 04:00 → 04:10) */
    {
      id: "debka_trees_piano",
      file: "debka_trees.svg",
      strategy: "edge-stagger",
      draw: { at: 232, until: DEBKA_PIANO_PEAK },
      erase: DEBKA_PIANO_FADE(240, 250),
      pool: {
        maxConcurrent: 5,
        durationRange: [0.35, 1.15],
        minDuration: 0.22,
        staggerRange: [0.04, 0.18],
        eraseDurationRange: [0.4, 1.05],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 232, until: DEBKA_PIANO_PEAK },
      },
    },

    /* Bus — dense circle flash (03:50 → 03:58; last to fade 04:06 → 04:15) */
    {
      id: "debka_bus_piano",
      file: "debka_bus.svg",
      strategy: "edge-stagger",
      draw: { at: 230, until: 237 },
      erase: DEBKA_PIANO_FADE(246, 255),
      pool: {
        maxConcurrent: 9,
        durationRange: [0.07, 0.26],
        minDuration: 0.05,
        staggerRange: [0.015, 0.07],
        eraseDurationRange: [0.35, 0.95],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 230, until: 237 },
      },
    },

    /* ── Guitar coda — architectural house chaos (04:15 → 04:30) ── */

    /* House — primary burst (04:15 → 04:30) */
    {
      id: "debka_house_coda_a",
      file: "debka_house.svg",
      strategy: "burst-settle",
      draw: { at: DEBKA_GUITAR_CODA.from, until: 268 },
      erase: DEBKA_GUITAR_CODA_ERASE,
      pool: {
        burstUntil: 257,
        burstShare: 0.72,
        burst: {
          maxConcurrent: 14,
          durationRange: [0.05, 0.2],
          minDuration: 0.04,
          staggerRange: [0.008, 0.04],
        },
        settle: DEBKA_HOUSE_CODA_BURST,
      },
      modulation: {
        drawSpeed: {
          ...DEBKA_GUITAR_REACT.drawSpeed,
          from: DEBKA_GUITAR_CODA.from,
          until: 268,
        },
        tremble: {
          ...DEBKA_GUITAR_REACT.tremble,
          from: DEBKA_GUITAR_CODA.from,
          until: DEBKA_GUITAR_CODA.until,
        },
      },
    },

    /* House — overlapping edge field (04:15 → 04:30) */
    {
      id: "debka_house_coda_b",
      file: "debka_house.svg",
      strategy: "edge-stagger",
      draw: { at: DEBKA_GUITAR_CODA.from, until: 269 },
      erase: DEBKA_GUITAR_CODA_ERASE,
      pool: DEBKA_HOUSE_CODA_BURST,
      modulation: {
        drawSpeed: {
          ...DEBKA_GUITAR_REACT.drawSpeed,
          from: DEBKA_GUITAR_CODA.from,
          until: 269,
        },
        inkBreath: {
          ...DEBKA_GUITAR_REACT.inkBreath,
          from: DEBKA_GUITAR_CODA.from,
          until: DEBKA_GUITAR_CODA.until,
        },
      },
    },

    /* Home — bass squares under guitar coda (04:15 → 04:30) */
    {
      id: "debka_home_coda_guitar",
      file: "debka_home.svg",
      strategy: "edge-stagger",
      draw: { at: 256, until: 269 },
      erase: DEBKA_GUITAR_CODA_ERASE,
      pool: {
        maxConcurrent: 10,
        durationRange: [0.08, 0.32],
        minDuration: 0.06,
        staggerRange: [0.01, 0.05],
        eraseDurationRange: [0.06, 0.2],
      },
      modulation: {
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 256, until: DEBKA_GUITAR_CODA.until },
        drawSpeed: { ...DEBKA_BASS_REACT.drawSpeed, from: 256, until: 269 },
      },
    },

    /* ── Guitar coda boost (04:20 → 04:30, shared house erase) ── */

    /* Layer 4 — overlapping texture (04:20 → 04:30) */
    {
      id: "debka_layer4_coda_boost",
      file: "debka_layer4.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: DEBKA_GUITAR_CODA_BOOST, until: 268 },
      erase: DEBKA_GUITAR_CODA_ERASE,
      pool: DEBKA_HOUSE_CODA_BURST,
      modulation: {
        drawSpeed: {
          ...DEBKA_GUITAR_REACT.drawSpeed,
          from: DEBKA_GUITAR_CODA_BOOST,
          until: 268,
        },
      },
    },

    /* High — guitar sync accents (04:20 → 04:30) */
    {
      id: "debka_high_coda_boost",
      file: "debka_high.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: DEBKA_GUITAR_CODA_BOOST, until: 269 },
      erase: DEBKA_GUITAR_CODA_ERASE,
      pool: {
        maxConcurrent: 8,
        durationRange: [0.07, 0.28],
        minDuration: 0.05,
        staggerRange: [0.01, 0.05],
        eraseDurationRange: [0.05, 0.18],
      },
      modulation: {
        tremble: {
          ...DEBKA_GUITAR_REACT.tremble,
          from: DEBKA_GUITAR_CODA_BOOST,
          until: DEBKA_GUITAR_CODA.until,
        },
        drawSpeed: {
          ...DEBKA_GUITAR_REACT.drawSpeed,
          from: DEBKA_GUITAR_CODA_BOOST,
          until: 269,
        },
      },
    },

    /* Other — graphic pulse under houses (04:20 → 04:30) */
    {
      id: "debka_other_coda_boost",
      file: "debka_other.svg",
      strategy: "edge-stagger",
      draw: { at: DEBKA_GUITAR_CODA_BOOST, until: 269 },
      erase: DEBKA_GUITAR_CODA_ERASE,
      pool: DEBKA_HOUSE_CODA_BURST,
      modulation: {
        inkBreath: {
          ...DEBKA_GUITAR_REACT.inkBreath,
          from: DEBKA_GUITAR_CODA_BOOST,
          until: DEBKA_GUITAR_CODA.until,
        },
        drawSpeed: {
          ...DEBKA_GUITAR_REACT.drawSpeed,
          from: DEBKA_GUITAR_CODA_BOOST,
          until: 269,
        },
      },
    },

    /* Trees — quick foliage accents (04:20 → 04:30) */
    {
      id: "debka_trees_coda_boost",
      file: "debka_trees.svg",
      strategy: "edge-stagger",
      draw: { at: DEBKA_GUITAR_CODA_BOOST, until: 268 },
      erase: DEBKA_GUITAR_CODA_ERASE,
      pool: {
        maxConcurrent: 6,
        durationRange: [0.12, 0.42],
        minDuration: 0.08,
        staggerRange: [0.02, 0.08],
        eraseDurationRange: [0.06, 0.2],
      },
      modulation: {
        drawSpeed: {
          ...DEBKA_GUITAR_REACT.drawSpeed,
          from: DEBKA_GUITAR_CODA_BOOST,
          until: 268,
        },
      },
    },

    /* Layer 3 — wind memory (04:02 → 04:15, clears before guitar coda) */
    {
      id: "debka_layer3_coda",
      file: "debka_layer3.svg",
      allowViewBoxMismatch: true,
      strategy: "organic-pool",
      draw: { at: 242, until: 252, naturalPace: true },
      erase: DEBKA_SOFT_EXIT(252, 255),
      pool: {
        maxConcurrent: 2,
        speedRange: [0.44, 0.72],
        durationRange: [2.6, 6.2],
        minDuration: 1.9,
        staggerRange: [0.4, 1.25],
        eraseDurationRange: [0.75, 1.75],
      },
      modulation: {
        drawSpeed: { ...DEBKA_FLUTE_REACT.drawSpeed, from: 242, until: 252 },
      },
    },

    /* Flute lines — after guitar coda (04:30 → 04:38) */
    {
      id: "debka_lines_coda",
      file: "debka_lines.svg",
      strategy: "flute-living",
      draw: { at: 270, until: 278 },
      erase: DEBKA_SOFT_EXIT(278, 282),
      pool: {
        maxConcurrent: 4,
        drawWindow: 6,
        eraseBudget: 2.5,
        durationRange: [1.8, 4.0],
        minDuration: 1.1,
        staggerRange: [0.3, 0.85],
        eraseDurationRange: [0.55, 1.35],
      },
      modulation: {
        tremble: { ...DEBKA_FLUTE_REACT.tremble, from: 270, until: 282 },
        drawSpeed: { ...DEBKA_FLUTE_REACT.drawSpeed, from: 270, until: 278 },
      },
    },

    /* Fields — wide build, first wave (04:30 → 04:38) */
    {
      id: "debka_fields_main",
      file: "debka_fields.svg",
      strategy: "organic-pool",
      draw: { at: 270, until: 278, naturalPace: true },
      erase: DEBKA_SOFT_EXIT(306, 310),
      pool: {
        maxConcurrent: 2,
        speedRange: [0.42, 0.68],
        durationRange: [2.8, 6.4],
        minDuration: 2.0,
        staggerRange: [0.45, 1.35],
        eraseDurationRange: [0.85, 2.0],
      },
      modulation: {
        drawSpeed: { ...DEBKA_MIX_REACT.drawSpeed, from: 270, until: 304 },
      },
    },

    /* Layer 4 living — first coda pass (04:30 → 04:38) */
    {
      id: "debka_layer4_coda",
      file: "debka_layer4.svg",
      allowViewBoxMismatch: true,
      strategy: "living-cycle",
      draw: { at: 270, until: 276 },
      erase: { until: 280 },
      pool: {
        maxConcurrent: 4,
        cyclesPerUnit: [2, 3],
        finalClearSec: 1.8,
        durationRange: [1.4, 3.0],
        eraseDurationRange: [1.0, 2.2],
        holdRange: [0.2, 0.6],
        gapRange: [0.25, 0.7],
        staggerRange: [0.15, 0.55],
        minDuration: 0.9,
      },
    },

    /* Lines — brief breath before the final surge (04:38 → 04:43) */
    {
      id: "debka_lines_breath",
      file: "debka_lines.svg",
      strategy: "flute-living",
      draw: { at: 278, until: 282 },
      erase: DEBKA_SOFT_EXIT(282, 285),
      pool: {
        maxConcurrent: 2,
        drawWindow: 3.5,
        eraseBudget: 1.2,
        durationRange: [1.4, 3.2],
        minDuration: 0.9,
        staggerRange: [0.35, 0.9],
        eraseDurationRange: [0.75, 1.45],
      },
      modulation: {
        tremble: {
          ...DEBKA_FLUTE_REACT.tremble,
          from: 278,
          until: 285,
          maxPx: 1.1,
          energy: 0.55,
        },
        drawSpeed: {
          ...DEBKA_FLUTE_REACT.drawSpeed,
          from: 278,
          until: 282,
          slowMult: 0.55,
          fastMult: 1.6,
        },
      },
    },

    /* Layer 4 — intensity rebuild (04:43 → 04:45) */
    {
      id: "debka_layer4_intensity",
      file: "debka_layer4.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 283, until: 285 },
      erase: DEBKA_SOFT_EXIT(285, 288),
      pool: {
        maxConcurrent: 8,
        durationRange: [0.1, 0.35],
        minDuration: 0.07,
        staggerRange: [0.01, 0.06],
        eraseDurationRange: [0.08, 0.22],
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 283, until: 285 },
      },
    },

    /* Bus — drum-circle percussion storm (04:45 → 05:02) */
    {
      id: "debka_bus_drums",
      file: "debka_bus.svg",
      ...DEBKA_DRUM_BURST,
      draw: { at: 285, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      modulation: {
        inkBreath: {
          ...DEBKA_DRUM_REACT.inkBreath,
          from: 285,
          until: 306,
        },
        drawSpeed: {
          ...DEBKA_DRUM_REACT.drawSpeed,
          from: 285,
          until: 302,
        },
      },
    },

    /* Bus — flipped duplicate (04:45 → 05:02) */
    {
      id: "debka_bus_drums_flip",
      file: "debka_bus.svg",
      transform: { rotate: 180 },
      ...DEBKA_DRUM_BURST,
      draw: { at: 285, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      modulation: {
        inkBreath: {
          ...DEBKA_DRUM_REACT.inkBreath,
          from: 285,
          until: 306,
        },
        drawSpeed: {
          ...DEBKA_DRUM_REACT.drawSpeed,
          from: 285,
          until: 302,
        },
      },
    },

    /* Bus — tilted duplicate A (04:45 → 05:02) */
    {
      id: "debka_bus_drums_tilt_a",
      file: "debka_bus.svg",
      transform: { rotate: 14 },
      ...DEBKA_DRUM_BURST,
      draw: { at: 286, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      modulation: {
        inkBreath: {
          ...DEBKA_DRUM_REACT.inkBreath,
          from: 286,
          until: 306,
        },
        drawSpeed: {
          ...DEBKA_DRUM_REACT.drawSpeed,
          from: 286,
          until: 302,
        },
      },
    },

    /* Bus — tilted duplicate B (04:45 → 05:02) */
    {
      id: "debka_bus_drums_tilt_b",
      file: "debka_bus.svg",
      transform: { rotate: -14 },
      ...DEBKA_DRUM_BURST,
      draw: { at: 286, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      modulation: {
        inkBreath: {
          ...DEBKA_DRUM_REACT.inkBreath,
          from: 286,
          until: 306,
        },
        drawSpeed: {
          ...DEBKA_DRUM_REACT.drawSpeed,
          from: 286,
          until: 302,
        },
      },
    },

    /* Bus — quarter-turn duplicate (04:45 → 05:02) */
    {
      id: "debka_bus_drums_quarter",
      file: "debka_bus.svg",
      transform: { rotate: 90 },
      ...DEBKA_DRUM_BURST,
      draw: { at: 287, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      modulation: {
        inkBreath: {
          ...DEBKA_DRUM_REACT.inkBreath,
          from: 287,
          until: 306,
        },
        drawSpeed: {
          ...DEBKA_DRUM_REACT.drawSpeed,
          from: 287,
          until: 302,
        },
      },
    },

    /* Bus — offset timing duplicate (04:45 → 05:02) */
    {
      id: "debka_bus_drums_echo",
      file: "debka_bus.svg",
      transform: { rotate: -90 },
      ...DEBKA_DRUM_BURST,
      draw: { at: 287, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: {
        ...DEBKA_DRUM_BURST.pool,
        maxConcurrent: 16,
        staggerRange: [0.002, 0.02],
      },
      modulation: {
        inkBreath: {
          ...DEBKA_DRUM_REACT.inkBreath,
          from: 287,
          until: 306,
        },
        drawSpeed: {
          ...DEBKA_DRUM_REACT.drawSpeed,
          from: 287,
          until: 302,
        },
      },
    },

    /* ── Piano chaos return over drum circles (04:58 → 05:06 unified exit) ── */

    /* Layer 4 — dense overlap once circles are on screen */
    {
      id: "debka_layer4_drums_chaos",
      file: "debka_layer4.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 298, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: DEBKA_PIANO_FAST,
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 298, until: 302 },
        inkBreath: { ...DEBKA_DRUM_REACT.inkBreath, from: 298, until: 306 },
      },
    },

    /* Layer 3 — undercurrent */
    {
      id: "debka_layer3_drums_chaos",
      file: "debka_layer3.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 298, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: DEBKA_CHAOS_DENSE,
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 298, until: 302 },
      },
    },

    /* House — staccato squares over circles */
    {
      id: "debka_house_drums_chaos",
      file: "debka_house.svg",
      strategy: "burst-settle",
      draw: { at: 299, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: {
        burstUntil: 299.8,
        burstShare: 0.75,
        burst: {
          maxConcurrent: 12,
          durationRange: [0.05, 0.18],
          minDuration: 0.04,
          staggerRange: [0.008, 0.035],
        },
        settle: DEBKA_PIANO_FAST,
      },
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 299, until: 302 },
      },
    },

    /* Home — bass squares */
    {
      id: "debka_home_drums_chaos",
      file: "debka_home.svg",
      strategy: "edge-stagger",
      draw: { at: 299, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: DEBKA_CHAOS_DENSE,
      modulation: {
        inkBreath: { ...DEBKA_BASS_REACT.inkBreath, from: 299, until: 306 },
        drawSpeed: { ...DEBKA_BASS_REACT.drawSpeed, from: 299, until: 302 },
      },
    },

    /* High — rhythmic accents */
    {
      id: "debka_high_drums_chaos",
      file: "debka_high.svg",
      allowViewBoxMismatch: true,
      strategy: "edge-stagger",
      draw: { at: 299, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: DEBKA_CHAOS_DENSE,
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 299, until: 302 },
        inkBreath: { ...DEBKA_DRUM_REACT.inkBreath, from: 299, until: 306 },
      },
    },

    /* Other — graphic flash */
    {
      id: "debka_other_drums_chaos",
      file: "debka_other.svg",
      strategy: "edge-stagger",
      draw: { at: 300, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: DEBKA_PIANO_FAST,
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 300, until: 302 },
        inkBreath: { ...DEBKA_DRUM_REACT.inkBreath, from: 300, until: 306 },
      },
    },

    /* Lines — piano rhythm over the circle storm */
    {
      id: "debka_lines_drums_chaos",
      file: "debka_lines.svg",
      strategy: "edge-stagger",
      draw: { at: 300, until: 302 },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: DEBKA_PIANO_FAST,
      modulation: {
        drawSpeed: { ...DEBKA_PIANO_REACT.drawSpeed, from: 300, until: 302 },
      },
    },

    /* Fields — second wave under the drum storm (04:45 → 05:06) */
    {
      id: "debka_fields_drums",
      file: "debka_fields.svg",
      strategy: "organic-pool",
      draw: { at: 285, until: 300, naturalPace: true },
      erase: DEBKA_BUS_UNIFIED_ERASE,
      pool: {
        maxConcurrent: 4,
        speedRange: [0.62, 0.95],
        durationRange: [1.0, 2.6],
        minDuration: 0.75,
        staggerRange: [0.12, 0.45],
        eraseDurationRange: [0.35, 0.85],
      },
      modulation: {
        drawSpeed: { ...DEBKA_MIX_REACT.drawSpeed, from: 285, until: 300 },
      },
    },

    /* Trees + water — condensed breath (05:04 → 05:21) */
    {
      id: "debka_trees_coda",
      file: "debka_trees.svg",
      strategy: "tree-breath",
      draw: { at: 304, until: 312 },
      erase: DEBKA_SOFT_EXIT(313, DEBKA_MID_CODA_FAST_UNTIL),
      pool: {
        maxConcurrent: 4,
        durationRange: [1.2, 2.8],
        minDuration: 0.85,
        staggerRange: [0.2, 0.65],
        eraseDurationRange: [0.25, 0.65],
      },
    },

    {
      id: "debka_water_coda",
      file: "debka_water.svg",
      strategy: "organic-pool",
      draw: { at: 312, until: DEBKA_MID_CODA_FAST_UNTIL },
      erase: DEBKA_SOFT_EXIT(DEBKA_MID_CODA_FAST_UNTIL, 324),
      pool: {
        maxConcurrent: 3,
        speedRange: [0.58, 0.92],
        durationRange: [0.85, 2.2],
        minDuration: 0.6,
        staggerRange: [0.12, 0.45],
        eraseDurationRange: [0.22, 0.55],
      },
    },

    /* Bus + home return (05:22 → 05:48) */
    {
      id: "debka_bus_coda",
      file: "debka_bus.svg",
      ...DEBKA_BUS_RELAY,
      draw: { at: 322, until: 346 },
      erase: { from: 322, until: 348 },
      pool: {
        ...DEBKA_BUS_RELAY.pool,
        eraseDurationRange: [0.45, 1.0],
      },
    },

    {
      id: "debka_home_coda",
      file: "debka_home.svg",
      strategy: "edge-stagger",
      draw: { at: 326, until: 346 },
      erase: DEBKA_SOFT_EXIT(342, 348),
      pool: {
        maxConcurrent: 3,
        durationRange: [1.2, 3.4],
        minDuration: 0.75,
        staggerRange: [0.25, 0.85],
        eraseDurationRange: [0.75, 1.65],
      },
    },

    /* Water — quick breath before the final sequence (05:47 → 06:08) */
    {
      id: "debka_water_penultimate",
      file: "debka_water.svg",
      strategy: "edge-stagger",
      draw: { at: 347, until: 353 },
      erase: DEBKA_SOFT_EXIT(358, DEBKA_LINES_FINALE_START),
      pool: {
        maxConcurrent: 3,
        durationRange: [0.35, 1.05],
        minDuration: 0.25,
        staggerRange: [0.04, 0.16],
        eraseDurationRange: [0.45, 1.05],
      },
      modulation: {
        drawSpeed: {
          ...DEBKA_MIX_REACT.drawSpeed,
          from: 347,
          until: 353,
          fastMult: 3.1,
          follow: 0.22,
        },
      },
    },

    /* Road + other — final density (05:52 → 06:08) */
    {
      id: "debka_road_finale",
      file: "debka_road.svg",
      strategy: "road-inward",
      center: DEBKA_ROAD_CENTER,
      draw: { at: 352, until: DEBKA_LINES_FINALE_START },
      erase: DEBKA_SOFT_EXIT(370, 376),
      pool: {
        maxConcurrent: 4,
        durationRange: [1.4, 3.8],
        minDuration: 0.9,
        staggerRange: [0.22, 0.8],
        eraseDurationRange: [0.55, 1.25],
      },
    },

    {
      id: "debka_other_finale",
      file: "debka_other.svg",
      strategy: "edge-stagger",
      draw: { at: 356, until: 366 },
      erase: DEBKA_SOFT_EXIT(371, 376),
      pool: {
        maxConcurrent: 3,
        durationRange: [0.85, 2.4],
        minDuration: 0.5,
        staggerRange: [0.15, 0.65],
        eraseDurationRange: [0.45, 1.05],
      },
    },

    /* Final lines — flute passage (06:08 → end; erase unchanged at 06:00–06:05) */
    {
      id: "debka_lines_finale",
      file: "debka_lines.svg",
      strategy: "edge-stagger",
      draw: { at: DEBKA_LINES_FINALE_START, until: 376 },
      erase: DEBKA_LINES_FINALE_ERASE,
      pool: {
        maxConcurrent: 4,
        durationRange: [1.2, 2.8],
        minDuration: 0.75,
        staggerRange: [0.15, 0.55],
        eraseDurationRange: [0.55, 1.35],
      },
      modulation: {
        tremble: { ...DEBKA_FLUTE_REACT.tremble, from: DEBKA_LINES_FINALE_START, until: 365 },
        drawSpeed: {
          ...DEBKA_FLUTE_REACT.drawSpeed,
          from: DEBKA_LINES_FINALE_START,
          until: 376,
        },
      },
    },

    /* Fields ghost — final visual accent (06:14 → 06:16) */
    {
      id: "debka_fields_finale",
      file: "debka_fields.svg",
      strategy: "burst-settle",
      draw: { at: 373, until: 374.2 },
      erase: { from: 374.2, until: 375.5 },
      pool: {
        burstUntil: 373.6,
        burstShare: 0.85,
        burst: {
          maxConcurrent: 10,
          durationRange: [0.04, 0.14],
          minDuration: 0.03,
          staggerRange: [0.004, 0.018],
        },
        settle: {
          maxConcurrent: 4,
          durationRange: [0.06, 0.18],
          minDuration: 0.04,
          staggerRange: [0.005, 0.02],
          eraseDurationRange: [0.04, 0.12],
        },
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("debkaAudio");

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

  const fluteStem = document.getElementById("debkaWindStem");
  const guitarStem = document.getElementById("debkaGuitarStem");
  const bassStem = document.getElementById("debkaBassStem");
  const pianoStem = document.getElementById("debkaPianoStem");
  const drumsStem = document.getElementById("debkaDrumsStem");

  const analysisStems = [
    fluteStem && { id: "flute", audio: fluteStem },
    guitarStem && { id: "guitar", audio: guitarStem },
    bassStem && { id: "bass", audio: bassStem },
    pianoStem && { id: "piano", audio: pianoStem },
    drumsStem && { id: "drums", audio: drumsStem },
  ].filter(Boolean);

  PlotterMachine.boot(mount, {
    baseDir: "../assets/svg/songs/debka",
    score: DEBKA_SCORE,
    style: DEBKA_STYLE,
    transport: {
      audio,
      analysisStems,
      playButton: playBtn,
      pauseButton: document.getElementById("pauseBtn"),
      timeline: document.getElementById("timeline"),
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: DEBKA_SPIN_DURATION_SEC,
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
      console.error("[debka] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (typeof markTrackListened === "function") {
        markTrackListened("track-b2");
      }
    });
  }
});
