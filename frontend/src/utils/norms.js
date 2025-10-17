const DEFAULT_DOMAIN_STATS = {
  strength: { mean: 50, std: 15 },
  endurance: { mean: 45, std: 12 },
  power: { mean: 40, std: 10 },
  mobility: { mean: 55, std: 14 },
  bodyComp: { mean: 60, std: 18 },
  recovery: { mean: 50, std: 13 }
};

const normalizeDomainKey = (label) => {
  const normalized = label.replace(/\s+/g, '').toLowerCase();

  switch (normalized) {
    case 'bodycomp':
      return 'bodyComp';
    default:
      return normalized;
  }
};

const parseAgeRange = (range) => {
  const [minPart, maxPart] = range.split('-');
  const minAge = Number.parseInt(minPart, 10);
  const maxAge = Number.parseInt(maxPart, 10);

  return {
    minAge: Number.isNaN(minAge) ? null : minAge,
    maxAge: Number.isNaN(maxAge) ? null : maxAge
  };
};

export const buildNormativeData = (rawData) => {
  const domains = Object.entries(rawData?.domainWeights || {}).reduce((acc, [label, weight]) => {
    const key = normalizeDomainKey(label);
    const defaults = DEFAULT_DOMAIN_STATS[key] || DEFAULT_DOMAIN_STATS.strength;

    acc[key] = {
      weight,
      mean: defaults.mean,
      std: defaults.std
    };

    return acc;
  }, {});

  const vo2maxNorms = Object.entries(rawData?.vo2maxNorms || {}).reduce((acc, [gender, entries]) => {
    acc[gender] = entries
      .map((entry) => {
        const { minAge, maxAge } = parseAgeRange(entry.age);
        return {
          label: entry.age,
          minAge,
          maxAge,
          mean: entry.mean,
          std: entry.std_dev ?? entry.std ?? 1
        };
      })
      .sort((a, b) => (a.minAge ?? 0) - (b.minAge ?? 0));

    return acc;
  }, {});

  return {
    version: rawData?.version || '1.1.0',
    description:
      rawData?.description || 'Normative data for fitness scoring based on ACSM guidelines',
    lastUpdated: rawData?.lastUpdated || '2024-10',
    source: rawData?.source || 'ACSM Guidelines, 11th Ed.',
    domains,
    vo2maxNorms,
    dataSource: rawData?.dataSource
  };
};

export default buildNormativeData;
