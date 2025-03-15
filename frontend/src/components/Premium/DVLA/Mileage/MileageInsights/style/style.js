import { styled, css } from '@mui/material/styles';
import { 
  GovUKHeadingM,
  GovUKHeadingS, 
  GovUKBody, 
  GovUKBodyS, 
  GovUKList,
  PremiumInfoPanel,
  COLORS,
} from '../../../../../../styles/theme';

// GOV.UK Breakpoints (converted to px for media queries)
const GOVUK_BREAKPOINTS = {
  MOBILE: '320px',
  TABLET: '641px',
  DESKTOP: '769px',
};


// Media query helpers
export const mobileMediaQuery = `@media (max-width: ${GOVUK_BREAKPOINTS.TABLET})`;
export const desktopMediaQuery = `@media (min-width: ${GOVUK_BREAKPOINTS.TABLET})`;

// Base font styles aligned with GOV.UK
export const govukFontStyles = css`
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: ${COLORS.TEXT};
  @media print {
    font-family: sans-serif;
    color: #000;
  }
`;

// Main container for mileage insights
export const MileageInsightsContainer = styled('div')(() => css`
  ${govukFontStyles}
  margin-bottom: 20px;

  ${desktopMediaQuery} {
    margin-bottom: 30px;
  }
`);

// Header container with flex layout
export const MileageInsightsHeader = styled('div')(() => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  ${desktopMediaQuery} {
    margin-bottom: 20px;
  }
`);

// Premium badge for mileage insights
export const MileageBadge = styled('div')(() => css`
  display: inline-block;
  padding: 5px 10px;
  background-color: ${COLORS.BLUE};
  color: #ffffff;
  font-family: "GDS Transport", arial, sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1.1428571429;
  
  ${desktopMediaQuery} {
    font-size: 1rem;
    line-height: 1.25;
  }
`);

// Title for mileage insights
export const MileageInsightsTitle = styled(GovUKHeadingM)(() => css`
  margin: 0;
  font-family: "GDS Transport", arial, sans-serif;
  font-weight: 700;
`);

// Description for mileage insights
export const MileageInsightsDescription = styled(GovUKBodyS)(() => css`
  margin-bottom: 25px;
  font-family: "GDS Transport", arial, sans-serif;
  color: ${COLORS.DARK_GREY};
`);

// Enhanced panel styling with customizable left border
export const MileagePanel = styled(PremiumInfoPanel, {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => css`
  ${govukFontStyles}
  border-left: 5px solid ${borderColor || COLORS.BLUE};
  padding: 15px;
  margin-bottom: 20px;
  background-color: ${COLORS.LIGHT_GREY};

  ${desktopMediaQuery} {
    padding: 20px;
    margin-bottom: 30px;
  }

  &:before {
    content: none;
  }
`);

// Section container for each insight area
export const MileageInsightSection = styled('div')(() => css`
  margin-bottom: 30px;
`);

// Panel with customizable border color
export const MileageInsightPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => css`
  padding: 20px;
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${borderColor || COLORS.BLUE};
  position: relative;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`);

// Section heading with optional icon
export const MileageSectionHeading = styled(GovUKHeadingS, {
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
    color: ${iconColor || COLORS.BLUE};
  }
`);

// Enhanced table for mileage data
export const MileageTable = styled('table')(() => css`
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
    border-bottom: 1px solid ${COLORS.GREY};
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
    border-bottom: 1px solid ${COLORS.GREY};
    font-size: 1rem;

    ${desktopMediaQuery} {
      font-size: 1.1875rem;
    }

    @media print {
      font-size: 14pt;
    }
  }
`);

// Risk score display component
export const RiskScoreDisplay = styled('div', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})(({ riskCategory }) => css`
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid ${
    riskCategory === 'Low' ? COLORS.GREEN : 
    riskCategory === 'Medium' ? COLORS.ORANGE : 
    COLORS.RED
  };
  margin-bottom: 20px;
  background-color: rgba(243, 242, 241, 0.5);
`);

// Circle for risk score
export const RiskScoreCircle = styled('div', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})(({ riskCategory }) => css`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${
    riskCategory === 'Low' ? COLORS.GREEN : 
    riskCategory === 'Medium' ? COLORS.ORANGE : 
    COLORS.RED
  };
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-right: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-family: "GDS Transport", arial, sans-serif;
`);

// Risk score text container
export const RiskScoreText = styled('div')(() => css`
  font-family: "GDS Transport", arial, sans-serif;
`);

// Risk category text
export const RiskCategory = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'riskCategory',
})(({ riskCategory }) => css`
  margin-bottom: 5px;
  color: ${
    riskCategory === 'Low' ? COLORS.GREEN : 
    riskCategory === 'Medium' ? COLORS.ORANGE : 
    COLORS.RED
  };
  font-family: "GDS Transport", arial, sans-serif;
  font-weight: 700;
`);

// Risk description
export const RiskDescription = styled(GovUKBody)(() => css`
  margin-bottom: 0;
  font-family: "GDS Transport", arial, sans-serif;
`);

// Factors section heading
export const FactorsHeading = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: ${color || COLORS.BLACK};
  border-bottom: 2px solid ${color || COLORS.BLACK};
  padding-bottom: 5px;
  font-weight: 700;
  display: flex;
  align-items: center;

  & svg {
    margin-right: 5px;
  }
`);

// Factors list
export const FactorsList = styled(GovUKList)(() => css`
  ${govukFontStyles}
  list-style-type: none;
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 20px;
`);

// Individual factor item
export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'borderColor' && prop !== 'iconColor',
})(({ borderColor, iconColor }) => css`
  ${govukFontStyles}
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid ${borderColor || COLORS.BLUE};
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
    color: ${iconColor || borderColor || COLORS.BLUE};
  }
`);

// Enhanced value display with color
export const ValueDisplay = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${govukFontStyles}
  font-weight: bold;
  color: ${color || 'inherit'};
`);

// Footer note
export const FooterNote = styled(GovUKBodyS)(() => css`
  ${govukFontStyles}
  text-align: center;
  color: ${COLORS.DARK_GREY};
  margin-top: 20px;
  font-size: 0.875rem;
  
  ${desktopMediaQuery} {
    font-size: 1rem;
  }
`);

// Loading container
export const LoadingContainer = styled('div')(() => css`
  ${govukFontStyles}
  text-align: center;
  padding: 30px 0;
  margin: 20px 0;
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${COLORS.BLUE};
`);

// Error container
export const ErrorContainer = styled('div')(() => css`
  ${govukFontStyles}
  padding: 20px;
  background-color: rgba(212, 53, 28, 0.1);
  border-left: 5px solid ${COLORS.RED};
  margin-bottom: 20px;
`);

// Empty state container
export const EmptyContainer = styled('div')(() => css`
  ${govukFontStyles}
  padding: 20px;
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${COLORS.DARK_GREY};
  margin-bottom: 20px;
`);

// Section title and badge container
export const SectionTitleContainer = styled('div')(() => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`);