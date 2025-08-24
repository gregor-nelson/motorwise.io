import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('header')) {
        setMobileMenuOpen(false);
      }
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen, dropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [dropdownOpen]);

  const primaryNavigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Help', href: '/help' }
  ];

  const additionalLinks = [
    { label: 'Contact', href: '/contact' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Terms and conditions', href: '/terms' },
    { label: 'Accessibility statement', href: '/accessibility' },
    { label: 'Privacy notice', href: '/privacy' }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownLinkClick = () => {
    setDropdownOpen(false);
  };

  return (
    <>
      <a 
        href="#main-content" 
        className="absolute -top-10 left-4 bg-blue-600 text-white px-4 py-2 text-sm font-medium z-[1000] transition-all duration-200 focus:top-4 focus:outline-2 focus:outline-white focus:outline-offset-2"
      >
        Skip to main content
      </a>
      
      <header className="bg-white sticky top-0 z-50 w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center py-4 md:py-6 gap-4 md:gap-6 lg:gap-8 relative">
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="inline-flex items-center text-decoration-none transition-colors duration-200 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-4"
                aria-label="MotCheck UK - Vehicle MOT history and tax status checker"
              >
                <h1 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-neutral-900 leading-tight tracking-tight m-0">motorwise
                </h1>
                <span className="hidden md:block text-sm text-neutral-600 ml-2">Clear data. Wise choices</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center" aria-label="Main navigation">
              <ul className="flex items-center gap-6 lg:gap-8 list-none m-0 p-0">
                {primaryNavigationItems.map((item, index) => (
                  <li key={index} className="m-0 relative">
                    <Link to={item.href} className="text-base font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors duration-200 relative whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2">
                      {item.label}
                    </Link>
                  </li>
                ))}
                
                {/* Desktop Dropdown */}
                <li className="m-0 relative" ref={dropdownRef}>
                  <button
                    className="text-base font-medium text-neutral-600 hover:text-neutral-900 bg-transparent border-none py-2 pr-4 cursor-pointer flex items-center gap-2 transition-colors duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="More links"
                  >
                    More
                    <span className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  
                  <div className={`absolute top-full right-0 mt-2 bg-white border border-neutral-200 min-w-[200px] transition-all duration-200 ease-out z-[100] ${dropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <ul className="list-none m-0 py-2">
                      {additionalLinks.map((item, index) => (
                        <li key={index} className="m-0">
                          <Link 
                            to={item.href}
                            className="text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 px-4 py-2 block transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-[-2px] focus-visible:bg-neutral-50 focus-visible:text-neutral-900"
                            onClick={handleDropdownLinkClick}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className={`flex md:hidden items-center justify-center gap-2 border-2 ${mobileMenuOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-neutral-300 text-neutral-700 hover:border-neutral-700 hover:text-neutral-900'} px-3 py-2 cursor-pointer transition-all duration-200 text-sm font-medium min-h-[44px] min-w-[44px] focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2`}
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="flex flex-col gap-[3px] w-5 h-[14px]">
                <span className={`w-full h-0.5 bg-current transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-x-[5px] translate-y-[5px]' : ''}`}></span>
                <span className={`w-full h-0.5 bg-current transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-full h-0.5 bg-current transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 translate-x-[5px] -translate-y-[5px]' : ''}`}></span>
              </div>
              <span className="text-sm font-medium">Menu</span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div id="mobile-menu" className={`absolute top-full left-0 right-0 bg-white border-t border-neutral-200 transition-all duration-200 ease-out z-40 ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="py-6">
              {/* Primary Navigation */}
              <div className="px-6">
                <ul className="list-none m-0 p-0 flex flex-col gap-2">
                  {primaryNavigationItems.map((item, index) => (
                    <li key={index} className="m-0">
                      <Link 
                        to={item.href}
                        className="text-lg font-medium text-neutral-700 hover:text-neutral-900 py-3 block transition-colors duration-200 min-h-[44px] flex items-center focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 focus-visible:text-neutral-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Links */}
              <div className="px-6 border-t border-neutral-200 mt-6 pt-6">
                <ul className="list-none m-0 p-0 flex flex-col gap-2">
                  {additionalLinks.map((item, index) => (
                    <li key={index} className="m-0">
                      <Link 
                        to={item.href}
                        className="text-lg font-medium text-neutral-700 hover:text-neutral-900 py-3 block transition-colors duration-200 min-h-[44px] flex items-center focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 focus-visible:text-neutral-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-neutral-50 py-3">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
          <strong className="inline-block text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-blue-600 text-white flex-shrink-0">BETA</strong>
          <p className="text-xs text-neutral-600 m-0 leading-relaxed">
            This is a new service – your{' '}
            <Link to="/contact" className="text-blue-600 underline underline-offset-2 hover:text-neutral-900 hover:decoration-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 focus-visible:bg-neutral-50 focus-visible:no-underline">feedback</Link>{' '}
            will help us to improve it.
          </p>
        </div>
      </div>
    </>
  );
};

export default Header;