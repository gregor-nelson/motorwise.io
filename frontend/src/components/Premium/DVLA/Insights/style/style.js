import { styled, css } from '@mui/material/styles';
import {
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  PremiumInfoPanel,
  COLORS
} from '../../../../../styles/theme';

// Use the consistent GOV.UK colors from the main theme
const GOVUK_COLORS = COLORS;

// Media query helpers aligned with main theme
const mobileMediaQuery = `@media (max-width: 40.0625em)`;
const desktopMediaQuery = `@media (min-width: 40.0625em)`;

// Base font styles aligned with GOV.UK
const govukFontStyles = css`
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: ${GOVUK_COLORS.BLACK};
  
  @media print {
    font-family: sans-serif;
    color: #000;
  }
`;

// Main container for all insights - aligned with GovUKContainer
export const InsightsContainer = styled('div')(() => css`
  ${govukFontStyles}
  margin-bottom: 20px;

  ${desktopMediaQuery} {
    margin-bottom: 30px;
  }
`);

// Enhanced panel styling using PremiumInfoPanel from main theme
export const InsightPanel = styled(PremiumInfoPanel, {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => css`
  ${govukFontStyles}
  border-left: 5px solid ${borderColor || GOVUK_COLORS.BLUE};
  padding: 15px;
  margin-bottom: 20px;
  background-color: ${GOVUK_COLORS.LIGHT_GREY};

  ${desktopMediaQuery} {
    padding: 20px;
    margin-bottom: 30px;
  }
`);

// Panel types with theme color constants
export const OwnershipPanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.BLUE};
`);

export const StatusPanel = styled(InsightPanel)(() => css`
  border-left-color: #4c2c92; /* Purple from main theme */
`);

export const EmissionsPanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.TURQUOISE || '#28a197'};
`);

export const FuelEfficiencyPanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.GREEN};
`);

// Enhanced headings using GovUKHeadingS from main theme
export const InsightHeading = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => css`
  ${govukFontStyles}
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 700;

  & svg {
    margin-right: 10px;
    color: ${iconColor || GOVUK_COLORS.BLUE};
  }

  ${desktopMediaQuery} {
    margin-bottom: 20px;
  }
`);

// Body text with GovUKBody from main theme
export const InsightBody = styled(GovUKBody)(() => css`
  ${govukFontStyles}
  margin-bottom: 15px;

  ${desktopMediaQuery} {
    margin-bottom: 20px;
  }

  & strong {
    font-weight: 700;
  }
`);

// Enhanced table styling aligned with GOV.UK tables
export const InsightTable = styled('table')(() => css`
  ${govukFontStyles}
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 20px;

  ${desktopMediaQuery} {
    margin-bottom: 30px;
  }

  & th {
    font-weight: 700;
    padding: 10px 20px 10px 0;
    text-align: left;
    border-bottom: 1px solid ${GOVUK_COLORS.MID_GREY};
  }

  & td {
    padding: 10px 20px 10px 0;
    border-bottom: 1px solid ${GOVUK_COLORS.MID_GREY};

    &:first-of-type {
      font-weight: 700;
    }
  }

  & tr:nth-of-type(even) {
    background-color: transparent; /* GOV.UK tables don't use zebra striping */
  }
`);

// Status indicators using theme colors
export const StatusIndicator = styled('span', {
  shouldForwardProp: prop => prop !== 'status',
})(({ status }) => css`
  ${govukFontStyles}
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  color: ${status === 'Low' || status === 'Compliant' ? GOVUK_COLORS.GREEN : 
          status === 'Medium' ? GOVUK_COLORS.ORANGE : 
          status === 'High' || status === 'Non-Compliant' ? GOVUK_COLORS.RED : 
          GOVUK_COLORS.BLACK};

  & svg {
    margin-right: 5px;
  }
`);

// Special value highlight with theme colors
export const ValueHighlight = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-weight: 700;
  color: ${color || GOVUK_COLORS.BLUE};
`);

// Better list styling aligned with GOV.UK lists
export const FactorList = styled('ul')(() => css`
  ${govukFontStyles}
  list-style-type: none;
  padding-left: 0;
  margin: 0 0 15px;

  ${desktopMediaQuery} {
    margin-bottom: 20px;
  }
`);

// Factor item with icon using theme colors
export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => css`
  ${govukFontStyles}
  display: flex;
  align-items: flex-start;
  margin-bottom: 5px;

  & svg {
    margin-right: 10px;
    margin-top: 2px;
    min-width: 20px;
    color: ${iconColor || GOVUK_COLORS.DARK_GREY};
  }
`);

// Section for factors with title
export const FactorsSection = styled('div')(() => css`
  ${govukFontStyles}
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid ${GOVUK_COLORS.MID_GREY};

  ${desktopMediaQuery} {
    margin-top: 20px;
    padding-top: 20px;
  }
`);

// Factors title using GovUKBodyS
export const FactorsTitle = styled(GovUKBodyS, {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-weight: 700;
  color: ${color || GOVUK_COLORS.BLACK};
  margin-bottom: 10px;
  display: flex;
  align-items: center;

  & svg {
    margin-right: 5px;
  }
`);

// Key metric display with theme colors
export const MetricDisplay = styled('div', {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => css`
  ${govukFontStyles}
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  & svg {
    color: ${iconColor || GOVUK_COLORS.BLACK};
    margin-right: 8px;
  }
`);

// Metric label component
export const MetricLabel = styled('span')(() => css`
  ${govukFontStyles}
  margin-right: 10px;
`);

// Metric value with theme colors
export const MetricValue = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-weight: 700;
  color: ${color || GOVUK_COLORS.BLACK};
`);

// Note section using GovUKBodyS
export const InsightNote = styled(GovUKBodyS)(() => css`
  ${govukFontStyles}
  font-style: italic;
  color: ${GOVUK_COLORS.DARK_GREY};
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid ${GOVUK_COLORS.MID_GREY};
`);

// Loading states with GovUKLoadingSpinner integration
export const EnhancedLoadingContainer = styled('div')(() => css`
  ${govukFontStyles}
  text-align: center;
  padding: 20px;
  background-color: ${GOVUK_COLORS.LIGHT_GREY};
  margin: 15px 0;

  ${desktopMediaQuery} {
    padding: 30px;
    margin: 20px 0;
  }
`);

// Empty state container with theme styling
export const EmptyStateContainer = styled('div')(() => css`
  ${govukFontStyles}
  text-align: center;
  padding: 20px;
  background-color: ${GOVUK_COLORS.LIGHT_GREY};
  margin: 15px 0;

  ${desktopMediaQuery} {
    padding: 30px;
    margin: 20px 0;
  }
`);