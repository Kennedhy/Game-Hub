const CHAVES = {
  usuarios: 'trivia_usuarios',
  sessao:   'trivia_sessao',
};

const Auth = {
  obterUsuarios() {
    return JSON.parse(localStorage.getItem(CHAVES.usuarios) || '[]');
  },

  salvarUsuarios(usuarios) {
    localStorage.setItem(CHAVES.usuarios, JSON.stringify(usuarios));
  },

  obterSessao() {
    return JSON.parse(localStorage.getItem(CHAVES.sessao) || 'null');
  },

  definirSessao(usuario) {
    localStorage.setItem(CHAVES.sessao, JSON.stringify(usuario));
  },

  limparSessao() {
    localStorage.removeItem(CHAVES.sessao);
  },

  cadastrar(nomeUsuario, senha) {
    nomeUsuario = nomeUsuario.trim().toUpperCase();
    if (!nomeUsuario || !senha)             return { ok: false, erro: 'Preencha todos os campos.' };
    if (nomeUsuario.length < 3)             return { ok: false, erro: 'Nome precisa ter ao menos 3 caracteres.' };
    if (nomeUsuario.length > 16)            return { ok: false, erro: 'Nome pode ter no máximo 16 caracteres.' };
    if (!/^[A-Z0-9_]+$/.test(nomeUsuario)) return { ok: false, erro: 'Use apenas letras, números e _.' };
    if (senha.length < 4)                   return { ok: false, erro: 'Senha precisa ter ao menos 4 caracteres.' };

    const usuarios = this.obterUsuarios();
    if (usuarios.find(u => u.nomeUsuario === nomeUsuario)) return { ok: false, erro: 'Usuário já existe.' };

    const novoUsuario = {
      nomeUsuario,
      senha,
      pontos:        0,
      partidasJogadas: 0,
      criadoEm:      Date.now(),
    };

    usuarios.push(novoUsuario);
    this.salvarUsuarios(usuarios);
    this.definirSessao(novoUsuario);
    return { ok: true };
  },

  entrar(nomeUsuario, senha) {
    nomeUsuario = nomeUsuario.trim().toUpperCase();
    if (!nomeUsuario || !senha) return { ok: false, erro: 'Preencha todos os campos.' };

    const usuarios = this.obterUsuarios();
    const usuario  = usuarios.find(u => u.nomeUsuario === nomeUsuario);
    if (!usuario)              return { ok: false, erro: 'Usuário não encontrado.' };
    if (usuario.senha !== senha) return { ok: false, erro: 'Senha incorreta.' };

    this.definirSessao(usuario);
    return { ok: true };
  },

  sair() {
    this.limparSessao();
    window.location.href = 'login.html';
  },

  exigirAutenticacao() {
    if (!this.obterSessao()) {
      window.location.replace('login.html');
      return null;
    }
    return this.obterSessao();
  },

  atualizarSessao() {
    const sessao = this.obterSessao();
    if (!sessao) return null;
    const usuarios = this.obterUsuarios();
    const atualizado = usuarios.find(u => u.nomeUsuario === sessao.nomeUsuario);
    if (atualizado) this.definirSessao(atualizado);
    return atualizado || sessao;
  },

  adicionarPontos(pontos, partidasJogadas = 1) {
    const sessao = this.obterSessao();
    if (!sessao) return;
    const usuarios = this.obterUsuarios();
    const idx = usuarios.findIndex(u => u.nomeUsuario === sessao.nomeUsuario);
    if (idx === -1) return;
    usuarios[idx].pontos          += pontos;
    usuarios[idx].partidasJogadas += partidasJogadas;
    this.salvarUsuarios(usuarios);
    this.definirSessao(usuarios[idx]);
  },
};

const Ranking = {
  obterTodos() {
    const usuarios = Auth.obterUsuarios();
    return [...usuarios].sort((a, b) => b.pontos - a.pontos);
  },

  posicaoDe(nomeUsuario) {
    const ordenados = this.obterTodos();
    const idx = ordenados.findIndex(u => u.nomeUsuario === nomeUsuario);
    return idx === -1 ? null : idx + 1;
  },

  renderizar(nomeUsuarioAtual) {
    const corpo = document.getElementById('corpo-ranking');
    if (!corpo) return;

    const jogadores = this.obterTodos().slice(0, 20);

    if (jogadores.length === 0) {
      corpo.innerHTML = `<tr><td colspan="3"><div class="ranking-vazio">Nenhum jogador ainda.<br>Seja o primeiro!</div></td></tr>`;
      return;
    }

    corpo.innerHTML = jogadores.map((j, i) => {
      const pos = i + 1;

      let celulaPos;
      if (pos === 1)      celulaPos = `<div class="medalha ouro">${Icones.trofeu}</div>`;
      else if (pos === 2) celulaPos = `<div class="medalha prata">${Icones.trofeu}</div>`;
      else if (pos === 3) celulaPos = `<div class="medalha bronze">${Icones.trofeu}</div>`;
      else                celulaPos = `<span class="numero-rank">${pos}</span>`;

      const souEu = j.nomeUsuario === nomeUsuarioAtual;

      return `<tr>
        <td>${celulaPos}</td>
        <td><span class="nome-jogador ${souEu ? 'eu' : ''}">${j.nomeUsuario}</span></td>
        <td><span class="pontos-jogador">${j.pontos.toLocaleString('pt-BR')}</span></td>
      </tr>`;
    }).join('');
  },

  renderizarMinhaPosicao(nomeUsuarioAtual) {
    const elRank   = document.getElementById('meu-rank');
    const elNome   = document.getElementById('meu-nome');
    const elPontos = document.getElementById('meus-pontos');
    if (!elRank) return;

    const pos     = this.posicaoDe(nomeUsuarioAtual);
    const usuario = Auth.obterUsuarios().find(u => u.nomeUsuario === nomeUsuarioAtual);

    elRank.textContent = pos ? `#${pos}` : '--';
    if (elNome)   elNome.textContent   = nomeUsuarioAtual;
    if (elPontos && usuario) elPontos.textContent = `${usuario.pontos.toLocaleString('pt-BR')} PONTOS`;
  },
};

let _timerNotificacao;

function mostrarNotificacao(mensagem, tipo = 'sucesso') {
  let el = document.getElementById('notificacao');
  if (!el) {
    el = document.createElement('div');
    el.id = 'notificacao';
    el.className = 'notificacao';
    document.body.appendChild(el);
  }
  clearTimeout(_timerNotificacao);
  el.textContent = mensagem;
  el.className   = `notificacao ${tipo}`;
  requestAnimationFrame(() => el.classList.add('visivel'));
  _timerNotificacao = setTimeout(() => el.classList.remove('visivel'), 3200);
}

function sacudir(el) {
  const passos = ['-6px', '6px', '-4px', '4px', '0'];
  let i = 0;
  el.style.transition = 'transform .07s';
  const executar = () => {
    if (i >= passos.length) { el.style.transition = ''; return; }
    el.style.transform = `translateX(${passos[i++]})`;
    setTimeout(executar, 70);
  };
  executar();
}

function popularDadosFicticios() {
  const usuarios = Auth.obterUsuarios();
  if (usuarios.length > 0) return;

  const ficticios = [
    { nomeUsuario: 'CYBER_NINJA',  senha: '__npc__', pontos: 125800, partidasJogadas: 42, criadoEm: Date.now() },
    { nomeUsuario: 'RETRO_MASTER', senha: '__npc__', pontos: 98500,  partidasJogadas: 31, criadoEm: Date.now() },
    { nomeUsuario: 'PIXEL_QUEEN',  senha: '__npc__', pontos: 87200,  partidasJogadas: 28, criadoEm: Date.now() },
    { nomeUsuario: 'NEON_BLADE',   senha: '__npc__', pontos: 76400,  partidasJogadas: 25, criadoEm: Date.now() },
    { nomeUsuario: 'ARCADE_KING',  senha: '__npc__', pontos: 71200,  partidasJogadas: 22, criadoEm: Date.now() },
  ];

  Auth.salvarUsuarios(ficticios);
}

const Icones = {
  trofeu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="8" r="6"/>
    <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11"/>
  </svg>`,
  usuario: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>`,
  sair: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>`,
};
