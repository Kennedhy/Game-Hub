const TAMANHO = 3;
const TOTAL_PECAS = TAMANHO * TAMANHO;
const PECA_VAZIA = TOTAL_PECAS - 1;

const PONTOS_INICIAIS = 1000;
const PENALIDADE_MOVIMENTO = 6;
const PENALIDADE_SEGUNDO = 2;
const PONTUACAO_MINIMA = 100;

const SVG_PUZZLE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0714"/>
      <stop offset="45%" stop-color="#17112d"/>
      <stop offset="100%" stop-color="#00e5ff"/>
    </linearGradient>

    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="900" height="900" fill="url(#g)"/>

  <path d="M0 120H900M0 240H900M0 360H900M0 480H900M0 600H900M0 720H900M120 0V900M240 0V900M360 0V900M480 0V900M600 0V900M720 0V900"
        stroke="#b44dff" stroke-width="4" opacity=".22"/>

  <rect x="170" y="295" width="560" height="310" rx="55"
        fill="#110d1f" stroke="#00e5ff" stroke-width="22" filter="url(#glow)"/>

  <circle cx="315" cy="450" r="45" fill="#f0176f"/>
  <circle cx="585" cy="450" r="45" fill="#ffe500"/>

  <rect x="390" y="420" width="120" height="35" rx="17" fill="#39ff14"/>

  <rect x="265" y="395" width="35" height="110" rx="12" fill="#ede8ff"/>
  <rect x="228" y="432" width="110" height="35" rx="12" fill="#ede8ff"/>

  <text x="450" y="735"
        text-anchor="middle"
        font-family="monospace"
        font-size="86"
        font-weight="700"
        fill="#ffffff"
        stroke="#f0176f"
        stroke-width="4">
    GAME HUB
  </text>
</svg>`;

const IMAGEM_PUZZLE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(SVG_PUZZLE)}`;

let tabuleiro = [];
let movimentos = 0;
let tempoInicio = null;
let intervaloTempo = null;
let jogoFinalizado = false;
let sessaoAtual = null;

document.addEventListener('DOMContentLoaded', async () => {
    sessaoAtual = await exigirSessao();
    if (!sessaoAtual) return;

    const btnComecar = document.getElementById('btn-comecar-puzzle');
    const btnReiniciar = document.getElementById('btn-reiniciar-puzzle');

    if (btnComecar) {
        btnComecar.addEventListener('click', iniciarJogo);
    }

    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', iniciarJogo);
    }

    const preview = document.getElementById('preview-puzzle');
    if (preview) {
        preview.style.backgroundImage = `url("${IMAGEM_PUZZLE}")`;
    }
});

function iniciarJogo() {
    document.getElementById('puzzle-tela-inicio').style.display = 'none';
    document.getElementById('puzzle-tela-jogo').style.display = 'block';

    movimentos = 0;
    tempoInicio = Date.now();
    jogoFinalizado = false;

    tabuleiro = criarTabuleiroEmbaralhado();

    atualizarStats();
    renderizarTabuleiro();

    clearInterval(intervaloTempo);
    intervaloTempo = setInterval(atualizarStats, 1000);
}

function criarTabuleiroEmbaralhado() {
    let novoTabuleiro = [];

    do {
        novoTabuleiro = Array.from({ length: TOTAL_PECAS }, (_, i) => i);

        let posicaoVazia = PECA_VAZIA;

        for (let i = 0; i < 180; i++) {
            const vizinhos = buscarVizinhos(posicaoVazia);
            const escolhido = vizinhos[Math.floor(Math.random() * vizinhos.length)];

            [novoTabuleiro[posicaoVazia], novoTabuleiro[escolhido]] =
                [novoTabuleiro[escolhido], novoTabuleiro[posicaoVazia]];

            posicaoVazia = escolhido;
        }

    } while (estaResolvido(novoTabuleiro));

    return novoTabuleiro;
}

function buscarVizinhos(indice) {
    const linha = Math.floor(indice / TAMANHO);
    const coluna = indice % TAMANHO;

    const vizinhos = [];

    if (linha > 0) {
        vizinhos.push(indice - TAMANHO);
    }

    if (linha < TAMANHO - 1) {
        vizinhos.push(indice + TAMANHO);
    }

    if (coluna > 0) {
        vizinhos.push(indice - 1);
    }

    if (coluna < TAMANHO - 1) {
        vizinhos.push(indice + 1);
    }

    return vizinhos;
}

function renderizarTabuleiro() {
    const board = document.getElementById('puzzle-board');
    board.innerHTML = '';

    tabuleiro.forEach((peca, indice) => {
        const botao = document.createElement('button');
        botao.className = 'puzzle-tile';

        if (peca === PECA_VAZIA) {
            botao.classList.add('vazio');
            botao.setAttribute('aria-label', 'Espaço vazio');
        } else {
            botao.textContent = peca + 1;

            botao.style.backgroundImage = `url("${IMAGEM_PUZZLE}")`;
            botao.style.backgroundSize = `${TAMANHO * 100}% ${TAMANHO * 100}%`;

            const linhaOriginal = Math.floor(peca / TAMANHO);
            const colunaOriginal = peca % TAMANHO;

            botao.style.backgroundPosition =
                `${(colunaOriginal / (TAMANHO - 1)) * 100}% ${(linhaOriginal / (TAMANHO - 1)) * 100}%`;

            botao.addEventListener('click', () => moverPeca(indice));
        }

        board.appendChild(botao);
    });
}

function moverPeca(indice) {
    if (jogoFinalizado) return;

    const indiceVazio = tabuleiro.indexOf(PECA_VAZIA);
    const podeMover = buscarVizinhos(indiceVazio).includes(indice);

    if (!podeMover) {
        mostrarNotificacao('ESSA PEÇA NÃO PODE MOVER!', 'erro');
        return;
    }

    [tabuleiro[indice], tabuleiro[indiceVazio]] =
        [tabuleiro[indiceVazio], tabuleiro[indice]];

    movimentos++;

    renderizarTabuleiro();
    atualizarStats();

    if (estaResolvido(tabuleiro)) {
        finalizarJogo();
    }
}

function estaResolvido(lista) {
    return lista.every((peca, indice) => peca === indice);
}

function atualizarStats() {
    const tempo = calcularTempo();
    const pontos = calcularPontos();

    const elMovimentos = document.getElementById('puzzle-movimentos');
    const elTempo = document.getElementById('puzzle-tempo');
    const elPontos = document.getElementById('puzzle-pontos');

    if (elMovimentos) {
        elMovimentos.textContent = movimentos;
    }

    if (elTempo) {
        elTempo.textContent = formatarTempo(tempo);
    }

    if (elPontos) {
        elPontos.textContent = pontos;
    }
}

function calcularTempo() {
    if (!tempoInicio) return 0;

    return Math.floor((Date.now() - tempoInicio) / 1000);
}

function calcularPontos() {
    const tempo = calcularTempo();

    const pontos =
        PONTOS_INICIAIS -
        (movimentos * PENALIDADE_MOVIMENTO) -
        (tempo * PENALIDADE_SEGUNDO);

    return Math.max(PONTUACAO_MINIMA, pontos);
}

function formatarTempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;

    if (min > 0) {
        return `${min}m ${seg}s`;
    }

    return `${seg}s`;
}

function finalizarJogo() {
    jogoFinalizado = true;
    clearInterval(intervaloTempo);

    const tempoFinal = calcularTempo();
    const pontosFinais = calcularPontos();

    mostrarNotificacao('PUZZLE COMPLETO!', 'sucesso');

    setTimeout(() => {
        const params = new URLSearchParams({
            jogo: 'PIXEL PUZZLE',
            slug: 'puzzle',
            pontos: pontosFinais,
            acertos: 1,
            erros: movimentos,
            tempo: tempoFinal
        });

        window.location.href = `fim-de-jogo.html?${params.toString()}`;
    }, 900);
}