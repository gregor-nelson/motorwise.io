import React, { useState, useEffect, useRef, useCallback } from 'react';

// Import theme constants
import { COLORS, SPACING } from '../../../../styles/theme';

// Import styled components
import {
  Section,
  Container,
  SectionHeader,
  DateStamp,
  EnhancedAccordion,
  EnhancedAccordionItem,
  EnhancedAccordionButton,
  EnhancedAccordionContent,
  FeedbackSection,
  FeedbackPrompt,
  CategoryHeader,
  SearchResultsHeader,
  TabList,
  TabButton,
  InfoBox,
  StatusContainer,
  StepContainer,
  StepCircle,
  StepContent,
  SuccessMessage,
  ErrorAlert,
  GlossaryLetterHeader,
  GlossaryTermContainer,
  GlossaryTerm,
  GlossaryDefinition,
  AlphabetContainer,
  AlphabetLink,
  SectionTitle,
  Paragraph,
  Lead,
  Grid,
  Card,
  Button,
  IconList,
  WarningText,
  NoMarginParagraph,
  MarginTopGrid,
  PageTitle,
  FeatureBox,
  SubSectionTitle,
  FAQPanel,
  SearchPanel,
  SearchInput,
} from '../../../../styles/Home/styles';

// Error Boundary Component (needs to be a class component)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in HelpSection:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Section background={COLORS.WHITE}>
          <Container>
            <PageTitle>There is a problem</PageTitle>
            <Lead>We're sorry, but we are having technical problems loading the help section.</Lead>
            <Button 
              variant="primary" 
              size="medium"
              onClick={() => window.location.reload()}
            >
              Refresh the page
            </Button>
          </Container>
        </Section>
      );
    }

    return this.props.children;
  }
}

// Simplified data structure - Flattened FAQ items
const FAQ_ITEMS = [
  // Using the service
  {
    id: 'mot-valid',
    category: 'Using the service',
    question: 'How can I check if my vehicle\'s MOT is valid?',
    answer: 'Enter your vehicle registration number in the search box on the homepage. The system will display the current MOT status, including the expiry date. If your MOT has expired, you should not drive the vehicle except to a pre-booked MOT test appointment. The MOT status is updated daily from the DVSA database.'
  },
  {
    id: 'vehicle-info',
    category: 'Using the service',
    question: 'What information does the service provide about a vehicle?',
    answer: 'The service provides official DVLA vehicle details (make, model, year, engine size, fuel type), current tax status, MOT history including test results, advisory notices, failures, and mileage readings at each test. For premium reports, additional information such as emissions data, risk assessments and technical bulletins is available.'
  },
  {
    id: 'missing-vehicle',
    category: 'Using the service',
    question: 'Why might a vehicle not appear in the system?',
    answer: 'A vehicle may not appear if it\'s exempt from MOT testing (such as vehicles manufactured before 1960), recently registered and not yet tested, or registered in Northern Ireland or outside Great Britain. The database is updated daily with the latest information from the DVSA and DVLA.'
  },
  // Premium services
  {
    id: 'premium-reports',
    category: 'Premium services',
    question: 'What additional information is included in premium reports?',
    answer: 'Premium reports provide a detailed technical analysis derived from the vehicle\'s MOT history and manufacturer data. They include comprehensive risk assessments of major systems (suspension, brakes, corrosion, engine), identification of recurring issues and failure patterns, correlation with manufacturer technical bulletins, repair time estimates, emissions compliance assessment, and advanced mileage verification.'
  },
  {
    id: 'report-cost',
    category: 'Premium services',
    question: 'How much does a premium report cost?',
    answer: 'Premium reports are available for £9.99 per vehicle. We also offer business packages for motor traders and dealerships with volume discounts available. Payment can be made securely via credit/debit card or PayPal. VAT receipts are provided for all transactions.'
  },
  // Data and privacy
  {
    id: 'data-updates',
    category: 'Data and privacy',
    question: 'How up-to-date is the information?',
    answer: 'The MOT history and vehicle details are updated daily from the DVSA and DVLA databases. Tax information is typically updated within 5 working days of any changes. All data is sourced directly from official government records to ensure maximum accuracy and reliability.'
  },
  {
    id: 'data-privacy',
    category: 'Data and privacy',
    question: 'How is my data protected when using this service?',
    answer: 'We adhere strictly to the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. Your personal information is encrypted during transmission and storage. We only collect the information necessary to provide the service, and we do not share your data with third parties without your explicit consent. For full details, please refer to our Privacy Policy.'
  },
  // Technical questions
  {
    id: 'browser-compatibility',
    category: 'Technical questions',
    question: 'Which browsers are supported?',
    answer: 'This service is compatible with all modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari (versions released within the last 3 years). For the best experience and security, we recommend using the latest version of your preferred browser. The service is also fully functional on mobile devices and tablets.'
  },
  {
    id: 'service-unavailable',
    category: 'Technical questions',
    question: 'What should I do if the service is unavailable?',
    answer: 'If you experience technical difficulties accessing the service, please first check your internet connection and try refreshing the page. If problems persist, we recommend clearing your browser cache and cookies or trying a different browser. Our service undergoes maintenance typically between 2am and 4am GMT on Sundays, during which time it may be temporarily unavailable. If you continue to experience issues, please contact our support team.'
  }
];

// Glossary data
const GLOSSARY_ITEMS = [
  {
    term: 'Advisory notice',
    definition: 'Information provided by an MOT tester about items that are beginning to deteriorate but are not yet serious enough to cause the vehicle to fail its MOT test.'
  },
  {
    term: 'Clean Air Zone (CAZ)',
    definition: 'Areas in cities where targeted action is being taken to improve air quality by discouraging the most polluting vehicles from entering the zone. Different vehicles may be charged differently based on their emissions standards.'
  },
  {
    term: 'DVLA',
    definition: 'Driver and Vehicle Licensing Agency. The UK government organisation responsible for maintaining a database of drivers and vehicles in Great Britain, and issuing driving licences.'
  },
  {
    term: 'DVSA',
    definition: 'Driver and Vehicle Standards Agency. The UK government organisation responsible for setting, testing and enforcing driver and vehicle standards in Great Britain, including the MOT scheme.'
  },
  {
    term: 'DVA',
    definition: 'Driver and Vehicle Agency. The organisation responsible for driver and vehicle testing in Northern Ireland.'
  },
  {
    term: 'Euro emissions standards',
    definition: 'European standards that define acceptable limits for exhaust emissions of new vehicles sold in the EU and EEA member states. Currently range from Euro 1 (oldest) to Euro 6 (newest) for most vehicle types.'
  },
  {
    term: 'Major defect',
    definition: 'An MOT failure category indicating that a defect may affect the vehicle\'s safety, put other road users at risk or have an impact on the environment. The vehicle must be repaired immediately.'
  },
  {
    term: 'Minor defect',
    definition: 'An MOT category indicating that a defect has no significant effect on the safety of the vehicle or impact on the environment. The vehicle still passes the MOT, but the defect should be repaired as soon as possible.'
  },
  {
    term: 'MOT',
    definition: 'Ministry of Transport test. A mandatory annual test for vehicle safety, roadworthiness and exhaust emissions required for most vehicles used on public roads in Great Britain that are over three years old.'
  },
  {
    term: 'MOT certificate',
    definition: 'The document issued when a vehicle passes its MOT test, valid for one year.'
  },
  {
    term: 'VIN',
    definition: 'Vehicle Identification Number. A unique code assigned to each vehicle by the manufacturer. It serves as the vehicle\'s fingerprint, as no two vehicles have the same VIN.'
  },
  {
    term: 'V5C',
    definition: 'Vehicle Registration Certificate. Also known as the car log book, this document records the registered keeper of a vehicle, not necessarily the legal owner.'
  }
];

// How to use steps
const GUIDE_STEPS = [
  {
    number: 1,
    title: 'Enter vehicle registration',
    description: 'Input the vehicle registration number in the search box on the homepage. Enter the registration exactly as it appears on the vehicle, without spaces.'
  },
  {
    number: 2,
    title: 'Review vehicle details',
    description: 'Verify that the returned vehicle make, model, and other details match the vehicle you are enquiring about.'
  },
  {
    number: 3,
    title: 'Check MOT status',
    description: 'The system will display the current MOT status, including the expiry date and any advisory notices from previous tests.'
  },
  {
    number: 4,
    title: 'View full history',
    description: 'For a comprehensive view, select "View full MOT history" to see all previous test results, failures, and advisory notices.'
  },
  {
    number: 5,
    title: 'Optional: Purchase premium report',
    description: 'For detailed analysis including risk assessments and manufacturer bulletins, you can purchase a premium report.'
  }
];

// Tab definitions
const HELP_TABS = [
  { id: 'faqs', label: 'Frequently asked questions' },
  { id: 'guide', label: 'How to use this service' },
  { id: 'support', label: 'Get support' },
  { id: 'glossary', label: 'Glossary' }
];

// ----- Utility Functions ----- //

// Get unique categories from FAQ items
const getCategories = (items) => {
  const categories = [];
  items.forEach(item => {
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  });
  return categories;
};

// Get FAQ items by category
const getItemsByCategory = (items, category) => {
  return items.filter(item => item.category === category);
};

// Group glossary items by first letter
const groupGlossaryItems = (items) => {
  const grouped = {};
  const availableLetters = new Set();
  
  items.forEach(item => {
    const letter = item.term.charAt(0).toUpperCase();
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(item);
    availableLetters.add(letter);
  });
  
  return { groupedItems: grouped, availableLetters };
};

// Form validation function
const validateField = (name, value) => {
  switch (name) {
    case 'name':
      return !value.trim() ? 'Enter your full name' : '';
    case 'email':
      if (!value.trim()) return 'Enter your email address';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address';
      return '';
    case 'inquiry':
      return !value ? 'Select an inquiry type' : '';
    case 'message':
      if (!value.trim()) return 'Enter your message';
      if (value.length < 20) return 'Message must be at least 20 characters';
      return '';
    default:
      return '';
  }
};

// ----- Accordion Component ----- //

const AccordionItem = ({ item, isExpanded, onToggle }) => {
  const headingId = `heading-${item.id}`;
  const contentId = `content-${item.id}`;
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const handleFeedback = (isHelpful) => {
    // Simplified tracking - just log to console in this version
    console.log('Feedback for', item.id, ':', isHelpful ? 'helpful' : 'not helpful');
    setFeedbackSubmitted(true);
  };

  return (
    <EnhancedAccordionItem data-testid={`faq-item-${item.id}`}>
      <h3 id={headingId}>
        <EnhancedAccordionButton 
          isExpanded={isExpanded}
          onClick={() => onToggle(item.id)}
          aria-expanded={isExpanded}
          aria-controls={contentId}
        >
          {item.question}
        </EnhancedAccordionButton>
      </h3>
      <EnhancedAccordionContent 
        isExpanded={isExpanded}
        id={contentId}
        role="region"
        aria-labelledby={headingId}
        hidden={!isExpanded}
      >
        <Paragraph>{item.answer}</Paragraph>
        
        <FeedbackSection>
          {feedbackSubmitted ? (
            <SuccessMessage role="status">Thank you for your feedback</SuccessMessage>
          ) : (
            <>
              <FeedbackPrompt id={`feedback-prompt-${item.id}`}>
                Is this page useful?
              </FeedbackPrompt>
              <div role="group" aria-labelledby={`feedback-prompt-${item.id}`}>
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => handleFeedback(true)}
                  aria-label="Yes, this answer was helpful"
                  style={{ marginRight: SPACING.S, marginBottom: 0 }}
                >
                  Yes
                </Button>
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => handleFeedback(false)}
                  aria-label="No, this answer was not helpful"
                  style={{ marginBottom: 0 }}
                >
                  No
                </Button>
              </div>
            </>
          )}
        </FeedbackSection>
      </EnhancedAccordionContent>
    </EnhancedAccordionItem>
  );
};

// ----- FAQ Section Component ----- //

const FAQSection = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Toggle accordion
  const toggleAccordion = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
    
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    searchTimerRef.current = setTimeout(() => {
      const term = value.toLowerCase().trim();
      let results = [];
      
      if (term) {
        results = FAQ_ITEMS.filter(
          item => 
            item.question.toLowerCase().includes(term) || 
            item.answer.toLowerCase().includes(term)
        );
      }
      
      setSearchResults(results);
      setIsSearching(false);
      
      // Auto-expand first result
      if (results.length > 0) {
        setExpandedId(results[0].id);
      }
    }, 300);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInputRef.current) {
      handleSearchChange({ target: { value: searchInputRef.current.value } });
    }
  };
  
  // Get categories for display
  const categories = getCategories(FAQ_ITEMS);
  
  return (
    <Section background={COLORS.LIGHT_GREY}>
      <Container>
        <SectionTitle>Frequently asked questions</SectionTitle>
        
        <SectionHeader>
          <Lead>Find answers to common questions about our vehicle information service.</Lead>
          <DateStamp>Last updated: 10 April 2025</DateStamp>
        </SectionHeader>
        
        {/* Search functionality */}
        <SearchPanel>
          <form onSubmit={handleSearchSubmit} aria-label="Search frequently asked questions">
            <label htmlFor="faq-search">Search frequently asked questions</label>
            <div style={{ display: 'flex', gap: SPACING.M }}>
              <SearchInput
                id="faq-search"
                type="text"
                placeholder="Search for answers"
                onChange={handleSearchChange}
                ref={searchInputRef}
                aria-controls="search-results"
                aria-describedby={isSearching ? "search-status" : undefined}
              />
              <Button 
                variant="primary" 
                size="medium"
                type="submit"
                aria-label="Search FAQs"
              >
                Search
              </Button>
            </div>
          </form>
          
          {isSearching && (
            <div id="search-status" aria-live="polite" className="govuk-visually-hidden">
              Searching...
            </div>
          )}
          
          {searchTerm && (
            <div style={{ marginTop: SPACING.M }}>
              <p 
                id="search-results-count" 
                style={{ margin: 0 }} 
                tabIndex="-1"
                aria-live="polite"
              >
                {searchResults.length === 0 
                  ? 'No results found. Please try different terms or browse the categories below.' 
                  : `Showing ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          )}
        </SearchPanel>
        
        {/* Show search results if there are any */}
        {searchResults.length > 0 && (
          <div style={{ marginBottom: SPACING.XXL }} id="search-results">
            <SearchResultsHeader>Search results</SearchResultsHeader>
            <EnhancedAccordion>
              {searchResults.map(item => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isExpanded={expandedId === item.id}
                  onToggle={toggleAccordion}
                />
              ))}
            </EnhancedAccordion>
          </div>
        )}
        
        {/* Show all FAQs by category if not searching or if search returned no results */}
        {(!searchTerm || searchResults.length === 0) && categories.map(category => (
          <div key={category} style={{ marginBottom: SPACING.XXL }}>
            <CategoryHeader>{category}</CategoryHeader>
            <EnhancedAccordion>
              {getItemsByCategory(FAQ_ITEMS, category).map(item => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isExpanded={expandedId === item.id}
                  onToggle={toggleAccordion}
                />
              ))}
            </EnhancedAccordion>
          </div>
        ))}
        
        <MarginTopGrid columns="1fr 1fr" gap={SPACING.XL}>
          <Card accent={COLORS.GREEN}>
            <SubSectionTitle>Need further assistance?</SubSectionTitle>
            <Paragraph>Our support team is available Monday to Friday, 9am to 5pm.</Paragraph>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                variant="success" 
                size="medium" 
                onClick={() => document.getElementById('tab-support')?.click()}
              >
                Contact support
              </Button>
              <div style={{ color: COLORS.DARK_GREY, fontSize: '16px' }}>
                <span>Response time: </span>
                <strong>2 hours</strong>
              </div>
            </div>
          </Card>
          
          <Card accent={COLORS.BLUE}>
            <SubSectionTitle>Service information</SubSectionTitle>
            <IconList>
              <li>Official DVLA and DVSA data</li>
              <li>Updated daily</li>
              <li>Secure and GDPR compliant</li>
              <li>Accessible on all devices</li>
            </IconList>
            <Button 
              variant="secondary" 
              size="medium" 
              onClick={() => document.getElementById('tab-guide')?.click()}
            >
              View user guide
            </Button>
          </Card>
        </MarginTopGrid>
        
        <WarningText>
          <NoMarginParagraph>
            <strong>Important:</strong> This service provides information for vehicles registered in Great Britain. For Northern Ireland vehicles, please use the DVA service at <a href="https://www.nidirect.gov.uk/services/motcheck-mot-certificate-status" className="govuk-link">www.nidirect.gov.uk</a>.
          </NoMarginParagraph>
        </WarningText>
      </Container>
    </Section>
  );
};

// ----- Guide Section Component ----- //

const HowToUseSection = () => {
  return (
    <Section background={COLORS.LIGHT_GREY}>
      <Container>
        <SectionTitle>How to use this service</SectionTitle>
        <Lead>Follow these steps to check a vehicle's MOT and tax status.</Lead>
        
        <div style={{ marginBottom: SPACING.XXL }}>
          {GUIDE_STEPS.map((step) => (
            <FeatureBox key={step.number}>
              <StepContainer>
                <StepCircle bgColor={COLORS.BLUE}>{step.number}</StepCircle>
                <StepContent>
                  <SubSectionTitle>{step.title}</SubSectionTitle>
                  <Paragraph>{step.description}</Paragraph>
                </StepContent>
              </StepContainer>
            </FeatureBox>
          ))}
        </div>
        
        <InfoBox variant="warning">
          <SubSectionTitle>Accessibility features</SubSectionTitle>
          <Paragraph>
            This service is designed to be accessible to all users, including those using screen readers and keyboard navigation. We comply with WCAG 2.1 AA standards. If you experience any accessibility issues, please contact our support team.
          </Paragraph>
          <Button 
            variant="secondary" 
            size="medium" 
            onClick={() => window.location.href = '/accessibility-statement'}
          >
            View accessibility statement
          </Button>
        </InfoBox>
      </Container>
    </Section>
  );
};

// ----- Support Section Component ----- //

const SupportSection = () => {
  // Form state
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    inquiry: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  
  const formRef = useRef(null);
  const successMessageRef = useRef(null);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    Object.entries(formValues).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) {
        errors[name] = error;
      }
    });
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    const hasErrors = Object.keys(errors).length > 0;
    
    if (hasErrors) {
      setFormErrors(errors);
      
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(`support-${firstErrorField}`);
      if (element) element.focus();
      
      return;
    }
    
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 95% success rate
          if (Math.random() > 0.05) {
            resolve();
          } else {
            reject(new Error('There was a problem submitting your request. Please try again.'));
          }
        }, 800);
      });
      
      // Reset form on success
      setFormValues({
        name: '',
        email: '',
        inquiry: '',
        message: ''
      });
      setFormErrors({});
      setIsSubmitted(true);
      setSubmissionError(null);
      
      // Focus on success message
      setTimeout(() => {
        if (successMessageRef.current) {
          successMessageRef.current.focus();
        }
      }, 0);
    } catch (error) {
      setSubmissionError(error.message);
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section background={COLORS.LIGHT_GREY}>
      <Container>
        <SectionTitle>Get support</SectionTitle>
        <Lead>Contact our support team or access self-help resources.</Lead>
        
        <Grid columns="2fr 1fr" gap={SPACING.XL}>
          <div>
            <SubSectionTitle>Contact our support team</SubSectionTitle>
            <FAQPanel>
              {/* Form errors summary */}
              {Object.keys(formErrors).length > 0 && (
                <div
                  className="govuk-error-summary"
                  aria-labelledby="error-summary-title"
                  role="alert"
                  tabIndex="-1"
                  style={{
                    padding: SPACING.M,
                    border: '5px solid #d4351c',
                    marginBottom: SPACING.L
                  }}
                >
                  <h2 id="error-summary-title" style={{ margin: `0 0 ${SPACING.M} 0` }}>
                    There is a problem
                  </h2>
                  <div>
                    <ul
                      style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {Object.entries(formErrors).map(([field, message]) => (
                        <li key={field} style={{ margin: `0 0 ${SPACING.S} 0` }}>
                          <a href={`#support-${field}`}>{message}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Success message */}
              {isSubmitted && (
                <SuccessMessage
                  id="submit-success-message"
                  role="alert"
                  tabIndex="-1"
                  ref={successMessageRef}
                  style={{
                    borderColor: COLORS.GREEN,
                    padding: SPACING.M
                  }}
                >
                  <h2 style={{ margin: `0 0 ${SPACING.S} 0` }}>Support request submitted</h2>
                  <p style={{ margin: 0 }}>We have received your query and will respond within 2 working hours.</p>
                </SuccessMessage>
              )}
              
              {/* Error message */}
              {submissionError && (
                <ErrorAlert role="alert">
                  <h2 style={{ margin: `0 0 ${SPACING.S} 0` }}>
                    There is a problem
                  </h2>
                  <p style={{ margin: 0 }}>{submissionError}</p>
                </ErrorAlert>
              )}
            
              <form 
                onSubmit={handleSubmit} 
                style={{ marginBottom: SPACING.XL }} 
                noValidate
                ref={formRef}
                aria-label="Support request form"
              >
                {/* Name field */}
                <div className="form-field" style={{ marginBottom: SPACING.M }}>
                  <label 
                    htmlFor="support-name"
                    style={{ 
                      display: 'block', 
                      marginBottom: SPACING.XS,
                      fontWeight: 'bold' 
                    }}
                  >
                    Full name <span aria-hidden="true">*</span>
                    <span className="govuk-visually-hidden">(required)</span>
                  </label>
                  <input
                    id="support-name"
                    name="name"
                    type="text"
                    value={formValues.name}
                    onChange={handleInputChange}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? 'error-name' : undefined}
                    aria-required="true"
                    autoComplete="name"
                    style={{
                      width: '100%',
                      padding: SPACING.S,
                      border: formErrors.name ? `2px solid ${COLORS.RED}` : `2px solid ${COLORS.GREY}`,
                      borderRadius: '2px'
                    }}
                  />
                  {formErrors.name && (
                    <p 
                      id="error-name" 
                      role="alert"
                      style={{ 
                        color: COLORS.RED, 
                        margin: `${SPACING.XS} 0 0 0`,
                        fontSize: '16px'
                      }}
                    >
                      {formErrors.name}
                    </p>
                  )}
                </div>
                
                {/* Email field */}
                <div className="form-field" style={{ marginBottom: SPACING.M }}>
                  <label 
                    htmlFor="support-email"
                    style={{ 
                      display: 'block', 
                      marginBottom: SPACING.XS,
                      fontWeight: 'bold' 
                    }}
                  >
                    Email address <span aria-hidden="true">*</span>
                    <span className="govuk-visually-hidden">(required)</span>
                  </label>
                  <input
                    id="support-email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? 'error-email' : undefined}
                    aria-required="true"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: SPACING.S,
                      border: formErrors.email ? `2px solid ${COLORS.RED}` : `2px solid ${COLORS.GREY}`,
                      borderRadius: '2px'
                    }}
                  />
                  {formErrors.email && (
                    <p 
                      id="error-email" 
                      role="alert"
                      style={{ 
                        color: COLORS.RED, 
                        margin: `${SPACING.XS} 0 0 0`,
                        fontSize: '16px'
                      }}
                    >
                      {formErrors.email}
                    </p>
                  )}
                </div>
                
                {/* Inquiry type field */}
                <div className="form-field" style={{ marginBottom: SPACING.M }}>
                  <label 
                    htmlFor="support-inquiry"
                    style={{ 
                      display: 'block', 
                      marginBottom: SPACING.XS,
                      fontWeight: 'bold' 
                    }}
                  >
                    Type of inquiry <span aria-hidden="true">*</span>
                    <span className="govuk-visually-hidden">(required)</span>
                  </label>
                  <select
                    id="support-inquiry"
                    name="inquiry"
                    value={formValues.inquiry}
                    onChange={handleInputChange}
                    aria-invalid={!!formErrors.inquiry}
                    aria-describedby={formErrors.inquiry ? 'error-inquiry' : undefined}
                    aria-required="true"
                    style={{
                      width: '100%',
                      padding: SPACING.S,
                      border: formErrors.inquiry ? `2px solid ${COLORS.RED}` : `2px solid ${COLORS.GREY}`,
                      borderRadius: '2px',
                      height: '40px'
                    }}
                  >
                    <option value="">Please select</option>
                    <option value="technical">Technical issue</option>
                    <option value="account">Account question</option>
                    <option value="payment">Payment query</option>
                    <option value="report">Report content query</option>
                    <option value="other">Other</option>
                  </select>
                  {formErrors.inquiry && (
                    <p 
                      id="error-inquiry" 
                      role="alert"
                      style={{ 
                        color: COLORS.RED, 
                        margin: `${SPACING.XS} 0 0 0`,
                        fontSize: '16px'
                      }}
                    >
                      {formErrors.inquiry}
                    </p>
                  )}
                </div>
                
                {/* Message field */}
                <div className="form-field" style={{ marginBottom: SPACING.M }}>
                  <label 
                    htmlFor="support-message"
                    style={{ 
                      display: 'block', 
                      marginBottom: SPACING.XS,
                      fontWeight: 'bold' 
                    }}
                  >
                    Your message <span aria-hidden="true">*</span>
                    <span className="govuk-visually-hidden">(required)</span>
                  </label>
                  <textarea
                    id="support-message"
                    name="message"
                    rows="5"
                    value={formValues.message}
                    onChange={handleInputChange}
                    aria-invalid={!!formErrors.message}
                    aria-describedby={formErrors.message ? 'error-message' : undefined}
                    aria-required="true"
                    style={{
                      width: '100%',
                      padding: SPACING.S,
                      border: formErrors.message ? `2px solid ${COLORS.RED}` : `2px solid ${COLORS.GREY}`,
                      borderRadius: '2px'
                    }}
                  />
                  {formErrors.message && (
                    <p 
                      id="error-message" 
                      role="alert"
                      style={{ 
                        color: COLORS.RED, 
                        margin: `${SPACING.XS} 0 0 0`,
                        fontSize: '16px'
                      }}
                    >
                      {formErrors.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  variant="primary" 
                  size="medium"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit request'}
                </Button>
              </form>
              
              <WarningText>
                <NoMarginParagraph>
                  Your request will be processed in accordance with our <a href="/privacy-policy" className="govuk-link">privacy policy</a>. We aim to respond to all inquiries within 2 working hours during our operating hours (Monday to Friday, 9am to 5pm).
                </NoMarginParagraph>
              </WarningText>
            </FAQPanel>
          </div>
          
          <div>
            <SubSectionTitle>Support information</SubSectionTitle>
            <Card accent={COLORS.BLUE}>
              <h4 style={{ margin: `0 0 ${SPACING.M} 0`, fontSize: '18px' }}>
                Operating hours
              </h4>
              <Paragraph>
                Monday to Friday: 9am to 5pm<br />
                Saturday and Sunday: Closed<br />
                Bank holidays: Closed
              </Paragraph>
              
              <h4 style={{ margin: `${SPACING.L} 0 ${SPACING.M} 0`, fontSize: '18px' }}>
                Contact methods
              </h4>
              <ul style={{ margin: `${SPACING.M} 0`, padding: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: SPACING.M }}>
                  Email: support@vehiclecheck.gov.uk
                </li>
                <li>
                  Phone: 0300 123 9000
                </li>
              </ul>
              
              <h4 style={{ margin: `${SPACING.L} 0 ${SPACING.M} 0`, fontSize: '18px' }}>
                Average response times
              </h4>
              <Paragraph>
                Email: Within 2 hours<br />
                Phone: Less than 5 minutes wait
              </Paragraph>
            </Card>
            
            <Card accent={COLORS.GREEN} style={{ marginTop: SPACING.XL }}>
              <h4 style={{ margin: `0 0 ${SPACING.M} 0`, fontSize: '18px' }}>
                Service status
              </h4>
              <StatusContainer>
                <span aria-label="All systems operational" role="status">
                  All systems operational
                </span>
              </StatusContainer>
              <Paragraph>
                Last checked: 12 April 2025, 09:15
              </Paragraph>
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => window.location.href = '/system-status'}
              >
                View system status
              </Button>
            </Card>
          </div>
        </Grid>
      </Container>
    </Section>
  );
};

// ----- Glossary Section Component ----- //

const GlossarySection = () => {
  const { groupedItems, availableLetters } = groupGlossaryItems(GLOSSARY_ITEMS);
  
  // Handle alphabet navigation
  const handleAlphabetClick = (letter, e) => {
    if (availableLetters.has(letter)) {
      const target = document.getElementById(`glossary-${letter}`);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        target.focus();
      }
    }
  };

  return (
    <Section background={COLORS.LIGHT_GREY}>
      <Container>
        <SectionTitle>Glossary of terms</SectionTitle>
        <Lead>Common terminology used in vehicle testing and documentation.</Lead>
        
        <FAQPanel>
          {/* Alphabetical navigation */}
          <nav aria-label="Glossary alphabetical navigation">
            <AlphabetContainer>
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                <AlphabetLink 
                  key={letter}
                  href={availableLetters.has(letter) ? `#glossary-${letter}` : undefined}
                  active={availableLetters.has(letter)}
                  aria-disabled={!availableLetters.has(letter)}
                  tabIndex={availableLetters.has(letter) ? 0 : -1}
                  onClick={(e) => handleAlphabetClick(letter, e)}
                >
                  {letter}
                </AlphabetLink>
              ))}
            </AlphabetContainer>
          </nav>
          
          {/* Glossary content */}
          {Object.entries(groupedItems).map(([letter, items]) => (
            <div 
              key={letter}
              id={`glossary-${letter}`}
              style={{ width: '100%', marginBottom: SPACING.L }}
              tabIndex="-1"
            >
              <GlossaryLetterHeader>{letter}</GlossaryLetterHeader>
              
              <dl>
                {items.map(item => (
                  <GlossaryTermContainer key={item.term}>
                    <GlossaryTerm>{item.term}</GlossaryTerm>
                    <GlossaryDefinition>{item.definition}</GlossaryDefinition>
                  </GlossaryTermContainer>
                ))}
              </dl>
            </div>
          ))}
        </FAQPanel>
        
        <InfoBox variant="info">
          <NoMarginParagraph>
            <strong>Note:</strong> This glossary is provided for informational purposes only and is not a substitute for official DVLA or DVSA documentation. Terms and definitions may be updated in line with changes to legislation or procedures.
          </NoMarginParagraph>
        </InfoBox>
      </Container>
    </Section>
  );
};

// ----- Main Help Section Component ----- //

const HelpSection = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  
  // Handle tab selection - simplified with focus management
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    
    // Set focus on the selected tab panel for accessibility
    setTimeout(() => {
      const panelElement = document.getElementById(`panel-${tabId}`);
      if (panelElement) {
        panelElement.focus();
      }
    }, 0);
  };
  
  // Render active tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'faqs': return <FAQSection />;
      case 'guide': return <HowToUseSection />;
      case 'support': return <SupportSection />;
      case 'glossary': return <GlossarySection />;
      default: return <FAQSection />;
    }
  };

  return (
    <ErrorBoundary>
      <Section background={COLORS.WHITE}>
        <Container>
          <PageTitle>Help and support</PageTitle>
          <Lead>Find information about our vehicle history service, how to use it, and answers to common questions.</Lead>
          
          {/* Tab navigation - simplified */}
          <TabList role="tablist" aria-label="Help sections">
            {HELP_TABS.map((tab) => (
              <TabButton
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                isActive={activeTab === tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabList>
        </Container>
      </Section>
      
      {/* Tab content */}
      <div 
        id={`panel-${activeTab}`} 
        role="tabpanel" 
        aria-labelledby={`tab-${activeTab}`}
        tabIndex="-1"
      >
        {renderTabContent()}
      </div>
    </ErrorBoundary>
  );
};

export default HelpSection;