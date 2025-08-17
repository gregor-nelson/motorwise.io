import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Import Material-UI icons
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Import PRIMARY styled components from DVLADataHeader (MOST IMPORTANT)
import {
  DVLADataContainer,
  SectionHeader,
  DataGrid,
  MetricGroup,
  MetricRow,
  MetricItem,
  MetricLabel,
  MetricValue,
  StatusIndicator,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorHeader,
  ErrorMessage,
  SectionDivider,
  ResponsiveWrapper
} from '../../Premium/DVLA/Header/DVLADataHeaderStyles';

// Import selective minimal elements from insights for gauge only
import {
  GaugeContainer,
  GaugeSvg,
  GaugeTrack,
  GaugeFill,
  GaugeCenterText,
  ProgressBar,
  ProgressFill
} from '../../Premium/DVLA/Insights/style/style';

// API and Configuration
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:8007/api/v1' : '/api/v1';

const CONFIG = {
  CACHE: { TTL: 24 * 60 * 60 * 1000, PREFIX: 'vehicle_analysis_', VERSION: 'v1' },
  
  ERROR_MESSAGES: {
    network: 'Service problem. Please try again later.',
    timeout: 'Service timeout. Please try again later.',
    400: 'Invalid registration number.',
    404: 'Vehicle information not found.',
    default: 'Unable to process request. Please try again later.'
  }
};

// Utility functions
const safeProcess = (fn, fallback = null) => {
  try { return fn(); }
  catch (error) {
    console.debug('Processing error:', error);
    return fallback;
  }
};

const getErrorMessage = (error) => {
  const errorStr = String(error || '');
  return CONFIG.ERROR_MESSAGES[
    ['network', 'timeout', '400', '404'].find(key => errorStr.includes(key)) || 'default'
  ];
};

// Minimal status detection - semantic color only
const detectStatusFromText = (text) => {
  const combined = String(text || '').toLowerCase();
  if (/✓|✅|🟢|good|ok|pass|low|acceptable|fine|satisfactory|adequate/i.test(combined)) {
    return 'good';
  }
  if (/⚠️|🟡|⚠|warning|medium|moderate|caution|amber|attention|concern/i.test(combined)) {
    return 'warning';
  }
  if (/❌|✗|🔴|❗|critical|high|fail|urgent|severe|red|danger|poor|bad/i.test(combined)) {
    return 'critical';
  }
  return 'unknown';
};

// Browser cache utilities
const browserCache = {
  saveToCache: (key, data) => safeProcess(() => {
    const jsonString = JSON.stringify({ data, timestamp: Date.now(), version: CONFIG.CACHE.VERSION });
    if (new Blob([jsonString]).size > 2 * 1024 * 1024) return false;
    localStorage.setItem(`${CONFIG.CACHE.PREFIX}${key}`, jsonString);
    return true;
  }, false),

  getFromCache: (key) => safeProcess(() => {
    const cached = localStorage.getItem(`${CONFIG.CACHE.PREFIX}${key}`);
    if (!cached) return null;
    
    const entry = JSON.parse(cached);
    if (entry.version !== CONFIG.CACHE.VERSION || Date.now() - entry.timestamp > CONFIG.CACHE.TTL) {
      localStorage.removeItem(`${CONFIG.CACHE.PREFIX}${key}`);
      return null;
    }
    return entry.data;
  }, null)
};

// Clean Gauge component - minimal styling following DVLADataHeader patterns
const CleanGauge = ({ value, max = 100, unit = '', label = 'Metric', status = 'unknown', size = 120 }) => {
  const numValue = parseFloat(value) || 0;
  const numMax = parseFloat(max) || 100;
  const percentage = Math.min(Math.max((numValue / numMax) * 100, 0), 100);
  const radius = Math.max((size - 16) / 2, 10);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <MetricGroup>
      <GaugeContainer style={{ width: size, height: size, margin: '0 auto var(--space-lg)' }}>
        <GaugeSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <GaugeTrack cx={size/2} cy={size/2} r={radius} />
          <GaugeFill 
            cx={size/2} cy={size/2} r={radius}
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{
              stroke: status === 'good' ? 'var(--positive)' : 
                     status === 'warning' ? 'var(--warning)' : 
                     status === 'critical' ? 'var(--negative)' : 'var(--primary)'
            }}
          />
        </GaugeSvg>
        <GaugeCenterText>
          <MetricValue>{Math.round(numValue)}</MetricValue>
          <MetricLabel style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--text-xs)' }}>
            {unit}
          </MetricLabel>
        </GaugeCenterText>
      </GaugeContainer>
      <MetricLabel>{label}</MetricLabel>
    </MetricGroup>
  );
};

// Clean Progress Bar component
const CleanProgressBar = ({ label, value, max = 100, status = 'unknown' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <MetricGroup>
      <MetricLabel>{label}</MetricLabel>
      <MetricValue>{value} of {max}</MetricValue>
      <div style={{ marginTop: 'var(--space-sm)' }}>
        <ProgressBar style={{ height: '6px', borderRadius: '3px' }}>
          <ProgressFill 
            width={percentage}
            color={status === 'good' ? 'var(--positive)' : 
                  status === 'warning' ? 'var(--warning)' : 
                  status === 'critical' ? 'var(--negative)' : 'var(--primary)'}
          />
        </ProgressBar>
      </div>
    </MetricGroup>
  );
};

// Enhanced markdown parsing - robust handling of Claude API structure
const parseMarkdownAnalysis = (markdownText) => {
  if (!markdownText?.trim()) return { sections: [], tables: [], summary: null };
  
  return safeProcess(() => {
    const lines = markdownText.split('\n');
    const sections = [];
    const tables = [];
    let currentSection = null;
    let summary = null;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Parse headers (## or #)
      if (trimmedLine.match(/^#+\s+/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const level = (trimmedLine.match(/^#+/) || [''])[0].length;
        const title = trimmedLine.replace(/^#+\s*/, '');
        
        currentSection = {
          title,
          level,
          content: [],
          type: detectSectionType(title)
        };
      }
      // Parse table rows (contains |)
      else if (trimmedLine.includes('|') && !trimmedLine.match(/^\|\s*[-:]+\s*\|/)) {
        // Look for table context
        const tableIndex = tables.length;
        let table = tables[tableIndex] || { headers: [], rows: [] };
        
        const cells = trimmedLine.split('|').map(c => c.trim()).filter(Boolean);
        
        if (table.headers.length === 0 && cells.length > 0) {
          table.headers = cells;
          tables[tableIndex] = table;
        } else if (cells.length > 0) {
          table.rows.push(cells);
          tables[tableIndex] = table;
        }
      }
      // Parse content lines
      else if (trimmedLine && currentSection) {
        const cleanContent = trimmedLine.replace(/^[-*]\s*/, '').replace(/\*\*/g, '');
        if (cleanContent) {
          currentSection.content.push({
            text: cleanContent,
            status: detectStatusFromText(cleanContent)
          });
        }
      }
      // Parse summary (first paragraph)
      else if (trimmedLine && !summary && !currentSection) {
        summary = trimmedLine;
      }
    });
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return { sections, tables, summary };
  }, { sections: [], tables: [], summary: null });
};

// Detect section type from title
const detectSectionType = (title) => {
  const t = title.toLowerCase();
  if (t.includes('risk') || t.includes('assessment')) return 'risk';
  if (t.includes('finding') || t.includes('key')) return 'findings';
  if (t.includes('technical') || t.includes('bulletin')) return 'technical';
  if (t.includes('mot') || t.includes('pattern')) return 'history';
  if (t.includes('summary') || t.includes('note')) return 'summary';
  return 'general';
};

// Clean table renderer following DVLADataHeader patterns
const renderAnalysisTable = (table, index) => {
  if (!table?.headers?.length || !table?.rows?.length) return null;
  
  return (
    <MetricGroup key={`table-${index}`} style={{ marginBottom: 'var(--space-3xl)' }}>
      <DataGrid style={{ gridTemplateColumns: '1fr', gap: 'var(--space-lg)' }}>
        {table.rows.map((row, rowIndex) => (
          <MetricRow key={`row-${rowIndex}`} style={{ 
            gridTemplateColumns: `repeat(${table.headers.length}, 1fr)`,
            padding: 'var(--space-lg)',
            borderLeft: `3px solid ${
              detectStatusFromText(row.join(' ')) === 'good' ? 'var(--positive)' :
              detectStatusFromText(row.join(' ')) === 'warning' ? 'var(--warning)' :
              detectStatusFromText(row.join(' ')) === 'critical' ? 'var(--negative)' :
              'var(--gray-300)'
            }`
          }}>
            {row.map((cell, cellIndex) => (
              <MetricItem key={`cell-${cellIndex}`}>
                <MetricLabel>{table.headers[cellIndex] || `Column ${cellIndex + 1}`}</MetricLabel>
                <MetricValue>
                  <StatusIndicator status={detectStatusFromText(cell)}>
                    {cell || 'N/A'}
                  </StatusIndicator>
                </MetricValue>
              </MetricItem>
            ))}
          </MetricRow>
        ))}
      </DataGrid>
    </MetricGroup>
  );
};

// Generate clean summary metrics from analysis data
const generateSummaryMetrics = (analysisData) => {
  if (!analysisData?.sections?.length && !analysisData?.tables?.length) return [];
  
  const metrics = [];
  let riskCount = 0;
  let goodCount = 0;
  let totalItems = 0;
  
  // Count items from tables
  analysisData.tables.forEach(table => {
    table.rows.forEach(row => {
      totalItems++;
      const status = detectStatusFromText(row.join(' '));
      if (status === 'critical' || status === 'warning') riskCount++;
      if (status === 'good') goodCount++;
    });
  });
  
  // Count items from sections
  analysisData.sections.forEach(section => {
    section.content.forEach(item => {
      totalItems++;
      if (item.status === 'critical' || item.status === 'warning') riskCount++;
      if (item.status === 'good') goodCount++;
    });
  });
  
  if (totalItems > 0) {
    // Overall risk assessment
    const riskPercentage = Math.round((riskCount / totalItems) * 100);
    const overallScore = Math.max(0, 100 - riskPercentage * 1.5);
    
    metrics.push({
      label: 'Overall Assessment',
      value: overallScore,
      max: 100,
      status: overallScore > 80 ? 'good' : overallScore > 60 ? 'warning' : 'critical',
      type: 'gauge'
    });
    
    if (riskCount > 0) {
      metrics.push({
        label: 'Items Requiring Attention',
        value: riskCount,
        max: totalItems,
        status: riskCount > totalItems * 0.5 ? 'critical' : 'warning',
        type: 'progress'
      });
    }
    
    if (goodCount > 0) {
      metrics.push({
        label: 'Systems in Good Condition',
        value: goodCount,
        max: totalItems,
        status: 'good',
        type: 'progress'
      });
    }
  }
  
  return metrics;
};

// Clean section renderer following DVLADataHeader patterns
const renderAnalysisSection = (section, index) => {
  if (!section?.content?.length) return null;
  
  return (
    <MetricGroup key={`section-${index}`} style={{ marginBottom: 'var(--space-3xl)' }}>
      <MetricLabel style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-lg)' }}>
        {section.title}
      </MetricLabel>
      
      <DataGrid style={{ gridTemplateColumns: '1fr', gap: 'var(--space-lg)' }}>
        {section.content.slice(0, 6).map((item, itemIndex) => (
          <MetricRow key={`item-${itemIndex}`} style={{ 
            gridTemplateColumns: '1fr',
            padding: 'var(--space-lg)',
            borderLeft: `3px solid ${
              item.status === 'good' ? 'var(--positive)' :
              item.status === 'warning' ? 'var(--warning)' :
              item.status === 'critical' ? 'var(--negative)' :
              'var(--gray-300)'
            }`
          }}>
            <MetricItem>
              <MetricValue>
                <StatusIndicator status={item.status}>
                  {item.text}
                </StatusIndicator>
              </MetricValue>
            </MetricItem>
          </MetricRow>
        ))}
      </DataGrid>
    </MetricGroup>
  );
};

const renderEnhancedSystemCard = (card, index) => {
  // Enhanced status detection with diagnostic context
  const getDiagnosticStatus = (card) => {
    const status = card.status || 'unknown';
    const description = String(card.description || '').toLowerCase();
    
    if (status === 'critical' || description.includes('fail') || description.includes('critical')) {
      return {
        level: 'critical',
        color: 'var(--negative)',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'var(--negative)',
        label: 'CRITICAL',
        icon: <ErrorIcon />,
        action: 'Immediate attention required'
      };
    }
    if (status === 'warning' || description.includes('warning') || description.includes('moderate')) {
      return {
        level: 'warning',
        color: 'var(--warning)',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'var(--warning)',
        label: 'WARNING',
        icon: <WarningIcon />,
        action: 'Service recommended'
      };
    }
    if (status === 'good' || description.includes('pass') || description.includes('ok')) {
      return {
        level: 'good',
        color: 'var(--positive)',
        bgColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'var(--positive)',
        label: 'OK',
        icon: <CheckCircleIcon />,
        action: 'System functioning well'
      };
    }
    return {
      level: 'unknown',
      color: 'var(--gray-500)',
      bgColor: 'var(--gray-50)',
      borderColor: 'var(--gray-300)',
      label: 'PENDING',
      icon: <InfoIcon />,
      action: 'Assessment in progress'
    };
  };
  
  // System category detection for better iconography
  const getSystemCategory = (title) => {
    const t = String(title || '').toLowerCase();
    if (t.includes('engine') || t.includes('motor')) return { icon: <SpeedIcon />, category: 'Powertrain' };
    if (t.includes('brake') || t.includes('braking')) return { icon: <SecurityIcon />, category: 'Safety' };
    if (t.includes('suspension') || t.includes('steering')) return { icon: <BuildIcon />, category: 'Chassis' };
    if (t.includes('electrical') || t.includes('battery')) return { icon: <BuildIcon />, category: 'Electrical' };
    if (t.includes('emission') || t.includes('exhaust')) return { icon: <WarningIcon />, category: 'Emissions' };
    if (t.includes('tyre') || t.includes('tire') || t.includes('wheel')) return { icon: <SpeedIcon />, category: 'Wheels' };
    return { icon: <InfoIcon />, category: 'System' };
  };
  
  const diagnostic = getDiagnosticStatus(card);
  const systemInfo = getSystemCategory(card.title);
  
  return (
    <VisualInsightCard key={`system-${index}`} variant="status" status={card.status || 'unknown'}>
      {/* Diagnostic Header with Status Indicator */}
      <Box style={{
        borderLeft: `4px solid ${diagnostic.borderColor}`,
        paddingLeft: 'var(--space-md)',
        marginBottom: 'var(--space-md)'
      }}>
        <CardHeader style={{ marginBottom: 'var(--space-sm)' }}>
          <Box style={{ flex: 1 }}>
            <CardTitle>{card.title || `System ${index + 1}`}</CardTitle>
            <BodyText style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--gray-500)',
              marginTop: '2px'
            }}>
              {systemInfo.category}
            </BodyText>
          </Box>
          <CardIcon color={diagnostic.color}>
            {systemInfo.icon}
          </CardIcon>
        </CardHeader>
        
        {/* Diagnostic Status Display */}
        <Box style={{
          background: diagnostic.bgColor,
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${diagnostic.borderColor}`,
          marginBottom: 'var(--space-md)'
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-sm)'
          }}>
            <EnhancedStatusBadge status={card.status || 'unknown'} size="large">
              {diagnostic.icon}
              {diagnostic.label}
            </EnhancedStatusBadge>
            
            {/* Diagnostic Code/ID (if available) */}
            <BodyText style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--gray-500)',
              fontFamily: 'monospace',
              background: 'var(--white)',
              padding: '2px 6px',
              borderRadius: '3px'
            }}>
              SYS-{String(index + 1).padStart(3, '0')}
            </BodyText>
          </Box>
          
          <BodyText style={{
            fontSize: 'var(--text-xs)',
            color: diagnostic.color,
            fontWeight: '500'
          }}>
            {diagnostic.action}
          </BodyText>
        </Box>
      </Box>
      
      {/* System Description/Details */}
      <MetricSubtext style={{ 
        lineHeight: 1.5,
        marginBottom: 'var(--space-md)'
      }}>
        {card.description || 'System assessment data not available'}
      </MetricSubtext>
      
      {/* Technical Indicators */}
      <Box style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'var(--space-sm)',
        borderTop: '1px solid var(--gray-100)',
        marginTop: 'auto'
      }}>
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)'
        }}>
          <AssessmentIcon style={{ fontSize: '14px', color: 'var(--gray-400)' }} />
          <BodyText style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--gray-500)'
          }}>
            Diagnostic scan
          </BodyText>
        </Box>
        
        {/* Performance Indicator */}
        <Box style={{
          width: '40px',
          height: '6px',
          background: 'var(--gray-200)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <Box style={{
            width: diagnostic.level === 'good' ? '100%' : diagnostic.level === 'warning' ? '60%' : '30%',
            height: '100%',
            background: diagnostic.color,
            transition: 'width 0.6s ease'
          }} />
        </Box>
      </Box>
    </VisualInsightCard>
  );
};

const renderRiskFactorCards = (factors) => {
  if (!factors?.length) return [];
  
  // Determine severity based on content keywords
  const getSeverity = (factor) => {
    const text = String(factor).toLowerCase();
    if (text.includes('critical') || text.includes('urgent') || text.includes('danger') || text.includes('fail')) {
      return { level: 'critical', color: 'var(--negative)', badge: 'Critical', icon: <ErrorIcon /> };
    }
    if (text.includes('high') || text.includes('severe') || text.includes('major')) {
      return { level: 'high', color: 'var(--negative)', badge: 'High Risk', icon: <PriorityHighIcon /> };
    }
    if (text.includes('moderate') || text.includes('medium') || text.includes('concern')) {
      return { level: 'moderate', color: 'var(--warning)', badge: 'Moderate', icon: <WarningIcon /> };
    }
    return { level: 'low', color: 'var(--warning)', badge: 'Monitor', icon: <ReportProblemIcon /> };
  };
  
  return factors.slice(0, 6).map((factor, index) => {
    const severity = getSeverity(factor);
    
    return (
      <VisualInsightCard key={`risk-${index}`} variant="status" status="warning">
        <CardHeader>
          <CardTitle>Risk Factor {index + 1}</CardTitle>
          <CardIcon color={severity.color}>
            <SecurityIcon />
          </CardIcon>
        </CardHeader>
        
        {/* Severity Badge with Icon */}
        <Box style={{ marginBottom: 'var(--space-md)' }}>
          <EnhancedStatusBadge status="warning" size="large">
            {severity.icon}
            {severity.badge}
          </EnhancedStatusBadge>
        </Box>
        
        {/* Risk Description */}
        <MetricSubtext style={{ 
          lineHeight: 1.6, 
          marginBottom: 'var(--space-sm)',
          fontWeight: '400',
          color: 'var(--gray-700)'
        }}>
          {String(factor).slice(0, 180)}{String(factor).length > 180 ? '...' : ''}
        </MetricSubtext>
        
        {/* Impact Indicator */}
        <Box style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-xs)',
          marginTop: 'auto',
          paddingTop: 'var(--space-sm)',
          borderTop: '1px solid var(--gray-100)'
        }}>
          <WarningIcon style={{ fontSize: '14px', color: severity.color }} />
          <BodyText style={{ 
            fontSize: 'var(--text-xs)', 
            color: severity.color,
            fontWeight: '500'
          }}>
            Requires attention
          </BodyText>
        </Box>
      </VisualInsightCard>
    );
  });
};

const renderPositiveFactorCards = (factors) => {
  if (!factors?.length) return [];
  
  // Determine strength level based on content
  const getStrength = (factor) => {
    const text = String(factor).toLowerCase();
    if (text.includes('excellent') || text.includes('outstanding') || text.includes('exceptional')) {
      return { level: 'excellent', color: 'var(--positive)', badge: 'Excellent', icon: <EmojiEventsIcon /> };
    }
    if (text.includes('good') || text.includes('well maintained') || text.includes('reliable')) {
      return { level: 'good', color: 'var(--positive)', badge: 'Good', icon: <VerifiedIcon /> };
    }
    if (text.includes('maintained') || text.includes('serviced') || text.includes('updated')) {
      return { level: 'maintained', color: 'var(--positive)', badge: 'Maintained', icon: <CheckCircleIcon /> };
    }
    return { level: 'positive', color: 'var(--positive)', badge: 'Positive', icon: <StarIcon /> };
  };
  
  return factors.slice(0, 6).map((factor, index) => {
    const strength = getStrength(factor);
    
    return (
      <VisualInsightCard key={`positive-${index}`} variant="status" status="good">
        <CardHeader>
          <CardTitle>Strength {index + 1}</CardTitle>
          <CardIcon color={strength.color}>
            <ShieldIcon />
          </CardIcon>
        </CardHeader>
        
        {/* Achievement Badge */}
        <Box style={{ marginBottom: 'var(--space-md)' }}>
          <EnhancedStatusBadge status="good" size="large">
            {strength.icon}
            {strength.badge}
          </EnhancedStatusBadge>
        </Box>
        
        {/* Strength Description */}
        <MetricSubtext style={{ 
          lineHeight: 1.6, 
          marginBottom: 'var(--space-sm)',
          fontWeight: '400',
          color: 'var(--gray-700)'
        }}>
          {String(factor).slice(0, 180)}{String(factor).length > 180 ? '...' : ''}
        </MetricSubtext>
        
        {/* Confidence Indicator */}
        <Box style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-xs)',
          marginTop: 'auto',
          paddingTop: 'var(--space-sm)',
          borderTop: '1px solid var(--gray-100)'
        }}>
          <CheckCircleIcon style={{ fontSize: '14px', color: strength.color }} />
          <BodyText style={{ 
            fontSize: 'var(--text-xs)', 
            color: strength.color,
            fontWeight: '500'
          }}>
            Reliable indicator
          </BodyText>
        </Box>
      </VisualInsightCard>
    );
  });
};


const VehicleAnalysisComponent = ({ registration, vehicleData, onDataLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);

  // Enhanced Detailed Section Cards with rich information hierarchies
  const renderDetailedSectionCards = useCallback((sections) => {
    if (!sections?.length) return [];
    
    // Enhanced section type detection with better categorization
    const getSectionCategory = (section) => {
      const title = String(section.title || '').toLowerCase();
      const contentSample = section.content?.slice(0, 3).map(c => String(c?.text || c || '')).join(' ').toLowerCase() || '';
      
      if (title.includes('safety') || contentSample.includes('safety') || contentSample.includes('airbag')) {
        return { type: 'safety', icon: <SecurityIcon />, color: 'var(--negative)', label: 'Safety Critical' };
      }
      if (title.includes('maintenance') || contentSample.includes('service') || contentSample.includes('maintenance')) {
        return { type: 'maintenance', icon: <BuildIcon />, color: 'var(--warning)', label: 'Maintenance' };
      }
      if (title.includes('engine') || title.includes('performance') || contentSample.includes('engine')) {
        return { type: 'performance', icon: <SpeedIcon />, color: 'var(--primary)', label: 'Performance' };
      }
      if (title.includes('electrical') || contentSample.includes('electrical') || contentSample.includes('battery')) {
        return { type: 'electrical', icon: <BuildIcon />, color: 'var(--primary)', label: 'Electrical' };
      }
      return { type: 'technical', icon: <InfoIcon />, color: 'var(--primary)', label: 'Technical' };
    };
    
    const getContentPriority = (content) => {
      const text = String(content?.text || content || '').toLowerCase();
      if (text.includes('critical') || text.includes('urgent') || text.includes('immediate')) {
        return { level: 'high', color: 'var(--negative)', icon: <PriorityHighIcon /> };
      }
      if (text.includes('important') || text.includes('recommend') || text.includes('should')) {
        return { level: 'medium', color: 'var(--warning)', icon: <WarningIcon /> };
      }
      return { level: 'normal', color: 'var(--gray-600)', icon: <InfoIcon /> };
    };
    
    return sections
      .filter(section => section?.content?.length > 0)
      .map((section, index) => {
        const category = getSectionCategory(section);
        const isExpanded = expandedSections.has(index);
        const previewCount = 3;
        const hasMoreContent = section.content.length > previewCount;
        
        return (
          <VisualInsightCard key={`section-${index}`} variant="status" status={category.type}>
            <CardHeader>
              <Box style={{ flex: 1 }}>
                <CardTitle>{section.title || `Section ${index + 1}`}</CardTitle>
                <Box style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-xs)',
                  marginTop: 'var(--space-xs)'
                }}>
                  <EnhancedStatusBadge status={category.type} size="medium">
                    {category.icon}
                    {category.label}
                  </EnhancedStatusBadge>
                  <BodyText style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--gray-500)'
                  }}>
                    {section.content.length} items
                  </BodyText>
                </Box>
              </Box>
              <CardIcon color={category.color}>
                {category.icon}
              </CardIcon>
            </CardHeader>
            
            {/* Content Preview */}
            <Box style={{ marginBottom: 'var(--space-md)' }}>
              <MetricSubtext style={{ marginBottom: 'var(--space-sm)' }}>
                {(section.type && CONFIG.SECTION_DESCRIPTIONS[section.type]) || 'Detailed technical information and findings'}
              </MetricSubtext>
            </Box>
            
            {/* Top Findings Preview */}
            <Box style={{ 
              background: 'var(--gray-50)', 
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-md)'
            }}>
              <BodyText style={{
                fontSize: 'var(--text-xs)',
                fontWeight: '600',
                color: 'var(--gray-700)',
                marginBottom: 'var(--space-sm)'
              }}>
                Key Findings:
              </BodyText>
              
              {section.content.slice(0, isExpanded ? section.content.length : previewCount).map((content, contentIndex) => {
                const contentText = content?.text || String(content || '');
                const priority = getContentPriority(content);
                if (!contentText.trim()) return null;
                
                return (
                  <Box key={`content-${contentIndex}`} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-sm)',
                    paddingBottom: 'var(--space-sm)',
                    borderBottom: contentIndex < (isExpanded ? section.content.length - 1 : Math.min(previewCount - 1, section.content.length - 1)) ? '1px solid var(--gray-200)' : 'none'
                  }}>
                    <Box style={{ marginTop: '2px', flexShrink: 0 }}>
                      {React.cloneElement(priority.icon, {
                        style: { fontSize: '12px', color: priority.color }
                      })}
                    </Box>
                    <BodyText style={{
                      fontSize: 'var(--text-xs)',
                      lineHeight: 1.4,
                      color: 'var(--gray-700)',
                      flex: 1
                    }}>
                      {contentText.slice(0, isExpanded ? 300 : 120)}
                      {contentText.length > (isExpanded ? 300 : 120) ? '...' : ''}
                    </BodyText>
                  </Box>
                );
              }).filter(Boolean)}
            </Box>
            
            {/* Expand/Collapse Toggle */}
            {hasMoreContent && (
              <Box 
                onClick={() => toggleSection(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm)',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: '1px solid var(--gray-200)',
                  transition: 'all 0.2s ease',
                  marginTop: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--gray-100)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--gray-50)';
                }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                <BodyText style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: '500',
                  color: 'var(--primary)'
                }}>
                  {isExpanded ? 'Show less' : `View all ${section.content.length} details`}
                </BodyText>
              </Box>
            )}
          </VisualInsightCard>
        );
      });
  }, [expandedSections, toggleSection]);

  // Simplified API fetch
  const fetchAnalysisFromApi = useCallback(async () => {
    if (!registration) {
      setError("Vehicle registration is required");
      setLoading(false);
      return;
    }

    const normalizedReg = registration.toUpperCase().trim();
    
    // Check cache first
    const cachedData = browserCache.getFromCache(normalizedReg);
    if (cachedData) {
      setAnalysis(cachedData);
      setLoading(false);
      onDataLoad?.(cachedData);
      return;
    }

    // Abort previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/vehicle-analysis/${normalizedReg}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Vehicle information not found' : 'Service error');
      }
      
      const data = await response.json();
      retryCountRef.current = 0;
      setAnalysis(data);
      browserCache.saveToCache(normalizedReg, data);
      onDataLoad?.(data);
      
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      if (err.message.includes('network') && retryCountRef.current < 2) {
        retryCountRef.current++;
        setTimeout(fetchAnalysisFromApi, retryCountRef.current * 1000);
        return;
      }
      
      setError(getErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  }, [registration, onDataLoad]);

  useEffect(() => {
    if (registration) fetchAnalysisFromApi();
    return () => abortControllerRef.current?.abort();
  }, [registration, fetchAnalysisFromApi]);

  // Clean data processing
  const analysisData = useMemo(() => {
    if (!analysis?.analysis) {
      return { sections: [], tables: [], summary: null, metrics: [] };
    }
    
    const parsed = parseMarkdownAnalysis(analysis.analysis);
    const metrics = generateSummaryMetrics(parsed);
    
    return { ...parsed, metrics };
  }, [analysis?.analysis]);

  // Early returns for loading/error states
  if (loading) {
    return (
      <VisualInsightsContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <HeadingM style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>
            Loading Vehicle Analysis
          </HeadingM>
          <BodyText>We're analyzing your vehicle data to provide detailed insights...</BodyText>
        </LoadingContainer>
      </VisualInsightsContainer>
    );
  }

  if (error) {
    return (
      <VisualInsightsContainer>
        <ErrorContainer>
          <WarningIcon style={{ fontSize: 60, color: 'var(--negative)' }} />
          <HeadingM style={{ marginBottom: 'var(--space-sm)' }}>Analysis Unavailable</HeadingM>
          <BodyText style={{ marginBottom: 'var(--space-lg)' }}>{error}</BodyText>
          <button 
            onClick={fetchAnalysisFromApi}
            style={{
              background: 'var(--negative)', color: 'var(--white)', border: 'none',
              padding: 'var(--space-md) var(--space-xl)', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-main)'
            }}
          >
            Try again
          </button>
        </ErrorContainer>
      </VisualInsightsContainer>
    );
  }

  if (!analysis) {
    return (
      <VisualInsightsContainer>
        <ErrorContainer>
          <InfoIcon style={{ fontSize: 60, color: 'var(--primary)' }} />
          <HeadingM style={{ marginBottom: 'var(--space-sm)' }}>No Analysis Available</HeadingM>
          <BodyText>The requested vehicle analysis cannot be displayed at this time.</BodyText>
        </ErrorContainer>
      </VisualInsightsContainer>
    );
  }

  // Main render
  const vehicleInfo = analysis?.make && analysis?.model 
    ? `${analysis.make} ${analysis.model}`
    : vehicleData?.make !== 'Unknown' 
      ? `${vehicleData?.make || 'Unknown'} ${vehicleData?.model || 'Vehicle'}`
      : registration || 'this vehicle';

  return (
    <VisualInsightsContainer>
      {/* Header */}
      <InsightCategoryHeader>
        <CategoryIcon color="var(--primary)"><AssessmentIcon /></CategoryIcon>
        <Box>
          <HeadingM style={{ margin: 0 }}>Vehicle Analysis Report</HeadingM>
          <BodyText style={{ margin: 0, marginTop: '4px' }}>
            Comprehensive analysis for {vehicleInfo}
            {analysis?.timestamp && (
              <><br />Analysis generated: {new Date(analysis.timestamp * 1000).toLocaleDateString('en-GB')}</>
            )}
          </BodyText>
        </Box>
      </InsightCategoryHeader>

      {/* All Analysis Content in Card Grid Format */}
      <InsightGrid>
        {/* Summary Insights */}
        {analysisData.insights?.map(renderInsightCard)}
        
        {/* Enhanced System Assessment Cards */}
        {analysisData.tableCards?.map(renderEnhancedSystemCard)}
        
        {/* Enhanced Risk Factor Cards */}
        {renderRiskFactorCards(analysisData.riskFactors)}
        
        {/* Enhanced Positive Factor Cards */}
        {renderPositiveFactorCards(analysisData.positiveFactors)}
        
        {/* Enhanced Detailed Section Cards */}
        {renderDetailedSectionCards(analysisData.sections)}
      </InsightGrid>
      
      {/* Show message if no content */}
      {(!analysisData.insights?.length && !analysisData.tableCards?.length && 
        !analysisData.riskFactors?.length && !analysisData.positiveFactors?.length && 
        !analysisData.sections?.length) && (
        <EnhancedInsightNote variant="info">
          <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          No analysis content is available for this vehicle.
        </EnhancedInsightNote>
      )}

      {/* Footer note */}
      <EnhancedInsightNote variant="info">
        <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
        This analysis is based on manufacturer data and vehicle records. 
        Individual vehicle experiences may vary based on specific usage patterns and maintenance history.
      </EnhancedInsightNote>
    </VisualInsightsContainer>
  );
};

export default React.memo(VehicleAnalysisComponent);