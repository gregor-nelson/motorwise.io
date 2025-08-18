// VehicleAnalysisStyles.jsx
import { styled } from '@mui/material/styles';

/* ===============================
   MinimalTokens — exact token set
================================ */
export const MinimalTokens = `
  :root {
    /* Colors */
    --gray-900: #1a1a1a;
    --gray-800: #2d2d2d;
    --gray-700: #404040;
    --gray-600: #525252;
    --gray-500: #737373;
    --gray-400: #a3a3a3;
    --gray-300: #d4d4d4;
    --gray-200: #e5e5e5;
    --gray-100: #f5f5f5;
    --gray-50: #fafafa;
    --white: #ffffff;

    /* Accents */
    --primary: #3b82f6;
    --positive: #059669;
    --negative: #dc2626;
    --warning: #d97706;

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;

    /* Typography */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;

    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

    /* Motion */
    --transition: all 0.15s ease;
  }
`;

/* ===============================
   Foundations
================================ */
export const CleanContainer = styled('div')`
  ${MinimalTokens}
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);
  @media (max-width: 767px) {
    padding: var(--space-xl) var(--space-md);
  }
`;

export const ReportSection = styled('section')`
  margin-bottom: var(--space-3xl);
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
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
  letter-spacing: -0.02em;
  color: var(--gray-900);
  line-height: 1.2;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

export const SectionSub = styled('p')`
  margin: 0;
  font-size: var(--text-lg);
  color: var(--gray-600);
  line-height: 1.4;
`;

export const Divider = styled('hr')`
  border: none;
  height: 1px;
  background: var(--gray-200);
  margin: var(--space-xl) 0 var(--space-xl);
`;

/* ===============================
   Micro navigation
================================ */
export const MicroNav = styled('nav')`
  margin-top: var(--space-lg);
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
`;

export const MicroNavLink = styled('button')`
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--primary);
  cursor: pointer;
  line-height: 1.2;
  transition: var(--transition);
  &:hover, &:focus {
    text-decoration: underline;
    outline: none;
  }
`;

/* ===============================
   Grids & Groups
================================ */
export const DataGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-3xl);
  margin-top: var(--space-xl);
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
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
  line-height: 1.3;
`;

export const MetricValue = styled('div')`
  font-size: var(--text-base);
  color: var(--gray-900);
  line-height: 1.4;
  word-break: break-word;
  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

export const SubtleText = styled('p')`
  margin: var(--space-sm) 0 0 0;
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.5;
`;

/* ===============================
   Chips / Pills
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
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  line-height: 1;
`;

export const PillCloud = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
`;

export const Pill = styled('span')`
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
  padding: 0.375rem 0.6rem;
  border-radius: 999px;
  font-size: var(--text-sm);
  color: ${({ $status }) => statusColor($status)};
  background: var(--gray-100);
`;

/* ===============================
   Hero Area
================================ */
export const HeroArea = styled('div')`
  margin-top: var(--space-lg);
`;

export const HeroGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-2xl);
  align-items: center;
`;

export const HeroTile = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

export const HeroNumber = styled('div')`
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--gray-900);
  line-height: 1.1;
`;

export const HeroUnit = styled('span')`
  font-size: var(--text-base);
  color: var(--gray-600);
  margin-left: var(--space-xs);
`;

export const HeroLabel = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-600);
`;

export const ArcWrap = styled('div')`
  position: relative;
  width: ${({ $size }) => $size || 140}px;
  height: ${({ $size }) => $size || 140}px;
  display: grid;
  place-items: center;
`;

export const ThinArcSvg = styled('svg')`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
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
   Countdown
================================ */
export const CountdownWrap = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

export const CountdownValue = styled('div')`
  font-size: var(--text-base);
  color: var(--gray-900);
`;

export const CountdownBar = styled('div')`
  height: 8px;
  background: var(--gray-200);
  border-radius: 999px;
  overflow: hidden;
`;

export const CountdownFill = styled('div')`
  height: 100%;
  width: ${({ $width }) => Math.max(0, Math.min(100, Number($width) || 0))}%;
  background: ${({ $status }) => statusColor($status)};
  transition: width 0.4s ease;
`;

/* ===============================
   Systems Row List (matrix)
================================ */
export const RowList = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
`;

export const RowItem = styled('div')`
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr auto;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--gray-200);
  &:hover {
    background: var(--gray-50);
  }
`;

export const RowLeft = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
`;

export const RowRight = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-md);
`;

export const RowTitle = styled('div')`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-900);
`;

export const RowMeta = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-600);
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
  &:hover, &:focus {
    text-decoration: underline;
    outline: none;
  }
`;

/* ===============================
   Panels & Lists
================================ */
export const PanelGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-2xl);
`;

export const Panel = styled('div')``;

export const PanelTitle = styled('h3')`
  margin: 0 0 var(--space-md) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
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
  }
`;

/* ===============================
   Skeleton & Error
================================ */
export const SkeletonTitle = styled('div')`
  width: 40%;
  height: 28px;
  background: var(--gray-100);
  border-radius: 6px;
`;

export const SkeletonRow = styled('div')`
  height: 16px;
  width: 100%;
  background: var(--gray-100);
  border-radius: 6px;
  margin-top: var(--space-md);
`;

export const ErrorBanner = styled('div')`
  background: var(--gray-50);
  border-left: 4px solid var(--warning);
  padding: var(--space-lg);
  font-size: var(--text-base);
  color: var(--gray-800);
  display: flex;
  gap: var(--space-md);
  align-items: baseline;
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
  &:hover, &:focus { text-decoration: underline; outline: none; }
`;

/* ===============================
   Mono Block (raw)
================================ */
export const MonoBlock = styled('pre')`
  background: var(--gray-50);
  padding: var(--space-xl);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
  max-height: 400px;
  overflow: auto;
`;
