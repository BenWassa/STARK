import { describe, it, expect } from 'vitest';
import {
  UNITS,
  getDisplayUnit,
  convertValueToDisplay,
  convertValueToBase
} from './units';

describe('units utility helpers', () => {
  it('maps base units to display units for each system', () => {
    expect(getDisplayUnit('kg', UNITS.METRIC)).toBe('kg');
    expect(getDisplayUnit('kg', UNITS.IMPERIAL)).toBe('lbs');
    expect(getDisplayUnit('cm', UNITS.IMPERIAL)).toBe('in');
    expect(getDisplayUnit('km', UNITS.IMPERIAL)).toBe('miles');
  });

  it('converts base metric weights to imperial display values', () => {
    const lbs = convertValueToDisplay('kg', 100, UNITS.IMPERIAL);
    expect(lbs).toBeCloseTo(220.462, 3);
  });

  it('converts imperial input back to metric base values', () => {
    const kg = convertValueToBase('kg', 220.462, UNITS.IMPERIAL);
    expect(kg).toBeCloseTo(100, 3);
  });

  it('handles length conversions between centimeters and inches', () => {
    const inches = convertValueToDisplay('cm', 180, UNITS.IMPERIAL);
    expect(inches).toBeCloseTo(70.866, 3);

    const centimeters = convertValueToBase('cm', 70.866, UNITS.IMPERIAL);
    expect(centimeters).toBeCloseTo(180, 3);
  });

  it('returns original value when system is metric', () => {
    expect(convertValueToDisplay('kg', 75, UNITS.METRIC)).toBe(75);
    expect(convertValueToBase('cm', 180, UNITS.METRIC)).toBe(180);
  });
});
