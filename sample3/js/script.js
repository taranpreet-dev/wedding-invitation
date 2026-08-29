(() => {
  "use strict";

  /* =========================================================
     WEDDING INVITATION — MAIN JAVASCRIPT
     ========================================================= */

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector)
  ];

  const state = {
    musicPlaying: false,
    eggTaps: 0
  };

  /* =========================================================
     WEDDING DATA
     The actual editable wedding information is in:
     js/data.js
     ========================================================= */

  const wedding = window.weddingData || {
    couple: {
      groom: "Groom",
      bride: "Bride",
      groomFullName: "Groom",
      brideFullName: "Bride"
    },

    invitation: {
      heading: "You are cordially invited",
      message: "Join us as we celebrate love and togetherness."
    },

    date: {
      weddingDate: "2026-12-12T11:00:00",
      displayDate: "12 December 2026",
      weddingTime: "11:00 AM onwards"
    },

    venue: {
      name: "Wedding Venue",
      address: "Your Venue Address",
      mapUrl: "https://maps.google.com/",
      phone: ""
    },

    events: [],

    family: {
      groomParents: ["Father Name", "Mother Name"],
      brideParents: ["Father Name", "Mother Name"]
    },

    contact: {
      phone: "",
      whatsapp: ""
    },

    music: {
      enabled: true,
      file: "assets/music/wedding-music.mp3",
      volume: 0.75
    },

    gallery: [
      "assets/images/couple/together.jpg"
    ],

    theme: {
      primaryColor: "#6e2334",
      secondaryColor: "#b8894b",
      accentColor: "#8e5d3f",
      backgroundColor: "#fbf7ef"
    }
  };


  /* =========================================================
     THEME
     ========================================================= */

  function applyTheme() {
    const root = document.documentElement;

    if (!wedding.theme) return;

    root.style.setProperty(
      "--wine",
      wedding.theme.primaryColor || "#6e2334"
    );

    root.style.setProperty(
      "--gold",
      wedding.theme.secondaryColor || "#b8894b"
    );

    root.style.setProperty(
      "--accent",
      wedding.theme.accentColor || "#8e5d3f"
    );

    root.style.setProperty(
      "--cream",
      wedding.theme.backgroundColor || "#fbf7ef"
    );
  }


  /* =========================================================
     DATA BINDING
     ========================================================= */

  function bindData() {
    const d = wedding;

    $$("[data-bind]").forEach((element) => {
      const key = element.dataset.bind;

      const values = {
        bride: d.couple?.bride || "",
        groom: d.couple?.groom || "",

        initials:
          `${(d.couple?.bride || "").charAt(0)}${(d.couple?.groom || "").charAt(0)}`,

        invitationHeading:
          d.invitation?.heading || "",

        invitationMessage:
          d.invitation?.message || "",

        displayDate:
          d.date?.displayDate || "",

        weddingTime:
          d.date?.weddingTime || "",

        venueName:
          d.venue?.name || "",

        venueAddress:
          d.venue?.address || ""
      };

      if (values[key] !== undefined) {
        element.textContent = values[key];
      }
    });

    const groomParents = $("#groomParents");

    if (groomParents) {
      groomParents.textContent =
        Array.isArray(d.family?.groomParents)
          ? d.family.groomParents.join(" & ")
          : "";
    }

    const brideParents = $("#brideParents");

    if (brideParents) {
      brideParents.textContent =
        Array.isArray(d.family?.brideParents)
          ? d.family.brideParents.join(" & ")
          : "";
    }
  }


  /* =========================================================
     EVENTS
     ========================================================= */

  function setupEvents() {
    const list = $("#eventsList");

    if (!list) return;

    const events = Array.isArray(wedding.events)
      ? wedding.events
      : [];

    if (!events.length) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = events
      .map((event, index) => {

        const icon =
          index === 0
            ? "❦"
            : index === 1
              ? "♫"
              : "✦";

        return `
          <article class="event-card reveal">

            <div class="event-card__icon">
              ${icon}
            </div>

            <p class="eyebrow">
              EVENT ${String(index + 1).padStart(2, "0")}
            </p>

            <h3>
              ${escapeHtml(event.name || "")}
            </h3>

            <strong>
              ${escapeHtml(event.displayDate || "")}
            </strong>

            <p>
              ${escapeHtml(event.time || "")}
              ${event.venue ? " · " + escapeHtml(event.venue) : ""}
            </p>

            <p class="muted">
              ${escapeHtml(event.description || "")}
            </p>

            <div class="button-row">

              <a
                class="btn btn--outline btn--small"
                href="${safeUrl(event.mapUrl || wedding.venue.mapUrl)}"
                target="_blank"
                rel="noopener"
              >
                ⌖ Directions
              </a>

              <button
                class="btn btn--gold btn--small calendar-event"
                type="button"
                data-event-index="${index}"
              >
                ▣ Calendar
              </button>

            </div>

          </article>
        `;
      })
      .join("");

    $$(".calendar-event").forEach((button) => {

      button.addEventListener("click", () => {

        const index =
          Number(button.dataset.eventIndex);

        const event = events[index];

        if (event) {
          downloadICS(event);
        }

      });

    });
  }


  /* =========================================================
     REAL SCRATCH CARD
     Mouse + Touch + Stylus
     ========================================================= */

  function setupScratchCard() {

    const card = $("#scratchCard");
    const canvas = $("#scratchCanvas");
    const image = $("#scratchImage");
    const hint = $("#scratchHint");
    const complete = $("#scratchComplete");
    const reset = $("#scratchReset");

    if (
      !card ||
      !canvas ||
      !image ||
      !hint ||
      !complete ||
      !reset
    ) {
      return;
    }

    const ctx =
      canvas.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );

    if (!ctx) {
      console.error("Scratch canvas is not supported.");
      return;
    }

    let drawing = false;
    let revealed = false;
    let lastPoint = null;
    let revealCheckPending = false;


    /* ---------------------------------------------------------
       CANVAS SIZE
       --------------------------------------------------------- */

    function resizeCanvas() {

      const rect =
        card.getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return;
      }

      const dpr =
        Math.min(
          window.devicePixelRatio || 1,
          2
        );

      canvas.width =
        Math.round(rect.width * dpr);

      canvas.height =
        Math.round(rect.height * dpr);

      canvas.style.width =
        `${rect.width}px`;

      canvas.style.height =
        `${rect.height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      if (!revealed) {
        paintScratchSurface(
          rect.width,
          rect.height
        );
      }
    }


    /* ---------------------------------------------------------
       PAINT GOLDEN SCRATCH SURFACE
       --------------------------------------------------------- */

    function paintScratchSurface(
      width,
      height
    ) {

      ctx.globalCompositeOperation =
        "source-over";

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          width,
          height
        );

      gradient.addColorStop(
        0,
        "#b77731"
      );

      gradient.addColorStop(
        0.18,
        "#e0b866"
      );

      gradient.addColorStop(
        0.38,
        "#c99142"
      );

      gradient.addColorStop(
        0.55,
        "#e7c47b"
      );

      gradient.addColorStop(
        0.75,
        "#b77b35"
      );

      gradient.addColorStop(
        1,
        "#9f612c"
      );

      ctx.fillStyle = gradient;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      /* -------------------------------------------------------
         TEXTURE
         ------------------------------------------------------- */

      ctx.globalAlpha = 0.18;

      const textureCount =
        Math.min(
          2500,
          Math.floor(
            width * height / 230
          )
        );

      for (
        let i = 0;
        i < textureCount;
        i++
      ) {

        const x =
          Math.random() * width;

        const y =
          Math.random() * height;

        const radius =
          0.3 + Math.random() * 1.2;

        ctx.fillStyle =
          i % 2 === 0
            ? "#fff1c9"
            : "#613719";

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }


      /* -------------------------------------------------------
         DIAGONAL PAPER FIBERS
         ------------------------------------------------------- */

      ctx.globalAlpha = 0.09;

      ctx.strokeStyle =
        "#fff2d1";

      ctx.lineWidth = 1;

      for (
        let x = -height;
        x < width + height;
        x += 18
      ) {

        ctx.beginPath();

        ctx.moveTo(
          x,
          0
        );

        ctx.lineTo(
          x + height,
          height
        );

        ctx.stroke();
      }


      /* -------------------------------------------------------
         CENTER TEXT
         ------------------------------------------------------- */

      ctx.globalAlpha = 0.94;

      ctx.fillStyle =
        "#fff4d9";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.font =
        "600 11px Montserrat, Arial, sans-serif";

      ctx.fillText(
        "SCRATCH TO REVEAL",
        width / 2,
        height / 2 - 15
      );

      ctx.font =
        "27px Georgia, serif";

      ctx.fillText(
        "✦",
        width / 2,
        height / 2 + 20
      );


      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation =
        "destination-out";
    }


    /* ---------------------------------------------------------
       POINTER POSITION
       --------------------------------------------------------- */

    function getPoint(event) {

      const rect =
        canvas.getBoundingClientRect();

      return {

        x:
          Math.max(
            0,
            Math.min(
              rect.width,
              event.clientX -
                rect.left
            )
          ),

        y:
          Math.max(
            0,
            Math.min(
              rect.height,
              event.clientY -
                rect.top
            )
          )
      };
    }


    /* ---------------------------------------------------------
       SCRATCH DOT
       --------------------------------------------------------- */

    function scratchDot(point) {

      ctx.save();

      ctx.globalCompositeOperation =
        "destination-out";

      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        Math.max(
          20,
          Math.min(
            34,
            card.clientWidth * 0.06
          )
        ),
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    }


    /* ---------------------------------------------------------
       SCRATCH LINE
       --------------------------------------------------------- */

    function scratchLine(
      from,
      to
    ) {

      ctx.save();

      ctx.globalCompositeOperation =
        "destination-out";

      ctx.lineCap =
        "round";

      ctx.lineJoin =
        "round";

      ctx.lineWidth =
        Math.max(
          32,
          Math.min(
            58,
            card.clientWidth * 0.105
          )
        );

      ctx.beginPath();

      ctx.moveTo(
        from.x,
        from.y
      );

      ctx.lineTo(
        to.x,
        to.y
      );

      ctx.stroke();

      ctx.restore();


      /* Soft outer edge */

      ctx.save();

      ctx.globalCompositeOperation =
        "destination-out";

      ctx.globalAlpha = 0.28;

      ctx.lineWidth =
        Math.max(
          55,
          Math.min(
            82,
            card.clientWidth * 0.15
          )
        );

      ctx.beginPath();

      ctx.moveTo(
        from.x,
        from.y
      );

      ctx.lineTo(
        to.x,
        to.y
      );

      ctx.stroke();

      ctx.restore();
    }


    /* ---------------------------------------------------------
       CHECK HOW MUCH HAS BEEN SCRATCHED
       --------------------------------------------------------- */

    function checkReveal() {

      if (
        revealed ||
        revealCheckPending
      ) {
        return;
      }

      revealCheckPending = true;

      requestAnimationFrame(() => {

        revealCheckPending = false;

        const width =
          canvas.width;

        const height =
          canvas.height;

        if (
          width <= 0 ||
          height <= 0
        ) {
          return;
        }

        /*
          Sample a smaller grid instead of
          processing every pixel.
        */

        const sampleWidth = 64;

        const sampleHeight =
          Math.max(
            64,
            Math.round(
              sampleWidth *
              height /
              width
            )
          );

        const pixels =
          ctx.getImageData(
            0,
            0,
            width,
            height
          ).data;

        let transparent = 0;
        let total = 0;

        for (
          let y = 0;
          y < sampleHeight;
          y++
        ) {

          const py =
            Math.min(
              height - 1,
              Math.floor(
                y /
                sampleHeight *
                height
              )
            );

          for (
            let x = 0;
            x < sampleWidth;
            x++
          ) {

            const px =
              Math.min(
                width - 1,
                Math.floor(
                  x /
                  sampleWidth *
                  width
                )
              );

            const index =
              (
                py * width +
                px
              ) * 4 + 3;

            if (
              pixels[index] < 80
            ) {
              transparent++;
            }

            total++;
          }
        }

        const percentage =
          transparent / total;


        /*
          Reveal after approximately
          half of the surface is scratched.
        */

        if (
          percentage >= 0.52
        ) {

          revealScratchCard();
        }

      });
    }


    /* ---------------------------------------------------------
       REVEAL
       --------------------------------------------------------- */

    function revealScratchCard() {

      if (revealed) return;

      revealed = true;

      canvas.classList.add(
        "is-cleared"
      );

      card.classList.add(
        "is-revealed"
      );

      hint.classList.add(
        "is-hidden"
      );

      complete.classList.add(
        "is-visible"
      );

      complete.setAttribute(
        "aria-hidden",
        "false"
      );

      confettiBurst();

      toast(
        "Beautiful! The moment is revealed ♥"
      );
    }


    /* ---------------------------------------------------------
       START SCRATCH
       --------------------------------------------------------- */

    function startScratch(event) {

      if (revealed) return;

      drawing = true;

      try {
        canvas.setPointerCapture(
          event.pointerId
        );
      } catch {}

      const point =
        getPoint(event);

      lastPoint = point;

      scratchDot(point);

      event.preventDefault();
    }


    /* ---------------------------------------------------------
       CONTINUE SCRATCH
       --------------------------------------------------------- */

    function moveScratch(event) {

      if (
        !drawing ||
        revealed
      ) {
        return;
      }

      const point =
        getPoint(event);

      if (lastPoint) {

        scratchLine(
          lastPoint,
          point
        );
      }

      lastPoint = point;

      checkReveal();

      event.preventDefault();
    }


    /* ---------------------------------------------------------
       END SCRATCH
       --------------------------------------------------------- */

    function endScratch(event) {

      drawing = false;

      lastPoint = null;

      try {
        canvas.releasePointerCapture(
          event.pointerId
        );
      } catch {}

      checkReveal();
    }


    /* ---------------------------------------------------------
       POINTER EVENTS
       Works on:
       - Android
       - iPhone
       - Desktop
       - Mouse
       - Touch
       - Stylus
       --------------------------------------------------------- */

    canvas.addEventListener(
      "pointerdown",
      startScratch,
      { passive: false }
    );

    canvas.addEventListener(
      "pointermove",
      moveScratch,
      { passive: false }
    );

    canvas.addEventListener(
      "pointerup",
      endScratch,
      { passive: true }
    );

    canvas.addEventListener(
      "pointercancel",
      endScratch,
      { passive: true }
    );


    canvas.addEventListener(
      "pointerleave",
      () => {
        drawing = false;
        lastPoint = null;
      }
    );


    /* ---------------------------------------------------------
       RESET
       --------------------------------------------------------- */

    reset.addEventListener(
      "click",
      () => {

        revealed = false;

        drawing = false;

        lastPoint = null;

        canvas.classList.remove(
          "is-cleared"
        );

        card.classList.remove(
          "is-revealed"
        );

        hint.classList.remove(
          "is-hidden"
        );

        complete.classList.remove(
          "is-visible"
        );

        complete.setAttribute(
          "aria-hidden",
          "true"
        );

        resizeCanvas();
      }
    );


    /* ---------------------------------------------------------
       INITIALIZE
       --------------------------------------------------------- */

    if (image.complete) {

      requestAnimationFrame(
        resizeCanvas
      );

    } else {

      image.addEventListener(
        "load",
        () => {
          requestAnimationFrame(
            resizeCanvas
          );
        },
        { once: true }
      );
    }


    window.addEventListener(
      "resize",
      () => {

        if (!revealed) {
          resizeCanvas();
        }

      },
      { passive: true }
    );
  }


  /* =========================================================
     LINKS
     ========================================================= */

  function setupLinks() {

    const mapsButton =
      $("#mapsBtn");

    if (mapsButton) {

      mapsButton.href =
        safeUrl(
          wedding.venue?.mapUrl ||
          "https://maps.google.com/"
        );
    }


    const venueCall =
      $("#venueCallBtn");

    if (venueCall) {

      if (wedding.venue?.phone) {

        venueCall.href =
          `tel:${phoneForHref(
            wedding.venue.phone
          )}`;

      } else {

        venueCall.href = "#";

        venueCall.addEventListener(
          "click",
          (event) => {

            event.preventDefault();

            toast(
              "Venue phone number is not configured."
            );
          }
        );
      }
    }


    const phoneButton =
      $("#phoneBtn");

    if (phoneButton) {

      if (wedding.contact?.phone) {

        phoneButton.href =
          `tel:${phoneForHref(
            wedding.contact.phone
          )}`;

      } else {

        phoneButton.href = "#";

        phoneButton.addEventListener(
          "click",
          (event) => {

            event.preventDefault();

            toast(
              "Contact phone number is not configured."
            );
          }
        );
      }
    }


    const whatsappButton =
      $("#whatsappBtn");

    if (whatsappButton) {

      if (wedding.contact?.whatsapp) {

        whatsappButton.href =
          whatsappUrl(
            wedding.contact.whatsapp,

            `Hello! I would like to know more about ${wedding.couple?.bride || "Bride"} & ${wedding.couple?.groom || "Groom"}'s wedding.`
          );

      } else {

        whatsappButton.href = "#";

        whatsappButton.addEventListener(
          "click",
          (event) => {

            event.preventDefault();

            toast(
              "WhatsApp number is not configured."
            );
          }
        );
      }
    }
  }


  /* =========================================================
     INTRO + ENVELOPE
     ========================================================= */

  function setupIntro() {

    const intro =
      $("#intro");

    const envelope =
      $("#envelope");

    const site =
      $("#site");

    if (
      !intro ||
      !envelope ||
      !site
    ) {
      return;
    }


    /* ---------------------------------------------------------
       INTRO → ENVELOPE
       --------------------------------------------------------- */

    function enterEnvelope() {

      intro.classList.add(
        "is-exiting"
      );

      setTimeout(() => {

        intro.classList.add(
          "is-hidden"
        );

        envelope.classList.remove(
          "is-hidden"
        );

        envelope.setAttribute(
          "aria-hidden",
          "false"
        );

      }, 650);
    }


    /* ---------------------------------------------------------
       OPEN ACTUAL ENVELOPE
       --------------------------------------------------------- */

    function openInvitation() {

      if (
        site.classList.contains(
          "is-live"
        )
      ) {
        return;
      }

      if (
        envelope.classList.contains(
          "is-opening"
        )
      ) {
        return;
      }


      /*
        The user has physically interacted
        with the page.

        This is the correct moment to
        attempt music playback.
      */

      envelope.classList.add(
        "is-opening"
      );

      document.body.classList.add(
        "opening"
      );

      tryPlayMusic();


      /*
        After the flap begins opening,
        move the envelope toward the
        viewer.
      */

      setTimeout(() => {

        envelope.classList.add(
          "is-leaving"
        );

      }, 1050);


      /*
        Finally reveal the actual website.
      */

      setTimeout(() => {

        envelope.classList.add(
          "is-hidden"
        );

        envelope.classList.remove(
          "is-opening",
          "is-leaving"
        );

        site.classList.add(
          "is-live"
        );

        site.setAttribute(
          "aria-hidden",
          "false"
        );

        document.body.classList.remove(
          "opening"
        );

        window.scrollTo(
          0,
          0
        );

        startButterflies();

      }, 1850);
    }


    /* ---------------------------------------------------------
       OPEN INVITATION BUTTON
       --------------------------------------------------------- */

    const enterButton =
      $("#enterBtn");

    if (enterButton) {

      enterButton.addEventListener(
        "click",
        enterEnvelope
      );

      enterButton.setAttribute(
        "aria-label",
        "Open invitation"
      );
    }


    /* ---------------------------------------------------------
       SKIP INTRO
       --------------------------------------------------------- */

    const skipButton =
      $("#skipBtn");

    if (skipButton) {

      skipButton.setAttribute(
        "aria-label",
        "Skip opening animation"
      );

      skipButton.addEventListener(
        "click",
        () => {

          intro.classList.add(
            "is-hidden"
          );

          envelope.classList.add(
            "is-hidden"
          );

          site.classList.add(
            "is-live"
          );

          site.setAttribute(
            "aria-hidden",
            "false"
          );

          startButterflies();

          /*
            Skip is also a user gesture,
            so try music here.
          */

          tryPlayMusic();
        }
      );
    }


    /* ---------------------------------------------------------
       SEAL
       --------------------------------------------------------- */

    const seal =
      $("#sealBtn");

    if (seal) {

      seal.addEventListener(
        "click",
        openInvitation
      );

      seal.addEventListener(
        "touchend",
        (event) => {

          event.preventDefault();

          openInvitation();

        },
        { passive: false }
      );
    }


    /* ---------------------------------------------------------
       ENTER INVITATION TEXT
       --------------------------------------------------------- */

    const envelopeSkip =
      $("#envelopeSkip");

    if (envelopeSkip) {

      envelopeSkip.addEventListener(
        "click",
        openInvitation
      );
    }
  }


  /* =========================================================
     COUNTDOWN
     ========================================================= */

  function setupCountdown() {

    const days =
      $("#days");

    const hours =
      $("#hours");

    const minutes =
      $("#minutes");

    const seconds =
      $("#seconds");

    const done =
      $("#countdownDone");

    if (
      !days ||
      !hours ||
      !minutes ||
      !seconds
    ) {
      return;
    }

    const target =
      new Date(
        wedding.date.weddingDate
      ).getTime();


    function updateCountdown() {

      if (
        Number.isNaN(target)
      ) {
        days.textContent = "00";
        hours.textContent = "00";
        minutes.textContent = "00";
        seconds.textContent = "00";

        if (done) {
          done.textContent =
            "DATE NOT CONFIGURED";
        }

        return;
      }


      const difference =
        target - Date.now();


      if (
        difference <= 0
      ) {

        days.textContent = "00";
        hours.textContent = "00";
        minutes.textContent = "00";
        seconds.textContent = "00";

        if (done) {
          done.textContent =
            "TODAY IS THE DAY ♥";
        }

        return;
      }


      const totalSeconds =
        Math.floor(
          difference / 1000
        );

      const d =
        Math.floor(
          totalSeconds / 86400
        );

      const h =
        Math.floor(
          (totalSeconds % 86400) /
          3600
        );

      const m =
        Math.floor(
          (totalSeconds % 3600) /
          60
        );

      const s =
        totalSeconds % 60;


      days.textContent =
        String(d).padStart(
          2,
          "0"
        );

      hours.textContent =
        String(h).padStart(
          2,
          "0"
        );

      minutes.textContent =
        String(m).padStart(
          2,
          "0"
        );

      seconds.textContent =
        String(s).padStart(
          2,
          "0"
        );
    }


    updateCountdown();

    setInterval(
      updateCountdown,
      1000
    );
  }


  /* =========================================================
     CALENDAR
     ========================================================= */

  function setupCalendar() {

    const button =
      $("#calendarBtn");

    if (!button) return;

    button.addEventListener(
      "click",
      () => {

        const events =
          Array.isArray(wedding.events)
            ? wedding.events
            : [];

        const event =
          events.find(
            (item) =>
              String(item.name)
                .toLowerCase() ===
              "wedding"
          ) ||
          events[events.length - 1];

        if (!event) {

          toast(
            "Wedding event is not configured."
          );

          return;
        }

        downloadICS(event);
      }
    );
  }


  function downloadICS(event) {

    if (!event) return;

    const time =
      to24Hour(
        event.time || "12:00 PM"
      );

    const start =
      new Date(
        `${event.date}T${time}`
      );

    if (
      Number.isNaN(
        start.getTime()
      )
    ) {

      toast(
        "Unable to create calendar event."
      );

      return;
    }


    const end =
      new Date(
        start.getTime() +
        2 * 60 * 60 * 1000
      );


    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation//EN",
      "BEGIN:VEVENT",

      `UID:${Date.now()}@wedding-invitation`,

      `DTSTAMP:${icsDate(
        new Date()
      )}`,

      `DTSTART:${icsDate(start)}`,

      `DTEND:${icsDate(end)}`,

      `SUMMARY:${icsEscape(
        `${event.name} — ${wedding.couple?.bride || ""} & ${wedding.couple?.groom || ""}`
      )}`,

      `LOCATION:${icsEscape(
        event.venue || ""
      )}`,

      `DESCRIPTION:${icsEscape(
        event.description || ""
      )}`,

      "END:VEVENT",
      "END:VCALENDAR"

    ].join("\r\n");


    const blob =
      new Blob(
        [ics],
        {
          type:
            "text/calendar;charset=utf-8"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `${String(event.name || "wedding")
        .replace(/\s+/g, "-")
        .toLowerCase()}.ics`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    setTimeout(
      () =>
        URL.revokeObjectURL(url),
      1000
    );


    toast(
      "Calendar file created."
    );
  }


  /* =========================================================
     MUSIC
     ========================================================= */

  function setupMusic() {

    const audio =
      $("#weddingAudio");

    const musicButton =
      $("#musicBtn");

    if (
      !audio ||
      !musicButton
    ) {
      console.warn(
        "Music controls not found."
      );

      return;
    }


    if (
      !wedding.music ||
      !wedding.music.enabled
    ) {

      musicButton.style.display =
        "none";

      return;
    }


    /*
      Important:
      The MP3 path comes from js/data.js.
    */

    const musicFile =
      wedding.music.file ||
      "assets/music/wedding-music.mp3";


    audio.loop = true;

    audio.preload = "auto";

    audio.volume =
      Number.isFinite(
        Number(
          wedding.music.volume
        )
      )
        ? Number(
            wedding.music.volume
          )
        : 0.75;


    /*
      Cache-busting prevents the browser
      from continuing to use an old MP3
      after you replace the file.
    */

    const separator =
      musicFile.includes("?")
        ? "&"
        : "?";

    audio.src =
      musicFile +
      separator +
      "v=" +
      Date.now();


    audio.load();


    /* ---------------------------------------------------------
       AUDIO ERROR
       --------------------------------------------------------- */

    audio.addEventListener(
      "error",
      () => {

        console.error(
          "Wedding music could not be loaded.",
          {
            file: musicFile,
            error: audio.error
          }
        );

        musicButton.setAttribute(
          "aria-label",
          "Music file unavailable"
        );

        musicButton.title =
          "Music file unavailable";

        toast(
          "Music file not found. Check assets/music/wedding-music.mp3"
        );
      }
    );


    /* ---------------------------------------------------------
       MUSIC PLAY EVENT
       --------------------------------------------------------- */

    audio.addEventListener(
      "play",
      () => {

        state.musicPlaying =
          true;

        musicButton.setAttribute(
          "aria-pressed",
          "true"
        );

        musicButton.textContent =
          "❚❚";

        musicButton.title =
          "Pause music";
      }
    );


    /* ---------------------------------------------------------
       MUSIC PAUSE EVENT
       --------------------------------------------------------- */

    audio.addEventListener(
      "pause",
      () => {

        state.musicPlaying =
          false;

        musicButton.setAttribute(
          "aria-pressed",
          "false"
        );

        musicButton.textContent =
          "♫";

        musicButton.title =
          "Play music";
      }
    );


    /* ---------------------------------------------------------
       MUSIC BUTTON
       --------------------------------------------------------- */

    musicButton.addEventListener(
      "click",
      async () => {

        try {

          if (
            audio.paused
          ) {

            await audio.play();

          } else {

            audio.pause();

          }

        } catch (error) {

          console.error(
            "Music playback failed:",
            error
          );

          toast(
            "Tap the music button again to start the music."
          );
        }
      }
    );
  }


  /* =========================================================
     START MUSIC AFTER USER GESTURE
     ========================================================= */

  async function tryPlayMusic() {

    if (
      !wedding.music ||
      !wedding.music.enabled
    ) {
      return;
    }


    const audio =
      $("#weddingAudio");

    const musicButton =
      $("#musicBtn");

    if (!audio) {
      return;
    }


    try {

      /*
        This is called from the seal click.

        Therefore it has the best possible
        chance of being accepted by
        Android/iPhone browser autoplay rules.
      */

      await audio.play();

      state.musicPlaying =
        true;

      if (musicButton) {

        musicButton.setAttribute(
          "aria-pressed",
          "true"
        );

        musicButton.textContent =
          "❚❚";

        musicButton.title =
          "Pause music";
      }

    } catch (error) {

      /*
        This is NOT a website error.

        Some mobile browsers still block
        audio even after a click.

        The music button will remain
        available.
      */

      console.warn(
        "Browser blocked automatic music playback.",
        error
      );

      if (musicButton) {

        musicButton.setAttribute(
          "aria-pressed",
          "false"
        );

        musicButton.textContent =
          "♫";

        musicButton.title =
          "Play music";
      }
    }
  }


  /* =========================================================
     SHARE
     ========================================================= */

  function setupShare() {

    const shareButton =
      $("#shareBtn");

    if (!shareButton) return;

    shareButton.addEventListener(
      "click",
      async () => {

        const shareData = {

          title:
            `Wedding of ${wedding.couple?.bride || "Bride"} & ${wedding.couple?.groom || "Groom"}`,

          text:
            `You're invited to ${wedding.couple?.bride || "Bride"} & ${wedding.couple?.groom || "Groom"}'s wedding on ${wedding.date?.displayDate || ""}.`,

          url:
            location.href
        };


        if (
          navigator.share
        ) {

          try {

            await navigator.share(
              shareData
            );

          } catch {}

        } else {

          const whatsapp =
            `https://wa.me/?text=${encodeURIComponent(
              `${shareData.text}\n${shareData.url}`
            )}`;

          window.open(
            whatsapp,
            "_blank",
            "noopener"
          );
        }
      }
    );
  }


  /* =========================================================
     EASY VIEW
     ========================================================= */

  function setupEasyView() {

    const button =
      $("#easyViewBtn");

    if (!button) return;

    button.addEventListener(
      "click",
      () => {

        const enabled =
          document.body.classList.toggle(
            "easy-view"
          );

        button.setAttribute(
          "aria-pressed",
          String(enabled)
        );

        toast(
          enabled
            ? "Easy View enabled"
            : "Easy View disabled"
        );
      }
    );
  }


  /* =========================================================
     MORE MENU
     ========================================================= */

  function setupMoreMenu() {

    const button =
      $("#moreBtn");

    const menu =
      $("#moreMenu");

    if (
      !button ||
      !menu
    ) {
      return;
    }


    button.addEventListener(
      "click",
      () => {

        const open =
          menu.classList.toggle(
            "is-open"
          );

        menu.setAttribute(
          "aria-hidden",
          String(!open)
        );

        button.setAttribute(
          "aria-expanded",
          String(open)
        );
      }
    );


    $$("#moreMenu a").forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {

            menu.classList.remove(
              "is-open"
            );

            button.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        );
      }
    );
  }


  /* =========================================================
     SCROLL REVEAL
     ========================================================= */

  function setupScrollReveal() {

    const elements =
      $$(".reveal");

    if (!elements.length) {
      return;
    }


    if (
      !("IntersectionObserver" in window)
    ) {

      elements.forEach(
        (element) =>
          element.classList.add(
            "is-visible"
          )
      );

      return;
    }


    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "is-visible"
                );

                observer.unobserve(
                  entry.target
                );
              }

            }
          );

        },
        {
          threshold: 0.12
        }
      );


    elements.forEach(
      (element) =>
        observer.observe(element)
    );
  }


  /* =========================================================
     CLICK / TOUCH SPARKLES
     ========================================================= */

  function setupTouchSparkles() {

    document.addEventListener(
      "click",
      (event) => {

        if (
          event.target.closest(
            "button,a,input,textarea,select"
          )
        ) {
          return;
        }

        spark(
          event.clientX,
          event.clientY
        );
      }
    );


    document.addEventListener(
      "touchend",
      (event) => {

        if (
          event.target.closest(
            "button,a,input,textarea,select"
          )
        ) {
          return;
        }

        const touch =
          event.changedTouches?.[0];

        if (!touch) return;

        spark(
          touch.clientX,
          touch.clientY
        );
      },
      {
        passive: true
      }
    );
  }


  function spark(
    x,
    y
  ) {

    const element =
      document.createElement(
        "span"
      );

    element.className =
      "click-spark";

    element.style.left =
      `${x}px`;

    element.style.top =
      `${y}px`;

    document.body.appendChild(
      element
    );


    setTimeout(
      () => element.remove(),
      750
    );
  }


  /* =========================================================
     BUTTERFLIES
     ========================================================= */

  function startButterflies() {

    const wrapper =
      $("#butterflies");

    if (!wrapper) {
      return;
    }


    const count =
      window.innerWidth < 600
        ? 9
        : 14;


    wrapper.innerHTML = "";


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const butterfly =
        document.createElement(
          "button"
        );

      butterfly.type =
        "button";

      butterfly.className =
        "butterfly";

      butterfly.setAttribute(
        "aria-label",
        "Butterfly"
      );

      butterfly.textContent =
        "🦋";


      butterfly.style.setProperty(
        "--delay",
        `${Math.random() * 8}s`
      );


      butterfly.style.setProperty(
        "--duration",
        `${12 + Math.random() * 12}s`
      );


      butterfly.style.setProperty(
        "--top",
        `${8 + Math.random() * 76}%`
      );


      butterfly.style.setProperty(
        "--size",
        `${18 + Math.random() * 12}px`
      );


      butterfly.addEventListener(
        "click",
        () => {

          butterfly.classList.add(
            "fly-away"
          );


          setTimeout(
            () => {
              butterfly.remove();
            },
            600
          );
        }
      );


      wrapper.appendChild(
        butterfly
      );
    }
  }


  /* =========================================================
     CONFETTI
     ========================================================= */

  function confettiBurst() {

    for (
      let i = 0;
      i < 34;
      i++
    ) {

      const confetti =
        document.createElement(
          "span"
        );

      confetti.className =
        "confetti";

      confetti.textContent =
        ["✦", "•", "❦"][i % 3];

      confetti.style.left =
        "50%";

      confetti.style.top =
        "55%";


      confetti.style.setProperty(
        "--x",
        `${(Math.random() - 0.5) * 70}vw`
      );


      confetti.style.setProperty(
        "--y",
        `${(Math.random() - 0.5) * 70}vh`
      );


      document.body.appendChild(
        confetti
      );


      setTimeout(
        () =>
          confetti.remove(),
        1100
      );
    }
  }


  /* =========================================================
     SMALL EASTER EGG
     ========================================================= */

  function setupEasterEgg() {

    const egg =
      $("#initialEgg");

    if (!egg) return;


    egg.addEventListener(
      "click",
      () => {

        state.eggTaps++;


        if (
          state.eggTaps >= 5
        ) {

          state.eggTaps = 0;

          toast(
            "👀 YOU FOUND OUR LITTLE SECRET ♥"
          );

          confettiBurst();
        }
      }
    );
  }


  /* =========================================================
     TOAST
     ========================================================= */

  function toast(message) {

    const element =
      $("#toast");

    if (!element) {
      return;
    }


    element.textContent =
      message;

    element.classList.add(
      "is-visible"
    );


    clearTimeout(
      element._timer
    );


    element._timer =
      setTimeout(
        () => {

          element.classList.remove(
            "is-visible"
          );

        },
        2600
      );
  }


  /* =========================================================
     WHATSAPP
     ========================================================= */

  function whatsappUrl(
    number,
    text
  ) {

    const cleanNumber =
      String(number || "")
        .replace(
          /\D/g,
          ""
        );


    return (
      `https://wa.me/${cleanNumber}` +
      `?text=${encodeURIComponent(
        text
      )}`
    );
  }


  /* =========================================================
     PHONE
     ========================================================= */

  function phoneForHref(
    phone
  ) {

    return String(
      phone || ""
    ).replace(
      /[^\d+]/g,
      ""
    );
  }


  /* =========================================================
     SAFE URL
     ========================================================= */

  function safeUrl(
    url
  ) {

    try {

      const parsed =
        new URL(
          url,
          location.href
        );


      const allowedProtocols = [
        "http:",
        "https:",
        "mailto:",
        "tel:"
      ];


      return allowedProtocols.includes(
        parsed.protocol
      )
        ? parsed.href
        : "#";

    } catch {

      return "#";
    }
  }


  /* =========================================================
     HTML ESCAPE
     ========================================================= */

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    ).replace(
      /[&<>"']/g,
      (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character])
    );
  }


  /* =========================================================
     CONVERT TIME TO 24-HOUR
     ========================================================= */

  function to24Hour(
    time
  ) {

    const match =
      String(
        time || ""
      )
        .trim()
        .match(
          /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
        );


    if (!match) {
      return "12:00:00";
    }


    let hour =
      Number(
        match[1]
      );

    const minute =
      match[2];

    const period =
      (
        match[3] || ""
      ).toUpperCase();


    if (
      period === "PM" &&
      hour < 12
    ) {
      hour += 12;
    }


    if (
      period === "AM" &&
      hour === 12
    ) {
      hour = 0;
    }


    return (
      `${String(hour).padStart(2, "0")}:` +
      `${minute}:00`
    );
  }


  /* =========================================================
     ICS DATE
     ========================================================= */

  function icsDate(
    date
  ) {

    return new Date(
      date.getTime() -
      date.getTimezoneOffset() *
        60000
    )
      .toISOString()
      .replace(
        /[-:]/g,
        ""
      )
      .replace(
        /\.\d{3}/,
        ""
      );
  }


  /* =========================================================
     ICS ESCAPE
     ========================================================= */

  function icsEscape(
    value
  ) {

    return String(
      value || ""
    )
      .replace(
        /\\/g,
        "\\\\"
      )
      .replace(
        /;/g,
        "\\;"
      )
      .replace(
        /,/g,
        "\\,"
      )
      .replace(
        /\n/g,
        "\\n"
      );
  }


  /* =========================================================
     INITIALIZE WEBSITE
     ========================================================= */

  function init() {

    try {

      applyTheme();

      bindData();

      setupEvents();

      setupScratchCard();

      setupLinks();

      setupIntro();

      setupCountdown();

      setupCalendar();

      setupMusic();

      setupShare();

      setupEasyView();

      setupMoreMenu();

      setupTouchSparkles();

      setupEasterEgg();

      setupScrollReveal();

      console.log(
        "Wedding invitation initialized successfully."
      );

    } catch (error) {

      console.error(
        "Wedding invitation initialization error:",
        error
      );

      /*
        Don't leave the visitor staring at
        a completely broken page.
      */

      toast(
        "Some invitation features could not be loaded."
      );
    }
  }


  /* =========================================================
     START
     ========================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();
  }

})();