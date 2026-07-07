/* ============================================================
   DINOSAURUS JR. (דינוזאורוס הבן) — Plotter Machine score
   ------------------------------------------------------------
   A fast, stem-reactive journey through Misgav — one continuous
   composition where layers overlap, hand off, and erase naturally.
   Creative instructions only; the engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = true;

/** Matches audio file duration (~6:38). */
const DINOSAURUS_SPIN_DURATION_SEC = 398;

const DINOSAURUS_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** 01:28:00 — everything except homes cleared by this point. */
const DINOSAURUS_CLEAR_FOR_HOMES = { from: 78, until: 88 };

/** 06:15:00 — slow musical dissolve begins. */
const DINOSAURUS_DISSOLVE_FROM = 375;

/** Last strokes gone before the record ends. */
const DINOSAURUS_FINAL_WIPE = { from: 392, until: 396 };

const DINOSAURUS_FINAL_ERASE_RANGE = [0.4, 1.2];

/** Staggered coda exits — instruments fade one after another. */
const DINOSAURUS_DISSOLVE = (from, until) => ({ from, until });

/** Guest texture — quick clear. */
const DINOSAURUS_GUEST_CLEAR = (from, until) => ({ from, until });

/** Opening burst — many ideas, tight overlap (00:00 → 00:36). */
const DINOSAURUS_OPEN_EDGE = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 4,
    durationRange: [0.85, 2.5],
    minDuration: 0.55,
    staggerRange: [0.08, 0.35],
    eraseDurationRange: [0.4, 1.2],
  },
};

/** Fast guest weave for restless passages. */
const DINOSAURUS_GUEST_FAST = {
  strategy: "edge-stagger",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 3,
    durationRange: [0.65, 2.0],
    minDuration: 0.4,
    staggerRange: [0.06, 0.28],
    eraseDurationRange: [0.3, 0.95],
  },
};

/** Vocal chaos — opening disorder returns (02:05 & 05:50 passages). */
const DINOSAURUS_VOCAL_CHAOS = {
  strategy: "edge-stagger",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 4,
    durationRange: [0.7, 2.1],
    minDuration: 0.45,
    staggerRange: [0.07, 0.3],
    eraseDurationRange: [0.32, 0.95],
  },
};

/** Field hatching — faster organic pool. */
const DINOSAURUS_FIELDS_FAST = {
  maxConcurrent: 2,
  speedRange: [0.52, 0.92],
  durationRange: [1.1, 3.2],
  minDuration: 0.75,
  staggerRange: [0.2, 0.65],
  eraseDurationRange: [0.55, 1.65],
};

/** Guitar-rhythmic fields (03:45). */
const DINOSAURUS_FIELDS_GUITAR = {
  maxConcurrent: 3,
  speedRange: [0.58, 0.98],
  durationRange: [0.85, 2.6],
  minDuration: 0.55,
  staggerRange: [0.12, 0.48],
  eraseDurationRange: [0.45, 1.35],
};

/** Path / road geometry. */
const DINOSAURUS_EDGE = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 3,
    durationRange: [1.2, 3.8],
    minDuration: 0.75,
    staggerRange: [0.2, 0.65],
    eraseDurationRange: [0.65, 2.0],
  },
};

/** House anchor — deliberate architecture (clears before 01:28). */
const DINOSAURUS_HOUSE_ANCHOR = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 2,
    durationRange: [3.4, 9.0],
    minDuration: 2.5,
    staggerRange: [0.75, 2.1],
    eraseDurationRange: [2.0, 5.5],
  },
};

/** Homes settlement — bass-pulsed main layer from 01:28. */
const DINOSAURUS_HOMES_MAIN = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 3,
    durationRange: [2.4, 6.8],
    minDuration: 1.6,
    staggerRange: [0.5, 1.45],
    eraseDurationRange: [1.8, 4.8],
  },
};

/** Homes overlay — additive structural return (04:31). */
const DINOSAURUS_HOMES_OVERLAY = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 3,
    durationRange: [2.0, 5.8],
    minDuration: 1.4,
    staggerRange: [0.4, 1.2],
    eraseDurationRange: [2.2, 5.5],
  },
};

const DINOSAURUS_EDGE_SLOW = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 3,
    durationRange: [2.2, 6.5],
    minDuration: 1.5,
    staggerRange: [0.45, 1.35],
    eraseDurationRange: [1.4, 4.0],
  },
};

const DINOSAURUS_MONUMENT = {
  strategy: "long-first",
  pool: {
    maxConcurrent: 2,
    durationRange: [2.6, 7.2],
    minDuration: 1.8,
    staggerRange: [0.35, 1.05],
    eraseDurationRange: [1.2, 3.6],
  },
};

const DINOSAURUS_EDGE_DENSE = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 5,
    durationRange: [0.9, 2.8],
    minDuration: 0.55,
    staggerRange: [0.12, 0.42],
    eraseDurationRange: [0.45, 1.35],
  },
};

const DINOSAURUS_GUEST = {
  strategy: "edge-stagger",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 3,
    durationRange: [0.8, 2.4],
    minDuration: 0.5,
    staggerRange: [0.1, 0.38],
    eraseDurationRange: [0.28, 0.85],
  },
};

/** Long-line flute layer — autumnnights lines (not Rahavia). */
const DINOSAURUS_FLUTE_LINES = {
  strategy: "edge-stagger",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 3,
    durationRange: [1.0, 3.4],
    minDuration: 0.65,
    staggerRange: [0.18, 0.62],
    eraseDurationRange: [0.75, 2.2],
  },
};

/** Stem-reactive draw speed. */
const DINOSAURUS_DRUMS_SPEED = {
  source: "drums",
  longLineShare: 0.3,
  slowMult: 0.58,
  fastMult: 3.4,
  dynamicsWeight: 0.68,
  follow: 0.22,
  energy: 1.15,
};

const DINOSAURUS_PIANO_SPEED = {
  source: "piano",
  longLineShare: 0.34,
  slowMult: 0.62,
  fastMult: 3.6,
  dynamicsWeight: 0.72,
  follow: 0.24,
  energy: 1.2,
};

const DINOSAURUS_GUITAR_SPEED = {
  source: "guitar",
  longLineShare: 0.28,
  slowMult: 0.55,
  fastMult: 2.85,
  dynamicsWeight: 0.64,
  follow: 0.2,
  energy: 1.1,
};

const DINOSAURUS_FLUTE_SPEED = {
  source: "flute",
  longLineShare: 0.42,
  slowMult: 0.58,
  fastMult: 2.65,
  dynamicsWeight: 0.62,
  follow: 0.18,
};

const DINOSAURUS_BASS_SPEED = {
  source: "bass",
  longLineShare: 0.26,
  slowMult: 0.6,
  fastMult: 2.5,
  dynamicsWeight: 0.55,
  follow: 0.18,
  energy: 1.05,
};

const DINOSAURUS_VOCALS_SPEED = {
  source: "vocals",
  longLineShare: 0.3,
  slowMult: 0.54,
  fastMult: 2.85,
  dynamicsWeight: 0.65,
  follow: 0.21,
  energy: 1.12,
};

const DINOSAURUS_STRINGS_SPEED = {
  source: "strings",
  longLineShare: 0.34,
  slowMult: 0.52,
  fastMult: 2.1,
  dynamicsWeight: 0.52,
  follow: 0.14,
};

/** Homes bass pulse — controlled visibility rhythm from 01:28. */
const DINOSAURUS_HOMES_BASS_REACT = {
  drawSpeed: {
    source: "bass",
    longLineShare: 0.22,
    slowMult: 0.54,
    fastMult: 2.4,
    dynamicsWeight: 0.64,
    follow: 0.2,
    energy: 1.08,
  },
  inkBreath: {
    source: "bass",
    energy: 0.42,
    intensityIdle: 0.18,
    depthRangeIdle: [0.006, 0.014],
    depthRange: [0.012, 0.028],
    dynamicsWeight: 0.48,
    speedIdle: 0.52,
    speed: 1.0,
    rampFrom: 88,
    rampUntil: 96,
  },
};

const DINOSAURUS_HOUSE_SPEED = {
  source: "flute",
  longLineShare: 0.38,
  slowMult: 0.68,
  fastMult: 1.35,
  dynamicsWeight: 0.45,
  follow: 0.1,
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const DINOSAURUS_SCORE = {
  style: DINOSAURUS_STYLE,
  artboard: { x: 0, y: 0, w: 1960.18, h: 1929.47 },
  layers: [
    /* ── OPENING — restless search (00:00 → 00:36) ───────────── */

    {
      id: "dinosaurus_fields_open_1",
      file: "Dinosaurus_fields.svg",
      strategy: "organic-pool",
      draw: { at: 0, until: 26 },
      erase: { from: 20, until: 32 },
      pool: DINOSAURUS_FIELDS_FAST,
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 0, until: 32 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_open_1",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 1, until: 12 },
      erase: DINOSAURUS_GUEST_CLEAR(10, 14),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 1, until: 14 },
      },
    },

    {
      id: "dinosaurus_guest_place_open_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 3, until: 15 },
      erase: DINOSAURUS_GUEST_CLEAR(12, 16),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 3, until: 16 },
      },
    },

    {
      id: "dinosaurus_street_open",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_OPEN_EDGE,
      draw: { at: 5, until: 30 },
      erase: { from: 26, until: 35 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 5, until: 35 },
      },
    },

    {
      id: "dinosaurus_guest_street_open_1",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 7, until: 18 },
      erase: DINOSAURUS_GUEST_CLEAR(15, 19),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 7, until: 19 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_open_2",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 12, until: 24 },
      erase: DINOSAURUS_GUEST_CLEAR(21, 25),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 12, until: 25 },
      },
    },

    {
      id: "dinosaurus_guest_place_open_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 15, until: 28 },
      erase: DINOSAURUS_GUEST_CLEAR(25, 30),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 15, until: 30 },
      },
    },

    {
      id: "dinosaurus_fields_open_2",
      file: "Dinosaurus_fields.svg",
      strategy: "organic-pool",
      draw: { at: 18, until: 36 },
      erase: { from: 30, until: 38 },
      pool: DINOSAURUS_FIELDS_FAST,
      modulation: {
        drawSpeed: { ...DINOSAURUS_BASS_SPEED, from: 18, until: 38 },
      },
    },

    {
      id: "dinosaurus_guest_street_open_2",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 22, until: 34 },
      erase: DINOSAURUS_GUEST_CLEAR(30, 35),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 22, until: 35 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_open_3",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 26, until: 36 },
      erase: DINOSAURUS_GUEST_CLEAR(33, 37),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 26, until: 37 },
      },
    },

    /* ── BRIDGE — house at 01:01, clear for homes at 01:28 ───── */

    {
      id: "dinosaurus_street_bridge",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 34, until: 58 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 34, until: 88 },
      },
    },

    {
      id: "dinosaurus_fields_bridge",
      file: "Dinosaurus_fields.svg",
      strategy: "organic-pool",
      draw: { at: 36, until: 62 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      pool: {
        ...DINOSAURUS_FIELDS_FAST,
        maxConcurrent: 2,
        durationRange: [1.4, 3.8],
        staggerRange: [0.3, 0.85],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_STRINGS_SPEED, from: 36, until: 88 },
      },
    },

    {
      id: "dinosaurus_guest_place_bridge",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST_FAST,
      draw: { at: 44, until: 58 },
      erase: DINOSAURUS_GUEST_CLEAR(55, 60),
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 44, until: 60 },
      },
    },

    /* Layer 3 — house (01:01:00; clears before 01:28) */
    {
      id: "dinosaurus_house_anchor",
      file: "Dinosaurus_house.svg",
      ...DINOSAURUS_HOUSE_ANCHOR,
      draw: { at: 61, until: 100, naturalPace: true },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_HOUSE_SPEED, from: 61, until: 88 },
      },
    },

    {
      id: "dinosaurus_street_house_pass",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 58, until: 85 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 58, until: 88 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_house",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 68, until: 85 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 68, until: 88 },
      },
    },

    /* Layer 4 — homes (main layer from 01:28, bass-pulsed) */
    {
      id: "dinosaurus_homes_main",
      file: "Dinosaurus_homes.svg",
      ...DINOSAURUS_HOMES_MAIN,
      draw: { at: 74, until: 132, naturalPace: true },
      erase: { from: 158, until: 172 },
      modulation: {
        drawSpeed: {
          ...DINOSAURUS_HOMES_BASS_REACT.drawSpeed,
          from: 74,
          until: 163,
        },
        inkBreath: {
          ...DINOSAURUS_HOMES_BASS_REACT.inkBreath,
          from: 88,
          until: 163,
        },
      },
    },

    /* ── 01:40 → 02:05 — flute long lines over homes ─────────── */

    {
      id: "dinosaurus_flute_lines_1",
      file: "../autumnnights/autumnnights_lines.svg",
      ...DINOSAURUS_FLUTE_LINES,
      draw: { at: 100, until: 125 },
      erase: { from: 122, until: 128 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 100, until: 128 },
      },
    },

    /* ── 02:05 → 02:22 — vocal chaos returns ─────────────────── */

    {
      id: "dinosaurus_chaos_vocal_dalia_1",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 125, until: 136 },
      erase: { from: 133, until: 137 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 125, until: 137 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_place_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 127, until: 138 },
      erase: { from: 135, until: 139 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 127, until: 139 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_1",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 128, until: 140 },
      erase: { from: 137, until: 141 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 128, until: 141 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_fields_1",
      file: "Dinosaurus_fields.svg",
      strategy: "organic-pool",
      draw: { at: 130, until: 142 },
      erase: { from: 139, until: 143 },
      pool: {
        ...DINOSAURUS_FIELDS_FAST,
        maxConcurrent: 3,
        durationRange: [0.7, 2.0],
        staggerRange: [0.1, 0.35],
        eraseDurationRange: [0.35, 0.9],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 130, until: 143 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_1b",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 132, until: 142 },
      erase: { from: 140, until: 144 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 132, until: 144 },
      },
    },

    /* ── ACT II — monument & square (~02:22 → ~03:45) ────────── */

    {
      file: "Dinosaurus_pesel.svg",
      ...DINOSAURUS_MONUMENT,
      draw: { at: 142, until: 188, naturalPace: true },
      erase: { from: 185, until: 200 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 142, until: 188 },
      },
    },

    /* ── 02:43 → 03:40 — flute lines on top of everything ────── */

    {
      id: "dinosaurus_flute_lines_2",
      file: "../autumnnights/autumnnights_lines.svg",
      ...DINOSAURUS_FLUTE_LINES,
      draw: { at: 163, until: 220 },
      erase: { from: 216, until: 222 },
      pool: {
        ...DINOSAURUS_FLUTE_LINES.pool,
        maxConcurrent: 4,
        durationRange: [0.9, 3.0],
        staggerRange: [0.15, 0.55],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 163, until: 222 },
      },
    },

    {
      file: "Dinosaurus_riboa.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 168, until: 218 },
      erase: { from: 212, until: 226 },
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 168, until: 218 },
      },
    },

    {
      id: "dinosaurus_street_return_1",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE_DENSE,
      draw: { at: 205, until: 248 },
      erase: DINOSAURUS_DISSOLVE(382, 391),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 205, until: 248 },
      },
    },

    /* ── 03:45 — fields line layer, guitar-rhythmic ──────────── */

    {
      id: "dinosaurus_fields_guitar",
      file: "Dinosaurus_fields.svg",
      strategy: "organic-pool",
      draw: { at: 225, until: 268 },
      erase: { from: 262, until: 272 },
      pool: DINOSAURUS_FIELDS_GUITAR,
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 225, until: 272 },
      },
    },

    /* ── ACT III — restless peak (~04:08 → ~05:50) ───────────── */

    {
      id: "dinosaurus_guest_place_peak_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 248, until: 278 },
      erase: DINOSAURUS_DISSOLVE(378, 384),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 248, until: 278 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_peak",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 262, until: 292 },
      erase: DINOSAURUS_DISSOLVE(380, 386),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 262, until: 292 },
      },
    },

    {
      id: "dinosaurus_guest_street_peak",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 275, until: 305 },
      erase: DINOSAURUS_DISSOLVE(376, 382),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 275, until: 305 },
      },
    },

    /* ── 04:31 — homes return on top (additive) ──────────────── */

    {
      id: "dinosaurus_homes_overlay",
      file: "Dinosaurus_homes.svg",
      ...DINOSAURUS_HOMES_OVERLAY,
      draw: { at: 271, until: 318, naturalPace: true },
      erase: DINOSAURUS_DISSOLVE(386, 394),
      modulation: {
        drawSpeed: { ...DINOSAURUS_BASS_SPEED, from: 271, until: 318 },
      },
    },

    {
      file: "Dinosaurus_all.svg",
      strategy: "long-first",
      draw: { at: 268, until: 328, naturalPace: true },
      erase: DINOSAURUS_DISSOLVE(384, 392),
      pool: {
        maxConcurrent: 3,
        durationRange: [2.8, 7.8],
        minDuration: 2.0,
        staggerRange: [0.28, 0.85],
        eraseDurationRange: [1.4, 4.2],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 268, until: 328 },
      },
    },

    /* ── ACT IV — second wave (~05:10 → 05:50) ───────────────── */

    {
      id: "dinosaurus_riboa_return",
      file: "Dinosaurus_riboa.svg",
      ...DINOSAURUS_EDGE_DENSE,
      draw: { at: 310, until: 352 },
      erase: DINOSAURUS_DISSOLVE(383, 391),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 310, until: 352 },
      },
    },

    /* ── 05:19 — flute lines echo ──────────────────────────────── */

    {
      id: "dinosaurus_flute_lines_3",
      file: "../autumnnights/autumnnights_lines.svg",
      ...DINOSAURUS_FLUTE_LINES,
      draw: { at: 319, until: 355 },
      erase: DINOSAURUS_DISSOLVE(377, 384),
      pool: {
        ...DINOSAURUS_FLUTE_LINES.pool,
        maxConcurrent: 4,
        durationRange: [0.85, 2.8],
        staggerRange: [0.14, 0.5],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 319, until: 355 },
      },
    },

    {
      id: "dinosaurus_guest_place_peak_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 328, until: 348 },
      erase: DINOSAURUS_DISSOLVE(376, 381),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 328, until: 348 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_return",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 335, until: 355 },
      erase: DINOSAURUS_DISSOLVE(378, 383),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 335, until: 355 },
      },
    },

    {
      id: "dinosaurus_street_return_2",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE_DENSE,
      draw: { at: 325, until: 365 },
      erase: DINOSAURUS_DISSOLVE(381, 390),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 325, until: 365 },
      },
    },

    {
      id: "dinosaurus_pesel_return",
      file: "Dinosaurus_pesel.svg",
      ...DINOSAURUS_MONUMENT,
      draw: { at: 338, until: 372, naturalPace: true },
      erase: DINOSAURUS_DISSOLVE(388, 395),
      pool: {
        ...DINOSAURUS_MONUMENT.pool,
        eraseDurationRange: DINOSAURUS_FINAL_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 338, until: 372 },
      },
    },

    /* ── 05:50 → 06:15 — vocal chaos returns ─────────────────── */

    {
      id: "dinosaurus_chaos_vocal_dalia_2",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 350, until: 372 },
      erase: DINOSAURUS_DISSOLVE(375, 380),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 350, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_place_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 352, until: 374 },
      erase: DINOSAURUS_DISSOLVE(376, 381),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 352, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_2",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 354, until: 375 },
      erase: DINOSAURUS_DISSOLVE(375, 380),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 354, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_fields_2",
      file: "Dinosaurus_fields.svg",
      strategy: "organic-pool",
      draw: { at: 356, until: 375 },
      erase: DINOSAURUS_DISSOLVE(377, 382),
      pool: {
        ...DINOSAURUS_FIELDS_FAST,
        maxConcurrent: 3,
        durationRange: [0.65, 1.9],
        staggerRange: [0.08, 0.32],
        eraseDurationRange: [0.3, 0.85],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 356, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_2b",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 358, until: 375 },
      erase: DINOSAURUS_DISSOLVE(378, 383),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 358, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_dalia_2b",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_VOCAL_CHAOS,
      draw: { at: 360, until: 375 },
      erase: DINOSAURUS_DISSOLVE(375, 379),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 360, until: 375 },
      },
    },

    /* ── CODA — slow dissolve from 06:15 ─────────────────────── */

    {
      id: "dinosaurus_fields_coda",
      file: "Dinosaurus_fields.svg",
      strategy: "organic-pool",
      draw: { at: 362, until: 388, naturalPace: true },
      erase: DINOSAURUS_DISSOLVE(389, 396),
      pool: {
        ...DINOSAURUS_FIELDS_FAST,
        maxConcurrent: 1,
        speedRange: [0.38, 0.62],
        durationRange: [2.0, 5.2],
        eraseDurationRange: DINOSAURUS_FINAL_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_STRINGS_SPEED, from: 362, until: 388 },
      },
    },

    {
      id: "dinosaurus_all_coda",
      file: "Dinosaurus_all.svg",
      strategy: "long-first",
      draw: { at: 370, until: 390, naturalPace: true },
      erase: DINOSAURUS_FINAL_WIPE,
      pool: {
        maxConcurrent: 1,
        durationRange: [6.5, 9.5],
        minDuration: 5.5,
        staggerRange: [0.25, 0.65],
        eraseDurationRange: DINOSAURUS_FINAL_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 370, until: 390 },
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("dinosaurusAudio");

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

  const windStem = document.getElementById("dinosaurusWindStem");
  const guitarStem = document.getElementById("dinosaurusGuitarStem");
  const bassStem = document.getElementById("dinosaurusBassStem");
  const pianoStem = document.getElementById("dinosaurusPianoStem");
  const drumsStem = document.getElementById("dinosaurusDrumsStem");
  const stringsStem = document.getElementById("dinosaurusStringsStem");
  const vocalsStem = document.getElementById("dinosaurusVocalsStem");

  const analysisStems = [
    windStem && { id: "flute", audio: windStem },
    guitarStem && { id: "guitar", audio: guitarStem },
    bassStem && { id: "bass", audio: bassStem },
    pianoStem && { id: "piano", audio: pianoStem },
    drumsStem && { id: "drums", audio: drumsStem },
    stringsStem && { id: "strings", audio: stringsStem },
    vocalsStem && { id: "vocals", audio: vocalsStem },
  ].filter(Boolean);

  PlotterMachine.boot(mount, {
    baseDir: "../assets/svg/songs/dinosaurus",
    score: DINOSAURUS_SCORE,
    style: DINOSAURUS_STYLE,
    transport: {
      audio,
      analysisStems,
      playButton: playBtn,
      pauseButton: document.getElementById("pauseBtn"),
      timeline: document.getElementById("timeline"),
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: DINOSAURUS_SPIN_DURATION_SEC,
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
      console.error("[dinosaurus] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (typeof markTrackListened === "function") {
        markTrackListened("track-b3");
      }
    });
  }
});
