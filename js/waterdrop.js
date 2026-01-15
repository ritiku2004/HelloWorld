(function () {
    const canvas = document.getElementById('water-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // "Lake Water" look: Soft, smooth, realistic
    const SCALE = 0.25;
    const DAMPING = 0.96;

    let width, height;
    let buffer1, buffer2, data;
    let isRunning = true;

    // Resize Handler
    function resize() {
        if (canvas.parentElement) {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * SCALE;
            canvas.height = rect.height * SCALE;
            width = canvas.width;
            height = canvas.height;

            const size = width * height;
            buffer1 = new Int16Array(size); // Current state
            buffer2 = new Int16Array(size); // Previous state
            data = ctx.createImageData(width, height);
        }
    }

    function disturb(x, y, force) {
        x = Math.floor(x * SCALE);
        y = Math.floor(y * SCALE);
        if (x < 1 || x >= width - 1 || y < 1 || y >= height - 1) return;

        const radius = 2; // Small disturbance point
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                if (x + i >= 0 && x + i < width && y + j >= 0 && y + j < height) {
                    buffer1[(y + j) * width + (x + i)] += force;
                }
            }
        }
    }

    // Fluid Dynamics Loop (Ripple Tank)
    function processWater() {
        const pixelData = data.data;
        const len = width * height;

        // 1. Physics Pass
        for (let y = 1; y < height - 1; y++) {
            let offset = y * width;
            for (let x = 1; x < width - 1; x++) {
                const i = offset + x;

                // Classic Wave Equation
                let val = (
                    buffer1[i - 1] +
                    buffer1[i + 1] +
                    buffer1[i - width] +
                    buffer1[i + width]
                ) >> 1;

                val -= buffer2[i];
                val -= (val >> 5); // Damping ~0.96

                buffer2[i] = val;
            }
        }

        // 2. Rendering Pass ("Liquid Glass")
        for (let y = 0; y < height; y++) {
            let offset = y * width;
            for (let x = 0; x < width; x++) {
                const i = offset + x;
                let val = buffer2[i];

                // Calculate Slope
                let xOffset = x < width - 1 ? buffer2[i + 1] - val : 0;
                let yOffset = y < height - 1 ? buffer2[i + width] - val : 0;

                // Shading
                let shade = xOffset;
                // Shade drives highlight/shadow
                // Light comes from top-left logic usually

                const idx = i * 4;

                // "Lake" coloring: clear with cyan/white highlights
                // Base intensity is proportional to surface angle
                let intensity = Math.abs(shade);

                if (intensity < 1) {
                    pixelData[idx + 3] = 0; // Clear
                } else {
                    // Highlights are white/cyan
                    // Shadows are clearer
                    let c = 200 + intensity * 2;
                    if (c > 255) c = 255;

                    pixelData[idx] = c * 0.8; // R (Cyan-ish)
                    pixelData[idx + 1] = c;   // G
                    pixelData[idx + 2] = 255; // B (Blue bias)

                    // Boost visibility: Higher multiplier, higher cap
                    let a = intensity * 8;
                    if (a > 220) a = 220;

                    // Smooth Start/End Fade (Edge Blending)
                    // Fades top 15% and bottom 15%
                    let fade = 1.0;
                    const fadeZone = height * 0.15;
                    if (y < fadeZone) {
                        fade = y / fadeZone;
                    } else if (y > height - fadeZone) {
                        fade = (height - y) / fadeZone;
                    }

                    pixelData[idx + 3] = a * fade;
                }
            }
        }

        ctx.putImageData(data, 0, 0);

        // Swap buffers
        let temp = buffer1;
        buffer1 = buffer2;
        buffer2 = temp;
    }

    function loop() {
        if (!isRunning) return;

        // Automatic "Border Waves" (Tide effect)
        // Only disturbs the edges, no random rain in middle
        if (Math.random() < 0.05) { // Occasional pulses
            const side = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
            let tx, ty;

            // Pick a random point on the chosen border
            switch (side) {
                case 0: // Top
                    tx = Math.random() * width;
                    ty = 1;
                    break;
                case 1: // Right
                    tx = width - 2;
                    ty = Math.random() * height;
                    break;
                case 2: // Bottom
                    tx = Math.random() * width;
                    ty = height - 2;
                    break;
                case 3: // Left
                    tx = 1;
                    ty = Math.random() * height;
                    break;
            }

            // Larger disturbance for border waves to travel far
            // Note: disturb() expects scaled coordinates if we were passing mouse, 
            // but here we are working with internal buffer coordinates?
            // Wait, disturb() takes CSS pixels and scales them inside.
            // We need to pass CSS pixels to disturb().

            // Inverse scale for input
            disturb(tx / SCALE, ty / SCALE, Math.random() * 400 + 400);
        }

        processWater();
        requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    loop();

    // Mouse Interaction
    const wrapper = document.getElementById('water-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            // Lower sensitivity: Reduced force from 250 to 100
            disturb(e.clientX - rect.left, e.clientY - rect.top, 100);
        });

        wrapper.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            disturb(e.clientX - rect.left, e.clientY - rect.top, 3000);
        });
    }

})();
