/* =========================================================
   EASY EDIT AREA — change your wedding details here
   ========================================================= */
const WEDDING = {
  couple: { firstName: "Aarav", secondName: "Riya", initials: "A & R" },
  opening: {
    eyebrow: "A NEW CHAPTER BEGINS",
    title: "Two Hearts.",
    titleSecondLine: "One Beautiful Beginning.",
    subtitle: "Tap below and step through the doors into our story."
  },
  wedding: { date: "5 April 2027", isoDate: "2027-04-05T18:30:00+05:30", location: "The Grand Garden, Patiala" },
  story: {
    heading: "And so our forever begins.",
    title: "A story worth celebrating",
    text: "From a simple hello to a thousand shared moments, every chapter has brought us here. Now we are opening the next one — surrounded by the people who make our lives beautiful.",
    quote: "Whatever our souls are made of, theirs and ours are the same.", author: "— Emily Brontë"
  },
  events: [
    { icon:"✦", title:"Haldi", date:"3 April 2027 · 11:00 AM", location:"The Garden Courtyard", text:"A bright morning filled with colour, laughter and family traditions." },
    { icon:"❋", title:"Mehndi", date:"4 April 2027 · 6:00 PM", location:"The Garden Courtyard", text:"An evening of music, intricate designs and celebration." },
    { icon:"✧", title:"Wedding", date:"5 April 2027 · 6:30 PM", location:"The Grand Garden", text:"The moment our two journeys become one. Dinner and celebration to follow." }
  ],
  details: [
    { label:"Dress code", value:"Festive / Traditional" },
    { label:"Venue", value:"The Grand Garden, Patiala" },
    { label:"Reception", value:"Dinner & celebration after the ceremony" },
    { label:"Contact", value:"+91 98765 43210 · hello@example.com" }
  ],
  footer: "With love, Aarav & Riya"
};

const $ = (selector) => document.querySelector(selector);
const doorVideo = $("#doorVideo"), opening = $("#opening"), site = $("#site");
const enterButton = $("#enterButton"), skipButton = $("#skipButton"), nav = $(".nav");

function fillContent() {
  $("#openingEyebrow").textContent = WEDDING.opening.eyebrow;
  $("#openingTitle").innerHTML = `${WEDDING.opening.title}<br><span>${WEDDING.opening.titleSecondLine}</span>`;
  $("#openingSubtitle").textContent = WEDDING.opening.subtitle;
  $("#navInitials").textContent = WEDDING.couple.initials;
  $("#heroEyebrow").textContent = "THE WEDDING OF";
  $("#coupleNames").innerHTML = `${WEDDING.couple.firstName}<br><span>&amp; ${WEDDING.couple.secondName}</span>`;
  $("#heroDate").textContent = WEDDING.wedding.date;
  $("#heroLocation").textContent = WEDDING.wedding.location;
  $("#storyHeading").textContent = WEDDING.story.heading;
  $("#storyTitle").textContent = WEDDING.story.title;
  $("#storyText").textContent = WEDDING.story.text;
  $("#quoteText").textContent = WEDDING.story.quote;
  $("#quoteAuthor").textContent = WEDDING.story.author;
  $("#footerText").textContent = WEDDING.footer;

  $("#eventsGrid").innerHTML = WEDDING.events.map((event, i) => `
    <article class="event-card reveal" style="transition-delay:${i * 100}ms">
      <div class="event-icon">${event.icon}</div><h3>${event.title}</h3>
      <div class="event-date">${event.date}</div><p>${event.text}</p><div class="event-location">${event.location}</div>
    </article>`).join("");
  $("#detailsGrid").innerHTML = WEDDING.details.map((item, i) => `
    <div class="detail reveal" style="transition-delay:${i * 70}ms"><b>${item.label}</b><span>${item.value}</span></div>`).join("");
}

function revealSite() {
  if (opening.classList.contains("exit")) return;
  opening.classList.add("exit"); site.classList.add("visible"); site.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "auto"; doorVideo.pause();
  setTimeout(() => {
    opening.style.display = "none";
    document.querySelectorAll(".reveal").forEach((el, i) => setTimeout(() => el.classList.add("active"), Math.min(i * 65, 750)));
  }, 1000);
}

enterButton.addEventListener("click", async () => {
  enterButton.disabled = true;
  enterButton.querySelector("span").textContent = "Opening…";
  skipButton.hidden = false;
  try { doorVideo.currentTime = 0; await doorVideo.play(); }
  catch { enterButton.disabled = false; enterButton.querySelector("span").textContent = "Open the Doors"; }
});
doorVideo.addEventListener("ended", revealSite);
skipButton.addEventListener("click", revealSite);

$("#menuButton").addEventListener("click", () => {
  const links = $("#navLinks"), open = links.classList.toggle("open");
  $("#menuButton").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav-links a").forEach(link => link.addEventListener("click", () => $("#navLinks").classList.remove("open")));

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("active"); }), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 18), { passive:true });

function updateCountdown() {
  const diff = new Date(WEDDING.wedding.isoDate).getTime() - Date.now();
  if (diff <= 0) { ["days","hours","minutes","seconds"].forEach(id => $("#"+id).textContent="00"); return; }
  $("#days").textContent = String(Math.floor(diff / 86400000)).padStart(2,"0");
  $("#hours").textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2,"0");
  $("#minutes").textContent = String(Math.floor((diff / 60000) % 60)).padStart(2,"0");
  $("#seconds").textContent = String(Math.floor((diff / 1000) % 60)).padStart(2,"0");
}
updateCountdown(); setInterval(updateCountdown, 1000);

/* Subtle touch/pointer movement makes the decorative layer feel alive. */
let pointerX = 0, pointerY = 0;
window.addEventListener("pointermove", e => {
  if (e.pointerType === "touch") return;
  pointerX = (e.clientX / window.innerWidth - .5) * 2;
  pointerY = (e.clientY / window.innerHeight - .5) * 2;
  document.querySelectorAll(".gold-orb,.sparkle").forEach((el, i) => {
    const depth = (i + 1) * 2.2;
    el.style.marginLeft = `${pointerX * depth}px`;
    el.style.marginTop = `${pointerY * depth}px`;
  });
}, { passive:true });

const modal = $("#rsvpModal");
$("#rsvpButton").addEventListener("click", () => modal.showModal());
$("#modalClose").addEventListener("click", () => modal.close());
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
$("#rsvpForm").addEventListener("submit", e => { e.preventDefault(); e.currentTarget.hidden = true; $("#formSuccess").hidden = false; });

fillContent(); document.body.style.overflow = "hidden";
