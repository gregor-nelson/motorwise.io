import { styled, css } from '@mui/material/styles';
import {
  GovUKInsetText,
  GovUKBodyS,
  GovUKBody,
  commonFontStyles,
  focusStyles,
  COLORS,
  BREAKPOINTS,
  printStyles,
} from '../../../../../styles/theme';

// Standardize with main theme by referring to COLORS instead of duplicating
export const GOVUK_COLORS = COLORS;

// Standardize on 'em' units to match main theme
export const mobileMediaQuery = `@media (max-width: ${BREAKPOINTS.MOBILE})`;
export const desktopMediaQuery = `@media (min-width: ${BREAKPOINTS.MOBILE})`;

// Use commonFontStyles from main theme instead of recreating
export const themedFont = css`
  ${commonFontStyles}
`;

// Use focusStyles from main theme 
export const themedFocus = css`
  ${focusStyles}
`;

// Chart container and controls
export const ChartContainer = styled('div')(({ theme }) => css`
  ${commonFontStyles}
  margin-top: 20px;
  margin-bottom: 30px;
  width: 100%;
  height: 250px;
  position: relative;
  background-color: ${COLORS.WHITE};
  padding: 10px 0;
  overflow: hidden;

  ${desktopMediaQuery} {
    height: 400px;
    padding: 20px 0;
  }
`);

export const InfoBox = styled(GovUKInsetText)(() => css`
  margin-top: 10px;
  margin-bottom: 20px;
  ${commonFontStyles}
`);

export const ControlPanel = styled('div')(() => css`
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-start;

  ${desktopMediaQuery} {
    gap: 8px;
    margin-bottom: 15px;
  }
`);

export const ControlButton = styled('button')(({ active }) => css`
  ${commonFontStyles}
  padding: 6px 8px;
  border: 1px solid ${COLORS.MID_GREY};
  background-color: ${active ? COLORS.BLUE : COLORS.WHITE};
  color: ${active ? COLORS.WHITE : COLORS.BLACK};
  cursor: pointer;
  font-size: 0.75rem;
  border-radius: 2px;
  transition: background-color 0.2s, transform 0.1s;
  flex: 1 0 calc(50% - 4px);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  
  &:active {
    transform: scale(0.98);
  }

  &:hover {
    background-color: ${active ? COLORS.BLUE : COLORS.LIGHT_GREY};
  }

  &:focus {
    ${focusStyles}
  }

  @media (min-width: 480px) {
    flex: 0 1 auto;
    font-size: 0.75rem;
    padding: 8px 10px;
  }
  
  ${desktopMediaQuery} {
    font-size: 0.875rem;
    padding: 8px 12px;
  }
`);

export const LoadingSpinner = styled('div')(() => css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  &:after {
    content: "";
    width: 40px;
    height: 40px;
    border: 5px solid ${COLORS.LIGHT_GREY};
    border-top: 5px solid ${COLORS.BLUE};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`);

export const ErrorMessage = styled(GovUKInsetText)(() => css`
  border-left: 5px solid ${COLORS.RED};
  background-color: ${COLORS.WHITE};
  padding: 15px;
  ${commonFontStyles}
`);

// Usage summary styles
export const UsageSummary = styled('div')(() => css`
  ${commonFontStyles}
  background-color: ${COLORS.LIGHT_GREY};
  padding: 10px;
  margin-bottom: 15px;
  border-left: 5px solid ${COLORS.BLUE};

  ${desktopMediaQuery} {
    padding: 20px;
    margin-bottom: 30px;
  }
`);

export const SummaryGrid = styled('div')(() => css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  
  ${desktopMediaQuery} {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 20px;
  }
`);

export const SummaryItem = styled('div')(() => css`
  ${commonFontStyles}
`);

export const SummaryLabel = styled(GovUKBodyS)(() => css`
  margin-bottom: 5px;
  color: ${COLORS.DARK_GREY};
  ${commonFontStyles}
`);

export const SummaryValue = styled('div')(() => css`
  ${commonFontStyles}
  font-weight: 700;
  font-size: 1.25rem;
`);

// Pattern card styles - aligned with InsightPanel from theme
export const PatternCard = styled('div')(({ severity, isClockingAnomaly }) => css`
  ${commonFontStyles}
  padding: 10px;
  margin-bottom: 10px;
  position: relative;
  border-left: 5px solid ${
    isClockingAnomaly ? COLORS.RED :
    severity === "high" ? COLORS.RED :
    severity === "medium" ? COLORS.ORANGE || '#f47738' :
    COLORS.MID_GREY
  };
  background-color: ${
    isClockingAnomaly ? 'rgba(212, 53, 28, 0.1)' :  // Red with transparency
    COLORS.LIGHT_GREY
  };
  
  ${desktopMediaQuery} {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`);

export const PatternTitle = styled('div')(() => css`
  ${commonFontStyles}
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.25;
  margin-bottom: 5px;
  
  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
`);

export const PatternDetail = styled('div')(() => css`
  ${commonFontStyles}
  margin-bottom: 10px;
  font-size: 1rem;
  line-height: 1.25;
  
  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }
`);

export const PatternStats = styled('div')(() => css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`);

export const StatBox = styled('div')(({ color }) => css`
  ${commonFontStyles}
  display: inline-block;
  padding: 5px 10px;
  background-color: ${COLORS.WHITE};
  border-left: 3px solid ${color || COLORS.MID_GREY};
  font-size: 0.875rem;
  
  ${desktopMediaQuery} {
    font-size: 1rem;
  }
`);

// Warning styles
export const ClockingWarning = styled('div')(() => css`
  background-color: rgba(212, 53, 28, 0.1);
  border: 2px solid ${COLORS.RED};
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`);

export const WarningIcon = styled('div')(() => css`
  color: ${COLORS.RED};
  font-size: 24px;
  margin-right: 15px;
  
  ${desktopMediaQuery} {
    font-size: 30px;
  }
`);

export const WarningText = styled(GovUKBody)(() => css`
  color: ${COLORS.RED};
  font-weight: 700;
  ${commonFontStyles}
`);

// Table styles - aligned with ReportTable from theme
export const UsagePeriodsTable = styled('table')(() => css`
  ${commonFontStyles}
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 0.75rem;
  
  ${desktopMediaQuery} {
    font-size: 1rem;
  }
  
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
  
  // Using nth-of-type instead of nth-child for better SSR compatibility
  & tr:nth-of-type(even) {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  // Handle table overflow on small screens
  @media (max-width: 500px) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-scrolling: touch;
    -ms-autohiding-scrollbar;
  }
`);

/**
 * Helper function to convert hex color to RGB for transparency
 * Handles undefined, null or invalid inputs safely
 */
export function hexToRgb(hex) {
  // Return a default value if hex is undefined or null
  if (!hex) {
    return '0, 0, 0'; // Default to black RGB
  }
  
  // Ensure hex is a string
  hex = String(hex);
  
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Handle invalid hex values
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    console.warn(`Invalid hex color: ${hex}. Using default black.`);
    return '0, 0, 0';
  }
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}