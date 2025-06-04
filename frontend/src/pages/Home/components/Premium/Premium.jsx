import React from 'react';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  GovUKContainer,
  GovUKGridRow,
  GovUKGridColumnTwoThirds,
  GovUKGridColumnOneThird,
  GovUKHeadingL,
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  GovUKSectionBreak,
  GovUKInsetText,
  GovUKHeader,
  PremiumButton,
  PremiumBanner,
  PremiumInfoPanel,
  PremiumBadge,
  PremiumFeatureList,
  ReportSection,
  ReportTable,
  MotHistoryItem,
  DetailHeading,
  DetailCaption
} from '../../../../styles/theme';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// Minimal custom components for specific functionality
const SectionHeading = styled(GovUKHeadingM)`
  display: flex;
  align-items: center;
  gap: ${SPACING.M};
  margin-bottom: ${SPACING.L};
`;

const SectionNumber = styled('div')`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${FONT_SIZES.M};
  flex-shrink: 0;
`;

const ComparisonGrid = styled('div')`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(PremiumBanner)`
  display: flex;
  align-items: center;
  border: 3px solid ${COLORS.BLUE};
  background-color: ${COLORS.WHITE};
`;

const StatNumber = styled('div')`
  font-size: ${FONT_SIZES.XXXXL};
  font-weight: 700;
  color: ${COLORS.RED};
  line-height: 1;
  margin-right: ${SPACING.L};
`;

const ProcessStep = styled(MotHistoryItem)`
  border-left: 1px solid ${COLORS.LIGHT_GREY};
  border: 1px solid ${COLORS.LIGHT_GREY};
  background-color: ${COLORS.WHITE};
  display: flex;
  align-items: flex-start;
  gap: ${SPACING.L};
`;

const StepNumber = styled('div')`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${FONT_SIZES.L};
  font-weight: bold;
  flex-shrink: 0;
`;

const ExampleHeader = styled('div')`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  padding: ${SPACING.M};
  margin: -${SPACING.L} -${SPACING.L} ${SPACING.L} -${SPACING.L};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusIndicator = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: ${SPACING.M};
  background-color: ${props => {
    switch(props.status) {
      case 'good': return COLORS.GREEN;
      case 'warning': return COLORS.YELLOW;
      case 'danger': return COLORS.RED;
      default: return COLORS.MID_GREY;
    }
  }};
  color: ${props => props.status === 'warning' ? COLORS.BLACK : COLORS.WHITE};
  font-weight: bold;
  flex-shrink: 0;
  font-size: ${FONT_SIZES.M};
`;

const StyledProgress = styled(LinearProgress)`
  height: 8px;
  background-color: ${COLORS.LIGHT_GREY};
  margin-top: ${SPACING.S};
  
  & .MuiLinearProgress-bar {
    background-color: ${props => {
      switch(props.status) {
        case 'good': return COLORS.GREEN;
        case 'warning': return COLORS.YELLOW;
        case 'danger': return COLORS.RED;
        default: return COLORS.BLUE;
      }
    }};
  }
`;

const PremiumReportFeature = () => {
  return (
    <GovUKContainer>
      <div style={{ backgroundColor: COLORS.WHITE, borderTop: `6px solid ${COLORS.BLUE}`, borderBottom: `1px solid ${COLORS.MID_GREY}` }}>
        {/* Header */}
        <GovUKHeader style={{ borderBottom: 'none' }}>
          <PremiumBadge>
            Official DVLA Data
          </PremiumBadge>
          <GovUKHeadingL>Premium Vehicle Report</GovUKHeadingL>
          <GovUKBody>
            Evidence-based vehicle assessment connecting MOT history with manufacturer technical bulletins to identify patterns and provide a comprehensive analysis.
          </GovUKBody>
        </GovUKHeader>
        
        {/* Content Area */}
        <div style={{ padding: SPACING.XL }}>
          <GovUKGridRow>
            <GovUKGridColumnTwoThirds>
              {/* Comparative Value Section */}
              <SectionHeading>
                <SectionNumber>01</SectionNumber>
                Standard Check vs. Premium Report
              </SectionHeading>
              
              <ComparisonGrid>
                {/* Standard Check Column */}
                <ReportSection>
                  <GovUKHeadingS>
                    Standard Vehicle Check
                  </GovUKHeadingS>
                  <ul style={{ paddingLeft: SPACING.M, listStyleType: 'disc' }}>
                    <li style={{ marginBottom: SPACING.S }}>Basic MOT pass/fail history</li>
                    <li style={{ marginBottom: SPACING.S }}>Current vehicle status</li>
                    <li style={{ marginBottom: SPACING.S }}>Registration information</li>
                    <li>Simple list of previous tests</li>
                  </ul>
                </ReportSection>
                
                {/* Premium Report Column */}
                <ReportSection style={{ border: `2px solid ${COLORS.BLUE}`, position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '-1px', 
                    right: '-1px', 
                    backgroundColor: COLORS.GREEN, 
                    color: COLORS.WHITE, 
                    padding: `${SPACING.XS} ${SPACING.S}`, 
                    fontSize: FONT_SIZES.XS, 
                    fontWeight: 700, 
                    textTransform: 'uppercase' 
                  }}>
                    ENHANCED
                  </div>
                  <GovUKHeadingS style={{ color: COLORS.BLUE }}>
                    Premium Vehicle Report
                  </GovUKHeadingS>
                  <ul style={{ paddingLeft: SPACING.M, listStyleType: 'disc' }}>
                    <li style={{ marginBottom: SPACING.S }}>
                      <strong>Pattern analysis</strong> of recurring issues
                    </li>
                    <li style={{ marginBottom: SPACING.S }}>
                      <strong>Technical bulletin correlation</strong> with known issues
                    </li>
                    <li style={{ marginBottom: SPACING.S }}>
                      <strong>Component-level risk assessment</strong> for major systems
                    </li>
                    <li>
                      <strong>Evidence-based evaluation</strong> of maintenance needs
                    </li>
                  </ul>
                </ReportSection>
              </ComparisonGrid>
              
              <StatCard>
                <StatNumber>31%</StatNumber>
                <div style={{ flex: 1 }}>
                  <GovUKBody style={{ fontSize: FONT_SIZES.M, marginBottom: SPACING.XS }}>
                    of used vehicles have systematic issues that are only identifiable through pattern analysis across multiple MOT tests
                  </GovUKBody>
                  <GovUKBodyS style={{ color: COLORS.MID_GREY, fontStyle: 'italic' }}>
                    Source: DVLA MOT database analysis
                  </GovUKBodyS>
                </div>
              </StatCard>
              
              {/* Technical Analysis Section */}
              <ReportSection>
                <SectionHeading>
                  <SectionNumber>02</SectionNumber>
                  Technical Analysis Methodology
                </SectionHeading>
                
                <GovUKBody>
                  Our Premium Report utilizes a systematic analytical process to identify patterns and potential issues:
                </GovUKBody>
                
                <div style={{ marginTop: SPACING.L, marginBottom: SPACING.L }}>
                  <ProcessStep>
                    <StepNumber>1</StepNumber>
                    <div style={{ flex: 1 }}>
                      <GovUKHeadingS>Data Collection</GovUKHeadingS>
                      <GovUKBody>Complete MOT history from DVLA official records with full test details and advisory information</GovUKBody>
                    </div>
                  </ProcessStep>
                  
                  <ProcessStep>
                    <StepNumber>2</StepNumber>
                    <div style={{ flex: 1 }}>
                      <GovUKHeadingS>Pattern Analysis</GovUKHeadingS>
                      <GovUKBody>Systematic identification of recurring issues across test cycles and correlation timeline analysis</GovUKBody>
                    </div>
                  </ProcessStep>
                  
                  <ProcessStep>
                    <StepNumber>3</StepNumber>
                    <div style={{ flex: 1 }}>
                      <GovUKHeadingS>Technical Matching</GovUKHeadingS>
                      <GovUKBody>Cross-reference with manufacturer technical service bulletins and known issue patterns</GovUKBody>
                    </div>
                  </ProcessStep>
                </div>
                
                <PremiumInfoPanel style={{ backgroundColor: '#e8f4fd' }}>
                  <GovUKHeadingS style={{ color: COLORS.BLUE }}>Technical Assessment Process</GovUKHeadingS>
                  <GovUKBody>
                    Our correlation engine identifies relationships between recurring MOT issues and manufacturer service bulletins. This systematic approach reveals technical patterns that indicate potential underlying issues requiring assessment before they develop into serious faults.
                  </GovUKBody>
                </PremiumInfoPanel>
              </ReportSection>
              
              {/* Technical Bulletin Section */}
              <ReportSection style={{ border: `2px solid ${COLORS.BLUE}` }}>
                <SectionHeading>
                  <SectionNumber>03</SectionNumber>
                  Technical Bulletin Correlation Analysis
                </SectionHeading>
                
                <div style={{ border: `2px solid ${COLORS.BLUE}` }}>
                  <ExampleHeader>
                    <GovUKHeadingS style={{ margin: 0, color: COLORS.WHITE }}>Example Analysis: Technical Bulletin Matching</GovUKHeadingS>
                    <PremiumBadge style={{ backgroundColor: COLORS.YELLOW, color: COLORS.BLACK }}>SAMPLE REPORT</PremiumBadge>
                  </ExampleHeader>
                  
                  <div style={{ padding: SPACING.L }}>
                    <ReportTable>
                      <thead>
                        <tr>
                          <th>MOT Issue</th>
                          <th>Related Technical Bulletin</th>
                          <th>Technical Assessment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div>
                              <strong>Service brake grabbing</strong><br />
                              <small style={{ color: COLORS.MID_GREY }}>(2023)</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong style={{ color: COLORS.BLUE }}>"Loss of braking efficiency"</strong><br />
                              <small style={{ color: COLORS.MID_GREY }}>(TSB-BR1284)</small>
                            </div>
                          </td>
                          <td>Potential correlation with brake pressure sensors</td>
                        </tr>
                        <tr>
                          <td>
                            <div>
                              <strong>Anti-roll bar linkage wear</strong><br />
                              <small style={{ color: COLORS.MID_GREY }}>(2022, 2023)</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong style={{ color: COLORS.BLUE }}>"Shudder from rear when cornering"</strong><br />
                              <small style={{ color: COLORS.MID_GREY }}>(TSB-SUS2742)</small>
                            </div>
                          </td>
                          <td>Related component in suspension system</td>
                        </tr>
                        <tr>
                          <td>
                            <div>
                              <strong>Underside/structure corrosion</strong><br />
                              <small style={{ color: COLORS.MID_GREY }}>(2021-2023)</small>
                            </div>
                          </td>
                          <td style={{ fontStyle: 'italic', color: COLORS.MID_GREY }}>No direct bulletin match</td>
                          <td>Environmental exposure assessment recommended</td>
                        </tr>
                      </tbody>
                    </ReportTable>
                  </div>
                </div>
              </ReportSection>
              
              {/* Component Assessment Section */}
              <ReportSection>
                <SectionHeading>
                  <SectionNumber>04</SectionNumber>
                  Component-Level Risk Assessment
                </SectionHeading>
                
                <PremiumInfoPanel style={{ border: `2px solid ${COLORS.YELLOW}` }}>
                  <GovUKHeadingS>Vehicle System Risk Assessment</GovUKHeadingS>
                  
                  <MotHistoryItem style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <StatusIndicator status="warning">⚠️</StatusIndicator>
                    <div style={{ flex: 1 }}>
                      <DetailHeading style={{ margin: 0 }}>Suspension</DetailHeading>
                      <DetailCaption>Recurring anti-roll bar linkage issues, suspension arm bush wear</DetailCaption>
                      <StyledProgress variant="determinate" value={65} status="warning" />
                    </div>
                  </MotHistoryItem>
                  
                  <MotHistoryItem style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <StatusIndicator status="warning">⚠️</StatusIndicator>
                    <div style={{ flex: 1 }}>
                      <DetailHeading style={{ margin: 0 }}>Brakes</DetailHeading>
                      <DetailCaption>History of brake grab and worn pads/discs</DetailCaption>
                      <StyledProgress variant="determinate" value={60} status="warning" />
                    </div>
                  </MotHistoryItem>
                  
                  <MotHistoryItem style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <StatusIndicator status="danger">🔴</StatusIndicator>
                    <div style={{ flex: 1 }}>
                      <DetailHeading style={{ margin: 0 }}>Corrosion</DetailHeading>
                      <DetailCaption>Progressive underside/structural corrosion evident</DetailCaption>
                      <StyledProgress variant="determinate" value={85} status="danger" />
                    </div>
                  </MotHistoryItem>
                  
                  <MotHistoryItem style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <StatusIndicator status="good">✓</StatusIndicator>
                    <div style={{ flex: 1 }}>
                      <DetailHeading style={{ margin: 0 }}>Engine</DetailHeading>
                      <DetailCaption>No significant issues detected</DetailCaption>
                      <StyledProgress variant="determinate" value={95} status="good" />
                    </div>
                  </MotHistoryItem>
                </PremiumInfoPanel>
                
                <GovUKInsetText>
                  <GovUKHeadingS style={{ color: COLORS.BLUE, margin: `0 0 ${SPACING.S} 0` }}>
                    💡 Data-driven insights for informed decision-making
                  </GovUKHeadingS>
                  <GovUKBody style={{ margin: 0 }}>
                    Our technical correlation analysis identifies underlying issues that standard checks miss, helping you understand the vehicle's condition based on evidence rather than assumptions.
                  </GovUKBody>
                </GovUKInsetText>
              </ReportSection>
              
              <div style={{ textAlign: 'center', marginTop: SPACING.XL }}>
                <PremiumButton>
                  Get Vehicle Technical Report
                </PremiumButton>
              </div>
            </GovUKGridColumnTwoThirds>
            
            <GovUKGridColumnOneThird>
              {/* Report Benefits */}
              <ReportSection>
                <GovUKHeadingM style={{ marginBottom: SPACING.M }}>
                  Technical Report Features
                </GovUKHeadingM>
                
                <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
                
                <PremiumFeatureList>
                  <li>
                    <span style={{ marginRight: SPACING.S }}>📊</span>
                    <strong>Official DVLA Data</strong><br />
                    Complete MOT history with detailed records
                  </li>
                  <li>
                    <span style={{ marginRight: SPACING.S }}>🔍</span>
                    <strong>Technical Bulletin Matching</strong><br />
                    Correlation with manufacturer service information
                  </li>
                  <li>
                    <span style={{ marginRight: SPACING.S }}>⚙️</span>
                    <strong>Component Risk Assessment</strong><br />
                    Detailed evaluation of major vehicle systems
                  </li>
                  <li>
                    <span style={{ marginRight: SPACING.S }}>📋</span>
                    <strong>Evidence-Based Evaluation</strong><br />
                    Systematic analysis of patterns and indicators
                  </li>
                </PremiumFeatureList>
                
                <GovUKInsetText>
                  <strong>Verified data:</strong> All analysis is based on official DVLA records and manufacturer technical data processed through our correlation system.
                </GovUKInsetText>
              </ReportSection>
              
              {/* Technical Assessment Information */}
              <PremiumBanner>
                <GovUKHeadingM>Technical Assessment Methodology</GovUKHeadingM>
                
                <GovUKBody>
                  The Premium Report provides a systematic technical assessment based on:
                </GovUKBody>
                
                <ul style={{ paddingLeft: SPACING.M }}>
                  <li style={{ marginBottom: SPACING.S }}>
                    <GovUKBody>Pattern recognition of recurring issues</GovUKBody>
                  </li>
                  <li style={{ marginBottom: SPACING.S }}>
                    <GovUKBody>Correlation with manufacturer technical bulletins</GovUKBody>
                  </li>
                  <li style={{ marginBottom: SPACING.S }}>
                    <GovUKBody>Component lifecycle analysis using historical data</GovUKBody>
                  </li>
                  <li>
                    <GovUKBody>Evidence-based risk assessment for major systems</GovUKBody>
                  </li>
                </ul>
                
                <GovUKBody style={{ marginTop: SPACING.M }}>
                  This approach provides a comprehensive technical understanding of the vehicle's condition based on its documented history and known technical issues for that make and model.
                </GovUKBody>
              </PremiumBanner>
              
              {/* Data Verification */}
              <ReportSection>
                <GovUKHeadingM>Data Verification</GovUKHeadingM>
                
                <MotHistoryItem style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    backgroundColor: COLORS.BLUE, 
                    color: COLORS.WHITE, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 'bold', 
                    marginRight: SPACING.M, 
                    fontSize: FONT_SIZES.S 
                  }}>
                    DVLA
                  </div>
                  <div>
                    <GovUKBody style={{ marginBottom: 0 }}>
                      <strong>Official DVLA MOT Records</strong><br />
                      Direct from government database
                    </GovUKBody>
                  </div>
                </MotHistoryItem>
                
                <MotHistoryItem style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    backgroundColor: COLORS.BLUE, 
                    color: COLORS.WHITE, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 'bold', 
                    marginRight: SPACING.M, 
                    fontSize: FONT_SIZES.S 
                  }}>
                    TSB
                  </div>
                  <div>
                    <GovUKBody style={{ marginBottom: 0 }}>
                      <strong>Technical Service Bulletins</strong><br />
                      Manufacturer-issued documents
                    </GovUKBody>
                  </div>
                </MotHistoryItem>
              </ReportSection>
              
              <div style={{ textAlign: 'center', marginTop: SPACING.M }}>
                <PremiumButton>
                  Get Vehicle Technical Report
                </PremiumButton>
              </div>
            </GovUKGridColumnOneThird>
          </GovUKGridRow>
        </div>
      </div>
    </GovUKContainer>
  );
};

export default PremiumReportFeature;