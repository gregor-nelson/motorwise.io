/**
 * HERO SECTION STYLES
 * Optimized, focused styles for the Hero component only
 */

import { styled } from '@mui/material/styles';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,
  typographyBase,
  respondTo,
} from '../../../../styles/theme';

// Hero Section Container
export const HeroSection = styled('section')`
  background-color: ${COLORS.LIGHT_GREY};
  padding: ${SPACING.XXL} 0;
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.XL} 0;
  }
`;

// Hero Content Container
export const HeroContainer = styled('div')`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${SPACING.XL};
  
  ${respondTo('MOBILE')} {
    padding: 0 ${SPACING.M};
  }
`;

// Hero Title
export const HeroTitle = styled('h1')`
  ${typographyBase}
  margin: ${SPACING.XL} 0;
  font-size: ${FONT_SIZES.XXXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.XXL};
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    margin: ${SPACING.L} 0;
    font-size: ${FONT_SIZES.XXXXL};
    line-height: ${LINE_HEIGHTS.XL};
  }
`;

// Hero Lead Text
export const HeroLead = styled('p')`
  ${typographyBase}
  font-size: ${FONT_SIZES.XXL};
  line-height: ${LINE_HEIGHTS.L};
  margin-bottom: ${SPACING.XL};
  max-width: 50ch;
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    margin-bottom: ${SPACING.L};
  }
`;

// Hero Search Panel
export const HeroSearchPanel = styled('div')`
  background-color: ${COLORS.WHITE};
  padding: ${SPACING.L};
  margin-bottom: ${SPACING.XL};
  border-left: 5px solid ${COLORS.BLUE};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.15s ease-out;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
  
  ${respondTo('MOBILE')} {
    padding: ${SPACING.M};
    margin-bottom: ${SPACING.L};
  }
`;

// Hero Search Title
export const HeroSearchTitle = styled('h2')`
  ${typographyBase}
  margin: 0 0 ${SPACING.M} 0;
  font-size: ${FONT_SIZES.XXL};
  font-weight: 700;
  line-height: ${LINE_HEIGHTS.L};
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
`;