/* ===============================
   CONFIG
================================ */
const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

let dados = {};
let playlist = [];
let playlistIndex = -1;

/* ===============================
   CARREGAMENTO INICIAL
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
   MENU
================================ */
function ativar(secao) {
  document.querySelectorAll('.menu button')
    .forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(secao + '-btn');
  if (btn) btn.classList.add('active');
}

/* ===============================
   AGRUPAR POR TAG
================================ */
function agruparPorTag(lista) {
  return lista.reduce((acc, item) => {
    const tag = item.tag || 'Outros';
    if (!acc[tag]) acc[tag] = [];
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
  const body = btn.nextElementSibling;
  const icon = btn.querySelector('.material-icons-outlined');
  body.classList.toggle('open');
  icon.classList.toggle('rotated');
}

/* ===============================
   RENDERIZAÇÃO
================================ */
function mostrar(secao) {
  ativar(secao);
  let html = '';

  if (secao === 'artigos') {
    const grupos = agruparPorTag(dados.artigos);
    html = renderAccordion(grupos, a => `
      <div class="card" onclick="location.href='artigo.html?id=${dados.artigos.indexOf(a)}'">
        ${a.imagem ? `<img src="${a.imagem}">` : ''}
        <div class="card-body">
          <h2>${a.titulo}</h2>
          <p>${a.resumo}</p>
        </div>
      </div>
    `);
  }

  if (secao === 'audios') {
    const grupos = agruparPorTag(dados.audios);
    html = renderAccordion(grupos, a => `
      <div class="card">
        <div class="audio-card">
          <div class="audio-header">
            <span class="audio-icon material-icons-outlined">headphones</span>
            <h3 class="audio-title">${a.titulo}</h3>
          </div>
          <button class="audio-play-btn"
            onclick="iniciarPlaylist('${a.tag}', '${a.audio}', '${a.titulo}')">
            <span class="material-icons-outlined">play_arrow</span>
            Ouvir
          </button>
        </div>
      </div>
    `);
  }

  document.getElementById('conteudo').innerHTML = html;
}

/* ===============================
   PLAYLIST
================================ */
function iniciarPlaylist(tag, src, titulo) {
  playlist = dados.audios.filter(a => a.tag === tag);
  playlistIndex = playlist.findIndex(a => a.audio === src);
  if (playlistIndex === -1) return;
  tocarAudio(src, titulo);
}

/* ===============================
   MINI PLAYER
================================ */
const audio = document.getElementById('globalAudio');
const miniPlayer = document.getElementById('miniPlayer');
const miniTitle = document.getElementById('miniTitle');
const miniPlay = document.getElementById('miniPlay');
const miniPause = document.getElementById('miniPause');

const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

/* restaurar */
const savedSrc = localStorage.getItem('audioSrc');
const savedTime = localStorage.getItem('audioTime');
const savedTitle = localStorage.getItem('audioTitle');

if (savedSrc) {
  audio.src = savedSrc;
  miniTitle.textContent = savedTitle || '';
  miniPlayer.classList.remove('hidden');

  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = savedTime ? parseFloat(savedTime) : 0;
  });
}

/* controles */
miniPlay.onclick = () => audio.play();
miniPause.onclick = () => audio.pause();

/* visual play/pause */
audio.addEventListener('play', () => {
  miniPlay.classList.add('hidden');
  miniPause.classList.remove('hidden');
});

audio.addEventListener('pause', () => {
  miniPause.classList.add('hidden');
  miniPlay.classList.remove('hidden');
});

/* progresso */
audio.addEventListener('timeupdate', () => {
  localStorage.setItem('audioTime', audio.currentTime);

  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + '%';
  }
});

/* clique na barra */
progressContainer.onclick = (e) => {
  const largura = progressContainer.clientWidth;
  const clique = e.offsetX;
  const percentual = clique / largura;
  audio.currentTime = audio.duration * percentual;
};

/* fim */
audio.addEventListener('ended', () => {
  if (playlist.length && playlistIndex > -1) {
    playlistIndex++;
    if (playlistIndex < playlist.length) {
      const prox = playlist[playlistIndex];
      tocarAudio(prox.audio, prox.titulo);
    }
  }
});

/* tocar */
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

  audio.play();
}

/* ===============================
   START
================================ */
carregar();
