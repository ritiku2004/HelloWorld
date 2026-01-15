/**
 * FAQ Animation - "Prismatic Mist"
 * A soft, wave-based fog animation that uses the brand's gradient colors
 * to create a 'holographic aurora' effect behind the content.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('contact-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let time = 0;

    // Theme Colors
    const colors = [
        { r: 99, g: 102, b: 241 }, // Indigo
        { r: 236, g: 72, b: 153 }, // Pink
        { r: 45, g: 212, b: 191 }  // Teal
    ];

    function init() {
        resize();
        window.addEventListener('resize', resize);
        animate();
    }

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        // Low res for "foggy" look + performance
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
    }

    function drawWave(yOffset, frequency, amplitude, speed, colorIndex) {
        ctx.beginPath();
        const c = colors[colorIndex];

        ctx.moveTo(0, height);

        // Draw the wave shape
        for (let x = 0; x <= width; x += 10) {
            // Complex wave: Main sine + secondary harmonic
            const wave1 = Math.sin(x * frequency + time * speed);
            const wave2 = Math.sin(x * frequency * 2 + time * speed * 1.5);

            const y = height - (yOffset + (wave1 + wave2) * amplitude);
            ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Fill background slightly to prove visibility
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, width, height);

        // Gradient Transparency: Fade out towards the bottom
        // so waves blend into each other
        const gradient = ctx.createLinearGradient(0, height - yOffset - 200, 0, height);
        gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.1)`);

        ctx.fillStyle = gradient;
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 0.015; // Faster

        // Draw multiple layers of "Mist"
        // Layer 1: Top (Indigo)
        drawWave(height * 0.8, 0.001, 60, 0.5, 0);

        // Layer 2: Middle (Pink)
        drawWave(height * 0.6, 0.002, 50, 0.7, 1);

        // Layer 3: Bottom (Teal)
        drawWave(height * 0.4, 0.003, 40, 0.9, 2);

        // Blur effect for "Fog" feel
        // We can check if filter is supported for performance, but basic blur is okay on modern styling
        // Actually, canvas filter is heavy. Let's rely on the soft gradient and CSS backdrop-filter if needed.

        requestAnimationFrame(animate);
    }

    init();
});
