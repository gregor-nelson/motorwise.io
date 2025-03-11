import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { COLORS, commonFontStyles } from './theme';

export const GovUKTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: COLORS.BLACK,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    ...commonFontStyles,
    backgroundColor: COLORS.BLACK,
    color: COLORS.WHITE,
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: 1.25,
    padding: '10px 15px',
    maxWidth: 300,
    border: `1px solid ${COLORS.BLACK}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    '@media (min-width: 40.0625em)': {
      fontSize: '19px',
      lineHeight: 1.3157894737,
    }
  },
}));

export const TooltipTarget = styled('span')(({ underlineStyle = 'dotted' }) => ({
  borderBottom: underlineStyle === 'none' ? 'none' : `1px ${underlineStyle} ${COLORS.DARK_GREY}`,
  cursor: 'help',
  position: 'relative',
  display: 'inline',
  '&:hover': {
    borderBottomColor: COLORS.BLACK,
  }
}));

export const TooltipCell = styled('td')({
  '&:first-of-type': {
    fontWeight: 700,
    borderBottom: `1px dotted ${COLORS.DARK_GREY}`,
    cursor: 'help',
    '&:hover': {
      borderBottomColor: COLORS.BLACK,
    }
  }
});

export const TooltipHeading = styled('span')({
  cursor: 'help',
  display: 'inline-flex',
  alignItems: 'center',
  '& .info-icon': {
    marginLeft: '8px',
    fontSize: '16px',
    opacity: 0.7,
    color: 'inherit',
    verticalAlign: 'middle',
  }
});

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
export const HeadingWithTooltip = ({ children, tooltip, iconColor, placement = 'top' }) => (
  <GovUKTooltip title={tooltip} arrow placement={placement}>
    <TooltipHeading iconColor={iconColor} style={{ cursor: 'help' }}>
      {children}
    </TooltipHeading>
  </GovUKTooltip>
);