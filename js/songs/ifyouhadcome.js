/* ============================================================
   IF YOU HAD COME (לו באת) — Plotter Machine score
   ------------------------------------------------------------
   Slow, restrained choreography — memories appearing and
   fading. Creative instructions only; the engine resolves
   unit schedules and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = false;

/** Matches album track listing (2:42). */
const IFYOUHADCOME_SPIN_DURATION_SEC = 131;

const IFYOUHADCOME_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Sparse field texture — most strokes never enter the pool. */
const IFYOUHADCOME_FIELDS_POOL = {
  maxConcurrent: 1,
  speedRange: [0.32, 0.58],
  durationRange: [2.2, 5.4],
  minDuration: 1.6,
  staggerRange: [1.1, 3.2],
  eraseDurationRange: [1.4, 3.6],
};

/** Final exhale — every remaining stroke gone before the record ends. */
const IFYOUHADCOME_FINAL_WIPE = {
  from: 155,
  until: 161,
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const IFYOUHADCOME_SCORE = {
  style: IFYOUHADCOME_STYLE,
  layers: [
    /* Layer 1 — har (00:00 → 00:20 complete, hold, slow fade from 00:21) */
    {
      file: "Ifyouhadcome_har.svg",
      strategy: "organic-pool",
      draw: { at: 0, until: 20, naturalPace: true },
      erase: { from: 21, until: 50 },
      pool: {
        maxConcurrent: 1,
        speedRange: [1.0, 1.06],
        durationRange: [18, 19.5],
        minDuration: 17,
        staggerRange: [0.4, 1.2],
        eraseDurationRange: [9, 14],
      },
    },

    /* Layer 4 — fields (01:27 → 01:46, hold, fade 01:45 → 01:48) */
    {
      file: "Ifyouhadcome_fields.svg",
      strategy: "organic-pool",
      draw: { at: 87, until: 100 },
      erase: { from: 105, until: 108 },
      pool: IFYOUHADCOME_FIELDS_POOL,
    },

    /* Layer 2 — cheder (00:20 → 00:53, vocals — slow interior memory) */
    {
      file: "Ifyouhadcome_cheder.svg",
      strategy: "edge-stagger",
      draw: { at: 20, until: 53 },
      erase: { from: 70, until: 86 },
      pool: {
        maxConcurrent: 2,
        durationRange: [3.0, 7.5],
        minDuration: 1.8,
        staggerRange: [0.75, 2.4],
        eraseDurationRange: [1.8, 4.6],
      },
    },

    /* Layer 3 — house (00:54 → 01:26, draw then gentle fade from 01:10) */
    {
      file: "Ifyouhadcome_house.svg",
      strategy: "edge-stagger",
      draw: { at: 54, until: 67 },
      erase: { from: 70, until: 86 },
      pool: {
        maxConcurrent: 2,
        durationRange: [2.8, 7.4],
        minDuration: 1.9,
        staggerRange: [0.75, 2.4],
        eraseDurationRange: [2.0, 5.2],
      },
    },

    /* Layer 6 — work (02:14 → 02:30, late labor memory) */
    {
      file: "Ifyouhadcome_work.svg",
      strategy: "edge-stagger",
      draw: { at: 134, until: 150 },
      erase: IFYOUHADCOME_FINAL_WIPE,
      pool: {
        maxConcurrent: 2,
        durationRange: [2.2, 5.8],
        minDuration: 1.5,
        staggerRange: [0.55, 1.85],
        eraseDurationRange: [0.9, 2.4],
      },
    },

    /* Layer 7 — down (01:19 → 01:28, brief descent) */
    {
      file: "Ifyouhadcome_down.svg",
      strategy: "long-first",
      draw: { at: 79, until: 88 },
      erase: { from: 92, until: 98 },
      pool: {
        maxConcurrent: 1,
        durationRange: [4.5, 9.5],
        minDuration: 3.2,
        staggerRange: [1.2, 2.8],
        eraseDurationRange: [1.4, 3.2],
      },
    },

    /* Layer 8 — up (02:02 → 02:16, quiet lift after the peak) */
    {
      file: "Ifyouhadcome_up.svg",
      strategy: "edge-stagger",
      draw: { at: 122, until: 136 },
      erase: { from: 146, until: 156 },
      pool: {
        maxConcurrent: 1,
        durationRange: [3.2, 7.8],
        minDuration: 2.2,
        staggerRange: [0.85, 2.2],
        eraseDurationRange: [1.6, 4.2],
      },
    },

    /* Layer 5 — pesel (01:46 → 01:59 complete, hold, erase from 02:00) */
    {
      file: "Ifyouhadcome_pesel.svg",
      strategy: "long-first",
      draw: { at: 106, until: 119, naturalPace: true },
      erase: { from: 120, until: 142 },
      pool: {
        maxConcurrent: 1,
        speedRange: [1.0, 1.06],
        durationRange: [12, 13.5],
        minDuration: 11,
        staggerRange: [0.5, 1.4],
        eraseDurationRange: [2.4, 5.6],
      },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("ifyouhadcomeAudio");

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
    baseDir: "../assets/svg/songs/Ifyouhadcome",
    score: IFYOUHADCOME_SCORE,
    style: IFYOUHADCOME_STYLE,
    transport: {
      audio,
      playButton: playBtn,
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: IFYOUHADCOME_SPIN_DURATION_SEC,
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
      console.error("[ifyouhadcome] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

});
