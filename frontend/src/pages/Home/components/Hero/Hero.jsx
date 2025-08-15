import React from 'react';
import VehicleSearch from '../../../../components/Results/vehicleSearch';
import './HeroStyles.css';

const Hero = () => {
  return (
    <section className="hero-section" role="banner">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Check vehicle MOT history and tax status
          </h1>
          
          <p className="hero-subtitle">
            Access official DVLA and DVSA records to verify a vehicle's history before purchase
            or check if your MOT is due soon.
          </p>
          
          <div className="hero-search-card" role="search" aria-label="Vehicle registration search">
            <h2 className="hero-search-title">Enter vehicle registration</h2>
            <VehicleSearch />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;