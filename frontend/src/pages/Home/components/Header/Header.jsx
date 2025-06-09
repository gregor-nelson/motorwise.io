import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  LINE_HEIGHTS,
  BREAKPOINTS,
  commonFontStyles,
  focusStyles,
  linkStyles,
  GovUKContainer,
  GovUKSkipLink,
  respondTo
} from '../../../../styles/theme';

// Government-style logo with integrated text
const MotCheckLogo = styled('svg')`
  height: 40px;
  width: auto;
  margin-right: ${SPACING.S};
  flex-shrink: 0;
  
  ${respondTo('MOBILE')} {
    height: 36px;
    margin-right: ${SPACING.XS};
  }
  
  /* Ensure logo colors work on dark background */
  & text {
    fill: ${COLORS.WHITE};
  }
  
  & .logo-primary {
    fill: ${COLORS.WHITE};
    stroke: ${COLORS.WHITE};
  }
  
  & .logo-accent {
    fill: ${COLORS.YELLOW};
    stroke: ${COLORS.YELLOW};
  }
  
  & .logo-check {
    fill: ${COLORS.GREEN};
    stroke: ${COLORS.GREEN};
  }
  
  & .logo-secondary {
    fill: ${COLORS.MID_GREY};
    stroke: ${COLORS.MID_GREY};
  }
`;

// Header styled components
const HeaderWrapper = styled('header')`
  ${commonFontStyles}
  background-color: ${COLORS.BLACK};
  border-bottom: 10px solid ${COLORS.BLUE};
  width: 100%;
  position: relative;
`;

const HeaderContainer = styled(GovUKContainer)`
  padding-top: ${SPACING.S};
  padding-bottom: ${SPACING.S};
`;

const HeaderContent = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const ServiceNameLink = styled('a')`
  ${commonFontStyles}
  color: ${COLORS.WHITE};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  padding: ${SPACING.XS} 0;
  flex-shrink: 0;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:focus {
    ${focusStyles}
  }
  
  &:visited {
    color: ${COLORS.WHITE};
  }
`;

// Desktop Navigation
const DesktopNavigation = styled('nav')`
  display: none;
  
  ${respondTo('TABLET')} {
    display: flex;
    align-items: center;
  }
`;

const DesktopNavigationList = styled('ul')`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: ${SPACING.L};
`;

const DesktopNavigationItem = styled('li')`
  margin: 0;
  position: relative;
`;

const DesktopNavigationLink = styled('a')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: 400;
  color: ${COLORS.WHITE};
  text-decoration: none;
  padding: ${SPACING.S} 0;
  display: block;
  white-space: nowrap;
  
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

// Desktop Dropdown
const DropdownButton = styled('button')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: 400;
  color: ${COLORS.WHITE};
  background: none;
  border: none;
  padding: ${SPACING.S} ${SPACING.M} ${SPACING.S} 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  white-space: nowrap;
  
  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 0.1578em;
  }
  
  &:focus {
    ${focusStyles}
  }
`;

const DropdownIcon = styled('span')`
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: ${SPACING.XS};
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid ${COLORS.WHITE};
  transition: transform 0.2s ease;
  
  ${props => props.isOpen && `
    transform: rotate(180deg);
  `}
`;

const DropdownMenu = styled('div')`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${COLORS.WHITE};
  border: 2px solid ${COLORS.BLACK};
  min-width: 200px;
  max-height: ${props => props.isOpen ? '400px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const DropdownList = styled('ul')`
  margin: 0;
  padding: ${SPACING.S} 0;
  list-style: none;
`;

const DropdownItem = styled('li')`
  margin: 0;
`;

const DropdownLink = styled('a')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.S};
  line-height: ${LINE_HEIGHTS.S};
  color: ${COLORS.BLACK};
  text-decoration: none;
  padding: ${SPACING.S} ${SPACING.M};
  display: block;
  border-bottom: 2px solid transparent;
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.1578em;
  }
  
  &:focus {
    ${focusStyles}
    background-color: ${COLORS.FOCUS};
    color: ${COLORS.BLACK};
  }
  
  &:visited {
    color: ${COLORS.BLACK};
  }
`;

// Mobile Menu Button
const MobileMenuButton = styled('button')`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${COLORS.WHITE};
  padding: ${SPACING.S};
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  ${respondTo('TABLET')} {
    display: none;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:focus {
    ${focusStyles}
  }
  
  &[aria-expanded="true"] {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MenuIcon = styled('span')`
  display: block;
  width: 24px;
  height: 2px;
  background-color: ${COLORS.WHITE};
  position: relative;
  transition: background-color 0.3s ease;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background-color: ${COLORS.WHITE};
    transition: all 0.3s ease;
  }
  
  &::before {
    top: -8px;
  }
  
  &::after {
    top: 8px;
  }
  
  ${props => props.isOpen && `
    background-color: transparent;
    
    &::before {
      transform: rotate(45deg);
      top: 0;
    }
    
    &::after {
      transform: rotate(-45deg);
      top: 0;
    }
  `}
`;

const MenuText = styled('span')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.S};
  margin-left: ${SPACING.XS};
  font-weight: 400;
`;

// Mobile Menu
const MobileMenu = styled('div')`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${COLORS.BLACK};
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  z-index: 1000;
  
  ${respondTo('TABLET')} {
    display: none;
  }
`;

const MobileMenuContent = styled('div')`
  padding: ${SPACING.M} 0;
`;

const MobileMenuSection = styled('div')`
  padding: 0 ${SPACING.M};
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: ${SPACING.M};
    margin-bottom: ${SPACING.M};
  }
`;

const MobileMenuList = styled('ul')`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const MobileMenuItem = styled('li')`
  margin: 0;
`;

const MobileMenuLink = styled('a')`
  ${commonFontStyles}
  font-size: ${FONT_SIZES.L};
  line-height: ${LINE_HEIGHTS.M};
  font-weight: 400;
  color: ${COLORS.WHITE};
  text-decoration: none;
  padding: ${SPACING.S} 0;
  display: block;
  border-bottom: 2px solid transparent;
  
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

// Phase Banner components
const PhaseBanner = styled('div')`
  background-color: ${COLORS.WHITE};
  padding: ${SPACING.S} 0;
  border-bottom: 1px solid ${COLORS.MID_GREY};
`;

const PhaseBannerContainer = styled(GovUKContainer)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${SPACING.S};
  
  ${respondTo('MOBILE')} {
    flex-wrap: nowrap;
  }
`;

const PhaseTag = styled('strong')`
  display: inline-block;
  padding: ${SPACING.XS} ${SPACING.S};
  font-family: "GDS Transport", Arial, sans-serif;
  font-weight: 700;
  font-size: ${FONT_SIZES.XS};
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  flex-shrink: 0;
  
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= parseInt(BREAKPOINTS.TABLET.replace('em', '')) * 16) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('header')) {
        setMobileMenuOpen(false);
      }
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen, dropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [dropdownOpen]);

  const primaryNavigationItems = [
    { label: 'About the service', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Help', href: '/help' }
  ];

  const additionalLinks = [
    { label: 'Cookies', href: '/cookies' },
    { label: 'Terms and conditions', href: '/terms' },
    { label: 'Accessibility statement', href: '/accessibility' },
    { label: 'Privacy notice', href: '/privacy' }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownLinkClick = () => {
    setDropdownOpen(false);
  };

  return (
    <>
      <GovUKSkipLink href="#main-content">
        Skip to main content
      </GovUKSkipLink>
      
      <HeaderWrapper>
        <HeaderContainer>
          <HeaderContent>
            <ServiceNameLink href="/" aria-label="MotCheck.UK - Vehicle MOT history and tax status checker">
              <MotCheckLogo
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 280 40"
                focusable="false"
                role="img"
                aria-hidden="true"
              >
                {/* Official circular badge/crest */}
                <circle cx="20" cy="20" r="18" className="logo-primary" fill="none" strokeWidth="1.5"/>
                <circle cx="20" cy="20" r="12" className="logo-primary" fill="none" strokeWidth="1"/>
                
                {/* Crown symbol in center */}
                <g transform="translate(20, 20)">
                  <path d="M-4 -3l1.5-2.5h5l1.5 2.5v1.5h-8v-1.5z" className="logo-primary"/>
                  <circle cx="-2.5" cy="-4.5" r="0.8" className="logo-primary"/>
                  <circle cx="0" cy="-5" r="1" className="logo-primary"/>
                  <circle cx="2.5" cy="-4.5" r="0.8" className="logo-primary"/>
                  
                  {/* Small vehicle symbol below crown */}
                  <rect x="-3" y="1" width="6" height="2.5" rx="0.5" className="logo-accent"/>
                  <circle cx="-1.5" cy="4" r="0.8" className="logo-secondary"/>
                  <circle cx="1.5" cy="4" r="0.8" className="logo-secondary"/>
                </g>
                
                {/* Verification checkmark */}
                <path d="M32 17l1.5 1.5 3-3" className="logo-check" strokeWidth="2" fill="none" strokeLinecap="round"/>
                
                {/* Main service name */}
                <text x="45" y="16" 
                      fontFamily="'GDS Transport', Arial, sans-serif" 
                      fontSize="18" 
                      fontWeight="700" 
                      className="logo-primary">
                  MotCheck
                </text>
                
                {/* .UK domain */}
                <text x="141" y="16" 
                      fontFamily="'GDS Transport', Arial, sans-serif" 
                      fontSize="18" 
                      fontWeight="700" 
                      className="logo-accent">
                  .UK
                </text>
                
                {/* Subtitle */}
                <text x="45" y="28" 
                      fontFamily="'GDS Transport', Arial, sans-serif" 
                      fontSize="10" 
                      fontWeight="400" 
                      className="logo-secondary">
                  Vehicle MOT &amp; Tax Status
                </text>
                
                {/* Government identifier line */}
                <line x1="45" y1="32" x2="190" y2="32" className="logo-secondary" strokeWidth="0.5"/>
                <text x="45" y="37" 
                      fontFamily="'GDS Transport', Arial, sans-serif" 
                      fontSize="7" 
                      fontWeight="400" 
                      className="logo-secondary" 
                      letterSpacing="0.5px">
                  OFFICIAL DVLA &amp; DVSA DATA
                </text>
              </MotCheckLogo>
            </ServiceNameLink>
            
            {/* Desktop Navigation */}
            <DesktopNavigation aria-label="Main navigation">
              <DesktopNavigationList>
                {primaryNavigationItems.map((item, index) => (
                  <DesktopNavigationItem key={index}>
                    <DesktopNavigationLink href={item.href}>
                      {item.label}
                    </DesktopNavigationLink>
                  </DesktopNavigationItem>
                ))}
                
                {/* Desktop Dropdown */}
                <DesktopNavigationItem ref={dropdownRef}>
                  <DropdownButton
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="More links"
                  >
                    
                    <DropdownIcon isOpen={dropdownOpen} />
                  </DropdownButton>
                  
                  <DropdownMenu isOpen={dropdownOpen}>
                    <DropdownList>
                      {additionalLinks.map((item, index) => (
                        <DropdownItem key={index}>
                          <DropdownLink 
                            href={item.href}
                            onClick={handleDropdownLinkClick}
                          >
                            {item.label}
                          </DropdownLink>
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </DropdownMenu>
                </DesktopNavigationItem>
              </DesktopNavigationList>
            </DesktopNavigation>

            {/* Mobile Menu Button */}
            <MobileMenuButton
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <MenuIcon isOpen={mobileMenuOpen} />
              <MenuText>Menu</MenuText>
            </MobileMenuButton>
          </HeaderContent>

          {/* Mobile Menu */}
          <MobileMenu id="mobile-menu" isOpen={mobileMenuOpen}>
            <MobileMenuContent>
              {/* Primary Navigation */}
              <MobileMenuSection>
                <MobileMenuList>
                  {primaryNavigationItems.map((item, index) => (
                    <MobileMenuItem key={index}>
                      <MobileMenuLink 
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </MobileMenuLink>
                    </MobileMenuItem>
                  ))}
                </MobileMenuList>
              </MobileMenuSection>

              {/* Additional Links */}
              <MobileMenuSection>
                <MobileMenuList>
                  {additionalLinks.map((item, index) => (
                    <MobileMenuItem key={index}>
                      <MobileMenuLink 
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </MobileMenuLink>
                    </MobileMenuItem>
                  ))}
                </MobileMenuList>
              </MobileMenuSection>
            </MobileMenuContent>
          </MobileMenu>
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