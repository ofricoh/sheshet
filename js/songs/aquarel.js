/* ============================================================
   AQUAREL (צבעים) — Plotter Machine score
   ------------------------------------------------------------
   Stem-aware composition: drums drive rhythm, piano sets pacing,
   guitar shapes phrasing, wind/flute breathes through the melody.
   Creative instructions only — the engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = false;

/** Matches album track listing (6:47). */
const AQUAREL_SPIN_DURATION_SEC = 331;

const AQUAREL_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Canvas must never stay empty longer than this (seconds). */
const AQUAREL_MAX_SILENCE_SEC = 2;

/** Final strokes dissolve before the record ends. */
const AQUAREL_FINAL_WIPE = { from: 402, until: 407 };

/** Shared fade envelope for audio-driven modulation (seconds). */
const AQUAREL_MOD_FADE = { fadeIn: 1.4, fadeOut: 1.8 };

/** Stem-driven draw + ink reactions — restrained, pen-plotter calm. */
const AQUAREL_FLUTE_REACT = {
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

const AQUAREL_GUITAR_REACT = {
  drawSpeed: {
    source: "guitar",
    longLineShare: 0.28,
    slowMult: 0.5,
    fastMult: 2.0,
    dynamicsWeight: 0.55,
    follow: 0.14,
  },
  inkBreath: {
    source: "guitar",
    intensityIdle: 0.18,
    depthRangeIdle: [0.008, 0.018],
    depthRange: [0.03, 0.065],
    energy: 0.3,
    speedIdle: 0.45,
    speed: 1.4,
  },
  flicker: {
    source: "guitar",
    attackThreshold: 0.3,
    recentMemory: 24,
    windows: [
      {
        from: 0,
        until: 999,
        count: [1, 3],
        blinkDuration: [0.1, 0.24],
        minGap: 0.32,
      },
    ],
  },
};

const AQUAREL_DRUM_REACT = {
  inkBreath: {
    source: "drums",
    intensityIdle: 0.32,
    depthRangeIdle: [0.02, 0.04],
    depthRange: [0.06, 0.12],
    energy: 0.55,
    dynamicsWeight: 0.52,
    speedIdle: 0.85,
    speed: 2.2,
    freq1: 0.44,
    freq2: 0.62,
    freq3: 0.36,
    travel: 1.8,
  },
  drawSpeed: {
    source: "drums",
    longLineShare: 0.16,
    slowMult: 0.55,
    fastMult: 3.2,
    dynamicsWeight: 0.65,
    follow: 0.2,
    energy: 1.15,
  },
};

const AQUAREL_PIANO_REACT = {
  drawSpeed: {
    source: "piano",
    longLineShare: 0.35,
    slowMult: 0.68,
    fastMult: 3.5,
    dynamicsWeight: 0.68,
    follow: 0.2,
    energy: 1.05,
  },
  inkBreath: {
    source: "piano",
    intensityIdle: 0.22,
    depthRangeIdle: [0.012, 0.028],
    depthRange: [0.035, 0.08],
    energy: 0.42,
    speedIdle: 0.55,
    speed: 1.65,
  },
};

const AQUAREL_BASS_REACT = {
  inkBreath: {
    source: "bass",
    intensityIdle: 0.2,
    depthRangeIdle: [0.015, 0.032],
    depthRange: [0.04, 0.085],
    energy: 0.48,
    dynamicsWeight: 0.48,
    speedIdle: 0.65,
    speed: 1.15,
  },
  drawSpeed: {
    source: "bass",
    longLineShare: 0.22,
    slowMult: 0.55,
    fastMult: 1.75,
    dynamicsWeight: 0.45,
    follow: 0.12,
  },
};

const AQUAREL_OTHER_REACT = {
  inkBreath: {
    source: "other",
    intensityIdle: 0.24,
    depthRangeIdle: [0.01, 0.025],
    depthRange: [0.028, 0.058],
    energy: 0.38,
    speedIdle: 0.5,
    speed: 1.25,
  },
  drawSpeed: {
    source: "other",
    longLineShare: 0.26,
    slowMult: 0.58,
    fastMult: 1.85,
    dynamicsWeight: 0.5,
    follow: 0.12,
  },
};

const AQUAREL_STRINGS_REACT = {
  tremble: {
    source: "strings",
    maxPx: 0.85,
    minPx: 0.03,
    freq1: 18,
    freq2: 26,
    freq3: 12,
    energy: 0.65,
  },
  drawSpeed: {
    source: "strings",
    longLineShare: 0.3,
    slowMult: 0.6,
    fastMult: 1.65,
    dynamicsWeight: 0.42,
    follow: 0.1,
  },
};

/** Fast drum-circle pool for rhythmic coda bursts. */
const AQUAREL_DRUM_BURST = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 6,
    durationRange: [0.12, 0.48],
    minDuration: 0.08,
    staggerRange: [0.02, 0.08],
    eraseDurationRange: [0.25, 0.65],
  },
};

/** Piano-locked fast plotting for the storm peak. */
const AQUAREL_PIANO_FAST = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 5,
    durationRange: [0.18, 0.65],
    minDuration: 0.12,
    staggerRange: [0.03, 0.1],
    eraseDurationRange: [0.3, 0.75],
  },
};

/** Kineret + deadsea — gradual dissolve centered on 00:37:00. */
const AQUAREL_OPENING_VANISH = {
  from: 34,
  until: 40,
};

/** Bus + work — gentle clear around 00:46:00. */
const AQUAREL_BUS_WORK_CLEAR = {
  from: 44.5,
  until: 49.5,
};

/** Shared pen settings so bus + work feel like one composition. */
const AQUAREL_BUS_WORK_LAYER = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 4,
    durationRange: [1.0, 3.2],
    minDuration: 0.6,
    staggerRange: [0.18, 0.7],
    eraseDurationRange: [0.45, 1.2],
  },
};

/** Shimshit → rounds handoff around 01:24:00. */
const AQUAREL_SHIMSHIT_HANDOFF = {
  from: 81,
  until: 86.5,
};

/** Telaviv → ashdod handoff around 01:46:00. */
const AQUAREL_TELAVIV_HANDOFF = {
  from: 103.5,
  until: 108.5,
};

/** Ashdod fades out around 02:21:00. */
const AQUAREL_ASHDOD_EXIT = {
  from: 138,
  until: 143.5,
};

/* ============================================================
   BORROWED MEMORIES — layers on loan from other songs
   ------------------------------------------------------------
   Aquarel is the album's meeting point: a piece that keeps
   remembering other places. These presets let a layer from a
   sibling song surface briefly inside Aquarel's own composition,
   drawn in the SAME white pen so it reads as a remembered motif
   rather than a quotation. Following the album's established
   guest-layer grammar (see Dinosaurus): allowViewBoxMismatch so
   the loan keeps its own hand, no repositioning, always erases
   again. Every appearance below is tied to a real event in the
   arrangement — a memory the music itself seems to reach for.
   ============================================================ */

/** Quick guest — a place flickering past (roads, rounds, a bus). */
const AQUAREL_GUEST = {
  strategy: "edge-stagger",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 2,
    durationRange: [0.9, 2.6],
    minDuration: 0.55,
    staggerRange: [0.2, 0.7],
    eraseDurationRange: [0.5, 1.6],
  },
};

/** Slow memory — water surfacing quietly, one line at a time. */
const AQUAREL_MEMORY = {
  strategy: "organic-pool",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 1,
    speedRange: [0.4, 0.62],
    durationRange: [1.6, 3.0],
    minDuration: 1.1,
    staggerRange: [0.5, 1.4],
    eraseDurationRange: [0.8, 2.2],
  },
};

/** Airy memory — a borrowed line that breathes with Aquarel's flute. */
const AQUAREL_MEMORY_FLUTE = {
  strategy: "flute-living",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 2,
    drawWindow: 14,
    eraseBudget: 3,
    durationRange: [2.2, 4.6],
    minDuration: 1.4,
    staggerRange: [0.4, 1.0],
    eraseDurationRange: [0.7, 1.8],
  },
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
        eraseDurationRange: [0.55, 1.6],
      },
      modulation: {
        inkBreath: { ...AQUAREL_OTHER_REACT.inkBreath, from: 0, until: 40, ...AQUAREL_MOD_FADE },
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
        eraseDurationRange: [0.55, 1.6],
      },
      modulation: {
        inkBreath: { ...AQUAREL_OTHER_REACT.inkBreath, from: 9, until: 40, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_OTHER_REACT.drawSpeed, from: 20, until: 40, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 3 — bus (00:37 → 00:46, shared clear 00:46 → 00:48) */
    {
      file: "aquarel_bus.svg",
      ...AQUAREL_BUS_WORK_LAYER,
      draw: { at: 37, until: 46 },
      erase: AQUAREL_BUS_WORK_CLEAR,
      modulation: {
        inkBreath: { ...AQUAREL_DRUM_REACT.inkBreath, from: 38, until: 50, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_BASS_REACT.drawSpeed, from: 39, until: 50, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 4 — work (00:37 → 00:46, shared clear 00:46 → 00:48) */
    {
      file: "aquarel_work.svg",
      ...AQUAREL_BUS_WORK_LAYER,
      draw: { at: 37, until: 46 },
      erase: AQUAREL_BUS_WORK_CLEAR,
      modulation: {
        inkBreath: { ...AQUAREL_DRUM_REACT.inkBreath, from: 38, until: 50, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_GUITAR_REACT.drawSpeed, from: 47, until: 50, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 5 — shimshit (00:48 → 01:24, guitar/bass before wind enters) */
    {
      file: "aquarel_shimshit.svg",
      strategy: "flute-living",
      draw: { at: 48, until: 84 },
      erase: AQUAREL_SHIMSHIT_HANDOFF,
      pool: {
        maxConcurrent: 3,
        drawWindow: 28,
        eraseBudget: 1.8,
        durationRange: [3.0, 6.8],
        minDuration: 2.2,
        staggerRange: [0.5, 1.15],
        eraseDurationRange: [0.45, 1.15],
      },
      modulation: {
        drawSpeed: { ...AQUAREL_GUITAR_REACT.drawSpeed, from: 48, until: 87, ...AQUAREL_MOD_FADE },
        inkBreath: { ...AQUAREL_BASS_REACT.inkBreath, from: 48, until: 87, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 6 — rounds (01:24 → ~01:30, fade out 01:26 → 01:45) */
    {
      file: "aquarel_rounds.svg",
      strategy: "edge-stagger",
      draw: { at: 84, until: 92 },
      erase: { from: 84.5, until: 106 },
      pool: {
        maxConcurrent: 3,
        durationRange: [1.2, 3.4],
        minDuration: 0.75,
        staggerRange: [0.25, 0.85],
        eraseDurationRange: [0.65, 2.0],
      },
      modulation: {
        inkBreath: { ...AQUAREL_DRUM_REACT.inkBreath, from: 84, until: 106, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_FLUTE_REACT.drawSpeed, from: 88, until: 106, ...AQUAREL_MOD_FADE },
        tremble: { ...AQUAREL_FLUTE_REACT.tremble, from: 88, until: 106, ...AQUAREL_MOD_FADE },
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
        eraseDurationRange: [0.45, 1.25],
      },
      modulation: {
        inkBreath: { ...AQUAREL_GUITAR_REACT.inkBreath, from: 86, until: 109, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_FLUTE_REACT.drawSpeed, from: 90, until: 109, ...AQUAREL_MOD_FADE },
        tremble: { ...AQUAREL_FLUTE_REACT.tremble, from: 90, until: 109, ...AQUAREL_MOD_FADE },
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
        eraseDurationRange: [0.5, 1.4],
      },
      modulation: {
        inkBreath: { ...AQUAREL_BASS_REACT.inkBreath, from: 106, until: 144, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_GUITAR_REACT.drawSpeed, from: 112, until: 144, ...AQUAREL_MOD_FADE },
        tremble: { ...AQUAREL_STRINGS_REACT.tremble, from: 128, until: 144, ...AQUAREL_MOD_FADE },
      },
    },

    /* ========================================================
       WOVEN MEMORIES — other songs surfacing inside Aquarel
       Appended last (drawn over the existing composition) and
       always cleared again. Times follow the arrangement.
       ======================================================== */

    /* Memory A — Inbalim's water beneath the Dead Sea.
       00:20 → 00:33, under the still opening (deadsea is live
       here); the small stirrings in the intro let another
       body of water surface briefly. Gone before the 00:37
       vanish that clears the whole opening. */
    {
      id: "aquarel_mem_inbalim_water_1",
      file: "../inbalim/inbalim_water.svg",
      ...AQUAREL_MEMORY,
      draw: { at: 20, until: 32 },
      erase: { from: 31.5, until: 39 },
    },

    /* Memory B — a bus from Seven-Eight at the arrival.
       00:38 → 00:45, over Aquarel's own bus + work as the
       band lands (bright transient at 00:39). Two towns share
       the same instant, then clear together at 00:46 → 00:48. */
    {
      id: "aquarel_mem_seveneight_bus",
      file: "../seveneight/seveneight_bus.svg",
      ...AQUAREL_GUEST,
      draw: { at: 38, until: 45.5 },
      erase: AQUAREL_BUS_WORK_CLEAR,
    },

    /* Memory C — Autumn Nights' wave, breathing with the wind stem.
       01:24 → 02:02, aligned to when the isolated wind stem enters;
       modulated by flute so a wave from another song rises with
       Aquarel's melody. Recedes before the ashdod exit. */
    {
      id: "aquarel_mem_autumn_wave_1",
      file: "../autumnnights/autumnnights_wave.svg",
      ...AQUAREL_MEMORY_FLUTE,
      draw: { at: 84, until: 118 },
      erase: { from: 117, until: 130 },
      modulation: {
        tremble: { ...AQUAREL_FLUTE_REACT.tremble, from: 84, until: 130, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_FLUTE_REACT.drawSpeed, from: 84, until: 130, ...AQUAREL_MOD_FADE },
      },
    },

    /* Memory D — Inbalim's rounds echoing Aquarel's rounds.
       01:28 → 01:41, over the warm rhythmic turn where the
       rounds + telaviv are live. A circular motif remembering
       a circular motif. Clears before the 01:46 handoff. */
    {
      id: "aquarel_mem_inbalim_rounds",
      file: "../inbalim/inbalim_rounds.svg",
      ...AQUAREL_GUEST,
      draw: { at: 88, until: 101 },
      erase: { from: 99, until: 109 },
      modulation: {
        inkBreath: { ...AQUAREL_DRUM_REACT.inkBreath, from: 88, until: 109, ...AQUAREL_MOD_FADE },
      },
    },

    /* Memory E — Autumn Nights' highway toward the coast.
       01:52 → 02:10, threading over telaviv → ashdod as the
       groove drives forward. Guitar phrasing shapes the road. */
    {
      id: "aquarel_mem_autumn_kvish",
      file: "../autumnnights/autumnnights_kvish.svg",
      ...AQUAREL_GUEST,
      draw: { at: 112, until: 130 },
      erase: { from: 129, until: 142 },
      pool: {
        ...AQUAREL_GUEST.pool,
        durationRange: [1.4, 3.6],
        eraseDurationRange: [0.7, 2.0],
      },
      modulation: {
        drawSpeed: { ...AQUAREL_GUITAR_REACT.drawSpeed, from: 112, until: 142, ...AQUAREL_MOD_FADE },
        inkBreath: { ...AQUAREL_GUITAR_REACT.inkBreath, from: 112, until: 142, ...AQUAREL_MOD_FADE },
        flicker: { ...AQUAREL_GUITAR_REACT.flicker, from: 118, until: 142, ...AQUAREL_MOD_FADE },
      },
    },

    /* Memory F — Aquarel remembering itself: kineret returns.
       02:22 → 03:12. Bass and strings sustain the open plain;
       the pen breathes with the rebuild rather than a fixed grid. */
    {
      id: "aquarel_kineret_return",
      file: "aquarel_kineret.svg",
      strategy: "organic-pool",
      draw: { at: 140, until: 180, naturalPace: true },
      erase: { from: 182, until: 194 },
      pool: {
        maxConcurrent: 1,
        speedRange: [0.85, 1.0],
        durationRange: [8.0, 10.0],
        minDuration: 7.0,
        staggerRange: [0.4, 1.0],
        eraseDurationRange: [0.65, 1.6],
      },
      modulation: {
        drawSpeed: { ...AQUAREL_BASS_REACT.drawSpeed, from: 140, until: 194, ...AQUAREL_MOD_FADE },
        inkBreath: { ...AQUAREL_BASS_REACT.inkBreath, from: 146, until: 194, ...AQUAREL_MOD_FADE },
        tremble: { ...AQUAREL_STRINGS_REACT.tremble, from: 146, until: 194, ...AQUAREL_MOD_FADE },
      },
    },

    /* Memory G — the wave returns over the open plain.
       02:34 → 03:12, surfacing again as the other stem swells. */
    {
      id: "aquarel_mem_autumn_wave_2",
      file: "../autumnnights/autumnnights_wave.svg",
      ...AQUAREL_MEMORY,
      draw: { at: 154, until: 182 },
      erase: { from: 181, until: 194 },
      pool: {
        ...AQUAREL_MEMORY.pool,
        maxConcurrent: 2,
        durationRange: [2.0, 4.0],
      },
      modulation: {
        inkBreath: { ...AQUAREL_OTHER_REACT.inkBreath, from: 154, until: 194, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_OTHER_REACT.drawSpeed, from: 160, until: 194, ...AQUAREL_MOD_FADE },
      },
    },

    /* Memory H — a last water memory in the breakdown.
       03:12 → 03:48. Inbalim's water alone at the deepest drop,
       then overlapping into the rebuild so the canvas never rests. */
    {
      id: "aquarel_mem_inbalim_water_2",
      file: "../inbalim/inbalim_water.svg",
      ...AQUAREL_MEMORY,
      draw: { at: 192, until: 214 },
      erase: { from: 214, until: 230 },
      modulation: {
        inkBreath: { ...AQUAREL_OTHER_REACT.inkBreath, from: 192, until: 230, ...AQUAREL_MOD_FADE },
      },
    },

    /* ========================================================
       REBUILD — second half driven by bass, other, piano, drums
       Every window overlaps its neighbour; no silence > 2 s.
       ======================================================== */

    /* Layer 9 — dalia (03:44 → 04:36, bass rebuild) */
    {
      file: "aquarel_dalia.svg",
      strategy: "organic-pool",
      draw: { at: 224, until: 268, naturalPace: true },
      erase: { from: 268, until: 278 },
      pool: {
        maxConcurrent: 2,
        speedRange: [0.44, 0.68],
        durationRange: [2.4, 5.8],
        minDuration: 1.8,
        staggerRange: [0.35, 1.1],
        eraseDurationRange: [0.55, 1.4],
      },
      modulation: {
        inkBreath: { ...AQUAREL_BASS_REACT.inkBreath, from: 224, until: 278, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_OTHER_REACT.drawSpeed, from: 248, until: 278, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 10 — eilat (04:08 → 05:02, coast — other + strings) */
    {
      file: "aquarel_eilat.svg",
      strategy: "organic-pool",
      draw: { at: 248, until: 298, naturalPace: true },
      erase: { from: 298, until: 310 },
      pool: {
        maxConcurrent: 2,
        speedRange: [0.5, 0.74],
        durationRange: [2.2, 5.4],
        minDuration: 1.6,
        staggerRange: [0.3, 0.95],
        eraseDurationRange: [0.5, 1.3],
      },
      modulation: {
        inkBreath: { ...AQUAREL_OTHER_REACT.inkBreath, from: 248, until: 310, ...AQUAREL_MOD_FADE },
        tremble: { ...AQUAREL_STRINGS_REACT.tremble, from: 260, until: 310, ...AQUAREL_MOD_FADE },
      },
    },

    /* Memory I — wave memory during the rebuild swell. */
    {
      id: "aquarel_mem_autumn_wave_3",
      file: "../autumnnights/autumnnights_wave.svg",
      ...AQUAREL_MEMORY,
      draw: { at: 252, until: 282 },
      erase: { from: 282, until: 294 },
      modulation: {
        inkBreath: { ...AQUAREL_OTHER_REACT.inkBreath, from: 252, until: 294, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 11 — rounds return (05:04 → 05:36, drum rhythm) */
    {
      id: "aquarel_rounds_rebuild",
      file: "aquarel_rounds.svg",
      ...AQUAREL_DRUM_BURST,
      draw: { at: 304, until: 332 },
      erase: { from: 332, until: 344 },
      modulation: {
        inkBreath: { ...AQUAREL_DRUM_REACT.inkBreath, from: 304, until: 344, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_DRUM_REACT.drawSpeed, from: 304, until: 344, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 12 — work return (05:14 → 05:44, bass pulse under piano build) */
    {
      id: "aquarel_work_rebuild",
      file: "aquarel_work.svg",
      strategy: "edge-stagger",
      draw: { at: 314, until: 342 },
      erase: { from: 342, until: 354 },
      pool: {
        maxConcurrent: 3,
        durationRange: [0.8, 2.4],
        minDuration: 0.55,
        staggerRange: [0.12, 0.45],
        eraseDurationRange: [0.45, 1.1],
      },
      modulation: {
        inkBreath: { ...AQUAREL_BASS_REACT.inkBreath, from: 314, until: 354, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_BASS_REACT.drawSpeed, from: 314, until: 354, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 13 — telaviv coda (05:36 → 06:06, piano shapes pacing) */
    {
      id: "aquarel_telaviv_coda",
      file: "aquarel_telaviv.svg",
      ...AQUAREL_PIANO_FAST,
      draw: { at: 336, until: 364 },
      erase: { from: 364, until: 376 },
      modulation: {
        drawSpeed: { ...AQUAREL_PIANO_REACT.drawSpeed, from: 336, until: 376, ...AQUAREL_MOD_FADE },
        inkBreath: { ...AQUAREL_PIANO_REACT.inkBreath, from: 336, until: 376, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 14 — bus coda burst (05:40 → 06:10, drum + piano storm) */
    {
      id: "aquarel_bus_coda",
      file: "aquarel_bus.svg",
      ...AQUAREL_DRUM_BURST,
      draw: { at: 340, until: 368 },
      erase: { from: 368, until: 380 },
      modulation: {
        inkBreath: { ...AQUAREL_DRUM_REACT.inkBreath, from: 340, until: 380, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_PIANO_REACT.drawSpeed, from: 345, until: 380, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 15 — ashdod return (05:46 → 06:16, guitar phrasing) */
    {
      id: "aquarel_ashdod_coda",
      file: "aquarel_ashdod.svg",
      strategy: "edge-stagger",
      draw: { at: 346, until: 374 },
      erase: { from: 374, until: 386 },
      pool: {
        maxConcurrent: 3,
        durationRange: [0.9, 2.8],
        minDuration: 0.6,
        staggerRange: [0.15, 0.5],
        eraseDurationRange: [0.45, 1.2],
      },
      modulation: {
        drawSpeed: { ...AQUAREL_GUITAR_REACT.drawSpeed, from: 346, until: 386, ...AQUAREL_MOD_FADE },
        inkBreath: { ...AQUAREL_GUITAR_REACT.inkBreath, from: 346, until: 386, ...AQUAREL_MOD_FADE },
        flicker: { ...AQUAREL_GUITAR_REACT.flicker, from: 350, until: 386, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 16 — shimshit outro (06:08 → 06:42, wind/flute farewell) */
    {
      id: "aquarel_shimshit_outro",
      file: "aquarel_shimshit.svg",
      strategy: "flute-living",
      draw: { at: 368, until: 398 },
      erase: { from: 398, until: 406 },
      pool: {
        maxConcurrent: 2,
        drawWindow: 24,
        eraseBudget: 2.5,
        durationRange: [2.4, 5.6],
        minDuration: 1.8,
        staggerRange: [0.4, 1.0],
        eraseDurationRange: [0.5, 1.3],
      },
      modulation: {
        tremble: { ...AQUAREL_FLUTE_REACT.tremble, from: 368, until: 406, ...AQUAREL_MOD_FADE },
        drawSpeed: { ...AQUAREL_FLUTE_REACT.drawSpeed, from: 368, until: 406, ...AQUAREL_MOD_FADE },
      },
    },

    /* Layer 17 — kineret finale whisper (06:28 → end) */
    {
      id: "aquarel_kineret_finale",
      file: "aquarel_kineret.svg",
      strategy: "organic-pool",
      draw: { at: 388, until: 406, naturalPace: true },
      erase: AQUAREL_FINAL_WIPE,
      pool: {
        maxConcurrent: 1,
        speedRange: [0.78, 0.95],
        durationRange: [6.5, 9.0],
        minDuration: 5.5,
        staggerRange: [0.3, 0.8],
        eraseDurationRange: [0.55, 1.5],
      },
      modulation: {
        inkBreath: { ...AQUAREL_OTHER_REACT.inkBreath, from: 388, until: 407, ...AQUAREL_MOD_FADE },
        tremble: { ...AQUAREL_FLUTE_REACT.tremble, from: 396, until: 407, maxPx: 0.65, ...AQUAREL_MOD_FADE },
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("aquarelAudio");

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

  const windStem = document.getElementById("aquarelWindStem");
  const guitarStem = document.getElementById("aquarelGuitarStem");
  const bassStem = document.getElementById("aquarelBassStem");
  const pianoStem = document.getElementById("aquarelPianoStem");
  const drumsStem = document.getElementById("aquarelDrumsStem");
  const stringsStem = document.getElementById("aquarelStringsStem");
  const otherStem = document.getElementById("aquarelOtherStem");
  const vocalsStem = document.getElementById("aquarelVocalsStem");

  const analysisStems = [
    windStem && { id: "flute", audio: windStem },
    guitarStem && { id: "guitar", audio: guitarStem },
    bassStem && { id: "bass", audio: bassStem },
    pianoStem && { id: "piano", audio: pianoStem },
    drumsStem && { id: "drums", audio: drumsStem },
    stringsStem && { id: "strings", audio: stringsStem },
    otherStem && { id: "other", audio: otherStem },
    vocalsStem && { id: "vocals", audio: vocalsStem },
  ].filter(Boolean);

  PlotterMachine.boot(mount, {
    baseDir: "../assets/svg/songs/aquarel",
    score: AQUAREL_SCORE,
    style: AQUAREL_STYLE,
    transport: {
      audio,
      analysisStems,
      playButton: playBtn,
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

});
