const PLANILHA_ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";
const BASE = `https://opensheet.elk.sh/1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE`;

async function carregarArtigo() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  if (id === null) {
    document.getElementById('artigo').innerHTML =
      '<p>Artigo não encontrado.</p>';
    return;
  }

  try {
    const artigos = await fetch(`${BASE}/artigos`).then(r => r.json());
    const a = artigos[id];

    if (!a) {
      document.getElementById('artigo').innerHTML =
        '<p>Artigo não encontrado.</p>';
      return;
    }

    document.getElementById('artigo').innerHTML = `
      ${a.imagem ? `<img src="${a.imagem}" class="artigo-img">` : ''}
      <h1>${a.titulo}</h1>
      <div class="artigo-texto">
        ${a.texto.replace(/\n/g, '<br><br>')}
      </div>
    `;
  } catch (e) {
    document.getElementById('artigo').innerHTML =
      '<p>Erro ao carregar artigo.</p>';
  }
}

carregarArtigo();
