import React, { useState, useEffect, useRef } from 'react';
import './HeaderStyles.css';

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
        className="skip-link"
      >
        Skip to main content
      </a>
      
      <header className="header-wrapper">
        <div className="header-container">
          <div className="header-content">
            <div className="header-brand">
              <a 
                href="/" 
                className="brand-link"
                aria-label="MotCheck UK - Vehicle MOT history and tax status checker"
              >
                <h1 className="brand-title">MotCheck UK</h1>
                <span className="brand-subtitle">Vehicle Checks</span>
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="desktop-navigation" aria-label="Main navigation">
              <ul className="nav-list">
                {primaryNavigationItems.map((item, index) => (
                  <li key={index} className="nav-item">
                    <a href={item.href} className="nav-link">
                      {item.label}
                    </a>
                  </li>
                ))}
                
                {/* Desktop Dropdown */}
                <li className="nav-item dropdown-container" ref={dropdownRef}>
                  <button
                    className="dropdown-button"
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="More links"
                  >
                    More
                    <span className="dropdown-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  
                  <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
                    <ul className="dropdown-list">
                      {additionalLinks.map((item, index) => (
                        <li key={index} className="dropdown-item">
                          <a 
                            href={item.href}
                            className="dropdown-link"
                            onClick={handleDropdownLinkClick}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="hamburger-menu">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </div>
              <span className="menu-text">Menu</span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div id="mobile-menu" className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-content">
              {/* Primary Navigation */}
              <div className="mobile-menu-section">
                <ul className="mobile-menu-list">
                  {primaryNavigationItems.map((item, index) => (
                    <li key={index} className="mobile-menu-item">
                      <a 
                        href={item.href}
                        className="mobile-menu-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Links */}
              <div className="mobile-menu-section">
                <ul className="mobile-menu-list">
                  {additionalLinks.map((item, index) => (
                    <li key={index} className="mobile-menu-item">
                      <a 
                        href={item.href}
                        className="mobile-menu-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="phase-banner">
        <div className="phase-banner-container">
          <strong className="phase-tag">BETA</strong>
          <p className="phase-text">
            This is a new service – your{' '}
            <a href="/feedback">feedback</a>{' '}
            will help us to improve it.
          </p>
        </div>
      </div>
    </>
  );
};

export default Header;