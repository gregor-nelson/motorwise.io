import React, { useState, useEffect, useRef } from 'react';

// Pipeline stage component
const PipelineStage = ({ 
  icon, 
  title, 
  subtitle, 
  content, 
  isActive, 
  isComplete, 
  delay = 0,
  onClick 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const stageRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={stageRef}
      onClick={onClick}
      className={`
        relative p-6 bg-white rounded-lg cursor-pointer
        transition-all duration-500 ease-out hover:shadow-lg hover:scale-105
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
        ${isActive ? 'bg-blue-50' : ''}
        ${isComplete ? 'bg-green-50' : ''}
      `}
    >
      {/* Status indicator */}
      <div className={`
        absolute -top-3 -right-3 w-6 h-6 rounded-full shadow-md
        flex items-center justify-center text-xs
        ${isComplete ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-neutral-300'}
      `}>
        {isComplete ? (
          <i className="ph ph-check text-white text-sm"></i>
        ) : isActive ? (
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        ) : (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
      </div>

      {/* Icon */}
      <div className="text-center mb-4">
        <i className={`ph ${icon} text-3xl ${
          isComplete ? 'text-green-600' : 
          isActive ? 'text-blue-600' : 
          'text-neutral-400'
        }`}></i>
      </div>

      {/* Title */}
      <div className="text-center mb-2">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="text-xs text-neutral-600">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="mt-4">
        {content}
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
              aspect-square rounded shadow-sm
              flex items-center justify-center text-white text-xs
              transition-all duration-300 ease-out hover:scale-110
              ${getStatusColor(system.status)}
            `}
            style={{
              animationDelay: `${index * 50}ms`
            }}
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
    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${currentProgress}%` }}
      />
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
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-full max-w-32 mx-auto mb-3 px-3 py-2 text-lg font-mono bg-neutral-50 rounded">
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
      )
    },
    {
      icon: 'ph-buildings',
      title: 'Government Data',
      subtitle: 'DVLA MOT Database',
      content: (
        <div className="space-y-3">
          <div className="flex justify-center space-x-1">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`
                  w-4 h-6 rounded-sm transition-all duration-500
                  ${completedStages.includes(1) ? 
                    (i < 2 ? 'bg-green-200' : 
                     i === 2 ? 'bg-yellow-200' : 
                     'bg-red-200') :
                    'bg-neutral-200'
                  }
                `}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {completedStages.includes(1) && (
                  <div className="w-full h-full flex items-center justify-center text-xs">
                    {i < 2 ? <i className="ph ph-check text-green-600"></i> :
                     i === 2 ? <i className="ph ph-warning text-yellow-600"></i> :
                     <i className="ph ph-x text-red-600"></i>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-neutral-600">
            {activeStage >= 1 ? '4 MOT tests • 23 defects' : 'Fetching history...'}
          </p>
        </div>
      )
    },
    {
      icon: 'ph-wrench',
      title: 'Technical Data',
      subtitle: 'Service Bulletins',
      content: (
        <div className="space-y-3">
          <div className="flex justify-center items-center">
            <div className="flex space-x-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className={`
                      w-3 h-3 rounded-full transition-all duration-500
                      ${completedStages.includes(2) ? 'bg-blue-500' : 'bg-neutral-300'}
                    `}
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                  {i < 3 && (
                    <div 
                      className={`
                        w-6 h-px transition-all duration-500
                        ${completedStages.includes(2) ? 'bg-blue-300' : 'bg-neutral-200'}
                      `}
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-center text-neutral-600">
            {activeStage >= 2 ? '4 bulletins matched' : 'Matching bulletins...'}
          </p>
        </div>
      )
    },
    {
      icon: 'ph-brain',
      title: 'AI Analysis',
      subtitle: 'Pattern Recognition',
      content: (
        <div className="space-y-4">
          <ProgressBar 
            progress={completedStages.includes(3) ? 100 : activeStage >= 3 ? 67 : 0} 
            isAnimated={activeStage >= 3}
          />
          <SystemHealthMatrix 
            systems={sampleSystems} 
            isVisible={completedStages.includes(3)}
          />
          <div className="text-center">
            {completedStages.includes(3) ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-neutral-900">67<span className="text-sm font-normal text-neutral-500">/100</span></div>
                <div className="text-xs text-neutral-600">Medium Risk</div>
              </div>
            ) : activeStage >= 3 ? (
              <div className="text-xs text-neutral-600">Processing systems...</div>
            ) : (
              <div className="text-xs text-neutral-600">Awaiting data...</div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div ref={visualizerRef} className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
          <i className="ph ph-flow-arrow text-blue-600 mr-3"></i>
          Professional Intelligence Pipeline
        </h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Watch how we transform a simple registration into comprehensive professional-grade vehicle intelligence
        </p>
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stages.map((stage, index) => (
          <PipelineStage
            key={index}
            {...stage}
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

      {/* Summary stats */}
      {completedStages.includes(3) && (
        <div className={`
          mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto
          transition-all duration-1000 ease-out delay-1000
          ${completedStages.includes(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
        `}>
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <div className="text-lg font-bold text-neutral-900">2.3s</div>
            <div className="text-xs text-neutral-600">Analysis Time</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <div className="text-lg font-bold text-neutral-900">15</div>
            <div className="text-xs text-neutral-600">Systems Checked</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <div className="text-lg font-bold text-neutral-900">847</div>
            <div className="text-xs text-neutral-600">Data Points</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <div className="text-lg font-bold text-neutral-900">99.8%</div>
            <div className="text-xs text-neutral-600">Accuracy</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPipelineVisualizer;