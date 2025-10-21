/**
 * Unit conversion utilities for STARK
 * Handles metric/imperial conversions for measurements
 */

export const UNITS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial'
};

/**
 * Weight conversions
 */
export const weightConversions = {
  kgToLbs: (kg) => kg * 2.20462,
  lbsToKg: (lbs) => lbs / 2.20462
};

/**
 * Height conversions
 */
export const heightConversions = {
  cmToFt: (cm) => cm / 30.48,
  ftToCm: (ft) => ft * 30.48,
  cmToIn: (cm) => cm / 2.54,
  inToCm: (inches) => inches * 2.54
};

/**
 * Distance conversions
 */
export const distanceConversions = {
  kmToMiles: (km) => km / 1.60934,
  milesToKm: (miles) => miles * 1.60934,
  mToFt: (m) => m * 3.28084,
  ftToM: (ft) => ft / 3.28084
};

/**
 * Format weight based on measurement system
 */
export const formatWeight = (kg, system = UNITS.METRIC) => {
  if (system === UNITS.IMPERIAL) {
    return `${weightConversions.kgToLbs(kg).toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
};

/**
 * Format height based on measurement system
 */
export const formatHeight = (cm, system = UNITS.METRIC) => {
  if (system === UNITS.IMPERIAL) {
    const ft = Math.floor(heightConversions.cmToFt(cm));
    const inches = Math.round((cm - (ft * 30.48)) / 2.54);
    return `${ft}'${inches}"`;
  }
  return `${cm.toFixed(0)} cm`;
};

/**
 * Format distance based on measurement system
 */
export const formatDistance = (km, system = UNITS.METRIC) => {
  if (system === UNITS.IMPERIAL) {
    return `${distanceConversions.kmToMiles(km).toFixed(1)} miles`;
  }
  return `${km.toFixed(1)} km`;
};

/**
 * Parse weight input based on measurement system
 */
export const parseWeight = (value, system = UNITS.METRIC) => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;

  if (system === UNITS.IMPERIAL) {
    return weightConversions.lbsToKg(num);
  }
  return num;
};

/**
 * Parse height input based on measurement system
 */
export const parseHeight = (value, system = UNITS.METRIC) => {
  if (system === UNITS.IMPERIAL) {
    // Parse format like "5'10""
    const match = value.match(/(\d+)'(\d+)/);
    if (match) {
      const ft = parseInt(match[1]);
      const inches = parseInt(match[2]);
      return heightConversions.ftToCm(ft) + heightConversions.inToCm(inches);
    }
  }
  return parseFloat(value) || 0;
};

/**
 * Get unit labels based on measurement system
 */
export const getUnitLabels = (system = UNITS.METRIC) => {
  if (system === UNITS.IMPERIAL) {
    return {
      weight: 'lbs',
      height: 'ft/in',
      distance: 'miles',
      weightLong: 'pounds',
      heightLong: 'feet and inches',
      distanceLong: 'miles'
    };
  }
  return {
    weight: 'kg',
    height: 'cm',
    distance: 'km',
    weightLong: 'kilograms',
    heightLong: 'centimeters',
    distanceLong: 'kilometers'
  };
};

const normalizeUnit = (unit) => (unit || '').toLowerCase();

const isWeightUnit = (unit) => normalizeUnit(unit) === 'kg';
const isLengthUnit = (unit) => normalizeUnit(unit) === 'cm';
const isDistanceUnit = (unit) => normalizeUnit(unit) === 'km';

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return NaN;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

/**
 * Get the display unit for a base unit given the measurement system.
 */
export const getDisplayUnit = (unit, system = UNITS.METRIC) => {
  const normalized = normalizeUnit(unit);

  if (isWeightUnit(normalized)) {
    return system === UNITS.IMPERIAL ? 'lbs' : 'kg';
  }

  if (isLengthUnit(normalized)) {
    return system === UNITS.IMPERIAL ? 'in' : 'cm';
  }

  if (isDistanceUnit(normalized)) {
    return system === UNITS.IMPERIAL ? 'miles' : 'km';
  }

  return unit;
};

/**
 * Convert a base-unit value to the active measurement system for display.
 */
export const convertValueToDisplay = (unit, value, system = UNITS.METRIC) => {
  const normalized = normalizeUnit(unit);
  const numeric = toNumber(value);

  if (!Number.isFinite(numeric)) {
    return numeric;
  }

  if (isWeightUnit(normalized) && system === UNITS.IMPERIAL) {
    return weightConversions.kgToLbs(numeric);
  }

  if (isLengthUnit(normalized) && system === UNITS.IMPERIAL) {
    return heightConversions.cmToIn(numeric);
  }

  if (isDistanceUnit(normalized) && system === UNITS.IMPERIAL) {
    return distanceConversions.kmToMiles(numeric);
  }

  return numeric;
};

/**
 * Convert a display value back to the base unit (metric) for storage.
 */
export const convertValueToBase = (unit, value, system = UNITS.METRIC) => {
  const normalized = normalizeUnit(unit);
  const numeric = toNumber(value);

  if (!Number.isFinite(numeric)) {
    return numeric;
  }

  if (isWeightUnit(normalized) && system === UNITS.IMPERIAL) {
    return weightConversions.lbsToKg(numeric);
  }

  if (isLengthUnit(normalized) && system === UNITS.IMPERIAL) {
    return heightConversions.inToCm(numeric);
  }

  if (isDistanceUnit(normalized) && system === UNITS.IMPERIAL) {
    return distanceConversions.milesToKm(numeric);
  }

  return numeric;
};
