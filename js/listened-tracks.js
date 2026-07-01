const LISTENED_STORAGE_KEY = "sheshet_listened_tracks";

function readListenedTracks() {

  try {

    const stored =
      localStorage.getItem(LISTENED_STORAGE_KEY);

    if (!stored) return new Set();

    const parsed = JSON.parse(stored);

    return new Set(Array.isArray(parsed) ? parsed : []);

  } catch {

    return new Set();

  }

}

function writeListenedTracks(trackSet) {

  localStorage.setItem(
    LISTENED_STORAGE_KEY,
    JSON.stringify([...trackSet])
  );

}

function markTrackListened(trackId) {

  if (!trackId) return;

  const tracks = readListenedTracks();

  tracks.add(trackId);
  writeListenedTracks(tracks);

}

function isTrackListened(trackId) {

  return readListenedTracks().has(trackId);

}

function createSongMark() {

  const mark = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  mark.classList.add("song-mark");
  mark.setAttribute("viewBox", "0 0 120 24");
  mark.setAttribute("preserveAspectRatio", "none");
  mark.setAttribute("aria-hidden", "true");

  const path = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );

  path.setAttribute(
    "d",
    "M4,14 C18,10 34,16 52,12 S86,8 116,13"
  );

  mark.appendChild(path);

  return mark;

}

function getTrackIdFromSong(song) {

  return [...song.classList].find(className =>
    className.startsWith("track-")
  );

}

function applyListenedMarks(root = document) {

  root.querySelectorAll(".song").forEach(song => {

    const trackId = getTrackIdFromSong(song);

    if (!trackId) return;

    if (!song.querySelector(".song-mark")) {
      song.appendChild(createSongMark());
    }

    song.classList.toggle(
      "is-listened",
      isTrackListened(trackId)
    );

  });

}
