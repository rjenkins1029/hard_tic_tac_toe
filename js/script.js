document.addEventListener('DOMContentLoaded', function () {
    const board = document.getElementById('board');
    const resultDisplay = document.getElementById('result');
    const resetButton = document.getElementById('resetBtn');
    const aiCheckbox = document.getElementById('aiCheckbox');

    let currentPlayer = 'X';
    let gameBoard = Array(9).fill('');
    let gameActive = true;
    let isAgainstAI = false;

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
            } else {
                resultDisplay.innerText = `${winner} wins!`;
            }
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

    renderBoard();

    resetButton.addEventListener('click', handleResetClick);

    aiCheckbox.addEventListener('change', () => {
        isAgainstAI = aiCheckbox.checked;
        handleResetClick();
    });
});
