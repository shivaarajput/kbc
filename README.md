# KBC — Kaun Banega Crorepati

A browser-based **Kaun Banega Crorepati (KBC)** quiz game with local broadcast audio, a 16-question prize ladder up to ₹7 Crore, lifelines, custom quiz import, and 100% offline support.

## Features

- **16-Question Crorepati Ladder**: Progress from ₹1,000 to ₹7,00,00,000 with Safe Havens (Padaav) at Q5 (₹10,000), Q10 (₹3,20,000), and Q15 (₹1,00,00,000).
- **Authentic KBC Flow**:
  - **Title Screen** → **Hot Seat Entry** (contestant name & timer setup) → **Active Hot Seat** → **Winner's Cheque & Round Breakdown**.
  - **Question Reveal & Lock-In**: `kbc-question.mp3` plays before options appear, followed by `kbc-suspense.mp3` during the countdown. Selecting an option highlights it until you click **Lock Answer** (`kbc-lock.mp3`) or time expires.
- **4 Lifelines**:
  - `50:50` — Removes two wrong options.
  - `Audience Poll` — Displays a live vote percentage chart.
  - `Ask Expert` — Shows the expert's recommended option.
  - `Flip` — Swaps the current question once per game.
- **Custom Quizzes**: Upload `.json` or `.csv` quiz files (with downloadable sample templates).
- **Settings & Persistence**: Adjustable timer (`5s`–`300s`), interactive SFX/Music toggles, Fullscreen mode, auto-saved game progress, and a Top Winners leaderboard stored in `localStorage`.
- **Offline Ready**: All audio files, logo, and libraries (`tailwind.js`, `papaparse.min.js`, `lucide.min.js`) are bundled locally.

## Project Structure

```text
KBC/
├── index.html          # Main application pages & in-game overlays
├── kbc-logo.png        # App logo & favicon
├── css/
│   └── style.css       # Studio backdrop, KBC option bars, animations
├── js/
│   ├── data.js         # Default 16-question quiz, backup questions, JSON/CSV parser
│   ├── audio.js        # Scene-aware audio engine with Web Audio fallbacks
│   ├── state.js        # State, localStorage persistence, leaderboard, prize ladder
│   └── app.js          # Screen flow, Hot Seat gameplay, timer, lifelines, upload
├── audio/              # Local MP3 sound effects & themes
└── vendor/             # Local Tailwind, PapaParse, and Lucide bundles
```

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

