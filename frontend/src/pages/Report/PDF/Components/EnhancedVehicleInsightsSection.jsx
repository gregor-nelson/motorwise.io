import pdfStyles from '../styles/pdfStyles.js';

/**
 * Creates a minimalist vehicle insights section with reliable text-based layout
 * Avoids complex backgrounds and positioning for maximum reliability
 */
export const createEnhancedVehicleInsightsSection = (vehicleInsightsData, resolvedData) => {
  // If no data available, return a simple message
  if (!vehicleInsightsData?.insights) {
    return { text: 'No enhanced vehicle insights available', style: 'note' };
  }

  const { insights } = vehicleInsightsData;
  
  // Create content array
  const content = [];
  
  // Add section header with simple underline
  content.push(
    { 
      text: 'Vehicle Insights', 
      style: 'header',
      margin: [0, 20, 0, 10],
      pageBreak: 'before'
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
  
  // Add ownership insights if available
  if (insights.ownershipInsights) {
    // Format date properly with error handling
    let keeperSinceDate = 'Unknown';
    try {
      if (insights.ownershipInsights.v5cDate) {
        const dateValue = insights.ownershipInsights.v5cDate;
        if (typeof dateValue === 'string') {
          keeperSinceDate = new Date(dateValue).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          });
        } else if (dateValue instanceof Date) {
          keeperSinceDate = dateValue.toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          });
        } else {
          keeperSinceDate = String(dateValue);
        }
      }
    } catch (e) {
      console.error('Error formatting keeper date:', e);
      keeperSinceDate = String(insights.ownershipInsights.v5cDate || 'Unknown');
    }

    // Add ownership header
    content.push(
      { 
        text: 'Ownership & History', 
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
      }
    );
    
    // Add ownership summary using simple text formatting
    content.push(
      { 
        text: `This vehicle has been with the same keeper since ${keeperSinceDate} (${insights.ownershipInsights.yearsWithCurrentOwner} years).`,
        bold: true,
        fontSize: 12,
        margin: [0, 0, 0, 10]
      }
    );

    // Add ownership data as a simple table
    content.push({
      table: {
        widths: [200, '*'],
        body: [
          [
            { text: 'Ownership Status', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
            { text: insights.ownershipInsights.ownershipStability, fontSize: 10, border: [0, 0, 0, 0] }
          ],
          [
            { text: 'Risk Level', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
            { text: insights.ownershipInsights.ownershipRiskLevel, fontSize: 10, border: [0, 0, 0, 0] }
          ]
        ]
      },
      margin: [0, 0, 0, 10]
    });
    
    // Add registration area if available
    if (insights.ownershipInsights.registrationRegion) {
      content.push({
        table: {
          widths: [200, '*'],
          body: [
            [
              { text: 'Registration Area', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
              { 
                text: `${insights.ownershipInsights.registrationRegion}${
                  insights.ownershipInsights.registrationArea ? ` (${insights.ownershipInsights.registrationArea})` : ''
                }`, 
                fontSize: 10, 
                border: [0, 0, 0, 0] 
              }
            ]
          ]
        },
        margin: [0, 0, 0, 10]
      });
    }
    
    // Process environmental insights if available
    if (insights.ownershipInsights.environmentalInsights) {
      const envInsights = insights.ownershipInsights.environmentalInsights;
      
      content.push(
        { 
          text: 'Regional & Environmental Factors', 
          style: 'subheader', 
          margin: [0, 15, 0, 5] 
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 210, y2: 0,
              lineWidth: 0.5,
              lineColor: '#90CAF9'
            }
          ],
          margin: [0, 0, 0, 10]
        }
      );
      
      // Create simple table for environmental factors
      const envFactorsBody = [];
      
      if (envInsights.floodRisk?.riskLevel) {
        envFactorsBody.push([
          { text: 'Flood Risk', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: envInsights.floodRisk.riskLevel, fontSize: 10, border: [0, 0, 0, 0] }
        ]);
      }
      
      if (envInsights.airQuality?.qualityLevel) {
        envFactorsBody.push([
          { text: 'Air Quality', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: envInsights.airQuality.qualityLevel, fontSize: 10, border: [0, 0, 0, 0] }
        ]);
      }
      
      if (envInsights.roadSaltUsage?.usageLevel) {
        envFactorsBody.push([
          { text: 'Road Salt Exposure', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: envInsights.roadSaltUsage.usageLevel, fontSize: 10, border: [0, 0, 0, 0] }
        ]);
      }
      
      if (envInsights.accidentRisk?.riskLevel) {
        envFactorsBody.push([
          { text: 'Regional Accident Risk', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: envInsights.accidentRisk.riskLevel, fontSize: 10, border: [0, 0, 0, 0] }
        ]);
      }
      
      if (envInsights.insuranceInsight?.riskRating) {
        envFactorsBody.push([
          { text: 'Insurance Risk Rating', fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: envInsights.insuranceInsight.riskRating, fontSize: 10, border: [0, 0, 0, 0] }
        ]);
      }
      
      if (envFactorsBody.length > 0) {
        content.push({
          table: {
            widths: [200, '*'],
            body: envFactorsBody
          },
          margin: [0, 0, 0, 10]
        });
      }
      
      // Add environmental impact details as a list
      const envImpacts = [];
      
      if (envInsights.floodRisk?.details) {
        envImpacts.push(`Flood Risk: ${envInsights.floodRisk.details}`);
      }
      
      if (envInsights.airQuality?.catalyticConverterImpact) {
        envImpacts.push(`Emissions System Impact: ${envInsights.airQuality.catalyticConverterImpact}`);
      }
      
      if (envInsights.roadSaltUsage?.details) {
        envImpacts.push(`Corrosion Risk: ${envInsights.roadSaltUsage.details}`);
      }
      
      if (envInsights.accidentRisk?.details) {
        envImpacts.push(`Accident History Risk: ${envInsights.accidentRisk.details}`);
      }
      
      if (envInsights.insuranceInsight?.details) {
        envImpacts.push(`Insurance Implications: ${envInsights.insuranceInsight.details}`);
      }
      
      if (envImpacts.length > 0) {
        content.push(
          { 
            text: 'Environmental Impact Details:', 
            bold: true, 
            fontSize: 10, 
            margin: [0, 10, 0, 5] 
          },
          {
            ul: envImpacts.map(impact => ({ 
              text: impact,
              fontSize: 9,
              margin: [0, 0, 0, 2]
            })),
            margin: [0, 0, 0, 15]
          }
        );
      }
    }
    
    // Process risk and positive factors
    const riskFactors = insights.ownershipInsights.riskFactors || [];
    const positiveFactors = insights.ownershipInsights.positiveFactors || [];
    
    if (riskFactors.length > 0 || positiveFactors.length > 0) {
      content.push(
        { 
          text: 'Owner Risk Assessment', 
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
        }
      );
      
      if (riskFactors.length > 0) {
        content.push(
          { 
            text: 'Risk Factors:', 
            bold: true, 
            fontSize: 10, 
            margin: [0, 0, 0, 5],
            color: '#D32F2F'
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
        content.push(
          { 
            text: 'Positive Factors:', 
            bold: true, 
            fontSize: 10, 
            margin: [0, 0, 0, 5],
            color: '#388E3C'
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
  }
  
  // Add status insights
  if (insights.statusInsights) {
    const { statusInsights } = insights;
    
    content.push(
      { 
        text: 'Current Status', 
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
      }
    );
    
    // Construct status text
    const motText = statusInsights.isPossiblyMotExempt ? 
      'possible exemption from MOT' : 
      `a ${statusInsights.motStatus?.toLowerCase() || 'unknown'} MOT`;
      
    const taxText = statusInsights.isTaxExempt ? 
      'EXEMPT FROM TAX' : 
      (statusInsights.taxStatus || 'unknown tax status');
    
    // Add status notification as simple text
    content.push(
      { 
        text: `This vehicle is currently ${taxText} with ${motText}.`,
        bold: true,
        fontSize: 12,
        margin: [0, 0, 0, 10]
      }
    );
    
    // Add status data as simple table
    const statusData = [
      ['Driveability Status', statusInsights.driveabilityStatus],
      ['Risk Level', statusInsights.statusRiskLevel]
    ];
    
    // Only add MOT expiry if it exists and is relevant
    if (statusInsights.motExpiryDate && !statusInsights.isPossiblyMotExempt) {
      let motExpiryDisplay = '';
      
      // Format date properly with error handling
      try {
        if (typeof statusInsights.motExpiryDate === 'string') {
          motExpiryDisplay = statusInsights.motExpiryDate;
        } else if (statusInsights.motExpiryDate instanceof Date) {
          motExpiryDisplay = statusInsights.motExpiryDate.toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          });
        } else {
          motExpiryDisplay = String(statusInsights.motExpiryDate);
        }
      } catch (e) {
        console.error('Error formatting MOT expiry date:', e);
        motExpiryDisplay = String(statusInsights.motExpiryDate);
      }
      
      const isExpired = statusInsights.daysUntilMotExpiry <= 0;
      const expirySuffix = statusInsights.daysUntilMotExpiry > 0 ? 
        ` (${statusInsights.daysUntilMotExpiry} days)` : 
        ' (Expired)';
      
      statusData.push(['MOT Expires', `${motExpiryDisplay}${expirySuffix}`]);
    }
    
    content.push({
      table: {
        widths: [200, '*'],
        body: statusData.map(row => [
          { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
        ])
      },
      margin: [0, 0, 0, 10]
    });
    
    // Process status risk and positive factors
    const statusRiskFactors = statusInsights.riskFactors || [];
    const statusPositiveFactors = statusInsights.positiveFactors || [];
    
    if (statusRiskFactors.length > 0 || statusPositiveFactors.length > 0) {
      content.push(
        { 
          text: 'Status Risk Assessment', 
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
        }
      );
      
      if (statusRiskFactors.length > 0) {
        content.push(
          { 
            text: 'Risk Factors:', 
            bold: true, 
            fontSize: 10, 
            margin: [0, 0, 0, 5],
            color: '#D32F2F'
          },
          {
            ul: statusRiskFactors.map(factor => ({
              text: factor,
              fontSize: 9,
              margin: [0, 0, 0, 2]
            })),
            margin: [0, 0, 0, 10]
          }
        );
      }
      
      if (statusPositiveFactors.length > 0) {
        content.push(
          { 
            text: 'Positive Factors:', 
            bold: true, 
            fontSize: 10, 
            margin: [0, 0, 0, 5],
            color: '#388E3C'
          },
          {
            ul: statusPositiveFactors.map(factor => ({
              text: factor,
              fontSize: 9,
              margin: [0, 0, 0, 2]
            })),
            margin: [0, 0, 0, 10]
          }
        );
      }
    }
  }
  
  // Add emissions insights
  if (insights.emissionsInsights) {
    const { emissionsInsights } = insights;
    
    content.push(
      { 
        text: 'Emissions & Tax', 
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
      }
    );
    
    // Create emissions text
    let emissionsText = '';
    if (emissionsInsights.isEstimated) {
      emissionsText = `Based on this vehicle's specifications, we estimate its CO2 emissions to be approximately ${emissionsInsights.co2Emissions}g/km.`;
    } else {
      emissionsText = `This vehicle's CO2 emissions are ${emissionsInsights.co2Emissions}g/km.`;
    }
    
    content.push(
      { 
        text: emissionsText,
        fontSize: 10,
        margin: [0, 0, 0, 5]
      }
    );
    
    if (emissionsInsights.euroStatus) {
      content.push(
        { 
          text: `It meets ${emissionsInsights.euroStatus} emissions standards.`,
          fontSize: 10,
          margin: [0, 0, 0, 10]
        }
      );
    }
    
    // Collect emissions data for a simple table
    const emissionsData = [];
    
    if (emissionsInsights.euroStatus) {
      emissionsData.push(['Euro Standard', emissionsInsights.euroStatus]);
    }
    
    if (emissionsInsights.taxBand && emissionsInsights.taxBand !== "N/A (Standard Rate)") {
      emissionsData.push(['Tax Band', emissionsInsights.taxBand]);
    }
    
    const taxCostText = emissionsInsights.annualTaxCost || '';
    if (!taxCostText.includes("Exempt")) {
      emissionsData.push(['Annual Road Tax', taxCostText]);
    } else {
      emissionsData.push(['Tax Status', 'Exempt']);
    }
    
    if (emissionsInsights.isULEZCompliant !== undefined) {
      emissionsData.push(['ULEZ Status', emissionsInsights.isULEZCompliant ? 'Compliant' : 'Non-Compliant']);
    }
    
    if (emissionsInsights.isScottishLEZCompliant !== undefined) {
      emissionsData.push(['Scottish LEZ Status', emissionsInsights.isScottishLEZCompliant ? 'Compliant' : 'Non-Compliant']);
    }
    
    if (emissionsData.length > 0) {
      content.push({
        table: {
          widths: [200, '*'],
          body: emissionsData.map(row => [
            { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
            { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
          ])
        },
        margin: [0, 0, 0, 10]
      });
    }
    
    // Add clean air zone impact
    if (emissionsInsights.cleanAirZoneImpact) {
      content.push(
        { 
          text: 'Clean Air Zone Impact:', 
          bold: true, 
          fontSize: 10, 
          margin: [0, 10, 0, 5] 
        },
        { 
          text: emissionsInsights.cleanAirZoneImpact, 
          fontSize: 9,
          margin: [0, 0, 0, 10] 
        }
      );
    }
    
    // Add tax notes
    if (emissionsInsights.taxNotes?.length > 0) {
      content.push(
        { 
          text: 'Important Tax Information:', 
          bold: true, 
          fontSize: 10, 
          margin: [0, 10, 0, 5] 
        },
        {
          ul: emissionsInsights.taxNotes.map(note => ({ 
            text: note,
            fontSize: 9,
            margin: [0, 0, 0, 2]
          })),
          margin: [0, 0, 0, 15]
        }
      );
    }
  }
  
  // Add fuel efficiency insights
  if (insights.fuelEfficiencyInsights) {
    const { fuelEfficiencyInsights } = insights;
    
    content.push(
      { 
        text: 'Fuel Efficiency', 
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
      }
    );
    
    // Process electric vehicles differently
    if (fuelEfficiencyInsights.isElectric) {
      content.push(
        { 
          text: `As an electric vehicle, this car has an estimated efficiency of ${fuelEfficiencyInsights.estimatedMilesPerKWh} miles per kWh, costing approximately £${fuelEfficiencyInsights.estimatedCostPerMile} per mile to run.`,
          fontSize: 10,
          margin: [0, 0, 0, 10]
        }
      );
      
      // EV-specific data for simple table
      const evData = [
        ['Estimated Range', fuelEfficiencyInsights.estimatedRange],
        ['Battery Capacity', fuelEfficiencyInsights.batteryCapacityEstimate],
        ['Annual Savings vs Petrol', fuelEfficiencyInsights.annualSavingsVsPetrol]
      ];
      
      content.push({
        table: {
          widths: [200, '*'],
          body: evData.map(row => [
            { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
            { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
          ])
        },
        margin: [0, 0, 0, 10]
      });
    } else {
      // Conventional vehicle
      content.push(
        { 
          text: `Based on this vehicle's specifications, it has an estimated fuel efficiency of ${fuelEfficiencyInsights.estimatedMPGCombined} MPG combined, costing approximately £${fuelEfficiencyInsights.costPerMile} per mile to run.`,
          fontSize: 10,
          margin: [0, 0, 0, 10]
        }
      );
      
      // Fuel data for simple table
      const fuelData = [
        ['Estimated Urban MPG', `${fuelEfficiencyInsights.estimatedMPGUrban} MPG`],
        ['Estimated Extra-Urban MPG', `${fuelEfficiencyInsights.estimatedMPGExtraUrban} MPG`],
        ['Estimated Annual Fuel Cost', `£${fuelEfficiencyInsights.annualFuelCost}`]
      ];
      
      if (fuelEfficiencyInsights.co2EmissionsGPerKM) {
        fuelData.push(['CO2 Emissions', `${fuelEfficiencyInsights.co2EmissionsGPerKM} g/km`]);
      }
      
      content.push({
        table: {
          widths: [200, '*'],
          body: fuelData.map(row => [
            { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
            { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
          ])
        },
        margin: [0, 0, 0, 10]
      });
      
      // Add efficiency context and market trends sections
      if (fuelEfficiencyInsights.fuelTypeEfficiencyNote) {
        content.push(
          { 
            text: 'Efficiency Context:', 
            bold: true, 
            fontSize: 10, 
            margin: [0, 10, 0, 5] 
          },
          { 
            text: fuelEfficiencyInsights.fuelTypeEfficiencyNote, 
            fontSize: 9,
            margin: [0, 0, 0, 10] 
          }
        );
      }
      
      if (fuelEfficiencyInsights.marketTrends) {
        content.push(
          { 
            text: 'Market Trends:', 
            bold: true, 
            fontSize: 10, 
            margin: [0, 10, 0, 5] 
          },
          { 
            text: fuelEfficiencyInsights.marketTrends, 
            fontSize: 9,
            margin: [0, 0, 0, 10] 
          }
        );
      }
    }
  }
  
  // Add footer
  content.push(
    {
      columns: [
        {
          text: 'Data source: DVLA and industry databases',
          fontSize: 8,
          color: '#6f777b',
          alignment: 'left'
        },
        {
          text: 'This report was generated on ' + new Date().toLocaleDateString('en-GB'),
          fontSize: 8,
          color: '#6f777b',
          alignment: 'right'
        }
      ],
      margin: [0, 20, 0, 0]
    }
  );
  
  // Return the complete stack
  return {
    stack: content,
    margin: [0, 0, 0, 20]
  };
};

export default createEnhancedVehicleInsightsSection;