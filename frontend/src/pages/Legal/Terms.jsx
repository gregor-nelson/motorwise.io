import React from 'react';
import Header from '../Home/components/Header/Header';
import Footer from '../Home/components/Footer/Footer';
import './LegalPageStyles.css';

const Terms = () => {
  return (
    <>
      <Header />
      <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <header className="legal-page-header">
          <h1 className="legal-page-title">Terms and conditions</h1>
          <p className="legal-page-subtitle">
            Terms of use for MotCheck UK
          </p>
        </header>

        <main className="legal-page-content">
          <section className="legal-section">
            <h2>Using MotCheck UK</h2>
            <p>
              MotCheck UK is a service that provides access to MOT test data and vehicle information from the Driver & Vehicle Standards Agency (DVSA) and Driver & Vehicle Licensing Agency (DVLA).
            </p>
            <p>
              By using this service, you agree to these terms and conditions.
            </p>
          </section>

          <section className="legal-section">
            <h2>What you can use this service for</h2>
            <p>You can use MotCheck UK to:</p>
            <ul>
              <li>check the MOT history of vehicles</li>
              <li>view vehicle registration details</li>
              <li>access premium vehicle insights and analytics</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>What you cannot use this service for</h2>
            <p>You must not use MotCheck UK:</p>
            <ul>
              <li>for commercial purposes without appropriate licensing</li>
              <li>to access data you're not authorised to view</li>
              <li>in any way that could damage, disable, or impair the service</li>
              <li>to attempt to gain unauthorised access to any systems or data</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Data accuracy and liability</h2>
            <p>
              The information provided is sourced from official government databases but we cannot guarantee its complete accuracy or currency.
            </p>
            <p>
              You should verify important information through official channels before making decisions based on data from this service.
            </p>
          </section>

          <section className="legal-section">
            <h2>Service availability</h2>
            <p>
              We aim to keep MotCheck UK available 24 hours a day but cannot guarantee this. We may suspend the service for maintenance or updates.
            </p>
          </section>

          <section className="legal-section">
            <h2>Premium services</h2>
            <p>
              Some features require payment for access. Premium service terms and pricing are clearly displayed before purchase.
            </p>
            <p>
              Payments are processed securely through Stripe. Refunds may be available as outlined in our refund policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>Changes to these terms</h2>
            <p>
              We may update these terms from time to time. Any changes will be posted on this page with an updated date.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact us</h2>
            <p>
              If you have questions about these terms, please <a href="/contact" className="legal-link">contact us</a>.
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

export default Terms;