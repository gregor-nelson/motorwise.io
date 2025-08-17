import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';

// Import Material-UI icons
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';
import ShieldIcon from '@mui/icons-material/Shield';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import VerifiedIcon from '@mui/icons-material/Verified';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Import EXACT styled components from DVLA Insights
import {
  VisualInsightsContainer,
  InsightCategoryHeader,
  CategoryIcon,
  InsightGrid,
  VisualInsightCard,
  CardHeader,
  CardTitle,
  CardIcon,
  MetricValue,
  MetricUnit,
  MetricSubtext,
  EnhancedStatusBadge,
  GaugeContainer,
  GaugeSvg,
  GaugeTrack,
  GaugeFill,
  GaugeCenterText,
  VisualDivider,
  EnhancedInsightNote,
  EnhancedFactorList,
  HeadingM,
  BodyText,
  LoadingContainer,
  LoadingSpinner,
  ErrorContainer
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
  },
  
  STATUS_PATTERNS: {
    good: { regex: /✓|✅|🟢|good|ok|pass|low|acceptable|fine|satisfactory|adequate/i, color: 'var(--positive)', icon: <CheckCircleIcon /> },
    warning: { regex: /⚠️|🟡|⚠|warning|medium|moderate|caution|amber|attention|concern/i, color: 'var(--warning)', icon: <WarningIcon /> },
    critical: { regex: /❌|✗|🔴|❗|critical|high|fail|urgent|severe|red|danger|poor|bad/i, color: 'var(--negative)', icon: <ErrorIcon /> },
    info: { regex: /info|note|review|pending|unknown/i, color: 'var(--primary)', icon: <InfoIcon /> }
  },
  
  SYSTEM_ICONS: {
    engine: <SpeedIcon />, brake: <SecurityIcon />, suspension: <BuildIcon />, safety: <SecurityIcon />,
    tyre: <SpeedIcon />, exhaust: <WarningIcon />, electrical: <BuildIcon />, fluid: <BuildIcon />
  },
  
  SECTION_TYPES: {
    risk: { icon: <SecurityIcon />, color: 'var(--warning)' },
    findings: { icon: <AssessmentIcon />, color: 'var(--primary)' },
    systems: { icon: <BuildIcon />, color: 'var(--primary)' },
    safety: { icon: <SecurityIcon />, color: 'var(--negative)' },
    general: { icon: <InfoIcon />, color: 'var(--primary)' }
  },
  
  SECTION_DESCRIPTIONS: {
    risk: 'Risk factors and assessment details',
    findings: 'Key findings and analysis points',
    systems: 'System-specific technical information',
    issues: 'Known issues and problem patterns',
    maintenance: 'Maintenance and service considerations',
    safety: 'Safety-related information',
    reliability: 'Reliability and performance data',
    general: 'Technical details and considerations'
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

const detectStatusFromText = (text) => {
  const combined = String(text || '').toLowerCase();
  for (const [status, config] of Object.entries(CONFIG.STATUS_PATTERNS)) {
    if (config.regex.test(combined)) {
      return { status, text: status.charAt(0).toUpperCase() + status.slice(1), ...config };
    }
  }
  return { status: 'unknown', text: 'Unknown', icon: <InfoIcon />, color: 'var(--primary)' };
};

const getSystemIcon = (text) => {
  const t = String(text || '').toLowerCase();
  return Object.entries(CONFIG.SYSTEM_ICONS).find(([keyword]) => t.includes(keyword))?.[1] || <InfoIcon />;
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

// Gauge component
const Gauge = ({ value, max = 100, unit = '', label = 'Metric', color = 'var(--primary)', size = 140 }) => {
  const numValue = parseFloat(value) || 0;
  const numMax = parseFloat(max) || 100;
  const percentage = Math.min(Math.max((numValue / numMax) * 100, 0), 100);
  const radius = Math.max((size - 24) / 2, 10);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <Box>
      <GaugeContainer style={{ width: size, height: size }}>
        <GaugeSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <GaugeTrack cx={size/2} cy={size/2} r={radius} />
          <GaugeFill 
            cx={size/2} cy={size/2} r={radius} color={color}
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          />
        </GaugeSvg>
        <GaugeCenterText>
          <MetricValue size="medium">{Math.round(numValue)}</MetricValue>
          <MetricSubtext>{unit}</MetricSubtext>
        </GaugeCenterText>
      </GaugeContainer>
      <CardTitle>{label}</CardTitle>
    </Box>
  );
};

// Streamlined table parser
const parseMarkdownTable = (tableText) => {
  if (!tableText?.trim()) return null;
  
  return safeProcess(() => {
    const lines = tableText.split('\n')
      .filter(line => line.includes('|') && line.trim())
      .filter(line => !line.match(/^\|\s*[-:]+\s*\|/)); // Skip separator lines
    
    if (lines.length < 2) return null;
    
    const headerLine = lines[0];
    const headers = headerLine.split('|')
      .map(h => h.trim())
      .filter(h => h && !h.match(/^-+$/));
    
    if (headers.length === 0) return null;
    
    const rows = lines.slice(1).map(line => {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      const row = {};
      
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_') || `col_${index + 1}`;
        row[normalizedHeader] = cells[index] || '';
      });
      
      return Object.values(row).some(Boolean) ? row : null;
    }).filter(Boolean);
    
    return rows.length > 0 ? { headers, rows, columnCount: headers.length, rowCount: rows.length } : null;
  }, null);
};

// Streamlined table-to-cards converter
const tableRowsToCards = (tableData) => {
  if (!tableData?.rows?.length) return [];
  
  return safeProcess(() => {
    const headers = tableData.headers || [];
    
    const getColumnPurpose = (header, index) => {
      const h = String(header || '').toLowerCase();
      if (index === 0 || h.includes('system') || h.includes('component')) return 'identifier';
      if (h.includes('status') || h.includes('risk') || h.includes('condition')) return 'status';
      if (h.includes('priority') || h.includes('urgency')) return 'priority';
      if (index === headers.length - 1 || h.includes('description') || h.includes('note')) return 'description';
      return 'additional';
    };
    
    const columnMap = headers.map((header, index) => ({
      header,
      purpose: getColumnPurpose(header, index),
      key: header.toLowerCase().replace(/[^a-z0-9]/g, '_') || `col_${index + 1}`
    }));
    
    return tableData.rows.map((row, rowIndex) => {
      const identifierCol = columnMap.find(c => c.purpose === 'identifier');
      const statusCol = columnMap.find(c => c.purpose === 'status');
      const descriptionCol = columnMap.find(c => c.purpose === 'description');
      
      const identifier = row[identifierCol?.key] || Object.values(row)[0] || `Item ${rowIndex + 1}`;
      const statusValue = row[statusCol?.key] || '';
      const description = row[descriptionCol?.key] || Object.values(row).slice(-1)[0] || '';
      
      const detectedStatus = detectStatusFromText(statusValue);
      
      return {
        type: 'system_assessment',
        title: String(identifier).trim(),
        status: detectedStatus.status,
        statusText: detectedStatus.text,
        statusIcon: detectedStatus.icon,
        systemIcon: getSystemIcon(identifier),
        description: String(description).trim(),
        color: detectedStatus.color,
        variant: 'status'
      };
    }).filter(Boolean);
  }, []);
};

// Streamlined markdown analyzer
const analyzeMarkdownForInsights = (markdownText) => {
  if (!markdownText) return { insights: [], riskFactors: [], positiveFactors: [], sections: [], tableCards: [] };
  
  return safeProcess(() => {
    // Extract tables
    const tables = [];
    let processedText = markdownText;
    const tableRegex = /\|[^\n]*\|[\s\S]*?(?=\n\s*\n|\n\s*##|$)/g;
    
    let match;
    while ((match = tableRegex.exec(markdownText)) !== null) {
      const tableText = match[0].trim();
      const tableData = parseMarkdownTable(tableText);
      
      if (tableData?.rows?.length > 0) {
        tables.push(tableData);
        processedText = processedText.replace(tableText, `__TABLE_${tables.length - 1}__`);
      }
    }
    
    // Process content
    const lines = processedText.split('\n');
    const insights = [];
    const riskFactors = [];
    const positiveFactors = [];
    const sections = [];
    const tableCards = [];
    
    let currentSection = null;
    const metrics = { issueCount: 0, safetyCount: 0 };
    
    const detectSectionType = (title) => {
      const t = title.toLowerCase();
      return Object.entries(CONFIG.SECTION_TYPES).find(([key]) => t.includes(key))?.[1] || CONFIG.SECTION_TYPES.general;
    };
    
    const classifyContent = (text) => {
      const t = text.toLowerCase();
      if (t.includes('risk') || t.includes('danger') || t.includes('warning')) {
        metrics.issueCount++;
        return 'risk';
      }
      if (t.includes('good') || t.includes('excellent') || t.includes('maintained')) return 'positive';
      if (t.includes('safety') || t.includes('critical')) {
        metrics.safetyCount++;
        return 'safety';
      }
      return 'general';
    };
    
    lines.forEach(line => {
      const originalLine = line.trim();
      
      // Handle table placeholders
      if (originalLine.startsWith('__TABLE_')) {
        const tableIndex = parseInt(originalLine.match(/\d+/)[0]);
        if (tables[tableIndex]) {
          tableCards.push(...tableRowsToCards(tables[tableIndex]));
        }
        return;
      }
      
      // Headers
      if (originalLine.match(/^#+\s+/)) {
        if (currentSection) sections.push(currentSection);
        
        const title = originalLine.replace(/^#+\s*/, '');
        const sectionInfo = detectSectionType(title);
        
        currentSection = { title, content: [], ...sectionInfo };
      } else if (currentSection && originalLine) {
        const classification = classifyContent(originalLine);
        
        currentSection.content.push({
          text: originalLine.replace(/^[-*]\s*/, '').replace(/\*\*/g, ''),
          classification
        });
        
        const cleanContent = originalLine.replace(/\*\*/g, '').replace(/^[-*]\s*/, '').trim();
        if (classification === 'risk' && !riskFactors.includes(cleanContent)) {
          riskFactors.push(cleanContent);
        } else if (classification === 'positive' && !positiveFactors.includes(cleanContent)) {
          positiveFactors.push(cleanContent);
        }
      }
    });
    
    if (currentSection) sections.push(currentSection);
    
    // Generate insights
    if (tableCards.length > 0) {
      const critical = tableCards.filter(c => c.status === 'critical').length;
      const warning = tableCards.filter(c => c.status === 'warning').length;
      const good = tableCards.filter(c => c.status === 'good').length;
      const total = tableCards.length;
      
      if (critical + warning > 0) {
        insights.push({
          type: 'systems_at_risk',
          title: 'Systems at Risk',
          value: critical + warning,
          unit: `of ${total}`,
          description: critical > 0 ? 'Critical attention required' : 'Moderate attention needed',
          color: critical > 0 ? 'var(--negative)' : 'var(--warning)',
          icon: <WarningIcon />,
          variant: 'status'
        });
      }
      
      if (good > 0) {
        insights.push({
          type: 'systems_good',
          title: 'Systems OK',
          value: good,
          unit: `of ${total}`,
          description: 'Systems in good condition',
          color: 'var(--positive)',
          icon: <CheckCircleIcon />,
          variant: 'status'
        });
      }
      
      const score = Math.round(Math.max(0, (1 - (critical * 3 + warning) / (total * 3)) * 100));
      insights.push({
        type: 'overall_assessment',
        title: 'Overall Assessment',
        value: score,
        unit: '/100',
        description: score > 80 ? 'Low risk profile' : score > 60 ? 'Moderate risk level' : 'Higher risk considerations',
        color: score > 80 ? 'var(--positive)' : score > 60 ? 'var(--warning)' : 'var(--negative)',
        icon: <AssessmentIcon />,
        variant: 'gauge'
      });
    } else {
      const score = Math.max(10, 90 - (metrics.issueCount * 8) - (metrics.safetyCount * 12));
      insights.push({
        type: 'technical_assessment',
        title: 'Technical Assessment',
        value: Math.round(score),
        unit: '/100',
        description: score > 80 ? 'Excellent reliability' : score > 60 ? 'Good reliability' : 'Below average reliability',
        color: score > 70 ? 'var(--positive)' : score > 50 ? 'var(--warning)' : 'var(--negative)',
        icon: <TrendingUpIcon />,
        variant: 'gauge'
      });
    }
    
    return {
      insights,
      riskFactors: riskFactors.slice(0, 6),
      positiveFactors: positiveFactors.slice(0, 6),
      sections,
      tableCards
    };
  }, { insights: [], riskFactors: [], positiveFactors: [], sections: [], tableCards: [] });
};

// Simplified VehicleAnalysisComponent - maintains all functionality with reduced complexity
// Reusable render helpers
const renderInsightCard = (insight, index) => (
  <VisualInsightCard key={`insight-${index}`} variant={insight.variant || 'status'} status={insight.type || 'unknown'}>
    {insight.variant === 'gauge' ? (
      <Gauge
        value={insight.value || 0}
        max={100}
        unit={insight.unit || ''}
        label={insight.title || 'Unknown'}
        color={insight.color || 'var(--primary)'}
      />
    ) : (
      <>
        <CardHeader>
          <CardTitle>{insight.title || 'Unknown Metric'}</CardTitle>
          <CardIcon color={insight.color || 'var(--primary)'}>
            {insight.icon || <InfoIcon />}
          </CardIcon>
        </CardHeader>
        <MetricValue size="large" color={insight.color || 'var(--primary)'}>
          {insight.value ?? 'N/A'}
          <MetricUnit>{insight.unit || ''}</MetricUnit>
        </MetricValue>
        <MetricSubtext>{insight.description || 'No description available'}</MetricSubtext>
      </>
    )}
  </VisualInsightCard>
);

// Enhanced System Assessment Cards with diagnostic-style presentation
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

// Enhanced Risk Factor Cards with sophisticated warning presentation
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

// Enhanced Positive Factor Cards with achievement-style presentation
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
  const [expandedSections, setExpandedSections] = useState(new Set());
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  
  const toggleSection = useCallback((sectionIndex) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  }, []);

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

  // Simplified data processing
  const analysisData = useMemo(() => {
    if (!analysis?.analysis) {
      return { insights: [], riskFactors: [], positiveFactors: [], sections: [], tableCards: [] };
    }
    
    return safeProcess(
      () => analyzeMarkdownForInsights(analysis.analysis),
      { insights: [], riskFactors: [], positiveFactors: [], sections: [], tableCards: [] }
    );
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