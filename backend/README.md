# STARK Backend Logic

## 🎯 Overview

This folder contains the computational backend logic for **STARK**, a client-side fitness intelligence system. It is designed to be a lightweight, serverless "brain" that runs directly in the browser.

The modules translate user metrics (age, gender, VO₂max, etc.) into comprehensive fitness scores, percentiles, and a "Fitness Age" using normative population data.

## ⚙️ How It Works

The system is composed of several small, interconnected ES modules:

1.  **`scoring.js`**: The main entry point. It orchestrates calls to other modules.
2.  **`vo2max.js`**: Calculates VO₂max-based percentile and Fitness Age.
3.  **`domains.js`**: Normalizes scores for different fitness domains (Strength, Endurance, etc.).
4.  **`utils.js`**: Provides pure mathematical helpers (`zScore`, `weightedAverage`, etc.).
5.  **`data/normative_data.json`**: A static JSON file containing all reference data (population means, standard deviations, and domain weights).

The entire calculation process is synchronous and has no external dependencies, ensuring instant performance on the client side.

## 🚀 Frontend Integration

Integrating the backend into your React application is straightforward.

1.  **Copy the `backend/` folder** into your project's `src/` directory.
2.  **Import the main function** from `scoring.js`.
3.  **Call the function** with the user data object.

### Example Usage

```javascript
// In your React component
import { calculateFitnessIndex } from './backend/logic/scoring.js';

function UserProfile() {
  const userData = {
    age: 28,
    gender: "male",
    vo2max: 52,
    domains: {
      Strength: 85,
      Endurance: 72,
      Power: 80,
      Mobility: 58,
      BodyComposition: 75,
      Recovery: 68
    }
  };

  const fitnessReport = calculateFitnessIndex(userData);

  // Now you can use the results to render your UI
  return (
    <div>
      <h2>Your Fitness Report</h2>
      <p>Fitness Index: {fitnessReport.fitnessIndex}</p>
      <p>Fitness Age: {fitnessReport.fitnessAge}</p>
      <p>VO₂max Percentile: {fitnessReport.vo2Percentile}%</p>
    </div>
  );
}
```

## 🧮 Available Functions

### `calculateFitnessIndex(userData)`

The primary function that computes all metrics.

**Input (userData object):**

- `age`: number
- `gender`: string ("male" or "female")
- `vo2max`: number
- `domains`: Object (keys are domain names, values are scores 0-100)

**Output (object):**

- `fitnessIndex`: number (weighted average of domain scores)
- `fitnessAge`: number (estimated age based on VO₂max)
- `vo2Percentile`: number (0-100)
- `domainScores`: Object (the processed domain scores)

## ✅ Testing

To verify that all calculations are correct, open the `tests/runTests.html` file in any modern browser. Open the developer console (F12) to see the test output from `console.assert`.

## 📄 License and Data Citation

This software is provided as-is. The normative data in `data/normative_data.json` is for illustrative purposes only and is generally based on public fitness statistics. For clinical or professional use, always consult primary sources and standards, such as those provided by the American College of Sports Medicine (ACSM).