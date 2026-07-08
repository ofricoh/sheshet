/* ============================================================
   MOUSE TRACE — thin freehand line following the cursor
   ------------------------------------------------------------
   Lightweight sketch stroke. Optional sessionStorage persistence;
   long-press (~300 ms) clears the canvas.
   ============================================================ */

(function () {
  const canvas = document.getElementById("traceCanvas");
  if (!canvas) return;

  const STORAGE_KEY = canvas.dataset.storageKey || "sheshet_trace";
  const shouldPersist = canvas.dataset.tracePersist !== "false";
  const TRACE_OPACITY = Number(canvas.dataset.traceOpacity) || 1;

  function readTraceColorDefault() {
    const fromData = canvas.dataset.traceColor?.trim();
    if (fromData) return fromData;

    const simplerText = document.querySelector(
      ".credit-detail, .footer-credits, .song-duration, .song-credits"
    );

    if (simplerText) {
      const resolved = getComputedStyle(simplerText).color.trim();
      if (resolved) return resolved;
    }

    return (
      getComputedStyle(document.body).getPropertyValue("--page-fg").trim() ||
      "#1C1C1C"
    );
  }

  const TRACE_COLOR_DEFAULT = readTraceColorDefault();
  const TRACE_STROKE_WIDTH = 0.85;
  const MAX_POINTS = 8000;
  const ERASE_HOLD_MS = 300;
  const ERASE_MOVE_TOLERANCE = 15;

  const SONG_TRACE_COLORS = {
    "track-a1": "#D66926",
    "track-b1": "#D66926",
    "track-a2": "#DFD538",
    "track-b2": "#DFD538",
    "track-a3": "#2E5E36",
    "track-b3": "#2E5E36",
    "track-a4": "#18326B",
    "track-b4": "#18326B",
    "track-a5": "#B42111",
  };

  const useSongColors = canvas.dataset.songColors === "true";

  let tracePoints = [];
  let activeTraceColor = TRACE_COLOR_DEFAULT;
  let ctx = null;
  let eraseTimer = null;
  let pressStartX = 0;
  let pressStartY = 0;

  function drawTraceSegment(context, x1, y1, x2, y2, color) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = TRACE_STROKE_WIDTH;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalAlpha = TRACE_OPACITY;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
  }

  function normalizeTracePoint(point) {
    return {
      x: point.x,
      y: point.y,
      color: point.color || TRACE_COLOR_DEFAULT,
    };
  }

  function resolveDrawColor(logicalColor) {
    return logicalColor;
  }

  function getHoveredSongColor(clientX, clientY) {
    const target = document.elementFromPoint(clientX, clientY);
    const song = target?.closest(".song");
    if (!song) return null;

    const trackClass = [...song.classList].find((name) =>
      name.startsWith("track-")
    );
    if (!trackClass) return null;

    return SONG_TRACE_COLORS[trackClass] || null;
  }

  function updateTraceColorFromHover(clientX, clientY) {
    if (!useSongColors) return;

    const hoveredColor = getHoveredSongColor(clientX, clientY);
    if (hoveredColor) {
      activeTraceColor = hoveredColor;
    }
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawTrace();
  }

  function redrawTrace() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 1; i < tracePoints.length; i++) {
      const segmentColor = tracePoints[i].color || TRACE_COLOR_DEFAULT;
      drawTraceSegment(
        ctx,
        tracePoints[i - 1].x,
        tracePoints[i - 1].y,
        tracePoints[i].x,
        tracePoints[i].y,
        resolveDrawColor(segmentColor)
      );
    }
  }

  function persistTrace() {
    if (!shouldPersist) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracePoints));
  }

  function eraseTrace() {
    if (shouldPersist) {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    tracePoints = [];
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function drawingBlocked() {
    return document.body.classList.contains("intro-active");
  }

  function addTracePoint(clientX, clientY) {
    const jitterX = (Math.random() - 0.5) * 0.7;
    const jitterY = (Math.random() - 0.5) * 0.7;

    const point = normalizeTracePoint({
      x: clientX + jitterX,
      y: clientY + jitterY,
      color: activeTraceColor,
    });

    tracePoints.push(point);

    if (tracePoints.length > MAX_POINTS) {
      tracePoints.shift();
    }

    const len = tracePoints.length;
    if (len > 1) {
      drawTraceSegment(
        ctx,
        tracePoints[len - 2].x,
        tracePoints[len - 2].y,
        tracePoints[len - 1].x,
        tracePoints[len - 1].y,
        resolveDrawColor(tracePoints[len - 1].color)
      );
    }

    persistTrace();
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  if (shouldPersist) {
    const savedTrace = sessionStorage.getItem(STORAGE_KEY);

    if (savedTrace) {
      try {
        tracePoints = JSON.parse(savedTrace).map(normalizeTracePoint);
        redrawTrace();
      } catch {
        tracePoints = [];
      }
    }
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("sheshet_trace_credits");
    tracePoints = [];
  }

  document.addEventListener("mousedown", (event) => {
    if (drawingBlocked()) return;

    pressStartX = event.clientX;
    pressStartY = event.clientY;

    eraseTimer = window.setTimeout(() => {
      eraseTrace();
      eraseTimer = null;
    }, ERASE_HOLD_MS);
  });

  document.addEventListener("mouseup", () => {
    if (eraseTimer === null) return;
    clearTimeout(eraseTimer);
    eraseTimer = null;
  });

  document.addEventListener("mousemove", (event) => {
    if (eraseTimer !== null) {
      const distance = Math.hypot(
        event.clientX - pressStartX,
        event.clientY - pressStartY
      );

      if (distance > ERASE_MOVE_TOLERANCE) {
        clearTimeout(eraseTimer);
        eraseTimer = null;
      }
      return;
    }

    if (drawingBlocked()) return;

    updateTraceColorFromHover(event.clientX, event.clientY);
    addTracePoint(event.clientX, event.clientY);
  });
})();
