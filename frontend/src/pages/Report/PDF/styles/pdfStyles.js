// Optimized PDF styling configuration aligned with site-wide GOV.UK theme
const COLORS = {
  // Core GOV.UK colors (matching theme.js exactly)
  BLACK: '#0b0c0c',        // Default text
  WHITE: '#ffffff',        // Backgrounds, inverse text
  BLUE: '#1d70b8',         // Links, primary actions
  YELLOW: '#fd0',          // Focus states (matches theme.js #fd0 instead of #ffdd00)
  RED: '#d4351c',          // Errors, warnings
  GREEN: '#00703c',        // Success, primary buttons
  LIGHT_GREY: '#f3f2f1',   // Backgrounds
  MID_GREY: '#b1b4b6',     // Borders, secondary text
  DARK_GREY: '#505a5f',    // Muted text
  LINK_HOVER: '#003078',   // Link hover
  GREEN_HOVER: '#005a30',  // Button hover
  GREEN_DARK: '#002d18',   // Button shadow
  PURPLE: '#4c2c92',       // Visited links
  PRINT_TEXT: '#000000',   // Pure black for print
};

// GOV.UK typography settings (aligned with theme.js)
const TYPOGRAPHY = {
  weights: {
    regular: 400,
    bold: 700,
  },
  sizes: {
    caption: 16,    // 1rem, matches GovUKCaptionM mobile
    body: 16,       // 1rem base, scales to 1.1875rem (19px) on mobile
    bodyLarge: 19,  // 1.1875rem for mobile
    h4: 16,         // 1rem base, scales to 1.1875rem (19px) on mobile
    h3: 20,         // 1.25rem base, scales to 1.5rem (24px) on mobile
    h2: 24,         // 1.5rem base, scales to 2.25rem (36px) on mobile
    h1: 32,         // 2rem base, scales to 3rem (48px) on mobile
  },
  lineHeights: {
    caption: 1.25,           // Matches GovUKCaptionM
    body: 1.25,              // Base, scales to 1.3157894737 on mobile
    bodyLarge: 1.3157894737, // Mobile body text
    h4: 1.25,                // Base, scales to 1.3157894737 on mobile
    h3: 1.25,                // Base, scales to 1.3333333333 on mobile
    h2: 1.0416666667,        // Base, scales to 1.1111111111 on mobile
    h1: 1.09375,             // Base, scales to 1.0416666667 on mobile
  },
};

// Reusable style fragments aligned with GOV.UK spacing from theme.js
const styleFragments = {
  margins: {
    none: [0, 0, 0, 0],
    small: [0, 15, 0, 15],    // Matches GovUKBodyS margin-bottom
    medium: [0, 20, 0, 20],  // Matches mobile GovUKBody margin-bottom
    large: [0, 30, 0, 30],   // Matches GovUKHeadingL mobile margin-bottom
    paragraph: [0, 0, 0, 15], // Matches GovUKBody base margin-bottom
    section: [0, 40, 0, 25],  // Matches GovUKFooter padding adjustments
    card: [0, 0, 0, 20],     // Matches StyledCardElement margin-bottom
  },
  padding: {
    tableCell: { top: 10, right: 10, bottom: 10, left: 10 }, // Matches ReportTable
    card: { top: 15, right: 15, bottom: 15, left: 15 },      // Matches StyledCardElement
    button: { top: 8, right: 10, bottom: 7, left: 10 },      // Matches GovUKButton
  },
  borderRadius: {
    none: 0,  // GOV.UK prefers sharp corners, matches theme.js
  },
};

// Color utility with caching, aligned with theme.js color mappings
const colorUtils = (() => {
  const cache = new Map();
  return {
    getStatusColor: (status) => {
      if (!status) return COLORS.BLACK;
      const cacheKey = `status_${status}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey);
      const statusLower = String(status).toLowerCase();
      let color = statusLower.includes('not road legal') || statusLower.includes('expired')
        ? COLORS.RED
        : statusLower.includes('road legal') || statusLower.includes('valid') || statusLower === 'pass'
        ? COLORS.GREEN
        : statusLower.includes('sorn')
        ? COLORS.YELLOW
        : COLORS.BLACK;
      cache.set(cacheKey, color);
      return color;
    },
    getRiskColor: (riskLevel) => {
      if (!riskLevel) return COLORS.DARK_GREY;
      const cacheKey = `risk_${riskLevel}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey);
      const riskLower = String(riskLevel).toLowerCase();
      let color = riskLower.includes('high')
        ? COLORS.RED
        : riskLower.includes('medium') || riskLower.includes('moderate')
        ? COLORS.YELLOW
        : riskLower.includes('low')
        ? COLORS.GREEN
        : COLORS.DARK_GREY;
      cache.set(cacheKey, color);
      return color;
    },
    getQualityColor: (qualityLevel) => {
      if (!qualityLevel) return COLORS.DARK_GREY;
      const cacheKey = `quality_${qualityLevel}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey);
      const level = String(qualityLevel).toLowerCase();
      let color = level.includes('good') || level.includes('excellent')
        ? COLORS.GREEN
        : level.includes('fair') || level.includes('average')
        ? COLORS.YELLOW
        : level.includes('poor') || level.includes('bad')
        ? COLORS.RED
        : COLORS.DARK_GREY;
      cache.set(cacheKey, color);
      return color;
    },
    getUsageColor: (usageLevel) => {
      if (!usageLevel) return COLORS.DARK_GREY;
      const cacheKey = `usage_${usageLevel}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey);
      const level = String(usageLevel).toLowerCase();
      let color = level.includes('low') || level.includes('minimal')
        ? COLORS.GREEN
        : level.includes('moderate') || level.includes('average')
        ? COLORS.YELLOW
        : level.includes('heavy') || level.includes('high')
        ? COLORS.RED
        : COLORS.DARK_GREY;
      cache.set(cacheKey, color);
      return color;
    },
    getEmissionsColor: (co2Value) => {
      if (!co2Value) return COLORS.DARK_GREY;
      const cacheKey = `emissions_${co2Value}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey);
      let co2 = typeof co2Value === 'string' ? parseInt(co2Value.replace(/[^\d]/g, ''), 10) : co2Value;
      if (isNaN(co2)) return COLORS.DARK_GREY;
      let color = co2 <= 50 ? COLORS.GREEN
        : co2 <= 95 ? '#4ade80'
        : co2 <= 115 ? '#a3e635'
        : co2 <= 135 ? COLORS.YELLOW
        : co2 <= 155 ? '#fb923c'
        : co2 <= 175 ? '#f97316'
        : co2 <= 195 ? COLORS.RED
        : '#dc2626';
      cache.set(cacheKey, color);
      return color;
    },
    getRiskBackgroundColor: (riskLevel) => {
      if (!riskLevel) return COLORS.LIGHT_GREY;
      const cacheKey = `riskbg_${riskLevel}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey);
      const level = String(riskLevel).toLowerCase();
      let color = level.includes('low') ? '#f0fdf4'
        : level.includes('medium') || level.includes('moderate') ? '#fffbeb'
        : level.includes('high') ? '#fef2f2'
        : COLORS.LIGHT_GREY;
      cache.set(cacheKey, color);
      return color;
    },
    standard: {
      success: COLORS.GREEN,
      warning: COLORS.YELLOW,
      error: COLORS.RED,
      info: COLORS.BLUE,
      muted: COLORS.DARK_GREY,
      highlight: COLORS.YELLOW,
      primary: COLORS.BLUE,
      secondary: COLORS.BLACK,
      light: COLORS.WHITE,
    },
  };
})();

// Style factory functions aligned with GOV.UK and theme.js
const styleFactory = {
  createTextStyle: (props = {}) => ({
    font: TYPOGRAPHY.fontFamily,
    fontSize: props.fontSize || TYPOGRAPHY.sizes.bodyLarge, // Default to mobile size
    bold: props.bold ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.regular,
    italics: !!props.italics,
    color: props.color || COLORS.BLACK,
    alignment: props.alignment || 'left',
    margin: props.margin || styleFragments.margins.none,
    lineHeight: props.lineHeight || TYPOGRAPHY.lineHeights.bodyLarge,
    ...(props.decoration ? {
      decoration: props.decoration,
      decorationStyle: props.decorationStyle || 'solid',
      decorationColor: props.decorationColor || props.color || COLORS.BLACK,
    } : {}),
  }),
  createRect: (props = {}) => ({
    type: 'rect',
    x: props.x || 0,
    y: props.y || 0,
    w: props.width || 515, // Matches default PDF width
    h: props.height || 40,
    r: styleFragments.borderRadius.none,
    lineWidth: props.borderWidth || 0,
    lineColor: props.borderColor || COLORS.MID_GREY,
    color: props.backgroundColor || COLORS.WHITE,
  }),
  createLine: (props = {}) => ({
    type: 'line',
    x1: props.x1 || 0,
    y1: props.y1 || 0,
    x2: props.x2 || 515,
    y2: props.y2 || 0,
    lineWidth: props.lineWidth || 1,
    lineColor: props.lineColor || COLORS.MID_GREY,
  }),
  createCircle: (props = {}) => ({
    type: 'circle',
    x: props.x || 30,
    y: props.y || 30,
    r: props.radius || 25,
    lineWidth: props.borderWidth || 1,
    lineColor: props.borderColor || COLORS.BLUE,
    color: props.backgroundColor || COLORS.WHITE,
  }),
  createTableLayout: (props = {}) => ({
    hLineWidth: () => 1,
    vLineWidth: () => 1,
    hLineColor: () => COLORS.MID_GREY,
    vLineColor: () => COLORS.MID_GREY,
    paddingLeft: () => styleFragments.padding.tableCell.left,
    paddingRight: () => styleFragments.padding.tableCell.right,
    paddingTop: () => styleFragments.padding.tableCell.top,
    paddingBottom: () => styleFragments.padding.tableCell.bottom,
  }),
};

// Formatter utilities aligned with GOV.UK and theme.js
const formatters = {
  formatValue: (value, defaultText = 'Not available') =>
    value === undefined || value === null || value === '' ? defaultText : value,
  notAvailableStyle: {
    italics: true,
    color: COLORS.DARK_GREY,
  },
  formatDate: (date, options = {}) => {
    if (!date) return 'Not available';
    const defaultOptions = { day: 'numeric', month: 'numeric', year: 'numeric' };
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-GB', { ...defaultOptions, ...options });
    } catch (e) {
      return String(date);
    }
  },
};

// Optimized GOV.UK-aligned PDF styles
const pdfStyles = {
  colors: colorUtils,
  text: {
    sectionHeader: styleFactory.createTextStyle({
      fontSize: TYPOGRAPHY.sizes.h2,
      bold: true,
      margin: styleFragments.margins.section,
      color: COLORS.BLACK,
      lineHeight: TYPOGRAPHY.lineHeights.h2,
    }),
    subheader: styleFactory.createTextStyle({
      fontSize: TYPOGRAPHY.sizes.h3,
      bold: true,
      margin: styleFragments.margins.medium,
      color: COLORS.BLACK,
      lineHeight: TYPOGRAPHY.lineHeights.h3,
    }),
    warningHeader: styleFactory.createTextStyle({
      fontSize: TYPOGRAPHY.sizes.h3,
      bold: true,
      margin: styleFragments.margins.medium,
      color: COLORS.RED,
      lineHeight: TYPOGRAPHY.lineHeights.h3,
    }),
    tableHeader: styleFactory.createTextStyle({
      fontSize: TYPOGRAPHY.sizes.bodyLarge,
      bold: true,
      color: COLORS.BLACK,
      lineHeight: TYPOGRAPHY.lineHeights.bodyLarge,
    }),
    note: styleFactory.createTextStyle({
      fontSize: TYPOGRAPHY.sizes.caption,
      italics: true,
      color: COLORS.DARK_GREY,
      lineHeight: TYPOGRAPHY.lineHeights.caption,
    }),
    title: styleFactory.createTextStyle({
      fontSize: TYPOGRAPHY.sizes.h1,
      bold: true,
      alignment: 'left',
      margin: styleFragments.margins.large,
      color: COLORS.BLACK,
      lineHeight: TYPOGRAPHY.lineHeights.h1,
    }),
    subtitle: styleFactory.createTextStyle({
      fontSize: TYPOGRAPHY.sizes.h2,
      alignment: 'left',
      margin: styleFragments.margins.medium,
      color: COLORS.BLACK,
      lineHeight: TYPOGRAPHY.lineHeights.h2,
    }),
  },
  table: {
    header: {
      bold: true,
      fontSize: TYPOGRAPHY.sizes.bodyLarge,
      color: COLORS.BLACK,
      fillColor: COLORS.LIGHT_GREY,
    },
    layout: styleFactory.createTableLayout(),
    standardMargin: styleFragments.margins.paragraph,
  },
  button: {
    default: {
      padding: styleFragments.padding.button,
      backgroundColor: COLORS.GREEN,
      color: COLORS.WHITE,
      border: 'none',
      borderRadius: styleFragments.borderRadius.none,
      font: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.weights.bold,
      textAlign: 'center',
      boxShadow: `0 2px 0 ${COLORS.GREEN_DARK}`,
    },
    premium: {
      backgroundColor: COLORS.BLUE,
      boxShadow: `0 2px 0 ${COLORS.LINK_HOVER}`,
    },
    disabled: {
      opacity: 0.5,
    },
  },
  components: {
    card: (title, content, variant = 'default', props = {}) => {
      let borderColor = variant === 'success' ? COLORS.GREEN :
                       variant === 'warning' ? COLORS.YELLOW :
                       variant === 'error' ? COLORS.RED :
                       variant === 'info' ? COLORS.BLUE : COLORS.MID_GREY;
      return {
        stack: [
          {
            canvas: [
              styleFactory.createRect({
                width: 515,
                height: props.height || 80,
                backgroundColor: COLORS.LIGHT_GREY,
                borderWidth: 2, // Matches StyledCardElement
                borderColor,
              }),
            ],
          },
          {
            text: title,
            fontSize: TYPOGRAPHY.sizes.h3,
            bold: true,
            margin: [15, 15, 0, 5], // Matches StyledCardElement padding
            color: COLORS.BLACK,
            lineHeight: TYPOGRAPHY.lineHeights.h3,
          },
          ...(Array.isArray(content) ? content : [content]),
        ],
        margin: styleFragments.margins.card,
      };
    },
    registrationPlate: (registration) => ({
      stack: [
        {
          canvas: [
            styleFactory.createRect({
              width: 150,
              height: 40,
              backgroundColor: COLORS.YELLOW,
            }),
          ],
        },
        {
          text: registration.toUpperCase(),
          fontSize: 30, // Matches VehicleRegistration
          bold: true,
          alignment: 'center',
          margin: [0, -30, 0, 10],
          color: COLORS.BLACK,
        },
      ],
      margin: styleFragments.margins.medium,
    }),
    statusIndicator: (label, value, color) => ({
      stack: [
        {
          canvas: [
            styleFactory.createRect({
              width: 160,
              height: 70,
              backgroundColor: COLORS.LIGHT_GREY,
              borderWidth: 1,
              borderColor: color,
            }),
          ],
        },
        {
          text: label,
          fontSize: TYPOGRAPHY.sizes.caption,
          color: COLORS.DARK_GREY,
          margin: [10, -60, 0, 0],
          lineHeight: TYPOGRAPHY.lineHeights.caption,
        },
        {
          text: value,
          fontSize: TYPOGRAPHY.sizes.h3,
          bold: true,
          color,
          margin: [10, 5, 0, 0],
          lineHeight: TYPOGRAPHY.lineHeights.h3,
        },
      ],
    }),
    sectionHeader: (title) => [
      {
        text: title,
        style: 'sectionHeader',
      },
      {
        canvas: [
          styleFactory.createLine({
            lineColor: COLORS.MID_GREY,
          }),
        ],
        margin: [0, 5, 0, 15],
      },
    ],
  },
  footer: {
    create: (registration) => (currentPage, pageCount) => ({
      columns: [
        {
          text: registration.toUpperCase(),
          bold: true,
          fontSize: TYPOGRAPHY.sizes.caption,
          alignment: 'left',
          margin: [40, 0, 0, 0],
          color: COLORS.BLACK,
          lineHeight: TYPOGRAPHY.lineHeights.caption,
        },
        {
          text: `Generated: ${formatters.formatDate(new Date(), { hour: '2-digit', minute: '2-digit' })} | Page ${currentPage} of ${pageCount}`,
          fontSize: TYPOGRAPHY.sizes.caption,
          alignment: 'right',
          margin: [0, 0, 40, 0],
          color: COLORS.DARK_GREY,
          lineHeight: TYPOGRAPHY.lineHeights.caption,
        },
      ],
      margin: [40, 20, 40, 0],
    }),
  },
  formatters,
  styleFragments,
};

export default pdfStyles;