import React, { useMemo } from 'react';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceArea, Line, ComposedChart
} from 'recharts';
import { 
  GovUKHeadingS, 
  GovUKSectionBreak, 
  GovUKGridRow, 
  GovUKCaptionM,
  GovUKBody,
  GovUKInsetText,
} from '../../../../../styles/theme';

// Import the custom tooltip component
import CustomTooltip from './Tooltip';

import { ChartContainer, ChartLegend, LegendItem, ColorBox} from './style/ChartStyles';

const MileageChart = ({ motData }) => {
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!motData || motData.length === 0) return [];
    
    // Parse dates and mileage values
    const processedData = motData.map(test => {
      // Parse date string into a Date object
      const dateParts = test.date.split(' ');
      const day = parseInt(dateParts[0], 10);
      const month = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']
                     .indexOf(dateParts[1]);
      const year = parseInt(dateParts[2], 10);
      const dateObj = new Date(year, month, day);
      
      // Parse mileage string to extract numeric value
      let mileageValue = null;
      if (test.mileage && test.mileage !== 'Not recorded') {
        const mileageMatch = test.mileage.match(/^([\d,]+)/);
        if (mileageMatch) {
          mileageValue = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
        }
      }
      
      return {
        date: dateObj,
        dateString: test.date,
        mileage: mileageValue,
        mileageString: test.mileage,
        status: test.status,
      };
    });
    
    // Sort by date (oldest first)
    processedData.sort((a, b) => a.date - b.date);
    
    // Calculate periods of inactivity and negative mileage
    const enhancedData = processedData.map((item, index, array) => {
      let inactivityPeriod = false;
      let negativeMileage = false;
      
      if (index > 0) {
        // Check for inactivity (gap > 12 months)
        const monthsDiff = (item.date - array[index - 1].date) / (1000 * 60 * 60 * 24 * 30.5);
        inactivityPeriod = monthsDiff > 12;
        
        // Check for negative mileage
        if (item.mileage !== null && array[index - 1].mileage !== null) {
          negativeMileage = item.mileage < array[index - 1].mileage;
        }
      }
      
      return {
        ...item,
        inactivityPeriod,
        negativeMileage,
      };
    });
    
    return enhancedData;
  }, [motData]);

  // Calculate trend line data
  const trendLineData = useMemo(() => {
    if (chartData.length < 2) return [];
    
    // Filter out entries with null mileage
    const validData = chartData.filter(item => item.mileage !== null);
    if (validData.length < 2) return [];
    
    // Calculate vehicle's trend line
    const firstDate = validData[0].date;
    const lastDate = validData[validData.length - 1].date;
    const totalDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    const totalYears = totalDays / 365.25;
    
    const firstMileage = validData[0].mileage;
    const lastMileage = validData[validData.length - 1].mileage;
    const totalMileage = lastMileage - firstMileage;
    
    const annualMileage = totalMileage / totalYears;
    
    // Generate trend line points for all data points
    return chartData.map(item => ({
      date: item.date,
      dateString: item.dateString,
      trendMileage: firstMileage + (((item.date - firstDate) / (1000 * 60 * 60 * 24)) / 365.25) * annualMileage,
      ukAverageMileage: firstMileage + (((item.date - firstDate) / (1000 * 60 * 60 * 24)) / 365.25) * 7500,
    }));
  }, [chartData]);

  // Combined data for the chart
  const combinedData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // Merge chartData with trendLineData
    return chartData.map(item => {
      const trendPoint = trendLineData.find(trend => 
        trend.dateString === item.dateString
      );
      
      return {
        ...item,
        trendMileage: trendPoint ? trendPoint.trendMileage : null,
        ukAverageMileage: trendPoint ? trendPoint.ukAverageMileage : null,
      };
    });
  }, [chartData, trendLineData]);

  // Reference areas for inactivity and negative mileage
  const referenceAreas = useMemo(() => {
    const areas = [];
    
    chartData.forEach((item, index) => {
      if (index > 0) {
        if (item.inactivityPeriod) {
          areas.push({
            x1: chartData[index - 1].dateString,
            x2: item.dateString,
            fill: '#f3f2f1', // GOV.UK light grey
            type: 'inactivity'
          });
        }
        
        if (item.negativeMileage) {
          areas.push({
            x1: chartData[index - 1].dateString,
            x2: item.dateString,
            fill: 'rgba(212, 53, 28, 0.2)', // GOV.UK red with 20% opacity
            type: 'negative'
          });
        }
      }
    });
    
    return areas;
  }, [chartData]);

  // Tooltip customization with our new component
  const renderCustomTooltip = (props) => {
    return <CustomTooltip {...props} combinedData={combinedData} trendLineData={trendLineData} />;
  };

  // Check if we have enough valid mileage data to show a chart
  const hasValidMileageData = useMemo(() => {
    const validEntries = chartData.filter(item => item.mileage !== null);
    return validEntries.length >= 2;
  }, [chartData]);

  if (!motData || motData.length === 0) {
    return null;
  }

  return (
    <>
      <GovUKSectionBreak />
      <GovUKGridRow>
          <GovUKHeadingS>Mileage History</GovUKHeadingS>
          
          {!hasValidMileageData ? (
            <GovUKInsetText>
              <GovUKBody>
                Not enough mileage data is available to display a trend chart. At least two MOT tests with recorded mileage are required.
              </GovUKBody>
            </GovUKInsetText>
          ) : (
            <ChartContainer>
              <GovUKCaptionM>This chart shows the vehicle's mileage history based on MOT test records</GovUKCaptionM>
              <ChartLegend>
                <LegendItem>
                  <ColorBox color="#1d70b8" />
                  <span>Recorded Mileage</span>
                </LegendItem>
                <LegendItem>
                  <ColorBox color="#0b0c0c" />
                  <span>Vehicle Trend</span>
                </LegendItem>
                <LegendItem>
                  <ColorBox color="#505a5f" />
                  <span>UK Average (7,500 miles/year)</span>
                </LegendItem>
                <LegendItem>
                  <ColorBox color="#f3f2f1" />
                  <span>Inactivity Period (12 months)</span>
                </LegendItem>
                <LegendItem>
                  <ColorBox color="rgba(212, 53, 28, 0.2)" />
                  <span>Negative Mileage</span>
                </LegendItem>
              </ChartLegend>
              
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart 
                  data={combinedData}
                  margin={{ top: 10, right: 10, left: 20, bottom: 50 }}
                  aria-label="Mileage history chart"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="dateString" 
                    tick={{ fill: "#0b0c0c", fontSize: 12 }} 
                    axisLine={{ stroke: "#505a5f" }}
                    tickLine={{ stroke: "#505a5f" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: "#0b0c0c", fontSize: 12 }} 
                    axisLine={{ stroke: "#505a5f" }}
                    tickLine={{ stroke: "#505a5f" }}
                    tickFormatter={(value) => new Intl.NumberFormat('en-GB').format(value)}
                    label={{ 
                      value: 'Mileage (miles)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: "#505a5f", fontSize: 14 }
                    }}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  
                  {/* Reference areas for inactivity and negative mileage */}
                  {referenceAreas.map((area, index) => (
                    <ReferenceArea
                      key={`area-${index}`}
                      x1={area.x1}
                      x2={area.x2}
                      fill={area.fill}
                      isFront={false}
                    />
                  ))}
                  
                  {/* Mileage bars */}
                  <Bar 
                    dataKey="mileage" 
                    fill="#1d70b8"
                    name="Recorded Mileage"
                    isAnimationActive={false}
                  />
                  
                  {/* Vehicle trend line */}
                  <Line
                    type="monotone"
                    dataKey="trendMileage"
                    stroke="#0b0c0c"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    name="Vehicle Trend"
                    isAnimationActive={false}
                  />
                  
                  {/* UK average trend line */}
                  <Line
                    type="monotone"
                    dataKey="ukAverageMileage"
                    stroke="#505a5f"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                    name="UK Average"
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <GovUKInsetText>

              <GovUKBody>
                This chart displays the vehicle's recorded mileage at each MOT test. The solid line shows the vehicle's mileage trend, 
                while the dashed line represents the UK national average annual mileage (7,500 miles per year).
                Grey shaded areas indicate periods of inactivity (gaps between tests greater than 12 months), 
                and red shaded areas indicate unexpected mileage decreases between consecutive tests.
              </GovUKBody>
              </GovUKInsetText>

            </ChartContainer>
          )}
      </GovUKGridRow>
    </>
  );
};

export default MileageChart;