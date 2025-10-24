// Import components
import Header from './components/Header/Header.jsx';
import Hero from './components/Hero/Hero';
import PremiumReportFeature from './components/Premium/Premium';
import HelpSection  from './components/FAQ/FAQPreview';
import Footer from './components/Footer/Footer';

function Home() {
  return (
    <>
      <Header />
      <main id="main-content" className="pt-16 md:pt-0 md:ml-[60px]">
        <Hero />

        <PremiumReportFeature />

        <HelpSection />

        <Footer />
      </main>
    </>
  );
}

export default Home;