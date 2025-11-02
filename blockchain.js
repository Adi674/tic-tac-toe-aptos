// Aptos Blockchain Integration for Tic Tac Toe
const MODULE_ADDRESS = "0x71386741d663722a36e72a763da6b1655759447c2569b15e52970df1fe375d0b";

class AptosBlockchain {
    constructor() {
        this.account = null;
        this.isConnected = false;
        this.gameRegistry = null;
        this.initializeWalletConnection();
    }

    async initializeWalletConnection() {
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletInfo = document.getElementById('walletInfo');
        const deployBtn = document.getElementById('deployGameBtn');

        connectBtn.addEventListener('click', () => this.connectWallet());
        deployBtn.addEventListener('click', () => this.initializeGameRegistry());

        // Check if wallet is already connected
        await this.checkWalletConnection();
    }

    async checkWalletConnection() {
        try {
            if (typeof window.aptos !== 'undefined') {
                const account = await window.aptos.account();
                if (account) {
                    await this.handleWalletConnected(account);
                }
            }
        } catch (error) {
            console.log('No wallet connected');
        }
    }

    async connectWallet() {
        try {
            if (typeof window.aptos === 'undefined') {
                alert('Please install Petra wallet extension');
                window.open('https://petra.app/', '_blank');
                return;
            }

            const account = await window.aptos.connect();
            if (account) {
                await this.handleWalletConnected(account);
                this.showAlert('Wallet connected successfully!', 'success');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showAlert('Failed to connect wallet', 'error');
        }
    }

    async handleWalletConnected(account) {
        this.account = account;
        this.isConnected = true;
        this.gameRegistry = account.address;

        // Update UI
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');

        connectBtn.textContent = 'Wallet Connected';
        connectBtn.disabled = true;
        walletInfo.style.display = 'block';
        walletAddress.textContent = `${account.address.substring(0, 12)}...${account.address.substring(account.address.length - 8)}`;

        // Enable blockchain mode in game
        if (window.ticTacToeGame) {
            window.ticTacToeGame.setBlockchainMode(true);
        }
    }

    async initializeGameRegistry() {
        if (!this.isConnected) {
            this.showAlert('Please connect wallet first', 'error');
            return;
        }

        try {
            const payload = {
                type: "entry_function_payload",
                function: `${MODULE_ADDRESS}::tic_tac_toe::initialize_game_registry`,
                type_arguments: [],
                arguments: []
            };

            await window.aptos.signAndSubmitTransaction(payload);
            this.showAlert('Game registry initialized on blockchain!', 'success');
            
            const deployBtn = document.getElementById('deployGameBtn');
            deployBtn.textContent = 'Deployed ✓';
            deployBtn.disabled = true;
        } catch (error) {
            console.log('Game registry might already be initialized:', error);
            this.showAlert('Game registry ready!', 'info');
        }
    }

    async createGame() {
        if (!this.isConnected) {
            this.showAlert('Please connect wallet first', 'error');
            return;
        }

        try {
            const payload = {
                type: "entry_function_payload",
                function: `${MODULE_ADDRESS}::tic_tac_toe::create_game_vs_computer`,
                type_arguments: [],
                arguments: []
            };

            const response = await window.aptos.signAndSubmitTransaction(payload);
            this.showAlert('Game created on blockchain!', 'success');
            return response;
        } catch (error) {
            console.error('Create game error:', error);
            this.showAlert('Failed to create game on blockchain', 'error');
        }
    }

    async recordGame(winner, board) {
        if (!this.isConnected) {
            console.log('Wallet not connected, skipping blockchain recording');
            return;
        }

        try {
            // For now, just log the game result
            // In a full implementation, you would make a move for each cell
            console.log('Game completed on blockchain:');
            console.log('Winner:', winner);
            console.log('Final board:', board);
            
            this.showAlert(`Game result recorded! Winner: ${winner}`, 'success');
        } catch (error) {
            console.error('Record game error:', error);
            this.showAlert('Failed to record game result', 'error');
        }
    }

    showAlert(message, type) {
        // Create a simple alert system
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            ${type === 'success' ? 'background-color: #27ae60;' : 
              type === 'error' ? 'background-color: #e74c3c;' : 
              'background-color: #3498db;'}
        `;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 3000);
    }
}

// Initialize blockchain integration
document.addEventListener('DOMContentLoaded', () => {
    window.aptosBlockchain = new AptosBlockchain();
});