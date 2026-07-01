/* ============================================================
   HOME ↔ LYRICS TRANSITION
   The album transforms into its printed lyric insert — and back.

   Forward (Home → Lyrics):
     · Hide song text, fade instrumental circles, store circle
       centers, navigate to lyrics.html.
     · Circles glide from Home coords to lyric-insert coords,
       then titles appear, then lyrics fade in.

   Reverse (Lyrics → Home):
     · Fade song titles and lyrics, animate circles back to Home
       coords, navigate to index.html.
     · Full album restores together the moment circles arrive.
   ============================================================ */

const LYRICS_TRANSITION_FLAG = "sheshet_lyrics_transition";
const HOME_TRANSITION_FLAG = "sheshet_home_transition";
const HOME_CIRCLE_POSITIONS_KEY = "sheshet_lyrics_circle_pos";

const LYRICS_VOCAL_TRACKS = ["track-a1", "track-a3", "track-a5", "track-b1"];

const LYRICS_TRANSITION = {
  homeOutMs: 320,
  textOutMs: 520,
  circleMoveMs: 720,
  circleMoveEasing: "cubic-bezier(0.45, 0, 0.2, 1)",
  titleFadeMs: 360,
  lyricsFadeMs: 520,
  gapMs: 120,
  safetyMs: 2600,
  dotPlainMs: 180,
};

function dotCenter(dot) {
  const rect = dot.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function readHomeCirclePositions() {
  try {
    return JSON.parse(
      sessionStorage.getItem(HOME_CIRCLE_POSITIONS_KEY) || "{}"
    );
  } catch {
    return {};
  }
}

function storeHomeCirclePositions() {
  if (document.body.classList.contains("intro-active")) return;

  const positions = {};

  LYRICS_VOCAL_TRACKS.forEach(trackId => {
    const dot = document.querySelector(`.${trackId} .song-dot`);

    if (dot) {
      positions[trackId] = dotCenter(dot);
    }
  });

  sessionStorage.setItem(
    HOME_CIRCLE_POSITIONS_KEY,
    JSON.stringify(positions)
  );
}

function getVocalSongs() {
  return LYRICS_VOCAL_TRACKS
    .map(trackId => ({
      trackId,
      el: document.querySelector(`.${trackId}`),
    }))
    .filter(item => item.el);
}

function animateCircles(songs, keyframesBuilder, duration) {
  const moveMs = duration ?? LYRICS_TRANSITION.circleMoveMs;

  return Promise.all(
    songs.map(item => {
      const keyframes = keyframesBuilder(item);

      if (!keyframes) return Promise.resolve();

      return item.el
        .animate(keyframes, {
          duration: moveMs,
          easing: LYRICS_TRANSITION.circleMoveEasing,
          fill: "forwards",
        })
        .finished.catch(() => {});
    })
  );
}

/* -------------------- HOME → LYRICS (exit) -------------------- */

function initHomeLyricsExit() {
  const trigger = document.querySelector(".shin-right");

  if (!trigger) return;

  trigger.addEventListener("click", event => {
    if (document.body.classList.contains("intro-active")) return;
    if (document.body.classList.contains("is-lyrics-exit")) return;

    event.preventDefault();

    const href = trigger.getAttribute("href") || "lyrics.html";
    const positions = {};

    LYRICS_VOCAL_TRACKS.forEach(trackId => {
      const dot = document.querySelector(`.${trackId} .song-dot`);

      if (dot) {
        positions[trackId] = dotCenter(dot);
      }
    });

    sessionStorage.setItem(
      HOME_CIRCLE_POSITIONS_KEY,
      JSON.stringify(positions)
    );
    sessionStorage.setItem(LYRICS_TRANSITION_FLAG, "1");

    document.body.classList.remove(
      "is-album-focus-a",
      "is-album-focus-b"
    );
    document.body.classList.add("is-lyrics-exit");

    window.setTimeout(() => {
      window.location.href = href;
    }, LYRICS_TRANSITION.homeOutMs);
  });
}

/* -------------------- HOME ← LYRICS (enter) -------------------- */

function finishHomeIntro() {
  document.documentElement.classList.remove(
    "home-intro",
    "home-reveal-all"
  );
}

function initHomeReveal() {
  const hasFlag =
    sessionStorage.getItem(HOME_TRANSITION_FLAG) === "1";

  if (!hasFlag) {
    finishHomeIntro();
    storeHomeCirclePositions();
    return;
  }

  sessionStorage.removeItem(HOME_TRANSITION_FLAG);

  const safety = window.setTimeout(
    () => {
      finishHomeIntro();
      storeHomeCirclePositions();
    },
    LYRICS_TRANSITION.safetyMs
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("home-reveal-all");

      window.setTimeout(() => {
        window.clearTimeout(safety);
        finishHomeIntro();
        storeHomeCirclePositions();
      }, LYRICS_TRANSITION.titleFadeMs);
    });
  });
}

/* -------------------- LYRICS ← HOME (exit) -------------------- */

function initLyricsHomeExit() {
  const trigger = document.querySelector(".shin-right");

  if (!trigger) return;

  trigger.addEventListener("click", event => {
    if (document.body.classList.contains("is-home-exit")) return;

    event.preventDefault();

    const href = trigger.getAttribute("href") || "index.html";
    const homePositions = readHomeCirclePositions();

    document.body.classList.add("is-home-exit");

    window.setTimeout(() => {
      document.body.classList.add("is-home-exit-dots-plain");

      window.setTimeout(() => {
        const songs = getVocalSongs();

        document.body.classList.add("is-home-exit-moving");

        songs.forEach(item => {
          const dot = item.el.querySelector(".song-dot");
          const current = dotCenter(dot);
          const target = homePositions[item.trackId];

          item.current = current;
          item.target = target;

          if (!target) {
            item.skip = true;
            return;
          }

          item.from = "translate(0px, 0px)";
          item.to = `translate(${target.x - current.x}px, ${target.y - current.y}px)`;
        });

        animateCircles(songs, item => {
          if (item.skip) return null;

          return [
            { transform: item.from },
            { transform: item.to },
          ];
        }).then(() => {
          sessionStorage.setItem(HOME_TRANSITION_FLAG, "1");

          window.location.href = href;
        });
      }, LYRICS_TRANSITION.dotPlainMs);
    }, LYRICS_TRANSITION.textOutMs);
  });
}

/* -------------------- LYRICS → HOME (enter / forward reveal) -------------------- */

function finishLyricsIntro() {
  document.documentElement.classList.remove(
    "lyrics-intro",
    "lyrics-reveal-titles",
    "lyrics-reveal-text"
  );
}

function initLyricsReveal() {
  const hasFlag =
    sessionStorage.getItem(LYRICS_TRANSITION_FLAG) === "1";

  if (!hasFlag) {
    finishLyricsIntro();
    return;
  }

  sessionStorage.removeItem(LYRICS_TRANSITION_FLAG);

  const storedPositions = readHomeCirclePositions();
  const safety = window.setTimeout(finishLyricsIntro, LYRICS_TRANSITION.safetyMs);
  const songs = getVocalSongs();

  songs.forEach(item => {
    const dot = item.el.querySelector(".song-dot");
    const natural = dotCenter(dot);
    const start = storedPositions[item.trackId] || null;

    const dx = start ? start.x - natural.x : 0;
    const dy = start ? start.y - natural.y : 0;

    item.from = `translate(${dx}px, ${dy}px)`;
    item.el.style.transform = item.from;
    item.el.style.opacity = "1";
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animateCircles(songs, item => [
        { transform: item.from },
        { transform: "translate(0px, 0px)" },
      ]).then(() => {
        songs.forEach(item => {
          item.el.style.transform = "";
        });

        document.documentElement.classList.add("lyrics-reveal-titles");

        window.setTimeout(() => {
          document.documentElement.classList.add("lyrics-reveal-text");

          window.setTimeout(() => {
            window.clearTimeout(safety);
            finishLyricsIntro();
          }, LYRICS_TRANSITION.lyricsFadeMs);
        }, LYRICS_TRANSITION.titleFadeMs + LYRICS_TRANSITION.gapMs);
      });
    });
  });
}

/* -------------------- BOOTSTRAP -------------------- */

if (document.body.classList.contains("lyrics-mode")) {
  initLyricsReveal();
  initLyricsHomeExit();
} else if (document.body.classList.contains("home-mode")) {
  initHomeLyricsExit();
  initHomeReveal();
}
