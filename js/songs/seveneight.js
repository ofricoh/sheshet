/* ============================================================
   SEVENEIGHT — Record player page (audio + transport)
   ============================================================ */

/** Dev-only live timecode (MM:SS:CS) beside the timeline. */
const SHOW_DEBUG_TIMECODE = true;

/** Matches album track listing (4:09). */
const SEVENEIGHT_SPIN_DURATION_SEC = 249;

document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("seveneightAudio");
  const playBtn = document.getElementById("playBtn");

  if (SHOW_DEBUG_TIMECODE && audio && window.PlotterDebugTimecode) {
    PlotterDebugTimecode.attach({
      audio,
      anchor: document.querySelector(".plotter-timeline-wrap"),
    });
  }

  const transport = new PlotterTransport({
    audio,
    playButton: playBtn,
    pauseButton: document.getElementById("pauseBtn"),
    timeline: document.getElementById("timeline"),
    spinElement: document.getElementById("plotterSpinGroup"),
    spinDurationSec: SEVENEIGHT_SPIN_DURATION_SEC,
  });
  transport.start();

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (typeof markTrackListened === "function") {
        markTrackListened("track-a4");
      }
    });
  }
});
