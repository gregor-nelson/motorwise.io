    import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';

// Visualization Components
const StoryIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="relative w-full max-w-md">
        {/* Main illustration - simplified CSS version */}
        <div className="relative">
          {/* Document/Report Card */}
          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl p-4 transform rotate-6 z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                <i className="ph ph-car text-blue-600 text-xl"></i>
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-neutral-200 rounded w-full"></div>
                <div className="h-2 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="h-1.5 bg-neutral-200 rounded flex-1"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="h-1.5 bg-neutral-200 rounded flex-1"></div>
              </div>
            </div>
            {/* Warning badge */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-neutral-900 font-bold text-lg">!</span>
            </div>
          </div>

          {/* Car illustration */}
          <div className="relative w-64 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-2xl overflow-hidden">
            {/* Car body */}
            <div className="absolute inset-0">
              {/* Windshield */}
              <div className="absolute top-4 right-12 w-16 h-12 bg-neutral-900 rounded-t-3xl opacity-80"></div>
              {/* Hood */}
              <div className="absolute bottom-8 left-8 right-8 h-12 bg-red-400 rounded-t-2xl"></div>
            </div>
            
            {/* Warning icons */}
            <div className="absolute top-2 left-4 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-20">
              <span className="text-neutral-900 font-bold text-sm">!</span>
            </div>
            <div className="absolute bottom-4 left-12 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-20">
              <span className="text-neutral-900 font-bold text-sm">!</span>
            </div>
            <div className="absolute top-6 right-6 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-20">
              <span className="text-neutral-900 font-bold text-sm">!</span>
            </div>
          </div>

          {/* Yellow document/folder behind */}
          <div className="absolute left-8 top-0 w-32 h-40 bg-yellow-400 rounded-lg shadow-lg transform -rotate-12 -z-10"></div>

          {/* Blue shadow/accent */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-blue-400 rounded-full blur-xl opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

const MarketPriceChart = () => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate chart elements with AnimeJS
          if (chartRef.current) {
            const animateElements = chartRef.current.querySelectorAll('[data-chart-animate]');
            animate(Array.from(animateElements), {
              opacity: [0, 1],
              translateY: [10, 0],
              duration: 600,
              ease: 'outQuad',
              delay: stagger(100)
            });
          }
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
    <div ref={chartRef} className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
      {/* Info note */}
      <div data-chart-animate className="flex items-start gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
        <i className="ph ph-info text-blue-600"></i>
        <div className="text-xs text-blue-900">
          <p className="font-medium">Note</p>
          <p className="text-blue-700">Last selling price: £21,400</p>
        </div>
      </div>

      {/* Chart title */}
      <h4 data-chart-animate className="text-sm font-semibold text-neutral-900 mb-4">Market price history</h4>

      {/* Chart area */}
      <div className="relative h-48 mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-neutral-400 pr-2">
          <span>£30k</span>
          <span>£25k</span>
          <span>£20k</span>
          <span>£15k</span>
        </div>

        {/* Chart content */}
        <div className="ml-8 h-full relative">
          {/* SVG Line Chart */}
          <svg className="w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="45" x2="300" y2="45" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="90" x2="300" y2="90" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="135" x2="300" y2="135" stroke="#e5e7eb" strokeWidth="1" />

            {/* Price line */}
            <polyline
              points="0,30 50,50 100,40 150,35 200,65 250,80 300,140"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                strokeDasharray: isVisible ? 'none' : '1000',
                strokeDashoffset: isVisible ? '0' : '1000'
              }}
            />

            {/* Data points */}
            <circle cx="150" cy="35" r="6" fill="#3b82f6" className={`transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
            <circle cx="200" cy="65" r="6" fill="#3b82f6" className={`transition-all duration-500 delay-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
          </svg>

          {/* Tooltip */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 text-xs border border-neutral-200">
            <p className="text-neutral-600">Actual car sale price</p>
            <p className="font-semibold text-neutral-900">£27,300</p>
            <p className="text-neutral-500 text-xs">Typical price for this model</p>
            <p className="font-medium text-neutral-800">£23,000</p>
          </div>

          {/* X-axis labels */}
          <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-neutral-400">
            <span>2012</span>
            <span>2017</span>
            <span>2022</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-8 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-neutral-600">Highest price</span>
          </div>
          <span className="font-medium text-neutral-900">£22,300</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-900"></div>
            <span className="text-neutral-600">Average price</span>
          </div>
          <span className="font-medium bg-neutral-900 text-white px-2 py-0.5 rounded">£21,000</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-neutral-600">Lowest price</span>
          </div>
          <span className="font-medium text-neutral-900">£14,000</span>
        </div>
      </div>

      {/* Market today section */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <p className="text-xs font-semibold text-neutral-900 mb-2">Market price today</p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-neutral-600">Typical</p>
            <p className="font-semibold text-neutral-900">£22,300</p>
          </div>
          <div>
            <p className="text-neutral-600">Range</p>
            <p className="font-semibold text-neutral-900">£14k - £22k</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MileageChart = () => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate chart elements with AnimeJS
          if (chartRef.current) {
            const animateElements = chartRef.current.querySelectorAll('[data-chart-animate]');
            animate(Array.from(animateElements), {
              opacity: [0, 1],
              scale: [0.95, 1],
              duration: 800,
              ease: 'outQuad',
              delay: stagger(100)
            });
          }
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
    <div ref={chartRef} className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto relative">
      {/* Warning tooltip */}
      <div data-chart-animate className="absolute -top-4 right-8 bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-3 max-w-xs z-10">
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
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Scale indicators */}
      <div className="mt-4 text-xs text-neutral-500 flex justify-between px-12">
        <span>10k</span>
        <span>40k</span>
      </div>
    </div>
  );
};

const OwnershipTimeline = () => {
  const [isVisible, setIsVisible] = useState(false);
  const timelineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate timeline elements with AnimeJS
          if (timelineRef.current) {
            const animateElements = timelineRef.current.querySelectorAll('[data-timeline-animate]');
            animate(Array.from(animateElements), {
              opacity: [0, 1],
              translateX: [-20, 0],
              duration: 600,
              ease: 'outQuad',
              delay: stagger(150)
            });
          }
        }
      },
      { threshold: 0.3 }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={timelineRef} className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
      {/* Info note */}
      <div className="flex items-start gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
        <i className="ph ph-info text-blue-600"></i>
        <div className="text-xs">
          <p className="font-medium text-blue-900">Note</p>
          <p className="text-blue-700">Average mileage for similar models: 100-000 km</p>
        </div>
      </div>

      {/* Ownership events title */}
      <h4 className="text-sm font-semibold text-neutral-900 mb-6">Ownership events</h4>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-neutral-300"></div>

        {/* Owner markers */}
        <div className="relative flex justify-between items-start">
          {/* 1st owner */}
          <div data-timeline-animate className="flex flex-col items-center w-1/3">
            <div className="bg-blue-500 text-white rounded-lg px-3 py-1 text-xs font-medium mb-4 shadow-md">
              1st owner
            </div>
            <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-md relative z-10 mb-3"></div>
            <div className="text-center">
              <p className="text-xs font-medium text-neutral-900 mb-1">Owner changed</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-lg">🇬🇧</span>
                <span className="text-xs text-neutral-600">United Kingdom</span>
              </div>
              <p className="text-xs text-neutral-500">2007-05</p>
            </div>
          </div>

          {/* 2nd owner */}
          <div data-timeline-animate className="flex flex-col items-center w-1/3">
            <div className="bg-blue-500 text-white rounded-lg px-3 py-1 text-xs font-medium mb-4 shadow-md">
              2nd owner
            </div>
            <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-md relative z-10 mb-3"></div>
            <div className="text-center">
              <p className="text-xs font-medium text-neutral-900 mb-1">Owner changed</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-lg">🇬🇧</span>
                <span className="text-xs text-neutral-600">United Kingdom</span>
              </div>
              <p className="text-xs text-neutral-500">2011-05</p>
            </div>
          </div>

          {/* 3rd owner */}
          <div data-timeline-animate className="flex flex-col items-center w-1/3">
            <div className="bg-blue-500 text-white rounded-lg px-3 py-1 text-xs font-medium mb-4 shadow-md">
              3rd owner
            </div>
            <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-md relative z-10 mb-3"></div>
            <div className="text-center">
              <p className="text-xs font-medium text-neutral-900 mb-1">Owner changed</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-lg">🇬🇧</span>
                <span className="text-xs text-neutral-600">United Kingdom</span>
              </div>
              <p className="text-xs text-neutral-500">2020-05</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Feature Section Component
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

// Main Component
const FeatureSections = () => {
  const sections = [
    {
      badge: null,
      title: (
        <>
          Every car has a story.{' '}
          <span className="block">Let our data uncover yours</span>
        </>
      ),
      description: (
        <>
          <p>
            Powered by 900+ data sources, carVertical scans <strong>over a billion verified records</strong> that help paint a crystal-clear picture of your car's past.
          </p>
          <p className="mt-4">
            Explore how <strong>4.5+ million drivers & dealers</strong> are using automotive data to make smarter decisions, avoid costly mistakes, and buy with confidence.
          </p>
        </>
      ),
      visualComponent: <StoryIllustration />,
      bgColor: 'bg-white',
      reversed: false
    },
    {
      badge: 'Market value',
      title: 'Make better, data-driven deals',
      description: (
        <>
          <p>
            The market can change fast, and guessing a car's worth can lead to bad deals. Our <strong>Market Value</strong> model helps you see the price range for similar cars in your market, so you <strong>don't get shortchanged</strong>.
          </p>
          <p className="mt-4">
            Make sure you get a fair deal, whether buying or selling.
          </p>
        </>
      ),
      visualComponent: <MarketPriceChart />,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      reversed: true
    },
    {
      badge: 'Mileage',
      title: "Know how far it's really been",
      description: (
        <>
          <p>
            Odometer readings can tell you a lot about a car's life – but only if they're accurate. With carVertical's <strong>Mileage data</strong>, you can easily verify a vehicle's true mileage, backed by data from <strong>900+ trusted sources across 35 countries</strong> like maintenance logs and inspections.
          </p>
          <p className="mt-4">
            Feel confident knowing you have the full picture before you buy.
          </p>
        </>
      ),
      visualComponent: <MileageChart />,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      reversed: false
    },
    {
      badge: 'Ownership change',
      title: 'Every owner is a clue – piece the real story together',
      description: (
        <>
          <p>
            Ownership changes are more than just a transfer of keys.
          </p>
          <p className="mt-4">
            Our <strong>Ownership Changes</strong> data can show you <strong>how many times it's been sold and when</strong>, giving you insight into whether past owners encountered problems.
          </p>
          <p className="mt-4">
            Don't take chances. Make sure you're not stepping into a problem someone else is trying to leave behind.
          </p>
        </>
      ),
      visualComponent: <OwnershipTimeline />,
      bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
      reversed: true
    }
  ];

  return (
    <div className="w-full">
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
    </div>
  );
};

export default FeatureSections;