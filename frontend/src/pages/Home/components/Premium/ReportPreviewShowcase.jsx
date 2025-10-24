import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

// Sample analysis data (anonymized version of your actual JSON)
const sampleAnalysis = {
  overallScore: 69,
  overallRisk: 'MEDIUM',
  systemsAnalysed: 9,
  systemsWithIssues: 8,
  systems: [
    {
      name: 'Suspension Components',
      category: 'SUSPENSION',
      status: 'WARNING',
      issueCount: 5,
      recentActivity: true,
      summary: 'Multiple suspension issues including worn bushes, linkages and component failures',
      findings: [
        'Front Lower Suspension arm pin excessively worn',
        'Anti-roll bar linkage ball joint has slight play',
        'Rear Anti-roll bar linkage pin worn',
        'Shock absorber has serious fluid leak'
      ]
    },
    {
      name: 'Braking System',
      category: 'BRAKING',
      status: 'WARNING',
      issueCount: 7,
      recentActivity: true,
      summary: 'Recurring brake disc wear and occasional grabbing brakes',
      findings: [
        'Service brake grabbing slightly',
        'Brake pads wearing thin',
        'All four brake discs worn, pitted or scored',
        'Technical bulletin identifies braking efficiency issues'
      ]
    },
    {
      name: 'Engine Oil System',
      category: 'ENGINE',
      status: 'WARNING',
      issueCount: 2,
      recentActivity: true,
      summary: 'Oil leaks present with technical bulletin correlations',
      findings: [
        'Oil leak detected but not excessive',
        'Technical bulletin notes DPF issues affecting oil levels'
      ]
    }
  ],
  patterns: {
    recurringIssues: [
      'Suspension wear persistent across multiple components',
      'Brake component wear appearing periodically',
      'Corrosion in multiple structural areas'
    ],
    bulletinCorrelations: [
      'Oil leak advisories correlate with DPF regeneration bulletins',
      'Braking issues match brake fluid pressure sensor bulletins'
    ]
  },
  riskFactors: [
    'High mileage vehicle with increasing structural corrosion',
    'Multiple suspension component failures',
    'History of dangerous tyre wear',
    'DPF issues could lead to expensive repairs'
  ],
  maintenanceInsights: [
    'Suspension components require regular inspection',
    'Oil level monitoring due to known leaks',
    'Corrosion protection treatment recommended',
    'Ensure DPF regeneration cycles complete properly'
  ]
};

// System status colors and icons
const getSystemStatus = (status) => {
  switch (status.toLowerCase()) {
    case 'good': return { color: 'text-green-600', bg: 'bg-green-100', icon: 'ph-check-circle' };
    case 'warning': return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'ph-warning-circle' };
    case 'critical': return { color: 'text-red-600', bg: 'bg-red-100', icon: 'ph-x-circle' };
    default: return { color: 'text-neutral-600', bg: 'bg-neutral-100', icon: 'ph-circle' };
  }
};

// Interactive system card
const SystemCard = ({ system, isExpanded, onToggle, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const statusConfig = getSystemStatus(system.status);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        bg-white rounded-xl p-4 cursor-pointer transition-all duration-500 ease-out
        hover:shadow-2xl hover:scale-[1.02]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isExpanded ? 'shadow-2xl scale-[1.02]' : 'shadow-xl'}
      `}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
            <i className={`ph ${statusConfig.icon} text-lg ${statusConfig.color}`}></i>
          </div>
          <div>
            <h3 className="font-medium text-neutral-900 text-sm">{system.name}</h3>
            <p className="text-xs text-neutral-600">{system.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {system.recentActivity && (
            <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
              Recent
            </div>
          )}
          <div className="text-xs text-neutral-500">{system.issueCount} issues</div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-neutral-700 mb-3">{system.summary}</p>

      {/* Expandable findings */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-out
        ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="space-y-2 pt-2">
          <div className="text-xs font-medium text-neutral-800">Key Findings:</div>
          {system.findings.map((finding, index) => (
            <div key={index} className="flex items-start space-x-2 text-xs text-neutral-600">
              <div className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>{finding}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expand indicator */}
      <div className={`
        flex items-center justify-center mt-3 pt-3 text-xs text-neutral-500
        transition-transform duration-300
        ${isExpanded ? 'rotate-180' : 'rotate-0'}
      `}>
        <i className="ph ph-caret-down"></i>
      </div>
    </div>
  );
};

// Score circle component
const ScoreCircle = ({ score, risk, isVisible }) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setCurrentScore(score), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, score]);

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-neutral-200"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={getRiskColor(risk)}
          style={{
            transition: 'stroke-dashoffset 2s ease-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-neutral-900">{Math.round(currentScore)}</div>
        <div className="text-xs text-neutral-600">/ 100</div>
        <div className={`text-xs font-medium mt-1 ${getRiskColor(risk)}`}>
          {risk}
        </div>
      </div>
    </div>
  );
};

// Main showcase component
const ReportPreviewShowcase = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSystems, setExpandedSystems] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const showcaseRef = useRef(null);
  const decorativeRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    // Animate decorative floating circles
    if (decorativeRef.current?.children) {
      animate(Array.from(decorativeRef.current.children), {
        translateY: [-8, 8],
        duration: 3000,
        ease: 'inOutSine',
        alternate: true,
        loop: true,
        delay: stagger(400)
      });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate header elements when visible
          if (headerRef.current) {
            const elements = headerRef.current.querySelectorAll('[data-header-animate]');
            animate(Array.from(elements), {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 800,
              ease: 'outQuad',
              delay: stagger(100)
            });
          }
        }
      },
      { threshold: 0.2 }
    );

    if (showcaseRef.current) {
      observer.observe(showcaseRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleSystem = (index) => {
    setExpandedSystems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Animate systems when section changes to 'systems'
  useEffect(() => {
    if (activeSection === 'systems' && isVisible) {
      const systemCards = document.querySelectorAll('[data-system-card]');
      if (systemCards.length > 0) {
        animate(Array.from(systemCards), {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          ease: 'outQuad',
          delay: stagger(100)
        });
      }
    }
  }, [activeSection, isVisible]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: 'ph-chart-pie' },
    { id: 'systems', label: 'Systems', icon: 'ph-gear' },
    { id: 'patterns', label: 'Patterns', icon: 'ph-graph' },
    { id: 'insights', label: 'Insights', icon: 'ph-lightbulb' }
  ];

  return (
    <section ref={showcaseRef} className="relative bg-gradient-to-br from-cyan-50 to-blue-50 py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Decorative floating circles */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-10 w-3 h-3 bg-blue-300 rounded-full opacity-30"></div>
        <div className="absolute top-32 right-32 w-2 h-2 bg-cyan-400 rounded-full opacity-25"></div>
        <div className="absolute bottom-32 left-12 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-35"></div>
        <div className="absolute top-40 left-20 w-2 h-2 bg-cyan-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-40 right-16 w-3 h-3 bg-blue-200 rounded-full opacity-30"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h2 data-header-animate className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
            <i className="ph ph-file-text text-blue-600 mr-3"></i>
            Professional Analysis Report
          </h2>
          <p data-header-animate className="text-base md:text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            See the depth of intelligence you receive - real analysis structure from actual vehicle data
          </p>
        </div>

        {/* Section navigation */}
        <div data-header-animate className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-xl shadow-lg p-1.5">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                  ${activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }
                `}
              >
                <i className={`ph ${section.icon}`}></i>
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

      {/* Content sections */}
      <div className="min-h-96">
        {/* Overview section */}
        {activeSection === 'overview' && (
          <div className={`
            transition-all duration-500 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Score circle */}
              <div className="flex justify-center">
                <ScoreCircle 
                  score={sampleAnalysis.overallScore} 
                  risk={sampleAnalysis.overallRisk} 
                  isVisible={isVisible && activeSection === 'overview'}
                />
              </div>

              {/* Key metrics */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-2xl">
                  <div className="text-2xl font-bold text-neutral-900">{sampleAnalysis.systemsAnalysed}</div>
                  <div className="text-sm text-neutral-600">Systems Analysed</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-2xl">
                  <div className="text-2xl font-bold text-red-600">{sampleAnalysis.systemsWithIssues}</div>
                  <div className="text-sm text-neutral-600">Systems with Issues</div>
                </div>
              </div>

              {/* Risk factors preview */}
              <div className="bg-white rounded-xl p-4 shadow-2xl">
                <h3 className="font-medium text-neutral-900 mb-3 text-sm">Key Risk Factors</h3>
                <div className="space-y-2">
                  {sampleAnalysis.riskFactors.slice(0, 3).map((factor, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs text-neutral-600">
                      <i className="ph ph-warning text-yellow-600 mt-0.5 flex-shrink-0"></i>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Systems section */}
        {activeSection === 'systems' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleAnalysis.systems.map((system, index) => (
              <div key={index} data-system-card>
                <SystemCard
                  system={system}
                  isExpanded={expandedSystems[index]}
                  onToggle={() => toggleSystem(index)}
                  delay={index * 100}
                />
              </div>
            ))}
          </div>
        )}

        {/* Patterns section */}
        {activeSection === 'patterns' && (
          <div className={`
            grid grid-cols-1 md:grid-cols-2 gap-6
            transition-all duration-500 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="flex items-center space-x-2 font-medium text-neutral-900 mb-4">
                <i className="ph ph-arrows-clockwise text-orange-600"></i>
                <span>Recurring Issues</span>
              </h3>
              <div className="space-y-3">
                {sampleAnalysis.patterns.recurringIssues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-neutral-700">{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="flex items-center space-x-2 font-medium text-neutral-900 mb-4">
                <i className="ph ph-link text-blue-600"></i>
                <span>Technical Bulletin Correlations</span>
              </h3>
              <div className="space-y-3">
                {sampleAnalysis.patterns.bulletinCorrelations.map((correlation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-neutral-700">{correlation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights section */}
        {activeSection === 'insights' && (
          <div className={`
            bg-white rounded-2xl p-6 shadow-2xl
            transition-all duration-500 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <h3 className="flex items-center space-x-2 font-medium text-neutral-900 mb-6">
              <i className="ph ph-wrench text-green-600"></i>
              <span>Professional Maintenance Insights</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleAnalysis.maintenanceInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                  <span className="text-sm text-neutral-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-600">
            This is a sample of the comprehensive analysis you receive with every premium report
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReportPreviewShowcase;