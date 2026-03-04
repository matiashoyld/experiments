# Inaki Birthday Invitation

Star Wars themed interactive birthday invitation for Inaki's 5th birthday.

## Tech stack
- Vanilla HTML/CSS/JS — single `index.html`
- Canvas API for effects (hyperspace jump, starfield, lightsaber cursor trail)
- Google Apps Script backend for RSVP form (submits to Google Sheets)
- Deployed on Vercel

## Local development
Open `index.html` in a browser. No build step.

The RSVP form submits to a Google Apps Script endpoint hardcoded in `index.html`. The script is also saved in `google-apps-script.js` for reference.

## Files
- `index.html` — entire site (HTML + CSS + JS all inline)
- `google-apps-script.js` — Google Sheets RSVP backend (deployed separately in Google Apps Script)
- `*.jpeg`, `*.png`, `*.jpg` — hero images and OG social preview images
