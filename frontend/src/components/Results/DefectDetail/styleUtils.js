// Style Utilities for DefectDetail Components
// Converts styled-components logic to Tailwind className functions

/**
 * Category-based styling utilities
 */
export const getCategoryColors = (category) => {
  const normalizedCategory = category?.toLowerCase();
  
  switch (normalizedCategory) {
    case 'dangerous':
      return {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-l-red-600',
        badge: 'bg-red-100 text-red-700'
      };
    case 'major':
      return {
        text: 'text-orange-600', 
        bg: 'bg-transparent',
        border: 'border-l-orange-600',
        badge: 'bg-orange-100 text-orange-700'
      };
    case 'minor':
      return {
        text: 'text-green-600',
        bg: 'bg-green-50', 
        border: 'border-l-green-600',
        badge: 'bg-green-100 text-green-700'
      };
    case 'advisory':
      return {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-l-blue-600', 
        badge: 'bg-blue-100 text-blue-700'
      };
    default:
      return {
        text: 'text-neutral-700',
        bg: 'bg-neutral-50',
        border: 'border-l-neutral-400',
        badge: 'bg-neutral-100 text-neutral-700'
      };
  }
};

/**
 * Alert type styling
 */
export const getAlertColors = (type) => {
  switch (type) {
    case 'warning':
      return {
        bg: 'bg-transparent',
        border: 'border-l-yellow-600',
        text: 'text-yellow-800'
      };
    case 'danger':
      return {
        bg: 'bg-red-50', 
        border: 'border-l-red-600',
        text: 'text-red-800'
      };
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-l-blue-600', 
        text: 'text-blue-800'
      };
    default:
      return {
        bg: 'bg-neutral-50',
        border: 'border-l-neutral-400',
        text: 'text-neutral-700'
      };
  }
};

/**
 * Result type badge colors  
 */
export const getResultTypeColors = (type) => {
  switch (type) {
    case 'section':
      return 'text-orange-600';
    case 'subsection': 
      return 'text-blue-600';
    case 'item':
      return 'text-green-600';
    default:
      return 'text-neutral-700';
  }
};

/**
 * Category icons using Phosphor icon names
 */
export const getCategoryIcon = (category) => {
  const normalizedCategory = category?.toLowerCase();
  
  switch (normalizedCategory) {
    case 'dangerous':
      return 'x-circle';
    case 'major':
      return 'warning-circle'; 
    case 'minor':
      return 'info';
    case 'advisory':
      return 'check-circle';
    default:
      return 'circle';
  }
};

/**
 * Base container classes following design system
 */
export const containerClasses = {
  main: 'max-w-6xl mx-auto p-4 md:p-6 lg:p-8',
  content: 'max-w-6xl mx-auto p-4 md:p-6 lg:p-8',
  section: 'space-y-12 mb-16'
};

/**
 * Typography classes following design system hierarchy
 */
export const typographyClasses = {
  pageTitle: 'text-3xl font-bold text-neutral-900 leading-tight tracking-tight mb-4',
  sectionTitle: 'text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3',
  subTitle: 'text-lg font-semibold text-neutral-900 mb-4',
  cardTitle: 'text-lg font-semibold text-neutral-900',
  cardSubtitle: 'text-sm text-neutral-600',
  bodyText: 'text-sm text-neutral-700 leading-relaxed',
  smallText: 'text-xs text-neutral-600',
  tinyText: 'text-xs text-neutral-500'
};

/**
 * Card classes following ultra-minimal design system - NO BORDERS
 */
export const cardClasses = {
  base: 'bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
  interactive: 'bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer',
  secondary: 'bg-neutral-50 rounded-lg p-4 shadow-sm',
  expandable: 'bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer',
  section: (category) => {
    const colors = getCategoryColors(category);
    return `${colors.bg} rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300`;
  },
  category: (category) => {
    const colors = getCategoryColors(category);
    return `${colors.bg} rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300`;
  }
};

/**
 * Button classes following design system
 */
export const buttonClasses = {
  primary: 'px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer',
  secondary: 'px-4 py-2 bg-white border-2 border-neutral-300 text-neutral-700 text-sm rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors duration-200 cursor-pointer',
  link: 'text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors duration-200 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
};

/**
 * Loading and error state classes - NO BORDERS
 */
export const stateClasses = {
  loading: 'flex justify-center items-center min-h-48 flex-col gap-6',
  spinner: 'w-8 h-8 border-3 border-neutral-200 border-t-blue-600 rounded-full animate-spin',
  error: 'bg-red-50 rounded-lg p-4 md:p-6 shadow-sm text-red-600 text-center',
  infoBox: 'bg-blue-50 rounded-lg p-4 shadow-sm'
};

/**
 * Modal classes for full-screen mobile behavior - NO BORDERS
 */
export const modalClasses = {
  overlay: 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 md:p-0 md:bg-transparent',
  content: 'bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto relative rounded-lg md:fixed md:inset-0 md:max-w-none md:max-h-none md:rounded-none',
  header: 'sticky top-0 left-0 right-0 bg-white shadow-sm z-10 p-6',
  closeButton: 'w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 hover:shadow-lg hover:scale-110 shadow-sm'
};

/**
 * Form input classes - NO BORDERS
 */
export const inputClasses = {
  base: 'w-full px-3 py-2 text-sm rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm',
  search: 'w-full px-4 py-3 text-sm rounded-lg bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all duration-200'
};

/**
 * List and grid classes
 */
export const layoutClasses = {
  grid: 'grid grid-cols-1 md:grid-cols-2 gap-8',
  list: 'space-y-8 mb-16',
  flexContainer: 'flex items-center gap-3',
  sectionHeader: 'flex items-center gap-4',
  iconContainer: 'w-12 h-12 rounded-full flex items-center justify-center',
  prose: 'prose prose-sm max-w-none'
};

/**
 * Responsive helper functions
 */
export const getResponsiveClasses = (baseClasses, mobileClasses) => {
  return `${baseClasses} md:${mobileClasses}`;
};

/**
 * Animation and transition classes - premium and emotionally engaging
 */
export const animationClasses = {
  // Premium hover effects
  hover: 'hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
  hoverSmall: 'hover:scale-110 transition-all duration-300',
  smooth: 'transition-all duration-300 ease-out',
  // Modal animations - premium
  modalEnter: 'animate-[modalFadeIn_0.3s_ease-out]',
  // Expandable content with premium feel
  expandable: 'transition-all duration-300 ease-out',
  // Section toggles with smooth rotation
  sectionToggle: 'transition-transform duration-300',
  // Staggered entrance animations
  staggered: (index) => `opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_${index * 100}ms_forwards]`
};

/**
 * Utility function to combine classes conditionally
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Enhanced loading states
 */
export const loadingClasses = {
  skeleton: 'animate-pulse bg-neutral-200 rounded',
  skeletonText: 'h-4 bg-neutral-200 rounded animate-pulse',
  skeletonCard: 'h-32 bg-neutral-200 rounded animate-pulse'
};

/**
 * Premium interaction patterns
 */
export const interactionClasses = {
  // Expandable card header
  expandableHeader: 'flex items-center justify-between cursor-pointer',
  // Icon containers with premium styling
  iconContainer: (color) => `w-12 h-12 ${color}-50 rounded-full flex items-center justify-center`,
  iconContainerSmall: (color) => `w-8 h-8 ${color}-50 rounded-full flex items-center justify-center`,
  // Status indicators
  statusDot: (color) => `w-3 h-3 ${color} rounded-full`,
  statusDotSmall: (color) => `w-2 h-2 ${color} rounded-full`,
  // Progress indicators
  progressBar: 'w-full bg-neutral-200 rounded-full h-2 overflow-hidden',
  progressFill: 'h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out'
};

/**
 * Scroll-triggered animation utilities
 */
export const scrollAnimationClasses = {
  hidden: 'opacity-0 translate-y-4',
  visible: 'opacity-100 translate-y-0',
  transition: 'transition-all duration-500 ease-out'
};

/**
 * Additional CSS animations for Tailwind
 * Add these to your tailwind.config.js or global CSS
 */
export const customAnimations = `
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
`;