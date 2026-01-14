/* ===============================
   CONFIG
================================ */
const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

let dados = {};
let playlist = [];
let playlistIndex = -1;

let audio, miniPlayer, miniTitle, playPauseBtn, closePlayerBtn;

/* ===============================
   INIT
================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
  carregar();
});

/* ===============================
   PLAYER INIT (CRÍTICO)
================================ */
function initPlayer() {
  audio = document.getElementById('globalAudio');
  miniPlayer = document.getElementById('miniPlayer');
  miniTitle = document.getElementById('miniTitle');
  playPauseBtn = document.getElementById('playPause');
  closePlayerBtn = document.getElementById('closePlayer');

  if (!audio || !miniPlayer) return;

  // restore state
  const src = localStorage.getItem('audioSrc');
  const title = localStorage.getItem('audioTitle');
  const time = localStorage.getItem('audioTime');
  const wasPlaying = localStorage.getItem('audioPlaying') === 'true';

  if (src) {
    audio.src = src;
    miniTitle.textContent = title || '';
    miniPlayer.classList.remove('hidden');

    audio.addEventListener('loadedmetadata', () => {
      if (time) audio.currentTime = parseFloat(time);
    });

    if (wasPlaying) {
      const resume = () => {
        audio.play().catch(() => {});
        document.removeEventListener('click', resume);
        document.removeEventListener('touchstart', resume);
      };
      document.addEventListener('click', resume);
      document.addEventListener('touchstart', resume);
    }
  }

  audio.addEventListener('timeupdate', () => {
    localStorage.setItem('audioTime', audio.currentTime);
  });

  audio.addEventListener('play', () => {
    localStorage.setItem('audioPlaying', 'true');
  });

  audio.addEventListener('pause', () => {
    localStorage.setItem('audioPlaying', 'false');
  });

  playPauseBtn?.addEventListener('click', () => {
    audio.paused ? audio.play() : audio.pause();
  });

  closePlayerBtn?.addEventListener('click', () => {
    audio.pause();
    audio.src = '';
    miniPlayer.classList.add('hidden');
    localStorage.clear();
  });
}

/* ===============================
   AUDIO CORE
================================ */
function tocarAudio(src, titulo) {
  const lastSrc = localStorage.getItem('audioSrc');

  if (lastSrc !== src) {
    audio.pause();
    audio.currentTime = 0;
    localStorage.removeItem('audioTime');
  }

  audio.src = src;
  audio.play().catch(() => {});

  miniTitle.textContent = titulo;
  miniPlayer.classList.remove('hidden');

  localStorage.setItem('audioSrc', src);
  localStorage.setItem('audioTitle', titulo);
}

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
    document.getElementById('conteudo').innerHTML =
      '<p>Erro ao carregar conteúdo.</p>';
  }
}

/* ===============================
   PLAYLIST
================================ */
function iniciarPlaylist(tag, src, titulo) {
  playlist = dados.audios.filter(a => a.tag === tag);
  playlistIndex = playlist.findIndex(a => a.audio === src);

  const atual = playlist[playlistIndex] || { audio: src, titulo };
  tocarAudio(atual.audio, atual.titulo);
}

/* ===============================
   AUX / RENDER (inalterado)
================================ */
function ativar(secao) {
  document.querySelectorAll('.menu button')
    .forEach(b => b.classList.remove('active'));
  document.getElementById(secao + '-btn')?.classList.add('active');
}

function agruparPorTag(lista) {
  if (!Array.isArray(lista)) return {};
  return lista.reduce((acc, item) => {
    const tag = item.tag || 'Outros';
    acc[tag] = acc[tag] || [];
    acc[tag].push(item);
    return acc;
  }, {});
}

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

function mostrar(secao) {
  ativar(secao);
  const c = document.getElementById('conteudo');
  if (!c || !dados[secao]) return;

  let html = '';

  if (secao === 'artigos') {
    html = renderAccordion(agruparPorTag(dados.artigos), a => `
      <div class="card artigo-card"
        onclick="location.href='artigo.html?id=${dados.artigos.indexOf(a)}'">
        ${a.imagem ? `<div class="card-thumb" style="background-image:url('${a.imagem}')"></div>` : ''}
        <div class="card-body">
          <h2>${a.titulo}</h2>
          <p>${a.resumo || ''}</p>
        </div>
      </div>
    `);
  }

  if (secao === 'audios') {
    html = renderAccordion(agruparPorTag(dados.audios), a => `
      <div class="card">
        <h3>${a.titulo}</h3>
        <button onclick="iniciarPlaylist('${a.tag}','${a.audio}','${a.titulo}')">
          ▶ Ouvir
        </button>
      </div>
    `);
  }

  if (secao === 'videos') {
    html = renderAccordion(agruparPorTag(dados.videos), v => `
      <div class="card">
        <h2>${v.titulo}</h2>
        <div class="video-wrapper">${v.embed || ''}</div>
      </div>
    `);
  }

  if (secao === 'servicos') {
    html = renderAccordion(agruparPorTag(dados.servicos), s => `
      <div class="card">
        <h2>${s.nome}</h2>
        <a href="${s.link}" target="_blank">Acessar</a>
      </div>
    `);
  }

  c.innerHTML = html;
}

/* ===============================
   EXPORTS
================================ */
window.mostrar = mostrar;
window.iniciarPlaylist = iniciarPlaylist;
window.tocarAudio = tocarAudio;
