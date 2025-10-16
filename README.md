# 🧩 STARK — Fitness Intelligence, Simplified

STARK is a **static Progressive Web App (PWA)** that runs entirely in the browser.  
It transforms physiological metrics into a clear visual story of fitness and recovery — no servers, no tracking, just data and design.

---

## 🌟 Vision

To make self-quantification simple, transparent, and meaningful.  
STARK turns complex performance data into an elegant dashboard where users can explore:

- **Fitness Index** — composite score of total physical capacity  
- **Domain Insights** — strength, endurance, power, mobility, body composition, recovery  
- **VO₂ Max + Fitness Age** — contextualized using population norms  
- **Trend Visualization** — progress mapped over time  
- **Offline Access** — full functionality without internet

---

## ⚙️ Tech Stack

- **Frontend:** React + Vite + TailwindCSS + shadcn/ui  
- **Backend Logic:** Pure JavaScript modules (in-browser computation)  
- **Data:** Local normative datasets (`/src/data/normativeData.js`)  
- **Hosting:** GitHub Pages (static PWA)

---

## 🧮 Architecture

```

frontend/
├── public/              # index.html, manifest, service worker
├── src/
│   ├── components/      # UI cards, charts, header
│   ├── data/            # normative data & samples
│   ├── logic/           # scoring, vo2max, utils
│   ├── hooks/           # localStorage + theme
│   ├── pages/           # main dashboard
│   └── main.jsx
└── docs/                # build output for GitHub Pages

````

---

## 🚀 Deployment

1. Install dependencies  
   ```bash
   npm install
````

2. Run locally

   ```bash
   npm run dev
   ```
3. Build for GitHub Pages

   ```bash
   npm run build
   cp -r dist/* ../docs/
   git add ../docs && git commit -m "Deploy"
   git push
   ```

Then enable **GitHub Pages** → *Source: main / docs*.

---

## 🧠 Future Work

* Enhanced visualization of progress trends
* Custom user profiles
* Expanded normative datasets
* Optional API integration for wearable sync

---

### License

MIT © 2025 STARK Project

---

> “Build a little church, not a cathedral.”
> Simple tools for understanding complex bodies.
