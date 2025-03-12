// Define tooltip content for different data fields in mileage insights
export const mileageTooltips = {
    // Section tooltips
    sectionMileage: "Mileage data is sourced from MOT test history records",
    sectionBenchmarks: "Benchmarks are calculated using UK Department for Transport vehicle statistics",
    sectionRiskAssessment: "Risk assessment is based on analysis of mileage patterns and statistical anomalies",
    
    // Mileage data tooltips
    currentMileage: "Most recent recorded mileage from MOT testing data",
    averageAnnualMileage: "Calculated by dividing total mileage by vehicle age in years",
    mileageCategory: "Comparison to typical mileage for vehicles of this type, age, and fuel type",
    
    // Risk assessment tooltips
    riskScore: "Score from 0-100 based on comprehensive analysis of mileage patterns",
    mileageDecrease: "Indicates potential odometer tampering - a serious concern for buyers",
    unusualSpike: "Unusually high daily mileage between recordings may indicate data entry errors",
    inactivityPeriod: "Extended periods with minimal or no usage which may impact vehicle condition",
    
    // Data confidence tooltips
    highConfidence: "Based on official MOT test data with multiple consistent readings",
    mediumConfidence: "Based on limited MOT data supplemented with statistical averages",
    lowConfidence: "Limited data available, broader estimates applied",
    
    // Usage pattern tooltips
    usagePattern: "Determined from variance in annual mileage rates across recorded periods",
    remainingLife: "Estimated based on typical lifespan for vehicles of this type and current usage",
    
    // Sources and methodology
    dataSource: "MOT testing mileage records are collected by DVSA during mandatory vehicle testing",
    estimationMethodology: "Where data is limited, statistical models based on UK vehicle fleet data provide estimates",
    
    // Context tooltips
    ukAverageMileage: "The UK average annual mileage is approximately 6,800 miles as of 2024",
    fuelTypeContext: "Different fuel types typically have different average annual mileages in the UK market",
    vehicleTypeContext: "Commercial vehicles, family cars, and sports cars have different typical usage patterns"
  };