// meu-jogo.js
document.addEventListener('DOMContentLoaded', () => {
  // 1. Exige que o jogador esteja logado
  const usuarioAtual = Auth.exigirAutenticacao();
  if (!usuarioAtual) return;

  document.getElementById('nome-cabecalho').textContent = usuarioAtual.nomeUsuario;
  document.getElementById('btn-sair').addEventListener('click', () => Auth.sair());

  // 2. Variáveis de controle da partida
  let pontos = 0;
  let acertos = 0;
  let erros = 0;
  let tempoInicio = Date.now();
  let pontosPossiveis = 300;
  let tentativas = 3;

  // Lógica do Canvas (borrão e revelação)
  const imgNitida = document.getElementById('imagem-nitida');
  const canvas = document.getElementById('canvas-borrado');
  const ctx = canvas?.getContext('2d');

  function inicializarImagem() {
    if (!canvas || !ctx || !imgNitida) return;
    canvas.width = imgNitida.clientWidth || 250;
    canvas.height = imgNitida.clientHeight || 250;
    
    // Desenha a imagem com desfoque no canvas
    ctx.filter = 'blur(20px)';
    ctx.drawImage(imgNitida, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none'; 
  }

  // Garante que a imagem está carregada antes de desenhar no canvas
  if (imgNitida) {
    if (imgNitida.complete) {
      inicializarImagem();
    } else {
      imgNitida.onload = inicializarImagem;
    }
  }

  function revelarPontoAleatorio() {
    if (!ctx || !canvas) return;
    ctx.globalCompositeOperation = 'destination-out'; // "Apaga" o canvas, revelando a img nítida embaixo
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // 3. Lógica para capturar e validar o palpite
  const btnPalpite = document.getElementById('btn-palpite');
  const inputPalpite = document.getElementById('palpite-professor');

  if (btnPalpite && inputPalpite) {
    btnPalpite.addEventListener('click', () => {
      const palpite = inputPalpite.value.trim().toUpperCase();
      
      if (!palpite) return; // Não faz nada se o campo estiver vazio

      // Exemplo de validação (substitua 'FELIPE' pelo nome correto)
      if (palpite === 'FELIPE') {
        pontos += pontosPossiveis;
        acertos++;
        mostrarNotificacao(`Você acertou! +${pontosPossiveis} pts`, 'sucesso');
        if (canvas) canvas.style.display = 'none'; // Revela tudo
        setTimeout(() => finalizarPartida(), 1500);
      } else {
        erros++;
        tentativas--;
        
        if (tentativas > 0) {
          pontosPossiveis -= 100;
          mostrarNotificacao(`Palpite incorreto! Restam ${tentativas} tentativa(s).`, 'erro');
          sacudir(btnPalpite);
          
          // Faz de 4 a 5 furos no borrão para ajudar o jogador
          for (let i = 0; i < 4; i++) revelarPontoAleatorio();
          
          inputPalpite.value = '';
          inputPalpite.focus();
        } else {
          mostrarNotificacao('Você perdeu! Tentativas esgotadas.', 'erro');
          if (canvas) canvas.style.display = 'none'; // Mostra a cara do professor por fim
          setTimeout(() => finalizarPartida(), 2000); // 2 segundos e redireciona
        }
      }
    });

    // Permite jogar dando "Enter"
    inputPalpite.addEventListener('keydown', e => { 
      if (e.key === 'Enter') btnPalpite.click(); 
    });
  }

  // 4. Encerrar a partida e redirecionar
  function finalizarPartida() {
    const tempoGasto = Math.floor((Date.now() - tempoInicio) / 1000); // tempo em segundos
    const nomeJogo = encodeURIComponent("Advinhe o professor");
    const slug = encodeURIComponent("advinheoprof.html");

    // Redireciona para a sua tela inteligente de Game Over passando os dados
    window.location.href = `fim-de-jogo.html?pontos=${pontos}&acertos=${acertos}&erros=${erros}&tempo=${tempoGasto}&jogo=${nomeJogo}&slug=${slug}`;
  }
});
