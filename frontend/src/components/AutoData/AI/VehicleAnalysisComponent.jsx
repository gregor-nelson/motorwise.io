// VehicleAnalysis.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CleanContainer,
  SectionHeader,
  SectionTitle,
  SectionSub,
  MicroNav,
  MicroNavLink,
  ReportSection,
  DataGrid,
  MetricGroup,
  LabelRow,
  MetricLabel,
  MetricValue,
  SubtleText,
  StatusChip,
  BulletList,
  PillCloud,
  Pill,
  PanelGrid,
  Panel,
  PanelTitle,
  Divider,
  SkeletonRow,
  SkeletonTitle,
  ErrorBanner,
  RetryLink,
  HeroArea,
  HeroGrid,
  HeroTile,
  HeroNumber,
  HeroUnit,
  HeroLabel,
  ArcWrap,
  ThinArcSvg,
  ThinArcTrack,
  ThinArcValue,
  CountdownWrap,
  CountdownValue,
  CountdownBar,
  CountdownFill,
  RowList,
  RowItem,
  RowLeft,
  RowRight,
  RowTitle,
  RowMeta,
  ShowMore,
  MonoBlock,
} from './VehicleAnalysisStyles';

// ------------------------------------
// API base (same logic as your existing component)
// ------------------------------------
const API_BASE_URL =
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8007/api/v1'
    : '/api/v1';

// ------------------------------------
// Helpers (parsing preserved from previous file)
// ------------------------------------
const SYSTEM_CATEGORIES = {
  SUSPENSION: { displayName: 'Suspension & Dampers' },
  BRAKING: { displayName: 'Braking System' },
  ENGINE: { displayName: 'Engine & Ancillaries' },
  TRANSMISSION: { displayName: 'Transmission & Drivetrain' },
  ELECTRICAL: { displayName: 'Electrical Systems' },
  STRUCTURE: { displayName: 'Body Structure & Corrosion' },
  EXHAUST: { displayName: 'Exhaust & Emissions' },
  TYRES: { displayName: 'Tyres & Wheels' },
  LIGHTING: { displayName: 'Lighting & Signalling' },
  STEERING: { displayName: 'Steering System' },
  FUEL: { displayName: 'Fuel System' },
  COOLING: { displayName: 'Cooling System' },
  HVAC: { displayName: 'Climate Control' },
  BODYWORK: { displayName: 'Bodywork & Trim' },
  SAFETY: { displayName: 'Safety Systems' },
  OTHER: { displayName: 'Other Systems' }
};

const extractValue = (text, key) => {
  const regex = new RegExp(`${key}:\\s*(.+?)(?=\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};
const extractNumericValue = (text, key) => {
  const v = extractValue(text, key);
  return v ? parseInt(v, 10) || 0 : 0;
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
    const systemBlocks = systemsText.split('SYSTEM_END').filter(b => b.trim());

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

// ------------------------------------
// Thin Hero Arc component (visual impact, minimal style)
// ------------------------------------
const ThinArc = ({ value = 0, max = 100, size = 140, strokeWidth = 6, status = 'medium', unit = '/100' }) => {
  const v = Math.max(0, Math.min(Number(value) || 0, max));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = v / max;
  const dash = circumference * pct;
  const offset = circumference - dash;

  return (
    <ArcWrap $size={size}>
      <ThinArcSvg viewBox={`0 0 ${size} ${size}`}>
        <ThinArcTrack cx={size/2} cy={size/2} r={radius} $strokeWidth={strokeWidth} />
        <ThinArcValue
          cx={size/2}
          cy={size/2}
          r={radius}
          $strokeWidth={strokeWidth}
          $circumference={circumference}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          $status={status}
        />
      </ThinArcSvg>
      <HeroNumber>{Math.round(v)}<HeroUnit>{unit}</HeroUnit></HeroNumber>
    </ArcWrap>
  );
};

// ------------------------------------
// Countdown (e.g., MOT days) – optional input prop
// ------------------------------------
const Countdown = ({ days, label = 'MOT Due In' }) => {
  if (typeof days !== 'number') return null;
  const status = days < 0 ? 'critical' : days <= 30 ? 'warning' : 'good';
  const capped = Math.max(0, Math.min(100, days)); // simple normalization if you map 0-100
  return (
    <CountdownWrap>
      <CountdownValue><strong>{days < 0 ? 'Expired' : `${days} days`}</strong></CountdownValue>
      <CountdownBar>
        <CountdownFill $width={days < 0 ? 100 : capped} $status={status} />
      </CountdownBar>
      <SubtleText as="div">{label}</SubtleText>
    </CountdownWrap>
  );
};

// ------------------------------------
// Main Component
// ------------------------------------
const VehicleAnalysis = ({ registration, vehicleData, onDataLoad, motDaysRemaining }) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
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

  const vehicleInfo =
    vehicleData?.make !== 'Unknown'
      ? `${vehicleData?.make || 'Unknown'} ${vehicleData?.model || 'Vehicle'}`
      : registration || 'this vehicle';

  // ---------------- Loading ----------------
  if (loading) {
    return (
      <CleanContainer>
        <ReportSection>
          <SkeletonTitle />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </ReportSection>
      </CleanContainer>
    );
  }

  // ---------------- Error ----------------
  if (error) {
    return (
      <CleanContainer>
        <ReportSection>
          <ErrorBanner role="alert">
            <strong>Analysis Temporarily Unavailable.</strong> {error}
            <RetryLink onClick={fetchAnalysis}>Retry</RetryLink>
          </ErrorBanner>
        </ReportSection>
      </CleanContainer>
    );
  }

  if (!analysisData) {
    return (
      <CleanContainer>
        <ReportSection>
          <ErrorBanner role="status">
            No analysis is available at this time.
            <RetryLink onClick={fetchAnalysis}>Retry</RetryLink>
          </ErrorBanner>
        </ReportSection>
      </CleanContainer>
    );
  }

  // ---------------- Derived ----------------
  const { overallScore, overallRisk, systemsAnalysed, systemsWithIssues, recentIssues, criticalSystems, warningSystems } = analysisData;

  // ---------------- Micro Nav targets ----------------
  const anchors = [
    { id: 'overview', label: 'Overview' },
    { id: 'systems', label: 'Systems' },
    { id: 'factors', label: 'Factors' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'summary', label: 'Summary' },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---------------- UI ----------------
  return (
    <CleanContainer>
      {/* Header */}
      <SectionHeader>
        <SectionTitle>Vehicle Technical Analysis</SectionTitle>
        <SectionSub>Comprehensive technical assessment for {vehicleInfo}</SectionSub>

        <MicroNav aria-label="Section navigation">
          {anchors.map(a => (
            <MicroNavLink key={a.id} onClick={() => scrollTo(a.id)}>{a.label}</MicroNavLink>
          ))}
        </MicroNav>
      </SectionHeader>

      {/* Hero */}
      <ReportSection id="overview">
        <HeroArea>
          <HeroGrid>
            <HeroTile>
              <ThinArc value={overallScore} max={100} status={overallRisk} />
              <HeroLabel>Overall Assessment Score</HeroLabel>
              <StatusChip $status={overallRisk} aria-label={`Overall risk ${overallRisk}`}>
                {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} risk
              </StatusChip>
            </HeroTile>

            <HeroTile>
              <HeroNumber>{systemsWithIssues}<HeroUnit> / {systemsAnalysed}</HeroUnit></HeroNumber>
              <HeroLabel>Systems with Issues</HeroLabel>
              {(criticalSystems > 0 || warningSystems > 0) && (
                <SubtleText>
                  {criticalSystems > 0 && <StatusChip as="span" $status="critical">{criticalSystems} critical</StatusChip>}
                  {(criticalSystems > 0 && warningSystems > 0) && <span> · </span>}
                  {warningSystems > 0 && <StatusChip as="span" $status="warning">{warningSystems} warnings</StatusChip>}
                </SubtleText>
              )}
            </HeroTile>

            <HeroTile>
              <HeroNumber>{recentIssues}<HeroUnit> systems</HeroUnit></HeroNumber>
              <HeroLabel>Recent Activity</HeroLabel>
              <SubtleText>Systems with recent issues or changes</SubtleText>
            </HeroTile>

            {typeof motDaysRemaining === 'number' && (
              <HeroTile>
                <Countdown days={motDaysRemaining} label="MOT Status" />
              </HeroTile>
            )}
          </HeroGrid>
        </HeroArea>
      </ReportSection>

      {/* Systems matrix */}
      {analysisData.systems?.length > 0 && (
        <ReportSection id="systems">
          <SectionTitle as="h2">Systems Overview</SectionTitle>
          <SubtleText>Scan all key systems at a glance. Select a system to expand findings.</SubtleText>

          <Divider />

          <RowList role="list">
            {analysisData.systems.map((s, idx) => {
              const isOpen = !!expanded[idx];
              const hasExtra = s.findings.length > 2;

              return (
                <RowItem key={`${s.category}-${idx}`} role="listitem">
                  <RowLeft>
                    <RowTitle>{s.name}</RowTitle>
                    <RowMeta>{s.displayName}</RowMeta>
                  </RowLeft>

                  <RowRight>
                    <StatusChip $status={s.status} aria-label={`Status ${s.status}`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </StatusChip>
                    <SubtleText>{s.issueCount} issues</SubtleText>
                    {s.recentActivity && <StatusChip as="span" $status="warning" $soft>Recent</StatusChip>}
                  </RowRight>

                  {s.findings.length > 0 && (
                    <MetricGroup>
                      <BulletList $dense>
                        {s.findings.slice(0, isOpen ? s.findings.length : 2).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </BulletList>
                      {hasExtra && (
                        <ShowMore
                          role="button"
                          tabIndex={0}
                          onClick={() => setExpanded(prev => ({ ...prev, [idx]: !isOpen }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setExpanded(prev => ({ ...prev, [idx]: !isOpen }));
                          }}
                          aria-expanded={isOpen}
                          aria-controls={`system-details-${idx}`}
                        >
                          {isOpen ? 'Show fewer findings' : `Show ${s.findings.length - 2} more findings`}
                        </ShowMore>
                      )}
                    </MetricGroup>
                  )}

                  {s.summary && <SubtleText id={`system-details-${idx}`}>{s.summary}</SubtleText>}
                </RowItem>
              );
            })}
          </RowList>
        </ReportSection>
      )}

      {/* Factors */}
      {(analysisData.riskFactors?.length > 0 || analysisData.positiveFactors?.length > 0) && (
        <ReportSection id="factors">
          <SectionTitle as="h2">Assessment Factors</SectionTitle>
          <Divider />
          <DataGrid>
            {analysisData.riskFactors?.length > 0 && (
              <MetricGroup>
                <MetricLabel>Risk Factors</MetricLabel>
                <PillCloud>
                  {analysisData.riskFactors.map((r, i) => (
                    <Pill key={`rf-${i}`} $status="warning" aria-label={`Risk factor: ${r}`}>{r}</Pill>
                  ))}
                </PillCloud>
              </MetricGroup>
            )}
            {analysisData.positiveFactors?.length > 0 && (
              <MetricGroup>
                <MetricLabel>Positive Factors</MetricLabel>
                <PillCloud>
                  {analysisData.positiveFactors.map((p, i) => (
                    <Pill key={`pf-${i}`} $status="good" aria-label={`Positive factor: ${p}`}>{p}</Pill>
                  ))}
                </PillCloud>
              </MetricGroup>
            )}
          </DataGrid>
        </ReportSection>
      )}

      {/* Pattern Analysis */}
      {(analysisData.patterns?.recurringIssues?.length ||
        analysisData.patterns?.progressiveDeterioration?.length ||
        analysisData.patterns?.bulletinCorrelations?.length) && (
        <ReportSection id="patterns">
          <SectionTitle as="h2">Pattern Analysis</SectionTitle>
          <Divider />
          <PanelGrid>
            {analysisData.patterns?.recurringIssues?.length > 0 && (
              <Panel>
                <PanelTitle>Recurring Issues</PanelTitle>
                <BulletList>
                  {analysisData.patterns.recurringIssues.map((t, i) => <li key={`ri-${i}`}>{t}</li>)}
                </BulletList>
              </Panel>
            )}
            {analysisData.patterns?.progressiveDeterioration?.length > 0 && (
              <Panel>
                <PanelTitle>Progressive Deterioration</PanelTitle>
                <BulletList>
                  {analysisData.patterns.progressiveDeterioration.map((t, i) => <li key={`pd-${i}`}>{t}</li>)}
                </BulletList>
              </Panel>
            )}
            {analysisData.patterns?.bulletinCorrelations?.length > 0 && (
              <Panel>
                <PanelTitle>Technical Bulletin Correlations</PanelTitle>
                <BulletList>
                  {analysisData.patterns.bulletinCorrelations.map((t, i) => <li key={`bc-${i}`}>{t}</li>)}
                </BulletList>
              </Panel>
            )}
          </PanelGrid>
        </ReportSection>
      )}

      {/* Maintenance */}
      {analysisData.maintenanceInsights?.length > 0 && (
        <ReportSection id="maintenance">
          <SectionTitle as="h2">Maintenance Insights</SectionTitle>
          <Divider />
          <PillCloud>
            {analysisData.maintenanceInsights.map((m, i) => (
              <Pill key={`mi-${i}`} $status="info">{m}</Pill>
            ))}
          </PillCloud>
        </ReportSection>
      )}

      {/* Summary */}
      <ReportSection id="summary">
        <SectionTitle as="h2">Analysis Summary</SectionTitle>
        <Divider />
        <SubtleText>{analysisData.summary}</SubtleText>
      </ReportSection>

      {/* Raw content (fallback) */}
      {analysisData.fallbackMode && (
        <ReportSection>
          <SectionTitle as="h2">Raw Analysis Content</SectionTitle>
          <Divider />
          <MonoBlock>{analysisData.rawText}</MonoBlock>
        </ReportSection>
      )}
    </CleanContainer>
  );
};

export default React.memo(VehicleAnalysis);
