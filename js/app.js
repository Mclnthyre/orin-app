const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

let dados = {};

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
  } catch {
    document.getElementById('conteudo').innerHTML =
      '<p>Erro ao carregar conteúdo.</p>';
  }
}

function ativar(secao) {
  document.querySelectorAll('.menu button')
    .forEach(b => b.classList.remove('active'));
  document.getElementById(secao + '-btn').classList.add('active');
}

/* ===== AGRUPAR POR TAG ===== */
function agruparPorTag(lista) {
  return lista.reduce((acc, item) => {
    const tag = item.tag || 'Outros';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(item);
    return acc;
  }, {});
}

/* ===== ACCORDION ===== */
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

/* ===== MOSTRAR ===== */
function mostrar(secao) {
  ativar(secao);
  let html = '';

  if (secao === 'artigos') {
    const grupos = agruparPorTag(dados.artigos);
    html = renderAccordion(grupos, (a, i) => `
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
         <button onclick="tocarAudio('${a.audio}', '${a.titulo}')">
  ▶️ Ouvir
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

carregar();

/* ===== SERVICE WORKER ===== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

/* ===== BOTÃO INSTALAR ===== */
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'flex';
});

function instalar() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => {
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

/* ===== MINI PLAYER GLOBAL ===== */

const audio = document.getElementById('globalAudio');
const miniPlayer = document.getElementById('miniPlayer');
const miniTitle = document.getElementById('miniTitle');
const playBtn = document.getElementById('miniPlay');
const pauseBtn = document.getElementById('miniPause');
const closeBtn = document.getElementById('miniClose');

/* restaurar estado */
const savedAudio = localStorage.getItem('audioSrc');
const savedTime = localStorage.getItem('audioTime');
const savedTitle = localStorage.getItem('audioTitle');

if (savedAudio) {
  audio.src = savedAudio;
  miniTitle.textContent = savedTitle || '';
  miniPlayer.classList.remove('hidden');

  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = savedTime || 0;
  });
}

/* controles */
playBtn.onclick = () => {
  audio.play();
  playBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
};

pauseBtn.onclick = () => {
  audio.pause();
  pauseBtn.classList.add('hidden');
  playBtn.classList.remove('hidden');
};

closeBtn.onclick = () => {
  audio.pause();
  audio.src = '';
  miniPlayer.classList.add('hidden');
  localStorage.clear();
};

/* persistência */
audio.addEventListener('timeupdate', () => {
  localStorage.setItem('audioTime', audio.currentTime);
});

audio.addEventListener('play', () => {
  playBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
});

audio.addEventListener('pause', () => {
  pauseBtn.classList.add('hidden');
  playBtn.classList.remove('hidden');
});

/* função pública */
function tocarAudio(src, titulo) {
  if (audio.src !== src) {
    audio.src = src;
  }

  miniTitle.textContent = titulo;
  miniPlayer.classList.remove('hidden');
  audio.play();

  localStorage.setItem('audioSrc', src);
  localStorage.setItem('audioTitle', titulo);
}


