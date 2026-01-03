const ID = "1GBMHIKSYAZPvKumlmbFPvIvDxKhTtBWhyT2e3JP0MPE";

async function carregar() {
  const base = `https://opensheet.elk.sh/${ID}`;

  const artigos = await fetch(`${base}/artigos`).then(r => r.json());
  const audios = await fetch(`${base}/audios`).then(r => r.json());
  const videos = await fetch(`${base}/videos`).then(r => r.json());
  const servicos = await fetch(`${base}/servicos`).then(r => r.json());

  window.dados = { artigos, audios, videos, servicos };
  mostrar('artigos');
}

function mostrar(secao) {
  let html = '';

  if (secao === 'artigos') {
    html = dados.artigos.map(a =>
      `<article><h2>${a.titulo}</h2><p>${a.texto}</p></article>`
    ).join('');
  }

  if (secao === 'audios') {
    html = dados.audios.map(a =>
      `<article><h3>${a.titulo}</h3>${a.embed}</article>`
    ).join('');
  }

  if (secao === 'videos') {
    html = dados.videos.map(v =>
      `<article><h3>${v.titulo}</h3>${v.embed}</article>`
    ).join('');
  }

  if (secao === 'servicos') {
    html = dados.servicos.map(s =>
      `<p><a href="${s.link}" target="_blank">${s.nome}</a></p>`
    ).join('');
  }

  document.getElementById('conteudo').innerHTML = html;
}

carregar();
