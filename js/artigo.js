const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/${PLANILHA_ID}`;

// ======================
// Skeleton Loading
// ======================
function mostrarSkeleton() {
  document.getElementById('artigo').innerHTML = `
    <div class="skeleton-img"></div>
    <div class="skeleton-title"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text short"></div>
  `;
}

// ======================
// SEO Dinâmico
// ======================
function atualizarSEO(artigo) {
  document.title = artigo.titulo + " | Orin";

  let desc = document.querySelector('meta[name="description"]');
  if (!desc) {
    desc = document.createElement('meta');
    desc.name = "description";
    document.head.appendChild(desc);
  }

  desc.content = artigo.resumo || artigo.titulo;
}

// ======================
// Compartilhamento
// ======================
function compartilharArtigo(titulo) {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: titulo,
      url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência!");
  }
}

// ======================
// Carregar Artigo
// ======================
async function carregarArtigo() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('artigo').innerHTML =
      '<p>Artigo não encontrado.</p>';
    return;
  }

  mostrarSkeleton();

  try {
    const artigos = await fetch(`${BASE}/artigos`).then(r => r.json());
    const a = artigos[id];

    if (!a) {
      document.getElementById('artigo').innerHTML =
        '<p>Artigo não encontrado.</p>';
      return;
    }

    atualizarSEO(a);

    document.getElementById('artigo').innerHTML = `
      ${a.imagem ? `<img src="${a.imagem}" class="artigo-img" loading="lazy">` : ''}

      <h1>${a.titulo}</h1>

      <button class="btn-share" onclick="compartilharArtigo('${a.titulo.replace(/'/g, "\\'")}')">
        Compartilhar
      </button>

      <div class="artigo-texto">
        ${a.texto.replace(/\n/g, '<br><br>')}
      </div>
    `;
  } catch (e) {
    document.getElementById('artigo').innerHTML =
      '<p>Erro ao carregar artigo.</p>';
  }
}

// ======================
// Barra de Progresso
// ======================
function initProgressBar() {
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const progress = (scrollTop / height) * 100;
    const bar = document.getElementById('progress');

    if (progress < 5) {
      bar.style.opacity = 0;
    } else {
      bar.style.opacity = 1;
      bar.style.width = progress + '%';
    }
  });
}

// ======================
// Init
// ======================
carregarArtigo();
initProgressBar();
