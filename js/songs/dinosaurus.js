/* ============================================================
   DINOSAURUS JR. (דינוזאורוס הבן) — Plotter Machine score
   ------------------------------------------------------------
   A stem-aware journey through Misgav. Each layer draws, holds,
   erases along its pen direction, and may return later — nothing
   stays on screen for the whole song. Movement comes from the
   pen; reactive animation is used sparingly as accent.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = false;

/** Matches audio file duration (~6:38). */
const DINOSAURUS_SPIN_DURATION_SEC = 323;

const DINOSAURUS_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** 01:28:00 — everything except homes cleared by this point. */
const DINOSAURUS_CLEAR_FOR_HOMES = { from: 78, until: 88 };

/** Last strokes gone before the record ends. */
const DINOSAURUS_FINAL_WIPE = { from: 392, until: 396 };

const DINOSAURUS_FINAL_ERASE_RANGE = [0.4, 1.2];

/** Staggered coda exits — instruments fade one after another. */
const DINOSAURUS_DISSOLVE = (from, until) => ({ from, until });

/** Quick guest clear. */
const DINOSAURUS_GUEST_CLEAR = (from, until) => ({ from, until });

/** Section exit — every unit erased before the window closes. */
const DINOSAURUS_SECTION_EXIT = (from, until) => ({ from, until });

/* ── Pen-plotter pools — draw, hold, erase ─────────────────── */

const DINOSAURUS_EDGE = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 2,
    durationRange: [1.6, 4.8],
    minDuration: 1.1,
    staggerRange: [0.35, 1.05],
    eraseDurationRange: [1.3, 3.8],
  },
};

const DINOSAURUS_EDGE_SLOW = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 2,
    durationRange: [2.6, 7.2],
    minDuration: 1.9,
    staggerRange: [0.6, 1.75],
    eraseDurationRange: [1.8, 5.0],
  },
};

const DINOSAURUS_GUEST = {
  strategy: "edge-stagger",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 2,
    durationRange: [0.85, 2.4],
    minDuration: 0.55,
    staggerRange: [0.18, 0.65],
    eraseDurationRange: [0.75, 2.1],
  },
};

const DINOSAURUS_FIELDS = {
  strategy: "organic-pool",
  pool: {
    maxConcurrent: 2,
    speedRange: [0.42, 0.68],
    durationRange: [1.5, 4.2],
    minDuration: 1.1,
    staggerRange: [0.3, 0.95],
    eraseDurationRange: [1.1, 3.2],
  },
};

/** Homes — deliberate architecture. */
const DINOSAURUS_HOMES = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 2,
    durationRange: [2.4, 6.5],
    minDuration: 1.7,
    staggerRange: [0.5, 1.35],
    eraseDurationRange: [1.6, 4.5],
  },
};

/** Flute long lines — slow draw, brief hold, erase along pen. */
const DINOSAURUS_FLUTE_LIVING = {
  strategy: "flute-living",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 2,
    drawWindow: 9,
    eraseBudget: 4,
    durationRange: [1.6, 3.8],
    eraseDurationRange: [0.85, 2.2],
    staggerRange: [0.25, 0.75],
    minDuration: 1.0,
  },
};

/** Vocal chaos — fast turnover, only for vocal passages. */
const DINOSAURUS_CHAOS = {
  strategy: "living-cycle",
  allowViewBoxMismatch: true,
  pool: {
    maxConcurrent: 3,
    cyclesPerUnit: [2, 3],
    finalClearSec: 1.2,
    durationRange: [0.5, 1.4],
    eraseDurationRange: [0.4, 1.1],
    holdRange: [0.08, 0.28],
    gapRange: [0.12, 0.4],
    staggerRange: [0.1, 0.35],
    minDuration: 0.35,
  },
};

/* ── Calm stem draw-speed (pen rate only, no jitter) ──────── */

const DINOSAURUS_FLUTE_SPEED = {
  source: "flute",
  longLineShare: 0.4,
  slowMult: 0.62,
  fastMult: 1.85,
  dynamicsWeight: 0.48,
  follow: 0.1,
};

const DINOSAURUS_GUITAR_SPEED = {
  source: "guitar",
  longLineShare: 0.28,
  slowMult: 0.58,
  fastMult: 1.75,
  dynamicsWeight: 0.45,
  follow: 0.1,
};

const DINOSAURUS_VOCALS_SPEED = {
  source: "vocals",
  longLineShare: 0.3,
  slowMult: 0.56,
  fastMult: 1.9,
  dynamicsWeight: 0.48,
  follow: 0.11,
};

const DINOSAURUS_BASS_SPEED = {
  source: "bass",
  longLineShare: 0.24,
  slowMult: 0.6,
  fastMult: 1.65,
  dynamicsWeight: 0.42,
  follow: 0.09,
};

/** Subtle flute accent — one passage only, very restrained. */
const DINOSAURUS_FLUTE_TREMBLE = {
  source: "flute",
  maxPx: 0.35,
  minPx: 0.02,
  freq1: 22,
  freq2: 31,
  freq3: 14,
  energy: 0.45,
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const DINOSAURUS_SCORE = {
  style: DINOSAURUS_STYLE,
  artboard: { x: 0, y: 0, w: 1960.18, h: 1929.47 },
  layers: [
    /* ── OPENING (00:00 → 00:36) ───────────────────────────── */

    {
      id: "dinosaurus_fields_open_1",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS,
      draw: { at: 0, until: 22 },
      erase: DINOSAURUS_SECTION_EXIT(20, 28),
    },

    {
      id: "dinosaurus_guest_dalia_open_1",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 1, until: 11 },
      erase: DINOSAURUS_GUEST_CLEAR(9, 13),
    },

    {
      id: "dinosaurus_guest_place_open_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 3, until: 14 },
      erase: DINOSAURUS_GUEST_CLEAR(11, 15),
    },

    {
      id: "dinosaurus_street_open",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 5, until: 28 },
      erase: DINOSAURUS_SECTION_EXIT(24, 32),
    },

    {
      id: "dinosaurus_guest_street_open_1",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 7, until: 17 },
      erase: DINOSAURUS_GUEST_CLEAR(14, 18),
    },

    {
      id: "dinosaurus_guest_dalia_open_2",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 12, until: 22 },
      erase: DINOSAURUS_GUEST_CLEAR(19, 23),
    },

    {
      id: "dinosaurus_guest_place_open_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 15, until: 26 },
      erase: DINOSAURUS_GUEST_CLEAR(23, 28),
    },

    {
      id: "dinosaurus_fields_open_2",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS,
      draw: { at: 18, until: 34 },
      erase: DINOSAURUS_SECTION_EXIT(28, 36),
    },

    {
      id: "dinosaurus_guest_street_open_2",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 22, until: 32 },
      erase: DINOSAURUS_GUEST_CLEAR(28, 33),
    },

    {
      id: "dinosaurus_guest_dalia_open_3",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 26, until: 34 },
      erase: DINOSAURUS_GUEST_CLEAR(30, 35),
    },

    /* ── BRIDGE — house at 01:01, clear for homes at 01:28 ───── */

    {
      id: "dinosaurus_street_bridge",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 34, until: 72 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
    },

    {
      id: "dinosaurus_fields_bridge",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS,
      draw: { at: 36, until: 70 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
    },

    {
      id: "dinosaurus_guest_place_bridge",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 44, until: 56 },
      erase: DINOSAURUS_GUEST_CLEAR(52, 58),
    },

    /* Layer 3 — house (01:01; clears before 01:28) */
    {
      id: "dinosaurus_house_anchor",
      file: "Dinosaurus_house.svg",
      ...DINOSAURUS_EDGE_SLOW,
      draw: { at: 61, until: 80 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
    },

    {
      id: "dinosaurus_street_house_pass",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 58, until: 74 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
    },

    {
      id: "dinosaurus_guest_dalia_house",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 68, until: 76 },
      erase: DINOSAURUS_CLEAR_FOR_HOMES,
    },

    /* Layer 4 — homes (main from 01:28; gone by ~02:52) */
    {
      id: "dinosaurus_homes_main",
      file: "Dinosaurus_homes.svg",
      ...DINOSAURUS_HOMES,
      draw: { at: 88, until: 118 },
      erase: DINOSAURUS_SECTION_EXIT(158, 172),
      modulation: {
        drawSpeed: { ...DINOSAURUS_BASS_SPEED, from: 88, until: 172 },
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
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 100, until: 128 },
      },
    },

    /* ── 02:05 → 02:22 — vocal chaos ─────────────────────────── */

    {
      id: "dinosaurus_chaos_vocal_dalia_1",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 125, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(138, 143),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 125, until: 143 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_place_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 127, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(139, 143),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 127, until: 143 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_1",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 128, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(140, 144),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 128, until: 144 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_fields_1",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 130, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(139, 143),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 130, until: 143 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_1b",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 132, until: 142 },
      erase: DINOSAURUS_SECTION_EXIT(140, 144),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 132, until: 144 },
      },
    },

    /* ── ACT II — monument (~02:22 → ~03:45) ────────────────── */

    {
      id: "dinosaurus_pesel_main",
      file: "Dinosaurus_pesel.svg",
      strategy: "long-first",
      draw: { at: 142, until: 178, naturalPace: true },
      erase: DINOSAURUS_SECTION_EXIT(185, 200),
      pool: {
        maxConcurrent: 2,
        durationRange: [2.4, 6.8],
        minDuration: 1.8,
        staggerRange: [0.3, 0.95],
        eraseDurationRange: [1.4, 4.0],
      },
    },

    {
      id: "dinosaurus_riboa_pass",
      file: "Dinosaurus_riboa.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 168, until: 205 },
      erase: DINOSAURUS_SECTION_EXIT(212, 226),
    },

    /* ── 02:43 → 03:40 — flute lines on top ──────────────────── */

    {
      id: "dinosaurus_flute_lines_2",
      file: "../autumnnights/autumnnights_lines.svg",
      ...DINOSAURUS_FLUTE_LIVING,
      draw: { at: 163, until: 220 },
      erase: DINOSAURUS_SECTION_EXIT(216, 222),
      pool: {
        ...DINOSAURUS_FLUTE_LIVING.pool,
        maxConcurrent: 3,
        durationRange: [1.4, 3.4],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 163, until: 222 },
        tremble: { ...DINOSAURUS_FLUTE_TREMBLE, from: 163, until: 222 },
      },
    },

    {
      id: "dinosaurus_street_return_1",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 205, until: 238 },
      erase: DINOSAURUS_SECTION_EXIT(244, 252),
    },

    {
      id: "dinosaurus_fields_strings",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS,
      draw: { at: 200, until: 224 },
      erase: DINOSAURUS_SECTION_EXIT(220, 228),
    },

    /* ── 03:45 — fields line layer, guitar-rhythmic ──────────── */

    {
      id: "dinosaurus_fields_guitar",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_FIELDS,
      draw: { at: 225, until: 258 },
      erase: DINOSAURUS_SECTION_EXIT(262, 272),
      pool: {
        ...DINOSAURUS_FIELDS.pool,
        maxConcurrent: 2,
        speedRange: [0.48, 0.78],
        durationRange: [1.2, 3.4],
        staggerRange: [0.22, 0.65],
      },
      modulation: {
        drawSpeed: { ...DINOSAURUS_GUITAR_SPEED, from: 225, until: 272 },
      },
    },

    /* ── ACT III — peak (~04:08 → ~05:50) ────────────────────── */

    {
      id: "dinosaurus_guest_place_peak_1",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 248, until: 272 },
      erase: DINOSAURUS_SECTION_EXIT(274, 280),
    },

    {
      id: "dinosaurus_guest_dalia_peak",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 262, until: 286 },
      erase: DINOSAURUS_SECTION_EXIT(288, 294),
    },

    {
      id: "dinosaurus_guest_street_peak",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 275, until: 298 },
      erase: DINOSAURUS_SECTION_EXIT(301, 307),
    },

    {
      id: "dinosaurus_all_peak",
      file: "Dinosaurus_all.svg",
      strategy: "long-first",
      draw: { at: 268, until: 310, naturalPace: true },
      erase: DINOSAURUS_SECTION_EXIT(324, 332),
      pool: {
        maxConcurrent: 2,
        durationRange: [2.6, 7.0],
        minDuration: 2.0,
        staggerRange: [0.28, 0.85],
        eraseDurationRange: [1.6, 4.2],
      },
    },

    /* ── 04:31 — homes return on top (additive; clears ~05:12) ─ */

    {
      id: "dinosaurus_homes_overlay",
      file: "Dinosaurus_homes.svg",
      ...DINOSAURUS_HOMES,
      draw: { at: 271, until: 302 },
      erase: DINOSAURUS_SECTION_EXIT(308, 318),
      modulation: {
        drawSpeed: { ...DINOSAURUS_BASS_SPEED, from: 271, until: 318 },
      },
    },

    /* ── ACT IV — second wave (~05:10 → 05:50) ───────────────── */

    {
      id: "dinosaurus_riboa_return",
      file: "Dinosaurus_riboa.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 310, until: 342 },
      erase: DINOSAURUS_SECTION_EXIT(348, 356),
    },

    /* ── 05:19 — flute lines echo ──────────────────────────────── */

    {
      id: "dinosaurus_flute_lines_3",
      file: "../autumnnights/autumnnights_lines.svg",
      ...DINOSAURUS_FLUTE_LIVING,
      draw: { at: 319, until: 352 },
      erase: DINOSAURUS_SECTION_EXIT(350, 356),
      modulation: {
        drawSpeed: { ...DINOSAURUS_FLUTE_SPEED, from: 319, until: 356 },
      },
    },

    {
      id: "dinosaurus_guest_place_peak_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 328, until: 344 },
      erase: DINOSAURUS_SECTION_EXIT(344, 350),
    },

    {
      id: "dinosaurus_guest_dalia_return",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_GUEST,
      draw: { at: 335, until: 350 },
      erase: DINOSAURUS_SECTION_EXIT(348, 354),
    },

    {
      id: "dinosaurus_street_return_2",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_EDGE,
      draw: { at: 325, until: 358 },
      erase: DINOSAURUS_SECTION_EXIT(361, 368),
    },

    {
      id: "dinosaurus_pesel_return",
      file: "Dinosaurus_pesel.svg",
      strategy: "long-first",
      draw: { at: 338, until: 362, naturalPace: true },
      erase: DINOSAURUS_SECTION_EXIT(365, 372),
      pool: {
        maxConcurrent: 2,
        durationRange: [2.2, 6.0],
        minDuration: 1.6,
        staggerRange: [0.25, 0.8],
        eraseDurationRange: [1.2, 3.5],
      },
    },

    /* ── 05:50 → 06:15 — vocal chaos ─────────────────────────── */

    {
      id: "dinosaurus_chaos_vocal_dalia_2",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 350, until: 375 },
      erase: DINOSAURUS_DISSOLVE(375, 380),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 350, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_place_2",
      file: "../autumnnights/autumnnights_place.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 352, until: 375 },
      erase: DINOSAURUS_DISSOLVE(376, 381),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 352, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_2",
      file: "../samba/sambaberegelsmol_street.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 354, until: 375 },
      erase: DINOSAURUS_DISSOLVE(375, 380),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 354, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_fields_2",
      file: "Dinosaurus_fields.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 356, until: 375 },
      erase: DINOSAURUS_DISSOLVE(377, 382),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 356, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_street_2b",
      file: "Dinosaurus_street.svg",
      ...DINOSAURUS_CHAOS,
      draw: { at: 358, until: 375 },
      erase: DINOSAURUS_DISSOLVE(378, 383),
      modulation: {
        drawSpeed: { ...DINOSAURUS_VOCALS_SPEED, from: 358, until: 375 },
      },
    },

    {
      id: "dinosaurus_chaos_vocal_dalia_2b",
      file: "../aquarel/aquarel_dalia.svg",
      ...DINOSAURUS_CHAOS,
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
      ...DINOSAURUS_FIELDS,
      draw: { at: 375, until: 388 },
      erase: DINOSAURUS_DISSOLVE(389, 396),
      pool: {
        ...DINOSAURUS_FIELDS.pool,
        maxConcurrent: 1,
        speedRange: [0.35, 0.55],
        durationRange: [2.0, 5.0],
        eraseDurationRange: DINOSAURUS_FINAL_ERASE_RANGE,
      },
    },

    {
      id: "dinosaurus_all_coda",
      file: "Dinosaurus_all.svg",
      strategy: "long-first",
      draw: { at: 378, until: 390, naturalPace: true },
      erase: DINOSAURUS_FINAL_WIPE,
      pool: {
        maxConcurrent: 1,
        durationRange: [6.5, 9.5],
        minDuration: 5.5,
        staggerRange: [0.25, 0.65],
        eraseDurationRange: DINOSAURUS_FINAL_ERASE_RANGE,
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
      anchor: document.body,
      placement: "append",
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

});
