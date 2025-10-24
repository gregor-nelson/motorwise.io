import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FAQ_ITEMS, GLOSSARY_ITEMS, GUIDE_STEPS } from './helpData';

// Custom hooks for cleaner code
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

// Reusable Components
const FormField = ({ id, name, label, type = 'text', value, error, onChange, required, children, ...props }) => {
  const fieldId = `field-${id}`;
  const errorId = `error-${id}`;
  const Tag = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input';

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-sm font-medium text-neutral-600">
        {label} {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
      </label>
      {type === 'select' ? (
        <div className="relative">
          <Tag
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 pr-10 text-sm rounded-lg bg-neutral-50 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all duration-200 cursor-pointer appearance-none ${
              error ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            aria-required={required}
            {...props}
          >
            {children}
          </Tag>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <i className="ph ph-caret-down text-neutral-500"></i>
          </div>
        </div>
      ) : (
        <Tag
          id={fieldId}
          name={name}
          type={type !== 'textarea' ? type : undefined}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all duration-200 ${
            type === 'textarea' ? 'resize-y min-h-[120px]' : ''
          } ${
            error ? 'ring-2 ring-red-500 bg-red-50' : ''
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          {...props}
        >
          {children}
        </Tag>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const AccordionItem = ({ item, isExpanded, onToggle }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 mb-4">
      <h3>
        <button 
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          onClick={() => onToggle(item.id)}
          aria-expanded={isExpanded}
          aria-controls={`content-${item.id}`}
          id={`heading-${item.id}`}
        >
          <span className="text-sm font-medium text-neutral-900 group-hover:text-blue-600 transition-colors duration-200 pr-4">{item.question}</span>
          <div className={`text-lg text-blue-600 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            <i className="ph ph-caret-down"></i>
          </div>
        </button>
      </h3>
      {isExpanded && (
        <div 
          id={`content-${item.id}`}
          role="region"
          aria-labelledby={`heading-${item.id}`}
          className="pt-4 border-t border-neutral-200 mt-4 transition-all duration-300 ease-out"
        >
          <p className="text-xs text-neutral-700 leading-relaxed mb-4">{item.answer}</p>
          
          <div className="flex items-center justify-between pt-3">
            {feedbackGiven ? (
              <div className="flex items-center space-x-2 text-green-600" role="status">
                <i className="ph ph-check-circle text-lg"></i>
                <span className="text-xs font-medium">Thank you for your feedback</span>
              </div>
            ) : (
              <>
                <span className="text-xs text-neutral-600">Was this helpful?</span>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors duration-200"
                    onClick={() => setFeedbackGiven(true)}
                  >
                    Yes
                  </button>
                  <button 
                    className="px-3 py-1 text-xs font-medium bg-neutral-50 text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors duration-200"
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
const FAQSection = () => {
  const [expandedId, setExpandedId] = useState(null);
  const { searchTerm, setSearchTerm, results } = useSearch(FAQ_ITEMS, ['question', 'answer']);
  
  const categories = useMemo(() => [...new Set(FAQ_ITEMS.map(item => item.category))], []);
  const itemsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = FAQ_ITEMS.filter(item => item.category === cat);
    });
    return grouped;
  }, [categories]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (results.length > 0) setExpandedId(results[0].id);
  };

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <header className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-neutral-700 leading-relaxed max-w-2xl mx-auto">
          Find answers to common questions about our vehicle information service.
        </p>
      </header>
      
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="faq-search" className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
              Search frequently asked questions
            </label>
            <div className="relative">
              <i className="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"></i>
              <input
                id="faq-search"
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-neutral-50 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="ph ph-magnifying-glass"></i>
            <span>Search</span>
          </button>
        </form>
        
        {searchTerm && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              {results.length === 0 
                ? 'No results found. Please try different terms.' 
                : `Showing ${results.length} result${results.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </div>
      
      {results.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
            <i className="ph ph-list-magnifying-glass text-lg text-blue-600 mr-2"></i>
            Search Results
          </h3>
          <div className="space-y-4">
            {results.map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={toggleAccordion}
              />
            ))}
          </div>
        </div>
      ) : (!searchTerm || results.length === 0) && categories.map((category, index) => (
        <div 
          key={category} 
          className="space-y-4 mb-12"
        >
          <h3 className="text-lg font-medium text-neutral-900 mb-6 flex items-center">
            <i className="ph ph-folder text-lg text-blue-600 mr-2"></i>
            {category}
          </h3>
          <div className="space-y-4">
            {itemsByCategory[category].map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={toggleAccordion}
              />
            ))}
          </div>
        </div>
      ))}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start mb-3">
            <i className="ph ph-headset text-lg text-green-600 mr-3 mt-0.5"></i>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Need More Help?</h4>
              <p className="text-xs text-neutral-700 leading-relaxed mb-4">
                Our support team is available Monday to Friday, 9am to 5pm.
              </p>
              <button 
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => document.getElementById('tab-support')?.click()}
              >
                <i className="ph ph-chat-circle"></i>
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start">
            <i className="ph ph-info text-lg text-blue-600 mr-3 mt-0.5"></i>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-neutral-900 mb-3">Service Information</h4>
              <div className="space-y-2">
                <div className="flex items-center text-xs text-neutral-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span>Official DVLA and DVSA data</span>
                </div>
                <div className="flex items-center text-xs text-neutral-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span>Updated daily</span>
                </div>
                <div className="flex items-center text-xs text-neutral-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
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
  return (
    <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <header className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          How to Use This Service
        </h2>
        <p className="text-xs text-neutral-700 leading-relaxed max-w-2xl mx-auto">
          Follow these simple steps to check a vehicle's MOT and tax status.
        </p>
      </header>
      
      <div className="space-y-8">
        {GUIDE_STEPS.map((step, index) => (
          <div 
            key={step.number} 
            className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-xs text-neutral-700 leading-relaxed">{step.description}</p>
              </div>
              <div className="flex-shrink-0">
                <i className="ph ph-arrow-right text-lg text-blue-600"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-transparent rounded-lg p-4 md:p-6 shadow-sm mt-12">
        <div className="flex items-start">
          <i className="ph ph-universal-access text-lg text-yellow-600 mr-3 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Accessibility Features</h4>
            <p className="text-xs text-neutral-700 leading-relaxed">
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

  const onSubmit = async (formValues) => {
    // Simulate API call
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.05 ? resolve() : reject(new Error('Submission failed. Please try again.'));
      }, 800);
    });
  };

  return (
    <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <header className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          Get Support
        </h2>
        <p className="text-xs text-neutral-700 leading-relaxed max-w-2xl mx-auto">
          Contact our support team or access self-help resources.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <i className="ph ph-envelope text-lg text-blue-600 mr-3"></i>
              <h3 className="text-lg font-medium text-neutral-900">Contact Our Support Team</h3>
            </div>
            
            {isSubmitted && (
              <div className="bg-green-50 rounded-lg p-4 mb-6" role="alert">
                <div className="flex items-start">
                  <i className="ph ph-check-circle text-lg text-green-600 mr-3 mt-0.5"></i>
                  <div>
                    <h4 className="text-sm font-medium text-green-900 mb-1">Support Request Submitted</h4>
                    <p className="text-xs text-green-700">We will respond within 2 working hours.</p>
                  </div>
                </div>
              </div>
            )}
            
            {errors.submit && (
              <div className="bg-red-50 rounded-lg p-4 mb-6" role="alert">
                <div className="flex items-start">
                  <i className="ph ph-warning-circle text-lg text-red-600 mr-3 mt-0.5"></i>
                  <p className="text-xs text-red-700">{errors.submit}</p>
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
                className="w-full px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <i className="ph ph-clock text-lg text-blue-600 mr-3"></i>
              <h4 className="text-sm font-medium text-neutral-900">Operating Hours</h4>
            </div>
            <p className="text-xs text-neutral-700 mb-6">Monday to Friday: 9am to 5pm</p>
            
            <div className="flex items-center mb-2">
              <i className="ph ph-envelope text-lg text-blue-600 mr-3"></i>
              <h4 className="text-sm font-medium text-neutral-900">Contact Methods</h4>
            </div>
            <p className="text-xs text-neutral-700">support@vehiclecheck.gov.uk</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <i className="ph ph-activity text-lg text-blue-600 mr-3"></i>
              <h4 className="text-sm font-medium text-neutral-900">Service Status</h4>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-xs text-neutral-700">All systems operational</span>
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

  return (
    <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <header className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          Glossary of Terms
        </h2>
        <p className="text-xs text-neutral-700 leading-relaxed max-w-2xl mx-auto">
          Common terminology used in vehicle testing and documentation.
        </p>
      </header>
      
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm mb-8">
        <div className="flex items-center mb-4">
          <i className="ph ph-list-dashes text-lg text-blue-600 mr-3"></i>
          <h3 className="text-sm font-medium text-neutral-900">Quick Navigation</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
            <a 
              key={letter}
              href={availableLetters.has(letter) ? `#glossary-${letter}` : undefined}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                availableLetters.has(letter)
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
              aria-disabled={!availableLetters.has(letter)}
              tabIndex={availableLetters.has(letter) ? 0 : -1}
            >
              {letter}
            </a>
          ))}
        </div>
      </div>
      
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([letter, items], index) => (
          <div 
            key={letter} 
            id={`glossary-${letter}`} 
            className="bg-white rounded-lg p-4 md:p-6 shadow-sm"
          >
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                {letter}
              </div>
              <h3 className="text-lg font-medium text-neutral-900">Terms starting with {letter}</h3>
            </div>
            <dl className="space-y-4">
              {items.map(item => (
                <div key={item.term} className="border-l-2 border-blue-200 pl-4">
                  <dt className="text-sm font-medium text-neutral-900 mb-1">{item.term}</dt>
                  <dd className="text-xs text-neutral-700 leading-relaxed">{item.definition}</dd>
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
const FAQ = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  
  const tabs = [
    { id: 'faqs', label: 'FAQs', icon: 'ph-question', component: FAQSection },
    { id: 'guide', label: 'How to Use', icon: 'ph-list-numbers', component: HowToUseSection },
    { id: 'support', label: 'Support', icon: 'ph-headset', component: SupportSection },
    { id: 'glossary', label: 'Glossary', icon: 'ph-book', component: GlossarySection }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || FAQSection;

  return (
    <div id="help" className="space-y-12 mb-16">
      <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-center">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            Help & Support
          </h1>
          <p className="text-xs text-neutral-700 leading-relaxed max-w-2xl mx-auto">
            Find information about our vehicle history service and get the help you need.
          </p>
        </header>
        
        <nav className="flex justify-center mb-8" role="tablist">
          <div className="inline-flex bg-neutral-100 rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
              >
                <i className={`ph ${tab.icon}`}></i>
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
        className="transition-all duration-300 ease-out"
      >
        <ActiveComponent />
      </main>
    </div>
  );
};

export default FAQ;