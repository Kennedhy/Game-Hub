document.addEventListener('DOMContentLoaded', async () => {
  const sessao = await exigirSessao();
  if (!sessao) return;

  montarCabecalho(sessao.nomeUsuario);
  carregarRanking(sessao.nomeUsuario);

  document.querySelectorAll('.card-jogo[data-jogo]').forEach(card => {
    card.addEventListener('click', () => mostrarNotificacao('Em breve!', 'erro'));
  });
});

async function carregarRanking(nomeAtual) {
  const corpo = document.getElementById('corpo-ranking');
  if (!corpo) return;

  const { ok, data } = await Api.pontos.ranking();

  if (!ok || !data.length) {
    corpo.innerHTML = `<tr><td colspan="3"><div class="ranking-vazio">Nenhum jogador ainda.<br>Seja o primeiro!</div></td></tr>`;
    atualizarPosicao(null, null, nomeAtual);
    return;
  }

  corpo.innerHTML = data.map(j => {
    let celPos;
    if (j.posicao === 1)      celPos = `<div class="medalha ouro">${SVG_TROFEU}</div>`;
    else if (j.posicao === 2) celPos = `<div class="medalha prata">${SVG_TROFEU}</div>`;
    else if (j.posicao === 3) celPos = `<div class="medalha bronze">${SVG_TROFEU}</div>`;
    else                      celPos = `<span class="numero-rank">${j.posicao}</span>`;

    const souEu = j.nomeUsuario === nomeAtual;
    return `<tr>
      <td>${celPos}</td>
      <td><span class="nome-jogador ${souEu ? 'eu' : ''}">${j.nomeUsuario}</span></td>
      <td><span class="pontos-jogador">${j.pontos.toLocaleString('pt-BR')}</span></td>
    </tr>`;
  }).join('');

  const minha = data.find(j => j.nomeUsuario === nomeAtual);
  atualizarPosicao(minha ? minha.posicao : null, minha ? minha.pontos : 0, nomeAtual);
  atualizarTotal(data.length, minha ? minha.posicao : null);
}

function atualizarPosicao(pos, pontos, nome) {
  const elRank   = document.getElementById('meu-rank');
  const elNome   = document.getElementById('meu-nome');
  const elPontos = document.getElementById('meus-pontos');
  if (elRank)   elRank.textContent   = pos ? `#${pos}` : '--';
  if (elNome)   elNome.textContent   = nome;
  if (elPontos) elPontos.textContent = `${(pontos || 0).toLocaleString('pt-BR')} PONTOS`;
}

function atualizarTotal(total, pos) {
  const el  = document.getElementById('meta-posicao');
  const txt = document.getElementById('texto-meta');
  if (!el || !txt || !pos) return;
  txt.textContent = `${pos}° DE ${total} JOGADORES`;
  el.style.display = 'flex';
}

const SVG_TROFEU = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11"/>
</svg>`;
