import React, { useState, useEffect, createContext, useContext } from 'react';
import { Moon, Sun, Download, Activity, Zap, Battery, Droplet, Heart, TrendingUp } from 'lucide-react';
import normativeDataRaw from './data/exercise_metrics.json' assert { type: 'json' };
import { calculateZScore, zScoreToPercentile, getPerformanceLabel, calculateFitnessIndex, calculateFitnessAge, calculateUserResults, getDomainConfig, exportUserData } from './utils/calculations';
import { saveUserData, loadUserData, saveAppState, loadAppState, exportAllData } from './utils/storage';
import Onboarding from './components/Onboarding';

// ==================== CONTEXTS ====================
const ThemeContext = createContext();
const DataContext = createContext();

export { DataContext, ThemeContext };

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoading, setThemeLoading] = useState(true);

  useEffect(() => {
    // Load theme preference from IndexedDB
    const loadTheme = async () => {
      try {
        const saved = await loadAppState('starkDarkMode');
        if (saved !== null) {
          setDarkMode(saved === 'true');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setThemeLoading(false);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    if (!themeLoading) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Save theme preference to IndexedDB
      const saveTheme = async () => {
        try {
          await saveAppState('starkDarkMode', String(darkMode));
        } catch (error) {
          console.error('Failed to save theme:', error);
        }
      };

      saveTheme();
    }
  }, [darkMode, themeLoading]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

const DataProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    age: 26,
    gender: 'male',
    vo2max: 52,
    strength: 50,
    endurance: 45,
    power: 40,
    mobility: 55,
    bodyComp: 60,
    recovery: 50
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from IndexedDB on mount
    const loadData = async () => {
      try {
        const savedData = await loadUserData();
        if (savedData) {
          setUserData(savedData);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to IndexedDB whenever userData changes
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await saveUserData(userData);
        } catch (error) {
          console.error('Failed to save user data:', error);
        }
      };

      // Debounce saves to avoid excessive writes
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [userData, isLoading]);

  return (
    <DataContext.Provider value={{ userData, setUserData, isLoading }}>
      {children}
    </DataContext.Provider>
  );
};

// ==================== COMPONENTS ====================
const SpiderChart = ({ data, darkMode }) => {
  const domains = ['strength', 'endurance', 'power', 'mobility', 'bodyComp', 'recovery'];
  const labels = ['Strength', 'Endurance', 'Power', 'Mobility', 'Body Comp', 'Recovery'];
  const size = 400;
  const center = size / 2;
  const maxRadius = 160;
  const levels = 5;

  const calculatePoint = (value, index) => {
    const angle = (Math.PI * 2 * index) / domains.length - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  const dataPoints = domains.map((domain, i) => calculatePoint(data[domain] || 0, i));
  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const levelCircles = Array.from({ length: levels }, (_, i) => {
    const radius = (maxRadius / levels) * (i + 1);
    return radius;
  });

  const axes = domains.map((domain, i) => {
    const angle = (Math.PI * 2 * i) / domains.length - Math.PI / 2;
    const endX = center + maxRadius * Math.cos(angle);
    const endY = center + maxRadius * Math.sin(angle);
    const labelX = center + (maxRadius + 35) * Math.cos(angle);
    const labelY = center + (maxRadius + 35) * Math.sin(angle);
    
    return { endX, endY, labelX, labelY, label: labels[i] };
  });

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {levelCircles.map((radius, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={darkMode ? '#374151' : '#e5e7eb'}
            strokeWidth="1"
          />
        ))}

        {axes.map((axis, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={axis.endX}
            y2={axis.endY}
            stroke={darkMode ? '#4b5563' : '#d1d5db'}
            strokeWidth="1"
          />
        ))}

        <path
          d={polygonPath}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {axes.map((axis, i) => (
          <text
            key={i}
            x={axis.labelX}
            y={axis.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-medium ${darkMode ? 'fill-gray-300' : 'fill-gray-700'}`}
          >
            {axis.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const DomainCard = ({ domain, score, percentile, zScore, icon: Icon }) => {
  const perfLabel = getPerformanceLabel(percentile);
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-opacity">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {domain === 'bodyComp' ? 'Body Comp' : domain}
          </h3>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {Math.round(percentile)}%
        </span>
      </div>
      
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-700"
          style={{ width: `${percentile}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">
          Score: {score}
        </span>
        <span className={perfLabel.color + ' font-medium'}>
          {perfLabel.label}
        </span>
      </div>
      
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        z = {zScore.toFixed(2)}
      </p>
    </div>
  );
};

// ==================== FITNESS MODULE ====================
const FitnessModule = () => {
  const { darkMode } = useContext(ThemeContext);
  const { userData, setUserData } = useContext(DataContext);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const results = calculateUserResults(userData);
    setResults(results);
  }, [userData]);

  const updateField = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const domainConfig = getDomainConfig();

  return (
    <>
      {/* Summary Cards */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Fitness Index
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{results.fitnessIndex}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Performance Score</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Fitness Age
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{results.fitnessAge}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estimated Years</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              VO₂max
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{results.vo2max}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">mL/kg/min</p>
          </div>
        </div>
      )}

      {/* Spider Chart */}
      {results && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Domain Performance Overview
          </h2>
          <SpiderChart data={results.domains} darkMode={darkMode} />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Based on: <span className="font-semibold">{normativeData.source}</span><br/>
            Dataset version {normativeData.version} • Updated {normativeData.lastUpdated}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Age
            </label>
            <input
              type="number"
              value={userData.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Gender
            </label>
            <select
              value={userData.gender}
              onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              VO₂max
            </label>
            <input
              type="number"
              value={userData.vo2max}
              onChange={(e) => updateField('vo2max', e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Domain Inputs */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Domain Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainConfig.map(({ key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                {key === 'bodyComp' ? 'Body Comp' : key}
              </label>
              <input
                type="number"
                value={userData[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Domain Cards */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainConfig.map(({ key, icon }) => (
            <DomainCard
              key={key}
              domain={key}
              score={userData[key]}
              percentile={results.domains[key]}
              zScore={results.zScores[key]}
              icon={icon}
            />
          ))}
        </div>
      )}
    </>
  );
};

// ==================== SHELL LAYOUT ====================
const Shell = ({ children }) => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { userData } = useContext(DataContext);

  const exportData = async () => {
    try {
      const exportedData = await exportAllData();
      if (exportedData) {
        const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stark-fitness-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">STARK</h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">Fitness Module</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportData}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Export Data"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="text-xs text-gray-500 dark:text-gray-400 text-center py-4 border-t border-gray-200 dark:border-gray-800">
        STARK Analytics Engine © 2025 • All calculations performed locally using normative dataset v{normativeData.version}
      </footer>
    </div>
  );
};

// ==================== APP ====================
const App = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Check if onboarding is complete
    const checkOnboarding = async () => {
      try {
        const complete = await loadAppState('onboardingComplete');
        setOnboardingComplete(complete === true);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setOnboardingComplete(false);
      } finally {
        setAppLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading STARK...</p>
        </div>
      </div>
    );
  }

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <ThemeProvider>
      <DataProvider>
        <Shell>
          <FitnessModule />
        </Shell>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;