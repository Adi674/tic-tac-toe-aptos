Tic Tac Toe on Aptos Blockchain
Hey there! 👋 This is my take on the classic Tic Tac Toe game, but with a modern twist - it runs on the Aptos blockchain! I built this as a fun way to explore Web3 gaming and learn about Move smart contracts.
🎮 Play the Game
Live Demo: https://adi674.github.io/tic-tac-toe-aptos/
Just click the link above and start playing! No installation needed.
What Makes This Special?
I wanted to create something that bridges traditional gaming with blockchain technology. The game works perfectly fine without any crypto stuff (great for just having fun), but if you're curious about Web3, you can connect your Petra wallet and have your victories recorded on the Aptos blockchain forever!
Game Features

Classic 3x3 Tic Tac Toe - The game we all know and love
Local Score Tracking - Keeps count of your wins vs your friend
Blockchain Mode - Connect your wallet to record games on-chain
Clean Interface - No clutter, just pure gaming fun
Mobile Friendly - Play on your phone, tablet, whatever!

How I Built This
This project taught me a lot about blockchain development. Here's what I used:
Frontend Stack:

Pure HTML/CSS/JavaScript (keeping it simple!)
Responsive design that works everywhere
Local storage for offline score tracking

Blockchain Integration:

Aptos blockchain (really impressed with how fast it is)
Move programming language for smart contracts
Petra wallet integration

Project Structure:
tic-tac-toe-aptos/
├── .aptos/                 # Aptos config files
├── build/                  # Compiled smart contract
├── sources/
│   └── tic_tac_toe.move   # Smart contract code
├── blockchain.js          # Handles wallet connection & blockchain calls
├── effects.js            # Visual effects and animations
├── game.js              # Core game logic
├── index.html           # Main game page
├── Move.toml            # Move project configuration  
├── script.js            # Additional game scripts
└── styles.css           # All the styling
Getting Started
Want to run this locally or contribute? Here's how:
bash# Clone my repo
git clone https://github.com/adi674/tic-tac-toe-aptos.git
cd tic-tac-toe-aptos

# Just open index.html in your browser, or
# If you want to serve it properly:
start index.html
   or 
python -m http.server 8000
For the blockchain features:

Install Petra Wallet
Get some testnet APT from the faucet
Connect your wallet in the game
Your wins get recorded on-chain! 🎉

Smart Contract Details
My contract is deployed on Aptos Testnet:

Address: 0x71386741d663722a36e72a763da6b1655759447c2569b15e52970df1fe375d0b
Explorer: View on Aptos Explorer

The contract handles game creation, move validation, and stores game results. It's pretty cool seeing your game data living on a blockchain!
What I Learned
Building this was actually more challenging than I expected:

Move language has a unique approach to smart contracts
Integrating Web3 wallets requires careful UX consideration
Balancing local gameplay with blockchain features is tricky
Making blockchain interactions feel natural takes work

Want to Contribute?
I'm always open to improvements! Some ideas I'm thinking about:

Online multiplayer (using the blockchain as coordination layer)
Tournament mode with small crypto prizes
Better animations and visual effects
AI opponent with different difficulty levels

Feel free to fork, submit PRs, or just give feedback!
The Tech Stuff
If you're into the technical details:

The Move smart contract validates all game logic on-chain
Frontend uses vanilla JavaScript (no frameworks needed)
Petra wallet integration handles all the crypto complexity
Local storage keeps your scores even without blockchain

Final Thoughts
This started as a weekend project to learn about Aptos, but I ended up really enjoying the process of building a dApp that's actually fun to use. The goal was to make blockchain gaming feel natural rather than forced.
Try it out and let me know what you think! Whether you use the blockchain features or just play locally, I hope you have fun with it.

Play Now: adi674.github.io/tic-tac-toe-aptos
Built with curiosity and caffeine ☕ | GitHub | Made with Aptos 🚀
