/* ===============================
   CONFIG
================================ */
const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

let dados = {};
let playlist = [];
let playlistIndex = -1;

/* ===============================
   INIT
================================ */
document.addEventListener('DOMContentLoaded', () => {
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
    const tag = item.tag || 'Outros';
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
          <h2>${a.titulo}</h2>
          <p>${a.resumo}</p>
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
