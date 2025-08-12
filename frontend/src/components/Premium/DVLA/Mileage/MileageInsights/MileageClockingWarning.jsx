import React from 'react';
import { styled } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// MarketDash Design Tokens - Self-contained
const MarketDashColors = {
  NEGATIVE: '#ef4444',
  GRAY_800: '#1e293b',
  GRAY_600: '#475569',
  GRAY_500: '#64748b',
  WHITE: '#ffffff'
};

// Advanced MarketDash Warning Banner with Professional Styling
const WarningBanner = styled('div')`
  /* Complete MarketDash Design System */
  --negative: #ef4444;
  --negative-hover: #dc2626;
  --negative-light: #fee2e2;
  --gray-900: #0f172a;
  --gray-800: #1e293b;
  --gray-700: #334155;
  --gray-600: #475569;
  --gray-500: #64748b;
  --gray-400: #94a3b8;
  --gray-300: #cbd5e1;
  --gray-200: #e2e8f0;
  --gray-100: #f1f5f9;
  --gray-50: #f8fafc;
  --white: #ffffff;
  
  --font-main: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'Jost', sans-serif;
  --font-mono: 'JetBrains Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  --transition: all 0.2s ease;
  --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* Advanced Warning Banner Styling */
  position: relative;
  font-family: var(--font-main);
  background: linear-gradient(135deg, var(--negative-light) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 1px solid var(--negative);
  border-radius: var(--radius-base);
  padding: var(--space-2xl);
  margin-bottom: var(--space-2xl);
  box-shadow: var(--shadow-md);
  transition: var(--transition-smooth);
  overflow: hidden;
  animation: warningFadeIn 0.6s ease-out;
  
  /* Advanced top accent border */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--negative) 0%, var(--negative-hover) 100%);
    border-radius: var(--radius-base) var(--radius-base) 0 0;
  }
  
  /* Subtle pattern overlay */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(239, 68, 68, 0.02) 10px,
      rgba(239, 68, 68, 0.02) 20px
    );
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  @keyframes warningFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: var(--space-xl);
    margin-bottom: var(--space-xl);
  }
  
  @media (max-width: 480px) {
    padding: var(--space-lg);
  }
`;

// Professional Warning Title with Advanced Typography
const WarningTitle = styled('h3')`
  position: relative;
  z-index: 2;
  color: var(--negative);
  margin: 0 0 var(--space-lg) 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.25;
  
  &::before {
    content: '';
    width: 4px;
    height: 28px;
    background: linear-gradient(135deg, var(--negative) 0%, var(--negative-hover) 100%);
    border-radius: var(--radius-full);
    margin-right: var(--space-xs);
  }
  
  & svg {
    color: var(--negative);
    font-size: 1.5em;
    filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2));
  }
  
  @media (max-width: 768px) {
    font-size: var(--text-xl);
    
    &::before {
      height: 24px;
    }
  }
`;

// Advanced Metrics Grid Layout
const WarningMetricsGrid = styled('div')`
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--space-md);
    margin-top: var(--space-lg);
  }
`;

// Professional Metric Card Component
const WarningMetricCard = styled('div')`
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-base);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--negative) 0%, var(--negative-hover) 100%);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md);
  }
`;

// Professional Metric Components
const MetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--gray-500);
  margin-bottom: var(--space-xs);
`;

const MetricValue = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--negative);
  line-height: 1;
  margin-bottom: var(--space-sm);
  
  @media (max-width: 768px) {
    font-size: var(--text-lg);
  }
`;

const MetricSubtext = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.5;
`;

// Professional Legal Notice Component
const LegalNotice = styled('div')`
  position: relative;
  z-index: 2;
  margin-top: var(--space-xl);
  padding: var(--space-lg);
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gray-400) 0%, var(--gray-500) 100%);
    border-radius: var(--radius-base) var(--radius-base) 0 0;
  }
  
  & svg {
    color: var(--gray-500);
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  @media (max-width: 768px) {
    padding: var(--space-md);
    margin-top: var(--space-lg);
  }
`;

const LegalText = styled('p')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-700);
  line-height: 1.6;
  
  & strong {
    color: var(--gray-800);
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
        position: 'relative',
        zIndex: 2,
        fontFamily: 'var(--font-main)',
        fontSize: 'var(--text-base)',
        color: 'var(--gray-800)',
        lineHeight: '1.6',
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
            <MetricValue style={{ color: 'var(--gray-800)' }}>
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