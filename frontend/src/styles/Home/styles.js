import { styled, css } from '@mui/material/styles';
import {
  GovUKLink,
  GovUKList,
  GovUKBody,
  GovUKHeadingS,
  GovUKHeadingM,
  GovUKButton,
  COLORS,
  SPACING,
  respondTo,
  commonFontStyles,
  typographyBase,
  standardSpacing,
  FONT_SIZES,
  LINE_HEIGHTS
} from '../theme';

// ======================================================
// Navigation Components
// ======================================================
export const QuickLinksContainer = styled('div')`
  background: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.M};
  margin-top: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-top: ${SPACING.L};
  }
`;

export const NavLinkList = styled(GovUKList)`
  margin-top: ${SPACING.S};
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.M};
  }
`;

export const NavLinkItem = styled('li')`
  margin: ${SPACING.XS} 0;
  
  ${respondTo('MOBILE')} {
    margin: ${SPACING.S} 0;
  }
`;

// ======================================================
// Feature Card Components
// ======================================================
export const FeatureCardContainer = styled('div')`
  ${standardSpacing}
  border: 1px solid ${COLORS.MID_GREY};
  padding: ${SPACING.L};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const FeatureCardHeader = styled('div')`
  margin-bottom: ${SPACING.S};
  display: flex;
  align-items: center;
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.M};
  }
`;

export const FeatureCardIcon = styled('span')`
  font-size: ${FONT_SIZES.XXL};
  margin-right: ${SPACING.S};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXXL};
    margin-right: ${SPACING.M};
  }
`;

// ======================================================
// Table Components for Data Information
// ======================================================
export const DataTable = styled('div')`
  border: 1px solid ${COLORS.MID_GREY};
  margin-bottom: ${SPACING.XL};
`;

export const TableHeader = styled('div')`
  ${commonFontStyles}
  background-color: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.M};
  border-bottom: 1px solid ${COLORS.MID_GREY};
  font-weight: 700;
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
  }
`;

export const TableRow = styled('div')`
  display: flex;
  border-bottom: ${props => props.noBorder ? 'none' : `1px solid ${COLORS.MID_GREY}`};
`;

export const TableCell = styled('div')`
  ${commonFontStyles}
  width: ${props => props.width || '50%'};
  padding: ${SPACING.M};
  border-right: ${props => props.noRightBorder ? 'none' : `1px solid ${COLORS.MID_GREY}`};
  font-weight: ${props => props.bold ? '700' : '400'};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

// ======================================================
// Step Guide Components
// ======================================================
export const StepGuideContainer = styled('div')`
  ${standardSpacing}
`;

export const StepItem = styled('div')`
  display: flex;
  margin-bottom: ${SPACING.S};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.M};
  }
`;

export const StepNumber = styled('div')`
  ${commonFontStyles}
  width: 100px;
  font-weight: 700;
  margin-right: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const StepContent = styled('div')`
  flex: 1;
`;

// ======================================================
// Warning Text Component
// ======================================================
export const WarningTextContainer = styled('div')`
  padding: ${SPACING.M} ${SPACING.M} ${SPACING.M} ${SPACING.XXXL};
  margin-bottom: ${SPACING.XL};
  border-left: 5px solid ${COLORS.RED};
  position: relative;
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L} ${SPACING.L} ${SPACING.L} ${SPACING.XXXL};
  }
`;

export const WarningTextIcon = styled('span')`
  position: absolute;
  left: ${SPACING.M};
  top: ${SPACING.M};
  font-weight: 700;
  font-size: ${FONT_SIZES.XXL};
  
  ${respondTo('MOBILE')} {
    left: ${SPACING.L};
    top: ${SPACING.L};
  }
`;

export const WarningTextBody = styled(GovUKBody)`
  margin: 0;
`;

// ======================================================
// Sidebar Components
// ======================================================
export const SidebarContainer = styled('div')`
  margin-top: ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.XXL};
  }
`;

export const LegalPanel = styled('div')`
  ${commonFontStyles}
  background-color: ${COLORS.GREEN};
  color: ${COLORS.WHITE};
  padding: ${SPACING.L};
  margin-bottom: ${SPACING.L};
  font-size: ${FONT_SIZES.L};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.XL};
    margin-bottom: ${SPACING.XL};
  }
`;

export const SidebarHeading = styled(GovUKHeadingM)`
  color: ${COLORS.WHITE};
`;

export const SidebarBody = styled(GovUKBody)`
  color: ${COLORS.WHITE};
`;

export const SidebarList = styled('ul')`
  ${commonFontStyles}
  list-style-type: disc;
  color: ${COLORS.WHITE};
  padding-left: ${SPACING.L};
  margin-bottom: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${SPACING.L};
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;

export const InfoBox = styled('div')`
  border: 1px solid ${COLORS.MID_GREY};
  padding: ${SPACING.L};
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.XL};
    margin-bottom: ${SPACING.XL};
  }
`;

export const AppDownloadContainer = styled('div')`
  background-color: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.M};
  margin-bottom: ${SPACING.L};
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.L};
    margin-bottom: ${SPACING.XL};
  }
`;

export const AppButton = styled(GovUKButton)`
  margin-right: ${props => props.noMargin ? '0' : SPACING.S};
  margin-bottom: ${SPACING.S};
  background-color: ${COLORS.MID_GREY};
  color: ${COLORS.BLACK};
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY_HOVER};
  }
  
  ${respondTo('MOBILE')} {
    margin-right: ${props => props.noMargin ? '0' : SPACING.M};
  }
`;

export const ButtonContainer = styled('div')`
  margin-top: ${SPACING.M};
  
  ${respondTo('MOBILE')} {
    margin-top: ${SPACING.L};
  }
`;

// ======================================================
// Custom Tag Component
// ======================================================
export const CustomTag = styled('div')`
  ${commonFontStyles}
  display: inline-block;
  margin: 0 ${SPACING.XS} 0 0;
  padding: ${SPACING.XS} ${SPACING.S};
  font-size: ${FONT_SIZES.S};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.M};
    padding: ${SPACING.XS} ${SPACING.M};
  }
`;

// ======================================================
// Section Spacing Utility
// ======================================================
export const SectionContainer = styled('div')`
  margin-bottom: ${props => props.spacingBottom || SPACING.XL};
  margin-top: ${props => props.spacingTop || '0'};
  
  ${respondTo('MOBILE')} {
    margin-bottom: ${props => props.spacingBottom || SPACING.XXL};
  }
`;