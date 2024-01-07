document.addEventListener('DOMContentLoaded', function () {
    const board = document.getElementById('board');
    const resultDisplay = document.getElementById('result');
    const resetButton = document.getElementById('resetBtn');

    let currentPlayer = 'X';
    let gameBoard = Array(9).fill('');
    let gameActive = true;

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

    renderBoard();

    resetButton.addEventListener('click', handleResetClick);
});