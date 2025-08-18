import React from 'react';
import Header from '../Home/components/Header/Header';
import Footer from '../Home/components/Footer/Footer';
import './LegalPageStyles.css';

const Accessibility = () => {
  return (
    <>
      <Header />
      <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <header className="legal-page-header">
          <h1 className="legal-page-title">Accessibility statement</h1>
          <p className="legal-page-subtitle">
            Accessibility statement for MotCheck UK
          </p>
        </header>

        <main className="legal-page-content">
          <section className="legal-section">
            <h2>Our commitment to accessibility</h2>
            <p>
              We want as many people as possible to be able to use MotCheck UK. For example, that means you should be able to:
            </p>
            <ul>
              <li>navigate most of the website using just a keyboard</li>
              <li>navigate most of the website using speech recognition software</li>
              <li>listen to most of the website using a screen reader</li>
              <li>zoom in up to 300% without the text spilling off the screen</li>
            </ul>
            <p>
              We've also made the website text as simple as possible to understand.
            </p>
          </section>

          <section className="legal-section">
            <h2>Compliance status</h2>
            <p>
              This website is partially compliant with the <a href="https://www.w3.org/WAI/WCAG21/AA/" className="legal-link" target="_blank" rel="noopener noreferrer">Web Content Accessibility Guidelines version 2.1 AA standard</a>, due to the non-compliances listed below.
            </p>
          </section>

          <section className="legal-section">
            <h2>Known accessibility issues</h2>
            <p>We know some parts of this website are not fully accessible:</p>
            <ul>
              <li>Some interactive charts may not be fully accessible to screen readers</li>
              <li>Some complex data tables may be difficult to navigate with screen readers</li>
              <li>PDF documents may not be fully accessible</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>What we're doing to improve accessibility</h2>
            <p>
              We are committed to improving the accessibility of MotCheck UK. We:
            </p>
            <ul>
              <li>test our website regularly with accessibility tools</li>
              <li>review new features for accessibility compliance</li>
              <li>work to fix known accessibility issues</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Getting accessible formats</h2>
            <p>
              If you need information on this website in a different format like accessible PDF, large print, easy read, audio recording or braille, please <a href="/contact" className="legal-link">contact us</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>Reporting accessibility problems</h2>
            <p>
              We're always looking to improve the accessibility of this website. If you find any problems not listed on this page or think we're not meeting accessibility requirements, please <a href="/contact" className="legal-link">contact us</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>Technical information</h2>
            <p>
              MotCheck UK is committed to making its website accessible, in accordance with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.
            </p>
            
            <h3>Assessment method</h3>
            <p>
              This website was last tested for accessibility compliance in August 2025. Testing was carried out internally using automated accessibility testing tools and manual testing.
            </p>
          </section>
        </main>

        <footer className="legal-page-footer">
          <p className="legal-page-meta">
            Last updated: <time>August 2025</time>
          </p>
        </footer>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Accessibility;