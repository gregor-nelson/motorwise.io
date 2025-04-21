import React from 'react';
import VehicleSearch from '../../../components/Results/vehicleSearch';
import {
  Section,
  Container,
  PageTitle,
  Lead,
  SearchPanel,
  SearchTitle
} from '../../../styles/Home/styles';
import { COLORS,} from '../../../styles/theme';

const Hero = () => {
  return (
    <Section background={COLORS.LIGHT_GREY}>
      <Container>
        <PageTitle>Check vehicle MOT history and tax status</PageTitle>
        
        <Lead>
          Access official DVLA and DVSA records to verify a vehicle's history before purchase 
          or check if your MOT is due soon.
        </Lead>
        
        <SearchPanel>
          <SearchTitle>Enter vehicle registration</SearchTitle>
          <VehicleSearch />
        </SearchPanel>
      </Container>
    </Section>
  );
};

export default Hero;