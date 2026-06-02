const paramsApi = new URLSearchParams(window.location.search).get('api');
if (paramsApi) localStorage.setItem('GAME_HUB_API_BASE', paramsApi);

const API_BASE = (
  window.GAME_HUB_API_BASE ||
  localStorage.getItem('GAME_HUB_API_BASE') ||
  '/api'
).replace(/\/$/, '');

const Api = {
  async _fetch(path, opts = {}) {
    const res = await fetch(API_BASE + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  auth: {
    async cadastrar(nomeUsuario, senha) {
      return Api._fetch('/auth/cadastrar', {
        method: 'POST',
        body: JSON.stringify({ nomeUsuario, senha }),
      });
    },
    async entrar(nomeUsuario, senha) {
      return Api._fetch('/auth/entrar', {
        method: 'POST',
        body: JSON.stringify({ nomeUsuario, senha }),
      });
    },
    async sair() {
      return Api._fetch('/auth/sair', { method: 'POST' });
    },
    async sessao() {
      return Api._fetch('/auth/sessao');
    },
  },

  pontos: {
    async salvar(pontos) {
      return Api._fetch('/pontos/salvar', {
        method: 'POST',
        body: JSON.stringify({ pontos }),
      });
    },
    async ranking() {
      return Api._fetch('/pontos/ranking');
    },
  },
};
