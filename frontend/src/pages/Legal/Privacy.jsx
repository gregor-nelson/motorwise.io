import React from 'react';
import Header from '../Home/components/Header/Header.jsx';
import Footer from '../Home/components/Footer/Footer';

const Privacy = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight tracking-tight">Privacy notice</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              How we use your personal information
            </p>
          </header>

          <main className="space-y-8">
            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-buildings text-xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Who we are</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  MotCheck UK provides access to official vehicle data from government sources including the Driver & Vehicle Standards Agency (DVSA) and Driver & Vehicle Licensing Agency (DVLA).
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-purple-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-database text-xl text-purple-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">What personal information we collect</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">We may collect the following types of personal information:</p>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start">
                    <i className="ph ph-dot text-purple-600 mr-2 mt-2 flex-shrink-0"></i>
                    Vehicle registration numbers you search for
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-dot text-purple-600 mr-2 mt-2 flex-shrink-0"></i>
                    Your IP address and browser information
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-dot text-purple-600 mr-2 mt-2 flex-shrink-0"></i>
                    Payment information when using premium services
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-dot text-purple-600 mr-2 mt-2 flex-shrink-0"></i>
                    Email address if you contact us
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-dot text-purple-600 mr-2 mt-2 flex-shrink-0"></i>
                    Cookies and similar tracking technologies
                  </li>
                </ul>
              </div>
            </section>

          <section className="legal-section">
            <h2>Why we collect personal information</h2>
            <p>We use your personal information to:</p>
            <ul>
              <li>provide the vehicle checking service</li>
              <li>process payments for premium features</li>
              <li>improve our service through analytics</li>
              <li>respond to your enquiries</li>
              <li>prevent fraud and abuse</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Our legal basis for processing</h2>
            <p>We process your personal information under the following legal bases:</p>
            <ul>
              <li><strong>Legitimate interests:</strong> to provide and improve our service</li>
              <li><strong>Contract:</strong> to fulfil our obligations when you use premium services</li>
              <li><strong>Consent:</strong> for cookies and analytics where required</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>How we protect your information</h2>
            <p>
              We take appropriate technical and organisational measures to protect your personal information, including:
            </p>
            <ul>
              <li>encryption of data in transit and at rest</li>
              <li>regular security assessments</li>
              <li>access controls and staff training</li>
              <li>secure payment processing through Stripe</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Who we share information with</h2>
            <p>We may share your personal information with:</p>
            <ul>
              <li>Payment processors (Stripe) for transaction processing</li>
              <li>Analytics providers (Google Analytics) with your consent</li>
              <li>Government agencies when legally required</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section className="legal-section">
            <h2>How long we keep information</h2>
            <p>We keep your personal information for:</p>
            <ul>
              <li>Search history: up to 12 months</li>
              <li>Payment records: 7 years for tax purposes</li>
              <li>Analytics data: 26 months (Google Analytics default)</li>
              <li>Contact enquiries: 2 years</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Your rights</h2>
            <p>Under data protection law, you have rights including:</p>
            <ul>
              <li>access to your personal information</li>
              <li>correction of inaccurate information</li>
              <li>deletion of your information</li>
              <li>objection to processing</li>
              <li>data portability</li>
            </ul>
            <p>
              To exercise these rights, please <a href="/contact" className="legal-link">contact us</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>Cookies</h2>
            <p>
              We use cookies to improve your experience on our website. For detailed information about our use of cookies, see our <a href="/cookies" className="legal-link">cookie policy</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>Changes to this notice</h2>
            <p>
              We may update this privacy notice from time to time. We will post any changes on this page with an updated date.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact us about privacy</h2>
            <p>
              If you have questions about this privacy notice or how we handle your personal information, please <a href="/contact" className="legal-link">contact us</a>.
            </p>
          </section>
        </main>

          <footer className="mt-12 pt-8 border-t border-neutral-200 text-center">
            <div className="bg-neutral-100 rounded-lg p-4 inline-block">
              <p className="text-sm text-neutral-600 flex items-center justify-center">
                <i className="ph ph-calendar text-neutral-500 mr-2"></i>
                Last updated: <time className="font-medium ml-1">August 2025</time>
              </p>
            </div>
          </footer>
        </div>
      </div>
    <Footer />
    </>
  );
};

export default Privacy;