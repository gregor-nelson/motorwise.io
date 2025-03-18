import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import { BREAKPOINTS, COLORS } from '../../../styles/theme';

// Technical Specifications Panel styling
export const TechnicalSpecificationsPanel = styled(Paper)(({ theme }) => ({
  borderLeft: `5px solid ${COLORS.BLUE}`,
  padding: '15px',
  marginBottom: '20px',
  backgroundColor: COLORS.LIGHT_GREY,
  borderRadius: 0,
  boxShadow: 'none',
  
  [`@media (min-width: ${BREAKPOINTS.MOBILE})`]: {
    padding: '20px',
    marginBottom: '30px',
  }
}));

// Specification table styling
export const SpecificationTable = styled('table')(({ theme }) => ({
  marginBottom: '20px',
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '16px',
  
  '& th': {
    width: '40%',
    fontWeight: 700,
    padding: '10px 20px 10px 0',
    textAlign: 'left',
    borderBottom: `1px solid ${COLORS.MID_GREY}`,
    color: COLORS.BLACK,
  },
  
  '& td': {
    width: '60%',
    padding: '10px 20px 10px 0',
    borderBottom: `1px solid ${COLORS.MID_GREY}`,
    color: COLORS.BLACK,
  },

  '& tr:last-child th, & tr:last-child td': {
    borderBottom: `2px solid ${COLORS.BLACK}`,
  },

  '& tr:first-child th, & tr:first-child td': {
    borderTop: `2px solid ${COLORS.BLACK}`,
  }
}));

// Styled Tab Panel component
export const TabPanel = styled(Box)(({ theme }) => ({
  padding: '30px 0',
}));

// Main Tabs (top level)
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${COLORS.MID_GREY}`,
  
  '& .MuiTabs-indicator': {
    backgroundColor: COLORS.BLUE,
    height: '5px',
  },
  
  '& .MuiTabs-flexContainer': {
    borderBottom: `2px solid ${COLORS.MID_GREY}`,
  }
}));

// Main Tab (top level)
export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '16px',
  color: COLORS.BLACK,
  padding: '15px 20px',
  minHeight: '60px',
  
  '&.Mui-selected': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY,
  },
  
  '&:hover': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY,
    opacity: 0.9,
  },
  
  '&:focus': {
    outline: `3px solid ${COLORS.FOCUS}`,
    outlineOffset: 0,
  }
}));

// Nested Tabs (second level)
export const NestedStyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${COLORS.MID_GREY}`,
  minHeight: '50px',
  
  '& .MuiTabs-indicator': {
    backgroundColor: COLORS.BLUE,
    height: '3px',
  },
  
  '& .MuiTabs-flexContainer': {
    borderBottom: `1px solid ${COLORS.MID_GREY}`,
  }
}));

// Nested Tab (second level)
export const NestedStyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  color: COLORS.BLACK,
  padding: '10px 15px',
  minHeight: '50px',
  
  '&.Mui-selected': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY,
  },
  
  '&:hover': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY,
    opacity: 0.9,
  },
  
  '&:focus': {
    outline: `3px solid ${COLORS.FOCUS}`,
    outlineOffset: 0,
  }
}));

// Section Header
export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: `2px solid ${COLORS.BLUE}`,
  paddingBottom: '10px',
  
  '& svg': {
    marginRight: '10px',
    color: COLORS.BLUE,
  }
}));

// Section Container
export const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
  
  '&:last-child': {
    marginBottom: 0,
  }
}));

// Action Bar
export const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: '20px',
  gap: '15px',
  
  '& a': {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 400,
    textDecoration: 'underline',
    color: COLORS.BLUE,
    
    '&:hover': {
      color: COLORS.DARK_GREY,
      textDecoration: 'underline',
    },
    
    '&:focus': {
      outline: `3px solid ${COLORS.FOCUS}`,
      outlineOffset: 3,
      backgroundColor: COLORS.FOCUS,
      color: COLORS.BLACK,
      textDecoration: 'none',
    },
    
    '& svg': {
      marginRight: '5px',
    }
  }
}));

// Warning panel
export const WarningPanel = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.LIGHT_GREY,
  padding: '15px',
  marginBottom: '20px',
  borderLeft: `5px solid ${COLORS.RED}`,
  
  '& svg': {
    marginRight: '10px',
    color: COLORS.RED,
    verticalAlign: 'middle',
  }
}));

// Info panel
export const InfoPanel = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.LIGHT_GREY,
  padding: '15px',
  marginBottom: '20px',
  borderLeft: `5px solid ${COLORS.BLUE}`,
  
  '& svg': {
    marginRight: '10px',
    color: COLORS.BLUE,
    verticalAlign: 'middle',
  }
}));

// Highlight value
export const StyledValueHighlight = styled('span')(({ theme }) => ({
  fontWeight: 700,
  color: COLORS.BLUE,
}));

// Styled fact list
export const StyledFactorList = styled('ul')(({ theme }) => ({
  listStyleType: 'none',
  padding: 0,
  margin: '15px 0',
}));

// Styled fact item
export const StyledFactorItem = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '10px',
  
  '& svg': {
    marginRight: '10px',
    marginTop: '3px',
    color: COLORS.BLUE,
    flexShrink: 0,
  },
  
  '& span': {
    flex: 1,
  }
}));

// Footer note
export const StyledFooterNote = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.LIGHT_GREY,
  padding: '15px',
  marginTop: '30px',
  borderTop: `5px solid ${COLORS.BLUE}`,
  fontSize: '16px',
  
  '& svg': {
    marginRight: '10px',
    color: COLORS.BLUE,
    verticalAlign: 'middle',
  }
}));

// Tab Panel props accessor function
export function a11yProps(index) {
  return {
    id: `main-tab-${index}`,
    'aria-controls': `main-tabpanel-${index}`,
  };
}

// Nested Tab Panel props accessor function
export function nestedA11yProps(index) {
  return {
    id: `nested-tab-${index}`,
    'aria-controls': `nested-tabpanel-${index}`,
  };
}

// Main Tab Panel function component
export function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`main-tabpanel-${index}`}
      aria-labelledby={`main-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </TabPanel>
  );
}

// Nested Tab Panel component for inner tabbed content
export function NestedTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`nested-tabpanel-${index}`}
      aria-labelledby={`nested-tab-${index}`}
      {...other}
      sx={{ pt: 2 }}
    >
      {value === index && children}
    </Box>
  );
}