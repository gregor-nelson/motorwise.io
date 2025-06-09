import React from 'react';
import VehicleSearch from '../../../../components/Results/vehicleSearch';
import {
  HeroSection,
  HeroContainer,
  HeroTitle,
  HeroLead,
  HeroSearchPanel,
  HeroSearchTitle
} from './heroStyles';

const Hero = () => {
  return (
    <HeroSection>
      <HeroContainer>
        <HeroTitle>Check vehicle MOT history and tax status</HeroTitle>
        
        <HeroLead>
          Access official DVLA and DVSA records to verify a vehicle's history before purchase
          or check if your MOT is due soon.
        </HeroLead>
        
        <HeroSearchPanel>
          <HeroSearchTitle>Enter vehicle registration</HeroSearchTitle>
          <VehicleSearch />
        </HeroSearchPanel>
      </HeroContainer>
    </HeroSection>
  );
};

export default Hero;