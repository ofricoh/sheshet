/* ============================================================
   HOME / LYRICS ↔ CREDITS TRANSITION
   Reuses the same timing, easing, and FLIP motion as
   js/lyrics-transition.js (Home ↔ Lyrics).
   ============================================================ */

const CREDITS_TRANSITION_FLAG = "sheshet_credits_transition";
const CREDITS_START_POSITIONS_KEY = "sheshet_credits_circle_pos";
const ALL_HOME_CIRCLE_POSITIONS_KEY = "sheshet_all_home_circle_pos";

const CREDIT_SOURCE_TRACKS = {
  1: "track-a1",
  2: "track-a2",
  3: "track-a3",
  4: "track-a4",
  5: "track-a5",
  6: "track-b2",
  7: "track-b3",
  8: "track-b4",
};

const CREDITS_TRANSITION = {
  homeOutMs: 320,
  textOutMs: 520,
  circleMoveMs: 720,
  circleMoveEasing: "cubic-bezier(0.45, 0, 0.2, 1)",
  titleFadeMs: 360,
  gapMs: 120,
  safetyMs: 2600,
  dotPlainMs: 180,
};

function dotCenter(el) {
  const rect = el.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function readJson(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function storeAllHomeCirclePositions() {
  if (document.body.classList.contains("intro-active")) return;

  const positions = {};

  Object.values(CREDIT_SOURCE_TRACKS).forEach(trackId => {
    const dot = document.querySelector(`.${trackId} .song-dot`);

    if (dot) {
      positions[trackId] = dotCenter(dot);
    }
  });

  sessionStorage.setItem(
    ALL_HOME_CIRCLE_POSITIONS_KEY,
    JSON.stringify(positions)
  );
}

function readAllHomeCirclePositions() {
  return readJson(ALL_HOME_CIRCLE_POSITIONS_KEY);
}

function getCredits() {
  return Object.keys(CREDIT_SOURCE_TRACKS)
    .map(num => ({
      creditNum: Number(num),
      creditId: `credit-${num}`,
      el: document.querySelector(`.credit-${num}`),
    }))
    .filter(item => item.el);
}

function animateCredits(items, keyframesBuilder, duration) {
  const moveMs = duration ?? CREDITS_TRANSITION.circleMoveMs;

  return Promise.all(
    items.map(item => {
      const keyframes = keyframesBuilder(item);

      if (!keyframes) return Promise.resolve();

      return item.el
        .animate(keyframes, {
          duration: moveMs,
          easing: CREDITS_TRANSITION.circleMoveEasing,
          fill: "forwards",
        })
        .finished.catch(() => {});
    })
  );
}

function buildCreditsStartPositions(sourceMode) {
  const allHome = readAllHomeCirclePositions();
  const positions = {};

  Object.entries(CREDIT_SOURCE_TRACKS).forEach(([num, trackId]) => {
    if (sourceMode === "home") {
      const dot = document.querySelector(`.${trackId} .song-dot`);

      if (dot) {
        positions[`credit-${num}`] = dotCenter(dot);
      }
      return;
    }

    const liveDot = document.querySelector(`.${trackId} .song-dot`);

    if (liveDot) {
      positions[`credit-${num}`] = dotCenter(liveDot);
      return;
    }

    if (allHome[trackId]) {
      positions[`credit-${num}`] = allHome[trackId];
    }
  });

  return positions;
}

/* -------------------- HOME → CREDITS (exit) -------------------- */

function initHomeCreditsExit() {
  const trigger = document.querySelector(".taf-left");

  if (!trigger) return;

  trigger.addEventListener("click", event => {
    if (document.body.classList.contains("intro-active")) return;
    if (document.body.classList.contains("is-credits-exit")) return;

    event.preventDefault();

    const href = trigger.getAttribute("href") || "credits.html";
    const positions = buildCreditsStartPositions("home");

    sessionStorage.setItem(
      CREDITS_START_POSITIONS_KEY,
      JSON.stringify(positions)
    );
    sessionStorage.setItem(CREDITS_TRANSITION_FLAG, "1");

    document.body.classList.remove(
      "is-album-focus-a",
      "is-album-focus-b"
    );
    document.body.classList.add("is-credits-exit");

    window.setTimeout(() => {
      window.location.href = href;
    }, CREDITS_TRANSITION.homeOutMs);
  });
}

/* -------------------- LYRICS → CREDITS (exit) -------------------- */

function initLyricsCreditsExit() {
  const trigger = document.querySelector(".taf-left");

  if (!trigger) return;

  trigger.addEventListener("click", event => {
    if (document.body.classList.contains("is-credits-exit")) return;

    event.preventDefault();

    const href = trigger.getAttribute("href") || "credits.html";
    const positions = buildCreditsStartPositions("lyrics");

    sessionStorage.setItem(
      CREDITS_START_POSITIONS_KEY,
      JSON.stringify(positions)
    );
    sessionStorage.setItem(CREDITS_TRANSITION_FLAG, "1");

    document.body.classList.add("is-credits-exit");

    window.setTimeout(() => {
      window.location.href = href;
    }, CREDITS_TRANSITION.homeOutMs);
  });
}

/* -------------------- CREDITS ENTER -------------------- */

function finishCreditsIntro() {
  document.documentElement.classList.remove(
    "credits-intro",
    "credits-reveal-titles"
  );
}

function initCreditsReveal() {
  const hasFlag =
    sessionStorage.getItem(CREDITS_TRANSITION_FLAG) === "1";

  if (!hasFlag) {
    finishCreditsIntro();
    return;
  }

  sessionStorage.removeItem(CREDITS_TRANSITION_FLAG);

  const storedPositions = readJson(CREDITS_START_POSITIONS_KEY);
  const safety = window.setTimeout(finishCreditsIntro, CREDITS_TRANSITION.safetyMs);
  const credits = getCredits();

  credits.forEach(item => {
    const dot = item.el.querySelector(".credit-dot");
    const natural = dotCenter(dot);
    const start = storedPositions[item.creditId] || null;

    const dx = start ? start.x - natural.x : 0;
    const dy = start ? start.y - natural.y : 0;

    item.from = `translate(${dx}px, ${dy}px)`;
    item.el.style.transform = item.from;
    item.el.style.opacity = "1";
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animateCredits(credits, item => [
        { transform: item.from },
        { transform: "translate(0px, 0px)" },
      ]).then(() => {
        credits.forEach(item => {
          item.el.style.transform = "";
        });

        document.documentElement.classList.add("credits-reveal-titles");

        window.setTimeout(() => {
          window.clearTimeout(safety);
          finishCreditsIntro();
        }, CREDITS_TRANSITION.titleFadeMs);
      });
    });
  });
}

/* -------------------- CREDITS → HOME (exit) -------------------- */

function initCreditsHomeExit() {
  const trigger = document.querySelector(".taf-left.active");

  if (!trigger) return;

  trigger.addEventListener("click", event => {
    if (document.body.classList.contains("is-home-exit")) return;

    event.preventDefault();

    const href = trigger.getAttribute("href") || "index.html";
    const homePositions = readAllHomeCirclePositions();

    document.body.classList.add("is-home-exit");

    window.setTimeout(() => {
      document.body.classList.add("is-home-exit-moving");

      const credits = getCredits();

      credits.forEach(item => {
        const trackId = CREDIT_SOURCE_TRACKS[item.creditNum];
        const dot = item.el.querySelector(".credit-dot");
        const current = dotCenter(dot);
        const target = homePositions[trackId];

        item.current = current;
        item.target = target;

        if (!target) {
          item.skip = true;
          return;
        }

        item.from = "translate(0px, 0px)";
        item.to = `translate(${target.x - current.x}px, ${target.y - current.y}px)`;
      });

      animateCredits(credits, item => {
        if (item.skip) return null;

        return [
          { transform: item.from },
          { transform: item.to },
        ];
      }).then(() => {
        sessionStorage.setItem("sheshet_home_transition", "1");

        window.location.href = href;
      });
    }, CREDITS_TRANSITION.textOutMs);
  });
}

/* -------------------- BOOTSTRAP -------------------- */

function bootHomeCreditsStorage() {
  const store = () => {
    if (!document.body.classList.contains("intro-active")) {
      storeAllHomeCirclePositions();
    }
  };

  store();

  if (document.body.classList.contains("intro-active")) {
    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains("intro-active")) {
        store();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  window.addEventListener("resize", store);
}

window.storeAllHomeCirclePositions = storeAllHomeCirclePositions;

if (document.body.classList.contains("credits-mode")) {
  initCreditsReveal();
  initCreditsHomeExit();
} else if (document.body.classList.contains("home-mode")) {
  initHomeCreditsExit();
  bootHomeCreditsStorage();
} else if (document.body.classList.contains("lyrics-mode")) {
  initLyricsCreditsExit();
}
