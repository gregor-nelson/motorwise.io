import React from 'react';
import {
  GovUKHeadingS,
  COLORS
} from '../../../../../styles/theme';

// Import styled components
import {
  UsageSummary,
  SummaryGrid,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
  PatternCard,
  PatternTitle,
  PatternDetail,
  PatternStats,
  StatBox,
  UsagePeriodsTable,
  hexToRgb,
} from './VehicleMileageChartStyles';

// Define a constant for consistent color usage
const ORANGE = COLORS.ORANGE || '#f47738';
const PALE_BLUE = '#5C6BC0'; // Consistent color for annotations

/**
 * Vehicle Usage Summary component that displays detailed vehicle usage information
 * This includes summary statistics, anomalies, inactivity periods, and usage periods
 */
const VehicleUsageSummary = ({ 
  chartData, 
  formatMileageValue, 
  hasClockingIncidents, 
  actualTotalMileage 
}) => {
  if (!chartData || !chartData.mileageData || chartData.mileageData.length === 0) {
    return null;
  }

  return (
    <>
      <GovUKHeadingS>Vehicle Usage Summary</GovUKHeadingS>
      <UsageSummary>
        <SummaryGrid>
          <SummaryItem>
            <SummaryLabel>Records</SummaryLabel>
            <SummaryValue>{chartData.mileageData.length}</SummaryValue>
          </SummaryItem>
          
          <SummaryItem>
            <SummaryLabel>Date Range</SummaryLabel>
            <SummaryValue>
              {chartData.mileageData.length > 0 ? 
                `${chartData.mileageData[0].formattedDate} - ${chartData.mileageData[chartData.mileageData.length - 1].formattedDate}` : 
                'N/A'}
            </SummaryValue>
          </SummaryItem>
          
          {/* Show actual total mileage that ignores negative values for clocked vehicles */}
          <SummaryItem>
            <SummaryLabel>Total Mileage</SummaryLabel>
            <SummaryValue>
              {chartData.mileageData.length > 1 ? (
                hasClockingIncidents ? (
                  <>
                    {formatMileageValue(actualTotalMileage)} mi
                    <span style={{ fontSize: '0.75rem', color: COLORS.RED, display: 'block' }}>
                      (Excluding clocking incidents)
                    </span>
                  </>
                ) : (
                  `${formatMileageValue(chartData.mileageData[chartData.mileageData.length - 1].mileage - chartData.mileageData[0].mileage)} mi`
                )
              ) : 'N/A'}
            </SummaryValue>
          </SummaryItem>
          
          <SummaryItem>
            <SummaryLabel>Average Annual</SummaryLabel>
            <SummaryValue>
              {chartData.averageAnnualMileage !== null ? (
                chartData.averageAnnualMileage < 0 ? (
                  <>
                    <span style={{ color: COLORS.RED }}>
                      {formatMileageValue(chartData.averageAnnualMileage)} mi/year
                    </span>
                    <span style={{ fontSize: '0.75rem', color: COLORS.RED, display: 'block' }}>
                      (Inconsistent data)
                    </span>
                  </>
                ) : (
                  `${formatMileageValue(chartData.averageAnnualMileage)} mi/year`
                )
              ) : 'N/A'}
            </SummaryValue>
          </SummaryItem>
        </SummaryGrid>
      </UsageSummary>
      
      {/* Enhanced anomalies section with more prominent styling for clocking */}
      {chartData.anomalies && chartData.anomalies.length > 0 && (
        <>
          <GovUKHeadingS>Detected Anomalies ({chartData.anomalies.length})</GovUKHeadingS>
          {chartData.anomalies
            .sort((a, b) => (a.type === 'decrease' ? -1 : b.type === 'decrease' ? 1 : 0)) // Clocking incidents first
            .map((anomaly, index) => (
            <PatternCard 
              key={`anomaly-${index}`} 
              severity={anomaly.severity}
              isClockingAnomaly={anomaly.type === 'decrease'}
            >
              <PatternTitle>
                {anomaly.type === 'decrease' ? 
                  `⚠️ ${anomaly.details.current.formattedDate} - Mileage Decrease (Potential Clocking)` : 
                  `${anomaly.details.current.formattedDate} - Unusual Mileage Increase`}
              </PatternTitle>
              <PatternDetail 
                style={anomaly.type === 'decrease' ? { color: COLORS.RED, fontWeight: 'bold' } : {}}
              >
                {anomaly.message}
              </PatternDetail>
              <PatternStats>
                <StatBox color={anomaly.type === 'decrease' ? COLORS.RED : ORANGE}>
                  {anomaly.type === 'decrease' ? 
                    `${Math.abs(anomaly.details.diff).toLocaleString()} mi decrease` : 
                    `${Math.round(anomaly.details.dailyAvg)} mi/day`}
                </StatBox>
                <StatBox>
                  Period: {Math.round(anomaly.details.timeBetweenReadings)} days
                </StatBox>
                {anomaly.type === 'spike' && (
                  <StatBox color={PALE_BLUE}>
                    {Math.round(anomaly.details.annualizedMileage).toLocaleString()} mi/year
                  </StatBox>
                )}
              </PatternStats>
              {anomaly.type === 'decrease' && (
                <div style={{ marginTop: '10px', fontSize: '0.875rem' }}>
                  <strong>Possible causes:</strong> Odometer tampering, MOT data error, instrument cluster replacement
                </div>
              )}
            </PatternCard>
          ))}
        </>
      )}
      
      {/* Inactivity periods section - now correctly excludes clocking incidents */}
      {chartData.inactivityPeriods && chartData.inactivityPeriods.length > 0 && (
        <>
          <GovUKHeadingS>Inactivity Periods ({chartData.inactivityPeriods.length})</GovUKHeadingS>
          {chartData.inactivityPeriods.map((period, index) => (
            <PatternCard 
              key={`inactive-${index}`} 
              severity={period.severity}
            >
              <PatternTitle>
                {period.start.formattedDate} to {period.end.formattedDate} ({Math.round(period.days)} days)
              </PatternTitle>
              <PatternDetail>{period.description}</PatternDetail>
              <PatternStats>
                <StatBox>
                  Mileage: {period.start.formattedMileage} → {period.end.formattedMileage}
                </StatBox>
                <StatBox color={
                  period.dailyAverage <= 0 ? COLORS.RED : 
                  period.dailyAverage < 5 ? ORANGE : 
                  COLORS.GREEN
                }>
                  {Math.round(period.dailyAverage * 10) / 10} mi/day
                </StatBox>
                <StatBox color={PALE_BLUE}>
                  {Math.round(period.dailyAverage * 365).toLocaleString()} mi/year
                </StatBox>
              </PatternStats>
            </PatternCard>
          ))}
        </>
      )}
      
      {/* Enhanced usage periods table that properly flags negative periods */}
      <GovUKHeadingS>Usage Periods</GovUKHeadingS>
      <UsagePeriodsTable>
        <thead>
          <tr>
            <th>Period</th>
            <th>Days</th>
            <th>Mileage Added</th>
            <th>Daily Rate</th>
            <th>Annual Rate</th>
          </tr>
        </thead>
        <tbody>
          {chartData.ratesData && chartData.ratesData.map((period, index) => (
            <tr 
              key={`period-${index}`}
              style={period.isNegative ? { backgroundColor: `rgba(${hexToRgb(COLORS.RED)}, 0.1)` } : {}}
            >
              <td>{period.formattedPeriod}</td>
              <td>{period.periodDays}</td>
              <td style={period.isNegative ? { color: COLORS.RED, fontWeight: 'bold' } : {}}>
                {period.isNegative ? '⚠️ ' : ''}
                {(period.endMileage - period.startMileage).toLocaleString()}
                {period.isNegative ? ' (decrease)' : ''}
              </td>
              <td style={period.isNegative ? { color: COLORS.RED, fontWeight: 'bold' } : {}}>
                {Math.round(period.dailyRate)} mi/day
              </td>
              <td style={period.isNegative ? { color: COLORS.RED, fontWeight: 'bold' } : {}}>
                {Math.round(period.annualizedRate).toLocaleString()} mi/year
              </td>
            </tr>
          ))}
        </tbody>
      </UsagePeriodsTable>
    </>
  );
};

export default VehicleUsageSummary;