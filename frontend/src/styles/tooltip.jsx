import React from 'react';
import { styled, css } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

// Updated colors to match the chart tooltip's style
const COLORS = {
  TEXT: '#0b0c0c',
  BLACK: '#0b0c0c',
  WHITE: '#ffffff',
  BLUE: '#1d70b8', // For the left border
  MID_GREY: '#b1b4b6',
  LIGHT_GREY: '#f3f2f1',
  DARK_GREY: '#505a5f',
  YELLOW: '#fd0',
  RED: '#d4351c',
  GREEN: '#00703c',
};

// Tooltip theme constants to match chart tooltip exactly
export const TOOLTIP_CONSTANTS = {
  BORDER_WIDTH: '4px',
  FONT_FAMILY: '"GDS Transport", arial, sans-serif',
  BORDER_RADIUS: '0',
  PADDING: {
    DESKTOP: '15px',
    MOBILE: '12px'
  },
  FONT_SIZE: {
    DESKTOP: '0.9rem',
    MOBILE: '0.8rem',
    TITLE: {
      DESKTOP: '16px',
      MOBILE: '14px'
    },
    SECTION_TITLE: {
      DESKTOP: '14px',
      MOBILE: '13px'
    },
    CONTENT: {
      DESKTOP: '0.9rem',
      MOBILE: '0.8rem'
    },
    NOTE: {
      DESKTOP: '0.85rem',
      MOBILE: '0.8rem'
    },
    BULLET: {
      DESKTOP: '0.85rem',
      MOBILE: '0.8rem'
    }
  },
  WIDTH: {
    MIN: '280px',
    OPTIMAL: '320px',
    MAX_DESKTOP: '350px',
    MAX_MOBILE: 'calc(100vw - 40px)'
  },
  SHADOWS: {
    DEFAULT: '0 2px 4px rgba(0,0,0,0.2)'
  },
  DIVIDER: {
    HEIGHT: '1px',
    MARGIN: '8px 0'
  },
  SPACING: {
    TITLE_MARGIN: '6px',
    ROW_MARGIN: '4px',
    SECTION_MARGIN: '10px'
  },
  GRID: {
    LABEL_WIDTH: '40%',
    VALUE_WIDTH: '60%',
    GAP: '8px'  // Increased from 4px to match chart tooltip
  }
};

// GOV.UK Breakpoints
const GOVUK_BREAKPOINTS = {
  TABLET: '641px',
};

// Media query helpers - updated to match chart tooltip implementation
const desktopMediaQuery = `@media (min-width: ${GOVUK_BREAKPOINTS.TABLET})`;
const mobileMediaQuery = `@media (max-width: ${GOVUK_BREAKPOINTS.TABLET})`;

// GOV.UK font styles
const govukFontStyles = css`
  font-family: ${TOOLTIP_CONSTANTS.FONT_FAMILY};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: ${COLORS.TEXT};
  @media print {
    font-family: sans-serif;
    color: #000;
  }
`;

// GOV.UK focus styles
const govukFocusStyles = css`
  outline: 3px solid transparent;
  color: ${COLORS.TEXT};
  background-color: ${COLORS.YELLOW};
  box-shadow: 0 -2px ${COLORS.YELLOW}, 0 4px ${COLORS.TEXT};
  text-decoration: none;
`;

// Updated GOV.UK Tooltip Component to match chart tooltip style exactly
export const GovUKTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    ...govukFontStyles.styles,
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT,
    fontWeight: 400,
    borderLeft: `${TOOLTIP_CONSTANTS.BORDER_WIDTH} solid ${COLORS.BLUE}`,
    borderRadius: TOOLTIP_CONSTANTS.BORDER_RADIUS,
    boxShadow: TOOLTIP_CONSTANTS.SHADOWS.DEFAULT,
    padding: TOOLTIP_CONSTANTS.PADDING.DESKTOP,
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.DESKTOP,
    lineHeight: '1.4',
    width: TOOLTIP_CONSTANTS.WIDTH.OPTIMAL,
    minWidth: TOOLTIP_CONSTANTS.WIDTH.MIN,
    maxWidth: TOOLTIP_CONSTANTS.WIDTH.MAX_DESKTOP,
    wordBreak: 'break-word',
    WebkitFontSmoothing: 'antialiased', // Added to match chart tooltip
    MozOsxFontSmoothing: 'grayscale',   // Added to match chart tooltip
    [mobileMediaQuery]: {
      padding: TOOLTIP_CONSTANTS.PADDING.MOBILE,
      fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.MOBILE,
      width: 'auto', // Changed to 'auto' for mobile to match chart tooltip
      minWidth: TOOLTIP_CONSTANTS.WIDTH.MIN,
      maxWidth: TOOLTIP_CONSTANTS.WIDTH.MAX_MOBILE
    },
    '@media print': {
      display: 'none',
    },
  },
  // No arrow - matching chart tooltip
  [`& .${tooltipClasses.arrow}`]: {
    display: 'none'
  }
}));

// Tooltip Target - maintained functionality with updated styling
export const TooltipTarget = styled('span')(({ underlineStyle = 'dotted' }) => ({
  ...govukFontStyles.styles,
  borderBottom:
    underlineStyle === 'none'
      ? 'none'
      : `1px ${underlineStyle} ${COLORS.DARK_GREY}`,
  cursor: 'pointer',
  position: 'relative',
  display: 'inline',
  '&:hover': {
    borderBottomColor: COLORS.TEXT,
    textDecoration: 'underline',
  },
  '&:focus': {
    ...govukFocusStyles.styles,
  },
}));

// Tooltip Cell - maintained functionality with updated styling
export const TooltipCell = styled('td')(() => ({
  ...govukFontStyles.styles,
  '&:first-of-type': {
    fontWeight: 700,
    borderBottom: `1px dotted ${COLORS.DARK_GREY}`,
    cursor: 'pointer',
    '&:hover': {
      borderBottomColor: COLORS.TEXT,
      textDecoration: 'underline',
    },
    '&:focus': {
      ...govukFocusStyles.styles,
    },
  },
}));

// Tooltip Heading - maintained functionality with updated styling
export const TooltipHeading = styled('span')(() => ({
  ...govukFontStyles.styles,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: '700',
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.DESKTOP,
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.MOBILE
  },
  '&:hover': {
    textDecoration: 'underline',
  },
  '&:focus': {
    ...govukFocusStyles.styles,
  },
  '& .info-icon': {
    marginLeft: '8px',
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
    opacity: 0.7,
    color: 'inherit',
    verticalAlign: 'middle',
    [desktopMediaQuery]: {
      fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
    },
  },
}));

// Components from chart tooltip - Using exact same definitions
export const TooltipTitle = styled('div')({
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.TITLE_MARGIN,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.TITLE.DESKTOP,
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.TITLE.MOBILE
  }
});

export const TooltipRow = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  display: 'grid',
  gridTemplateColumns: `${TOOLTIP_CONSTANTS.GRID.LABEL_WIDTH} ${TOOLTIP_CONSTANTS.GRID.VALUE_WIDTH}`,
  columnGap: TOOLTIP_CONSTANTS.GRID.GAP,
  rowGap: '2px',
  alignItems: 'baseline',
  width: '100%',  // Ensure it takes full width
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.MOBILE
  }
});

export const TooltipLabel = styled('span')({
  fontWeight: 'bold',
  minWidth: '100px',  // Ensure minimum width for labels
  paddingRight: '4px'
});

export const TooltipValue = styled('span')({
  textAlign: 'left',
  minWidth: '120px',  // Ensure minimum width for values
  wordWrap: 'break-word'
});

export const TooltipDivider = styled('hr')({
  border: 0,
  height: TOOLTIP_CONSTANTS.DIVIDER.HEIGHT,
  backgroundColor: COLORS.MID_GREY,
  margin: TOOLTIP_CONSTANTS.DIVIDER.MARGIN,
  width: '100%'  // Ensure full width
});

export const TooltipWarningText = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
  color: COLORS.RED,
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  width: '100%',  // Ensure full width
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.MOBILE
  }
});

export const TooltipSectionTitle = styled('div')({
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.DESKTOP,
  width: '100%',  // Ensure full width
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.MOBILE
  }
});

export const TooltipNote = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.NOTE.DESKTOP,
  color: COLORS.BLACK,
  marginTop: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN + 2,
  width: '100%',  // Ensure full width
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.NOTE.MOBILE
  }
});

export const TooltipBulletList = styled('ul')({
  margin: '3px 0 0 14px',
  padding: 0,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.BULLET.DESKTOP,
  width: '100%',  // Ensure full width
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.BULLET.MOBILE
  }
});

export const TooltipBulletItem = styled('li')({
  marginBottom: '2px',
  paddingRight: '8px'
});

// Badge component from chart tooltip for status indicators
export const Badge = styled('span')(({ color }) => ({
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: '2px',
  backgroundColor: color,
  color: COLORS.WHITE,
  fontSize: '11px',
  fontWeight: 'bold',
  marginLeft: '4px'
}));

// Helper functions from chart-specific tooltip
export const getTestResultColor = (status) => {
  return status && status.includes('PASS') ? COLORS.GREEN : COLORS.RED;
};

export const formatMileage = (mileage) => {
  return mileage !== null ? Math.round(mileage).toLocaleString() : 'Not recorded';
};

export const getDaysBetween = (date1, date2) => {
  return Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
};

export const calculateMileageRates = (currentDate, previousDate, currentMileage, previousMileage) => {
  if (!previousDate || currentMileage === null || previousMileage === null) {
    return { daily: null, annual: null };
  }
  
  const days = getDaysBetween(previousDate, currentDate);
  if (days === 0) return { daily: null, annual: null };
  
  const diff = currentMileage - previousMileage;
  const daily = diff / days;
  const annual = daily * 365.25;
  
  return { 
    daily: daily.toFixed(1), 
    annual: Math.round(annual).toLocaleString() 
  };
};

// Original hooks and helper components with updated styling to match chart tooltip
export const useTooltip = () => {
  const withTooltip = (text, tooltipText, options = {}) => {
    const { placement = 'top', underlineStyle = 'dotted' } = options;
    return (
      <GovUKTooltip 
        title={
          <div>
            <TooltipTitle>{tooltipText}</TooltipTitle>
          </div>
        }
        placement={placement}
        arrow={false} // Explicitly set to false to match chart tooltip
      >
        <TooltipTarget underlineStyle={underlineStyle}>{text}</TooltipTarget>
      </GovUKTooltip>
    );
  };
  return { withTooltip };
};

// Enhanced helper component for value tooltips with more flexibility
export const ValueWithTooltip = ({ 
  children,
  tooltip,
  placement = 'top',
  withDivider = false,
  withNotes = null,
  withWarning = null
}) => (
  <GovUKTooltip 
    title={
      <div>
        <TooltipTitle>{tooltip}</TooltipTitle>
        {withWarning && (
          <>
            <TooltipWarningText>{withWarning}</TooltipWarningText>
            {withDivider && <TooltipDivider />}
          </>
        )}
        {withNotes && (
          <>
            {!withWarning && withDivider && <TooltipDivider />}
            <TooltipNote>{withNotes}</TooltipNote>
          </>
        )}
      </div>
    }
    placement={placement}
    arrow={false} // Explicitly set to false to match chart tooltip
  >
    <TooltipTarget>{children}</TooltipTarget>
  </GovUKTooltip>
);

// Enhanced helper component for table cells with tooltips
export const CellWithTooltip = ({ 
  label, 
  tooltip, 
  placement = 'top',
  withDivider = false,
  withNotes = null
}) => (
  <GovUKTooltip 
    title={
      <div>
        <TooltipTitle>{tooltip}</TooltipTitle>
        {withNotes && (
          <>
            {withDivider && <TooltipDivider />}
            <TooltipNote>{withNotes}</TooltipNote>
          </>
        )}
      </div>
    }
    placement={placement}
    arrow={false} // Explicitly set to false to match chart tooltip
  >
    <TooltipCell>{label}</TooltipCell>
  </GovUKTooltip>
);

// Enhanced helper component for section headings with tooltips
export const HeadingWithTooltip = ({
  children,
  tooltip,
  iconColor,
  placement = 'top',
  withDivider = false,
  withNotes = null,
  withWarning = null
}) => (
  <GovUKTooltip 
    title={
      <div>
        <TooltipTitle>{tooltip}</TooltipTitle>
        {withWarning && (
          <>
            <TooltipWarningText>{withWarning}</TooltipWarningText>
            {withDivider && <TooltipDivider />}
          </>
        )}
        {withNotes && (
          <>
            {!withWarning && withDivider && <TooltipDivider />}
            <TooltipNote>{withNotes}</TooltipNote>
          </>
        )}
      </div>
    }
    placement={placement}
    arrow={false} // Explicitly set to false to match chart tooltip
  >
    <TooltipHeading style={{ color: iconColor }}>
      {children}
    </TooltipHeading>
  </GovUKTooltip>
);

// Enhanced tooltip content wrapper for complex tooltips
export const ComplexTooltipContent = ({ 
  title, 
  rows = [], 
  sections = [], 
  notes, 
  warning, 
  bulletPoints = [] 
}) => (
  <div>
    <TooltipTitle>{title}</TooltipTitle>
    
    {warning && <TooltipWarningText>{warning}</TooltipWarningText>}
    
    {rows.length > 0 && rows.map((row, idx) => (
      <TooltipRow key={`row-${idx}`}>
        <TooltipLabel>{row.label}</TooltipLabel>
        <TooltipValue>{row.value}</TooltipValue>
      </TooltipRow>
    ))}
    
    {sections.length > 0 && sections.map((section, idx) => (
      <React.Fragment key={`section-${idx}`}>
        {idx > 0 && <TooltipDivider />}
        <TooltipSectionTitle>{section.title}</TooltipSectionTitle>
        {section.rows.map((row, rowIdx) => (
          <TooltipRow key={`section-${idx}-row-${rowIdx}`}>
            <TooltipLabel>{row.label}</TooltipLabel>
            <TooltipValue>{row.value}</TooltipValue>
          </TooltipRow>
        ))}
      </React.Fragment>
    ))}
    
    {bulletPoints.length > 0 && (
      <>
        <TooltipDivider />
        <TooltipBulletList>
          {bulletPoints.map((point, idx) => (
            <TooltipBulletItem key={`bullet-${idx}`}>{point}</TooltipBulletItem>
          ))}
        </TooltipBulletList>
      </>
    )}
    
    {notes && (
      <>
        <TooltipDivider />
        <TooltipNote>{notes}</TooltipNote>
      </>
    )}
  </div>
);

// Enhanced tooltip that supports complex content
export const EnhancedTooltip = ({ 
  children, 
  content, 
  placement = 'top',
  underlineStyle = 'dotted'
}) => (
  <GovUKTooltip
    title={<ComplexTooltipContent {...content} />}
    placement={placement}
    arrow={false} // Explicitly set to false to match chart tooltip
  >
    <TooltipTarget underlineStyle={underlineStyle}>{children}</TooltipTarget>
  </GovUKTooltip>
);