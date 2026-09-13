/* ============================================================
   WEDDING INVITATION SCRIPT
============================================================ */


/* ============================================================
   ELEMENTS
============================================================ */

const music =
    document.getElementById("bgMusic");

const musicBtn =
    document.getElementById("musicToggleBtn");

let isPlaying = false;


/* ============================================================
   OPEN INVITATION
============================================================ */

function openInvitation() {

    const overlay =
        document.getElementById(
            "welcomeOverlay"
        );

    if (!overlay) return;


    overlay.classList.add(
        "slide-up"
    );


    setTimeout(() => {

        const hero =
            document.querySelector(
                ".hero-section"
            );

        if (hero) {

            hero.classList.add(
                "active"
            );

        }

    }, 850);


    createHeroParticles();


    if (music) {

        music.play()
            .then(() => {

                isPlaying = true;

                if (musicBtn) {

                    musicBtn.innerHTML =
                        "🔊";

                }

            })
            .catch(() => {

                console.log(
                    "Music requires user interaction."
                );

            });

    }

}


/* ============================================================
   MUSIC
============================================================ */

function toggleMusic() {

    if (!music) return;


    if (isPlaying) {

        music.pause();

        isPlaying = false;

        if (musicBtn) {

            musicBtn.innerHTML =
                "🔇";

        }

    } else {

        music.play()
            .then(() => {

                isPlaying = true;

                if (musicBtn) {

                    musicBtn.innerHTML =
                        "🔊";

                }

            })
            .catch(() => {});

    }

}


/* ============================================================
   HERO PARTICLES
============================================================ */

function createHeroParticles() {

    const container =
        document.getElementById(
            "heroParticles"
        );

    if (!container) return;


    container.innerHTML = "";


    for (
        let i = 0;
        i < 32;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "hero-particle";


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.top =
            `${25 + Math.random() * 70}%`;


        particle.style.setProperty(
            "--duration",
            `${4 + Math.random() * 6}s`
        );


        particle.style.animationDelay =
            `${Math.random() * 5}s`;


        const size =
            2 + Math.random() * 3;


        particle.style.width =
            `${size}px`;


        particle.style.height =
            `${size}px`;


        container.appendChild(
            particle
        );

    }

}


/* ============================================================
   COUNTDOWN
============================================================ */

function updateCountdown() {

    /*
       25 November 2026
       10:30 AM IST

       +05:30 explicitly keeps the
       wedding time tied to India.
    */

    const target =
        new Date(
            "2026-11-25T10:30:00+05:30"
        ).getTime();


    const now =
        Date.now();


    const difference =
        Math.max(
            0,
            target - now
        );


    const days =
        Math.floor(
            difference /
            86400000
        );


    const hours =
        Math.floor(
            (
                difference %
                86400000
            ) /
            3600000
        );


    const minutes =
        Math.floor(
            (
                difference %
                3600000
            ) /
            60000
        );


    const seconds =
        Math.floor(
            (
                difference %
                60000
            ) /
            1000
        );


    const daysEl =
        document.getElementById(
            "days"
        );

    const hoursEl =
        document.getElementById(
            "hours"
        );

    const minsEl =
        document.getElementById(
            "mins"
        );

    const secsEl =
        document.getElementById(
            "secs"
        );


    if (
        !daysEl ||
        !hoursEl ||
        !minsEl ||
        !secsEl
    ) return;


    daysEl.textContent =
        String(days)
        .padStart(2, "0");


    hoursEl.textContent =
        String(hours)
        .padStart(2, "0");


    minsEl.textContent =
        String(minutes)
        .padStart(2, "0");


    secsEl.textContent =
        String(seconds)
        .padStart(2, "0");

}


updateCountdown();


setInterval(
    updateCountdown,
    1000
);


/* ============================================================
   STARTING PETALS
============================================================ */

function initStartingPetals() {

    const container =
        document.getElementById(
            "petalsContainer"
        );

    if (!container) return;


    for (
        let i = 0;
        i < 15;
        i++
    ) {

        createPetal(
            container,
            true
        );

    }


    setInterval(() => {

        const overlay =
            document.getElementById(
                "welcomeOverlay"
            );


        if (
            overlay &&
            !overlay.classList.contains(
                "slide-up"
            )
        ) {

            createPetal(
                container,
                false
            );

        }

    }, 450);

}


/* ============================================================
   CREATE PETAL
============================================================ */

function createPetal(
    container,
    initial
) {

    const petal =
        document.createElement(
            "div"
        );


    petal.className =
        "rose-petal";


    const image =
        Math.random() > .5
            ? "assets/decoration/dec1.png"
            : "assets/decoration/dec2.png";


    const size =
        16 +
        Math.random() * 20;


    petal.style.width =
        `${size}px`;


    petal.style.height =
        `${size}px`;


    petal.style.left =
        `${Math.random() * 100}%`;


    petal.style.backgroundImage =
        `url("${image}")`;


    petal.style.setProperty(
        "--fall-time",
        `${5 + Math.random() * 5}s`
    );


    if (initial) {

        petal.style.top =
            `${Math.random() * 100}%`;

    }


    container.appendChild(
        petal
    );


    setTimeout(() => {

        petal.remove();

    }, 10000);

}


/* ============================================================
   INTERACTIVE PETAL SHOWER
============================================================ */

function triggerInteractivePetalShower() {

    const container =
        document.getElementById(
            "globalPetalsContainer"
        );


    if (!container) return;


    for (
        let i = 0;
        i < 55;
        i++
    ) {

        setTimeout(() => {

            const petal =
                document.createElement(
                    "div"
                );


            petal.className =
                "rose-petal";


            const image =
                Math.random() > .5
                    ? "assets/decoration/dec1.png"
                    : "assets/decoration/dec2.png";


            const size =
                15 +
                Math.random() * 25;


            petal.style.width =
                `${size}px`;


            petal.style.height =
                `${size}px`;


            petal.style.left =
                `${Math.random() * 100}%`;


            petal.style.backgroundImage =
                `url("${image}")`;


            petal.style.setProperty(
                "--fall-time",
                `${2.5 + Math.random() * 2}s`
            );


            container.appendChild(
                petal
            );


            setTimeout(() => {

                petal.remove();

            }, 5500);

        }, i * 45);

    }

}


/* ============================================================
   WHATSAPP WISHES
============================================================ */

function sendWishOnWhatsApp() {

    const name =
        document
            .getElementById(
                "wishSender"
            )
            .value
            .trim();


    const message =
        document
            .getElementById(
                "wishMessage"
            )
            .value
            .trim();


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;

    }


    if (!message) {

        alert(
            "Please write your wishes."
        );

        return;

    }


    /*
       Replace this with the
       family's actual WhatsApp number.

       Example:
       919876543210
    */

    const familyWhatsAppNumber =
        "919999999999";


    const whatsappMessage =
        `Wedding Wishes for Jaspreet & Manjeet\n\n` +
        `From: ${name}\n\n` +
        `${message}\n\n` +
        `Wishing the families a beautiful and joyous celebration. 🙏✨`;


    const url =
        `https://wa.me/${familyWhatsAppNumber}` +
        `?text=${encodeURIComponent(
            whatsappMessage
        )}`;


    window.open(
        url,
        "_blank"
    );

}


/* ============================================================
   RSVP
============================================================ */

function handleRSVP(event) {

    event.preventDefault();


    const name =
        document
            .getElementById(
                "guestName"
            )
            .value
            .trim();


    const attendance =
        document
            .getElementById(
                "guestAttendance"
            )
            .value;


    if (!name || !attendance) {

        return;

    }


    const familyWhatsAppNumber =
        "919999999999";


    const message =
        `Wedding RSVP — Jaspreet & Manjeet\n\n` +
        `Guest Name: ${name}\n` +
        `Response: ${attendance}\n\n` +
        `Wedding Date: 25 November 2026\n` +
        `Venue: The Grand Palace, Patiala`;


    const url =
        `https://wa.me/${familyWhatsAppNumber}` +
        `?text=${encodeURIComponent(
            message
        )}`;


    window.open(
        url,
        "_blank"
    );


    document.getElementById(
        "rsvpForm"
    ).style.display =
        "none";


    document.getElementById(
        "rsvpSuccessMsg"
    ).style.display =
        "block";

}


/* ============================================================
   VENUE MAP
============================================================ */

function openVenueMap() {

    const venue =
        encodeURIComponent(
            "The Grand Palace Patiala Punjab"
        );


    const url =
        `https://www.google.com/maps/search/?api=1&query=${venue}`;


    window.open(
        url,
        "_blank"
    );

}


/* ============================================================
   CLICK SPARKLES
============================================================ */

document.addEventListener(
    "click",
    function(event) {

        createClickSparkles(
            event.clientX,
            event.clientY
        );

    }
);


/* ============================================================
   TOUCH SPARKLES
============================================================ */

document.addEventListener(
    "touchstart",
    function(event) {

        const touch =
            event.touches[0];


        if (!touch) return;


        createClickSparkles(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: true
    }
);


/* ============================================================
   SPARKLE CREATOR
============================================================ */

function createClickSparkles(
    x,
    y
) {

    const container =
        document.querySelector(
            ".mobile-container"
        );


    if (!container) return;


    const rect =
        container.getBoundingClientRect();


    for (
        let i = 0;
        i < 9;
        i++
    ) {

        const sparkle =
            document.createElement(
                "span"
            );


        sparkle.className =
            "sparkle-particle";


        sparkle.style.left =
            `${x - rect.left}px`;


        sparkle.style.top =
            `${y - rect.top}px`;


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            20 +
            Math.random() * 55;


        sparkle.style.setProperty(
            "--dx",
            `${Math.cos(angle) * distance}px`
        );


        sparkle.style.setProperty(
            "--dy",
            `${Math.sin(angle) * distance}px`
        );


        container.appendChild(
            sparkle
        );


        setTimeout(() => {

            sparkle.remove();

        }, 800);

    }

}


/* ============================================================
   INITIALIZE
============================================================ */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        initStartingPetals();

    }
);