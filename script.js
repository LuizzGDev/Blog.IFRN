let postEditandoId = null;
let postAbertoId   = null;


function lerPosts() {
    const dados = localStorage.getItem('posts');
    return dados ? JSON.parse(dados) : [];
}
function salvarPosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}


function mostrarTela(id) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
    window.scrollTo(0, 0);
}
function irParaLista() {
    postEditandoId = null;
    mostrarTela('tela-lista');
    exibirPosts();
}
function irParaFormulario() {
    document.getElementById('form-titulo-header').textContent = 'Novo post';
    document.getElementById('titulo').value    = '';
    document.getElementById('descricao').value = '';
    document.getElementById('conteudo').value  = '';
    document.getElementById('autor').value     = '';
    mostrarTela('tela-formulario');
}


function salvarPost() {
    const titulo    = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const autor     = document.getElementById('autor').value.trim();
    const conteudo  = document.getElementById('conteudo').value.trim();

    if (!titulo || !descricao || !autor || !conteudo) {
        mostrarToast('Preencha todos os campos.');
        return;
    }

    const posts = lerPosts();

    if (postEditandoId) {
        const idx = posts.findIndex(p => p.id === postEditandoId);
        posts[idx] = { ...posts[idx], titulo, descricao, autor, conteudo };
        postEditandoId = null;
        mostrarToast('Post atualizado!');
    } else {
        posts.unshift({
            id: Date.now(),
            titulo, descricao, autor, conteudo,
            data: Date.now(),
            comentarios: []
        });
        mostrarToast('Post publicado!');
    }

    salvarPosts(posts);
    irParaLista();
}


function exibirPosts() {
    const posts = lerPosts();
    const container = document.getElementById('lista-posts');

    if (posts.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum post ainda. Crie o primeiro!</div>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <h3 class="card-title">${post.titulo}</h3>
            <p class="card-excerpt">${post.descricao}</p>
            <div class="card-meta">
                <span>${post.autor}</span>
                <span>${formatarData(post.data)}</span>
            </div>
            <div class="card-actions">
                <button class="action-btn ver" onclick="abrirPost(${post.id})">Ver</button>
                <button class="action-btn" onclick="editarPost(${post.id})">Editar</button>
                <button class="action-btn del" onclick="deletarPost(${post.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}


function deletarPost(id) {
    if (!confirm('Excluir este post?')) return;
    const posts = lerPosts().filter(p => p.id !== id);
    salvarPosts(posts);
    exibirPosts();
    mostrarToast('Post excluído.');
}

function editarPost(id) {
    const post = lerPosts().find(p => p.id === id);
    document.getElementById('titulo').value    = post.titulo;
    document.getElementById('descricao').value = post.descricao;
    document.getElementById('conteudo').value  = post.conteudo;
    document.getElementById('autor').value     = post.autor;
    document.getElementById('form-titulo-header').textContent = 'Editar post';
    postEditandoId = id;
    mostrarTela('tela-formulario');
}

function abrirPost(id) {
    postAbertoId = id;
    const post = lerPosts().find(p => p.id === id);
    const iniciais = post.autor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    document.getElementById('detalhe-conteudo').innerHTML = `
        <h1 class="post-title">${post.titulo}</h1>
        <div class="post-meta-row">
            <div class="author-avatar">${iniciais}</div>
            <div class="post-meta-text"><strong>${post.autor}</strong> · ${formatarData(post.data)}</div>
        </div>
        <p class="post-desc">${post.descricao}</p>
        <div class="post-body"><p>${post.conteudo}</p></div>
    `;

    renderizarComentarios(post.comentarios);
    mostrarTela('tela-detalhe');
}

function adicionarComentario() {
    const nome     = document.getElementById('comentario-nome').value.trim();
    const conteudo = document.getElementById('comentario-texto').value.trim();

    if (!nome || !conteudo) {
        mostrarToast('Preencha nome e comentário!');
        return;
    }

    const posts = lerPosts();
    const post  = posts.find(p => p.id === postAbertoId);
    post.comentarios.push({ id: Date.now(), nome, conteudo, data: Date.now() });
    salvarPosts(posts);

    document.getElementById('comentario-nome').value  = '';
    document.getElementById('comentario-texto').value = '';
    renderizarComentarios(post.comentarios);
    mostrarToast('Comentário publicado!');
}

function renderizarComentarios(comentarios) {
    const container = document.getElementById('lista-comentarios');
    const titulo    = document.getElementById('comments-titulo');
    titulo.textContent = comentarios.length > 0
        ? `${comentarios.length} Comentário${comentarios.length > 1 ? 's' : ''}`
        : 'Comentários';

    if (comentarios.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum comentário ainda. Seja o primeiro!</div>';
        return;
    }

    container.innerHTML = comentarios.map(c => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${c.nome}</span>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="comment-date">${formatarData(c.data)}</span>
                    <button class="comment-del" onclick="deletarComentario(${c.id})">excluir</button>
                </div>
            </div>
            <p class="comment-text">${c.conteudo}</p>
        </div>
    `).join('');
}

function deletarComentario(id) {
    const posts = lerPosts();
    const post  = posts.find(p => p.id === postAbertoId);
    post.comentarios = post.comentarios.filter(c => c.id !== id);
    salvarPosts(posts);
    renderizarComentarios(post.comentarios);
}


function formatarData(timestamp) {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

function mostrarToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

exibirPosts();
