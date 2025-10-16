/**
 * @fileoverview Master scoring engine for the STARK fitness intelligence system.
 */

import normativeData from '../data/normative_data.json' assert { type: 'json' };
import { weightedAverage } from './utils.js';
import { calculateVo2maxPercentile, calculateFitnessAge } from './vo2max.js';
import { processDomainScores } from './domains.js';

/**
 * The main function to calculate all fitness metrics for a user.
 *
 * @param {Object} userData - The user's metrics.
 * @param {number} userData.age - User's age.
 * @param {string} userData.gender - User's gender ('male' or 'female').
 * @param {number} userData.vo2max - User's VO₂max value.
 * @param {Object} userData.domains - An object containing scores for each fitness domain.
 * @returns {Object} A comprehensive object with all calculated scores.
 */
export function calculateFitnessIndex(userData) {
  const { age, gender, vo2max, domains } = userData;

  // 1. Process domain scores (currently a pass-through)
  const domainScores = processDomainScores(domains);

  // 2. Calculate the weighted Fitness Index from domain scores
  const fitnessIndex = weightedAverage(domainScores, normativeData.domainWeights);

  // 3. Calculate VO₂max percentile
  const vo2Percentile = calculateVo2maxPercentile(vo2max, age, gender);
  
  // 4. Calculate Fitness Age
  const fitnessAge = calculateFitnessAge(vo2max, gender);

  // 5. Assemble the final output object
  return {
    fitnessIndex: parseFloat(fitnessIndex.toFixed(1)),
    fitnessAge,
    vo2Percentile,
    domainScores,
  };
}