import React from 'react';
import { Link } from 'react-router-dom';


const Footer = () => {
  const navigationLinks = [
    { label: 'Premium Report', href: '/premium-report' },
    { label: 'MOT History', href: '/mot-history' },
    { label: 'Knowledge Center', href: '/knowledge-center' },
    { label: 'FAQ', href: '/faq' }
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <footer className="bg-neutral-50 py-8 md:py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Floating Pill Container */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] px-6 md:px-10 lg:px-12 py-8 md:py-12 lg:py-14">
          {/* Main Footer Content - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 mb-6 md:mb-8">

          {/* Column 1: Brand */}
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl md:text-2xl font-medium text-neutral-900 leading-tight tracking-tight m-0 mb-2 font-jost">
              motor<span className="text-blue-600 relative inline-block">w<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80 animate-pulse"></span></span>ise
            </h2>
            <p className="text-sm md:text-base text-neutral-600 font-jost">Clear data. Wise choices</p>
          </div>

          {/* Column 2: Navigation */}
          <nav aria-label="Footer navigation" className="mb-4 md:mb-0">
            <h3 className="text-xs md:text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3 md:mb-4 font-jost">Navigation</h3>
            <ul className="space-y-3 list-none m-0 p-0">
              {navigationLinks.map((link, index) => (
                <li key={index} className="m-0">
                  <Link
                    to={link.href}
                    className="relative text-sm text-neutral-700 hover:text-blue-600 hover:-translate-y-px transition-all duration-250 ease-out focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 font-jost inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-250 after:ease-out hover:after:w-full"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Legal */}
          <nav aria-label="Legal links" className="mb-4 md:mb-0">
            <h3 className="text-xs md:text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3 md:mb-4 font-jost">Legal</h3>
            <ul className="space-y-3 list-none m-0 p-0">
              {legalLinks.map((link, index) => (
                <li key={index} className="m-0">
                  <Link
                    to={link.href}
                    className="relative text-sm text-neutral-700 hover:text-blue-600 hover:-translate-y-px transition-all duration-250 ease-out focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 font-jost inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-250 after:ease-out hover:after:w-full"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Government Attribution Section */}
        <div className="border-t border-neutral-200 pt-6 md:pt-8">
          <div className="space-y-3 md:space-y-4">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Information provided by the{' '}
              <a
                href="https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency"
                className="inline-block text-blue-600 hover:text-blue-800 hover:-translate-y-px underline underline-offset-2 decoration-2 transition-all duration-250 ease-out focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Driver & Vehicle Standards Agency
              </a>{' '}
              and the{' '}
              <a
                href="https://www.gov.uk/government/organisations/driver-and-vehicle-licensing-agency"
                className="inline-block text-blue-600 hover:text-blue-800 hover:-translate-y-px underline underline-offset-2 decoration-2 transition-all duration-250 ease-out focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Driver & Vehicle Licensing Agency
              </a>
            </p>

            <p className="text-xs text-neutral-600 leading-relaxed">
              All content is available under the{' '}
              <a
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                className="inline-block text-blue-600 hover:text-blue-800 hover:-translate-y-px underline underline-offset-2 decoration-2 transition-all duration-250 ease-out focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Government Licence v3.0
              </a>,
              except where otherwise stated
            </p>

            <p className="text-xs text-neutral-500 font-medium">
              © 2024 motorwise
            </p>
          </div>
        </div>
        {/* End Floating Pill Container */}
      </div>
       </div>
    </footer>
  );
};

export default Footer;