document.addEventListener('DOMContentLoaded', async () => {
  const sessao = await exigirSessao();
  if (!sessao) return;

  montarCabecalho(sessao.nomeUsuario);

  const params        = new URLSearchParams(window.location.search);
  const pontosPartida = parseInt(params.get('pontos')  || '0', 10);
  const acertos       = parseInt(params.get('acertos') || '0', 10);
  const erros         = parseInt(params.get('erros')   || '0', 10);
  const tempo         = parseInt(params.get('tempo')   || '0', 10);
  const nomeJogo      = params.get('jogo') || '';
  const slugJogo      = params.get('slug') || '';

  const { data: salvo } = await Api.pontos.salvar(pontosPartida);
  const pontosTotais = salvo?.pontosTotais ?? sessao.pontos + pontosPartida;

  const { data: ranking } = await Api.pontos.ranking();
  const minha = Array.isArray(ranking) ? ranking.find(j => j.nomeUsuario === sessao.nomeUsuario) : null;
  const pos   = minha ? minha.posicao : null;
  const total = Array.isArray(ranking) ? ranking.length : 0;

  const elTitulo   = document.getElementById('titulo-jogo-fim');
  const elPtsPart  = document.getElementById('pontos-partida');
  const elPtsTotal = document.getElementById('pontos-total');
  const elAcertos  = document.getElementById('stat-acertos');
  const elErros    = document.getElementById('stat-erros');
  const elTempo    = document.getElementById('stat-tempo');
  const elPosNum   = document.getElementById('posicao-num');
  const elTotalJ   = document.getElementById('total-jogadores');
  const elBtnNov   = document.getElementById('btn-jogar-novamente');

  if (elTitulo)   elTitulo.textContent = nomeJogo || 'JOGO';
  if (elAcertos)  elAcertos.textContent = acertos;
  if (elErros)    elErros.textContent   = erros;
  if (elTempo)    elTempo.textContent   = fmtTempo(tempo);
  if (elPosNum)   elPosNum.textContent  = pos ? `#${pos}` : '--';
  if (elTotalJ)   elTotalJ.textContent  = `DE ${total} JOGADORES`;
  if (elBtnNov)   elBtnNov.href = slugJogo ? `aracaju.html` : 'index.html';

  animarContador(elPtsPart,  pontosPartida, 1200);
  animarContador(elPtsTotal, pontosTotais,  1600, true);
});

function fmtTempo(s) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
