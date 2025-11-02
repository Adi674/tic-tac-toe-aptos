// Tic Tac Toe dApp JavaScript
// Contract configuration - UPDATE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS
const MODULE_ADDRESS = "0x71386741d663722a36e72a763da6b1655759447c2569b15e52970df1fe375d0b";

// Global variables
let walletConnected = false;
let currentAccount = null;
let currentGame = null;
let gameRegistry = null;
let games = [];
let isPlayerTurn = true;

// Game constants
const EMPTY = 0;
const PLAYER_X = 1;
const PLAYER_O = 2;

const GAME_STATUS_ONGOING = 0;
const GAME_STATUS_X_WINS = 1;
const GAME_STATUS_O_WINS = 2;
const GAME_STATUS_DRAW = 3;

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');
const walletDisconnected = document.getElementById('wallet-disconnected');
const walletConnectedDiv = document.getElementById('wallet-connected');
const walletAddress = document.getElementById('wallet-address');
const mainContent = document.getElementById('main-content');

// Game elements
const newGameComputerBtn = document.getElementById('new-game-computer');
const newGamePlayerBtn = document.getElementById('new-game-player');
const opponentInput = document.getElementById('opponent-input');
const createGameBtn = document.getElementById('create-game-btn');
const opponentAddressInput = document.getElementById('opponent-address');
const currentGameSection = document.getElementById('current-game-section');
const gameBoard = document.getElementById('game-board');
const cells = document.querySelectorAll('.cell');
const turnDisplay = document.getElementById('turn-display');
const movesCount = document.getElementById('moves-count');
const currentGameId = document.getElementById('current-game-id');
const gameResult = document.getElementById('game-result');
const resultText = document.getElementById('result-text');
const newGameBtn = document.getElementById('new-game-btn');
const opponentDisplay = document.getElementById('opponent-display');

// Statistics elements
const totalGamesElement = document.getElementById('total-games');
const activeGamesElement = document.getElementById('active-games');
const completedGamesElement = document.getElementById('completed-games');
const yourGamesElement = document.getElementById('your-games');

// History elements
const refreshHistoryBtn = document.getElementById('refresh-history-btn');
const loadingHistory = document.getElementById('loading-history');
const gamesList = document.getElementById('games-list');
const emptyHistory = document.getElementById('empty-history');
const alertsContainer = document.getElementById('alerts');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkWalletConnection();
});

function setupEventListeners() {
    connectWalletBtn.addEventListener('click', connectWallet);
    disconnectWalletBtn.addEventListener('click', disconnectWallet);
    
    // Game controls
    newGameComputerBtn.addEventListener('click', () => showGameMode('computer'));
    newGamePlayerBtn.addEventListener('click', () => showGameMode('player'));
    createGameBtn.addEventListener('click', createGameVsPlayer);
    newGameBtn.addEventListener('click', resetGame);
    refreshHistoryBtn.addEventListener('click', loadGameHistory);
    
    // Board clicks
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });
}

// Wallet connection functions
async function checkWalletConnection() {
    try {
        if (typeof window.aptos !== 'undefined') {
            const account = await window.aptos.account();
            if (account) {
                handleWalletConnected(account);
            }
        } else {
            setTimeout(() => {
                showAlert('Petra wallet not detected. Enabling demo mode...', 'info');
                enableDemoMode();
            }, 3000);
        }
    } catch (error) {
        console.log('No wallet connected');
        setTimeout(() => {
            enableDemoMode();
        }, 5000);
    }
}

async function connectWallet() {
    try {
        if (typeof window.aptos === 'undefined') {
            showAlert('Please install Petra wallet extension', 'error');
            window.open('https://petra.app/', '_blank');
            return;
        }

        const account = await window.aptos.connect();
        if (account) {
            handleWalletConnected(account);
            showAlert('Wallet connected successfully!', 'success');
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        showAlert('Failed to connect wallet. Enabling demo mode...', 'info');
        enableDemoMode();
    }
}

async function disconnectWallet() {
    try {
        if (window.aptos) {
            await window.aptos.disconnect();
        }
        handleWalletDisconnected();
        showAlert('Wallet disconnected', 'info');
    } catch (error) {
        console.error('Disconnect error:', error);
    }
}

function handleWalletConnected(account) {
    walletConnected = true;
    currentAccount = account;
    gameRegistry = account.address; // Use account address as registry
    
    walletDisconnected.classList.add('hidden');
    walletConnectedDiv.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    
    walletAddress.textContent = `${account.address.substring(0, 12)}...${account.address.substring(account.address.length - 8)}`;
    
    // Initialize game registry and load data
    initializeGameRegistry();
    loadGameStats();
    loadGameHistory();
}

function handleWalletDisconnected() {
    walletConnected = false;
    currentAccount = null;
    currentGame = null;
    games = [];
    
    walletDisconnected.classList.remove('hidden');
    walletConnectedDiv.classList.add('hidden');
    mainContent.classList.add('hidden');
    currentGameSection.classList.add('hidden');
}

// Demo mode for testing without wallet
function enableDemoMode() {
    const demoAccount = { address: "0xdemo123456789abcdef..." };
    currentAccount = demoAccount;
    walletConnected = true;
    gameRegistry = demoAccount.address;
    
    walletDisconnected.classList.add('hidden');
    walletConnectedDiv.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    
    walletAddress.textContent = "Demo Mode - Try the game!";
    
    // Load demo data
    loadDemoData();
    
    showAlert('Demo mode enabled - Try playing Tic Tac Toe!', 'success');
}

function loadDemoData() {
    // Demo statistics
    totalGamesElement.textContent = '5';
    activeGamesElement.textContent = '1';
    completedGamesElement.textContent = '4';
    yourGamesElement.textContent = '5';
    
    // Demo games
    games = [
        {
            id: 1,
            player_x: currentAccount.address,
            player_o: '@0x1',
            game_status: GAME_STATUS_X_WINS,
            moves_count: 5,
            created_at: Math.floor(Date.now() / 1000) - 86400,
            finished_at: Math.floor(Date.now() / 1000) - 86000,
            winner: currentAccount.address
        },
        {
            id: 2,
            player_x: currentAccount.address,
            player_o: '@0x1',
            game_status: GAME_STATUS_DRAW,
            moves_count: 9,
            created_at: Math.floor(Date.now() / 1000) - 172800,
            finished_at: Math.floor(Date.now() / 1000) - 172000,
            winner: '@0x0'
        }
    ];
    
    displayGameHistory();
}

// Smart contract functions
async function initializeGameRegistry() {
    try {
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::tic_tac_toe::initialize_game_registry`,
            type_arguments: [],
            arguments: []
        };

        await window.aptos.signAndSubmitTransaction(payload);
        console.log('Game registry initialized');
    } catch (error) {
        console.log('Game registry might already be initialized or error:', error);
    }
}

async function createGameVsComputer() {
    if (!currentAccount) {
        showAlert('Please connect your wallet first', 'error');
        return;
    }

    try {
        newGameComputerBtn.disabled = true;
        newGameComputerBtn.textContent = '⏳ Creating Game...';
        
        if (currentAccount.address.includes('demo')) {
            createDemoGame('computer');
            return;
        }
        
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::tic_tac_toe::create_game_vs_computer`,
            type_arguments: [],
            arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        showAlert('Game created successfully!', 'success');
        
        setTimeout(() => {
            loadGameStats();
            loadActiveGame();
        }, 3000);
        
    } catch (error) {
        console.error('Create game error:', error);
        showAlert('Failed to create game. Please try again.', 'error');
    } finally {
        newGameComputerBtn.disabled = false;
        newGameComputerBtn.textContent = '🤖 Play vs Computer';
    }
}

async function createGameVsPlayer() {
    if (!currentAccount) {
        showAlert('Please connect your wallet first', 'error');
        return;
    }

    const opponent = opponentAddressInput.value.trim();
    if (!opponent) {
        showAlert('Please enter opponent address', 'error');
        return;
    }

    if (!opponent.startsWith('0x') || opponent.length !== 66) {
        showAlert('Invalid wallet address format', 'error');
        return;
    }

    try {
        createGameBtn.disabled = true;
        createGameBtn.textContent = '⏳ Creating Game...';
        
        if (currentAccount.address.includes('demo')) {
            createDemoGame('player', opponent);
            return;
        }
        
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::tic_tac_toe::create_game_vs_player`,
            type_arguments: [],
            arguments: [opponent]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        showAlert('Game created successfully!', 'success');
        
        opponentAddressInput.value = '';
        opponentInput.classList.add('hidden');
        
        setTimeout(() => {
            loadGameStats();
            loadActiveGame();
        }, 3000);
        
    } catch (error) {
        console.error('Create game error:', error);
        showAlert('Failed to create game. Please try again.', 'error');
    } finally {
        createGameBtn.disabled = false;
        createGameBtn.textContent = 'Create Game';
    }
}

function createDemoGame(mode, opponent = null) {
    const gameId = Date.now();
    const currentTime = Math.floor(Date.now() / 1000);
    
    currentGame = {
        id: gameId,
        player_x: currentAccount.address,
        player_o: mode === 'computer' ? '@0x1' : opponent,
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        current_player: PLAYER_X,
        game_status: GAME_STATUS_ONGOING,
        moves_count: 0,
        created_at: currentTime,
        finished_at: 0,
        winner: '@0x0'
    };
    
    showCurrentGame();
    updateGameDisplay();
    
    if (mode === 'player') {
        opponentAddressInput.value = '';
        opponentInput.classList.add('hidden');
    }
    
    showAlert('Demo game created!', 'success');
}

async function makeMove(position) {
    if (!currentAccount || !currentGame) return;

    try {
        if (currentAccount.address.includes('demo')) {
            makeDemoMove(position);
            return;
        }
        
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::tic_tac_toe::make_move`,
            type_arguments: [],
            arguments: [gameRegistry, currentGame.id.toString(), position.toString()]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        showAlert('Move made!', 'success');
        
        setTimeout(() => {
            loadCurrentGame();
        }, 2000);
        
    } catch (error) {
        console.error('Make move error:', error);
        showAlert('Failed to make move. Please try again.', 'error');
    }
}

function makeDemoMove(position) {
    if (currentGame.board[position] !== EMPTY) return;
    
    // Make player move
    currentGame.board[position] = currentGame.current_player;
    currentGame.moves_count++;
    
    // Check for win or draw
    if (checkWinner(currentGame.board)) {
        currentGame.game_status = currentGame.current_player === PLAYER_X ? GAME_STATUS_X_WINS : GAME_STATUS_O_WINS;
        currentGame.winner = currentGame.current_player === PLAYER_X ? currentAccount.address : currentGame.player_o;
        currentGame.finished_at = Math.floor(Date.now() / 1000);
    } else if (currentGame.moves_count === 9) {
        currentGame.game_status = GAME_STATUS_DRAW;
        currentGame.finished_at = Math.floor(Date.now() / 1000);
    } else {
        // Switch turns
        currentGame.current_player = currentGame.current_player === PLAYER_X ? PLAYER_O : PLAYER_X;
    }
    
    updateGameDisplay();
    
    // If vs computer and game ongoing, make computer move
    if (currentGame.player_o === '@0x1' && 
        currentGame.game_status === GAME_STATUS_ONGOING && 
        currentGame.current_player === PLAYER_O) {
        setTimeout(() => {
            makeComputerMove();
        }, 1000);
    }
}

function makeComputerMove() {
    const availablePositions = [];
    for (let i = 0; i < 9; i++) {
        if (currentGame.board[i] === EMPTY) {
            availablePositions.push(i);
        }
    }
    
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const position = availablePositions[randomIndex];
        
        currentGame.board[position] = PLAYER_O;
        currentGame.moves_count++;
        
        // Check for win or draw
        if (checkWinner(currentGame.board)) {
            currentGame.game_status = GAME_STATUS_O_WINS;
            currentGame.winner = '@0x1';
            currentGame.finished_at = Math.floor(Date.now() / 1000);
        } else if (currentGame.moves_count === 9) {
            currentGame.game_status = GAME_STATUS_DRAW;
            currentGame.finished_at = Math.floor(Date.now() / 1000);
        } else {
            currentGame.current_player = PLAYER_X;
        }
        
        updateGameDisplay();
    }
}

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a] !== EMPTY && board[a] === board[b] && board[b] === board[c]) {
            return true;
        }
    }
    return false;
}

// Game display functions
function showGameMode(mode) {
    if (mode === 'player') {
        opponentInput.classList.remove('hidden');
    } else {
        opponentInput.classList.add('hidden');
        createGameVsComputer();
    }
}

function showCurrentGame() {
    currentGameSection.classList.remove('hidden');
    gameResult.classList.add('hidden');
    
    // Set opponent display
    if (currentGame.player_o === '@0x1') {
        opponentDisplay.textContent = '🤖 Computer';
    } else {
        opponentDisplay.textContent = `⭕ ${currentGame.player_o.substring(0, 12)}...`;
    }
    
    // Enable board
    cells.forEach(cell => {
        cell.classList.remove('disabled');
    });
}

function updateGameDisplay() {
    if (!currentGame) return;
    
    // Update board
    cells.forEach((cell, index) => {
        const value = currentGame.board[index];
        cell.textContent = '';
        cell.className = 'cell';
        
        if (value === PLAYER_X) {
            cell.textContent = '❌';
            cell.classList.add('x');
        } else if (value === PLAYER_O) {
            cell.textContent = '⭕';
            cell.classList.add('o');
        }
    });
    
    // Update game info
    currentGameId.textContent = currentGame.id;
    movesCount.textContent = currentGame.moves_count;
    
    // Update turn display
    if (currentGame.game_status === GAME_STATUS_ONGOING) {
        const isPlayerTurn = currentGame.current_player === PLAYER_X;
        turnDisplay.textContent = isPlayerTurn ? 'Your Turn' : "Opponent's Turn";
        
        // Disable board if not player's turn
        if (!isPlayerTurn) {
            cells.forEach(cell => {
                if (!cell.classList.contains('x') && !cell.classList.contains('o')) {
                    cell.classList.add('disabled');
                }
            });
        }
    } else {
        // Game finished
        cells.forEach(cell => cell.classList.add('disabled'));
        showGameResult();
    }
}

function showGameResult() {
    gameResult.classList.remove('hidden');
    
    let resultMessage = '';
    if (currentGame.game_status === GAME_STATUS_X_WINS) {
        resultMessage = '🎉 You Won!';
    } else if (currentGame.game_status === GAME_STATUS_O_WINS) {
        resultMessage = '😔 You Lost!';
    } else {
        resultMessage = '🤝 It\'s a Draw!';
    }
    
    resultText.textContent = resultMessage;
}

function handleCellClick(position) {
    if (!currentGame || 
        currentGame.game_status !== GAME_STATUS_ONGOING || 
        currentGame.board[position] !== EMPTY ||
        currentGame.current_player !== PLAYER_X) {
        return;
    }
    
    makeMove(position);
}

function resetGame() {
    currentGame = null;
    currentGameSection.classList.add('hidden');
    opponentInput.classList.add('hidden');
    
    // Clear board
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
}

// Data loading functions
async function loadGameStats() {
    if (!currentAccount) return;

    try {
        if (currentAccount.address.includes('demo')) {
            return; // Demo data already loaded
        }
        
        const response = await window.aptos.view({
            function: `${MODULE_ADDRESS}::tic_tac_toe::get_game_stats`,
            type_arguments: [],
            arguments: [gameRegistry],
        });
        
        const [total, active, completed] = response;
        totalGamesElement.textContent = total.toString();
        activeGamesElement.textContent = active.toString();
        completedGamesElement.textContent = completed.toString();
        
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

async function loadActiveGame() {
    if (!currentAccount) return;

    try {
        if (currentAccount.address.includes('demo')) {
            return; // Demo mode doesn't need to load active games
        }
        
        const response = await window.aptos.view({
            function: `${MODULE_ADDRESS}::tic_tac_toe::get_active_games`,
            type_arguments: [],
            arguments: [gameRegistry],
        });
        
        const activeGames = response[0] || [];
        
        // Find a game where current user is a player
        const userGame = activeGames.find(game => 
            game.player_x === currentAccount.address || game.player_o === currentAccount.address
        );
        
        if (userGame) {
            currentGame = {
                id: parseInt(userGame.id),
                player_x: userGame.player_x,
                player_o: userGame.player_o,
                board: userGame.board.map(cell => parseInt(cell)),
                current_player: parseInt(userGame.current_player),
                game_status: parseInt(userGame.game_status),
                moves_count: parseInt(userGame.moves_count),
                created_at: parseInt(userGame.created_at),
                finished_at: parseInt(userGame.finished_at),
                winner: userGame.winner
            };
            
            showCurrentGame();
            updateGameDisplay();
        }
        
    } catch (error) {
        console.error('Load active game error:', error);
    }
}

async function loadGameHistory() {
    if (!currentAccount) return;

    try {
        showLoadingHistory(true);
        
        if (currentAccount.address.includes('demo')) {
            displayGameHistory();
            return;
        }
        
        const response = await window.aptos.view({
            function: `${MODULE_ADDRESS}::tic_tac_toe::get_player_games`,
            type_arguments: [],
            arguments: [gameRegistry, currentAccount.address],
        });
        
        const playerGames = response[0] || [];
        games = playerGames.map(game => ({
            id: parseInt(game.id),
            player_x: game.player_x,
            player_o: game.player_o,
            game_status: parseInt(game.game_status),
            moves_count: parseInt(game.moves_count),
            created_at: parseInt(game.created_at),
            finished_at: parseInt(game.finished_at),
            winner: game.winner
        }));
        
        yourGamesElement.textContent = games.length.toString();
        displayGameHistory();
        
    } catch (error) {
        console.error('Load history error:', error);
        games = [];
        displayGameHistory();
    } finally {
        showLoadingHistory(false);
    }
}

function displayGameHistory() {
    if (games.length === 0) {
        gamesList.innerHTML = '';
        emptyHistory.classList.remove('hidden');
        return;
    }

    emptyHistory.classList.add('hidden');
    
    // Sort games by creation date (newest first)
    const sortedGames = [...games].sort((a, b) => b.created_at - a.created_at);
    
    gamesList.innerHTML = sortedGames.map(game => {
        const isWinner = game.winner === currentAccount.address;
        const isDraw = game.game_status === GAME_STATUS_DRAW;
        const isOngoing = game.game_status === GAME_STATUS_ONGOING;
        
        let gameClass = '';
        let statusClass = '';
        let statusText = '';
        
        if (isOngoing) {
            gameClass = '';
            statusClass = 'status-ongoing';
            statusText = 'Ongoing';
        } else if (isDraw) {
            gameClass = 'draw';
            statusClass = 'status-draw';
            statusText = 'Draw';
        } else if (isWinner) {
            gameClass = 'won';
            statusClass = 'status-won';
            statusText = 'Won';
        } else {
            gameClass = 'lost';
            statusClass = 'status-lost';
            statusText = 'Lost';
        }
        
        const opponent = game.player_o === '@0x1' ? 'Computer' : 
                        (game.player_o === currentAccount.address ? 'You (O)' : 
                         `${game.player_o.substring(0, 12)}...`);
        
        return `
            <div class="game-item ${gameClass}">
                <div class="game-header-item">
                    <div class="game-title-item">Game #${game.id} vs ${opponent}</div>
                    <div class="game-status-badge ${statusClass}">${statusText}</div>
                </div>
                <div class="game-details">
                    <div>Moves: ${game.moves_count}/9</div>
                    <div>Created: ${formatDate(game.created_at)}</div>
                    ${game.finished_at > 0 ? `<div>Finished: ${formatDate(game.finished_at)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Utility functions
function showLoadingHistory(show) {
    if (show) {
        loadingHistory.classList.remove('hidden');
    } else {
        loadingHistory.classList.add('hidden');
    }
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertsContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

console.log('Tic Tac Toe dApp loaded successfully!');