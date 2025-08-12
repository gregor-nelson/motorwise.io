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

// Self-contained MarketDash styled components
const WarningBanner = styled('div')`
  /* MarketDash Design Tokens - Inline Definition */
  --negative: #ef4444;
  --gray-800: #1e293b;
  --gray-600: #475569;
  --gray-500: #64748b;
  --white: #ffffff;
  --font-main: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --radius-sm: 0.125rem;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --transition: all 0.2s ease;
  
  font-family: var(--font-main);
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 4px solid var(--negative);
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  @media (max-width: 768px) {
    padding: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }
`;

const WarningTitle = styled('h3')`
  color: var(--negative);
  margin-bottom: var(--space-lg);
  margin-top: 0;
  display: flex;
  align-items: center;
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  
  & svg {
    margin-right: var(--space-sm);
    color: var(--negative);
  }
`;

const WarningRow = styled('div')`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid rgba(239, 68, 68, 0.3);
  gap: var(--space-md);
`;

const WarningColumn = styled('div')`
  flex: 1;
  min-width: 200px;
  margin-bottom: var(--space-sm);
  
  @media (max-width: 768px) {
    margin-bottom: var(--space-md);
  }
`;

const WarningValue = styled('span')`
  font-family: var(--font-main);
  color: var(--negative);
  font-weight: 700;
  font-size: var(--text-base);
`;

const LegalNote = styled('p')`
  margin-top: var(--space-lg);
  color: var(--gray-600);
  display: flex;
  align-items: center;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  line-height: 1.5;
  margin-bottom: 0;
  
  & svg {
    margin-right: var(--space-sm);
    color: var(--gray-500);
    flex-shrink: 0;
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
        color: 'var(--gray-800)',
        lineHeight: '1.5',
        margin: '0 0 var(--space-md) 0'
      }}>
        This vehicle has {anomalies.filter(a => a.type === 'decrease').length > 1 ? 
          `${anomalies.filter(a => a.type === 'decrease').length} instances` : 
          'an instance'} where the recorded mileage has decreased between MOT tests. 
        This could indicate odometer tampering (clocking), instrument cluster replacement, or MOT data entry errors.
      </p>

      <WarningRow>
        <WarningColumn>
          <p style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-600)',
            margin: '0 0 var(--space-xs) 0',
            fontWeight: '600'
          }}>
            Total Mileage Discrepancy:
          </p>
          <div>
            <WarningValue>{totalClocking.toLocaleString()} miles</WarningValue>
          </div>
        </WarningColumn>
        
        <WarningColumn>
          <p style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-600)',
            margin: '0 0 var(--space-xs) 0',
            fontWeight: '600'
          }}>
            Largest Single Discrepancy:
          </p>
          <div>
            <WarningValue>{largestClocking.toLocaleString()} miles</WarningValue>
          </div>
        </WarningColumn>
        
        {mileageStats && mileageStats.adjustedValues && (
          <WarningColumn>
            <p style={{
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-sm)',
              color: 'var(--gray-600)',
              margin: '0 0 var(--space-xs) 0',
              fontWeight: '600'
            }}>
              Adjusted Annual Mileage:
            </p>
            <div style={{
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-base)',
              fontWeight: '700',
              color: 'var(--gray-800)'
            }}>
              {mileageStats.averageAnnualMileage?.toLocaleString() || 'Unknown'} miles/year
            </div>
          </WarningColumn>
        )}
      </WarningRow>

      <LegalNote>
        <InfoIcon fontSize="small" />
        <strong>Legal note:</strong> Selling a vehicle with incorrect mileage is illegal under the Consumer Protection from Unfair Trading Regulations.
      </LegalNote>
    </WarningBanner>
  );
};

export default MileageClockingWarning;