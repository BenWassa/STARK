import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Zap, Battery, Droplet, Heart, TrendingUp, Trash2, Ruler, Play, Database, Upload, X, Info, Menu, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import normativeDataRaw from './data/exercise_metrics.json' assert { type: 'json' };
import exerciseMetricsData from './data/exercise_metrics.json' assert { type: 'json' };
import { buildNormativeData } from './utils/norms';

// Build normalized normativeData for app usage
const normativeData = buildNormativeData(normativeDataRaw);
import { calculateZScore, zScoreToPercentile, getPerformanceLabel, calculateFitnessIndex, calculateFitnessAge, calculateUserResults, getDomainConfig, exportUserData } from './utils/calculations';
import { saveUserData, loadUserData, saveAppState, loadAppState, exportAllData, clearAllData, importData, getAllBackups } from './utils/storage';
import packageJson from '../package.json' assert { type: 'json' };
import Onboarding from './components/Onboarding';

// ==================== CONTEXTS ====================
const ThemeContext = createContext();
const DataContext = createContext();

export { DataContext, ThemeContext };

const ThemeProvider = ({ children }) => {
  const [darkMode] = useState(true); // Always dark mode
  const [themeLoading, setThemeLoading] = useState(true);

  useEffect(() => {
    // Ensure dark mode is always applied
    document.documentElement.classList.add('dark');
    setThemeLoading(false);
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

const DataProvider = ({ children, isDevMode, runOnboarding, clearAllAppData, loadMockData, toggleMeasurementSystem }) => {
  const [userData, setUserData] = useState({
    age: 26,
    gender: 'male',
    vo2max: 52,
    birthdate: '', // YYYY-MM-DD format
    measurementSystem: 'metric', // 'metric' or 'imperial'
    loggedExercises: {}, // { exerciseId: value }
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
    <DataContext.Provider value={{ userData, setUserData, isLoading, isDevMode, runOnboarding, clearAllAppData, loadMockData, toggleMeasurementSystem }}>
      {children}
    </DataContext.Provider>
  );
};

// ==================== COMPONENTS ====================
const SpiderChart = ({ data, darkMode }) => {
  const domains = ['strength', 'endurance', 'power', 'mobility', 'bodyComp', 'recovery'];
  const labels = ['Strength', 'Endurance', 'Power', 'Mobility', 'Body Comp', 'Recovery'];
  const size = 320;
  const margin = 48;
  const center = size / 2;
  const maxRadius = center - margin;
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
  const levelCircles = Array.from({ length: levels }, (_, i) => (maxRadius / levels) * (i + 1));

  const axes = domains.map((domain, i) => {
    const angle = (Math.PI * 2 * i) / domains.length - Math.PI / 2;
    const endX = center + maxRadius * Math.cos(angle);
    const endY = center + maxRadius * Math.sin(angle);
    const labelRadius = maxRadius + 18;
    const labelX = center + labelRadius * Math.cos(angle);
    const labelY = center + labelRadius * Math.sin(angle);

    return { endX, endY, labelX, labelY, label: labels[i] };
  });

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-sm md:max-w-md"
        role="img"
        aria-label="Performance radar chart"
      >
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
          fill="rgba(59, 130, 246, 0.18)"
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
            stroke={darkMode ? '#0b1120' : '#ffffff'}
            strokeWidth="2"
          />
        ))}

        {axes.map((axis, i) => {
          const words = axis.label.split(' ');
          const offset = ((words.length - 1) * 11) / 2;
          return (
            <g key={i} transform={`translate(${axis.labelX}, ${axis.labelY})`}>
              {words.map((word, index) => (
                <text
                  key={index}
                  y={index * 11 - offset}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={darkMode ? '#d1d5db' : '#1f2937'}
                >
                  {word}
                </text>
              ))}
            </g>
          );
        })}
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
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [tempBirthdate, setTempBirthdate] = useState('');
  const [tempVo2max, setTempVo2max] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logStep, setLogStep] = useState(0);
  const [tempExercises, setTempExercises] = useState({});

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
      {/* ==================== PERFORMANCE SUMMARY ==================== */}
      {/* Summary Cards */}
      {results && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-lg shadow-blue-500/10"
          >
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Fitness Index
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.fitnessIndex}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Overall Score</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-lg shadow-blue-500/10"
          >
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Fitness Age
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.fitnessAge}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Years</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-lg shadow-blue-500/10"
          >
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              VO₂max
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.vo2max}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">mL/kg/min</p>
          </motion.div>
        </div>
      )}

      {/* ==================== DOMAIN PERFORMANCE OVERVIEW ==================== */}
      {/* Spider Chart */}
      {results && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 shadow-lg shadow-blue-500/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Domain Performance Overview
          </h2>
          <SpiderChart data={results.domains} darkMode={darkMode} />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                // Initialize temp exercises with existing logged values
                setTempExercises(userData.loggedExercises || {});
                setLogStep(0);
                setShowLogModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-200"
            >
              <Database className="w-4 h-4" />
              Log New Lifts
            </button>
          </div>
        </div>
      )}

      {/* ==================== USER PROFILE ==================== */}
      {/* User Profile */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 mb-6 shadow-lg shadow-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
          <button
            onClick={() => {
              setTempBirthdate(userData.birthdate || '');
              setTempVo2max(userData.vo2max || '');
              setShowProfileEditModal(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Age
            </label>
            <p className="text-sm text-gray-900 dark:text-white py-2">
              {userData.birthdate ? 
                Math.floor((new Date() - new Date(userData.birthdate)) / (365.25 * 24 * 60 * 60 * 1000)) :
                userData.age
              } years old
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Gender
            </label>
            <p className="text-sm text-gray-900 dark:text-white py-2 capitalize">
              {userData.gender}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              VO₂max
            </label>
            <p className="text-sm text-gray-900 dark:text-white py-2">
              {userData.vo2max} ml/kg/min
            </p>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
              <button
                onClick={() => setShowProfileEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birthdate
                </label>
                <input
                  type="date"
                  value={tempBirthdate}
                  onChange={(e) => setTempBirthdate(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  VO₂max (ml/kg/min)
                </label>
                <input
                  type="number"
                  value={tempVo2max}
                  onChange={(e) => setTempVo2max(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileEditModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newAge = tempBirthdate ? 
                    Math.floor((new Date() - new Date(tempBirthdate)) / (365.25 * 24 * 60 * 60 * 1000)) : 
                    userData.age;
                  setUserData(prev => ({
                    ...prev,
                    birthdate: tempBirthdate,
                    age: newAge,
                    vo2max: parseFloat(tempVo2max) || prev.vo2max
                  }));
                  setShowProfileEditModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Lifts Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white">
                Log Your Progress
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {Object.keys(exerciseMetricsData.exerciseMetrics).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-12 rounded-full transition-all duration-300 ${
                    index === logStep
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500'
                      : index < logStep
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Domain Cards */}
            <div className="flex-1 overflow-y-auto mb-4">
              <AnimatePresence mode="wait">
                {(() => {
                  const domains = Object.keys(exerciseMetricsData.exerciseMetrics);
                  const currentDomain = domains[logStep];
                  const exercises = exerciseMetricsData.exerciseMetrics[currentDomain];
                  const domainIcons = {
                    strength: TrendingUp,
                    endurance: Heart,
                    power: Zap,
                    mobility: TrendingUp,
                    bodyComp: Droplet,
                    recovery: Battery
                  };
                  const DomainIcon = domainIcons[currentDomain];

                  return (
                    <motion.div
                      key={logStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Domain Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                          <DomainIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-display font-semibold text-gray-900 dark:text-white capitalize">
                            {currentDomain === 'bodyComp' ? 'Body Composition' : currentDomain}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update your {currentDomain} metrics
                          </p>
                        </div>
                      </div>

                      {/* Exercise Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exercises.map((exercise) => (
                          <div key={exercise.id}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {exercise.name}
                              <span className="text-gray-500 dark:text-gray-400 ml-1">
                                ({exercise.unit})
                              </span>
                            </label>
                            <input
                              type="number"
                              value={tempExercises[exercise.id] || ''}
                              onChange={(e) => setTempExercises(prev => ({ 
                                ...prev, 
                                [exercise.id]: e.target.value 
                              }))}
                              placeholder={`e.g. ${exercise.defaultValue}`}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {exercise.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (logStep > 0) setLogStep(logStep - 1);
                }}
                disabled={logStep === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={() => {
                  // Save only the filled exercises
                  setUserData(prev => ({
                    ...prev,
                    loggedExercises: {
                      ...prev.loggedExercises,
                      ...Object.fromEntries(
                        Object.entries(tempExercises).filter(([_, value]) => value !== '' && value !== null)
                      )
                    }
                  }));
                  setShowLogModal(false);
                  setLogStep(0);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-200"
              >
                <Database className="w-4 h-4" />
                Save & Finish
              </button>

              {logStep < Object.keys(exerciseMetricsData.exerciseMetrics).length - 1 ? (
                <button
                  onClick={() => setLogStep(logStep + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setLogStep(logStep + 1)}
                  disabled
                  className="invisible"
                >
                  Placeholder
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ==================== DOMAIN PERFORMANCE BREAKDOWN ==================== */}
      {/* Domain Performance Breakdown */}
      {results && (
        <>
          <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            Domain Performance Breakdown
          </h2>
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
        </>
      )}
    </>
  );
};

// ==================== SHELL LAYOUT ====================
const Shell = ({ children }) => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { userData, isDevMode, runOnboarding, clearAllAppData, loadMockData, toggleMeasurementSystem } = useContext(DataContext);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [latestBackup, setLatestBackup] = useState(null);
  const [importingData, setImportingData] = useState(false);
  const importInputRef = useRef(null);

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

  useEffect(() => {
    if (!isSideNavOpen) {
      return;
    }

    let isMounted = true;

    const fetchBackups = async () => {
      try {
        const backups = await getAllBackups();
        if (!isMounted) {
          return;
        }

        if (backups && backups.length) {
          const latest = backups.reduce((acc, item) => {
            if (!item?.timestamp) {
              return acc;
            }
            if (!acc) {
              return item;
            }
            return new Date(item.timestamp) > new Date(acc.timestamp ?? 0) ? item : acc;
          }, null);

          setLatestBackup(latest);
        } else {
          setLatestBackup(null);
        }
      } catch (error) {
        console.error('Failed to load backup metadata:', error);
        if (isMounted) {
          setLatestBackup(null);
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSideNavOpen(false);
      }
    };

    fetchBackups();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSideNavOpen]);

  useEffect(() => {
    if (isSideNavOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
    document.body.style.overflow = '';
    return undefined;
  }, [isSideNavOpen]);

  const handleImportButtonClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportingData(true);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const success = await importData(parsed);

      if (success) {
        alert('Data imported successfully. The app will reload to apply changes.');
        window.location.reload();
      } else {
        alert('Import failed. Please verify the file contents and try again.');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Unable to import data. Ensure you selected a valid STARK export file.');
    } finally {
      setImportingData(false);
      event.target.value = '';
    }
  };

  const versionLabel = packageJson.version ?? '1.0.0';
  const latestBackupTimestamp = latestBackup?.timestamp
    ? new Date(latestBackup.timestamp).toLocaleString()
    : 'No backups captured yet';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSideNavOpen(true)}
                className="flex items-center justify-center p-2 rounded-full border border-blue-100 dark:border-blue-900/40 bg-white/80 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open STARK navigation"
              >
                <Menu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
              <div className="flex items-center gap-3">
                {/* Activity icon removed per design — kept space for branding */}
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">STARK</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Fitness Module</span>
                    {isDevMode && (
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded font-mono">
                        DEV
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportData}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Export Data"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              {isDevMode && (
                <button
                  onClick={clearAllAppData}
                  className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  title="🛠️ DEV: Clear All Data"
                >
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              )}
              {isDevMode && (
                <button
                  onClick={runOnboarding}
                  className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  title="🛠️ DEV: Run Onboarding"
                >
                  <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </button>
              )}
              {isDevMode && (
                <button
                  onClick={loadMockData}
                  className="p-2 rounded hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                  title="🛠️ DEV: Load Mock Data"
                >
                  <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                </button>
              )}
              <button
                onClick={toggleMeasurementSystem}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={`Switch to ${userData.measurementSystem === 'metric' ? 'Imperial' : 'Metric'} units`}
              >
                <Ruler className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="text-xs text-gray-500 dark:text-gray-400 text-center py-4 border-t border-gray-200 dark:border-gray-800">
        STARK Analytics Engine v{packageJson.version} © 2025 • All calculations performed locally using normative dataset v{normativeData.version}
      </footer>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFileChange}
      />

      {isSideNavOpen && (
        <div className="fixed inset-0 z-40 flex">
          <aside className="relative w-80 sm:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-200 ease-out">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {/* Activity icon removed */}
                <span>STARK Console</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSideNavOpen(false)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="px-5 py-6 space-y-8 overflow-y-auto h-full">
              <section>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span>Data Management</span>
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Export a full snapshot of your metrics, then import to restore on another device. Backups rotate automatically whenever your profile updates.
                </p>
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={exportData}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export data
                  </button>
                  <button
                    type="button"
                    onClick={handleImportButtonClick}
                    disabled={importingData}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {importingData ? 'Importing…' : 'Import data'}
                  </button>
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-3">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    Latest backup
                  </p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {latestBackupTimestamp}
                  </p>
                  {latestBackup?.id && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Slot: {latestBackup.id}
                    </p>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>About</span>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <dt>App version</dt>
                    <dd className="font-semibold text-gray-900 dark:text-gray-100">{versionLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <dt>Measurement</dt>
                    <dd className="font-semibold text-gray-900 dark:text-gray-100">
                      {userData.measurementSystem === 'imperial' ? 'Imperial (lbs, miles)' : 'Metric (kg, km)'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <dt>Last backup</dt>
                    <dd className="font-semibold text-gray-900 dark:text-gray-100">
                      {latestBackup?.timestamp ? new Date(latestBackup.timestamp).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-semibold">Dataset Information</p>
                  <p>Based on: {normativeData.source}</p>
                  <p>Dataset version {normativeData.version} • Updated {normativeData.lastUpdated}</p>
                </div>
              </section>
            </div>
          </aside>
          <div
            className="flex-1 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSideNavOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

// ==================== APP ====================
const App = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Log version info on app load
    console.log(`%c⚡ STARK Fitness v${packageJson.version}`, 'font-weight: bold; font-size: 14px; color: #3b82f6');
    console.log(`📊 Dataset: ${normativeData.source} v${normativeData.version}`);
    console.log(`📅 Build: ${normativeData.lastUpdated}`);
    
    // Check for dev mode using the URL parameter only. We intentionally
    // avoid persisting dev mode to localStorage so visiting `dev.html`
    // doesn't toggle dev mode globally for `index.html`.
    const urlParams = new URLSearchParams(window.location.search);
    const devParam = urlParams.get('dev');

    console.log('🔍 Dev mode check:', { search: window.location.search, devParam, currentUrl: window.location.href });

    if (devParam === 'true') {
      setIsDevMode(true);
      console.log('🛠️ STARK Dev Mode Activated (URL param)');
      console.log('   Features: Skip onboarding, dev tools in header');
      console.log('   Tools: Clear Data (🗑️), Run Onboarding (▶️), Load Mock Data (🗄️)');
      console.log('   To disable: remove ?dev=true from the URL');
    } else {
      console.log('❌ Dev mode not activated');
    }
  }, []);

  const loadMockData = () => {
    const mockData = {
      age: 28,
      gender: 'male',
      vo2max: 48,
      measurementSystem: 'metric',
      strength: 75,
      endurance: 68,
      power: 72,
      mobility: 65,
      bodyComp: 58,
      recovery: 70
    };
    setUserData(mockData);
    console.log('🎭 Mock data loaded:', mockData);
  };

  const runOnboarding = () => {
    setShowOnboarding(true);
  };

  const clearAllAppData = async () => {
    if (window.confirm('⚠️ Clear ALL app data? This cannot be undone!\n\nThis will reset onboarding, user data, and all settings.')) {
      try {
        const success = await clearAllData();
        if (success) {
          // Clear localStorage as well
          localStorage.clear();
          // Reset app state
          setOnboardingComplete(false);
          setAppLoading(true);
          // Reload the page to reset everything
          window.location.reload();
        } else {
          alert('Failed to clear data. Check console for errors.');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Check console for details.');
      }
    }
  };

  const toggleMeasurementSystem = () => {
    const newSystem = userData.measurementSystem === 'metric' ? 'imperial' : 'metric';
    setUserData(prev => ({ ...prev, measurementSystem: newSystem }));
  };

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
          {/* Loading spinner removed for simpler dev UI */}
          <p className="text-gray-600 dark:text-gray-400">Loading STARK...</p>
        </div>
      </div>
    );
  }

  if (!onboardingComplete && !isDevMode) {
    return (
      <ThemeProvider>
        <DataProvider isDevMode={isDevMode} runOnboarding={runOnboarding} clearAllAppData={clearAllAppData} loadMockData={loadMockData} toggleMeasurementSystem={toggleMeasurementSystem}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </DataProvider>
      </ThemeProvider>
    );
  }

  if (showOnboarding) {
    return (
      <ThemeProvider>
        <DataProvider isDevMode={isDevMode} runOnboarding={runOnboarding} clearAllAppData={clearAllAppData} loadMockData={loadMockData} toggleMeasurementSystem={toggleMeasurementSystem}>
          <Onboarding onComplete={() => {
            setShowOnboarding(false);
            handleOnboardingComplete();
          }} />
        </DataProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <DataProvider isDevMode={isDevMode} runOnboarding={runOnboarding} clearAllAppData={clearAllAppData} loadMockData={loadMockData} toggleMeasurementSystem={toggleMeasurementSystem}>
        <Shell>
          <FitnessModule />
        </Shell>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;

