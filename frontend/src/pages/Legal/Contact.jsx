import React from 'react';
import Header from '../Home/components/Header/Header';
import Footer from '../Home/components/Footer/Footer';
import './LegalPageStyles.css';

const Contact = () => {
  return (
    <>
      <Header />
      <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <header className="legal-page-header">
          <h1 className="legal-page-title">Contact</h1>
          <p className="legal-page-subtitle">
            Get in touch with the MotCheck UK team
          </p>
        </header>

        <main className="legal-page-content">
          <section className="legal-section">
            <h2>Contact information</h2>
            <p>
              If you have questions about using MotCheck UK or need technical support, please get in touch using the details below.
            </p>
          </section>

          <section className="legal-section">
            <h2>General enquiries</h2>
            <div className="contact-details">
              <div className="contact-item">
                <h3>Email</h3>
                <p>
                  <a href="mailto:support@motcheck.uk" className="contact-link">
                    support@motcheck.uk
                  </a>
                </p>
              </div>
              
              <div className="contact-item">
                <h3>Response time</h3>
                <p>We aim to respond to all enquiries within 2 working days.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Technical support</h2>
            <p>
              If you're experiencing technical difficulties with the website, please include the following information when contacting us:
            </p>
            <ul>
              <li>Your web browser and version</li>
              <li>Your operating system</li>
              <li>A description of the problem</li>
              <li>Any error messages you've seen</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Feedback</h2>
            <p>
              We're always looking to improve MotCheck UK. If you have suggestions or feedback about the service, we'd like to hear from you.
            </p>
          </section>

          <section className="legal-section">
            <h2>Data protection enquiries</h2>
            <p>
              For questions about how we handle your personal data, please see our <a href="/privacy" className="legal-link">privacy notice</a>.
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

export default Contact;