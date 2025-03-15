/**
 * Analyzes a UK registration number to determine regional factors
 * with enhanced environmental and risk analysis
 * 
 * @param {string} registrationNumber - The vehicle registration number
 * @returns {Object} Region information and potential regional factors with enhanced insights
 */
const analyzeRegistrationRegion = (registrationNumber) => {
  if (!registrationNumber) return null;
  
  // Clean the registration (remove spaces and convert to uppercase)
  const cleanReg = registrationNumber.replace(/\s+/g, '').toUpperCase();
  
  // Extract memory tag (standard functionality)
  let memoryTag = "";
  
  if (cleanReg.length >= 2) {
    if (cleanReg.length >= 4 && /^[A-Z]{2}\d{2}[A-Z]{3}$/.test(cleanReg)) {
      memoryTag = cleanReg.substring(0, 2);
    } else {
      memoryTag = cleanReg.substring(0, 2);
    }
  }
  
  // Define standard region mapping (existing code)
  const regionMapping = {
    // Anglia
    "A": { region: "Anglia", areas: ["Peterborough", "Norwich", "Ipswich"] },
    
    // Birmingham
    "B": { region: "Birmingham", areas: ["Birmingham"] },
    
    // Cymru (Wales)
    "C": { region: "Wales", areas: ["Cardiff", "Swansea", "Bangor"] },
    
    // Deeside to Shrewsbury
    "D": { region: "Deeside to Shrewsbury", areas: ["Chester", "Shrewsbury"] },
    
    // Essex
    "E": { region: "Essex", areas: ["Chelmsford"] },
    
    // Forest & Fens
    "F": { region: "Forest & Fens", areas: ["Nottingham", "Lincoln"] },
    
    // Garden of England
    "G": { region: "Garden of England", areas: ["Maidstone", "Brighton"] },
    
    // Hampshire & Dorset
    "H": { region: "Hampshire & Dorset", areas: ["Bournemouth", "Portsmouth"] },
    
    // Borehamwood & Northampton
    "K": { region: "Borehamwood & Northampton", areas: ["Borehamwood", "Northampton"] },
    
    // London
    "L": { region: "London", areas: ["Wimbledon", "Borehamwood", "Sidcup"] },
    
    // Manchester & Merseyside
    "M": { region: "Manchester & Merseyside", areas: ["Manchester"] },
    
    // North
    "N": { region: "North", areas: ["Newcastle", "Stockton"] },
    
    // Oxford
    "O": { region: "Oxford", areas: ["Oxford"] },
    
    // Preston
    "P": { region: "Preston", areas: ["Preston", "Carlisle"] },
    
    // Reading
    "R": { region: "Reading", areas: ["Theale"] },
    
    // Scotland
    "S": { region: "Scotland", areas: ["Glasgow", "Edinburgh", "Dundee", "Aberdeen", "Inverness"] },
    
    // Severn Valley
    "V": { region: "Severn Valley", areas: ["Worcester"] },
    
    // West of England
    "W": { region: "West of England", areas: ["Exeter", "Truro", "Bristol"] },
    
    // Yorkshire
    "Y": { region: "Yorkshire", areas: ["Leeds", "Sheffield", "Beverley"] }
  };
  
  // More detailed mapping for specific memory tags (existing code)
  const detailedMapping = {
    // Wales specific tags
    "CA": { region: "Wales", subregion: "Cardiff" },
    "CB": { region: "Wales", subregion: "Cardiff" },
    "CP": { region: "Wales", subregion: "Swansea" },
    "CU": { region: "Wales", subregion: "Bangor" },
    
    // Scotland specific tags
    "SA": { region: "Scotland", subregion: "Glasgow" },
    "SB": { region: "Scotland", subregion: "Glasgow" },
    "SC": { region: "Scotland", subregion: "Glasgow" },
    "SD": { region: "Scotland", subregion: "Glasgow" },
    "SE": { region: "Scotland", subregion: "Glasgow" },
    "SF": { region: "Scotland", subregion: "Glasgow" },
    "SG": { region: "Scotland", subregion: "Glasgow" },
    "SH": { region: "Scotland", subregion: "Glasgow" },
    "SJ": { region: "Scotland", subregion: "Glasgow" },
    "SK": { region: "Scotland", subregion: "Edinburgh" },
    "SL": { region: "Scotland", subregion: "Edinburgh" },
    "SM": { region: "Scotland", subregion: "Edinburgh" },
    "SN": { region: "Scotland", subregion: "Edinburgh" },
    "SO": { region: "Scotland", subregion: "Edinburgh" },
    "SP": { region: "Scotland", subregion: "Dundee" },
    "SR": { region: "Scotland", subregion: "Dundee" },
    "SS": { region: "Scotland", subregion: "Dundee" },
    "ST": { region: "Scotland", subregion: "Dundee" },
    "SU": { region: "Scotland", subregion: "Aberdeen" },
    "SV": { region: "Scotland", subregion: "Aberdeen" },
    "SW": { region: "Scotland", subregion: "Aberdeen" },
    "SX": { region: "Scotland", subregion: "Inverness" },
    "SY": { region: "Scotland", subregion: "Inverness" },
    
    // London specific tags
    "LA": { region: "London", subregion: "Wimbledon" },
    "LB": { region: "London", subregion: "Wimbledon" },
    "LC": { region: "London", subregion: "Wimbledon" },
    "LD": { region: "London", subregion: "Wimbledon" },
    "LE": { region: "London", subregion: "Wimbledon" },
    "LF": { region: "London", subregion: "Borehamwood" },
    "LG": { region: "London", subregion: "Borehamwood" },
    "LH": { region: "London", subregion: "Borehamwood" },
    "LJ": { region: "London", subregion: "Borehamwood" },
    "LK": { region: "London", subregion: "Borehamwood" },
    "LL": { region: "London", subregion: "Sidcup" },
    "LM": { region: "London", subregion: "Sidcup" },
    "LN": { region: "London", subregion: "Sidcup" },
    "LO": { region: "London", subregion: "Sidcup" },
    "LP": { region: "London", subregion: "Sidcup" },
    
    // Isle of Wight specific tag
    "HW": { region: "Isle of Wight", subregion: "Isle of Wight" },
    
    // Isle of Man specific tag
    "MN": { region: "Isle of Man", subregion: "Isle of Man" },
    "MAN": { region: "Isle of Man", subregion: "Isle of Man" }
  };
  
  // Determine region information
  let regionInfo = null;
  
  // Try detailed mapping first (for more specific two-letter tags)
  if (detailedMapping[memoryTag]) {
    regionInfo = detailedMapping[memoryTag];
  } 
  // Try by first letter of the memory tag for general regions
  else if (regionMapping[memoryTag.charAt(0)]) {
    regionInfo = {
      region: regionMapping[memoryTag.charAt(0)].region,
      subregion: regionMapping[memoryTag.charAt(0)].areas.join(", ")
    };
  }
  
  // If we couldn't determine the region, return null
  if (!regionInfo) {
    return null;
  }
  
  // ================== STANDARD FEATURES ==================
  
  // Determine potential regional factors that might affect the vehicle
  const regionalFactors = [];
  
  // Coastal areas - potential salt corrosion
  const coastalAreas = [
    "Anglia", "Essex", "Garden of England", "Hampshire & Dorset", 
    "West of England", "Isle of Wight", "Isle of Man"
  ];
  const coastalSubregions = [
    "Norwich", "Ipswich", "Brighton", "Portsmouth", "Bournemouth", 
    "Exeter", "Truro", "Aberdeen", "Inverness", "Bangor", "Swansea"
  ];
  
  if (coastalAreas.includes(regionInfo.region) || 
      (regionInfo.subregion && coastalSubregions.some(sr => regionInfo.subregion.includes(sr)))) {
    regionalFactors.push("Vehicle registered in a coastal area - check for potential salt-related corrosion");
  }
  
  // Urban areas - stop-start driving, more traffic
  const urbanAreas = ["London", "Birmingham", "Manchester & Merseyside"];
  const urbanSubregions = ["Glasgow", "Edinburgh", "Cardiff", "Bristol", "Leeds", "Sheffield"];
  
  if (urbanAreas.includes(regionInfo.region) || 
      (regionInfo.subregion && urbanSubregions.some(sr => regionInfo.subregion.includes(sr)))) {
    regionalFactors.push("Vehicle registered in a major urban area - likely subjected to stop-start driving conditions");
  }
  
  // Scottish highlands - extreme weather conditions
  if (regionInfo.region === "Scotland" && 
      (regionInfo.subregion && regionInfo.subregion.includes("Inverness"))) {
    regionalFactors.push("Vehicle registered in Scottish highlands - potentially exposed to extreme weather conditions");
  }
  
  // Rural areas - country roads, possible flooding
  const ruralAreas = ["Forest & Fens", "Severn Valley", "Wales"];
  const ruralSubregions = ["Lincoln", "Worcester", "Bangor", "Carlisle"];
  
  if (ruralAreas.includes(regionInfo.region) || 
      (regionInfo.subregion && ruralSubregions.some(sr => regionInfo.subregion.includes(sr)))) {
    regionalFactors.push("Vehicle registered in a rural area - may have been driven on country roads with variable surfaces");
  }
  
  // ================== ENHANCED ENVIRONMENTAL FEATURES ==================
  
  // Include enhanced environmental analysis for all users
  const environmentalInsights = {};
    
    // 1. Flood risk analysis
    const highFloodRiskAreas = {
      regions: ["Severn Valley", "West of England", "Yorkshire"],
      subregions: ["Lincoln", "Worcester", "York", "Carlisle", "Exeter"]
    };
    
    const mediumFloodRiskAreas = {
      regions: ["Anglia", "Essex", "Wales"],
      subregions: ["Norwich", "Ipswich", "Oxford", "Swansea"]
    };
    
    const isHighFloodRisk = highFloodRiskAreas.regions.includes(regionInfo.region) || 
                            (regionInfo.subregion && highFloodRiskAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    const isMediumFloodRisk = mediumFloodRiskAreas.regions.includes(regionInfo.region) || 
                              (regionInfo.subregion && mediumFloodRiskAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    environmentalInsights.floodRisk = {
      riskLevel: isHighFloodRisk ? "High" : (isMediumFloodRisk ? "Medium" : "Low"),
      details: isHighFloodRisk ? 
        "This area has experienced significant flooding in recent years. Check for water damage or flood repairs." :
        (isMediumFloodRisk ? 
          "This area has moderate flood risk. Consider checking for signs of water exposure." : 
          "This area has relatively low flood risk.")
    };
    
    // 2. Air quality analysis (for catalytic converter issues)
    const poorAirQualityAreas = {
      regions: ["London", "Birmingham", "Manchester & Merseyside"],
      subregions: ["Glasgow", "Leeds", "Wimbledon", "Borehamwood", "Sheffield"]
    };
    
    const moderateAirQualityAreas = {
      regions: ["Yorkshire", "Reading", "Borehamwood & Northampton"],
      subregions: ["Edinburgh", "Cardiff", "Bristol", "Oxford"]
    };
    
    const isPoorAirQuality = poorAirQualityAreas.regions.includes(regionInfo.region) || 
                             (regionInfo.subregion && poorAirQualityAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    const isModerateAirQuality = moderateAirQualityAreas.regions.includes(regionInfo.region) || 
                                 (regionInfo.subregion && moderateAirQualityAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    environmentalInsights.airQuality = {
      qualityLevel: isPoorAirQuality ? "Poor" : (isModerateAirQuality ? "Moderate" : "Good"),
      catalyticConverterImpact: isPoorAirQuality ? 
        "High pollution levels may have caused accelerated catalytic converter wear. Recommend emissions system check." :
        (isModerateAirQuality ? 
          "Moderate pollution levels. Consider checking emissions system performance." : 
          "Good air quality likely had minimal impact on emissions system.")
    };
    
    // 3. Road salt usage patterns
    const heavySaltUsageAreas = {
      regions: ["Scotland", "North", "Yorkshire"],
      subregions: ["Inverness", "Aberdeen", "Newcastle", "Leeds", "Carlisle"]
    };
    
    const moderateSaltUsageAreas = {
      regions: ["Manchester & Merseyside", "Wales", "Forest & Fens"],
      subregions: ["Birmingham", "Sheffield", "Preston", "Edinburgh", "Glasgow"]
    };
    
    const isHeavySaltUsage = heavySaltUsageAreas.regions.includes(regionInfo.region) || 
                             (regionInfo.subregion && heavySaltUsageAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    const isModerateSaltUsage = moderateSaltUsageAreas.regions.includes(regionInfo.region) || 
                                (regionInfo.subregion && moderateSaltUsageAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    environmentalInsights.roadSaltUsage = {
      usageLevel: isHeavySaltUsage ? "Heavy" : (isModerateSaltUsage ? "Moderate" : "Light"),
      details: isHeavySaltUsage ? 
        "This region uses heavy road salt treatment during winter months. Thoroughly inspect the undercarriage, brake lines, and suspension components for corrosion." :
        (isModerateSaltUsage ? 
          "This region uses moderate amounts of road salt. Check for signs of corrosion on the undercarriage and suspension components." : 
          "This region typically uses minimal road salt. Still advisable to check for any undercarriage corrosion.")
    };
    
    // 4. Accident blackspot analysis
    const highAccidentRiskAreas = {
      regions: ["London", "Manchester & Merseyside", "Birmingham"],
      subregions: ["Glasgow", "Leeds", "Bristol", "Newcastle", "Sheffield"]
    };
    
    const moderateAccidentRiskAreas = {
      regions: ["Yorkshire", "West of England", "Scotland"],
      subregions: ["Edinburgh", "Oxford", "Cardiff", "Exeter"]
    };
    
    const isHighAccidentRisk = highAccidentRiskAreas.regions.includes(regionInfo.region) || 
                               (regionInfo.subregion && highAccidentRiskAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    const isModerateAccidentRisk = moderateAccidentRiskAreas.regions.includes(regionInfo.region) || 
                                   (regionInfo.subregion && moderateAccidentRiskAreas.subregions.some(sr => regionInfo.subregion.includes(sr)));
    
    environmentalInsights.accidentRisk = {
      riskLevel: isHighAccidentRisk ? "High" : (isModerateAccidentRisk ? "Moderate" : "Low"),
      details: isHighAccidentRisk ? 
        "This area has numerous accident blackspots. Vehicles from this region have a statistically higher likelihood of previous accident damage. Consider a thorough inspection or HPI check." :
        (isModerateAccidentRisk ? 
          "This area has several known accident blackspots. Consider checking for signs of previous accident repairs." : 
          "This area has relatively few accident blackspots, though a full inspection is still recommended.")
    };
    
    // Add specific regional insurance insights
    environmentalInsights.insuranceInsight = {
      riskRating: isHighAccidentRisk ? "High" : (isModerateAccidentRisk ? "Moderate" : "Low"),
      details: isHighAccidentRisk ? 
        "Vehicles registered in this area typically face higher insurance premiums due to elevated accident and theft rates." :
        (isModerateAccidentRisk ? 
          "Insurance rates in this area are typically around the national average." : 
          "This area often enjoys lower-than-average insurance premiums.")
    };
  
  return {
    memoryTag,
    registrationRegion: regionInfo.region,
    registrationArea: regionInfo.subregion,
    regionalFactors,
    environmentalInsights
  };
};

export default analyzeRegistrationRegion;