/* ============================================================
   PLOTTER MACHINE — DEBUG TIMECODE
   ------------------------------------------------------------
   Live MM:SS:CS readout from audio.currentTime.
   Development-only — gate with SHOW_DEBUG_TIMECODE in the song.
   ============================================================ */

(function (global) {
  "use strict";

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  /** @param {number} seconds */
  function formatTimecode(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00:00";
    const totalCs = Math.floor(seconds * 100 + 1e-6);
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const ss = totalSec % 60;
    const mm = Math.floor(totalSec / 60);
    return `${pad2(mm)}:${pad2(ss)}:${pad2(cs)}`;
  }

  /**
   * Mount a timecode readout beside the transport controls.
   *
   * @param {object} options
   * @param {HTMLMediaElement} options.audio
   * @param {HTMLElement} [options.anchor] container to insert into
   * @param {"before"|"append"} [options.placement="before"]
   * @returns {{ element: HTMLElement, destroy: function } | null}
   */
  function attach(options) {
    const { audio, anchor, placement = "before" } = options || {};
    if (!audio || !anchor) return null;

    const el = document.createElement("div");
    el.className = "plotter-debug-timecode";
    el.setAttribute("aria-label", "Debug playback timecode");
    el.title = "Debug timecode (MM:SS:CS) — reads audio.currentTime";

    if (placement === "append") {
      anchor.appendChild(el);
    } else {
      anchor.insertBefore(el, anchor.firstChild);
    }

    let raf = null;
    let lastText = "";

    function render() {
      const cur = audio.currentTime || 0;
      const dur = audio.duration;
      const durText =
        dur && Number.isFinite(dur) ? formatTimecode(dur) : "--:--:--";
      const text = `${formatTimecode(cur)} / ${durText}`;
      if (text !== lastText) {
        el.textContent = text;
        lastText = text;
      }
    }

    function tick() {
      render();
      raf = requestAnimationFrame(tick);
    }

    tick();

    audio.addEventListener("loadedmetadata", render);
    audio.addEventListener("durationchange", render);
    audio.addEventListener("seeked", render);

    return {
      element: el,
      destroy() {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        audio.removeEventListener("loadedmetadata", render);
        audio.removeEventListener("durationchange", render);
        audio.removeEventListener("seeked", render);
        el.remove();
      },
    };
  }

  global.PlotterDebugTimecode = { attach, formatTimecode };
})(window);
