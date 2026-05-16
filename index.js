document.addEventListener('DOMContentLoaded', () => {
  const usuarioAtual = Auth.exigirAutenticacao();
  if (!usuarioAtual) return;

  Auth.atualizarSessao();
  const sessao = Auth.obterSessao();

  document.getElementById('nome-cabecalho').textContent = sessao.nomeUsuario;
  document.getElementById('btn-sair').addEventListener('click', () => Auth.sair());

  Ranking.renderizar(sessao.nomeUsuario);
  Ranking.renderizarMinhaPosicao(sessao.nomeUsuario);

  const elMeta  = document.getElementById('meta-posicao');
  const elTexto = document.getElementById('texto-meta');
  const pos     = Ranking.posicaoDe(sessao.nomeUsuario);

  if (pos && elMeta && elTexto) {
    const total = Auth.obterUsuarios().length;
    elTexto.textContent = `${pos}° DE ${total} JOGADORES`;
    elMeta.style.display = 'flex';
  }

  document.querySelectorAll('.card-jogo').forEach(card => {
    card.addEventListener('click', () => {
      const jogo = card.dataset.jogo;
      if (jogo) window.location.href = `jogo.html?jogo=${jogo}`;
    });
  });
});
