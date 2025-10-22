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
- **Privacy First** — all data stored locally using IndexedDB, no cloud sync

---

## ⚙️ Tech Stack

- **Frontend:** React 18.2 + Vite 5.0 + TailwindCSS 3.3  
- **UI Components:** Framer Motion (animations) + Lucide React (icons)
- **Backend Logic:** Pure JavaScript modules (in-browser computation)  
- **Data Storage:** IndexedDB with automatic backups
- **Data:** Local normative datasets (`exercise_metrics.json`)  
- **Hosting:** GitHub Pages (static PWA)
- **CI/CD:** GitHub Actions for automated deployment

---

## 🧮 Architecture

```
STARK/
  .github/
    workflows/
      deploy.yml            # Automated deployment workflow
  frontend/
    public/
      manifest.json         # PWA manifest
      sw.js                 # Service worker for offline support
      icons/                # PWA icons (192x192, 512x512)
    src/
      components/
        Onboarding.jsx      # Multi-step user onboarding
      context/
        UnitsContext.jsx    # Global measurement system provider
      data/
        exercise_metrics.json  # Normative fitness data
      utils/
        calculations.js     # Fitness scoring algorithms
        norms.js            # Data normalization utilities
        storage.js          # IndexedDB operations
        units.js            # Metric/Imperial conversions
        units.test.js       # Vitest coverage for conversion helpers
      App.jsx               # Main application component
      main.jsx              # React entry point
      index.css             # TailwindCSS styles
    index.html              # Production entry
    dev.html                # Development entry (with dev mode)
    package.json
    vite.config.js
  docs/                     # Build output for GitHub Pages
    index.html
    dev.html
    assets/
    sprint1_*.md            # Sprint audit + QA notes
  tailwind.config.js
```

---

## 🚀 Deployment

### Automated Deployment (Recommended)
STARK uses **GitHub Actions** for automatic deployment to GitHub Pages. Simply push your changes to the `main` branch and the deployment happens automatically!

**Workflow:**
1. Push code changes to `main` branch
2. GitHub Actions automatically builds the project
3. Built files are deployed to GitHub Pages
4. Your PWA is live at `https://benwassa.github.io/STARK/`

### Manual Development (Local Testing)

#### Prerequisites
- Node.js 18+ 
- npm 8+

#### Option 1: Standard npm (Linux/Mac/WSL)
```bash
cd frontend
npm install
npm run dev          # Start development server at http://localhost:5173
npm run build        # Build for production (outputs to ../docs)
npm run test         # Run Vitest unit suite
npm run preview      # Preview production build
npm run check-versions  # Verify all version files are consistent
```

#### Option 2: Windows PowerShell (Security Policy Workaround)
```powershell
cd frontend
# Use full path to npm.cmd (adjust path based on your Node.js installation)
& "C:\Users\$env:USERNAME\node-v22.20.0-win-x64\npm.cmd" install
& "C:\Users\$env:USERNAME\node-v22.20.0-win-x64\npm.cmd" run dev
& "C:\Users\$env:USERNAME\node-v22.20.0-win-x64\npm.cmd" run build
& "C:\Users\$env:USERNAME\node-v22.20.0-win-x64\npm.cmd" run test
```

### GitHub Pages Setup
1. Go to your repository settings on GitHub
2. Navigate to **Pages** section  
3. Set **Source** to `GitHub Actions`
4. Save changes

The site will be available at `https://benwassa.github.io/STARK/`

---

## 📊 Features

### Core Functionality
- **Multi-Domain Fitness Assessment**: Comprehensive evaluation across 6 fitness domains
  - Strength (20% weight): 1RM lifts, grip strength
  - Endurance (25% weight): VO₂ max, run times, resting heart rate
  - Power (15% weight): Vertical jump, sprint speed
  - Mobility (10% weight): Flexibility tests, range of motion
  - Body Composition (15% weight): Body fat %, BMI, muscle mass
  - Recovery (15% weight): Sleep quality, HRV, stress levels

- **Fitness Index**: Composite percentile score calculated from all domains
- **Fitness Age**: Biological age estimation based on cardiovascular fitness
- **Interactive Spider Chart**: Visual representation of fitness across all domains
- **Metric/Imperial Support**: Toggle between measurement systems
- **Data Export/Import**: JSON-based backup and restore functionality
- **Progressive Web App**: Install on mobile/desktop, works offline
- **Dark Mode**: Sleek dark theme optimized for readability

### Data Management
- **IndexedDB Storage**: Robust local storage with automatic versioning
- **Automatic Backups**: Regular snapshots of user data
- **Import/Export**: Download and restore your complete fitness profile
- **Privacy Focused**: All data stays on your device, zero tracking

### Onboarding Experience
- **Multi-step Setup**: Guided configuration across all fitness domains
- **Contextual Help**: Descriptions and guidance for each metric
- **Flexible Input**: Skip metrics you don't have and fill them in later
- **Unit Conversion**: Automatic conversion between metric and imperial systems

---

## 🛠️ Development Mode

STARK includes a **development mode** for faster testing and debugging. Dev mode provides additional tools and skips the onboarding flow.

### Enabling Dev Mode

**Option 1: URL Parameter (Recommended)**
```
https://benwassa.github.io/STARK/?dev=true
```

**Option 2: Local Development Server**
```bash
# Start local dev server
cd frontend
npm run dev

# Then visit with dev parameter:
# http://localhost:5173/?dev=true
```

**Option 3: Dev HTML File**
```bash
# Open docs/dev.html directly in browser
# Dev mode automatically enabled - no URL parameters needed!
# Works with any local server or VS Code Live Server
```

**Option 4: Persistent (localStorage)**
```javascript
// Run in browser console, then refresh
localStorage.setItem('starkDevMode', 'true');
```

### Dev Mode Features

When dev mode is active, you'll see:
- 🏷️ **"DEV" badge** in the header
- 🗑️ **Clear Data button** (red trash icon) - Reset all app data instantly
- ▶️ **Run Onboarding button** (blue play icon) - Test onboarding flow
- 🗄️ **Load Mock Data button** (green database icon) - Populate with realistic sample data
- 📋 **Console logs** confirming dev mode activation and available tools

### Dev Workflow

```bash
1. Enable dev mode (?dev=true or use dev.html)
2. Click "Load Mock Data" for instant testing with realistic values
3. Test features with sample data across all fitness domains
4. Click "Run Onboarding" to test the complete user setup flow
5. Click "Clear Data" to reset and start fresh
6. Make changes and iterate quickly
```

**Dev mode is completely hidden in production and only accessible via URL parameters, localStorage, or dev.html.**

---

## 🧪 Testing & Quality Assurance

### Version Consistency Check
```bash
npm run check-versions
```
Validates that version numbers are synchronized across:
- `package.json`
- `manifest.json`  
- App footer display

### Manual Testing Checklist
- ✅ Onboarding flow completion
- ✅ Data persistence across sessions
- ✅ PWA installation and offline functionality
- ✅ Metric/Imperial unit conversion
- ✅ Data export and import
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Spider chart rendering and interactivity

---

## 📖 Data Sources & Calculations

### Normative Data
STARK uses evidence-based fitness norms from:
- **ACSM (American College of Sports Medicine)** guidelines
- Population fitness assessment standards
- Age and gender-stratified percentile tables

**Dataset Version:** 1.0.0  
**Last Updated:** 2025-10-17  
**Location:** `frontend/src/data/exercise_metrics.json`

### Calculation Methods

**Fitness Index**  
Weighted composite score across all domains:
```javascript
fitnessIndex = (
  strength × 0.20 + 
  endurance × 0.25 + 
  power × 0.15 + 
  mobility × 0.10 + 
  bodyComp × 0.15 + 
  recovery × 0.15
)
```

**VO₂ Max Estimation**  
Multiple estimation methods supported:
- Cooper 12-minute run test
- 1.5-mile run time
- Direct measurement input

**Fitness Age**  
Calculated using VO₂ max percentile mapping to age-based norms, cross-referenced with gender-specific cardiovascular fitness tables.

**Z-Score Normalization**  
All metrics converted to standardized z-scores, then mapped to percentiles for consistent comparison across different measurement types.

---

## 🔐 Privacy & Security

- **100% Client-Side**: All computations happen in your browser
- **Zero Tracking**: No analytics, cookies, or third-party scripts
- **Local Storage**: Data never leaves your device
- **No Backend**: No servers, databases, or APIs to compromise
- **Offline First**: Full functionality without internet after initial load
- **Open Source**: Complete transparency in code and calculations

---

## 🚧 Known Limitations

- **Browser Storage**: Limited by IndexedDB quota (~50MB typical, varies by browser)
- **No Cloud Sync**: Data doesn't sync across devices (by design for privacy)
- **Manual Entry**: All metrics require manual input (no wearable integration yet)
- **Static Norms**: Normative data is fixed at build time, not dynamically updated

---

## 🧠 Future Work

### Planned Features
- [ ] Enhanced visualization of progress trends over time
- [ ] Custom user profiles with multiple athletes/family members
- [ ] Expanded normative datasets (sport-specific norms)
- [ ] Optional API integration for wearable sync (Garmin, Apple Health, etc.)
- [ ] Training recommendations based on weakest domains
- [ ] Goal setting and progress tracking
- [ ] Comparison with peer groups/age cohorts
- [ ] Export reports as PDF/shareable images

### Technical Improvements
- [ ] Expand automated testing coverage (Vitest + React Testing Library)
- [ ] TypeScript migration for type safety
- [ ] Enhanced PWA features (push notifications for workout reminders)
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (WCAG 2.1 AA compliance)

---

## 📝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/STARK.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Install dependencies: `cd frontend && npm install`
5. Start dev server: `npm run dev`
6. Make your changes
7. Test thoroughly (including dev mode testing)
8. Commit: `git commit -m 'Add amazing feature'`
9. Push: `git push origin feature/amazing-feature`
10. Open a Pull Request

### Code Style
- Use functional React components with hooks
- Follow existing TailwindCSS patterns
- Maintain dark mode theme consistency
- Add JSDoc comments for complex functions
- Keep calculations pure and testable

---

## 📄 License

MIT © 2025 STARK Project

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

---

## 🙏 Acknowledgments

- ACSM for evidence-based fitness guidelines
- React team for the excellent framework
- Vite for blazing-fast build tooling
- TailwindCSS for utility-first styling
- Framer Motion for smooth animations
- The open-source community

---

**Current Version:** 1.4.4
**Repository:** [github.com/BenWassa/STARK](https://github.com/BenWassa/STARK)  
**Live Demo:** [benwassa.github.io/STARK](https://benwassa.github.io/STARK)

---

> "Build a little church, not a cathedral."  
> Simple tools for understanding complex bodies.








