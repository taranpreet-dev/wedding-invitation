window.addEventListener('load', () => {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const container = document.getElementById('scratch-container');
    
    let isDrawing = false;
    let isRevealed = false;

    function initCanvas() {
        if (isRevealed) return;
        
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        ctx.fillStyle = '#B8860B'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FDFBF7'; 
        ctx.font = '600 18px Lora';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Reveal', canvas.width / 2, canvas.height / 2);
    }

    setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function scratch(e) {
        if (!isDrawing || isRevealed) return;
        if (e.cancelable) { e.preventDefault(); } 
        
        const pos = getCoordinates(e);
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 45, 0, Math.PI * 2); 
        ctx.fill();

        calculateThreshold();
    }

    function calculateThreshold() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparentPixels++;
        }
        
        const totalPixels = pixels.length / 4;
        const percentCleared = (transparentPixels / totalPixels) * 100;
        
        if (percentCleared > 45) { 
            isRevealed = true;
            canvas.classList.add('fade-out');
            
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        }
    }

    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);

    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, {passive: false});
    canvas.addEventListener('touchmove', scratch, {passive: false});
    canvas.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('touchcancel', () => isDrawing = false);
});