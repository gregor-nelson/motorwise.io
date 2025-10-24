/* ============================================
   PROFESSIONAL HEADER - REFINED DESIGN
   Old Layout + New Design Aesthetic
   Desktop: Left Sidebar + Expandable Panel
   Mobile: Top Header + Slide-down Panel
   ============================================ */

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
   HEADER TEMPLATE
   ============================================ */

class ProfessionalHeader {
  constructor(container) {
    this.container = container;
    this.state = {
      sidebarExpanded: false,
      moreExpanded: false
    };
    this.refs = {};
    this.abortController = new AbortController();
    this.animationsInitialized = false;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.updateDOM(); // Ensure initial state is synced with DOM
  }

  render() {
    this.container.innerHTML = `
      <!-- Skip to Content Link -->
      <a
        href="#main-content"
        class="fixed -top-10 left-20 bg-blue-600 text-white px-4 py-2 text-sm font-medium z-[1001] transition-all duration-200 focus:top-4 focus:outline-2 focus:outline-white focus:outline-offset-2 rounded-lg"
      >
        Skip to main content
      </a>

      <!-- Mobile Header -->
      <header class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-[60] flex items-center justify-between px-4" data-ref="mobile-header">
        <a
          href="/"
          data-nav-link
          class="flex flex-col justify-center transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded"
          aria-label="motorwise - Vehicle intelligence platform - Home"
        >
          <h1 class="text-xl font-medium text-neutral-900 leading-tight tracking-tight m-0 font-jost">
            motor<span class="text-blue-600 relative inline-block">w<span class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span></span>ise
          </h1>
          <p class="text-xs text-neutral-600 mt-1 font-jost">Clear data. Wise choices</p>
        </a>

        <button
          data-ref="mobile-hamburger"
          class="flex items-center justify-center w-10 h-10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 text-neutral-700 hover:text-blue-600 rounded-lg"
          aria-expanded="false"
          aria-label="Open navigation menu"
          aria-controls="sidebar-panel"
        >
          <i class="ph ph-list text-3xl"></i>
        </button>
      </header>

      <!-- Desktop Left Sidebar (60px wide) -->
      <aside
        class="hidden md:flex fixed left-0 top-0 h-screen w-[60px] bg-white border-r border-neutral-200 z-50 flex-col items-center py-6 gap-6"
        aria-label="Main navigation"
        data-ref="sidebar"
      >
        <!-- Logo -->
        <a
          href="/"
          data-nav-link
          class="flex flex-col items-center justify-center w-10 h-10 transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded"
          aria-label="motorwise - Vehicle intelligence platform - Home"
        >
          <span class="text-2xl font-bold text-neutral-900 leading-none font-jost"></span>
          <span class="text-lg font-bold text-blue-600 leading-none font-jost relative">
            w
            <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span>
          </span>
        </a>

        <!-- Hamburger Button -->
        <button
          data-ref="hamburger"
          class="flex items-center justify-center w-10 h-10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 text-neutral-700 hover:text-blue-600 rounded-lg"
          aria-expanded="false"
          aria-label="Open navigation menu"
          aria-controls="sidebar-panel"
        >
          <i class="ph ph-list text-3xl"></i>
        </button>
      </aside>

      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black transition-opacity duration-300 z-40 opacity-0 pointer-events-none"
        data-ref="backdrop"
        aria-hidden="true"
      ></div>

      <!-- Expandable Panel -->
      <div
        id="sidebar-panel"
        class="fixed left-0 md:left-[60px] top-16 md:top-0 max-h-[calc(100vh-4rem)] md:h-screen w-full md:w-[320px] bg-white border-r border-neutral-200 z-40 transform transition-transform duration-300 ease-out overflow-y-auto [scrollbar-width:thin] md:flex md:flex-col"
        data-ref="panel"
        aria-hidden="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        <!-- Panel Header (Desktop Only) -->
        <div class="hidden md:flex px-6 py-6 border-b border-neutral-200 items-start justify-between md:flex-shrink-0">
          <div>
            <h1 class="text-xl font-medium text-neutral-900 leading-tight tracking-tight m-0 font-jost">
              motor<span class="text-blue-600 relative inline-block">w<span class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span></span>ise
            </h1>
            <p class="text-xs text-neutral-600 mt-1 font-jost">Clear data. Wise choices</p>
          </div>

          <button
            data-ref="close-button"
            class="flex items-center justify-center w-8 h-8 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded-lg"
            aria-label="Close navigation menu"
          >
            <i class="ph ph-x text-2xl"></i>
          </button>
        </div>

        <!-- Navigation Cards -->
        <div class="px-6 py-6 md:flex-1 md:overflow-y-auto" data-ref="nav-cards">
          <div class="grid grid-cols-2 gap-4">
            ${NAV_ITEMS.map(item => `
              <a
                href="${item.href}"
                data-nav-link
                class="group relative flex flex-col items-center justify-center aspect-square rounded-xl ${item.bgColor} border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 p-4"
              >
                <div class="flex items-center justify-center w-16 h-16 flex-shrink-0 rounded-xl ${item.iconBg} mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i class="${item.iconClass} text-4xl text-neutral-700 group-hover:text-blue-600 transition-colors duration-200"></i>
                </div>
                <span class="text-sm font-medium text-neutral-900 text-center leading-tight h-8 flex items-center justify-center">${item.label}</span>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Additional Links Section -->
        <div class="px-6 pb-6 md:flex-shrink-0 border-t border-neutral-200">
          <button
            data-ref="more-button"
            class="w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 hover:bg-neutral-50 rounded-lg"
            aria-expanded="false"
            aria-label="More links"
          >
            <span class="text-sm font-medium text-neutral-900 font-jost">More Information</span>
            <i class="ph ph-caret-down text-lg transition-transform duration-200" data-ref="more-icon"></i>
          </button>

          <div data-ref="more-content" class="transition-all duration-300 ease-out max-h-0 opacity-0 overflow-hidden">
            <div class="space-y-1 pt-2">
              ${ADDITIONAL_LINKS.map(link => `
                <a
                  href="${link.href}"
                  data-nav-link
                  class="block px-4 py-2 text-sm text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                >
                  ${link.label}
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Store refs
    this.refs = {
      hamburger: this.container.querySelector('[data-ref="hamburger"]'),
      mobileHamburger: this.container.querySelector('[data-ref="mobile-hamburger"]'),
      mobileHeader: this.container.querySelector('[data-ref="mobile-header"]'),
      sidebar: this.container.querySelector('[data-ref="sidebar"]'),
      backdrop: this.container.querySelector('[data-ref="backdrop"]'),
      panel: this.container.querySelector('[data-ref="panel"]'),
      navCards: this.container.querySelector('[data-ref="nav-cards"]'),
      closeButton: this.container.querySelector('[data-ref="close-button"]'),
      moreButton: this.container.querySelector('[data-ref="more-button"]'),
      moreContent: this.container.querySelector('[data-ref="more-content"]'),
      moreIcon: this.container.querySelector('[data-ref="more-icon"]')
    };
  }

  attachEventListeners() {
    const { signal } = this.abortController;

    // Hamburger buttons
    this.refs.hamburger?.addEventListener('click', () => this.toggleSidebar(), { signal });
    this.refs.mobileHamburger?.addEventListener('click', () => this.toggleSidebar(), { signal });
    this.refs.closeButton?.addEventListener('click', () => this.closeSidebar(), { signal });
    
    // Backdrop click
    this.refs.backdrop?.addEventListener('click', () => this.closeSidebar(), { signal });

    // More button
    this.refs.moreButton?.addEventListener('click', () => this.toggleMore(), { signal });

    // Navigation links
    this.container.querySelectorAll('[data-nav-link]').forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e), { signal });
    });

    // Global event listeners
    document.addEventListener('click', (e) => this.handleClickOutside(e), { signal, passive: true });
    document.addEventListener('keydown', (e) => this.handleKeydown(e), { signal, passive: false });
    window.addEventListener('resize', () => this.handleResize(), { signal, passive: true });
  }

  handleResize() {
    if (!this.state.sidebarExpanded) {
      this.updateDOM();
    }
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.updateDOM();
  }

  updateDOM() {
    requestAnimationFrame(() => {
      const { sidebarExpanded, moreExpanded } = this.state;
      const isMobile = window.innerWidth < 768;

      if (sidebarExpanded) {
        // Open panel
        this.refs.panel?.classList.remove('-translate-x-full', '-translate-y-full');
        this.refs.panel?.setAttribute('aria-hidden', 'false');
        this.refs.backdrop?.classList.remove('opacity-0', 'pointer-events-none');
        this.refs.backdrop?.classList.add('opacity-50');
        this.refs.hamburger?.classList.add('text-blue-600');
        this.refs.hamburger?.classList.remove('text-neutral-700');
        this.refs.hamburger?.setAttribute('aria-expanded', 'true');
        this.refs.hamburger?.setAttribute('aria-label', 'Close navigation menu');
        this.refs.mobileHamburger?.classList.add('text-blue-600');
        this.refs.mobileHamburger?.classList.remove('text-neutral-700');
        this.refs.mobileHamburger?.setAttribute('aria-expanded', 'true');
        this.refs.mobileHamburger?.setAttribute('aria-label', 'Close navigation menu');
        document.body.style.overflow = 'hidden';

        // Animate nav cards on open
        if (!this.animationsInitialized) {
          this.animateNavCards();
          this.animationsInitialized = true;
        }
      } else {
        // Close panel - add appropriate transform based on screen size
        this.refs.panel?.classList.remove('-translate-x-full', '-translate-y-full');
        if (isMobile) {
          this.refs.panel?.classList.add('-translate-y-full');
        } else {
          this.refs.panel?.classList.add('-translate-x-full');
        }
        this.refs.panel?.setAttribute('aria-hidden', 'true');
        this.refs.backdrop?.classList.add('opacity-0', 'pointer-events-none');
        this.refs.backdrop?.classList.remove('opacity-50');
        this.refs.hamburger?.classList.remove('text-blue-600');
        this.refs.hamburger?.classList.add('text-neutral-700');
        this.refs.hamburger?.setAttribute('aria-expanded', 'false');
        this.refs.hamburger?.setAttribute('aria-label', 'Open navigation menu');
        this.refs.mobileHamburger?.classList.remove('text-blue-600');
        this.refs.mobileHamburger?.classList.add('text-neutral-700');
        this.refs.mobileHamburger?.setAttribute('aria-expanded', 'false');
        this.refs.mobileHamburger?.setAttribute('aria-label', 'Open navigation menu');
        document.body.style.overflow = 'unset';
      }

      if (moreExpanded) {
        this.refs.moreContent?.classList.remove('max-h-0', 'opacity-0');
        this.refs.moreContent?.classList.add('max-h-96', 'opacity-100');
        this.refs.moreIcon?.classList.add('rotate-180');
        this.refs.moreButton?.setAttribute('aria-expanded', 'true');
      } else {
        this.refs.moreContent?.classList.add('max-h-0', 'opacity-0');
        this.refs.moreContent?.classList.remove('max-h-96', 'opacity-100');
        this.refs.moreIcon?.classList.remove('rotate-180');
        this.refs.moreButton?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  animateNavCards() {
    // Simple fade-in animation for nav cards when opened
    const navCards = this.refs.navCards?.querySelectorAll('a[data-nav-link]');
    if (navCards && navCards.length > 0) {
      animate(Array.from(navCards), {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        ease: 'outQuad',
        delay: stagger(60)
      });
    }
  }

  toggleSidebar() {
    this.setState({ sidebarExpanded: !this.state.sidebarExpanded });
    if (!this.state.sidebarExpanded) {
      this.setState({ moreExpanded: false });
    }
  }

  closeSidebar() {
    this.setState({
      sidebarExpanded: false,
      moreExpanded: false
    });
  }

  toggleMore() {
    this.setState({ moreExpanded: !this.state.moreExpanded });
  }

  handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');

    if (href && href.startsWith('/')) {
      e.preventDefault();
      this.closeSidebar();

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate', {
          detail: { path: href }
        }));
      }, 300);
    }
  }

  handleClickOutside(e) {
    if (!this.state.sidebarExpanded) return;

    const clickedSidebar = this.refs.sidebar?.contains(e.target);
    const clickedPanel = this.refs.panel?.contains(e.target);
    const clickedMobileHeader = this.refs.mobileHeader?.contains(e.target);

    if (!clickedSidebar && !clickedPanel && !clickedMobileHeader) {
      this.closeSidebar();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.state.sidebarExpanded) {
      e.preventDefault();
      this.closeSidebar();
      this.refs.hamburger?.focus();
    }

    if (e.key === 'Tab' && this.state.sidebarExpanded) {
      this.trapFocus(e);
    }
  }

  trapFocus(e) {
    const focusableElements = this.refs.panel?.querySelectorAll(
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
  }

  destroy() {
    this.abortController.abort();
    document.body.style.overflow = 'unset';
    this.refs = {};
    this.container.innerHTML = '';
  }
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Usage example:
// const headerContainer = document.getElementById('header');
// const header = new ProfessionalHeader(headerContainer);

export default ProfessionalHeader;