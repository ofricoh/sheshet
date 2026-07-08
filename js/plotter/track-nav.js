/* ============================================================
   PLOTTER — album track navigation (prev / next)
   ============================================================ */

(function (global) {
  "use strict";

  const ALBUM_TRACKS = [
    { id: "track-a1", href: "inbalim.html" },
    { id: "track-a2", href: "aquarel.html" },
    { id: "track-a3", href: "sambaberegelsmol.html" },
    { id: "track-a4", href: "seveneight.html" },
    { id: "track-a5", href: "ifyouhadcome.html" },
    { id: "track-b1", href: "autumnnights.html" },
    { id: "track-b2", href: "debka.html" },
    { id: "track-b3", href: "dinosaurus.html" },
    { id: "track-b4", href: "fminor.html" },
  ];

  let isNavigating = false;

  function goToTrack(href, direction) {
    if (isNavigating || !href) return;

    isNavigating = true;

    if (global.PlotterTrackTransition?.navigateWithTransition) {
      global.PlotterTrackTransition.navigateWithTransition(href, direction);
      return;
    }

    window.location.href = href;
  }

  function initTrackNav(root = document) {
    const transport = root.querySelector(".plotter-transport");
    if (!transport) return;

    const prevBtn = root.getElementById("prevBtn");
    const nextBtn = root.getElementById("nextBtn");
    const trackId = transport.dataset.trackId;
    const currentIndex = ALBUM_TRACKS.findIndex(
      (track) => track.id === trackId
    );

    if (currentIndex === -1) return;

    if (prevBtn) {
      if (currentIndex > 0) {
        prevBtn.addEventListener("click", () => {
          goToTrack(ALBUM_TRACKS[currentIndex - 1].href, "prev");
        });
      } else {
        prevBtn.disabled = true;
      }
    }

    if (nextBtn) {
      if (currentIndex < ALBUM_TRACKS.length - 1) {
        nextBtn.addEventListener("click", () => {
          goToTrack(ALBUM_TRACKS[currentIndex + 1].href, "next");
        });
      } else {
        nextBtn.disabled = true;
      }
    }
  }

  global.PlotterTrackNav = { ALBUM_TRACKS, initTrackNav };

  if (document.querySelector(".plotter-transport")) {
    initTrackNav();
  }
})(window);
