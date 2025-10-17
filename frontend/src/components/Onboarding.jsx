import React, { useState, useContext } from 'react';
import { ChevronLeft, ChevronRight, Check, Activity, Heart, Zap, TrendingUp, Droplet, Battery } from 'lucide-react';
import { DataContext } from '../App';
import { saveAppState } from '../utils/storage';
import { weightConversions, heightConversions, distanceConversions } from '../utils/units';
import starkLogo from '../assets/stark_logo_rounded.png';
import starkPersonHealth from '../assets/stark_personhealth.png';

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
      title: 'Orientation',
      description: '',
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

  const currentStepMeta = steps[currentStep];
  const isBasicStep = currentStepMeta.component === 'basic';
  const showStepTitle = currentStep !== 0 && !isBasicStep && Boolean(currentStepMeta.title);
  const showStepDescription = !isBasicStep && Boolean(currentStepMeta.description);

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
          <div className="text-center py-12 relative">
            {/* Animated Logo */}
            <div className="relative mb-8 animate-fade-in">
              <div className="absolute inset-0 blur-3xl opacity-25">
                <img
                  src={starkLogo}
                  alt=""
                  aria-hidden="true"
                  className="w-32 h-32 mx-auto select-none pointer-events-none"
                />
              </div>
              <img
                src={starkLogo}
                alt="STARK emblem"
                className="w-32 h-32 mx-auto relative animate-pulse-slow drop-shadow-xl"
                decoding="async"
                draggable="false"
              />
            </div>
            
            {/* Hero Text */}
            <div className="space-y-6 mb-8 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Welcome to STARK
              </h2>
              <div className="space-y-2">
                <p className="text-xl font-medium text-blue-600 dark:text-blue-400">
                  Optimize Human Performance.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Measure. Adapt. Evolve.
                </p>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Data-Driven Strength Intelligence. We'll guide you through setting up your personalized performance profile.
            </p>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Quick setup (~5 minutes) | Metrics can be updated anytime
              </p>
            </div>

          </div>
        );

      case 'basic':
        return (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(120px,160px)] gap-6 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Basic Information
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Tell us about yourself
                </p>
              </div>

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
                    VO2 Max (mL/kg/min)
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

            <div className="flex items-start justify-end">
              <img
                src={starkPersonHealth}
                alt="Performance visualization"
                className="w-full max-w-[120px] sm:max-w-[140px] md:max-w-[160px] h-auto drop-shadow-2xl select-none pointer-events-none"
                decoding="async"
                draggable="false"
              />
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
          <div className="text-center py-12 relative">
            {/* Success Animation */}
            <div className="relative mb-8 animate-fade-in">
              <div className="absolute inset-0 blur-2xl opacity-20">
                <div className="w-24 h-24 bg-green-500 rounded-full mx-auto"></div>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto relative animate-pulse-slow shadow-lg shadow-green-500/50">
                <Check className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Completion Message */}
            <div className="space-y-4 mb-8 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Systems Optimized
              </h2>
              <div className="space-y-2">
                <p className="text-xl font-medium text-green-600 dark:text-green-400">
                  Performance Baseline Established.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Ready to Evolve.
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              STARK will now analyze your metrics and provide data-driven insights to optimize your human performance.
            </p>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 All metrics can be updated anytime • Data saved locally & exportable
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen onboarding-bg flex items-center justify-center px-6 sm:px-12 lg:px-24 py-12 md:py-16 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric Particles Grid */}
        <div className="particle-grid" aria-hidden="true"></div>
        
        {/* Abstract Human Silhouette */}
        <div className="human-silhouette" aria-hidden="true"></div>
        
        {/* Energy Lines */}
        <div className="energy-lines" aria-hidden="true"></div>
        
        {/* Glowing Dots */}
        <div className="glowing-dots" aria-hidden="true"></div>

        {/* Floating Emblem */}
        <div className="onboarding-emblem" aria-hidden="true"></div>
      </div>

      <div className="max-w-3xl w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl relative z-10">
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
          {(showStepTitle || showStepDescription) && (
            <div className="mb-6">
              {showStepTitle && (
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentStepMeta.title}
                </h1>
              )}
              {showStepDescription && (
                <p className="text-gray-600 dark:text-gray-400">
                  {currentStepMeta.description}
                </p>
              )}
            </div>
          )}

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



