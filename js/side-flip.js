/* Side A / B tracklist flip — number circles animate between paired positions */

const SIDE_FLIP = {
  durationMs: 600,
  easing: "cubic-bezier(0.45, 0, 0.55, 1)",
  textFadeMs: 350,
  a5FadeMs: 400,
  a5FadeInDelayRatio: 0.55,
};

function readThemeDotStyle() {
  const styles = getComputedStyle(document.body);

  return {
    backgroundColor: styles.getPropertyValue("--dot-bg").trim(),
    borderColor: styles.getPropertyValue("--dot-border").trim(),
    color: styles.getPropertyValue("--dot-text").trim(),
  };
}

const TRACK_PAIRS = [
  ["track-a1", "track-b1"],
  ["track-a2", "track-b2"],
  ["track-a3", "track-b3"],
  ["track-a4", "track-b4"],
];

const TRACK_A5 = "track-a5";

function parseDurationMs(value, fallback) {
  const parsed = parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getFlipConfig() {
  const root = getComputedStyle(document.documentElement);

  return {
    durationMs: parseDurationMs(
      root.getPropertyValue("--side-flip-duration"),
      SIDE_FLIP.durationMs
    ),
    easing:
      root.getPropertyValue("--side-flip-easing").trim() || SIDE_FLIP.easing,
    textFadeMs: parseDurationMs(
      root.getPropertyValue("--side-flip-text-fade"),
      SIDE_FLIP.textFadeMs
    ),
    a5FadeMs: parseDurationMs(
      root.getPropertyValue("--side-flip-a5-fade"),
      SIDE_FLIP.a5FadeMs
    ),
    a5FadeInDelayRatio: SIDE_FLIP.a5FadeInDelayRatio,
  };
}

function getDotCenter(dot) {
  const rect = dot.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function createFlipDot(number) {
  const dot = document.createElement("div");
  dot.className = "side-flip-dot";
  dot.textContent = number;
  dot.style.border = "2px solid";
  return dot;
}

function placeFlipDot(dot, center) {
  dot.style.left = `${center.x}px`;
  dot.style.top = `${center.y}px`;
}

function applyDotStyle(dot, style) {
  dot.style.backgroundColor = style.backgroundColor;
  dot.style.borderColor = style.borderColor;
  dot.style.color = style.color;
}

function animateDotMove(dot, from, to, dotStyle, config) {
  applyDotStyle(dot, dotStyle);
  placeFlipDot(dot, from);

  return dot.animate(
    [
      { transform: "translate(-50%, -50%)" },
      {
        transform: `translate(calc(-50% + ${to.x - from.x}px), calc(-50% + ${to.y - from.y}px))`,
      },
    ],
    {
      duration: config.durationMs,
      easing: config.easing,
      fill: "forwards",
    }
  );
}

function animateDotOpacity(dot, from, to, config, durationMs, delayMs = 0) {
  return dot.animate(
    [{ opacity: from }, { opacity: to }],
    {
      duration: durationMs,
      easing: config.easing,
      delay: delayMs,
      fill: "forwards",
    }
  );
}

function initSideFlip(sideToggle) {
  if (!sideToggle) return;

  const sideA = document.querySelector(".songs-side-a");
  const sideB = document.querySelector(".songs-side-b");

  if (!sideA || !sideB) return;

  let currentSide = sideToggle.dataset.selected === "a" ? "a" : "b";
  let isAnimating = false;

  let flipLayer = document.querySelector(".side-flip-layer");

  if (!flipLayer) {
    flipLayer = document.createElement("div");
    flipLayer.className = "side-flip-layer";
    flipLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(flipLayer);
  }

  document.body.dataset.albumSide = currentSide;

  function setSideToggleUI(side) {
    const selectedSide = side === "a" ? "a" : "b";

    sideToggle.dataset.selected = selectedSide;

    sideToggle.querySelectorAll(".side-toggle-option").forEach(option => {
      const isActive = option.dataset.side === selectedSide;

      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function trackClassForSide(pairIndex, side) {
    return side === "a" ? TRACK_PAIRS[pairIndex][0] : TRACK_PAIRS[pairIndex][1];
  }

  function resetFlipState(outgoing, incoming) {
    document.body.classList.remove("is-side-flipping");
    outgoing.classList.remove("is-flip-outgoing");
    incoming.classList.remove("is-flip-outgoing");
    sideA.classList.remove("is-flip-incoming");
    sideB.classList.remove("is-flip-incoming");

    outgoing.querySelectorAll(".song-dot.is-flip-hidden").forEach(dot => {
      dot.classList.remove("is-flip-hidden");
    });

    flipLayer.replaceChildren();
  }

  async function flipSide(fromSide, toSide) {
    if (isAnimating || fromSide === toSide) return;

    isAnimating = true;

    const config = getFlipConfig();
    const outgoing = fromSide === "a" ? sideA : sideB;
    const incoming = toSide === "a" ? sideA : sideB;
    const dotStyle = readThemeDotStyle();

    document.body.classList.add("is-side-flipping");
    outgoing.classList.add("is-flip-outgoing");
    incoming.classList.add("is-flip-incoming");

    outgoing.querySelectorAll(".song-dot").forEach(dot => {
      dot.classList.add("is-flip-hidden");
    });

    flipLayer.replaceChildren();

    const animations = [];

    for (let i = 0; i < TRACK_PAIRS.length; i++) {
      const fromClass = trackClassForSide(i, fromSide);
      const toClass = trackClassForSide(i, toSide);

      const sourceDot = outgoing.querySelector(`.${fromClass} .song-dot`);
      const targetDot = incoming.querySelector(`.${toClass} .song-dot`);

      if (!sourceDot || !targetDot) continue;

      const flipDot = createFlipDot(sourceDot.textContent.trim());
      flipLayer.appendChild(flipDot);
      animations.push(
        animateDotMove(
          flipDot,
          getDotCenter(sourceDot),
          getDotCenter(targetDot),
          dotStyle,
          config
        )
      );
    }

    if (fromSide === "a") {
      const a5Dot = outgoing.querySelector(`.${TRACK_A5} .song-dot`);

      if (a5Dot) {
        const flipDot = createFlipDot(a5Dot.textContent.trim());
        applyDotStyle(flipDot, dotStyle);
        flipLayer.appendChild(flipDot);
        placeFlipDot(flipDot, getDotCenter(a5Dot));

        animations.push(
          animateDotOpacity(flipDot, 1, 0, config, config.a5FadeMs)
        );
      }
    } else {
      const a5Dot = incoming.querySelector(`.${TRACK_A5} .song-dot`);

      if (a5Dot) {
        const flipDot = createFlipDot(a5Dot.textContent.trim());
        applyDotStyle(flipDot, dotStyle);
        flipDot.style.opacity = "0";
        flipLayer.appendChild(flipDot);
        placeFlipDot(flipDot, getDotCenter(a5Dot));
        flipDot.style.transform = "translate(-50%, -50%)";

        animations.push(
          animateDotOpacity(
            flipDot,
            0,
            1,
            config,
            config.a5FadeMs,
            config.durationMs * config.a5FadeInDelayRatio
          )
        );
      }
    }

    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));

    resetFlipState(outgoing, incoming);

    document.body.dataset.albumSide = toSide;
    currentSide = toSide;

    incoming.classList.add("is-flip-revealed");

    window.setTimeout(() => {
      incoming.classList.remove("is-flip-revealed");
    }, config.textFadeMs);

    isAnimating = false;
  }

  sideToggle.querySelectorAll(".side-toggle-option").forEach(option => {
    option.addEventListener("click", () => {
      const nextSide = option.dataset.side === "a" ? "a" : "b";

      if (nextSide === currentSide || isAnimating) return;

      setSideToggleUI(nextSide);
      flipSide(currentSide, nextSide);
    });
  });
}
