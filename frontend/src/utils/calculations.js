/**
 * Fitness calculation utilities for STARK
 * Extracted from App.jsx for better organization
 */

import { Heart, Zap, TrendingUp, Droplet, Battery } from 'lucide-react';
import { buildNormativeData } from './norms';

// Import normative data
import normativeDataRaw from '../data/exercise_metrics.json' assert { type: 'json' };
const normativeData = buildNormativeData(normativeDataRaw);

/**
 * Calculate z-score for a value given mean and standard deviation
 */
export const calculateZScore = (value, mean, std) => {
  return (value - mean) / std;
};

/**
 * Convert z-score to percentile using standard normal distribution
 */
export const zScoreToPercentile = (z) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? (1 - p) * 100 : p * 100;
};

/**
 * Get performance label based on percentile
 */
export const getPerformanceLabel = (percentile) => {
  if (percentile >= 85) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
  if (percentile >= 70) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
  if (percentile >= 40) return { label: 'Average', color: 'text-gray-600 dark:text-gray-400' };
  if (percentile >= 25) return { label: 'Fair', color: 'text-orange-600 dark:text-orange-400' };
  return { label: 'Needs Work', color: 'text-red-600 dark:text-red-400' };
};

/**
 * Calculate overall fitness index from domain scores
 */
export const calculateFitnessIndex = (domainScores) => {
  let totalScore = 0;
  Object.entries(normativeData.domains).forEach(([domain, config]) => {
    const score = domainScores[domain] || 50;
    totalScore += score * config.weight;
  });
  return Math.round(totalScore);
};

/**
 * Calculate fitness age based on VO2max and gender
 */
export const calculateFitnessAge = (age, vo2max, gender) => {
  const norms = normativeData.vo2maxNorms[gender];

  if (!norms || norms.length === 0) {
    return age;
  }

  for (let i = 0; i < norms.length; i++) {
    const group = norms[i];
    if (group.mean === undefined) {
      continue;
    }

    if (vo2max >= group.mean) {
      return group.minAge ?? age;
    }
  }

  const lastGroup = norms[norms.length - 1];
  const fallbackAge = lastGroup.maxAge ?? lastGroup.minAge ?? age;
  return fallbackAge + 5;
};

/**
 * Calculate comprehensive fitness results for a user
 */
export const calculateUserResults = (userData) => {
  const domainScores = {};
  const domainPercentiles = {};
  const domainZScores = {};

  Object.entries(normativeData.domains).forEach(([domain, config]) => {
    const value = userData[domain];
    const z = calculateZScore(value, config.mean, config.std);
    const percentile = zScoreToPercentile(z);

    domainScores[domain] = value;
    domainPercentiles[domain] = percentile;
    domainZScores[domain] = z;
  });

  const fitnessIndex = calculateFitnessIndex(domainScores);
  const fitnessAge = calculateFitnessAge(userData.age, userData.vo2max, userData.gender);

  return {
    fitnessIndex,
    fitnessAge,
    vo2max: userData.vo2max,
    domains: domainPercentiles,
    zScores: domainZScores
  };
};

/**
 * Get domain configuration with icons
 */
export const getDomainConfig = () => {
  return [
  { key: 'strength', icon: TrendingUp },
    { key: 'endurance', icon: Heart },
    { key: 'power', icon: Zap },
    { key: 'mobility', icon: TrendingUp },
    { key: 'bodyComp', icon: Droplet },
    { key: 'recovery', icon: Battery }
  ];
};

/**
 * Export user data with results and metadata
 */
export const exportUserData = (userData, results) => {
  return {
    userData,
    results,
    metadata: {
      version: normativeData.version,
      description: normativeData.description,
      source: normativeData.source,
      generatedAt: new Date().toISOString()
    }
  };
};