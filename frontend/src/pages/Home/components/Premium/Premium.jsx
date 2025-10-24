import React, { useState, useEffect, useRef } from 'react';
import AnalysisPipelineVisualizer from './AnalysisPipelineVisualizer';
import FeatureSections from './Featuresections';
import TransitionBridge from './TransitionBridge';
import ReportPreviewShowcase from './ReportPreviewShowcase';

// Confidence Meter Component - Hero Design Pattern
function ConfidenceMeter({ value = 86 }) {
  const barRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate progress with delay
          setTimeout(() => {
            setCurrentProgress(value);
          }, 300);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="group w-full max-w-2xl mx-auto mt-12">
      {/* Outer container with rotation and hover effect - Hero pattern */}
      <div className="relative transform rotate-1 hover:rotate-0 transition-all duration-500">
        {/* Decorative glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-200 to-green-200 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

        {/* Main card with pastel background and shadow-2xl */}
        <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-2xl p-6 border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300">
          {/* Header with icon container - Hero/FAQ pattern */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Icon glow layer */}
                <div className="absolute -inset-1 bg-gradient-to-br from-green-200 to-green-300 rounded-xl opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-300"></div>
                {/* Icon container */}
                <div className="relative w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center shadow-sm border-2 border-transparent hover:border-green-300 group-hover:scale-110 transition-all duration-300">
                  <i className="ph ph-chart-line-up text-3xl text-neutral-700 group-hover:text-green-600 transition-colors duration-200"></i>
                </div>
              </div>
              <div>
                <h3 className="text-base font-medium text-neutral-900 font-jost">Data Confidence Level</h3>
                <p className="text-xs text-neutral-600">Premium vs Basic Analysis</p>
              </div>
            </div>

            {/* Status badge - Hero pattern */}
            <div className="px-3 py-1.5 rounded-full shadow-sm text-xs font-medium border-2 flex items-center gap-1.5 bg-green-100 text-green-700 border-green-300">
              <i className="ph ph-check-circle text-sm"></i>
              <span>{value}% Complete</span>
            </div>
          </div>

          {/* Progress section - nested white card */}
          <div ref={barRef} className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200 mb-4">
            <div className="flex justify-between items-center text-xs font-medium text-neutral-600 mb-3">
              <div className="flex items-center gap-2">
                <i className="ph ph-warning-circle text-red-500"></i>
                <span>Limited Information</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ph ph-check-circle text-green-600"></i>
                <span>Complete Analysis</span>
              </div>
            </div>

            {/* Enhanced progress bar */}
            <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden border border-neutral-300 shadow-inner mb-3">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-[2000ms] ease-out relative overflow-hidden"
                style={{ width: `${currentProgress}%` }}
              >
                {/* Animated shine effect */}
                {currentProgress > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Progress indicator markers */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-neutral-500">0%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-neutral-500">50%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-neutral-500">100%</span>
              </div>
            </div>
          </div>

          {/* Comparison section - Hero alert pattern */}
          <div className="grid grid-cols-2 gap-3">
            {/* Basic Check */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <i className="ph ph-file-text text-neutral-500 text-sm"></i>
                <span className="text-xs font-medium text-neutral-700">Basic MOT Check</span>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-1.5 text-xs text-neutral-600">
                  <i className="ph ph-check text-green-600 text-xs mt-0.5"></i>
                  <span>MOT history</span>
                </li>
                <li className="flex items-start gap-1.5 text-xs text-neutral-400">
                  <i className="ph ph-x text-neutral-400 text-xs mt-0.5"></i>
                  <span>No defect analysis</span>
                </li>
                <li className="flex items-start gap-1.5 text-xs text-neutral-400">
                  <i className="ph ph-x text-neutral-400 text-xs mt-0.5"></i>
                  <span>No TSB matching</span>
                </li>
              </ul>
            </div>

            {/* Premium Analysis */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm border-2 border-green-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ph ph-star text-green-600 text-sm"></i>
                <span className="text-xs font-medium text-green-900">Premium Analysis</span>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-1.5 text-xs text-green-700">
                  <i className="ph ph-check-circle text-green-600 text-xs mt-0.5"></i>
                  <span>Full MOT forensics</span>
                </li>
                <li className="flex items-start gap-1.5 text-xs text-green-700">
                  <i className="ph ph-check-circle text-green-600 text-xs mt-0.5"></i>
                  <span>Defect cross-reference</span>
                </li>
                <li className="flex items-start gap-1.5 text-xs text-green-700">
                  <i className="ph ph-check-circle text-green-600 text-xs mt-0.5"></i>
                  <span>Known issues database</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Decorative underline */}
          <div className="flex justify-center mt-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 opacity-60 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// DVLA & Fraud Protection Visualization
const DVLAFraudVisualization = () => {
  const [isVisible, setIsVisible] = useState(false);
  const vizRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (vizRef.current) {
      observer.observe(vizRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={vizRef} className="relative w-full h-full flex items-center justify-center p-8">
      <div className="relative w-full max-w-md">
        {/* Official Document Card */}
        <div className={`bg-white rounded-2xl shadow-2xl p-6 relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* DVLA Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ph ph-shield-check text-white text-2xl"></i>
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-900">DVLA</div>
                <div className="text-xs text-neutral-500">Official Record</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-xs text-neutral-600">Registration</span>
              <span className="text-sm font-bold text-neutral-900">AB12 CDE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-xs text-neutral-600">VIN Status</span>
              <div className="flex items-center gap-2">
                <i className="ph ph-check-circle text-green-600"></i>
                <span className="text-sm font-medium text-green-600">Authentic</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-xs text-neutral-600">Finance Check</span>
              <div className="flex items-center gap-2">
                <i className="ph ph-check-circle text-green-600"></i>
                <span className="text-sm font-medium text-green-600">Clear</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xs text-red-700">Write-off Status</span>
              <div className="flex items-center gap-2">
                <i className="ph ph-warning text-red-600"></i>
                <span className="text-sm font-bold text-red-600">Cat S Detected</span>
              </div>
            </div>
          </div>

          {/* Fraud Detection Alert */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ph ph-detective text-neutral-900"></i>
              </div>
              <div>
                <div className="text-sm font-bold text-yellow-900 mb-1">Mileage Alert</div>
                <div className="text-xs text-yellow-700">Discrepancy detected at 2019 MOT test</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scanning Animation Elements */}
        <div className={`absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-2xl transition-all duration-1000 ${
          isVisible ? 'scale-100' : 'scale-0'
        }`}></div>
        <div className={`absolute -bottom-4 -left-4 w-32 h-32 bg-yellow-500 rounded-full opacity-20 blur-2xl transition-all duration-1000 delay-200 ${
          isVisible ? 'scale-100' : 'scale-0'
        }`}></div>
      </div>
    </div>
  );
};

// Technical Intelligence Visualization
const TechnicalIntelligenceVisualization = () => {
  const [isVisible, setIsVisible] = useState(false);
  const vizRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (vizRef.current) {
      observer.observe(vizRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={vizRef} className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900">Defect Pattern Analysis</h4>
          <p className="text-xs text-neutral-600">Cross-referenced with TSB database</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">8</div>
          <div className="text-xs text-purple-600">Known issues</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mb-6">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200"></div>

        {/* Timeline events */}
        <div className="space-y-4">
          {/* Event 1 */}
          <div className={`relative pl-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            <div className="absolute left-2 top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white z-10"></div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-900">2020 MOT</span>
                <i className="ph ph-check-circle text-green-600"></i>
              </div>
              <p className="text-xs text-green-700">No defects detected</p>
            </div>
          </div>

          {/* Event 2 */}
          <div className={`relative pl-10 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            <div className="absolute left-2 top-1 w-4 h-4 bg-yellow-500 rounded-full border-4 border-white z-10"></div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-yellow-900">2021 MOT</span>
                <i className="ph ph-warning text-yellow-600"></i>
              </div>
              <p className="text-xs text-yellow-700 mb-2">Brake pad wear detected</p>
              <div className="flex items-start gap-2 bg-white rounded p-2">
                <i className="ph ph-info text-blue-600 text-xs mt-0.5"></i>
                <p className="text-xs text-neutral-700">
                  <strong>TSB Match:</strong> Common issue on this model year
                </p>
              </div>
            </div>
          </div>

          {/* Event 3 */}
          <div className={`relative pl-10 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            <div className="absolute left-2 top-1 w-4 h-4 bg-red-500 rounded-full border-4 border-white z-10"></div>
            <div className="bg-red-50 rounded-lg p-3 border-2 border-red-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-red-900">2023 MOT</span>
                <i className="ph ph-x-circle text-red-600"></i>
              </div>
              <p className="text-xs text-red-700 mb-2 font-medium">Suspension failure - Major defect</p>
              <div className="flex items-start gap-2 bg-white rounded p-2 mb-2">
                <i className="ph ph-wrench text-purple-600 text-xs mt-0.5"></i>
                <p className="text-xs text-neutral-700">
                  <strong>TSB #2023-118:</strong> Known suspension component failure
                </p>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-700">Estimated repair cost</span>
                <span className="font-bold text-red-900">£450-£850</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">46K+</div>
          <div className="text-xs text-neutral-600">Models</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">150K+</div>
          <div className="text-xs text-neutral-600">TSB Records</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">92%</div>
          <div className="text-xs text-neutral-600">Match Rate</div>
        </div>
      </div>
    </div>
  );
};

// Mileage Chart Component (adapted)
const MileageChart = () => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={chartRef} className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto relative">
      {/* Warning tooltip */}
      <div className="absolute -top-4 right-8 bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-3 max-w-xs z-10">
        <div className="flex items-start gap-2">
          <i className="ph ph-warning text-yellow-600"></i>
          <div className="text-xs">
            <p className="font-semibold text-yellow-900">Beware</p>
            <p className="text-yellow-700">This vehicle may have a fake mileage!</p>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative h-56 mt-8">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-neutral-400">
          <span>160k</span>
          <span>120k</span>
          <span>80k</span>
          <span>40k</span>
          <span>0</span>
        </div>

        {/* Chart content */}
        <div className="ml-12 mr-4 h-full relative pb-8">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="80" x2="400" y2="80" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="160" x2="400" y2="160" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />

            {/* Mileage progression line with rollback */}
            <polyline
              points="0,180 80,150 160,120 240,80 280,60 320,140 360,100 400,90"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-1500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Highlight the rollback area */}
            <circle
              cx="320"
              cy="140"
              r="12"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              className={`transition-all duration-500 delay-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
            />
          </svg>

          {/* Rollback warning badge */}
          <div className="absolute right-16 top-32 transform translate-x-1/2">
            <div className="bg-yellow-400 text-neutral-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
              <i className="ph ph-warning-circle"></i>
              Rollback
            </div>
          </div>

          {/* Last known mileage indicator */}
          <div className="absolute right-0 top-20 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
            <p className="font-semibold">Last known mileage:</p>
            <p className="text-lg font-bold">73,000 km</p>
          </div>

          {/* X-axis */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-neutral-400">
            <span>2014</span>
            <span>2018</span>
            <span>2022</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* Scale indicators */}
      <div className="mt-4 text-xs text-neutral-500 flex justify-between px-12">
        <span>Consistent growth</span>
        <span>Suspicious drop</span>
      </div>
    </div>
  );
};

// Market Intelligence & Confidence Visualization
const MarketConfidenceVisualization = () => {
  const [isVisible, setIsVisible] = useState(false);
  const vizRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (vizRef.current) {
      observer.observe(vizRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={vizRef} className="space-y-6 max-w-md mx-auto">
      {/* Market Price Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">Market Value Analysis</h4>
            <p className="text-xs text-neutral-600">Based on 40M+ transactions</p>
          </div>
          <i className="ph ph-chart-bar text-2xl text-green-600"></i>
        </div>

        {/* Price comparison */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">Asking Price</span>
            <span className="text-2xl font-bold text-red-600">£20,800</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-600">Fair Market Value</span>
            <span className="text-2xl font-bold text-green-600">£18,500</span>
          </div>

          {/* Price bar comparison */}
          <div className="space-y-2">
            <div className="relative h-8 bg-neutral-100 rounded-lg overflow-hidden">
              <div className={`h-full bg-red-500 transition-all duration-1000 ${
                isVisible ? 'w-full' : 'w-0'
              }`}></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                Asking Price
              </span>
            </div>
            <div className="relative h-8 bg-neutral-100 rounded-lg overflow-hidden">
              <div className={`h-full bg-green-500 transition-all duration-1000 delay-300 ${
                isVisible ? 'w-[89%]' : 'w-0'
              }`}></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-neutral-700">
                Fair Value
              </span>
            </div>
          </div>
        </div>

        {/* Negotiation insight */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <i className="ph ph-lightbulb text-blue-600"></i>
            <div className="text-xs">
              <p className="font-semibold text-blue-900 mb-1">Negotiation Opportunity</p>
              <p className="text-blue-700">Vehicle priced <strong>12.4% above market</strong>. Combined with maintenance issues, you have strong position to negotiate down to fair value.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Score Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">Purchase Confidence Score</h4>
            <p className="text-xs text-neutral-600">AI-powered decision support</p>
          </div>
          <i className="ph ph-brain text-2xl text-purple-600"></i>
        </div>

        {/* Confidence meter */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#9333ea"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - (isVisible ? 0.73 : 0))}`}
                strokeLinecap="round"
                className="transition-all duration-2000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-purple-600">73</span>
              <span className="text-xs text-neutral-600">out of 100</span>
            </div>
          </div>
          <div className="text-sm font-medium text-purple-900">Good Purchase Candidate</div>
        </div>

        {/* Key factors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <i className="ph ph-check-circle text-green-600"></i>
              <span className="text-neutral-700">No major red flags</span>
            </div>
            <span className="font-medium text-green-600">+20</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <i className="ph ph-check-circle text-green-600"></i>
              <span className="text-neutral-700">Clean ownership history</span>
            </div>
            <span className="font-medium text-green-600">+15</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <i className="ph ph-warning text-yellow-600"></i>
              <span className="text-neutral-700">Minor maintenance issues</span>
            </div>
            <span className="font-medium text-yellow-600">-10</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <i className="ph ph-warning text-yellow-600"></i>
              <span className="text-neutral-700">Overpriced vs market</span>
            </div>
            <span className="font-medium text-yellow-600">-12</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Section Component (reusable)
const FeatureSection = ({ badge, title, description, visualComponent, bgColor, reversed, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const contentClasses = `transition-all duration-700 delay-${index * 100} ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  }`;

  return (
    <section
      ref={sectionRef}
      className={`py-16 md:py-24 ${bgColor}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
          {/* Content */}
          <div className={`${reversed ? 'lg:order-2' : 'lg:order-1'} ${contentClasses}`}>
            {badge && (
              <div className="inline-block mb-4">
                <span className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
                  {badge}
                </span>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
              {title}
            </h2>
            <div className="text-base md:text-lg text-neutral-700 leading-relaxed space-y-4">
              {description}
            </div>
          </div>

          {/* Visualization */}
          <div className={`${reversed ? 'lg:order-1' : 'lg:order-2'} ${contentClasses}`}>
            {visualComponent}
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Premium Component
const PremiumVehicleReports = () => {
  const componentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      badge: 'Official Verification',
      title: 'Trust Official Data, Not Just Promises',
      description: (
        <>
          <p>
            Access real-time DVLA data to verify vehicle identity, check for outstanding finance,
            insurance write-off status, and confirm registration details match the vehicle you're viewing.
          </p>
          <p className="mt-4">
            Our advanced fraud detection algorithms analyze mileage progression across all MOT tests,
            identifying potential odometer tampering and irregular patterns that could indicate fraud.
          </p>
          <p className="mt-4">
            <strong>Buy with confidence</strong> knowing the vehicle's official records are accurate and complete.
          </p>
        </>
      ),
      visualComponent: <DVLAFraudVisualization />,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      reversed: false
    },
    {
      badge: 'Technical Intelligence',
      title: 'Know The Issues Before You Buy',
      description: (
        <>
          <p>
            Our proprietary analysis engine examines your vehicle's complete MOT history and cross-references
            defects with manufacturer technical service bulletins to identify <strong>known issues, common failures,
            and documented problems</strong> specific to your exact make and model.
          </p>
          <p className="mt-4">
            We identify recurring defects, progressive deterioration patterns, and correlate MOT advisories
            with manufacturer service information to reveal the vehicle's true maintenance history.
          </p>
          <p className="mt-4">
            Understand potential repair costs and recurring issues before making your purchase decision.
          </p>
        </>
      ),
      visualComponent: <TechnicalIntelligenceVisualization />,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      reversed: true
    },
    {
      badge: 'Mileage Verification',
      title: "Know How Far It's Really Been",
      description: (
        <>
          <p>
            Odometer readings can tell you a lot about a car's life – but only if they're accurate.
            With our <strong>Mileage Verification Analysis</strong>, you can easily verify a vehicle's
            true mileage, backed by data from MOT history and official records.
          </p>
          <p className="mt-4">
            Our system tracks mileage progression across all MOT tests to identify potential odometer
            tampering, rollbacks, or inconsistencies in the vehicle's recorded history.
          </p>
          <p className="mt-4">
            <strong>Feel confident</strong> knowing you have the full picture before you buy.
          </p>
        </>
      ),
      visualComponent: <MileageChart />,
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
      reversed: false
    },
    {
      badge: 'Market Intelligence',
      title: 'Make Data-Driven Decisions with Confidence',
      description: (
        <>
          <p>
            The market can change fast, and guessing a car's worth can lead to bad deals.
            Our <strong>Market Value Analysis</strong> helps you see the price range for similar cars
            in your market, so you don't get shortchanged.
          </p>
          <p className="mt-4">
            Receive an overall vehicle health score, identified high-risk systems, highlighted recurring issues,
            and maintenance insights based on the complete analysis of MOT data and manufacturer technical information.
          </p>
          <p className="mt-4">
            Get a <strong>clear, objective assessment</strong> of whether this vehicle is a good purchase.
          </p>
        </>
      ),
      visualComponent: <MarketConfidenceVisualization />,
      bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
      reversed: true
    }
  ];

  return (
    <div id="services" ref={componentRef} className="w-full bg-white text-neutral-900">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 mb-6 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
              <i className="ph ph-shield-check mr-2"></i>
              Advanced Vehicle Analysis
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight tracking-tight mb-6">
              Make Informed Decisions with Expert Analysis
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-8">
              Our premium report analyzes a vehicle's complete MOT history using our proprietary analysis engine
              that cross-references defects with manufacturer technical data. Get detailed insights into known issues,
              recurring defects, and potential problems specific to the exact make and model you're considering.
            </p>

            <div className="inline-flex items-center px-6 py-3 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg shadow-sm">
              <i className="ph ph-brain mr-2"></i>
              Comprehensive analysis combining official MOT data with professional technical knowledge
            </div>

            <ConfidenceMeter value={86} />
          </div>
        </div>
      </section>

      {/* Analysis Pipeline Section */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <AnalysisPipelineVisualizer />
        </div>
      </section>

      {/* Feature Sections - storytelling about data & capabilities */}
      <FeatureSections />

      {/* Transition Bridge - connecting narrative */}
      <TransitionBridge />

      {/* Report Preview Showcase - interactive demo of actual report UI */}
      <ReportPreviewShowcase />

      {/* Additional Feature Sections with visualizations */}
      {sections.map((section, index) => (
        <FeatureSection
          key={index}
          index={index}
          badge={section.badge}
          title={section.title}
          description={section.description}
          visualComponent={section.visualComponent}
          bgColor={section.bgColor}
          reversed={section.reversed}
        />
      ))}

      {/* Data Sources Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Powered by Trusted Data Sources
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We combine official government data with professional automotive technical information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <i className="ph ph-shield-check text-2xl text-blue-600"></i>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-xs text-blue-600">Verified</div>
                </div>
              </div>
              <div className="text-sm font-medium text-neutral-900 mb-2">DVLA Official</div>
              <div className="text-xs text-neutral-600">Government database access</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <i className="ph ph-chart-pie text-2xl text-green-600"></i>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">40M+</div>
                  <div className="text-xs text-green-600">Records</div>
                </div>
              </div>
              <div className="text-sm font-medium text-neutral-900 mb-2">MOT Intelligence</div>
              <div className="text-xs text-neutral-600">Forensic pattern analysis</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <i className="ph ph-wrench text-2xl text-purple-600"></i>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">46K+</div>
                  <div className="text-xs text-purple-600">Models</div>
                </div>
              </div>
              <div className="text-sm font-medium text-neutral-900 mb-2">Technical Database</div>
              <div className="text-xs text-neutral-600">Service bulletins & recalls</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <i className="ph ph-brain text-2xl text-red-600"></i>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">Smart</div>
                  <div className="text-xs text-red-600">Analysis</div>
                </div>
              </div>
              <div className="text-sm font-medium text-neutral-900 mb-2">Analysis Engine</div>
              <div className="text-xs text-neutral-600">Advanced pattern recognition</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PremiumVehicleReports;
