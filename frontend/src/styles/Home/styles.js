/**
 * SHARED COMPONENT STYLES
 * Fully aligned with GOV.UK theme configuration
 */

import { styled } from '@mui/material/styles';
import {
  // Import all theme constants
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,

  
  // Import mixins
  commonFontStyles,
  focusStyles,
  linkHoverStyles,
  typographyBase,
  formControlBase,
  respondTo,
  printStyles,
  
  // Import base components
  GovUKContainer,
  GovUKHeadingXL,
  GovUKHeadingL,
  GovUKHeadingM,
  GovUKBody,
  GovUKButton,
  GovUKInsetText,
  
  // Import button variants
  buttonBase,
  buttonVariants,
} from '../../styles/theme';

// ======================================================
// Layout Components - Extending GOV.UK base components
// ======================================================

// Section wrapper with configurable background
export const Section = styled('section')(({ background = COLORS.WHITE }) => ({
  backgroundColor: background,
  padding: `${SPACING.RESPONSIVE_XXL.DESKTOP} 0`,
  
  '&:first-of-type': {
    paddingTop: SPACING.RESPONSIVE_L.DESKTOP,
  },
  
  [respondTo('MOBILE')]: {
    padding: `${SPACING.RESPONSIVE_XXL.MOBILE} 0`,
    
    '&:first-of-type': {
      paddingTop: SPACING.RESPONSIVE_L.MOBILE,
    },
  },
  
}));

// Container extending GOV.UK container with custom max-width
export const Container = styled(GovUKContainer)`
  max-width: 960px;
`;

// ======================================================
// Typography Components - Extending GOV.UK components
// ======================================================

// Page title extending GOV.UK XL heading
export const PageTitle = styled(GovUKHeadingXL)`
  margin-top: ${SPACING.RESPONSIVE_XL.DESKTOP};
  margin-bottom: ${SPACING.RESPONSIVE_XL.DESKTOP};
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.RESPONSIVE_XL.MOBILE};
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

// Section title extending GOV.UK L heading with decorative line
export const SectionTitle = styled(GovUKHeadingL)`
  position: relative;
  padding-bottom: ${SPACING.M};
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 5px;
    background-color: ${COLORS.BLUE};
  }
`;

// Sub-section title using GOV.UK M heading
export const SubSectionTitle = styled(GovUKHeadingM)``;

// Lead paragraph extending GOV.UK body with larger size
export const Lead = styled(GovUKBody)`
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.L};
  margin-bottom: ${SPACING.RESPONSIVE_XL.DESKTOP};
  max-width: 50ch;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

// Standard paragraph using GOV.UK body
export const Paragraph = styled(GovUKBody)`
  max-width: 66ch;
`;

// No margin paragraph variant
export const NoMarginParagraph = styled(Paragraph)`
  margin: 0;
`;

// ======================================================
// Grid Components
// ======================================================

export const Grid = styled('div')(({ columns = "1fr", gap = SPACING.RESPONSIVE_XL.DESKTOP }) => ({
  display: 'grid',
  gridTemplateColumns: columns,
  gap,
  marginTop: SPACING.RESPONSIVE_XL.DESKTOP,
  
  [respondTo('MOBILE')]: {
    gridTemplateColumns: '1fr',
    gap: SPACING.RESPONSIVE_XL.MOBILE,
    marginTop: SPACING.RESPONSIVE_XL.MOBILE,
  },
}));

// ======================================================
// Card Components
// ======================================================

export const Card = styled('div')(({ accent = COLORS.BLUE }) => ({
  backgroundColor: COLORS.WHITE,
  borderTop: `5px solid ${accent}`,
  padding: SPACING.RESPONSIVE_L.DESKTOP,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
  },
  
  '& h3, & h4': {
    marginTop: 0,
  },
  
  [respondTo('MOBILE')]: {
    padding: SPACING.RESPONSIVE_L.MOBILE,
  },
}));

// ======================================================
// Button Component - Using GOV.UK button base
// ======================================================

export const Button = styled(GovUKButton)(({ variant = 'primary', size = 'medium' }) => {
  const sizes = {
    small: {
      fontSize: FONT_SIZES.S,
      padding: `${SPACING.XS} ${SPACING.S}`,
    },
    medium: {
      fontSize: FONT_SIZES.L,
      padding: `${SPACING.S} ${SPACING.M}`,
    },
    large: {
      fontSize: FONT_SIZES.XXL,
      padding: `${SPACING.M} ${SPACING.XL}`,
    },
  };
  
  // Map custom variants to theme variants
  const variantMap = {
    primary: 'primary',
    success: 'primary', // Green is primary in GOV.UK
    secondary: 'secondary',
    warning: 'warning',
  };
  
  const themeVariant = buttonVariants[variantMap[variant]] || buttonVariants.primary;
  
  return {
    ...sizes[size],
    ...themeVariant,
    marginBottom: size === 'small' ? SPACING.S : SPACING.M,
    
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };
});

// ======================================================
// List Components
// ======================================================

export const IconList = styled('ul')`
  ${typographyBase}
  margin: ${SPACING.M} 0;
  padding: 0;
  list-style: none;
  
  & li {
    position: relative;
    padding-left: 25px;
    margin-bottom: ${SPACING.S};
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    
    &::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: ${COLORS.GREEN};
      font-weight: 700;
    }
  }
  
  ${respondTo('MOBILE')} {
    & li {
      font-size: ${FONT_SIZES.S};
      line-height: ${LINE_HEIGHTS.S};
    }
  }
`;

// ======================================================
// Alert Components - Using GOV.UK patterns
// ======================================================

export const WarningText = styled(GovUKInsetText)`
  position: relative;
  padding: ${SPACING.M} ${SPACING.M} ${SPACING.M} 50px;
  margin: ${SPACING.RESPONSIVE_XL.DESKTOP} 0;
  background-color: #FFF8EB;
  border-left-color: ${COLORS.YELLOW};
  
  &::before {
    content: "!";
    position: absolute;
    left: ${SPACING.M};
    top: 50%;
    transform: translateY(-50%);
    color: ${COLORS.RED};
    font-weight: 700;
    font-size: ${FONT_SIZES.XXL};
    width: 25px;
    height: 25px;
    text-align: center;
    line-height: ${LINE_HEIGHTS.L};
  }
  
  ${respondTo('MOBILE')} {
    margin: ${SPACING.RESPONSIVE_XL.MOBILE} 0;
  }
`;

export const InfoBox = styled(GovUKInsetText)`
  border-left-color: ${({ variant }) => 
    variant === 'warning' ? COLORS.RED :
    variant === 'success' ? COLORS.GREEN :
    COLORS.BLUE
  };
`;

export const SuccessMessage = styled('div')`
  ${typographyBase}
  padding: ${SPACING.M};
  border-left: 5px solid ${COLORS.GREEN};
  background-color: #f3f9f5;
  margin-bottom: ${SPACING.L};
`;

export const ErrorAlert = styled('div')`
  ${typographyBase}
  padding: ${SPACING.M};
  border-left: 5px solid ${COLORS.RED};
  background-color: #fbede9;
  margin-bottom: ${SPACING.L};
`;

export const StatusContainer = styled('div')`
  ${typographyBase}
  padding: ${SPACING.S} ${SPACING.M};
  border-left: 5px solid ${COLORS.GREEN};
  background-color: #f3f9f5;
  margin-bottom: ${SPACING.M};
  font-weight: 700;
`;

// ======================================================
// Panel Components
// ======================================================

export const Panel = styled('div')`
  ${typographyBase}
  background-color: ${COLORS.WHITE};
  padding: ${SPACING.RESPONSIVE_L.DESKTOP};
  margin-bottom: ${SPACING.RESPONSIVE_XL.DESKTOP};
  border-left: 5px solid ${COLORS.BLUE};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.RESPONSIVE_L.MOBILE};
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

export const SearchPanel = styled(Panel)``;
export const FAQPanel = styled(Panel)``;

// Search title using GOV.UK heading
export const SearchTitle = styled(GovUKHeadingM)`
  margin-top: 0;
  margin-bottom: ${SPACING.M};
`;

// Search input using GOV.UK form control base
export const SearchInput = styled('input')`
  ${formControlBase}
  width: 100%;
  padding: ${SPACING.S};
  border: 2px solid ${COLORS.BLACK};
  font-size: ${FONT_SIZES.L};
  
  &:focus {
    outline: 3px solid ${COLORS.FOCUS};
    outline-offset: 0;
    box-shadow: inset 0 0 0 2px;
  }
`;

// ======================================================
// Step Components
// ======================================================

export const StepContainer = styled('div')`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${SPACING.L};
  padding: ${SPACING.RESPONSIVE_L.DESKTOP};
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 4px solid ${COLORS.BLUE};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.RESPONSIVE_L.MOBILE};
  }
`;

export const StepCircle = styled('div')(({ bgColor = COLORS.BLUE }) => ({
  backgroundColor: bgColor,
  color: COLORS.WHITE,
  width: SPACING.XXXL,
  height: SPACING.XXXL,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 700,
  flexShrink: 0,
  fontSize: FONT_SIZES.L,
}));

export const StepContent = styled('div')`
  margin-left: ${SPACING.M};
`;

// ======================================================
// Accordion Components
// ======================================================

export const EnhancedAccordion = styled('div')`
  ${typographyBase}
  border: 1px solid ${COLORS.MID_GREY};
  margin-bottom: ${SPACING.L};
`;

export const EnhancedAccordionItem = styled('div')`
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.MID_GREY};
  }
`;

export const EnhancedAccordionButton = styled('button')(({ isExpanded }) => ({
  ...buttonBase,
  width: '100%',
  border: 'none',
  backgroundColor: isExpanded ? COLORS.LIGHT_GREY : COLORS.WHITE,
  textAlign: 'left',
  padding: `${SPACING.M} ${SPACING.L}`,
  fontSize: FONT_SIZES.L,
  fontWeight: isExpanded ? 700 : 400,
  color: COLORS.BLACK,
  cursor: 'pointer',
  position: 'relative',
  boxShadow: 'none',
  
  '&:hover': {
    backgroundColor: COLORS.LIGHT_GREY,
  },
  
  '&:focus': {
    ...focusStyles,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    right: SPACING.L,
    top: '50%',
    width: '10px',
    height: '10px',
    transform: `translateY(-75%) rotate(${isExpanded ? '-135deg' : '45deg'})`,
    borderRight: `2px solid ${COLORS.BLACK}`,
    borderBottom: `2px solid ${COLORS.BLACK}`,
  },
  
  // Override button base styles
  '&::before': {
    display: 'none',
  },
}));

export const EnhancedAccordionContent = styled('div')(({ isExpanded }) => ({
  display: 'grid',
  gridTemplateRows: isExpanded ? '1fr' : '0fr',
  overflow: 'hidden',
  backgroundColor: COLORS.WHITE,
  
  '& > div': {
    overflow: 'hidden',
    padding: isExpanded ? `${SPACING.M} ${SPACING.L} ${SPACING.L} ${SPACING.L}` : 0,
  },
  
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

// ======================================================
// Feedback Components
// ======================================================

export const FeedbackSection = styled('div')`
  ${typographyBase}
  margin-top: ${SPACING.RESPONSIVE_XL.DESKTOP};
  display: flex;
  align-items: center;
  gap: ${SPACING.M};
  border-top: 1px solid ${COLORS.LIGHT_GREY};
  padding-top: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

export const FeedbackPrompt = styled('span')`
  ${typographyBase}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
`;

// ======================================================
// Category Headers
// ======================================================

export const CategoryHeader = styled(SubSectionTitle)`
  border-bottom: 1px solid ${COLORS.MID_GREY};
  padding-bottom: ${SPACING.S};
  margin-bottom: ${SPACING.L};
`;

export const SearchResultsHeader = styled(SubSectionTitle)`
  margin-bottom: ${SPACING.M};
`;

// ======================================================
// Tab Components
// ======================================================

export const TabList = styled('div')`
  display: flex;
  border-bottom: 1px solid ${COLORS.MID_GREY};
  margin-bottom: ${SPACING.RESPONSIVE_XL.DESKTOP};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

export const TabButton = styled('button')`
  ${commonFontStyles}
  padding: ${SPACING.M} ${SPACING.L};
  border: none;
  border-bottom: 4px solid ${({ isActive }) => isActive ? COLORS.BLUE : 'transparent'};
  background: none;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: ${({ isActive }) => isActive ? 700 : 400};
  cursor: pointer;
  white-space: nowrap;
  color: ${COLORS.BLACK};
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    ${focusStyles}
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    padding: ${SPACING.S} ${SPACING.M};
  }
`;

// ======================================================
// Glossary Components
// ======================================================

export const GlossaryLetterHeader = styled('h3')`
  ${typographyBase}
  border-bottom: 2px solid ${COLORS.BLUE};
  padding-bottom: ${SPACING.XS};
  margin: ${SPACING.L} 0 ${SPACING.M} 0;
  font-size: ${FONT_SIZES.XXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.L};
`;

export const GlossaryTermContainer = styled('div')`
  margin-bottom: ${SPACING.L};
  padding-bottom: ${SPACING.L};
  border-bottom: 1px solid ${COLORS.LIGHT_GREY};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const GlossaryTerm = styled('dt')`
  ${typographyBase}
  margin: 0 0 ${SPACING.S} 0;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: 700;
`;

export const GlossaryDefinition = styled('dd')`
  ${typographyBase}
  margin: 0;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
`;

export const AlphabetContainer = styled('nav')`
  margin-bottom: ${SPACING.L};
  padding: ${SPACING.S};
  background-color: ${COLORS.LIGHT_GREY};
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${SPACING.XS};
`;

export const AlphabetLink = styled('a')`
  ${commonFontStyles}
  width: ${SPACING.XXXL};
  height: ${SPACING.XXXL};
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${COLORS.MID_GREY};
  background-color: ${({ active }) => active ? COLORS.WHITE : COLORS.LIGHT_GREY};
  color: ${({ active }) => active ? COLORS.BLACK : COLORS.MID_GREY};
  text-decoration: none;
  font-weight: 700;
  cursor: ${({ active }) => active ? 'pointer' : 'default'};
  
  &:hover {
    ${({ active }) => active && `
      ${linkHoverStyles}
      background-color: ${COLORS.LIGHT_GREY_HOVER};
    `}
  }
  
  &:focus {
    ${focusStyles}
  }
`;