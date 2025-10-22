import React from 'react';
import Header from '../Home/components/Header/Header.jsx';
import Footer from '../Home/components/Footer/Footer';

const Terms = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight tracking-tight">Terms and conditions</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Terms of use for MotCheck UK
            </p>
          </header>

          <main className="space-y-8">
            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-info text-xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Using MotCheck UK</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  MotCheck UK is a service that provides access to MOT test data and vehicle information from the Driver & Vehicle Standards Agency (DVSA) and Driver & Vehicle Licensing Agency (DVLA).
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  By using this service, you agree to these terms and conditions.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-green-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-check-circle text-xl text-green-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">What you can use this service for</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">You can use MotCheck UK to:</p>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start">
                    <i className="ph ph-check text-green-600 mr-2 mt-1 flex-shrink-0"></i>
                    check the MOT history of vehicles
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-check text-green-600 mr-2 mt-1 flex-shrink-0"></i>
                    view vehicle registration details
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-check text-green-600 mr-2 mt-1 flex-shrink-0"></i>
                    access premium vehicle insights and analytics
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-red-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-x-circle text-xl text-red-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">What you cannot use this service for</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">You must not use MotCheck UK:</p>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start">
                    <i className="ph ph-x text-red-600 mr-2 mt-1 flex-shrink-0"></i>
                    for commercial purposes without appropriate licensing
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-x text-red-600 mr-2 mt-1 flex-shrink-0"></i>
                    to access data you're not authorised to view
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-x text-red-600 mr-2 mt-1 flex-shrink-0"></i>
                    in any way that could damage, disable, or impair the service
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-x text-red-600 mr-2 mt-1 flex-shrink-0"></i>
                    to attempt to gain unauthorised access to any systems or data
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-transparent rounded-lg p-2 mr-4">
                  <i className="ph ph-warning text-xl text-yellow-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Data accuracy and liability</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  The information provided is sourced from official government databases but we cannot guarantee its complete accuracy or currency.
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  You should verify important information through official channels before making decisions based on data from this service.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-clock text-xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Service availability</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  We aim to keep MotCheck UK available 24 hours a day but cannot guarantee this. We may suspend the service for maintenance or updates.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-purple-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-crown text-xl text-purple-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Premium services</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Some features require payment for access. Premium service terms and pricing are clearly displayed before purchase.
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  Payments are processed securely through Stripe. Refunds may be available as outlined in our refund policy.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-transparent rounded-lg p-2 mr-4">
                  <i className="ph ph-note-pencil text-xl text-orange-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Changes to these terms</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  We may update these terms from time to time. Any changes will be posted on this page with an updated date.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-green-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-envelope text-xl text-green-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Contact us</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  If you have questions about these terms, please <a href="/contact" className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200">contact us</a>.
                </p>
              </div>
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

export default Terms;