import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

// Ultra Clean Minimal Design System - Tooltip Tokens
const TooltipTokens = `
  :root {
    /* Ultra Clean Color Palette - Tooltip */
    --tooltip-bg: #ffffff;
    --tooltip-text: #1a1a1a;
    --tooltip-border: #3b82f6;
    --tooltip-border-light: #d4d4d4;
    --tooltip-shadow: rgba(0, 0, 0, 0.1);
    
    /* Semantic Colors */
    --tooltip-positive: #059669;
    --tooltip-negative: #dc2626;
    --tooltip-warning: #d97706;
    --tooltip-gray-light: #f5f5f5;
    --tooltip-gray-mid: #737373;
    --tooltip-gray-dark: #404040;
    
    /* Clean Spacing - Generous White Space */
    --tooltip-space-xs: 0.25rem;
    --tooltip-space-sm: 0.5rem;
    --tooltip-space-md: 1rem;
    --tooltip-space-lg: 1.5rem;
    --tooltip-space-xl: 2rem;
    
    /* Typography - Clean Hierarchy */
    --tooltip-text-xs: 0.75rem;
    --tooltip-text-sm: 0.875rem;
    --tooltip-text-base: 1rem;
    --tooltip-text-lg: 1.125rem;
    --tooltip-text-xl: 1.25rem;
    --tooltip-text-2xl: 1.5rem;
    
    /* Clean Typography */
    --tooltip-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --tooltip-font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
    
    /* Minimal Dimensions */
    --tooltip-width-min: 280px;
    --tooltip-width-optimal: 320px;
    --tooltip-width-max: 350px;
    --tooltip-border-width: 4px;
    
    /* Clean Transitions */
    --tooltip-transition: all 0.15s ease;
  }
`;


// Clean media queries - minimal approach
const mobileMediaQuery = '@media (max-width: 767px)';
const desktopMediaQuery = '@media (min-width: 768px)';

// Ultra Clean Tooltip Component - CSS Variables Approach
export const GovUKTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))`
  ${TooltipTokens}
  
  & .${tooltipClasses.tooltip} {
    font-family: var(--tooltip-font);
    background: var(--tooltip-bg);
    color: var(--tooltip-text);
    font-weight: 400;
    border-left: var(--tooltip-border-width) solid var(--tooltip-border);
    border-radius: 0;
    box-shadow: 0 2px 4px var(--tooltip-shadow);
    padding: var(--tooltip-space-md);
    font-size: var(--tooltip-text-sm);
    line-height: 1.25;
    width: var(--tooltip-width-optimal);
    min-width: var(--tooltip-width-min);
    max-width: var(--tooltip-width-max);
    word-break: break-word;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    ${mobileMediaQuery} {
      padding: var(--tooltip-space-sm);
      font-size: var(--tooltip-text-xs);
      width: auto;
      min-width: var(--tooltip-width-min);
      max-width: calc(100vw - 40px);
    }
    
    @media print {
      display: none;
    }
  }
  
  & .${tooltipClasses.arrow} {
    display: none;
  }
`;

// Clean Tooltip Target - CSS Variables
export const TooltipTarget = styled('span', {
  shouldForwardProp: (prop) => prop !== 'underlineStyle'
})`
  ${TooltipTokens}
  
  font-family: var(--tooltip-font);
  border-bottom: ${({ underlineStyle = 'dotted' }) =>
    underlineStyle === 'none' ? 'none' : `1px ${underlineStyle} var(--tooltip-gray-dark)`};
  cursor: pointer;
  position: relative;
  display: inline;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  &:hover {
    border-bottom-color: var(--tooltip-text);
    text-decoration: underline;
  }
  
  &:focus {
    outline: 3px solid var(--tooltip-warning);
    color: var(--tooltip-text);
    background-color: var(--tooltip-warning);
    box-shadow: 0 -2px var(--tooltip-warning), 0 4px var(--tooltip-text);
    text-decoration: none;
  }
`;

// Clean Tooltip Cell - CSS Variables
export const TooltipCell = styled('td')`
  ${TooltipTokens}
  
  font-family: var(--tooltip-font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  &:first-of-type {
    font-weight: 700;
    border-bottom: 1px dotted var(--tooltip-gray-dark);
    cursor: pointer;
    
    &:hover {
      border-bottom-color: var(--tooltip-text);
      text-decoration: underline;
    }
    
    &:focus {
      outline: 3px solid var(--tooltip-warning);
      color: var(--tooltip-text);
      background-color: var(--tooltip-warning);
      box-shadow: 0 -2px var(--tooltip-warning), 0 4px var(--tooltip-text);
      text-decoration: none;
    }
  }
`;

// Clean Tooltip Heading - CSS Variables
export const TooltipHeading = styled('span')`
  ${TooltipTokens}
  
  font-family: var(--tooltip-font);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  font-size: var(--tooltip-text-sm);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  ${mobileMediaQuery} {
    font-size: var(--tooltip-text-xs);
  }
  
  &:hover {
    text-decoration: underline;
  }
  
  &:focus {
    outline: 3px solid var(--tooltip-warning);
    color: var(--tooltip-text);
    background-color: var(--tooltip-warning);
    box-shadow: 0 -2px var(--tooltip-warning), 0 4px var(--tooltip-text);
    text-decoration: none;
  }
  
  & .info-icon {
    margin-left: var(--tooltip-space-xs);
    font-size: var(--tooltip-text-sm);
    opacity: 0.7;
    color: inherit;
    vertical-align: middle;
    
    ${desktopMediaQuery} {
      font-size: var(--tooltip-text-sm);
    }
  }
`;

// Clean Tooltip Title - CSS Variables
export const TooltipTitle = styled('div')`
  ${TooltipTokens}
  
  font-weight: 700;
  margin-bottom: var(--tooltip-space-xs);
  font-size: var(--tooltip-text-base);
  
  ${mobileMediaQuery} {
    font-size: var(--tooltip-text-sm);
  }
`;

export const TooltipRow = styled('div')`
  ${TooltipTokens}
  
  font-size: var(--tooltip-text-sm);
  margin-bottom: var(--tooltip-space-xs);
  display: grid;
  grid-template-columns: 40% 60%;
  column-gap: var(--tooltip-space-xs);
  row-gap: 2px;
  align-items: baseline;
  width: 100%;
  
  ${mobileMediaQuery} {
    font-size: var(--tooltip-text-xs);
  }
`;

export const TooltipLabel = styled('span')`
  ${TooltipTokens}
  
  font-weight: bold;
  min-width: 100px;
  padding-right: var(--tooltip-space-xs);
`;

export const TooltipValue = styled('span')`
  ${TooltipTokens}
  
  text-align: left;
  min-width: 120px;
  word-wrap: break-word;
`;

export const TooltipDivider = styled('hr')`
  ${TooltipTokens}
  
  border: 0;
  height: 1px;
  background-color: var(--tooltip-gray-mid);
  margin: var(--tooltip-space-xs) 0;
  width: 100%;
`;

export const TooltipWarningText = styled('div')`
  ${TooltipTokens}
  
  font-size: var(--tooltip-text-sm);
  color: var(--tooltip-negative);
  font-weight: 700;
  margin-bottom: var(--tooltip-space-xs);
  width: 100%;
  
  ${mobileMediaQuery} {
    font-size: var(--tooltip-text-xs);
  }
`;

export const TooltipSectionTitle = styled('div')`
  ${TooltipTokens}
  
  font-weight: 700;
  margin-bottom: var(--tooltip-space-xs);
  font-size: var(--tooltip-text-sm);
  width: 100%;
  
  ${mobileMediaQuery} {
    font-size: var(--tooltip-text-xs);
  }
`;

export const TooltipNote = styled('div')`
  ${TooltipTokens}
  
  font-size: var(--tooltip-text-xs);
  color: var(--tooltip-text);
  margin-top: calc(var(--tooltip-space-xs) + 2px);
  width: 100%;
  
  ${mobileMediaQuery} {
    font-size: var(--tooltip-text-xs);
  }
`;

export const TooltipBulletList = styled('ul')`
  ${TooltipTokens}
  
  margin: var(--tooltip-space-xs) 0 0 14px;
  padding: 0;
  font-size: var(--tooltip-text-xs);
  width: 100%;
  
  ${mobileMediaQuery} {
    font-size: var(--tooltip-text-xs);
  }
`;

export const TooltipBulletItem = styled('li')`
  ${TooltipTokens}
  
  margin-bottom: 2px;
  padding-right: var(--tooltip-space-xs);
`;

// Clean Badge Component - CSS Variables
export const Badge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'color'
})`
  ${TooltipTokens}
  
  display: inline-block;
  padding: 1px var(--tooltip-space-xs);
  border-radius: 2px;
  background-color: ${({ color }) => color || 'var(--tooltip-border)'};
  color: var(--tooltip-bg);
  font-size: 11px;
  font-weight: bold;
  margin-left: var(--tooltip-space-xs);
`;

// Clean Helper Functions - CSS Variables
export const getTestResultColor = (status) => {
  return status && status.includes('PASS') ? 'var(--tooltip-positive)' : 'var(--tooltip-negative)';
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

// Clean Helper Hook - Minimal Approach
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

// Clean Value Tooltip Component
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

// Clean Cell Tooltip Component
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

// Clean Heading Tooltip Component
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

// Clean Complex Tooltip Content
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

// Clean Enhanced Tooltip Component
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