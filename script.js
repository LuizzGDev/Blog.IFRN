// ── Dados iniciais ────────────────────────────────────
const CARD_COLORS = [
  { bg: '#0f1a2e', line: 'rgba(55,138,221,0.15)' },
  { bg: '#1a0f2e', line: 'rgba(127,119,221,0.15)' },
  { bg: '#0f2a1a', line: 'rgba(29,158,117,0.15)' },
  { bg: '#2e1a0f', line: 'rgba(216,90,48,0.15)'  },
  { bg: '#2a1a0f', line: 'rgba(186,117,23,0.15)' },
  { bg: '#1a2e0f', line: 'rgba(99,153,34,0.15)'  },
  { bg: '#2e0f1a', line: 'rgba(212,83,126,0.15)' },
  { bg: '#0f2e2a', line: 'rgba(93,202,165,0.15)' },
];

let posts = [
  { id: 1, titulo: 'Introdução ao JDBC', conteudo: 'Aprenda a conectar sua aplicação Java ao MySQL usando o driver JDBC e execute queries de forma simples e eficiente.', data: '2026-03-10', cor: 0 },
  { id: 2, titulo: 'CRUD em Web',        conteudo: 'Como implementar Create, Read, Update e Delete usando HTML, JavaScript e PHP no back-end com banco MySQL.',           data: '2026-03-12', cor: 1 },
  { id: 3, titulo: 'POO no IFRN',        conteudo: 'Conceitos essenciais de Programação Orientada a Objetos aplicados ao curso de Informática do IFRN-JC.',              data: '2026-03-14', cor: 2 },
];

let comentarios = [
  { id: 1, id_post: 1, texto: 'Ótimo tutorial, ajudou muito!', data: '2026-03-11' },
  { id: 2, id_post: 2, texto: 'Muito bem explicado.',          data: '2026-03-13' },
];

let nextPostId   = 4;
let nextComentId = 3;
let filtroAtivo  = 'todos';

// ── Navegação ─────────────────────────────────────────
function tab(name) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.toggle('active', sec.id === 'sec-' + name);
  });
  if (name === 'coment' || name === 'edit') preencherSelects();
  if (name === 'feed') { renderStats(); renderFeed(); }
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => tab(btn.dataset.tab));
});

// ── Toast ─────────────────────────────────────────────
function showToast(id, tipo, msg) {
  const el = document.getElementById(id);
  el.className = 'toast ' + tipo;
  el.textContent = msg;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ── Stats ─────────────────────────────────────────────
function renderStats() {
  const totalPosts    = posts.length;
  const totalComents  = comentarios.length;
  const ultimoPost    = posts[posts.length - 1];
  const comentUltimo  = ultimoPost
    ? comentarios.filter(c => c.id_post === ultimoPost.id).length
    : 0;

  document.getElementById('stats-strip').innerHTML = [
    [totalPosts,   'Posts publicados'],
    [totalComents, 'Comentários'],
    [comentUltimo, 'No último post'],
  ].map(([n, l]) => `
    <div class="stat-card">
      <div class="stat-n">${n}</div>
      <div class="stat-l">${l}</div>
    </div>
  `).join('');
}

// ── Feed ──────────────────────────────────────────────
function renderFeed() {
  const filtros = ['todos', 'março', 'recentes'];
  document.getElementById('filter-pills').innerHTML = filtros.map(f => `
    <button class="pill${filtroAtivo === f ? ' active' : ''}" data-filtro="${f}">${f}</button>
  `).join('');

  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      filtroAtivo = pill.dataset.filtro;
      renderFeed();
    });
  });

  let lista = posts.slice().sort((a, b) => b.data.localeCompare(a.data));
  if (filtroAtivo === 'março')   lista = lista.filter(p => p.data.includes('-03-'));
  if (filtroAtivo === 'recentes') lista = lista.slice(0, 2);

  const countEl = document.getElementById('post-count');
  countEl.textContent = lista.length + ' post' + (lista.length !== 1 ? 's' : '');

  const feedEl = document.getElementById('feed-list');
  if (!lista.length) {
    feedEl.innerHTML = '<div class="empty">Nenhum post encontrado.</div>';
    return;
  }

  feedEl.innerHTML = lista.map(p => {
    const cs      = comentarios.filter(c => c.id_post === p.id);
    const initials = p.titulo.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
    const scheme   = CARD_COLORS[p.cor % CARD_COLORS.length];

    const commentsHTML = cs.length
      ? `<div class="card-comments">
           <div class="card-comments-label">Comentários (${cs.length})</div>
           ${cs.map(c => `
             <div class="comment-item">
               <div class="comment-avatar"><div class="comment-av-dot"></div></div>
               <div class="comment-text">${escapeHTML(c.texto)}</div>
               <div class="comment-date">${c.data}</div>
             </div>
           `).join('')}
         </div>`
      : '';

    return `
      <div class="post-card">
        <div class="card-img" style="background:${scheme.bg}">
          <div class="card-img-grid" style="--grid-line:${scheme.line}"></div>
          <div class="card-img-circle">${initials}</div>
        </div>
        <div class="card-body">
          <span class="card-tag">Post #${p.id}</span>
          <div class="card-title">${escapeHTML(p.titulo)}</div>
          <div class="card-excerpt">${escapeHTML(p.conteudo)}</div>
          <div class="card-footer">
            <span class="card-date">${p.data}</span>
            <span class="card-coments-badge">
              <span class="badge-dot"></span>
              ${cs.length} coment${cs.length !== 1 ? 's' : ''}
            </span>
          </div>
          ${commentsHTML}
        </div>
      </div>
    `;
  }).join('');
}

// ── Novo post ─────────────────────────────────────────
document.getElementById('btn-publicar').addEventListener('click', () => {
  const titulo   = document.getElementById('n-titulo').value.trim();
  const conteudo = document.getElementById('n-conteudo').value.trim();
  const data     = document.getElementById('n-data').value;

  if (!titulo || !conteudo || !data) {
    showToast('t-novo', 'err', 'Preencha todos os campos.');
    return;
  }

  posts.push({ id: nextPostId++, titulo, conteudo, data, cor: nextPostId % CARD_COLORS.length });
  document.getElementById('n-titulo').value   = '';
  document.getElementById('n-conteudo').value = '';
  document.getElementById('n-data').value     = '';

  showToast('t-novo', 'ok', 'Post publicado com sucesso!');
  renderStats();
  renderFeed();
});

document.getElementById('btn-cancelar-novo').addEventListener('click', () => tab('feed'));

// ── Selects compartilhados ────────────────────────────
function preencherSelects() {
  const opts = posts.map(p =>
    `<option value="${p.id}">${p.id} — ${escapeHTML(p.titulo)}</option>`
  ).join('');

  const selComent = document.getElementById('c-post');
  const selEdit   = document.getElementById('e-sel');
  if (selComent) selComent.innerHTML = opts;
  if (selEdit)   { selEdit.innerHTML = opts; fillEdit(); }
}

// ── Comentários ───────────────────────────────────────
document.getElementById('btn-add-coment').addEventListener('click', () => {
  const id_post = parseInt(document.getElementById('c-post').value);
  const texto   = document.getElementById('c-texto').value.trim();
  const data    = document.getElementById('c-data').value;

  if (!texto || !data) {
    showToast('t-coment', 'err', 'Preencha texto e data.');
    return;
  }

  comentarios.push({ id: nextComentId++, id_post, texto, data });
  document.getElementById('c-texto').value = '';
  document.getElementById('c-data').value  = '';

  showToast('t-coment', 'ok', 'Comentário publicado!');
  renderFeed();
  renderStats();
});

// ── Editar ────────────────────────────────────────────
function fillEdit() {
  const id = parseInt(document.getElementById('e-sel').value);
  const p  = posts.find(x => x.id === id);
  if (!p) return;
  document.getElementById('e-titulo').value   = p.titulo;
  document.getElementById('e-conteudo').value = p.conteudo;
  document.getElementById('e-data').value     = p.data;
}

document.getElementById('e-sel').addEventListener('change', fillEdit);

document.getElementById('btn-salvar').addEventListener('click', () => {
  const id      = parseInt(document.getElementById('e-sel').value);
  const titulo  = document.getElementById('e-titulo').value.trim();
  const conteudo = document.getElementById('e-conteudo').value.trim();
  const data    = document.getElementById('e-data').value;

  if (!titulo || !conteudo || !data) {
    showToast('t-edit', 'err', 'Preencha todos os campos.');
    return;
  }

  const p = posts.find(x => x.id === id);
  if (p) { p.titulo = titulo; p.conteudo = conteudo; p.data = data; }

  showToast('t-edit', 'ok', 'Post atualizado!');
  preencherSelects();
  renderFeed();
  renderStats();
});

document.getElementById('btn-deletar').addEventListener('click', () => {
  const id = parseInt(document.getElementById('e-sel').value);
  posts      = posts.filter(p => p.id !== id);
  comentarios = comentarios.filter(c => c.id_post !== id);

  showToast('t-edit', 'ok', 'Post deletado.');
  preencherSelects();
  renderFeed();
  renderStats();
});

// ── Helpers ───────────────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────────────
renderStats();
renderFeed();
