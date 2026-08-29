# Premium Indian Wedding Invitation Template

A reusable, mobile-first wedding invitation made with HTML5, CSS3 and vanilla JavaScript.

## Folder structure

```text
wedding-invitation/
├── index.html
├── css/style.css
├── js/data.js
├── js/script.js
├── assets/
│   ├── images/
│   │   ├── couple/
│   │   ├── gallery/
│   │   ├── family/
│   │   └── events/
│   ├── icons/
│   └── music/
└── README.md
```

## 1. Change wedding information

Open:

`js/data.js`

Only edit the section marked:

`CLIENT / WEDDING DATA`

Change the bride, groom, date, time, venue, events, family, story, contact, RSVP, music, gallery and colors there.

## 2. Replace photos

Put customer JPG/WebP images into the matching folders.

Recommended files:

```text
assets/images/couple/hero.jpg
assets/images/couple/together.jpg
assets/images/events/venue.jpg
assets/images/gallery/photo1.webp
assets/images/gallery/photo2.webp
...
```

You can use JPG instead of WebP by changing the filename in `weddingData.gallery`.

## 3. Replace music

Put the customer's music file here:

```text
assets/music/wedding-music.mp3
```

Then keep this value in `data.js`:

```js
file: "assets/music/wedding-music.mp3"
```

Music never needs to autoplay before user interaction. After the envelope is opened, the browser is asked to start it; if autoplay is blocked, the visible music button remains available.

## 4. Change venue / Google Maps

Edit:

```js
venue: {
  name: "...",
  address: "...",
  mapUrl: "...",
  phone: "..."
}
```

## 5. Change WhatsApp and phone

Edit:

```js
contact: {
  phone: "+91XXXXXXXXXX",
  whatsapp: "91XXXXXXXXXX"
},
rsvp: {
  enabled: true,
  whatsappNumber: "91XXXXXXXXXX"
}
```

Use the country code for WhatsApp without `+` or spaces.

## 6. Add or remove events

Edit the `events` array in `data.js`.

You can add as many events as needed. The website automatically creates the cards.

## 7. Add or remove story items

Edit the `story` array. The timeline is generated automatically.

## 8. Add or remove gallery photos

Edit the `gallery` array. The grid and lightbox are generated automatically.

## 9. Change colors

Edit:

```js
theme: {
  primaryColor: "#6e2334",
  secondaryColor: "#b8894b",
  accentColor: "#8e5d3f",
  backgroundColor: "#fbf7ef"
}
```

## 10. Easy View

The `Aa` button in the top-right increases readability and reduces animation. It is designed for elderly guests and users who prefer a simpler view.

## 11. Deployment

This is a static website. It can be hosted on GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages, or any normal web host.

For GitHub Pages:

1. Create a repository.
2. Upload the complete project.
3. Enable GitHub Pages from repository settings.
4. Select the branch/folder containing `index.html`.
5. Open the generated website URL.

## 12. Customer workflow

Copy the template → edit `js/data.js` → replace images → replace music → test on mobile → deploy.

Do not search through HTML for client names. Keep customer data in `data.js`.
