class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scoreX = 0;
        this.scoreO = 0;
        this.isBlockchainMode = false;
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.updateDisplay();
        this.attachEventListeners();
        this.loadScoreFromStorage();
    }
    
    attachEventListeners() {
        const cells = document.querySelectorAll('.cell');
        const resetBtn = document.getElementById('resetBtn');
        
        cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
        
        resetBtn.addEventListener('click', this.resetGame.bind(this));
    }
    
    handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (this.board[clickedCellIndex] !== '' || !this.gameActive) {
            return;
        }
        
        this.makeMove(clickedCellIndex);
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.updateDisplay();
        
        if (this.checkWin()) {
            this.endGame(`Player ${this.currentPlayer} wins!`);
            this.updateScore();
            return;
        }
        
        if (this.checkDraw()) {
            this.endGame("It's a draw!");
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateGameStatus();
    }
    
    checkWin() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(condition);
                return true;
            }
            return false;
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    highlightWinningCells(winningCondition) {
        winningCondition.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.classList.add('winning');
        });
    }
    
    endGame(message) {
        this.gameActive = false;
        this.updateGameStatus(message);
        
        if (this.isBlockchainMode) {
            this.recordGameOnBlockchain();
        }
    }
    
    updateScore() {
        if (this.currentPlayer === 'X') {
            this.scoreX++;
        } else {
            this.scoreO++;
        }
        this.saveScoreToStorage();
        this.updateDisplay();
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.updateDisplay();
        this.updateGameStatus();
        
        // Remove winning highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('winning');
        });
    }
    
    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            if (this.board[index]) {
                cell.classList.add(this.board[index].toLowerCase());
            }
        });
        
        document.getElementById('scoreX').textContent = this.scoreX;
        document.getElementById('scoreO').textContent = this.scoreO;
    }
    
    updateGameStatus(message = null) {
        const statusElement = document.getElementById('gameStatus');
        if (message) {
            statusElement.textContent = message;
        } else if (this.gameActive) {
            statusElement.textContent = `Player ${this.currentPlayer}'s turn`;
        }
    }
    
    saveScoreToStorage() {
        localStorage.setItem('ticTacToeScoreX', this.scoreX.toString());
        localStorage.setItem('ticTacToeScoreO', this.scoreO.toString());
    }
    
    loadScoreFromStorage() {
        const savedScoreX = localStorage.getItem('ticTacToeScoreX');
        const savedScoreO = localStorage.getItem('ticTacToeScoreO');
        
        if (savedScoreX !== null) {
            this.scoreX = parseInt(savedScoreX);
        }
        if (savedScoreO !== null) {
            this.scoreO = parseInt(savedScoreO);
        }
    }
    
    setBlockchainMode(enabled) {
        this.isBlockchainMode = enabled;
        const statusElement = document.getElementById('blockchainStatus');
        
        if (enabled) {
            statusElement.innerHTML = '<p style="color: #27ae60;">✓ Blockchain mode active - Games will be recorded on Aptos</p>';
        } else {
            statusElement.innerHTML = '<p>Local game mode - Connect wallet to play on blockchain</p>';
        }
    }
    
    recordGameOnBlockchain() {
        // This will be implemented when connecting to the smart contract
        console.log('Recording game result on blockchain...');
        console.log('Winner:', this.currentPlayer);
        console.log('Board state:', this.board);
        
        // Placeholder for blockchain interaction
        if (window.aptosBlockchain && window.aptosBlockchain.recordGame) {
            window.aptosBlockchain.recordGame(this.currentPlayer, this.board);
        }
    }
    
    getBoardState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive,
            scoreX: this.scoreX,
            scoreO: this.scoreO
        };
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.ticTacToeGame = new TicTacToeGame();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicTacToeGame;
}
