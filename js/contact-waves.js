/**
 * Contact Animation - "Organic Ocean Flow"
 * A multi-layered sine wave simulation tuned for realism.
 * 
 * update: 3 Waves. Complex organic movement.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('contact-waves-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let time = 0;

    // Configuration for "Realism"
    const config = {
        waveCount: 4, // Added one more wave
        baseSpeed: 0.002,
        colorBase: { r: 99, g: 102, b: 241 }, // Theme Primary (#6366f1)
        colorAccent: { r: 236, g: 72, b: 153 }, // Theme Secondary (#ec4899)
    };

    class Wave {
        constructor(index, total) {
            this.index = index;
            this.total = total;
            this.init();
        }

        init() {
            // Parameters for organic variance
            this.phase = (this.index / this.total) * Math.PI * 2;
            this.amplitude = 95 + (this.index * 20); // Height Increased "a bit"
            this.speed = config.baseSpeed + (this.index * 0.0008);
            this.frequency = 0.0015 + (this.index * 0.0004);
        }

        draw(ctx, width, height, time) {
            ctx.beginPath();

            // Gradient fill
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            const alpha = 0.2 - (this.index * 0.04); // Adjusted alpha for 4 waves

            // Very subtle organic color shift
            const mix = (Math.sin(time * 0.02 + this.index) + 1) * 0.1;

            const r = Math.floor(config.colorBase.r * (1 - mix) + config.colorAccent.r * mix);
            const g = Math.floor(config.colorBase.g * (1 - mix) + config.colorAccent.g * mix);
            const b = Math.floor(config.colorBase.b * (1 - mix) + config.colorAccent.b * mix);

            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(${config.colorBase.r}, ${config.colorBase.g}, ${config.colorBase.b}, ${alpha * 0.7})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha})`);

            ctx.fillStyle = gradient;

            // Wave drawing logic
            const yBase = height * (0.65 + (this.index * 0.07)); // Shifted up slightly to fit 4

            ctx.moveTo(0, height);
            ctx.lineTo(0, yBase);

            // Realistic Water Math
            // Summation of multiple sine waves to mimic ocean swell + chop
            for (let x = 0; x <= width; x += 4) {
                const t = time * this.speed;
                const px = x * this.frequency + this.phase;

                // 1. Main Swell (Long, slow)
                let dy = Math.sin(px + t) * this.amplitude;

                // 2. Secondary Chop (Faster, irregular)
                dy += Math.sin(px * 2.2 + t * 1.5) * (this.amplitude * 0.25);

                // 3. Surface Detail (Small ripples)
                dy += Math.sin(px * 1.5 - t * 0.5) * (this.amplitude * 0.15);

                ctx.lineTo(x, yBase + dy);
            }

            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();
        }
    }

    const waves = [];
    for (let i = 0; i < config.waveCount; i++) {
        waves.push(new Wave(i, config.waveCount));
    }

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 1;

        waves.forEach(wave => wave.draw(ctx, width, height, time));

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);

    // Init
    resize();
    animate();
});
