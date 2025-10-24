import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { FAQ_ITEMS } from './helpData';
import { HowToUseSection, SupportSection, GlossarySection } from './FAQ';

// Tab configuration
const TAB_CONFIG = [
  { id: 'faqs', label: 'FAQs', icon: 'ph-question', color: 'blue' },
  { id: 'guide', label: 'How to Use', icon: 'ph-list-numbers', color: 'green' },
  { id: 'support', label: 'Support', icon: 'ph-headset', color: 'purple' },
  { id: 'glossary', label: 'Glossary', icon: 'ph-book', color: 'amber' }
];

// Category configuration
const CATEGORY_CONFIG = {
  'Using the service': { icon: 'ph-computer-tower', color: 'blue' },
  'Premium services': { icon: 'ph-star', color: 'purple' },
  'Trust and reliability': { icon: 'ph-seal-check', color: 'pink' }
};

// Select featured questions for home page preview
const FEATURED_CATEGORIES = ['Using the service', 'Premium services', 'Trust and reliability'];
const QUESTIONS_PER_CATEGORY = 3;

// FAQs Preview Section
const FAQsPreview = () => {
  const decorativeRef = useRef(null);

  useEffect(() => {
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

  const featuredItems = FEATURED_CATEGORIES.map(category => ({
    category,
    questions: FAQ_ITEMS.filter(item => item.category === category).slice(0, QUESTIONS_PER_CATEGORY)
  }));

  return (
    <section className="relative max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Decorative floating circles */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 right-10 w-3 h-3 bg-blue-300 rounded-full opacity-40"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-purple-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-40 left-16 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-35"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {featuredItems.map(({ category, questions }) => (
          <div key={category} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-full bg-${CATEGORY_CONFIG[category].color}-50 flex items-center justify-center`}>
                <i className={`ph ${CATEGORY_CONFIG[category].icon} text-2xl text-${CATEGORY_CONFIG[category].color}-600`}></i>
              </div>
              <div>
                <h3 className="text-base font-medium text-neutral-900 font-jost">{category}</h3>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {questions.map(question => (
                <li key={question.id}>
                  <Link
                    to={`/knowledge-center?category=${encodeURIComponent(category)}&question=${question.id}`}
                    className="group flex items-start space-x-2 text-sm text-neutral-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <i className="ph ph-arrow-right text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 mt-0.5 flex-shrink-0"></i>
                    <span className="leading-relaxed">{question.question}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              to="/knowledge-center"
              className="block w-full px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-900 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 text-center shadow-sm"
            >
              Show more
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

// Note: How to Use, Support, and Glossary sections use the full components from FAQ.jsx

// Main Preview Component
const FAQPreview = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  const tabsRef = useRef(null);

  useEffect(() => {
    // Animate tab buttons on mount
    if (tabsRef.current) {
      const tabs = tabsRef.current.querySelectorAll('button');
      animate(Array.from(tabs), {
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 400,
        ease: 'outQuad',
        delay: stagger(80)
      });
    }
  }, []);

  const components = {
    faqs: FAQsPreview,
    guide: HowToUseSection,
    support: SupportSection,
    glossary: GlossarySection
  };

  const Component = components[activeTab];

  return (
    <div id="help" className="bg-white py-12 md:py-16 lg:py-20">
      <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-center">
        <header className="mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-tight tracking-tight mb-4 font-jost">
            Quick Help
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Common questions and helpful resources to get you started.
          </p>

          {/* Animated underline */}
          <div className="flex justify-center mt-6">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 rounded-full"></div>
          </div>
        </header>

        <nav ref={tabsRef} className="flex justify-center mb-12" role="tablist">
          <div className="inline-flex bg-neutral-100 rounded-2xl p-2 shadow-sm">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md scale-105'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                }`}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
              >
                <i className={`ph ${tab.icon} text-lg`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </section>

      <main
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="animate-fadeIn"
      >
        <Component />
      </main>

      {/* Link to full knowledge center - only show on FAQs tab (preview) */}
      {activeTab === 'faqs' && (
        <div className="text-center mt-12">
          <Link
            to="/knowledge-center"
            className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            <span>View all questions in Knowledge Center</span>
            <i className="ph ph-arrow-right"></i>
          </Link>
        </div>
      )}
    </div>
  );
};

export default FAQPreview;
