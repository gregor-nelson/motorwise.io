import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COLORS, SPACING } from '../../../../styles/theme';
import {
  Section,
  Container,
  PageTitle,
  SectionTitle,
  SubSectionTitle,
  Lead,
  Paragraph,
  Grid,
  Card,
  Button,
  IconList,
  WarningText,
  NoMarginParagraph,
  TabList,
  TabButton,
  InfoBox,
  SuccessMessage,
  ErrorAlert,
  FAQPanel,
  SearchPanel,
  SearchInput,
  CategoryHeader,
  SearchResultsHeader,
  StatusContainer,
  StepContainer,
  StepCircle,
  StepContent,
  GlossaryLetterHeader,
  GlossaryTermContainer,
  GlossaryTerm,
  GlossaryDefinition,
  AlphabetContainer,
  AlphabetLink,
  // New imports from revised styles
  FormFieldWrapper,
  FlexRow,
  InlineButton,
  SectionWrapper,
  ContentHeader,
  SearchResultText,
  GovUKLabel,
  GovUKInput,
  GovUKSelect,
  GovUKTextarea,
  GovUKErrorMessage,
  GovUKVisuallyHidden,
  // GOV.UK Accordion components
  GovUKAccordion,
  GovUKAccordionSection,
  GovUKAccordionSectionHeader,
  GovUKAccordionSectionHeading,
  GovUKAccordionSectionButton,
  GovUKAccordionSectionSummary,
  GovUKAccordionSectionContent,
  AccordionControls,
  AccordionShowAllButton,
} from '../../../../styles/Home/styles';

// Import data from separate file to reduce component size
import { FAQ_ITEMS, GLOSSARY_ITEMS, GUIDE_STEPS } from './helpData';

// Custom Hooks
const useSearch = (items, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const results = useMemo(() => {
    if (!debouncedTerm.trim()) return [];
    const term = debouncedTerm.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => item[field].toLowerCase().includes(term))
    );
  }, [debouncedTerm, items, searchFields]);

  return { searchTerm, setSearchTerm, results, isSearching: searchTerm.trim() && !results.length };
};

const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(async (e, onSubmit) => {
    e.preventDefault();
    const validationErrors = validate(values);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = document.getElementById(`support-${Object.keys(validationErrors)[0]}`);
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
  }, [values, validate, initialValues]);

  return { values, errors, isSubmitting, isSubmitted, handleChange, handleSubmit };
};

// Reusable Components
const FormField = ({ id, name, label, type = 'text', value, error, onChange, required, ...props }) => {
  const fieldId = `support-${id}`;
  const errorId = `error-${id}`;
  
  const InputComponent = type === 'textarea' ? GovUKTextarea : 
                        type === 'select' ? GovUKSelect : 
                        GovUKInput;

  return (
    <FormFieldWrapper className={error ? 'govuk-form-group--error' : ''}>
      <GovUKLabel htmlFor={fieldId}>
        {label} {required && (
          <>
            <span aria-hidden="true">*</span>
            <GovUKVisuallyHidden>(required)</GovUKVisuallyHidden>
          </>
        )}
      </GovUKLabel>
      <InputComponent
        id={fieldId}
        name={name}
        type={type !== 'textarea' && type !== 'select' ? type : undefined}
        value={value}
        onChange={onChange}
        error={!!error}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        {...props}
      />
      {error && (
        <GovUKErrorMessage id={errorId} role="alert">
          {error}
        </GovUKErrorMessage>
      )}
    </FormFieldWrapper>
  );
};

// Tab Content Components
const FAQSection = () => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const { searchTerm, setSearchTerm, results, isSearching } = useSearch(FAQ_ITEMS, ['question', 'answer']);
  
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
    if (results.length > 0) {
      setExpandedItems(new Set([results[0].id]));
    }
  };

  const toggleItem = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleAllItems = () => {
    if (showAll) {
      setExpandedItems(new Set());
      setShowAll(false);
    } else {
      const allIds = FAQ_ITEMS.map(item => item.id);
      setExpandedItems(new Set(allIds));
      setShowAll(true);
    }
  };

  const renderAccordionSection = (item) => (
    <GovUKAccordionSection key={item.id}>
      <GovUKAccordionSectionHeader>
        <GovUKAccordionSectionHeading>
          <GovUKAccordionSectionButton
            id={`accordion-button-${item.id}`}
            aria-controls={`accordion-content-${item.id}`}
            aria-expanded={expandedItems.has(item.id)}
            onClick={() => toggleItem(item.id)}
          >
            {item.question}
          </GovUKAccordionSectionButton>
        </GovUKAccordionSectionHeading>
        {item.summary && (
          <GovUKAccordionSectionSummary id={`accordion-summary-${item.id}`}>
            {item.summary}
          </GovUKAccordionSectionSummary>
        )}
      </GovUKAccordionSectionHeader>
      <GovUKAccordionSectionContent 
        id={`accordion-content-${item.id}`}
        aria-labelledby={`accordion-button-${item.id}`}
        hidden={!expandedItems.has(item.id)}
      >
        <Paragraph>{item.answer}</Paragraph>
        {item.additionalInfo && (
          <InfoBox>
            <Paragraph>{item.additionalInfo}</Paragraph>
          </InfoBox>
        )}
      </GovUKAccordionSectionContent>
    </GovUKAccordionSection>
  );

  const displayItems = searchTerm && results.length > 0 ? results : null;

  return (
    <Section background={COLORS.LIGHT_GREY}>
      <Container>
        <SectionTitle>Frequently asked questions</SectionTitle>
        <Lead>Find answers to common questions about our vehicle information service.</Lead>
        
        <SearchPanel>
          <form onSubmit={handleSearch}>
            <GovUKLabel htmlFor="faq-search">Search frequently asked questions</GovUKLabel>
            <FlexRow>
              <SearchInput
                id="faq-search"
                type="text"
                placeholder="Search for answers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="primary" size="medium" type="submit">Search</Button>
            </FlexRow>
          </form>
          
          {searchTerm && (
            <SearchResultText>
              {results.length === 0 
                ? 'No results found. Please try different terms.' 
                : `Showing ${results.length} result${results.length !== 1 ? 's' : ''}`}
            </SearchResultText>
          )}
        </SearchPanel>

        {!displayItems && (
          <AccordionControls>
            <AccordionShowAllButton
              onClick={toggleAllItems}
              aria-expanded={showAll}
            >
              {showAll ? 'Hide all sections' : 'Show all sections'}
            </AccordionShowAllButton>
          </AccordionControls>
        )}
        
        {displayItems ? (
          <SectionWrapper>
            <SearchResultsHeader>Search results</SearchResultsHeader>
            <GovUKAccordion id="search-results-accordion">
              {displayItems.map(renderAccordionSection)}
            </GovUKAccordion>
          </SectionWrapper>
        ) : (
          categories.map(category => (
            <SectionWrapper key={category}>
              <CategoryHeader>{category}</CategoryHeader>
              <GovUKAccordion id={`accordion-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                {itemsByCategory[category].map(renderAccordionSection)}
              </GovUKAccordion>
            </SectionWrapper>
          ))
        )}
        
        <Grid columns="1fr 1fr" gap={SPACING.XL}>
          <Card accent={COLORS.GREEN}>
            <SubSectionTitle>Need further assistance?</SubSectionTitle>
            <Paragraph>Our support team is available Monday to Friday, 9am to 5pm.</Paragraph>
            <Button variant="success" size="medium" onClick={() => document.getElementById('tab-support')?.click()}>
              Contact support
            </Button>
          </Card>
          
          <Card accent={COLORS.BLUE}>
            <SubSectionTitle>Service information</SubSectionTitle>
            <IconList>
              <li>Official DVLA and DVSA data</li>
              <li>Updated daily</li>
              <li>Secure and GDPR compliant</li>
            </IconList>
          </Card>
        </Grid>
      </Container>
    </Section>
  );
};

const HowToUseSection = () => (
  <Section background={COLORS.LIGHT_GREY}>
    <Container>
      <SectionTitle>How to use this service</SectionTitle>
      <Lead>Follow these steps to check a vehicle's MOT and tax status.</Lead>
      
      {GUIDE_STEPS.map((step) => (
        <StepContainer key={step.number}>
          <StepCircle bgColor={COLORS.BLUE}>{step.number}</StepCircle>
          <StepContent>
            <SubSectionTitle>{step.title}</SubSectionTitle>
            <Paragraph>{step.description}</Paragraph>
          </StepContent>
        </StepContainer>
      ))}
      
      <InfoBox variant="warning">
        <SubSectionTitle>Accessibility features</SubSectionTitle>
        <Paragraph>
          This service is designed to be accessible to all users. We comply with WCAG 2.1 AA standards.
        </Paragraph>
      </InfoBox>
    </Container>
  </Section>
);

const SupportSection = () => {
  const validate = useCallback((values) => {
    const errors = {};
    if (!values.name.trim()) errors.name = 'Enter your full name';
    if (!values.email.trim()) errors.email = 'Enter your email address';
    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Enter a valid email address';
    if (!values.inquiry) errors.inquiry = 'Select an inquiry type';
    if (!values.message.trim()) errors.message = 'Enter your message';
    else if (values.message.length < 20) errors.message = 'Message must be at least 20 characters';
    return errors;
  }, []);

  const { values, errors, isSubmitting, isSubmitted, handleChange, handleSubmit } = useForm(
    { name: '', email: '', inquiry: '', message: '' },
    validate
  );

  const onSubmit = async (formValues) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.05 ? resolve() : reject(new Error('Submission failed. Please try again.'));
      }, 800);
    });
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
              {isSubmitted && (
                <SuccessMessage role="alert">
                  <ContentHeader>Support request submitted</ContentHeader>
                  <NoMarginParagraph>We will respond within 2 working hours.</NoMarginParagraph>
                </SuccessMessage>
              )}
              
              {errors.submit && (
                <ErrorAlert role="alert">
                  <NoMarginParagraph>{errors.submit}</NoMarginParagraph>
                </ErrorAlert>
              )}
            
              <form onSubmit={(e) => handleSubmit(e, onSubmit)} noValidate>
                <FormField
                  id="name"
                  name="name"
                  label="Full name"
                  value={values.name}
                  error={errors.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
                
                <FormField
                  id="email"
                  name="email"
                  label="Email address"
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
                  label="Type of inquiry"
                  type="select"
                  value={values.inquiry}
                  error={errors.inquiry}
                  onChange={handleChange}
                  required
                >
                  <option value="">Please select</option>
                  <option value="technical">Technical issue</option>
                  <option value="account">Account question</option>
                  <option value="payment">Payment query</option>
                  <option value="other">Other</option>
                </FormField>
                
                <FormField
                  id="message"
                  name="message"
                  label="Your message"
                  type="textarea"
                  value={values.message}
                  error={errors.message}
                  onChange={handleChange}
                  required
                  rows="5"
                />
                
                <Button variant="primary" size="medium" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit request'}
                </Button>
              </form>
            </FAQPanel>
          </div>
          
          <div>
            <Card accent={COLORS.BLUE}>
              <ContentHeader as="h4">Operating hours</ContentHeader>
              <Paragraph>Monday to Friday: 9am to 5pm</Paragraph>
              <ContentHeader as="h4">Contact methods</ContentHeader>
              <Paragraph>Email: support@vehiclecheck.gov.uk</Paragraph>
            </Card>
            
            <Card accent={COLORS.GREEN}>
              <ContentHeader as="h4">Service status</ContentHeader>
              <StatusContainer>All systems operational</StatusContainer>
            </Card>
          </div>
        </Grid>
      </Container>
    </Section>
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
    <Section background={COLORS.LIGHT_GREY}>
      <Container>
        <SectionTitle>Glossary of terms</SectionTitle>
        <Lead>Common terminology used in vehicle testing and documentation.</Lead>
        
        <FAQPanel>
          <AlphabetContainer>
            {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
              <AlphabetLink 
                key={letter}
                href={availableLetters.has(letter) ? `#glossary-${letter}` : undefined}
                active={availableLetters.has(letter)}
                aria-disabled={!availableLetters.has(letter)}
                tabIndex={availableLetters.has(letter) ? 0 : -1}
              >
                {letter}
              </AlphabetLink>
            ))}
          </AlphabetContainer>
          
          {Object.entries(groupedItems).map(([letter, items]) => (
            <div key={letter} id={`glossary-${letter}`}>
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
      </Container>
    </Section>
  );
};

// Main Component
const HelpSection = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  
  const tabs = [
    { id: 'faqs', label: 'Frequently asked questions', component: FAQSection },
    { id: 'guide', label: 'How to use this service', component: HowToUseSection },
    { id: 'support', label: 'Get support', component: SupportSection },
    { id: 'glossary', label: 'Glossary', component: GlossarySection }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || FAQSection;

  return (
    <>
      <Section background={COLORS.WHITE}>
        <Container>
          <PageTitle>Help and support</PageTitle>
          <Lead>Find information about our vehicle history service.</Lead>
          
          <TabList role="tablist">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
      
      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        <ActiveComponent />
      </div>
    </>
  );
};

export default HelpSection;