class TypingCanvas {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.toggleBtn = document.getElementById('toggleCanvasBtn');
        this.isActive = false;
        this.particles = [];
        this.maxParticles = 50;
        this.colors = ['#4f46e5', '#818cf8', '#22c55e', '#ef4444', '#f59e0b'];
        
        this.resizeCanvas();
        this.bindEvents();
        
        // Expose the instance to the global scope for main program access
        window.typingCanvas = this;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.toggleBtn.addEventListener('click', () => this.toggleCanvas());
        
        // Listen for typing events, adding a particle each time a key is pressed
        document.getElementById('inputText').addEventListener('input', (e) => {
            if (this.isActive && e.data) {
                this.addParticle(e.inputType === 'insertText');
            }
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    toggleCanvas() {
        this.isActive = !this.isActive;
        this.canvas.style.display = this.isActive ? 'block' : 'none';
        
        if (this.isActive) {
            this.animate();
            this.toggleBtn.classList.remove('btn-outline-primary');
            this.toggleBtn.classList.add('btn-primary');
        } else {
            this.toggleBtn.classList.remove('btn-primary');
            this.toggleBtn.classList.add('btn-outline-primary');
        }
    }
    
    addParticle(isCorrect = true) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift(); // Remove the oldest particle
        }
        
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const size = Math.random() * 5 + 2;
        const color = isCorrect ? 
            this.colors[Math.floor(Math.random() * 3)] : 
            this.colors[3]; // Use red for errors
        const speedX = (Math.random() - 0.5) * 2;
        const speedY = (Math.random() - 0.5) * 2;
        
        this.particles.push({
            x, y, size, color, speedX, speedY,
            life: 100,
            opacity: 1
        });
    }
    
    drawParticles() {
        this.particles.forEach((p, index) => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
            this.ctx.fill();
            
            // Update particle position
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= 1;
            p.opacity = p.life / 100;
            
            // Remove particles that have reached the end of their life
            if (p.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    drawTypingWave() {
        const time = Date.now() * 0.001;
        const amplitude = 20;
        const frequency = 0.01;
        const waveWidth = this.canvas.width;
        const waveHeight = 100;
        const startY = this.canvas.height / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, startY);
        
        for (let x = 0; x < waveWidth; x++) {
            const y = Math.sin(x * frequency + time) * amplitude + startY;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.strokeStyle = 'rgba(79, 70, 229, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.clearCanvas();
        this.drawTypingWave();
        this.drawParticles();
        
        requestAnimationFrame(() => this.animate());
    }
    
    // Add some initial particles
    addInitialParticles(count = 10) {
        for (let i = 0; i < count; i++) {
            this.addParticle();
        }
    }
}

// Initialize Canvas
document.addEventListener('DOMContentLoaded', () => {
    const typingCanvas = new TypingCanvas();
    
    // Add a small tip to inform users about the Canvas feature
    setTimeout(() => {
        Swal.fire({
            title: 'New Feature Tip',
            text: 'You can now click the "Toggle Background" button to enable dynamic background effects!',
            icon: 'info',
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
        });
    }, 3000);
}); 