/**
 * @fileoverview Calculates VO₂max percentile and fitness age.
 */

import { zScore, percentileFromZ } from './utils.js';
import normativeData from '../data/normative_data.json' assert { type: 'json' };

/**
 * Finds the correct normative data group for a user's age and gender.
 * @param {number} age - The user's age.
 * @param {string} gender - The user's gender ('male' or 'female').
 * @returns {Object|null} The normative data object or null if not found.
 */
function getNormativeGroup(age, gender) {
  const norms = normativeData.vo2maxNorms[gender];
  if (!norms) return null;

  for (const group of norms) {
    const [min, max] = group.age.split('-').map(Number);
    if (age >= min && age <= max) {
      return group;
    }
  }
  return null;
}

/**
 * Calculates the user's VO₂max percentile based on their age and gender.
 * @param {number} vo2max - User's VO₂max score.
 * @param {number} age - User's age.
 * @param {string} gender - User's gender.
 * @returns {number|null} The VO₂max percentile or null if data not available.
 */
export function calculateVo2maxPercentile(vo2max, age, gender) {
  const group = getNormativeGroup(age, gender);
  if (!group) return null;

  const z = zScore(vo2max, group.mean, group.std_dev);
  return percentileFromZ(z);
}

/**
 * Calculates the "Fitness Age" by finding the age at which the user's VO₂max
 * would be at the 50th percentile (the mean).
 * @param {number} vo2max - User's VO₂max score.
 * @param {string} gender - User's gender.
 * @returns {number|null} The calculated fitness age or null.
 */
export function calculateFitnessAge(vo2max, gender) {
  const norms = normativeData.vo2maxNorms[gender];
  if (!norms) return null;

  // Find the two age groups the user's vo2max falls between.
  let lowerBound = null;
  let upperBound = null;

  for (const group of norms) {
    if (group.mean >= vo2max) {
      lowerBound = group;
    }
    if (group.mean < vo2max) {
      upperBound = group;
      break;
    }
  }
  
  // Handle edge cases (fitter than the youngest group or less fit than the oldest)
  if (!upperBound) return parseFloat(norms[0].age.split('-')[0]); // Fitter than the best
  if (!lowerBound) return parseFloat(norms[norms.length - 1].age.split('-')[1]); // Less fit than the worst

  // Linear interpolation to estimate the age
  const upperAge = (parseFloat(upperBound.age.split('-')[0]) + parseFloat(upperBound.age.split('-')[1])) / 2;
  const lowerAge = (parseFloat(lowerBound.age.split('-')[0]) + parseFloat(lowerBound.age.split('-')[1])) / 2;
  
  const meanDiff = upperBound.mean - lowerBound.mean;
  const ageDiff = lowerAge - upperAge;

  if (meanDiff === 0) return lowerAge;

  const age = upperAge + ((vo2max - upperBound.mean) / meanDiff) * ageDiff;

  return parseFloat(age.toFixed(1));
}