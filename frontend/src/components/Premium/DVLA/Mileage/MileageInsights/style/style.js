import { styled, css } from '@mui/material/styles';
import { 
  GovUKHeadingM,
  GovUKHeadingS, 
  GovUKBody, 
  GovUKBodyS, 
  GovUKList,
  PremiumInfoPanel,
  COLORS,
  SPACING,
  respondTo,
  commonFontStyles,
  printStyles
} from '../../../../../../styles/theme';

// Main container for mileage insights
export const MileageInsightsContainer = styled('div')(() => css`
  ${commonFontStyles}
  ${printStyles}
  color: ${COLORS.BLACK};
  margin-bottom: ${SPACING.L};

  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
  }
`);

// Header container with flex layout
export const MileageInsightsHeader = styled('div')(() => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
`);

// Premium badge for mileage insights
export const MileageBadge = styled('div')(() => css`
  ${commonFontStyles}
  display: inline-block;
  padding: ${SPACING.XS} ${SPACING.S};
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: 700;
  font-size: ${SPACING.XS};
  line-height: 1.1428571429;
  
  ${respondTo('MOBILE')} {
    font-size: ${SPACING.S};
    line-height: 1.25;
  }
`);

// Title for mileage insights
export const MileageInsightsTitle = styled(GovUKHeadingM)(() => css`
  margin: 0;
  ${commonFontStyles}
  font-weight: 700;
`);

// Description for mileage insights
export const MileageInsightsDescription = styled(GovUKBodyS)(() => css`
  margin-bottom: ${SPACING.XL};
  ${commonFontStyles}
  color: ${COLORS.DARK_GREY};
`);

// Enhanced panel styling with customizable left border
export const MileagePanel = styled(PremiumInfoPanel, {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => css`
  ${commonFontStyles}
  ${printStyles}
  color: ${COLORS.BLACK};
  border-left: 5px solid ${borderColor || COLORS.BLUE};
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  background-color: ${COLORS.LIGHT_GREY};

  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.XL};
  }

  &:before {
    content: none;
  }
`);

// Section container for each insight area
export const MileageInsightSection = styled('div')(() => css`
  margin-bottom: ${SPACING.XL};
`);

// Panel with customizable border color
export const MileageInsightPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => css`
  padding: ${SPACING.L};
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
  ${commonFontStyles}
  ${printStyles}
  display: flex;
  align-items: center;
  margin-bottom: ${SPACING.M};
  font-weight: 700;
  font-size: ${SPACING.S};
  line-height: 1.25;

  ${respondTo('MOBILE')} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-bottom: ${SPACING.L};
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }

  & svg {
    margin-right: ${SPACING.S};
    color: ${iconColor || COLORS.BLUE};
  }
`);

// Enhanced table for mileage data
export const MileageTable = styled('table')(() => css`
  ${commonFontStyles}
  ${printStyles}
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: ${SPACING.L};

  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
  }

  & th {
    font-weight: 700;
    padding: ${SPACING.S} ${SPACING.L} ${SPACING.S} 0;
    text-align: left;
    border-bottom: 1px solid ${COLORS.MID_GREY};
    font-size: ${SPACING.S};

    ${respondTo('MOBILE')} {
      font-size: 1.1875rem;
    }

    @media print {
      font-size: 14pt;
    }
  }

  & td {
    padding: ${SPACING.S} ${SPACING.L} ${SPACING.S} 0;
    border-bottom: 1px solid ${COLORS.MID_GREY};
    font-size: ${SPACING.S};

    ${respondTo('MOBILE')} {
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
  padding: ${SPACING.M};
  border: 2px solid ${
    riskCategory === 'Low' ? COLORS.GREEN : 
    riskCategory === 'Medium' ? COLORS.BLACK : 
    COLORS.RED
  };
  margin-bottom: ${SPACING.L};
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
    riskCategory === 'Medium' ? COLORS.BLACK : 
    COLORS.RED
  };
  color: ${COLORS.WHITE};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-right: ${SPACING.L};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  ${commonFontStyles}
`);

// Risk score text container
export const RiskScoreText = styled('div')(() => css`
  ${commonFontStyles}
`);

// Risk category text
export const RiskCategory = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'riskCategory',
})(({ riskCategory }) => css`
  margin-bottom: ${SPACING.XS};
  color: ${
    riskCategory === 'Low' ? COLORS.GREEN : 
    riskCategory === 'Medium' ? COLORS.BLACK : 
    COLORS.RED
  };
  ${commonFontStyles}
  font-weight: 700;
`);

// Risk description
export const RiskDescription = styled(GovUKBody)(() => css`
  margin-bottom: 0;
  ${commonFontStyles}
`);

// Factors section heading
export const FactorsHeading = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${commonFontStyles}
  ${printStyles}
  font-size: 1.1rem;
  margin-bottom: ${SPACING.S};
  color: ${color || COLORS.BLACK};
  border-bottom: 2px solid ${color || COLORS.BLACK};
  padding-bottom: ${SPACING.XS};
  font-weight: 700;
  display: flex;
  align-items: center;

  & svg {
    margin-right: ${SPACING.XS};
  }
`);

// Factors list
export const FactorsList = styled(GovUKList)(() => css`
  ${commonFontStyles}
  ${printStyles}
  list-style-type: none;
  padding-left: 0;
  margin-top: 0;
  margin-bottom: ${SPACING.L};
`);

// Individual factor item
export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'borderColor' && prop !== 'iconColor',
})(({ borderColor, iconColor }) => css`
  ${commonFontStyles}
  ${printStyles}
  display: flex;
  align-items: flex-start;
  margin-bottom: ${SPACING.XS};
  padding-left: ${SPACING.XS};
  border-left: 3px solid ${borderColor || COLORS.BLUE};
  font-size: ${SPACING.S};
  line-height: 1.25;

  ${respondTo('MOBILE')} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }

  & svg {
    margin-right: ${SPACING.S};
    margin-top: 2px;
    min-width: 20px;
    color: ${iconColor || borderColor || COLORS.BLUE};
  }
`);

// Enhanced value display with color
export const ValueDisplay = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => css`
  ${commonFontStyles}
  font-weight: bold;
  color: ${color || 'inherit'};
`);

// Footer note
export const FooterNote = styled(GovUKBodyS)(() => css`
  ${commonFontStyles}
  ${printStyles}
  text-align: center;
  color: ${COLORS.DARK_GREY};
  margin-top: ${SPACING.L};
  font-size: 0.875rem;
  
  ${respondTo('MOBILE')} {
    font-size: ${SPACING.S};
  }
`);

// Loading container
export const LoadingContainer = styled('div')(() => css`
  ${commonFontStyles}
  ${printStyles}
  text-align: center;
  padding: ${SPACING.XL} 0;
  margin: ${SPACING.L} 0;
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${COLORS.BLUE};
`);

// Error container
export const ErrorContainer = styled('div')(() => css`
  ${commonFontStyles}
  ${printStyles}
  padding: ${SPACING.L};
  background-color: rgba(212, 53, 28, 0.1);
  border-left: 5px solid ${COLORS.RED};
  margin-bottom: ${SPACING.L};
`);

// Empty state container
export const EmptyContainer = styled('div')(() => css`
  ${commonFontStyles}
  ${printStyles}
  padding: ${SPACING.L};
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${COLORS.DARK_GREY};
  margin-bottom: ${SPACING.L};
`);

// Section title and badge container
export const SectionTitleContainer = styled('div')(() => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SPACING.S};
`);