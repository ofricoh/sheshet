/* ============================================================
   DINOSAURUS JR. (דינוזאורוס הבן) — Plotter Machine score
   ------------------------------------------------------------
   A fast, stem-reactive journey through Misgav — layers enter,
   develop, erase, and return. Nothing sits frozen on screen.
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

/** Quick guest clear — tight window, no lingering. */
const DINOSAURUS_GUEST_CLEAR = (from, until) => ({ from, until });

/** Section exit — draw ends, living-cycle clears shortly after. */
const DINOSAURUS_SECTION_EXIT = (from, until) => ({ from, until });

/* ── Living-cycle pools — continuous draw/erase motion ─────── */

/** Restless opening — rapid turnover. */
const DINOSAURUS_LIVING_OPEN = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 4,
    cyclesPerUnit: [2, 4],
    finalClearSec: 1.0,
    durationRange: [0.4, 1.2],
    eraseDurationRange: [0.3, 0.9],
    holdRange: [0.03, 0.15],
    gapRange: [0.06, 0.28],
    staggerRange: [0.05, 0.22],
    minDuration: 0.25,
  },
};

/** Mid-song passages — rhythmic but readable. */
const DINOSAURUS_LIVING_MID = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 3,
    cyclesPerUnit: [2, 3],
    finalClearSec: 1.8,
    durationRange: [0.85, 2.4],
    eraseDurationRange: [0.6, 1.75],
    holdRange: [0.1, 0.4],
    gapRange: [0.18, 0.65],
    staggerRange: [0.15, 0.5],
    minDuration: 0.55,
  },
};

/** Homes anchor — bass-pulsed living texture from 01:28. */
const DINOSAURUS_LIVING_HOMES = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 3,
    cyclesPerUnit: [3, 5],
    finalClearSec: 2.2,
    durationRange: [1.4, 3.8],
    eraseDurationRange: [1.1, 2.8],
    holdRange: [0.12, 0.45],
    gapRange: [0.2, 0.7],
    staggerRange: [0.25, 0.75],
    minDuration: 0.9,
  },
};

/** Vocal chaos — fast overlapping turnover. */
const DINOSAURUS_LIVING_CHAOS = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 5,
    cyclesPerUnit: [2, 4],
    finalClearSec: 0.9,
    durationRange: [0.35, 1.05],
    eraseDurationRange: [0.28, 0.82],
    holdRange: [0.02, 0.12],
    gapRange: [0.04, 0.2],
    staggerRange: [0.04, 0.18],
    minDuration: 0.2,
  },
};

/** Guest weave — quick in/out cycles. */
const DINOSAURUS_LIVING_GUEST = {
  strategy: "living-cycle",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 3,
    cyclesPerUnit: [2, 3],
    finalClearSec: 0.8,
    durationRange: [0.5, 1.5],
    eraseDurationRange: [0.35, 1.0],
    holdRange: [0.04, 0.18],
    gapRange: [0.08, 0.32],
    staggerRange: [0.06, 0.25],
    minDuration: 0.3,
  },
};

/** Field hatching — organic living pool. */
const DINOSAURUS_FIELDS_LIVING = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 2,
    cyclesPerUnit: [2, 3],
    finalClearSec: 1.5,
    durationRange: [0.75, 2.2],
    eraseDurationRange: [0.55, 1.5],
    holdRange: [0.08, 0.35],
    gapRange: [0.15, 0.55],
    staggerRange: [0.12, 0.42],
    minDuration: 0.5,
  },
};

/** Guitar-rhythmic fields (03:45). */
const DINOSAURUS_FIELDS_GUITAR_LIVING = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 3,
    cyclesPerUnit: [2, 4],
    finalClearSec: 1.4,
    durationRange: [0.55, 1.65],
    eraseDurationRange: [0.4, 1.2],
    holdRange: [0.05, 0.22],
    gapRange: [0.1, 0.38],
    staggerRange: [0.08, 0.32],
    minDuration: 0.35,
  },
};

/** Flute long lines — slow draw, tremble while held, erase along pen. */
const DINOSAURUS_FLUTE_LIVING = {
  strategy: "flute-living",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 3,
    drawWindow: 10,
    eraseBudget: 4.5,
    durationRange: [1.4, 3.6],
    eraseDurationRange: [0.7, 2.0],
    staggerRange: [0.22, 0.72],
    minDuration: 0.9,
  },
};

/** House anchor — deliberate architecture, clears before 01:28. */
const DINOSAURUS_HOUSE_ANCHOR = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 2,
    durationRange: [2.8, 7.5],
    minDuration: 2.0,
    staggerRange: [0.65, 1.85],
    eraseDurationRange: [1.8, 4.8],
  },
};

/** Homes overlay — additive structural return (04:31). */
const DINOSAURUS_HOMES_OVERLAY_LIVING = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 3,
    cyclesPerUnit: [2, 4],
    finalClearSec: 2.5,
    durationRange: [1.2, 3.4],
    eraseDurationRange: [1.0, 2.6],
    holdRange: [0.1, 0.38],
    gapRange: [0.18, 0.6],
    staggerRange: [0.2, 0.65],
    minDuration: 0.75,
  },
};

const DINOSAURUS_MONUMENT_LIVING = {
  strategy: "living-cycle",
  pool: {
    maxConcurrent: 2,
    cyclesPerUnit: [2, 3],
    finalClearSec: 2.0,
    durationRange: [1.6, 4.2],
    eraseDurationRange: [1.2, 3.0],
    holdRange: [0.15, 0.5],
    gapRange: [0.25, 0.8],
    staggerRange: [0.2, 0.65],
    minDuration: 1.0,
  },
};

/* ── Stem-reactive modulation ──────────────────────────────── */

const DINOSAURUS_FLUTE_REACT = {
  tremble: {
    source: "flute",
    maxPx: 1.45,
    minPx: 0.05,
    freq1: 44,
    freq2: 61,
    freq3: 27,
  },
  drawSpeed: {
    source: "flute",
    longLineShare: 0.42,
    slowMult: 0.58,
    fastMult: 2.65,
    dynamicsWeight: 0.62,
    follow: 0.18,
  },
};

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

const DINOSAURUS_FLUTE_SPEED = DINOSAURUS_FLUTE_REACT.drawSpeed;

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
      ...DINOSAURUS_FIELDS_LIVING,
      draw: { at: 0, until: 26 },
      erase: DINOSAURUS_SECTION_EXIT(24, 32),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 0, until: 32 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_open_1",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 1, until: 12 },
      erase: DINOSAURUS_GUEST_CLEAR(10, 14),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 1, until: 14 },
      },
    },

    {
      id: "dinosaurus_guest_place_open_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 3, until: 15 },
      erase: DINOSAURUS_GUEST_CLEAR(12, 16),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 3, until: 16 },
      },
    },

    {
      id: "dinosaurus_street_open",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_LIVING_OPEN,
      draw: { at: 5, until: 30 },
      erase: DINOSAURUS_SECTION_EXIT(26, 35),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 5, until: 35 },
      },
    },

    {
      id: "dinosaurus_guest_street_open_1",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 7, until: 18 },
      erase: DINOSAURUS_GUEST_CLEAR(15, 19),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 7, until: 19 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_open_2",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 12, until: 24 },
      erase: DINOSAURUS_GUEST_CLEAR(21, 25),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 12, until: 25 },
      },
    },

    {
      id: "dinosaurus_guest_place_open_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 15, until: 28 },
      erase: DINOSAURUS_GUEST_CLEAR(25, 30),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 15, until: 30 },
      },
    },

    {
      id: "dinosaurus_fields_open_2",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS_LIVING,
      draw: { at: 18, until: 36 },
      erase: DINOSAURUS_SECTION_EXIT(30, 38),
      modulation: {
        drawSpeed: { ...DINOSAURUS_BASS_SPEED, from: 18, until: 38 },
      },
    },

    {
      id: "dinosaurus_guest_street_open_2",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 22, until: 34 },
      erase: DINOSAURUS_GUEST_CLEAR(30, 35),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 22, until: 35 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_open_3",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_GUEST,
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
      ...DINOSAURUS_LIVING_MID,
      draw: { at: 34, until: 78 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 34, until: 88 },
      },
    },

    {
      id: "dinosaurus_fields_bridge",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS_LIVING,
      draw: { at: 36, until: 76 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_STRINGS_SPEED, from: 36, until: 88 },
      },
    },

    {
      id: "dinosaurus_guest_place_bridge",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 44, until: 58 },
      erase: DINOSAURUS_GUEST_CLEAR(55, 60),
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 44, until: 60 },
        tremble: { ...DINOSAURUS_FLUTE_REACT.tremble, from: 44, until: 60 },
      },
    },

    /* Layer 3 — house (01:01:00; clears before 01:28) */
    {
      id: "dinosaurus_house_anchor",
      file: "Dinosaurus_house.svg",
      ...DINOSAURUS_HOUSE_ANCHOR,
      draw: { at: 61, until: 82 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_HOUSE_SPEED, from: 61, until: 88 },
      },
    },

    {
      id: "dinosaurus_street_house_pass",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_LIVING_MID,
      draw: { at: 58, until: 78 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 58, until: 88 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_house",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 68, until: 78 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 68, until: 88 },
      },
    },

    /* Layer 4 — homes (main layer from 01:28, bass-pulsed living) */
    {
      id: "dinosaurus_homes_main",
      file: "Dinosaurus_homes.svg",
      ...DINOSAURUS_LIVING_HOMES,
      draw: { at: 74, until: 163 },
      erase: DINOSAURUS_SECTION_EXIT(158, 172),
      modulation: {
        drawSpeed: {
          ...DINOSAURUS_HOMES_BASS_REACT.drawSpeed,
          from: 88,
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
      ...DINOSAURUS_FLUTE_LIVING,
      draw: { at: 100, until: 125 },
      erase: DINOSAURUS_SECTION_EXIT(122, 128),
      modulation: {
        tremble: { ...DINOSAURUS_FLUTE_REACT.tremble, from: 100, until: 128 },
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 100, until: 128 },
      },
    },

    /* ── 02:05 → 02:22 — vocal chaos returns ─────────────────── */

    {
      id: "dinosaurus_chaos_vocal_dalia_1",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 125, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(138, 143),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 125, until: 143 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_place_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 127, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(139, 143),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 127, until: 143 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_1",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 128, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(140, 144),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 128, until: 144 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_fields_1",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 130, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(139, 143),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 130, until: 143 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_1b",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 132, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(140, 144),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 132, until: 144 },
      },
    },

    /* ── Homes breathe — bass pulse between main homes and act II peak ── */

    {
      id: "dinosaurus_homes_breathe",
      file: "Dinosaurus_homes.svg",
      ...DINOSAURUS_LIVING_HOMES,
      draw: { at: 163, until: 188 },
      erase: DINOSAURUS_SECTION_EXIT(184, 192),
      pool: {
        ...DINOSAURUS_LIVING_HOMES.pool,
        maxConcurrent: 2,
        cyclesPerUnit: [2, 3],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_BASS_SPEED, from: 163, until: 192 },
        inkBreath: {
          source: "bass",
          from: 163,
          until: 192,
          energy: 0.32,
          depthRange: [0.008, 0.022],
        },
      },
    },

    /* ── ACT II — monument & square (~02:22 → ~03:45) ────────── */

    {
      id: "dinosaurus_pesel_main",
      file: "Dinosaurus_pesel.svg",
      ...DINOSAURUS_MONUMENT_LIVING,
      draw: { at: 142, until: 188 },
      erase: DINOSAURUS_SECTION_EXIT(185, 200),
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 142, until: 188 },
        tremble: { ...DINOSAURUS_FLUTE_REACT.tremble, from: 142, until: 200 },
      },
    },

    /* ── 02:43 → 03:40 — flute lines on top of everything ────── */

    {
      id: "dinosaurus_flute_lines_2",
      file: "../autumnnights/autumnnights_lines.svg",
      ...DINOSAURUS_FLUTE_LIVING,
      draw: { at: 163, until: 220 },
      erase: DINOSAURUS_SECTION_EXIT(216, 222),
      pool: {
        ...DINOSAURUS_FLUTE_LIVING.pool,
        maxConcurrent: 4,
        durationRange: [1.2, 3.2],
        staggerRange: [0.18, 0.62],
      },
      modulation: {
        tremble: { ...DINOSAURUS_FLUTE_REACT.tremble, from: 163, until: 222 },
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 163, until: 222 },
      },
    },

    {
      id: "dinosaurus_riboa_pass",
      file: "Dinosaurus_riboa.svg",
      ...DINOSAURUS_LIVING_MID,
      draw: { at: 168, until: 218 },
      erase: DINOSAURUS_SECTION_EXIT(212, 226),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 168, until: 218 },
      },
    },

    {
      id: "dinosaurus_street_return_1",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_LIVING_MID,
      draw: { at: 205, until: 248 },
      erase: DINOSAURUS_SECTION_EXIT(244, 252),
      pool: {
        ...DINOSAURUS_LIVING_MID.pool,
        maxConcurrent: 4,
        cyclesPerUnit: [3, 5],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 205, until: 252 },
      },
    },

    /* Transitional weave — drums between street and guitar fields */
    {
      id: "dinosaurus_street_weave",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_LIVING_OPEN,
      draw: { at: 218, until: 228 },
      erase: DINOSAURUS_SECTION_EXIT(225, 230),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 218, until: 230 },
      },
    },

    /* Strings shimmer — fills gap before guitar fields */
    {
      id: "dinosaurus_fields_strings",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS_LIVING,
      draw: { at: 200, until: 228 },
      erase: DINOSAURUS_SECTION_EXIT(224, 230),
      modulation: {
        drawSpeed: { ...DINOSAURUS_STRINGS_SPEED, from: 200, until: 230 },
      },
    },

    /* ── 03:45 — fields line layer, guitar-rhythmic ──────────── */

    {
      id: "dinosaurus_fields_guitar",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS_GUITAR_LIVING,
      draw: { at: 225, until: 268 },
      erase: DINOSAURUS_SECTION_EXIT(262, 272),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 225, until: 272 },
        inkBreath: {
          source: "guitar",
          from: 225,
          until: 272,
          energy: 0.38,
          depthRange: [0.014, 0.034],
          speed: 1.2,
        },
      },
    },

    /* ── ACT III — restless peak (~04:08 → ~05:50) ───────────── */

    {
      id: "dinosaurus_guest_place_peak_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 248, until: 278 },
      erase: DINOSAURUS_SECTION_EXIT(274, 280),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 248, until: 280 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_peak",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 262, until: 292 },
      erase: DINOSAURUS_SECTION_EXIT(288, 294),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 262, until: 294 },
      },
    },

    {
      id: "dinosaurus_guest_street_peak",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 275, until: 305 },
      erase: DINOSAURUS_SECTION_EXIT(301, 307),
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 275, until: 307 },
      },
    },

    /* ── 04:31 — homes return on top (additive living) ───────── */

    {
      id: "dinosaurus_homes_overlay",
      file: "Dinosaurus_homes.svg",
      ...DINOSAURUS_HOMES_OVERLAY_LIVING,
      draw: { at: 271, until: 355 },
      erase: DINOSAURUS_DISSOLVE(386, 394),
      modulation: {
        drawSpeed: { ...DINOSAURUS_BASS_SPEED, from: 271, until: 355 },
        inkBreath: {
          source: "bass",
          from: 271,
          until: 355,
          energy: 0.36,
          depthRange: [0.01, 0.026],
          speed: 0.95,
        },
      },
    },

    {
      id: "dinosaurus_all_peak",
      file: "Dinosaurus_all.svg",
      strategy: "living-cycle",
      draw: { at: 268, until: 328 },
      erase: DINOSAURUS_SECTION_EXIT(324, 332),
      pool: {
        maxConcurrent: 2,
        cyclesPerUnit: [2, 3],
        finalClearSec: 2.8,
        durationRange: [2.2, 5.8],
        eraseDurationRange: [1.6, 4.0],
        holdRange: [0.2, 0.65],
        gapRange: [0.3, 0.9],
        staggerRange: [0.25, 0.75],
        minDuration: 1.5,
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 268, until: 328 },
      },
    },

    /* ── ACT IV — second wave (~05:10 → 05:50) ───────────────── */

    {
      id: "dinosaurus_riboa_return",
      file: "Dinosaurus_riboa.svg",
      ...DINOSAURUS_LIVING_MID,
      draw: { at: 310, until: 352 },
      erase: DINOSAURUS_SECTION_EXIT(348, 356),
      pool: {
        ...DINOSAURUS_LIVING_MID.pool,
        maxConcurrent: 4,
        cyclesPerUnit: [3, 4],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 310, until: 352 },
      },
    },

    /* ── 05:19 — flute lines echo ──────────────────────────────── */

    {
      id: "dinosaurus_flute_lines_3",
      file: "../autumnnights/autumnnights_lines.svg",
      ...DINOSAURUS_FLUTE_LIVING,
      draw: { at: 319, until: 355 },
      erase: DINOSAURUS_DISSOLVE(377, 384),
      pool: {
        ...DINOSAURUS_FLUTE_LIVING.pool,
        maxConcurrent: 4,
        durationRange: [1.0, 2.8],
        staggerRange: [0.16, 0.55],
      },
      modulation: {
        tremble: { ...DINOSAURUS_FLUTE_REACT.tremble, from: 319, until: 355 },
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 319, until: 355 },
      },
    },

    {
      id: "dinosaurus_guest_place_peak_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 328, until: 348 },
      erase: DINOSAURUS_SECTION_EXIT(344, 350),
      modulation: {
        drawSpeed: { ...DINOSAURUS_PIANO_SPEED, from: 328, until: 350 },
      },
    },

    {
      id: "dinosaurus_guest_dalia_return",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_GUEST,
      draw: { at: 335, until: 355 },
      erase: DINOSAURUS_SECTION_EXIT(351, 357),
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 335, until: 357 },
      },
    },

    {
      id: "dinosaurus_street_return_2",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_LIVING_MID,
      draw: { at: 325, until: 365 },
      erase: DINOSAURUS_SECTION_EXIT(361, 368),
      pool: {
        ...DINOSAURUS_LIVING_MID.pool,
        maxConcurrent: 4,
        cyclesPerUnit: [3, 5],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_DRUMS_SPEED, from: 325, until: 365 },
      },
    },

    {
      id: "dinosaurus_pesel_return",
      file: "Dinosaurus_pesel.svg",
      ...DINOSAURUS_MONUMENT_LIVING,
      draw: { at: 338, until: 372 },
      erase: DINOSAURUS_DISSOLVE(388, 395),
      pool: {
        ...DINOSAURUS_MONUMENT_LIVING.pool,
        eraseDurationRange: DINOSAURUS_FINAL_ERASE_RANGE,
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 338, until: 372 },
        tremble: { ...DINOSAURUS_FLUTE_REACT.tremble, from: 338, until: 372 },
      },
    },

    /* ── 05:50 → 06:15 — vocal chaos returns ─────────────────── */

    {
      id: "dinosaurus_chaos_vocal_dalia_2",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 350, until: 375 },
      erase: DINOSAURUS_DISSOLVE(375, 380),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 350, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_place_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 352, until: 375 },
      erase: DINOSAURUS_DISSOLVE(376, 381),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 352, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_2",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 354, until: 375 },
      erase: DINOSAURUS_DISSOLVE(375, 380),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 354, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_fields_2",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 356, until: 375 },
      erase: DINOSAURUS_DISSOLVE(377, 382),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 356, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_2b",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_LIVING_CHAOS,
      draw: { at: 358, until: 375 },
      erase: DINOSAURUS_DISSOLVE(378, 383),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 358, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_dalia_2b",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_LIVING_CHAOS,
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
      ...DINOSAURUS_FIELDS_LIVING,
      draw: { at: 362, until: 388 },
      erase: DINOSAURUS_DISSOLVE(389, 396),
      pool: {
        ...DINOSAURUS_FIELDS_LIVING.pool,
        maxConcurrent: 1,
        cyclesPerUnit: [1, 2],
        durationRange: [1.8, 4.5],
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
        tremble: {
          ...DINOSAURUS_FLUTE_REACT.tremble,
          from: 370,
          until: 396,
          maxPx: 0.85,
          energy: 0.55,
        },
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
