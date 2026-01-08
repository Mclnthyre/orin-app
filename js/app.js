/* ===============================
   CONFIG
================================ */
const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

let dados = {};
let playlist = [];
let playlistIndex = -1;

/* elementos DOM - serão atribuídos no init */
let audio, miniPlayer, miniTitle, miniPlay, miniPause, miniClose;
let miniProgress, miniProgressFill;
let installBtn;
let deferredPrompt;

/* ===============================
   INICIALIZAÇÃO (aguarda DOM pronto)
================================ */
document.addEventListener('DOMContentLoaded', () => {
  // pegar elementos (se existirem no HTML)
  audio = document.getElementById('globalAudio');
  miniPlayer = document.getElementById('miniPlayer');
  miniTitle = document.getElementById('miniTitle');
  miniPlay = document.getElementById('miniPlay');
  miniPause = document.getElementById('miniPause');
  miniClose = document.getElementById('miniClose');
  installBtn = document.getElementById('installBtn');

  // garantir que miniPlayer exista; se não, cria um container mínimo (segurança)
  if (!miniPlayer) {
    miniPlayer = document.createElement('div');
    miniPlayer.id = 'miniPlayer';
    miniPlayer.className = 'mini-player hidden';
    document.body.appendChild(miniPlayer);
  }

  // PROGRESS: se o HTML já tiver a .mini-progress usamos, se não, criamos
  miniProgress = document.getElementById('miniProgress') || miniPlayer.querySelector('.mini-progress');
  miniProgressFill = document.getElementById('miniProgressFill') || (miniProgress ? miniProgress.querySelector('.mini-progress-fill') : null);

  if (!miniProgress) {
    // criar estrutura compatível com seu CSS existente
    miniProgress = document.createElement('div');
    miniProgress.className = 'mini-progress';
    miniProgress.id = 'miniProgress';

    miniProgressFill = document.createElement('div');
    miniProgressFill.className = 'mini-progress-fill';
    miniProgressFill.id = 'miniProgressFill';

    miniProgress.appendChild(miniProgressFill);
    miniPlayer.appendChild(miniProgress);
  } else if (!miniProgressFill) {
    miniProgressFill = document.createElement('div');
    miniProgressFill.className = 'mini-progress-fill';
    miniProgressFill.id = 'miniProgressFill';
    miniProgress.appendChild(miniProgressFill);
  }

  // listeners seguros (apenas se elementos existirem)
  if (miniPlay) miniPlay.onclick = () => audio && audio.play();
  if (miniPause) miniPause.onclick = () => audio && audio.pause();
  if (miniClose) {
    miniClose.onclick = () => {
      if (!audio) return;
      audio.pause();
      audio.src = '';
      if (miniPlayer) miniPlayer.classList.add('hidden');
      localStorage.removeItem('audioSrc');
      localStorage.removeItem('audioTime');
      localStorage.removeItem('audioTitle');
    };
  }

  // progress click (use offsetX com fallback)
  miniProgress.addEventListener('click', (e) => {
    if (!audio || !audio.duration) return;
    const rect = miniProgress.getBoundingClientRect();
    // usar clientX para evitar problemas com offset em elementos colocados
    const clickX = (typeof e.clientX === 'number') ? (e.clientX - rect.left) : (e.offsetX || 0);
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = pct * audio.duration;
  });

  // audio events (defensivos)
  if (audio) {
    audio.addEventListener('play', () => {
      if (miniPlay) miniPlay.classList.add('hidden');
      if (miniPause) miniPause.classList.remove('hidden');
    });

    audio.addEventListener('pause', () => {
      if (miniPause) miniPause.classList.add('hidden');
      if (miniPlay) miniPlay.classList.remove('hidden');
    });

    audio.addEventListener('timeupdate', () => {
      // persistir progresso (só a posição em segundos)
      if (audio && !isNaN(audio.currentTime)) {
        localStorage.setItem('audioTime', audio.currentTime);
      }

      // atualizar barra visual se duração válida
      if (audio && audio.duration && miniProgressFill) {
        const pct = (audio.currentTime / audio.duration) * 100;
        miniProgressFill.style.width = pct + '%';
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      const savedTime = localStorage.getItem('audioTime');
      if (savedTime && localStorage.getItem('audioSrc') === audio.src) {
        const t = parseFloat(savedTime);
        if (!isNaN(t) && t > 0 && t < audio.duration) audio.currentTime = t;
      }
    });

    audio.addEventListener('ended', () => {
      // avançar na playlist (se houver)
      if (Array.isArray(playlist) && playlist.length && playlistIndex > -1) {
        playlistIndex++;
        if (playlistIndex < playlist.length) {
          const prox = playlist[playlistIndex];
          if (prox && prox.audio) tocarAudio(prox.audio, prox.titulo);
          return;
        }
      }
      // se não avançou, apenas parar e esconder controles se desejar
      if (miniPlay) miniPlay.classList.remove('hidden');
      if (miniPause) miniPause.classList.add('hidden');
    });
  }

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'flex';
  });

  // registrar service worker (opcional; defensivo)
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    } catch (err) {/* swallow */}
  }

  // finalmente iniciar carregamento do conteúdo
  carregar().catch(err => {
    console.error('Erro no carregar():', err);
    document.getElementById('conteudo').innerHTML = '<p>Erro ao carregar conteúdo.</p>';
  });
});

/* ===============================
   CARREGAMENTO DOS DADOS (fetch)
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
    // mostrar a tela inicial (artigos) — somente se a função existir
    if (typeof mostrar === 'function') mostrar('artigos');
  } catch (e) {
    console.error(e);
    const conteudo = document.getElementById('conteudo');
    if (conteudo) conteudo.innerHTML = '<p>Erro ao carregar conteúdo.</p>';
  }
}

/* ===============================
   FUNÇÕES AUX (seguras)
================================ */
function ativar(secao) {
  document.querySelectorAll('.menu button')
    .forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(secao + '-btn');
  if (btn) btn.classList.add('active');
}

// aceita undefined/ null sem quebrar
function agruparPorTag(lista) {
  if (!Array.isArray(lista)) return {};
  return lista.reduce((acc, item) => {
    const tag = (item && item.tag) ? item.tag : 'Outros';
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
  if (!body) return;
  body.classList.toggle('open');
  if (icon) icon.classList.toggle('rotated');
}

/* ===============================
   RENDERIZAÇÃO PRINCIPAL (segura)
================================ */
function mostrar(secao) {
  ativar(secao);

  const conteudoEl = document.getElementById('conteudo');
  if (!conteudoEl) return;

  // se dados ainda não carregados, mostrar mensagem amigável
  if (!dados || !dados[secao]) {
    conteudoEl.innerHTML = '<p>Carregando...</p>';
    return;
  }

  let html = '';

  if (secao === 'artigos') {
    const grupos = agruparPorTag(dados.artigos);
    html = renderAccordion(grupos, a => `
      <div class="card" onclick="location.href='artigo.html?id=${encodeURIComponent(dados.artigos.indexOf(a))}'">
        ${a && a.imagem ? `<img src="${a.imagem}" alt="">` : ''}
        <div class="card-body">
          <h2>${a ? escapeHtml(a.titulo) : ''}</h2>
          <p>${a ? escapeHtml(a.resumo) : ''}</p>
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
            <h3 class="audio-title">${a ? escapeHtml(a.titulo) : ''}</h3>
          </div>
          <button class="audio-play-btn"
            onclick="iniciarPlaylist('${a ? escapeAttr(a.tag) : ''}','${a ? escapeAttr(a.audio) : ''}','${a ? escapeAttr(a.titulo) : ''}')">
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
          <h2>${v ? escapeHtml(v.titulo) : ''}</h2>
          ${v && v.embed ? v.embed : ''}
        </div>
      </div>
    `);
  }

  if (secao === 'servicos') {
    const grupos = agruparPorTag(dados.servicos);
    html = renderAccordion(grupos, s => `
      <div class="card">
        <div class="card-body">
          <h2>${s ? escapeHtml(s.nome) : ''}</h2>
          <a href="${s && s.link ? escapeAttr(s.link) : '#'}" target="_blank">Acessar</a>
        </div>
      </div>
    `);
  }

  conteudoEl.innerHTML = html;
}

/* ===============================
   PLAYLIST
================================ */
function iniciarPlaylist(tag, src, titulo) {
  playlist = Array.isArray(dados.audios) ? dados.audios.filter(a => a.tag === tag) : [];
  playlistIndex = playlist.findIndex(a => a.audio === src);
  if (playlistIndex === -1) {
    // fallback: procurar por src em toda a lista
    playlistIndex = (Array.isArray(dados.audios) ? dados.audios.findIndex(a => a.audio === src) : -1);
    if (playlistIndex !== -1) playlist = dados.audios.slice(); // tocar da lista completa
  }
  if (playlistIndex === -1) {
    // tocar apenas o src isolado mesmo
    tocarAudio(src, titulo);
    return;
  }
  tocarAudio(src, titulo);
}

/* ===============================
   PLAYER (tocar / persistir)
================================ */
function tocarAudio(src, titulo) {
  if (!audio) return;

  try {
    const lastSrc = localStorage.getItem('audioSrc');

    // se mudou a fonte, resetar posição
    if (lastSrc !== src) {
      audio.pause();
      try { audio.currentTime = 0; } catch(e){ /* ignore */ }
      localStorage.removeItem('audioTime');
    }

    // setar src (sempre), e título
    audio.src = src || '';
    if (miniTitle) miniTitle.textContent = titulo || '';

    if (miniPlayer) miniPlayer.classList.remove('hidden');

    localStorage.setItem('audioSrc', src || '');
    localStorage.setItem('audioTitle', titulo || '');

    // tentar restaurar tempo se for o MESMO src
    const savedTime = localStorage.getItem('audioTime');
    if (savedTime && lastSrc === src) {
      const t = parseFloat(savedTime);
      if (!isNaN(t)) {
        audio.currentTime = t;
      }
    } else {
      // garantir que comece do zero
      try { audio.currentTime = 0; } catch(e){ /* ignore */ }
    }

    // reproduzir (catch para prevenir erros no autoplay)
    audio.play().catch(() => { /* autoplay pode falhar em alguns browsers */ });
  } catch (err) {
    console.warn('Erro em tocarAudio:', err);
  }
}

/* ===============================
   UTILITÁRIOS (pequeno sanitize)
================================ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ===============================
   EXPORTS GLOBAIS (para onclick inline no HTML)
   - mantemos as funções no escopo global para que
     os atributos onclick="mostrar('audios')" continuem funcionando
================================ */
window.mostrar = mostrar;
window.iniciarPlaylist = iniciarPlaylist;
window.tocarAudio = tocarAudio;

/* ===============================
   FUNÇÕES PWA (instalar)
================================ */
window.addEventListener('beforeinstallprompt', (e) => {
  // caso o listener acima não tenha sido registrado por DOMContentLoaded
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'flex';
  e.preventDefault();
});

window.instalar = function() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => {
    deferredPrompt = null;
    if (installBtn) installBtn.style.display = 'none';
  });
};
