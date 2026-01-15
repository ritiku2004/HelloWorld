/**
 * Prism Footer Animation - "Liquid Chromatism"
 * A mesmerizing, fluid mesh of slowly drifting color orbs 
 * that creates a high-end, living gradient background.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('footer-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Configuration for the "Plasma Orbs"
    // Vibrant, high-contrast colors, moving FAST
    const orbs = [
        { x: 0, y: 0, r: 0, vx: 1.8, vy: 1.2, color: 'rgba(99, 102, 241, 0.6)' },  // Deep Indigo
        { x: 0, y: 0, r: 0, vx: -2.0, vy: 1.5, color: 'rgba(236, 72, 153, 0.5)' }, // Hot Pink
        { x: 0, y: 0, r: 0, vx: 1.5, vy: -2.2, color: 'rgba(45, 212, 191, 0.5)' }, // Bright Teal
        { x: 0, y: 0, r: 0, vx: -1.2, vy: -1.2, color: 'rgba(129, 140, 248, 0.55)' } // Electric Blue
    ];

    function init() {
        resize();
        window.addEventListener('resize', resize);

        // Randomize start positions
        orbs.forEach(orb => {
            orb.x = Math.random() * width;
            orb.y = Math.random() * height;
            // Radius relative to canvas size for scalability
            orb.r = Math.min(width, height) * 0.5 + Math.random() * 100;
        });

        animate();
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);

        width = rect.width;
        height = rect.height;

        // Update orb sizes on resize
        orbs.forEach(orb => {
            orb.r = Math.min(width, height) * 0.6;
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Use a composite operation for smooth blending (optional, but 'screen' or 'lighter' can be nice)
        // Default 'source-over' with alpha transparency actually works best for "watery" mixing here

        orbs.forEach(orb => {
            // Move
            orb.x += orb.vx;
            orb.y += orb.vy;

            // Bounce gently off edges (with buffer)
            const buffer = orb.r * 0.5;
            if (orb.x < -buffer || orb.x > width + buffer) orb.vx *= -1;
            if (orb.y < -buffer || orb.y > height + buffer) orb.vy *= -1;

            // Draw Gradient Orb
            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade to transparent

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    init();
});
