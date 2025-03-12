import React from 'react';
import { styled, css } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

// GOV.UK Colors (aligned with GOV.UK Frontend)
const GOVUK_COLORS = {
  TEXT: '#0b0c0c',        // Standard text color
  LIGHT_GREY: '#f3f2f1',  // Background grey for tooltips
  GREY: '#b1b4b6',        // Border and secondary elements
  DARK_GREY: '#505a5f',   // Secondary text or subtle underlines
  YELLOW: '#fd0',         // Focus yellow
  WHITE: '#ffffff',       // White for contrast
};

// GOV.UK Breakpoints
const GOVUK_BREAKPOINTS = {
  TABLET: '641px',  // 40.0625rem (matches GOV.UK tablet breakpoint)
};

// Media query helper
const desktopMediaQuery = `@media (min-width: ${GOVUK_BREAKPOINTS.TABLET})`;

// GOV.UK font styles
const govukFontStyles = css`
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
const govukFocusStyles = css`
  outline: 3px solid transparent;
  color: ${GOVUK_COLORS.TEXT};
  background-color: ${GOVUK_COLORS.YELLOW};
  box-shadow: 0 -2px ${GOVUK_COLORS.YELLOW}, 0 4px ${GOVUK_COLORS.TEXT};
  text-decoration: none;
`;

// GOV.UK Tooltip Component
export const GovUKTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: GOVUK_COLORS.GREY, // Matches tooltip border
  },
  [`& .${tooltipClasses.tooltip}`]: {
    ...govukFontStyles.styles, // Spread CSS object
    backgroundColor: GOVUK_COLORS.LIGHT_GREY,
    color: GOVUK_COLORS.TEXT,
    fontWeight: 400,
    fontSize: '1rem', // 16px
    lineHeight: 1.25,
    padding: '10px 15px',
    maxWidth: 300, // GOV.UK prefers readable text widths
    border: `1px solid ${GOVUK_COLORS.GREY}`,
    [desktopMediaQuery]: {
      fontSize: '1.1875rem', // 19px
      lineHeight: 1.3157894737,
      padding: '15px 20px',
    },
    '@media print': {
      display: 'none', // Tooltips hidden in print
    },
  },
}));

// Tooltip Trigger (e.g., span or inline element)
export const TooltipTarget = styled('span')(({ underlineStyle = 'dotted' }) => ({
  ...govukFontStyles.styles,
  borderBottom:
    underlineStyle === 'none'
      ? 'none'
      : `1px ${underlineStyle} ${GOVUK_COLORS.DARK_GREY}`,
  cursor: 'pointer', // Changed from 'help' to align with GOV.UK interactivity
  position: 'relative',
  display: 'inline',
  '&:hover': {
    borderBottomColor: GOVUK_COLORS.TEXT, // Subtle hover effect
    textDecoration: 'underline', // Matches GOV.UK link hover
  },
  '&:focus': {
    ...govukFocusStyles.styles,
  },
}));

// Tooltip Cell (for tables)
export const TooltipCell = styled('td')(() => ({
  ...govukFontStyles.styles,
  '&:first-of-type': {
    fontWeight: 700,
    borderBottom: `1px dotted ${GOVUK_COLORS.DARK_GREY}`,
    cursor: 'pointer',
    '&:hover': {
      borderBottomColor: GOVUK_COLORS.TEXT,
      textDecoration: 'underline',
    },
    '&:focus': {
      ...govukFocusStyles.styles,
    },
  },
}));

// Tooltip Heading (with optional icon)
export const TooltipHeading = styled('span')(() => ({
  ...govukFontStyles.styles,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  '&:hover': {
    textDecoration: 'underline',
  },
  '&:focus': {
    ...govukFocusStyles.styles,
  },
  '& .info-icon': {
    marginLeft: '8px',
    fontSize: '1rem', // 16px
    opacity: 0.7,
    color: 'inherit',
    verticalAlign: 'middle',
    [desktopMediaQuery]: {
      fontSize: '1.1875rem', // 19px
    },
  },
}));

// Hook for tooltip usage
export const useTooltip = () => {
  const withTooltip = (text, tooltipText, options = {}) => {
    const { placement = 'top', underlineStyle = 'dotted' } = options;
    return (
      <GovUKTooltip title={tooltipText} arrow placement={placement}>
        <TooltipTarget underlineStyle={underlineStyle}>{text}</TooltipTarget>
      </GovUKTooltip>
    );
  };
  return { withTooltip };
};

// Helper component for value tooltips
export const ValueWithTooltip = ({ children, tooltip, placement = 'top' }) => (
  <GovUKTooltip title={tooltip} arrow placement={placement}>
    <TooltipTarget>{children}</TooltipTarget>
  </GovUKTooltip>
);

// Helper component for table cells with tooltips
export const CellWithTooltip = ({ label, tooltip, placement = 'top' }) => (
  <GovUKTooltip title={tooltip} arrow placement={placement}>
    <TooltipCell>{label}</TooltipCell>
  </GovUKTooltip>
);

// Helper component for section headings with tooltips
export const HeadingWithTooltip = ({
  children,
  tooltip,
  iconColor,
  placement = 'top',
}) => (
  <GovUKTooltip title={tooltip} arrow placement={placement}>
    <TooltipHeading style={{ color: iconColor }}>
      {children}
      {/* Assuming an icon is passed as a child or via CSS */}
    </TooltipHeading>
  </GovUKTooltip>
);