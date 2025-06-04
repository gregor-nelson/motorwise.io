/**
 * SHARED HOME PAGE STYLES
 * Consistent styling system for all homepage components
 * Create this file at: styles/Home/sharedStyles.js
 */

import { styled } from '@mui/material/styles';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,
  GovUKContainer,
  respondTo,
  typographyBase,
} from '../theme';

// ======================================================
// CORE CONTAINERS
// ======================================================

/**
 * PageSectionContainer
 * Ensures consistent max-width and horizontal padding across all sections
 * Based on GovUKContainer but with standardized width for the site
 */
export const PageSectionContainer = styled(GovUKContainer)`
  max-width: 1020px;
  margin: 0 auto;
  padding-left: ${SPACING.XL};
  padding-right: ${SPACING.XL};
  
  ${respondTo('TABLET')} {
    padding-left: ${SPACING.XXL};
    padding-right: ${SPACING.XXL};
  }
  
  ${respondTo('MOBILE')} {
    padding-left: ${SPACING.M};
    padding-right: ${SPACING.M};
  }
`;

/**
 * HomePageSection
 * Consistent section wrapper with standardized vertical padding
 * Handles background colors and spacing between sections
 */
export const HomePageSection = styled('section')(({ 
  background = COLORS.WHITE, 
  noPaddingTop = false,
  noPaddingBottom = false,
  borderTop = false,
  borderBottom = false 
}) => ({
  backgroundColor: background,
  paddingTop: noPaddingTop ? 0 : SPACING.RESPONSIVE_XXL.DESKTOP,
  paddingBottom: noPaddingBottom ? 0 : SPACING.RESPONSIVE_XXL.DESKTOP,
  borderTop: borderTop ? `1px solid ${COLORS.MID_GREY}` : 'none',
  borderBottom: borderBottom ? `1px solid ${COLORS.MID_GREY}` : 'none',
  
  [respondTo('MOBILE')]: {
    paddingTop: noPaddingTop ? 0 : SPACING.RESPONSIVE_XXL.MOBILE,
    paddingBottom: noPaddingBottom ? 0 : SPACING.RESPONSIVE_XXL.MOBILE,
  },
}));

// ======================================================
// CONSISTENT SPACING COMPONENTS
// ======================================================

/**
 * SectionHeader
 * Consistent spacing for section headers
 */
export const SectionHeader = styled('div')`
  margin-bottom: ${SPACING.RESPONSIVE_XL.DESKTOP};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

/**
 * ContentBlock
 * Consistent spacing for content blocks within sections
 */
export const ContentBlock = styled('div')`
  margin-bottom: ${SPACING.RESPONSIVE_XL.DESKTOP};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

// ======================================================
// TYPOGRAPHY COMPONENTS WITH CONSISTENT SPACING
// ======================================================

/**
 * PageHeading
 * Main page heading with consistent spacing
 */
export const PageHeading = styled('h1')`
  ${typographyBase}
  font-size: ${FONT_SIZES.XXXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.XXL};
  margin: 0 0 ${SPACING.RESPONSIVE_XL.DESKTOP} 0;
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

/**
 * SectionHeading
 * Section heading with consistent spacing
 */
export const SectionHeading = styled('h2')`
  ${typographyBase}
  font-size: ${FONT_SIZES.XXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.L};
  margin: 0 0 ${SPACING.L} 0;
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
    margin-bottom: ${SPACING.XL};
  }
`;

/**
 * SubHeading
 * Sub-section heading with consistent spacing
 */
export const SubHeading = styled('h3')`
  ${typographyBase}
  font-size: ${FONT_SIZES.L};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.M};
  margin: 0 0 ${SPACING.M} 0;
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XL};
    line-height: ${LINE_HEIGHTS.L};
    margin-bottom: ${SPACING.L};
  }
`;

/**
 * LeadParagraph
 * Introductory paragraph with larger text
 */
export const LeadParagraph = styled('p')`
  ${typographyBase}
  font-size: ${FONT_SIZES.XL};
  line-height: ${LINE_HEIGHTS.L};
  margin: 0 0 ${SPACING.RESPONSIVE_XL.DESKTOP} 0;
  max-width: 66ch;
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.RESPONSIVE_XL.MOBILE};
  }
`;

/**
 * BodyText
 * Standard body text with consistent spacing
 */
export const BodyText = styled('p')`
  ${typographyBase}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin: 0 0 ${SPACING.L} 0;
  max-width: 66ch;
  color: ${COLORS.BLACK};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.XL};
  }
`;

// ======================================================
// CARD AND PANEL COMPONENTS
// ======================================================

/**
 * Card
 * Consistent card styling across the site
 */
export const Card = styled('div')(({ accent = COLORS.BLUE, interactive = false }) => ({
  backgroundColor: COLORS.WHITE,
  borderTop: `5px solid ${accent}`,
  padding: SPACING.RESPONSIVE_L.DESKTOP,
  marginBottom: SPACING.RESPONSIVE_XL.DESKTOP,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
  transition: interactive ? 'all 0.2s ease-out' : 'none',
  
  ...(interactive && {
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
    },
  }),
  
  '&:last-child': {
    marginBottom: 0,
  },
  
  [respondTo('MOBILE')]: {
    padding: SPACING.RESPONSIVE_L.MOBILE,
    marginBottom: SPACING.RESPONSIVE_XL.MOBILE,
  },
}));

/**
 * Panel
 * Consistent panel styling (lighter than cards)
 */
export const Panel = styled('div')(({ borderColor = COLORS.MID_GREY }) => ({
  backgroundColor: COLORS.WHITE,
  borderLeft: `5px solid ${borderColor}`,
  padding: SPACING.RESPONSIVE_L.DESKTOP,
  marginBottom: SPACING.RESPONSIVE_XL.DESKTOP,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
  
  '&:last-child': {
    marginBottom: 0,
  },
  
  [respondTo('MOBILE')]: {
    padding: SPACING.RESPONSIVE_L.MOBILE,
    marginBottom: SPACING.RESPONSIVE_XL.MOBILE,
  },
}));

/**
 * InfoPanel
 * Highlighted information panel
 */
export const InfoPanel = styled(Panel)`
  background-color: ${COLORS.LIGHT_GREY};
  border-left-color: ${COLORS.BLUE};
`;

// ======================================================
// GRID HELPERS
// ======================================================

/**
 * ResponsiveGrid
 * Consistent grid layout that stacks on mobile
 */
export const ResponsiveGrid = styled('div')(({ 
  columns = '1fr 1fr', 
  gap = SPACING.XL,
  mobileStack = true 
}) => ({
  display: 'grid',
  gridTemplateColumns: columns,
  gap: gap,
  
  [respondTo('MOBILE')]: {
    gridTemplateColumns: mobileStack ? '1fr' : columns,
    gap: SPACING.L,
  },
}));

// ======================================================
// UTILITY COMPONENTS
// ======================================================

/**
 * Divider
 * Consistent section divider
 */
export const Divider = styled('hr')`
  border: none;
  border-top: 1px solid ${COLORS.MID_GREY};
  margin: ${SPACING.RESPONSIVE_XL.DESKTOP} 0;
  
  ${respondTo('MOBILE')} {
    margin: ${SPACING.RESPONSIVE_XL.MOBILE} 0;
  }
`;

/**
 * ButtonGroup
 * Consistent button spacing
 */
export const ButtonGroup = styled('div')(({ align = 'left' }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: SPACING.M,
  justifyContent: align === 'center' ? 'center' : 
                 align === 'right' ? 'flex-end' : 'flex-start',
  marginTop: SPACING.RESPONSIVE_XL.DESKTOP,
  
  [respondTo('MOBILE')]: {
    marginTop: SPACING.RESPONSIVE_XL.MOBILE,
  },
}));

// ======================================================
// ANIMATION UTILITIES
// ======================================================

export const fadeIn = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const AnimatedContent = styled('div')`
  animation: fadeIn 0.3s ease-out;
  ${fadeIn}
`;

// ======================================================
// EXPORT ALL SPACING CONSTANTS FOR CONSISTENCY
// ======================================================

export const CONSISTENT_SPACING = {
  sectionPadding: SPACING.RESPONSIVE_XXL,
  containerPadding: {
    desktop: SPACING.XL,
    mobile: SPACING.M,
  },
  elementSpacing: {
    large: SPACING.RESPONSIVE_XL,
    medium: SPACING.L,
    small: SPACING.M,
  },
  maxContentWidth: '1020px',
  readableWidth: '66ch',
};