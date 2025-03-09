import { styled } from '@mui/material/styles';
import { COLORS, commonFontStyles, focusStyles, BREAKPOINTS, GovUKInsetText } from './theme'; // Adjust path to your theme file

// Chart Container
export const ChartContainer = styled('div')`
  ${commonFontStyles}
  margin-top: 20px;
  margin-bottom: 30px;
  width: 100%;
  height: 400px;
  position: relative;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-top: 30px;
    margin-bottom: 40px;
  }
`;

// Tooltip Container
export const TooltipContainer = styled('div')(({ visible }) => ({
  ...commonFontStyles,
  position: 'absolute',
  padding: '15px',
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.MID_GREY}`,
  borderLeft: `5px solid ${COLORS.MID_GREY}`, // Matches GOV.UK inset text style
  pointerEvents: 'none',
  fontSize: '1rem',
  lineHeight: '1.25',
  zIndex: 10,
  opacity: visible ? 1 : 0,
  transition: 'opacity 0.1s ease-in-out',
  '@media (min-width: 40.0625em)': {
    fontSize: '1.1875rem',
    lineHeight: '1.3157894737',
  },
}));

// Legend Container
export const Legend = styled('div')`
  ${commonFontStyles}
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0 20px 0;
  padding-left: 40px; // Aligns with chart margin
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin: 15px 0 30px 0;
  }
`;

// Legend Item
export const LegendItem = styled('div')`
  ${commonFontStyles}
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 5px;
  font-size: 1rem;
  line-height: 1.25;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    margin-right: 20px;
  }
`;

// Legend Marker
export const LegendMarker = styled('div')(({ color, shape }) => ({
  width: '14px',
  height: '14px',
  backgroundColor: color,
  marginRight: '6px',
  borderRadius: shape === 'circle' ? '50%' : 
               shape === 'triangle' ? '0' : 
               '0',
  transform: shape === 'triangle' ? 'rotate(45deg)' : 'none',
}));

// Legend Line
export const LegendLine = styled('div')(({ dashed }) => ({
  width: '20px',
  height: '2px',
  backgroundColor: COLORS.BLUE,
  marginRight: '6px',
  borderTop: dashed ? `2px dashed ${COLORS.BLUE}` : 'none',
}));

// Info Box
export const InfoBox = styled(GovUKInsetText)`
  margin-top: 20px;
  margin-bottom: 20px;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    margin-top: 30px;
    margin-bottom: 30px;
  }
`;

// Zoom Reset Button
export const ZoomResetButton = styled('button')`
  ${commonFontStyles}
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 10px;
  background-color: ${COLORS.WHITE};
  border: 2px solid ${COLORS.BLACK};
  color: ${COLORS.BLACK};
  box-shadow: 0 2px 0 ${COLORS.DARK_GREY};
  font-size: 1rem;
  line-height: 1.25;
  cursor: pointer;
  z-index: 20;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    padding: 8px 10px 7px;
  }
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    ${focusStyles}
    outline-offset: 0;
  }
`;

// Loading Spinner
export const LoadingSpinner = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  &:after {
    content: "";
    width: 40px;
    height: 40px;
    border: 5px solid ${COLORS.LIGHT_GREY};
    border-top: 5px solid ${COLORS.BLUE};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Error Message
export const ErrorMessage = styled(GovUKInsetText)`
  border-left: 5px solid ${COLORS.RED};
  padding: 15px;
  margin: 20px 0;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px;
    margin: 30px 0;
  }
`;