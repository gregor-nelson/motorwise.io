// Import components
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import PremiumReportFeature from './components/Premium/Premium';
import HelpSection  from './components/FAQ/FAQ';
import Footer from './components/Footer/Footer';
import PremiumVehicleReportsTest from '../Legal/Test';

function Home() {
  return (
    <>
      <Header />
      
      {/* Main Content */}
        <Hero />

{/* <PremiumVehicleReportsTest /> */}

        <PremiumReportFeature />

        <HelpSection />

      
      <Footer />
    </>
  );
}

export default Home;