// VehicleAnalysisStyles.jsx
import { styled } from '@mui/material/styles';
import { MarketDashTokens } from '../../../styles/styles';

/* ===============================
   Foundations
================================ */
export const CleanContainer = styled('div')`
  ${MarketDashTokens}
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-lg);
  color: var(--gray-900);
  
  /* Professional mobile optimization */
  @media (max-width: 767px) {
    padding: var(--space-xl) var(--space-md);
    margin: 0 auto;
  }
  
  @media (max-width: 480px) {
    padding: var(--space-lg) var(--space-sm);
  }
`;

export const ReportSection = styled('section')`
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
  
  @media (max-width: 480px) {
    margin-bottom: var(--space-xl);
  }
`;

export const SectionHeader = styled('header')`
  margin-bottom: var(--space-3xl);
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

export const SectionTitle = styled('h1')`
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--gray-900);
  line-height: 1.25;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
    line-height: 1.3;
  }
  
  @media (max-width: 480px) {
    font-size: var(--text-lg);
    margin-bottom: var(--space-xs);
  }
`;

export const SectionSub = styled('p')`
  margin: 0;
  font-size: var(--text-lg);
  color: var(--gray-600);
  line-height: 1.375;
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
    line-height: 1.4;
  }
  
  @media (max-width: 480px) {
    font-size: var(--text-sm);
    margin-bottom: var(--space-sm);
  }
`;

export const Divider = styled('hr')`
  border: none;
  height: 1px;
  background: var(--gray-200);
  margin: var(--space-xl) 0 var(--space-xl);
  
  /* Premium mobile dividers */
  @media (max-width: 767px) {
    margin: var(--space-lg) 0;
    background: var(--gray-100);
    height: 2px;
    border-radius: var(--radius-full);
  }
  
  @media (max-width: 480px) {
    margin: var(--space-md) 0;
  }
`;

/* ===============================
   Micro navigation
================================ */
export const MicroNav = styled('nav')`
  margin-top: var(--space-lg);
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
  
  /* Premium mobile navigation */
  @media (max-width: 767px) {
    margin-top: var(--space-md);
    gap: var(--space-md);
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    /* Fade effect at edges */
    mask-image: linear-gradient(
      to right,
      transparent 0,
      black var(--space-md),
      black calc(100% - var(--space-md)),
      transparent 100%
    );
  }
  
  @media (max-width: 480px) {
    margin-top: var(--space-sm);
    gap: var(--space-sm);
  }
`;

export const MicroNavLink = styled('button')`
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--primary);
  cursor: pointer;
  line-height: 1.25;
  transition: var(--transition-fast);
  font-size: var(--text-base);
  white-space: nowrap;
  
  &:hover, &:focus {
    text-decoration: underline;
    outline: none;
  }
  
  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
  
  /* Premium mobile touch targets */
  @media (max-width: 767px) {
    min-height: 44px;
    min-width: 44px;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
    background: var(--gray-50);
    border-radius: var(--radius-full);
    border: 1px solid var(--gray-200);
    transition: all var(--transition-fast);
    
    &:hover, &:focus {
      background: var(--primary-light);
      border-color: var(--primary);
      text-decoration: none;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    min-height: 40px;
    min-width: auto;
  }
`;

/* ===============================
   Grids & Groups
================================ */
export const DataGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-2xl);
  margin-top: var(--space-xl);
  
  /* Premium mobile grid optimization */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    margin-top: var(--space-md);
    margin-left: calc(var(--space-sm) * -1);
    margin-right: calc(var(--space-sm) * -1);
  }
  
  @media (max-width: 480px) {
    gap: var(--space-md);
    margin-left: 0;
    margin-right: 0;
  }
`;

export const MetricGroup = styled('div')``;

export const LabelRow = styled('div')`
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
`;

export const MetricLabel = styled('div')`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  line-height: 1.375;
  
  /* Premium mobile metric labels */
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    line-height: 1.4;
    margin-bottom: var(--space-xs);
    font-weight: 600;
  }
`;

export const MetricValue = styled('div')`
  font-size: var(--text-base);
  color: var(--gray-900);
  line-height: 1.5;
  word-break: break-word;
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
    line-height: 1.4;
  }
  
  @media (max-width: 480px) {
    font-size: var(--text-xs);
  }
`;

export const SubtleText = styled('p')`
  margin: var(--space-sm) 0 0 0;
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.5;
  
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    line-height: 1.4;
    margin-top: var(--space-xs);
  }
`;

/* ===============================
   Chips / Pills - Insight Parity
================================ */
const statusColor = (s) => {
  const x = String(s || '').toLowerCase();
  if (['valid', 'taxed', 'no action required', 'good', 'low', 'compliant'].includes(x)) return 'var(--positive)';
  if (['expired', 'sorn', 'untaxed', 'critical', 'high', 'non-compliant'].includes(x)) return 'var(--negative)';
  if (['due soon', 'advisory', 'warning', 'medium'].includes(x)) return 'var(--warning)';
  return 'var(--gray-700)';
};

export const StatusChip = styled('span')`
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: 600;
  color: ${({ $soft, $status }) => ($soft ? statusColor($status) : 'var(--white)')};
  background: ${({ $soft, $status }) => ($soft ? 'transparent' : statusColor($status))};
  border: ${({ $soft, $status }) => ($soft ? `1px solid ${statusColor($status)}` : 'none')};
  border-radius: var(--radius-full);
  padding: 0.25rem 0.5rem;
  line-height: 1;
  font-family: var(--font-main);
  
  /* Premium mobile status chips */
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    padding: 0.2rem 0.4rem;
    min-height: 24px;
    
    /* Better touch feedback for interactive chips */
    ${({ onClick }) => onClick && `
      min-height: 32px;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      transition: var(--transition-fast);
      
      &:active {
        transform: scale(0.95);
      }
    `}
  }
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
    padding: 0.15rem 0.35rem;
    min-height: 20px;
    
    ${({ onClick }) => onClick && `
      min-height: 28px;
      padding: 0.2rem 0.4rem;
    `}
  }
`;

export const PillCloud = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  
  /* Premium mobile pill layout */
  @media (max-width: 767px) {
    gap: var(--space-xs);
    margin-top: var(--space-md);
    
    /* Improve touch spacing */
    & > * {
      margin-bottom: var(--space-xs);
    }
  }
  
  @media (max-width: 480px) {
    margin-left: calc(var(--space-xs) * -1);
    margin-right: calc(var(--space-xs) * -1);
  }
`;

export const Pill = styled('span')`
  display: inline-flex;
  align-items: center;
  line-height: 1.25;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: ${({ $status }) => statusColor($status)};
  background: var(--gray-100);
  font-family: var(--font-main);
  border: 1px solid var(--gray-200);
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--gray-50);
  }
  
  /* Premium mobile pills */
  @media (max-width: 767px) {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    min-height: 32px;
    
    /* Better touch feedback */
    &:active {
      transform: scale(0.95);
      background: var(--gray-200);
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    min-height: 28px;
  }
`;

/* ===============================
   Hero Area - Premium Mobile First
================================ */
export const HeroArea = styled('div')`
  margin-top: var(--space-lg);
  
  @media (max-width: 767px) {
    margin-top: var(--space-md);
  }
`;

export const HeroGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-2xl);
  align-items: start;
  
  /* Premium mobile optimization */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
    margin: 0 calc(var(--space-sm) * -1);
  }
  
  @media (max-width: 480px) {
    gap: var(--space-lg);
  }
`;

export const HeroTile = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-xl);
  background: var(--white);
  border-radius: var(--radius-lg);
  
  /* Premium mobile cards */
  @media (max-width: 767px) {
    padding: var(--space-lg);
    gap: var(--space-sm);
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    margin: 0 var(--space-sm);
    box-shadow: var(--shadow-sm);
    
    /* Subtle animation for engagement */
    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md);
    margin: 0;
  }
`;

export const HeroNumber = styled('div')`
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--gray-900);
  line-height: 1.1;
  font-family: var(--font-main);
  
  @media (max-width: 767px) {
    font-size: 2rem;
    line-height: 1.2;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

export const HeroUnit = styled('span')`
  font-size: var(--text-base);
  color: var(--gray-600);
  margin-left: var(--space-xs);
  font-weight: 400;
`;

export const HeroLabel = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.375;
  font-weight: 500;
  
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    line-height: 1.4;
    margin-top: var(--space-xs);
  }
`;

/* ===============================
   Thin Arc Gauge - Insight Style
================================ */
export const ArcWrap = styled('div')`
  position: relative;
  width: ${({ $size }) => $size || 140}px;
  height: ${({ $size }) => $size || 140}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
  
  /* Premium mobile arc scaling */
  @media (max-width: 767px) {
    width: ${({ $size }) => Math.round(($size || 140) * 0.8)}px;
    height: ${({ $size }) => Math.round(($size || 140) * 0.8)}px;
    margin-bottom: var(--space-sm);
  }
  
  @media (max-width: 480px) {
    width: ${({ $size }) => Math.round(($size || 140) * 0.7)}px;
    height: ${({ $size }) => Math.round(($size || 140) * 0.7)}px;
  }
`;

export const ThinArcSvg = styled('svg')`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  position: absolute;
`;

export const ThinArcTrack = styled('circle')`
  fill: none;
  stroke: var(--gray-200);
  stroke-width: ${({ $strokeWidth }) => $strokeWidth || 6}px;
`;

export const ThinArcValue = styled('circle')`
  fill: none;
  stroke-width: ${({ $strokeWidth }) => $strokeWidth || 6}px;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease;
  stroke: ${({ $status }) => statusColor($status)};
`;

/* ===============================
   Countdown - MOT Timer
================================ */
export const CountdownWrap = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  
  @media (max-width: 767px) {
    gap: var(--space-xs);
  }
`;

export const CountdownValue = styled('div')`
  font-size: var(--text-base);
  color: var(--gray-900);
  font-weight: 600;
  line-height: 1.25;
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
    line-height: 1.3;
  }
  
  @media (max-width: 480px) {
    font-size: var(--text-xs);
  }
`;

export const CountdownBar = styled('div')`
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
  
  /* Premium mobile progress bar */
  @media (max-width: 767px) {
    height: 6px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 480px) {
    height: 4px;
  }
`;

export const CountdownFill = styled('div')`
  height: 100%;
  width: ${({ $width }) => Math.max(0, Math.min(100, Number($width) || 0))}%;
  background: ${({ $status }) => statusColor($status)};
  transition: width 0.4s ease;
  border-radius: var(--radius-full);
`;

/* ===============================
   Systems Row List - Premium Mobile Matrix
================================ */
export const RowList = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 0;
  
  /* Premium mobile list optimization */
  @media (max-width: 767px) {
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--gray-200);
    background: var(--white);
    box-shadow: var(--shadow-sm);
  }
`;

export const RowItem = styled('div')`
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr auto;
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--gray-200);
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--gray-50);
    margin-left: calc(var(--space-md) * -1);
    margin-right: calc(var(--space-md) * -1);
    padding-left: var(--space-md);
    padding-right: var(--space-md);
    border-radius: var(--radius-sm);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  /* Premium mobile row optimization */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--gray-100);
    
    /* Enhanced touch interaction */
    &:active {
      background: var(--primary-light);
      transform: scale(0.98);
    }
    
    &:hover {
      margin: 0;
      padding: var(--space-md) var(--space-lg);
      border-radius: 0;
      background: var(--gray-25, var(--gray-50));
    }
    
    /* Better visual separation */
    &:not(:last-child) {
      border-bottom: 1px solid var(--gray-100);
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-sm) var(--space-md);
  }
`;

export const RowLeft = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
`;

export const RowRight = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
  
  /* Premium mobile right column */
  @media (max-width: 767px) {
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
    flex-wrap: wrap;
  }
  
  @media (max-width: 480px) {
    gap: var(--space-xs);
  }
`;

export const RowTitle = styled('div')`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.25;
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
    line-height: 1.3;
    margin-bottom: var(--space-xs);
  }
  
  @media (max-width: 480px) {
    font-size: var(--text-xs);
    font-weight: 700;
  }
`;

export const RowMeta = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.375;
  
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    line-height: 1.4;
  }
`;

export const ShowMore = styled('button')`
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  margin-top: var(--space-sm);
  font: inherit;
  color: var(--primary);
  cursor: pointer;
  font-size: var(--text-sm);
  line-height: 1.375;
  transition: var(--transition-fast);
  
  &:hover, &:focus {
    text-decoration: underline;
    outline: none;
  }
  
  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
  
  /* Premium mobile show more button */
  @media (max-width: 767px) {
    min-height: 44px;
    min-width: 44px;
    padding: var(--space-sm);
    background: var(--primary-light);
    border: 1px solid var(--primary);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 500;
    margin-top: var(--space-md);
    
    &:hover, &:focus {
      background: var(--primary);
      color: var(--white);
      text-decoration: none;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  @media (max-width: 480px) {
    min-height: 40px;
    font-size: 0.7rem;
    padding: var(--space-xs) var(--space-sm);
  }
`;

/* ===============================
   Panels & Lists - Premium Mobile
================================ */
export const PanelGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-2xl);
  
  /* Premium mobile panels */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    margin-left: calc(var(--space-sm) * -1);
    margin-right: calc(var(--space-sm) * -1);
  }
  
  @media (max-width: 480px) {
    gap: var(--space-md);
    margin-left: 0;
    margin-right: 0;
  }
`;

export const Panel = styled('div')`
  /* Clean panel with premium mobile treatment */
  
  @media (max-width: 767px) {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin: 0 var(--space-sm);
    box-shadow: var(--shadow-sm);
    
    /* Subtle interaction feedback */
    transition: var(--transition-fast);
    &:active {
      transform: translateY(1px);
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md);
    margin: 0;
  }
`;

export const PanelTitle = styled('h3')`
  margin: 0 0 var(--space-md) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.25;
  letter-spacing: -0.025em;
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
    margin-bottom: var(--space-sm);
    line-height: 1.3;
  }
  
  @media (max-width: 480px) {
    font-size: var(--text-sm);
    font-weight: 700;
  }
`;

export const BulletList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: ${({ $dense }) => ($dense ? 'var(--space-sm) 0 0 0' : 'var(--space-lg) 0 0 0')};
  
  & li {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.5;
    position: relative;
    padding-left: var(--space-lg);
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--gray-400);
      font-weight: bold;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  /* Premium mobile list optimization */
  @media (max-width: 767px) {
    margin: ${({ $dense }) => ($dense ? 'var(--space-xs) 0 0 0' : 'var(--space-md) 0 0 0')};
    
    & li {
      font-size: var(--text-sm);
      line-height: 1.4;
      padding-left: var(--space-md);
      margin-bottom: var(--space-xs);
      
      &::before {
        font-size: var(--text-xs);
      }
    }
  }
  
  @media (max-width: 480px) {
    & li {
      font-size: var(--text-xs);
      padding-left: var(--space-sm);
    }
  }
`;

/* ===============================
   Skeleton & Error - Insight Matching
================================ */
export const SkeletonTitle = styled('div')`
  width: 40%;
  height: 28px;
  background: var(--gray-100);
  border-radius: var(--radius-sm);
  
  /* Premium mobile skeleton */
  @media (max-width: 767px) {
    height: 24px;
    width: 60%;
    background: linear-gradient(
      90deg,
      var(--gray-100) 0%,
      var(--gray-50) 50%,
      var(--gray-100) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
  
  @media (max-width: 480px) {
    height: 20px;
    width: 80%;
  }
`;

export const SkeletonRow = styled('div')`
  height: 16px;
  width: 100%;
  background: var(--gray-100);
  border-radius: var(--radius-sm);
  margin-top: var(--space-md);
  
  &:nth-child(2) {
    width: 85%;
  }
  
  &:nth-child(3) {
    width: 92%;
  }
  
  /* Premium mobile skeleton rows */
  @media (max-width: 767px) {
    height: 14px;
    margin-top: var(--space-sm);
    background: linear-gradient(
      90deg,
      var(--gray-100) 0%,
      var(--gray-50) 50%,
      var(--gray-100) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
  
  @media (max-width: 480px) {
    height: 12px;
  }
`;

export const ErrorBanner = styled('div')`
  background: var(--gray-50);
  border-left: 4px solid var(--warning);
  padding: var(--space-lg);
  font-size: var(--text-base);
  color: var(--gray-800);
  display: flex;
  gap: var(--space-md);
  align-items: center;
  border-radius: var(--radius-sm);
  line-height: 1.5;
  
  & strong {
    font-weight: 600;
  }
  
  /* Premium mobile error handling */
  @media (max-width: 767px) {
    padding: var(--space-md);
    font-size: var(--text-sm);
    gap: var(--space-sm);
    flex-direction: column;
    align-items: flex-start;
    border-radius: var(--radius-lg);
    border: 1px solid var(--warning-light);
    
    & strong {
      font-size: var(--text-base);
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-sm);
    font-size: var(--text-xs);
    
    & strong {
      font-size: var(--text-sm);
    }
  }
`;

export const RetryLink = styled('button')`
  appearance: none;
  border: none;
  background: transparent;
  color: var(--primary);
  padding: 0;
  font: inherit;
  cursor: pointer;
  margin-left: auto;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: var(--transition-fast);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  
  &:hover, &:focus { 
    text-decoration: underline; 
    outline: none;
    background: var(--primary-light);
  }
  
  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  /* Premium mobile retry button */
  @media (max-width: 767px) {
    margin-left: 0;
    margin-top: var(--space-sm);
    min-height: 44px;
    min-width: 120px;
    padding: var(--space-sm) var(--space-md);
    background: var(--primary);
    color: var(--white);
    border-radius: var(--radius-full);
    font-weight: 600;
    
    &:hover, &:focus {
      background: var(--primary-hover);
      text-decoration: none;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  @media (max-width: 480px) {
    min-height: 40px;
    font-size: var(--text-xs);
    padding: var(--space-xs) var(--space-sm);
  }
`;

/* ===============================
   Mono Block (raw content fallback)
================================ */
export const MonoBlock = styled('pre')`
  background: var(--gray-50);
  padding: var(--space-xl);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.625;
  white-space: pre-wrap;
  margin: 0;
  max-height: 400px;
  overflow: auto;
  border: 1px solid var(--gray-200);
  
  /* Premium mobile code block */
  @media (max-width: 767px) {
    padding: var(--space-md);
    font-size: var(--text-xs);
    line-height: 1.5;
    max-height: 300px;
    border-radius: var(--radius-lg);
    margin-left: calc(var(--space-sm) * -1);
    margin-right: calc(var(--space-sm) * -1);
    
    /* Better mobile scrolling */
    -webkit-overflow-scrolling: touch;
  }
  
  @media (max-width: 480px) {
    padding: var(--space-sm);
    font-size: 0.7rem;
    max-height: 200px;
    margin-left: 0;
    margin-right: 0;
  }
`;