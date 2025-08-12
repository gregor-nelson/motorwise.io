import { styled, css } from '@mui/material/styles';

// ======================================================
// Constants and Theme Configuration
// ======================================================

export const COLORS = {
  // Core Gray Scale - Ultra Clean Palette
  GRAY_900: '#0f172a',
  GRAY_800: '#1e293b',
  GRAY_700: '#334155',
  GRAY_600: '#475569',
  GRAY_500: '#64748b',
  GRAY_400: '#94a3b8',
  GRAY_300: '#cbd5e1',
  GRAY_200: '#e2e8f0',
  GRAY_100: '#f1f5f9',
  GRAY_50: '#f8fafc',
  WHITE: '#ffffff',
  
  // Legacy aliases for backward compatibility
  BLACK: '#0f172a',
  LIGHT_GREY: '#f1f5f9',
  MID_GREY: '#94a3b8',
  DARK_GREY: '#475569',
  
  // Brand Colors - Professional Financial Theme
  PRIMARY: '#3b82f6',
  PRIMARY_HOVER: '#2563eb',
  PRIMARY_LIGHT: '#dbeafe',
  
  // Legacy brand aliases
  BLUE: '#3b82f6',
  BLUE_HOVER: '#2563eb',
  BLUE_DARK: '#1d4ed8',
  INVERSE_BLUE_HOVER: '#dbeafe',
  INVERSE_BLUE_DARK: '#1d4ed8',
  
  // Semantic Colors - Financial Data
  POSITIVE: '#10b981',
  POSITIVE_LIGHT: '#d1fae5',
  NEGATIVE: '#ef4444',
  NEGATIVE_LIGHT: '#fee2e2',
  WARNING: '#f59e0b',
  WARNING_LIGHT: '#fef3c7',
  NEUTRAL: '#6b7280',
  NEUTRAL_LIGHT: '#f3f4f6',
  
  // Legacy semantic aliases
  GREEN: '#10b981',
  GREEN_HOVER: '#059669',
  GREEN_DARK: '#047857',
  RED: '#ef4444',
  RED_HOVER: '#dc2626',
  RED_DARK: '#b91c1c',
  YELLOW: '#f59e0b',
  PURPLE: '#8b5cf6',
  
  // Functional colors
  LINK_VISITED: '#8b5cf6',
  LINK_HOVER: '#2563eb',
  LINK_ACTIVE: '#0f172a',
  FOCUS: '#f59e0b',
  
  // Navigation-specific
  NAV_TOGGLE: '#3b82f6',
  
  // Button-specific shades
  LIGHT_GREY_HOVER: '#e2e8f0',
  MID_GREY_DARK: '#64748b',
  
  // Print-specific
  PRINT_TEXT: '#000000',
};

export const BREAKPOINTS = {
  MOBILE: '40em',      // 640px - Modern responsive system
  TABLET: '48em',      // 768px
  DESKTOP: '64em',     // 1024px
};

export const SPACING = {
  NONE: '0',
  XS: '0.25rem',     // 4px - Clean spacing scale
  S: '0.5rem',       // 8px
  M: '1rem',         // 16px
  L: '1.5rem',       // 24px
  XL: '2rem',        // 32px
  XXL: '3rem',       // 48px
  XXXL: '4rem',      // 64px
  RESPONSIVE_L: {
    MOBILE: '1rem',    // 16px
    DESKTOP: '1.5rem'  // 24px
  },
  RESPONSIVE_XL: {
    MOBILE: '1rem',    // 16px
    DESKTOP: '2rem'    // 32px
  },
  RESPONSIVE_XXL: {
    MOBILE: '1.5rem',  // 24px
    DESKTOP: '3rem'    // 48px
  },
  RESPONSIVE_XXXL: {
    MOBILE: '2rem',    // 32px
    DESKTOP: '4rem'    // 64px
  }
};

export const FONT_SIZES = {
  XS: '0.75rem',      // 12px - Modern typography scale
  S: '0.875rem',      // 14px
  M: '1rem',          // 16px
  L: '1.125rem',      // 18px
  XL: '1.25rem',      // 20px
  XXL: '1.5rem',      // 24px
  XXXL: '1.875rem',   // 30px
  XXXXL: '2.25rem',   // 36px
  XXXXXL: '3rem'      // 48px
};

export const LINE_HEIGHTS = {
  XS: 1,              // --leading-none
  S: 1.25,            // --leading-tight
  M: 1.375,           // --leading-snug
  L: 1.5,             // --leading-normal
  XL: 1.625,          // --leading-relaxed
  XXL: 2              // --leading-loose
};

// New Design System Tokens
export const FONT_FAMILIES = {
  MAIN: "'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  MONO: "'JetBrains Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace",
  DISPLAY: "'Jost', sans-serif",
};

export const SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  BASE: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const TRANSITIONS = {
  DEFAULT: 'all 0.2s ease',
  FAST: 'all 0.15s ease',
  SLOW: 'all 0.3s ease',
  SMOOTH: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
};

export const RADIUS = {
  NONE: '0',
  SM: '0.125rem',    // 2px
  BASE: '0.25rem',   // 4px
  MD: '0.375rem',    // 6px
  LG: '0.5rem',      // 8px
  XL: '0.75rem',     // 12px
  XXL: '1rem',       // 16px
  FULL: '9999px',
};

export const LETTER_SPACING = {
  TIGHTER: '-0.05em',
  TIGHT: '-0.025em',
  NORMAL: '0',
  WIDE: '0.025em',
  WIDER: '0.05em',
  WIDEST: '0.1em',
};

// ======================================================
// Mixins & Common Styles
// ======================================================

export const respondTo = (breakpoint) => `@media (min-width: ${BREAKPOINTS[breakpoint]})`;

export const commonFontStyles = css`
  font-family: ${FONT_FAMILIES.MAIN};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

export const printStyles = css`
  @media print {
    font-family: sans-serif;
    color: ${COLORS.PRINT_TEXT};
  }
`;

export const focusStyles = css`
  outline: 3px solid transparent;
  color: ${COLORS.BLACK};
  background-color: ${COLORS.FOCUS};
  box-shadow: 0 -2px ${COLORS.FOCUS}, 0 4px ${COLORS.BLACK};
  text-decoration: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
`;

export const linkHoverStyles = css`
  text-decoration-thickness: max(3px, .1875rem, .12em);
  -webkit-text-decoration-skip-ink: none;
  text-decoration-skip-ink: none;
  -webkit-text-decoration-skip: none;
  text-decoration-skip: none;
`;

export const linkStyles = css`
  ${commonFontStyles}
  text-decoration: underline;
  text-decoration-thickness: max(1px, .0625rem);
  text-underline-offset: .1578em;
  
  &:hover {
    ${linkHoverStyles}
  }
  
  &:focus {
    ${focusStyles}
  }
  
  &:link {
    color: ${COLORS.BLUE};
  }
  
  &:visited {
    color: ${COLORS.PURPLE};
  }
  
  &:hover {
    color: ${COLORS.LINK_HOVER};
  }
  
  &:active {
    color: ${COLORS.BLACK};
  }
  
  &:focus {
    color: ${COLORS.BLACK};
  }

  @media print {
    &[href^="/"]:after,
    &[href^="http://"]:after,
    &[href^="https://"]:after {
      content: " (" attr(href) ")";
      font-size: 90%;
      word-wrap: break-word;
    }
  }
`;

export const standardSpacing = css`
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
  }
`;

export const responsiveSpacing = (mobileSpacing, desktopSpacing) => css`
  margin-bottom: ${mobileSpacing};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${desktopSpacing};
  }
`;

export const typographyBase = css`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  display: block;
  margin-top: 0;
  ${printStyles}
`;

export const buttonBase = css`
  ${commonFontStyles}
  font-weight: 600;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  margin: 0;
  padding: ${SPACING.S} ${SPACING.M};
  border: 1px solid ${COLORS.GRAY_300};
  border-radius: ${RADIUS.SM};
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: ${TRANSITIONS.DEFAULT};
  -webkit-appearance: none;
  appearance: none;
  background: ${COLORS.WHITE};
  color: ${COLORS.GRAY_700};
  box-shadow: ${SHADOWS.SM};
  gap: ${SPACING.XS};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    padding: ${SPACING.S} ${SPACING.L};
    width: auto;
  }
  
  &:hover:not(:disabled) {
    background: ${COLORS.GRAY_50};
    border-color: ${COLORS.GRAY_400};
    box-shadow: ${SHADOWS.BASE};
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), ${SHADOWS.BASE};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${SHADOWS.SM};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      background: ${COLORS.WHITE};
      border-color: ${COLORS.GRAY_300};
      box-shadow: ${SHADOWS.SM};
      transform: none;
    }
  }
`;

export const buttonVariants = {
  primary: css`
    background: ${COLORS.PRIMARY};
    color: ${COLORS.WHITE};
    border-color: ${COLORS.PRIMARY};
    
    &:hover:not(:disabled) {
      background: ${COLORS.PRIMARY_HOVER};
      border-color: ${COLORS.PRIMARY_HOVER};
      color: ${COLORS.WHITE};
    }
    
    &:focus {
      border-color: ${COLORS.PRIMARY};
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), ${SHADOWS.BASE};
    }
  `,
  
  blue: css`
    background: ${COLORS.BLUE};
    color: ${COLORS.WHITE};
    border-color: ${COLORS.BLUE};
    
    &:hover:not(:disabled) {
      background: ${COLORS.BLUE_HOVER};
      border-color: ${COLORS.BLUE_HOVER};
      color: ${COLORS.WHITE};
    }
    
    &:focus {
      border-color: ${COLORS.BLUE};
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), ${SHADOWS.BASE};
    }
  `,
  
  secondary: css`
    background: ${COLORS.WHITE};
    color: ${COLORS.GRAY_700};
    border-color: ${COLORS.GRAY_300};
    
    &:hover:not(:disabled) {
      background: ${COLORS.GRAY_50};
      border-color: ${COLORS.GRAY_400};
      color: ${COLORS.GRAY_800};
    }
    
    &:focus {
      border-color: ${COLORS.GRAY_400};
      box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1), ${SHADOWS.BASE};
    }
  `,
  
  warning: css`
    background: ${COLORS.NEGATIVE};
    color: ${COLORS.WHITE};
    border-color: ${COLORS.NEGATIVE};
    
    &:hover:not(:disabled) {
      background: ${COLORS.RED_HOVER};
      border-color: ${COLORS.RED_HOVER};
      color: ${COLORS.WHITE};
    }
    
    &:focus {
      border-color: ${COLORS.NEGATIVE};
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2), ${SHADOWS.BASE};
    }
  `,
  
  positive: css`
    background: ${COLORS.POSITIVE};
    color: ${COLORS.WHITE};
    border-color: ${COLORS.POSITIVE};
    
    &:hover:not(:disabled) {
      background: ${COLORS.GREEN_HOVER};
      border-color: ${COLORS.GREEN_HOVER};
      color: ${COLORS.WHITE};
    }
    
    &:focus {
      border-color: ${COLORS.POSITIVE};
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2), ${SHADOWS.BASE};
    }
  `
};

export const formControlBase = css`
  ${commonFontStyles}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  margin: 0;
  padding: ${SPACING.S} ${SPACING.M};
  background: ${COLORS.WHITE};
  border: 1px solid ${COLORS.GRAY_300};
  border-radius: ${RADIUS.SM};
  color: ${COLORS.GRAY_700};
  transition: ${TRANSITIONS.DEFAULT};
  -webkit-appearance: none;
  appearance: none;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    padding: ${SPACING.S} ${SPACING.M};
  }

  &::placeholder {
    color: ${COLORS.GRAY_400};
  }

  &:hover:not(:disabled):not(:focus) {
    border-color: ${COLORS.GRAY_400};
    background: ${COLORS.GRAY_50};
  }

  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
    background: ${COLORS.WHITE};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: ${COLORS.GRAY_100};
    border-color: ${COLORS.GRAY_300};
    color: ${COLORS.GRAY_400};
    cursor: not-allowed;
  }

  &[aria-invalid="true"] {
    border-color: ${COLORS.NEGATIVE};
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
`;

// Modern Card/Container Base Styles
export const cardBase = css`
  background: ${COLORS.WHITE};
  border: 1px solid ${COLORS.GRAY_200};
  border-radius: ${RADIUS.SM};
  box-shadow: ${SHADOWS.SM};
  transition: ${TRANSITIONS.DEFAULT};
  overflow: hidden;
`;

export const cardHover = css`
  &:hover {
    box-shadow: ${SHADOWS.MD};
    transform: translateY(-2px);
  }
`;

export const sectionBase = css`
  padding: ${SPACING.XL};
  margin-bottom: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.L};
  }
  
  @media (max-width: 768px) {
    padding: ${SPACING.M};
    margin-bottom: ${SPACING.M};
  }
`;

export const gridBase = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${SPACING.M};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${SPACING.S};
  }
`;

export const flexBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${SPACING.M};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: ${SPACING.S};
  }
`;

export const selectBase = css`
  ${formControlBase}
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right ${SPACING.S} center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: calc(${SPACING.M} + 20px);
  
  &:hover {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  }
`;

// ======================================================
// Layout Components
// ======================================================

export const GovUKContainer = styled('div')`
  max-width: 1280px;
  margin-right: ${SPACING.M};
  margin-left: ${SPACING.M};
  
  @supports (margin: max(calc(0px))) {
    margin-right: max(${SPACING.M}, calc(${SPACING.M} + env(safe-area-inset-right)));
    margin-left: max(${SPACING.M}, calc(${SPACING.M} + env(safe-area-inset-left)));
  }
  
  ${respondTo('MOBILE')} {
    margin-right: ${SPACING.XL};
    margin-left: ${SPACING.XL};
    
    @supports (margin: max(calc(0px))) {
      margin-right: max(${SPACING.XL}, calc(${SPACING.M} + env(safe-area-inset-right)));
      margin-left: max(${SPACING.XL}, calc(${SPACING.M} + env(safe-area-inset-left)));
    }
  }
  
  @media (min-width: 1020px) {
    margin-right: auto;
    margin-left: auto;
    
    @supports (margin: max(calc(0px))) {
      margin-right: auto;
      margin-left: auto;
    }
  }
`;

export const GovUKMainWrapper = styled('main')`
  display: block;
  padding-top: ${SPACING.L};
  padding-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    padding-top: ${SPACING.XXL};
    padding-bottom: ${SPACING.XXL};
  }
  
  &.govuk-main-wrapper--auto-spacing:first-of-type,
  &.govuk-main-wrapper--l {
    padding-top: ${SPACING.XL};
    
    ${respondTo('MOBILE')} {
      padding-top: ${SPACING.XXXL};
    }
  }
`;

export const GovUKGridRow = styled('div')`
  margin-right: -${SPACING.M};
  margin-left: -${SPACING.M};
  
  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

// Consolidated Grid Column Component
const GridColumn = styled('div')`
  box-sizing: border-box;
  width: 100%;
  padding: 0 ${SPACING.M};

  ${respondTo('TABLET')} {
    float: left;
    width: ${props => props.width || '100%'};
  }
`;

// Preserve original exports for backward compatibility


export const GovUKGridColumnOneThird = styled(GridColumn)`
  ${respondTo('TABLET')} {
    width: 33.3333%;
  }
`;
export const GovUKGridColumnOneHalf = styled(GridColumn)`
  ${respondTo('TABLET')} {
    width: 50%;
  }
`;
export const GovUKGridColumnTwoThirds = styled(GridColumn)`
  ${respondTo('TABLET')} {
    width: 66.6667%;
  }
`;
export const GovUKGridColumnFull = styled(GridColumn)`
  ${respondTo('TABLET')} {
    width: 100%;
  }
`;

export const GovUKGridColumnResponsive = GridColumn;

// ======================================================
// Typography Components
// ======================================================

// Base Typography Component
const BaseTypography = styled('div')`
  ${typographyBase}
  font-weight: ${props => props.weight || 400};
  font-size: ${props => props.size || FONT_SIZES.S};
  line-height: ${props => props.lineHeight || LINE_HEIGHTS.S};
  margin-bottom: ${props => props.marginBottom || SPACING.M};
  color: ${props => props.color || COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${props => props.mobileSize || props.size || FONT_SIZES.L};
    line-height: ${props => props.mobileLineHeight || props.lineHeight || LINE_HEIGHTS.M};
    margin-bottom: ${props => props.mobileMarginBottom || props.marginBottom || SPACING.L};
  }
  
  @media print {
    font-size: ${props => props.printSize || '14pt'};
    line-height: ${props => props.printLineHeight || '1.15'};
  }
`;

// Heading components using BaseTypography
export const GovUKHeadingXL = styled(BaseTypography.withComponent('h1'))`
  color: ${props => props.motStatus === 'PASS' ? COLORS.GREEN : props.motStatus ? COLORS.RED : COLORS.BLACK};
  font-weight: 700;
  font-size: ${FONT_SIZES.XXXL};
  line-height: 1.09375;
  margin-bottom: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXXL};
    line-height: ${LINE_HEIGHTS.XXL};
    margin-bottom: ${SPACING.XXXL};
  }
  
  @media print {
    font-size: 32pt;
    line-height: 1.15;
  }
`;

export const GovUKHeadingL = styled('h2')`
  ${typographyBase}
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.L};
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
    margin-bottom: ${SPACING.XL};
  }
  
  @media print {
    font-size: 24pt;
    line-height: 1.05;
  }
`;

export const GovUKHeadingM = styled('h2')`
  ${typographyBase}
  font-weight: 700;
  font-size: ${FONT_SIZES.XL};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXL};
    line-height: ${LINE_HEIGHTS.L};
    margin-bottom: ${SPACING.L};
  }
  
  @media print {
    font-size: 18pt;
    line-height: 1.15;
  }
`;

export const GovUKHeadingS = styled('h2')`
  ${typographyBase}
  font-weight: 700;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.M};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.L};
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKCaptionM = styled('span')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  color: ${COLORS.DARK_GREY};
  margin-bottom: 5px;
  display: block;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;
export const GovUKBody = styled('p')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.L};
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

// REPLACE: GovUKBodyS
export const GovUKBodyS = styled('p')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
    margin-bottom: ${SPACING.L};
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKLink = styled('a')`
  ${linkStyles}
`;

const BaseList = styled('ul')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.L};
  }
  
  & .govuk-list {
    margin-top: ${SPACING.S};
  }
  
  & > li {
    margin-bottom: ${SPACING.XS};
  }
`;
export const GovUKList = BaseList;
export const GovUKListBullet = styled(BaseList)`
  padding-left: 20px;
  list-style-type: disc;
`;

export const GovUKListNumber = styled(BaseList)`
  padding-left: 20px;
  list-style-type: decimal;
`;
// ======================================================
// Section Break Component
// ======================================================

export const GovUKSectionBreak = styled('hr')`
  margin: 0;
  border: 0;
  
  &.govuk-section-break--visible {
    border-bottom: 1px solid ${COLORS.MID_GREY};
  }
  
  &.govuk-section-break--m {
    margin-top: ${SPACING.M};
    margin-bottom: ${SPACING.M};
    
    ${respondTo('MOBILE')} {
      margin-top: ${SPACING.L};
      margin-bottom: ${SPACING.L};
    }
  }

  &.govuk-section-break--l {
    margin-top: ${SPACING.L};
    margin-bottom: ${SPACING.L};
    
    ${respondTo('MOBILE')} {
      margin-top: ${SPACING.XL};
      margin-bottom: ${SPACING.XL};
    }
  }
`;

// ======================================================
// Form Components
// ======================================================

export const GovUKFormGroup = styled('div')`
  ${standardSpacing}
  
  &::after {
    content: "";
    display: block;
    clear: both;
  }
  
  & .govuk-form-group:last-of-type {
    margin-bottom: 0;
  }
  
  &.govuk-form-group--error {
    padding-left: ${SPACING.M};
    border-left: 5px solid ${COLORS.RED};
  }
`;

export const GovUKHint = styled('div')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.M};
  color: ${COLORS.DARK_GREY};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const GovUKLabel = styled('label')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.XS};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const GovUKInput = styled('input')`
  ${formControlBase}
  border-color: ${props => props.error ? COLORS.RED : COLORS.BLACK};
  -webkit-appearance: none;
  appearance: none;
  
  &.govuk-input--error {
    border-color: ${COLORS.RED};
  }
`;

export const GovUKErrorMessage = styled('span')`
  ${typographyBase}
  font-weight: 700;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.M};
  color: ${COLORS.RED};
  clear: both;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

// Base Button Component
export const BaseButton = styled('button', {
  shouldForwardProp: (prop) => !['variant', 'noMargin'].includes(prop)
})`
  ${buttonBase}
  ${props => props.variant ? buttonVariants[props.variant] : buttonVariants.primary}
  margin-bottom: ${props => props.noMargin ? '0' : '22px'};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${props => props.noMargin ? '0' : '32px'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: ${props => {
        if (props.variant === 'secondary') return COLORS.LIGHT_GREY;
        if (props.variant === 'warning') return COLORS.RED;
        if (props.variant === 'blue') return COLORS.BLUE;
        return COLORS.GREEN;
      }};
    }
  }
`;

export const GovUKButton = styled(BaseButton)`
  &.govuk-button--start {
    font-weight: 700;
    font-size: ${FONT_SIZES.M};
    line-height: 1;
    display: inline-flex;
    min-height: auto;
    justify-content: center;
    
    ${respondTo('MOBILE')} {
      font-size: ${FONT_SIZES.XXL};
      line-height: 1;
    }
  }

  &.govuk-button--secondary {
    ${buttonVariants.secondary}
  }

  &.govuk-button--warning {
    ${buttonVariants.warning}
  }

  &:active {
    top: 2px;
    box-shadow: none;
  }
`;

export const GovUKButtonStartIcon = styled('svg')`
  margin-left: ${SPACING.XS};
  vertical-align: middle;
  flex-shrink: 0;
  align-self: center;
  forced-color-adjust: auto;
  
  ${respondTo('TABLET')} {
    margin-left: ${SPACING.S};
  }
`;

// ======================================================
// Navigation Components
// ======================================================

export const GovUKBackLink = styled('a')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  text-decoration: underline;
  text-decoration-thickness: max(1px, .0625rem);
  text-underline-offset: .1578em;
  display: inline-block;
  position: relative;
  margin-top: ${SPACING.M};
  margin-bottom: ${SPACING.M};
  padding-left: 14px;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
  }
  
  &:link, &:visited {
    color: ${COLORS.BLACK};
  }
  
  &:hover {
    color: rgba(11, 12, 12, 0.99);
  }
  
  &:active, &:focus {
    color: ${COLORS.BLACK};
  }
  
  &::before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 0.4375em;
    height: 0.4375em;
    margin: auto 0;
    transform: rotate(225deg);
    border: solid;
    border-width: 1px 1px 0 0;
    border-color: ${COLORS.DARK_GREY};
  }
  
  &:focus::before {
    border-color: ${COLORS.BLACK};
  }

  &::after {
    content: "";
    position: absolute;
    top: -14px;
    right: 0;
    bottom: -14px;
    left: 0;
  }
`;

// ======================================================
// Details Component
// ======================================================

export const GovUKDetails = styled('details')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  ${standardSpacing}
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const GovUKDetailsSummary = styled('summary')`
  display: block;
  position: relative;
  padding-left: 25px;
  color: ${COLORS.BLUE};
  cursor: pointer;
  
  &:focus {
    ${focusStyles}
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-color: transparent;
    -webkit-clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
    clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
    border-width: 7px 0 7px 12.124px;
    border-left-color: ${COLORS.BLUE};
  }
`;

export const GovUKDetailsText = styled('div')`
  padding: ${SPACING.M};
  padding-left: ${SPACING.L};
  border-left: 5px solid ${COLORS.MID_GREY};
  margin-top: ${SPACING.XS};
  
  & > p {
    margin-top: 0;
    margin-bottom: ${SPACING.L};
  }
  
  & > :last-child {
    margin-bottom: 0;
  }
`;

// ======================================================
// Error Summary Component
// ======================================================

export const GovUKErrorSummary = styled('div')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.XL};
  border: 5px solid ${COLORS.RED};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.XXXL};
  }

  &:focus {
    outline: 3px solid ${COLORS.FOCUS};
  }
`;

export const GovUKErrorSummaryTitle = styled(GovUKHeadingS)`
  font-size: ${FONT_SIZES.M};
  line-height: ${LINE_HEIGHTS.XL};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXL};
    line-height: ${LINE_HEIGHTS.S};
    margin-bottom: ${SPACING.L};
  }
`;

export const GovUKErrorSummaryBody = styled('div')`
  & p {
    margin-bottom: 0;
  }
`;

export const GovUKErrorSummaryList = styled('ul')`
  margin-bottom: 0;
  padding-left: 0;
  list-style: none;
  
  & li:last-child {
    margin-bottom: 0;
  }
  
  & a {
    font-weight: 700;
    ${linkStyles}
    
    &:link, &:visited {
      color: ${COLORS.RED};
    }
    
    &:hover {
      color: #942514;
    }
    
    &:focus {
      color: ${COLORS.BLACK};
    }
  }
`;

// ======================================================
// Inset Text Component
// ======================================================

export const GovUKInsetText = styled('div')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  padding: ${SPACING.M};
  margin-top: ${SPACING.L};
  margin-bottom: ${SPACING.L};
  clear: both;
  border-left: 10px solid ${COLORS.MID_GREY};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-top: ${SPACING.XL};
    margin-bottom: ${SPACING.XL};
  }

  & > :first-of-type {
    margin-top: 0;
  }

  & > :last-child {
    margin-bottom: 0;
  }
`;

// ======================================================
// Header Components
// ======================================================

export const GovUKSkipLink = styled('a')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  display: block;
  padding: ${SPACING.S} ${SPACING.M};
  
  &:not(:active):not(:focus) {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    clip: rect(0 0 0 0) !important;
    -webkit-clip-path: inset(50%) !important;
    clip-path: inset(50%) !important;
    border: 0 !important;
    white-space: nowrap !important;
  }
  
  &:focus {
    outline: 3px solid ${COLORS.FOCUS};
    outline-offset: 0;
    background-color: ${COLORS.FOCUS};
    position: static !important;
    width: auto !important;
    height: auto !important;
    margin: inherit !important;
    overflow: visible !important;
    clip: auto !important;
    -webkit-clip-path: none !important;
    clip-path: none !important;
    white-space: inherit !important;
  }
`;

export const GovUKHeader = styled('header')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: ${FONT_SIZES.XS};
  line-height: 1;
  border-bottom: 5px solid ${COLORS.WHITE};
  color: ${COLORS.WHITE};
  background: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: 1;
  }
`;

export const GovUKHeaderContainer = styled('div')`
  position: relative;
  margin-bottom: -10px;
  padding-top: 10px;
  border-bottom: 5px solid ${COLORS.BLUE};
  
  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

export const GovUKHeaderLogo = styled('div')`
  margin-bottom: ${SPACING.S};
  padding-right: 80px;
  
  ${respondTo('TABLET')} {
    width: 33.33%;
    padding-right: ${SPACING.M};
    float: left;
    vertical-align: top;
  }
`;

export const GovUKHeaderContent = styled('div')`
  ${respondTo('TABLET')} {
    width: 66.66%;
    padding-left: ${SPACING.M};
    float: left;
  }
`;

export const GovUKHeaderLink = styled('a')`
  ${commonFontStyles}
  text-decoration: none;
  
  &:link, &:visited {
    color: ${COLORS.WHITE};
  }
  
  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 0.1578em;
  }
  
  &:focus {
    ${focusStyles}
    text-decoration: none;
  }
  
  ${props => props.isHomepage && css`
    display: inline-block;
    margin-right: ${SPACING.S};
    font-size: 30px;
    
    &:link, &:visited {
      text-decoration: none;
    }
    
    &:hover, &:active {
      margin-bottom: -3px;
      border-bottom: 3px solid;
    }
    
    ${respondTo('TABLET')} {
      display: inline;
    }
  `}
`;

export const GovUKHeaderServiceName = styled('a')`
  ${commonFontStyles}
  display: inline-block;
  margin-bottom: ${SPACING.S};
  font-size: ${FONT_SIZES.M};
  line-height: ${LINE_HEIGHTS.XL};
  font-weight: 700;
  
  &:link, &:visited {
    color: ${COLORS.WHITE};
  }
  
  &:focus {
    ${focusStyles}
    text-decoration: none;
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXL};
    line-height: ${LINE_HEIGHTS.S};
  }
`;

export const GovUKHeaderLogotype = styled('span')`
  display: inline-flex;
  align-items: center;
`;

export const GovUKHeaderLogotypeText = styled('span')`
  ${commonFontStyles}
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  line-height: 1;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXL};
    line-height: 1;
  }
`;

// ======================================================
// Phase Banner Components
// ======================================================

export const GovUKPhaseBanner = styled('div')`
  padding-top: ${SPACING.S};
  padding-bottom: ${SPACING.S};
  border-bottom: 1px solid ${COLORS.MID_GREY};
`;

export const GovUKPhaseBannerContent = styled('p')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  color: ${COLORS.BLACK};
  display: table;
  margin: 0;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
  }
`;

export const GovUKPhaseBannerTag = styled('strong')`
  display: inline-block;
  margin-right: ${SPACING.S};
  padding: ${SPACING.XS} ${SPACING.XS} 4px;
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${COLORS.WHITE};
  background-color: ${COLORS.BLUE};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
  }
`;

export const GovUKPhaseBannerText = styled('span')`
  display: table-cell;
  vertical-align: middle;
`;

// ======================================================
// Footer Components
// ======================================================

export const GovUKFooter = styled('footer')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  padding-top: 25px;
  padding-bottom: ${SPACING.M};
  border-top: 1px solid ${COLORS.MID_GREY};
  color: ${COLORS.BLACK};
  background: ${COLORS.LIGHT_GREY};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
    padding-top: ${SPACING.XXL};
    padding-bottom: 25px;
  }
`;

export const GovUKFooterMeta = styled('div')`
  display: flex;
  margin-right: -${SPACING.M};
  margin-left: -${SPACING.M};
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
`;

export const GovUKFooterMetaItem = styled('div')`
  margin-right: ${SPACING.M};
  margin-bottom: 25px;
  margin-left: ${SPACING.M};
  
  ${props => props.grow && css`
    flex: 1;
    
    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      flex-basis: 320px;
    }
  `}
`;

export const GovUKVisuallyHidden = styled('span')`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  -webkit-clip-path: inset(50%) !important;
  clip-path: inset(50%) !important;
  border: 0 !important;
  white-space: nowrap !important;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const GovUKFooterInlineList = styled('ul')`
  margin-top: 0;
  margin-bottom: ${SPACING.M};
  padding: 0;
  list-style: none;
`;

export const GovUKFooterInlineListItem = styled('li')`
  display: inline-block;
  margin-right: ${SPACING.M};
  margin-bottom: ${SPACING.XS};
  line-height: ${LINE_HEIGHTS.S};
`;

export const GovUKFooterLink = styled(GovUKLink)`
  &:link, &:visited {
    color: ${COLORS.BLACK};
  }
  
  &:hover {
    color: rgba(11, 12, 12, 0.99);
  }
  
  &:active, &:focus {
    color: ${COLORS.BLACK};
  }
`;

export const GovUKFooterMetaCustom = styled(GovUKBody)`
  margin-top: ${SPACING.L};
  margin-bottom: ${SPACING.S};
`;

export const GovUKFooterLicenceLogo = styled('svg')`
  margin-right: ${SPACING.S};
  margin-bottom: ${SPACING.XS};
  display: inline-block;
  vertical-align: top;
`;

export const GovUKFooterLicenceDescription = styled(GovUKBodyS)`
  margin-top: ${SPACING.S};
  display: inline-block;
`;

export const GovUKFooterCopyrightLogo = styled(GovUKLink)`
  display: inline-block;
  min-width: 125px;
  padding-top: 112px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 483.2 195.7' height='17' width='41'%3E%3Cpath fill='black' d='M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 50% 0%;
  background-size: 125px 102px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
`;

// ======================================================
// Accordion Components
// ======================================================

export const GovUKAccordion = styled('div')`
  margin-bottom: ${SPACING.L};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
  }
`;

export const GovUKAccordionSection = styled('div')`
  border-top: 1px solid ${COLORS.MID_GREY};
`;

export const GovUKAccordionSectionHeader = styled('div')`
  padding: ${SPACING.M} 0;
`;

export const GovUKAccordionSectionHeading = styled('h2')`
  ${commonFontStyles}
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.S};
  margin: 0;
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: 1.875rem;
    line-height: 1.2;
  }
`;

export const GovUKAccordionSectionButton = styled('button')`
  ${commonFontStyles}
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.S};
  width: 100%;
  padding: ${SPACING.S} 0 0;
  border: 0;
  border-top: 1px solid ${COLORS.MID_GREY};
  border-bottom: 10px solid transparent;
  color: ${COLORS.BLUE};
  background: none;
  text-align: left;
  cursor: pointer;
  
  ${respondTo('MOBILE')} {
    font-size: 1.875rem;
    line-height: 1.2;
    padding-bottom: ${SPACING.S};
  }
  
  &:hover {
    color: ${COLORS.BLUE_HOVER};
  }
  
  &:focus {
    ${focusStyles}
  }
`;

export const GovUKAccordionSectionSummary = styled('div')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  color: ${COLORS.DARK_GREY};
  margin-top: ${SPACING.XS};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const GovUKAccordionSectionContent = styled('div')`
  padding: ${SPACING.M} 0;
  display: ${props => props.hidden ? 'none' : 'block'};
`;

// ======================================================
// DVSA Vehicle Components
// ======================================================

export const VehicleRegistration = styled('div')`
  ${commonFontStyles}
  display: inline-block;
  min-width: 150px;
  font: 30px "UK-VRM", Verdana, sans-serif;
  padding: 0.4em 0.2em;
  text-align: center;
  background-color: ${COLORS.YELLOW};
  border-radius: 0.25em;
  text-transform: uppercase;
  margin-bottom: ${SPACING.M};
  
  ${printStyles}
`;

export const VehicleHeading = styled(GovUKHeadingXL)`
  ${standardSpacing}
`;

export const DetailCaption = styled(GovUKCaptionM)`
  margin-bottom: ${SPACING.XS};
`;

export const DetailHeading = styled(GovUKHeadingS)``;

export const MOTCaption = styled(GovUKCaptionM)`
  font-size: ${FONT_SIZES.M};
  line-height: ${LINE_HEIGHTS.XL};
  margin-bottom: ${SPACING.XS};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXL};
    line-height: ${LINE_HEIGHTS.S};
    margin-bottom: 0;
  }
`;

export const MOTDueDate = styled('div')`
  ${typographyBase}
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.XXL};
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
    margin-bottom: ${SPACING.XL};
  }
  
  @media print {
    font-size: 24pt;
    line-height: 1.05;
  }
`;

// ======================================================
// Loading Components
// ======================================================

export const GovUKLoadingContainer = styled('div')`
  text-align: center;
  padding: ${SPACING.XL} 0;
  margin: ${SPACING.L} 0;
`;

export const GovUKLoadingSpinner = styled('div')`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 5px solid ${COLORS.BLUE};
  border-radius: 50%;
  border-top-color: transparent;
  margin-bottom: ${SPACING.M};
  
  @keyframes govuk-loading-spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  animation: govuk-loading-spinner 1s linear infinite;
`;

// ======================================================
// Premium Components
// ======================================================

// Consolidate premium buttons
export const PremiumButton = styled(BaseButton)`
  ${buttonVariants.blue}
  margin-top: ${SPACING.M};
  margin-bottom: ${SPACING.XL};
  width: auto;
  font-weight: 700;
`;

export const PayButtonPrimary = styled(BaseButton)`
  ${buttonVariants.primary}
`;

// REPLACE: PayButtonSecondary
export const PayButtonSecondary = styled(BaseButton)`
  ${buttonVariants.secondary}
`;

// REPLACE: LinkPayButton
export const LinkPayButton = styled(BaseButton)`
  ${buttonVariants.blue}
  margin-right: 0;
  margin-bottom: 22px;
  width: 100%;
  max-width: 300px;
  
  ${respondTo('MOBILE')} {
    margin-right: ${SPACING.S};
    margin-bottom: 32px;
  }
`;


// Form components
export const StyledCardElement = styled('div')`
  border: 2px solid ${COLORS.BLACK};
  padding: ${SPACING.M};
  border-radius: 0;
  margin-bottom: ${SPACING.L};
`;

export const PaymentLabel = styled(GovUKLabel)`
  margin-bottom: ${SPACING.S};
  font-weight: 700;
`;

export const PremiumHeading = styled(GovUKHeadingS)`
  margin-top: ${SPACING.L};
  margin-bottom: ${SPACING.S};
`;

// Content containers
export const PremiumBanner = styled('div')`
  background-color: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  border-left: 5px solid ${COLORS.BLUE};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
  }
`;

export const PremiumBadge = styled('div')`
  ${commonFontStyles}
  display: inline-block;
  padding: ${SPACING.XS} ${SPACING.S};
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: 700;
  margin-bottom: ${SPACING.M};
`;

export const PremiumPrice = styled('span')`
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  margin-left: ${SPACING.XS};
`;

// ======================================================
// Premium Components (Continued)
// ======================================================

export const PremiumInfoPanel = styled('div')`
  ${commonFontStyles}
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  border-left: 5px solid ${COLORS.BLUE};
  background-color: ${COLORS.LIGHT_GREY};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.XL};
  }
`;

export const PremiumFeatureList = styled(GovUKList)`
  margin-top: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.L};
  }
  
  & > li {
    margin-bottom: ${SPACING.S};
    position: relative;
    padding-left: ${SPACING.L};
    
    &::before {
      content: "✓";
      color: ${COLORS.GREEN};
      font-weight: bold;
      position: absolute;
      left: 0;
    }
  }
`;

// ======================================================
// Report Components
// ======================================================

export const ReportSection = styled('section')`
  margin-bottom: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XXXL};
  }
`;

export const ReportTable = styled('table')`
  ${commonFontStyles}
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
  }
  
  & th,
  & td {
    padding: ${SPACING.S};
    text-align: left;
    border: 1px solid ${COLORS.MID_GREY};
  }
  
  & th {
    font-weight: 700;
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  & tr:nth-of-type(even) td {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  @media print {
    & th,
    & td {
      border: 1px solid ${COLORS.BLACK};
    }
  }
`;

export const MotHistoryItem = styled('div')`
  ${commonFontStyles}
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.M};
  border-left: 5px solid ${props => props.result === 'PASS' ? COLORS.GREEN : COLORS.RED};
  background-color: ${COLORS.LIGHT_GREY};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.L};
  }
`;

// ======================================================
// Dialog Components
// ======================================================

const DialogBase = css`
  ${commonFontStyles}
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1300;
`;

export const PaymentDialog = styled('div')`
  ${DialogBase}
  display: ${props => props.open ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: ${SPACING.L};
`;

export const DialogContainer = styled('div')`
  ${commonFontStyles}
  background-color: ${COLORS.WHITE};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 5px solid ${COLORS.BLACK};
  box-shadow: none;
  
  ${printStyles}
`;
export const DialogTitle = styled('h2')`
  ${typographyBase}
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.XXL};
  margin-bottom: 0;
  padding: ${SPACING.M} ${SPACING.L};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
    padding: ${SPACING.L} ${SPACING.XL};
  }
  
  @media print {
    font-size: 24pt;
    line-height: 1.05;
  }
`;

export const DialogContent = styled('div')`
  padding: ${SPACING.M} ${SPACING.L};
  flex: 1;
  overflow-y: auto;
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L} ${SPACING.XL};
  }
`;

export const DialogActions = styled('div')`
  padding: 0 ${SPACING.L} ${SPACING.L};
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    padding: 0 ${SPACING.XL} ${SPACING.XL};
  }
`;

// ======================================================
// Tab Components
// ======================================================

export const TabsContainer = styled('div')`
  ${commonFontStyles}
  margin-bottom: ${SPACING.L};

  ${respondTo('MOBILE')} {
    border-bottom: 1px solid ${COLORS.MID_GREY};
    margin-bottom: ${SPACING.XL};
  }
`;

export const TabsList = styled('div')`
  display: flex;
  width: 100%;
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
  }
  
  ${respondTo('MOBILE')} {
    flex-direction: row;
  }
`;

const tabSelectedStyles = css`
  position: relative;
  margin-top: -5px;
  margin-bottom: -1px;
  padding: 14px 19px 16px;
  border: 1px solid ${COLORS.MID_GREY};
  border-bottom: 0;
  background-color: ${COLORS.WHITE};
`;

export const TabButton = styled('button')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  padding: ${SPACING.S} ${SPACING.M};
  background: ${props => props.selected ? COLORS.LIGHT_GREY : 'transparent'};
  border: none;
  border-bottom: 4px solid ${props => props.selected ? COLORS.BLUE : 'transparent'};
  flex-grow: 1;
  text-align: center;
  cursor: pointer;
  color: ${COLORS.BLACK};
  text-transform: none;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    padding: ${SPACING.M} ${SPACING.L};
    margin-right: 5px;
    margin-bottom: 0;
    float: left;
    background-color: ${props => props.selected ? COLORS.WHITE : COLORS.LIGHT_GREY};
    border-bottom: none;
    
    ${props => props.selected && tabSelectedStyles}
  }
  
  &:hover:not([disabled]) {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    ${focusStyles}
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TabPanel = styled('div')`
  padding-top: ${SPACING.L};
  display: ${props => props.hidden ? 'none' : 'block'};

  ${respondTo('MOBILE')} {
    padding: ${SPACING.XL} ${SPACING.L};
    border: 1px solid ${COLORS.MID_GREY};
    border-top: 0;
  }
`;

// ======================================================
// Payment Method Components
// ======================================================

export const PaymentMethodContainer = styled('div')`
  ${standardSpacing}
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
  }
`;

export const WalletButtonContainer = styled('div')`
  margin-top: ${SPACING.M};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.L};
    margin-bottom: ${SPACING.L};
  }
  
  .StripePaymentRequestButton {
    width: 100%;
    max-width: 300px;
  }
`;

export const PaymentFormActions = styled('div')`
  display: flex;
  flex-direction: column;
  margin-top: ${SPACING.L};
  gap: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: ${SPACING.XL};
  }
`;

// ======================================================
// Responsive Utility Components
// ======================================================

const visibilityMixin = (mobileDisplay, desktopDisplay) => css`
  display: ${mobileDisplay};
  
  ${respondTo('MOBILE')} {
    display: ${desktopDisplay};
  }
`;

export const Hidden = styled('div')`
  display: none !important;
`;

export const VisibleMobile = styled('div')`
  ${visibilityMixin('block', 'none')}
`;

export const VisibleDesktop = styled('div')`
  ${visibilityMixin('none', 'block')}
`;

export const ResponsiveFlex = styled('div')`
  display: ${props => props.mobileDisplay || 'block'};
  
  ${respondTo('MOBILE')} {
    display: flex;
    flex-direction: ${props => props.direction || 'row'};
    flex-wrap: ${props => props.wrap || 'nowrap'};
    justify-content: ${props => props.justify || 'flex-start'};
    align-items: ${props => props.align || 'stretch'};
    gap: ${props => props.gap || '0'};
  }
`;

// ======================================================
// Utility Components for Accessibility
// ======================================================

export const SkipToMainContent = styled(GovUKSkipLink)`
  display: block;
  text-align: center;
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding: 0;
`;

export const FocusableElement = styled('div')`
  &:focus {
    outline: none;
  }
  
  &:focus-visible {
    ${focusStyles}
  }
`;

// ======================================================
// Additional Utility Components
// ======================================================

export const ScreenReaderOnly = styled(GovUKVisuallyHidden)``;

export const ClearFix = styled('div')`
  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

export const FlexContainer = styled('div')`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || '0'};
`;

export const GridContainer = styled('div')`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  grid-gap: ${props => props.gap || SPACING.M};
  align-items: ${props => props.align || 'stretch'};
  
  ${respondTo('MOBILE')} {
    grid-template-columns: ${props => props.desktopColumns || props.columns || '1fr'};
    grid-gap: ${props => props.desktopGap || props.gap || SPACING.L};
  }
`;

// ======================================================
// Export all theme constants and utilities
// ======================================================

// Utility Mixins for Common Patterns
export const utilityMixins = {
  // Text utilities matching MarketDash patterns
  textPositive: css`
    color: ${COLORS.POSITIVE};
    font-weight: 600;
  `,
  
  textNegative: css`
    color: ${COLORS.NEGATIVE};
    font-weight: 600;
  `,
  
  textNeutral: css`
    color: ${COLORS.NEUTRAL};
  `,
  
  textPrimary: css`
    color: ${COLORS.PRIMARY};
  `,
  
  // Background utilities
  bgPositiveLight: css`
    background: ${COLORS.POSITIVE_LIGHT};
  `,
  
  bgNegativeLight: css`
    background: ${COLORS.NEGATIVE_LIGHT};
  `,
  
  bgNeutralLight: css`
    background: ${COLORS.NEUTRAL_LIGHT};
  `,
  
  // Loading animation
  loadingSpinner: css`
    width: 24px;
    height: 24px;
    border: 3px solid ${COLORS.GRAY_200};
    border-radius: 50%;
    border-top-color: ${COLORS.PRIMARY};
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  
  // Screen reader only
  srOnly: css`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `
};

export const theme = {
  colors: COLORS,
  breakpoints: BREAKPOINTS,
  spacing: SPACING,
  fontSizes: FONT_SIZES,
  lineHeights: LINE_HEIGHTS,
  fontFamilies: FONT_FAMILIES,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
  radius: RADIUS,
  letterSpacing: LETTER_SPACING,
  mixins: {
    // Original mixins
    respondTo,
    commonFontStyles,
    printStyles,
    focusStyles,
    linkHoverStyles,
    linkStyles,
    standardSpacing,
    responsiveSpacing,
    typographyBase,
    buttonBase,
    formControlBase,
    
    // New modern mixins
    cardBase,
    cardHover,
    sectionBase,
    gridBase,
    flexBetween,
    selectBase,
    
    // Utility mixins
    ...utilityMixins,
  },
};

// ======================================================
// Custom Hooks for Theme Usage
// ======================================================

export const useTheme = () => theme;

export const useResponsive = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 650);
      setIsTablet(width >= 650 && width < 769);
      setIsDesktop(width >= 1024);
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  return { isMobile, isTablet, isDesktop };
};