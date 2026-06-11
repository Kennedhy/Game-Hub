document.addEventListener('DOMContentLoaded', () => {

    const professors = [
        { name: 'Professor 1', image: 'images/prof1.jpg' },
        { name: 'Professor 2', image: 'images/prof2.jpg' },
        { name: 'Professor 3', image: 'images/prof3.jpg' }
    ];

    const students = [
        { name: 'Lin', image: 'images/alunos/lin.jpg' },
        { name: 'Arruda', image: 'images/alunos/arruda.jpg' },
        { name: 'Levi', image: 'images/alunos/levi.jpg' },
        { name: 'Emanoel', image: 'images/alunos/emanoel.jpg' },
        { name: 'Kennedhy', image: 'images/alunos/kennedhy.jpg' },
        { name: 'Wellington', image: 'images/alunos/wellington.jpg' },
        { name: 'Pedro Guilherme', image: 'images/alunos/pedro-guilherme.jpg' }
    ];

    let currentCharacter;
    let attempts;
    let currentMode = 'professor';

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

    function endGame() {
        guessInput.disabled = true;
        guessButton.disabled = true;
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

            endGame();

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

            endGame();
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