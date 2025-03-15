import React from 'react';
import { 
  GovUKBody,
  GovUKBodyS,
  GovUKHeadingS,
  COLORS 
} from '../../../../../styles/theme';
import { styled, css } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Helper function to convert hex to rgb values
const hexToRgb = (hex) => {
  if (!hex) return '0,0,0';
  
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '0,0,0';
};

// Styled components using MUI's styled API
const WarningBanner = styled('div')(({ theme }) => css`
  background-color: rgba(${hexToRgb(COLORS.RED)}, 0.1);
  border-left: 5px solid ${COLORS.RED};
  padding: 20px;
  margin-bottom: 20px;
`);

const WarningTitle = styled(GovUKHeadingS)(({ theme }) => css`
  color: ${COLORS.RED};
  margin-bottom: 10px;
  margin-top: 0;
  display: flex;
  align-items: center;
  
  & svg {
    margin-right: 10px;
  }
`);

const WarningRow = styled('div')(({ theme }) => css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(${hexToRgb(COLORS.RED)}, 0.3);
`);

const WarningColumn = styled('div')(({ theme }) => css`
  flex: 1;
  min-width: 200px;
  padding-right: 10px;
  margin-bottom: 10px;
`);

const WarningValue = styled('span')(({ theme }) => css`
  color: ${COLORS.RED};
  font-weight: bold;
`);

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
      
      <GovUKBody>
        This vehicle has {anomalies.filter(a => a.type === 'decrease').length > 1 ? 
          `${anomalies.filter(a => a.type === 'decrease').length} instances` : 
          'an instance'} where the recorded mileage has decreased between MOT tests. 
        This could indicate odometer tampering (clocking), instrument cluster replacement, or MOT data entry errors.
      </GovUKBody>

      <WarningRow>
        <WarningColumn>
          <GovUKBodyS><strong>Total Mileage Discrepancy:</strong></GovUKBodyS>
          <GovUKBody>
            <WarningValue>{totalClocking.toLocaleString()} miles</WarningValue>
          </GovUKBody>
        </WarningColumn>
        
        <WarningColumn>
          <GovUKBodyS><strong>Largest Single Discrepancy:</strong></GovUKBodyS>
          <GovUKBody>
            <WarningValue>{largestClocking.toLocaleString()} miles</WarningValue>
          </GovUKBody>
        </WarningColumn>
        
        {mileageStats && mileageStats.adjustedValues && (
          <WarningColumn>
            <GovUKBodyS><strong>Adjusted Annual Mileage:</strong></GovUKBodyS>
            <GovUKBody style={{ fontWeight: 'bold' }}>
              {mileageStats.averageAnnualMileage?.toLocaleString() || 'Unknown'} miles/year
            </GovUKBody>
          </WarningColumn>
        )}
      </WarningRow>

      <GovUKBodyS style={{ marginTop: '10px', color: COLORS.DARK_GREY, display: 'flex', alignItems: 'center' }}>
        <InfoIcon fontSize="small" style={{ marginRight: '5px' }} />
        <strong>Legal note:</strong> Selling a vehicle with incorrect mileage is illegal under the Consumer Protection from Unfair Trading Regulations.
      </GovUKBodyS>
    </WarningBanner>
  );
};

export default MileageClockingWarning;