import pdfStyles from '../styles/pdfStyles.js';

/**
 * Creates a minimalist mileage insights section with reliable text-based layout
 * Avoids complex backgrounds and positioning for maximum reliability
 */
export const createMileageInsightsSection = (mileageInsightsData) => {
  // If no data available, return a simple message
  if (!mileageInsightsData?.insights || !mileageInsightsData.mileageData) {
    return { text: 'No mileage insights available', style: 'note' };
  }

  const { insights, mileageData, anomalies } = mileageInsightsData;
  
  // Determine latest mileage from the data
  const latestMileage = mileageData.length > 0 ? 
    (mileageData[mileageData.length - 1].formattedMileage || 
     mileageData[mileageData.length - 1].mileage ||
     'Unknown') : 'Unknown';
  
  // Check if there are clocking issues - do this once
  const clockingAnomalies = anomalies?.filter(a => a.type === 'decrease') || [];
  const hasClockingIssues = clockingAnomalies.length > 0;
  
  // Create content array
  const mileageContent = [];
  
  // Add section header with simple underline
  mileageContent.push(
    { 
      text: 'Mileage Insights', 
      style: 'header',
      margin: [0, 20, 0, 10]
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 1,
          lineColor: '#1E88E5'
        }
      ],
      margin: [0, 0, 0, 15]
    }
  );
  
  // Add mileage overview with simple formatting
  mileageContent.push(
    { 
      text: 'Mileage Overview', 
      style: 'subheader', 
      margin: [0, 0, 0, 5] 
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 150, y2: 0,
          lineWidth: 0.5,
          lineColor: '#90CAF9'
        }
      ],
      margin: [0, 0, 0, 10]
    },
    { 
      text: `Current recorded mileage: ${latestMileage}`,
      bold: true,
      fontSize: 12,
      margin: [0, 0, 0, 5]
    }
  );

  // Add clocking warning if applicable - as simple text
  if (hasClockingIssues) {
    // Calculate total clocking miles
    const totalClockingMiles = clockingAnomalies.reduce(
      (sum, a) => sum + Math.abs(a.details?.diff || 0), 0
    );
    
    mileageContent.push(
      { 
        text: 'MILEAGE INCONSISTENCY DETECTED',
        bold: true, 
        fontSize: 12,
        color: '#D32F2F',
        margin: [0, 10, 0, 5] 
      },
      { 
        text: `This vehicle has ${clockingAnomalies.length} instance(s) where the recorded mileage decreased between MOT tests. Total discrepancy: ${totalClockingMiles.toLocaleString()} miles.`,
        fontSize: 10,
        margin: [0, 0, 0, 5]
      },
      { 
        text: 'Legal note: Selling a vehicle with incorrect mileage is illegal under the Consumer Protection from Unfair Trading Regulations.',
        fontSize: 9,
        italics: true,
        margin: [0, 0, 0, 15]
      }
    );
  }
  
  // Add benchmark data if available - simple tabular format
  if (insights?.benchmarks) {
    const { benchmarks } = insights;
    
    mileageContent.push(
      { 
        text: 'Mileage Benchmarks', 
        style: 'subheader', 
        margin: [0, 15, 0, 5] 
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 180, y2: 0,
            lineWidth: 0.5,
            lineColor: '#90CAF9'
          }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: [200, '*'],
          body: [
            [
              { text: 'Vehicle Age', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
              { text: `${benchmarks.vehicleAgeYears} years`, fontSize: 10, border: [0, 0, 0, 0] }
            ],
            [
              { text: 'Average Annual Mileage', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
              { text: `${benchmarks.averageAnnualMileage.toLocaleString()} miles/year`, fontSize: 10, border: [0, 0, 0, 0] }
            ],
            [
              { text: 'Variance from Expected', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
              { text: `${benchmarks.mileageRatio < 1 ? "-" : "+"}${Math.abs(Math.round((benchmarks.mileageRatio - 1) * 100))}%`, fontSize: 10, border: [0, 0, 0, 0] }
            ]
          ]
        },
        margin: [0, 0, 0, 10]
      },
      {
        text: 'Estimated Remaining Life:',
        bold: true,
        fontSize: 10,
        margin: [0, 5, 0, 5]
      },
      {
        text: `${benchmarks.remainingMilesEstimate.toLocaleString()} miles (approx. ${benchmarks.remainingYearsEstimate} years at current usage rate)`,
        fontSize: 10,
        margin: [0, 0, 0, 10]
      }
    );
    
    // Add data context if available - as simple paragraph
    if (benchmarks.ukAverageAnnualMileage) {
      let contextText = `UK average annual mileage is ${benchmarks.ukAverageAnnualMileage.toLocaleString()} miles.`;
      
      if (benchmarks.typeSpecificAnnualMileage !== benchmarks.ukAverageAnnualMileage) {
        const vehicleType = [
          mileageInsightsData.vehicleInfo?.fuelType || '',
          mileageInsightsData.vehicleInfo?.bodyType || ''
        ].filter(Boolean).join(' ') || 'this type of';
        
        contextText += ` For ${vehicleType} vehicles, the typical annual mileage is ${benchmarks.typeSpecificAnnualMileage.toLocaleString()} miles.`;
      }
      
      mileageContent.push(
        { 
          text: 'Data Context:', 
          bold: true, 
          fontSize: 9, 
          margin: [0, 10, 0, 5] 
        },
        { 
          text: contextText, 
          fontSize: 9, 
          margin: [0, 0, 0, 15] 
        }
      );
    }
  }
  
  // Add usage patterns if available - as simple table format
  if (insights?.usagePatterns) {
    const { usagePatterns } = insights;
    
    mileageContent.push(
      { 
        text: 'Usage Patterns', 
        style: 'subheader', 
        margin: [0, 15, 0, 5] 
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 150, y2: 0,
            lineWidth: 0.5,
            lineColor: '#90CAF9'
          }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: [200, '*'],
          body: [
            [
              { text: 'Usage Pattern:', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
              { text: usagePatterns.usagePattern || 'Standard', fontSize: 10, border: [0, 0, 0, 0] }
            ],
            [
              { text: 'Average:', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
              { text: `${(usagePatterns.averageAnnualRate || 0).toLocaleString()} miles/year`, fontSize: 10, border: [0, 0, 0, 0] }
            ]
          ]
        },
        margin: [0, 0, 0, 10]
      }
    );
    
    // Add highest and lowest usage periods if they differ
    if (usagePatterns.highestUsagePeriod && usagePatterns.lowestUsagePeriod) {
      const highestPeriod = usagePatterns.highestUsagePeriod;
      const lowestPeriod = usagePatterns.lowestUsagePeriod;
      
      // Only show both if they're different
      if (highestPeriod.period !== lowestPeriod.period) {
        mileageContent.push(
          {
            columns: [
              {
                width: '48%',
                stack: [
                  { text: 'Highest Usage Period:', fontSize: 10, bold: true },
                  { text: highestPeriod.period, fontSize: 10, margin: [0, 3, 0, 3] },
                  { text: `${highestPeriod.annualizedRate.toLocaleString()} miles/year`, fontSize: 10, bold: true }
                ]
              },
              {
                width: '4%',
                text: ''
              },
              {
                width: '48%',
                stack: [
                  { text: 'Lowest Usage Period:', fontSize: 10, bold: true },
                  { text: lowestPeriod.period, fontSize: 10, margin: [0, 3, 0, 3] },
                  { text: `${lowestPeriod.annualizedRate.toLocaleString()} miles/year`, fontSize: 10, bold: true }
                ]
              }
            ],
            margin: [0, 0, 0, 15]
          }
        );
      }
    }
  }
  
  // Add risk assessment if available - simple table instead of complex graphics
  if (insights?.riskAssessment) {
    const { riskAssessment } = insights;
    
    mileageContent.push(
      { 
        text: 'Mileage Risk Assessment', 
        style: 'subheader', 
        margin: [0, 15, 0, 5] 
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 200, y2: 0,
            lineWidth: 0.5,
            lineColor: '#90CAF9'
          }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          {
            width: '70%',
            text: [
              { text: 'Risk Score: ', bold: true, fontSize: 11 },
              { text: `${riskAssessment.riskScore} - ${riskAssessment.riskCategory} Risk`, fontSize: 11 }
            ]
          },
          {
            width: '30%',
            text: riskAssessment.riskScore,
            bold: true,
            fontSize: 14,
            alignment: 'center'
          }
        ],
        margin: [0, 0, 0, 15]
      }
    );
    
    // Process risk factors in a simpler format
    const riskFactors = riskAssessment.riskFactors || [];
    const positiveFactors = riskAssessment.positiveFactors || [];
    
    if (riskFactors.length > 0) {
      mileageContent.push(
        { 
          text: 'Risk Factors:', 
          bold: true, 
          fontSize: 10, 
          margin: [0, 0, 0, 5] 
        },
        {
          ul: riskFactors.map(factor => ({
            text: factor,
            fontSize: 9,
            margin: [0, 0, 0, 2]
          })),
          margin: [0, 0, 0, 10]
        }
      );
    }
    
    if (positiveFactors.length > 0) {
      mileageContent.push(
        { 
          text: 'Positive Factors:', 
          bold: true, 
          fontSize: 10, 
          margin: [0, 0, 0, 5] 
        },
        {
          ul: positiveFactors.map(factor => ({
            text: factor,
            fontSize: 9,
            margin: [0, 0, 0, 2]
          })),
          margin: [0, 0, 0, 10]
        }
      );
    }
  }
  
  // Return the complete stack
  return {
    stack: mileageContent,
    margin: [0, 0, 0, 20]
  };
};

export default createMileageInsightsSection;