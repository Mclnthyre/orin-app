/* ===============================
   CONFIG
================================ */
const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

let dados = {};
let playlist = [];
let playlistIndex = -1;

/* elementos DOM */
let audio, miniPlayer, miniTitle, miniPlay, miniPause, miniClose;
let miniProgress, miniProgressFill;
let installBtn;
let deferredPrompt;

/* ===============================
   INIT
================================ */
document.addEventListener('DOMContentLoaded', () => {
  audio = document.getElementById('globalAudio');
  miniPlayer = document.getElementById('miniPlayer');
  miniTitle = document.getElementById('miniTitle');
  miniPlay = document.getElementById('miniPlay');
  miniPause = document.getElementById('miniPause');
  miniClose = document.getElementById('miniClose');
  installBtn = document.getElementById('installBtn');

  if (!miniPlayer) {
    miniPlayer = document.createElement('div');
    miniPlayer.id = 'miniPlayer';
    miniPlayer.className = 'mini-player hidden';
    document.body.appendChild(miniPlayer);
  }

  miniProgress = document.getElementById('miniProgress') || miniPlayer.querySelector('.mini-progress');
  miniProgressFill = document.getElementById('miniProgressFill') || miniProgress?.querySelector('.mini-progress-fill');

  if (!miniProgress) {
    miniProgress = document.createElement('div');
    miniProgress.className = 'mini-progress';
    miniProgress.id = 'miniProgress';

    miniProgressFill = document.createElement('div');
    miniProgressFill.className = 'mini-progress-fill';
    miniProgressFill.id = 'miniProgressFill';

    miniProgress.appendChild(miniProgressFill);
    miniPlayer.appendChild(miniProgress);
  }

  if (miniPlay) miniPlay.onclick = () => audio?.play();
  if (miniPause) miniPause.onclick = () => audio?.pause();

  if (miniClose) {
    miniClose.onclick = () => {
      audio.pause();
      audio.src = '';
      miniPlayer.classList.add('hidden');
      localStorage.removeItem('audioSrc');
      localStorage.removeItem('audioTime');
      localStorage.removeItem('audioTitle');
    };
  }

  miniProgress.addEventListener('click', e => {
    if (!audio?.duration) return;
    const rect = miniProgress.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration;
  });

  /* ===== AUDIO EVENTS ===== */
  audio?.addEventListener('play', () => {
    miniPlay?.classList.add('hidden');
    miniPause?.classList.remove('hidden');
  });

  audio?.addEventListener('pause', () => {
    miniPause?.classList.add('hidden');
    miniPlay?.classList.remove('hidden');
  });

  audio?.addEventListener('timeupdate', () => {
    localStorage.setItem('audioTime', audio.currentTime);
    if (audio.duration && miniProgressFill) {
      miniProgressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
  });

  audio?.addEventListener('ended', () => {
    playlistIndex++;
    if (playlist[playlistIndex]) {
      tocarAudio(playlist[playlistIndex].audio, playlist[playlistIndex].titulo);
    }
  });

  /* ===============================
     RESTAURA PLAYER AO CARREGAR
  ================================ */
  const savedSrc = localStorage.getItem('audioSrc');
  const savedTitle = localStorage.getItem('audioTitle');
  const savedTime = localStorage.getItem('audioTime');

  if (savedSrc && audio) {
    audio.src = savedSrc;
    if (miniTitle) miniTitle.textContent = savedTitle || '';
    miniPlayer.classList.remove('hidden');

    audio.addEventListener('loadedmetadata', () => {
      if (savedTime) {
        const t = parseFloat(savedTime);
        if (!isNaN(t)) audio.currentTime = t;
      }
    }, { once: true });
  }

  carregar();
});

/* ===============================
   FETCH
================================ */
async function carregar() {
  const [artigos, audios, videos, servicos] = await Promise.all([
    fetch(`${BASE}/artigos`).then(r => r.json()),
    fetch(`${BASE}/audios`).then(r => r.json()),
    fetch(`${BASE}/videos`).then(r => r.json()),
    fetch(`${BASE}/servicos`).then(r => r.json())
  ]);

  dados = { artigos, audios, videos, servicos };
  mostrar('artigos');
}

/* ===============================
   PLAYLIST
================================ */
function iniciarPlaylist(tag, src, titulo) {
  playlist = dados.audios.filter(a => a.tag === tag);
  playlistIndex = playlist.findIndex(a => a.audio === src);
  tocarAudio(src, titulo);
}

/* ===============================
   PLAYER
================================ */
function tocarAudio(src, titulo) {
  const lastSrc = localStorage.getItem('audioSrc');

  if (lastSrc !== src) {
    audio.pause();
    audio.currentTime = 0;
    localStorage.removeItem('audioTime');
  }

  audio.src = src;
  miniTitle.textContent = titulo;
  miniPlayer.classList.remove('hidden');

  localStorage.setItem('audioSrc', src);
  localStorage.setItem('audioTitle', titulo);

  audio.play().catch(() => {});
}

/* ===============================
   EXPORTS
================================ */
window.mostrar = mostrar;
window.iniciarPlaylist = iniciarPlaylist;
window.tocarAudio = tocarAudio;
