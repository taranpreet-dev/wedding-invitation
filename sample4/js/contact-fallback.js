document.addEventListener("DOMContentLoaded", function() {
    // Bride's contact fallback checker
    const brideLink = document.querySelector('.bride-contact-link');
    const fallbackNotice = document.querySelector('.fallback-notice');
    
    if (brideLink) {
        const phoneNumber = brideLink.getAttribute('href').replace('tel:', '').trim();
        // If number is missing, blank, or set to a placeholder, hide the button and show a graceful notice
        if (!phoneNumber || phoneNumber === "" || phoneNumber.includes("UPDATING")) {
            brideLink.style.display = 'none';
            if (fallbackNotice) {
                fallbackNotice.classList.remove('hidden');
            }
        }
    }
});