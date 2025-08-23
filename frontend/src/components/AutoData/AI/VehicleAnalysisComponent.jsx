import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';

const API_BASE_URL =
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8007/api/v1'
    : '/api/v1';

const SYSTEM_CATEGORIES = {
  SUSPENSION: { displayName: 'Suspension & Dampers' },
  BRAKING: { displayName: 'Braking System' },
  ENGINE: { displayName: 'Engine & Ancillaries' },
  TRANSMISSION: { displayName: 'Transmission & Drivetrain' },
  ELECTRICAL: { displayName: 'Electrical Systems' },
  STRUCTURE: { displayName: 'Body Structure & Corrosion' },
  EXHAUST: { displayName: 'Exhaust & Emissions' },
  TYRES: { displayName: 'Tyres & Wheels' },
  LIGHTING: { displayName: 'Lighting & Signalling' },
  STEERING: { displayName: 'Steering System' },
  FUEL: { displayName: 'Fuel System' },
  COOLING: { displayName: 'Cooling System' },
  HVAC: { displayName: 'Climate Control' },
  BODYWORK: { displayName: 'Bodywork & Trim' },
  SAFETY: { displayName: 'Safety Systems' },
  OTHER: { displayName: 'Other Systems' }
};

const extractValue = (text, key) => {
  const regex = new RegExp(`${key}:\\s*(.+?)(?=\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};
const extractNumericValue = (text, key) => {
  const v = extractValue(text, key);
  return v ? parseInt(v, 10) || 0 : 0;
};
const extractSection = (text, startMarker, endMarker) => {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';
  const endIndex = endMarker ? text.indexOf(endMarker, startIndex) : text.length;
  if (endIndex === -1) return text.substring(startIndex + startMarker.length);
  return text.substring(startIndex + startMarker.length, endIndex);
};
const parseListItems = (text) =>
  text.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);

class VehicleAnalysisParser {
  parse(analysisText) {
    try {
      const overallScore = extractNumericValue(analysisText, 'OVERALL_SCORE');
      const overallRisk = extractValue(analysisText, 'OVERALL_RISK')?.toLowerCase() || 'medium';
      const systemsAnalysed = extractNumericValue(analysisText, 'SYSTEMS_ANALYSED');
      const systemsWithIssues = extractNumericValue(analysisText, 'SYSTEMS_WITH_ISSUES');

      const systemsSection = extractSection(analysisText, 'SYSTEM_ANALYSIS_START', 'SYSTEM_ANALYSIS_END');
      const systems = this.parseSystems(systemsSection);

      const patternsSection = extractSection(analysisText, 'PATTERN_ANALYSIS_START', 'PATTERN_ANALYSIS_END');
      const patterns = this.parsePatterns(patternsSection);

      const riskFactorsSection = extractSection(analysisText, 'RISK_FACTORS_START', 'RISK_FACTORS_END');
      const riskFactors = parseListItems(riskFactorsSection);

      const positiveFactorsSection = extractSection(analysisText, 'POSITIVE_FACTORS_START', 'POSITIVE_FACTORS_END');
      const positiveFactors = parseListItems(positiveFactorsSection);

      const maintenanceSection = extractSection(analysisText, 'MAINTENANCE_INSIGHTS_START', 'MAINTENANCE_INSIGHTS_END');
      const maintenanceInsights = parseListItems(maintenanceSection);

      const summary = extractValue(analysisText, 'SUMMARY') || 'Technical analysis completed.';

      return {
        overallScore,
        overallRisk,
        systemsAnalysed,
        systemsWithIssues,
        systems,
        patterns,
        riskFactors,
        positiveFactors,
        maintenanceInsights,
        summary,
        criticalSystems: systems.filter(s => s.status === 'critical').length,
        warningSystems: systems.filter(s => s.status === 'warning').length,
        recentIssues: systems.filter(s => s.recentActivity).length
      };
    } catch (e) {
      return this.createFallback(analysisText);
    }
  }

  parseSystems(systemsText) {
    if (!systemsText) return [];
    const systemBlocks = systemsText.split('SYSTEM_END').filter(b => b.trim());

    return systemBlocks.map(block => {
      const name = extractValue(block, 'SYSTEM') || 'Unknown System';
      const category = extractValue(block, 'CATEGORY') || 'OTHER';
      const status = extractValue(block, 'STATUS')?.toLowerCase() || 'unknown';
      const issueCount = extractNumericValue(block, 'ISSUE_COUNT');
      const recentActivity = extractValue(block, 'RECENT_ACTIVITY') === 'YES';
      const summary = extractValue(block, 'SUMMARY') || '';

      const findingsMatch = block.match(/FINDINGS:[\s\S]*?(?=SYSTEM_END|$)/);
      const findings = findingsMatch ? parseListItems(findingsMatch[0].replace('FINDINGS:', '')) : [];

      const categoryInfo = SYSTEM_CATEGORIES[category] || SYSTEM_CATEGORIES.OTHER;

      return {
        name,
        category,
        status,
        issueCount,
        recentActivity,
        summary,
        findings,
        displayName: categoryInfo.displayName,
      };
    });
  }

  parsePatterns(text) {
    if (!text) return {};
    const recurring = extractSection(text, 'RECURRING_ISSUES:', 'PROGRESSIVE_DETERIORATION:');
    const deterioration = extractSection(text, 'PROGRESSIVE_DETERIORATION:', 'BULLETIN_CORRELATIONS:');
    const bulletins = extractSection(text, 'BULLETIN_CORRELATIONS:', '');
    return {
      recurringIssues: parseListItems(recurring),
      progressiveDeterioration: parseListItems(deterioration),
      bulletinCorrelations: parseListItems(bulletins)
    };
  }

  createFallback(rawText) {
    return {
      overallScore: 75,
      overallRisk: 'medium',
      systemsAnalysed: 0,
      systemsWithIssues: 0,
      systems: [],
      patterns: {},
      riskFactors: [],
      positiveFactors: [],
      maintenanceInsights: [],
      summary: 'Analysis parsing encountered an issue. Raw content available below.',
      rawText,
      fallbackMode: true
    };
  }
}

const EnhancedCircularProgress = ({ value = 0, max = 100, size = 140, strokeWidth = 8, status = 'medium', unit = '/100', icon = 'ph-shield-check', label = 'Score' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef(null);
  
  const finalValue = Math.max(0, Math.min(Number(value) || 0, max));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const getStatusTheme = (s) => {
    const themes = {
      good: { color: '#059669', bgColor: 'bg-green-50', textColor: 'text-green-600', gradientFrom: '#10b981', gradientTo: '#059669' },
      low: { color: '#059669', bgColor: 'bg-green-50', textColor: 'text-green-600', gradientFrom: '#10b981', gradientTo: '#059669' },
      medium: { color: '#d97706', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', gradientFrom: '#f59e0b', gradientTo: '#d97706' },
      warning: { color: '#d97706', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', gradientFrom: '#f59e0b', gradientTo: '#d97706' },
      high: { color: '#dc2626', bgColor: 'bg-red-50', textColor: 'text-red-600', gradientFrom: '#ef4444', gradientTo: '#dc2626' },
      critical: { color: '#dc2626', bgColor: 'bg-red-50', textColor: 'text-red-600', gradientFrom: '#ef4444', gradientTo: '#dc2626' }
    };
    return themes[s] || themes.medium;
  };

  const theme = getStatusTheme(status);
  const pct = animatedValue / max;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (pct * circumference);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Subtle number counting
          const duration = 1000;
          const steps = 30;
          const increment = finalValue / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= finalValue) {
              setAnimatedValue(finalValue);
              clearInterval(timer);
            } else {
              setAnimatedValue(Math.round(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (progressRef.current) {
      observer.observe(progressRef.current);
    }

    return () => observer.disconnect();
  }, [finalValue, isVisible]);

  return (
    <div ref={progressRef} className="relative flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center mb-4" style={{ width: size, height: size }}>
        {/* Gradient Definition */}
        <svg className="absolute w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={`gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.gradientFrom} />
              <stop offset="100%" stopColor={theme.gradientTo} />
            </linearGradient>
          </defs>
          {/* Background Circle */}
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            className="drop-shadow-sm"
          />
          {/* Progress Circle */}
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${status})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`p-2 rounded-full ${theme.bgColor} mb-2 shadow-sm`}>
            <i className={`${icon} text-xl ${theme.textColor}`}></i>
          </div>
          <div className={`text-2xl font-bold ${theme.textColor} leading-none`}>
            {Math.round(animatedValue)}
            <span className="text-sm text-neutral-500 ml-1 font-normal">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedCountdown = ({ days, label = 'MOT Status', icon = 'ph-calendar-check' }) => {
  if (typeof days !== 'number') return null;
  
  const status = days < 0 ? 'critical' : days <= 30 ? 'warning' : 'good';
  const normalizedProgress = Math.max(0, Math.min(100, days <= 365 ? (days / 365) * 100 : 100));
  
  const getStatusTheme = (s) => {
    const themes = {
      good: { 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-600', 
        iconBg: 'bg-green-100',
        progressColor: 'bg-gradient-to-r from-green-500 to-green-600'
      },
      warning: { 
        bgColor: 'bg-yellow-50', 
        textColor: 'text-yellow-600', 
        iconBg: 'bg-yellow-100',
        progressColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      },
      critical: { 
        bgColor: 'bg-red-50', 
        textColor: 'text-red-600', 
        iconBg: 'bg-red-100',
        progressColor: 'bg-gradient-to-r from-red-500 to-red-600'
      }
    };
    return themes[s] || themes.warning;
  };

  const theme = getStatusTheme(status);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className={`p-3 rounded-full ${theme.iconBg} shadow-sm`}>
        <i className={`${icon} text-xl ${theme.textColor}`}></i>
      </div>
      
      <div className="text-center">
        <div className={`text-2xl font-bold ${theme.textColor} leading-none mb-1`}>
          {days < 0 ? 'Expired' : days}
          <span className="text-sm text-neutral-500 ml-1 font-normal">
            {days < 0 ? '' : days === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="text-xs text-neutral-500">{label}</div>
      </div>

      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${theme.progressColor}`}
          style={{ width: `${days < 0 ? 100 : normalizedProgress}%` }}
        />
      </div>

      {days >= 0 && (
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${theme.bgColor} ${theme.textColor} hover:scale-110 transition-all duration-300`}>
          <i className={`ph ${days <= 7 ? 'ph-warning-circle' : days <= 30 ? 'ph-clock' : 'ph-check-circle'} mr-1`}></i>
          {days <= 7 ? 'Urgent' : days <= 30 ? 'Due Soon' : 'Valid'}
        </div>
      )}
    </div>
  );
};

const VehicleAnalysis = ({ registration, vehicleData, onDataLoad, motDaysRemaining, onError }) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [activeSection, setActiveSection] = useState('overview');
  const componentRef = useRef(null);
  const sectionRefs = useRef({});
  const parser = useMemo(() => new VehicleAnalysisParser(), []);

  const fetchAnalysis = useCallback(async (isRetry = false) => {
    if (!registration) {
      setError('Vehicle registration is required');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      // Add cache-busting parameter for retries
      const cacheBuster = isRetry ? `?retry=${Date.now()}` : '';
      const res = await fetch(`${API_BASE_URL}/vehicle-analysis/${registration.toUpperCase()}${cacheBuster}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Service error';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Use default message if response isn't JSON
        }
        
        throw new Error(res.status === 404 ? 'Vehicle analysis not available' : errorMessage);
      }
      
      const data = await res.json();
      
      // Validate response structure
      if (!data || !data.analysis) {
        throw new Error('Invalid response format from analysis service');
      }
      
      const parsed = parser.parse(data.analysis);
      
      // Validate parsed data structure
      if (!parsed || typeof parsed.overallScore === 'undefined') {
        throw new Error('Invalid analysis data structure');
      }
      
      setAnalysisData({
        ...parsed,
        // Ensure we have sensible defaults for missing data
        systems: parsed.systems || [],
        patterns: parsed.patterns || {},
        riskFactors: parsed.riskFactors || [],
        positiveFactors: parsed.positiveFactors || [],
        maintenanceInsights: parsed.maintenanceInsights || [],
        // Add metadata about the response
        cached: data.cached || false,
        timestamp: data.timestamp || Date.now(),
        vehicleInfo: {
          make: data.make || vehicleData?.make || 'Unknown',
          model: data.model || vehicleData?.model || 'Vehicle',
          registration: registration
        }
      });
      setRetryCount(0); // Reset retry count on success
      onDataLoad?.(data);
      
    } catch (e) {
      console.error('Analysis fetch error:', e);
      const errorMessage = e.message || 'Failed to load vehicle analysis';
      setError(errorMessage);
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }
      onError?.(errorMessage, e); // Notify parent component
    } finally {
      setLoading(false);
    }
  }, [registration, parser, onDataLoad]);

  useEffect(() => {
    if (registration) {
      fetchAnalysis();
    } else {
      setAnalysisData(null);
      setError(null);
      setLoading(false);
    }
  }, [registration, fetchAnalysis]);

  // Enhanced section visibility observer for navigation
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setActiveSection(sectionId);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-20% 0px -70% 0px' }
    );

    // Observe all section elements
    Object.keys(sectionRefs.current).forEach(sectionId => {
      const element = sectionRefs.current[sectionId];
      if (element) sectionObserver.observe(element);
    });

    return () => sectionObserver.disconnect();
  }, [analysisData]);

  const displayVehicleInfo = analysisData?.vehicleInfo
    ? `${analysisData.vehicleInfo.make} ${analysisData.vehicleInfo.model}`
    : vehicleData?.make !== 'Unknown'
      ? `${vehicleData?.make || 'Unknown'} ${vehicleData?.model || 'Vehicle'}`
      : registration || 'this vehicle';

  // ---------------- Loading ----------------
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-16">
          <div className="w-1/3 h-8 bg-neutral-200 rounded-lg animate-pulse mb-4" />
          <div className="w-2/3 h-4 bg-neutral-200 rounded animate-pulse mb-6" />
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-neutral-100 rounded-lg p-1 gap-1">
              {['Overview', 'Systems', 'Factors', 'Patterns', 'Maintenance', 'Summary'].map((label, i) => (
                <div key={i} className="flex items-center space-x-2 px-4 py-2 bg-neutral-200 rounded-md animate-pulse">
                  <div className="w-4 h-4 bg-neutral-300 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-neutral-300 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <section className="space-y-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="w-2/3 h-4 bg-neutral-200 rounded animate-pulse mx-auto mb-2" />
                <div className="w-1/2 h-3 bg-neutral-200 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- Error ----------------
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <section className="space-y-12 mb-16">
          <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300" role="alert">
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <i className="ph ph-warning-circle text-2xl text-red-600 mr-4 mt-1"></i>
                <div>
                  <div className="text-lg font-medium text-neutral-900 mb-2">Analysis Temporarily Unavailable</div>
                  <div className="text-sm text-neutral-700">{error}</div>
                </div>
              </div>
              <button 
                onClick={() => fetchAnalysis(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer hover:scale-110"
                disabled={loading}
              >
                <i className={`ph ph-arrow-clockwise mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                {loading ? 'Retrying...' : retryCount > 0 ? `Retry (${retryCount})` : 'Retry Analysis'}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <section className="space-y-12 mb-16">
          <div className="bg-yellow-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300" role="status">
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <i className="ph ph-info text-2xl text-yellow-600 mr-4 mt-1"></i>
                <div>
                  <div className="text-lg font-medium text-neutral-900 mb-2">No Analysis Available</div>
                  <div className="text-sm text-neutral-700">Analysis data is not currently available for this vehicle.</div>
                </div>
              </div>
              <button 
                onClick={() => fetchAnalysis(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer hover:scale-110"
                disabled={loading}
              >
                <i className={`ph ph-arrow-clockwise mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                {loading ? 'Loading...' : 'Try Again'}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ---------------- Derived data with safe defaults ----------------
  const {
    overallScore = 0,
    overallRisk = 'medium',
    systemsAnalysed = 0,
    systemsWithIssues = 0,
    recentIssues = 0,
    criticalSystems = 0,
    warningSystems = 0,
    cached = false,
    timestamp,
    vehicleInfo = {}
  } = analysisData || {};
  
  // Format cache age for display
  const getCacheAge = () => {
    if (!cached || !timestamp) return null;
    const ageMinutes = Math.floor((Date.now() - timestamp * 1000) / 60000);
    if (ageMinutes < 1) return 'Just now';
    if (ageMinutes < 60) return `${ageMinutes}m ago`;
    const ageHours = Math.floor(ageMinutes / 60);
    if (ageHours < 24) return `${ageHours}h ago`;
    return `${Math.floor(ageHours / 24)}d ago`;
  };

  // ---------------- Micro Nav targets ----------------
  const anchors = [
    { id: 'overview', label: 'Overview', icon: 'ph-chart-pie' },
    { id: 'systems', label: 'Systems', icon: 'ph-wrench' },
    { id: 'factors', label: 'Factors', icon: 'ph-warning-circle' },
    { id: 'patterns', label: 'Patterns', icon: 'ph-chart-bar' },
    { id: 'maintenance', label: 'Maintenance', icon: 'ph-gear' },
    { id: 'summary', label: 'Summary', icon: 'ph-file-text' },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          Vehicle Technical Analysis
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
          Comprehensive technical assessment for {displayVehicleInfo}
          {cached && (
            <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
              <i className="ph ph-database mr-1"></i>
              Cached {getCacheAge()}
            </span>
          )}
        </p>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-neutral-100 rounded-lg p-1">
            {anchors.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  scrollTo(section.id);
                }}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                  ${activeSection === section.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                  }
                `}
              >
                <i className={`ph ${section.icon || 'ph-circle'}`}></i>
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Overview */}
      <section id="overview" className="space-y-12 mb-16" ref={componentRef}>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Overall Assessment Card */}
            <div 
              className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <EnhancedCircularProgress 
                value={overallScore} 
                max={100} 
                status={overallRisk} 
                icon="ph-shield-check" 
                label="Overall Score"
              />
              <div className="text-center mt-2">
                <div className="text-sm font-medium text-neutral-900 mb-3">Overall Assessment</div>
                <div className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                  overallRisk === 'good' || overallRisk === 'low' 
                    ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                    : overallRisk === 'critical' || overallRisk === 'high'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                }`} aria-label={`Overall risk ${overallRisk}`}>
                  {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk
                </div>
              </div>
            </div>

            {/* Systems Analysis Card */}
            <div 
              className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <i className="ph ph-wrench text-lg text-blue-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Systems Analysis</div>
                    <div className="text-xs text-neutral-600">Comprehensive Review</div>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between mb-3">
                <div className="text-2xl font-bold text-blue-600">{systemsWithIssues}</div>
                <div className="text-sm text-neutral-500">of {systemsAnalysed} systems</div>
              </div>
              {(criticalSystems > 0 || warningSystems > 0) && (
                <div className="flex gap-2 flex-wrap">
                  {criticalSystems > 0 && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full hover:bg-red-100 transition-colors duration-300">
                      <i className="ph ph-warning-circle mr-1"></i>
                      {criticalSystems} critical
                    </span>
                  )}
                  {warningSystems > 0 && (
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs font-medium rounded-full hover:bg-yellow-100 transition-colors duration-300">
                      <i className="ph ph-warning mr-1"></i>
                      {warningSystems} warnings
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity Card */}
            <div 
              className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start">
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <i className="ph ph-clock text-lg text-green-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Recent Activity</div>
                    <div className="text-xs text-neutral-600">Latest Changes</div>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between mb-3">
                <div className="text-2xl font-bold text-green-600">{recentIssues}</div>
                <div className="text-sm text-neutral-500">systems updated</div>
              </div>
              <div className="text-xs text-neutral-500 bg-green-50 px-2 py-1 rounded-md hover:bg-green-100 transition-colors duration-300">
                <i className="ph ph-clock mr-1"></i>
                Systems with recent maintenance or issues
              </div>
            </div>

            {/* MOT Countdown Card */}
            {typeof motDaysRemaining === 'number' && (
              <div 
                className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                >
                <EnhancedCountdown days={motDaysRemaining} label="MOT Status" icon="ph-calendar-check" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Systems matrix */}
      {analysisData.systems?.length > 0 && (
        <section 
          id="systems" 
          className="space-y-12 mb-16"
          ref={(el) => sectionRefs.current['systems'] = el}
        >
          <div>
            <h2 className="text-lg font-medium text-neutral-900 mb-4">Systems Overview</h2>
            <div className="text-xs text-neutral-700 leading-relaxed mb-6">
              Scan all key systems at a glance. Click any system card to expand detailed findings.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {analysisData.systems?.map((s, idx) => {
              const isOpen = !!expanded[idx];
              const hasExtra = s.findings.length > 2;
              const getSystemIcon = (category) => {
                const icons = {
                  'SUSPENSION': 'ph-car-profile',
                  'BRAKING': 'ph-brake-disc',
                  'ENGINE': 'ph-engine',
                  'TRANSMISSION': 'ph-gear-six',
                  'ELECTRICAL': 'ph-lightning-slash',
                  'STRUCTURE': 'ph-warehouse',
                  'EXHAUST': 'ph-exhaust',
                  'TYRES': 'ph-tire',
                  'LIGHTING': 'ph-lightbulb',
                  'STEERING': 'ph-steering-wheel',
                  'FUEL': 'ph-gas-pump',
                  'COOLING': 'ph-thermometer-cold',
                  'HVAC': 'ph-wind',
                  'BODYWORK': 'ph-car-simple',
                  'SAFETY': 'ph-shield-check',
                  'OTHER': 'ph-wrench'
                };
                return icons[category] || 'ph-wrench';
              };

              const getSystemStatusTheme = (status) => {
                const themes = {
                  'good': { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
                  'low': { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
                  'warning': { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-600' },
                  'medium': { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-600' },
                  'critical': { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600' },
                  'high': { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600' },
                  'unknown': { bg: 'bg-neutral-50', text: 'text-neutral-600', icon: 'text-neutral-600' }
                };
                return themes[status] || themes.unknown;
              };

              const theme = getSystemStatusTheme(s.status);
              
              return (
                <div
                  key={`${s.category}-${idx}`}
                  className={`${theme.bg} rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                  onClick={() => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-start flex-1">
                      <div className={`p-2 ${theme.bg} rounded-lg mr-3`}>
                        <i className={`${getSystemIcon(s.category)} text-lg ${theme.icon}`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900 mb-1">{s.name}</div>
                        <div className="text-xs text-neutral-600">{s.displayName}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className={`px-3 py-1 text-xs font-medium rounded-full ${theme.bg} ${theme.text}`}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </div>
                      <div className="text-xs text-neutral-500">{s.issueCount} {s.issueCount === 1 ? 'issue' : 'issues'}</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {s.recentActivity && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-300">
                        <i className="ph ph-clock mr-1"></i>Recent Activity
                      </span>
                    )}
                    {s.issueCount > 5 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors duration-300">
                        <i className="ph ph-warning mr-1"></i>Multiple Issues
                      </span>
                    )}
                    {s.status === 'critical' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors duration-300">
                        <i className="ph ph-x-circle mr-1"></i>Critical
                      </span>
                    )}
                  </div>

                  {/* Expandable Content */}
                  {isOpen && s.findings.length > 0 && (
                    <div className="pt-4 space-y-3">
                      <div className="space-y-3">
                        {s.findings.map((f, i) => (
                          <div key={i} className="flex items-start text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-lg">
                            <div className={`w-2 h-2 ${theme.icon.replace('text-', 'bg-')} rounded-full mr-3 mt-2 flex-shrink-0`}></div>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                      {s.summary && (
                        <div className={`text-xs text-neutral-700 p-3 ${theme.bg} rounded-lg`}>
                          <div className="flex items-start">
                            <i className="ph ph-info text-sm text-neutral-600 mr-2 mt-0.5"></i>
                            <div>
                              <div className="font-medium text-neutral-900 mb-1">System Summary</div>
                              <div>{s.summary}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className={`text-center mt-4 ${theme.text} transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}>
                    <i className="ph ph-caret-down text-lg"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Factors */}
      {(analysisData.riskFactors?.length > 0 || analysisData.positiveFactors?.length > 0) && (
        <section 
          id="factors" 
          className="space-y-12 mb-16"
          ref={(el) => sectionRefs.current['factors'] = el}
        >
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Assessment Factors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {analysisData.riskFactors?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <i className="ph ph-warning-circle text-lg text-red-600"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Risk Factors</div>
                      <div className="text-xs text-neutral-600">Areas of concern</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{analysisData.riskFactors.length}</div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {analysisData.riskFactors.slice(0, 3).map((r, i) => (
                    <div key={`rf-${i}`} className="flex items-center p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-xs text-neutral-700 truncate">{r.length > 50 ? r.substring(0, 50) + '...' : r}</span>
                    </div>
                  ))}
                  {analysisData.riskFactors.length > 3 && (
                    <div className="text-xs text-red-600 text-center mt-2">+{analysisData.riskFactors.length - 3} more factors</div>
                  )}
                </div>
              </div>
            )}
            {analysisData.positiveFactors?.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <i className="ph ph-check-circle text-lg text-green-600"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Positive Factors</div>
                      <div className="text-xs text-neutral-600">Strengths identified</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{analysisData.positiveFactors.length}</div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {analysisData.positiveFactors.slice(0, 3).map((p, i) => (
                    <div key={`pf-${i}`} className="flex items-center p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-xs text-neutral-700 truncate">{p.length > 50 ? p.substring(0, 50) + '...' : p}</span>
                    </div>
                  ))}
                  {analysisData.positiveFactors.length > 3 && (
                    <div className="text-xs text-green-600 text-center mt-2">+{analysisData.positiveFactors.length - 3} more factors</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pattern Analysis */}
      {(analysisData.patterns?.recurringIssues?.length ||
        analysisData.patterns?.progressiveDeterioration?.length ||
        analysisData.patterns?.bulletinCorrelations?.length) && (
        <section 
          id="patterns" 
          className="space-y-12 mb-16"
          ref={(el) => sectionRefs.current['patterns'] = el}
        >
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Pattern Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {analysisData.patterns?.recurringIssues?.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-start">
                    <i className="ph ph-arrow-clockwise text-lg text-blue-600 mr-3 mt-0.5"></i>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Recurring Issues</div>
                      <div className="text-xs text-neutral-600">Repeat patterns detected</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{analysisData.patterns.recurringIssues.length}</div>
                </div>
                <div className="space-y-2">
                  {analysisData.patterns.recurringIssues.slice(0, 3).map((issue, i) => (
                    <div key={i} className="flex items-start p-3 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-xs text-neutral-700 leading-relaxed">{issue.length > 60 ? issue.substring(0, 60) + '...' : issue}</span>
                    </div>
                  ))}
                  {analysisData.patterns.recurringIssues.length > 3 && (
                    <div className="text-xs text-blue-600 text-center mt-2">+{analysisData.patterns.recurringIssues.length - 3} more patterns</div>
                  )}
                </div>
              </div>
            )}
            {analysisData.patterns?.progressiveDeterioration?.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-start">
                    <i className="ph ph-trend-down text-lg text-yellow-600 mr-3 mt-0.5"></i>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Progressive Deterioration</div>
                      <div className="text-xs text-neutral-600">Worsening over time</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{analysisData.patterns.progressiveDeterioration.length}</div>
                </div>
                <div className="space-y-2">
                  {analysisData.patterns.progressiveDeterioration.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-start p-3 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-xs text-neutral-700 leading-relaxed">{item.length > 60 ? item.substring(0, 60) + '...' : item}</span>
                    </div>
                  ))}
                  {analysisData.patterns.progressiveDeterioration.length > 3 && (
                    <div className="text-xs text-yellow-600 text-center mt-2">+{analysisData.patterns.progressiveDeterioration.length - 3} more patterns</div>
                  )}
                </div>
              </div>
            )}
            {analysisData.patterns?.bulletinCorrelations?.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-start">
                    <i className="ph ph-link text-lg text-purple-600 mr-3 mt-0.5"></i>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Bulletin Correlations</div>
                      <div className="text-xs text-neutral-600">Known issue matches</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{analysisData.patterns.bulletinCorrelations.length}</div>
                </div>
                <div className="space-y-2">
                  {analysisData.patterns.bulletinCorrelations.slice(0, 3).map((correlation, i) => (
                    <div key={i} className="flex items-start p-3 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-xs text-neutral-700 leading-relaxed">{correlation.length > 60 ? correlation.substring(0, 60) + '...' : correlation}</span>
                    </div>
                  ))}
                  {analysisData.patterns.bulletinCorrelations.length > 3 && (
                    <div className="text-xs text-purple-600 text-center mt-2">+{analysisData.patterns.bulletinCorrelations.length - 3} more correlations</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Maintenance Insights */}
      {analysisData.maintenanceInsights?.length > 0 && (
        <section 
          id="maintenance" 
          className="space-y-12 mb-16"
          ref={(el) => sectionRefs.current['maintenance'] = el}
        >
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-neutral-900 mb-2">Maintenance Insights</h2>
            <p className="text-xs text-neutral-600">Proactive maintenance recommendations based on historical patterns</p>
          </div>
          
          {/* Priority Overview */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <i className="ph ph-list-checks text-lg text-blue-600"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Priority Overview</div>
                  <div className="text-xs text-neutral-600">Maintenance tasks by urgency</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600 mb-1">
                  {analysisData.maintenanceInsights.slice(0, 2).length}
                </div>
                <div className="text-xs text-red-600 font-medium">High Priority</div>
                <div className="text-xs text-neutral-500 mt-1">Immediate attention</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600 mb-1">
                  {Math.min(2, Math.max(0, analysisData.maintenanceInsights.length - 2))}
                </div>
                <div className="text-xs text-yellow-600 font-medium">Medium Priority</div>
                <div className="text-xs text-neutral-500 mt-1">Plan ahead</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600 mb-1">
                  {Math.max(0, analysisData.maintenanceInsights.length - 4)}
                </div>
                <div className="text-xs text-green-600 font-medium">Low Priority</div>
                <div className="text-xs text-neutral-500 mt-1">Monitor</div>
              </div>
            </div>
          </div>

          {/* Detailed Maintenance Cards */}
          <div className="space-y-6">
            {analysisData.maintenanceInsights?.slice(0, 6).map((insight, idx) => {
              const getPriorityLevel = (index) => {
                if (index < 2) return { level: 'High', color: 'red', urgency: 'Immediate', timeline: 'Next 30 days' };
                if (index < 4) return { level: 'Medium', color: 'yellow', urgency: 'Soon', timeline: 'Next 90 days' };
                return { level: 'Low', color: 'green', urgency: 'Monitor', timeline: 'Next 6 months' };
              };

              const getInsightIcon = (insight) => {
                const lower = insight.toLowerCase();
                if (lower.includes('brake') || lower.includes('braking')) return 'ph-brake-disc';
                if (lower.includes('suspension') || lower.includes('shock')) return 'ph-car-profile';
                if (lower.includes('oil') || lower.includes('fluid')) return 'ph-drop';
                if (lower.includes('tyre') || lower.includes('tire') || lower.includes('wheel')) return 'ph-tire';
                if (lower.includes('engine') || lower.includes('motor')) return 'ph-engine';
                if (lower.includes('exhaust') || lower.includes('emission')) return 'ph-exhaust';
                if (lower.includes('electric') || lower.includes('battery')) return 'ph-lightning';
                if (lower.includes('cooling') || lower.includes('radiator')) return 'ph-thermometer-cold';
                if (lower.includes('corrosion') || lower.includes('rust')) return 'ph-shield-warning';
                if (lower.includes('dpf') || lower.includes('filter')) return 'ph-funnel';
                if (lower.includes('inspection') || lower.includes('check')) return 'ph-magnifying-glass';
                return 'ph-wrench';
              };
              
              const priority = getPriorityLevel(idx);
              const icon = getInsightIcon(insight);
              
              return (
                <div 
                  key={idx} 
                  className={`bg-${priority.color}-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer border-l-4 border-${priority.color}-400`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start flex-1">
                      <div className={`p-3 bg-${priority.color}-100 rounded-lg mr-4`}>
                        <i className={`${icon} text-xl text-${priority.color}-600`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${priority.color}-100 text-${priority.color}-600 mr-3`}>
                            {priority.level} Priority
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-md bg-white text-${priority.color}-600 border border-${priority.color}-200`}>
                            {priority.urgency}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-neutral-900 mb-2">
                          {insight.split(' ').slice(0, 8).join(' ')}
                          {insight.split(' ').length > 8 ? '...' : ''}
                        </div>
                        <div className="text-xs text-neutral-700 leading-relaxed mb-3">
                          {insight}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Timeline */}
                  <div className="flex items-center justify-between pt-3 border-t border-white">
                    <div className="flex items-center text-xs text-neutral-500">
                      <i className={`ph ph-calendar-check mr-2 text-${priority.color}-600`}></i>
                      <span>Recommended timeline: {priority.timeline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className={`px-3 py-1 text-xs font-medium rounded-md bg-white text-${priority.color}-600 hover:bg-${priority.color}-100 transition-colors duration-300 border border-${priority.color}-200`}>
                        <i className="ph ph-bookmark mr-1"></i>
                        Save
                      </button>
                      <button className={`px-3 py-1 text-xs font-medium rounded-md bg-${priority.color}-600 text-white hover:bg-${priority.color}-700 transition-colors duration-300`}>
                        <i className="ph ph-info mr-1"></i>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Insights */}
          {analysisData.maintenanceInsights.length > 6 && (
            <div className="text-center pt-6">
              <button className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300">
                <i className="ph ph-plus mr-2"></i>
                View {analysisData.maintenanceInsights.length - 6} More Insights
              </button>
            </div>
          )}
        </section>
      )}

      {/* Summary */}
      <section 
        id="summary" 
        className="space-y-12 mb-16"
        ref={(el) => sectionRefs.current['summary'] = el}
      >
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Analysis Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Key Finding */}
          <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <i className="ph ph-magnifying-glass text-lg text-blue-600"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Key Finding</div>
                  <div className="text-xs text-neutral-600">Primary concern</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <i className="ph ph-car-profile text-blue-600 mr-2"></i>
                <span className="text-xs font-medium text-neutral-700">Suspension Wear Pattern</span>
              </div>
              <div className="text-xs text-neutral-600">Anti-roll bar linkages & bushes showing recurring issues</div>
            </div>
          </div>

          {/* Risk Level */}
          <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
            overallRisk === 'high' || overallRisk === 'critical' ? 'bg-red-50' :
            overallRisk === 'medium' || overallRisk === 'warning' ? 'bg-yellow-50' : 'bg-green-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  overallRisk === 'high' || overallRisk === 'critical' ? 'bg-red-100' :
                  overallRisk === 'medium' || overallRisk === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <i className={`ph ph-shield-check text-lg ${
                    overallRisk === 'high' || overallRisk === 'critical' ? 'text-red-600' :
                    overallRisk === 'medium' || overallRisk === 'warning' ? 'text-yellow-600' : 'text-green-600'
                  }`}></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Overall Status</div>
                  <div className="text-xs text-neutral-600">Current assessment</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className={`text-2xl font-bold ${
                overallRisk === 'high' || overallRisk === 'critical' ? 'text-red-600' :
                overallRisk === 'medium' || overallRisk === 'warning' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {overallScore}/100
              </div>
              <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                overallRisk === 'high' || overallRisk === 'critical' ? 'bg-red-100 text-red-600' :
                overallRisk === 'medium' || overallRisk === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
              }`}>
                {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk
              </div>
            </div>
          </div>

          {/* Action Required */}
          <div className="bg-orange-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <i className="ph ph-clock text-lg text-orange-600"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Next Steps</div>
                  <div className="text-xs text-neutral-600">Immediate priorities</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">{systemsWithIssues}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center p-2 bg-white rounded-lg text-xs">
                <i className="ph ph-car-profile text-orange-600 mr-2"></i>
                <span className="text-neutral-700">Suspension inspection</span>
              </div>
              <div className="flex items-center p-2 bg-white rounded-lg text-xs">
                <i className="ph ph-shield-warning text-orange-600 mr-2"></i>
                <span className="text-neutral-700">Corrosion treatment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Raw content (fallback) */}
      {analysisData.fallbackMode && (
        <section 
          className="space-y-12 mb-16"
          ref={(el) => sectionRefs.current['debug'] = el}
        >
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Debug Information</h2>
          <div className="bg-neutral-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center mb-4">
              <i className="ph ph-code text-lg text-neutral-600 mr-3"></i>
              <div className="text-sm font-medium text-neutral-900">Raw Analysis Content</div>
            </div>
            <pre className="bg-white p-4 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-auto max-h-96 shadow-sm">
              {analysisData.rawText}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
};

export default memo(VehicleAnalysis);