import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { COLORS, commonFontStyles, BREAKPOINTS } from '../../styles/theme'; // Adjust import path as needed
import TechnicalSpecificationsPage from './TechnicalSpecificationsPage';
import RepairTimesPage from './LabourTimes';

// Styled components aligned with GOV.UK design
const StyledTabs = styled('div')`
  ${commonFontStyles}
  border-bottom: 1px solid ${COLORS.MID_GREY};
  margin-bottom: 20px;
`;

const StyledTabList = styled('div')`
  display: flex;
  width: 100%;
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
  }
`;

const StyledTab = styled('button')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  padding: 10px 15px;
  background: ${props => props.selected ? COLORS.LIGHT_GREY : 'transparent'};
  border: none;
  border-bottom: 4px solid ${props => props.selected ? COLORS.BLUE : 'transparent'};
  flex-grow: 1;
  text-align: center;
  cursor: pointer;
  color: ${COLORS.BLACK};
  text-transform: none;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    padding: 15px 20px;
  }
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    outline: 3px solid ${COLORS.YELLOW};
    outline-offset: 0;
    background-color: ${COLORS.YELLOW};
    box-shadow: 0 -2px ${COLORS.YELLOW}, 0 4px ${COLORS.BLACK};
    color: ${COLORS.BLACK};
  }
`;

const StyledTabPanel = styled('div')`
  padding-top: 20px;
  display: ${props => props.hidden ? 'none' : 'block'};
`;

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <StyledTabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {children}
    </StyledTabPanel>
  );
}

// Main component
const AutoDataSection = ({ vehicleData, loading, error }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  return (
    <StyledTabs>
      <StyledTabList>
        <StyledTab
          selected={tabValue === 0}
          onClick={() => handleTabChange(0)}
          aria-selected={tabValue === 0}
          role="tab"
          id="tab-0"
          aria-controls="tabpanel-0"
        >
          Technical Specifications
        </StyledTab>
        <StyledTab
          selected={tabValue === 1}
          onClick={() => handleTabChange(1)}
          aria-selected={tabValue === 1}
          role="tab"
          id="tab-1"
          aria-controls="tabpanel-1"
        >
          Repair Times
        </StyledTab>
      </StyledTabList>

      <TabPanel value={tabValue} index={0}>
        <TechnicalSpecificationsPage
          vehicleData={vehicleData}
          loading={loading}
          error={error}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <RepairTimesPage
          vehicleData={vehicleData}
          loading={loading}
          error={error}
        />
      </TabPanel>
    </StyledTabs>
  );
};

export default AutoDataSection;