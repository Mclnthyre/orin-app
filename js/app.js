/* ===============================
   CONFIG
================================ */
const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

let dados = {};

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
   RENDERIZAÇÃO PRINCIPAL
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
  onclick="tocarAudio('${a.audio}', '${a.titulo}')">
  <span class="material-icons-outlined">play_arrow</span>
  Ouvir
</button>

        </div>
      </div>
    `);
  }

  if (secao === 'videos') {
    const grupos = agruparPorTag(dados.videos);
    html = renderAccordion(grupos, v => `
      <div class="card">
        <div class="card-body">
          <h2>${v.titulo}</h2>
          ${v.embed}
        </div>
      </div>
    `);
  }

  if (secao === 'servicos') {
    const grupos = agruparPorTag(dados.servicos);
    html = renderAccordion(grupos, s => `
      <div class="card">
        <div class="card-body">
          <h2>${s.nome}</h2>
          <a href="${s.link}" target="_blank">Acessar</a>
        </div>
      </div>
    `);
  }

  document.getElementById('conteudo').innerHTML = html;
}

/* ===============================
   SERVICE WORKER
================================ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

/* ===============================
   BOTÃO INSTALAR PWA
================================ */
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

if (window.matchMedia('(display-mode: standalone)').matches) {
  if (installBtn) installBtn.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'flex';
});

function instalar() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => {
    deferredPrompt = null;
    if (installBtn) installBtn.style.display = 'none';
  });
}

/* ===============================
   MINI PLAYER GLOBAL
================================ */
const audio = document.getElementById('globalAudio');
const miniPlayer = document.getElementById('miniPlayer');
const miniTitle = document.getElementById('miniTitle');
const miniPlay = document.getElementById('miniPlay');
const miniPause = document.getElementById('miniPause');
const miniClose = document.getElementById('miniClose');

/* restaurar estado */
const savedSrc = localStorage.getItem('audioSrc');
const savedTime = localStorage.getItem('audioTime');
const savedTitle = localStorage.getItem('audioTitle');

if (savedSrc && audio) {
  audio.src = savedSrc;
  miniTitle.textContent = savedTitle || '';
  miniPlayer.classList.remove('hidden');

  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = savedTime || 0;
  });
}

/* controles */
miniPlay.onclick = () => audio.play();
miniPause.onclick = () => audio.pause();

miniClose.onclick = () => {
  audio.pause();
  audio.src = '';
  miniPlayer.classList.add('hidden');
  localStorage.removeItem('audioSrc');
  localStorage.removeItem('audioTime');
  localStorage.removeItem('audioTitle');
};

/* estado visual */
audio.addEventListener('play', () => {
  miniPlay.classList.add('hidden');
  miniPause.classList.remove('hidden');
});

audio.addEventListener('pause', () => {
  miniPause.classList.add('hidden');
  miniPlay.classList.remove('hidden');
});

/* persistência */
audio.addEventListener('timeupdate', () => {
  localStorage.setItem('audioTime', audio.currentTime);
});

/* função pública */
function tocarAudio(src, titulo) {
  if (!src || typeof src !== 'string') return;

  const audio = document.getElementById('globalAudio');

  // SRC salvo anteriormente
  const lastSrc = localStorage.getItem('audioSrc');

  // Se for um áudio DIFERENTE, resetar completamente
  if (audio.src !== src && lastSrc !== src) {
    audio.pause();
    audio.currentTime = 0;

    // Limpa progresso antigo
    localStorage.removeItem('audioTime');
  }

  // Atualiza src apenas se mudou
  if (audio.src !== src) {
    audio.src = src;
  }

  // Atualiza UI
  document.getElementById('miniTitle').textContent = titulo;
  document.getElementById('miniPlayer').classList.remove('hidden');

  // Persistência
  localStorage.setItem('audioSrc', src);
  localStorage.setItem('audioTitle', titulo);

  // Só restaura tempo se for o MESMO áudio
  const savedTime = localStorage.getItem('audioTime');
  if (savedTime && lastSrc === src) {
    audio.currentTime = parseFloat(savedTime);
  } else {
    audio.currentTime = 0;
  }

  audio.play().catch(err => {
    console.warn('Erro ao tocar áudio:', err);
  });
}

/* ===============================
   START
================================ */
carregar();



