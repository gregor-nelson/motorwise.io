import React from 'react';
import VehicleSearch from '../../../../components/Results/vehicleSearch';

const Hero = () => {
  return (
    <section className="bg-white min-h-[80vh] flex items-center justify-center py-16 md:py-24 lg:py-32" role="banner">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full">
        <div className="text-center w-full max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight tracking-tight mb-6">
            Check vehicle MOT history and tax status
          </h1>
          
          <p className="text-base md:text-lg text-neutral-600 leading-relaxed mb-12 max-w-2xl mx-auto">
            Access official DVLA and DVSA records to verify a vehicle's history before purchase
            or check if your MOT is due soon.
          </p>
          
          <div className="bg-white p-6 md:p-8 max-w-6xl mx-auto w-full" role="search" aria-label="Vehicle registration search">
            <h2 className="text-lg font-medium text-neutral-900 mb-6">Enter vehicle registration</h2>
            <VehicleSearch />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;