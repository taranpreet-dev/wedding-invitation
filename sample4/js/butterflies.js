document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector('.palace-container');
    if (!container) return;

    const butterflyCount = 6; 

    for (let i = 0; i < butterflyCount; i++) {
        const bf = document.createElement('div');
        bf.className = 'butterfly-emoji';
        bf.innerHTML = '🦋';
        
        const randomTop = Math.random() * 85; 
        const randomLeft = Math.random() * 85;
        bf.style.top = `${randomTop}%`;
        bf.style.left = `${randomLeft}%`;
        
        bf.style.animationDelay = `${Math.random() * -10}s`;

        container.appendChild(bf);

        const triggerFlee = (e) => {
            e.preventDefault();
            
            const fleeX = (Math.random() - 0.5) * 450; 
            const fleeY = -350 - (Math.random() * 200);   
            
            bf.style.setProperty('--flee-x', `${fleeX}px`);
            bf.style.setProperty('--flee-y', `${fleeY}px`);
            
            bf.classList.add('flee');

            if (navigator.vibrate) { navigator.vibrate(15); }

            setTimeout(() => {
                bf.classList.remove('flee');
                bf.style.top = `${Math.random() * 80}%`;
                bf.style.left = `${Math.random() * 80}%`;
            }, 1200);
        };

        bf.addEventListener('touchstart', triggerFlee, {passive: false});
        bf.addEventListener('click', triggerFlee);
    }
});