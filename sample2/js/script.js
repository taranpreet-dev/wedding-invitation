/* =========================================================
   PREMIUM WEDDING INVITATION
   EDIT ONLY wedding{} FOR EACH CUSTOMER
========================================================= */

"use strict";

const wedding = {
  brideName: "Meera",
  groomName: "Arjun",
  weddingDate: "18 April 2027",
  weddingDateTime: "2027-04-18T09:30:00+05:30",
  weddingTime: "9:30 AM onwards",
  tagline: "Two hearts. One beautiful forever.",
  venueName: "The Grand Celebration",
  venueAddress: "Patiala, Punjab, India",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Patiala%2C%20Punjab%2C%20India",
  whatsappNumber: "919999999999",
  bridePhone: "919999999998",
  groomPhone: "919999999997",
  brideParents: "Mr. Suresh & Mrs. Priya",
  groomParents: "Mr. Ravi & Mrs. Lakshmi",
  musicFile: "assets/music/wedding.mp3",

  events: [
    {title:"Muhurtham",date:"18 April 2027",time:"9:30 AM",venue:"The Grand Celebration",icon:"✦"},
    {title:"Reception",date:"18 April 2027",time:"12:00 PM",venue:"The Grand Celebration",icon:"❦"},
    {title:"Lunch",date:"18 April 2027",time:"1:00 PM",venue:"The Grand Celebration",icon:"♥"}
  ],

  gallery: [
    "assets/images/gallery1.jpg",
    "assets/images/gallery2.jpg",
    "assets/images/gallery3.jpg",
    "assets/images/gallery4.jpg",
    "assets/images/gallery5.jpg",
    "assets/images/gallery6.jpg"
  ]
};

const $ = (s,p=document) => p.querySelector(s);
const $$ = (s,p=document) => [...p.querySelectorAll(s)];
const digits = v => String(v || "").replace(/\D/g,"");

function closeLoader(){
  const el=$("#preloader");
  if(!el)return;
  el.classList.add("hide");
  setTimeout(()=>el.style.display="none",800);
}
setTimeout(closeLoader,2500);
window.addEventListener("load",()=>setTimeout(closeLoader,450));

document.addEventListener("DOMContentLoaded",()=>{
  safe(bindData);
  safe(setupEnvelope);
  safe(setupMusic);
  safe(setupRevealCards);
  safe(setupCountdown);
  safe(setupReveal);
  safe(setupGallery);
  safe(setupEvents);
  safe(setupVenue);
  safe(setupRSVP);
  safe(setupContacts);
  safe(setupButterflies);
  safe(setupClickEffects);
});

function safe(fn){
  try{fn()}catch(err){console.error(fn.name,err)}
}

function bindData(){
  const values={
    bride:wedding.brideName,
    groom:wedding.groomName,
    date:wedding.weddingDate,
    time:wedding.weddingTime,
    tagline:wedding.tagline,
    venue:wedding.venueName,
    address:wedding.venueAddress,
    brideParents:wedding.brideParents,
    groomParents:wedding.groomParents
  };
  $$("[data-bind]").forEach(el=>{
    if(Object.prototype.hasOwnProperty.call(values,el.dataset.bind)){
      el.textContent=values[el.dataset.bind];
    }
  });
  document.title=`${wedding.brideName} & ${wedding.groomName} — Wedding Invitation`;
  const audio=$("#weddingMusic");
  if(audio)audio.src=wedding.musicFile;
}

/* ENVELOPE: actual flap + letter + camera-like travel into invitation */
function setupEnvelope(){
  const screen=$("#envelopeScreen");
  const stage=$("#envelopeStage");
  const envelope=$("#envelope");
  const seal=$("#sealButton");
  const invitation=$("#invitation");
  if(!screen||!stage||!envelope||!seal||!invitation)return;

  let opened=false;

  function open(){
    if(opened)return;
    opened=true;

    createClickGlow(innerWidth/2,innerHeight/2);
    burst(innerWidth/2,innerHeight/2,16);

    seal.disabled=true;
    envelope.classList.add("opening");
    screen.classList.add("travel");

    /* Music starts from the same user gesture */
    tryPlayMusic();

    /* Flap and letter open first */
    setTimeout(()=>{
      stage.classList.add("dragged");
    },950);

    /* Bring website into view while envelope moves away */
    setTimeout(()=>{
      invitation.classList.remove("hidden");
      invitation.classList.add("invitation-enter");
      document.body.classList.add("invitation-active");
    },1250);

    setTimeout(()=>{
      screen.classList.add("opened");
      stage.classList.remove("dragged");
      window.scrollTo(0,0);
    },2300);
  }

  seal.addEventListener("click",open);
  seal.addEventListener("pointerup",e=>{
    if(e.pointerType==="touch"){
      e.preventDefault();
      open();
    }
  });
}

function tryPlayMusic(){
  const audio=$("#weddingMusic");
  if(!audio)return;
  audio.volume=.72;
  const promise=audio.play();
  if(promise && promise.catch){
    promise.catch(()=>{});
  }
}

function setupMusic(){
  const audio=$("#weddingMusic");
  const button=$("#musicButton");
  if(!audio||!button)return;

  function update(){
    const playing=!audio.paused;
    button.textContent=playing?"♫":"🔇";
    button.classList.toggle("playing",playing);
    button.setAttribute("aria-label",playing?"Stop music":"Play music");
  }

  button.addEventListener("click",()=>{
    if(audio.paused){
      audio.play().catch(()=>showToast("Tap again to start the wedding music."));
    }else{
      audio.pause();
    }
  });
  audio.addEventListener("play",update);
  audio.addEventListener("pause",update);
  audio.addEventListener("error",()=>console.warn("Music file missing:",wedding.musicFile));
  update();
}

/* TAP-TO-REVEAL CARDS */
function setupRevealCards(){
  const cards = $$(".reveal-card");
  if(!cards.length) return;

  cards.forEach(card=>{
    let busy = false;

    card.addEventListener("click",()=>{
      if(busy || card.classList.contains("revealed")) return;

      busy = true;
      card.classList.add("revealed");
      card.setAttribute("aria-expanded","true");

      const rect = card.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      createClickGlow(x,y);
      burst(x,y,18);

      setTimeout(()=>{
        busy = false;
      },900);
    });
  });
}

/* COUNTDOWN */
function setupCountdown(){
  const target=Date.parse(wedding.weddingDateTime);
  if(!Number.isFinite(target))return;

  function update(){
    let diff=target-Date.now();
    if(diff<=0){
      ["days","hours","minutes","seconds"].forEach(id=>{$("#"+id).textContent="00"});
      $("#countdownDone").hidden=false;
      return;
    }
    const days=Math.floor(diff/86400000);diff-=days*86400000;
    const hours=Math.floor(diff/3600000);diff-=hours*3600000;
    const minutes=Math.floor(diff/60000);diff-=minutes*60000;
    const seconds=Math.floor(diff/1000);
    $("#days").textContent=String(days).padStart(2,"0");
    $("#hours").textContent=String(hours).padStart(2,"0");
    $("#minutes").textContent=String(minutes).padStart(2,"0");
    $("#seconds").textContent=String(seconds).padStart(2,"0");
  }
  update();
  setInterval(update,1000);
}

/* SCROLL REVEAL */
function setupReveal(){
  const items=$$(".reveal");
  if(!("IntersectionObserver" in window)){
    items.forEach(x=>x.classList.add("visible"));
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  },{threshold:.12});
  items.forEach(x=>io.observe(x));
}

/* GALLERY LIGHTBOX */
function setupGallery(){
  const items=$$(".gallery-item"),lb=$("#lightbox"),img=$("#lightboxImage");
  if(!items.length||!lb||!img)return;

  let index=0;
  const open=i=>{
    index=(i+items.length)%items.length;
    img.src=wedding.gallery[index];
    lb.classList.add("open");
    lb.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  };
  const close=()=>{
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  };
  const next=()=>open(index+1),prev=()=>open(index-1);

  items.forEach(item=>item.addEventListener("click",()=>open(Number(item.dataset.index)||0)));
  $("#lightboxClose").addEventListener("click",close);
  $("#lightboxNext").addEventListener("click",next);
  $("#lightboxPrev").addEventListener("click",prev);
  lb.addEventListener("click",e=>{if(e.target===lb)close()});
  document.addEventListener("keydown",e=>{
    if(!lb.classList.contains("open"))return;
    if(e.key==="Escape")close();
    if(e.key==="ArrowRight")next();
    if(e.key==="ArrowLeft")prev();
  });
}

/* EVENTS */
function setupEvents(){
  const box=$("#eventList");
  if(!box)return;

  wedding.events.forEach(ev=>{
    const article=document.createElement("article");
    article.className="event";
    article.innerHTML=`
      <div class="event-dot"></div>
      <div class="event-card">
        <div class="event-icon">${escapeHTML(ev.icon||"✦")}</div>
        <h3>${escapeHTML(ev.title)}</h3>
        <p><strong>${escapeHTML(ev.date)}</strong></p>
        <p>${escapeHTML(ev.time)} · ${escapeHTML(ev.venue)}</p>
        <a href="${escapeAttr(wedding.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">VIEW LOCATION ↗</a>
      </div>`;
    box.appendChild(article);
  });
}

/* VENUE */
function setupVenue(){
  const maps=$("#mapsButton"),directions=$("#directionsButton");
  if(maps)maps.href=wedding.googleMapsUrl;
  if(directions)directions.href=wedding.googleMapsUrl;
}

/* RSVP */
function setupRSVP(){
  $$(".rsvp-button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const yes=btn.dataset.rsvp==="yes";
      $("#rsvpMessage").textContent=yes?
        "♥ Thank you! We can't wait to celebrate with you.":
        "Thank you for letting us know. You will be missed ♥";

      burst(innerWidth/2,innerHeight/2,20);

      const phone=digits(wedding.whatsappNumber);
      if(!phone){
        showToast("Please add the WhatsApp number in wedding{}.");
        return;
      }

      const msg=yes?
        `Hello! We would love to attend the wedding of ${wedding.brideName} & ${wedding.groomName} on ${wedding.weddingDate}.`:
        `Hello! We are sorry, we will be unable to attend the wedding of ${wedding.brideName} & ${wedding.groomName} on ${wedding.weddingDate}.`;

      setTimeout(()=>{
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank");
      },350);
    });
  });
}

/* CONTACT */
function setupContacts(){
  const bc=$("#brideCall"),gc=$("#groomCall"),bw=$("#brideWhatsApp"),gw=$("#groomWhatsApp");
  if(bc)bc.href=`tel:${digits(wedding.bridePhone)}`;
  if(gc)gc.href=`tel:${digits(wedding.groomPhone)}`;
  if(bw){bw.href=`https://wa.me/${digits(wedding.bridePhone)}`;bw.target="_blank";}
  if(gw){gw.href=`https://wa.me/${digits(wedding.groomPhone)}`;gw.target="_blank";}
}

/* BUTTERFLIES: 14 moving objects with continuous wrapping */
function setupButterflies(){
  const box=$("#butterflies");
  if(!box)return;

  const list=[];
  const count=14;

  for(let i=0;i<count;i++){
    const el=document.createElement("button");
    el.type="button";
    el.className="butterfly";
    el.textContent="🦋";
    el.setAttribute("aria-label","Flying butterfly");

    const item={
      el,
      x:Math.random()*innerWidth,
      y:Math.random()*innerHeight,
      vx:(Math.random()-.5)*1.1,
      vy:(Math.random()-.5)*1.1,
      t:Math.random()*100,
      alive:true
    };

    el.style.fontSize=(20+Math.random()*17)+"px";

    el.addEventListener("pointerdown",e=>{
      e.preventDefault();
      item.vx+=(item.x-e.clientX)/45;
      item.vy+=(item.y-e.clientY)/45;
      item.alive=false;
      el.classList.add("butterfly-fly-away");
      burst(e.clientX,e.clientY,8);
      setTimeout(()=>el.remove(),500);
    },{passive:false});

    box.appendChild(el);
    list.push(item);
  }

  function animate(){
    list.forEach(item=>{
      if(!item.alive)return;

      item.t+=.012;
      item.vx+=Math.sin(item.t*2.1)*.006;
      item.vy+=Math.cos(item.t*1.7)*.006;

      item.vx=Math.max(-1.5,Math.min(1.5,item.vx));
      item.vy=Math.max(-1.5,Math.min(1.5,item.vy));

      item.x+=item.vx;
      item.y+=item.vy;

      if(item.x<-60)item.x=innerWidth+40;
      if(item.x>innerWidth+60)item.x=-40;
      if(item.y<-60)item.y=innerHeight+40;
      if(item.y>innerHeight+60)item.y=-40;

      const tilt=Math.sin(item.t*5)*13;

      item.el.style.transform=
        `translate3d(${item.x}px,${item.y}px,0) rotate(${tilt}deg)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* EVERY CLICK AND TOUCH */
function setupClickEffects(){
  let lastTouch=0;

  document.addEventListener("pointerdown",e=>{
    if(e.pointerType==="touch")lastTouch=Date.now();
    createClickGlow(e.clientX,e.clientY);
    burst(e.clientX,e.clientY,10);
  },{passive:true});

  document.addEventListener("touchstart",e=>{
    if(Date.now()-lastTouch<500)return;
    if(!e.touches.length)return;
    const t=e.touches[0];
    createClickGlow(t.clientX,t.clientY);
    burst(t.clientX,t.clientY,10);
  },{passive:true});
}

function createClickGlow(x,y){
  const glow=document.createElement("span");
  glow.className="click-glow";
  glow.style.left=x+"px";
  glow.style.top=y+"px";
  document.body.appendChild(glow);
  setTimeout(()=>glow.remove(),750);
}

function burst(x,y,count=10){
  for(let i=0;i<count;i++){
    const s=document.createElement("span");
    s.className="click-spark";
    s.style.left=x+"px";
    s.style.top=y+"px";
    const a=Math.random()*Math.PI*2;
    const d=18+Math.random()*50;
    s.style.setProperty("--dx",Math.cos(a)*d+"px");
    s.style.setProperty("--dy",Math.sin(a)*d+"px");
    const size=3+Math.random()*5;
    s.style.width=size+"px";
    s.style.height=size+"px";
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),850);
  }
}

function showToast(message){
  const t=$("#toast");
  if(!t)return;
  t.textContent=message;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove("show"),2600);
}

function escapeHTML(value){
  return String(value??"").replace(/[&<>"']/g,m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function escapeAttr(value){
  return String(value??"").replace(/"/g,"&quot;");
}
