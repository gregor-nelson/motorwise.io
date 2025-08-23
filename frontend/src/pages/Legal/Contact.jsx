import React from 'react';
import Header from '../Home/components/Header/Header';
import Footer from '../Home/components/Footer/Footer';

const Contact = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight tracking-tight">Contact</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Get in touch with the MotCheck UK team
            </p>
          </header>

          <main className="space-y-8">
            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-info text-xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Contact information</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  If you have questions about using MotCheck UK or need technical support, please get in touch using the details below.
                </p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <section className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-green-100">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <i className="ph ph-envelope text-2xl text-green-600"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Email us</h2>
                    <p className="text-sm text-neutral-600">General enquiries and support</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-2">Email address</h3>
                    <a href="mailto:support@motcheck.uk" 
                       className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                      <i className="ph ph-envelope mr-2"></i>
                      support@motcheck.uk
                    </a>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-700 mb-1">Response time</h3>
                    <p className="text-neutral-700 text-sm flex items-center">
                      <i className="ph ph-clock text-blue-600 mr-2"></i>
                      We aim to respond within 2 working days
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-purple-100">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 rounded-lg p-3 mr-4">
                    <i className="ph ph-wrench text-2xl text-purple-600"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Technical Support</h2>
                    <p className="text-sm text-neutral-600">Help with technical issues</p>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-neutral-700 mb-3">Please include:</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-start">
                      <i className="ph ph-check text-purple-600 mr-2 mt-0.5 flex-shrink-0"></i>
                      Your web browser and version
                    </li>
                    <li className="flex items-start">
                      <i className="ph ph-check text-purple-600 mr-2 mt-0.5 flex-shrink-0"></i>
                      Your operating system
                    </li>
                    <li className="flex items-start">
                      <i className="ph ph-check text-purple-600 mr-2 mt-0.5 flex-shrink-0"></i>
                      A description of the problem
                    </li>
                    <li className="flex items-start">
                      <i className="ph ph-check text-purple-600 mr-2 mt-0.5 flex-shrink-0"></i>
                      Any error messages you've seen
                    </li>
                  </ul>
                </div>
              </section>
            </div>


            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-yellow-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-heart text-xl text-yellow-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Feedback</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  We're always looking to improve MotCheck UK. If you have suggestions or feedback about the service, we'd like to hear from you.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-shield-check text-xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Data protection enquiries</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  For questions about how we handle your personal data, please see our <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200">privacy notice</a>.
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

export default Contact;