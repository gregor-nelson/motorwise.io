import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Import shared components and styles from site-wide theme
import {
  COLORS,
  BREAKPOINTS,
  commonFontStyles,
  focusStyles,
  GovUKList,
} from '../../../styles/theme'; // Adjust the import path as needed

// =========================================================
// Layout Components
// =========================================================

// Base container for repair times component
export const RepairTimesContainer = styled('div')`
  ${commonFontStyles}
  margin-bottom: 40px;
  
  /* Add page header styling */
  & > ${props => props.components?.AccordionHeader || 'button'}:first-of-type {
    padding: 30px 0;
    margin-bottom: 30px;
    border-bottom: 2px solid ${COLORS.BLACK};
    font-size: 1.5rem;
    
    & > span {
      color: ${COLORS.DARK_GREY};
      font-weight: 400;
      font-size: 1rem;
      background-color: ${COLORS.LIGHT_GREY};
      padding: 5px 10px;
      margin-left: 10px;
      border-radius: 3px;
    }
    
    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      padding: 20px 0;
      font-size: 1.375rem;
      margin-bottom: 20px;
    }
  }
`;

// =========================================================
// Long Label and Operation Components
// =========================================================

// Long Label Container with expansion functionality
export const LongLabelContainer = styled(Box)`
  ${commonFontStyles}
  position: relative;
  width: 100%;
  margin-bottom: 20px;
  padding-bottom: 5px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-bottom: 25px;
  }
`;

// First row container to hold the main operation text and toggle
export const OperationFirstRow = styled('div')`
  display: flex;
  align-items: flex-start;
  width: 100%;
  flex-direction: column;
  margin-bottom: ${props => props.expanded ? '15px' : '0'};
`;

// Main operation text
export const OperationMainText = styled('div')`
  flex: 1;
  padding-left: 10px;
  font-weight: 500;
`;

// Container for expanded content
export const ExpandedContent = styled('div')`
  padding-left: 40px;
  margin-top: 10px;
`;

// Special value highlight with theme colors
export const ValueHighlight = styled('span')`
  font-weight: 700;
  color: ${props => props.color || COLORS.BLUE};
  padding: 0 2px;
`;

// Toggle text
export const GovUKToggleText = styled('span')`
  margin-left: 5px;
  vertical-align: middle;
  font-weight: 400;
  font-size: 1rem;
`;

// Operations list with conditional separators
export const OperationsList = styled(GovUKList)`
  list-style-type: none;
  padding-left: 0;
  margin: 0 0 20px;

  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-bottom: 25px;
  }
  
  & li {
    padding-bottom: 12px;
    margin-bottom: 10px;
    position: relative;
    border-bottom: ${props => props.showSeparators ? `1px dotted ${COLORS.MID_GREY}` : 'none'};
    
    &:last-child {
      padding-bottom: 0;
      margin-bottom: 0;
      border-bottom: none;
    }
  }
`;

// =========================================================
// Table Components
// =======================================================



export const OperationsGroup = styled('div')`
  ${commonFontStyles}
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  margin: 0;
`;

// Individual operation item styling
export const OperationItem = styled('div')`
  ${commonFontStyles}
  padding: 8px 0;
  color: ${COLORS.BLACK};
  line-height: 1.5;
  
  /* Add separator between operations except the last one */
  &:not(:last-child) {
    border-bottom: 1px dotted ${COLORS.MID_GREY};
    padding-bottom: 12px;
    margin-bottom: 8px;
  }
  
  /* Make the first operation stand out slightly */
  &.first-operation {
    font-weight: 700;
  }
`;

// Improved GOV.UK style table with multi-operation support
export const SpecificationTable = styled('table')`
  ${commonFontStyles}
  width: 100%;
  max-width: 960px;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 40px;
  
  & th {
    width: 60%;
    font-weight: 700;
    padding: 20px 20px 20px 0;
    text-align: left;
    border-bottom: 1px solid ${COLORS.MID_GREY};
    color: ${COLORS.BLACK};
    vertical-align: top;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    
    /* Adjust padding for multi-operation cells */
    & ${OperationsGroup} {
      margin: -5px 0; /* Offset cell padding slightly for better spacing */
    }
    
    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      width: 100%;
      padding: 15px 10px 15px 0;
    }
  }

  & td {
    width: 40%;
    padding: 20px 20px 20px 0;
    border-bottom: 1px solid ${COLORS.MID_GREY};
    color: ${COLORS.BLACK};
    vertical-align: top;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-weight: 500;
    
    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      width: 100%;
      padding: 15px 10px 10px 0;
    }
  }
  
  // Enhanced table header/footer styling
  & thead th {
    border-bottom: 2px solid ${COLORS.BLACK};
    vertical-align: bottom;
  }
  
  & tr:first-of-type th, & tr:first-of-type td {
    border-top: 2px solid ${COLORS.BLACK};
  }

  & tr:last-of-type th, & tr:last-of-type td {
    border-bottom: 2px solid ${COLORS.BLACK};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    & tr {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
      border-bottom: 2px solid ${COLORS.BLACK};
    }
    
    & th, & td {
      border-bottom: 1px solid ${COLORS.MID_GREY};
    }
    
    & tr:last-child {
      margin-bottom: 0;
    }
  }
`;

// =========================================================
// Tab Components
// =========================================================

// Enhanced GOV.UK style Tabs
export const StyledTabs = styled(Tabs)`
  border-bottom: 2px solid ${COLORS.MID_GREY};
  margin-bottom: 30px;
  
  & .MuiTabs-indicator {
    background-color: ${COLORS.BLUE};
    height: 5px;
    border-radius: 0;
  }

  & .MuiTabs-flexContainer {
    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      flex-direction: column;
    }
  }
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    & .MuiTabs-scroller {
      overflow: visible !important;
    }
  }
`;

export const StyledTab = styled(Tab)`
  ${commonFontStyles}
  text-transform: none;
  font-weight: 700;
  font-size: 1.125rem;
  color: ${COLORS.BLACK};
  padding: 20px 25px;
  min-height: 70px;
  opacity: 1;
  transition: background-color 0.2s ease-in-out;

  &.Mui-selected {
    color: ${COLORS.BLACK};
    background-color: ${COLORS.WHITE};
    box-shadow: inset 0 -5px 0 0 ${COLORS.BLUE};
  }

  &:hover {
    color: ${COLORS.BLACK};
    background-color: ${COLORS.LIGHT_GREY};
    text-decoration: underline;
    text-decoration-thickness: 3px;
  }

  &:focus {
    ${focusStyles}
    z-index: 1;
  }
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
    border-bottom: 1px solid ${COLORS.MID_GREY};
    text-align: left;
    padding: 15px 20px;
    min-height: 60px;
  }
  
  & .MuiTab-iconWrapper {
    display: none;
  }
`;

// Keep original name to maintain compatibility with existing components
export const TabPanel = styled(Box)`
  padding: 40px 0;
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 30px 0;
  }
`;

// =========================================================
// Accordion Components
// =========================================================

export const AccordionSection = styled(Box)`
  ${commonFontStyles}
  border-bottom: 1px solid ${COLORS.MID_GREY};
  margin-bottom: 0;
  
  &:first-of-type {
    border-top: 1px solid ${COLORS.MID_GREY};
  }
`;

export const AccordionHeader = styled('button')`
  ${commonFontStyles}
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px 0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: ${COLORS.BLACK};
  font-weight: 700;
  font-size: 1.1875rem;
  line-height: 1.31579;
  position: relative;
  
  /* Improved styling for the title and badge */
  & > span:first-child {
    display: flex;
    align-items: center;
  }
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
    text-decoration: underline;
    text-decoration-thickness: 3px;
  }
  
  &:focus {
    ${focusStyles}
    z-index: 10;
  }
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 15px 0;
  }
`;
export const AccordionContent = styled(Box)`
  padding: 15px 0 30px 0;
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 10px 0 20px 0;
  }
`;

export const AccordionIconWrapper = styled('span')`
  display: inline-flex;
  align-items: center;
  margin-left: 15px;
  flex-shrink: 0;
`;

export const OperationCountBadge = styled('span')`
  ${commonFontStyles}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.LIGHT_GREY};
  border: 1px solid ${COLORS.MID_GREY};
  border-radius: 0; /* Change from 1rem to 0 to make it square */
  font-size: 0.875rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  min-width: 1.5rem;
  margin-left: 0.5rem; /* Adjust spacing */
  font-weight: 600; /* Make it slightly bolder */
  color: ${COLORS.DARK_GREY};
  position: relative;
  top: -1px; /* Slightly adjust vertical position */
`;


// GOV.UK style toggle container
export const GovUKToggleContainer = styled('button')`
  ${commonFontStyles}
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 10px 5px;
  border: 0;
  background-color: transparent;
  color: ${COLORS.BLUE};
  cursor: pointer;
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 400;
  z-index: 2;
  text-decoration: underline;
  text-underline-offset: 0.1em;
  text-decoration-thickness: max(1px, .0625rem);
  flex-shrink: 0;
  align-self: flex-start;
  
  &::-moz-focus-inner {
    padding: 0;
    border: 0;
  }
  
  &:hover {
    color: ${COLORS.BLACK};
    text-decoration-thickness: max(3px, .1875rem, .12em);
    background-color: ${COLORS.LIGHT_GREY};
    box-shadow: 0 -2px ${COLORS.LIGHT_GREY}, 0 4px ${COLORS.LIGHT_GREY};
    
    .govuk-accordion-nav__chevron {
      color: ${COLORS.BLACK};
      background: ${COLORS.BLACK};
      
      &::after {
        color: ${COLORS.LIGHT_GREY};
      }
    }
  }
  
  &:focus {
    ${focusStyles}
  }
  
  @media (min-width: 40.0625em) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

// GOV.UK style chevron
export const GovUKChevron = styled('span')`
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
  border: 0.1rem solid ${COLORS.BLACK};
  border-radius: 50%;
  vertical-align: middle;
  
  &::after {
    content: "";
    box-sizing: border-box;
    display: block;
    position: absolute;
    bottom: 0.375rem;
    left: 0.4375rem;
    width: 0.5rem;
    height: 0.5rem;
    transform: ${props => props.expanded ? 'rotate(135deg)' : 'rotate(-45deg)'};
    border-top: 0.18rem solid ${COLORS.BLACK};
    border-right: 0.18rem solid ${COLORS.BLACK};
  }
`;

// =========================================================
// Panels and Notes
// =========================================================

// Enhanced GOV.UK style warning panel
export const WarningPanel = styled('div')`
  ${commonFontStyles}
  border-left: 5px solid ${COLORS.RED};
  padding: 20px;
  margin-bottom: 30px;
  background-color: ${COLORS.LIGHT_GREY};
  display: flex;
  align-items: flex-start;
  
  & svg {
    margin-right: 15px;
    margin-top: 3px;
    flex-shrink: 0;
    color: ${COLORS.RED};
    font-size: 24px;
  }
  
  & h3 {
    font-size: 1.1875rem;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  & p {
    margin-bottom: 0;
  }
`;

// Enhanced summary panel in GOV.UK style
export const SummaryPanel = styled('div')`
  ${commonFontStyles}
  padding: 25px;
  margin-bottom: 30px;
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${COLORS.BLUE};
  
  & h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 20px;
  }
  
  & dl {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin: 0;
    
    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      grid-template-columns: 1fr;
    }
  }
  
  & dt {
    font-weight: 700;
    margin-bottom: 5px;
  }
  
  & dd {
    margin-left: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${COLORS.BLUE};
  }
`;

// GOV.UK style footer note
export const FooterNote = styled('div')`
  ${commonFontStyles}
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${COLORS.DARK_GREY};
  margin-top: 40px;
  padding: 20px;
  background-color: ${COLORS.LIGHT_GREY};
  border-top: 5px solid ${COLORS.BLUE};
  
  & svg {
    margin-right: 10px;
    color: ${COLORS.BLUE};
    vertical-align: middle;
  }
`;

// =========================================================
// Status Indicators
// =========================================================

// Styled Status Indicator
export const StatusIndicator = styled('span')`
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  color: ${props => {
    if (props.status === 'Low' || props.status === 'Compliant') return COLORS.GREEN;
    if (props.status === 'Medium') return COLORS.ORANGE; 
    if (props.status === 'High' || props.status === 'Non-Compliant') return COLORS.RED;
    return COLORS.BLACK;
  }};

  & svg {
    margin-right: 10px;
    font-size: 1.25rem;
  }
`;
