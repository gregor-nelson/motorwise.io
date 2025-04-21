import React from 'react';

const Header = () => {
  // UK Government Design System Colors
  const colors = {
    black: '#0b0c0c',
    white: '#ffffff',
    blue: '#1d70b8',
    yellow: '#ffdd00',
    darkGrey: '#505a5f',
    lightGrey: '#f3f2f1',
    focusColor: '#ffdd00'
  };

  const styles = {
    skipLink: {
      position: 'absolute',
      left: '-9999em',
      top: '0',
      padding: '10px 15px',
      backgroundColor: colors.white,
      color: colors.black,
      fontSize: '16px',
      fontFamily: '"GDS Transport", Arial, sans-serif',
      textDecoration: 'none',
      zIndex: '30',
      fontWeight: '700',
      transition: 'left 0.2s'
    },
    skipLinkFocus: {
      left: '0',
      outline: '3px solid ' + colors.focusColor,
      outlineOffset: '0'
    },
    headerWrapper: {
      backgroundColor: colors.black,
      paddingTop: '10px',
      paddingBottom: '10px',
      borderBottom: '10px solid ' + colors.blue,
      width: '100%'
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 30px'
    },
    serviceName: {
      fontFamily: '"GDS Transport", Arial, sans-serif',
      fontSize: '24px',
      fontWeight: '700',
      color: colors.white,
      textDecoration: 'none',
      marginRight: '15px',
      display: 'inline-block',
      padding: '5px 0'
    },
    headerNav: {
      display: 'flex',
      alignItems: 'center'
    },
    headerLink: {
      fontFamily: '"GDS Transport", Arial, sans-serif',
      fontSize: '16px',
      fontWeight: '400',
      color: colors.white,
      textDecoration: 'none',
      marginLeft: '20px',
      padding: '8px 0',
      borderBottom: '2px solid transparent',
      transition: 'border-bottom-color 0.2s ease-in-out'
    },
    headerLinkHover: {
      borderBottomColor: colors.white
    },
    phaseBanner: {
      backgroundColor: colors.white,
      padding: '10px 0',
      borderBottom: '1px solid ' + colors.darkGrey
    },
    phaseBannerContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 30px',
      display: 'flex',
      alignItems: 'center'
    },
    phaseBannerTag: {
      display: 'inline-block',
      margin: '0 8px 0 0',
      padding: '4px 8px',
      fontFamily: '"GDS Transport", Arial, sans-serif',
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '1',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      backgroundColor: colors.blue,
      color: colors.white
    },
    phaseBannerText: {
      fontFamily: '"GDS Transport", Arial, sans-serif',
      fontSize: '16px',
      color: colors.black
    },
    footerLink: {
      color: colors.blue,
      fontWeight: '700',
      textDecoration: 'underline',
      transition: 'color 0.2s',
      outline: 'none'
    },
    footerLinkHover: {
      color: '#003078',
      textDecoration: 'underline'
    }
  };

  return (
    <>
      <a 
        href="#main-content" 
        style={styles.skipLink}
        onFocus={(e) => {
          e.target.style.left = '0';
          e.target.style.outline = '3px solid ' + colors.focusColor;
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999em';
          e.target.style.outline = 'none';
        }}
      >
        Skip to main content
      </a>
      
      {/* Header */}
      <header style={styles.headerWrapper}>
        <div style={styles.headerContainer}>
          <a 
            href="/" 
            style={styles.serviceName}
            onFocus={(e) => {
              e.target.style.outline = '3px solid ' + colors.focusColor;
              e.target.style.outlineOffset = '0';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
            }}
          >
            MotCheck.UK
          </a>
          
          <nav style={styles.headerNav}>
            {['About the service', 'Contact', 'Help'].map((item, index) => (
              <a 
                key={index} 
                href="#" 
                style={styles.headerLink}
                onMouseOver={(e) => {
                  e.target.style.borderBottomColor = colors.white;
                }}
                onMouseOut={(e) => {
                  e.target.style.borderBottomColor = 'transparent';
                }}
                onFocus={(e) => {
                  e.target.style.outline = '3px solid ' + colors.focusColor;
                  e.target.style.outlineOffset = '0';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Phase Banner */}
      <div style={styles.phaseBanner}>
        <div style={styles.phaseBannerContainer}>
          <strong style={styles.phaseBannerTag}>BETA</strong>
          <span style={styles.phaseBannerText}>
            This is a new service – your{' '}
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => {
                e.target.style.color = '#003078';
              }}
              onMouseOut={(e) => {
                e.target.style.color = colors.blue;
              }}
              onFocus={(e) => {
                e.target.style.outline = '3px solid ' + colors.focusColor;
                e.target.style.outlineOffset = '0';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            >
              feedback
            </a>{' '}
            will help us to improve it.
          </span>
        </div>
      </div>
    </>
  );
};

export default Header;