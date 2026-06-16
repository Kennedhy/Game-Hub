document.addEventListener('DOMContentLoaded', () => {

    const professors = [
        { name: 'Felipe dos Anjos', image: 'images/felipe-anjos.jpg' },
        { name: 'Carlos Gustavo', image: 'images/baba.jpg' },
        { name: 'Anderson', image: 'images/anderson-barroso.png' },
        { name: 'Yuri', image: 'images/yuri.png' },
        { name: 'André', image: 'images/andre.png' }

    ];

    const students = [
        { name: 'Lin', image: 'images/lin.png' },
        { name: 'Arruda', image: 'images/arruda.png' },
        { name: 'Arthur Jacinto', image: 'images/jacinto.png' },
        { name: 'Felipe', image: 'images/felipe.png' },
        { name: 'Anderson', image: 'images/anderson.jpg' }
    ];

    let currentCharacter;
    let attempts;
    let currentMode = 'professor';
    let tempoInicio = null;

    const image = document.getElementById('professor-image');
    const attemptsSpan = document.getElementById('attempts');
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    const message = document.getElementById('message');

    const professorBtn = document.getElementById('professor-btn');
    const alunoBtn = document.getElementById('aluno-btn');

    function getCurrentList() {
        return currentMode === 'aluno'
            ? students
            : professors;
    }

    function startGame() {
        tempoInicio = Date.now();

        const currentList = getCurrentList();

        attempts = 3;

        currentCharacter =
            currentList[Math.floor(Math.random() * currentList.length)];

        image.src = currentCharacter.image;
        image.style.filter = 'blur(20px)';

        attemptsSpan.textContent = attempts;

        guessInput.value = '';
        message.textContent = '';

        guessInput.disabled = false;
        guessButton.disabled = false;
    }

    function endGame(vitoria) {
        guessInput.disabled = true;
        guessButton.disabled = true;

        const acertos = vitoria ? 1 : 0;
        const erros = vitoria ? (3 - attempts) : 3;
        
        let pontosFinais = 0;
        if (vitoria) {
            if (attempts === 3) pontosFinais = 1000;
            else if (attempts === 2) pontosFinais = 600;
            else if (attempts === 1) pontosFinais = 300;
        }

        const tempoDecorrido = tempoInicio ? Math.floor((Date.now() - tempoInicio) / 1000) : 0;

        const params = new URLSearchParams({
            jogo: currentMode === 'aluno' ? 'ADIVINHE O ALUNO' : 'ADIVINHE O PROFESSOR',
            slug: 'adivinhe-o-professor',
            pontos: pontosFinais,
            acertos: acertos,
            erros: erros,
            tempo: tempoDecorrido
        });

        setTimeout(() => {
            window.location.href = `fim-de-jogo.html?${params.toString()}`;
        }, 1500);
    }

    function checkGuess() {

        const userGuess =
            guessInput.value.trim().toLowerCase();

        const correctName =
            currentCharacter.name.toLowerCase();

        if (userGuess === correctName) {

            image.style.filter = 'blur(0px)';

            message.textContent =
                'Parabéns! Você acertou.';

            endGame(true);

            return;
        }

        attempts--;

        attemptsSpan.textContent = attempts;

        if (attempts > 0) {

            image.style.filter =
                `blur(${attempts * 5}px)`;

            message.textContent =
                'Resposta incorreta.';

        } else {

            image.style.filter = 'blur(0px)';

            message.textContent =
                `Fim de jogo! A resposta era ${currentCharacter.name}.`;

            endGame(false);
        }
    }

    guessButton.addEventListener('click', checkGuess);

    guessInput.addEventListener('keypress', (event) => {

        if (event.key === 'Enter') {
            checkGuess();
        }

    });

    professorBtn.addEventListener('click', () => {

        currentMode = 'professor';

        professorBtn.classList.add('active');
        alunoBtn.classList.remove('active');

        startGame();
    });

    alunoBtn.addEventListener('click', () => {

        currentMode = 'aluno';

        alunoBtn.classList.add('active');
        professorBtn.classList.remove('active');

        startGame();
    });

    startGame();

});