/* ============================================================
   SAMBA BAREGEL SMOL — Plotter Machine score
   ------------------------------------------------------------
   Creative instructions only. The engine resolves timing,
   strategies, unit schedules, and pen phases automatically.
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = true;

const SAMBA_STYLE = {
  stroke: "#FAFAFA",
  strokeWidth: 1.4,
};

/** Shared pen-plotter settings for the house illustration (first pass + return). */
const SAMBA_HOUSE_LAYER = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 4,
    durationRange: [1.2, 3.4],
    minDuration: 0.85,
    staggerRange: [0.35, 1.05],
    eraseDurationRange: [0.12, 0.38],
  },
};

/** Fast energetic pen-plotter settings (high + bridge). */
const SAMBA_HIGH_LAYER = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 6,
    durationRange: [0.35, 1.05],
    minDuration: 0.25,
    staggerRange: [0.04, 0.18],
    eraseDurationRange: [0.12, 0.35],
  },
};

/** Calm scattered organic texture (parks foliage). */
const SAMBA_PARKS_LAYER = {
  strategy: "tree-breath",
  pool: {
    maxConcurrent: 5,
    durationRange: [3.2, 7.8],
    minDuration: 2.4,
    staggerRange: [0.9, 2.4],
    eraseDurationRange: [0.14, 0.42],
  },
};

/** Quick urban burst (bus reprise). */
const SAMBA_BUS_BURST = {
  strategy: "edge-stagger",
  pool: {
    maxConcurrent: 10,
    durationRange: [0.16, 0.62],
    minDuration: 0.12,
    staggerRange: [0.02, 0.12],
    eraseDurationRange: [0.08, 0.28],
  },
};

/** Short melodic line replay (street reprise). */
const SAMBA_STREET_ECHO = {
  strategy: "flute-living",
  pool: {
    maxConcurrent: 5,
    drawWindow: 7.5,
    eraseBudget: 1.2,
    durationRange: [0.55, 1.45],
    minDuration: 0.32,
    staggerRange: [0.08, 0.32],
    eraseDurationRange: [0.14, 0.42],
  },
};

/** Shared flute tremble for melodic street passages. */
const SAMBA_STREET_MODULATION = {
  tremble: {
    source: "flute",
    maxPx: 1.85,
    minPx: 0.07,
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

/** First train pass — main rails only; hide Illustrator anchor points. */
const SAMBA_TRAIN_RAILS_ONLY = {
  geometryMinLength: 100,
};

/**
 * Layer order = list order = stacking (back → front).
 * Filenames stay stable; reorder here without re-exporting.
 */
const SAMBA_SCORE = {
  style: SAMBA_STYLE,
  layers: [
    {
      file: "sambaberegelsmol_bus.svg",
      strategy: "edge-stagger",
      draw: { at: 0, until: 3.6 },
      erase: { from: 4.6, until: 5 },
      pool: {
        maxConcurrent: 10,
        durationRange: [0.16, 0.62],
        minDuration: 0.12,
        staggerRange: [0.02, 0.12],
        eraseDurationRange: [0.08, 0.28],
      },
    },
    {
      file: "sambaberegelsmol_street.svg",
      strategy: "flute-living",
      draw: { at: 5, until: 10.2 },
      erase: { until: 11 },
      pool: {
        maxConcurrent: 5,
        drawWindow: 4.5,
        eraseBudget: 0.8,
        durationRange: [0.45, 1.35],
        minDuration: 0.28,
        staggerRange: [0.06, 0.28],
        eraseDurationRange: [0.12, 0.38],
      },
      modulation: {
        tremble: {
          from: 5,
          until: 11,
          source: "flute",
          maxPx: 2.1,
          minPx: 0.08,
          freq1: 44,
          freq2: 61,
          freq3: 27,
        },
        drawSpeed: {
          from: 5,
          until: 11,
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
      file: "sambaberegelsmol_house.svg",
      ...SAMBA_HOUSE_LAYER,
      draw: { at: 11, until: 35 },
      erase: { from: 31.98, until: 33.98 },
    },
    {
      file: "sambaberegelsmol_train.svg",
      ...SAMBA_TRAIN_RAILS_ONLY,
      strategy: "long-then-short",
      draw: { at: 11.5, until: 47 },
      erase: { from: 47, until: 48 },
      pool: {
        maxConcurrent: 3,
        longLineShare: 0.32,
        eraseDuration: 0.35,
        long: {
          durationRange: [11, 28],
          minDuration: 8.5,
          staggerRange: [1.5, 4.0],
        },
        short: {
          durationRange: [1.1, 3.0],
          minDuration: 0.8,
          staggerRange: [0.1, 0.5],
        },
      },
      modulation: {
        inkBreath: {
          from: 11.5,
          until: 47,
          rampFrom: 34,
          rampUntil: 39,
          intensityIdle: 0.2,
          source: "drums",
          depthRangeIdle: [0.012, 0.028],
          depthRange: [0.055, 0.095],
          energy: 0.38,
          dynamicsWeight: 0.45,
          speedIdle: 0.52,
          speed: 1.75,
          freq1: 0.32,
          freq2: 0.48,
          freq3: 0.26,
          freqSpread: 0.16,
          travel: 1.6,
        },
      },
    },
    {
      file: "sambaberegelsmol_high.svg",
      ...SAMBA_HIGH_LAYER,
      draw: { at: 48.35, until: 52.85 },
      erase: { from: 52.85, until: 57.85 },
    },
    {
      id: "sambaberegelsmol_high_mirror",
      file: "sambaberegelsmol_high2.svg",
      allowViewBoxMismatch: true,
      ...SAMBA_HIGH_LAYER,
      draw: { at: 52.85, until: 62 },
      erase: { from: 62.5, until: 63 },
    },
    {
      id: "sambaberegelsmol_house_return",
      file: "sambaberegelsmol_house.svg",
      ...SAMBA_HOUSE_LAYER,
      draw: { at: 63, until: 81 },
      erase: { from: 80, until: 81 },
    },
    {
      id: "sambaberegelsmol_bridge",
      file: "sambaberegelsmol_bridge.svg",
      ...SAMBA_HIGH_LAYER,
      draw: { at: 81.08, until: 85.58 },
      erase: { from: 94.94, until: 95 },
    },
    {
      id: "sambaberegelsmol_bazan",
      file: "sambaberegelsmol_bazan.svg",
      ...SAMBA_HIGH_LAYER,
      draw: { at: 85.58, until: 94.94 },
      erase: { from: 95, until: 95.08 },
    },

    /* ----------------------------------------------------------
       Second half — parks opens the act; reprises follow.
       ---------------------------------------------------------- */
    {
      id: "sambaberegelsmol_parks",
      file: "sambaberegelsmol_parks.svg",
      ...SAMBA_PARKS_LAYER,
      draw: { at: 95, until: 113.49 },
      erase: { from: 113.49, until: 113.55 },
      modulation: {
        tremble: {
          from: 95,
          until: 113.49,
          source: "flute",
          maxPx: 1.15,
          minPx: 0.06,
          freq1: 36,
          freq2: 52,
          freq3: 19,
        },
      },
    },
    {
      id: "sambaberegelsmol_parks2",
      file: "sambaberegelsmol_parks2.svg",
      allowViewBoxMismatch: true,
      strategy: "instant",
      style: { renderMode: "fill", fill: "#FAFAFA" },
      draw: { at: 113.49 },
      erase: { from: 129.1, until: 129.15 },
    },
    {
      id: "sambaberegelsmol_town",
      file: "sambaberegelsmol_town.svg",
      allowViewBoxMismatch: true,
      ...SAMBA_HIGH_LAYER,
      style: { mixBlendMode: "difference" },
      draw: { at: 113.49, until: 129.05 },
      erase: { from: 129.1, until: 129.15 },
    },
    {
      id: "sambaberegelsmol_street_echo",
      file: "sambaberegelsmol_street.svg",
      ...SAMBA_STREET_ECHO,
      draw: { at: 129.15, until: 138.15 },
      erase: { until: 141.15 },
      modulation: {
        tremble: {
          ...SAMBA_STREET_MODULATION.tremble,
          from: 129.15,
          until: 141.15,
          energy: 0.72,
        },
        drawSpeed: {
          ...SAMBA_STREET_MODULATION.drawSpeed,
          from: 129.15,
          until: 141.15,
        },
      },
    },
    {
      id: "sambaberegelsmol_high_echo",
      file: "sambaberegelsmol_high.svg",
      ...SAMBA_HIGH_LAYER,
      draw: { at: 144, until: 149.5 },
      erase: { from: 149.5, until: 154 },
    },
    {
      id: "sambaberegelsmol_house_echo",
      file: "sambaberegelsmol_house.svg",
      ...SAMBA_HOUSE_LAYER,
      draw: { at: 152.5, until: 169 },
      erase: { from: 168, until: 172 },
    },
    {
      id: "sambaberegelsmol_bus_flash",
      file: "sambaberegelsmol_bus.svg",
      ...SAMBA_BUS_BURST,
      draw: { at: 155, until: 158.5 },
      erase: { from: 164, until: 165.5 },
    },
    {
      id: "sambaberegelsmol_bridge_echo",
      file: "sambaberegelsmol_bridge.svg",
      ...SAMBA_HIGH_LAYER,
      draw: { at: 171, until: 175.5 },
      erase: { from: 175.5, until: 180 },
    },
    {
      id: "sambaberegelsmol_high_mirror_echo",
      file: "sambaberegelsmol_high.svg",
      transform: { rotate: 180 },
      strategy: "edge-stagger",
      draw: { at: 179, until: 184 },
      erase: { from: 186.5, until: 187.5 },
      pool: {
        maxConcurrent: 6,
        durationRange: [0.28, 0.85],
        minDuration: 0.2,
        staggerRange: [0.03, 0.14],
        eraseDurationRange: [0.12, 0.35],
      },
    },
    {
      id: "sambaberegelsmol_street_final",
      file: "sambaberegelsmol_street.svg",
      strategy: "flute-living",
      draw: { at: 184, until: 190.5 },
      erase: { until: 194.5 },
      pool: {
        maxConcurrent: 4,
        drawWindow: 5.2,
        eraseBudget: 0.9,
        durationRange: [0.42, 1.15],
        minDuration: 0.26,
        staggerRange: [0.06, 0.24],
        eraseDurationRange: [0.1, 0.32],
      },
      modulation: {
        tremble: {
          ...SAMBA_STREET_MODULATION.tremble,
          from: 184,
          until: 194.5,
          energy: 0.55,
          maxPx: 1.4,
        },
        drawSpeed: {
          ...SAMBA_STREET_MODULATION.drawSpeed,
          from: 184,
          until: 194.5,
        },
      },
    },
    {
      id: "sambaberegelsmol_bus_finale",
      file: "sambaberegelsmol_bus.svg",
      ...SAMBA_HOUSE_LAYER,
      draw: { at: 200, until: 208 },
      erase: { from: 208, until: 210 },
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("plotterMount");
  if (!mount) return;

  const audio = document.getElementById("sambaAudio");

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
    baseDir: "../assets/svg/songs/samba",
    score: SAMBA_SCORE,
    style: SAMBA_STYLE,
    transport: {
      audio: document.getElementById("sambaAudio"),
      analysisStems: [
        {
          id: "flute",
          audio: document.getElementById("sambaFluteStem"),
        },
        {
          id: "guitar",
          audio: document.getElementById("sambaGuitarStem"),
        },
        {
          id: "drums",
          audio: document.getElementById("sambaDrumsStem"),
        },
      ],
      playButton: playBtn,
      pauseButton: document.getElementById("pauseBtn"),
      timeline: document.getElementById("timeline"),
      spinElement: document.getElementById("plotterSpinGroup"),
      spinDurationSec: 210,
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
      console.error("[sambaberegelsmol] plotter boot failed:", err);
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.removeAttribute("aria-busy");
      }
    });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (typeof markTrackListened === "function") {
        markTrackListened("track-a3");
      }
    });
  }
});
