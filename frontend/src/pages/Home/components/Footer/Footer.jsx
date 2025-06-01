import React from 'react';

const Footer = () => {
  // Enhanced UK Government Design System Colors (matching header)
  const colors = {
    black: '#0b0c0c',
    white: '#ffffff',
    blue: '#1d70b8',
    darkBlue: '#003078',
    midBlue: '#1d4f8c',
    lightBlue: '#5694ca',
    yellow: '#ffdd00',
    darkGrey: '#505a5f',
    midGrey: '#b1b4b6',
    lightGrey: '#f3f2f1',
    focusColor: '#ffdd00',
    accentGreen: '#00703c'
  };

  const styles = {
    footerWrapper: {
      backgroundColor: colors.lightGrey,
      borderTop: '6px solid',
      borderImage: `linear-gradient(to right, ${colors.blue} 0%, ${colors.lightBlue} 50%, ${colors.accentGreen} 100%) 1`,
      padding: '45px 0 30px',
      marginTop: '60px',
      position: 'relative',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
    },
    footerContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 30px'
    },
    footerNav: {
      marginBottom: '30px',
      borderBottom: '1px solid ' + colors.midGrey,
      paddingBottom: '20px'
    },
    footerList: {
      margin: '0',
      padding: '0',
      listStyle: 'none',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px'
    },
    footerLinkItem: {
      margin: '0 20px 10px 0'
    },
    footerLink: {
      fontFamily: '"GDS Transport", Arial, sans-serif',
      fontSize: '16px',
      color: colors.blue,
      textDecoration: 'underline',
      fontWeight: '400',
      transition: 'all 0.2s ease',
      position: 'relative',
      display: 'inline-block'
    },
    footerLinkHover: {
      color: colors.darkBlue,
      textDecoration: 'underline'
    },
    footerLinkUnderline: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '0',
      height: '2px',
      backgroundColor: colors.darkBlue,
      transition: 'width 0.3s ease'
    },
    footerMetadata: {
      marginTop: '30px',
      fontFamily: '"GDS Transport", Arial, sans-serif',
      fontSize: '14px',
      color: colors.darkGrey,
      lineHeight: '1.5'
    },
    footerMetadataItem: {
      marginBottom: '15px'
    },
    footerLogo: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid ' + colors.midGrey
    },
    logoText: {
      fontFamily: '"GDS Transport", Arial, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      marginLeft: '15px',
      color: colors.black
    },
    crownLogo: {
      width: '36px',
      height: '30px',
      fill: colors.black
    },
    focusStyle: {
      outline: '3px solid ' + colors.focusColor,
      outlineOffset: '0'
    },
    agencyLink: {
      fontWeight: '700',
      color: colors.blue,
      textDecoration: 'underline',
      transition: 'color 0.2s'
    }
  };

  // SVG crown icon for UK government
  const CrownIcon = () => (
    <svg
      style={styles.crownLogo}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 132 97"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z" />
    </svg>
  );

  return (
    <footer style={styles.footerWrapper}>
      <div style={styles.footerContainer}>
        <nav style={styles.footerNav}>
          <ul style={styles.footerList}>
            {['Help', 'Cookies', 'Contact', 'Terms and conditions', 'Accessibility statement', 'Privacy notice'].map((item, index) => (
              <li key={index} style={styles.footerLinkItem}>
                <a 
                  href="#" 
                  style={styles.footerLink}
                  onMouseOver={(e) => {
                    e.target.style.color = colors.darkBlue;
                    const underline = e.target.querySelector('span[data-underline="true"]');
                    if (underline) underline.style.width = '100%';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = colors.blue;
                    const underline = e.target.querySelector('span[data-underline="true"]');
                    if (underline) underline.style.width = '0';
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = '3px solid ' + colors.focusColor;
                    e.target.style.outlineOffset = '0';
                    const underline = e.target.querySelector('span[data-underline="true"]');
                    if (underline) underline.style.width = '100%';
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = 'none';
                    const underline = e.target.querySelector('span[data-underline="true"]');
                    if (underline) underline.style.width = '0';
                  }}
                >
                  {item}
                  <span style={styles.footerLinkUnderline} data-underline="true"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div style={styles.footerMetadata}>
          <div style={styles.footerMetadataItem}>
            Information provided by the{' '}
            <a 
              href="#" 
              style={styles.agencyLink}
              onMouseOver={(e) => {
                e.target.style.color = colors.darkBlue;
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
              Driver & Vehicle Standards Agency
            </a>{' '}
            and the{' '}
            <a 
              href="#" 
              style={styles.agencyLink}
              onMouseOver={(e) => {
                e.target.style.color = colors.darkBlue;
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
              Driver & Vehicle Licensing Agency
            </a>
          </div>
          
          <div style={styles.footerMetadataItem}>
            All content is available under the{' '}
            <a 
              href="#" 
              style={styles.agencyLink}
              onMouseOver={(e) => {
                e.target.style.color = colors.darkBlue;
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
              Open Government Licence v3.0
            </a>,
            except where otherwise stated
          </div>
          
          <div style={{...styles.footerMetadataItem, fontWeight: '700'}}>© Crown copyright</div>
        </div>
        
        <div style={styles.footerLogo}>
          <CrownIcon />
          <span style={styles.logoText}>GOV.UK</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;