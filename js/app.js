let dados = null;

fetch('content/dados.json')
  .then(r => r.json())
  .then(json => {
    dados = json;
    mostrar('artigos');
  })
  .catch(() => {
    document.getElementById('conteudo').innerHTML = 
      '<p>Erro ao carregar conteúdo</p>';
  });

function mostrar(secao) {
  if (!dados) return;

  let html = '';

  if (secao === 'artigos') {
    if (dados.artigos.length === 0) {
      html = '<p>Nenhum artigo ainda.</p>';
    } else {
      dados.artigos.forEach(a => {
        html += `<article>
          <h2>${a.titulo}</h2>
          <p>${a.texto}</p>
        </article>`;
      });
    }
  }

  if (secao === 'audios') {
    html = dados.audios.length
      ? dados.audios.map(a =>
          `<article><h3>${a.titulo}</h3>${a.embed}</article>`
        ).join('')
      : '<p>Nenhum áudio disponível.</p>';
  }

  if (secao === 'videos') {
    html = dados.videos.length
      ? dados.videos.map(v =>
          `<article><h3>${v.titulo}</h3>${v.embed}</article>`
        ).join('')
      : '<p>Nenhum vídeo disponível.</p>';
  }

  if (secao === 'servicos') {
    html = dados.servicos.length
      ? dados.servicos.map(s =>
          `<p><a href="${s.link}" target="_blank">${s.nome}</a></p>`
        ).join('')
      : '<p>Nenhum serviço disponível.</p>';
  }

  document.getElementById('conteudo').innerHTML = html;
}