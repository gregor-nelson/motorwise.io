import React from 'react';
import { styled } from '@mui/material/styles';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,
  commonFontStyles,
  focusStyles,
  linkStyles,
  GovUKContainer,
  GovUKSkipLink,
  respondTo
} from '../../../../styles/theme';

// Header styled components
const HeaderWrapper = styled('header')`
  ${commonFontStyles}
  background-color: ${COLORS.BLACK};
  border-bottom: 10px solid ${COLORS.BLUE};
  width: 100%;
`;

const HeaderContainer = styled(GovUKContainer)`
  padding-top: ${SPACING.S};
  padding-bottom: ${SPACING.S};
`;

const HeaderContent = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  
  ${respondTo('MOBILE')} {
    flex-wrap: nowrap;
  }
`;

const ServiceNameLink = styled('a')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.M};
  line-height: ${LINE_HEIGHTS.S};
  font-weight: 700;
  color: ${COLORS.WHITE};
  text-decoration: none;
  margin-right: ${SPACING.M};
  display: inline-block;
  padding: ${SPACING.XS} 0;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.XXL};
    line-height: ${LINE_HEIGHTS.S};
  }
  
  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 0.1578em;
  }
  
  &:focus {
    ${focusStyles}
  }
  
  &:visited {
    color: ${COLORS.WHITE};
  }
`;

const Navigation = styled('nav')`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin-top: ${SPACING.S};
  
  ${respondTo('MOBILE')} {
    width: auto;
    margin-top: 0;
  }
`;

const NavigationList = styled('ul')`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.XS};
  
  ${respondTo('MOBILE')} {
    gap: ${SPACING.L};
  }
`;

const NavigationItem = styled('li')`
  margin: 0;
`;

const NavigationLink = styled('a')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  font-weight: 400;
  color: ${COLORS.WHITE};
  text-decoration: none;
  padding: ${SPACING.XS} 0;
  border-bottom: 2px solid transparent;
  transition: border-bottom-color 0.2s ease-in-out;
  display: block;
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
    padding: ${SPACING.S} 0;
  }
  
  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 0.1578em;
  }
  
  &:focus {
    ${focusStyles}
  }
  
  &:visited {
    color: ${COLORS.WHITE};
  }
`;

const PhaseBanner = styled('div')`
  background-color: ${COLORS.WHITE};
  padding: ${SPACING.S} 0;
  border-bottom: 1px solid ${COLORS.MID_GREY};
`;

const PhaseBannerContainer = styled(GovUKContainer)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const PhaseTag = styled('strong')`
  display: inline-block;
  margin-right: ${SPACING.S};
  padding: ${SPACING.XS} ${SPACING.S};
  font-family: "GDS Transport", Arial, sans-serif;
  font-weight: 700;
  font-size: ${FONT_SIZES.XS};
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.S};
  }
`;

const PhaseText = styled('span')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  color: ${COLORS.BLACK};
  
  ${respondTo('MOBILE')} {
    font-size: ${FONT_SIZES.L};
    line-height: ${LINE_HEIGHTS.M};
  }
  
  a {
    ${linkStyles}
  }
`;

const Header = () => {
  const navigationItems = [
    { label: 'About the service', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Help', href: '/help' }
  ];

  return (
    <>
      <GovUKSkipLink href="#main-content">
        Skip to main content
      </GovUKSkipLink>
      
      <HeaderWrapper>
        <HeaderContainer>
          <HeaderContent>
            <ServiceNameLink href="/">
              MotCheck.UK
            </ServiceNameLink>
            
            <Navigation aria-label="Main navigation">
              <NavigationList>
                {navigationItems.map((item, index) => (
                  <NavigationItem key={index}>
                    <NavigationLink href={item.href}>
                      {item.label}
                    </NavigationLink>
                  </NavigationItem>
                ))}
              </NavigationList>
            </Navigation>
          </HeaderContent>
        </HeaderContainer>
      </HeaderWrapper>
      
      <PhaseBanner>
        <PhaseBannerContainer>
          <PhaseTag>BETA</PhaseTag>
          <PhaseText>
            This is a new service – your{' '}
            <a href="/feedback">feedback</a>{' '}
            will help us to improve it.
          </PhaseText>
        </PhaseBannerContainer>
      </PhaseBanner>
    </>
  );
};

export default Header;