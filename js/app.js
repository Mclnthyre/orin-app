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

  /* ===== mini-player segurança ===== */
  if (!miniPlayer) return;

  miniProgress = document.getElementById('miniProgress');
  miniProgressFill = document.getElementById('miniProgressFill');

  if (!miniProgress) {
    miniProgress = document.createElement('div');
    miniProgress.id = 'miniProgress';
    miniProgress.className = 'mini-progress';

    miniProgressFill = document.createElement('div');
    miniProgressFill.id = 'miniProgressFill';
    miniProgressFill.className = 'mini-progress-fill';

    miniProgress.appendChild(miniProgressFill);
    miniPlayer.appendChild(miniProgress);
  }

  /* ===== controles ===== */
  if (miniPlay) miniPlay.onclick = () => audio?.play();
  if (miniPause) miniPause.onclick = () => audio?.pause();

  if (miniClose) {
    miniClose.onclick = () => {
      if (!audio) return;
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
    const r = miniProgress.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    audio.currentTime = pct * audio.duration;
  });

  /* ===== eventos do áudio ===== */
  if (audio) {
    audio.addEventListener('play', () => {
      miniPlay?.classList.add('hidden');
      miniPause?.classList.remove('hidden');
    });

    audio.addEventListener('pause', () => {
      miniPause?.classList.add('hidden');
      miniPlay?.classList.remove('hidden');
    });

    audio.addEventListener('timeupdate', () => {
      if (!isNaN(audio.currentTime)) {
        localStorage.setItem('audioTime', audio.currentTime);
      }
      if (audio.duration && miniProgressFill) {
        miniProgressFill.style.width =
          (audio.currentTime / audio.duration) * 100 + '%';
      }
    });

    audio.addEventListener('ended', () => {
      if (playlist.length && playlistIndex > -1) {
        playlistIndex++;
        if (playlistIndex < playlist.length) {
          const p = playlist[playlistIndex];
          tocarAudio(p.audio, p.titulo);
          return;
        }
      }
      miniPause?.classList.add('hidden');
      miniPlay?.classList.remove('hidden');
    });
  }

  /* ===== restaurar player ===== */
  const savedSrc = localStorage.getItem('audioSrc');
  if (savedSrc && audio) {
    audio.src = savedSrc;
    miniTitle.textContent = localStorage.getItem('audioTitle') || '';
    miniPlayer.classList.remove('hidden');
  }

  /* ===== PWA ===== */
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'flex';
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  carregar();
});

/* ===============================
   FETCH
================================ */
async function carregar() {
  try {
    const [artigos, audios, videos, servicos] = await Promise.all([
      fetch(`${BASE}/artigos`).then(r => r.json()),
      fetch(`${BASE}/audios`).then(r => r.json()),
      fetch(`${BASE}/videos`).then(r => r.json()),
      fetch(`${BASE}/servicos`).then(r => r.json())
    ]);

    dados = { artigos, audios, videos, servicos };
    mostrar('artigos');
  } catch (e) {
    console.error(e);
    document.getElementById('conteudo').innerHTML =
      '<p>Erro ao carregar conteúdo.</p>';
  }
}

/* ===============================
   AUX
================================ */
function ativar(secao) {
  document.querySelectorAll('.menu button')
    .forEach(b => b.classList.remove('active'));
  document.getElementById(secao + '-btn')?.classList.add('active');
}

function agruparPorTag(lista) {
  if (!Array.isArray(lista)) return {};
  return lista.reduce((acc, item) => {
    const tag = item?.tag || 'Outros';
    acc[tag] = acc[tag] || [];
    acc[tag].push(item);
    return acc;
  }, {});
}

/* ===============================
   ACCORDION
================================ */
function renderAccordion(grupos, renderItem) {
  return Object.keys(grupos).map(tag => `
    <div class="accordion">
      <button class="accordion-header" onclick="toggleAccordion(this)">
        <span>${tag}</span>
        <span class="material-icons-outlined">expand_more</span>
      </button>
      <div class="accordion-body">
        ${grupos[tag].map(renderItem).join('')}
      </div>
    </div>
  `).join('');
}

function toggleAccordion(btn) {
  btn.nextElementSibling?.classList.toggle('open');
  btn.querySelector('.material-icons-outlined')?.classList.toggle('rotated');
}

/* ===============================
   RENDER
================================ */
function mostrar(secao) {
  ativar(secao);
  const c = document.getElementById('conteudo');
  if (!c || !dados[secao]) return;

  let html = '';

  if (secao === 'artigos') {
    html = renderAccordion(agruparPorTag(dados.artigos), a => `
      <div class="card" onclick="location.href='artigo.html?id=${dados.artigos.indexOf(a)}'">
        <div class="card-body">
          <h2>${escapeHtml(a.titulo)}</h2>
          <p>${escapeHtml(a.resumo)}</p>
        </div>
      </div>
    `);
  }

  if (secao === 'audios') {
    html = renderAccordion(agruparPorTag(dados.audios), a => `
      <div class="card">
        <h3>${escapeHtml(a.titulo)}</h3>
        <button onclick="iniciarPlaylist('${escapeAttr(a.tag)}','${escapeAttr(a.audio)}','${escapeAttr(a.titulo)}')">
          ▶ Ouvir
        </button>
      </div>
    `);
  }

  if (secao === 'videos') {
    html = renderAccordion(agruparPorTag(dados.videos), v => `
      <div class="card">
        <h2>${escapeHtml(v.titulo)}</h2>
        <div class="video-wrapper">${v.embed || ''}</div>
      </div>
    `);
  }

  if (secao === 'servicos') {
    html = renderAccordion(agruparPorTag(dados.servicos), s => `
      <div class="card">
        <h2>${escapeHtml(s.nome)}</h2>
        <a href="${escapeAttr(s.link)}" target="_blank">Acessar</a>
      </div>
    `);
  }

  c.innerHTML = html;
}

/* ===============================
   PLAYLIST / PLAYER
================================ */
function iniciarPlaylist(tag, src, titulo) {
  playlist = dados.audios.filter(a => a.tag === tag);
  playlistIndex = playlist.findIndex(a => a.audio === src);
  tocarAudio(src, titulo);
}

function tocarAudio(src, titulo) {
  if (!audio) return;

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
   UTIL
================================ */
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
  );
}
function escapeAttr(str) {
  return escapeHtml(str);
}

/* ===============================
   EXPORTS
================================ */
window.mostrar = mostrar;
window.iniciarPlaylist = iniciarPlaylist;
window.tocarAudio = tocarAudio;
window.instalar = function () {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => {
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
};
