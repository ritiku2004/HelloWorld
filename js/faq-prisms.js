/**
 * FAQ Animation - "Knowledge Rain" (Uniform)
 * Icons bubbling up from deep Z-space.
 * 
 * update: Uniform distribution (removed border bias). Increased quantity.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('faq-prisms-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Configuration
    const config = {
        symbol: '?',
        count: 25,        // Increased from 15 to 25
        speed: 1.0,
        depth: 2000,
        baseFontSize: 40,
        colors: [
            'rgba(99, 102, 241, 0.8)',  // Primary 
            'rgba(236, 72, 153, 0.8)',  // Secondary 
            'rgba(255, 255, 255, 0.6)'  // White
        ]
    };

    class Particle {
        constructor(isInitial = false) {
            this.init(isInitial);
        }

        init(isInitial) {
            this.z = isInitial ? Math.random() * config.depth : config.depth;

            // ORIGIN LOGIC: UNIFORM
            // Removed border bias. Randomly distributed across the whole screen.
            this.x = (Math.random() - 0.5) * width;
            this.y = (Math.random() - 0.5) * height;

            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.008;

            this.color = config.colors[Math.floor(Math.random() * config.colors.length)];

            this.zSpeed = config.speed + Math.random() * 0.5;
        }

        update() {
            this.z -= this.zSpeed;
            this.rotation += this.rotationSpeed;
            this.y -= 0.1;

            if (this.z <= 200) {
                this.init(false);
            }
        }

        draw() {
            // Straight Z Perspective
            const focalLength = 1000;
            const scale = focalLength / Math.max(1, this.z);

            const px = this.x + width / 2;
            const py = this.y + height / 2;

            // SMOOTH ALPHA CURVE
            let alpha = 0;
            if (this.z > 1500) {
                alpha = (config.depth - this.z) / 500;
            } else if (this.z > 600) {
                alpha = 1;
            } else {
                alpha = (this.z - 200) / 400;
            }

            if (alpha <= 0) return;

            ctx.save();
            ctx.translate(px, py);
            ctx.scale(scale, scale);
            ctx.rotate(this.rotation);

            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw
            ctx.font = `600 ${config.baseFontSize}px "Plus Jakarta Sans", sans-serif`;

            // Subtle Glow
            if (scale > 0.8) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
            }

            ctx.fillText(config.symbol, 0, 0);

            ctx.restore();
        }
    }

    const particles = [];

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);

        if (!width) resize();

        for (let i = 0; i < config.count; i++) {
            particles.push(new Particle(true));
        }

        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.sort((a, b) => b.z - a.z);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    init();
});
