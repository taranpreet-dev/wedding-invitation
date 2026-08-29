(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const state = {
    musicPlaying: false,
    eggTaps: 0
  };

  const wedding = window.weddingData || {
    couple:{groom:"Groom",bride:"Bride",groomFullName:"Groom",brideFullName:"Bride"},
    invitation:{heading:"You are cordially invited",message:"Join us as we celebrate love and togetherness."},
    date:{weddingDate:"2026-12-12T11:00:00",displayDate:"12 December 2026",weddingTime:"11:00 AM onwards"},
    venue:{name:"Wedding Venue",address:"Your Venue Address",mapUrl:"https://maps.google.com/",phone:""},
    events:[],
    family:{groomParents:["Father Name","Mother Name"],brideParents:["Father Name","Mother Name"]},
    story:[],
    contact:{phone:"",whatsapp:""},
    music:{enabled:true,file:"assets/music/wedding-music.mp3"},
    gallery:[],
    theme:{primaryColor:"#6e2334",secondaryColor:"#b8894b",accentColor:"#8e5d3f",backgroundColor:"#fbf7ef"}
  };

  function applyTheme() {
    const root = document.documentElement;
    root.style.setProperty("--wine", wedding.theme.primaryColor);
    root.style.setProperty("--gold", wedding.theme.secondaryColor);
    root.style.setProperty("--accent", wedding.theme.accentColor);
    root.style.setProperty("--cream", wedding.theme.backgroundColor);
  }

  function bindData() {
    const d = wedding;
    $$("[data-bind]").forEach(el => {
      const key = el.dataset.bind;
      const values = {
        bride: d.couple.bride,
        groom: d.couple.groom,
        initials: `${d.couple.bride.charAt(0)}${d.couple.groom.charAt(0)}`,
        invitationHeading: d.invitation.heading,
        invitationMessage: d.invitation.message,
        displayDate: d.date.displayDate,
        weddingTime: d.date.weddingTime,
        venueName: d.venue.name,
        venueAddress: d.venue.address
      };
      if (values[key] !== undefined) el.textContent = values[key];
    });
    $("#groomParents").textContent = d.family.groomParents.join(" & ");
    $("#brideParents").textContent = d.family.brideParents.join(" & ");
  }

  function setupEvents() {
    const list = $("#eventsList");
    list.innerHTML = wedding.events.map((event, index) => `
      <article class="event-card reveal">
        <div class="event-card__icon">${index === 0 ? "❦" : index === 1 ? "♫" : "✦"}</div>
        <p class="eyebrow">EVENT ${String(index + 1).padStart(2, "0")}</p>
        <h3>${escapeHtml(event.name)}</h3>
        <strong>${escapeHtml(event.displayDate)}</strong>
        <p>${escapeHtml(event.time)} · ${escapeHtml(event.venue)}</p>
        <p class="muted">${escapeHtml(event.description)}</p>
        <div class="button-row">
          <a class="btn btn--outline btn--small" href="${safeUrl(event.mapUrl)}" target="_blank" rel="noopener">⌖ Directions</a>
          <button class="btn btn--gold btn--small calendar-event" type="button" data-event-index="${index}">▣ Calendar</button>
        </div>
      </article>
    `).join("");

    $$(".calendar-event").forEach(btn => {
      btn.addEventListener("click", () => downloadICS(wedding.events[Number(btn.dataset.eventIndex)]));
    });
  }

  function setupScratchCard() {
    const card = $("#scratchCard");
    const canvas = $("#scratchCanvas");
    const image = $("#scratchImage");
    const hint = $("#scratchHint");
    const complete = $("#scratchComplete");
    const reset = $("#scratchReset");

    if (!card || !canvas || !image || !hint || !complete || !reset) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let drawing = false;
    let revealed = false;
    let lastPoint = null;
    let revealCheckPending = false;

    const resizeCanvas = () => {
      const rect = card.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintOverlay(rect.width, rect.height);
    };

    const paintOverlay = (width, height) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#c8954d");
      gradient.addColorStop(.28, "#e4bf79");
      gradient.addColorStop(.52, "#b77b35");
      gradient.addColorStop(.78, "#e2bb70");
      gradient.addColorStop(1, "#a96b2e");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Paper/gold texture: small dots + diagonal fibers.
      ctx.globalAlpha = .18;
      for (let i = 0; i < Math.floor(width * height / 260); i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = .35 + Math.random() * 1.2;
        ctx.fillStyle = i % 2 ? "#fff4d6" : "#6e3d1d";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = .10;
      ctx.strokeStyle = "#fff3d0";
      ctx.lineWidth = 1;
      for (let x = -height; x < width + height; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }

      // Ornamental center message printed on the scratch surface.
      ctx.globalAlpha = .92;
      ctx.fillStyle = "#fff4da";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 11px Montserrat, Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("SCRATCH TO REVEAL", width / 2, height / 2 - 12);
      ctx.font = "26px Georgia, serif";
      ctx.fillText("✦", width / 2, height / 2 + 22);

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
    };

    const pointFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top))
      };
    };

    const scratchLine = (from, to) => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(34, Math.min(58, card.clientWidth * .105));
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();

      // Wider soft edge makes the scratch feel natural rather than like tapping.
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = .28;
      ctx.lineWidth = Math.max(58, Math.min(82, card.clientWidth * .15));
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
    };

    const scratchDot = (point) => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(22, Math.min(34, card.clientWidth * .06)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const checkReveal = () => {
      if (revealed || revealCheckPending) return;
      revealCheckPending = true;

      requestAnimationFrame(() => {
        revealCheckPending = false;
        const width = canvas.width;
        const height = canvas.height;

        // Sample alpha values instead of reading every pixel.
        const sampleW = 64;
        const sampleH = Math.max(64, Math.round(sampleW * height / width));
        const pixels = ctx.getImageData(0, 0, width, height).data;
        let transparent = 0;
        let total = 0;

        for (let y = 0; y < sampleH; y++) {
          const py = Math.floor((y / sampleH) * height);
          for (let x = 0; x < sampleW; x++) {
            const px = Math.floor((x / sampleW) * width);
            const index = (py * width + px) * 4 + 3;
            if (pixels[index] < 80) transparent++;
            total++;
          }
        }

        const percent = transparent / total;
        if (percent >= 0.52) {
          revealed = true;
          canvas.classList.add("is-cleared");
          card.classList.add("is-revealed");
          hint.classList.add("is-hidden");
          complete.classList.add("is-visible");
          complete.setAttribute("aria-hidden", "false");
          confettiBurst();
          toast("Beautiful! The moment is revealed ♥");
        }
      });
    };

    const start = (event) => {
      if (revealed) return;
      drawing = true;
      canvas.setPointerCapture?.(event.pointerId);
      const point = pointFromEvent(event);
      lastPoint = point;
      scratchDot(point);
      event.preventDefault();
    };

    const move = (event) => {
      if (!drawing || revealed) return;
      const point = pointFromEvent(event);
      if (lastPoint) scratchLine(lastPoint, point);
      lastPoint = point;
      checkReveal();
      event.preventDefault();
    };

    const end = (event) => {
      drawing = false;
      lastPoint = null;
      try { canvas.releasePointerCapture?.(event.pointerId); } catch {}
      checkReveal();
    };

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("pointerleave", () => {
      drawing = false;
      lastPoint = null;
    });

    reset.addEventListener("click", () => {
      revealed = false;
      drawing = false;
      lastPoint = null;
      canvas.classList.remove("is-cleared");
      card.classList.remove("is-revealed");
      hint.classList.remove("is-hidden");
      complete.classList.remove("is-visible");
      complete.setAttribute("aria-hidden", "true");
      resizeCanvas();
    });

    if (image.complete) {
      resizeCanvas();
    } else {
      image.addEventListener("load", resizeCanvas, { once: true });
    }

    window.addEventListener("resize", () => {
      if (!revealed) resizeCanvas();
    }, { passive: true });
  }

  function setupLinks() {
    $("#mapsBtn").href = safeUrl(wedding.venue.mapUrl);
    if (wedding.venue.phone) {
      $("#venueCallBtn").href = `tel:${phoneForHref(wedding.venue.phone)}`;
    } else {
      $("#venueCallBtn").href = "#";
      $("#venueCallBtn").addEventListener("click", e => { e.preventDefault(); toast("Venue phone number is not configured."); });
    }
    if (wedding.contact.phone) {
      $("#phoneBtn").href = `tel:${phoneForHref(wedding.contact.phone)}`;
    } else {
      $("#phoneBtn").href = "#";
      $("#phoneBtn").addEventListener("click", e => { e.preventDefault(); toast("Contact phone number is not configured."); });
    }
    $("#whatsappBtn").href = whatsappUrl(wedding.contact.whatsapp, `Hello! I would like to know more about ${wedding.couple.bride} & ${wedding.couple.groom}'s wedding.`);
    $("#weddingAudio").src = wedding.music.file;
  }

  function setupIntro() {
    const intro = $("#intro");
    const envelope = $("#envelope");
    const site = $("#site");

    const enterEnvelope = () => {
      intro.classList.add("is-exiting");
      setTimeout(() => {
        intro.classList.add("is-hidden");
        envelope.classList.remove("is-hidden");
        envelope.setAttribute("aria-hidden", "false");
      }, 650);
    };

    const openInvitation = () => {
      if (site.classList.contains("is-live") || envelope.classList.contains("is-opening")) return;

      envelope.classList.add("is-opening");
      document.body.classList.add("opening");
      tryPlayMusic();

      setTimeout(() => {
        envelope.classList.add("is-leaving");
      }, 1050);

      setTimeout(() => {
        envelope.classList.add("is-hidden");
        envelope.classList.remove("is-opening", "is-leaving");
        site.classList.add("is-live");
        site.setAttribute("aria-hidden", "false");
        document.body.classList.remove("opening");
        window.scrollTo({top:0, behavior:"auto"});
        startButterflies();
      }, 1850);
    };

    $("#enterBtn").addEventListener("click", enterEnvelope);
    $("#enterBtn").setAttribute("aria-label", "Open invitation");
    $("#skipBtn").setAttribute("aria-label", "Skip opening animation");
    $("#skipBtn").addEventListener("click", () => {
      intro.classList.add("is-hidden");
      site.classList.add("is-live");
      site.setAttribute("aria-hidden", "false");
      startButterflies();
    });
    $("#sealBtn").addEventListener("click", openInvitation);
    $("#envelopeSkip").addEventListener("click", openInvitation);
  }

  function setupCountdown() {
    const target = new Date(wedding.date.weddingDate).getTime();

    function update() {
      const diff = target - Date.now();
      if (diff <= 0) {
        $("#days").textContent = "00";
        $("#hours").textContent = "00";
        $("#minutes").textContent = "00";
        $("#seconds").textContent = "00";
        $("#countdownDone").textContent = "TODAY IS THE DAY ♥";
        return;
      }
      const sec = Math.floor(diff / 1000);
      const days = Math.floor(sec / 86400);
      const hours = Math.floor((sec % 86400) / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;
      $("#days").textContent = String(days).padStart(2, "0");
      $("#hours").textContent = String(hours).padStart(2, "0");
      $("#minutes").textContent = String(minutes).padStart(2, "0");
      $("#seconds").textContent = String(seconds).padStart(2, "0");
    }
    update();
    setInterval(update, 1000);
  }

  function setupCalendar() {
    $("#calendarBtn").addEventListener("click", () => {
      const event = wedding.events.find(e => e.name.toLowerCase() === "wedding") || wedding.events[0];
      downloadICS(event);
    });
  }

  function downloadICS(event) {
    const start = new Date(`${event.date}T${to24Hour(event.time)}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wedding Invitation//EN","BEGIN:VEVENT",
      `UID:${Date.now()}@wedding-invitation`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsEscape(`${event.name} — ${wedding.couple.bride} & ${wedding.couple.groom}`)}`,
      `LOCATION:${icsEscape(event.venue)}`,
      `DESCRIPTION:${icsEscape(event.description)}`,
      "END:VEVENT","END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name.replace(/\s+/g,"-").toLowerCase()}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Calendar file created. Open it to save the event.");
  }

  function setupMusic() {
    const audio = $("#weddingAudio");
    $("#musicBtn").addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
          state.musicPlaying = true;
          $("#musicBtn").setAttribute("aria-pressed","true");
          $("#musicBtn").textContent = "❚❚";
        } catch {
          toast("Tap the music button again to start playback.");
        }
      } else {
        audio.pause();
        state.musicPlaying = false;
        $("#musicBtn").setAttribute("aria-pressed","false");
        $("#musicBtn").textContent = "♫";
      }
    });
  }

  async function tryPlayMusic() {
    if (!wedding.music.enabled) return;
    const audio = $("#weddingAudio");
    try {
      await audio.play();
      state.musicPlaying = true;
      $("#musicBtn").setAttribute("aria-pressed","true");
      $("#musicBtn").textContent = "❚❚";
    } catch {
      // Browser autoplay policy: the user can use the visible music button.
    }
  }

  function setupShare() {
    $("#shareBtn").addEventListener("click", async () => {
      const shareData = {
        title: `Wedding of ${wedding.couple.bride} & ${wedding.couple.groom}`,
        text: `You're invited to ${wedding.couple.bride} & ${wedding.couple.groom}'s wedding on ${wedding.date.displayDate}.`,
        url: location.href
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch {}
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareData.text}\n${shareData.url}`)}`;
        window.open(url, "_blank", "noopener");
      }
    });
  }

  function setupEasyView() {
    $("#easyViewBtn").addEventListener("click", () => {
      const enabled = document.body.classList.toggle("easy-view");
      $("#easyViewBtn").setAttribute("aria-pressed", String(enabled));
      toast(enabled ? "Easy View enabled" : "Easy View disabled");
    });
  }

  function setupMoreMenu() {
    const menu = $("#moreMenu");
    $("#moreBtn").addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      menu.setAttribute("aria-hidden", String(!open));
    });
    $$("#moreMenu a").forEach(a => a.addEventListener("click", () => menu.classList.remove("is-open")));
  }

  function setupScrollReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    $$(".reveal").forEach(el => observer.observe(el));
  }

  function setupTouchSparkles() {
    const handler = e => {
      if (e.target.closest("button,a,input")) return;
      const touch = e.changedTouches ? e.changedTouches[0] : e;
      spark(touch.clientX, touch.clientY);
    };
    document.addEventListener("click", handler);
    document.addEventListener("touchend", handler, {passive:true});
  }

  function spark(x,y) {
    const el = document.createElement("span");
    el.className = "click-spark";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }

  function startButterflies() {
    const wrap = $("#butterflies");
    const count = window.innerWidth < 600 ? 7 : 11;
    wrap.innerHTML = "";
    for (let i=0; i<count; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "butterfly";
      b.setAttribute("aria-label","Butterfly");
      b.textContent = "🦋";
      b.style.setProperty("--delay", `${Math.random()*8}s`);
      b.style.setProperty("--duration", `${12 + Math.random()*12}s`);
      b.style.setProperty("--top", `${8 + Math.random()*76}%`);
      b.style.setProperty("--size", `${18 + Math.random()*10}px`);
      b.addEventListener("click", () => {
        b.classList.add("fly-away");
        setTimeout(() => b.remove(), 600);
      });
      wrap.appendChild(b);
    }
  }

  function confettiBurst() {
    for (let i=0;i<34;i++) {
      const c=document.createElement("span");
      c.className="confetti";
      c.textContent=["✦","•","❦"][i%3];
      c.style.left="50%"; c.style.top="55%";
      c.style.setProperty("--x",`${(Math.random()-.5)*70}vw`);
      c.style.setProperty("--y",`${(Math.random()-.5)*70}vh`);
      document.body.appendChild(c);
      setTimeout(()=>c.remove(),1100);
    }
  }

  function setupEasterEgg() {
    $("#initialEgg").addEventListener("click", () => {
      state.eggTaps++;
      if (state.eggTaps >= 5) {
        state.eggTaps = 0;
        toast("👀 YOU FOUND OUR LITTLE SECRET ♥");
        confettiBurst();
      }
    });
  }

  function showRSVP(message) {
    $("#rsvpMessage").textContent = message;
  }

  function toast(message) {
    const t=$("#toast");
    t.textContent=message;
    t.classList.add("is-visible");
    clearTimeout(t._timer);
    t._timer=setTimeout(()=>t.classList.remove("is-visible"),2600);
  }

  function whatsappUrl(number,text) {
    return `https://wa.me/${String(number).replace(/\D/g,"")}?text=${encodeURIComponent(text)}`;
  }

  function phoneForHref(phone) {
    return String(phone).replace(/[^\d+]/g,"");
  }

  function safeUrl(url) {
    try {
      const u=new URL(url,location.href);
      return ["http:","https:","mailto:","tel:"].includes(u.protocol) ? u.href : "#";
    } catch { return "#"; }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  }

  function to24Hour(time) {
    const m=String(time).trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if(!m) return "12:00:00";
    let h=Number(m[1]), min=m[2], ap=(m[3]||"").toUpperCase();
    if(ap==="PM" && h<12) h+=12;
    if(ap==="AM" && h===12) h=0;
    return `${String(h).padStart(2,"0")}:${min}:00`;
  }

  function icsDate(d) {
    return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  }

  function icsEscape(s) {
    return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
  }

  function init() {
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
  }

  document.addEventListener("DOMContentLoaded", init);
})();
