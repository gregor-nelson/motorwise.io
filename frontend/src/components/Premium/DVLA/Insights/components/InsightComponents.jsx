// EnhancedInsightComponents.jsx
// Enhanced visual insight components matching the technical specs design

import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import {
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  GovUKDetails,
  GovUKDetailsSummary,
  GovUKDetailsText,
  COLORS,
  BREAKPOINTS
} from '../../../../../styles/theme';

// Import tooltip components
import {
  HeadingWithTooltip,
  ValueWithTooltip,
  CellWithTooltip,
  useTooltip,
  GovUKTooltip
} from '../../../../../styles/tooltip';

// Import Material-UI icons
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// Import calculator components
import FuelCostCalculator from '../../MPG/FuelCostCalculator';

// Enhanced styled components matching tech specs design
const VisualInsightsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  minHeight: '600px'
}));

const InsightCategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '30px',
  padding: '20px',
  backgroundColor: COLORS.WHITE,
  borderLeft: `10px solid ${COLORS.BLUE}`,
  borderBottom: `1px solid ${COLORS.MID_GREY}`
}));

const CategoryIcon = styled(Box)(({ color }) => ({
  width: '48px',
  height: '48px',
  backgroundColor: color || COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 700,
  flexShrink: 0,
  borderRadius: '4px'
}));

const InsightGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
  
  [`@media (max-width: ${BREAKPOINTS.tablet})`]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '15px'
  },
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    gridTemplateColumns: '1fr',
    gap: '15px'
  }
}));

const VisualInsightCard = styled(Box)(({ variant = 'default', status }) => ({
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  padding: '24px',
  position: 'relative',
  transition: 'all 0.2s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  
  ...(variant === 'gauge' && {
    textAlign: 'center',
    minHeight: '220px',
    justifyContent: 'center'
  }),
  
  ...(variant === 'progress' && {
    minHeight: '160px'
  }),
  
  ...(variant === 'status' && {
    minHeight: '140px'
  }),
  
  '&:hover': {
    boxShadow: '0 2px 0 0 rgba(0,0,0,0.1)',
    borderColor: COLORS.BLACK
  },
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '5px',
    backgroundColor: 
      status === 'good' ? COLORS.GREEN :
      status === 'warning' ? COLORS.ORANGE :
      status === 'critical' ? COLORS.RED :
      COLORS.BLUE,
    transition: 'opacity 0.2s ease'
  }
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px'
}));

const CardTitle = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 700,
  color: COLORS.DARK_GREY,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  lineHeight: 1.4,
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

const CardIcon = styled(Box)(({ color }) => ({
  width: '30px',
  height: '30px',
  backgroundColor: color || COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 700,
  flexShrink: 0,
  borderRadius: '3px'
}));

const MetricValue = styled(Box)(({ size = 'large', color }) => ({
  fontSize: size === 'large' ? '36px' : size === 'medium' ? '27px' : '19px',
  fontWeight: 700,
  color: color || COLORS.BLACK,
  lineHeight: 1.1,
  marginBottom: '8px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    fontSize: size === 'large' ? '27px' : size === 'medium' ? '24px' : '16px'
  }
}));

const MetricUnit = styled('span')(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 400,
  color: COLORS.DARK_GREY,
  marginLeft: '8px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

const MetricSubtext = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  color: COLORS.DARK_GREY,
  marginTop: '4px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// Enhanced Status Badge
const EnhancedStatusBadge = styled('strong')(({ status, size = 'medium' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: size === 'large' ? '8px 16px' : '5px 10px 4px',
  fontSize: size === 'large' ? '16px' : '14px',
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontFamily: '"GDS Transport", arial, sans-serif',
  backgroundColor: 
    status === 'good' || status === 'Compliant' || status === 'Low' ? COLORS.GREEN :
    status === 'warning' || status === 'Medium' ? COLORS.ORANGE :
    status === 'critical' || status === 'Non-Compliant' || status === 'High' ? COLORS.RED :
    status === 'Exempt' ? COLORS.BLUE :
    COLORS.DARK_GREY,
  color: COLORS.WHITE,
  borderRadius: '3px',
  
  '& svg': {
    fontSize: size === 'large' ? '20px' : '16px'
  }
}));

// Progress Bar Component
const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: '16px',
  width: '100%'
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '24px',
  backgroundColor: COLORS.LIGHT_GREY,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  position: 'relative',
  borderRadius: '3px',
  overflow: 'hidden'
}));

const ProgressFill = styled(Box)(({ color, width }) => ({
  height: '100%',
  width: `${width}%`,
  backgroundColor: color || COLORS.BLUE,
  transition: 'width 0.5s ease',
  position: 'relative',
  
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'shimmer 2s infinite'
  },
  
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
}));

const ProgressLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '16px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// Gauge components (reused from tech specs)
const GaugeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '140px',
  height: '140px',
  margin: '0 auto 16px'
}));

const GaugeSvg = styled('svg')(({ theme }) => ({
  transform: 'rotate(-90deg)'
}));

const GaugeTrack = styled('circle')(({ theme }) => ({
  fill: 'none',
  stroke: COLORS.MID_GREY,
  strokeWidth: '12'
}));

const GaugeFill = styled('circle')(({ color }) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: '12',
  strokeLinecap: 'round',
  transition: 'stroke-dashoffset 0.5s ease'
}));

const GaugeCenterText = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center'
}));

// Visual Divider
const VisualDivider = styled(Box)(({ theme }) => ({
  height: '3px',
  backgroundColor: COLORS.BORDER_COLOUR,
  margin: '40px 0'
}));

// Enhanced Insight Note
const EnhancedInsightNote = styled(Box)(({ variant = 'info' }) => ({
  backgroundColor: 
    variant === 'warning' ? '#fff7ed' :
    variant === 'success' ? '#f0fdf4' :
    variant === 'error' ? '#fef2f2' :
    COLORS.LIGHT_GREY,
  borderLeft: `5px solid ${
    variant === 'warning' ? COLORS.ORANGE :
    variant === 'success' ? COLORS.GREEN :
    variant === 'error' ? COLORS.RED :
    COLORS.BLUE
  }`,
  padding: '15px 20px',
  marginTop: '20px',
  marginBottom: '20px',
  
  '& p': {
    margin: 0,
    fontSize: '14px',
    color: COLORS.DARK_GREY
  }
}));

// Factor List with Icons
const EnhancedFactorList = styled('ul')(({ theme }) => ({
  listStyle: 'none',
  padding: 0,
  margin: '10px 0',
  
  '& li': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '12px',
    fontSize: '16px',
    lineHeight: 1.5,
    
    '& svg': {
      flexShrink: 0,
      marginTop: '2px'
    }
  }
}));

// Complete tooltip content from original
const tooltips = {
  // Section tooltips
  sectionOwnership: "Ownership data is sourced directly from DVLA records",
  sectionStatus: "Status data is sourced directly from DVLA and MOT databases",
  sectionEmissions: "Emissions data is sourced from official manufacturer records via DVLA when available, otherwise estimated based on vehicle specifications",
  sectionFuelEfficiency: "Fuel efficiency values are estimated based on UK government data for vehicles of similar specifications",
  
  // Fuel Efficiency tooltips
  mpgCombined: "Estimated based on vehicle engine size, fuel type, age and UK government data on typical fuel efficiency for similar vehicles.",
  mpgUrban: "Estimated urban driving efficiency based on UK government statistics for vehicles of this type and age.",
  mpgExtraUrban: "Estimated highway/motorway efficiency based on UK government statistics for vehicles of this type and age.",
  costPerMile: "Calculated using current average UK fuel prices and estimated MPG figures.",
  annualFuelCost: "Calculated based on average annual UK mileage of 7,200 miles and current fuel prices.",
  co2Emissions: "Calculated based on fuel type and estimated fuel efficiency using standard conversion factors.",
  
  // Electric vehicle tooltips
  evEfficiency: "Estimated miles per kWh based on typical performance of electric vehicles of this age and type.",
  evRange: "Estimated range based on typical battery capacity for EVs of this age and manufacturer.",
  evCostPerMile: "Calculated using average UK electricity prices of 6p per mile.",
  evAnnualSavings: "Comparison against equivalent petrol vehicle based on average UK mileage.",
  evCO2Savings: "Estimated CO2 savings compared to equivalent petrol vehicle using UK government conversion factors.",
  
  // Data source tooltips
  officialData: "This data is from official DVLA/government records.",
  estimatedData: "This is an estimated value based on vehicle specifications and UK government data.",
  marketTrends: "Based on UK Department for Transport vehicle licensing statistics.",
  
  // Efficiency context tooltips
  efficiencyContext: "Information derived from UK government 'Road fuel consumption and the UK motor vehicle fleet' report.",
  
  // Ownership tooltips
  ownershipStatus: "Determined from the length of current ownership based on DVLA records.",
  registrationGap: "Calculated from the difference between manufacture date and first UK registration date.",
  riskLevel: "Generated using algorithms based on ownership patterns and DVLA data.",
  
  // Status tooltips
  driveabilityStatus: "Determined based on current tax and MOT status from DVLA records.",
  taxStatus: "Current vehicle tax status according to DVLA records.",
  motStatus: "Current MOT test status according to DVSA records.",
  
  // General tooltips
  confidenceHigh: "High confidence (90%+): Based on official government data or direct measurements.",
  confidenceMedium: "Medium confidence (70-90%): Based on typical values for vehicles of this specification.",
  confidenceLow: "Low confidence (<70%): Limited data available, broader estimates applied.",
  
  // Notes tooltips
  fuelEfficiencyNote: "All fuel efficiency data is derived from UK Department for Business, Energy and Industrial Strategy's 'Road fuel consumption and the UK motor vehicle fleet' report"
};

// Gauge component
const Gauge = ({ value, max, unit, label, color, size = 140 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <Box>
      <GaugeContainer style={{ width: size, height: size }}>
        <GaugeSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <GaugeTrack
            cx={size/2}
            cy={size/2}
            r={radius}
          />
          <GaugeFill
            cx={size/2}
            cy={size/2}
            r={radius}
            color={color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </GaugeSvg>
        <GaugeCenterText>
          <MetricValue size="medium">{value}</MetricValue>
          <MetricSubtext>{unit}</MetricSubtext>
        </GaugeCenterText>
      </GaugeContainer>
      <CardTitle>{label}</CardTitle>
    </Box>
  );
};

// ENHANCED OWNERSHIP PANEL
export const OwnershipPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  const { environmentalInsights } = insights;
  
  // Calculate ownership score (0-100)
  const ownershipScore = insights.ownershipRiskLevel === 'Low' ? 85 : 
                        insights.ownershipRiskLevel === 'Medium' ? 50 : 20;
  
  // Determine ownership stability display
  const getOwnershipStability = (stability) => {
    switch(stability) {
      case 'Very Stable': return 'Long-term';
      case 'Stable': return 'Medium-term';
      case 'Moderate': return 'Medium-term';
      case 'Recent': return 'Short-term';
      case 'Very Recent': return 'Very Short-term';
      default: return stability;
    }
  };
  
  const ownershipStabilityDisplay = getOwnershipStability(insights.ownershipStability);
  
  return (
    <VisualInsightsContainer>
      <InsightCategoryHeader>
        <CategoryIcon color={COLORS.BLUE}>
          <DirectionsCarIcon />
        </CategoryIcon>
        <Box>
          <HeadingWithTooltip tooltip={tooltips.sectionOwnership} iconColor={COLORS.BLUE}>
            <GovUKHeadingM style={{ margin: 0 }}>Ownership & History</GovUKHeadingM>
          </HeadingWithTooltip>
          <GovUKBodyS style={{ margin: 0, marginTop: '4px' }}>
            Vehicle ownership patterns and regional analysis
          </GovUKBodyS>
        </Box>
      </InsightCategoryHeader>
      
      <InsightGrid>
        {/* Ownership Duration Card */}
        <VisualInsightCard variant="gauge">
          <Gauge
            value={insights.yearsWithCurrentOwner}
            max={20}
            unit="years"
            label="Current Ownership"
            color={insights.yearsWithCurrentOwner > 5 ? COLORS.GREEN : 
                  insights.yearsWithCurrentOwner > 2 ? COLORS.ORANGE : COLORS.RED}
          />
          <MetricSubtext>
            Since {insights.v5cDate.toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            })}
          </MetricSubtext>
        </VisualInsightCard>
        
        {/* Ownership Score */}
        <VisualInsightCard variant="progress">
          <CardHeader>
            <CardTitle>Ownership Stability</CardTitle>
            <CardIcon color={
              insights.ownershipRiskLevel === 'Low' ? COLORS.GREEN :
              insights.ownershipRiskLevel === 'Medium' ? COLORS.ORANGE :
              COLORS.RED
            }>
              <AccountBalanceIcon />
            </CardIcon>
          </CardHeader>
          <ProgressContainer>
            <ProgressLabel>
              <span style={{ fontWeight: 700 }}>{ownershipStabilityDisplay}</span>
              <EnhancedStatusBadge status={insights.ownershipRiskLevel}>
                {insights.ownershipRiskLevel} Risk
              </EnhancedStatusBadge>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill 
                color={ownershipScore > 70 ? COLORS.GREEN : 
                      ownershipScore > 40 ? COLORS.ORANGE : COLORS.RED} 
                width={ownershipScore} 
              />
            </ProgressBar>
          </ProgressContainer>
        </VisualInsightCard>
        
        {/* Registration Area Card */}
        {insights.registrationRegion && (
          <VisualInsightCard status="good">
            <CardHeader>
              <CardTitle>Registration Area</CardTitle>
              <CardIcon color={COLORS.BLUE}>
                <LocationOnIcon />
              </CardIcon>
            </CardHeader>
            <MetricValue size="medium">
              {insights.memoryTag || 'N/A'}
              <MetricUnit>{insights.registrationRegion}</MetricUnit>
            </MetricValue>
            {insights.registrationArea && (
              <MetricSubtext>{insights.registrationArea}</MetricSubtext>
            )}
          </VisualInsightCard>
        )}
        
        {/* Registration Gap Card */}
        {insights.regGapYears > 0 && (
          <VisualInsightCard status="warning">
            <CardHeader>
              <CardTitle>Registration Gap</CardTitle>
              <CardIcon color={COLORS.ORANGE}>
                <CalendarTodayIcon />
              </CardIcon>
            </CardHeader>
            <MetricValue size="large" color={COLORS.ORANGE}>
              {insights.regGapYears}
              <MetricUnit>years</MetricUnit>
            </MetricValue>
            <MetricSubtext>Between manufacture and UK registration</MetricSubtext>
          </VisualInsightCard>
        )}
      </InsightGrid>
      
      {/* Environmental Insights Section */}
      {environmentalInsights && (
        <>
          <GovUKHeadingS style={{ marginBottom: '20px' }}>
            Regional & Environmental Factors
          </GovUKHeadingS>
          
          <InsightGrid>
            {/* Flood Risk Card */}
            {environmentalInsights.floodRisk && (
              <VisualInsightCard 
                variant="status" 
                status={
                  environmentalInsights.floodRisk.riskLevel === 'Low' ? 'good' :
                  environmentalInsights.floodRisk.riskLevel === 'Medium' ? 'warning' : 'critical'
                }
              >
                <CardHeader>
                  <CardTitle>Flood Risk</CardTitle>
                  <CardIcon color={
                    environmentalInsights.floodRisk.riskLevel === 'Low' ? COLORS.GREEN :
                    environmentalInsights.floodRisk.riskLevel === 'Medium' ? COLORS.ORANGE : 
                    COLORS.RED
                  }>
                    {environmentalInsights.floodRisk.riskLevel === 'Low' ? '✓' :
                     environmentalInsights.floodRisk.riskLevel === 'Medium' ? '!' : '✗'}
                  </CardIcon>
                </CardHeader>
                <EnhancedStatusBadge 
                  status={environmentalInsights.floodRisk.riskLevel} 
                  size="large"
                >
                  {environmentalInsights.floodRisk.riskLevel === 'Low' ? 
                    <CheckCircleIcon /> : 
                    environmentalInsights.floodRisk.riskLevel === 'High' ? 
                      <CancelIcon /> : 
                      <WarningIcon />
                  }
                  {environmentalInsights.floodRisk.riskLevel}
                </EnhancedStatusBadge>
                <MetricSubtext style={{ marginTop: '10px' }}>
                  {environmentalInsights.floodRisk.details}
                </MetricSubtext>
              </VisualInsightCard>
            )}
            
            {/* Air Quality Card */}
            {environmentalInsights.airQuality && (
              <VisualInsightCard 
                variant="status" 
                status={
                  environmentalInsights.airQuality.qualityLevel === 'Good' ? 'good' :
                  environmentalInsights.airQuality.qualityLevel === 'Moderate' ? 'warning' : 'critical'
                }
              >
                <CardHeader>
                  <CardTitle>Air Quality</CardTitle>
                  <CardIcon color={
                    environmentalInsights.airQuality.qualityLevel === 'Good' ? COLORS.GREEN :
                    environmentalInsights.airQuality.qualityLevel === 'Moderate' ? COLORS.ORANGE : 
                    COLORS.RED
                  }>
                  </CardIcon>
                </CardHeader>
                <EnhancedStatusBadge 
                  status={environmentalInsights.airQuality.qualityLevel} 
                  size="large"
                >
                  {environmentalInsights.airQuality.qualityLevel}
                </EnhancedStatusBadge>
                <MetricSubtext style={{ marginTop: '10px' }}>
                  {environmentalInsights.airQuality.catalyticConverterImpact}
                </MetricSubtext>
              </VisualInsightCard>
            )}
            
            {/* Road Salt Card */}
            {environmentalInsights.roadSaltUsage && (
              <VisualInsightCard 
                variant="status" 
                status={
                  environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? 'good' :
                  environmentalInsights.roadSaltUsage.usageLevel === 'Moderate' ? 'warning' : 'critical'
                }
              >
                <CardHeader>
                  <CardTitle>Road Salt Exposure</CardTitle>
                  <CardIcon color={
                    environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? COLORS.GREEN :
                    environmentalInsights.roadSaltUsage.usageLevel === 'Moderate' ? COLORS.ORANGE : 
                    COLORS.RED
                  }>
                    <LocalShippingIcon />
                  </CardIcon>
                </CardHeader>
                <EnhancedStatusBadge 
                  status={environmentalInsights.roadSaltUsage.usageLevel} 
                  size="large"
                >
                  {environmentalInsights.roadSaltUsage.usageLevel}
                </EnhancedStatusBadge>
                <MetricSubtext style={{ marginTop: '10px' }}>
                  {environmentalInsights.roadSaltUsage.details}
                </MetricSubtext>
              </VisualInsightCard>
            )}
          </InsightGrid>
        </>
      )}
      
      {/* Risk and Positive Factors */}
      {(insights.riskFactors?.length > 0 || insights.positiveFactors?.length > 0) && (
        <>
          <VisualDivider />
          {insights.riskFactors?.length > 0 && (
            <Box mb={3}>
              <GovUKHeadingS style={{ color: COLORS.RED, marginBottom: '10px' }}>
                <WarningIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Risk Factors
              </GovUKHeadingS>
              <EnhancedFactorList>
                {insights.riskFactors.map((factor, index) => (
                  <li key={index}>
                    <WarningIcon fontSize="small" style={{ color: COLORS.RED }} />
                    <span>{factor}</span>
                  </li>
                ))}
              </EnhancedFactorList>
            </Box>
          )}
          
          {insights.positiveFactors?.length > 0 && (
            <Box>
              <GovUKHeadingS style={{ color: COLORS.GREEN, marginBottom: '10px' }}>
                <CheckCircleIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Positive Factors
              </GovUKHeadingS>
              <EnhancedFactorList>
                {insights.positiveFactors.map((factor, index) => (
                  <li key={index}>
                    <CheckCircleIcon fontSize="small" style={{ color: COLORS.GREEN }} />
                    <span>{factor}</span>
                  </li>
                ))}
              </EnhancedFactorList>
            </Box>
          )}
        </>
      )}
      
      {/* Data Source Note */}
      {insights.registrationRegion && (
        <EnhancedInsightNote variant="info">
          <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px', color: COLORS.BLUE }} />
          Regional and environmental assessments are based on statistical data for the vehicle's registration area.
          Individual vehicle experiences may vary based on specific usage patterns and maintenance history.
        </EnhancedInsightNote>
      )}
    </VisualInsightsContainer>
  );
};

// ENHANCED STATUS PANEL
export const StatusPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  // Calculate days until MOT as percentage (365 days = 100%)
  const motPercentage = insights.daysUntilMotExpiry > 0 
    ? Math.min((insights.daysUntilMotExpiry / 365) * 100, 100)
    : 0;
  
  return (
    <VisualInsightsContainer>
      <InsightCategoryHeader>
        <CategoryIcon color={COLORS.PURPLE}>
          <SpeedIcon />
        </CategoryIcon>
        <Box>
          <HeadingWithTooltip tooltip={tooltips.sectionStatus} iconColor={COLORS.PURPLE}>
            <GovUKHeadingM style={{ margin: 0 }}>Current Status</GovUKHeadingM>
          </HeadingWithTooltip>
          <GovUKBodyS style={{ margin: 0, marginTop: '4px' }}>
            Tax and MOT status information
          </GovUKBodyS>
        </Box>
      </InsightCategoryHeader>
      
      <InsightGrid>
        {/* Driveability Status Card */}
        <VisualInsightCard 
          variant="status"
          status={insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' ? 'good' : 'critical'}
        >
          <CardHeader>
            <CardTitle>Driveability Status</CardTitle>
            <CardIcon color={
              insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' ? COLORS.GREEN : COLORS.RED
            }>
              <DirectionsCarIcon />
            </CardIcon>
          </CardHeader>
          <EnhancedStatusBadge 
            status={insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' ? 'good' : 'critical'}
            size="large"
          >
            {insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' ? 
              <CheckCircleIcon /> : <CancelIcon />
            }
            {insights.driveabilityStatus}
          </EnhancedStatusBadge>
          <MetricSubtext style={{ marginTop: '10px' }}>
            {insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal'
              ? 'Vehicle meets all legal requirements'
              : 'Vehicle requires attention'}
          </MetricSubtext>
        </VisualInsightCard>
        
        {/* Tax Status Card */}
        <VisualInsightCard 
          variant="status"
          status={
            insights.isTaxExempt ? 'Exempt' : 
            insights.taxStatus === 'TAXED' ? 'good' : 'critical'
          }
        >
          <CardHeader>
            <CardTitle>Tax Status</CardTitle>
            <CardIcon color={
              insights.isTaxExempt || insights.taxStatus === 'TAXED' ? COLORS.GREEN : COLORS.RED
            }>
              <AccountBalanceIcon />
            </CardIcon>
          </CardHeader>
          <EnhancedStatusBadge 
            status={insights.isTaxExempt ? 'Exempt' : insights.taxStatus}
            size="large"
          >
            {insights.isTaxExempt ? 'Tax Exempt' : insights.taxStatus}
          </EnhancedStatusBadge>
          {insights.isTaxExempt && (
            <MetricSubtext style={{ marginTop: '10px' }}>
              Exempt from Vehicle Tax
            </MetricSubtext>
          )}
        </VisualInsightCard>
        
        {/* MOT Status Card */}
        {!insights.isPossiblyMotExempt && insights.motExpiryDate && (
          <VisualInsightCard variant="progress">
            <CardHeader>
              <CardTitle>MOT Expiry</CardTitle>
              <CardIcon color={
                insights.daysUntilMotExpiry < 0 ? COLORS.RED :
                insights.daysUntilMotExpiry < 30 ? COLORS.ORANGE : COLORS.GREEN
              }>
                <CalendarTodayIcon />
              </CardIcon>
            </CardHeader>
            <MetricValue size="medium">
              {insights.daysUntilMotExpiry > 0 ? insights.daysUntilMotExpiry : 0}
              <MetricUnit>days</MetricUnit>
            </MetricValue>
            <ProgressContainer>
              <ProgressBar>
                <ProgressFill 
                  color={
                    insights.daysUntilMotExpiry < 0 ? COLORS.RED :
                    insights.daysUntilMotExpiry < 30 ? COLORS.ORANGE : COLORS.GREEN
                  }
                  width={motPercentage}
                />
              </ProgressBar>
            </ProgressContainer>
            <MetricSubtext>
              {insights.motExpiryDate.toLocaleDateString('en-GB', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
              {insights.daysUntilMotExpiry < 0 && ' (Expired)'}
            </MetricSubtext>
          </VisualInsightCard>
        )}
        
        {/* MOT Exempt Card */}
        {insights.isPossiblyMotExempt && (
          <VisualInsightCard variant="status" status="Exempt">
            <CardHeader>
              <CardTitle>MOT Status</CardTitle>
              <CardIcon color={COLORS.BLUE}>
                <InfoIcon />
              </CardIcon>
            </CardHeader>
            <EnhancedStatusBadge status="Exempt" size="large">
              MOT Exempt
            </EnhancedStatusBadge>
            <MetricSubtext style={{ marginTop: '10px' }}>
              Potentially exempt from MOT requirements
            </MetricSubtext>
          </VisualInsightCard>
        )}
        
        {/* Risk Level Card */}
        <VisualInsightCard 
          variant="gauge"
          status={insights.statusRiskLevel}
        >
          <Gauge
            value={
              insights.statusRiskLevel === 'Low' ? 90 :
              insights.statusRiskLevel === 'Medium' ? 50 : 20
            }
            max={100}
            unit="%"
            label="Status Risk Score"
            color={
              insights.statusRiskLevel === 'Low' ? COLORS.GREEN :
              insights.statusRiskLevel === 'Medium' ? COLORS.ORANGE : COLORS.RED
            }
          />
          <EnhancedStatusBadge status={insights.statusRiskLevel}>
            {insights.statusRiskLevel} Risk
          </EnhancedStatusBadge>
        </VisualInsightCard>
      </InsightGrid>
      
      {/* Risk and Positive Factors */}
      {(insights.riskFactors?.length > 0 || insights.considerations?.length > 0) && (
        <>
          <VisualDivider />
          {insights.riskFactors?.length > 0 && (
            <Box mb={3}>
              <GovUKHeadingS style={{ color: COLORS.RED, marginBottom: '10px' }}>
                <WarningIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Risk Factors
              </GovUKHeadingS>
              <EnhancedFactorList>
                {insights.riskFactors.map((factor, index) => (
                  <li key={index}>
                    <WarningIcon fontSize="small" style={{ color: COLORS.RED }} />
                    <span>{factor}</span>
                  </li>
                ))}
              </EnhancedFactorList>
            </Box>
          )}
          
          {insights.considerations?.length > 0 && (
            <Box>
              <GovUKHeadingS style={{ color: COLORS.BLUE, marginBottom: '10px' }}>
                <InfoIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Considerations
              </GovUKHeadingS>
              <EnhancedFactorList>
                {insights.considerations.map((consideration, index) => (
                  <li key={index}>
                    <InfoIcon fontSize="small" style={{ color: COLORS.BLUE }} />
                    <span>{consideration}</span>
                  </li>
                ))}
              </EnhancedFactorList>
            </Box>
          )}
        </>
      )}
    </VisualInsightsContainer>
  );
};

// ENHANCED EMISSIONS PANEL
export const EmissionsPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  const { withTooltip } = useTooltip();
  
  // Calculate emissions score (lower is better)
  const emissionsScore = insights.co2Emissions 
    ? Math.max(0, 100 - (insights.co2Emissions / 5))
    : 50;
    
  // Determine if we should show compliance verification
  // Show for non-compliant petrol vehicles that aren't historic or diesel
  const showComplianceVerification = (!insights.isULEZCompliant || !insights.isScottishLEZCompliant) && 
                                   !insights.isHistoricVehicle && 
                                   insights.showComplianceVerification;
  
  return (
    <VisualInsightsContainer>
      <InsightCategoryHeader>
        <CategoryIcon color={COLORS.GREEN}>
        </CategoryIcon>
        <Box>
          <HeadingWithTooltip 
            tooltip={insights.isEstimated ? tooltips.sectionEmissions : tooltips.sectionEmissions}
            iconColor={COLORS.GREEN}
          >
            <GovUKHeadingM style={{ margin: 0 }}>Emissions & Tax</GovUKHeadingM>
          </HeadingWithTooltip>
          <GovUKBodyS style={{ margin: 0, marginTop: '4px' }}>
            Environmental impact and tax calculations
          </GovUKBodyS>
        </Box>
      </InsightCategoryHeader>
      
      {/* Historic Vehicle Notice */}
      {insights.isHistoricVehicle && (
        <EnhancedInsightNote variant="success">
          <strong>Historic Vehicle Status:</strong> This vehicle qualifies as a historic vehicle (40+ years old).
          {insights.isMotExempt && " It is exempt from MOT testing requirements."}
          {insights.annualTaxCost?.includes("Exempt") && " It is also exempt from vehicle tax when registered in the 'Historic Vehicle' tax class with the DVLA."}
        </EnhancedInsightNote>
      )}
      
      <InsightGrid>
        {/* CO2 Emissions Gauge */}
        <VisualInsightCard variant="gauge">
          <Gauge
            value={insights.co2Emissions || 0}
            max={500}
            unit="g/km"
            label="CO2 Emissions"
            color={
              insights.co2Emissions < 100 ? COLORS.GREEN :
              insights.co2Emissions < 150 ? COLORS.ORANGE : COLORS.RED
            }
          />
          {insights.isEstimated && (
            <MetricSubtext>Estimated value</MetricSubtext>
          )}
        </VisualInsightCard>
        
        {/* Euro Standard Card */}
        {insights.euroStatus && (
          <VisualInsightCard variant="status">
            <CardHeader>
              <CardTitle>Emissions Standard</CardTitle>
              <CardIcon color={COLORS.BLUE}>
              </CardIcon>
            </CardHeader>
            <MetricValue size="medium">
              {insights.euroStatus}
            </MetricValue>
            {insights.euroSubcategory && (
              <MetricSubtext>{insights.euroSubcategory}</MetricSubtext>
            )}
            {insights.rde2Compliant && (
              <EnhancedStatusBadge status="good" style={{ marginTop: '10px' }}>
                RDE2 Compliant
              </EnhancedStatusBadge>
            )}
          </VisualInsightCard>
        )}
        
        {/* Annual Tax Card */}
        {!insights.annualTaxCost?.includes("Exempt") && (
          <VisualInsightCard variant="status">
            <CardHeader>
              <CardTitle>Annual Road Tax</CardTitle>
              <CardIcon color={COLORS.BLUE}>
                <AccountBalanceIcon />
              </CardIcon>
            </CardHeader>
            <MetricValue size="large">
              {insights.annualTaxCost}
            </MetricValue>
            {insights.taxBand && insights.taxBand !== "N/A (Standard Rate)" && (
              <MetricSubtext>Tax Band {insights.taxBand}</MetricSubtext>
            )}
            {insights.annualTaxCostDirectDebit && 
             !insights.annualTaxCostDirectDebit.includes("£0") && (
              <MetricSubtext style={{ marginTop: '8px' }}>
                Direct Debit: {insights.annualTaxCostDirectDebit}
              </MetricSubtext>
            )}
          </VisualInsightCard>
        )}
        
        {/* Tax Exempt Card */}
        {insights.annualTaxCost?.includes("Exempt") && (
          <VisualInsightCard variant="status" status="Exempt">
            <CardHeader>
              <CardTitle>Tax Status</CardTitle>
              <CardIcon color={COLORS.BLUE}>
                <AccountBalanceIcon />
              </CardIcon>
            </CardHeader>
            <EnhancedStatusBadge status="Exempt" size="large">
              <CheckCircleIcon />
              Tax Exempt
            </EnhancedStatusBadge>
            <MetricSubtext style={{ marginTop: '10px' }}>
              {insights.annualTaxCost}
            </MetricSubtext>
          </VisualInsightCard>
        )}
        
        {/* ULEZ Compliance Card */}
        <VisualInsightCard 
          variant="status"
          status={insights.isULEZCompliant ? 'good' : 'critical'}
        >
          <CardHeader>
            <CardTitle>ULEZ Status</CardTitle>
            <CardIcon color={
              insights.isULEZCompliant ? COLORS.GREEN : COLORS.RED
            }>
              {insights.isULEZCompliant ? <CheckCircleIcon /> : <CancelIcon />}
            </CardIcon>
          </CardHeader>
          <EnhancedStatusBadge 
            status={insights.isULEZCompliant ? 'Compliant' : 'Non-Compliant'}
            size="large"
          >
            {insights.isULEZCompliant ? 
              <CheckCircleIcon /> : <CancelIcon />
            }
            {insights.isULEZCompliant ? 
              (insights.isHistoricVehicle ? 'Compliant (Historic)' : 'Compliant') : 
              'Non-Compliant'
            }
          </EnhancedStatusBadge>
          <MetricSubtext style={{ marginTop: '10px' }}>
            Ultra Low Emission Zone
          </MetricSubtext>
        </VisualInsightCard>
        
        {/* Scottish LEZ Card */}
        <VisualInsightCard 
          variant="status"
          status={insights.isScottishLEZCompliant ? 'good' : 'critical'}
        >
          <CardHeader>
            <CardTitle>Scottish LEZ</CardTitle>
            <CardIcon color={
              insights.isScottishLEZCompliant ? COLORS.GREEN : COLORS.RED
            }>
              {insights.isScottishLEZCompliant ? <CheckCircleIcon /> : <CancelIcon />}
            </CardIcon>
          </CardHeader>
          <EnhancedStatusBadge 
            status={insights.isScottishLEZCompliant ? 'Compliant' : 'Non-Compliant'}
            size="large"
          >
            {insights.isScottishLEZCompliant ? 
              <CheckCircleIcon /> : <CancelIcon />
            }
            {insights.isScottishLEZCompliant ? 
              (insights.isHistoricVehicle ? 'Compliant (Historic)' : 'Compliant') : 
              'Non-Compliant'
            }
          </EnhancedStatusBadge>
          <MetricSubtext style={{ marginTop: '10px' }}>
            Low Emission Zone
          </MetricSubtext>
        </VisualInsightCard>
      </InsightGrid>
      
      {/* Clean Air Zone Impact */}
      <EnhancedInsightNote 
        variant={insights.cleanAirZoneImpact.includes("not compliant") ? "warning" : "success"}
      >
        <strong>Clean Air Zone Impact:</strong> {insights.cleanAirZoneImpact}
        {insights.isHistoricVehicle && insights.cleanAirZoneImpact.includes("exempt") && 
          " However, always check with the relevant authorities before travel as exemption policies may change."}
      </EnhancedInsightNote>
      
      {/* Verify Compliance Section - only for non-exempt, non-diesel, non-compliant vehicles */}
      {showComplianceVerification && (
        <Box mt={3}>
          <GovUKHeadingS style={{ color: COLORS.BLUE, marginBottom: '10px' }}>
            <InfoIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Verify Your Compliance Status
          </GovUKHeadingS>
          <GovUKBody style={{ marginBottom: '10px' }}>
            Your petrol vehicle may actually meet emissions standards despite being listed as non-compliant.
          </GovUKBody>
          <EnhancedFactorList>
            <li>
              <InfoIcon fontSize="small" style={{ color: COLORS.BLUE }} />
              <span>Check your V5C for NOx emissions below 0.08 g/km (Euro 4 standard)</span>
            </li>
            <li>
              <InfoIcon fontSize="small" style={{ color: COLORS.BLUE }} />
              <span>Or request a Certificate of Conformity from your manufacturer (provide your registration and VIN)</span>
            </li>
            <li>
              <InfoIcon fontSize="small" style={{ color: COLORS.BLUE }} />
              <span>Submit to: <a href="https://contact.drive-clean-air-zone.service.gov.uk/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.BLUE }}>CAZ Service</a>, <a href="https://tfl.gov.uk/modes/driving/ulez-make-an-enquiry-wizard" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.BLUE }}>TfL</a> (ULEZ), or your local LEZ authority</span>
            </li>
            <li>
              <InfoIcon fontSize="small" style={{ color: COLORS.BLUE }} />
              <span>This could save you from unnecessary clean air zone charges</span>
            </li>
          </EnhancedFactorList>
        </Box>
      )}
      
      {/* Scottish LEZ Penalty Information - Only show if not exempt due to historic status */}
      {insights.scottishLEZPenaltyInfo && 
       !insights.isScottishLEZCompliant && 
       !insights.isHistoricVehicle && (
        <Box mt={3}>
          <GovUKHeadingS style={{ color: COLORS.RED, marginBottom: '10px' }}>
            <WarningIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Scottish LEZ Penalty Information
          </GovUKHeadingS>
          <GovUKBody style={{ marginBottom: '10px' }}>
            Base penalty: {insights.scottishLEZPenaltyInfo.baseCharge}
          </GovUKBody>
          <GovUKBody style={{ marginBottom: '10px' }}>
            Penalties increase with repeated violations: 
            First: {insights.scottishLEZPenaltyInfo.firstSurcharge}, 
            Second: {insights.scottishLEZPenaltyInfo.secondSurcharge}, 
            Third: {insights.scottishLEZPenaltyInfo.thirdSurcharge}, 
            Fourth: {insights.scottishLEZPenaltyInfo.fourthSurcharge}
          </GovUKBody>
          <GovUKBody style={{ marginBottom: '10px' }}>
            {insights.scottishLEZPenaltyInfo.description}
          </GovUKBody>
          <GovUKBody>
            {insights.scottishLEZPenaltyInfo.resetPeriod}
          </GovUKBody>
        </Box>
      )}
      
      {/* Scottish LEZ Exemptions */}
      {insights.scottishExemptions && insights.scottishExemptions.length > 0 && (
        <Box mt={3}>
          <GovUKHeadingS style={{ color: COLORS.GREEN, marginBottom: '10px' }}>
            <CheckCircleIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Potential LEZ Exemptions
          </GovUKHeadingS>
          <EnhancedFactorList>
            {insights.scottishExemptions.map((exemption, index) => (
              <li key={index}>
                <CheckCircleIcon fontSize="small" style={{ color: COLORS.GREEN }} />
                <span><strong>{exemption.type}:</strong> {exemption.description}</span>
              </li>
            ))}
          </EnhancedFactorList>
        </Box>
      )}
      
      {/* Brake Particulate Info for Euro 7 */}
      {insights.brakeParticulateInfo && (
        <Box mt={3}>
          <GovUKHeadingS style={{ color: COLORS.BLUE, marginBottom: '10px' }}>
            <InfoIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Euro 7 Brake Particulate Standards
          </GovUKHeadingS>
          <GovUKBody>{insights.brakeParticulateInfo}</GovUKBody>
        </Box>
      )}
      
      {/* Additional Information Sections */}
      {insights.pollutantLimits?.length > 0 && (
        <Box mt={3}>
          <GovUKHeadingS style={{ marginBottom: '10px' }}>
            Euro Standard Pollutant Limits
          </GovUKHeadingS>
          <EnhancedFactorList>
            {insights.pollutantLimits.map((limit, index) => (
              <li key={index}>
                <InfoIcon fontSize="small" style={{ color: COLORS.BLUE }} />
                <span>{limit}</span>
              </li>
            ))}
          </EnhancedFactorList>
        </Box>
      )}
      
      {/* Tax Notes */}
      {insights.taxNotes?.length > 0 && (
        <>
          <VisualDivider />
          <Box>
            <GovUKHeadingS style={{ marginBottom: '10px' }}>
              Tax Information
            </GovUKHeadingS>
            <EnhancedFactorList>
              {insights.taxNotes.map((note, index) => (
                <li key={index}>
                  <InfoIcon fontSize="small" style={{ color: COLORS.BLUE }} />
                  <span>{note}</span>
                </li>
              ))}
            </EnhancedFactorList>
          </Box>
        </>
      )}
      
      {/* Estimation Note */}
      {insights.isEstimated && (
        <EnhancedInsightNote variant="info">
          <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          Emissions data and Euro status are estimated based on vehicle age, fuel type, and specifications.
          {insights.co2Emissions && ` CO2 estimate may have a margin of error of approximately ±15%.`}
        </EnhancedInsightNote>
      )}
    </VisualInsightsContainer>
  );
};

// ENHANCED FUEL EFFICIENCY PANEL
export const FuelEfficiencyPanelComponent = ({ insights, vehicleData }) => {
  if (!insights) return null;
  
  const { withTooltip } = useTooltip();
  
  return (
    <VisualInsightsContainer>
      <InsightCategoryHeader>
        <CategoryIcon color={COLORS.GREEN}>
          <LocalGasStationIcon />
        </CategoryIcon>
        <Box>
          <HeadingWithTooltip tooltip={tooltips.sectionFuelEfficiency} iconColor={COLORS.GREEN}>
            <GovUKHeadingM style={{ margin: 0 }}>Fuel Efficiency</GovUKHeadingM>
          </HeadingWithTooltip>
          <GovUKBodyS style={{ margin: 0, marginTop: '4px' }}>
            Estimated fuel consumption and running costs
          </GovUKBodyS>
        </Box>
      </InsightCategoryHeader>
      
      {insights.isElectric ? (
        <>
          <InsightGrid>
            {/* Electric Efficiency Gauge */}
            <VisualInsightCard variant="gauge">
              <Gauge
                value={parseFloat(insights.estimatedMilesPerKWh)}
                max={5}
                unit="mi/kWh"
                label="Electric Efficiency"
                color={COLORS.GREEN}
              />
            </VisualInsightCard>
            
            {/* Cost Per Mile */}
            <VisualInsightCard variant="status">
              <CardHeader>
                <CardTitle>Cost Per Mile</CardTitle>
                <CardIcon color={COLORS.GREEN}>
                  £
                </CardIcon>
              </CardHeader>
              <MetricValue size="large" color={COLORS.GREEN}>
                {insights.estimatedCostPerMile}
                <MetricUnit>per mile</MetricUnit>
              </MetricValue>
              <MetricSubtext>Based on average UK electricity prices</MetricSubtext>
            </VisualInsightCard>
            
            {/* Estimated Range */}
            <VisualInsightCard variant="status">
              <CardHeader>
                <CardTitle>Estimated Range</CardTitle>
                <CardIcon color={COLORS.BLUE}>
                  <SpeedIcon />
                </CardIcon>
              </CardHeader>
              <MetricValue size="large">
                {insights.estimatedRange}
              </MetricValue>
              <MetricSubtext>{insights.batteryCapacityEstimate}</MetricSubtext>
            </VisualInsightCard>
            
            {/* Annual Savings */}
            <VisualInsightCard variant="status" status="good">
              <CardHeader>
                <CardTitle>Annual Savings vs Petrol</CardTitle>
                <CardIcon color={COLORS.GREEN}>
                  £
                </CardIcon>
              </CardHeader>
              <MetricValue size="large" color={COLORS.GREEN}>
                {insights.annualSavingsVsPetrol}
              </MetricValue>
              <MetricSubtext>Based on 7,200 miles/year</MetricSubtext>
            </VisualInsightCard>
            
            {/* CO2 Savings */}
            <VisualInsightCard variant="status" status="good">
              <CardHeader>
                <CardTitle>Annual CO2 Savings</CardTitle>
                <CardIcon color={COLORS.GREEN}>
                </CardIcon>
              </CardHeader>
              <MetricValue size="large" color={COLORS.GREEN}>
                {insights.annualCO2Savings}
              </MetricValue>
              <MetricSubtext>Compared to equivalent petrol vehicle</MetricSubtext>
            </VisualInsightCard>
          </InsightGrid>
          
          <EnhancedInsightNote variant="info">
            <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
            {insights.evMarketGrowthInfo}
          </EnhancedInsightNote>
        </>
      ) : (
        <>
          <InsightGrid>
            {/* Combined MPG Gauge */}
            <VisualInsightCard variant="gauge">
              <Gauge
                value={parseFloat(insights.estimatedMPGCombined)}
                max={80}
                unit="MPG"
                label="Combined Fuel Economy"
                color={
                  parseFloat(insights.estimatedMPGCombined) > 50 ? COLORS.GREEN :
                  parseFloat(insights.estimatedMPGCombined) > 30 ? COLORS.ORANGE : COLORS.RED
                }
              />
            </VisualInsightCard>
            
            {/* Urban MPG */}
            <VisualInsightCard variant="progress">
              <CardHeader>
                <CardTitle>Urban MPG</CardTitle>
                <CardIcon color={COLORS.BLUE}>
                  <DirectionsCarIcon />
                </CardIcon>
              </CardHeader>
              <MetricValue size="medium">
                {insights.estimatedMPGUrban}
                <MetricUnit>MPG</MetricUnit>
              </MetricValue>
              <ProgressContainer>
                <ProgressBar>
                  <ProgressFill 
                    color={COLORS.BLUE}
                    width={(parseFloat(insights.estimatedMPGUrban) / 80) * 100}
                  />
                </ProgressBar>
              </ProgressContainer>
            </VisualInsightCard>
            
            {/* Extra-Urban MPG */}
            <VisualInsightCard variant="progress">
              <CardHeader>
                <CardTitle>Extra-Urban MPG</CardTitle>
                <CardIcon color={COLORS.GREEN}>
                  <SpeedIcon />
                </CardIcon>
              </CardHeader>
              <MetricValue size="medium">
                {insights.estimatedMPGExtraUrban}
                <MetricUnit>MPG</MetricUnit>
              </MetricValue>
              <ProgressContainer>
                <ProgressBar>
                  <ProgressFill 
                    color={COLORS.GREEN}
                    width={(parseFloat(insights.estimatedMPGExtraUrban) / 80) * 100}
                  />
                </ProgressBar>
              </ProgressContainer>
            </VisualInsightCard>
            
            {/* Cost Per Mile */}
            <VisualInsightCard variant="status">
              <CardHeader>
                <CardTitle>Cost Per Mile</CardTitle>
                <CardIcon color={COLORS.ORANGE}>
                  £
                </CardIcon>
              </CardHeader>
              <MetricValue size="large">
                £{insights.costPerMile}
                <MetricUnit>per mile</MetricUnit>
              </MetricValue>
              <MetricSubtext>Based on current fuel prices</MetricSubtext>
            </VisualInsightCard>
            
            {/* Annual Fuel Cost */}
            <VisualInsightCard variant="status">
              <CardHeader>
                <CardTitle>Annual Fuel Cost</CardTitle>
                <CardIcon color={COLORS.ORANGE}>
                  <LocalGasStationIcon />
                </CardIcon>
              </CardHeader>
              <MetricValue size="large">
                £{insights.annualFuelCost}
              </MetricValue>
              <MetricSubtext>Based on 7,200 miles/year</MetricSubtext>
            </VisualInsightCard>
            
            {/* CO2 Emissions */}
            {insights.co2EmissionsGPerKM && (
              <VisualInsightCard variant="status">
                <CardHeader>
                  <CardTitle>CO2 Emissions</CardTitle>
                  <CardIcon color={
                    parseFloat(insights.co2EmissionsGPerKM) < 120 ? COLORS.GREEN :
                    parseFloat(insights.co2EmissionsGPerKM) < 150 ? COLORS.ORANGE : COLORS.RED
                  }>
                  </CardIcon>
                </CardHeader>
                <MetricValue size="large">
                  {insights.co2EmissionsGPerKM}
                  <MetricUnit>g/km</MetricUnit>
                </MetricValue>
              </VisualInsightCard>
            )}
          </InsightGrid>
          
          {/* Efficiency Context */}
          {insights.fuelTypeEfficiencyNote && (
            <EnhancedInsightNote variant="info">
              <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
              {insights.fuelTypeEfficiencyNote}
            </EnhancedInsightNote>
          )}
          
          {/* Market Trends */}
          {insights.marketTrends && (
            <Box mt={3}>
              <GovUKHeadingS style={{ marginBottom: '10px' }}>
                Market Trends
              </GovUKHeadingS>
              <GovUKBody>{insights.marketTrends}</GovUKBody>
            </Box>
          )}
        </>
      )}
      
      {/* Fuel Cost Calculator */}
      <VisualDivider />
      <FuelCostCalculator 
        defaultValues={insights}
        fuelType={insights.isElectric ? "ELECTRIC" : vehicleData?.fuelType}
        isElectric={insights.isElectric}
      />
      
      <GovUKTooltip title={tooltips.fuelEfficiencyNote} arrow placement="top">
        <EnhancedInsightNote variant="info" style={{ borderBottom: '1px dotted #505a5f', cursor: 'help', display: 'inline-block' }}>
          <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          Fuel efficiency estimates are based on UK government data for vehicles of this type, age, and engine size. 
          Actual performance may vary based on driving style, maintenance, and conditions.
        </EnhancedInsightNote>
      </GovUKTooltip>
    </VisualInsightsContainer>
  );
};