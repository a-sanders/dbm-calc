# dBm, watts and volts calculator

Enter any one of power (dBm), power (µW / mW / W) or RMS voltage (nV … kV); the other two update instantly. Load: R = 50 Ω.

Live version: `https://<user>.github.io/<repo>/` (replace with your Pages URL; in repo settings set Pages → Source: GitHub Actions).

## Develop

    npm start         # static server at http://localhost:8080

No build step and no runtime dependencies. The calculation core is `src/core.js` (no DOM); the UI is `index.html` + `src/app.js`.
Pushing to `main` deploys to GitHub Pages.
