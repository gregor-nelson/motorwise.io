// TechSpecStyles.jsx
// MarketDash Design System Components for Technical Specifications Page
// Uses CSS custom properties from Home page design system
import { GovUKLoadingSpinner } from '../../../styles/theme';
import { styled } from '@mui/material/styles';

// ===== MAIN LAYOUT COMPONENTS =====

// Main Container
export const TechSpecsContainer = styled('div')(() => ({
  background: 'var(--gray-50)',
  minHeight: '100vh',
  fontFamily: 'var(--font-main)'
}));

// Content Wrapper
export const ContentWrapper = styled('div')(() => ({
  maxWidth: 'var(--container-max)',
  margin: '0 auto',
  padding: '0 var(--space-lg)',
  
  '@media (max-width: 768px)': {
    padding: '0 var(--space-md)'
  },
  
  '@media (max-width: 480px)': {
    padding: '0 var(--space-sm)'
  }
}));

// Page Header
export const PageHeader = styled('div')(() => ({
  background: 'var(--white)',
  borderBottom: '1px solid var(--gray-200)',
  padding: 'var(--space-2xl) 0',
  marginBottom: 'var(--space-xl)',
  
  '@media (max-width: 768px)': {
    padding: 'var(--space-xl) 0'
  }
}));

// Page Title
export const PageTitle = styled('h1')(() => ({
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl))',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--gray-800)',
  margin: '0 0 var(--space-md) 0',
  lineHeight: 'var(--leading-tight)',
  letterSpacing: 'var(--tracking-tight)'
}));

// Page Subtitle
export const PageSubtitle = styled('p')(() => ({
  fontSize: 'var(--text-lg)',
  color: 'var(--gray-600)',
  lineHeight: 'var(--leading-relaxed)',
  margin: 0,
  maxWidth: '600px',
  
  '@media (max-width: 768px)': {
    fontSize: 'var(--text-base)'
  }
}));

// ===== ESSENTIAL SPECS CARD =====

// Essential Specs Card - The hero card showing key information
export const EssentialCard = styled('div')(() => ({
  background: 'var(--white)',
  border: '1px solid var(--gray-200)',
  borderLeft: '4px solid var(--primary)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2xl)',
  marginBottom: 'var(--space-xl)',
  boxShadow: 'var(--shadow-md)',
  transition: 'var(--transition)',
  
  '&:hover': {
    boxShadow: 'var(--shadow-lg)',
    borderLeftColor: 'var(--primary-hover)'
  },
  
  '@media (max-width: 768px)': {
    padding: 'var(--space-xl)',
    borderRadius: 'var(--radius-sm)'
  }
}));

// Essential Card Title
export const EssentialTitle = styled('h2')(() => ({
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--gray-800)',
  margin: '0 0 var(--space-lg) 0',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  
  '@media (max-width: 768px)': {
    fontSize: 'var(--text-xl)'
  }
}));

// Essential Specs Grid
export const EssentialGrid = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 'var(--space-lg)',
  
  '@media (max-width: 768px)': {
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 'var(--space-md)'
  },
  
  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr',
    gap: 'var(--space-sm)'
  }
}));

// Spec Item in Essential Grid
export const EssentialSpecItem = styled('div')(() => ({
  textAlign: 'center',
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-sm)',
  transition: 'var(--transition)',
  
  '&:hover': {
    background: 'var(--gray-50)'
  }
}));

// ===== SPEC DISPLAY COMPONENTS =====

// Spec Label
export const SpecLabel = styled('div')(() => ({
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--gray-600)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-wide)',
  marginBottom: 'var(--space-xs)'
}));

// Spec Value
export const SpecValue = styled('div')(() => ({
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-bold)',
  color: 'var(--gray-900)',
  lineHeight: 'var(--leading-tight)',
  fontFamily: 'var(--font-display)',
  
  '@media (max-width: 768px)': {
    fontSize: 'var(--text-xl)'
  }
}));

// Spec Unit
export const SpecUnit = styled('span')(() => ({
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-regular)',
  color: 'var(--gray-600)',
  marginLeft: 'var(--space-xs)',
  
  '@media (max-width: 768px)': {
    fontSize: 'var(--text-sm)'
  }
}));

// ===== DETAIL SECTIONS =====

// Detail Section Container
export const DetailSection = styled('div')(() => ({
  background: 'var(--white)',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-sm)',
  marginBottom: 'var(--space-lg)',
  overflow: 'hidden',
  transition: 'var(--transition)',
  
  '&:hover': {
    boxShadow: 'var(--shadow-sm)'
  }
}));

// Section Header (Expandable)
export const SectionHeader = styled('div')(() => ({
  padding: 'var(--space-xl)',
  borderBottom: '1px solid var(--gray-200)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'var(--transition)',
  
  '&:hover': {
    background: 'var(--gray-50)'
  },
  
  '@media (max-width: 768px)': {
    padding: 'var(--space-lg)'
  }
}));

// Section Title
export const SectionTitle = styled('h3')(() => ({
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-xl)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--gray-800)',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  
  '@media (max-width: 768px)': {
    fontSize: 'var(--text-lg)',
    gap: 'var(--space-sm)'
  }
}));

// Section Icon
export const SectionIcon = styled('div')(() => ({
  width: '40px',
  height: '40px',
  backgroundColor: 'var(--primary-light)',
  color: 'var(--primary)',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  
  '@media (max-width: 768px)': {
    width: '32px',
    height: '32px'
  }
}));

// Expand Icon
export const ExpandIcon = styled('div')(({ expanded }) => ({
  transition: 'var(--transition)',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  color: 'var(--gray-500)'
}));

// Section Content (Collapsible)
export const SectionContent = styled('div')(({ expanded }) => ({
  maxHeight: expanded ? '2000px' : '0',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  opacity: expanded ? 1 : 0
}));

// ===== SPECS GRID =====

// Specs Grid inside sections
export const SpecsGrid = styled('div')(() => ({
  padding: 'var(--space-xl)',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: 'var(--space-lg)',
  
  '@media (max-width: 768px)': {
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 'var(--space-md)',
    padding: 'var(--space-lg)'
  },
  
  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr',
    gap: 'var(--space-sm)'
  }
}));

// Individual Spec Card
export const SpecCard = styled('div')(() => ({
  padding: 'var(--space-lg)',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-sm)',
  transition: 'var(--transition)',
  background: 'var(--white)',
  
  '&:hover': {
    boxShadow: 'var(--shadow-sm)',
    borderColor: 'var(--gray-300)'
  },
  
  '@media (max-width: 768px)': {
    padding: 'var(--space-md)'
  }
}));

// ===== ALERT COMPONENTS =====

// Warning Alert
export const WarningAlert = styled('div')(() => ({
  background: 'var(--warning-light)',
  border: '1px solid var(--warning)',
  borderLeft: '4px solid var(--warning)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-lg)',
  marginBottom: 'var(--space-xl)',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-md)'
}));

// Info Alert
export const InfoAlert = styled('div')(() => ({
  background: 'var(--primary-light)',
  border: '1px solid var(--primary)',
  borderLeft: '4px solid var(--primary)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-lg)',
  marginBottom: 'var(--space-xl)',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-md)'
}));

// Alert Content
export const AlertContent = styled('div')(() => ({
  flex: 1
}));

export const AlertTitle = styled('h4')(() => ({
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--gray-800)',
  margin: '0 0 var(--space-xs) 0'
}));

export const AlertText = styled('p')(() => ({
  fontSize: 'var(--text-sm)',
  color: 'var(--gray-700)',
  lineHeight: 'var(--leading-relaxed)',
  margin: 0
}));

// ===== LOADING COMPONENTS =====

// Loading Container
export const LoadingContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-4xl)',
  textAlign: 'center',
  background: 'var(--white)',
  borderRadius: 'var(--radius-sm)',
  margin: 'var(--space-xl) 0'
}));

export const LoadingSpinner = styled('div')(() => ({
  width: '40px',
  height: '40px',
  border: '4px solid var(--gray-200)',
  borderTop: '4px solid var(--primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: 'var(--space-lg)'
}));

export const LoadingText = styled('p')(() => ({
  fontSize: 'var(--text-lg)',
  color: 'var(--gray-600)',
  margin: '0 0 var(--space-sm) 0',
  fontWeight: 'var(--font-medium)'
}));

export const LoadingSubtext = styled('p')(() => ({
  fontSize: 'var(--text-sm)',
  color: 'var(--gray-500)',
  margin: 0,
  maxWidth: '300px',
  lineHeight: 'var(--leading-relaxed)'
}));

// ===== ERROR COMPONENTS =====

// Error Container
export const ErrorContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-4xl)',
  textAlign: 'center',
  background: 'var(--white)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--gray-200)',
  margin: 'var(--space-xl) 0'
}));

export const ErrorTitle = styled('h2')(() => ({
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--negative)',
  margin: '0 0 var(--space-md) 0',
  fontFamily: 'var(--font-display)'
}));

export const ErrorText = styled('p')(() => ({
  fontSize: 'var(--text-base)',
  color: 'var(--gray-600)',
  lineHeight: 'var(--leading-relaxed)',
  margin: '0 0 var(--space-xl) 0',
  maxWidth: '500px'
}));

export const RetryButton = styled('button')(() => ({
  background: 'var(--primary)',
  color: 'var(--white)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-md) var(--space-xl)',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-medium)',
  fontFamily: 'var(--font-main)',
  cursor: 'pointer',
  transition: 'var(--transition)',
  
  '&:hover': {
    background: 'var(--primary-hover)',
    transform: 'translateY(-1px)',
    boxShadow: 'var(--shadow-sm)'
  },
  
  '&:active': {
    transform: 'translateY(0)'
  }
}));

// ===== SPECIALTY COMPONENTS =====

// Fuel Type Badge
export const FuelTypeBadge = styled('div')(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  background: 'var(--primary)',
  color: 'var(--white)',
  padding: 'var(--space-sm) var(--space-lg)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-wide)',
  marginBottom: 'var(--space-lg)'
}));

// Empty State
export const EmptyStateContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-4xl)',
  textAlign: 'center',
  background: 'var(--white)',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-sm)',
  margin: 'var(--space-xl) 0'
}));

export const EmptyStateTitle = styled('h3')(() => ({
  fontSize: 'var(--text-xl)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--gray-800)',
  margin: '0 0 var(--space-md) 0',
  fontFamily: 'var(--font-display)'
}));

export const EmptyStateText = styled('p')(() => ({
  fontSize: 'var(--text-base)',
  color: 'var(--gray-600)',
  lineHeight: 'var(--leading-relaxed)',
  margin: 0,
  maxWidth: '400px'
}));

// Footer Note
export const FooterNote = styled('div')(() => ({
  background: 'var(--gray-100)',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-lg)',
  marginTop: 'var(--space-2xl)',
  textAlign: 'center'
}));

export const FooterText = styled('p')(() => ({
  fontSize: 'var(--text-sm)',
  color: 'var(--gray-600)',
  lineHeight: 'var(--leading-relaxed)',
  margin: 0
}));

// ===== UTILITY COMPONENTS =====

// Simple divider
export const Divider = styled('div')(() => ({
  height: '1px',
  background: 'var(--gray-200)',
  margin: 'var(--space-xl) 0'
}));

// Flex helper
export const FlexCenter = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

export const FlexBetween = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

// Text helpers
export const TextMuted = styled('span')(() => ({
  color: 'var(--gray-500)'
}));

export const TextSmall = styled('span')(() => ({
  fontSize: 'var(--text-sm)'
}));