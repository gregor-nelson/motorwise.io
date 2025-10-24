import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';

const TransitionBridge = () => {
  const [isVisible, setIsVisible] = useState(false);
  const decorativeRef = useRef(null);
  const contentRef = useRef(null);
  const sectionRef = useRef(null);

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
          // Animate content when visible
          if (contentRef.current) {
            const elements = contentRef.current.querySelectorAll('[data-animate]');
            animate(Array.from(elements), {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 800,
              ease: 'outQuad',
              delay: stagger(150)
            });
          }
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-br from-cyan-50 to-blue-50 min-h-[40vh] flex items-center justify-center py-16 md:py-20 overflow-hidden"
    >
      {/* Decorative floating circles */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-10 w-3 h-3 bg-blue-300 rounded-full opacity-30"></div>
        <div className="absolute top-32 right-32 w-2 h-2 bg-cyan-400 rounded-full opacity-25"></div>
        <div className="absolute bottom-32 left-12 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-35"></div>
        <div className="absolute top-40 left-20 w-2 h-2 bg-cyan-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-40 right-16 w-3 h-3 bg-blue-200 rounded-full opacity-30"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <div ref={contentRef} className="space-y-6">
          {/* Badge */}
          <div data-animate className="inline-block">
            <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full shadow-md">
              Interactive Demo
            </span>
          </div>

          {/* Main Headline */}
          <h2 data-animate className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
            See it all come together in your{' '}
            <span className="text-neutral-700">comprehensive report</span>
          </h2>

          {/* Description */}
          <p data-animate className="text-base md:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto">
            Every data point, every analysis, beautifully organized into an easy-to-understand report.
            <span className="font-semibold"> Explore the interactive preview below.</span>
          </p>

          {/* Scroll indicator */}
          <div data-animate className="flex justify-center pt-4">
            <div className="animate-bounce">
              <i className="ph ph-caret-down text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransitionBridge;
