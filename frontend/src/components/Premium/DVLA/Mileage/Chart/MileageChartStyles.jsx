import React from 'react';

// Local color constants (detached from legacy theme)
export const CHART_COLORS = {
  WHITE: '#ffffff',
  GRAY_100: '#f1f5f9',
  GRAY_200: '#e2e8f0',
  GRAY_300: '#cbd5e1',
  GRAY_600: '#475569',
  GRAY_800: '#1e293b',
  GRAY_900: '#0f172a',
  BLUE: '#3b82f6',
  RED: '#ef4444',
  RED_DARK: '#dc2626',
  POSITIVE: '#10b981',
  NEGATIVE: '#ef4444',
  WARNING: '#f59e0b',
  PURPLE: '#8b5cf6'
};

// Chart styling components (detached from legacy GovUK components)
export const ChartHeader = ({ children, ...props }) => (
  <h3 
    style={{
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
      color: CHART_COLORS.GRAY_900,
      fontFamily: '"Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}
    {...props}
  >
    {children}
  </h3>
);

export const ChartSectionBreak = (props) => (
  <div 
    style={{
      marginBottom: '1.5rem'
    }}
    {...props}
  />
);

export const ChartGridRow = ({ children, ...props }) => (
  <div 
    style={{
      display: 'block',
      width: '100%'
    }}
    {...props}
  >
    {children}
  </div>
);

export const ChartCaption = ({ children, ...props }) => (
  <p 
    style={{
      fontSize: '0.875rem',
      color: CHART_COLORS.GRAY_600,
      marginBottom: '1rem',
      fontFamily: '"Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}
    {...props}
  >
    {children}
  </p>
);

export const ChartBody = ({ children, ...props }) => (
  <p 
    style={{
      fontSize: '1rem',
      lineHeight: '1.5',
      color: CHART_COLORS.GRAY_800,
      fontFamily: '"Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}
    {...props}
  >
    {children}
  </p>
);

export const ChartInsetText = ({ children, ...props }) => (
  <div 
    style={{
      padding: '1rem',
      backgroundColor: '#f8fafc',
      border: `1px solid ${CHART_COLORS.GRAY_200}`,
      borderRadius: '0.5rem',
      marginTop: '1rem'
    }}
    {...props}
  >
    {children}
  </div>
);