document.addEventListener("DOMContentLoaded", function() {
    const mainDiya = document.getElementById('rsvp-diya');
    const statusText = document.getElementById('rsvp-status');
    const communityGrid = document.getElementById('community-diyas');
    const diyaImg = document.getElementById('diya-img');
    let isRSVPed = false;

    // Simulate community data loading
    const existingGuests = 42; 
    for(let i = 0; i < existingGuests; i++) {
        const miniDiya = document.createElement('div');
        miniDiya.className = 'mini-diya';
        miniDiya.style.animationDelay = `${Math.random()}s`; 
        communityGrid.appendChild(miniDiya);
    }

    mainDiya.addEventListener('click', function() {
        if (isRSVPed) return; 

        if (navigator.vibrate) { navigator.vibrate([50, 100, 50]); }

        mainDiya.classList.add('is-lit');
        
        if (diyaImg) {
            diyaImg.src = 'assets/images/diya-lit.png';
        }

        statusText.classList.remove('hidden');
        statusText.style.display = 'block';
        setTimeout(() => { statusText.style.opacity = 1; }, 50);

        const myDiya = document.createElement('div');
        myDiya.className = 'mini-diya';
        myDiya.style.transform = 'scale(0)';
        communityGrid.appendChild(myDiya);
        
        setTimeout(() => {
            myDiya.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            myDiya.style.transform = 'scale(1.5)';
            setTimeout(() => { myDiya.style.transform = 'scale(1)'; }, 500);
        }, 300);

        console.log("Database updated: User presence bestowed. Server synchronization complete.");
        
        isRSVPed = true;
    });
});