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

### Automated Deployment (Recommended)
STARK uses **GitHub Actions** for automatic deployment to GitHub Pages. Simply push your changes to the `main` branch and the deployment happens automatically!

**Workflow:**
1. Push code changes to `main` branch
2. GitHub Actions automatically builds the project
3. Built files are deployed to GitHub Pages
4. Your PWA is live at `https://[username].github.io/[repository-name]/`

### Manual Development (Optional)
For local development and testing:

#### Option 1: Standard npm (Linux/Mac)
```bash
cd frontend
npm install
npm run dev          # Start development server
npm run build        # Build for production
```

#### Option 2: Windows PowerShell (Security Policy Workaround)
```powershell
cd frontend
# Use full path to npm.cmd (adjust path based on your Node.js installation)
& "C:\Users\$env:USERNAME\node-v22.20.0-win-x64\npm.cmd" install
& "C:\Users\$env:USERNAME\node-v22.20.0-win-x64\npm.cmd" run dev
& "C:\Users\$env:USERNAME\node-v22.20.0-win-x64\npm.cmd" run build
```

### Enable GitHub Pages
1. Go to your repository settings
2. Navigate to **Pages** section  
3. Set **Source** to `GitHub Actions`
4. Save changes

Your PWA will be available at `https://[username].github.io/[repository-name]/`

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
