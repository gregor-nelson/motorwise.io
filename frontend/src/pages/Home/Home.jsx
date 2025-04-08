import React, { useState } from 'react';
import VehicleSearch from '../../components/Results/vehicleSearch';
import {
  // Layout components
  GovUKSkipLink,
  GovUKHeader,
  GovUKHeaderContainer,
  GovUKHeaderLogo,
  GovUKHeaderContent,
  GovUKHeaderLink,
  GovUKHeaderServiceName,
  GovUKContainer,
  GovUKPhaseBanner,
  GovUKPhaseBannerContent,
  GovUKPhaseBannerTag,
  GovUKPhaseBannerText,
  GovUKMainWrapper,
  GovUKFooter,
  GovUKFooterMeta,
  GovUKFooterMetaItem,
  GovUKVisuallyHidden,
  GovUKFooterInlineList,
  GovUKFooterInlineListItem,
  GovUKFooterLink,
  GovUKLink,
  
  // Typography components
  GovUKBody,
  GovUKSectionBreak,
  GovUKHeaderLogotype,
  GovUKHeaderLogotypeText,
  GovUKFooterMetaCustom,
  GovUKFooterLicenceLogo,
  GovUKFooterLicenceDescription,
  GovUKFooterCopyrightLogo,
  GovUKHeadingL,
  GovUKHeadingM,
  GovUKHeadingS,
  
  // Layout grid
  GovUKGridRow,
  GovUKGridColumnTwoThirds,
  GovUKGridColumnOneThird,
  
  // Form components
  GovUKList,
  GovUKButton,
  
  // Accordion components
  GovUKAccordion,
  GovUKAccordionSection,
  GovUKAccordionSectionButton,
  GovUKAccordionSectionHeader,
  GovUKAccordionSectionHeading,
  GovUKAccordionSectionContent,
  
  // Misc components
  GovUKInsetText,
  
  // Constants from theme
  SPACING,
  COLORS
} from '../../styles/theme'; // Adjust path as needed

// Import custom styled components for the home page
import {
  QuickLinksContainer,
  NavLinkList,
  NavLinkItem,
  FeatureCardContainer,
  FeatureCardHeader,
  FeatureCardIcon,
  DataTable,
  TableHeader,
  TableRow,
  TableCell,
  StepGuideContainer,
  StepItem,
  StepNumber,
  StepContent,
  WarningTextContainer,
  WarningTextIcon,
  WarningTextBody,
  SidebarContainer,
  LegalPanel,
  SidebarHeading,
  SidebarBody,
  SidebarList,
  InfoBox,
  AppDownloadContainer,
  AppButton,
  ButtonContainer,
  CustomTag,
  SectionContainer
} from '../../styles/Home/styles'; // Adjust path as needed

// Feature Card component
const FeatureCard = ({ icon, title, children }) => (
  <FeatureCardContainer>
    <FeatureCardHeader>
      <FeatureCardIcon>{icon}</FeatureCardIcon>
      <GovUKHeadingS>{title}</GovUKHeadingS>
    </FeatureCardHeader>
    <GovUKBody>{children}</GovUKBody>
  </FeatureCardContainer>
);

// Navigation link component
const NavLink = ({ href, children }) => (
  <NavLinkItem>
    <GovUKLink href={href}>{children}</GovUKLink>
  </NavLinkItem>
);

// Accordion Item component with proper functionality
const AccordionItem = ({ id, heading, children, expanded, onToggle }) => {
  const headingId = `heading-${id}`;
  const contentId = `content-${id}`;
  
  return (
    <GovUKAccordionSection>
      <GovUKAccordionSectionHeader>
        <GovUKAccordionSectionHeading>
          <GovUKAccordionSectionButton 
            aria-expanded={expanded}
            aria-controls={contentId}
            id={headingId}
            onClick={() => onToggle(id)}
          >
            {heading}
          </GovUKAccordionSectionButton>
        </GovUKAccordionSectionHeading>
      </GovUKAccordionSectionHeader>
      <GovUKAccordionSectionContent 
        id={contentId} 
        aria-labelledby={headingId}
        hidden={!expanded}
      >
        {children}
      </GovUKAccordionSectionContent>
    </GovUKAccordionSection>
  );
};

function Home() {
  // State to manage accordion sections
  const [expandedSections, setExpandedSections] = useState({});
  
  // Toggle accordion section
  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle keyboard events for accordion
  const handleAccordionKeyDown = (e) => {
    if (e.key === 'Home') {
      // Focus on first accordion button
      document.querySelector('.govuk-accordion__section-button').focus();
      e.preventDefault();
    } else if (e.key === 'End') {
      // Focus on last accordion button
      const buttons = document.querySelectorAll('.govuk-accordion__section-button');
      buttons[buttons.length - 1].focus();
      e.preventDefault();
    }
  };
  
  // Accordion FAQ items data
  const faqItems = [
    {
      id: 'mot-valid',
      heading: 'How can I check if my vehicle\'s MOT is valid?',
      content: 'Enter your vehicle registration number in the search box. The system will display the current MOT status, including the expiry date. If your MOT has expired, you should not drive the vehicle except to a pre-booked MOT test.'
    },
    {
      id: 'vehicle-info',
      heading: 'What information does the service provide about a vehicle?',
      content: 'The service provides official DVLA vehicle details (make, model, year, engine size, fuel type), current tax status, complete MOT history including test results, advisory notices, failures, and mileage readings at each test.'
    },
    {
      id: 'missing-vehicle',
      heading: 'Why might a vehicle not appear in the system?',
      content: 'A vehicle may not appear if it\'s exempt from MOT testing (such as vehicles manufactured before 1960), recently registered and not yet tested, or registered in Northern Ireland or outside Great Britain. The database is updated daily with the latest information.'
    },
    {
      id: 'legally-binding',
      heading: 'Is the information legally binding?',
      content: 'The information is sourced directly from official DVLA and DVSA databases but is provided for informational purposes only. While every effort is made to ensure accuracy, for official verification of vehicle status, you should check the vehicle\'s physical MOT certificate or V5C document.'
    },
    {
      id: 'data-updates',
      heading: 'How up-to-date is the information?',
      content: 'The MOT history and vehicle details are updated daily from the DVSA and DVLA databases. Tax information is typically updated within 5 working days of any changes.'
    }
  ];
  
  return (
    <div className="app">
      <GovUKSkipLink href="#main-content">Skip to main content</GovUKSkipLink>
      
      <GovUKHeader role="banner">
        <GovUKHeaderContainer as={GovUKContainer}>
          <GovUKHeaderLogo>
            <GovUKHeaderLink href="#" isHomepage>
              <GovUKHeaderLogotype>
                <GovUKHeaderLogotypeText>Mot Check.UK</GovUKHeaderLogotypeText>
              </GovUKHeaderLogotype>
            </GovUKHeaderLink>
          </GovUKHeaderLogo>
          <GovUKHeaderContent>
            <GovUKHeaderServiceName href="#">
              Vehicle and MOT history
            </GovUKHeaderServiceName>
          </GovUKHeaderContent>
        </GovUKHeaderContainer>
      </GovUKHeader>
      
      <GovUKContainer>
        <GovUKPhaseBanner>
          <GovUKPhaseBannerContent>
            <GovUKPhaseBannerTag data-phase="beta">BETA</GovUKPhaseBannerTag>
            <GovUKPhaseBannerText>
              This is a new service – your <GovUKLink href="#">feedback</GovUKLink> will help us to improve it.
            </GovUKPhaseBannerText>
          </GovUKPhaseBannerContent>
        </GovUKPhaseBanner>
        
        <GovUKMainWrapper id="main-content">
          {/* Service Navigation */}
          <GovUKGridRow>
            <GovUKGridColumnTwoThirds>
              <GovUKHeadingL>Vehicle and MOT information service</GovUKHeadingL>
              <GovUKBody>
                Access official DVLA vehicle records and MOT history to check vehicle details, tax status, and testing information.
              </GovUKBody>
            </GovUKGridColumnTwoThirds>
            <GovUKGridColumnOneThird>
              <QuickLinksContainer>
                <GovUKHeadingS>Quick links</GovUKHeadingS>
                <NavLinkList>
                  <NavLink href="#">Check MOT history</NavLink>
                  <NavLink href="#">Check vehicle tax status</NavLink>
                  <NavLink href="#">Vehicle technical data</NavLink>
                  <NavLink href="#">Import vehicle records</NavLink>
                  <NavLink href="#">Export notification</NavLink>
                </NavLinkList>
              </QuickLinksContainer>
            </GovUKGridColumnOneThird>
          </GovUKGridRow>
          
          <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
          
          {/* Search Component */}
          <VehicleSearch />
          
          <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
          
          {/* Service Overview */}
          <SectionContainer>
            <GovUKHeadingM>About this service</GovUKHeadingM>
            <GovUKBody>
              This official government service provides access to vehicle and MOT information held by the Driver and Vehicle Standards Agency (DVSA) and Driver and Vehicle Licensing Agency (DVLA). All data is sourced directly from official records to ensure accuracy and reliability.
            </GovUKBody>
          </SectionContainer>
          
          <GovUKGridRow>
            <GovUKGridColumnTwoThirds>
              {/* Feature Boxes */}
              <SectionContainer>
                <GovUKHeadingM>Service features</GovUKHeadingM>
                
                <FeatureCard 
                  icon="📄"
                  title="Complete MOT history"
                >
                  Access the full testing record including test results, advisory notices, reasons for failures, and recorded mileage at each test. Information is updated daily from official DVSA test records.
                </FeatureCard>
                
                <FeatureCard 
                  icon="🔍"
                  title="Vehicle details check"
                >
                  View essential vehicle information including make, model, year of manufacture, engine size, and fuel type. All details are sourced directly from official DVLA vehicle records.
                </FeatureCard>
                
                <FeatureCard 
                  icon="💷"
                  title="Tax status verification"
                >
                  Confirm current vehicle tax status, rate band, and expiry date to ensure compliance with road tax regulations. Helps you stay legal on UK roads with up-to-date information.
                </FeatureCard>
                
                <FeatureCard 
                  icon="⚠️"
                  title="Vehicle safety information"
                >
                  Check if the vehicle has outstanding safety recalls that require attention. This includes manufacturer recalls for safety-critical components and systems.
                </FeatureCard>
              </SectionContainer>
              
              <SectionContainer spacingTop={SPACING.XL}>
                <GovUKHeadingM>Information included in your check</GovUKHeadingM>
                
                <DataTable>
                  <TableHeader>Available vehicle data</TableHeader>
                  
                  <TableRow>
                    <TableCell width="30%" bold>Vehicle identity</TableCell>
                    <TableCell width="70%" noRightBorder>Make, model, body type, colour, year of first registration</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell width="30%" bold>Technical specifications</TableCell>
                    <TableCell width="70%" noRightBorder>Engine capacity, fuel type, transmission, CO2 emissions</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell width="30%" bold>MOT history</TableCell>
                    <TableCell width="70%" noRightBorder>Test dates, results, advisory notices, failure reasons, mileage readings</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell width="30%" bold>Tax information</TableCell>
                    <TableCell width="70%" noRightBorder>Current tax status, expiry date, SORN status</TableCell>
                  </TableRow>
                  
                  <TableRow noBorder>
                    <TableCell width="30%" bold>Environmental data</TableCell>
                    <TableCell width="70%" noRightBorder>Euro emissions standard, ULEZ compliance status</TableCell>
                  </TableRow>
                </DataTable>
              </SectionContainer>
              
              <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
              
              {/* How to use the service */}
              <SectionContainer>
                <GovUKHeadingM>How to use this service</GovUKHeadingM>
                
                <StepGuideContainer>
                  <StepItem>
                    <StepNumber>Step 1</StepNumber>
                    <StepContent>Enter the vehicle registration number in the search box above.</StepContent>
                  </StepItem>
                  <StepItem>
                    <StepNumber>Step 2</StepNumber>
                    <StepContent>Review the vehicle details to confirm you have the correct vehicle.</StepContent>
                  </StepItem>
                  <StepItem>
                    <StepNumber>Step 3</StepNumber>
                    <StepContent>Access the full MOT history, tax information, and vehicle specifications.</StepContent>
                  </StepItem>
                  <StepItem>
                    <StepNumber>Step 4</StepNumber>
                    <StepContent>If needed, save or print the information for your records.</StepContent>
                  </StepItem>
                </StepGuideContainer>
                
                <WarningTextContainer>
                  <WarningTextIcon>!</WarningTextIcon>
                  <WarningTextBody>
                    This service provides official government data for informational purposes. While comprehensive, it may not include vehicles not subject to MOT testing or those tested outside Great Britain.
                  </WarningTextBody>
                </WarningTextContainer>
              </SectionContainer>
              
              <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
              
              {/* Accordion for FAQs */}
              <SectionContainer>
                <GovUKHeadingM>Frequently asked questions</GovUKHeadingM>
                <GovUKAccordion 
                  id="accordion-default"
                  onKeyDown={handleAccordionKeyDown}
                >
                  {faqItems.map(item => (
                    <AccordionItem
                      key={item.id}
                      id={item.id}
                      heading={item.heading}
                      expanded={!!expandedSections[item.id]}
                      onToggle={toggleSection}
                    >
                      <GovUKBody>
                        {item.content}
                      </GovUKBody>
                    </AccordionItem>
                  ))}
                </GovUKAccordion>
              </SectionContainer>
              
              <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
              
              {/* Related services */}
              <SectionContainer>
                <GovUKHeadingM>Related services</GovUKHeadingM>
                <GovUKList>
                  <li>
                    <GovUKLink href="#">Book an MOT test</GovUKLink>
                  </li>
                  <li>
                    <GovUKLink href="#">Tax your vehicle</GovUKLink>
                  </li>
                  <li>
                    <GovUKLink href="#">Notify DVLA of vehicle sale</GovUKLink>
                  </li>
                  <li>
                    <GovUKLink href="#">Check if a vehicle is taxed</GovUKLink>
                  </li>
                  <li>
                    <GovUKLink href="#">Vehicle information API for businesses</GovUKLink>
                  </li>
                </GovUKList>
                
                <GovUKInsetText>
                  For more advanced vehicle checks including outstanding finance, write-off status, or theft checks, you may need to use a commercial vehicle history checking service. The government does not provide these additional checks through this service.
                </GovUKInsetText>
              </SectionContainer>
            </GovUKGridColumnTwoThirds>
            
            <GovUKGridColumnOneThird>
              {/* Sidebar sections */}
              <SidebarContainer>
                <LegalPanel>
                  <SidebarHeading>Stay road legal</SidebarHeading>
                  <SidebarBody>
                    All vehicles used on UK roads must have:
                  </SidebarBody>
                  <SidebarList>
                    <li>Valid vehicle tax</li>
                    <li>Current MOT certificate (if vehicle is over 3 years old)</li>
                    <li>At least third-party insurance coverage</li>
                  </SidebarList>
                  <SidebarBody>
                    Use this service to check your MOT and tax status.
                  </SidebarBody>
                </LegalPanel>
                
                <InfoBox>
                  <GovUKHeadingS>About our data</GovUKHeadingS>
                  <GovUKBody>
                    This service uses official data from:
                  </GovUKBody>
                  <SidebarList
                    style={{ 
                      color: COLORS.BLACK,
                      paddingLeft: SPACING.L
                    }}
                  >
                    <li>DVLA vehicle records</li>
                    <li>DVSA MOT testing database</li>
                    <li>Manufacturer safety recall notices</li>
                  </SidebarList>
                  <GovUKBody>
                    Data is updated daily to ensure accuracy.
                  </GovUKBody>
                </InfoBox>
                
                <InfoBox>
                  <GovUKHeadingS>Need help?</GovUKHeadingS>
                  <GovUKList>
                    <li><GovUKLink href="#">Contact DVSA about MOT issues</GovUKLink></li>
                    <li><GovUKLink href="#">Contact DVLA about vehicle registration</GovUKLink></li>
                    <li><GovUKLink href="#">Feedback on this service</GovUKLink></li>
                    <li><GovUKLink href="#">Report a technical problem</GovUKLink></li>
                  </GovUKList>
                </InfoBox>
                
                <AppDownloadContainer>
                  <GovUKHeadingS>Download the official app</GovUKHeadingS>
                  <GovUKBody>
                    Access vehicle and MOT information on the go with the official DVSA MOT History app.
                  </GovUKBody>
                  <ButtonContainer>
                    <AppButton>App Store</AppButton>
                    <AppButton noMargin>Google Play</AppButton>
                  </ButtonContainer>
                </AppDownloadContainer>
              </SidebarContainer>
            </GovUKGridColumnOneThird>
          </GovUKGridRow>
        </GovUKMainWrapper>
      </GovUKContainer>
      
      <GovUKFooter role="contentinfo">
        <GovUKContainer>
          <GovUKFooterMeta>
            <GovUKFooterMetaItem grow>
              <GovUKVisuallyHidden>Support links</GovUKVisuallyHidden>
              <GovUKFooterInlineList>
                <GovUKFooterInlineListItem>
                  <GovUKFooterLink href="#">Help</GovUKFooterLink>
                </GovUKFooterInlineListItem>
                <GovUKFooterInlineListItem>
                  <GovUKFooterLink href="#">Cookies</GovUKFooterLink>
                </GovUKFooterInlineListItem>
                <GovUKFooterInlineListItem>
                  <GovUKFooterLink href="#">Contact</GovUKFooterLink>
                </GovUKFooterInlineListItem>
                <GovUKFooterInlineListItem>
                  <GovUKFooterLink href="#">Terms and conditions</GovUKFooterLink>
                </GovUKFooterInlineListItem>
                <GovUKFooterInlineListItem>
                  <GovUKFooterLink href="#">Accessibility statement</GovUKFooterLink>
                </GovUKFooterInlineListItem>
                <GovUKFooterInlineListItem>
                  <GovUKFooterLink href="#">Privacy notice</GovUKFooterLink>
                </GovUKFooterInlineListItem>
              </GovUKFooterInlineList>
              
              <GovUKFooterMetaCustom>
                Information provided by the <GovUKFooterLink href="#">Driver & Vehicle Standards Agency</GovUKFooterLink> and the <GovUKFooterLink href="#">Driver & Vehicle Licensing Agency</GovUKFooterLink>
              </GovUKFooterMetaCustom>
              
              <GovUKFooterLicenceLogo
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 483.2 195.7"
                height="17"
                width="41"
              >
                <path
                  fill="currentColor"
                  d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"
                />
              </GovUKFooterLicenceLogo>
              <GovUKFooterLicenceDescription>
                All content is available under the <GovUKFooterLink href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</GovUKFooterLink>, except where otherwise stated
              </GovUKFooterLicenceDescription>
            </GovUKFooterMetaItem>
            <GovUKFooterMetaItem>
              <GovUKFooterCopyrightLogo href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">
                © Crown copyright
              </GovUKFooterCopyrightLogo>
            </GovUKFooterMetaItem>
          </GovUKFooterMeta>
        </GovUKContainer>
      </GovUKFooter>
    </div>
  );
}

export default Home;