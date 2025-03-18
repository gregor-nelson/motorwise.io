import React, { useState } from 'react';
import {
  GovUKContainer,
  GovUKMainWrapper,
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  BREAKPOINTS,
} from '../../styles/theme';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';

// Import Material-UI icons
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BrakesFrontIcon from '@mui/icons-material/Build'; // Using Build as a substitute for brakes
import WarningIcon from '@mui/icons-material/Warning';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

// Import styled components


// Define GOV.UK colors
const GOV_UK_COLORS = {
  BLUE: '#1d70b8',
  BLACK: '#0b0c0c',
  WHITE: '#ffffff',
  YELLOW: '#ffdd00',
  RED: '#d4351c',
  GREEN: '#00703c',
  LIGHT_GREY: '#f3f2f1',
  MID_GREY: '#b1b4b6',
  DARK_GREY: '#505a5f',
  FOCUS: '#ffdd00'
};

// Specification table styling
const SpecificationTable = styled('table')(({ theme }) => ({
  marginBottom: '20px',
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '16px',
  
  '& th': {
    width: '40%',
    fontWeight: 700,
    padding: '10px 20px 10px 0',
    textAlign: 'left',
    borderBottom: `1px solid ${GOV_UK_COLORS.MID_GREY}`,
    color: GOV_UK_COLORS.BLACK,
  },
  
  '& td': {
    width: '60%',
    padding: '10px 20px 10px 0',
    borderBottom: `1px solid ${GOV_UK_COLORS.MID_GREY}`,
    color: GOV_UK_COLORS.BLACK,
  },

  '& tr:last-child th, & tr:last-child td': {
    borderBottom: `2px solid ${GOV_UK_COLORS.BLACK}`,
  },

  '& tr:first-child th, & tr:first-child td': {
    borderTop: `2px solid ${GOV_UK_COLORS.BLACK}`,
  }
}));

// Styled Tab Panel component
const TabPanel = styled(Box)(({ theme }) => ({
  padding: '30px 0',
}));

// Styled Tabs
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${GOV_UK_COLORS.MID_GREY}`,
  
  '& .MuiTabs-indicator': {
    backgroundColor: GOV_UK_COLORS.BLUE,
    height: '5px',
  },
  
  '& .MuiTabs-flexContainer': {
    borderBottom: `2px solid ${GOV_UK_COLORS.MID_GREY}`,
  }
}));

// Styled Tab
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '16px',
  color: GOV_UK_COLORS.BLACK,
  padding: '15px 20px',
  minHeight: '60px',
  
  '&.Mui-selected': {
    color: GOV_UK_COLORS.BLUE,
    backgroundColor: GOV_UK_COLORS.LIGHT_GREY,
  },
  
  '&:hover': {
    color: GOV_UK_COLORS.BLUE,
    backgroundColor: GOV_UK_COLORS.LIGHT_GREY,
    opacity: 0.9,
  },
  
  '&:focus': {
    outline: `3px solid ${GOV_UK_COLORS.FOCUS}`,
    outlineOffset: 0,
  }
}));

// Section Header
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: `2px solid ${GOV_UK_COLORS.BLUE}`,
  paddingBottom: '10px',
  
  '& svg': {
    marginRight: '10px',
    color: GOV_UK_COLORS.BLUE,
  }
}));

// Section Container
const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
  
  '&:last-child': {
    marginBottom: 0,
  }
}));

// Warning panel
const WarningPanel = styled(Box)(({ theme }) => ({
  backgroundColor: GOV_UK_COLORS.LIGHT_GREY,
  padding: '15px',
  marginBottom: '20px',
  borderLeft: `5px solid ${GOV_UK_COLORS.RED}`,
  
  '& svg': {
    marginRight: '10px',
    color: GOV_UK_COLORS.RED,
    verticalAlign: 'middle',
  }
}));

// Info panel
const InfoPanel = styled(Box)(({ theme }) => ({
  backgroundColor: GOV_UK_COLORS.LIGHT_GREY,
  padding: '15px',
  marginBottom: '20px',
  borderLeft: `5px solid ${GOV_UK_COLORS.BLUE}`,
  
  '& svg': {
    marginRight: '10px',
    color: GOV_UK_COLORS.BLUE,
    verticalAlign: 'middle',
  }
}));

// Highlight value
const StyledValueHighlight = styled('span')(({ theme }) => ({
  fontWeight: 700,
  color: GOV_UK_COLORS.BLUE,
}));

// Styled fact list
const StyledFactorList = styled('ul')(({ theme }) => ({
  listStyleType: 'none',
  padding: 0,
  margin: '15px 0',
}));

// Styled fact item
const StyledFactorItem = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '10px',
  
  '& svg': {
    marginRight: '10px',
    marginTop: '3px',
    color: GOV_UK_COLORS.BLUE,
    flexShrink: 0,
  },
  
  '& span': {
    flex: 1,
  }
}));

// Footer note
const StyledFooterNote = styled(Box)(({ theme }) => ({
  backgroundColor: GOV_UK_COLORS.LIGHT_GREY,
  padding: '15px',
  marginTop: '30px',
  borderTop: `5px solid ${GOV_UK_COLORS.BLUE}`,
  fontSize: '16px',
  
  '& svg': {
    marginRight: '10px',
    color: GOV_UK_COLORS.BLUE,
    verticalAlign: 'middle',
  }
}));

// Tab Panel function component
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`specs-tabpanel-${index}`}
      aria-labelledby={`specs-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </TabPanel>
  );
}

// Tab props accessor function
function a11yProps(index) {
  return {
    id: `specs-tab-${index}`,
    'aria-controls': `specs-tabpanel-${index}`,
  };
}

const TechnicalSpecificationsPage = ({ vehicleData = null, loading = false, error = null }) => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Use default test data if no data is provided
  const testData = {
    vehicleIdentification: {
      title: 'Vehicle Identification',
      make: 'Honda',
      model: 'CR-V',
      modelType: 'N22A2/2.2 (07-12)',
      engineDetails: [
        { label: 'No. of cylinders', value: '4/DOHC', unit: 'Type' },
        { label: 'Capacity', value: '2204', unit: 'cc' },
        { label: 'Compression ratio', value: '16.7', unit: ':1' },
        { label: 'Fuel system', value: 'Bosch', unit: 'Make' },
        { label: 'Fuel system', value: 'EDC 16 C', unit: 'Type' },
      ]
    },
    injectionSystem: {
      title: 'Injection System',
      details: [
        { label: 'Air metering', value: 'Mass', unit: 'Type' },
        { label: 'Fuel/injection pump assembly', value: 'Bosch', unit: 'Make' },
        { label: 'Pump type', value: 'Common rail', unit: '' },
        { label: 'Injection sequence', value: '1-3-4-2', unit: '' },
      ]
    },
    tuningEmissions: {
      title: 'Tuning & Emissions',
      details: [
        { label: 'Idle speed', value: '835±65', unit: 'rpm' },
        { label: 'Oil temperature', value: '80', unit: '°C' },
        { label: 'Idle speed - for smoke test', value: '770-900', unit: 'rpm' },
        { label: 'Governed speed range - for smoke test', value: '4200-4500', unit: 'rpm' },
        { label: 'Maximum time at governed speed', value: '1.5', unit: 'secs' },
        { label: 'Test mode', value: 'B', unit: 'A/B' },
        { label: 'Probe type', value: '1', unit: '1/2' },
        { label: 'Conditioning', value: '/3000', unit: 'Accelerations/m' },
        { label: 'Smoke opacity - homologation value', value: '2,50 (66)', unit: 'm-1 (%)' },
      ]
    },
    startingCharging: {
      title: 'Starting & Charging',
      details: [
        { label: 'Battery', value: '12 (70)', unit: 'V/RC(Ah)' },
        { label: 'Alternator output', value: '105/13,5/-', unit: 'A/V/rpm' },
      ]
    },
    serviceChecks: {
      title: 'Service Checks & Adjustments',
      details: [
        { label: 'Valve clearance - INLET', value: 'Hydraulic', unit: 'mm' },
        { label: 'Valve clearance - EXHAUST', value: 'Hydraulic', unit: 'mm' },
        { label: 'Compression pressure', value: '24,0 Min', unit: 'bar' },
        { label: 'Oil pressure', value: '4,1/3000', unit: 'bar/rpm' },
        { label: 'Radiator cap', value: '1,12-1,46', unit: 'bar' },
        { label: 'Thermostat opens', value: '76-80', unit: '°C' },
      ]
    },
    lubricants: {
      title: 'Lubricants & Capacities',
      engineOil: {
        title: 'Engine oil options',
        details: [
          { label: 'Ambient temperature range', value: 'All temperatures', unit: '' },
          { label: 'Engine oil grade', value: '0W-30 Synthetic', unit: 'SAE' },
          { label: 'Engine oil classification', value: '/A5, B5', unit: 'API/ACEA' },
          { label: 'Engine with filter(s)', value: '5,9', unit: 'litres' },
        ],
        notes: [
          'With diesel particulate filter (DPF) = C2, C3',
          'Low ash engine oil MUST be used to ensure long service life of diesel particulate filter (DPF).'
        ]
      },
      otherLubricants: {
        title: 'Other Lubricants & Capacities',
        details: [
          { label: 'Manual transmission oil grade', value: 'Honda MTF', unit: 'SAE' },
          { label: 'Manual transmission', value: '2,5', unit: 'litres' },
          { label: 'Differential oil grade - rear', value: '08293-99902HE', unit: 'SAE' },
          { label: 'Differential rear', value: '1,2', unit: 'litres' },
          { label: 'Coolant', value: 'Honda all season type 2', unit: 'Type' },
          { label: 'Cooling system - total capacity', value: '7,1', unit: 'litres' },
          { label: 'Brake fluid', value: 'DOT 3/4', unit: 'Type' },
          { label: 'Power steering fluid', value: 'Honda ultra PSF-II', unit: 'Type' },
          { label: 'Power steering fluid', value: '0,9', unit: 'litres' },
        ]
      }
    },
    tighteningTorques: {
      title: 'Tightening Torques',
      cylinderHead: {
        title: 'Cylinder Head Instructions',
        instructions: [
          'Lubricate threads and between bolt and integral washer.',
          'Tighten in the following stages:'
        ],
        usedBolts: [
          '1. 49 Nm',
          '2. 100°',
          '3. 100°',
          '4. Slacken off',
          '5. 49 Nm',
          '6. 90°',
          '7. 90°',
          '8. 90°'
        ],
        newBolts: [
          '1. 49 Nm',
          '2. 100°',
          '3. 100°',
          '4. Slacken off',
          '5. 49 Nm',
          '6. 110°',
          '7. 100°',
          '8. 100°'
        ]
      },
      otherTorques: {
        title: 'Other Engine Tightening Torques',
        details: [
          { label: 'Main bearings', value: 'No', unit: 'Renew bolts/nuts' },
          { label: 'Main bearings', value: '29 Nm', unit: 'Stage 1' },
          { label: 'Main bearings', value: '58°', unit: 'Stage 2' },
          { label: 'Big end bearings', value: 'Yes', unit: 'Renew bolts/nuts' },
          { label: 'Big end bearings', value: '20 Nm', unit: 'Stage 1' },
          { label: 'Big end bearings', value: '90°', unit: 'Stage 2' },
          { label: 'Oil pump to cylinder block', value: '44 Nm', unit: '' },
          { label: 'Sump bolts', value: '12 Nm', unit: '' },
          { label: 'Sump drain bolt', value: '39 Nm', unit: '' },
          { label: 'Flywheel/driveplate', value: '118 Nm', unit: '' },
          { label: 'Clutch pressure plate', value: '25 Nm', unit: '' },
          { label: 'Crankshaft pulley/damper centre bolt', value: '29 Nm+90°', unit: '' },
          { label: 'Camshaft carrier/cap', value: '12 Nm M8=22 Nm', unit: '' },
          { label: 'Camshaft/rocker cover', value: '12 Nm', unit: '' },
          { label: 'Inlet manifold to cylinder head', value: '22 Nm', unit: '' },
          { label: 'Exhaust manifold to cylinder head', value: '44 Nm', unit: '' },
          { label: 'Exhaust downpipe to manifold', value: '33 Nm', unit: '' },
          { label: 'Water pump', value: '12 Nm', unit: '' },
          { label: 'Injector/clamp', value: '5 Nm+90°', unit: '' },
          { label: 'Injector pipe unions', value: '27 Nm', unit: '' },
          { label: 'Fuel/injection pump mounting', value: '22 Nm', unit: '' },
          { label: 'Glow plugs', value: '18 Nm', unit: '' },
          { label: 'Crankshaft position (CKP) sensor/engine speed (RPM) sensor', value: '12 Nm', unit: '' },
          { label: 'Camshaft position (CMP) sensor', value: '12 Nm', unit: '' },
          { label: 'Engine oil pressure switch', value: '18 Nm', unit: '' },
          { label: 'Oil filter', value: '25 Nm', unit: '' },
          { label: 'Engine upper cover', value: '12 Nm', unit: '' },
        ],
        notes: [
          'New bolt = 34 Nm + 90°',
          'Use new nuts.'
        ]
      },
      chassisTorques: {
        title: 'Chassis Tightening Torques',
        details: [
          { label: 'Front hub', value: '328 Nm', unit: '' },
          { label: 'Rear hub', value: '245 Nm', unit: '' },
          { label: 'Rear hub - wheel bearing housing bolts', value: '98 Nm', unit: '' },
          { label: 'Steering wheel', value: '39 Nm', unit: '' },
          { label: 'Steering rack/box mounting', value: '71 Nm', unit: '' },
          { label: 'Steering track rod end', value: '54 Nm', unit: '' },
          { label: 'Brake disc to hub', value: '10 Nm', unit: 'Front' },
          { label: 'Brake caliper to carrier', value: '30 Nm', unit: 'Front' },
          { label: 'Brake caliper/carrier to hub', value: '137 Nm', unit: 'Front' },
          { label: 'Brake disc to hub', value: '10 Nm', unit: 'Rear' },
          { label: 'Brake caliper to carrier', value: '30 Nm', unit: 'Rear' },
          { label: 'Brake caliper/carrier to hub', value: '108 Nm', unit: 'Rear' },
          { label: 'ABS sensor', value: '10 Nm', unit: 'Front' },
          { label: 'ABS sensor', value: '10 Nm', unit: 'Rear' },
          { label: 'Road wheels', value: '108 Nm', unit: '' },
        ],
        notes: [
          'Use new nut.',
          'Lubricate mating surfaces of nut.'
        ]
      }
    },
    brakeDiscDrum: {
      title: 'Brake Disc & Drum Dimensions',
      details: [
        { label: 'Minimum disc thickness for replacement - ventilated', value: '26 mm', unit: 'Front' },
        { label: 'Minimum disc thickness for replacement', value: '8,0 mm', unit: 'Rear' },
        { label: 'Disc thickness variation', value: '0,015 mm', unit: 'Front' },
        { label: 'Disc thickness variation', value: '0,015 mm', unit: 'Rear' },
        { label: 'Disc runout', value: '0,04 mm', unit: 'Front' },
        { label: 'Disc runout', value: '0,04 mm', unit: 'Rear' },
        { label: 'Minimum pad thickness', value: '2 mm', unit: 'Front' },
        { label: 'Minimum pad thickness', value: '2 mm', unit: 'Rear' },
        { label: 'Maximum drum diameter for replacement', value: '201 mm', unit: 'Rear' },
        { label: 'Minimum shoe thickness', value: '1 mm', unit: 'Rear' },
        { label: 'Parking brake travel', value: '6-7', unit: 'No. of notches' },
      ]
    },
    airConditioning: {
      title: 'Air Conditioning',
      details: [
        { label: 'No. of AC service connectors', value: '2', unit: '' },
        { label: 'Air conditioning restrictor type', value: 'Expansion valve', unit: '' },
        { label: 'Compressor clutch/magnetic coupling', value: 'Yes', unit: '' },
        { label: 'Compressor variable displacement solenoid', value: 'No', unit: '' },
        { label: 'Air conditioning refrigerant', value: 'R134a', unit: 'Type' },
        { label: 'Air conditioning refrigerant quantity', value: '465±25', unit: 'grams' },
        { label: 'Air conditioning oil group', value: 'PAG', unit: '' },
        { label: 'Air conditioning oil', value: 'SP10', unit: 'Type' },
        { label: 'Air conditioning oil quantity', value: '185±5', unit: 'cm³' },
        { label: 'Air conditioning oil viscosity', value: '46', unit: 'ISO' },
      ]
    }
  };

  // Use the provided vehicle data or fall back to test data
  const data = vehicleData || testData;
  
  // Helper function to render a specification table
  const renderSpecTable = (items) => (
    <SpecificationTable>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <th scope="row">
              {item.label}
            </th>
            <td>
              <strong>{item.value}</strong> {item.unit && <span>{item.unit}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </SpecificationTable>
  );

  // Helper function to render notes as styled factor items
  const renderNotes = (notes) => (
    notes && notes.length > 0 && (
      <InfoPanel>
        <GovUKHeadingS>
          <InfoIcon fontSize="small" /> Important notes
        </GovUKHeadingS>
        <StyledFactorList>
          {notes.map((note, index) => (
            <StyledFactorItem key={index}>
              <InfoIcon fontSize="small" />
              <span>{note}</span>
            </StyledFactorItem>
          ))}
        </StyledFactorList>
      </InfoPanel>
    )
  );

  // Define tab structure
  const tabs = [
    { 
      label: "Engine Details", 
      sections: [
        {
          title: data.vehicleIdentification.title,
          icon: <InfoIcon />,
          content: (
            <>
              <GovUKBody>
                Key specifications for this <StyledValueHighlight>{data.vehicleIdentification.make} {data.vehicleIdentification.model}</StyledValueHighlight> engine.
              </GovUKBody>
              {renderSpecTable(data.vehicleIdentification.engineDetails)}
            </>
          )
        },
        {
          title: data.injectionSystem.title,
          icon: <LocalGasStationIcon />,
          content: renderSpecTable(data.injectionSystem.details)
        },
        {
          title: data.tuningEmissions.title,
          icon: <SettingsIcon />,
          content: (
            <>
              <GovUKBody>
                These specifications are important for emissions testing and engine tuning operations.
              </GovUKBody>
              {renderSpecTable(data.tuningEmissions.details)}
            </>
          )
        },
        {
          title: data.startingCharging.title,
          icon: <BatteryChargingFullIcon />,
          content: renderSpecTable(data.startingCharging.details)
        }
      ]
    },
    {
      label: "Service Information",
      sections: [
        {
          title: data.serviceChecks.title,
          icon: <SettingsIcon />,
          content: (
            <>
              <GovUKBody>
                Reference values for maintenance and diagnostics.
              </GovUKBody>
              {renderSpecTable(data.serviceChecks.details)}
            </>
          )
        },
        {
          title: data.lubricants.title,
          icon: <OilBarrelIcon />,
          content: (
            <>
              <Box mb={4}>
                <GovUKHeadingS>
                  {data.lubricants.engineOil.title}
                </GovUKHeadingS>
                {renderSpecTable(data.lubricants.engineOil.details)}
                {renderNotes(data.lubricants.engineOil.notes)}
              </Box>
              
              <Box>
                <GovUKHeadingS>
                  {data.lubricants.otherLubricants.title}
                </GovUKHeadingS>
                {renderSpecTable(data.lubricants.otherLubricants.details)}
              </Box>
            </>
          )
        }
      ]
    },
    {
      label: "Torque Specifications",
      sections: [
        {
          title: data.tighteningTorques.cylinderHead.title,
          icon: <BuildIcon />,
          content: (
            <>
              <GovUKBody>
                {data.tighteningTorques.cylinderHead.instructions.map((instruction, index) => (
                  <p key={index}>{instruction}</p>
                ))}
              </GovUKBody>
              
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={4}>
                <Box flex={1}>
                  <GovUKHeadingS>
                    Used bolts
                  </GovUKHeadingS>
                  <StyledFactorList>
                    {data.tighteningTorques.cylinderHead.usedBolts.map((step, index) => (
                      <StyledFactorItem key={index}>
                        <BuildIcon fontSize="small" />
                        <span>{step}</span>
                      </StyledFactorItem>
                    ))}
                  </StyledFactorList>
                </Box>
                
                <Box flex={1}>
                  <GovUKHeadingS>
                    New bolts
                  </GovUKHeadingS>
                  <StyledFactorList>
                    {data.tighteningTorques.cylinderHead.newBolts.map((step, index) => (
                      <StyledFactorItem key={index}>
                        <BuildIcon fontSize="small" />
                        <span>{step}</span>
                      </StyledFactorItem>
                    ))}
                  </StyledFactorList>
                </Box>
              </Box>
            </>
          )
        },
        {
          title: data.tighteningTorques.otherTorques.title,
          icon: <BuildIcon />,
          content: (
            <>
              {renderSpecTable(data.tighteningTorques.otherTorques.details)}
              {renderNotes(data.tighteningTorques.otherTorques.notes)}
            </>
          )
        },
        {
          title: data.tighteningTorques.chassisTorques.title,
          icon: <BuildIcon />,
          content: (
            <>
              {renderSpecTable(data.tighteningTorques.chassisTorques.details)}
              {renderNotes(data.tighteningTorques.chassisTorques.notes)}
            </>
          )
        }
      ]
    },
    {
      label: "Brakes & A/C",
      sections: [
        {
          title: data.brakeDiscDrum.title,
          icon: <BrakesFrontIcon />,
          content: (
            <>
              <GovUKBody>
                Reference measurements for brake component service and replacement.
              </GovUKBody>
              {renderSpecTable(data.brakeDiscDrum.details)}
            </>
          )
        },
        {
          title: data.airConditioning.title,
          icon: <AcUnitIcon />,
          content: renderSpecTable(data.airConditioning.details)
        }
      ]
    }
  ];

  // Last updated date
  const lastUpdated = "15 March 2025";

  return (
    <GovUKContainer>
      <GovUKMainWrapper>
     
        
        {/* Loading state */}
        {loading && (
          <GovUKLoadingContainer>
            <GovUKLoadingSpinner />
            <GovUKBody>Loading technical specifications...</GovUKBody>
          </GovUKLoadingContainer>
        )}
        
        {/* Error state */}
        {error && (
          <Alert severity="error" style={{ marginBottom: '20px', borderRadius: 0 }}>
            {error}
          </Alert>
        )}
        
        {/* Main content */}
        {!loading && !error && data && (
          <Box>
          
            
            {/* Important notice */}
            <WarningPanel>
              <GovUKBody fontWeight={700}>
                <WarningIcon /> Important
              </GovUKBody>
              <GovUKBody>
                These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
              </GovUKBody>
            </WarningPanel>
            
            {/* Tabs Navigation */}
            <Box>
              <StyledTabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="technical specifications tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabs.map((tab, index) => (
                  <StyledTab 
                    key={index}
                    label={tab.label} 
                    icon={tab.icon} 
                    iconPosition="start"
                    {...a11yProps(index)} 
                  />
                ))}
              </StyledTabs>
            </Box>
            
            {/* Tab Content */}
            {tabs.map((tab, tabIndex) => (
              <CustomTabPanel key={tabIndex} value={tabValue} index={tabIndex}>
                {tab.sections.map((section, sectionIndex) => (
                  <SectionContainer key={sectionIndex}>
                    <SectionHeader>
                      {section.icon}
                      <GovUKHeadingM>{section.title}</GovUKHeadingM>
                    </SectionHeader>
                    {section.content}
                  </SectionContainer>
                ))}
              </CustomTabPanel>
            ))}
            
            {/* Footer Note */}
            <StyledFooterNote>
              <InfoIcon fontSize="small" /> Technical specifications sourced from Autodata. Crown copyright material is reproduced with the permission of the Controller of HMSO and the Queen's Printer for Scotland.
            </StyledFooterNote>
          </Box>
        )}
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default TechnicalSpecificationsPage;