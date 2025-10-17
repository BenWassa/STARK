import React, { useState, useContext } from 'react';
import { ChevronLeft, ChevronRight, Check, Activity, Heart, Zap, TrendingUp, Droplet, Battery } from 'lucide-react';
import { DataContext } from '../App';
import { saveAppState } from '../utils/storage';
import { weightConversions, heightConversions, distanceConversions } from '../utils/units';

const Onboarding = ({ onComplete }) => {
  const { userData, setUserData } = useContext(DataContext);
  const [currentStep, setCurrentStep] = useState(0);

  // Helper functions for unit conversions and labels
  const isImperial = userData.measurementSystem === 'imperial';
  
  const getWeightUnit = () => isImperial ? 'lbs' : 'kg';
  const getHeightUnit = () => isImperial ? 'in' : 'cm';
  const getDistanceUnit = () => isImperial ? 'miles' : 'km';
  
  const convertWeight = (kg) => isImperial ? Math.round(weightConversions.kgToLbs(kg)) : kg;
  const convertHeight = (cm) => isImperial ? Math.round(heightConversions.cmToIn(cm)) : cm;

  const steps = [
    {
      title: 'Welcome to STARK',
      description: 'Let\'s set up your fitness profile for personalized insights',
      component: 'welcome'
    },
    {
      title: 'Basic Information',
      description: 'Tell us about yourself',
      component: 'basic'
    },
    {
      title: 'Strength Metrics',
      description: 'Your maximum lifts and strength indicators',
      component: 'strength'
    },
    {
      title: 'Endurance & Cardio',
      description: 'Heart health and sustained performance',
      component: 'endurance'
    },
    {
      title: 'Power & Explosiveness',
      description: 'Explosive movements and athletic power',
      component: 'power'
    },
    {
      title: 'Mobility & Flexibility',
      description: 'Movement quality and range of motion',
      component: 'mobility'
    },
    {
      title: 'Body Composition',
      description: 'Your physique and body measurements',
      component: 'bodycomp'
    },
    {
      title: 'Recovery & Wellness',
      description: 'Rest, stress, and recovery indicators',
      component: 'recovery'
    },
    {
      title: 'All Set!',
      description: 'Your fitness profile is ready',
      component: 'complete'
    }
  ];

  const updateField = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: parseFloat(value) || value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await saveAppState('onboardingComplete', true);
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
      onComplete(); // Still complete even if save fails
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.component) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <Activity className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to STARK
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Transform your physiological data into clear fitness insights.
              We'll guide you through setting up your personalized profile.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This will take about 5 minutes and you can update any metric later.
              </p>
            </div>
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={userData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={userData.gender}
                  onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  VO₂ Max (mL/kg/min)
                </label>
                <input
                  type="number"
                  value={userData.vo2max}
                  onChange={(e) => updateField('vo2max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="20"
                  max="80"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Estimate: 15-20 for poor, 35-40 for good, 45+ for excellent
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Measurement System
              </label>
              <select
                value={userData.measurementSystem || 'metric'}
                onChange={(e) => setUserData(prev => ({ ...prev, measurementSystem: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="metric">Metric (kg, cm, km)</option>
                <option value="imperial">Imperial (lbs, ft, miles)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred unit system. You can change this later in settings.
              </p>
            </div>
          </div>
        );

      case 'strength':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strength Assessment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bench Press 1RM ({getWeightUnit()})
                </label>
                <input
                  type="number"
                  value={userData.bench_press_1rm || ''}
                  onChange={(e) => updateField('bench_press_1rm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`e.g., ${convertWeight(80)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Squat 1RM ({getWeightUnit()})
                </label>
                <input
                  type="number"
                  value={userData.squat_1rm || ''}
                  onChange={(e) => updateField('squat_1rm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`e.g., ${convertWeight(100)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deadlift 1RM ({getWeightUnit()})
                </label>
                <input
                  type="number"
                  value={userData.deadlift_1rm || ''}
                  onChange={(e) => updateField('deadlift_1rm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`e.g., ${convertWeight(120)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overhead Press 1RM ({getWeightUnit()})
                </label>
                <input
                  type="number"
                  value={userData.overhead_press_1rm || ''}
                  onChange={(e) => updateField('overhead_press_1rm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`e.g., ${convertWeight(50)}`}
                />
              </div>
            </div>
          </div>
        );

      case 'endurance':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Endurance & Cardio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resting Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={userData.resting_hr || ''}
                  onChange={(e) => updateField('resting_hr', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 65"
                  min="40"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Push-ups
                </label>
                <input
                  type="number"
                  value={userData.pushup_max || ''}
                  onChange={(e) => updateField('pushup_max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plank Hold (seconds)
                </label>
                <input
                  type="number"
                  value={userData.plank_time || ''}
                  onChange={(e) => updateField('plank_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 60"
                />
              </div>
            </div>
          </div>
        );

      case 'power':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Power & Explosiveness</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vertical Jump ({getHeightUnit()})
                </label>
                <input
                  type="number"
                  value={userData.vertical_jump || ''}
                  onChange={(e) => updateField('vertical_jump', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`e.g., ${convertHeight(50)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Broad Jump ({getHeightUnit()})
                </label>
                <input
                  type="number"
                  value={userData.broad_jump || ''}
                  onChange={(e) => updateField('broad_jump', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`e.g., ${convertHeight(220)}`}
                />
              </div>
            </div>
          </div>
        );

      case 'mobility':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mobility & Flexibility</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sit & Reach ({getHeightUnit()})
                </label>
                <input
                  type="number"
                  value={userData.sit_reach || ''}
                  onChange={(e) => updateField('sit_reach', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`e.g., ${convertHeight(5)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shoulder Flexibility (cm)
                </label>
                <input
                  type="number"
                  value={userData.shoulder_flexibility || ''}
                  onChange={(e) => updateField('shoulder_flexibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 12"
                />
              </div>
            </div>
          </div>
        );

      case 'bodycomp':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Body Composition</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body Fat (%)
                </label>
                <input
                  type="number"
                  value={userData.body_fat_percentage || ''}
                  onChange={(e) => updateField('body_fat_percentage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 15"
                  min="3"
                  max="50"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waist Circumference (cm)
                </label>
                <input
                  type="number"
                  value={userData.waist_circumference || ''}
                  onChange={(e) => updateField('waist_circumference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 80"
                />
              </div>
            </div>
          </div>
        );

      case 'recovery':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Battery className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recovery & Wellness</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sleep Quality (1-10)
                </label>
                <input
                  type="number"
                  value={userData.sleep_quality || ''}
                  onChange={(e) => updateField('sleep_quality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Muscle Soreness (1-10)
                </label>
                <input
                  type="number"
                  value={userData.soreness_level || ''}
                  onChange={(e) => updateField('soreness_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stress Level (1-10)
                </label>
                <input
                  type="number"
                  value={userData.stress_level || ''}
                  onChange={(e) => updateField('stress_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              You're All Set!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your fitness profile has been created. You can now explore your personalized
              fitness insights and update any metrics as needed.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                💡 Tip: Your data is automatically saved and backed up locally.
                You can export your data anytime from the settings menu.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={completeOnboarding}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Get Started
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;