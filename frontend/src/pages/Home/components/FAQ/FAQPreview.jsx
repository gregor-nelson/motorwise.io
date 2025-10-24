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

// Category configuration with explicit Tailwind classes (purge-safe)
const CATEGORY_CONFIG = {
  'Using the service': {
    icon: 'ph-computer-tower',
    bgPastel: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-blue-300',
    glowColor: 'from-blue-200 to-blue-300',
    underlineGradient: 'from-blue-400 to-transparent',
    buttonBg: 'bg-amber-400',
    buttonHover: 'hover:bg-amber-500'
  },
  'Premium services': {
    icon: 'ph-star',
    bgPastel: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-purple-300',
    glowColor: 'from-purple-200 to-purple-300',
    underlineGradient: 'from-purple-400 to-transparent',
    buttonBg: 'bg-amber-400',
    buttonHover: 'hover:bg-amber-500'
  },
  'Trust and reliability': {
    icon: 'ph-seal-check',
    bgPastel: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-pink-600',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-pink-300',
    glowColor: 'from-pink-200 to-pink-300',
    underlineGradient: 'from-pink-400 to-transparent',
    buttonBg: 'bg-amber-400',
    buttonHover: 'hover:bg-amber-500'
  }
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
        {featuredItems.map(({ category, questions }) => {
          const config = CATEGORY_CONFIG[category];
          return (
            <div key={category} className={`relative group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 ${config.borderNeutral} ${config.hoverBorder} flex flex-col`}>
              {/* Subtle glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.glowColor} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`}></div>

              <div className="relative flex flex-col flex-1">
                {/* Category header with refined icon design */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    {/* Icon glow layer */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${config.glowColor} rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300`}></div>
                    {/* Icon container - square with larger size */}
                    <div className={`relative w-14 h-14 rounded-xl ${config.iconBg} flex items-center justify-center shadow-sm border-2 border-transparent ${config.hoverBorder} group-hover:scale-110 transition-all duration-300`}>
                      <i className={`ph ${config.icon} text-3xl ${config.iconColor} ${config.iconHoverColor} transition-colors duration-200`}></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-neutral-900 font-jost mb-1.5">{category}</h3>
                    {/* Decorative gradient underline */}
                    <div className={`w-16 h-0.5 bg-gradient-to-r ${config.underlineGradient} opacity-60 rounded-full`}></div>
                  </div>
                </div>

                {/* Questions list - grows to fill space */}
                <ul className="space-y-3 mb-6 flex-1">
                  {questions.map(question => (
                    <li key={question.id}>
                      <Link
                        to={`/knowledge-center?category=${encodeURIComponent(category)}&question=${question.id}`}
                        className="group/link flex items-start space-x-2 text-sm text-neutral-700 hover:text-blue-600 transition-colors duration-200"
                      >
                        <i className="ph ph-arrow-right text-neutral-400 group-hover/link:text-blue-600 group-hover/link:translate-x-1 transition-all duration-200 mt-0.5 flex-shrink-0"></i>
                        <span className="leading-relaxed">{question.question}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Show more button - pinned to bottom, left-aligned */}
                <Link
                  to="/knowledge-center"
                  className={`inline-flex items-center space-x-2 px-6 py-3 ${config.buttonBg} ${config.buttonHover} text-neutral-900 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-sm`}
                >
                  <span>Show more</span>
                  <i className="ph ph-arrow-right text-sm"></i>
                </Link>
              </div>
            </div>
          );
        })}
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
