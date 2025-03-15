import React from 'react';
import { COLORS } from '../../../../../styles/theme';
import {
  TooltipWrapper,
  TooltipTitle,
  TooltipRow,
  TooltipLabel,
  TooltipValue,
  TooltipDivider,
  TooltipWarningText,
  formatMileage,
  getDaysBetween,
  calculateMileageRates,
  getTestResultColor
} from './style/ChartStyles';

// Simplified tooltip with improved trend comparison
const CustomTooltip = ({ active, payload, label, combinedData, trendLineData }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  // Find the index of the current data point
  const currentIndex = combinedData.findIndex(item => item.dateString === data.dateString);
  const previousData = currentIndex > 0 ? combinedData[currentIndex - 1] : null;
  
  // Calculate mileage difference and rates
  const mileageDiff = previousData && data.mileage !== null && previousData.mileage !== null 
    ? data.mileage - previousData.mileage 
    : null;
  
  const rates = calculateMileageRates(
    data.date, 
    previousData?.date, 
    data.mileage, 
    previousData?.mileage
  );
  
  // Calculate trend information
  const calculateTrendInfo = () => {
    if (!trendLineData || trendLineData.length < 2 || !data.trendMileage || !data.ukAverageMileage) {
      return null;
    }

    const firstPoint = trendLineData[0];
    const lastPoint = trendLineData[trendLineData.length - 1];
    const yearDiff = (lastPoint.date - firstPoint.date) / (1000 * 60 * 60 * 24 * 365.25);
    const annualRate = (lastPoint.trendMileage - firstPoint.trendMileage) / yearDiff;
    
    // Calculate the difference between vehicle trend and UK average
    const actualMileage = data.mileage || 0;
    const expectedAtUKAvg = Math.round(data.ukAverageMileage);
    const expectedAtTrend = Math.round(data.trendMileage);
    
    // Determine if vehicle is above or below UK average
    const comparedToUKAvg = expectedAtTrend - expectedAtUKAvg;
    const isAboveAverage = comparedToUKAvg > 0;
    
    return {
      actualMileage,
      expectedAtUKAvg,
      expectedAtTrend,
      annualRate: Math.round(annualRate),
      comparedToUKAvg: Math.abs(comparedToUKAvg),
      isAboveAverage
    };
  };
  
  const trendInfo = calculateTrendInfo();
  
  // Helper function to create badges
  const Badge = ({ color, children }) => (
    <span style={{ 
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: '2px',
      backgroundColor: color,
      color: '#fff',
      fontSize: '11px',
      fontWeight: 'bold',
      marginLeft: '4px'
    }}>
      {children}
    </span>
  );
  
  return (
    <div style={{ 
      position: 'relative',
      width: '280px', 
      maxWidth: '100%',
      pointerEvents: 'auto'
    }}>
      <TooltipWrapper style={{ padding: '10px' }}>
        {/* Basic Information */}
        <TooltipTitle style={{ fontSize: '14px', marginBottom: '4px' }}>
          {data.dateString}
          {data.status && (
            <Badge color={data.status.includes('PASS') ? '#00703c' : '#d4351c'}>
              {data.status}
            </Badge>
          )}
        </TooltipTitle>

        <TooltipRow>
          <TooltipLabel>Mileage:</TooltipLabel>
          <TooltipValue>{data.mileageString}</TooltipValue>
        </TooltipRow>
        
        {/* Previous Test Comparison - Simplified */}
        {previousData && data.mileage !== null && previousData.mileage !== null && (
          <>
            <TooltipDivider style={{ margin: '4px 0' }} />
            
            {/* Negative Mileage Warning - Simplified */}
            {data.negativeMileage ? (
              <>
                <TooltipWarningText style={{ fontSize: '13px' }}>
                  ⚠️ Mileage decrease: {Math.abs(mileageDiff).toLocaleString()} miles
                </TooltipWarningText>
                
                <TooltipRow style={{ marginBottom: '2px' }}>
                  <TooltipLabel>Previous:</TooltipLabel>
                  <TooltipValue>
                    {formatMileage(previousData.mileage)} miles 
                    ({getDaysBetween(previousData.date, data.date)} days ago)
                  </TooltipValue>
                </TooltipRow>
              </>
            ) : (
              <>
                <TooltipRow style={{ marginBottom: '2px' }}>
                  <TooltipLabel>Since last:</TooltipLabel>
                  <TooltipValue>
                    {getDaysBetween(previousData.date, data.date)} days 
                    (+{mileageDiff.toLocaleString()} miles)
                  </TooltipValue>
                </TooltipRow>
                
                {rates.daily !== null && (
                  <TooltipRow style={{ marginBottom: '2px' }}>
                    <TooltipLabel>Usage rate:</TooltipLabel>
                    <TooltipValue>
                      {rates.annual} miles/year 
                      ({Math.round(parseFloat(rates.daily))} miles/day)
                    </TooltipValue>
                  </TooltipRow>
                )}
              </>
            )}
          </>
        )}
        
        {/* Inactivity Period - Significantly Simplified */}
        {data.inactivityPeriod && previousData && (
          <div style={{ 
            marginTop: '4px', 
            fontSize: '12px', 
            color: '#505a5f',
            backgroundColor: '#f3f2f1',
            padding: '2px 6px',
            borderLeft: '3px solid #b1b4b6'
          }}>
            Vehicle unused for over 12 months
          </div>
        )}
        
        {/* Improved Trend Information Section */}
        {trendInfo && (
          <>
            <TooltipDivider style={{ margin: '4px 0' }} />
            
            <div style={{ marginBottom: '2px' }}>
              <TooltipLabel>Expected mileage:</TooltipLabel>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1px'
                }}>
                  <span>Vehicle trend:</span>
                  <span style={{ fontWeight: '600' }}>
                    {trendInfo.expectedAtTrend.toLocaleString()} miles
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1px',
                  color: '#505a5f'
                }}>
                  <span>UK average:</span>
                  <span style={{ fontWeight: '600' }}>
                    {trendInfo.expectedAtUKAvg.toLocaleString()} miles
                  </span>
                </div>
                <div style={{
                  fontSize: '11px', 
                  color: trendInfo.isAboveAverage ? '#d4351c' : '#00703c',
                  textAlign: 'right',
                  fontWeight: '600',
                  marginTop: '2px'
                }}>
                  {trendInfo.isAboveAverage ? 'Above' : 'Below'} UK average by {trendInfo.comparedToUKAvg.toLocaleString()} miles
                </div>
              </div>
            </div>
          </>
        )}
      </TooltipWrapper>
    </div>
  );
};

export default CustomTooltip;