import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';

const Header = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [moreExpanded, setMoreExpanded] = useState(false);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && sidebarExpanded) {
        setSidebarExpanded(false);
        setMoreExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarExpanded]);

  // Prevent body scroll when sidebar is expanded
  useEffect(() => {
    if (sidebarExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarExpanded]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarExpanded && !event.target.closest('aside') && !event.target.closest('[data-sidebar-panel]')) {
        setSidebarExpanded(false);
        setMoreExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarExpanded]);

  // SVG Components for each menu item with refs for animation
  const HomeSVG = () => {
    const roofRef = useRef(null);
    const wallRef = useRef(null);
    const doorRef = useRef(null);
    const windowLeftRef = useRef(null);
    const windowRightRef = useRef(null);

    useEffect(() => {
      // Subtle floating animation
      animate(roofRef.current, {
        translateY: [-2, 2],
        duration: 3000,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      // Subtle scale pulse on windows
      animate([windowLeftRef.current, windowRightRef.current], {
        scale: [1, 1.05],
        duration: 2000,
        ease: 'inOutQuad',
        alternate: true,
        loop: true,
        delay: stagger(400)
      });
    }, []);

    return (
      <svg viewBox="0 0 200 200" className="w-32 h-32">
        <defs>
          <linearGradient id="homeRoof" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6"/>
          </linearGradient>
          <linearGradient id="homeWall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3"/>
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="165" rx="55" ry="8" fill="#3b82f6" opacity="0.1"/>

        {/* Wall */}
        <path ref={wallRef} d="M40 85 L160 85 L160 160 L40 160 Z" fill="url(#homeWall)" stroke="#3b82f6" strokeWidth="2.5"/>

        {/* Roof */}
        <path ref={roofRef} d="M100 35 L170 85 L30 85 Z" fill="url(#homeRoof)" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round"/>

        {/* Chimney */}
        <rect x="125" y="50" width="15" height="25" fill="#3b82f6" opacity="0.5" stroke="#3b82f6" strokeWidth="2"/>

        {/* Door */}
        <rect ref={doorRef} x="85" y="115" width="30" height="45" rx="2" fill="#3b82f6" opacity="0.4" stroke="#3b82f6" strokeWidth="2"/>
        <circle cx="108" cy="137" r="2" fill="#3b82f6"/>

        {/* Windows */}
        <g ref={windowLeftRef}>
          <rect x="52" y="100" width="22" height="22" rx="2" fill="#60a5fa" opacity="0.3" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="63" y1="100" x2="63" y2="122" stroke="#3b82f6" strokeWidth="1.5"/>
          <line x1="52" y1="111" x2="74" y2="111" stroke="#3b82f6" strokeWidth="1.5"/>
        </g>

        <g ref={windowRightRef}>
          <rect x="126" y="100" width="22" height="22" rx="2" fill="#60a5fa" opacity="0.3" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="137" y1="100" x2="137" y2="122" stroke="#3b82f6" strokeWidth="1.5"/>
          <line x1="126" y1="111" x2="148" y2="111" stroke="#3b82f6" strokeWidth="1.5"/>
        </g>
      </svg>
    );
  };

  const PremiumReportSVG = () => {
    const badgeRef = useRef(null);
    const checkRef = useRef(null);
    const paperRef = useRef(null);
    const linesRef = useRef(null);

    useEffect(() => {
      // Subtle rotate animation on badge
      animate(badgeRef.current, {
        rotate: [-3, 3],
        duration: 2500,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      // Draw checkmark animation
      animate(checkRef.current, {
        strokeDashoffset: [0, 100],
        duration: 1500,
        ease: 'inOutQuad',
        alternate: true,
        loop: true,
        loopDelay: 2000
      });

      // Subtle float on paper layers
      animate(paperRef.current, {
        translateY: [-1, 1],
        duration: 3500,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });
    }, []);

    return (
      <svg viewBox="0 0 200 200" className="w-32 h-32">
        <defs>
          <linearGradient id="reportPaper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="reportBadge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6"/>
          </linearGradient>
        </defs>

        {/* Shadow layers for depth */}
        <rect x="65" y="45" width="80" height="120" rx="4" fill="#8b5cf6" opacity="0.05"/>
        <rect x="62" y="42" width="80" height="120" rx="4" fill="#8b5cf6" opacity="0.08"/>

        {/* Main paper */}
        <rect ref={paperRef} x="58" y="38" width="80" height="120" rx="4" fill="url(#reportPaper)" stroke="#8b5cf6" strokeWidth="2.5"/>

        {/* Paper fold corner */}
        <path d="M138 38 L138 53 L123 38 Z" fill="#8b5cf6" opacity="0.15"/>

        {/* Badge circle */}
        <g ref={badgeRef}>
          <circle cx="100" cy="78" r="22" fill="url(#reportBadge)" stroke="#8b5cf6" strokeWidth="2.5"/>
          <circle cx="100" cy="78" r="18" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.3"/>
        </g>

        {/* Checkmark */}
        <path ref={checkRef} d="M85 98 L95 108 L115 83" stroke="#8b5cf6" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Text lines */}
        <g ref={linesRef}>
          <line x1="68" y1="120" x2="132" y2="120" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.35" strokeLinecap="round"/>
          <line x1="68" y1="132" x2="115" y2="132" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.35" strokeLinecap="round"/>
          <line x1="68" y1="144" x2="125" y2="144" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.3" strokeLinecap="round"/>
        </g>

        {/* Star accent */}
        <circle cx="118" cy="65" r="3" fill="#a78bfa" opacity="0.6"/>
      </svg>
    );
  };

  const MOTHistorySVG = () => {
    const hourHandRef = useRef(null);
    const minuteHandRef = useRef(null);
    const outerRingRef = useRef(null);
    const ticksRef = useRef(null);

    useEffect(() => {
      // Rotating clock hands
      animate(hourHandRef.current, {
        rotate: [0, 30],
        duration: 8000,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      animate(minuteHandRef.current, {
        rotate: [0, 360],
        duration: 12000,
        ease: 'linear',
        loop: true
      });

      // Pulse effect on outer ring
      animate(outerRingRef.current, {
        scale: [1, 1.05],
        opacity: [0.3, 0.5],
        duration: 2000,
        ease: 'inOutQuad',
        alternate: true,
        loop: true
      });

      // Subtle opacity pulse on tick marks
      animate(ticksRef.current?.children, {
        opacity: [0.4, 0.7],
        duration: 1500,
        ease: 'inOutSine',
        alternate: true,
        loop: true,
        delay: stagger(200)
      });
    }, []);

    return (
      <svg viewBox="0 0 200 200" className="w-32 h-32">
        <defs>
          <linearGradient id="clockFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3"/>
          </linearGradient>
          <radialGradient id="clockCenter">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#059669" stopOpacity="0.6"/>
          </radialGradient>
        </defs>

        {/* Shadow */}
        <circle cx="105" cy="105" r="62" fill="#10b981" opacity="0.08"/>

        {/* Outer ring with animation */}
        <circle ref={outerRingRef} cx="100" cy="100" r="65" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.3"/>

        {/* Main clock face */}
        <circle cx="100" cy="100" r="58" fill="url(#clockFace)" stroke="#10b981" strokeWidth="3"/>

        {/* Inner ring */}
        <circle cx="100" cy="100" r="50" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.2"/>

        {/* Hour markers */}
        <g ref={ticksRef}>
          <circle cx="100" cy="48" r="4" fill="#10b981" opacity="0.5"/>
          <circle cx="132" cy="63" r="4" fill="#10b981" opacity="0.5"/>
          <circle cx="147" cy="95" r="4" fill="#10b981" opacity="0.5"/>
          <circle cx="132" cy="132" r="4" fill="#10b981" opacity="0.5"/>
          <circle cx="100" cy="152" r="4" fill="#10b981" opacity="0.5"/>
          <circle cx="68" cy="132" r="4" fill="#10b981" opacity="0.5"/>
          <circle cx="53" cy="100" r="4" fill="#10b981" opacity="0.5"/>
          <circle cx="68" cy="68" r="4" fill="#10b981" opacity="0.5"/>
        </g>

        {/* Center dot */}
        <circle cx="100" cy="100" r="6" fill="url(#clockCenter)" stroke="#10b981" strokeWidth="1"/>

        {/* Hour hand */}
        <line ref={hourHandRef} x1="100" y1="100" x2="100" y2="70" stroke="#10b981" strokeWidth="4" strokeLinecap="round" style={{transformOrigin: '100px 100px'}}/>

        {/* Minute hand */}
        <line ref={minuteHandRef} x1="100" y1="100" x2="125" y2="100" stroke="#10b981" strokeWidth="3" strokeLinecap="round" style={{transformOrigin: '100px 100px'}}/>

        {/* Highlight accent */}
        <path d="M85 75 Q90 70 95 75" stroke="#34d399" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round"/>
      </svg>
    );
  };

  const FAQSVG = () => {
    const questionRef = useRef(null);
    const dotRef = useRef(null);
    const outerCircleRef = useRef(null);
    const ringsRef = useRef(null);

    useEffect(() => {
      // Bounce animation on question mark
      animate(questionRef.current, {
        translateY: [-3, 3],
        duration: 1800,
        ease: 'inOutQuad',
        alternate: true,
        loop: true
      });

      // Pulse dot
      animate(dotRef.current, {
        scale: [1, 1.3],
        opacity: [0.8, 1],
        duration: 1000,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      // Ripple effect on outer circle
      animate(outerCircleRef.current, {
        scale: [1, 1.1],
        opacity: [0.3, 0.1],
        duration: 2500,
        ease: 'outQuad',
        alternate: true,
        loop: true
      });

      // Rotating rings
      animate(ringsRef.current, {
        rotate: 360,
        duration: 20000,
        ease: 'linear',
        loop: true
      });
    }, []);

    return (
      <svg viewBox="0 0 200 200" className="w-32 h-32">
        <defs>
          <linearGradient id="faqCircle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="questionMark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="1"/>
          </linearGradient>
        </defs>

        {/* Outer ripple ring */}
        <circle ref={outerCircleRef} cx="100" cy="100" r="65" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.2" style={{transformOrigin: '100px 100px'}}/>

        {/* Decorative rotating rings */}
        <g ref={ringsRef} style={{transformOrigin: '100px 100px'}}>
          <circle cx="100" cy="100" r="58" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.15" strokeDasharray="5,5"/>
        </g>

        {/* Main circle with shadow */}
        <circle cx="103" cy="103" r="52" fill="#f59e0b" opacity="0.08"/>
        <circle cx="100" cy="100" r="52" fill="url(#faqCircle)" stroke="#f59e0b" strokeWidth="3"/>

        {/* Inner circle */}
        <circle cx="100" cy="100" r="44" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.2"/>

        {/* Question mark */}
        <g ref={questionRef}>
          {/* Question curve */}
          <path d="M85 82 Q85 70 95 68 Q105 66 110 70 Q115 74 115 82 Q115 88 110 92 Q105 96 100 96 L100 110"
                stroke="url(#questionMark)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"/>
        </g>

        {/* Dot */}
        <circle ref={dotRef} cx="100" cy="123" r="5" fill="#f59e0b" opacity="0.9"/>

        {/* Accent sparkles */}
        <circle cx="130" cy="75" r="2.5" fill="#fbbf24" opacity="0.6"/>
        <circle cx="70" cy="125" r="2" fill="#fbbf24" opacity="0.5"/>
        <circle cx="125" cy="120" r="1.5" fill="#fbbf24" opacity="0.4"/>
      </svg>
    );
  };

  const ContactSVG = () => {
    const envelopeRef = useRef(null);
    const flapRef = useRef(null);
    const heartRef = useRef(null);
    const linesRef = useRef(null);

    useEffect(() => {
      // Gentle sway of envelope
      animate(envelopeRef.current, {
        rotate: [-2, 2],
        duration: 3000,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      // Flap animation
      animate(flapRef.current, {
        translateY: [-2, 1],
        duration: 2000,
        ease: 'inOutQuad',
        alternate: true,
        loop: true
      });

      // Heart beat
      animate(heartRef.current, {
        scale: [1, 1.15],
        duration: 1200,
        ease: 'inOutQuad',
        alternate: true,
        loop: true
      });

      // Lines animation
      animate(linesRef.current?.children, {
        translateX: [-5, 0],
        opacity: [0.3, 0.6],
        duration: 1500,
        ease: 'inOutQuad',
        alternate: true,
        loop: true,
        delay: stagger(200)
      });
    }, []);

    return (
      <svg viewBox="0 0 200 200" className="w-32 h-32">
        <defs>
          <linearGradient id="envelope" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="envelopeFlap" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#db2777" stopOpacity="0.6"/>
          </linearGradient>
        </defs>

        <g ref={envelopeRef} style={{transformOrigin: '100px 100px'}}>
          {/* Shadow */}
          <rect x="53" y="73" width="100" height="70" rx="6" fill="#ec4899" opacity="0.08"/>

          {/* Main envelope body */}
          <rect x="48" y="68" width="100" height="70" rx="6" fill="url(#envelope)" stroke="#ec4899" strokeWidth="2.5"/>

          {/* Envelope seal (bottom layer) */}
          <path d="M48 68 L98 108 L148 68" fill="#ec4899" opacity="0.15"/>

          {/* Decorative lines on envelope */}
          <g ref={linesRef}>
            <line x1="60" y1="95" x2="90" y2="95" stroke="#ec4899" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
            <line x1="60" y1="105" x2="85" y2="105" stroke="#ec4899" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
          </g>

          {/* Envelope flap */}
          <g ref={flapRef}>
            <path d="M48 68 L98 103 L148 68" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M48 138 L78 108" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M148 138 L118 108" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"/>
          </g>

          {/* Heart seal */}
          <g ref={heartRef} style={{transformOrigin: '125px 85px'}}>
            <path d="M125 88 L127 85 Q128 83 130 83 Q132 83 132 85 Q132 87 125 92 Q118 87 118 85 Q118 83 120 83 Q122 83 123 85 Z"
                  fill="#ec4899"
                  opacity="0.7"/>
          </g>
        </g>

        {/* Decorative accents */}
        <circle cx="155" cy="75" r="2" fill="#f9a8d4" opacity="0.5"/>
        <circle cx="45" cy="130" r="2.5" fill="#f9a8d4" opacity="0.6"/>
      </svg>
    );
  };

  const KnowledgeCenterSVG = () => {
    const leftPageRef = useRef(null);
    const rightPageRef = useRef(null);
    const bookmarkRef = useRef(null);
    const leftLinesRef = useRef(null);
    const rightLinesRef = useRef(null);

    useEffect(() => {
      // Page turning effect (subtle sway)
      animate(leftPageRef.current, {
        rotateY: [-2, 2],
        duration: 3500,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      animate(rightPageRef.current, {
        rotateY: [2, -2],
        duration: 3500,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      // Bookmark sway
      animate(bookmarkRef.current, {
        translateX: [-1, 1],
        duration: 2500,
        ease: 'inOutSine',
        alternate: true,
        loop: true
      });

      // Text lines fade in sequence
      animate(leftLinesRef.current?.children, {
        opacity: [0.3, 0.6],
        duration: 2000,
        ease: 'inOutQuad',
        alternate: true,
        loop: true,
        delay: stagger(150)
      });

      animate(rightLinesRef.current?.children, {
        opacity: [0.3, 0.6],
        duration: 2000,
        ease: 'inOutQuad',
        alternate: true,
        loop: true,
        delay: stagger(150, {start: 300})
      });
    }, []);

    return (
      <svg viewBox="0 0 200 200" className="w-32 h-32">
        <defs>
          <linearGradient id="bookLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="bookRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="bookmark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8"/>
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="155" rx="50" ry="6" fill="#06b6d4" opacity="0.1"/>

        {/* Book spine shadow */}
        <rect x="98" y="52" width="4" height="98" fill="#06b6d4" opacity="0.15"/>

        {/* Left page */}
        <g ref={leftPageRef}>
          <path d="M55 55 Q55 50 60 50 L100 50 L100 150 L60 150 Q55 150 55 145 Z"
                fill="url(#bookLeft)"
                stroke="#06b6d4"
                strokeWidth="2.5"/>

          {/* Left page curve/depth */}
          <path d="M100 50 Q95 60 95 100 Q95 140 100 150"
                fill="#06b6d4"
                opacity="0.1"
                stroke="none"/>

          {/* Text lines on left page */}
          <g ref={leftLinesRef}>
            <line x1="68" y1="75" x2="92" y2="75" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="68" y1="88" x2="88" y2="88" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="68" y1="101" x2="92" y2="101" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="68" y1="114" x2="85" y2="114" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="68" y1="127" x2="90" y2="127" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
          </g>
        </g>

        {/* Right page */}
        <g ref={rightPageRef}>
          <path d="M100 50 L140 50 Q145 50 145 55 L145 145 Q145 150 140 150 L100 150 Z"
                fill="url(#bookRight)"
                stroke="#06b6d4"
                strokeWidth="2.5"/>

          {/* Right page curve/depth */}
          <path d="M100 50 Q105 60 105 100 Q105 140 100 150"
                fill="#06b6d4"
                opacity="0.1"
                stroke="none"/>

          {/* Text lines on right page */}
          <g ref={rightLinesRef}>
            <line x1="108" y1="75" x2="132" y2="75" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="108" y1="88" x2="128" y2="88" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="108" y1="101" x2="132" y2="101" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="108" y1="114" x2="125" y2="114" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
            <line x1="108" y1="127" x2="130" y2="127" stroke="#06b6d4" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
          </g>
        </g>

        {/* Bookmark ribbon */}
        <g ref={bookmarkRef}>
          <path d="M115 50 L115 85 L120 80 L125 85 L125 50 Z"
                fill="url(#bookmark)"
                stroke="#06b6d4"
                strokeWidth="1.5"/>
        </g>

        {/* Decorative sparkle */}
        <circle cx="70" cy="65" r="2" fill="#22d3ee" opacity="0.6"/>
        <circle cx="130" cy="135" r="2.5" fill="#22d3ee" opacity="0.5"/>
      </svg>
    );
  };

  const visualNavigationItems = [
    {
      label: 'Home',
      href: '/',
      type: 'link',
      SvgComponent: HomeSVG,
      bgColor: 'bg-blue-50',
      pillColor: 'bg-blue-600',
      textColor: 'text-white',
      borderColor: 'border-blue-200 hover:border-blue-400'
    },
    {
      label: 'Premium Report',
      href: '/premium-report',
      type: 'link',
      SvgComponent: PremiumReportSVG,
      bgColor: 'bg-purple-50',
      pillColor: 'bg-purple-600',
      textColor: 'text-white',
      borderColor: 'border-purple-200 hover:border-purple-400'
    },
    {
      label: 'MOT History',
      href: '/mot-history',
      type: 'link',
      SvgComponent: MOTHistorySVG,
      bgColor: 'bg-green-50',
      pillColor: 'bg-green-600',
      textColor: 'text-white',
      borderColor: 'border-green-200 hover:border-green-400'
    },
    {
      label: 'FAQ',
      href: '/faq',
      type: 'link',
      SvgComponent: FAQSVG,
      bgColor: 'bg-amber-50',
      pillColor: 'bg-amber-600',
      textColor: 'text-white',
      borderColor: 'border-amber-200 hover:border-amber-400'
    },
    {
      label: 'Contact',
      href: '/contact',
      type: 'link',
      SvgComponent: ContactSVG,
      bgColor: 'bg-pink-50',
      pillColor: 'bg-pink-600',
      textColor: 'text-white',
      borderColor: 'border-pink-200 hover:border-pink-400'
    },
    {
      label: 'Knowledge Center',
      href: '/knowledge-center',
      type: 'link',
      SvgComponent: KnowledgeCenterSVG,
      bgColor: 'bg-cyan-50',
      pillColor: 'bg-cyan-600',
      textColor: 'text-white',
      borderColor: 'border-cyan-200 hover:border-cyan-400'
    }
  ];

  const additionalLinks = [
    { label: 'Contact', href: '/contact' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Terms and conditions', href: '/terms' },
    { label: 'Accessibility statement', href: '/accessibility' },
    { label: 'Privacy notice', href: '/privacy' }
  ];

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
    if (!sidebarExpanded) {
      setMoreExpanded(false);
    }
  };

  const closeSidebar = () => {
    setSidebarExpanded(false);
    setMoreExpanded(false);
  };

  const toggleMore = () => {
    setMoreExpanded(!moreExpanded);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    closeSidebar();
  };

  const handleNavClick = () => {
    closeSidebar();
  };

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="fixed -top-10 left-20 bg-blue-600 text-white px-4 py-2 text-sm font-medium z-[1001] transition-all duration-200 focus:top-4 focus:outline-2 focus:outline-white focus:outline-offset-2"
      >
        Skip to main content
      </a>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${sidebarExpanded ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Collapsed Sidebar - Always Visible */}
      <aside
        className="fixed left-0 top-0 h-screen w-[60px] bg-white border-r border-neutral-200 z-50 flex flex-col items-center py-6 gap-6"
        aria-label="Main navigation"
      >
        {/* Compact Logo */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center w-10 h-10 transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
          aria-label="motorwise - Vehicle intelligence platform - Home"
        >
          <span className="text-2xl font-bold text-neutral-900 leading-none font-jost"></span>
          <span className="text-lg font-bold text-blue-600 leading-none font-jost relative">
            w
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span>
          </span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={toggleSidebar}
          className={`flex items-center justify-center w-10 h-10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${sidebarExpanded ? 'text-blue-600' : 'text-neutral-700 hover:text-neutral-900'}`}
          aria-expanded={sidebarExpanded}
          aria-label={sidebarExpanded ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <i className="ph ph-list text-3xl"></i>
        </button>
      </aside>

      {/* Expanded Panel - Slides Out */}
      <div
        data-sidebar-panel
        className={`fixed left-[60px] top-0 h-screen w-[320px] bg-white border-r border-neutral-200 z-40 transform transition-transform duration-300 ease-out overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!sidebarExpanded}
      >
        {/* Header Section */}
        <div className="px-6 py-6 border-b border-neutral-200 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-neutral-900 leading-tight tracking-tight m-0 font-jost">
              motor<span className="text-blue-600 relative inline-block">w<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span></span>ise
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-jost">Clear data. Wise choices</p>
          </div>

          <button
            onClick={closeSidebar}
            className="flex items-center justify-center w-8 h-8 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
            aria-label="Close navigation menu"
          >
            <i className="ph ph-x text-2xl"></i>
          </button>
        </div>

        {/* Visual Navigation Cards */}
        <div className="px-6 py-6 flex flex-col gap-4">
          {visualNavigationItems.map((item, index) => {
            const { SvgComponent } = item;

            return (
              <Link
                key={index}
                to={item.href}
                onClick={handleNavClick}
                className={`relative w-full aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 ${item.borderColor} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 block ${item.bgColor}`}
              >
                {/* SVG Background - Centered */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <SvgComponent />
                </div>

                {/* Text Label - Lower Left with Pill Background */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className={`inline-block px-4 py-2 ${item.pillColor} ${item.textColor} text-xs font-semibold uppercase tracking-wider rounded-full font-jost shadow-sm`}>
                    {item.label}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>

        {/* More Section */}
        <div className="px-6 pb-6">
          <button
            onClick={toggleMore}
            className="w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 hover:bg-neutral-50 rounded-lg"
            aria-expanded={moreExpanded}
            aria-label="More links"
          >
            <span className="text-sm font-medium text-neutral-900 font-jost">More</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-200 ${moreExpanded ? 'rotate-180' : 'rotate-0'}`}
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={`transition-all duration-200 ease-out ${moreExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <ul className="list-none m-0 p-0">
              {additionalLinks.map((item, index) => (
                <li key={index} className="m-0">
                  <Link
                    to={item.href}
                    onClick={handleNavClick}
                    className="text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 px-4 py-3 block transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded-lg font-jost"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Beta Banner - Adjusted for sidebar */}
      <div className="fixed top-0 left-[60px] right-0 bg-neutral-50 py-3 z-30 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
          <strong className="inline-block text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-blue-600 text-white flex-shrink-0 font-jost">BETA</strong>
          <p className="text-xs text-neutral-600 m-0 leading-relaxed font-jost">
            This is a new service – your{' '}
            <Link to="/contact" className="text-blue-600 underline underline-offset-2 hover:text-neutral-900 hover:decoration-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 focus-visible:bg-neutral-50 focus-visible:no-underline">feedback</Link>{' '}
            will help us to improve it.
          </p>
        </div>
      </div>
    </>
  );
};

export default Header;
