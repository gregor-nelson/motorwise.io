import React, { useState, useRef, useEffect } from 'react';

// Core Tooltip Component with positioning logic
export const GovUKTooltip = ({ children, title, placement = 'top', arrow = false, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top, left;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }

    // Viewport boundary checks
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) left = viewportWidth - tooltipRect.width - 8;
    if (top < 8) top = triggerRect.bottom + 8;
    if (top + tooltipRect.height > viewportHeight - 8) top = triggerRect.top - tooltipRect.height - 8;

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
    setTimeout(calculatePosition, 0);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        {...props}
      >
        {children}
      </span>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-neutral-700 leading-relaxed w-64 sm:w-72 md:w-80 lg:w-96 max-w-[calc(100vw-16px)] break-words print:hidden"
          style={{
            top: `${position.top + window.scrollY}px`,
            left: `${position.left + window.scrollX}px`,
          }}
        >
          {title}
        </div>
      )}
    </>
  );
};

// Tooltip Target Component
export const TooltipTarget = ({ children, underlineStyle = 'dotted', className = '', ...props }) => {
  const borderClass = underlineStyle === 'none' ? '' : 'border-b border-dotted border-neutral-600';
  
  return (
    <span
      className={`inline cursor-pointer relative ${borderClass} hover:border-neutral-900 hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:bg-yellow-600 focus:text-neutral-900 focus:no-underline ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Tooltip Cell Component
export const TooltipCell = ({ children, className = '', ...props }) => {
  return (
    <td
      className={`first:font-bold first:border-b first:border-dotted first:border-neutral-600 first:cursor-pointer first:hover:border-neutral-900 first:hover:underline first:focus:outline-none first:focus:ring-2 first:focus:ring-yellow-600 first:focus:bg-yellow-600 first:focus:text-neutral-900 first:focus:no-underline ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

// Tooltip Heading Component
export const TooltipHeading = ({ children, style, className = '', ...props }) => {
  return (
    <span
      className={`inline-flex items-center cursor-pointer font-bold text-xs md:text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:bg-yellow-600 focus:text-neutral-900 focus:no-underline ${className}`}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
};

// Tooltip Content Components
export const TooltipTitle = ({ children, className = '', ...props }) => (
  <div className={`font-bold mb-1 text-sm md:text-base ${className}`} {...props}>
    {children}
  </div>
);

export const TooltipRow = ({ children, className = '', ...props }) => (
  <div className={`grid grid-cols-[40%_60%] gap-x-1 gap-y-0.5 items-baseline w-full mb-1 text-xs md:text-sm ${className}`} {...props}>
    {children}
  </div>
);

export const TooltipLabel = ({ children, className = '', ...props }) => (
  <span className={`font-bold min-w-[100px] pr-1 ${className}`} {...props}>
    {children}
  </span>
);

export const TooltipValue = ({ children, className = '', ...props }) => (
  <span className={`text-left min-w-[120px] break-words ${className}`} {...props}>
    {children}
  </span>
);

export const TooltipDivider = ({ className = '', ...props }) => (
  <hr className={`border-0 h-px bg-neutral-500 my-1 w-full ${className}`} {...props} />
);

export const TooltipWarningText = ({ children, className = '', ...props }) => (
  <div className={`text-xs md:text-sm text-red-600 font-bold mb-1 w-full ${className}`} {...props}>
    {children}
  </div>
);

export const TooltipSectionTitle = ({ children, className = '', ...props }) => (
  <div className={`font-bold mb-1 text-xs md:text-sm w-full ${className}`} {...props}>
    {children}
  </div>
);

export const TooltipNote = ({ children, className = '', ...props }) => (
  <div className={`text-xs text-neutral-700 mt-1.5 w-full ${className}`} {...props}>
    {children}
  </div>
);

export const TooltipBulletList = ({ children, className = '', ...props }) => (
  <ul className={`ml-3.5 p-0 text-xs w-full mt-1 ${className}`} {...props}>
    {children}
  </ul>
);

export const TooltipBulletItem = ({ children, className = '', ...props }) => (
  <li className={`mb-0.5 pr-1 ${className}`} {...props}>
    {children}
  </li>
);

// Badge Component
export const Badge = ({ children, color, className = '', ...props }) => {
  const bgColor = color === '#059669' ? 'bg-green-600' : 
                  color === '#dc2626' ? 'bg-red-600' : 
                  color === '#d97706' ? 'bg-yellow-600' : 'bg-blue-600';
  
  return (
    <span
      className={`inline-block px-1 py-0.5 rounded-sm ${bgColor} text-white text-xs font-bold ml-1 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Helper Functions
export const getTestResultColor = (status) => {
  return status && status.includes('PASS') ? '#059669' : '#dc2626';
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

// Tooltip Hook
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

// Wrapper Components - Preserving Full API Compatibility
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