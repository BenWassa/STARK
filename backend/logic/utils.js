/**
 * @fileoverview Utility functions for mathematical calculations.
 */

/**
 * Calculates the Z-score for a given value.
 * @param {number} value The individual data point.
 * @param {number} mean The mean of the population.
 * @param {number} std The standard deviation of the population.
 * @returns {number} The calculated Z-score.
 */
export function zScore(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}

/**
 * A simplified approximation to get a percentile from a Z-score using a lookup table.
 * This is a common approach to avoid complex erf/gamma functions in vanilla JS.
 * For production systems, a more precise approximation or library would be better.
 * @param {number} z The Z-score.
 * @returns {number} The percentile (0-100).
 */
export function percentileFromZ(z) {
  // Clamp Z-score to a reasonable range for the lookup table
  const clampedZ = Math.max(-3.5, Math.min(3.5, z));

  // A simple polynomial approximation is often sufficient
  // P(z) ≈ 1 / (1 + exp(-0.07056z³ - 1.5976z))
  const p = 1 / (1 + Math.exp(-0.07056 * Math.pow(clampedZ, 3) - 1.5976 * clampedZ));
  
  return Math.round(p * 100);
}


/**
 * Calculates the weighted average of domain scores.
 * @param {Object} domains - An object with domain names as keys and scores as values.
 * @param {Object} weights - An object with domain names as keys and weights as values.
 * @returns {number} The weighted average score.
 */
export function weightedAverage(domains, weights) {
  let totalValue = 0;
  let totalWeight = 0;

  for (const domain in domains) {
    if (weights[domain] && typeof domains[domain] === 'number') {
      totalValue += domains[domain] * weights[domain];
      totalWeight += weights[domain];
    }
  }

  if (totalWeight === 0) return 0;
  return totalValue / totalWeight;
}