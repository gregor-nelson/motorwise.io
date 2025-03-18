import React, { useState } from 'react';
import {
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
} from '../../styles/theme';

import Box from '@mui/material/Box';

// Import Material-UI icons
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BrakesFrontIcon from '@mui/icons-material/Build'; // Using Build as a substitute for brakes
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import HardwareIcon from '@mui/icons-material/Hardware';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import GestureIcon from '@mui/icons-material/Gesture';

// Import styled components
import {
  SpecificationTable,
  NestedStyledTabs,
  NestedStyledTab,
  SectionHeader,
  SectionContainer,
  StyledValueHighlight,
  StyledFooterNote,
  NestedTabPanel,
  nestedA11yProps
} from './styles/style';

const RepairTimesPage = ({ vehicleData = null, loading = false, error = null }) => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Use default repair times data if no data is provided
  const repairTimesData = {
    vehicleIdentification: {
      title: 'Vehicle identification',
      make: 'Honda',
      model: 'CR-V',
      modelType: 'N22A2/2.2 (07-12)',
    },
    engineAssembly: {
      title: 'Engine assembly',
      details: [
        { label: 'Remove and Install', value: 'Short exchange engine', hours: '9.00' },
        { label: 'Strip and Rebuild', value: 'Cylinder block', hours: '17.50' },
        { label: 'Remove and Install', value: 'Mounting - left (of engine bay)', hours: '1.20' },
        { label: 'Remove and Install', value: 'Mounting - left (of engine bay) - AT', hours: '1.00' },
      ]
    },
    cylinderHead: {
      title: 'Cylinder head',
      details: [
        { label: 'Remove and Install', value: 'Camshaft/valve cover & gasket', hours: '1.10' },
        { label: 'Remove and Install', value: 'Cylinder head gasket', hours: '9.70' },
        { label: 'Strip and Rebuild', value: 'Cylinder head', hours: '13.70' },
        { label: 'Remove and Install', value: 'Valves (all) including lapping', hours: '12.90' },
        { label: 'Remove and Install', value: 'Valve stem oil seals (all)', hours: '11.30' },
      ]
    },
    camshaftDriveGear: {
      title: 'Camshaft & drive gear',
      details: [
        { label: 'Remove and Install', value: 'Camshaft(s) - left', hours: '2.40' },
        { label: 'Remove and Install', value: 'Camshaft(s) - right', hours: '2.40' },
        { label: 'Remove and Install', value: 'Camshafts (both/all)', hours: '2.50' },
        { label: 'Remove and Install', value: 'Camshaft followers/Hydraulic tappets (all)', hours: '3.00' },
        { label: 'Remove and Install', value: 'Camshaft drive sprocket/gear', hours: '6.90' },
        { label: 'Remove and Install', value: 'Camshaft driven sprockets/gears', hours: '2.00' },
        { label: 'Remove and Install', value: 'Camshaft drive chain', hours: '3.70' },
        { label: 'Remove and Install', value: 'Camshaft drive chain tensioner', hours: '1.50' },
      ]
    },
    crankshaftPistons: {
      title: 'Crankshaft & pistons',
      details: [
        { label: 'Remove and Install', value: 'Crankshaft/all main bearings', hours: '15.20' },
        { label: 'Remove and Install', value: 'Crankshaft front oil seal', hours: '0.80' },
        { label: 'Remove and Install', value: 'Crankshaft rear oil seal', hours: '5.80' },
        { label: 'Remove and Install', value: 'Crankshaft pulley - Damper pulley', hours: '0.60' },
        { label: 'Remove and Install', value: 'Balancer shaft', hours: '4.20' },
        { label: 'Remove and Install', value: 'Conrods & pistons (all)', hours: '15.10' },
      ]
    },
    lubrication: {
      title: 'Lubrication',
      details: [
        { label: 'Renew', value: 'Engine oil', hours: '0.20' },
        { label: 'Remove and Install', value: 'Oil filter', hours: '0.20' },
        { label: 'Remove and Install', value: 'Oil pressure relief valve', hours: '3.70' },
        { label: 'Remove and Install', value: 'Oil sump pan', hours: '3.20' },
        { label: 'Remove and Install', value: 'Oil pump', hours: '4.00' },
        { label: 'Remove and Install', value: 'Oil pump drive gear', hours: '3.80' },
        { label: 'Remove and Install', value: 'Oil cooler', hours: '2.10' },
      ]
    },
    auxiliaryDrive: {
      title: 'Auxiliary drive',
      details: [
        { label: 'Remove and Install', value: 'AC compressor drive belt', hours: '0.30' },
        { label: 'Remove and Install', value: 'Alternator drive/serpentine belt tensioner', hours: '0.60' },
        { label: 'Remove and Install', value: 'Alternator drive/serpentine belt idler/guide pulley', hours: '0.60' },
      ]
    },
    engineManagementFuel: {
      title: 'Engine management - Fuel',
      details: [
        { label: 'Remove and Install', value: 'Air filter assembly', hours: '0.30' },
        { label: 'Remove and Install', value: 'Air filter element', hours: '0.10' },
        { label: 'Remove and Install', value: 'Intake manifold', hours: '2.10' },
        { label: 'Remove and Install', value: 'Intake manifold gasket', hours: '1.90' },
        { label: 'Remove and Install', value: 'Throttle pedal - RHD', hours: '0.40' },
        { label: 'Remove and Install', value: 'Throttle pedal - LHD', hours: '0.40' },
      ]
    },
    dieselInjectionSystem: {
      title: 'Diesel injection system',
      details: [
        { label: 'Remove and Install', value: 'Control ECU', hours: '0.70' },
        { label: 'Remove and Install', value: 'Manifold pressure (MAP) sensor', hours: '0.30' },
        { label: 'Remove and Install', value: 'Air flow/Mass sensor unit', hours: '0.20' },
        { label: 'Remove and Install', value: 'Coolant temperature sensor', hours: '0.30' },
        { label: 'Remove and Install', value: 'Engine speed sensor', hours: '1.70' },
        { label: 'Remove and Install', value: 'Camshaft position (CMP) sensor', hours: '0.40' },
        { label: 'Remove and Install', value: 'Fuel filter', hours: '0.60' },
        { label: 'Remove and Install', value: 'Injection pump', hours: '0.90' },
        { label: 'Remove and Install', value: 'Injectors (all)', hours: '0.50' },
        { label: 'Remove and Install', value: 'Injection pipe (one)', hours: '0.30' },
        { label: 'Remove and Install', value: 'Fuel rail', hours: '1.00' },
        { label: 'Remove and Install', value: 'Pre-heat plugs (all)', hours: '0.30' },
        { label: 'Remove and Install', value: 'Water-in-fuel sensor', hours: '0.60' },
        { label: 'Remove and Install', value: 'Throttle body', hours: '0.60' },
      ]
    },
    fuelSupply: {
      title: 'Fuel supply',
      details: [
        { label: 'Remove and Install', value: 'Fuel pump - in tank', hours: '0.60' },
        { label: 'Remove and Install', value: 'Fuel tank', hours: '2.20' },
        { label: 'Remove and Install', value: 'Pipe - pump to carb/injection', hours: '3.40' },
      ]
    },
    turbocharger: {
      title: 'Turbocharger',
      details: [
        { label: 'Remove and Install', value: 'Turbocharger', hours: '3.10' },
        { label: 'Remove and Install', value: 'Connection - manifold', hours: '0.90' },
        { label: 'Remove and Install', value: 'Connection - intercooler', hours: '0.50' },
      ]
    },
    coolingSystem: {
      title: 'Cooling system',
      details: [
        { label: 'Drain and Refill', value: 'Coolant/antifreeze', hours: '0.30' },
        { label: 'Remove and Install', value: 'Cooling fan - electric', hours: '1.00' },
        { label: 'Remove and Install', value: 'Cooling fan motor', hours: '1.10' },
        { label: 'Remove and Install', value: 'Cooling fan motor thermoswitch', hours: '0.70' },
        { label: 'Remove and Install', value: 'Radiator', hours: '1.70' },
        { label: 'Remove and Install', value: 'Radiator cowling', hours: '1.10' },
        { label: 'Remove and Install', value: 'Thermostat', hours: '0.60' },
        { label: 'Remove and Install', value: 'Intercooler', hours: '0.60' },
      ]
    },
    exhaustSystem: {
      title: 'Exhaust system',
      details: [
        { label: 'Remove and Install', value: 'Exhaust manifold', hours: '3.10' },
        { label: 'Remove and Install', value: 'Exhaust manifold gasket', hours: '3.10' },
        { label: 'Remove and Install', value: 'Manifold to downpipe gasket', hours: '0.30' },
        { label: 'Remove and Install', value: 'Pipe - front/downpipe', hours: '0.50' },
        { label: 'Remove and Install', value: 'Pipe - middle/silencer', hours: '0.60' },
        { label: 'Remove and Install', value: 'Pipe - rear/tail/silencer', hours: '0.40' },
        { label: 'Remove and Install', value: 'Catalytic converter - front', hours: '1.00' },
        { label: 'Remove and Install', value: 'Catalytic converter - rear', hours: '0.60' },
        { label: 'Remove and Install', value: 'Exhaust gas recirculation (EGR) valve', hours: '0.60' },
        { label: 'Remove and Install', value: 'Diesel particulate filter', hours: '0.80' },
      ]
    },
    clutchControls: {
      title: 'Clutch & controls',
      details: [
        { label: 'Remove and Install', value: 'Pedal - RHD', hours: '0.40' },
        { label: 'Remove and Install', value: 'Pedal - LHD', hours: '0.40' },
        { label: 'Remove and Install', value: 'Master cylinder - RHD', hours: '0.80' },
        { label: 'Remove and Install', value: 'Master cylinder - LHD', hours: '0.60' },
        { label: 'Remove and Install', value: 'Slave cylinder', hours: '0.70' },
        { label: 'Remove and Install', value: 'Slave cylinder hose', hours: '0.60' },
        { label: 'Remove and Install', value: 'Release lever', hours: '5.90' },
        { label: 'Remove and Install', value: 'Release bearing', hours: '5.90' },
        { label: 'Remove and Install', value: 'Clutch plate, cover & release bearing', hours: '5.60' },
        { label: 'Remove and Install', value: 'Flywheel', hours: '5.80' },
        { label: 'Remove and Install', value: 'Spigot bearing', hours: '5.90' },
        { label: 'Remove and Install', value: 'Clutch housing', hours: '6.80' },
      ]
    },
    manualTransmission: {
      title: 'Manual transmission',
      details: [
        { label: 'Remove and Install', value: 'Gearbox', hours: '5.30' },
        { label: 'Drain and Refill', value: 'Gearbox oil - renew', hours: '0.30' },
        { label: 'Remove and Install', value: 'Gear linkage', hours: '1.00' },
        { label: 'Remove and Install', value: 'Lever', hours: '0.50' },
      ]
    },
    finalDrive: {
      title: 'Final drive, shaft & axles',
      details: [
        { label: 'Remove and Install', value: 'Propshaft - complete', hours: '0.40' },
        { label: 'Remove and Install', value: 'Transfer box', hours: '1.20' },
        { label: 'Remove and Install', value: 'Final drive', hours: '7.10' },
        { label: 'Remove and Install', value: 'Driveshaft - left', hours: '0.70' },
        { label: 'Remove and Install', value: 'Driveshaft - right', hours: '0.70' },
        { label: 'Remove and Install', value: 'Halfshaft', hours: '0.80' },
        { label: 'Remove and Install', value: 'Wheel bearing set', hours: '1.70' },
        { label: 'Remove and Install', value: 'Hub assembly', hours: '1.70' },
      ]
    },
    frontSuspension: {
      title: 'Front suspension',
      details: [
        { label: 'Remove and Install', value: 'Subframe/crossmember', hours: '2.20' },
        { label: 'Remove and Install', value: 'Strut assembly', hours: '1.10' },
        { label: 'Remove and Install', value: 'Strut assembly (both)', hours: '1.50' },
        { label: 'Remove and Install', value: 'Shock absorber', hours: '1.50' },
        { label: 'Remove and Install', value: 'Shock absorbers (pair)', hours: '2.30' },
        { label: 'Remove and Install', value: 'Suspension lower arm', hours: '1.00' },
        { label: 'Remove and Install', value: 'Suspension lower arm (both)', hours: '1.80' },
      ]
    },
    rearSuspension: {
      title: 'Rear suspension',
      details: [
        { label: 'Remove and Install', value: 'Subframe', hours: '1.80' },
        { label: 'Remove and Install', value: 'Strut assembly', hours: '0.90' },
        { label: 'Remove and Install', value: 'Strut assembly (both)', hours: '1.50' },
        { label: 'Remove and Install', value: 'Road spring', hours: '1.30' },
        { label: 'Remove and Install', value: 'Road spring (both)', hours: '2.30' },
        { label: 'Remove and Install', value: 'Shock absorber', hours: '1.30' },
        { label: 'Remove and Install', value: 'Shock absorbers (pair)', hours: '2.30' },
      ]
    },
    steering: {
      title: 'Steering',
      details: [
        { label: 'Remove and Install', value: 'Steering rack/box', hours: '3.60' },
        { label: 'Remove and Install', value: 'Rack gaiter', hours: '3.20' },
        { label: 'Remove and Install', value: 'Rack gaiter (both)', hours: '3.40' },
        { label: 'Remove and Install', value: 'Track rod', hours: '3.30' },
        { label: 'Remove and Install', value: 'Track rod (both)', hours: '3.60' },
        { label: 'Remove and Install', value: 'Track rod end joint', hours: '0.70' },
        { label: 'Remove and Install', value: 'Track rod end joint (both)', hours: '1.20' },
        { label: 'Remove and Install', value: 'Steering wheel', hours: '0.50' },
        { label: 'Remove and Install', value: 'Steering column lock', hours: '1.00' },
        { label: 'Remove and Install', value: 'Steering column', hours: '1.50' },
      ]
    },
    powerSteering: {
      title: 'Power assisted steering',
      details: [
        { label: 'Remove and Install', value: 'Pump', hours: '0.80' },
        { label: 'Remove and Install', value: 'Fluid reservoir', hours: '0.30' },
        { label: 'Remove and Install', value: 'High pressure hose', hours: '0.80' },
        { label: 'Remove and Install', value: 'Power steering fluid cooler', hours: '0.90' },
      ]
    },
    brakes: {
      title: 'Brakes',
      details: [
        { label: 'Remove and Install', value: 'Master cylinder RHD', hours: '1.20' },
        { label: 'Remove and Install', value: 'Master cylinder LHD', hours: '1.10' },
        { label: 'Remove and Install', value: 'Front brake caliper (one)', hours: '1.10' },
        { label: 'Remove and Install', value: 'Front brake caliper (both)', hours: '1.40' },
        { label: 'Remove and Install', value: 'Rear brake caliper (one)', hours: '1.00' },
        { label: 'Remove and Install', value: 'Rear brake caliper (both)', hours: '1.20' },
        { label: 'Remove and Install', value: 'Front brake pads (all)', hours: '0.90' },
        { label: 'Remove and Install', value: 'Rear brake pads (all)', hours: '0.70' },
        { label: 'Remove and Install', value: 'Front brake disc (both)', hours: '0.80' },
        { label: 'Remove and Install', value: 'Front brake disc (both) - including pads', hours: '1.00' },
        { label: 'Remove and Install', value: 'Rear brake disc (both)', hours: '0.80' },
        { label: 'Remove and Install', value: 'Rear brake disc (both) - including pads', hours: '1.00' },
        { label: 'Remove and Install', value: 'ABS Modulator', hours: '1.30' },
        { label: 'Remove and Install', value: 'Wheel sensor - front (one)', hours: '0.50' },
        { label: 'Remove and Install', value: 'Wheel sensor - front (both)', hours: '0.90' },
        { label: 'Remove and Install', value: 'Wheel sensor - rear (one)', hours: '0.50' },
        { label: 'Remove and Install', value: 'Wheel sensor - rear (both)', hours: '0.80' },
        { label: 'Remove and Install', value: 'Parking brake lever', hours: '0.60' },
        { label: 'Remove and Install', value: 'Parking brake cable - primary/single', hours: '1.80' },
        { label: 'Remove and Install', value: 'Parking brake cables - (both) equal length', hours: '3.30' },
      ]
    },
    airConditioning: {
      title: 'Air conditioning & heating',
      details: [
        { label: 'Remove and Install', value: 'Heater unit - complete', hours: '4.10' },
        { label: 'Remove and Install', value: 'Heater hose - from engine', hours: '0.50' },
        { label: 'Remove and Install', value: 'Heater hose - to engine', hours: '0.40' },
        { label: 'Remove and Install', value: 'Heater matrix - RHD', hours: '3.80' },
        { label: 'Remove and Install', value: 'Heater matrix - LHD', hours: '3.80' },
        { label: 'Remove and Install', value: 'Heater blower motor', hours: '0.30' },
        { label: 'Remove and Install', value: 'Cabin filter', hours: '0.10' },
        { label: 'Remove and Install', value: 'Receiver/drier', hours: '1.20' },
        { label: 'Remove and Install', value: 'Condenser to receiver/drier line', hours: '1.20' },
        { label: 'Remove and Install', value: 'Compressor', hours: '2.30' },
        { label: 'Remove and Install', value: 'Compressor clutch', hours: '2.20' },
        { label: 'Remove and Install', value: 'Expansion valve - front', hours: '1.00' },
        { label: 'Remove and Install', value: 'Condenser', hours: '1.20' },
        { label: 'Remove and Install', value: 'Evaporator - front', hours: '1.90' },
        { label: 'Remove and Install', value: 'Air conditioning control panel', hours: '0.30' },
      ]
    },
    electricalSystem: {
      title: 'Electrical system',
      details: [
        { label: 'Check', value: 'Battery', hours: '0.20' },
        { label: 'Remove and Install', value: 'Battery', hours: '0.40' },
        { label: 'Remove and Install', value: 'Cable to body earth', hours: '0.30' },
        { label: 'Remove and Install', value: 'Alternator', hours: '1.70' },
        { label: 'Remove and Install', value: 'Starter motor - pre-engaged', hours: '1.50' },
        { label: 'Remove and Install', value: 'Starter motor solenoid', hours: '1.90' },
        { label: 'Remove and Install', value: 'Headlamp bulb', hours: '0.20' },
        { label: 'Remove and Install', value: 'Headlamp - one', hours: '0.90' },
        { label: 'Remove and Install', value: 'Headlamp - (both)', hours: '1.30' },
        { label: 'Remove and Install', value: 'Fog lamp - one', hours: '0.50' },
        { label: 'Remove and Install', value: 'Instrument panel', hours: '0.50' },
        { label: 'Remove and Install', value: 'Horn', hours: '0.50' },
        { label: 'Remove and Install', value: 'Oil pressure transmitter', hours: '0.20' },
        { label: 'Remove and Install', value: 'Speedo drive sensor', hours: '0.40' },
        { label: 'Remove and Install', value: 'Coolant temperature sensor', hours: '0.70' },
        { label: 'Remove and Install', value: 'Fuel level sensor', hours: '0.70' },
        { label: 'Remove and Install', value: 'Fusebox', hours: '0.80' },
      ]
    },
    bodySection: {
      title: 'Body - Centre section',
      details: [
        { label: 'Remove and Replace', value: 'Lock set', hours: '1.90' },
        { label: 'Remove and Replace', value: 'Airbag - driver', hours: '0.30' },
        { label: 'Remove and Replace', value: 'Airbag - passenger', hours: '0.40' },
        { label: 'Remove and Replace', value: 'Side airbag - front (one)', hours: '0.70' },
        { label: 'Remove and Replace', value: 'Airbag curtain - one', hours: '2.80' },
        { label: 'Remove and Replace', value: 'Airbag curtain - (both)', hours: '3.20' },
        { label: 'Remove and Install', value: 'Airbag control module', hours: '1.20' },
        { label: 'Remove and Replace', value: 'Airbag spiral cable/slip ring (clock spring)', hours: '0.70' },
      ]
    },
  };

  // Use the provided vehicle data or fall back to repair times data
  const data = vehicleData || repairTimesData;
  
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
              <strong>{item.value}</strong> {item.hours && <span>{item.hours} hours</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </SpecificationTable>
  );

  // Define tab structure
  const tabs = [
    { 
      label: "Engine", 
      sections: [
        {
          title: data.engineAssembly.title,
          content: (
            <>
              <GovUKBody>
                Standard labor times for engine assembly operations on <StyledValueHighlight>{data.vehicleIdentification.make} {data.vehicleIdentification.model}</StyledValueHighlight>.
              </GovUKBody>
              {renderSpecTable(data.engineAssembly.details)}
            </>
          )
        },
        {
          title: data.cylinderHead.title,
          content: (
            <>
              <GovUKBody>
                Labor times for cylinder head operations.
              </GovUKBody>
              {renderSpecTable(data.cylinderHead.details)}
            </>
          )
        },
        {
          title: data.camshaftDriveGear.title,
          content: renderSpecTable(data.camshaftDriveGear.details)
        },
        {
          title: data.crankshaftPistons.title,
          content: renderSpecTable(data.crankshaftPistons.details)
        },
        {
          title: data.lubrication.title,
          content: renderSpecTable(data.lubrication.details)
        },
        {
          title: data.auxiliaryDrive.title,
          content: renderSpecTable(data.auxiliaryDrive.details)
        }
      ]
    },
    {
      label: "Fuel & Cooling",
      sections: [
        {
          title: data.engineManagementFuel.title,
          content: (
            <>
              <GovUKBody>
                Labor times for air intake and throttle control components.
              </GovUKBody>
              {renderSpecTable(data.engineManagementFuel.details)}
            </>
          )
        },
        {
          title: data.dieselInjectionSystem.title,
          content: renderSpecTable(data.dieselInjectionSystem.details)
        },
        {
          title: data.fuelSupply.title,
          content: renderSpecTable(data.fuelSupply.details)
        },
        {
          title: data.turbocharger.title,
          content: renderSpecTable(data.turbocharger.details)
        },
        {
          title: data.coolingSystem.title,
          content: renderSpecTable(data.coolingSystem.details)
        },
        {
          title: data.exhaustSystem.title,
          content: renderSpecTable(data.exhaustSystem.details)
        }
      ]
    },
    {
      label: "Transmission & Drive",
      sections: [
        {
          title: data.clutchControls.title,
          content: (
            <>
              <GovUKBody>
                Labor times for clutch system components.
              </GovUKBody>
              {renderSpecTable(data.clutchControls.details)}
            </>
          )
        },
        {
          title: data.manualTransmission.title,
          content: renderSpecTable(data.manualTransmission.details)
        },
        {
          title: data.finalDrive.title,
          content: renderSpecTable(data.finalDrive.details)
        }
      ]
    },
    {
      label: "Suspension & Brakes",
      sections: [
        {
          title: data.frontSuspension.title,
          content: (
            <>
              <GovUKBody>
                Labor times for front suspension components.
              </GovUKBody>
              {renderSpecTable(data.frontSuspension.details)}
            </>
          )
        },
        {
          title: data.rearSuspension.title,
          content: renderSpecTable(data.rearSuspension.details)
        },
        {
          title: data.steering.title,
          content: renderSpecTable(data.steering.details)
        },
        {
          title: data.powerSteering.title,
          content: renderSpecTable(data.powerSteering.details)
        },
        {
          title: data.brakes.title,
          content: renderSpecTable(data.brakes.details)
        }
      ]
    },
    {
      label: "Electrical & Body",
      sections: [
        {
          title: data.airConditioning.title,
          content: (
            <>
              <GovUKBody>
                Labor times for heating and air conditioning components.
              </GovUKBody>
              {renderSpecTable(data.airConditioning.details)}
            </>
          )
        },
        {
          title: data.electricalSystem.title,
          content: renderSpecTable(data.electricalSystem.details)
        },
        {
          title: data.bodySection.title,
          content: renderSpecTable(data.bodySection.details)
        }
      ]
    }
  ];

  return (
    <Box>
      {/* Secondary tabs navigation - now using NestedStyledTabs */}
      <Box>
        <NestedStyledTabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="repair times tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <NestedStyledTab 
              key={index}
              label={tab.label} 
              icon={tab.icon} 
              iconPosition="start"
              {...nestedA11yProps(index)} 
            />
          ))}
        </NestedStyledTabs>
      </Box>
      
      {/* Tab Content - now using NestedTabPanel */}
      {tabs.map((tab, tabIndex) => (
        <NestedTabPanel key={tabIndex} value={tabValue} index={tabIndex}>
          {tab.sections.map((section, sectionIndex) => (
            <SectionContainer key={sectionIndex}>
              <SectionHeader>
                {section.icon}
                <GovUKHeadingM>{section.title}</GovUKHeadingM>
              </SectionHeader>
              {section.content}
            </SectionContainer>
          ))}
        </NestedTabPanel>
      ))}
      
      {/* Footer Note */}
      <StyledFooterNote>
        <InfoIcon fontSize="small" /> Repair times sourced from Autodata. Crown copyright material is reproduced with the permission of the Controller of HMSO and the Queen's Printer for Scotland.
      </StyledFooterNote>
    </Box>
  );
};

export default RepairTimesPage;