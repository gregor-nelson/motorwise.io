import React from 'react';
import Header from '../Home/components/Header/Header';
import Footer from '../Home/components/Footer/Footer';

const Accessibility = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight tracking-tight">Accessibility statement</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Accessibility statement for MotCheck UK
            </p>
          </header>

          <main className="space-y-8">
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  <i className="ph ph-heart text-2xl text-blue-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Our commitment to accessibility</h2>
                  <p className="text-sm text-neutral-600">Making MotCheck UK accessible to everyone</p>
                </div>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  We want as many people as possible to be able to use MotCheck UK. For example, that means you should be able to:
                </p>
                <ul className="space-y-3 text-neutral-700 mb-4">
                  <li className="flex items-start">
                    <i className="ph ph-keyboard text-blue-600 mr-3 mt-1 flex-shrink-0"></i>
                    navigate most of the website using just a keyboard
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-microphone text-blue-600 mr-3 mt-1 flex-shrink-0"></i>
                    navigate most of the website using speech recognition software
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-speaker-high text-blue-600 mr-3 mt-1 flex-shrink-0"></i>
                    listen to most of the website using a screen reader
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-magnifying-glass-plus text-blue-600 mr-3 mt-1 flex-shrink-0"></i>
                    zoom in up to 300% without the text spilling off the screen
                  </li>
                </ul>
                <p className="text-neutral-700 leading-relaxed bg-white/60 rounded-lg p-4">
                  We've also made the website text as simple as possible to understand.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-green-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-check-circle text-xl text-green-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Compliance status</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  This website is partially compliant with the <a href="https://www.w3.org/WAI/WCAG21/AA/" className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200" target="_blank" rel="noopener noreferrer">Web Content Accessibility Guidelines version 2.1 AA standard</a>, due to the non-compliances listed below.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-transparent rounded-lg p-2 mr-4">
                  <i className="ph ph-warning text-xl text-yellow-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Known accessibility issues</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">We know some parts of this website are not fully accessible:</p>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start">
                    <i className="ph ph-warning-circle text-yellow-600 mr-2 mt-1 flex-shrink-0"></i>
                    Some interactive charts may not be fully accessible to screen readers
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-warning-circle text-yellow-600 mr-2 mt-1 flex-shrink-0"></i>
                    Some complex data tables may be difficult to navigate with screen readers
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-warning-circle text-yellow-600 mr-2 mt-1 flex-shrink-0"></i>
                    PDF documents may not be fully accessible
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-arrows-clockwise text-xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">What we're doing to improve accessibility</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  We are committed to improving the accessibility of MotCheck UK. We:
                </p>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start">
                    <i className="ph ph-check text-blue-600 mr-2 mt-1 flex-shrink-0"></i>
                    test our website regularly with accessibility tools
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-check text-blue-600 mr-2 mt-1 flex-shrink-0"></i>
                    review new features for accessibility compliance
                  </li>
                  <li className="flex items-start">
                    <i className="ph ph-check text-blue-600 mr-2 mt-1 flex-shrink-0"></i>
                    work to fix known accessibility issues
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-purple-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-file-text text-xl text-purple-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Getting accessible formats</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  If you need information on this website in a different format like accessible PDF, large print, easy read, audio recording or braille, please <a href="/contact" className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200">contact us</a>.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-red-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-megaphone text-xl text-red-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Reporting accessibility problems</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  We're always looking to improve the accessibility of this website. If you find any problems not listed on this page or think we're not meeting accessibility requirements, please <a href="/contact" className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200">contact us</a>.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-green-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-code text-xl text-green-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Technical information</h2>
              </div>
              <div className="prose prose-neutral max-w-none space-y-4">
                <p className="text-neutral-700 leading-relaxed">
                  MotCheck UK is committed to making its website accessible, in accordance with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.
                </p>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 flex items-center">
                    <i className="ph ph-test-tube text-green-600 mr-2"></i>
                    Assessment method
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    This website was last tested for accessibility compliance in August 2025. Testing was carried out internally using automated accessibility testing tools and manual testing.
                  </p>
                </div>
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

export default Accessibility;