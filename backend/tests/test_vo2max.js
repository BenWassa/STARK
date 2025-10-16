import { calculateVo2maxPercentile, calculateFitnessAge } from '../logic/vo2max.js';

console.log('--- Running vo2max.js tests ---');

// Test percentile calculation
// A 25-year-old male with a VO2max of 44 should be at the 50th percentile
const percentile1 = calculateVo2maxPercentile(44, 25, 'male');
console.assert(percentile1 >= 49 && percentile1 <= 51, `VO2max Percentile Test 1 Failed. Got: ${percentile1}`);

// A 32-year-old female with a VO2max of 43 is above average
const percentile2 = calculateVo2maxPercentile(43, 32, 'female');
console.assert(percentile2 > 50, `VO2max Percentile Test 2 Failed. Got: ${percentile2}`);

// Test fitness age calculation
// A male with VO2max of 40 should have a fitness age around 45
const fitnessAge1 = calculateFitnessAge(40, 'male');
console.assert(fitnessAge1 >= 44 && fitnessAge1 <= 46, `Fitness Age Test 1 Failed. Got: ${fitnessAge1}`);

// A female with VO2max of 38 should have a fitness age around 25
const fitnessAge2 = calculateFitnessAge(38, 'female');
console.assert(fitnessAge2 >= 24 && fitnessAge2 <= 26, `Fitness Age Test 2 Failed. Got: ${fitnessAge2}`);

console.log('--- vo2max.js tests passed ---\n');