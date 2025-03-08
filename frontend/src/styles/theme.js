import { styled, css } from '@mui/material/styles';

// Define consistent GOV.UK colors as constants
export const COLORS = {
  BLACK: '#0b0c0c',
  WHITE: '#ffffff',
  BLUE: '#1d70b8',
  YELLOW: '#fd0', // Updated to match GOV.UK yellow
  RED: '#d4351c',
  GREEN: '#00703c',
  LIGHT_GREY: '#f3f2f1',
  MID_GREY: '#b1b4b6',
  DARK_GREY: '#505a5f',
};

// BREAKPOINTS
export const BREAKPOINTS = {
  MOBILE: '40.0625em', // 650px
  TABLET: '48.0625em', // 769px
  DESKTOP: '48.0625em',
};

// Common styles that can be used across components
export const commonFontStyles = css`
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

// Common media queries for consistent typography scaling
export const commonMediaQueries = css`
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
`;

// Print styles
export const printStyles = css`
  @media print {
    font-family: sans-serif;
    color: #000000;
  }
`;

// Focus state styling that's used consistently across interactive elements
export const focusStyles = css`
  outline: 3px solid rgba(0, 0, 0, 0);
  background-color: ${COLORS.YELLOW};
  color: ${COLORS.BLACK};
  box-shadow: 0 -2px ${COLORS.YELLOW}, 0 4px ${COLORS.BLACK};
  text-decoration: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
`;

// Common link styling
export const linkStyles = css`
  ${commonFontStyles}
  text-decoration: underline;
  text-decoration-thickness: max(1px, .0625rem);
  text-underline-offset: .1578em;
  
  &:hover {
    text-decoration-thickness: max(3px, .1875rem, .12em);
    -webkit-text-decoration-skip-ink: none;
    text-decoration-skip-ink: none;
    -webkit-text-decoration-skip: none;
    text-decoration-skip: none;
  }
  
  &:focus {
    ${focusStyles}
  }
  
  &:link {
    color: ${COLORS.BLUE};
  }
  
  &:visited {
    color: #4c2c92;
  }
  
  &:hover {
    color: #003078;
  }
  
  &:active {
    color: ${COLORS.BLACK};
  }
  
  &:focus {
    color: ${COLORS.BLACK};
  }
`;

// ======================================================
// Layout Components
// ======================================================
export const GovUKContainer = styled('div')`
  max-width: 960px;
  margin-right: 15px;
  margin-left: 15px;
  
  @supports (margin: max(calc(0px))) {
    margin-right: max(15px, calc(15px + env(safe-area-inset-right)));
    margin-left: max(15px, calc(15px + env(safe-area-inset-left)));
  }
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-right: 30px;
    margin-left: 30px;
    
    @supports (margin: max(calc(0px))) {
      margin-right: max(30px, calc(15px + env(safe-area-inset-right)));
      margin-left: max(30px, calc(15px + env(safe-area-inset-left)));
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
  padding-top: 20px;
  padding-bottom: 20px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    padding-top: 40px;
    padding-bottom: 40px;
  }
  
  &.govuk-main-wrapper--auto-spacing:first-child,
  &.govuk-main-wrapper--l {
    padding-top: 30px;
    
    @media (min-width: ${BREAKPOINTS.MOBILE}) {
      padding-top: 50px;
    }
  }
`;

export const GovUKGridRow = styled('div')`
  margin-right: -15px;
  margin-left: -15px;
  
  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

export const GovUKGridColumnOneThird = styled('div')`
  box-sizing: border-box;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    width: 33.3333%;
    float: left;
  }
`;

export const GovUKGridColumnOneHalf = styled('div')`
  box-sizing: border-box;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    width: 50%;
    float: left;
  }
`;

export const GovUKGridColumnTwoThirds = styled('div')`
  box-sizing: border-box;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    width: 66.6667%;
    float: left;
  }
`;

// ======================================================
// Typography Components
// ======================================================
export const GovUKHeadingXL = styled('h1')`
  ${commonFontStyles}
  color: ${props => props.motStatus === 'PASS' ? COLORS.GREEN : props.motStatus ? COLORS.RED : COLORS.BLACK};
  font-weight: 700;
  font-size: 2rem;
  line-height: 1.09375;
  display: block;
  margin-top: 0;
  margin-bottom: 30px;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 3rem;
    line-height: 1.0416666667;
    margin-bottom: 50px;
  }
  
  @media print {
    font-size: 32pt;
    line-height: 1.15;
  }
`;

export const GovUKHeadingL = styled('h2')`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.0416666667;
  display: block;
  margin-top: 0;
  margin-bottom: 20px;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 2.25rem;
    line-height: 1.1111111111;
    margin-bottom: 30px;
  }
  
  @media print {
    font-size: 24pt;
    line-height: 1.05;
  }
`;

export const GovUKHeadingS = styled('h4')`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.25;
  display: block;
  margin-top: 0;
  margin-bottom: 15px;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-bottom: 20px;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKCaptionM = styled('span')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  display: block;
  color: ${COLORS.DARK_GREY};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKBody = styled('p')`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  margin-top: 0;
  margin-bottom: 15px;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-bottom: 20px;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKBodyS = styled('p')`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.1428571429;
  margin-top: 0;
  margin-bottom: 15px;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    line-height: 1.25;
    margin-bottom: 20px;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }
`;

export const GovUKLink = styled('a')`
  ${linkStyles}
  
  @media print {
    &[href^="/"]::after,
    &[href^="http://"]::after,
    &[href^="https://"]::after {
      content: " (" attr(href) ")";
      font-size: 90%;
      word-wrap: break-word;
    }
  }
`;

export const GovUKList = styled('ul')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  color: ${COLORS.BLACK};
  margin-top: 0;
  margin-bottom: 15px;
  padding-left: 0;
  list-style-type: none;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-bottom: 20px;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
  
  & .govuk-list {
    margin-top: 10px;
  }
  
  & > li {
    margin-bottom: 5px;
  }
`;

// ======================================================
// Section Break
// ======================================================
export const GovUKSectionBreak = styled('hr')`
  margin: 0;
  border: 0;
  
  &.govuk-section-break--visible {
    border-bottom: 1px solid ${COLORS.MID_GREY};
  }
  
  &.govuk-section-break--m {
    margin-top: 15px;
    margin-bottom: 15px;
    
    @media (min-width: ${BREAKPOINTS.MOBILE}) {
      margin-top: 20px;
      margin-bottom: 20px;
    }
  }
`;

// ======================================================
// Form Components
// ======================================================
export const GovUKFormGroup = styled('div')`
  margin-bottom: 20px;
  
  &::after {
    content: "";
    display: block;
    clear: both;
  }
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-bottom: 30px;
  }
  
  & .govuk-form-group:last-of-type {
    margin-bottom: 0;
  }
  
  &.govuk-form-group--error {
    padding-left: 15px;
    border-left: 5px solid ${COLORS.RED};
  }
`;

export const GovUKHint = styled('div')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  margin-bottom: 15px;
  color: ${COLORS.DARK_GREY};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKLabel = styled('label')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  color: ${COLORS.BLACK};
  display: block;
  margin-bottom: 5px;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKInput = styled('input')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  box-sizing: border-box;
  width: 100%;
  height: 2.5rem;
  margin-top: 0;
  padding: 5px;
  border: 2px solid ${props => props.error ? COLORS.RED : COLORS.BLACK};
  border-radius: 0;
  -webkit-appearance: none;
  appearance: none;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
  
  &:focus {
    outline: 3px solid ${COLORS.YELLOW};
    outline-offset: 0;
    box-shadow: inset 0 0 0 2px;
  }
  
  &.govuk-input--error {
    border-color: ${COLORS.RED};
  }
`;

export const GovUKErrorMessage = styled('span')`
  ${commonFontStyles}
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.25;
  display: block;
  margin-top: 0;
  margin-bottom: 15px;
  clear: both;
  color: ${COLORS.RED};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
  
  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`;

export const GovUKButton = styled('button')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.1875;
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  width: 100%;
  margin-top: 0;
  margin-right: 0;
  margin-left: 0;
  margin-bottom: 22px;
  padding: 8px 10px 7px;
  border: 2px solid rgba(0, 0, 0, 0);
  border-radius: 0;
  color: ${COLORS.WHITE};
  background-color: ${COLORS.GREEN};
  box-shadow: 0 2px 0 #002d18;
  text-align: center;
  vertical-align: top;
  cursor: pointer;
  -webkit-appearance: none;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1;
    width: auto;
    margin-bottom: 32px;
  }
  
  &:focus {
    border-color: ${COLORS.YELLOW};
    outline: 3px solid rgba(0, 0, 0, 0);
    box-shadow: inset 0 0 0 1px ${COLORS.YELLOW};
  }
  
  &.govuk-button--start {
    font-weight: 700;
    font-size: 1.125rem;
    line-height: 1;
    display: inline-flex;
    min-height: auto;
    justify-content: center;
    
    @media (min-width: ${BREAKPOINTS.MOBILE}) {
      font-size: 1.5rem;
      line-height: 1;
    }
  }
`;

export const GovUKButtonStartIcon = styled('svg')`
  margin-left: 5px;
  vertical-align: middle;
  flex-shrink: 0;
  align-self: center;
  forced-color-adjust: auto;
  
  @media (min-width: ${BREAKPOINTS.TABLET}) {
    margin-left: 10px;
  }
`;

// ======================================================
// Navigation Components
// ======================================================
export const GovUKBackLink = styled('a')`
  ${commonFontStyles}
  font-size: 0.875rem;
  line-height: 1.1428571429;
  text-decoration: underline;
  text-decoration-thickness: max(1px, .0625rem);
  text-underline-offset: .1578em;
  display: inline-block;
  position: relative;
  margin-top: 15px;
  margin-bottom: 15px;
  padding-left: 0.875em;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    line-height: 1.25;
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
    left: 0.1875em;
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
`;

// ======================================================
// Details Component
// ======================================================
export const GovUKDetails = styled('details')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  color: ${COLORS.BLACK};
  margin-bottom: 20px;
  display: block;
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-bottom: 30px;
  }
`;

export const GovUKDetailsSummary = styled('summary')`
  display: block;
  
  &:focus {
    outline: 3px solid rgba(0, 0, 0, 0);
    color: ${COLORS.BLACK};
    background-color: ${COLORS.YELLOW};
    box-shadow: 0 -2px ${COLORS.YELLOW}, 0 4px ${COLORS.BLACK};
    text-decoration: none;
  }
`;

export const GovUKDetailsText = styled('div')`
  padding: 15px;
  padding-left: 20px;
  border-left: 5px solid ${COLORS.MID_GREY};
  
  & > p {
    margin-top: 0;
    margin-bottom: 20px;
  }
  
  & > :last-child {
    margin-bottom: 0;
  }
`;

// ======================================================
// Error Summary Component
// ======================================================
export const GovUKErrorSummary = styled('div')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  color: ${COLORS.BLACK};
  padding: 15px;
  margin-bottom: 30px;
  border: 5px solid ${COLORS.RED};
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    padding: 20px;
    margin-bottom: 50px;
  }
`;

export const GovUKErrorSummaryTitle = styled('h2')`
  font-size: 1.125rem;
  line-height: 1.1111111111;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 15px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.5rem;
    line-height: 1.25;
    margin-bottom: 20px;
  }
`;

export const GovUKErrorSummaryBody = styled('div')`
  & p {
    margin-bottom: 0;
  }
`;

export const GovUKErrorSummaryList = styled('ul')`
  margin-bottom: 0;
  
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
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  color: ${COLORS.BLACK};
  padding: 15px;
  margin-top: 20px;
  margin-bottom: 20px;
  clear: both;
  border-left: 10px solid ${COLORS.MID_GREY};
  
  ${printStyles}
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-top: 30px;
    margin-bottom: 30px;
  }
`;

// ======================================================
// Header Components
// ======================================================
export const GovUKSkipLink = styled('a')`
  ${commonFontStyles}
  font-size: 0.875rem;
  line-height: 1.1428571429;
  display: block;
  padding: 10px 15px;
  
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
    outline: 3px solid ${COLORS.YELLOW};
    outline-offset: 0;
    background-color: ${COLORS.YELLOW};
  }
`;

export const GovUKHeader = styled('header')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1;
  border-bottom: 10px solid ${COLORS.WHITE};
  color: ${COLORS.WHITE};
  background: ${COLORS.BLACK};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    line-height: 1;
  }
`;

export const GovUKHeaderContainer = styled('div')`
  position: relative;
  margin-bottom: -10px;
  padding-top: 10px;
  border-bottom: 10px solid ${COLORS.BLUE};
  
  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

export const GovUKHeaderLogo = styled('div')`
  margin-bottom: 10px;
  padding-right: 80px;
  
  @media (min-width: ${BREAKPOINTS.TABLET}) {
    width: 33.33%;
    padding-right: 15px;
    float: left;
    vertical-align: top;
  }
`;

export const GovUKHeaderContent = styled('div')`
  @media (min-width: ${BREAKPOINTS.TABLET}) {
    width: 66.66%;
    padding-left: 15px;
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
    outline: 3px solid rgba(0, 0, 0, 0);
    color: ${COLORS.BLACK};
    background-color: ${COLORS.YELLOW};
    box-shadow: 0 -2px ${COLORS.YELLOW}, 0 4px ${COLORS.BLACK};
    text-decoration: none;
  }
  
  ${props => props.isHomepage && css`
    display: inline-block;
    margin-right: 10px;
    font-size: 30px;
    
    &:link, &:visited {
      text-decoration: none;
    }
    
    &:hover, &:active {
      margin-bottom: -3px;
      border-bottom: 3px solid;
    }
    
    @media (min-width: ${BREAKPOINTS.TABLET}) {
      display: inline;
    }
  `}
`;

export const GovUKHeaderServiceName = styled('a')`
  ${commonFontStyles}
  display: inline-block;
  margin-bottom: 10px;
  font-size: 1.125rem;
  line-height: 1.1111111111;
  font-weight: 700;
  
  &:link, &:visited {
    color: ${COLORS.WHITE};
  }
  
  &:focus {
    outline: 3px solid rgba(0, 0, 0, 0);
    color: ${COLORS.BLACK};
    background-color: ${COLORS.YELLOW};
    box-shadow: 0 -2px ${COLORS.YELLOW}, 0 4px ${COLORS.BLACK};
    text-decoration: none;
  }
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.5rem;
    line-height: 1.25;
  }
`;

export const GovUKHeaderLogotype = styled('span')`
  display: inline-flex;
  align-items: center;
`;

export const GovUKHeaderLogotypeText = styled('span')`
  ${commonFontStyles}
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1;
  
  @media (min-width: 40.0625em) {
    font-size: 2rem;
    line-height: 1;
  }
`;

// ======================================================
// Phase Banner Components
// ======================================================
export const GovUKPhaseBanner = styled('div')`
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${COLORS.MID_GREY};
`;

export const GovUKPhaseBannerContent = styled('p')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.1428571429;
  color: ${COLORS.BLACK};
  display: table;
  margin: 0;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    line-height: 1.25;
  }
`;

export const GovUKPhaseBannerTag = styled('strong')`
  display: inline-block;
  margin-right: 10px;
  padding: 5px 8px 4px;
  font-size: 0.875rem;
  line-height: 1.1428571429;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    line-height: 1.25;
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
  font-size: 0.875rem;
  line-height: 1.1428571429;
  padding-top: 25px;
  padding-bottom: 15px;
  border-top: 1px solid ${COLORS.MID_GREY};
  color: ${COLORS.BLACK};
  background: ${COLORS.LIGHT_GREY};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    line-height: 1.25;
    padding-top: 40px;
    padding-bottom: 25px;
  }
`;

export const GovUKFooterMeta = styled('div')`
  display: flex;
  margin-right: -15px;
  margin-left: -15px;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
`;

export const GovUKFooterMetaItem = styled('div')`
  margin-right: 15px;
  margin-bottom: 25px;
  margin-left: 15px;
  
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
  margin-bottom: 15px;
  padding: 0;
`;

export const GovUKFooterInlineListItem = styled('li')`
  display: inline-block;
  margin-right: 15px;
  margin-bottom: 5px;
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
  margin-top: 20px;
  margin-bottom: 10px;
`;

export const GovUKFooterLicenceLogo = styled('svg')`
  margin-right: 10px;
  margin-bottom: 5px;
`;

export const GovUKFooterLicenceDescription = styled(GovUKBodyS)`
  margin-top: 10px;
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
export const GovUKAccordion = styled('div')({
  marginBottom: '20px',
  borderBottom: '1px solid #b1b4b6',
  '@media (min-width: 40.0625em)': {
    marginBottom: '30px',
  },
});

export const GovUKAccordionSection = styled('div')({
  borderTop: '1px solid #b1b4b6',
});

export const GovUKAccordionSectionHeader = styled('div')({
  padding: '15px 0',
});

export const GovUKAccordionSectionHeading = styled('h2')({
  ...commonFontStyles,
  fontWeight: 700,
  fontSize: '1.5rem',
  lineHeight: '1.25',
  margin: '0',
  color: '#0b0c0c',
  '@media (min-width: 40.0625em)': {
    fontSize: '1.875rem',
    lineHeight: '1.2',
  },
});

export const GovUKAccordionSectionButton = styled('button')({
  ...commonFontStyles,
  fontWeight: 700,
  fontSize: '1.5rem',
  lineHeight: '1.25',
  background: 'none',
  border: 'none',
  padding: '0',
  color: '#1d70b8',
  textDecoration: 'underline',
  cursor: 'pointer',
  '@media (min-width: 40.0625em)': {
    fontSize: '1.875rem',
    lineHeight: '1.2',
  },
  '&:hover': {
    color: '#003078',
  },
  '&:focus': {
    outline: '3px solid #fd0',
    backgroundColor: '#fd0',
    color: '#0b0c0c',
  },
});

export const GovUKAccordionSectionSummary = styled('div')({
  ...commonFontStyles,
  fontSize: '1rem',
  lineHeight: '1.25',
  color: '#505a5f',
  marginTop: '5px',
  ...commonMediaQueries,
});

export const GovUKAccordionSectionContent = styled('div')({
  padding: '15px 0',
});

// ======================================================
// Custom DVSA Components
// ======================================================
export const DvsaVRM = styled('div')`
  display: inline-block;
  min-width: 150px;
  font: 30px "UK-VRM", Verdana, sans-serif;
  padding: 0.4em 0.2em;
  text-align: center;
  background-color: ${COLORS.YELLOW};
  border-radius: 0.25em;
  text-transform: uppercase;
`;


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
  margin-bottom: 15px;
  

  ${printStyles}
`;

export const VehicleHeading = styled(GovUKHeadingXL)`
  margin-bottom: 20px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-bottom: 30px;
  }
`;

export const DetailCaption = styled(GovUKCaptionM)`
  margin-bottom: 5px;
`;

export const DetailHeading = styled(GovUKHeadingS)`
  margin-bottom: 15px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-bottom: 20px;
  }
`;

export const MOTCaption = styled(GovUKCaptionM)`
  font-size: 1.125rem;
  line-height: 1.1111111111;
  margin-bottom: 5px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.5rem;
    line-height: 1.25;
    margin-bottom: 0;
  }
  
  ${printStyles}
`;

export const MOTDueDate = styled('div')`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.0416666667;
  display: block;
  margin-top: 0;
  margin-bottom: 20px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 2.25rem;
    line-height: 1.1111111111;
    margin-bottom: 30px;
  }
  
  ${printStyles}
  @media print {
    font-size: 24pt;
    line-height: 1.05;
  }
`;


//////////////Loader//////

export const GovUKLoadingContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  padding: '30px 0',
  margin: '20px 0',
}));

export const GovUKLoadingSpinner = styled('div')(({ theme }) => ({
  display: 'inline-block',
  width: '50px',
  height: '50px',
  border: '5px solid #1d70b8', // GOV.UK blue
  borderRadius: '50%',
  borderTopColor: 'transparent',
  marginBottom: '15px',
  '@keyframes govuk-loading-spinner': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  animation: 'govuk-loading-spinner 1s linear infinite',
}));




// Styled components for Premium UI elements
export const PremiumButton = styled(GovUKButton)`
  background-color: ${COLORS.BLUE};
  box-shadow: 0 2px 0 #00437e;
  margin-top: 15px;
  margin-bottom: 30px;
  width: auto;
  font-weight: 700;
  
  &:hover {
    background-color: #003078;
  }

  @media (min-width: 40.0625em) {
    width: auto;
  }
`;

export const StyledCardElement = styled('div')`
  border: 2px solid ${COLORS.BLACK};
  padding: 15px;
  border-radius: 0;
  margin-bottom: 20px;
`;

export const PaymentLabel = styled(GovUKLabel)`
  margin-bottom: 10px;
  font-weight: 700;
`;

export const PremiumHeading = styled(GovUKHeadingS)`
  margin-top: 20px;
  margin-bottom: 10px;
`;

export const PremiumBanner = styled('div')`
  background-color: ${COLORS.LIGHT_GREY};
  padding: 15px;
  margin-bottom: 20px;
  border-left: 5px solid ${COLORS.BLUE};
  
  @media (min-width: 40.0625em) {
    padding: 20px;
  }
`;

export const PremiumPrice = styled('span')`
  font-weight: 700;
  font-size: 1.5rem;
  margin-left: 5px;
`;




// Dialog components for Stripe payment
export const PaymentDialog = styled('div')`
  ${commonFontStyles}
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${props => props.open ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1300;
  padding: 20px;
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
  
  @media print {
    font-family: sans-serif;
    color: ${COLORS.BLACK};
  }
`;

export const DialogTitle = styled('h2')`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.0416666667;
  padding: 15px 20px;
  margin: 0;
  border-bottom: 1px solid ${COLORS.MID_GREY};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 2.25rem;
    line-height: 1.1111111111;
    padding: 20px 30px;
  }
  
  @media print {
    font-size: 24pt;
    line-height: 1.05;
  }
`;

export const DialogContent = styled('div')`
  padding: 15px 20px;
  flex: 1;
  overflow-y: auto;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px 30px;
  }
`;

export const DialogActions = styled('div')`
  padding: 0 20px 20px;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 15px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    padding: 0 30px 30px;
  }
`;

// Tab components for payment methods
export const TabsContainer = styled('div')`
  ${commonFontStyles}
  border-bottom: 1px solid ${COLORS.MID_GREY};
  margin-bottom: 20px;
`;

export const TabsList = styled('div')`
  display: flex;
  width: 100%;
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
  }
`;

export const TabButton = styled('button')`
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
  }
`;

export const TabPanel = styled('div')`
  padding-top: 20px;
  display: ${props => props.hidden ? 'none' : 'block'};
`;

// Payment method specific styling
export const PaymentMethodContainer = styled('div')`
  margin-bottom: 20px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-bottom: 30px;
  }
`;

export const WalletButtonContainer = styled('div')`
  margin-top: 15px;
  margin-bottom: 15px;
  
  .StripePaymentRequestButton {
    width: 100%;
    max-width: 300px;
  }
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-top: 20px;
    margin-bottom: 20px;
  }
`;

export const LinkPayButton = styled(GovUKButton)`
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.1875;
  background-color: ${COLORS.BLUE};
  box-shadow: 0 2px 0 #00437e;
  margin-right: 0;
  margin-bottom: 22px;
  width: 100%;
  max-width: 300px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1;
    margin-right: 10px;
    margin-bottom: 32px;
  }
  
  &:hover {
    background-color: #003078;
  }
  
  &:focus {
    border-color: ${COLORS.YELLOW};
    outline: 3px solid rgba(0, 0, 0, 0);
    box-shadow: inset 0 0 0 1px ${COLORS.YELLOW};
  }
`;

export const PaymentFormActions = styled('div')`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 30px;
  }
`;

// Add these to enhance the existing payment components
export const PayButtonPrimary = styled(GovUKButton)`
  background-color: ${COLORS.GREEN};
  box-shadow: 0 2px 0 #002d18;
  width: 100%;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    width: auto;
  }
  
  &:hover {
    background-color: #005a30;
  }
  
  &:focus {
    border-color: ${COLORS.YELLOW};
    outline: 3px solid rgba(0, 0, 0, 0);
    box-shadow: inset 0 0 0 1px ${COLORS.YELLOW};
  }
`;

export const PayButtonSecondary = styled(GovUKButton)`
  background-color: ${COLORS.MID_GREY};
  color: ${COLORS.BLACK};
  box-shadow: 0 2px 0 #505a5f;
  width: 100%;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    width: auto;
  }
  
  &:hover {
    background-color: #a9acae;
  }
  
  &:focus {
    border-color: ${COLORS.YELLOW};
    outline: 3px solid rgba(0, 0, 0, 0);
    box-shadow: inset 0 0 0 1px ${COLORS.YELLOW};
    color: ${COLORS.BLACK};
  }
`;




// Add these new Premium Report styled components to your theme.js file
// Below the existing styled components, before the export statement

// ======================================================
// Premium Report Components
// ======================================================
export const PremiumBadge = styled('div')`
  ${commonFontStyles}
  display: inline-block;
  padding: 5px 10px;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: 700;
  margin-bottom: 15px;
`;

export const ReportSection = styled('div')`
  margin-bottom: 30px;
`;

export const ReportTable = styled('table')`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  & th {
    ${commonFontStyles}
    font-weight: 700;
    padding: 10px;
    text-align: left;
    background-color: ${COLORS.LIGHT_GREY};
    border: 1px solid ${COLORS.MID_GREY};
  }
  
  & td {
    ${commonFontStyles}
    padding: 10px;
    border: 1px solid ${COLORS.MID_GREY};
    text-align: left;
  }
  
  & tr:nth-child(even) {
    background-color: ${COLORS.LIGHT_GREY};
  }
`;

export const MotHistoryItem = styled('div')`
  ${commonFontStyles}
  padding: 15px;
  margin-bottom: 15px;
  border-left: 5px solid ${props => props.result === 'PASS' ? COLORS.GREEN : COLORS.RED};
  background-color: ${COLORS.LIGHT_GREY};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px;
  }
`;

// Additional components that might be useful for the premium features
export const PremiumFeatureList = styled(GovUKList)`
  margin-top: 15px;
  
  & > li {
    margin-bottom: 10px;
    
    &:before {
      content: "✓";
      color: ${COLORS.GREEN};
      font-weight: bold;
      display: inline-block; 
      width: 1em;
      margin-left: -1em;
    }
  }
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-top: 20px;
  }
`;

export const PremiumInfoPanel = styled('div')`
  ${commonFontStyles}
  padding: 15px;
  margin-bottom: 20px;
  border-left: 5px solid ${COLORS.BLUE};
  background-color: ${COLORS.LIGHT_GREY};
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px;
    margin-bottom: 30px;
  }
`;