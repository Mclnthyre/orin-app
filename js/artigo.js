let artigoAtual = null;

// ======================
// Skeleton
// ======================
function mostrarSkeleton() {
  document.getElementById('artigo').innerHTML = `
    <div class="skeleton-img"></div>
    <div class="skeleton-title"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text"></div>
  `;
}

// ======================
// SEO
// ======================
function atualizarSEO(a) {
  document.title = `${a.titulo} | Orin`;

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = a.resumo || a.titulo;
}

// ======================
// Compartilhar (HEADER)
// ======================
function compartilharArtigoAtual() {
  if (!artigoAtual) return;

  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: artigoAtual.titulo,
      url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copiado!");
  }
}

// ======================
// Artigo
// ======================
async function carregarArtigo() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;

  mostrarSkeleton();

  const artigos = await fetch(`${BASE}/artigos`).then(r => r.json());
  const a = artigos[id];
  if (!a) return;

  artigoAtual = a;
  atualizarSEO(a);

  document.getElementById('artigo').innerHTML = `
    ${a.imagem ? `<img src="${a.imagem}" class="artigo-img" loading="lazy">` : ''}
    <h1>${a.titulo}</h1>
    <div class="artigo-texto">
      ${a.texto.replace(/\n/g, '<br><br>')}
    </div>
  `;
}

// ======================
// Barra de Progresso
// ======================
window.addEventListener('scroll', () => {
  const bar = document.getElementById('progress');
  const scrollTop = document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const percent = (scrollTop / height) * 100;
  bar.style.width = percent + '%';
});

carregarArtigo();
