// Import components
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import PremiumReportFeature from './components/Premium/Premium';
import HelpSection  from './components/FAQ/FAQ';
import Footer from './components/Footer/Footer';

function Home() {
  return (
    <>
      <Header />
      
      {/* Main Content */}
        <Hero />

        <PremiumReportFeature />

        <HelpSection />

      
      <Footer />
    </>
  );
}

export default Home;