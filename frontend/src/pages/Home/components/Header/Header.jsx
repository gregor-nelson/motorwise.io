/* ============================================
   PROFESSIONAL HEADER - REACT COMPONENT
   Old Layout + New Design Aesthetic
   Desktop: Left Sidebar + Expandable Panel
   Mobile: Top Header + Slide-down Panel
   ============================================ */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';

/* ============================================
   CONSTANTS & CONFIGURATION
   ============================================ */

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
    icon: 'ph-house',
    iconClass: 'ph ph-house',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    hoverBg: 'hover:bg-blue-50'
  },
  {
    label: 'Premium Report',
    href: '/premium-report',
    icon: 'ph-file-text',
    iconClass: 'ph ph-file-text',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    hoverBg: 'hover:bg-purple-50'
  },
  {
    label: 'MOT History',
    href: '/mot-history',
    icon: 'ph-clock-clockwise',
    iconClass: 'ph ph-clock-clockwise',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
    hoverBg: 'hover:bg-green-50'
  },
  {
    label: 'Help & FAQ',
    href: '/knowledge-center',
    icon: 'ph-question',
    iconClass: 'ph ph-question',
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    hoverBg: 'hover:bg-amber-50'
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: 'ph-envelope',
    iconClass: 'ph ph-envelope',
    bgColor: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    hoverBg: 'hover:bg-pink-50'
  },
  {
    label: 'Knowledge Center',
    href: '/knowledge-center',
    icon: 'ph-book-open',
    iconClass: 'ph ph-book-open',
    bgColor: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    hoverBg: 'hover:bg-cyan-50'
  }
];

const ADDITIONAL_LINKS = [
  { label: 'Contact', href: '/contact' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Terms and conditions', href: '/terms' },
  { label: 'Accessibility statement', href: '/accessibility' },
  { label: 'Privacy notice', href: '/privacy' }
];

/* ============================================
   HEADER COMPONENT
   ============================================ */

export default function Header() {
  const navigate = useNavigate();

  // State
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [animationsInitialized, setAnimationsInitialized] = useState(false);

  // Refs
  const hamburgerRef = useRef(null);
  const mobileHamburgerRef = useRef(null);
  const mobileHeaderRef = useRef(null);
  const sidebarRef = useRef(null);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const navCardsRef = useRef(null);
  const closeButtonRef = useRef(null);
  const moreButtonRef = useRef(null);
  const moreContentRef = useRef(null);
  const moreIconRef = useRef(null);

  // Handle window resize with debounce
  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (sidebarExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarExpanded]);

  // Handle escape key
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && sidebarExpanded) {
        e.preventDefault();
        closeSidebar();
        hamburgerRef.current?.focus();
      }

      if (e.key === 'Tab' && sidebarExpanded) {
        trapFocus(e);
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [sidebarExpanded]);

  // Animate nav cards on first open
  useEffect(() => {
    if (sidebarExpanded && !animationsInitialized && navCardsRef.current) {
      const navCards = navCardsRef.current.querySelectorAll('a[data-nav-link]');
      if (navCards && navCards.length > 0) {
        animate(Array.from(navCards), {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 400,
          ease: 'outQuad',
          delay: stagger(60)
        });
        setAnimationsInitialized(true);
      }
    }
  }, [sidebarExpanded, animationsInitialized]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
    if (sidebarExpanded) {
      setMoreExpanded(false);
    }
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarExpanded(false);
    setMoreExpanded(false);
  };

  // Toggle more section
  const toggleMore = () => {
    setMoreExpanded((prev) => !prev);
  };

  // Handle navigation click
  const handleNavClick = (e, href) => {
    if (href && href.startsWith('/')) {
      e.preventDefault();
      closeSidebar();

      setTimeout(() => {
        navigate(href);
      }, 300);
    }
  };

  // Handle click outside
  const handleClickOutside = (e) => {
    if (!sidebarExpanded) return;

    const clickedSidebar = sidebarRef.current?.contains(e.target);
    const clickedPanel = panelRef.current?.contains(e.target);
    const clickedMobileHeader = mobileHeaderRef.current?.contains(e.target);

    if (!clickedSidebar && !clickedPanel && !clickedMobileHeader) {
      closeSidebar();
    }
  };

  // Focus trap
  const trapFocus = (e) => {
    if (!panelRef.current) return;

    const focusableElements = panelRef.current.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  };

  // Compute dynamic classes
  const getPanelTransformClass = () => {
    if (sidebarExpanded) {
      return '';
    }
    return isMobile ? '-translate-y-full' : '-translate-x-full';
  };

  return (
    <div className="contents" onClick={handleClickOutside}>
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="fixed -top-10 left-20 bg-blue-600 text-white px-4 py-2 text-sm font-medium z-[1001] transition-all duration-200 focus:top-4 focus:outline-2 focus:outline-white focus:outline-offset-2 rounded-lg"
      >
        Skip to main content
      </a>

      {/* Mobile Header */}
      <header
        ref={mobileHeaderRef}
        className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-[60] flex items-center justify-between px-4"
      >
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="flex flex-col justify-center transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded"
          aria-label="motorwise - Vehicle intelligence platform - Home"
        >
          <h1 className="text-xl font-medium text-neutral-900 leading-tight tracking-tight m-0 font-jost">
            motor<span className="text-blue-600 relative inline-block">w<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span></span>ise
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-jost">Clear data. Wise choices</p>
        </a>

        <button
          ref={mobileHamburgerRef}
          onClick={toggleSidebar}
          className={`flex items-center justify-center w-10 h-10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded-lg ${
            sidebarExpanded ? 'text-blue-600' : 'text-neutral-700'
          } hover:text-blue-600`}
          aria-expanded={sidebarExpanded}
          aria-label={sidebarExpanded ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="sidebar-panel"
        >
          <i className="ph ph-list text-3xl"></i>
        </button>
      </header>

      {/* Desktop Left Sidebar (60px wide) */}
      <aside
        ref={sidebarRef}
        className="hidden md:flex fixed left-0 top-0 h-screen w-[60px] bg-white border-r border-neutral-200 z-50 flex-col items-center py-6 gap-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="flex flex-col items-center justify-center w-10 h-10 transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded"
          aria-label="motorwise - Vehicle intelligence platform - Home"
        >
          <span className="text-2xl font-bold text-neutral-900 leading-none font-jost"></span>
          <span className="text-lg font-bold text-blue-600 leading-none font-jost relative">
            w
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span>
          </span>
        </a>

        {/* Hamburger Button */}
        <button
          ref={hamburgerRef}
          onClick={toggleSidebar}
          className={`flex items-center justify-center w-10 h-10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded-lg ${
            sidebarExpanded ? 'text-blue-600' : 'text-neutral-700'
          } hover:text-blue-600`}
          aria-expanded={sidebarExpanded}
          aria-label={sidebarExpanded ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="sidebar-panel"
        >
          <i className="ph ph-list text-3xl"></i>
        </button>
      </aside>

      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          sidebarExpanded ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={closeSidebar}
      ></div>

      {/* Expandable Panel */}
      <div
        id="sidebar-panel"
        ref={panelRef}
        className={`fixed left-0 md:left-[60px] top-16 md:top-0 max-h-[calc(100vh-4rem)] md:h-screen w-full max-w-full md:w-[320px] md:max-w-[320px] bg-white border-r border-neutral-200 z-40 transform transition-transform duration-300 ease-out overflow-y-auto overflow-x-hidden box-border [scrollbar-width:thin] md:flex md:flex-col ${getPanelTransformClass()}`}
        aria-hidden={!sidebarExpanded}
        role="dialog"
        aria-label="Navigation menu"
      >
        {/* Panel Header (Desktop Only) */}
        <div className="hidden md:flex px-6 py-6 border-b border-neutral-200 items-start justify-between md:flex-shrink-0">
          <div>
            <h1 className="text-xl font-medium text-neutral-900 leading-tight tracking-tight m-0 font-jost">
              motor<span className="text-blue-600 relative inline-block">w<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span></span>ise
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-jost">Clear data. Wise choices</p>
          </div>

          <button
            ref={closeButtonRef}
            onClick={closeSidebar}
            className="flex items-center justify-center w-8 h-8 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded-lg"
            aria-label="Close navigation menu"
          >
            <i className="ph ph-x text-2xl"></i>
          </button>
        </div>

        {/* Navigation Cards */}
        <div ref={navCardsRef} className="px-4 md:px-6 py-6 md:flex-1 md:overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                data-nav-link
                className={`group relative flex flex-col items-center justify-center aspect-square rounded-xl ${item.bgColor} border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 p-4`}
              >
                <div className={`flex items-center justify-center w-16 h-16 flex-shrink-0 rounded-xl ${item.iconBg} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${item.iconClass} text-4xl text-neutral-700 group-hover:text-blue-600 transition-colors duration-200`}></i>
                </div>
                <span className="text-sm font-medium text-neutral-900 text-center leading-tight h-8 flex items-center justify-center">{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Additional Links Section */}
        <div className="px-4 md:px-6 pb-6 md:flex-shrink-0 border-t border-neutral-200">
          <button
            ref={moreButtonRef}
            onClick={toggleMore}
            className="w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 hover:bg-neutral-50 rounded-lg"
            aria-expanded={moreExpanded}
            aria-label="More links"
          >
            <span className="text-sm font-medium text-neutral-900 font-jost">More Information</span>
            <i
              ref={moreIconRef}
              className={`ph ph-caret-down text-lg transition-transform duration-200 ${
                moreExpanded ? 'rotate-180' : ''
              }`}
            ></i>
          </button>

          <div
            ref={moreContentRef}
            className={`transition-all duration-300 ease-out overflow-hidden ${
              moreExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-1 pt-2">
              {ADDITIONAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  data-nav-link
                  className="block px-4 py-2 text-sm text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
