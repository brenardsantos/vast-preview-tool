# VAST Preview Studio

A modern, futuristic video ad preview tool for VAST (Video Ad Serving Template) tags with real-time diagnostics.

## Features

- **Load VAST from URL** — Enter a VAST XML URL and load it
- **Paste Raw XML** — Directly paste VAST XML code
- **CORS Proxy Support** — Use a proxy to bypass CORS restrictions
- **Video Preview** — Play, pause, and stop ad video content
- **Detailed Diagnostics** — View ad metadata, tracking events, and click-through URLs
- **Live Console** — Track all events in real-time
- **Modern UI** — Futuristic dark theme with neon accents

## Files

- `index.html` — Main application page
- `styles.css` — Modern futuristic design with glassmorphism
- `script.js` — VAST parsing, video control, and diagnostics logic
- `README.md` — Documentation

## Usage

1. Open `index.html` in a web browser
2. Enter a VAST URL or paste raw VAST XML
3. Click `Load Preview`
4. Use playback controls to test the video ad
5. Check diagnostics tabs for details, events, and console logs

## CORS Proxy

If loading from URL fails due to CORS:
- Enable the "Use CORS Proxy" checkbox
- The default proxy URL is `https://api.allorigins.win/raw?url=`

## How to Deploy

1. Create a repository on GitHub
2. Upload these files using GitHub's web interface
3. Enable GitHub Pages in Settings
4. Your site will be live at `https://<username>.github.io/<repo-name>/`

## Browser Support

- Chrome, Edge, Firefox, Safari (latest versions)
- Requires JavaScript enabled
