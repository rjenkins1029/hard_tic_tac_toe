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

        // Use MCTS to find the best move
        const rootNode = createNode(gameBoard, currentPlayer);

        for (let i = 0; i < 1000; i++) {
            const selectedNode = select(rootNode);
            const result = simulate(selectedNode);
            backpropagate(selectedNode, result);
        }

        // Select the child node with the highest number of visits
        const bestChild = rootNode.children.reduce((acc, child) => (child.visits > acc.visits ? child : acc), rootNode.children[0]);

        return bestChild.move;
    };

    const createNode = (board, player) => {
        return {
            board: [...board],
            player: player,
            visits: 0,
            wins: 0,
            children: [],
            move: null,
        };
    };

    const select = (node) => {
        while (node.children.length > 0) {
            node = node.children.reduce((acc, child) => (uctValue(child) > uctValue(acc) ? child : acc), node.children[0]);
        }
        return node;
    };

    const uctValue = (node) => {
        if (node.visits === 0) {
            return Infinity;
        }
        const exploitation = node.wins / node.visits;
        const exploration = Math.sqrt(Math.log(node.parent.visits) / node.visits);
        return exploitation + 1.44 * exploration;
    };

    const simulate = (node) => {
        const simBoard = [...node.board];
        let simPlayer = node.player;

        while (true) {
            const emptySpaces = simBoard.reduce((acc, val, index) => (val === '' ? [...acc, index] : acc), []);

            if (emptySpaces.length === 0) {
                return 'T';
            }

            const randomMove = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
            simBoard[randomMove] = simPlayer;

            const winner = checkWinner(simBoard);
            if (winner) {
                return winner;
            }

            simPlayer = simPlayer === 'X' ? 'O' : 'X';
        }
    };

    const backpropagate = (node, result) => {
        while (node !== null) {
            node.visits += 1;
            if (result === node.player) {
                node.wins += 1;
            }
            node = node.parent;
        }
    };

    renderBoard();

    resetButton.addEventListener('click', handleResetClick);

    aiCheckbox.addEventListener('change', () => {
        isAgainstAI = aiCheckbox.checked;
        handleResetClick();
    });
});