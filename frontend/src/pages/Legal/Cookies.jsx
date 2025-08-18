import React from 'react';
import Header from '../Home/components/Header/Header';
import Footer from '../Home/components/Footer/Footer';
import './LegalPageStyles.css';

const Cookies = () => {
  return (
    <>
      <Header />
      <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <header className="legal-page-header">
          <h1 className="legal-page-title">Cookies</h1>
          <p className="legal-page-subtitle">
            How we use cookies on MotCheck UK
          </p>
        </header>

        <main className="legal-page-content">
          <section className="legal-section">
            <h2>What are cookies</h2>
            <p>
              Cookies are small files saved on your phone, tablet or computer when you visit a website.
            </p>
            <p>
              We use cookies to store information about how you use the MotCheck UK website, such as the pages you visit.
            </p>
          </section>

          <section className="legal-section">
            <h2>Cookie settings</h2>
            <p>
              We use JavaScript to set our cookies. You can turn off cookies in your browser settings.
            </p>
          </section>

          <section className="legal-section">
            <h2>How cookies are used on MotCheck UK</h2>
            <h3>Essential cookies</h3>
            <p>
              Essential cookies keep your information secure while you use MotCheck UK. We do not need to ask permission to use them.
            </p>
            
            <h3>Analytics cookies (optional)</h3>
            <p>
              With your permission, we use Google Analytics to collect data about how you use MotCheck UK. This information helps us to improve our service.
            </p>
            <p>
              Google Analytics is not allowed to use or share our analytics data with anyone.
            </p>
            <p>
              Google Analytics sets cookies that store anonymised information about:
            </p>
            <ul>
              <li>how you got to MotCheck UK</li>
              <li>the pages you visit on MotCheck UK and how long you spend on them</li>
              <li>what you click on while you're visiting MotCheck UK</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Change your cookie settings</h2>
            <p>
              You can change which cookies you're happy for us to use.
            </p>
            <div className="cookie-settings">
              <button className="btn btn-primary">Cookie preferences</button>
            </div>
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

export default Cookies;