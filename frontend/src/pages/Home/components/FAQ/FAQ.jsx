import React, { useState, useMemo } from 'react';
import './FAQStyles.css';
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
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label} {required && <span className="required" aria-hidden="true">*</span>}
      </label>
      <Tag
        id={fieldId}
        name={name}
        type={type !== 'textarea' && type !== 'select' ? type : undefined}
        value={value}
        onChange={onChange}
        className={`form-input ${type} ${error ? 'error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        {...props}
      >
        {children}
      </Tag>
      {error && (
        <p id={errorId} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const AccordionItem = ({ item, isExpanded, onToggle }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  return (
    <div className="accordion-item">
      <h3 className="accordion-header">
        <button 
          className={`accordion-button ${isExpanded ? 'expanded' : ''}`}
          onClick={() => onToggle(item.id)}
          aria-expanded={isExpanded}
          aria-controls={`content-${item.id}`}
          id={`heading-${item.id}`}
        >
          <span className="accordion-question">{item.question}</span>
          <span className="accordion-icon" aria-hidden="true">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
      </h3>
      <div 
        className={`accordion-content ${isExpanded ? 'expanded' : ''}`}
        id={`content-${item.id}`}
        role="region"
        aria-labelledby={`heading-${item.id}`}
        hidden={!isExpanded}
      >
        <div className="accordion-body">
          <p className="answer">{item.answer}</p>
          
          <div className="feedback-section">
            {feedbackGiven ? (
              <div className="success-message" role="status">
                <span className="success-icon">✓</span>
                Thank you for your feedback
              </div>
            ) : (
              <>
                <p className="feedback-prompt">Was this helpful?</p>
                <div className="feedback-buttons">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFeedbackGiven(true)}
                  >
                    Yes
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFeedbackGiven(true)}
                  >
                    No
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
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
    <section className="faq-section">
      <div className="container">
        <header className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-description">
            Find answers to common questions about our vehicle information service.
          </p>
        </header>
        
        <div className="search-panel">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-group">
              <label htmlFor="faq-search" className="sr-only">Search frequently asked questions</label>
              <input
                id="faq-search"
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>
          
          {searchTerm && (
            <div className="search-results-info">
              {results.length === 0 
                ? 'No results found. Please try different terms.' 
                : `Showing ${results.length} result${results.length !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>
        
        {results.length > 0 ? (
          <div className="search-results">
            <h3 className="results-title">Search Results</h3>
            <div className="accordion">
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
        ) : (!searchTerm || results.length === 0) && categories.map(category => (
          <div key={category} className="category-section">
            <h3 className="category-title">{category}</h3>
            <div className="accordion">
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
        
        <div className="help-cards">
          <div className="help-card success">
            <h4>Need More Help?</h4>
            <p>Our support team is available Monday to Friday, 9am to 5pm.</p>
            <button 
              className="btn btn-success"
              onClick={() => document.getElementById('tab-support')?.click()}
            >
              Contact Support
            </button>
          </div>
          
          <div className="help-card info">
            <h4>Service Information</h4>
            <ul className="info-list">
              <li>Official DVLA and DVSA data</li>
              <li>Updated daily</li>
              <li>Secure and GDPR compliant</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowToUseSection = () => (
  <section className="how-to-section">
    <div className="container">
      <header className="section-header">
        <h2 className="section-title">How to Use This Service</h2>
        <p className="section-description">
          Follow these simple steps to check a vehicle's MOT and tax status.
        </p>
      </header>
      
      <div className="steps-container">
        {GUIDE_STEPS.map((step) => (
          <div key={step.number} className="step-item">
            <div className="step-number">{step.number}</div>
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="info-box warning">
        <h4>Accessibility Features</h4>
        <p>
          This service is designed to be accessible to all users. We comply with WCAG 2.1 AA standards.
        </p>
      </div>
    </div>
  </section>
);

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
    <section className="support-section">
      <div className="container">
        <header className="section-header">
          <h2 className="section-title">Get Support</h2>
          <p className="section-description">
            Contact our support team or access self-help resources.
          </p>
        </header>
        
        <div className="support-layout">
          <div className="support-form-container">
            <h3>Contact Our Support Team</h3>
            
            {isSubmitted && (
              <div className="success-alert" role="alert">
                <h4>Support Request Submitted</h4>
                <p>We will respond within 2 working hours.</p>
              </div>
            )}
            
            {errors.submit && (
              <div className="error-alert" role="alert">
                <p>{errors.submit}</p>
              </div>
            )}
          
            <form onSubmit={(e) => handleSubmit(e, onSubmit)} noValidate className="support-form">
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
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
          
          <aside className="support-sidebar">
            <div className="support-card">
              <h4>Operating Hours</h4>
              <p>Monday to Friday: 9am to 5pm</p>
              <h4>Contact Methods</h4>
              <p>Email: support@vehiclecheck.gov.uk</p>
            </div>
            
            <div className="support-card status">
              <h4>Service Status</h4>
              <div className="status-indicator operational">
                <span className="status-dot"></span>
                All systems operational
              </div>
            </div>
          </aside>
        </div>
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
    <section className="glossary-section">
      <div className="container">
        <header className="section-header">
          <h2 className="section-title">Glossary of Terms</h2>
          <p className="section-description">
            Common terminology used in vehicle testing and documentation.
          </p>
        </header>
        
        <div className="glossary-content">
          <div className="alphabet-nav">
            {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
              <a 
                key={letter}
                href={availableLetters.has(letter) ? `#glossary-${letter}` : undefined}
                className={`alphabet-link ${availableLetters.has(letter) ? 'active' : 'inactive'}`}
                aria-disabled={!availableLetters.has(letter)}
                tabIndex={availableLetters.has(letter) ? 0 : -1}
              >
                {letter}
              </a>
            ))}
          </div>
          
          {Object.entries(groupedItems).map(([letter, items]) => (
            <div key={letter} id={`glossary-${letter}`} className="glossary-section-letter">
              <h3 className="glossary-letter-header">{letter}</h3>
              <dl className="glossary-list">
                {items.map(item => (
                  <div key={item.term} className="glossary-item">
                    <dt className="glossary-term">{item.term}</dt>
                    <dd className="glossary-definition">{item.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Component
const FAQ = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  
  const tabs = [
    { id: 'faqs', label: 'Frequently Asked Questions', component: FAQSection },
    { id: 'guide', label: 'How to Use This Service', component: HowToUseSection },
    { id: 'support', label: 'Get Support', component: SupportSection },
    { id: 'glossary', label: 'Glossary', component: GlossarySection }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || FAQSection;

  return (
    <div className="faq-wrapper">
      <section className="faq-hero">
        <div className="container">
          <header className="hero-header">
            <h1 className="hero-title">Help & Support</h1>
            <p className="hero-description">
              Find information about our vehicle history service and get the help you need.
            </p>
          </header>
          
          <nav className="tab-navigation" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>
      
      <main 
        className="tab-content" 
        id={`panel-${activeTab}`}
        role="tabpanel" 
        aria-labelledby={`tab-${activeTab}`}
      >
        <ActiveComponent />
      </main>
    </div>
  );
};

export default FAQ;