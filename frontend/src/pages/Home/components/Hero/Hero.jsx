/**
 * HERO COMPONENT
 * Main hero section for the homepage
 * File: components/Home/Hero/index.js
 */

import React from 'react';
import VehicleSearch from '../../../Results/vehicleSearch';
import { 
  HomePageSection, 
  PageSectionContainer,
  PageHeading,
  LeadParagraph,
  InfoPanel,
  SubHeading,
} from '../../../../styles/Home/styles';
import {
  HeroSearchPanel,
  HeroFeatureList,
  HeroBadge,
} from './heroStyles';
import { COLORS } from '../../../../styles/theme';

const Hero = () => {
  return (
    <HomePageSection background={COLORS.LIGHT_GREY}>
      <PageSectionContainer>
        <PageHeading>Check vehicle MOT history and tax status</PageHeading>
        
        <LeadParagraph>
          Access official DVLA and DVSA records to verify a vehicle's history before purchase
          or check if your MOT is due soon.
        </LeadParagraph>
        
        <HeroSearchPanel>
          <HeroBadge>Official DVLA Data</HeroBadge>
          <SubHeading>Enter vehicle registration</SubHeading>
          <VehicleSearch />
          
          <HeroFeatureList>
            <li>Instant MOT history and due dates</li>
            <li>Current tax status verification</li>
            <li>Mileage history and advisories</li>
            <li>Official DVLA and DVSA records</li>
          </HeroFeatureList>
        </HeroSearchPanel>
      </PageSectionContainer>
    </HomePageSection>
  );
};

export default Hero;

/**
 * HERO STYLES
 * Component-specific styles for the Hero section
 * File: components/Home/Hero/heroStyles.js
 */

import { styled } from '@mui/material/styles';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,
  commonFontStyles,
  respondTo,
} from '../../../../styles/theme';
import { Panel } from '../../../../styles/Home/sharedStyles';

// Hero-specific search panel with enhanced styling
export const HeroSearchPanel = styled(Panel)`
  background-color: ${COLORS.WHITE};
  border-left-width: 5px;
  border-left-color: ${COLORS.BLUE};
  position: relative;
  overflow: hidden;
  
  // Subtle gradient overlay for visual interest
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(29, 112, 184, 0.03));
    pointer-events: none;
  }
`;

// Hero badge for highlighting official data source
export const HeroBadge = styled('span')`
  ${commonFontStyles}
  display: inline-block;
  padding: ${SPACING.XS} ${SPACING.S};
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-size: ${FONT_SIZES.XS};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
  }
`;

// Feature list specific to hero section
export const HeroFeatureList = styled('ul')`
  ${commonFontStyles}
  margin: ${SPACING.L} 0 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.S};
  
  ${respondTo('MOBILE')} {
    grid-template-columns: 1fr;
    margin-top: ${SPACING.XL};
  }
  
  li {
    position: relative;
    padding-left: ${SPACING.L};
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
    color: ${COLORS.DARK_GREY};
    
    ${respondTo('MOBILE')} {
      font-size: ${FONT_SIZES.L};
      line-height: ${LINE_HEIGHTS.M};
    }
    
    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${COLORS.GREEN};
      font-weight: 700;
      font-size: ${FONT_SIZES.M};
    }
  }
`;