import React from 'react';
import Header from '../Home/components/Header/Header';
import Footer from '../Home/components/Footer/Footer';

const Cookies = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight tracking-tight">Cookies</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              How we use cookies on MotCheck UK
            </p>
          </header>

          <main className="space-y-8">
            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-cookie text-xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">What are cookies</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Cookies are small files saved on your phone, tablet or computer when you visit a website.
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  We use cookies to store information about how you use the MotCheck UK website, such as the pages you visit.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-purple-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-gear text-xl text-purple-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Cookie settings</h2>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  We use JavaScript to set our cookies. You can turn off cookies in your browser settings.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-green-50 rounded-lg p-2 mr-4">
                  <i className="ph ph-database text-xl text-green-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">How cookies are used on MotCheck UK</h2>
              </div>
              <div className="prose prose-neutral max-w-none space-y-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                    <i className="ph ph-shield-check text-green-600 mr-2"></i>
                    Essential cookies
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Essential cookies keep your information secure while you use MotCheck UK. We do not need to ask permission to use them.
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                    <i className="ph ph-chart-bar text-blue-600 mr-2"></i>
                    Analytics cookies (optional)
                  </h3>
                  <div className="space-y-3">
                    <p className="text-neutral-700 leading-relaxed">
                      With your permission, we use Google Analytics to collect data about how you use MotCheck UK. This information helps us to improve our service.
                    </p>
                    <p className="text-neutral-700 leading-relaxed">
                      Google Analytics is not allowed to use or share our analytics data with anyone.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-3">
                      Google Analytics sets cookies that store anonymised information about:
                    </p>
                    <ul className="space-y-2 text-neutral-700">
                      <li className="flex items-start">
                        <i className="ph ph-dot text-blue-600 mr-2 mt-2 flex-shrink-0"></i>
                        how you got to MotCheck UK
                      </li>
                      <li className="flex items-start">
                        <i className="ph ph-dot text-blue-600 mr-2 mt-2 flex-shrink-0"></i>
                        the pages you visit on MotCheck UK and how long you spend on them
                      </li>
                      <li className="flex items-start">
                        <i className="ph ph-dot text-blue-600 mr-2 mt-2 flex-shrink-0"></i>
                        what you click on while you're visiting MotCheck UK
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-orange-100">
              <div className="flex items-center mb-6">
                <div className="bg-orange-100 rounded-lg p-3 mr-4">
                  <i className="ph ph-sliders text-2xl text-orange-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Change your cookie settings</h2>
                  <p className="text-sm text-neutral-600">Manage your cookie preferences</p>
                </div>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed mb-6">
                  You can change which cookies you're happy for us to use.
                </p>
                <div className="flex justify-center">
                  <button className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md">
                    <i className="ph ph-gear mr-2"></i>
                    Cookie preferences
                  </button>
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

export default Cookies;