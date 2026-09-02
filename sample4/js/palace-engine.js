document.addEventListener("DOMContentLoaded", function() {
    const enterBtn = document.getElementById('enter-courtyard');
    const gateOverlay = document.getElementById('toran-gate');
    const bgMusic = document.getElementById('bg-music');

    enterBtn.addEventListener('click', function() {
        if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }

        gateOverlay.style.transform = 'translateY(-100%)';
        
        setTimeout(() => {
            gateOverlay.style.display = 'none';
        }, 1500);

        bgMusic.volume = 0.4;
        bgMusic.play().catch(error => {
            console.warn("Audio protocol overridden by browser restrictions. User must manually enable sound.", error);
        });
    });
});