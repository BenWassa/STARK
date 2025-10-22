import React, { createContext, useContext, useMemo, useCallback } from 'react';
import {
  UNITS,
  getDisplayUnit as rawGetDisplayUnit,
  convertValueToDisplay as rawConvertValueToDisplay,
  convertValueToBase as rawConvertValueToBase
} from '../utils/units';

const noop = () => {};

const UnitsContext = createContext({
  system: UNITS.METRIC,
  isMetric: true,
  isImperial: false,
  setSystem: noop,
  toggleSystem: noop,
  getDisplayUnit: (unit) => rawGetDisplayUnit(unit, UNITS.METRIC),
  convertValueToDisplay: (unit, value) => rawConvertValueToDisplay(unit, value, UNITS.METRIC),
  convertValueToBase: (unit, value) => rawConvertValueToBase(unit, value, UNITS.METRIC)
});

UnitsContext.displayName = 'UnitsContext';

export const UnitsProvider = ({ system = UNITS.METRIC, setSystem = noop, children }) => {
  const normalizedSystem = system === UNITS.IMPERIAL ? UNITS.IMPERIAL : UNITS.METRIC;

  const updateSystem = useCallback(
    (nextSystem) => {
      const normalizedNext = nextSystem === UNITS.IMPERIAL ? UNITS.IMPERIAL : UNITS.METRIC;
      setSystem(normalizedNext);
    },
    [setSystem]
  );

  const toggleSystem = useCallback(() => {
    updateSystem(normalizedSystem === UNITS.METRIC ? UNITS.IMPERIAL : UNITS.METRIC);
  }, [normalizedSystem, updateSystem]);

  const contextValue = useMemo(
    () => ({
      system: normalizedSystem,
      isMetric: normalizedSystem === UNITS.METRIC,
      isImperial: normalizedSystem === UNITS.IMPERIAL,
      setSystem: updateSystem,
      toggleSystem,
      getDisplayUnit: (unit, overrideSystem) =>
        rawGetDisplayUnit(unit, overrideSystem || normalizedSystem),
      convertValueToDisplay: (unit, value, overrideSystem) =>
        rawConvertValueToDisplay(unit, value, overrideSystem || normalizedSystem),
      convertValueToBase: (unit, value, fromSystem) =>
        rawConvertValueToBase(unit, value, fromSystem || normalizedSystem)
    }),
    [normalizedSystem, toggleSystem, updateSystem]
  );

  return <UnitsContext.Provider value={contextValue}>{children}</UnitsContext.Provider>;
};

export const useUnits = () => useContext(UnitsContext);

export { UnitsContext };
