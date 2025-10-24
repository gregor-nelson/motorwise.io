import React, { useState, useEffect, useRef } from 'react';

// Stage color configurations - Hero/FAQ inspired
const STAGE_COLORS = {
  0: { // Vehicle Lookup
    name: 'input',
    bgPastel: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-blue-600',
    borderColor: 'border-blue-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-blue-300',
    glowColor: 'from-blue-200 to-blue-300',
    statusActive: 'bg-blue-500',
    statusComplete: 'bg-green-500',
    badgeActive: 'bg-blue-100 text-blue-700 border-blue-300',
    badgeComplete: 'bg-green-100 text-green-700 border-green-300'
  },
  1: { // Government Data
    name: 'data',
    bgPastel: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-purple-600',
    borderColor: 'border-purple-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-purple-300',
    glowColor: 'from-purple-200 to-purple-300',
    statusActive: 'bg-purple-500',
    statusComplete: 'bg-green-500',
    badgeActive: 'bg-purple-100 text-purple-700 border-purple-300',
    badgeComplete: 'bg-green-100 text-green-700 border-green-300'
  },
  2: { // Technical Data
    name: 'technical',
    bgPastel: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-cyan-600',
    borderColor: 'border-cyan-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-cyan-300',
    glowColor: 'from-cyan-200 to-cyan-300',
    statusActive: 'bg-cyan-500',
    statusComplete: 'bg-green-500',
    badgeActive: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    badgeComplete: 'bg-green-100 text-green-700 border-green-300'
  },
  3: { // AI Analysis
    name: 'analysis',
    bgPastel: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-amber-600',
    borderColor: 'border-amber-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-amber-300',
    glowColor: 'from-amber-200 to-amber-300',
    statusActive: 'bg-amber-500',
    statusComplete: 'bg-green-500',
    badgeActive: 'bg-amber-100 text-amber-700 border-amber-300',
    badgeComplete: 'bg-green-100 text-green-700 border-green-300'
  }
};

// Pipeline stage component
const PipelineStage = ({
  icon,
  title,
  subtitle,
  content,
  isActive,
  isComplete,
  delay = 0,
  onClick,
  stageIndex = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const stageRef = useRef(null);
  const colors = STAGE_COLORS[stageIndex] || STAGE_COLORS[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Determine rotation class
  const rotationClasses = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
  const rotation = rotationClasses[stageIndex % rotationClasses.length];

  return (
    <div
      ref={stageRef}
      onClick={onClick}
      className={`
        group relative transform ${rotation} hover:rotate-0
        transition-all duration-500 ease-out cursor-pointer
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
    >
      {/* Decorative glow effect - Hero inspired */}
      <div className={`
        absolute -inset-1 bg-gradient-to-br ${colors.glowColor} rounded-2xl
        opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500
      `}></div>

      {/* Main card with pastel background */}
      <div className={`
        relative ${colors.bgPastel} rounded-2xl shadow-2xl p-6
        border-2 ${isActive || isComplete ? colors.borderColor : colors.borderNeutral}
        ${colors.hoverBorder}
        transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]
      `}>
        {/* Left border accent for active/complete state - Hero alert pattern */}
        {(isActive || isComplete) && (
          <div className={`
            absolute left-0 top-6 bottom-6 w-1 rounded-r-full
            ${isComplete ? 'bg-green-500' : 'bg-blue-500'}
          `}></div>
        )}

        {/* Status badge - Hero badge pattern */}
        <div className={`
          absolute -top-3 -right-3 px-3 py-1 rounded-full shadow-md
          text-xs font-medium border-2 flex items-center gap-1.5
          ${isComplete ? colors.badgeComplete :
            isActive ? colors.badgeActive :
            'bg-neutral-100 text-neutral-600 border-neutral-300'}
        `}>
          {isComplete ? (
            <>
              <i className="ph ph-check-circle text-sm"></i>
              <span>Done</span>
            </>
          ) : isActive ? (
            <>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span>Active</span>
            </>
          ) : (
            <>
              <i className="ph ph-circle text-sm"></i>
              <span>Pending</span>
            </>
          )}
        </div>

        {/* Icon container - Hero/FAQ pattern */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {/* Icon glow layer */}
            <div className={`
              absolute -inset-1 bg-gradient-to-br ${colors.glowColor} rounded-xl
              opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-300
            `}></div>
            {/* Icon container - square with larger size */}
            <div className={`
              relative w-16 h-16 rounded-xl ${colors.iconBg}
              flex items-center justify-center shadow-sm
              border-2 border-transparent ${colors.hoverBorder}
              group-hover:scale-110 transition-all duration-300
            `}>
              <i className={`
                ph ${icon} text-4xl
                ${colors.iconColor} ${colors.iconHoverColor}
                transition-colors duration-200
              `}></i>
            </div>
          </div>
        </div>

        {/* Title with decorative underline - Hero pattern */}
        <div className="text-center mb-2">
          <h3 className="text-base font-medium text-neutral-900 mb-1.5 font-jost">{title}</h3>
          <p className="text-xs text-neutral-600 mb-2">{subtitle}</p>
          {/* Decorative gradient underline */}
          <div className="flex justify-center">
            <div className={`w-12 h-0.5 bg-gradient-to-r ${colors.glowColor} opacity-60 rounded-full`}></div>
          </div>
        </div>

        {/* Content with nested background - card-within-card */}
        <div className="mt-4">
          {content}
        </div>
      </div>
    </div>
  );
};

// Connection line component
const ConnectionLine = ({ isAnimated, delay = 0 }) => {
  const [isDrawn, setIsDrawn] = useState(false);

  useEffect(() => {
    if (isAnimated) {
      const timer = setTimeout(() => {
        setIsDrawn(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isAnimated, delay]);

  return (
    <div className="flex items-center justify-center my-4">
      <div className="relative w-full h-px bg-neutral-200 overflow-hidden">
        <div 
          className={`
            absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500
            transition-all duration-1000 ease-out
            ${isDrawn ? 'w-full' : 'w-0'}
          `}
        />
      </div>
    </div>
  );
};

// System health matrix
const SystemHealthMatrix = ({ systems = [], isVisible = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-transparent0';
      case 'critical': return 'bg-red-500';
      default: return 'bg-neutral-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return 'ph-check';
      case 'warning': return 'ph-warning';
      case 'critical': return 'ph-x';
      default: return 'ph-minus';
    }
  };

  return (
    <div className={`
      grid grid-cols-5 gap-2 max-w-sm mx-auto
      transition-all duration-1000 ease-out
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `}>
      {Array.from({ length: 15 }, (_, index) => {
        const system = systems[index] || { status: 'unknown' };
        return (
          <div
            key={index}
            className={`
              aspect-square rounded-lg shadow-sm border-2
              flex items-center justify-center text-white text-xs
              transition-all duration-300 ease-out hover:scale-110 cursor-pointer
              ${getStatusColor(system.status)}
              ${system.status === 'good' ? 'border-green-600' :
                system.status === 'warning' ? 'border-yellow-600' :
                system.status === 'critical' ? 'border-red-600' :
                'border-neutral-400'}
            `}
            style={{
              animationDelay: `${index * 50}ms`
            }}
            title={`System ${index + 1}: ${system.status}`}
          >
            <i className={`ph ${getStatusIcon(system.status)}`}></i>
          </div>
        );
      })}
    </div>
  );
};

// Progress bar component
const ProgressBar = ({ progress = 0, isAnimated = false }) => {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (isAnimated) {
      const timer = setTimeout(() => {
        setCurrentProgress(progress);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimated, progress]);

  return (
    <div className="space-y-2">
      <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden border border-neutral-300 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${currentProgress}%` }}
        >
          {/* Animated shine effect */}
          {currentProgress > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          )}
        </div>
      </div>
      {/* Progress percentage */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-neutral-500">Progress</span>
        <span className="font-medium text-neutral-700">{currentProgress}%</span>
      </div>
    </div>
  );
};

// Main pipeline visualizer component
const AnalysisPipelineVisualizer = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const visualizerRef = useRef(null);

  // Intersection observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          startPipelineAnimation();
        }
      },
      { threshold: 0.3 }
    );

    if (visualizerRef.current) {
      observer.observe(visualizerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Pipeline animation sequence
  const startPipelineAnimation = () => {
    const stages = [0, 1, 2, 3];
    stages.forEach((stage, index) => {
      setTimeout(() => {
        setActiveStage(stage);
        setTimeout(() => {
          setCompletedStages(prev => [...prev, stage]);
          if (stage < 3) setActiveStage(stage + 1);
        }, 2000);
      }, index * 2500);
    });
  };

  // Sample system data
  const sampleSystems = [
    { status: 'good' }, { status: 'warning' }, { status: 'critical' }, { status: 'good' }, { status: 'warning' },
    { status: 'good' }, { status: 'good' }, { status: 'critical' }, { status: 'warning' }, { status: 'good' },
    { status: 'warning' }, { status: 'good' }, { status: 'good' }, { status: 'warning' }, { status: 'good' }
  ];

  // Pipeline stage configurations
  const stages = [
    {
      icon: 'ph-keyboard',
      title: 'Vehicle Lookup',
      subtitle: 'Registration Input',
      content: (
        <div className="space-y-3">
          {/* Nested card with background - Hero pattern */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-full max-w-32 mx-auto mb-3 px-3 py-2 text-lg font-mono bg-neutral-50 rounded border border-neutral-200">
                AB12 CDE
              </div>
              <div className="flex justify-center space-x-1">
                {activeStage >= 0 && (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Status text with icon */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
            <i className="ph ph-magnifying-glass text-sm"></i>
            <span>{activeStage >= 0 ? 'Processing registration...' : 'Awaiting input'}</span>
          </div>
        </div>
      )
    },
    {
      icon: 'ph-buildings',
      title: 'Government Data',
      subtitle: 'DVLA MOT Database',
      content: (
        <div className="space-y-3">
          {/* Nested card - Hero alert pattern inspired */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <i className="ph ph-database text-sm text-neutral-600"></i>
              <span className="text-xs font-medium text-neutral-700">MOT Records</span>
            </div>
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`
                    w-5 h-8 rounded transition-all duration-500 shadow-sm
                    flex items-center justify-center
                    ${completedStages.includes(1) ?
                      (i < 2 ? 'bg-green-100 border border-green-300' :
                       i === 2 ? 'bg-yellow-100 border border-yellow-300' :
                       'bg-red-100 border border-red-300') :
                      'bg-neutral-100 border border-neutral-200'
                    }
                  `}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {completedStages.includes(1) && (
                    <div className="text-xs">
                      {i < 2 ? <i className="ph ph-check text-green-600"></i> :
                       i === 2 ? <i className="ph ph-warning text-yellow-600"></i> :
                       <i className="ph ph-x text-red-600"></i>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Status with icon */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
            <i className="ph ph-file-text text-sm"></i>
            <span>{activeStage >= 1 ? '4 MOT tests • 23 defects' : 'Fetching history...'}</span>
          </div>
        </div>
      )
    },
    {
      icon: 'ph-wrench',
      title: 'Technical Data',
      subtitle: 'Service Bulletins',
      content: (
        <div className="space-y-3">
          {/* Nested card with gradient background */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <i className="ph ph-graph text-sm text-neutral-600"></i>
              <span className="text-xs font-medium text-neutral-700">Data Matching</span>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex space-x-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`
                        w-4 h-4 rounded-full transition-all duration-500 shadow-sm
                        border-2 flex items-center justify-center
                        ${completedStages.includes(2) ?
                          'bg-cyan-500 border-cyan-600' :
                          'bg-neutral-100 border-neutral-300'}
                      `}
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      {completedStages.includes(2) && (
                        <i className="ph ph-check text-white text-[8px]"></i>
                      )}
                    </div>
                    {i < 3 && (
                      <div
                        className={`
                          w-8 h-0.5 transition-all duration-500 rotate-90 origin-left
                          ${completedStages.includes(2) ? 'bg-cyan-300' : 'bg-neutral-200'}
                        `}
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Status with icon */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
            <i className="ph ph-check-square text-sm"></i>
            <span>{activeStage >= 2 ? '4 bulletins matched' : 'Matching bulletins...'}</span>
          </div>
        </div>
      )
    },
    {
      icon: 'ph-brain',
      title: 'AI Analysis',
      subtitle: 'Pattern Recognition',
      content: (
        <div className="space-y-3">
          {/* Progress section - nested card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <i className="ph ph-spinner-gap text-sm text-neutral-600"></i>
              <span className="text-xs font-medium text-neutral-700">Analysis Progress</span>
            </div>
            <ProgressBar
              progress={completedStages.includes(3) ? 100 : activeStage >= 3 ? 67 : 0}
              isAnimated={activeStage >= 3}
            />
          </div>

          {/* System Health Matrix - nested card with gradient */}
          {activeStage >= 3 && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 shadow-sm border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <i className="ph ph-grid-four text-sm text-amber-700"></i>
                <span className="text-xs font-medium text-amber-900">System Health</span>
              </div>
              <SystemHealthMatrix
                systems={sampleSystems}
                isVisible={completedStages.includes(3)}
              />
            </div>
          )}

          {/* Risk Score - Hero badge pattern */}
          <div className="text-center">
            {completedStages.includes(3) ? (
              <div className="inline-flex flex-col items-center gap-2 px-4 py-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex items-center gap-2">
                  <i className="ph ph-warning text-yellow-600 text-lg"></i>
                  <div className="text-2xl font-bold text-neutral-900">67<span className="text-sm font-normal text-neutral-600">/100</span></div>
                </div>
                <div className="text-xs font-medium text-yellow-900">Medium Risk</div>
              </div>
            ) : activeStage >= 3 ? (
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                <i className="ph ph-circle-notch animate-spin text-sm"></i>
                <span>Processing systems...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <i className="ph ph-clock text-sm"></i>
                <span>Awaiting data...</span>
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div ref={visualizerRef} className="max-w-6xl mx-auto p-6">
      {/* Header - Hero inspired */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <i className="ph ph-flow-arrow text-blue-600 text-2xl"></i>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-tight tracking-tight font-jost">
            Professional Intelligence Pipeline
          </h2>
        </div>
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-6">
          Watch how we transform a simple registration into comprehensive professional-grade vehicle intelligence
        </p>
        {/* Animated underline - Hero pattern */}
        <div className="flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 rounded-full"></div>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stages.map((stage, index) => (
          <PipelineStage
            key={index}
            {...stage}
            stageIndex={index}
            isActive={activeStage === index}
            isComplete={completedStages.includes(index)}
            delay={index * 200}
          />
        ))}
      </div>

      {/* Connection lines for larger screens */}
      <div className="hidden lg:block relative -mt-20 mb-20">
        <div className="grid grid-cols-4 gap-8">
          {[0, 1, 2].map(index => (
            <div key={index} className="flex justify-end">
              <ConnectionLine 
                isAnimated={activeStage > index} 
                delay={index * 2500 + 1000}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats - Hero inspired badges */}
      {completedStages.includes(3) && (
        <div className={`
          mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto
          transition-all duration-1000 ease-out delay-1000
          ${completedStages.includes(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
        `}>
          <div className="group text-center p-5 bg-white rounded-xl shadow-md border-2 border-neutral-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="ph ph-timer text-blue-600 text-lg"></i>
              <div className="text-2xl font-bold text-neutral-900">2.3s</div>
            </div>
            <div className="text-xs font-medium text-neutral-600">Analysis Time</div>
          </div>
          <div className="group text-center p-5 bg-white rounded-xl shadow-md border-2 border-neutral-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="ph ph-check-circle text-purple-600 text-lg"></i>
              <div className="text-2xl font-bold text-neutral-900">15</div>
            </div>
            <div className="text-xs font-medium text-neutral-600">Systems Checked</div>
          </div>
          <div className="group text-center p-5 bg-white rounded-xl shadow-md border-2 border-neutral-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="ph ph-chart-line text-cyan-600 text-lg"></i>
              <div className="text-2xl font-bold text-neutral-900">847</div>
            </div>
            <div className="text-xs font-medium text-neutral-600">Data Points</div>
          </div>
          <div className="group text-center p-5 bg-white rounded-xl shadow-md border-2 border-neutral-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="ph ph-seal-check text-green-600 text-lg"></i>
              <div className="text-2xl font-bold text-neutral-900">99.8%</div>
            </div>
            <div className="text-xs font-medium text-neutral-600">Accuracy</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPipelineVisualizer;