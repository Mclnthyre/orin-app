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
  } catch (e) {
    document.getElementById('conteudo').innerHTML =
      '<p>Erro ao carregar conteúdo.</p>';
  }
}

function ativar(secao) {
  document.querySelectorAll('.menu button')
    .forEach(b => b.classList.remove('active'));
  document.getElementById(secao + '-btn').classList.add('active');
}

function mostrar(secao) {
  ativar(secao);
  let html = '';

  /* ===== ARTIGOS ===== */
  if (secao === 'artigos') {
    html = dados.artigos.map((a, i) => `
      <div class="card" onclick="location.href='artigo.html?id=${i}'">
        ${a.imagem ? `<img src="${a.imagem}">` : ''}
        <div class="card-body">
          <h2>${a.titulo}</h2>
          <p>${a.resumo}</p>
        </div>
      </div>
    `).join('');
  }

  /* ===== ÁUDIOS ===== */
  if (secao === 'audios') {
    html = dados.audios.map(a => `
      <div class="card">
        <div class="audio-card">
          <div class="audio-header">
            <span class="audio-icon material-icons-outlined">headphones</span>
            <h3 class="audio-title">${a.titulo}</h3>
          </div>

          <div class="audio-player">
            ${a.embed}
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ===== VÍDEOS ===== */
  if (secao === 'videos') {
    html = dados.videos.map(v => `
      <div class="card">
        <div class="card-body">
          <h2>${v.titulo}</h2>
          ${v.embed}
        </div>
      </div>
    `).join('');
  }

  /* ===== SERVIÇOS ===== */
  if (secao === 'servicos') {
    html = dados.servicos.map(s => `
      <div class="card">
        <div class="card-body">
          <h2>${s.nome}</h2>
          <a href="${s.link}" target="_blank">Acessar</a>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('conteudo').innerHTML = html;
}

carregar();

/* ===== SERVICE WORKER ===== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

/* ===== BOTÃO INSTALAR APP ===== */

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
