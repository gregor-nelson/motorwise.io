import React, { useState } from 'react';
import {
  MarketDashContainer,
  PageTitle,
  BodyText,
  BackLink,
  ErrorSummary,
  FormGroup,
  Label,
  HintText,
  ErrorMessage,
  Input,
  Button,
  GridContainer,
  GridColumn,
  SectionBreak,
} from './ResultsStyles';

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
    <MarketDashContainer>
      {searchPerformed ? (
        <>
          <BackLink href="#" onClick={(e) => {
            e.preventDefault();
            handleReset();
          }}>
            Search another vehicle
          </BackLink>
          
          {/* Replace the GovUKHeadingL with VehicleHeader component */}
          <VehicleHeader registration={searchedRegistration} />
          
          <MOTHistoryPage registration={searchedRegistration} />
        </>
      ) : (
        <>
          <PageTitle>
            Check MOT History
          </PageTitle>
          
          <BodyText>
            Find information about a vehicle's MOT test history, including test date, expiry date, test location, mileage, and any advisories or failures.
          </BodyText>
          
          <SectionBreak />
          
          {/* Error summary */}
          {error && (
            <ErrorSummary 
              aria-labelledby="error-summary-title" 
              role="alert" 
              tabIndex={-1}
            >
              <h2 id="error-summary-title">
                There is a problem
              </h2>
              <ul>
                <li>
                  <a href="#registration">{error}</a>
                </li>
              </ul>
            </ErrorSummary>
          )}
          
          {/* Form */}
          <GridContainer>
            <GridColumn>
              <form onSubmit={handleSearch}>
                <FormGroup error={!!error}>
                  <Label htmlFor="registration">
                    Vehicle registration number
                  </Label>
                  <HintText id="registration-hint">
                    For example, AB12 CDE
                  </HintText>
                  {error && (
                    <ErrorMessage id="registration-error">
                      {error}
                    </ErrorMessage>
                  )}
                  <Input
                    id="registration"
                    name="registration"
                    type="text"
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    aria-describedby={error ? "registration-error registration-hint" : "registration-hint"}
                    error={!!error}
                  />
                </FormGroup>
                
                <Button type="submit" variant="primary" size="large">
                  Check vehicle →
                </Button>
              </form>
            </GridColumn>
          </GridContainer>
        </>
      )}
    </MarketDashContainer>
  );
};

export default VehicleSearch;