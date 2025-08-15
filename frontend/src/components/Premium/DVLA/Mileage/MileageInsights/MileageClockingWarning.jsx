import React from 'react';
import { styled } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Ultra Clean Minimal Design System - Copied from DVLADataHeaderStyles.jsx
const MinimalTokens = `
  :root {
    /* Ultra Clean Color Palette - Minimal */
    --gray-900: #1a1a1a;
    --gray-800: #2d2d2d;
    --gray-700: #404040;
    --gray-600: #525252;
    --gray-500: #737373;
    --gray-400: #a3a3a3;
    --gray-300: #d4d4d4;
    --gray-200: #e5e5e5;
    --gray-100: #f5f5f5;
    --gray-50: #fafafa;
    --white: #ffffff;

    /* Minimal Accent Colors */
    --primary: #3b82f6;
    --positive: #059669;
    --negative: #dc2626;
    --warning: #d97706;

    /* Clean Spacing - Generous White Space */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;

    /* Typography - Clean Hierarchy */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;

    /* Clean Typography */
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

    /* Minimal Transitions */
    --transition: all 0.15s ease;
  }
`;

// Minimal Warning Section - No borders, shadows or decorations (matches DVLADataHeader pattern)
const WarningBanner = styled('div')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

// Clean Warning Title - Typography only (matches DVLADataHeader pattern)
const WarningTitle = styled('h3')`
  margin: 0 0 var(--space-lg) 0;
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--negative);
  letter-spacing: -0.02em;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  
  @media (max-width: 767px) {
    font-size: var(--text-lg);
  }
`;

// Clean Grid Layout (matches DVLADataHeader pattern)
const WarningMetricsGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-xl);
  margin-top: var(--space-xl);
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
`;

// Minimal Metric Group - No cards (matches DVLADataHeader MetricGroup pattern)
const WarningMetricCard = styled('div')`
  /* No background, borders, or shadows - pure minimal */
`;

// Clean Metric Label (matches DVLADataHeader MetricLabel pattern)
const MetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
`;

// Clean Metric Value (matches DVLADataHeader MetricValue pattern)
const MetricValue = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--negative);
  line-height: 1.4;
  word-break: break-word;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Clean Metric Subtext (matches DVLADataHeader pattern)
const MetricSubtext = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.4;
  margin-top: var(--space-xs);
`;

// Clean Legal Notice - Simple layout (matches DVLADataHeader pattern)
const LegalNotice = styled('div')`
  margin-top: var(--space-xl);
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  
  & svg {
    color: var(--gray-500);
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  @media (max-width: 767px) {
    margin-top: var(--space-lg);
  }
`;

// Clean Legal Text (matches DVLADataHeader typography pattern)
const LegalText = styled('p')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-700);
  line-height: 1.4;
  
  & strong {
    color: var(--gray-900);
    font-weight: 600;
  }
`;

/**
 * MileageClockingWarning Component
 * Displays a warning banner for vehicles with detected clocking
 * Styled to match GOV.UK design patterns and integrate with main insights
 */
const MileageClockingWarning = ({ anomalies, mileageStats }) => {
  if (!anomalies || anomalies.length === 0 || !anomalies.some(a => a.type === 'decrease')) {
    return null;
  }

  // Calculate the total amount of clocking (sum of all decreases)
  const totalClocking = anomalies
    .filter(a => a.type === 'decrease')
    .reduce((sum, anomaly) => sum + Math.abs(anomaly.details.diff), 0);

  // Get the largest single clocking incident
  const largestClocking = Math.max(
    ...anomalies
      .filter(a => a.type === 'decrease')
      .map(anomaly => Math.abs(anomaly.details.diff))
  );

  return (
    <WarningBanner>
      <WarningTitle>
        <WarningIcon /> Mileage Inconsistency Detected
      </WarningTitle>
      
      <p style={{
        fontFamily: 'var(--font-main)',
        fontSize: 'var(--text-base)',
        color: 'var(--gray-900)',
        lineHeight: '1.4',
        margin: '0 0 var(--space-lg) 0'
      }}>
        This vehicle has <strong style={{ color: 'var(--negative)' }}>
          {anomalies.filter(a => a.type === 'decrease').length > 1 ? 
            `${anomalies.filter(a => a.type === 'decrease').length} instances` : 
            'an instance'}
        </strong> where the recorded mileage has decreased between MOT tests. 
        This could indicate <strong>odometer tampering (clocking)</strong>, instrument cluster replacement, or MOT data entry errors.
      </p>

      <WarningMetricsGrid>
        <WarningMetricCard>
          <MetricLabel>Total Mileage Discrepancy</MetricLabel>
          <MetricValue>{totalClocking.toLocaleString()} miles</MetricValue>
          <MetricSubtext>
            Combined total of all detected decreases
          </MetricSubtext>
        </WarningMetricCard>
        
        <WarningMetricCard>
          <MetricLabel>Largest Single Discrepancy</MetricLabel>
          <MetricValue>{largestClocking.toLocaleString()} miles</MetricValue>
          <MetricSubtext>
            Biggest single mileage decrease detected
          </MetricSubtext>
        </WarningMetricCard>
        
        {mileageStats && mileageStats.adjustedValues && (
          <WarningMetricCard>
            <MetricLabel>Adjusted Annual Mileage</MetricLabel>
            <MetricValue style={{ color: 'var(--gray-900)' }}>
              {mileageStats.averageAnnualMileage?.toLocaleString() || 'Unknown'}
            </MetricValue>
            <MetricSubtext>
              miles/year (excluding inconsistent periods)
            </MetricSubtext>
          </WarningMetricCard>
        )}
      </WarningMetricsGrid>

      <LegalNotice>
        <InfoIcon fontSize="small" />
        <LegalText>
          <strong>Legal Notice:</strong> Selling a vehicle with incorrect mileage is illegal under the Consumer Protection from Unfair Trading Regulations. 
          Buyers should verify mileage independently and sellers must disclose any known discrepancies.
        </LegalText>
      </LegalNotice>
    </WarningBanner>
  );
};

export default MileageClockingWarning;