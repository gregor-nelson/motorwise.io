import React, { useState } from 'react';
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
  GovUKSectionBreak,
  GovUKInsetText,
  GovUKList,
  PremiumButton
} from '../../../../styles/theme';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';

// Styled components for GOV.UK styling
const GovUKHeader = styled('div')`
  background-color: ${COLORS.WHITE};
  padding: ${SPACING.XL};
  color: ${COLORS.BLACK};
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background-color: ${COLORS.BLUE};
  }
`;

const ServiceBadge = styled('div')`
  display: inline-block;
  padding: ${SPACING.XS} ${SPACING.M};
  margin-bottom: ${SPACING.M};
  background-color: ${COLORS.BLACK};
  color: ${COLORS.WHITE};
  font-size: ${FONT_SIZES.XS};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SectionHeading = styled(GovUKHeadingM)`
  position: relative;
  margin-bottom: ${SPACING.L};
  padding-bottom: ${SPACING.S};
  padding-left: ${SPACING.M};
  border-left: 4px solid ${COLORS.BLUE};
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: ${COLORS.BLUE};
  }
`;

const StyledTabs = styled(Tabs)`
  border-bottom: 1px solid ${COLORS.MID_GREY};
  margin-bottom: ${SPACING.L};
  
  & .MuiTabs-indicator {
    background-color: ${COLORS.BLUE};
    height: 4px;
  }
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  font-weight: 600;
  font-size: ${FONT_SIZES.M};
  color: ${COLORS.BLACK};
  
  &.Mui-selected {
    color: ${COLORS.BLUE};
  }
`;

const ContentCard = styled(Paper)`
  padding: ${SPACING.L};
  margin-bottom: ${SPACING.L};
  border: 1px solid ${COLORS.LIGHT_GREY};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
`;

const HighlightedCard = styled(ContentCard)`
  border-left: 4px solid ${COLORS.BLUE};
`;

const FeatureCard = styled(ContentCard)`
  background-color: ${COLORS.WHITE};
`;

const StatCard = styled('div')`
  display: flex;
  align-items: center;
  background-color: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.L};
  margin-bottom: ${SPACING.L};
  margin-top: ${SPACING.L};
  border-left: 5px solid ${COLORS.BLUE};
`;

const ProcessStep = styled('div')`
  display: flex;
  align-items: flex-start;
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.M};
  border: 1px solid ${COLORS.LIGHT_GREY};
  background-color: ${COLORS.WHITE};
`;

const StepNumber = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  border-radius: 50%;
  font-size: ${FONT_SIZES.M};
  font-weight: bold;
  margin-right: ${SPACING.M};
  flex-shrink: 0;
`;

const StepContent = styled('div')`
  flex: 1;
`;

const StatusIndicator = styled('div')(({ status }) => {
  const colors = {
    good: COLORS.GREEN,
    warning: COLORS.YELLOW,
    danger: COLORS.RED,
  };
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    borderRadius: '4px',
    marginRight: SPACING.M,
    backgroundColor: colors[status] || COLORS.MID_GREY,
    color: status === 'warning' ? COLORS.BLACK : COLORS.WHITE,
    fontWeight: 'bold',
    flexShrink: 0,
    fontSize: FONT_SIZES.XS,
  };
});

const ComparisonGrid = styled('div')`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DataVerificationItem = styled('div')`
  display: flex;
  align-items: center;
  margin-bottom: ${SPACING.M};
  padding: ${SPACING.M};
  background-color: ${COLORS.LIGHT_GREY};
  border-radius: 4px;
`;

const DataSourceBadge = styled('div')`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: bold;
  margin-right: ${SPACING.M};
  flex-shrink: 0;
`;

const CustomTable = styled('table')`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: ${SPACING.L};
  font-size: ${FONT_SIZES.S};
  border: 1px solid ${COLORS.MID_GREY};
  
  & th {
    text-align: left;
    padding: ${SPACING.M};
    background-color: ${COLORS.LIGHT_GREY};
    border-bottom: 2px solid ${COLORS.MID_GREY};
    font-weight: 700;
    color: ${COLORS.BLACK};
  }
  
  & td {
    padding: ${SPACING.M};
    border-bottom: 1px solid ${COLORS.LIGHT_GREY};
    vertical-align: middle;
  }
  
  & tr:last-child td {
    border-bottom: none;
  }
`;

const SystemAssessmentItem = styled('div')`
  display: flex;
  align-items: flex-start;
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.M};
  background-color: ${COLORS.WHITE};
  border: 1px solid ${COLORS.LIGHT_GREY};
`;

const ProgressContainer = styled('div')`
  width: 100%;
  margin-top: ${SPACING.S};
`;

const StyledProgress = styled(LinearProgress)(({ status }) => {
  const colors = {
    good: COLORS.GREEN,
    warning: COLORS.YELLOW,
    danger: COLORS.RED,
  };
  
  return {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.LIGHT_GREY,
    '& .MuiLinearProgress-bar': {
      backgroundColor: colors[status] || COLORS.BLUE,
    },
  };
});

const FeatureItem = styled('li')`
  padding: ${SPACING.M} 0;
  border-bottom: 1px solid ${COLORS.LIGHT_GREY};
  position: relative;
  padding-left: 32px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FeatureCheck = styled('span')`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: ${COLORS.BLUE};
  font-weight: bold;
`;

const FeatureItemTitle = styled('h4')`
  font-size: ${FONT_SIZES.M};
  margin: 0 0 ${SPACING.XS} 0;
  font-weight: 600;
  color: ${COLORS.BLACK};
`;

const MainContainer = styled('div')`
  background-color: ${COLORS.WHITE};
  border-top: 6px solid ${COLORS.BLUE};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ContentArea = styled('div')`
  padding: ${SPACING.XL};
`;

const TechnicalLabel = styled('div')`
  position: absolute;
  top: -12px;
  left: 24px;
  padding: ${SPACING.XS} ${SPACING.M};
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: 700;
  font-size: ${FONT_SIZES.S};
`;

const StatCardValue = styled('span')`
  font-size: ${FONT_SIZES.XXXL};
  font-weight: 700;
  color: ${COLORS.BLUE};
  line-height: 1;
  margin-right: ${SPACING.M};
`;

const StatCardText = styled('div')`
  font-size: ${FONT_SIZES.S};
  max-width: 250px;
  line-height: 1.4;
`;

const FeatureList = styled('ul')`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

const ButtonContainer = styled('div')`
  text-align: center;
  margin-top: ${SPACING.XL};
`;

const SideButtonContainer = styled('div')`
  text-align: center;
  margin-top: ${SPACING.M};
`;

// Additional styled components to replace inline styles
const ListWithDisc = styled(GovUKList)`
  padding-left: ${SPACING.M};
  list-style-type: disc;
`;

const ListItemWithMargin = styled('li')`
  margin-bottom: ${SPACING.S};
`;

const BlueBorderedCard = styled(ContentCard)`
  border: 2px solid ${COLORS.BLUE};
`;

const BlueHeading = styled(GovUKHeadingS)`
  color: ${COLORS.BLUE};
`;

const BoldText = styled('span')`
  font-weight: 700;
`;

const FullWidthBox = styled(Box)`
  width: 100%;
  margin-bottom: ${SPACING.XXXL};
`;

const SpacedBox = styled(Box)`
  margin-top: ${SPACING.L};
  margin-bottom: ${SPACING.L};
`;

const SpecialContentCard = styled(ContentCard)`
  margin: ${SPACING.L} 0;
  position: relative;
  border: 2px dashed ${COLORS.MID_GREY};
  background-color: ${COLORS.WHITE};
  padding-top: ${SPACING.XL};
`;

const FlexContainer = styled('div')`
  flex: 1;
`;

const NoMarginHeading = styled(GovUKHeadingS)`
  font-size: ${FONT_SIZES.M};
  margin: 0;
`;

const SmallerBodyText = styled(GovUKBody)`
  font-size: ${FONT_SIZES.S};
  margin-bottom: ${SPACING.XS};
`;

const SidebarList = styled('ul')`
  padding-left: ${SPACING.M};
`;

const BodyWithMarginTop = styled(GovUKBody)`
  margin-top: ${SPACING.M};
`;

const BodyNoMargin = styled(GovUKBody)`
  margin-bottom: 0;
`;

const PremiumReportFeature = () => {
  return (
    <GovUKContainer>
      <MainContainer>
        {/* Header */}
        <GovUKHeader>
          <ServiceBadge>
            Official DVLA Data
          </ServiceBadge>
          <GovUKHeadingL>Premium Vehicle Report</GovUKHeadingL>
          <GovUKBody>
            Evidence-based vehicle assessment connecting MOT history with manufacturer technical bulletins to identify patterns and provide a comprehensive analysis.
          </GovUKBody>
        </GovUKHeader>
        
        {/* Content Area */}
        <ContentArea>
          <GovUKGridRow>
            <GovUKGridColumnTwoThirds>
              {/* Comparative Value Section */}
              <SectionHeading>
                Standard Check vs. Premium Report
              </SectionHeading>
              
              <ComparisonGrid>
                {/* Standard Check Column */}
                <ContentCard>
                  <GovUKHeadingS>
                    Standard Vehicle Check
                  </GovUKHeadingS>
                  <ListWithDisc>
                    <ListItemWithMargin>
                      Basic MOT pass/fail history
                    </ListItemWithMargin>
                    <ListItemWithMargin>
                      Current vehicle status
                    </ListItemWithMargin>
                    <ListItemWithMargin>
                      Registration information
                    </ListItemWithMargin>
                    <li>
                      Simple list of previous tests
                    </li>
                  </ListWithDisc>
                </ContentCard>
                
                {/* Premium Report Column */}
                <BlueBorderedCard>
                  <BlueHeading>
                    Premium Vehicle Report
                  </BlueHeading>
                  <ListWithDisc>
                    <ListItemWithMargin>
                      <BoldText>Pattern analysis</BoldText> of recurring issues
                    </ListItemWithMargin>
                    <ListItemWithMargin>
                      <BoldText>Technical bulletin correlation</BoldText> with known issues
                    </ListItemWithMargin>
                    <ListItemWithMargin>
                      <BoldText>Component-level risk assessment</BoldText> for major systems
                    </ListItemWithMargin>
                    <li>
                      <BoldText>Evidence-based evaluation</BoldText> of maintenance needs
                    </li>
                  </ListWithDisc>
                </BlueBorderedCard>
              </ComparisonGrid>
              
              <StatCard>
                <StatCardValue>31%</StatCardValue>
                <StatCardText>
                  of used vehicles have systematic issues that are only identifiable through pattern analysis across multiple MOT tests
                </StatCardText>
              </StatCard>
              
              {/* Technical Analysis Section */}
              <FullWidthBox>
                <SectionHeading>Technical Analysis Methodology</SectionHeading>
                
                <GovUKBody>
                  Our Premium Report utilizes a systematic analytical process to identify patterns and potential issues:
                </GovUKBody>
                
                <SpacedBox>
                  <ProcessStep>
                    <StepNumber>1</StepNumber>
                    <StepContent>
                      <GovUKHeadingS>Data Collection</GovUKHeadingS>
                      <GovUKBody>Complete MOT history from DVLA official records</GovUKBody>
                    </StepContent>
                  </ProcessStep>
                  
                  <ProcessStep>
                    <StepNumber>2</StepNumber>
                    <StepContent>
                      <GovUKHeadingS>Pattern Analysis</GovUKHeadingS>
                      <GovUKBody>Identification of recurring issues in vehicle history</GovUKBody>
                    </StepContent>
                  </ProcessStep>
                  
                  <ProcessStep>
                    <StepNumber>3</StepNumber>
                    <StepContent>
                      <GovUKHeadingS>Technical Matching</GovUKHeadingS>
                      <GovUKBody>Correlation with manufacturer technical bulletins</GovUKBody>
                    </StepContent>
                  </ProcessStep>
                </SpacedBox>
                
                <HighlightedCard>
                  <GovUKHeadingS>Technical Assessment Methodology</GovUKHeadingS>
                  <GovUKBody>
                    The correlation engine identifies relationships between recurring MOT issues 
                    and manufacturer service bulletins. This systematic approach reveals technical 
                    patterns that indicate potential underlying issues requiring assessment before 
                    they become serious faults.
                  </GovUKBody>
                </HighlightedCard>
              </FullWidthBox>
              
              {/* Visual Divider */}
              <GovUKSectionBreak className="govuk-section-break--xl govuk-section-break--visible" />
              
              {/* Technical Bulletin Section */}
              <FullWidthBox>
                <SectionHeading>Technical Bulletin Correlation Analysis</SectionHeading>
                
                <HighlightedCard>
                  <GovUKHeadingS>Example Analysis: Technical Bulletin Matching</GovUKHeadingS>
                  
                  <CustomTable>
                    <thead>
                      <tr>
                        <th>MOT Issue</th>
                        <th>Related Technical Bulletin</th>
                        <th>Technical Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Service brake grabbing (2023)</td>
                        <td>"Loss of braking efficiency" (TSB-BR1284)</td>
                        <td>Potential correlation with brake pressure sensors</td>
                      </tr>
                      <tr>
                        <td>Anti-roll bar linkage wear</td>
                        <td>"Shudder from rear when cornering" (TSB-SUS2742)</td>
                        <td>Related component in suspension system</td>
                      </tr>
                      <tr>
                        <td>Underside/structure corrosion</td>
                        <td>No direct bulletin match</td>
                        <td>Environmental exposure assessment recommended</td>
                      </tr>
                    </tbody>
                  </CustomTable>
                </HighlightedCard>
                
                <SpecialContentCard>
                  <TechnicalLabel>
                    Technical Assessment Methodology
                  </TechnicalLabel>
                  <GovUKBody>
                    The correlation engine identifies relationships between recurring MOT issues and manufacturer service bulletins. This systematic approach reveals technical patterns that indicate potential underlying issues requiring assessment before they become serious faults.
                  </GovUKBody>
                </SpecialContentCard>
              </FullWidthBox>
              
              {/* Visual Divider */}
              <GovUKSectionBreak className="govuk-section-break--xl govuk-section-break--visible" />
              
              {/* Component Assessment Section */}
              <FullWidthBox>
                <SectionHeading>Component-Level Risk Assessment</SectionHeading>
                
                <HighlightedCard>
                  <GovUKHeadingS>Vehicle System Risk Assessment</GovUKHeadingS>
                  
                  <SystemAssessmentItem>
                    <StatusIndicator status="warning">⚠️</StatusIndicator>
                    <FlexContainer>
                      <NoMarginHeading>Suspension</NoMarginHeading>
                      <SmallerBodyText>
                        Recurring anti-roll bar linkage issues, suspension arm bush wear
                      </SmallerBodyText>
                      <ProgressContainer>
                        <StyledProgress variant="determinate" value={65} status="warning" />
                      </ProgressContainer>
                    </FlexContainer>
                  </SystemAssessmentItem>
                  
                  <SystemAssessmentItem>
                    <StatusIndicator status="warning">⚠️</StatusIndicator>
                    <FlexContainer>
                      <NoMarginHeading>Brakes</NoMarginHeading>
                      <SmallerBodyText>
                        History of brake grab and worn pads/discs
                      </SmallerBodyText>
                      <ProgressContainer>
                        <StyledProgress variant="determinate" value={60} status="warning" />
                      </ProgressContainer>
                    </FlexContainer>
                  </SystemAssessmentItem>
                  
                  <SystemAssessmentItem>
                    <StatusIndicator status="danger">🔴</StatusIndicator>
                    <FlexContainer>
                      <NoMarginHeading>Corrosion</NoMarginHeading>
                      <SmallerBodyText>
                        Progressive underside/structural corrosion evident
                      </SmallerBodyText>
                      <ProgressContainer>
                        <StyledProgress variant="determinate" value={85} status="danger" />
                      </ProgressContainer>
                    </FlexContainer>
                  </SystemAssessmentItem>
                  
                  <SystemAssessmentItem>
                    <StatusIndicator status="good">✓</StatusIndicator>
                    <FlexContainer>
                      <NoMarginHeading>Engine</NoMarginHeading>
                      <SmallerBodyText>
                        No significant issues detected
                      </SmallerBodyText>
                      <ProgressContainer>
                        <StyledProgress variant="determinate" value={95} status="good" />
                      </ProgressContainer>
                    </FlexContainer>
                  </SystemAssessmentItem>
                </HighlightedCard>
                
                <GovUKInsetText>
                  <strong>Data-driven insights for informed decision-making.</strong> Our technical correlation analysis identifies underlying issues that standard checks miss, helping you understand the vehicle's condition based on evidence rather than assumptions.
                </GovUKInsetText>
              </FullWidthBox>
              
              <ButtonContainer>
                <PremiumButton>
                  Get Vehicle Technical Report
                </PremiumButton>
              </ButtonContainer>
            </GovUKGridColumnTwoThirds>
            
            <GovUKGridColumnOneThird>
              {/* Report Benefits */}
              <FeatureCard>
                <SectionHeading>
                  Technical Report Features
                </SectionHeading>
                
                <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
                
                <FeatureList>
                  <FeatureItem>
                    <FeatureCheck>✓</FeatureCheck>
                    <FeatureItemTitle>Official DVLA Data</FeatureItemTitle>
                    <GovUKBody>Complete MOT history with detailed records</GovUKBody>
                  </FeatureItem>
                  
                  <FeatureItem>
                    <FeatureCheck>✓</FeatureCheck>
                    <FeatureItemTitle>Technical Bulletin Matching</FeatureItemTitle>
                    <GovUKBody>Correlation with manufacturer service information</GovUKBody>
                  </FeatureItem>
                  
                  <FeatureItem>
                    <FeatureCheck>✓</FeatureCheck>
                    <FeatureItemTitle>Component Risk Assessment</FeatureItemTitle>
                    <GovUKBody>Detailed evaluation of major vehicle systems</GovUKBody>
                  </FeatureItem>
                  
                  <FeatureItem>
                    <FeatureCheck>✓</FeatureCheck>
                    <FeatureItemTitle>Evidence-Based Evaluation</FeatureItemTitle>
                    <GovUKBody>Systematic analysis of patterns and indicators</GovUKBody>
                  </FeatureItem>
                </FeatureList>
                
                <GovUKInsetText>
                  <strong>Verified data:</strong> All analysis is based on official DVLA records and manufacturer technical data processed through our correlation system.
                </GovUKInsetText>
              </FeatureCard>
              
              {/* Technical Assessment Information */}
              <HighlightedCard>
                <GovUKHeadingM>Technical Assessment Methodology</GovUKHeadingM>
                
                <GovUKBody>
                  The Premium Report provides a systematic technical assessment based on:
                </GovUKBody>
                
                <SidebarList>
                  <ListItemWithMargin>
                    <GovUKBody>Pattern recognition of recurring issues</GovUKBody>
                  </ListItemWithMargin>
                  <ListItemWithMargin>
                    <GovUKBody>Correlation with manufacturer technical bulletins</GovUKBody>
                  </ListItemWithMargin>
                  <ListItemWithMargin>
                    <GovUKBody>Component lifecycle analysis using historical data</GovUKBody>
                  </ListItemWithMargin>
                  <li>
                    <GovUKBody>Evidence-based risk assessment for major systems</GovUKBody>
                  </li>
                </SidebarList>
                
                <BodyWithMarginTop>
                  This approach provides a comprehensive technical understanding of the vehicle's condition based on its documented history and known technical issues for that make and model.
                </BodyWithMarginTop>
              </HighlightedCard>
              
              {/* Data Verification */}
              <FeatureCard>
                <GovUKHeadingM>Data Verification</GovUKHeadingM>
                
                <DataVerificationItem>
                  <DataSourceBadge>
                    DVLA
                  </DataSourceBadge>
                  <div>
                    <BodyNoMargin>
                      <strong>Official DVLA MOT Records</strong><br />
                      Direct from government database
                    </BodyNoMargin>
                  </div>
                </DataVerificationItem>
                
                <DataVerificationItem>
                  <DataSourceBadge>
                    TSB
                  </DataSourceBadge>
                  <div>
                    <BodyNoMargin>
                      <strong>Technical Service Bulletins</strong><br />
                      Manufacturer-issued documents
                    </BodyNoMargin>
                  </div>
                </DataVerificationItem>
              </FeatureCard>
              
              <SideButtonContainer>
                <PremiumButton>
                  Get Vehicle Technical Report
                </PremiumButton>
              </SideButtonContainer>
            </GovUKGridColumnOneThird>
          </GovUKGridRow>
        </ContentArea>
      </MainContainer>
    </GovUKContainer>
  );
};

export default PremiumReportFeature;