const svg = document.querySelector('.grid-svg');

function buildGrid(){

  if (!svg) return;

  svg.innerHTML = '';

  const width = window.innerWidth;
  const height = window.innerHeight;

  const columns = 16;
  const rows = 10;

  const colSize = width / columns;
  const rowSize = height / rows;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  for(let i = 1; i < columns; i++){

    const x = i * colSize;

    const line = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );

    line.setAttribute('x1', x);
    line.setAttribute('y1', 0);

    line.setAttribute('x2', x);
    line.setAttribute('y2', height);

    line.setAttribute('class', 'grid-line');

    svg.appendChild(line);
  }

  for(let i = 1; i < rows; i++){

    const y = i * rowSize;

    const line = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );

    line.setAttribute('x1', 0);
    line.setAttribute('y1', y);

    line.setAttribute('x2', width);
    line.setAttribute('y2', y);

    line.setAttribute('class', 'grid-line');

    svg.appendChild(line);
  }
}

if (svg) {
  buildGrid();
  window.addEventListener('resize', buildGrid);
}

/* -------------------- */
/* ABOUT SOUNDS */
/* -------------------- */

const memberSounds = [
  {
    selector: ".member-1 .member-number",
    audioId: "sound-member-1",
    volume: 0.08
  },
  {
    selector: ".member-2 .member-number",
    audioId: "sound-member-2",
    volume: 0.35
  },
  {
    selector: ".member-3 .member-number",
    audioId: "sound-member-3",
    volume: 0.35
  },
  {
    selector: ".member-4 .member-number",
    audioId: "sound-member-4",
    volume: 0.35
  },
  {
    selector: ".member-5 .member-number",
    audioId: "sound-member-5",
    volume: 0.35
  },
  {
    selector: ".member-6 .member-number",
    audioId: "sound-member-6",
    volume: 0.35
  },
];

if (
  document.querySelector(".band-wrapper") &&
  !document.body.classList.contains("about-layout-editing")
) {

let memberHoverEnabled = false;

function enableMemberHover() {
  memberHoverEnabled = true;
}

function armMemberHoverGate() {
  memberHoverEnabled = false;
  document.addEventListener("pointermove", enableMemberHover, { once: true });
}

function resetAllMemberAudio() {
  memberSounds.forEach(item => {
    const member =
      document.querySelector(item.selector)?.closest(".member");
    const audio = document.getElementById(item.audioId);

    if (member) {
      member.classList.remove("active");
    }

    if (audio) {
      audio.loop = false;
      audio.autoplay = false;
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

function deactivateMember(member, audio) {
  member.classList.remove("active");
  audio.loop = false;
  audio.pause();
  audio.currentTime = 0;
}

function pauseInactiveMemberAudios(exceptAudioId){

  memberSounds.forEach(item => {

    const member =
    document.querySelector(item.selector)?.closest(".member");

    const sound =
    document.getElementById(item.audioId);

    if(!member || !sound) return;

    if(member.classList.contains("active")) return;

    if(exceptAudioId && item.audioId === exceptAudioId) return;

    sound.loop = false;
    sound.pause();
    sound.currentTime = 0;
  });
}

resetAllMemberAudio();
armMemberHoverGate();

window.addEventListener("pageshow", event => {

  if(!event.persisted) return;

  resetAllMemberAudio();
  armMemberHoverGate();
});

memberSounds.forEach(item => {

  const trigger = document.querySelector(item.selector);
  const audio = document.getElementById(item.audioId);
  const member = trigger?.closest(".member");

  if (!trigger || !audio || !member) return;

  audio.volume = item.volume;
  audio.loop = false;
  audio.autoplay = false;

  trigger.addEventListener("mouseenter", () => {

    if(!memberHoverEnabled) return;

    if(member.classList.contains("active")) return;

    pauseInactiveMemberAudios(item.audioId);

    audio.loop = false;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  });

  trigger.addEventListener("click", () => {

    memberHoverEnabled = true;

    const wasActive = member.classList.contains("active");

    if (wasActive) {
      deactivateMember(member, audio);

      if (member.matches(":hover")) {
        audio.loop = false;
        audio.play().catch(() => {});
      }

      return;
    }

    member.classList.add("active");
    audio.loop = true;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  });
});

}