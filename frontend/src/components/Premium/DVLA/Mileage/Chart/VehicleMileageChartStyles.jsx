import { styled, css } from '@mui/material/styles';
import {
  GovUKInsetText,
  GovUKBodyS,
  GovUKBody,
  commonFontStyles,
  focusStyles,
  COLORS,
  BREAKPOINTS,
} from '../../../../../styles/theme';

// GOV.UK-specific colors aligned with the provided CSS
const GOVUK_COLORS = {
  ...COLORS,
  TEXT_COLOR: '#0b0c0c', // Standard text color
  LINK_COLOR: '#1d70b8', // Default link color
  LINK_VISITED: '#4c2c92', // Visited link color
  LINK_HOVER: '#003078', // Hover link color
  FOCUS_BG: '#fd0', // Focus background (yellow)
  FOCUS_TEXT: '#0b0c0c', // Focus text color
  BORDER_COLOR: '#b1b4b6', // Table and section border color
  GREY_1: '#f3f2f1', // Light grey background
  GREY_2: '#505a5f', // Secondary text color
  RED: '#d4351c', // Error color
  AMBER: '#f47738', // Warning/period date color
};

// GOV.UK Breakpoints (converted from rem to px assuming 16px base)
const GOVUK_BREAKPOINTS = {
  MOBILE: '320px', // 20rem
  TABLET: '641px', // 40.0625rem
  DESKTOP: '769px', // 48.0625rem
};

export { GOVUK_COLORS, commonFontStyles, focusStyles };
export const mobileMediaQuery = `@media (max-width: ${GOVUK_BREAKPOINTS.TABLET})`;
export const desktopMediaQuery = `@media (min-width: ${GOVUK_BREAKPOINTS.TABLET})`;

// Base font styles aligned with GOV.UK
export const govukFontStyles = css`
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: ${GOVUK_COLORS.TEXT_COLOR};
  @media print {
    font-family: sans-serif;
    color: #000;
  }
`;

// GOV.UK focus styles
export const govukFocusStyles = css`
  outline: 3px solid transparent;
  color: ${GOVUK_COLORS.FOCUS_TEXT};
  background-color: ${GOVUK_COLORS.FOCUS_BG};
  box-shadow: 0 -2px ${GOVUK_COLORS.FOCUS_BG}, 0 4px ${GOVUK_COLORS.FOCUS_TEXT};
  text-decoration: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
`;

// Chart Container
export const ChartContainer = styled('div')(() => css`
  ${govukFontStyles}
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  height: 250px;
  position: relative;
  background-color: ${GOVUK_COLORS.WHITE};
  padding: 10px 0;
  overflow: hidden;

  ${desktopMediaQuery} {
    margin-top: 20px;
    margin-bottom: 30px;
    height: 400px;
    padding: 20px 0;
  }
`);

// Info Box
export const InfoBox = styled(GovUKInsetText)(() => css`
  ${govukFontStyles}
  margin-top: 10px;
  margin-bottom: 15px;

  ${desktopMediaQuery} {
    margin-bottom: 20px;
  }
`);

// Control Panel
export const ControlPanel = styled('div')(() => css`
  ${govukFontStyles}
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${desktopMediaQuery} {
    margin-bottom: 15px;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 15px;
  }
`);

// Control Button
export const ControlButton = styled('button')(({ active }) => css`
  ${govukFontStyles}
  font-size: 1rem;
  line-height: 1.25;
  padding: 5px 10px;
  border: 1px solid ${GOVUK_COLORS.BORDER_COLOR};
  background-color: ${active ? GOVUK_COLORS.LINK_COLOR : GOVUK_COLORS.WHITE};
  color: ${active ? GOVUK_COLORS.WHITE : GOVUK_COLORS.TEXT_COLOR};
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${active ? GOVUK_COLORS.LINK_HOVER : '#f1f1f1'};
  }

  &:focus {
    ${govukFocusStyles}
  }

  ${mobileMediaQuery} {
    width: 100%;
    margin-bottom: 10px;
  }

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    padding: 8px 12px;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }
`);

// Loading Spinner
export const LoadingSpinner = styled('div')(() => css`
  ${govukFontStyles}
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  &:after {
    content: "";
    width: 40px;
    height: 40px;
    border: 5px solid ${GOVUK_COLORS.BORDER_COLOR};
    border-top: 5px solid ${GOVUK_COLORS.LINK_COLOR};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`);

// Error Message
export const ErrorMessage = styled(GovUKInsetText)(() => css`
  ${govukFontStyles}
  border-left: 5px solid ${GOVUK_COLORS.RED};
  background-color: ${GOVUK_COLORS.WHITE};
  padding: 15px;
  margin-bottom: 20px;

  ${desktopMediaQuery} {
    margin-bottom: 30px;
  }
`);

// Usage Periods Table
export const UsagePeriodsTable = styled('table')(() => css`
  ${govukFontStyles}
  width: 100%;
  margin-bottom: 20px;
  border-spacing: 0;
  border-collapse: collapse;
  font-size: 1.1875rem;
  line-height: 1.3157894737;

  & th {
    font-weight: 700;
    padding: 10px 20px 10px 0;
    border-bottom: 1px solid ${GOVUK_COLORS.BORDER_COLOR};
    text-align: left;
    vertical-align: top;
  }

  & td {
    padding: 10px 20px 10px 0;
    border-bottom: 1px solid ${GOVUK_COLORS.BORDER_COLOR};
    text-align: left;
    vertical-align: top;
    font-weight: 400;
  }

  & td:not(:first-child),
  & th:not(:first-child) {
    text-align: right;
  }

  & td:first-child .period-date {
    color: ${GOVUK_COLORS.AMBER};
  }

  & tr:nth-of-type(odd),
  & tr:nth-of-type(even) {
    background-color: transparent;
  }

  & .negative-value {
    color: ${GOVUK_COLORS.RED};
    font-weight: 700;
  }

  ${mobileMediaQuery} {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  ${desktopMediaQuery} {
    margin-bottom: 30px;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.15;
  }
`);

// Table Heading
export const TableHeading = styled('h2')(() => css`
  ${govukFontStyles}
  font-size: 1.6875rem;
  line-height: 1.1111111111;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 20px;

  ${desktopMediaQuery} {
    font-size: 2.25rem;
    margin-bottom: 30px;
  }

  @media print {
    font-size: 24pt;
    line-height: 1.05;
  }
`);

// Usage Summary
export const UsageSummary = styled('div')(() => css`
  ${govukFontStyles}
  background-color: ${GOVUK_COLORS.GREY_1};
  padding: 15px;
  margin-bottom: 15px;
  border-left: 5px solid ${GOVUK_COLORS.BORDER_COLOR};

  ${desktopMediaQuery} {
    padding: 20px;
    margin-bottom: 20px;
  }

  @media print {
    background-color: transparent;
    border-left-width: 1px;
  }
`);

// Summary Grid
export const SummaryGrid = styled('div')(() => css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  ${desktopMediaQuery} {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }
`);

// Summary Item
export const SummaryItem = styled('div')(() => css`
  ${govukFontStyles}
`);

// Summary Label
export const SummaryLabel = styled(GovUKBodyS)(() => css`
  ${govukFontStyles}
  font-size: 1rem;
  line-height: 1.25;
  margin-bottom: 5px;
  color: ${GOVUK_COLORS.GREY_2};

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }
`);

// Summary Value
export const SummaryValue = styled('div')(() => css`
  ${govukFontStyles}
  font-size: 1.3125rem;
  line-height: 1.1904761905;
  font-weight: 700;

  ${desktopMediaQuery} {
    font-size: 1.5rem;
    line-height: 1.25;
  }

  @media print {
    font-size: 18pt;
    line-height: 1.15;
  }
`);

// Pattern Card
export const PatternCard = styled('div')(({ severity, isClockingAnomaly }) => css`
  ${govukFontStyles}
  padding: 15px;
  margin-bottom: 15px;
  border-left: 5px solid ${
    isClockingAnomaly ? GOVUK_COLORS.RED :
    severity === 'high' ? GOVUK_COLORS.RED :
    severity === 'medium' ? GOVUK_COLORS.AMBER :
    GOVUK_COLORS.BORDER_COLOR
  };
  background-color: ${GOVUK_COLORS.GREY_1};

  ${desktopMediaQuery} {
    padding: 20px;
    margin-bottom: 20px;
  }
`);

// Pattern Title
export const PatternTitle = styled('div')(() => css`
  ${govukFontStyles}
  font-size: 1.1875rem;
  line-height: 1.3157894737;
  font-weight: 700;
  margin-bottom: 5px;

  ${desktopMediaQuery} {
    font-size: 1.5rem;
    line-height: 1.25;
  }

  @media print {
    font-size: 18pt;
    line-height: 1.15;
  }
`);

// Pattern Detail
export const PatternDetail = styled('div')(() => css`
  ${govukFontStyles}
  font-size: 1rem;
  line-height: 1.25;
  margin-bottom: 15px;

  ${desktopMediaQuery} {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
  }

  @media print {
    font-size: 14pt;
    line-height: 1.2;
  }
`);

// Pattern Stats
export const PatternStats = styled('div')(() => css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 5px;
`);

// Stat Box
export const StatBox = styled('div')(({ color }) => css`
  ${govukFontStyles}
  padding: 5px 10px;
  background-color: ${GOVUK_COLORS.WHITE};
  border-left: 3px solid ${color || GOVUK_COLORS.BORDER_COLOR};
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
`);

// Clocking Warning
export const ClockingWarning = styled('div')(() => css`
  ${govukFontStyles}
  border-left: 5px solid ${GOVUK_COLORS.RED};
  padding: 15px;
  margin-bottom: 20px;
  background-color: ${GOVUK_COLORS.WHITE};
  display: flex;
  align-items: center;

  ${desktopMediaQuery} {
    padding: 20px;
  }
`);

// Warning Icon
export const WarningIcon = styled('div')(() => css`
  ${govukFontStyles}
  color: ${GOVUK_COLORS.RED};
  font-size: 1.5rem;
  margin-right: 10px;

  ${desktopMediaQuery} {
    font-size: 1.875rem;
    margin-right: 15px;
  }
`);

// Warning Text
export const WarningText = styled(GovUKBody)(() => css`
  ${govukFontStyles}
  color: ${GOVUK_COLORS.RED};
  font-weight: 700;
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
`);

// Hex to RGB helper function (unchanged)
export function hexToRgb(hex) {
  if (!hex) return '0, 0, 0';
  hex = String(hex).replace('#', '');
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    console.warn(`Invalid hex color: ${hex}. Using default black.`);
    return '0, 0, 0';
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}