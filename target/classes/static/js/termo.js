const DICIONARIO_REAL = [
    "TERMO", "NUVEM", "VALOR", "PORTA", "FESTA", "PRATO", "CLONE", "LEITE", "PIANO", "AMIGO",
    "CARRO", "TEMPO", "CORPO", "MENTE", "SABOR", "SAUDE", "LUGAR", "MUNDO", "PODER", "JOVEM",
    "CAMPO", "PEDRA", "FORTE", "VIVER", "PRECO", "SINAL", "LINHA", "PONTO", "VISTA", "LETRA",
    "GRUPO", "GRAVE", "CORRE", "NOITE", "MANHA", "FORMA", "SANTO", "FALSO", "CERTO", "JUSTO",
    "PONTE", "LONGE", "FONTE", "NERVO", "CAIXA", "TRENO", "ROUPA", "CHAVE", "LIVRO", "FRUTA"
];

let palavraSecreta = "";
const TENTATIVAS = 6;
const TAMANHO_PALAVRA = 5;

let linhaAtual = 0;
let colunaAtual = 0;
let jogoFinalizado = false;
let matrizSessao = [];
let estaValidando = false;

document.addEventListener("DOMContentLoaded", () => {
    const btnComecar = document.getElementById("btn-comecar");
    if (btnComecar) {
        btnComecar.addEventListener("click", () => {
            document.getElementById("termo-tela-inicio").style.display = "none";
            document.getElementById("termo-tela-jogo").style.display = "flex";
            prepararPartida();
        });
    }
    inicializarListeners();
});

function prepararPartida() {
    palavraSecreta = DICIONARIO_REAL[Math.floor(Math.random() * DICIONARIO_REAL.length)];
    linhaAtual = 0;
    colunaAtual = 0;
    jogoFinalizado = false;
    estaValidando = false;
    matrizSessao = Array(TENTATIVAS).fill().map(() => Array(TAMANHO_PALAVRA).fill(""));
    
    const grid = document.getElementById("termo-grid");
    grid.innerHTML = "";
    
    for (let i = 0; i < TENTATIVAS; i++) {
        let divLinha = document.createElement("div");
        divLinha.className = "termo-row";
        for (let j = 0; j < TAMANHO_PALAVRA; j++) {
            let divCaixa = document.createElement("div");
            divCaixa.className = "termo-box";
            divCaixa.id = `termo-box-${i}-${j}`;
            divLinha.appendChild(divCaixa);
        }
        grid.appendChild(divLinha);
    }

    document.querySelectorAll(".termo-key").forEach(b => {
        b.classList.remove("correct", "misplaced", "wrong");
    });
}

function dispararNotificacao(msg, tipo) {
    const box = document.getElementById("termo-notif");
    if (!box) return;
    box.innerText = msg;
    box.className = `notificacao visivel ${tipo}`;
    setTimeout(() => { box.classList.remove("visivel"); }, 3000);
}

function inserirLetra(l) {
    if (jogoFinalizado || colunaAtual >= TAMANHO_PALAVRA) return;
    matrizSessao[linhaAtual][colunaAtual] = l;
    const caixa = document.getElementById(`termo-box-${linhaAtual}-${colunaAtual}`);
    if (caixa) {
        caixa.innerText = l;
        caixa.classList.add("pop");
    }
    colunaAtual++;
}

function apagarLetra() {
    if (jogoFinalizado || colunaAtual === 0) return;
    colunaAtual--;
    matrizSessao[linhaAtual][colunaAtual] = "";
    const caixa = document.getElementById(`termo-box-${linhaAtual}-${colunaAtual}`);
    if (caixa) {
        caixa.innerText = "";
        caixa.classList.remove("pop");
    }
}

async function verificarDicionarioReal(palavra) {
    if (DICIONARIO_REAL.includes(palavra)) return true;
    try {
        const resposta = await fetch(`https://api.dicionario-aberto.net/word/${palavra.toLowerCase()}`);
        const resultado = await resposta.json();
        return resultado.length > 0;
    } catch (erro) {
        return true; 
    }
}

async function validarTentativa() {
    if (jogoFinalizado || estaValidando) return;
    
    if (colunaAtual < TAMANHO_PALAVRA) {
        dispararNotificacao("PALAVRA INCOMPLETA!", "erro");
        return;
    }

    const palpite = matrizSessao[linhaAtual].join("");

    for (let i = 0; i < linhaAtual; i++) {
        if (matrizSessao[i].join("") === palpite) {
            dispararNotificacao("VOCÊ JÁ TENTOU ESSA!", "erro");
            return;
        }
    }

    estaValidando = true;

    const palavraValida = await verificarDicionarioReal(palpite);
    if (!palavraValida) {
        dispararNotificacao("ESSA PALAVRA NÃO EXISTE!", "erro");
        estaValidando = false;
        return;
    }

    let letrasRestantes = palavraSecreta.split("");
    let totalAcertos = 0;
    let estadosChaves = {};

    for (let i = 0; i < TAMANHO_PALAVRA; i++) {
        const caixa = document.getElementById(`termo-box-${linhaAtual}-${i}`);
        const letra = palpite[i];
        if (letra === palavraSecreta[i]) {
            caixa.classList.add("correct");
            letrasRestantes[i] = null;
            totalAcertos++;
            estadosChaves[letra] = "correct";
        }
    }

    for (let i = 0; i < TAMANHO_PALAVRA; i++) {
        const caixa = document.getElementById(`termo-box-${linhaAtual}-${i}`);
        const letra = palpite[i];
        if (letra !== palavraSecreta[i]) {
            let idx = letrasRestantes.indexOf(letra);
            if (idx !== -1) {
                caixa.classList.add("misplaced");
                letrasRestantes[idx] = null;
                if (estadosChaves[letra] !== "correct") estadosChaves[letra] = "misplaced";
            } else {
                caixa.classList.add("wrong");
                if (!estadosChaves[letra]) estadosChaves[letra] = "wrong";
            }
        }
    }

    atualizarTecladoVirtual(estadosChaves);

    if (totalAcertos === TAMANHO_PALAVRA) {
        dispararNotificacao("SENSACIONAL! VOCE GANHOU!", "sucesso");
        jogoFinalizado = true;
    } else {
        linhaAtual++;
        colunaAtual = 0;
        if (linhaAtual === TENTATIVAS) {
            dispararNotificacao(`FIM DE JOGO! PALAVRA: ${palavraSecreta}`, "erro");
            jogoFinalizado = true;
        }
    }

    estaValidando = false;
}

function atualizarTecladoVirtual(mapaEstados) {
    for (const [letra, estado] of Object.entries(mapaEstados)) {
        const botaoTeclado = document.querySelector(`.termo-key[data-key="${letra}"]`);
        if (botaoTeclado) {
            if (estado === "correct") {
                botaoTeclado.classList.remove("misplaced", "wrong");
                botaoTeclado.classList.add("correct");
            } else if (estado === "misplaced" && !botaoTeclado.classList.contains("correct")) {
                botaoTeclado.classList.remove("wrong");
                botaoTeclado.classList.add("misplaced");
            } else if (estado === "wrong" && !botaoTeclado.classList.contains("correct") && !botaoTeclado.classList.contains("misplaced")) {
                botaoTeclado.classList.add("wrong");
            }
        }
    }
}

function inicializarListeners() {
    document.querySelectorAll(".termo-key").forEach(b => {
        b.replaceWith(b.cloneNode(true));
    });

    document.querySelectorAll(".termo-key").forEach(b => {
        b.addEventListener("click", () => {
            const cmd = b.getAttribute("data-key");
            mapearAcao(cmd);
        });
    });

    window.removeEventListener("keydown", lidarTecladoFisico);
    window.addEventListener("keydown", lidarTecladoFisico);
}

function lidarTecladoFisico(e) {
    const tecla = e.key.toUpperCase();
    if (tecla === "ENTER") mapearAcao("ENTER");
    else if (tecla === "BACKSPACE") mapearAcao("BACKSPACE");
    else if (tecla.match(/^[A-Z]$/)) mapearAcao(tecla);
}

function mapearAcao(acao) {
    if (acao === "ENTER") {
        validarTentativa();
    } else if (acao === "BACKSPACE") {
        apagarLetra();
    } else {
        inserirLetra(acao);
    }
}