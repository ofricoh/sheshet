function initAlbumFocus() {

  const sideA = document.querySelector(".songs-side-a");
  const sideB = document.querySelector(".songs-side-b");

  if (!sideA && !sideB) return;

  function setAlbumFocus(side) {

    document.body.classList.remove(
      "is-album-focus-a",
      "is-album-focus-b"
    );

    if (side === "a") {
      document.body.classList.add("is-album-focus-a");
    }

    if (side === "b") {
      document.body.classList.add("is-album-focus-b");
    }

  }

  function clearAlbumFocus() {

    document.body.classList.remove(
      "is-album-focus-a",
      "is-album-focus-b"
    );

  }

  sideA?.addEventListener("mouseenter", () => {
    setAlbumFocus("a");
  });

  sideB?.addEventListener("mouseenter", () => {
    setAlbumFocus("b");
  });

  sideA?.addEventListener("mouseleave", event => {

    if (sideB?.contains(event.relatedTarget)) return;

    clearAlbumFocus();

  });

  sideB?.addEventListener("mouseleave", event => {

    if (sideA?.contains(event.relatedTarget)) return;

    clearAlbumFocus();

  });

}

function initHomeAlbum() {

  initAlbumFocus();
  applyListenedMarks();

}

if (
  document.body.classList.contains("home-mode") &&
  document.querySelector(".songs-side-a, .songs-side-b")
) {
  initHomeAlbum();
}
