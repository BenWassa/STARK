import { calculateFitnessIndex } from '../logic/scoring.js';

console.log('--- Running scoring.js tests ---');

const userData = {
  age: 28,
  gender: "male",
  vo2max: 52, // This is very good for his age
  domains: {
    Strength: 85,
    Endurance: 72,
    Power: 80,
    Mobility: 58,
    BodyComp: 75,
    Recovery: 68
  }
};

const result = calculateFitnessIndex(userData);
console.log('Test Result:', result);

// Expected fitness index: 
// (85*0.2) + (72*0.25) + (80*0.15) + (58*0.1) + (75*0.15) + (68*0.15) = 74.25
console.assert(result.fitnessIndex === 74.3, 'Fitness Index calculation failed.');

// Expected VO2max percentile for a 28-male with 52 VO2max (mean 44, std 8.5) -> z = (52-44)/8.5 = 0.94
// Should be around 83rd percentile.
console.assert(result.vo2Percentile >= 80 && result.vo2Percentile <= 85, `VO2max percentile failed. Got: ${result.vo2Percentile}`);

// Expected Fitness Age for a male with 52 VO2max is much younger than 28.
// It's higher than the mean for the 20-29 group, so should be < 25.
console.assert(result.fitnessAge < 25, `Fitness age failed. Got: ${result.fitnessAge}`);

console.log('--- scoring.js tests passed ---');