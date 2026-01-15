/**
 * Nebula Art Animation
 * A "God Level" interactive overlay that paints living, glowing smoke
 * across the screen, following the user's essence.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('nebula-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let hue = 0;

    // Mouse state
    const mouse = { x: undefined, y: undefined };
    let isMoving = false;
    let stopTimeout;

    // Configuration
    const config = {
        particleLife: 100,
        particleSize: 8,
        spawnRate: 4, // Particles per frame when moving
        glow: 15,
        drag: 0.95
    };

    class Particle {
        constructor() {
            this.x = mouse.x;
            this.y = mouse.y;
            // Add some randomness to initial velocity
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;

            this.size = Math.random() * config.particleSize + 2;
            // Dynamic color cycling
            this.hue = hue % 360;
            this.life = config.particleLife;
            this.maxLife = config.particleLife;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Friction
            this.vx *= config.drag;
            this.vy *= config.drag;

            // Natural turbulence
            this.vx += Math.sin(this.life * 0.1) * 0.1;
            this.vy += Math.cos(this.life * 0.1) * 0.1;

            this.life--;
            this.size *= 0.97; // Shrink over time
        }

        draw() {
            ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.life / this.maxLife})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        animate();
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        isMoving = true;

        // Rapid spawn calculation
        for (let i = 0; i < config.spawnRate; i++) {
            particles.push(new Particle());
        }

        clearTimeout(stopTimeout);
        stopTimeout = setTimeout(() => isMoving = false, 100);
    }

    function handleTouchMove(e) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        for (let i = 0; i < config.spawnRate; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        // Trail effect: clear with slight opacity to leave trails
        // Actually, for "smoke", full clear is cleaner if we rely on particle density
        ctx.clearRect(0, 0, width, height);

        // Global Hue Cycle
        hue += 2;

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].life <= 0 || particles[i].size <= 0.2) {
                particles.splice(i, 1);
                i--;
            }
        }

        // Connect particles if close (Nebula structure)
        connectParticles();

        requestAnimationFrame(animate);
    }

    // The "God Level" Sauce: connecting nearby smoke particles
    function connectParticles() {
        // Only connect a subset to save performance
        for (let i = 0; i < particles.length; i++) {
            // Only particles that are relatively new/large
            if (particles[i].life < 50) continue;

            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 80) {
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(${particles[i].hue}, 100%, 50%, 0.15)`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    init();
});
