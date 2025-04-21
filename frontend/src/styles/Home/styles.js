/**
 * HOME PAGE STYLES
 */

import { styled } from '@mui/material/styles';
import {
  // Design tokens
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,
  BREAKPOINTS,  
  buttonBase,
  buttonVariants,

  // Components
  GovUKContainer,
  GovUKSkipLink,
  GovUKMainWrapper,
  GovUKHeader,
  GovUKHeaderContainer,
  GovUKHeaderLink,
  GovUKHeaderServiceName,
  GovUKPhaseBanner,
  GovUKPhaseBannerTag,
  GovUKPhaseBannerText,
  GovUKFooter,
  GovUKFooterMeta,
  GovUKFooterInlineList,
  GovUKFooterLink,
  GovUKHeadingXL,
  GovUKHeadingL,
  GovUKHeadingM,
  GovUKBody,
  GovUKBodyS,
  GovUKList,
  GovUKListBullet,
  GovUKButton,
  GovUKInsetText,
  GovUKAccordion,
  GovUKAccordionSection,
  GovUKAccordionSectionButton,
  GovUKAccordionSectionContent,
  
  // Utils
  commonFontStyles,
  focusStyles,
  respondTo,
  linkStyles,
  typographyBase,
  formControlBase,
  standardSpacing,
  printStyles,
  linkHoverStyles
} from '../../styles/theme';

// Transition speeds for consistent component animations
export const TRANSITIONS = {
  FAST: '0.15s ease-out',    // Hover effects, small transforms
  MEDIUM: '0.3s ease-out',   // Accordions, visibility changes
  SLOW: '0.5s ease-out',     // Expanding panels, complex transitions
};

// Layout Components

// Main container wrapping the entire application
export const PageContainer = styled('div')`
  ${commonFontStyles}
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${COLORS.WHITE};
  color: ${COLORS.BLACK};
`;

// Accessibility skip link for keyboard users
export const SkipLink = styled(GovUKSkipLink)`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  
  &:focus {
    ${focusStyles}
    position: static;
    width: auto;
    height: auto;
    margin: inherit;
    overflow: visible;
    clip: auto;
    clip-path: none;
    white-space: inherit;
    padding: ${SPACING.S};
    background: ${COLORS.WHITE};
    text-decoration: none;
    color: ${COLORS.BLACK};
  }
`;

// Header Components

export const Header = styled(GovUKHeader)`
  border-bottom: 10px solid ${COLORS.BLUE};
  background-color: ${COLORS.BLACK};
  padding: ${SPACING.M} 0;
  color: ${COLORS.WHITE};
`;

export const HeaderContainer = styled(GovUKHeaderContainer)`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${SPACING.XL};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${respondTo('MOBILE')} {
    flex-direction: column;
    align-items: flex-start;
    padding: ${SPACING.S} ${SPACING.M};
  }
`;

export const ServiceName = styled(GovUKHeaderServiceName)`
  margin-right: ${SPACING.XL};
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.S};
  
  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 0.1578em;
  }
  
  &:focus {
    ${focusStyles}
    text-decoration: none;
  }
`;

export const HeaderNav = styled('nav')`
  display: flex;
  align-items: center;
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.S};
    align-self: flex-start;
  }
`;

export const HeaderLink = styled(GovUKHeaderLink)`
  margin-left: ${SPACING.XL};
  font-size: ${FONT_SIZES.S};
  font-weight: 400;
  color: ${COLORS.WHITE};
  text-decoration: none;
  transition: color ${TRANSITIONS.FAST};
  
  &:first-of-type {
    margin-left: 0;
  }
  
  &:hover {
    ${linkHoverStyles}
    color: ${COLORS.WHITE};
  }
  
  &:focus {
    ${focusStyles}
  }
  
  ${respondTo('MOBILE')} {
    margin-left: ${SPACING.M};
    
    &:first-of-type {
      margin-left: 0;
    }
  }
`;

// Phase Banner Components

export const PhaseBanner = styled(GovUKPhaseBanner)`
  border-bottom: 1px solid ${COLORS.MID_GREY};
  padding: ${SPACING.XS} 0;
`;

export const PhaseBannerContainer = styled(GovUKContainer)`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${SPACING.XL};
  display: flex;
  align-items: center;
`;

export const PhaseBannerTag = styled(GovUKPhaseBannerTag)`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  padding: ${SPACING.XS / 2} ${SPACING.XS};
  font-size: ${FONT_SIZES.XS};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const PhaseBannerText = styled(GovUKPhaseBannerText)`
  color: ${COLORS.BLACK};
  margin-left: ${SPACING.S};
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
`;

// Main Content Components

export const MainContent = styled(GovUKMainWrapper)`
  flex: 1;
  padding: ${SPACING.XXL} 0 ${SPACING.XXXL};
`;

export const Container = styled(GovUKContainer)`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${SPACING.XL};
`;

export const Section = styled('section')(({ background = COLORS.WHITE }) => ({
  backgroundColor: background,
  padding: `${SPACING.XXL} 0`,
  
  '&:first-of-type': {
    paddingTop: SPACING.L,
  },
  
  transition: `background-color ${TRANSITIONS.MEDIUM}`,
}));

// Footer Components

export const Footer = styled(GovUKFooter)`
  font-size: ${FONT_SIZES.S};
  padding: ${SPACING.XL} 0;
  border-top: 1px solid ${COLORS.MID_GREY};
  background-color: ${COLORS.LIGHT_GREY};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.XL} ${SPACING.M};
  }
`;

export const FooterContainer = styled(GovUKContainer)`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${SPACING.XL};
`;

export const FooterNav = styled('nav')`
  margin-bottom: ${SPACING.XL};
`;

export const FooterList = styled(GovUKFooterInlineList)`
  display: flex;
  flex-wrap: wrap;
  column-gap: ${SPACING.XL};
  row-gap: ${SPACING.M};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const FooterLink = styled(GovUKFooterLink)`
  ${linkStyles}
  color: ${COLORS.BLACK};
  transition: color ${TRANSITIONS.FAST};
  
  &:hover {
    color: ${COLORS.LINK_HOVER};
  }
  
  &:focus {
    ${focusStyles}
  }
  
  ${respondTo('MOBILE')} {
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const FooterMetadata = styled(GovUKFooterMeta)`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.L};
  color: ${COLORS.DARK_GREY};
  font-size: ${FONT_SIZES.XS};
  
  & img {
    display: inline-block;
    margin-right: ${SPACING.S};
    height: 20px;
    width: auto;
  }
`;

/**
 * Specialized footer links list for "Need assistance" section
 */
export const FooterLinkList = styled(GovUKList)`
  margin: ${SPACING.M} 0;
  padding: 0;
  list-style: none;
  
  ${respondTo('MOBILE')} {
    margin: ${SPACING.L} 0;
  }
`;

export const FooterLinkItem = styled('li')`
  margin-bottom: ${SPACING.M};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Typography Components

/**
 * Main page title (h1) - used at the top of each page
 */
export const PageTitle = styled(GovUKHeadingXL)`
  ${typographyBase}
  margin-top: ${SPACING.XL};
  margin-bottom: ${SPACING.XL};
  font-size: ${FONT_SIZES.XXXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.XXL};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
    font-size: ${FONT_SIZES.XXXXXL};
    line-height: ${LINE_HEIGHTS.XXL};
  }
  
  ${printStyles}
`;

/**
 * Section title (h2) with decorative underline
 * Used for main content sections
 */
export const SectionTitle = styled(GovUKHeadingL)`
  ${typographyBase}
  margin-top: ${SPACING.XXL};
  margin-bottom: ${SPACING.L};
  font-size: ${FONT_SIZES.XXXXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.XL};
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
  
  ${printStyles}
`;

/**
 * Sub-section title (h3) for content divisions
 */
export const SubSectionTitle = styled(GovUKHeadingM)`
  ${typographyBase}
  margin-top: ${SPACING.XL};
  margin-bottom: ${SPACING.L};
  font-size: ${FONT_SIZES.XXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.L};
  
  ${printStyles}
`;

// Standard paragraph with optimal reading width
export const Paragraph = styled(GovUKBody)`
  ${typographyBase}
  max-width: 66ch;
  margin-bottom: ${SPACING.M};
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
  
  ${printStyles}
`;

// Lead paragraph - larger text for introductions
export const Lead = styled(Paragraph)`
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.L};
  margin-bottom: ${SPACING.XL};
  max-width: 50ch;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.L};
  }
`;

// Paragraph without bottom margin
export const NoMarginParagraph = styled(Paragraph)`
  margin: 0;
`;

/**
 * Small note text - for supplementary information
 */
export const Note = styled(GovUKBodyS)`
  ${typographyBase}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  color: ${COLORS.DARK_GREY};
  margin-top: ${SPACING.S};
  
  ${printStyles}
`;

// Layout and Content Components

/**
 * Grid component with configurable columns and gap
 * Default is single column, automatically switches to 1 column on mobile
 * 
 * @param {string} columns - CSS grid-template-columns value (e.g. "1fr 1fr")
 * @param {string} gap - Spacing between grid items
 */
export const Grid = styled('div')(({ columns = "1fr", gap = SPACING.XL }) => ({
  display: 'grid',
  gridTemplateColumns: columns,
  gap,
  marginTop: SPACING.XL,
  
  [respondTo('MOBILE')]: {
    gridTemplateColumns: '1fr',
    gap: SPACING.L,
  },
}));

/**
 * Grid variant with configurable top margin
 * 
 * @param {string} marginTop - Custom margin top value
 */
export const MarginTopGrid = styled(Grid)(({ marginTop = SPACING.M }) => ({
  marginTop,
}));

/**
 * Card component with hover effects and configurable accent color
 * Used for featured content, summary boxes, etc.
 * 
 * @param {string} accent - Color for the top border accent
 */
export const Card = styled('div')(({ accent = COLORS.BLUE }) => ({
  backgroundColor: COLORS.WHITE,
  borderTop: `5px solid ${accent}`,
  padding: SPACING.L,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
  transition: `transform ${TRANSITIONS.FAST}, box-shadow ${TRANSITIONS.FAST}`,
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
  },
  
  '& h3': {
    marginTop: 0,
  },
}));

/**
 * Card variant with configurable top margin
 * 
 * @param {string} marginTop - Custom margin top value
 */
export const MarginTopCard = styled(Card)(({ marginTop = SPACING.M }) => ({
  marginTop,
}));

/**
 * Feature box for highlighting content
 * Similar to Card but with light grey background
 */
export const FeatureBox = styled('div')`
  padding: ${SPACING.L};
  background-color: ${COLORS.LIGHT_GREY};
  margin-bottom: ${SPACING.L};
  border-left: 4px solid ${COLORS.BLUE};
  transition: transform ${TRANSITIONS.FAST}, box-shadow ${TRANSITIONS.FAST};
  
  & h3 {
    margin-top: 0;
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.M};
    margin-bottom: ${SPACING.L};
  }
`;

/**
 * List with checkmark icons
 * Used for feature lists, benefits lists, etc.
 */
export const IconList = styled(GovUKListBullet)`
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
    margin: ${SPACING.M} 0;
    
    & li {
      font-size: ${FONT_SIZES.S};
      line-height: ${LINE_HEIGHTS.S};
    }
  }
  
  ${printStyles}
`;

// Button Components

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
  
  const variantStyles = buttonVariants[variant] || buttonVariants.primary;
  
  return {
    ...buttonBase,
    ...variantStyles,
    ...sizes[size],
    fontWeight: 700,
    borderRadius: 0,
    border: 'none',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    WebkitAppearance: 'none',
    marginBottom: SPACING.M,
    textAlign: 'center',
    position: 'relative',
    transition: `background-color ${TRANSITIONS.FAST}, transform ${TRANSITIONS.FAST}, box-shadow ${TRANSITIONS.FAST}`,
    
    '&:focus': {
      ...focusStyles,
      outline: '3px solid transparent',
    },
    
    '&:active': {
      transform: 'translateY(2px)',
      boxShadow: 'none',
    },
  };
});

/**
 * Full-width button variant
 * Useful for form submissions and major actions
 */
export const FullWidthButton = styled(Button)`
  width: 100%;
  margin-top: ${SPACING.M};
`;

// Search Components

/**
 * Panel container for search functionality
 * Features a subtle hover effect and consistent styling
 */
export const SearchPanel = styled('div')`
  background-color: ${COLORS.WHITE};
  padding: ${SPACING.L};
  margin-bottom: ${SPACING.XL};
  border-left: 5px solid ${COLORS.BLUE};
`;

/**
 * Search title component for search sections
 */
export const SearchTitle = styled(GovUKHeadingM)`
  ${typographyBase}
  margin-top: 0;
  margin-bottom: ${SPACING.M};
  font-size: ${FONT_SIZES.XXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.L};
  
  ${printStyles}
`;

/**
 * Search input field with GOV.UK styling
 * Includes consistent focus states and full-width layout
 */
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

// Notification and Alert Components

export const WarningText = styled(GovUKInsetText)`
  ${typographyBase}
  position: relative;
  padding: ${SPACING.M} ${SPACING.M} ${SPACING.M} 50px;
  margin: ${SPACING.XL} 0;
  background-color: #FFF8EB;
  border-left: 10px solid ${COLORS.YELLOW};
  
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
    margin: ${SPACING.L} 0;
  }
  
  ${printStyles}
`;

export const InfoBox = styled('div')`
  ${typographyBase}
  padding: ${SPACING.M} ${SPACING.M} ${SPACING.M} ${SPACING.L};
  background-color: ${COLORS.WHITE};
  margin-bottom: ${SPACING.XL};
  border-left: 5px solid ${({ variant }) => 
    variant === 'warning' ? COLORS.RED :
    variant === 'success' ? COLORS.GREEN :
    COLORS.BLUE
  };
  
  ${printStyles}
`;

/**
 * Success message container
 * Used for confirmation notifications
 */
export const SuccessMessage = styled('div')`
  ${typographyBase}
  padding: ${SPACING.M};
  border-left: 5px solid ${COLORS.GREEN};
  background-color: #f3f9f5; 
  margin-bottom: ${SPACING.L};
  
  ${printStyles}
`;

/**
 * Error alert container
 * Used for error notifications
 */
export const ErrorAlert = styled('div')`
  ${typographyBase}
  padding: ${SPACING.M};
  border-left: 5px solid ${COLORS.RED};
  background-color: #fbede9;
  margin-bottom: ${SPACING.L};
  
  ${printStyles}
`;

/**
 * Status indicator container
 * Used for system status notifications
 */
export const StatusContainer = styled('div')`
  ${typographyBase}
  padding: ${SPACING.S} ${SPACING.M};
  border-left: 5px solid ${COLORS.GREEN};
  background-color: #f3f9f5;
  margin-bottom: ${SPACING.M};
  font-weight: bold;
  
  ${printStyles}
`;

// Feature-Specific Components

// Step and Process Components

/**
 * Numbered circle for step indicators
 * Used in processes and instructions
 * 
 * @param {string} bgColor - Background color of the circle
 */
export const StepCircle = styled('div')(({ bgColor = COLORS.BLUE }) => ({
  backgroundColor: bgColor,
  color: COLORS.WHITE,
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 700,
  marginBottom: SPACING.S,
}));

/**
 * Container for step with number and content
 */
export const StepContainer = styled('div')`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${SPACING.L};
`;

/**
 * Content container for step instructions
 */
export const StepContent = styled('div')`
  margin-left: ${SPACING.M};
`;

// Zone and Category Components

/**
 * Container for zone information display
 * Used for Clean Air Zone info and similar category displays
 */
export const ZoneContainer = styled('div')`
  ${typographyBase}
  display: flex;
  align-items: center;
  background-color: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.S};
    flex-direction: column;
    align-items: flex-start;
  }
  
  ${printStyles}
`;

/**
 * Badge for zone or category identification
 */
export const ZoneBadge = styled('div')`
  ${typographyBase}
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${COLORS.BLUE};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${SPACING.M};
  color: ${COLORS.WHITE};
  font-weight: 700;
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.S};
  }
  
  ${printStyles}
`;

/**
 * Label text for zone or category
 */
export const ZoneLabel = styled('div')`
  ${typographyBase}
  font-weight: 500;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  
  ${printStyles}
`;

// Assessment Components

/**
 * Item container for assessment results or criteria
 */
export const AssessmentItem = styled('div')`
  ${typographyBase}
  margin-bottom: ${SPACING.M};
  padding: ${SPACING.M};
  background-color: ${COLORS.WHITE};
  border-left: 5px solid ${COLORS.BLUE};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.M};
    padding: ${SPACING.M};
  }
  
  ${printStyles}
`;

// FAQ Accordion Components

export const Accordion = styled(GovUKAccordion)`
  ${typographyBase}
  border: 1px solid ${COLORS.MID_GREY};
  margin-bottom: ${SPACING.XL};
  
  ${printStyles}
`;

export const AccordionItem = styled(GovUKAccordionSection)`
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.MID_GREY};
  }
`;

export const AccordionButton = styled(GovUKAccordionSectionButton)(({ isExpanded }) => ({
  width: '100%',
  border: 'none',
  backgroundColor: isExpanded ? COLORS.LIGHT_GREY : COLORS.WHITE,
  textAlign: 'left',
  padding: `${SPACING.M} ${SPACING.L}`,
  fontFamily: 'inherit',
  fontSize: FONT_SIZES.L,
  fontWeight: isExpanded ? 700 : 400,
  lineHeight: LINE_HEIGHTS.M,
  color: COLORS.BLACK,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  transition: `background-color ${TRANSITIONS.MEDIUM}, color ${TRANSITIONS.MEDIUM}`,
  
  '&:hover': {
    backgroundColor: COLORS.LIGHT_GREY,
  },
  
  '&:focus': {
    ...focusStyles,
    outline: '3px solid transparent',
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    right: SPACING.L,
    top: '50%',
    width: '10px',
    height: '10px',
    transform: `translateY(-75%) rotate(${isExpanded ? '-135deg' : '45deg'})`,
    transformOrigin: 'center',
    borderRight: `2px solid ${COLORS.BLACK}`,
    borderBottom: `2px solid ${COLORS.BLACK}`,
    transition: `transform ${TRANSITIONS.MEDIUM}`,
  },
}));

export const AccordionContent = styled(GovUKAccordionSectionContent)(({ isExpanded }) => ({
  padding: isExpanded ? `${SPACING.M} ${SPACING.L} ${SPACING.L} ${SPACING.L}` : 0,
  overflow: 'hidden',
  maxHeight: isExpanded ? '2000px' : 0, // Larger max-height to accommodate all content
  transition: `max-height ${TRANSITIONS.SLOW}, padding ${TRANSITIONS.MEDIUM}`,
  backgroundColor: COLORS.WHITE,
  borderTop: isExpanded ? `1px solid ${COLORS.MID_GREY}` : 'none',
  // Only animate these specific properties for performance
  willChange: 'max-height, padding',
}));

// Panel styling aligned with insights component
export const FAQPanel = styled('div')`
  ${typographyBase}
  background-color: ${COLORS.WHITE};
  padding: ${SPACING.L};
  margin-bottom: ${SPACING.XL};
  border-left: 5px solid ${COLORS.BLUE};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.M};
    margin-bottom: ${SPACING.L};
  }
  
  ${printStyles}
`;

// Enhanced section header
export const SectionHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${SPACING.M};
  }
`;

// Date stamp styling
export const DateStamp = styled('div')`
  ${typographyBase}
  padding: ${SPACING.XS} ${SPACING.S};
  background-color: ${COLORS.WHITE};
  border: 1px solid ${COLORS.MID_GREY};
  font-size: ${FONT_SIZES.S};
  
  ${printStyles}
`;

// Enhanced Accordion styling aligned with insights
export const EnhancedAccordion = styled(Accordion)`
  border: 1px solid ${COLORS.MID_GREY};
  margin-bottom: ${SPACING.L};
`;

// Enhanced Accordion Item
export const EnhancedAccordionItem = styled(AccordionItem)`
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.MID_GREY};
  }
`;

export const EnhancedAccordionButton = styled(AccordionButton)`
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    ${focusStyles}
    outline: 3px solid transparent;
  }
`;

// Enhanced Accordion Content
export const EnhancedAccordionContent = styled(AccordionContent)`
  padding: ${({ isExpanded }) => isExpanded ? `${SPACING.M} ${SPACING.L} ${SPACING.L} ${SPACING.L}` : 0};
  overflow: hidden;
  max-height: ${({ isExpanded }) => isExpanded ? '2000px' : 0};
  transition: max-height ${TRANSITIONS.SLOW}, padding ${TRANSITIONS.MEDIUM};
  background-color: ${COLORS.WHITE};
  border-top: ${({ isExpanded }) => isExpanded ? `1px solid ${COLORS.MID_GREY}` : 'none'};
`;

// Feedback section
export const FeedbackSection = styled('div')`
  ${typographyBase}
  margin-top: ${SPACING.XL};
  display: flex;
  align-items: center;
  border-top: 1px solid ${COLORS.LIGHT_GREY};
  padding-top: ${SPACING.M};
  
  ${printStyles}
`;

// Feedback prompt
export const FeedbackPrompt = styled('span')`
  ${typographyBase}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-right: ${SPACING.M};
  
  ${printStyles}
`;

// Category Header
export const CategoryHeader = styled(SubSectionTitle)`
  border-bottom: 1px solid ${COLORS.MID_GREY};
  padding-bottom: ${SPACING.S};
  margin-bottom: ${SPACING.L};
`;

// Search Results Header
export const SearchResultsHeader = styled(SubSectionTitle)`
  margin-bottom: ${SPACING.M};
`;

// Tab list container
export const TabList = styled('div')`
  display: flex;
  border-bottom: 1px solid ${COLORS.MID_GREY};
  margin-bottom: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

// Tab button
export const TabButton = styled('button')`
  ${typographyBase}
  padding: ${SPACING.M} ${SPACING.L};
  border: none;
  border-bottom: 4px solid ${({ isActive }) => isActive ? COLORS.BLUE : 'transparent'};
  background: none;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: ${({ isActive }) => isActive ? 'bold' : 'normal'};
  cursor: pointer;
  min-width: max-content;
  
  &:focus {
    ${focusStyles}
    outline: 3px solid transparent;
  }
  
  ${printStyles}
`;

// Form Components

/**
 * Form field container with consistent spacing
 */
export const FormField = styled('div')`
  ${standardSpacing}
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
  }
`;

/**
 * Form field label with consistent styling
 */
export const FormLabel = styled('label')`
  ${typographyBase}
  display: block;
  margin-bottom: ${SPACING.XS};
  font-weight: bold;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  
  ${printStyles}
`;

/**
 * Text input field with error state handling
 * 
 * @param {boolean} hasError - Whether the field has a validation error
 */
export const FormInput = styled('input')`
  ${formControlBase}
  width: 100%;
  padding: ${SPACING.S};
  border: 2px solid ${({ hasError }) => hasError ? COLORS.RED : COLORS.BLACK};
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  
  &:focus {
    outline: 3px solid ${COLORS.FOCUS};
    outline-offset: 0;
    box-shadow: inset 0 0 0 2px;
  }
`;

/**
 * Select dropdown with error state handling
 * 
 * @param {boolean} hasError - Whether the field has a validation error
 */
export const FormSelect = styled('select')`
  ${formControlBase}
  width: 100%;
  padding: ${SPACING.S};
  border: 2px solid ${({ hasError }) => hasError ? COLORS.RED : COLORS.BLACK};
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  background-color: ${COLORS.WHITE};
  
  &:focus {
    outline: 3px solid ${COLORS.FOCUS};
    outline-offset: 0;
    box-shadow: inset 0 0 0 2px;
  }
`;

/**
 * Textarea with error state handling
 * 
 * @param {boolean} hasError - Whether the field has a validation error
 */
export const FormTextarea = styled('textarea')`
  ${formControlBase}
  width: 100%;
  padding: ${SPACING.S};
  border: 2px solid ${({ hasError }) => hasError ? COLORS.RED : COLORS.BLACK};
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  resize: vertical;
  
  &:focus {
    outline: 3px solid ${COLORS.FOCUS};
    outline-offset: 0;
    box-shadow: inset 0 0 0 2px;
  }
`;

/**
 * Error message display for form validation
 */
export const ErrorMessage = styled('div')`
  ${typographyBase}
  color: ${COLORS.RED};
  font-weight: 700;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-top: ${SPACING.XS};
  margin-bottom: ${SPACING.M};
  
  ${printStyles}
`;

// Glossary Components

/**
 * Alphabetical section header for glossary
 */
export const GlossaryLetterHeader = styled('h3')`
  ${typographyBase}
  border-bottom: 2px solid ${COLORS.BLUE};
  padding-bottom: ${SPACING.XS};
  margin-bottom: ${SPACING.M};
  font-size: ${FONT_SIZES.XXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.L};
  
  ${printStyles}
`;

/**
 * Container for individual glossary term and definition
 */
export const GlossaryTermContainer = styled('div')`
  margin-bottom: ${SPACING.L};
  padding-bottom: ${SPACING.L};
  border-bottom: 1px solid ${COLORS.LIGHT_GREY};
`;

/**
 * Glossary term styling (dt element)
 */
export const GlossaryTerm = styled('dt')`
  ${typographyBase}
  margin: 0 0 ${SPACING.S} 0;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: bold;
  
  ${printStyles}
`;

/**
 * Glossary definition styling (dd element)
 */
export const GlossaryDefinition = styled('dd')`
  ${typographyBase}
  margin: 0;
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  
  ${printStyles}
`;

/**
 * A-Z navigation container for glossary pages
 */
export const AlphabetContainer = styled('div')`
  width: 100%;
  margin-bottom: ${SPACING.L};
  padding: ${SPACING.S};
  background-color: ${COLORS.LIGHT_GREY};
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${SPACING.XS};
`;

/**
 * Individual alphabet letter link
 * 
 * @param {boolean} active - Whether the letter is available/active
 */
export const AlphabetLink = styled('a')`
  ${typographyBase}
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${COLORS.MID_GREY};
  background-color: ${({ active }) => active ? COLORS.WHITE : COLORS.LIGHT_GREY};
  color: ${({ active }) => active ? COLORS.BLACK : COLORS.MID_GREY};
  text-decoration: none;
  font-weight: bold;
  pointer-events: ${({ active }) => active ? 'auto' : 'none'};
  
  &:focus {
    ${focusStyles}
    outline: 3px solid transparent;
  }
  
  ${printStyles}
`;