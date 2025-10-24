import React, { useState, useMemo, useRef, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { FAQ_ITEMS, GLOSSARY_ITEMS, GUIDE_STEPS } from './helpData';

// Custom hooks
const useSearch = (items, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => item[field].toLowerCase().includes(term))
    );
  }, [searchTerm, items, searchFields]);

  return { searchTerm, setSearchTerm, results };
};

const useFormValidation = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (formValues) => {
    const newErrors = {};
    if (!formValues.name.trim()) newErrors.name = 'Enter your full name';
    if (!formValues.email.trim()) newErrors.email = 'Enter your email address';
    else if (!/\S+@\S+\.\S+/.test(formValues.email)) newErrors.email = 'Enter a valid email address';
    if (!formValues.inquiry) newErrors.inquiry = 'Select an inquiry type';
    if (!formValues.message.trim()) newErrors.message = 'Enter your message';
    else if (formValues.message.length < 20) newErrors.message = 'Message must be at least 20 characters';
    return newErrors;
  };

  const handleSubmit = async (e, onSubmit) => {
    e.preventDefault();
    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = document.getElementById(`field-${Object.keys(validationErrors)[0]}`);
      if (firstError) firstError.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setValues(initialValues);
      setIsSubmitted(true);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, isSubmitted, handleChange, handleSubmit };
};

// Category configuration with pastel colors matching navbar aesthetic (Tailwind purge-safe)
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
    buttonBg: 'bg-blue-50',
    buttonText: 'text-blue-600',
    buttonHover: 'hover:bg-blue-100'
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
    buttonBg: 'bg-purple-50',
    buttonText: 'text-purple-600',
    buttonHover: 'hover:bg-purple-100'
  },
  'Data and privacy': {
    icon: 'ph-shield-check',
    bgPastel: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-green-300',
    glowColor: 'from-green-200 to-green-300',
    underlineGradient: 'from-green-400 to-transparent',
    buttonBg: 'bg-green-50',
    buttonText: 'text-green-600',
    buttonHover: 'hover:bg-green-100'
  },
  'Technical questions': {
    icon: 'ph-wrench',
    bgPastel: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-neutral-700',
    iconHoverColor: 'group-hover:text-amber-600',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-300',
    borderNeutral: 'border-neutral-200',
    hoverBorder: 'hover:border-amber-300',
    glowColor: 'from-amber-200 to-amber-300',
    underlineGradient: 'from-amber-400 to-transparent',
    buttonBg: 'bg-amber-50',
    buttonText: 'text-amber-600',
    buttonHover: 'hover:bg-amber-100'
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
    buttonBg: 'bg-pink-50',
    buttonText: 'text-pink-600',
    buttonHover: 'hover:bg-pink-100'
  }
};

const TAB_CONFIG = [
  { id: 'faqs', label: 'FAQs', icon: 'ph-question', color: 'blue' },
  { id: 'guide', label: 'How to Use', icon: 'ph-list-numbers', color: 'green' },
  { id: 'support', label: 'Support', icon: 'ph-headset', color: 'purple' },
  { id: 'glossary', label: 'Glossary', icon: 'ph-book', color: 'amber' }
];

// Reusable Components
const FormField = ({ id, name, label, type = 'text', value, error, onChange, required, children, ...props }) => {
  const fieldId = `field-${id}`;
  const errorId = `error-${id}`;
  const Tag = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input';

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-blue-600 ml-1" aria-hidden="true">*</span>}
      </label>
      {type === 'select' ? (
        <div className="relative">
          <Tag
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 pr-10 text-sm rounded-xl bg-white border-2 transition-all duration-200 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            } focus:outline-none cursor-pointer appearance-none`}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            aria-required={required}
            {...props}
          >
            {children}
          </Tag>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <i className="ph ph-caret-down text-neutral-400"></i>
          </div>
        </div>
      ) : (
        <Tag
          id={fieldId}
          name={name}
          type={type !== 'textarea' ? type : undefined}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 text-sm rounded-xl bg-white border-2 transition-all duration-200 ${
            type === 'textarea' ? 'resize-y min-h-[140px]' : ''
          } ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          } focus:outline-none`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          {...props}
        >
          {children}
        </Tag>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600 flex items-center space-x-1" role="alert">
          <i className="ph ph-warning-circle"></i>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const AccordionItem = ({ item, isExpanded, onToggle, categoryConfig }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const contentRef = useRef(null);

  return (
    <div className="group relative">
      {/* Subtle glow effect - pastel version */}
      {isExpanded && (
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${categoryConfig.glowColor} rounded-2xl opacity-10 blur-lg transition-opacity duration-300`}></div>
      )}

      <button
        className={`relative w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-left border-2 ${
          isExpanded ? `${categoryConfig.borderColor}` : `border-transparent ${categoryConfig.hoverBorder}`
        }`}
        onClick={() => onToggle(item.id)}
        aria-expanded={isExpanded}
        aria-controls={`content-${item.id}`}
        id={`heading-${item.id}`}
      >
        <div className="flex items-center justify-between gap-6">
          <h3 className={`text-base font-medium transition-colors duration-200 leading-relaxed flex-1 ${
            isExpanded ? categoryConfig.textColor : 'text-neutral-900 group-hover:text-blue-600'
          }`}>
            {item.question}
          </h3>
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isExpanded
              ? `${categoryConfig.iconBg} ${categoryConfig.textColor} shadow-md`
              : 'bg-neutral-100 text-neutral-400 group-hover:bg-blue-50 group-hover:text-blue-600'
          } ${isExpanded ? 'rotate-180 scale-110' : 'rotate-0'}`}>
            <i className="ph ph-caret-down text-lg"></i>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div
          ref={contentRef}
          id={`content-${item.id}`}
          role="region"
          aria-labelledby={`heading-${item.id}`}
          className="relative mt-3 bg-white rounded-2xl p-6 shadow-md border-2 border-transparent animate-fadeIn"
        >
          <p className="text-sm text-neutral-700 leading-relaxed mb-6">{item.answer}</p>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            {feedbackGiven ? (
              <div className="flex items-center space-x-2 text-green-600" role="status">
                <i className="ph ph-check-circle text-lg"></i>
                <span className="text-sm font-medium">Thank you for your feedback</span>
              </div>
            ) : (
              <>
                <span className="text-sm text-neutral-600">Was this helpful?</span>
                <div className="flex space-x-2">
                  <button
                    className={`px-4 py-2 text-sm font-medium ${categoryConfig.buttonBg} ${categoryConfig.buttonText} rounded-full ${categoryConfig.buttonHover} transition-all duration-200 hover:scale-105 border-2 border-transparent`}
                    onClick={() => setFeedbackGiven(true)}
                  >
                    Yes
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium bg-neutral-50 text-neutral-600 rounded-full hover:bg-neutral-100 transition-all duration-200 hover:scale-105 border-2 border-transparent"
                    onClick={() => setFeedbackGiven(true)}
                  >
                    No
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Tab Content Components
const FAQSection = ({ initialExpandedId = null }) => {
  const [expandedId, setExpandedId] = useState(initialExpandedId);
  const { searchTerm, setSearchTerm, results } = useSearch(FAQ_ITEMS, ['question', 'answer']);
  const decorativeRef = useRef(null);
  const categoryRefs = useRef([]);

  useEffect(() => {
    // Set initial expanded question if provided
    if (initialExpandedId) {
      setExpandedId(initialExpandedId);
    }
  }, [initialExpandedId]);

  const categories = useMemo(() => [...new Set(FAQ_ITEMS.map(item => item.category))], []);
  const itemsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = FAQ_ITEMS.filter(item => item.category === cat);
    });
    return grouped;
  }, [categories]);

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

    // Animate category cards on mount
    if (categoryRefs.current.length > 0) {
      animate(categoryRefs.current.filter(Boolean), {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        ease: 'outQuad',
        delay: stagger(100)
      });
    }
  }, [results.length, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (results.length > 0) setExpandedId(results[0].id);
  };

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="relative max-w-6xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Decorative floating circles - matching Hero */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 right-10 w-3 h-3 bg-blue-300 rounded-full opacity-40"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-green-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-40 left-16 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-35"></div>
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-purple-300 rounded-full opacity-25"></div>
        <div className="absolute bottom-1/4 right-24 w-3 h-3 bg-green-300 rounded-full opacity-30"></div>
      </div>

      <header className="relative text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-tight tracking-tight mb-4 font-jost">
          Frequently Asked Questions
        </h2>
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
          Find answers to common questions about our vehicle information service.
        </p>

        {/* Animated underline accent - matching Hero */}
        <div className="flex justify-center mt-6">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 rounded-full"></div>
        </div>
      </header>

      {/* Search box with Hero-style design */}
      <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 mb-12 max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <label htmlFor="faq-search" className="sr-only">
              Search frequently asked questions
            </label>
            <div className="relative">
              <i className="ph ph-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 text-lg"></i>
              <input
                id="faq-search"
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm rounded-xl bg-neutral-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
          >
            <i className="ph ph-magnifying-glass"></i>
            <span>Search</span>
          </button>
        </form>

        {searchTerm && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700 flex items-center space-x-2">
              <i className="ph ph-info"></i>
              <span>
                {results.length === 0
                  ? 'No results found. Please try different terms.'
                  : `Found ${results.length} result${results.length !== 1 ? 's' : ''}`}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Results or Categories */}
      {results.length > 0 ? (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm border-2 border-neutral-200 group-hover:border-blue-300">
                <i className="ph ph-list-magnifying-glass text-2xl text-neutral-700 group-hover:text-blue-600 transition-colors duration-200"></i>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium text-neutral-900 font-jost">Search Results</h3>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-transparent opacity-60 rounded-full mt-1"></div>
            </div>
          </div>
          {results.map(item => (
            <AccordionItem
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={toggleAccordion}
              categoryConfig={CATEGORY_CONFIG[item.category]}
            />
          ))}
        </div>
      ) : (!searchTerm || results.length === 0) && categories.map((category, index) => (
        <div
          key={category}
          ref={el => categoryRefs.current[index] = el}
          className="mb-16 last:mb-0 relative"
        >
          {/* Category header with navbar-style pastel design */}
          <div className="flex items-center space-x-4 mb-8 max-w-3xl mx-auto relative">
            {/* Pastel icon container matching navbar */}
            <div className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-r ${CATEGORY_CONFIG[category].glowColor} rounded-2xl opacity-5 blur-md group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className={`relative w-14 h-14 rounded-xl ${CATEGORY_CONFIG[category].iconBg} flex items-center justify-center shadow-sm group-hover:shadow-md border-2 border-transparent ${CATEGORY_CONFIG[category].hoverBorder} group-hover:scale-110 transition-all duration-300`}>
                <i className={`ph ${CATEGORY_CONFIG[category].icon} text-2xl ${CATEGORY_CONFIG[category].iconColor} ${CATEGORY_CONFIG[category].iconHoverColor} transition-colors duration-200`}></i>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-medium text-neutral-900 font-jost mb-1.5">{category}</h3>
              <div className={`w-20 h-0.5 bg-gradient-to-r ${CATEGORY_CONFIG[category].underlineGradient} opacity-60 rounded-full`}></div>
            </div>

            {/* Subtle decorative accent */}
            <div className={`absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br ${CATEGORY_CONFIG[category].glowColor} rounded-lg opacity-5 blur-2xl pointer-events-none`}></div>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {itemsByCategory[category].map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={toggleAccordion}
                categoryConfig={CATEGORY_CONFIG[category]}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Call-to-action cards - Pastel style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 max-w-3xl mx-auto">
        <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-green-300">
          {/* Subtle glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-200 to-green-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

          <div className="relative flex items-start space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200 to-green-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border-2 border-transparent group-hover:border-green-300">
                <i className="ph ph-headset text-2xl text-neutral-700 group-hover:text-green-600 transition-colors duration-200"></i>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-medium text-neutral-900 mb-2">Need More Help?</h4>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Our support team is available Monday to Friday, 9am to 5pm.
              </p>
              <button
                className="px-5 py-2.5 bg-green-50 text-green-600 text-sm font-medium rounded-xl hover:bg-green-100 hover:scale-105 transition-all duration-200 flex items-center space-x-2 border-2 border-transparent hover:border-green-300"
                onClick={() => document.getElementById('tab-support')?.click()}
              >
                <i className="ph ph-chat-circle"></i>
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group border-2 border-transparent hover:border-blue-300">
          {/* Subtle glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

          <div className="relative flex items-start space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border-2 border-transparent group-hover:border-blue-300">
                <i className="ph ph-info text-2xl text-neutral-700 group-hover:text-blue-600 transition-colors duration-200"></i>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-medium text-neutral-900 mb-4">Service Information</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-neutral-700 space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Official DVLA and DVSA data</span>
                </div>
                <div className="flex items-center text-sm text-neutral-700 space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Updated daily</span>
                </div>
                <div className="flex items-center text-sm text-neutral-700 space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Secure and GDPR compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowToUseSection = () => {
  const decorativeRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    // Animate decorative circles
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

    // Animate steps
    if (stepsRef.current.length > 0) {
      animate(stepsRef.current.filter(Boolean), {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 600,
        ease: 'outQuad',
        delay: stagger(100)
      });
    }
  }, []);

  return (
    <section className="relative max-w-6xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Decorative elements */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-32 right-16 w-3 h-3 bg-green-300 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 right-32 w-2 h-2 bg-blue-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-1/3 left-20 w-2.5 h-2.5 bg-green-400 rounded-full opacity-35"></div>
      </div>

      <header className="relative text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-tight tracking-tight mb-4 font-jost">
          How to Use This Service
        </h2>
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
          Follow these simple steps to check a vehicle's MOT and tax status.
        </p>
        <div className="flex justify-center mt-6">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60 rounded-full"></div>
        </div>
      </header>

      <div className="space-y-6 max-w-3xl mx-auto">
        {GUIDE_STEPS.map((step, index) => (
          <div
            key={step.number}
            ref={el => stepsRef.current[index] = el}
            className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group border-2 border-transparent hover:border-blue-300"
          >
            {/* Subtle glow on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

            <div className="relative flex items-start space-x-6">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative w-14 h-14 bg-blue-100 text-neutral-700 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm border-2 border-transparent group-hover:border-blue-300 group-hover:scale-110 group-hover:text-blue-600 transition-all duration-300">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">{step.description}</p>
              </div>
              <div className="flex-shrink-0">
                <i className="ph ph-arrow-right text-2xl text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative bg-white rounded-2xl p-6 shadow-sm mt-12 max-w-3xl mx-auto group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-amber-300">
        {/* Subtle glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 to-amber-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

        <div className="relative flex items-start space-x-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-amber-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border-2 border-transparent group-hover:border-amber-300">
              <i className="ph ph-universal-access text-2xl text-neutral-700 group-hover:text-amber-600 transition-colors duration-200"></i>
            </div>
          </div>
          <div>
            <h4 className="text-base font-medium text-neutral-900 mb-2">Accessibility Features</h4>
            <p className="text-sm text-neutral-700 leading-relaxed">
              This service is designed to be accessible to all users. We comply with WCAG 2.1 AA standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SupportSection = () => {
  const { values, errors, isSubmitting, isSubmitted, handleChange, handleSubmit } = useFormValidation({
    name: '', email: '', inquiry: '', message: ''
  });

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

  const onSubmit = async (formValues) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.05 ? resolve() : reject(new Error('Submission failed. Please try again.'));
      }, 800);
    });
  };

  return (
    <section className="relative max-w-6xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Decorative elements */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-24 right-20 w-3 h-3 bg-purple-300 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 left-24 w-2 h-2 bg-blue-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-1/4 right-32 w-2.5 h-2.5 bg-purple-400 rounded-full opacity-35"></div>
      </div>

      <header className="relative text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-tight tracking-tight mb-4 font-jost">
          Get Support
        </h2>
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
          Contact our support team or access self-help resources.
        </p>
        <div className="flex justify-center mt-6">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60 rounded-full"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative bg-white rounded-2xl p-8 shadow-sm border-2 border-neutral-200">
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm border-2 border-neutral-200 group-hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                  <i className="ph ph-envelope text-2xl text-neutral-700 group-hover:text-blue-600 transition-colors duration-200"></i>
                </div>
              </div>
              <h3 className="text-xl font-medium text-neutral-900 font-jost">Contact Our Support Team</h3>
            </div>

            {isSubmitted && (
              <div className="bg-green-50 rounded-xl p-5 mb-8 border-2 border-green-200" role="alert">
                <div className="flex items-start space-x-3">
                  <i className="ph ph-check-circle text-2xl text-green-600 mt-0.5"></i>
                  <div>
                    <h4 className="text-base font-medium text-green-900 mb-1">Support Request Submitted</h4>
                    <p className="text-sm text-green-700">We will respond within 2 working hours.</p>
                  </div>
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 rounded-xl p-5 mb-8 border-2 border-red-200" role="alert">
                <div className="flex items-start space-x-3">
                  <i className="ph ph-warning-circle text-2xl text-red-600 mt-0.5"></i>
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, onSubmit)} noValidate className="space-y-6">
              <FormField
                id="name"
                name="name"
                label="Full Name"
                value={values.name}
                error={errors.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />

              <FormField
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={values.email}
                error={errors.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />

              <FormField
                id="inquiry"
                name="inquiry"
                label="Type of Inquiry"
                type="select"
                value={values.inquiry}
                error={errors.inquiry}
                onChange={handleChange}
                required
              >
                <option value="">Please select</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account Question</option>
                <option value="payment">Payment Query</option>
                <option value="other">Other</option>
              </FormField>

              <FormField
                id="message"
                name="message"
                label="Your Message"
                type="textarea"
                value={values.message}
                error={errors.message}
                onChange={handleChange}
                required
                rows="5"
              />

              <button
                type="submit"
                className="w-full px-6 py-4 bg-blue-600 text-white text-base font-medium rounded-xl hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <i className="ph ph-paper-plane-tilt"></i>
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border-2 border-neutral-200 group hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm border-2 border-neutral-200 group-hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                  <i className="ph ph-clock text-lg text-neutral-700 group-hover:text-blue-600 transition-colors duration-200"></i>
                </div>
              </div>
              <h4 className="text-base font-medium text-neutral-900">Operating Hours</h4>
            </div>
            <p className="text-sm text-neutral-700 mb-6">Monday to Friday: 9am to 5pm</p>

            <div className="flex items-center space-x-3 mb-2 pt-4 border-t border-neutral-100">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl opacity-5 blur-sm"></div>
                <div className="relative w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm border-2 border-neutral-200">
                  <i className="ph ph-envelope text-lg text-neutral-700"></i>
                </div>
              </div>
              <h4 className="text-base font-medium text-neutral-900">Contact Methods</h4>
            </div>
            <p className="text-sm text-neutral-700">support@vehiclecheck.gov.uk</p>
          </div>

          <div className="relative bg-white rounded-2xl p-6 shadow-sm border-2 border-neutral-200 hover:border-green-300 group hover:shadow-lg transition-all duration-300">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-200 to-green-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

            <div className="relative flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200 to-green-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shadow-sm border-2 border-neutral-200 group-hover:border-green-300 group-hover:scale-110 transition-all duration-300">
                  <i className="ph ph-activity text-lg text-neutral-700 group-hover:text-green-600 transition-colors duration-200"></i>
                </div>
              </div>
              <h4 className="text-base font-medium text-neutral-900">Service Status</h4>
            </div>
            <div className="relative flex items-center space-x-3">
              <div className="relative w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-sm text-neutral-700">All systems operational</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

const GlossarySection = () => {
  const { groupedItems, availableLetters } = useMemo(() => {
    const grouped = {};
    const letters = new Set();

    GLOSSARY_ITEMS.forEach(item => {
      const letter = item.term.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(item);
      letters.add(letter);
    });

    return { groupedItems: grouped, availableLetters: letters };
  }, []);

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

  return (
    <section className="relative max-w-6xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Decorative elements */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-32 right-24 w-3 h-3 bg-amber-300 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-1/3 right-28 w-2.5 h-2.5 bg-amber-400 rounded-full opacity-35"></div>
      </div>

      <header className="relative text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-tight tracking-tight mb-4 font-jost">
          Glossary of Terms
        </h2>
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
          Common terminology used in vehicle testing and documentation.
        </p>
        <div className="flex justify-center mt-6">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60 rounded-full"></div>
        </div>
      </header>

      <div className="relative bg-white rounded-2xl p-6 shadow-sm mb-12 max-w-4xl mx-auto border-2 border-neutral-200 group hover:shadow-lg hover:border-amber-300 transition-all duration-300">
        <div className="flex items-center space-x-3 mb-5">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-amber-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shadow-sm border-2 border-neutral-200 group-hover:border-amber-300 group-hover:scale-110 transition-all duration-300">
              <i className="ph ph-list-dashes text-lg text-neutral-700 group-hover:text-amber-600 transition-colors duration-200"></i>
            </div>
          </div>
          <h3 className="text-base font-medium text-neutral-900">Quick Navigation</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
            <a
              key={letter}
              href={availableLetters.has(letter) ? `#glossary-${letter}` : undefined}
              className={`relative w-10 h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all duration-200 ${
                availableLetters.has(letter)
                  ? 'bg-amber-50 text-neutral-700 hover:bg-amber-100 hover:text-amber-600 hover:scale-110 cursor-pointer shadow-sm hover:shadow-md border-2 border-neutral-200 hover:border-amber-300'
                  : 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-2 border-neutral-100'
              }`}
              aria-disabled={!availableLetters.has(letter)}
              tabIndex={availableLetters.has(letter) ? 0 : -1}
            >
              {letter}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {Object.entries(groupedItems).map(([letter, items]) => (
          <div
            key={letter}
            id={`glossary-${letter}`}
            className="relative bg-white rounded-2xl p-8 shadow-sm border-2 border-neutral-200 group hover:shadow-lg hover:border-amber-300 transition-all duration-300"
          >
            {/* Subtle glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 to-amber-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

            <div className="relative flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-amber-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative w-14 h-14 bg-amber-100 text-neutral-700 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm border-2 border-neutral-200 group-hover:border-amber-300 group-hover:scale-110 group-hover:text-amber-600 transition-all duration-300">
                  {letter}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-neutral-900 font-jost">Terms starting with {letter}</h3>
                <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-transparent opacity-60 rounded-full mt-1"></div>
              </div>
            </div>
            <dl className="relative space-y-6">
              {items.map(item => (
                <div key={item.term} className="border-l-4 border-amber-200 pl-6 hover:border-amber-400 transition-all duration-200 hover:pl-7 group/item">
                  <dt className="text-base font-medium text-neutral-900 mb-2 group-hover/item:text-amber-600 transition-colors duration-200">{item.term}</dt>
                  <dd className="text-sm text-neutral-700 leading-relaxed">{item.definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
};

// Main Component
const FAQ = ({ initialTab = 'faqs', initialExpandedId = null }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabsRef = useRef(null);

  useEffect(() => {
    // Set initial tab if provided
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  const ActiveComponent = TAB_CONFIG.find(tab => tab.id === activeTab)?.component || FAQSection;
  const activeConfig = TAB_CONFIG.find(tab => tab.id === activeTab);

  const components = {
    faqs: FAQSection,
    guide: HowToUseSection,
    support: SupportSection,
    glossary: GlossarySection
  };

  const Component = components[activeTab];

  return (
    <div id="help" className="bg-white min-h-screen pb-20">
      <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-center pt-12 md:pt-16 lg:pt-20">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-neutral-900 leading-tight tracking-tight mb-4 font-jost">
            Help & Support
          </h1>
          <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Find information about our vehicle history service and get the help you need.
          </p>

          {/* Animated underline */}
          <div className="flex justify-center mt-6">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 rounded-full"></div>
          </div>
        </header>

        <nav ref={tabsRef} className="flex justify-center mb-16" role="tablist">
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
        {activeTab === 'faqs' ? (
          <Component initialExpandedId={initialExpandedId} />
        ) : (
          <Component />
        )}
      </main>
    </div>
  );
};

// Export sections for use in preview component
export { HowToUseSection, SupportSection, GlossarySection };

export default FAQ;
