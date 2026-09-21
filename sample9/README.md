# Mobile Wedding Door Website

A mobile-first wedding invitation website with a cinematic golden-door opening video.

## How to use
1. Open `index.html` on a phone or mobile browser.
2. Tap **Open the Doors**. The video in `assets/opening-door.mp4` starts after the tap.
3. When the video ends, the page transitions into the animated ivory-and-gold invitation.
4. Use the Menu button to navigate.

## Change wedding details
Open `script.js` and edit only the `WEDDING` object near the top. You can change:
- Couple names and initials
- Opening text
- Wedding date and countdown date/time
- Venue
- Story text and quote
- Events
- Dress code/contact details
- Footer text

## Mobile design
The experience is intentionally designed for screens up to 480px wide. On larger screens it stays centered as a mobile-width canvas so the intended phone layout is preserved.

## Video
Replace `assets/opening-door.mp4` with another MP4 if desired, keeping the same filename.

## No server required
This is a static website. It can be hosted on Cloudflare Pages, GitHub Pages, Netlify, or another static host.
