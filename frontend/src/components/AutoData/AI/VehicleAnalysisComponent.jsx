// VehicleAnalysisMinimal.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

/* ===============================
   MinimalTokens — exact copy from DVLADataHeader (as specified)
================================ */
const MinimalTokens = `
  :root {
    /* Ultra Clean Color Palette - Minimal */
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

    /* Minimal Accent Colors */
    --primary: #3b82f6;
    --positive: #059669;
    --negative: #dc2626;
    --warning: #d97706;

    /* Clean Spacing - Generous White Space */
    --space-xs: 0.25rem;    /* 4px */
    --space-sm: 0.5rem;     /* 8px */
    --space-md: 1rem;       /* 16px */
    --space-lg: 1.5rem;     /* 24px */
    --space-xl: 2rem;       /* 32px */
    --space-2xl: 3rem;      /* 48px */
    --space-3xl: 4rem;      /* 64px */

    /* Typography - Clean Hierarchy */
    --text-xs: 0.75rem;     /* 12px */
    --text-sm: 0.875rem;    /* 14px */
    --text-base: 1rem;      /* 16px */
    --text-lg: 1.125rem;    /* 18px */
    --text-xl: 1.25rem;     /* 20px */
    --text-2xl: 1.5rem;     /* 24px */
    --text-3xl: 1.875rem;   /* 30px */

    /* Clean Typography */
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

    /* Minimal Transitions */
    --transition: all 0.15s ease;
  }
`;

/* ===============================
   Layout & Typography — DVLADataHeader/Premium patterns
================================ */
const CleanContainer = styled('div')`
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

const SectionHeader = styled('div')`
  margin-bottom: var(--space-3xl);

  & h1, & h2 {
    margin: 0;
    font-family: var(--font-main);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--gray-900);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);

    & h1, & h2 {
      font-size: var(--text-xl);
    }
  }
`;

const DataGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-3xl);
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
    margin-bottom: var(--space-2xl);
  }
`;

const ReportSection = styled('section')`
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

/* content groups are invisible – no borders, no backgrounds */
const MetricGroup = styled('div')``;

const LabelRow = styled('div')`
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
`;

const MetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  line-height: 1.3;
`;

const MetricValue = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-900);
  line-height: 1.4;
  word-break: break-word;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

const StatusIndicator = styled('span')(({ status }) => {
  const s = String(status || '').toLowerCase();
  let color = 'var(--gray-700)';
  if (['valid', 'taxed', 'no action required', 'good', 'low', 'compliant'].includes(s)) color = 'var(--positive)';
  else if (['expired', 'sorn', 'untaxed', 'critical', 'high', 'non-compliant'].includes(s)) color = 'var(--negative)';
  else if (['due soon', 'advisory', 'warning', 'medium'].includes(s)) color = 'var(--warning)';
  return `
    font-family: var(--font-main);
    font-size: var(--text-sm);
    font-weight: 500;
    color: ${color};
  `;
});

const Small = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.5;
`;

const Mono = styled('pre')`
  background: var(--gray-50);
  padding: var(--space-xl);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
  max-height: 400px;
  overflow: auto;
`;

/* ===============================
   API base
================================ */
const API_BASE_URL =
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8007/api/v1'
    : '/api/v1';

/* ===============================
   Parser (unchanged logic)
================================ */
const SYSTEM_CATEGORIES = {
  SUSPENSION: { displayName: 'Suspension & Dampers', color: 'var(--primary)' },
  BRAKING: { displayName: 'Braking System', color: 'var(--negative)' },
  ENGINE: { displayName: 'Engine & Ancillaries', color: 'var(--positive)' },
  TRANSMISSION: { displayName: 'Transmission & Drivetrain', color: 'var(--primary)' },
  ELECTRICAL: { displayName: 'Electrical Systems', color: 'var(--warning)' },
  STRUCTURE: { displayName: 'Body Structure & Corrosion', color: 'var(--negative)' },
  EXHAUST: { displayName: 'Exhaust & Emissions', color: 'var(--warning)' },
  TYRES: { displayName: 'Tyres & Wheels', color: 'var(--primary)' },
  LIGHTING: { displayName: 'Lighting & Signalling', color: 'var(--primary)' },
  STEERING: { displayName: 'Steering System', color: 'var(--primary)' },
  FUEL: { displayName: 'Fuel System', color: 'var(--warning)' },
  COOLING: { displayName: 'Cooling System', color: 'var(--warning)' },
  HVAC: { displayName: 'Climate Control', color: 'var(--primary)' },
  BODYWORK: { displayName: 'Bodywork & Trim', color: 'var(--primary)' },
  SAFETY: { displayName: 'Safety Systems', color: 'var(--negative)' },
  OTHER: { displayName: 'Other Systems', color: 'var(--primary)' }
};

const STATUS_COLORS = {
  critical: 'var(--negative)',
  warning: 'var(--warning)',
  good: 'var(--positive)',
  info: 'var(--primary)'
};

const extractValue = (text, key) => {
  const regex = new RegExp(`${key}:\\s*(.+?)(?=\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};
const extractNumericValue = (text, key) => {
  const value = extractValue(text, key);
  return value ? parseInt(value, 10) || 0 : 0;
};
const extractSection = (text, startMarker, endMarker) => {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';
  const endIndex = endMarker ? text.indexOf(endMarker, startIndex) : text.length;
  if (endIndex === -1) return text.substring(startIndex + startMarker.length);
  return text.substring(startIndex + startMarker.length, endIndex);
};
const parseListItems = (text) =>
  text.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);

class VehicleAnalysisParser {
  parse(analysisText) {
    try {
      const overallScore = extractNumericValue(analysisText, 'OVERALL_SCORE');
      const overallRisk = extractValue(analysisText, 'OVERALL_RISK')?.toLowerCase() || 'medium';
      const systemsAnalysed = extractNumericValue(analysisText, 'SYSTEMS_ANALYSED');
      const systemsWithIssues = extractNumericValue(analysisText, 'SYSTEMS_WITH_ISSUES');

      const systemsSection = extractSection(analysisText, 'SYSTEM_ANALYSIS_START', 'SYSTEM_ANALYSIS_END');
      const systems = this.parseSystems(systemsSection);

      const patternsSection = extractSection(analysisText, 'PATTERN_ANALYSIS_START', 'PATTERN_ANALYSIS_END');
      const patterns = this.parsePatterns(patternsSection);

      const riskFactorsSection = extractSection(analysisText, 'RISK_FACTORS_START', 'RISK_FACTORS_END');
      const riskFactors = parseListItems(riskFactorsSection);

      const positiveFactorsSection = extractSection(analysisText, 'POSITIVE_FACTORS_START', 'POSITIVE_FACTORS_END');
      const positiveFactors = parseListItems(positiveFactorsSection);

      const maintenanceSection = extractSection(analysisText, 'MAINTENANCE_INSIGHTS_START', 'MAINTENANCE_INSIGHTS_END');
      const maintenanceInsights = parseListItems(maintenanceSection);

      const summary = extractValue(analysisText, 'SUMMARY') || 'Technical analysis completed.';

      return {
        overallScore,
        overallRisk,
        systemsAnalysed,
        systemsWithIssues,
        systems,
        patterns,
        riskFactors,
        positiveFactors,
        maintenanceInsights,
        summary,
        criticalSystems: systems.filter(s => s.status === 'critical').length,
        warningSystems: systems.filter(s => s.status === 'warning').length,
        recentIssues: systems.filter(s => s.recentActivity).length
      };
    } catch (e) {
      return this.createFallback(analysisText);
    }
  }

  parseSystems(systemsText) {
    if (!systemsText) return [];
    const systemBlocks = systemsText.split('SYSTEM_END').filter(block => block.trim());

    return systemBlocks.map(block => {
      const name = extractValue(block, 'SYSTEM') || 'Unknown System';
      const category = extractValue(block, 'CATEGORY') || 'OTHER';
      const status = extractValue(block, 'STATUS')?.toLowerCase() || 'unknown';
      const issueCount = extractNumericValue(block, 'ISSUE_COUNT');
      const recentActivity = extractValue(block, 'RECENT_ACTIVITY') === 'YES';
      const summary = extractValue(block, 'SUMMARY') || '';

      const findingsMatch = block.match(/FINDINGS:[\s\S]*?(?=SYSTEM_END|$)/);
      const findings = findingsMatch ? parseListItems(findingsMatch[0].replace('FINDINGS:', '')) : [];

      const categoryInfo = SYSTEM_CATEGORIES[category] || SYSTEM_CATEGORIES.OTHER;

      return {
        name,
        category,
        status,
        issueCount,
        recentActivity,
        summary,
        findings,
        displayName: categoryInfo.displayName,
        color: STATUS_COLORS[status] || categoryInfo.color
      };
    });
  }

  parsePatterns(text) {
    if (!text) return {};
    const recurring = extractSection(text, 'RECURRING_ISSUES:', 'PROGRESSIVE_DETERIORATION:');
    const deterioration = extractSection(text, 'PROGRESSIVE_DETERIORATION:', 'BULLETIN_CORRELATIONS:');
    const bulletins = extractSection(text, 'BULLETIN_CORRELATIONS:', '');
    return {
      recurringIssues: parseListItems(recurring),
      progressiveDeterioration: parseListItems(deterioration),
      bulletinCorrelations: parseListItems(bulletins)
    };
  }

  createFallback(rawText) {
    return {
      overallScore: 75,
      overallRisk: 'medium',
      systemsAnalysed: 0,
      systemsWithIssues: 0,
      systems: [],
      patterns: {},
      riskFactors: [],
      positiveFactors: [],
      maintenanceInsights: [],
      summary: 'Analysis parsing encountered an issue. Raw content available below.',
      rawText,
      fallbackMode: true
    };
  }
}

/* ===============================
   Minimal components
================================ */
const Row = ({ label, value, after }) => (
  <MetricGroup>
    <LabelRow>
      <MetricLabel>{label}</MetricLabel>
      {after}
    </LabelRow>
    <MetricValue>{value}</MetricValue>
  </MetricGroup>
);

const BulletList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: var(--space-lg) 0 0 0;

  & li {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.5;
  }
`;

/* ===============================
   Main component (minimal UI)
================================ */
const VehicleAnalysisMinimal = ({ registration, vehicleData, onDataLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const parser = useMemo(() => new VehicleAnalysisParser(), []);

  const fetchAnalysis = useCallback(async () => {
    if (!registration) {
      setError('Vehicle registration is required');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/vehicle-analysis/${registration.toUpperCase()}`);
      if (!res.ok) throw new Error(res.status === 404 ? 'Vehicle analysis not available' : 'Service error');
      const data = await res.json();
      const parsed = parser.parse(data.analysis);
      setAnalysisData(parsed);
      onDataLoad?.(data);
    } catch (e) {
      setError(e.message || 'Failed to load vehicle analysis');
    } finally {
      setLoading(false);
    }
  }, [registration, parser, onDataLoad]);

  useEffect(() => {
    if (registration) fetchAnalysis();
  }, [registration, fetchAnalysis]);

  if (loading) {
    return (
      <CleanContainer>
        <ReportSection>
          <Small>Analyzing vehicle data…</Small>
        </ReportSection>
      </CleanContainer>
    );
  }

  if (error) {
    return (
      <CleanContainer>
        <ReportSection>
          <SectionHeader>
            <h2>Analysis Temporarily Unavailable</h2>
          </SectionHeader>
          <Small style={{ marginBottom: 'var(--space-xl)' }}>{error}</Small>
          <button
            onClick={fetchAnalysis}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-base)',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            Retry analysis
          </button>
        </ReportSection>
      </CleanContainer>
    );
  }

  if (!analysisData) {
    return (
      <CleanContainer>
        <ReportSection>
          <SectionHeader><h2>No Analysis Available</h2></SectionHeader>
          <Small>The requested vehicle analysis cannot be displayed at this time.</Small>
        </ReportSection>
      </CleanContainer>
    );
  }

  const vehicleInfo =
    vehicleData?.make !== 'Unknown'
      ? `${vehicleData?.make || 'Unknown'} ${vehicleData?.model || 'Vehicle'}`
      : registration || 'this vehicle';

  return (
    <CleanContainer>
      {/* Header */}
      <SectionHeader>
        <h1>Vehicle Technical Analysis</h1>
        <Small style={{ marginTop: 'var(--space-sm)' }}>
          Comprehensive technical assessment for {vehicleInfo}
        </Small>
      </SectionHeader>

      {/* Summary */}
      <ReportSection>
        <DataGrid>
          <MetricGroup>
            <MetricLabel>Overall Assessment Score</MetricLabel>
            <MetricValue>{Math.round(analysisData.overallScore)} / 100</MetricValue>
            <Small>
              <StatusIndicator status={analysisData.overallRisk}>
                {analysisData.overallRisk.charAt(0).toUpperCase() + analysisData.overallRisk.slice(1)} risk
              </StatusIndicator>
            </Small>
          </MetricGroup>

          <MetricGroup>
            <MetricLabel>Systems With Issues</MetricLabel>
            <MetricValue>
              {analysisData.systemsWithIssues} <span style={{ color: 'var(--gray-600)' }}>
                of {analysisData.systemsAnalysed}
              </span>
            </MetricValue>
            {(analysisData.criticalSystems > 0 || analysisData.warningSystems > 0) && (
              <Small style={{ marginTop: 'var(--space-xs)' }}>
                {analysisData.criticalSystems > 0 && (
                  <StatusIndicator status="critical">{analysisData.criticalSystems} critical</StatusIndicator>
                )}
                {analysisData.criticalSystems > 0 && analysisData.warningSystems > 0 && ' · '}
                {analysisData.warningSystems > 0 && (
                  <StatusIndicator status="warning">{analysisData.warningSystems} warnings</StatusIndicator>
                )}
              </Small>
            )}
          </MetricGroup>

          {analysisData.recentIssues > 0 && (
            <MetricGroup>
              <MetricLabel>Recent Activity</MetricLabel>
              <MetricValue>{analysisData.recentIssues} systems</MetricValue>
              <Small>Recent issues or changes detected</Small>
            </MetricGroup>
          )}
        </DataGrid>
      </ReportSection>

      {/* Detailed Findings (condensed, typography-only) */}
      {analysisData.systems.some(s => s.findings.length > 0) && (
        <ReportSection>
          <SectionHeader><h2>Detailed Findings</h2></SectionHeader>
          {analysisData.systems
            .filter(s => s.findings.length > 0)
            .map((s, idx) => (
              <MetricGroup key={`${s.category}-${idx}`} style={{ marginBottom: 'var(--space-xl)' }}>
                <MetricLabel style={{ color: s.color, marginBottom: 'var(--space-xs)' }}>
                  {s.name}
                </MetricLabel>
                <BulletList>
                  {s.findings.map((f, i) => <li key={i}>{f}</li>)}
                </BulletList>
              </MetricGroup>
            ))}
        </ReportSection>
      )}

      {/* System Overview – invisible grid, no cards */}
      {analysisData.systems.length > 0 && (
        <ReportSection>
          <SectionHeader><h2>Systems Overview</h2></SectionHeader>
          <DataGrid>
            {analysisData.systems.map((s, i) => (
              <MetricGroup key={`${s.category}-${i}`}>
                <Row
                  label="System"
                  value={
                    <span>
                      {s.name}{' '}
                      <span style={{ color: 'var(--gray-500)' }}>· {s.displayName}</span>
                    </span>
                  }
                />
                <Row
                  label="Status"
                  value={<StatusIndicator status={s.status}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </StatusIndicator>}
                />
                <Row label="Issues" value={`${s.issueCount}`} />
                {s.recentActivity && (
                  <Small style={{ color: 'var(--warning)' }}>Recent activity detected</Small>
                )}
                {s.summary && (
                  <Small style={{ marginTop: 'var(--space-sm)' }}>
                    {s.summary}
                  </Small>
                )}
              </MetricGroup>
            ))}
          </DataGrid>
        </ReportSection>
      )}

      {/* Assessment Factors */}
      {(analysisData.riskFactors.length > 0 || analysisData.positiveFactors.length > 0) && (
        <ReportSection>
          <SectionHeader><h2>Assessment Factors</h2></SectionHeader>
          {analysisData.riskFactors.length > 0 && (
            <MetricGroup style={{ marginBottom: 'var(--space-2xl)' }}>
              <MetricLabel>Risk Factors</MetricLabel>
              <BulletList>
                {analysisData.riskFactors.map((r, i) => <li key={`r-${i}`}>{r}</li>)}
              </BulletList>
            </MetricGroup>
          )}
          {analysisData.positiveFactors.length > 0 && (
            <MetricGroup>
              <MetricLabel>Positive Factors</MetricLabel>
              <BulletList>
                {analysisData.positiveFactors.map((p, i) => <li key={`p-${i}`}>{p}</li>)}
              </BulletList>
            </MetricGroup>
          )}
        </ReportSection>
      )}

      {/* Pattern Analysis */}
      {(analysisData.patterns?.recurringIssues?.length ||
        analysisData.patterns?.progressiveDeterioration?.length ||
        analysisData.patterns?.bulletinCorrelations?.length) && (
        <ReportSection>
          <SectionHeader><h2>Pattern Analysis</h2></SectionHeader>
          {analysisData.patterns?.recurringIssues?.length > 0 && (
            <MetricGroup style={{ marginBottom: 'var(--space-2xl)' }}>
              <MetricLabel>Recurring Issues</MetricLabel>
              <BulletList>
                {analysisData.patterns.recurringIssues.map((t, i) => <li key={`ri-${i}`}>{t}</li>)}
              </BulletList>
            </MetricGroup>
          )}
          {analysisData.patterns?.progressiveDeterioration?.length > 0 && (
            <MetricGroup style={{ marginBottom: 'var(--space-2xl)' }}>
              <MetricLabel>Progressive Deterioration</MetricLabel>
              <BulletList>
                {analysisData.patterns.progressiveDeterioration.map((t, i) => <li key={`pd-${i}`}>{t}</li>)}
              </BulletList>
            </MetricGroup>
          )}
          {analysisData.patterns?.bulletinCorrelations?.length > 0 && (
            <MetricGroup>
              <MetricLabel>Technical Bulletin Correlations</MetricLabel>
              <BulletList>
                {analysisData.patterns.bulletinCorrelations.map((t, i) => <li key={`bc-${i}`}>{t}</li>)}
              </BulletList>
            </MetricGroup>
          )}
        </ReportSection>
      )}

      {/* Summary */}
      <ReportSection>
        <SectionHeader><h2>Analysis Summary</h2></SectionHeader>
        <Small style={{ color: 'var(--gray-800)' }}>
          {analysisData.summary}
        </Small>
      </ReportSection>

      {/* Raw analysis (fallback) */}
      {analysisData.fallbackMode && (
        <ReportSection>
          <SectionHeader><h2>Raw Analysis Content</h2></SectionHeader>
          <Mono>{analysisData.rawText}</Mono>
        </ReportSection>
      )}

      {/* Professional note */}
      <ReportSection>
        <Small style={{ color: 'var(--gray-700)' }}>
          <strong>Important:</strong> This analysis is based on manufacturer data, vehicle records, and historical maintenance inputs.
          Actual condition may vary with usage, maintenance history, and environment. Consult a qualified professional for critical decisions.
        </Small>
      </ReportSection>
    </CleanContainer>
  );
};

export default React.memo(VehicleAnalysisMinimal);
