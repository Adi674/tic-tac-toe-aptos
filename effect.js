class GameEffects {
    constructor() {
        this.particles = [];
        this.isAnimating = false;
        this.canvas = null;
        this.ctx = null;
        
        this.initializeEffects();
    }
    
    initializeEffects() {
        this.createCanvas();
        this.startParticleSystem();
        this.addCustomAnimations();
    }
    
    createCanvas() {
        // Create a canvas for advanced particle effects
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        document.body.appendChild(this.canvas);
        
        // Handle window resize
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    startParticleSystem() {
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            particle.draw(this.ctx);
            return particle.life > 0;
        });
        
        requestAnimationFrame(this.animate.bind(this));
    }
    
    createWinParticles(cellIndex) {
        const cell = document.querySelector(`[data-index="${cellIndex}"]`);
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            this.particles.push(new WinParticle(centerX, centerY));
        }
    }
    
    createClickExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new ClickParticle(x, y, color));
        }
    }
    
    createMagicalTrail(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.particles.push(new MagicalParticle(x, y));
            }, i * 100);
        }
    }
    
    addCustomAnimations() {
        // Add pulse animation to score elements
        this.addScorePulse();
        
        // Add floating animation to VS circle
        this.addVSAnimation();
        
        // Add breathing effect to game board
        this.addBoardBreathing();
    }
    
    addScorePulse() {
        const scoreElements = document.querySelectorAll('.score-number');
        scoreElements.forEach(element => {
            element.addEventListener('animationend', (e) => {
                if (e.animationName === 'scoreIncrease') {
                    this.createScoreFireworks(element);
                }
            });
        });
    }
    
    createScoreFireworks(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        for (let i = 0; i < 10; i++) {
            this.particles.push(new FireworkParticle(x, y));
        }
    }
    
    addVSAnimation() {
        const vsCircle = document.querySelector('.vs-circle');
        if (vsCircle) {
            let hue = 0;
            setInterval(() => {
                hue = (hue + 1) % 360;
                vsCircle.style.filter = `hue-rotate(${hue}deg)`;
            }, 50);
        }
    }
    
    addBoardBreathing() {
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.style.animation = 'breathe 4s ease-in-out infinite';
        }
    }
    
    triggerWinSequence(winningCells) {
        winningCells.forEach((cellIndex, i) => {
            setTimeout(() => {
                this.createWinParticles(cellIndex);
            }, i * 200);
        });
        
        // Create screen-wide celebration after all cells are highlighted
        setTimeout(() => {
            this.createWinCelebration();
        }, winningCells.length * 200 + 500);
    }
    
    createWinCelebration() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = -10;
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.particles.push(new CelebrationParticle(x, y, color));
            }, i * 20);
        }
        
        // Add screen flash effect
        this.createScreenFlash();
    }
    
    createScreenFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 1001;
            animation: screenFlash 0.5s ease;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (document.body.contains(flash)) {
                document.body.removeChild(flash);
            }
        }, 500);
    }
    
    addHoverGlow(element, color) {
        element.addEventListener('mouseenter', () => {
            element.style.boxShadow = `0 0 20px ${color}`;
            element.style.transition = 'box-shadow 0.3s ease';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.boxShadow = '';
        });
    }
    
    addClickRipple(element, color) {
        element.addEventListener('click', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: ${color};
                transform: translate(-50%, -50%);
                animation: rippleExpand 0.6s ease-out;
                pointer-events: none;
                z-index: 10;
            `;
            
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);
            
            setTimeout(() => {
                if (element.contains(ripple)) {
                    element.removeChild(ripple);
                }
            }, 600);
        });
    }
}

// Particle Classes
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.decay = 0.01;
        this.size = Math.random() * 3 + 1;
        this.color = '#64ffda';
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1; // gravity
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class WinParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = Math.random() * -5 - 2;
        this.size = Math.random() * 4 + 2;
        this.color = '#4caf50';
        this.decay = 0.015;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ClickParticle extends Particle {
    constructor(x, y, color) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.color = color || '#ff5722';
        this.decay = 0.02;
        this.size = Math.random() * 3 + 1;
    }
}

class MagicalParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * -2 - 1;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.decay = 0.01;
        this.size = Math.random() * 2 + 1;
        this.twinkle = Math.random() * Math.PI * 2;
    }
    
    update() {
        super.update();
        this.twinkle += 0.2;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * (0.5 + 0.5 * Math.sin(this.twinkle));
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FireworkParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = `hsl(${Math.random() * 60 + 40}, 80%, 60%)`; // Gold/yellow range
        this.decay = 0.025;
        this.size = Math.random() * 2 + 1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add trailing effect
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class CelebrationParticle extends Particle {
    constructor(x, y, color) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * 3 + 1;
        this.color = color;
        this.decay = 0.008;
        this.size = Math.random() * 5 + 2;
        this.rotation = 0;
        this.angularVelocity = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        super.update();
        this.rotation += this.angularVelocity;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw as a star shape
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.4;
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Additional CSS animations
const effectsStyle = document.createElement('style');
effectsStyle.textContent = `
    @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    @keyframes rippleExpand {
        0% { width: 0; height: 0; opacity: 0.8; }
        100% { width: 50px; height: 50px; opacity: 0; }
    }
    
    @keyframes screenFlash {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes glowPulse {
        0%, 100% { box-shadow: 0 0 5px currentColor; }
        50% { box-shadow: 0 0 20px currentColor; }
    }
    
    @keyframes floatUpDown {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .magical-glow {
        animation: glowPulse 2s ease-in-out infinite;
    }
    
    .floating {
        animation: floatUpDown 3s ease-in-out infinite;
    }
    
    .cell:hover {
        animation: floatUpDown 0.5s ease-in-out infinite;
    }
    
    .btn:hover {
        animation: glowPulse 1s ease-in-out infinite;
    }
    
    /* Smooth transitions for all interactive elements */
    .cell, .btn, .player-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Enhanced hover effects */
    .cell:hover:not(.x):not(.o) {
        background: linear-gradient(45deg, rgba(100, 255, 218, 0.1), rgba(24, 255, 255, 0.1));
        border-color: rgba(100, 255, 218, 0.6);
    }
    
    .player-card:hover {
        transform: translateY(-2px);
    }
    
    /* Pulse animation for status indicators */
    .status-dot {
        position: relative;
    }
    
    .status-dot::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        background: inherit;
        opacity: 0.3;
        animation: pulse 2s ease-in-out infinite;
    }
    
    /* Loading spinner animation */
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(effectsStyle);

// Initialize effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameEffects = new GameEffects();
    
    // Add enhanced interactions to existing elements
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        window.gameEffects.addHoverGlow(cell, 'rgba(100, 255, 218, 0.5)');
        window.gameEffects.addClickRipple(cell, 'rgba(100, 255, 218, 0.3)');
    });
    
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        window.gameEffects.addHoverGlow(btn, 'rgba(255, 255, 255, 0.3)');
        window.gameEffects.addClickRipple(btn, 'rgba(255, 255, 255, 0.2)');
    });
    
    // Add magical effects to player cards
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => {
        window.gameEffects.addHoverGlow(card, 'rgba(100, 255, 218, 0.3)');
    });
    
    // Enhanced game board interactions
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
        gameBoard.addEventListener('mouseenter', () => {
            gameBoard.classList.add('magical-glow');
        });
        
        gameBoard.addEventListener('mouseleave', () => {
            gameBoard.classList.remove('magical-glow');
        });
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEffects;
}