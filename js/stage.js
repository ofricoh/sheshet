(function () {
  const STAGE_WIDTH = 1920;
  const STAGE_HEIGHT = 1080;

  let currentScale = 1;

  function getStage() {
    return document.querySelector(".site-stage");
  }

  function scaleStage() {
    const stage = getStage();
    if (!stage) return;

    currentScale = Math.min(
      window.innerWidth / STAGE_WIDTH,
      window.innerHeight / STAGE_HEIGHT
    );

    stage.style.transform = `scale(${currentScale})`;
    document.documentElement.style.setProperty(
      "--stage-scale",
      String(currentScale)
    );
  }

  window.SheshetStage = {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    get scale() {
      return currentScale;
    },
    scaleStage,
  };

  scaleStage();
  window.addEventListener("resize", scaleStage);
})();
