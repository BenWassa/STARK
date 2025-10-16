import { zScore, percentileFromZ, weightedAverage } from '../logic/utils.js';

console.log('--- Running utils.js tests ---');

// Test zScore
console.assert(zScore(50, 40, 10) === 1, 'zScore test 1 failed');
console.assert(zScore(35, 40, 10) === -0.5, 'zScore test 2 failed');

// Test percentileFromZ
console.assert(percentileFromZ(0) >= 49 && percentileFromZ(0) <= 51, 'percentileFromZ at mean failed');
console.assert(percentileFromZ(1) >= 83 && percentileFromZ(1) <= 85, 'percentileFromZ +1 std dev failed');
console.assert(percentileFromZ(-2) >= 1 && percentileFromZ(-2) <= 3, 'percentileFromZ -2 std dev failed');

// Test weightedAverage
const domains = { Strength: 80, Endurance: 70 };
const weights = { Strength: 0.6, Endurance: 0.4 };
const expectedAvg = 80 * 0.6 + 70 * 0.4;
console.assert(weightedAverage(domains, weights) === expectedAvg, 'weightedAverage failed');

console.log('--- utils.js tests passed ---\n');