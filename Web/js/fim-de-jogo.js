document.addEventListener('DOMContentLoaded', () => {
  const usuarioAtual = Auth.exigirAutenticacao();
  if (!usuarioAtual) return;

  const params        = new URLSearchParams(window.location.search);
  const pontosPartida = parseInt(params.get('pontos')    || '0', 10);
  const acertos       = parseInt(params.get('acertos')   || '0', 10);
  const erros         = parseInt(params.get('erros')     || '0', 10);
  const tempo         = parseInt(params.get('tempo')     || '0', 10);
  const nomeJogo      = params.get('jogo')               || '';
  const slugJogo      = params.get('slug')               || 'jogo.html';

  Auth.adicionarPontos(pontosPartida);
  Auth.atualizarSessao();

  const sessao = Auth.obterSessao();

  document.getElementById('nome-cabecalho').textContent = sessao.nomeUsuario;
  document.getElementById('btn-sair').addEventListener('click', () => Auth.sair());

  const elPontosPartida  = document.getElementById('pontos-partida');
  const elPontosTotal    = document.getElementById('pontos-total');
  const elAcertos        = document.getElementById('stat-acertos');
  const elErros          = document.getElementById('stat-erros');
  const elTempo          = document.getElementById('stat-tempo');
  const elTituloJogo     = document.getElementById('titulo-jogo-fim');
  const elPosicaoNum     = document.getElementById('posicao-num');
  const elTotalJogadores = document.getElementById('total-jogadores');
  const elBtnJogarNov    = document.getElementById('btn-jogar-novamente');

  if (elTituloJogo) elTituloJogo.textContent = nomeJogo || 'JOGO';

  animarContador(elPontosPartida, pontosPartida, 1200);
  animarContador(elPontosTotal,   sessao.pontos, 1600, true);

  if (elAcertos) elAcertos.textContent = acertos;
  if (elErros)   elErros.textContent   = erros;
  if (elTempo)   elTempo.textContent   = formatarTempo(tempo);

  const pos   = Ranking.posicaoDe(sessao.nomeUsuario);
  const total = Auth.obterUsuarios().length;

  if (elPosicaoNum)     elPosicaoNum.textContent     = pos ? `#${pos}` : '--';
  if (elTotalJogadores) elTotalJogadores.textContent = `DE ${total} JOGADORES`;

  if (elBtnJogarNov) {
    elBtnJogarNov.href = slugJogo ? `jogo.html?jogo=${slugJogo}` : 'index.html';
  }

  const elBtnInicio  = document.getElementById('btn-ir-inicio');
  const elBtnRanking = document.getElementById('btn-ver-ranking');

  if (elBtnInicio)  elBtnInicio.href  = 'index.html';
  if (elBtnRanking) elBtnRanking.href = 'index.html#ranking';
});

function animarContador(el, valorFinal, duracao, separador = false) {
  if (!el) return;
  const inicio  = performance.now();
  const step = (agora) => {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const easing    = 1 - Math.pow(1 - progresso, 3);
    const atual     = Math.round(easing * valorFinal);
    el.textContent  = separador ? atual.toLocaleString('pt-BR') : atual;
    if (progresso < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function formatarTempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
