import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

// GDS Color Palette
const GDS_COLORS = {
  // Main colors
  BLACK: '#0b0c0c',
  WHITE: '#ffffff',
  BLUE: '#1d70b8',
  DARK_BLUE: '#003078',
  LIGHT_BLUE: '#5694ca',
  
  // Status colors
  RED: '#d4351c',
  YELLOW: '#ffdd00',
  GREEN: '#00703c',
  ORANGE: '#f47738',
  PURPLE: '#912b88',
  PINK: '#d53880',
  BRIGHT_PURPLE: '#4c2c92',
  
  // Greys
  DARK_GREY: '#505a5f',
  MID_GREY: '#b1b4b6',
  LIGHT_GREY: '#f3f2f1',
  
  // Links
  LINK: '#1d70b8',
  LINK_VISITED: '#4c2c92',
  LINK_HOVER: '#003078',
  LINK_ACTIVE: '#0b0c0c',
  
  // Focus
  FOCUS: '#ffdd00',
  FOCUS_TEXT: '#0b0c0c',
  
  // Borders
  BORDER_COLOUR: '#b1b4b6',
  INPUT_BORDER: '#0b0c0c',
  
  // Error
  ERROR: '#d4351c',
  
  // Success  
  SUCCESS: '#00703c'
};

// GDS Typography Scale with mobile enhancements
const GDS_TYPOGRAPHY = {
  // Font family
  FONT_FAMILY: '"GDS Transport", Arial, sans-serif',
  
  // Desktop font sizes
  SIZE_80: '53px',
  SIZE_48: '48px',
  SIZE_36: '36px',
  SIZE_27: '27px',
  SIZE_24: '24px',
  SIZE_19: '19px',
  SIZE_16: '16px',
  SIZE_14: '14px',
  
  // Mobile font sizes
  MOBILE_SIZE_80: '36px',
  MOBILE_SIZE_48: '32px',
  MOBILE_SIZE_36: '24px',
  MOBILE_SIZE_27: '20px',
  MOBILE_SIZE_24: '18px',
  MOBILE_SIZE_19: '16px',
  MOBILE_SIZE_16: '14px',
  MOBILE_SIZE_14: '12px',
  
  // Line heights
  LINE_HEIGHT_80: '55px',
  LINE_HEIGHT_48: '50px',
  LINE_HEIGHT_36: '40px',
  LINE_HEIGHT_27: '30px',
  LINE_HEIGHT_24: '30px',
  LINE_HEIGHT_19: '25px',
  LINE_HEIGHT_16: '20px',
  LINE_HEIGHT_14: '20px',
  
  // Mobile line heights
  MOBILE_LINE_HEIGHT_80: '40px',
  MOBILE_LINE_HEIGHT_48: '36px',
  MOBILE_LINE_HEIGHT_36: '28px',
  MOBILE_LINE_HEIGHT_27: '24px',
  MOBILE_LINE_HEIGHT_24: '22px',
  MOBILE_LINE_HEIGHT_19: '20px',
  MOBILE_LINE_HEIGHT_16: '18px',
  MOBILE_LINE_HEIGHT_14: '16px',
  
  // Font weights
  WEIGHT_REGULAR: 400,
  WEIGHT_BOLD: 700
};

// Enhanced GDS Spacing Scale for mobile
const GDS_SPACING = {
  0: '0',
  1: '5px',
  2: '10px',
  3: '15px',
  4: '20px',
  5: '25px',
  6: '30px',
  7: '40px',
  8: '50px',
  9: '60px',
  // Mobile spacing
  mobile: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '32px',
    8: '40px',
    9: '48px'
  }
};

// Breakpoints
const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px'
};

// Base GDS Components with enhanced mobile responsiveness
const PageWrapper = styled('div')`
  font-family: ${GDS_TYPOGRAPHY.FONT_FAMILY};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: ${GDS_COLORS.BLACK};
  line-height: 1.5;
  min-width: 320px;
  overflow-x: hidden;
`;

const Header = styled('header')`
  background-color: ${GDS_COLORS.BLACK};
  border-bottom: 10px solid ${GDS_COLORS.BLUE};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    border-bottom-width: 5px;
  }
`;

const Container = styled('div')`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${GDS_SPACING[3]};
  
  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 0 ${GDS_SPACING[6]};
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 ${GDS_SPACING.mobile[3]};
  }
`;

const MainContent = styled('main')`
  padding-top: ${GDS_SPACING[4]};
  padding-bottom: ${GDS_SPACING[8]};
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    padding-top: ${GDS_SPACING[3]};
    padding-bottom: ${GDS_SPACING[6]};
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: ${GDS_SPACING.mobile[4]};
    padding-bottom: ${GDS_SPACING.mobile[7]};
  }
`;

// Enhanced Typography Components
const Heading1 = styled('h1')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_48};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_48};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  margin-top: 0;
  margin-bottom: ${GDS_SPACING[6]};
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    font-size: ${GDS_TYPOGRAPHY.SIZE_36};
    line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_36};
    margin-bottom: ${GDS_SPACING[4]};
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_48};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_48};
    margin-bottom: ${GDS_SPACING.mobile[4]};
  }
`;

const Heading2 = styled('h2')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_36};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_36};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  margin-top: ${GDS_SPACING[8]};
  margin-bottom: ${GDS_SPACING[4]};
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    font-size: ${GDS_TYPOGRAPHY.SIZE_27};
    line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_27};
    margin-top: ${GDS_SPACING[6]};
    margin-bottom: ${GDS_SPACING[3]};
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_36};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_36};
    margin-top: ${GDS_SPACING.mobile[6]};
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
`;

const Heading3 = styled('h3')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_24};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_24};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  margin-top: ${GDS_SPACING[6]};
  margin-bottom: ${GDS_SPACING[3]};
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    font-size: ${GDS_TYPOGRAPHY.SIZE_19};
    line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_19};
    margin-top: ${GDS_SPACING[4]};
    margin-bottom: ${GDS_SPACING[2]};
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_24};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_24};
    margin-top: ${GDS_SPACING.mobile[4]};
    margin-bottom: ${GDS_SPACING.mobile[2]};
  }
`;

const Heading4 = styled('h4')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_19};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_19};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  margin-top: ${GDS_SPACING[4]};
  margin-bottom: ${GDS_SPACING[2]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_19};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_19};
    margin-top: ${GDS_SPACING.mobile[3]};
    margin-bottom: ${GDS_SPACING.mobile[2]};
  }
`;

const BodyText = styled('p')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_19};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_19};
  margin-bottom: ${GDS_SPACING[4]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_19};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_19};
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
`;

const SmallText = styled('p')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_16};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_16};
  margin-bottom: ${GDS_SPACING[3]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_16};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_16};
    margin-bottom: ${GDS_SPACING.mobile[2]};
  }
`;

const Caption = styled('span')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_14};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_14};
  color: ${GDS_COLORS.DARK_GREY};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_14};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_14};
  }
`;

// Enhanced GDS Components
const Button = styled('button')`
  font-family: ${GDS_TYPOGRAPHY.FONT_FAMILY};
  font-size: ${GDS_TYPOGRAPHY.SIZE_19};
  line-height: 1;
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_REGULAR};
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  width: 100%;
  margin-top: 0;
  margin-bottom: ${GDS_SPACING[4]};
  padding: 8px 10px 7px;
  border: 2px solid transparent;
  border-radius: 0;
  color: ${GDS_COLORS.WHITE};
  background-color: ${GDS_COLORS.GREEN};
  box-shadow: 0 2px 0 #002d18;
  text-align: center;
  vertical-align: top;
  cursor: pointer;
  -webkit-appearance: none;
  
  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${GDS_TYPOGRAPHY.SIZE_19};
    width: auto;
    min-width: 200px;
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_19};
    padding: 12px 16px;
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
  
  &:hover {
    background-color: #005a30;
  }
  
  &:active {
    top: 2px;
    box-shadow: none;
  }
  
  &:focus {
    border-color: ${GDS_COLORS.FOCUS};
    outline: 3px solid transparent;
    box-shadow: inset 0 0 0 1px ${GDS_COLORS.FOCUS};
  }
  
  &:focus:not(:active):not(:hover) {
    border-color: ${GDS_COLORS.FOCUS};
    color: ${GDS_COLORS.FOCUS_TEXT};
    background-color: ${GDS_COLORS.FOCUS};
    box-shadow: 0 2px 0 ${GDS_COLORS.FOCUS_TEXT};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${GDS_COLORS.LIGHT_GREY};
  color: ${GDS_COLORS.BLACK};
  box-shadow: 0 2px 0 ${GDS_COLORS.DARK_GREY};
  
  &:hover {
    background-color: #dbdad9;
    color: ${GDS_COLORS.BLACK};
  }
  
  &:focus:not(:active):not(:hover) {
    color: ${GDS_COLORS.FOCUS_TEXT};
  }
`;

const SectionBreak = styled('hr')`
  margin: 0;
  border: 0;
  border-bottom: 1px solid ${GDS_COLORS.BORDER_COLOUR};
  
  &.section-break--l {
    margin-top: ${GDS_SPACING[6]};
    margin-bottom: ${GDS_SPACING[6]};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      margin-top: ${GDS_SPACING.mobile[5]};
      margin-bottom: ${GDS_SPACING.mobile[5]};
    }
  }
  
  &.section-break--xl {
    margin-top: ${GDS_SPACING[8]};
    margin-bottom: ${GDS_SPACING[8]};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      margin-top: ${GDS_SPACING.mobile[6]};
      margin-bottom: ${GDS_SPACING.mobile[6]};
    }
  }
  
  &.section-break--visible {
    border-bottom: 3px solid ${GDS_COLORS.BORDER_COLOUR};
  }
`;

const Panel = styled('section')`
  margin-bottom: ${GDS_SPACING[6]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: ${GDS_SPACING.mobile[5]};
  }
`;

const InsetText = styled('div')`
  padding: ${GDS_SPACING[3]};
  margin-top: ${GDS_SPACING[4]};
  margin-bottom: ${GDS_SPACING[4]};
  clear: both;
  border-left: 10px solid ${GDS_COLORS.BORDER_COLOUR};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[3]};
    margin-top: ${GDS_SPACING.mobile[3]};
    margin-bottom: ${GDS_SPACING.mobile[3]};
    border-left-width: 5px;
  }
`;

const Tag = styled('strong')`
  display: inline-block;
  padding: 5px ${GDS_SPACING[2]} 4px;
  outline: 2px solid transparent;
  outline-offset: -2px;
  color: ${GDS_COLORS.WHITE};
  background-color: ${props => props.color || GDS_COLORS.BLUE};
  letter-spacing: 1px;
  text-decoration: none;
  text-transform: uppercase;
  font-family: ${GDS_TYPOGRAPHY.FONT_FAMILY};
  font-size: ${GDS_TYPOGRAPHY.SIZE_14};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  line-height: 1;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_14};
    padding: 4px ${GDS_SPACING.mobile[2]} 3px;
  }
`;

// Mobile-optimized Table
const TableWrapper = styled('div')`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: ${GDS_SPACING[4]};
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    margin-left: -${GDS_SPACING[3]};
    margin-right: -${GDS_SPACING[3]};
    padding-left: ${GDS_SPACING[3]};
    padding-right: ${GDS_SPACING[3]};
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    margin-left: -${GDS_SPACING.mobile[3]};
    margin-right: -${GDS_SPACING.mobile[3]};
    padding-left: ${GDS_SPACING.mobile[3]};
    padding-right: ${GDS_SPACING.mobile[3]};
  }
`;

const Table = styled('table')`
  font-family: ${GDS_TYPOGRAPHY.FONT_FAMILY};
  font-size: ${GDS_TYPOGRAPHY.SIZE_19};
  line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_19};
  color: ${GDS_COLORS.BLACK};
  width: 100%;
  min-width: 600px;
  border-spacing: 0;
  border-collapse: collapse;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_16};
    line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_16};
  }
`;

const TableHeader = styled('th')`
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  padding: ${GDS_SPACING[2]} ${GDS_SPACING[4]} ${GDS_SPACING[2]} 0;
  text-align: left;
  border-bottom: 1px solid ${GDS_COLORS.BORDER_COLOUR};
  white-space: nowrap;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[2]} ${GDS_SPACING.mobile[3]} ${GDS_SPACING.mobile[2]} 0;
  }
`;

const TableCell = styled('td')`
  padding: ${GDS_SPACING[2]} ${GDS_SPACING[4]} ${GDS_SPACING[2]} 0;
  border-bottom: 1px solid ${GDS_COLORS.BORDER_COLOUR};
  text-align: left;
  vertical-align: top;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[2]} ${GDS_SPACING.mobile[3]} ${GDS_SPACING.mobile[2]} 0;
  }
`;

const WarningCallout = styled('div')`
  position: relative;
  margin-bottom: ${GDS_SPACING[4]};
  padding: ${GDS_SPACING[3]};
  padding-left: ${GDS_SPACING[7]};
  background-color: #fff7ed;
  border: 3px solid ${GDS_COLORS.ORANGE};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: ${GDS_SPACING.mobile[3]};
    padding: ${GDS_SPACING.mobile[3]};
    padding-left: ${GDS_SPACING.mobile[7]};
    border-width: 2px;
  }
  
  &:before {
    content: "!";
    position: absolute;
    top: 50%;
    left: ${GDS_SPACING[3]};
    transform: translateY(-50%);
    color: ${GDS_COLORS.WHITE};
    background: ${GDS_COLORS.ORANGE};
    border-radius: 50%;
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 29px;
    font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
    font-size: ${GDS_TYPOGRAPHY.SIZE_19};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      left: ${GDS_SPACING.mobile[3]};
      width: 24px;
      height: 24px;
      line-height: 23px;
      font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_16};
    }
  }
`;

const NotificationBanner = styled('div')`
  position: relative;
  margin-bottom: ${GDS_SPACING[4]};
  padding: ${GDS_SPACING[4]};
  background-color: ${GDS_COLORS.BLUE};
  color: ${GDS_COLORS.WHITE};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: ${GDS_SPACING.mobile[3]};
    padding: ${GDS_SPACING.mobile[3]};
  }
  
  h3, p {
    color: ${GDS_COLORS.WHITE};
  }
  
  a {
    color: ${GDS_COLORS.WHITE};
  }
`;

const Card = styled('div')`
  background-color: ${GDS_COLORS.LIGHT_GREY};
  padding: ${GDS_SPACING[4]};
  margin-bottom: ${GDS_SPACING[4]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[3]};
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
`;

const List = styled('ul')`
  padding-left: ${GDS_SPACING[4]};
  margin-bottom: ${GDS_SPACING[4]};
  list-style-type: disc;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: ${GDS_SPACING.mobile[4]};
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
  
  li {
    margin-bottom: ${GDS_SPACING[1]};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      margin-bottom: ${GDS_SPACING.mobile[1]};
    }
  }
`;

// Enhanced Grid System
const GridRow = styled('div')`
  margin-left: -${GDS_SPACING[3]};
  margin-right: -${GDS_SPACING[3]};
  display: flex;
  flex-wrap: wrap;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    margin-left: -${GDS_SPACING.mobile[2]};
    margin-right: -${GDS_SPACING.mobile[2]};
  }
`;

const GridColumn = styled('div')`
  padding: 0 ${GDS_SPACING[3]};
  box-sizing: border-box;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 ${GDS_SPACING.mobile[2]};
  }
  
  &.one-third {
    width: 33.3333%;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
      width: 50%;
    }
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      width: 100%;
    }
  }
  
  &.two-thirds {
    width: 66.6667%;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
      width: 100%;
    }
  }
  
  &.one-half {
    width: 50%;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
      width: 100%;
    }
  }
  
  &.one-quarter {
    width: 25%;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
      width: 50%;
    }
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      width: 100%;
    }
  }
  
  &.three-quarters {
    width: 75%;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
      width: 100%;
    }
  }
  
  &.full-width {
    width: 100%;
  }
`;

// Enhanced component-specific styles
const StatCard = styled(Card)`
  text-align: center;
  background-color: ${GDS_COLORS.WHITE};
  border: 1px solid ${GDS_COLORS.BORDER_COLOUR};
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: ${GDS_SPACING[3]};
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    min-height: 150px;
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    min-height: 120px;
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
`;

const StatNumber = styled('div')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_48};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  line-height: 1;
  margin-bottom: ${GDS_SPACING[2]};
  color: ${GDS_COLORS.BLACK};
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    font-size: ${GDS_TYPOGRAPHY.SIZE_36};
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_48};
    margin-bottom: ${GDS_SPACING.mobile[2]};
  }
`;

const StatLabel = styled('div')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_19};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  margin-bottom: ${GDS_SPACING[1]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_19};
    margin-bottom: ${GDS_SPACING.mobile[1]};
  }
`;

const StatSource = styled('div')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_14};
  color: ${GDS_COLORS.DARK_GREY};
  font-style: italic;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_14};
  }
`;

const SystemCard = styled('div')`
  background-color: ${GDS_COLORS.WHITE};
  border: 2px solid ${props => props.borderColor || GDS_COLORS.BORDER_COLOUR};
  padding: ${GDS_SPACING[4]};
  margin-bottom: ${GDS_SPACING[4]};
  position: relative;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[3]};
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background-color: ${props => props.borderColor || GDS_COLORS.BORDER_COLOUR};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      width: 3px;
    }
  }
`;

const MetricRow = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${GDS_SPACING[2]} 0;
  border-bottom: 1px solid ${GDS_COLORS.LIGHT_GREY};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[2]} 0;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled('span')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_16};
  color: ${GDS_COLORS.DARK_GREY};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_16};
  }
`;

const MetricValue = styled('span')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_19};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  color: ${GDS_COLORS.BLACK};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_19};
  }
`;

const BulletinCard = styled('div')`
  background-color: ${GDS_COLORS.WHITE};
  border: 1px solid ${GDS_COLORS.BORDER_COLOUR};
  padding: ${GDS_SPACING[4]};
  margin-bottom: ${GDS_SPACING[3]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[3]};
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const BulletinHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${GDS_SPACING[3]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    flex-direction: column;
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
`;

const BulletinID = styled('span')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_14};
  color: ${GDS_COLORS.DARK_GREY};
  font-family: monospace;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_14};
    margin-top: ${GDS_SPACING.mobile[1]};
  }
`;

const ProgressBar = styled('div')`
  width: 100%;
  height: 20px;
  background-color: ${GDS_COLORS.LIGHT_GREY};
  border: 1px solid ${GDS_COLORS.BORDER_COLOUR};
  position: relative;
  margin-bottom: ${GDS_SPACING[2]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    height: 16px;
    margin-bottom: ${GDS_SPACING.mobile[2]};
  }
`;

const ProgressFill = styled('div')`
  height: 100%;
  background-color: ${props => props.color || GDS_COLORS.BLUE};
  width: ${props => props.width}%;
  transition: width 0.3s ease;
`;

// Mobile-optimized Timeline
const Timeline = styled('div')`
  position: relative;
  padding-left: ${GDS_SPACING[6]};
  margin-bottom: ${GDS_SPACING[4]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: ${GDS_SPACING.mobile[5]};
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
  
  &:before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: ${GDS_COLORS.BORDER_COLOUR};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      left: 10px;
    }
  }
`;

const TimelineItem = styled('div')`
  position: relative;
  margin-bottom: ${GDS_SPACING[4]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: ${GDS_SPACING.mobile[4]};
  }
  
  &:before {
    content: '';
    position: absolute;
    left: -35px;
    top: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.color || GDS_COLORS.BLUE};
    border: 2px solid ${GDS_COLORS.WHITE};
    box-shadow: 0 0 0 2px ${props => props.color || GDS_COLORS.BLUE};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      left: -25px;
      width: 10px;
      height: 10px;
      top: 4px;
    }
  }
`;

const TimelineDate = styled('div')`
  font-size: ${GDS_TYPOGRAPHY.SIZE_14};
  color: ${GDS_COLORS.DARK_GREY};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  margin-bottom: ${GDS_SPACING[1]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_14};
    margin-bottom: ${GDS_SPACING.mobile[1]};
  }
`;

const DetailsBox = styled('details')`
  margin-bottom: ${GDS_SPACING[4]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: ${GDS_SPACING.mobile[3]};
  }
  
  summary {
    display: inline-block;
    position: relative;
    margin-bottom: ${GDS_SPACING[2]};
    padding-left: ${GDS_SPACING[5]};
    color: ${GDS_COLORS.LINK};
    cursor: pointer;
    font-size: ${GDS_TYPOGRAPHY.SIZE_19};
    line-height: ${GDS_TYPOGRAPHY.LINE_HEIGHT_19};
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
      font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_19};
      line-height: ${GDS_TYPOGRAPHY.MOBILE_LINE_HEIGHT_19};
      padding-left: ${GDS_SPACING.mobile[5]};
      margin-bottom: ${GDS_SPACING.mobile[2]};
    }
    
    &:hover {
      color: ${GDS_COLORS.LINK_HOVER};
    }
    
    &:focus {
      outline: 3px solid ${GDS_COLORS.FOCUS};
      outline-offset: 0;
      color: ${GDS_COLORS.FOCUS_TEXT};
      background-color: ${GDS_COLORS.FOCUS};
    }
    
    &:before {
      content: "►";
      position: absolute;
      top: 0;
      left: 0;
      width: 20px;
      text-align: center;
      
      @media (max-width: ${BREAKPOINTS.mobile}) {
        width: 16px;
      }
    }
  }
  
  &[open] summary:before {
    content: "▼";
  }
`;

const DetailsContent = styled('div')`
  padding-left: ${GDS_SPACING[5]};
  border-left: 5px solid ${GDS_COLORS.BORDER_COLOUR};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: ${GDS_SPACING.mobile[4]};
    border-left-width: 3px;
  }
`;

const CategoryBadge = styled('span')`
  display: inline-block;
  padding: 2px ${GDS_SPACING[2]};
  background-color: ${props => props.color || GDS_COLORS.BLUE};
  color: ${GDS_COLORS.WHITE};
  font-size: ${GDS_TYPOGRAPHY.SIZE_14};
  font-weight: ${GDS_TYPOGRAPHY.WEIGHT_BOLD};
  margin-right: ${GDS_SPACING[2]};
  margin-bottom: ${GDS_SPACING[2]};
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    font-size: ${GDS_TYPOGRAPHY.MOBILE_SIZE_14};
    padding: 2px ${GDS_SPACING.mobile[2]};
    margin-right: ${GDS_SPACING.mobile[2]};
    margin-bottom: ${GDS_SPACING.mobile[2]};
  }
`;

// Mobile-optimized button container
const ButtonContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${GDS_SPACING[3]};
  justify-content: center;
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    flex-direction: column;
    gap: 0;
    
    button {
      width: 100%;
      margin-bottom: ${GDS_SPACING.mobile[2]};
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

// Mobile-optimized header content
const HeaderContent = styled('div')`
  padding: ${GDS_SPACING[7]} 0;
  
  @media (max-width: ${BREAKPOINTS.tablet}) {
    padding: ${GDS_SPACING[5]} 0;
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: ${GDS_SPACING.mobile[4]} 0;
  }
`;

const ProfessionalVehicleReport = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [motData, setMotData] = useState([]);
  const [tsbData, setTsbData] = useState({});

  useEffect(() => {
    // MOT history data
    setMotData([
      { year: 2019, issues: 2, mileage: 45000, status: 'pass', advisories: ['Nearside Front Anti-roll bar linkage ball joint has slight play'] },
      { year: 2020, issues: 1, mileage: 52000, status: 'pass', advisories: [] },
      { year: 2021, issues: 4, mileage: 58000, status: 'fail', failures: ['Offside Rear Brake disc significantly worn'], advisories: ['Exhaust has a minor leak of exhaust gases'] },
      { year: 2022, issues: 3, mileage: 65000, status: 'pass', advisories: ['Nearside Front Anti-roll bar linkage ball joint has slight play', 'Front brake disc worn'] },
      { year: 2023, issues: 5, mileage: 72000, status: 'fail', failures: ['Service brake efficiency below requirements'], advisories: ['Battery insecure but not likely to fall from carrier'] },
      { year: 2024, issues: 3, mileage: 78000, status: 'pass', advisories: ['Nearside Front Anti-roll bar linkage ball joint has slight play', 'Underside covers corroded'] }
    ]);

    // Simulated TSB data - in real scenario, this would come from the JSON file
    setTsbData({
      categories: {
        'ABS/Brakes': 4,
        'Steering': 5,
        'Electrical': 14,
        'Suspension': 1,
        'Body': 8,
        'Engine management': 7,
        'Drivetrain': 3
      },
      totalBulletins: 28,
      criticalBulletins: 8
    });
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'ABS/Brakes': GDS_COLORS.RED,
      'Steering': GDS_COLORS.ORANGE,
      'Electrical': GDS_COLORS.PURPLE,
      'Suspension': GDS_COLORS.BLUE,
      'Body': GDS_COLORS.GREEN,
      'Engine management': GDS_COLORS.PINK,
      'Drivetrain': GDS_COLORS.DARK_BLUE
    };
    return colors[category] || GDS_COLORS.MID_GREY;
  };

  const getRiskLevel = (issues, trend) => {
    if (issues >= 6 && trend === 'increasing') return { level: 'High', color: GDS_COLORS.RED };
    if (issues >= 4) return { level: 'Medium', color: GDS_COLORS.ORANGE };
    return { level: 'Low', color: GDS_COLORS.GREEN };
  };

  const correlatedIssues = [
    {
      motIssue: "Anti-roll bar linkage wear",
      yearObserved: [2019, 2022, 2024],
      tsbMatch: "TSB-SUS2742",
      bulletinTitle: "Rear shudder when cornering",
      correlation: "High",
      remedy: "Modified anti-roll bar linkage",
      partNumber: "51320-SNA-A01"
    },
    {
      motIssue: "Service brake efficiency",
      yearObserved: [2023],
      tsbMatch: "TSB-BR1284",
      bulletinTitle: "Loss of braking efficiency",
      correlation: "High",
      remedy: "AC compressor clutch relay replacement",
      partNumber: "39794-SDA-A05"
    },
    {
      motIssue: "Exhaust leak",
      yearObserved: [2021],
      tsbMatch: "None",
      bulletinTitle: "No direct TSB match",
      correlation: "N/A",
      remedy: "Standard exhaust repair recommended",
      partNumber: "N/A"
    }
  ];

  return (
    <PageWrapper>
      <Header>
        <Container>
          <HeaderContent>
            <Heading1 style={{ color: GDS_COLORS.WHITE, marginBottom: GDS_SPACING[3] }}>
              Vehicle Technical Analysis Report
            </Heading1>
            <BodyText style={{ color: GDS_COLORS.WHITE }}>
              Comprehensive MOT history correlation with manufacturer technical service bulletins
            </BodyText>
            <SmallText style={{ color: GDS_COLORS.WHITE, marginBottom: 0 }}>
              Honda Civic R16A2 (2006-2012)
            </SmallText>
          </HeaderContent>
        </Container>
      </Header>

      <MainContent>
        <Container>
          {/* Key Statistics */}
          <GridRow>
            <GridColumn className="one-quarter">
              <StatCard>
                <StatNumber>28</StatNumber>
                <StatLabel>Known TSBs</StatLabel>
                <StatSource>Manufacturer database</StatSource>
              </StatCard>
            </GridColumn>
            <GridColumn className="one-quarter">
              <StatCard>
                <StatNumber>67%</StatNumber>
                <StatLabel>MOT Pass Rate</StatLabel>
                <StatSource>6-year history</StatSource>
              </StatCard>
            </GridColumn>
            <GridColumn className="one-quarter">
              <StatCard>
                <StatNumber>3</StatNumber>
                <StatLabel>Critical Systems</StatLabel>
                <StatSource>At risk</StatSource>
              </StatCard>
            </GridColumn>
            <GridColumn className="one-quarter">
              <StatCard>
                <StatNumber>£485</StatNumber>
                <StatLabel>Est. Repair Cost</StatLabel>
                <StatSource>Based on TSBs</StatSource>
              </StatCard>
            </GridColumn>
          </GridRow>

          <SectionBreak className="section-break--xl section-break--visible" />

          {/* System Risk Analysis Section */}
          <Panel>
            <Heading2>System Risk Analysis</Heading2>
            
            <NotificationBanner>
              <Heading3 style={{ marginTop: 0 }}>3 High-Priority Issues Identified</Heading3>
              <BodyText style={{ color: GDS_COLORS.WHITE, marginBottom: 0 }}>
                Based on recurring MOT failures and manufacturer bulletins, immediate attention 
                recommended for suspension and braking systems.
              </BodyText>
            </NotificationBanner>

            <GridRow>
              <GridColumn className="one-half">
                <SystemCard borderColor={GDS_COLORS.RED}>
                  <Heading3 style={{ marginTop: 0 }}>Suspension System</Heading3>
                  <Tag color={GDS_COLORS.RED}>HIGH RISK</Tag>
                  
                  <MetricRow>
                    <MetricLabel>MOT Mentions</MetricLabel>
                    <MetricValue>4 times</MetricValue>
                  </MetricRow>
                  <MetricRow>
                    <MetricLabel>Related TSBs</MetricLabel>
                    <MetricValue>1 bulletin</MetricValue>
                  </MetricRow>
                  <MetricRow>
                    <MetricLabel>Pattern</MetricLabel>
                    <MetricValue>Every 2-3 years</MetricValue>
                  </MetricRow>
                  
                  <DetailsBox>
                    <summary>View technical details</summary>
                    <DetailsContent>
                      <Heading4>Recurring Issue</Heading4>
                      <BodyText>Anti-roll bar linkage ball joint wear detected in 2019, 2022, and 2024.</BodyText>
                      
                      <Heading4>TSB Correlation</Heading4>
                      <BodyText>
                        <strong>TSB-SUS2742:</strong> Rear shudder when cornering<br/>
                        <strong>Solution:</strong> Replace anti-roll bar linkage<br/>
                        <strong>Part:</strong> 51320-SNA-A01
                      </BodyText>
                    </DetailsContent>
                  </DetailsBox>
                </SystemCard>
              </GridColumn>

              <GridColumn className="one-half">
                <SystemCard borderColor={GDS_COLORS.ORANGE}>
                  <Heading3 style={{ marginTop: 0 }}>Braking System</Heading3>
                  <Tag color={GDS_COLORS.ORANGE}>MEDIUM RISK</Tag>
                  
                  <MetricRow>
                    <MetricLabel>MOT Failures</MetricLabel>
                    <MetricValue>2 times</MetricValue>
                  </MetricRow>
                  <MetricRow>
                    <MetricLabel>Related TSBs</MetricLabel>
                    <MetricValue>4 bulletins</MetricValue>
                  </MetricRow>
                  <MetricRow>
                    <MetricLabel>Last Issue</MetricLabel>
                    <MetricValue>2023</MetricValue>
                  </MetricRow>
                  
                  <DetailsBox>
                    <summary>View technical details</summary>
                    <DetailsContent>
                      <Heading4>Recent Failures</Heading4>
                      <BodyText>Service brake efficiency below requirements in 2023. Brake disc significantly worn in 2021.</BodyText>
                      
                      <Heading4>TSB Correlation</Heading4>
                      <BodyText>
                        <strong>Multiple TSBs available:</strong> Front brake judder, ABS warning lamp issues, brake system warning lamp illumination
                      </BodyText>
                    </DetailsContent>
                  </DetailsBox>
                </SystemCard>
              </GridColumn>
            </GridRow>

            <GridRow>
              <GridColumn className="full-width">
                <Card>
                  <Heading3>System Health Overview</Heading3>
                  {Object.entries(tsbData.categories || {}).map(([category, count]) => (
                    <div key={category} style={{ marginBottom: GDS_SPACING[3] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: GDS_SPACING[1] }}>
                        <strong>{category}</strong>
                        <span>{count} TSBs</span>
                      </div>
                      <ProgressBar>
                        <ProgressFill 
                          width={(count / 14) * 100} 
                          color={getCategoryColor(category)}
                        />
                      </ProgressBar>
                    </div>
                  ))}
                </Card>
              </GridColumn>
            </GridRow>
          </Panel>

          <SectionBreak className="section-break--xl section-break--visible" />

          {/* MOT History Timeline Section */}
          <Panel>
            <Heading2>MOT History Timeline</Heading2>
            
            <Timeline>
              {motData.reverse().map((test, index) => (
                <TimelineItem key={index} color={test.status === 'fail' ? GDS_COLORS.RED : GDS_COLORS.GREEN}>
                  <TimelineDate>{test.year} - {test.mileage.toLocaleString()} miles</TimelineDate>
                  <Tag color={test.status === 'fail' ? GDS_COLORS.RED : GDS_COLORS.GREEN}>
                    {test.status.toUpperCase()}
                  </Tag>
                  
                  {test.failures && test.failures.length > 0 && (
                    <div style={{ marginTop: GDS_SPACING[2] }}>
                      <strong>Failures:</strong>
                      <List>
                        {test.failures.map((failure, i) => (
                          <li key={i}>{failure}</li>
                        ))}
                      </List>
                    </div>
                  )}
                  
                  {test.advisories && test.advisories.length > 0 && (
                    <div style={{ marginTop: GDS_SPACING[2] }}>
                      <strong>Advisories:</strong>
                      <List>
                        {test.advisories.map((advisory, i) => (
                          <li key={i}>{advisory}</li>
                        ))}
                      </List>
                    </div>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </Panel>

          <SectionBreak className="section-break--xl section-break--visible" />

          {/* TSB Correlation Analysis Section */}
          <Panel>
            <Heading2>TSB Correlation Analysis</Heading2>
            
            <WarningCallout>
              <Heading3 style={{ marginTop: 0 }}>Critical Correlations Found</Heading3>
              <BodyText>
                2 MOT issues have direct manufacturer technical service bulletin matches. 
                Following TSB remedies could prevent future MOT failures.
              </BodyText>
            </WarningCallout>

            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>MOT Issue</TableHeader>
                    <TableHeader>Years Observed</TableHeader>
                    <TableHeader>TSB Match</TableHeader>
                    <TableHeader>Correlation</TableHeader>
                    <TableHeader>Remedy</TableHeader>
                    <TableHeader>Part Number</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {correlatedIssues.map((issue, index) => (
                    <tr key={index}>
                      <TableCell>
                        <strong>{issue.motIssue}</strong>
                      </TableCell>
                      <TableCell>
                        {issue.yearObserved.join(', ')}
                      </TableCell>
                      <TableCell>
                        <code>{issue.tsbMatch}</code><br/>
                        <SmallText style={{ margin: 0 }}>{issue.bulletinTitle}</SmallText>
                      </TableCell>
                      <TableCell>
                        <Tag 
                          color={
                            issue.correlation === 'High' ? GDS_COLORS.GREEN :
                            issue.correlation === 'Medium' ? GDS_COLORS.ORANGE : GDS_COLORS.MID_GREY
                          }
                        >
                          {issue.correlation}
                        </Tag>
                      </TableCell>
                      <TableCell>{issue.remedy}</TableCell>
                      <TableCell>
                        <code>{issue.partNumber}</code>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <InsetText>
              <Heading3 style={{ marginTop: 0 }}>Cost Savings Analysis</Heading3>
              <BodyText>
                Implementing TSB remedies proactively could save approximately <strong>£485</strong> in 
                MOT failure repairs and retests over the next 3 years.
              </BodyText>
            </InsetText>
          </Panel>

          <SectionBreak className="section-break--xl section-break--visible" />

          {/* Issue Categories Breakdown Section */}
          <Panel>
            <Heading2>Issue Categories Breakdown</Heading2>
            
            <div style={{ marginBottom: GDS_SPACING[4] }}>
              {Object.entries(tsbData.categories || {}).map(([category, count]) => (
                <CategoryBadge 
                  key={category} 
                  color={getCategoryColor(category)}
                  onClick={() => setSelectedCategory(category)}
                  style={{ cursor: 'pointer' }}
                >
                  {category} ({count})
                </CategoryBadge>
              ))}
            </div>

            <GridRow>
              <GridColumn className="one-half">
                <BulletinCard>
                  <BulletinHeader>
                    <div>
                      <Heading4 style={{ marginTop: 0 }}>Battery Discharge Issues</Heading4>
                      <CategoryBadge color={getCategoryColor('Electrical')}>Electrical</CategoryBadge>
                    </div>
                    <BulletinID>ID: 26</BulletinID>
                  </BulletinHeader>
                  
                  <BodyText>Multiple TSBs address battery discharge problems related to AC compressor clutch relay faults.</BodyText>
                  
                  <DetailsBox>
                    <summary>Technical details</summary>
                    <DetailsContent>
                      <SmallText>
                        <strong>Affected:</strong> All models with air conditioning<br/>
                        <strong>Cause:</strong> Faulty AC compressor clutch relay (Omron manufacture)<br/>
                        <strong>Solution:</strong> Replace relay with part 39794-SDA-A05
                      </SmallText>
                    </DetailsContent>
                  </DetailsBox>
                </BulletinCard>
              </GridColumn>

              <GridColumn className="one-half">
                <BulletinCard>
                  <BulletinHeader>
                    <div>
                      <Heading4 style={{ marginTop: 0 }}>Electric Power Steering</Heading4>
                      <CategoryBadge color={getCategoryColor('Steering')}>Steering</CategoryBadge>
                    </div>
                    <BulletinID>ID: 12</BulletinID>
                  </BulletinHeader>
                  
                  <BodyText>EPS warning lamp illumination and inoperative power steering commonly caused by connection issues.</BodyText>
                  
                  <DetailsBox>
                    <summary>Technical details</summary>
                    <DetailsContent>
                      <SmallText>
                        <strong>Affected:</strong> All models<br/>
                        <strong>Cause:</strong> Poor connection between EPS pump motor and harness<br/>
                        <strong>Solution:</strong> Check and ensure positive connection to ECM
                      </SmallText>
                    </DetailsContent>
                  </DetailsBox>
                </BulletinCard>
              </GridColumn>
            </GridRow>

            <Card>
              <Heading3>Most Common TSB Categories</Heading3>
              <ol>
                <li><strong>Electrical (14 TSBs):</strong> Battery discharge, warning lamps, mirror issues</li>
                <li><strong>Body (8 TSBs):</strong> Door mechanisms, mirrors, fuel flap</li>
                <li><strong>Engine Management (7 TSBs):</strong> MIL illumination, trouble codes</li>
                <li><strong>Steering (5 TSBs):</strong> EPS failures, ESP warnings</li>
                <li><strong>ABS/Brakes (4 TSBs):</strong> Brake judder, warning lamps</li>
              </ol>
            </Card>
          </Panel>

          <SectionBreak className="section-break--xl" />

          {/* Call to Action */}
          <div style={{ textAlign: 'center', marginTop: GDS_SPACING[8] }}>
            <Heading2>Generate Full Technical Report</Heading2>
            <BodyText style={{ maxWidth: '600px', margin: '0 auto', marginBottom: GDS_SPACING[6] }}>
              Get a comprehensive PDF report with all TSB details, MOT history analysis, and 
              recommended maintenance schedule based on your vehicle's specific history.
            </BodyText>
            <ButtonContainer>
              <Button>
                Download Complete Analysis
              </Button>
              <SecondaryButton>
                Schedule Inspection
              </SecondaryButton>
            </ButtonContainer>
          </div>
        </Container>
      </MainContent>
    </PageWrapper>
  );
};

export default ProfessionalVehicleReport;