import React from 'react';
import { PageContainer, MainContent } from '../../styles/Home/styles';

// Import components
import Header from './components/Header';
import Hero from './components/Hero';
import PremiumReportFeature from './components/Premium/Premium';
import HelpSection  from './components/FAQ/FAQ';
import Footer from './components/Footer';

function Home() {
  return (
    <PageContainer>
      <Header />
      
      {/* Main Content */}
      <MainContent id="main-content">
        <Hero />


        <PremiumReportFeature />

        <HelpSection />

      </MainContent>
      
      <Footer />
    </PageContainer>
  );
}

export default Home;