import { styled, css } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
  Box,
  Typography,
  Button,
  InputBase,
  TableCell,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  GovUKContainer,
  GovUKHeadingS,
  GovUKHeadingM,
  GovUKList,
  GovUKBody,
  GovUKBodyS,
  GovUKButton,
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,
  respondTo,
  commonFontStyles,
  printStyles,
  formControlBase,
  typographyBase,
  standardSpacing,
  focusStyles,
  linkStyles,
  PremiumInfoPanel as ThemePremiumInfoPanel,
  ResponsiveFlex
} from '../../../styles/theme'; // Adjust path as needed

// Import custom components from VehicleAnalysisComponent
import {
  InsightsContainer,
  InsightPanel,
  InsightBody,
  InsightTable,
  ValueHighlight,
  FactorList,
  FactorItem,
  InsightNote,
  EnhancedLoadingContainer,
  EmptyStateContainer
} from '../../Premium/DVLA/Insights/style/style'; // Adjust path as needed

// ======================================================
// Main Container
// ======================================================

/**
 * Main container for bulletins - aligned with GovUKContainer pattern
 * Provides consistent max-width and spacing
 */
export const BulletinsContainer = styled(GovUKContainer)`
  ${commonFontStyles}
  ${printStyles}
  margin-bottom: ${SPACING.XXL};
  max-width: 1200px;
`;

// ======================================================
// Header Components
// ======================================================

/**
 * Page header and title components following GOV.UK header patterns
 */
export const PageHeader = styled(Box)`
  margin-bottom: ${SPACING.XL};
  padding-bottom: ${SPACING.L};
  border-bottom: 1px solid ${COLORS.MID_GREY};
`;

export const PageTitle = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.XXXL};
  font-weight: 700;
  line-height: 1.09375;
  margin-bottom: ${SPACING.M};
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
  }
`;

export const VehicleInfo = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.M};
  line-height: ${LINE_HEIGHTS.S};
  color: ${COLORS.BLACK};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

// ======================================================
// Panel Components 
// ======================================================

/**
 * Panel components for displaying bulletin content
 * Following consistent design patterns with colored borders
 */
export const BulletinPanel = styled(InsightPanel)`
  border-left-color: ${COLORS.BLUE};
`;

export const BulletinListPanel = styled(InsightPanel)`
  border-left-color: ${COLORS.BLUE};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
`;

export const BulletinDetailPanel = styled(InsightPanel, {
  shouldForwardProp: prop => prop !== 'color',
})`
  border-left-color: ${props => props.color || COLORS.BLUE};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
`;

export const EnhancedDetailSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})`
  ${commonFontStyles}
  ${printStyles}
  margin-bottom: ${SPACING.XL};
  padding: ${SPACING.L};
  background-color: ${COLORS.WHITE};
  border: 1px solid ${COLORS.MID_GREY};
  border-left: 5px solid ${props => props.color || COLORS.BLUE};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XXL};
  }
`;

export const EnhancedSectionHeading = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.L};
  font-weight: 700;
  margin-bottom: ${SPACING.L};
  color: ${COLORS.BLACK};
  padding-bottom: ${SPACING.S};
  border-bottom: 2px solid ${COLORS.MID_GREY};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXL};
    line-height: ${LINE_HEIGHTS.XL};
    margin-bottom: ${SPACING.XL};
  }
`;

// ======================================================
// Category Components 
// ======================================================

/**
 * Components for filtering bulletins by category
 * Provides consistent style for category selection
 */
export const CategoryContainer = styled('div')`
  ${commonFontStyles}
  margin-bottom: ${SPACING.XL};
`;

export const CategoryTitle = styled(GovUKHeadingS)`
  margin-bottom: ${SPACING.M};
`;

export const CategoryList = styled(GovUKList)`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const CategoryItem = styled('li', {
  shouldForwardProp: prop => prop !== 'isActive',
})`
  ${commonFontStyles}
  padding: ${SPACING.XS} ${SPACING.M};
  margin-bottom: ${SPACING.XS};
  cursor: pointer;
  background-color: ${props => props.isActive ? COLORS.LIGHT_GREY : 'transparent'};
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};
  border-left: ${props => props.isActive ? `4px solid ${COLORS.BLUE}` : '4px solid transparent'};
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    ${focusStyles}
  }
`;

export const CategoryCount = styled('span')`
  ${commonFontStyles}
  color: ${COLORS.DARK_GREY};
  margin-left: ${SPACING.XS};
  font-size: ${FONT_SIZES.XS};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
  }
`;

// ======================================================
// Search Components 
// ======================================================

/**
 * Components for searching and filtering bulletins
 * Follows GOV.UK form element patterns
 */
export const SearchContainer = styled('div')`
  ${commonFontStyles}
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    flex-wrap: wrap;
    gap: ${SPACING.M};
    margin-bottom: ${SPACING.XXL};
  }
`;

export const SearchInput = styled('input')`
  ${formControlBase}
  padding: ${SPACING.XS} ${SPACING.S};
  width: 100%;
  max-width: 300px;
  
  &:focus {
    outline: 3px solid ${COLORS.FOCUS};
    outline-offset: 0;
  }
`;

export const MaterialSearchInput = styled(InputBase)`
  ${commonFontStyles}
  padding: ${SPACING.M} ${SPACING.M};
  border: 2px solid ${COLORS.BLACK};
  border-radius: 0;
  width: 100%;
  max-width: 300px;
  font-size: ${FONT_SIZES.S};
  height: 2.5rem;
  
  &:focus {
    outline: 3px solid ${COLORS.YELLOW};
    outline-offset: 0;
    box-shadow: inset 0 0 0 2px;
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
  }
`;

// ======================================================
// Button Components 
// ======================================================

/**
 * Button components styled to match GOV.UK button patterns
 * Provides consistent styling for different button types
 */
export const GovButton = styled(GovUKButton)`
  margin: 0;
  padding: ${SPACING.XS} ${SPACING.M};
`;

export const BackButton = styled(GovButton)`
  background-color: ${COLORS.MID_GREY};
  box-shadow: 0 2px 0 ${COLORS.DARK_GREY};
  color: ${COLORS.BLACK};
  margin-bottom: ${SPACING.M};
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY_HOVER};
  }
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
`;

export const ActionButton = styled(Button)`
  ${commonFontStyles}
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: 700;
  padding: ${SPACING.XS} ${SPACING.M};
  min-width: auto;
  height: 32px;
  font-size: ${FONT_SIZES.XS};
  border-radius: 0;
  box-shadow: 0 2px 0 ${COLORS.BLUE_DARK};
  text-transform: none;
  margin-left: auto;
  border: 2px solid transparent;
  
  &:hover {
    background-color: ${COLORS.BLUE_HOVER};
    box-shadow: 0 2px 0 ${COLORS.BLUE_DARK};
  }
  
  &:focus {
    outline: 3px solid ${COLORS.YELLOW};
    outline-offset: 0;
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
  }
`;

export const BackLink = styled(Button)`
  ${commonFontStyles}
  color: ${COLORS.BLACK};
  font-weight: 400;
  padding: 0;
  text-transform: none;
  margin-bottom: ${SPACING.XL};
  padding-left: 0.875em;
  position: relative;
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  text-decoration: underline;
  text-decoration-thickness: max(1px, .0625rem);
  text-underline-offset: .1578em;
  
  &:hover {
    background-color: transparent;
    color: rgba(11, 12, 12, 0.99);
  }
  
  &:focus {
    ${focusStyles}
  }
  
  /* Back arrow styling matching GOV.UK pattern */
  &::before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0.1875em;
    width: 0.4375em;
    height: 0.4375em;
    margin: auto 0;
    transform: rotate(225deg);
    border: solid;
    border-width: 1px 1px 0 0;
    border-color: ${COLORS.DARK_GREY};
  }
  
  &:focus::before {
    border-color: ${COLORS.BLACK};
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
  }
`;

// ======================================================
// Bulletin List Components 
// ======================================================

/**
 * Components for displaying lists of bulletins
 * Provides consistent styling for bulletin items
 */
export const BulletinsList = styled('ul')`
  ${commonFontStyles}
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const BulletinItem = styled('li')`
  ${commonFontStyles}
  border-bottom: 1px solid ${COLORS.MID_GREY};
  padding: ${SPACING.M} 0;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L} 0;
  }
`;

export const MaterialBulletinItem = styled(Box)`
  ${commonFontStyles}
  padding: ${SPACING.M} ${SPACING.L};
  margin-bottom: ${SPACING.S};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  border-left: 4px solid ${COLORS.BLUE};
  background-color: ${COLORS.WHITE};
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-left-color: ${COLORS.LINK_HOVER};
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L} ${SPACING.L};
  }
`;

export const BulletinTitle = styled(GovUKHeadingS)`
  margin-bottom: ${SPACING.XS};
`;

export const MaterialBulletinTitle = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.XL};
  line-height: 1.2;
  font-weight: 700;
  color: ${COLORS.BLUE};
  margin-bottom: ${SPACING.XS};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXL};
    line-height: ${LINE_HEIGHTS.L};
  }
`;

export const BulletinDescription = styled(GovUKBody)`
  margin-bottom: ${SPACING.S};
`;

export const BulletinProblem = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.S};
  line-height: 1.3;
  margin-bottom: ${SPACING.S};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

// ======================================================
// Metadata Components 
// ======================================================

/**
 * Components for displaying bulletin metadata
 * Provides consistent styling for metadata items
 */
export const MetadataContainer = styled('div')`
  ${commonFontStyles}
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.M};
  margin-bottom: ${SPACING.XS};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.S};
  }
`;

export const MetadataItem = styled(GovUKBodyS)`
  color: ${COLORS.DARK_GREY};
  display: flex;
  align-items: center;
  gap: ${SPACING.XS};
`;

export const BulletinMeta = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.M};
  align-items: center;
`;

export const MetaItem = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.XS};
  line-height: ${LINE_HEIGHTS.XS};
  color: ${COLORS.DARK_GREY};
  display: inline-flex;
  align-items: center;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
    line-height: ${LINE_HEIGHTS.S};
  }
`;

// ======================================================
// Layout Components 
// ======================================================

/**
 * Layout components for overall page structure
 * Ensures responsive layout with appropriate spacing
 */
export const MainLayout = styled(ResponsiveFlex)`
  gap: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    flex-direction: row;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${SPACING.M};
  }
`;

export const MainContent = styled(Box)`
  display: flex;
  gap: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    flex-direction: column;
  }
`;

// ======================================================
// Sidebar Components
// ======================================================

/**
 * Sidebar components for navigation and filtering
 * Ensures consistent styling and scrolling behavior
 */
export const Sidebar = styled('div')`
  ${commonFontStyles}
  flex: 0 0 250px;
  max-height: 600px;
  overflow: auto;
  padding-right: ${SPACING.S};
  
  /* Custom scrollbar styling that matches GOV.UK design system */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${COLORS.LIGHT_GREY};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.MID_GREY};
    
    &:hover {
      background: ${COLORS.DARK_GREY};
    }
  }
  
  @media (max-width: 768px) {
    flex: 1 1 auto;
    max-height: none;
    padding-right: 0;
    margin-bottom: ${SPACING.L};
  }
  
  ${respondTo('MOBILE')} {
    max-height: 500px;
  }
`;

export const MaterialSidebar = styled(Box)`
  width: 250px;
  flex-shrink: 0;
  
  ${respondTo('MOBILE')} {
    width: 100%;
    margin-bottom: ${SPACING.XL};
  }
`;

export const SidebarTitle = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: 700;
  margin-bottom: ${SPACING.M};
  padding-bottom: ${SPACING.S};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XL};
    line-height: ${LINE_HEIGHTS.S};
  }
`;

export const MaterialCategoryItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})`
  ${commonFontStyles}
  padding: ${SPACING.S} 0;
  color: ${props => props.isActive ? COLORS.BLUE : 'inherit'};
  font-weight: ${props => props.isActive ? 700 : 400};
  border-left: ${props => props.isActive ? `4px solid ${COLORS.BLUE}` : '4px solid transparent'};
  padding-left: ${SPACING.M};
  cursor: pointer;
  
  &:hover {
    color: ${COLORS.BLUE};
    text-decoration: underline;
  }
  
  &:focus {
    ${focusStyles}
  }
`;

// ======================================================
// Content Area Components
// ======================================================

/**
 * Components for the main content area with scrolling
 * Ensures consistent styling for scrollable content
 */
export const ContentArea = styled('div')`
  ${commonFontStyles}
  flex: 1 1 auto;
  max-height: 600px;
  overflow: auto;
  padding: 0 ${SPACING.S} ${SPACING.S} 0;
  
  /* Custom scrollbar styling that matches GOV.UK design system */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${COLORS.LIGHT_GREY};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.MID_GREY};
    
    &:hover {
      background: ${COLORS.DARK_GREY};
    }
  }
  
  ${respondTo('MOBILE')} {
    max-height: 500px;
  }
  
  @media (max-width: 768px) {
    padding: 0 0 ${SPACING.S} 0;
  }
`;

export const BulletinsContent = styled(Box)`
  flex-grow: 1;
`;

export const BulletinsScrollContainer = styled(Box)`
  height: 600px;
  overflow-y: auto;
  padding: ${SPACING.M};
  border: 1px solid ${COLORS.MID_GREY};
  background-color: ${COLORS.LIGHT_GREY};
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.MID_GREY};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${COLORS.BLUE};
  }
`;

// ======================================================
// Detail Components 
// ======================================================

/**
 * Components for displaying bulletin details
 * Provides consistent styling for detailed content
 */
export const DetailSectionTitle = styled(GovUKHeadingS)`
  border-bottom: 2px solid ${COLORS.MID_GREY};
  padding-bottom: ${SPACING.XS};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
`;

export const DetailList = styled('ul')`
  ${commonFontStyles}
  margin: 0 0 ${SPACING.XL} ${SPACING.L};
  padding: 0;
`;

export const MaterialDetailList = styled('ul')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.XL};
  padding-left: 20px;
  
  & li {
    margin-bottom: ${SPACING.M};
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const OrderedList = styled('ol')`
  ${typographyBase}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  margin-bottom: ${SPACING.XL};
  padding-left: 20px;
  
  & li {
    margin-bottom: ${SPACING.M};
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const DetailSection = styled(Box)`
  ${standardSpacing}
`;

export const DetailTitle = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.XXXL};
  line-height: 1.09375;
  font-weight: 700;
  margin-bottom: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
  }
`;

export const SectionHeading = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.XXL};
  font-weight: 700;
  margin-bottom: ${SPACING.L};
  padding-bottom: ${SPACING.S};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
    margin-bottom: ${SPACING.XL};
  }
`;

export const SubSectionHeading = styled(Typography)`
  ${typographyBase}
  font-size: ${FONT_SIZES.XL};
  line-height: ${LINE_HEIGHTS.S};
  font-weight: 700;
  margin-bottom: ${SPACING.M};
  margin-top: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXL};
    line-height: ${LINE_HEIGHTS.L};
    margin-bottom: ${SPACING.L};
  }
`;

// ======================================================
// Table Components 
// ======================================================

/**
 * Components for displaying data in tables
 * Ensures consistent table styling
 */
export const TableHeader = styled(TableCell)`
  ${commonFontStyles}
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: 700;
  padding: ${SPACING.M};
  font-size: ${FONT_SIZES.S};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
  }
`;

export const TableBodyCell = styled(TableCell)`
  ${commonFontStyles}
  border-bottom: 1px solid ${COLORS.MID_GREY};
  padding: ${SPACING.M};
  font-size: ${FONT_SIZES.S};
  
  &:first-of-type {
    font-weight: 700;
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
  }
`;

// ======================================================
// Message Components 
// ======================================================

/**
 * Components for displaying various messages and states
 * Provides consistent styling for message panels
 */
export const WarningPanel = styled(InsightNote)`
  background-color: #fff4f4; /* Light red background */
  border-color: ${COLORS.RED};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
`;

export const MaterialWarningPanel = styled(Box)`
  ${typographyBase}
  display: flex;
  align-items: flex-start;
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  clear: both;
  background-color: rgba(212, 53, 28, 0.1);
  border-left: 5px solid ${COLORS.RED};
  
  & svg {
    color: ${COLORS.RED};
    margin-right: ${SPACING.M};
    margin-top: ${SPACING.XS};
    flex-shrink: 0;
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.XL};
  }
`;

export const InfoPanel = styled(Box)`
  ${typographyBase}
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  clear: both;
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${COLORS.BLUE};
  
  & svg {
    margin-right: ${SPACING.S};
    color: ${COLORS.BLUE};
    vertical-align: middle;
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.XL};
  }
`;

export const PremiumInfoPanel = styled(Box)`
  ${typographyBase}
  display: flex;
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  clear: both;
  background-color: ${COLORS.LIGHT_GREY};
  border-left: 5px solid ${COLORS.BLUE};
  
  & svg {
    margin-right: ${SPACING.M};
    margin-top: ${SPACING.XS};
    color: ${COLORS.BLUE};
    flex-shrink: 0;
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.XL};
  }
`;

export const MessageContainer = styled(Box)`
  ${commonFontStyles}
  padding: ${SPACING.XL};
  text-align: center;
`;

export const NoMatchContainer = styled(Box)`
  ${commonFontStyles}
  padding: ${SPACING.XL};
  background-color: ${COLORS.LIGHT_GREY};
  text-align: center;
`;

// ======================================================
// State Components 
// ======================================================

/**
 * Components for displaying state information (empty, loading)
 * Ensures consistent styling for different states
 */
export const StyledEmptyStateContainer = styled(EmptyStateContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${SPACING.L};
  text-align: center;
  min-height: 300px;
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.XL};
  }
`;

export const LoadingContainer = styled(Box)`
  text-align: center;
  padding: ${SPACING.XL} 0;
  margin: ${SPACING.L} 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${SPACING.M};
`;

export const StyledCircularProgress = styled(CircularProgress)`
  color: ${COLORS.BLUE};
`;

// ======================================================
// Highlight Components 
// ======================================================

/**
 * Components for highlighting values
 * Ensures consistent styling for highlighted content
 */
export const StyledValueHighlight = styled('span')`
  ${commonFontStyles}
  font-weight: 700;
  color: ${COLORS.BLUE};
`;

// ======================================================
// Footer Components 
// ======================================================

/**
 * Components for footer notes and information
 * Provides consistent styling for footer elements
 */
export const StyledFooterNote = styled(Box)`
  ${commonFontStyles}
  ${printStyles}
  background-color: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.M};
  margin-top: ${SPACING.XL};
  border-top: 5px solid ${COLORS.BLUE};
  font-size: ${FONT_SIZES.S};
  color: ${COLORS.DARK_GREY};
  
  & svg {
    margin-right: ${SPACING.S};
    color: ${COLORS.BLUE};
    vertical-align: middle;
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    font-size: ${FONT_SIZES.L};
    margin-top: ${SPACING.XXL};
  }
`;

// ======================================================
// Tab Components 
// ======================================================

/**
 * Components for tabbed interfaces
 * Ensures consistent styling for tabs and panels
 */
export const StyledTabs = styled(Tabs)`
  ${commonFontStyles}
  margin-bottom: ${SPACING.M};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  
  & .MuiTabs-indicator {
    background-color: ${COLORS.BLUE};
    height: 4px;
  }
  
  & .MuiTabs-scrollButtons {
    color: ${COLORS.BLUE};
  }
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
  }
`;

export const StyledTab = styled(Tab)`
  ${commonFontStyles}
  font-weight: 400;
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  text-transform: none;
  padding: ${SPACING.M} ${SPACING.S};
  min-width: 120px;
  
  &.Mui-selected {
    font-weight: 700;
    color: ${COLORS.BLACK};
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    padding: ${SPACING.M};
    min-width: 150px;
  }
`;

export const TabPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'hidden',
})`
  ${commonFontStyles}
  display: ${props => props.hidden ? 'none' : 'block'};
  padding-top: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    padding-top: ${SPACING.L};
  }
`;

// ======================================================
// Accordion Components 
// ======================================================

/**
 * Components for expandable sections
 * Ensures consistent styling for accordion elements
 */
export const AccordionSection = styled('div')`
  border-top: 1px solid ${COLORS.MID_GREY};
  
  &:last-child {
    border-bottom: 1px solid ${COLORS.MID_GREY};
  }
`;

export const AccordionHeader = styled('button')`
  ${commonFontStyles}
  font-weight: 700;
  font-size: ${FONT_SIZES.M};
  line-height: ${LINE_HEIGHTS.S};
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: ${SPACING.M} 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    ${focusStyles}
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XL};
    line-height: ${LINE_HEIGHTS.M};
    padding: ${SPACING.L} 0;
  }
`;

export const AccordionContent = styled('div')`
  ${commonFontStyles}
  padding: 0 0 ${SPACING.M} 0;
  
  ${respondTo('MOBILE')} {
    padding: 0 0 ${SPACING.L} 0;
  }
`;

export const AccordionIconWrapper = styled('div')`
  display: flex;
  align-items: center;
`;

// ======================================================
// Utility Components 
// ======================================================

/**
 * Utility components for text styling and badges
 * Provides consistent styling for utility elements
 */
export const GovUKToggleText = styled('span')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.XS};
  margin-left: ${SPACING.XS};
  text-decoration: underline;
  color: ${COLORS.BLUE};
  
  &:hover {
    color: ${COLORS.LINK_HOVER};
    text-decoration-thickness: max(3px, .1875rem, .12em);
  }
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
  }
`;

export const OperationCountBadge = styled('span')`
  ${commonFontStyles}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-size: ${FONT_SIZES.XS};
  font-weight: 700;
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.75rem;
  margin-left: ${SPACING.XS};
  padding: 0 ${SPACING.XS};
`;

export const GovUKChevron = styled('svg', {
  shouldForwardProp: prop => prop !== 'expanded',
})`
  fill: currentColor;
  width: 1.25rem;
  height: 1.25rem;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.25s ease;
  
  ${respondTo('MOBILE')} {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

// ======================================================
// Summary Components 
// ======================================================

/**
 * Components for summary panels and operations
 * Provides consistent styling for summary content
 */
export const SummaryPanel = styled(ThemePremiumInfoPanel)`
  margin-bottom: ${SPACING.L};
  
  & dl {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
  }
  
  & dl > div {
    flex: 1;
    min-width: 200px;
    margin-bottom: ${SPACING.M};
    padding-right: ${SPACING.M};
  }
  
  & dt {
    ${commonFontStyles}
    font-weight: 700;
    margin-bottom: ${SPACING.XS};
  }
  
  & dd {
    ${commonFontStyles}
    margin-left: 0;
    font-size: ${FONT_SIZES.XXL};
  }
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.XL};
    
    & dd {
      font-size: ${FONT_SIZES.XXXL};
    }
  }
`;

export const OperationsGroup = styled(GovUKList)`
  display: flex;
  flex-direction: column;
  padding-left: 0;
`;

export const OperationItem = styled('div')`
  ${commonFontStyles}
  padding: ${SPACING.XS} 0;
  position: relative;
  
  &:not(:first-of-type) {
    margin-top: ${SPACING.XS};
    padding-top: ${SPACING.S};
    border-top: 1px dashed ${COLORS.MID_GREY};
  }
`;

// ======================================================
// Re-exported Components
// ======================================================

/**
 * Re-export components from InsightsContainer for convenience
 * These are used directly by the BulletinsComponent
 */
export {
  InsightsContainer,
  InsightPanel,
  InsightBody,
  InsightTable,
  ValueHighlight,
  FactorList,
  FactorItem,
  InsightNote,
  EnhancedLoadingContainer
};