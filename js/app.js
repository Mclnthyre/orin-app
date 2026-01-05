:root {
  --primary: #90190d;
  --bg: #f5f5f5;
  --card: #ffffff;
  --text: #1c1c1c;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121212;
    --card: #1e1e1e;
    --text: #ffffff;
  }
}

#progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: #90190d;
  z-index: 2000;
}

.top-bar .share {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #90190d;
}

.top-bar .share:active {
  background: rgba(144, 25, 13, 0.12);
}

.material-icons-outlined {
  font-size: 22px;
}


body {
  margin: 0;
  font-family: system-ui, -apple-system, Roboto, Arial;
  background: var(--bg);
  color: var(--text);
}

header {
  background: var(--primary);
  color: white;
  padding: 16px;
  font-size: 20px;
  text-align: center;
}

.menu {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 64px;
  background: var(--card);
  display: flex;
  border-top: 1px solid rgba(0,0,0,.1);
}

.menu button {
  flex: 1;
  border: none;
  background: none;
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.menu button.active {
  color: var(--primary);
}

main {
  padding: 16px;
  padding-bottom: 80px;
}

.card {
  background: var(--card);
  border-radius: 20px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
}

.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card-body {
  padding: 14px;
}

.card h2 {
  margin: 0;
  font-size: 18px;
}

.card p {
  opacity: .8;
}

.leitura {
  background: var(--bg);
  color: var(--text);
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #90190d;
  color: #fff;
}

.top-bar .back {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  margin-right: 12px;
}

.artigo-container {
  padding: 16px;
}

.artigo-img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 16px;
}

.artigo-texto {
  font-size: 1rem;
  line-height: 1.7;
}
/* ===== CONTÊINER DE LEITURA ===== */
.leitura .artigo-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 18px 80px;
}

/* ===== IMAGEM DO ARTIGO ===== */
.artigo-img {
  width: 100%;
  border-radius: 14px;
  margin-bottom: 20px;
  object-fit: cover;
}

/* ===== TÍTULO ===== */
.artigo-container h1 {
  font-size: 1.8rem;
  line-height: 1.3;
  margin-bottom: 16px;
  color: var(--text-primary, #111);
  font-weight: 600;
}

/* ===== TEXTO ===== */
.artigo-texto {
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--text-secondary, #333);
}

/* Parágrafos */
.artigo-texto br + br {
  content: "";
  display: block;
  margin-bottom: 1.1em;
}

/* ===== DESTAQUES ===== */
.artigo-texto strong {
  color: var(--text-primary, #111);
  font-weight: 600;
}

.artigo-texto em {
  font-style: italic;
}

/* ===== LISTAS ===== */
.artigo-texto ul,
.artigo-texto ol {
  padding-left: 20px;
  margin: 18px 0;
}

.artigo-texto li {
  margin-bottom: 10px;
}

/* ===== CITAÇÕES (opcional no texto) ===== */
.artigo-texto blockquote {
  border-left: 4px solid #90190d;
  padding-left: 16px;
  margin: 24px 0;
  font-style: italic;
  color: #555;
}

/* ===== LINK ===== */
.artigo-texto a {
  color: #90190d;
  text-decoration: underline;
}

/* ===== MODO ESCURO ===== */
@media (prefers-color-scheme: dark) {
  .artigo-container h1 {
    color: #f1f1f1;
  }

  .artigo-texto {
    color: #ccc;
  }

  .artigo-texto blockquote {
    color: #aaa;
  }
}


.install-btn {
  position: fixed;
  bottom: 72px; /* acima da bottom nav */
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: #90190d;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  box-shadow: 0 6px 16px rgba(0,0,0,.25);
  display: none;
  z-index: 1000;
}

.skeleton-img,
.skeleton-title,
.skeleton-text {
  background: linear-gradient(
    90deg,
    #eee 25%,
    #f5f5f5 37%,
    #eee 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-img {
  width: 100%;
  height: 200px;
}

.skeleton-title {
  width: 70%;
  height: 28px;
}

.skeleton-text {
  width: 100%;
  height: 160px;
}

@keyframes shimmer {
  0% { background-position: 100% 0 }
  100% { background-position: -100% 0 }
}

#progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: #90190d;
  z-index: 2000;
}

.top-bar .share {
  margin-left: auto;
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
}


