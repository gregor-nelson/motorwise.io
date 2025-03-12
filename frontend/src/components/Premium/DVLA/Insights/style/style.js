import { styled, css } from '@mui/material/styles';
import { 
  GovUKHeadingS, 
  GovUKBody, 
  GovUKBodyS, 
  PremiumInfoPanel,
  COLORS 
} from '../../../../../styles/theme';

// GOV.UK Breakpoints (converted to px for media queries, assuming 16px base)
const GOVUK_BREAKPOINTS = {
  MOBILE: '320px',   // 20rem
  TABLET: '641px',   // 40.0625rem
  DESKTOP: '769px',  // 48.0625rem
};

// GOV.UK Colors (aligned with provided CSS)
const GOVUK_COLORS = {
  ...COLORS,
  TEXT: '#0b0c0c',        // Standard text color
  LINK: '#1d70b8',        // Default link color
  LINK_VISITED: '#4c2c92', // Visited link color
  LINK_HOVER: '#003078',  // Hover link color
  GREY: '#b1b4b6',        // Border color
  DARK_GREY: '#505a5f',   // Secondary text
  LIGHT_GREY: '#f3f2f1',  // Background grey
  BLUE: '#1d70b8',        // Primary blue
  PURPLE: '#4c2c92',      // Visited link purple
  GREEN: '#00703c',       // Success green
  RED: '#d4351c',         // Error red
  YELLOW: '#fd0',         // Focus yellow
  ORANGE: '#f47738',      // Warning orange
  TURQUOISE: '#28a197',   // Teal for emissions
};

// Media query helpers
export const mobileMediaQuery = `@media (max-width: ${GOVUK_BREAKPOINTS.TABLET})`;
export const desktopMediaQuery = `@media (min-width: ${GOVUK_BREAKPOINTS.TABLET})`;

// Base font styles aligned with GOV.UK
export const govukFontStyles = css`
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: ${GOVUK_COLORS.TEXT};
  @media print {
    font-family: sans-serif;
    color: #000;
  }
`;

// GOV.UK focus styles
export const govukFocusStyles = css`
  outline: 3px solid transparent;
  color: ${GOVUK_COLORS.TEXT};
  background-color: ${GOVUK_COLORS.YELLOW};
  box-shadow: 0 -2px ${GOVUK_COLORS.YELLOW}, 0 4px ${GOVUK_COLORS.TEXT};
  text-decoration: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
`;

// Main container for all insights
export const InsightsContainer = styled('div')(() => css`
  ${govukFontStyles}
  margin-bottom: 20px;

  ${desktopMediaQuery} {
    margin-bottom: 30px;
  }
`);

// Enhanced panel styling with customizable left border color
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

  &:before {
    content: none; /* Removed pseudo-element as GOV.UK avoids this for borders */
  }
`);

// Panel types with predefined colors
export const OwnershipPanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.BLUE};
`);

export const StatusPanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.PURPLE}; /* Adjusted to match GOV.UK purple */
`);

export const EmissionsPanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.TURQUOISE};
`);

export const AgeValuePanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.ORANGE};
`);

export const FuelEfficiencyPanel = styled(InsightPanel)(() => css`
  border-left-color: ${GOVUK_COLORS.GREEN};
`);

// Enhanced headings for insights
export const InsightHeading = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => css`
  ${govukFontStyles}
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.25;

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-bottom: 20px;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }

  & svg {
    margin-right: 10px;
    color: ${iconColor || GOVUK_COLORS.BLUE};
  }
`);

// Body text with optional emphasis
export const InsightBody = styled(GovUKBody)(() => css`
  ${govukFontStyles}
  font-size: 1rem;
  line-height: 1.25;
  margin-bottom: 15px;

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-bottom: 20px;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }

  & strong {
    font-weight: 700;
  }
`);

// Enhanced table styling
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
    border-bottom: 1px solid ${GOVUK_COLORS.GREY};
    font-size: 1rem;

    ${desktopMediaQuery} {
      font-size: 1.1875rem;
    }

    @media print {
      font-size: 14pt;
    }
  }

  & td {
    padding: 10px 20px 10px 0;
    border-bottom: 1px solid ${GOVUK_COLORS.GREY};
    font-size: 1rem;

    ${desktopMediaQuery} {
      font-size: 1.1875rem;
    }

    @media print {
      font-size: 14pt;
    }

    &:first-of-type {
      font-weight: 700;
    }
  }

  & tr:nth-of-type(even) {
    background-color: transparent; /* GOV.UK tables don’t use zebra striping */
  }
`);

// Status indicators (Low, Medium, High risk)
export const StatusIndicator = styled('span', {
  shouldForwardProp: prop => prop !== 'status',
})(({ status }) => css`
  ${govukFontStyles}
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
  color: ${status === 'Low' ? GOVUK_COLORS.GREEN : 
          status === 'Medium' ? GOVUK_COLORS.ORANGE : 
          status === 'High' ? GOVUK_COLORS.RED : 
          GOVUK_COLORS.TEXT};

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
  }

  @media print {
    font-size: 14pt;
  }

  & svg {
    margin-right: 5px;
  }
`);

// Special value highlight
export const ValueHighlight = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-weight: 700;
  font-size: 1rem;
  color: ${color || GOVUK_COLORS.BLUE};

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
  }

  @media print {
    font-size: 14pt;
  }
`);

// Better list styling for factors
export const FactorList = styled('ul')(() => css`
  ${govukFontStyles}
  list-style-type: none;
  padding-left: 0;
  margin: 0 0 15px;

  ${desktopMediaQuery} {
    margin-bottom: 20px;
  }
`);

// Factor item with icon
export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => css`
  ${govukFontStyles}
  display: flex;
  align-items: flex-start;
  margin-bottom: 5px;
  font-size: 1rem;
  line-height: 1.25;

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }

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
  border-top: 1px solid ${GOVUK_COLORS.GREY};

  ${desktopMediaQuery} {
    margin-top: 20px;
    padding-top: 20px;
  }
`);

export const FactorsTitle = styled(GovUKBodyS, {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.25;
  color: ${color || GOVUK_COLORS.TEXT};
  margin-bottom: 10px;
  display: flex;
  align-items: center;

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }

  & svg {
    margin-right: 5px;
  }
`);

// Key metric display
export const MetricDisplay = styled('div', {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => css`
  ${govukFontStyles}
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  & svg {
    color: ${iconColor || GOVUK_COLORS.TEXT};
    margin-right: 8px;
  }
`);

export const MetricLabel = styled('span')(() => css`
  ${govukFontStyles}
  font-size: 1rem;
  line-height: 1.25;
  margin-right: 10px;

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }
`);

export const MetricValue = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.1111111111;
  color: ${color || GOVUK_COLORS.TEXT};

  ${desktopMediaQuery} {
    font-size: 1.5rem;
    line-height: 1.25;
  }

  @media print {
    font-size: 18pt;
    line-height: 1.15;
  }
`);

// Compliance badge
export const ComplianceBadge = styled('span', {
  shouldForwardProp: prop => prop !== 'status',
})(({ status }) => css`
  ${govukFontStyles}
  display: inline-block;
  padding: 5px 10px;
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1.1428571429;
  background-color: ${status === 'Compliant' ? GOVUK_COLORS.GREEN : GOVUK_COLORS.RED};
  color: ${GOVUK_COLORS.WHITE}; /* GOV.UK badges use white text */
  margin-left: 5px;

  ${desktopMediaQuery} {
    font-size: 1rem;
    line-height: 1.25;
  }

  @media print {
    font-size: 12pt;
    line-height: 1.2;
  }
`);

// Note section for additional information
export const InsightNote = styled(GovUKBodyS)(() => css`
  ${govukFontStyles}
  font-style: italic;
  font-size: 0.875rem;
  line-height: 1.1428571429;
  color: ${GOVUK_COLORS.DARK_GREY};
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid ${GOVUK_COLORS.GREY};

  ${desktopMediaQuery} {
    font-size: 1rem;
    line-height: 1.25;
  }

  @media print {
    font-size: 12pt;
    line-height: 1.2;
  }
`);

// Loading states
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

// Report Table
export const ReportTable = styled('table')(() => css`
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
    border-bottom: 1px solid ${GOVUK_COLORS.GREY};
    font-size: 1rem;

    ${desktopMediaQuery} {
      font-size: 1.1875rem;
    }

    @media print {
      font-size: 14pt;
    }
  }

  & td {
    padding: 10px 20px 10px 0;
    border-bottom: 1px solid ${GOVUK_COLORS.GREY};
    font-size: 1rem;

    ${desktopMediaQuery} {
      font-size: 1.1875rem;
    }

    @media print {
      font-size: 14pt;
    }
  }

  & tr:nth-of-type(even) {
    background-color: transparent; /* GOV.UK avoids zebra striping */
  }
`);

// MotHistoryItem
export const MotHistoryItem = styled('div', {
  shouldForwardProp: prop => prop !== 'result',
})(({ result }) => css`
  ${govukFontStyles}
  padding: 15px;
  margin-bottom: 15px;
  border-left: 5px solid ${result === 'PASS' ? GOVUK_COLORS.GREEN : GOVUK_COLORS.RED};
  background-color: ${GOVUK_COLORS.LIGHT_GREY};

  ${desktopMediaQuery} {
    padding: 20px;
    margin-bottom: 20px;
  }
`);

// Premium Feature List
export const PremiumFeatureList = styled('ul')(() => css`
  ${govukFontStyles}
  margin-top: 15px;
  list-style-type: none;
  padding-left: 15px;

  ${desktopMediaQuery} {
    margin-top: 20px;
  }

  & > li {
    position: relative;
    margin-bottom: 10px;
    padding-left: 15px;

    &:before {
      content: "•"; /* GOV.UK uses bullets, not checkmarks */
      position: absolute;
      left: 0;
      color: ${GOVUK_COLORS.TEXT};
    }
  }
`);