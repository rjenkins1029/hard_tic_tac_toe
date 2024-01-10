console.log("Script is running");

(function () {
    window.addEventListener('beforeunload', function () {
        saveGameState();
    });

document.addEventListener('DOMContentLoaded', function () {
    const board = document.getElementById('board');
    const resultDisplay = document.getElementById('result');
    const resetButton = document.getElementById('resetBtn');
    const scoreDisplay = document.getElementById('score');
    const modal = document.getElementById('modal');
    const aiButton = document.getElementById('aiButton');
    const twoPlayerButton = document.getElementById('twoPlayerButton');

    let currentPlayer = 'X';
    let gameBoard = Array(9).fill('');
    let gameActive = true;
    let isAgainstAI = false;
    let scores = { X: 0, O: 0, T: 0 };

    const checkWinner = () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                return gameBoard[a];
            }
        }

        return gameBoard.includes('') ? null : 'T';
    };

    const handleCellClick = (index) => {
        if (gameBoard[index] || !gameActive) return;

        gameBoard[index] = currentPlayer;
        renderBoard();

        const winner = checkWinner();
        if (winner) {
            gameActive = false;
            if (winner === 'T') {
                resultDisplay.innerText = "It's a tie!";
                scores.T++;
            } else {
                resultDisplay.innerText = `${winner} wins!`;
                scores[winner]++;
            }
            updateScoreDisplay();
            saveGameState();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            if (isAgainstAI && currentPlayer === 'O') {
                setTimeout(() => {
                    const aiMove = getBestMove();
                    handleCellClick(aiMove);
                }, 500);
            }
        }
    };

    const renderBoard = () => {
        console.log('renderBoard function called');
        board.innerHTML = '';
        gameBoard.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.innerText = value;
            cell.addEventListener('click', () => handleCellClick(index));
            board.appendChild(cell);
        });
    };

    const handleResetClick = () => {
        gameBoard = Array(9).fill('');
        gameActive = true;
        currentPlayer = 'X';
        resultDisplay.innerText = '';
        renderBoard();
        saveGameState();
    };

    const getBestMove = () => {
        const emptySpaces = gameBoard.reduce((acc, val, index) => (val === '' ? [...acc, index] : acc), []);

        let bestScore = -Infinity;
        let bestMove = -1;

        emptySpaces.forEach((index) => {
            gameBoard[index] = 'O';
            const score = minimax(gameBoard, 0, -Infinity, Infinity, false);
            gameBoard[index] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        });

        return bestMove;
    };

    const minimax = (board, depth, alpha, beta, isMaximizing) => {
        const scores = {
            X: -1,
            O: 1,
            T: 0,
        };

        const winner = checkWinner();
        if (winner !== null) {
            return scores[winner];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const score = minimax(board, depth + 1, alpha, beta, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    const score = minimax(board, depth + 1, alpha, beta, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return bestScore;
        }
    };

    const updateScoreDisplay = () => {
        scoreDisplay.innerText = `X: ${scores.X} | O: ${scores.O} | T: ${scores.T}`;
    };

    const openModal = () => {
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const saveGameState = () => {
        const gameState = {
            currentPlayer,
            gameBoard,
            gameActive,
            isAgainstAI,
            scores
        };
        localStorage.setItem('ticTacToeGameState', JSON.stringify(gameState));
    };

    const loadGameState = () => {
        const gameStateString = localStorage.getItem('ticTacToeGameState');
        if (gameStateString) {
            const gameState = JSON.parse(gameStateString);
            currentPlayer = gameState.currentPlayer;
            gameBoard = gameState.gameBoard;
            gameActive = gameState.gameActive;
            isAgainstAI = gameState.isAgainstAI;
            scores = gameState.scores;

            renderBoard();
            updateScoreDisplay();
            resultDisplay.innerText = gameActive ? '' : (currentPlayer === 'X' ? "Player X's turn" : "Player O's turn");
        }
    };

    aiButton.addEventListener('click', () => {
        isAgainstAI = true;
        closeModal();
        loadGameState();
    });

    twoPlayerButton.addEventListener('click', () => {
        isAgainstAI = false;
        closeModal();
        loadGameState();
    });

    renderBoard();
    updateScoreDisplay();
    loadGameState();

    resetButton.addEventListener('click', () => {
        scores = { X: 0, O: 0, T: 0 };
        handleResetClick();
        updateScoreDisplay();
    });
})()});