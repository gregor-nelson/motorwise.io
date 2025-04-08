import React from 'react';
import { styled, css } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

// Import theme constants to ensure consistency
import { 
  COLORS, 
  SPACING, 
  FONT_SIZES, 
  LINE_HEIGHTS, 
  BREAKPOINTS,
  commonFontStyles,
  focusStyles,
  respondTo
} from './theme';

// Align tooltip constants with theme
export const TOOLTIP_CONSTANTS = {
  BORDER_WIDTH: '4px',
  FONT_FAMILY: '"GDS Transport", arial, sans-serif', // This matches the theme
  BORDER_RADIUS: '0',
  PADDING: {
    DESKTOP: SPACING.M,
    MOBILE: SPACING.S
  },
  FONT_SIZE: {
    DESKTOP: FONT_SIZES.S,
    MOBILE: FONT_SIZES.XS,
    TITLE: {
      DESKTOP: FONT_SIZES.M,
      MOBILE: FONT_SIZES.S
    },
    SECTION_TITLE: {
      DESKTOP: FONT_SIZES.S,
      MOBILE: FONT_SIZES.XS
    },
    CONTENT: {
      DESKTOP: FONT_SIZES.S,
      MOBILE: FONT_SIZES.XS
    },
    NOTE: {
      DESKTOP: FONT_SIZES.XS,
      MOBILE: FONT_SIZES.XS
    },
    BULLET: {
      DESKTOP: FONT_SIZES.XS,
      MOBILE: FONT_SIZES.XS
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
    MARGIN: `${SPACING.XS} 0`
  },
  SPACING: {
    TITLE_MARGIN: SPACING.XS,
    ROW_MARGIN: SPACING.XS,
    SECTION_MARGIN: SPACING.S
  },
  GRID: {
    LABEL_WIDTH: '40%',
    VALUE_WIDTH: '60%',
    GAP: SPACING.XS
  }
};

// Use theme breakpoints instead of custom ones
const desktopMediaQuery = `@media (min-width: ${BREAKPOINTS.MOBILE})`;
const mobileMediaQuery = `@media (max-width: ${BREAKPOINTS.MOBILE})`;

// Updated GOV.UK Tooltip Component to match theme
export const GovUKTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    ...commonFontStyles.styles,
    backgroundColor: COLORS.WHITE,
    color: COLORS.BLACK,
    fontWeight: 400,
    borderLeft: `${TOOLTIP_CONSTANTS.BORDER_WIDTH} solid ${COLORS.BLUE}`,
    borderRadius: TOOLTIP_CONSTANTS.BORDER_RADIUS,
    boxShadow: TOOLTIP_CONSTANTS.SHADOWS.DEFAULT,
    padding: TOOLTIP_CONSTANTS.PADDING.DESKTOP,
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.DESKTOP,
    lineHeight: LINE_HEIGHTS.S,
    width: TOOLTIP_CONSTANTS.WIDTH.OPTIMAL,
    minWidth: TOOLTIP_CONSTANTS.WIDTH.MIN,
    maxWidth: TOOLTIP_CONSTANTS.WIDTH.MAX_DESKTOP,
    wordBreak: 'break-word',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    [mobileMediaQuery]: {
      padding: TOOLTIP_CONSTANTS.PADDING.MOBILE,
      fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.MOBILE,
      width: 'auto',
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

// Tooltip Target with theme-aligned styling
export const TooltipTarget = styled('span')(({ underlineStyle = 'dotted' }) => ({
  ...commonFontStyles.styles,
  borderBottom:
    underlineStyle === 'none'
      ? 'none'
      : `1px ${underlineStyle} ${COLORS.DARK_GREY}`,
  cursor: 'pointer',
  position: 'relative',
  display: 'inline',
  '&:hover': {
    borderBottomColor: COLORS.BLACK,
    textDecoration: 'underline',
  },
  '&:focus': {
    ...focusStyles.styles,
  },
}));

// Tooltip Cell with theme-aligned styling
export const TooltipCell = styled('td')(() => ({
  ...commonFontStyles.styles,
  '&:first-of-type': {
    fontWeight: 700,
    borderBottom: `1px dotted ${COLORS.DARK_GREY}`,
    cursor: 'pointer',
    '&:hover': {
      borderBottomColor: COLORS.BLACK,
      textDecoration: 'underline',
    },
    '&:focus': {
      ...focusStyles.styles,
    },
  },
}));

// Tooltip Heading with theme-aligned styling
export const TooltipHeading = styled('span')(() => ({
  ...commonFontStyles.styles,
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
    ...focusStyles.styles,
  },
  '& .info-icon': {
    marginLeft: SPACING.XS,
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
    opacity: 0.7,
    color: 'inherit',
    verticalAlign: 'middle',
    [desktopMediaQuery]: {
      fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
    },
  },
}));

// Components from chart tooltip - Using theme constants
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
  width: '100%',
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.MOBILE
  }
});

export const TooltipLabel = styled('span')({
  fontWeight: 'bold',
  minWidth: '100px',
  paddingRight: SPACING.XS
});

export const TooltipValue = styled('span')({
  textAlign: 'left',
  minWidth: '120px',
  wordWrap: 'break-word'
});

export const TooltipDivider = styled('hr')({
  border: 0,
  height: TOOLTIP_CONSTANTS.DIVIDER.HEIGHT,
  backgroundColor: COLORS.MID_GREY,
  margin: TOOLTIP_CONSTANTS.DIVIDER.MARGIN,
  width: '100%'
});

export const TooltipWarningText = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
  color: COLORS.RED,
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  width: '100%',
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.MOBILE
  }
});

export const TooltipSectionTitle = styled('div')({
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.DESKTOP,
  width: '100%',
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.MOBILE
  }
});

export const TooltipNote = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.NOTE.DESKTOP,
  color: COLORS.BLACK,
  marginTop: parseInt(TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN) + 2,
  width: '100%',
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.NOTE.MOBILE
  }
});

export const TooltipBulletList = styled('ul')({
  margin: `${SPACING.XS} 0 0 14px`,
  padding: 0,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.BULLET.DESKTOP,
  width: '100%',
  [mobileMediaQuery]: {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.BULLET.MOBILE
  }
});

export const TooltipBulletItem = styled('li')({
  marginBottom: '2px',
  paddingRight: SPACING.XS
});

// Badge component aligned with theme colors
export const Badge = styled('span')(({ color }) => ({
  display: 'inline-block',
  padding: `1px ${SPACING.XS}`,
  borderRadius: '2px',
  backgroundColor: color,
  color: COLORS.WHITE,
  fontSize: '11px',
  fontWeight: 'bold',
  marginLeft: SPACING.XS
}));

// Helper functions with theme colors
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

// Helper components with theme-aligned styling
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
        arrow={false}
      >
        <TooltipTarget underlineStyle={underlineStyle}>{text}</TooltipTarget>
      </GovUKTooltip>
    );
  };
  return { withTooltip };
};

// Enhanced helper component for value tooltips
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
    arrow={false}
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
    arrow={false}
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
    arrow={false}
  >
    <TooltipHeading style={{ color: iconColor }}>
      {children}
    </TooltipHeading>
  </GovUKTooltip>
);

// Enhanced tooltip content wrapper
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
    arrow={false}
  >
    <TooltipTarget underlineStyle={underlineStyle}>{children}</TooltipTarget>
  </GovUKTooltip>
);