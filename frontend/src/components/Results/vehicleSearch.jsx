import React, { useState } from 'react';
import { 
  GovUKContainer,
  GovUKMainWrapper,
  GovUKHeadingL,
  GovUKBody,
  GovUKBackLink,
  GovUKErrorSummary,
  GovUKErrorSummaryTitle,
  GovUKErrorSummaryBody,
  GovUKErrorSummaryList,
  GovUKFormGroup,
  GovUKLabel,
  GovUKHint,
  GovUKErrorMessage,
  GovUKInput,
  GovUKButton,
  GovUKButtonStartIcon,
  GovUKGridRow,
  GovUKGridColumnTwoThirds,
  GovUKSectionBreak
} from '../../styles/theme';

// Import the MOTHistoryPage and VehicleHeader components
import MOTHistoryPage from './MOTHistoryPage';
import VehicleHeader from '../Header/ResultsHeader';
const VehicleSearch = () => {
  const [registration, setRegistration] = useState('');
  const [searchedRegistration, setSearchedRegistration] = useState('');
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const validateRegistration = (reg) => {
    // Basic UK registration validation - can be expanded based on requirements
    const regPattern = /^[A-Z0-9]{2,7}$/i;
    
    if (!reg.trim()) {
      return 'Please enter a vehicle registration number';
    }
    
    if (!regPattern.test(reg.trim())) {
      return 'Enter a valid vehicle registration number';
    }
    
    return '';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Format registration: remove spaces and convert to uppercase
    const formattedReg = registration.trim().toUpperCase().replace(/\s+/g, '');
    
    // Validate registration
    const validationError = validateRegistration(formattedReg);
    
    if (validationError) {
      setError(validationError);
      // Set focus to the error summary for accessibility
      const errorSummary = document.querySelector('[role="alert"]');
      if (errorSummary) errorSummary.focus();
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Set the searched registration to trigger the API call in MOTHistoryPage
    setSearchedRegistration(formattedReg);
    setSearchPerformed(true);
  };

  const handleReset = () => {
    setRegistration('');
    setSearchedRegistration('');
    setError('');
    setSearchPerformed(false);
  };

  return (
    <GovUKMainWrapper>
      {searchPerformed ? (
        <>
          <GovUKBackLink href="#" onClick={(e) => {
            e.preventDefault();
            handleReset();
          }}>
            Search another vehicle
          </GovUKBackLink>
          
          {/* Replace the GovUKHeadingL with VehicleHeader component */}
          <VehicleHeader registration={searchedRegistration} />
          
          <MOTHistoryPage registration={searchedRegistration} />
        </>
      ) : (
        <>
          <GovUKHeadingL>
            Check MOT history
          </GovUKHeadingL>
          
          <GovUKBody>
            Find information about a vehicle's MOT test history, including test date, expiry date, test location, mileage, and any advisories or failures.
          </GovUKBody>
          
          <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
          
          {/* Error summary */}
          {error && (
            <GovUKErrorSummary 
              aria-labelledby="error-summary-title" 
              role="alert" 
              tabIndex={-1}
            >
              <GovUKErrorSummaryTitle id="error-summary-title">
                There is a problem
              </GovUKErrorSummaryTitle>
              <GovUKErrorSummaryBody>
                <GovUKErrorSummaryList>
                  <li>
                    <a href="#registration">{error}</a>
                  </li>
                </GovUKErrorSummaryList>
              </GovUKErrorSummaryBody>
            </GovUKErrorSummary>
          )}
          
          {/* Form */}
          <GovUKGridRow>
            <GovUKGridColumnTwoThirds>
              <form onSubmit={handleSearch}>
                <GovUKFormGroup className={error ? 'govuk-form-group--error' : ''}>
                  <GovUKLabel htmlFor="registration">
                    Vehicle registration number
                  </GovUKLabel>
                  <GovUKHint id="registration-hint">
                    For example, AB12 CDE
                  </GovUKHint>
                  {error && (
                    <GovUKErrorMessage id="registration-error">
                      {error}
                    </GovUKErrorMessage>
                  )}
                  <GovUKInput
                    id="registration"
                    name="registration"
                    type="text"
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    aria-describedby={error ? "registration-error registration-hint" : "registration-hint"}
                    className={error ? 'govuk-input--error' : ''}
                    error={error ? true : false}
                  />
                </GovUKFormGroup>
                
                <GovUKButton type="submit" className="govuk-button--start">
                  Check vehicle
                  <GovUKButtonStartIcon width="17.5" height="19">
                    <path d="M0 0 L17.5 9.5 L0 19 z" fill="currentColor" />
                  </GovUKButtonStartIcon>
                </GovUKButton>
              </form>
            </GovUKGridColumnTwoThirds>
          </GovUKGridRow>
        </>
      )}
    </GovUKMainWrapper>
  );
};

export default VehicleSearch;