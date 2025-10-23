import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

/* ============================================
   CONSTANTS & CONFIGURATION
   ============================================ */

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
    type: 'link',
    bgColor: 'bg-blue-50',
    pillColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-200 hover:border-blue-400',
    svgKey: 'home'
  },
  {
    label: 'Premium Report',
    href: '/premium-report',
    type: 'link',
    bgColor: 'bg-purple-50',
    pillColor: 'bg-purple-600',
    textColor: 'text-white',
    borderColor: 'border-purple-200 hover:border-purple-400',
    svgKey: 'premiumReport'
  },
  {
    label: 'MOT History',
    href: '/mot-history',
    type: 'link',
    bgColor: 'bg-green-50',
    pillColor: 'bg-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-200 hover:border-green-400',
    svgKey: 'motHistory'
  },
  {
    label: 'FAQ',
    href: '/faq',
    type: 'link',
    bgColor: 'bg-amber-50',
    pillColor: 'bg-amber-600',
    textColor: 'text-white',
    borderColor: 'border-amber-200 hover:border-amber-400',
    svgKey: 'faq'
  },
  {
    label: 'Contact',
    href: '/contact',
    type: 'link',
    bgColor: 'bg-pink-50',
    pillColor: 'bg-pink-600',
    textColor: 'text-white',
    borderColor: 'border-pink-200 hover:border-pink-400',
    svgKey: 'contact'
  },
  {
    label: 'Knowledge Center',
    href: '/knowledge-center',
    type: 'link',
    bgColor: 'bg-cyan-50',
    pillColor: 'bg-cyan-600',
    textColor: 'text-white',
    borderColor: 'border-cyan-200 hover:border-cyan-400',
    svgKey: 'knowledgeCenter'
  }
];

const ADDITIONAL_LINKS = [
  { label: 'Contact', href: '/contact' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Terms and conditions', href: '/terms' },
  { label: 'Accessibility statement', href: '/accessibility' },
  { label: 'Privacy notice', href: '/privacy' }
];

/* ============================================
   SVG TEMPLATES
   ============================================ */

const SVG_TEMPLATES = {
  home: () => `
    <svg viewBox="0 0 200 200" class="w-32 h-32" data-svg="home">
      <defs>
        <linearGradient id="homeRoof" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="homeWall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0.3"/>
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="165" rx="55" ry="8" fill="#3b82f6" opacity="0.1"/>
      <path data-ref="wall" d="M40 85 L160 85 L160 160 L40 160 Z" fill="url(#homeWall)" stroke="#3b82f6" stroke-width="2.5"/>
      <path data-ref="roof" d="M100 35 L170 85 L30 85 Z" fill="url(#homeRoof)" stroke="#3b82f6" stroke-width="3" stroke-linejoin="round"/>
      <rect x="125" y="50" width="15" height="25" fill="#3b82f6" opacity="0.5" stroke="#3b82f6" stroke-width="2"/>
      <rect data-ref="door" x="85" y="115" width="30" height="45" rx="2" fill="#3b82f6" opacity="0.4" stroke="#3b82f6" stroke-width="2"/>
      <circle cx="108" cy="137" r="2" fill="#3b82f6"/>

      <g data-ref="window-left">
        <rect x="52" y="100" width="22" height="22" rx="2" fill="#60a5fa" opacity="0.3" stroke="#3b82f6" stroke-width="2"/>
        <line x1="63" y1="100" x2="63" y2="122" stroke="#3b82f6" stroke-width="1.5"/>
        <line x1="52" y1="111" x2="74" y2="111" stroke="#3b82f6" stroke-width="1.5"/>
      </g>

      <g data-ref="window-right">
        <rect x="126" y="100" width="22" height="22" rx="2" fill="#60a5fa" opacity="0.3" stroke="#3b82f6" stroke-width="2"/>
        <line x1="137" y1="100" x2="137" y2="122" stroke="#3b82f6" stroke-width="1.5"/>
        <line x1="126" y1="111" x2="148" y2="111" stroke="#3b82f6" stroke-width="1.5"/>
      </g>
    </svg>
  `,

  premiumReport: () => `
    <svg viewBox="0 0 200 200" class="w-32 h-32" data-svg="premium-report">
      <defs>
        <linearGradient id="reportPaper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="reportBadge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.6"/>
        </linearGradient>
      </defs>

      <rect x="65" y="45" width="80" height="120" rx="4" fill="#8b5cf6" opacity="0.05"/>
      <rect x="62" y="42" width="80" height="120" rx="4" fill="#8b5cf6" opacity="0.08"/>
      <rect data-ref="paper" x="58" y="38" width="80" height="120" rx="4" fill="url(#reportPaper)" stroke="#8b5cf6" stroke-width="2.5"/>
      <path d="M138 38 L138 53 L123 38 Z" fill="#8b5cf6" opacity="0.15"/>

      <g data-ref="badge">
        <circle cx="100" cy="78" r="22" fill="url(#reportBadge)" stroke="#8b5cf6" stroke-width="2.5"/>
        <circle cx="100" cy="78" r="18" fill="none" stroke="#8b5cf6" stroke-width="1" opacity="0.3"/>
      </g>

      <path data-ref="check" d="M85 98 L95 108 L115 83" stroke="#8b5cf6" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="100" stroke-dashoffset="0"/>

      <g data-ref="lines">
        <line x1="68" y1="120" x2="132" y2="120" stroke="#8b5cf6" stroke-width="2.5" opacity="0.35" stroke-linecap="round"/>
        <line x1="68" y1="132" x2="115" y2="132" stroke="#8b5cf6" stroke-width="2.5" opacity="0.35" stroke-linecap="round"/>
        <line x1="68" y1="144" x2="125" y2="144" stroke="#8b5cf6" stroke-width="2.5" opacity="0.3" stroke-linecap="round"/>
      </g>

      <circle cx="118" cy="65" r="3" fill="#a78bfa" opacity="0.6"/>
    </svg>
  `,

  motHistory: () => `
    <svg viewBox="0 0 200 200" class="w-32 h-32" data-svg="mot-history">
      <defs>
        <linearGradient id="clockFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.3"/>
        </linearGradient>
        <radialGradient id="clockCenter">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#059669" stop-opacity="0.6"/>
        </radialGradient>
      </defs>

      <circle cx="105" cy="105" r="62" fill="#10b981" opacity="0.08"/>
      <circle data-ref="outer-ring" cx="100" cy="100" r="65" fill="none" stroke="#10b981" stroke-width="2" opacity="0.3"/>
      <circle cx="100" cy="100" r="58" fill="url(#clockFace)" stroke="#10b981" stroke-width="3"/>
      <circle cx="100" cy="100" r="50" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.2"/>

      <g data-ref="ticks">
        <circle cx="100" cy="48" r="4" fill="#10b981" opacity="0.5"/>
        <circle cx="132" cy="63" r="4" fill="#10b981" opacity="0.5"/>
        <circle cx="147" cy="95" r="4" fill="#10b981" opacity="0.5"/>
        <circle cx="132" cy="132" r="4" fill="#10b981" opacity="0.5"/>
        <circle cx="100" cy="152" r="4" fill="#10b981" opacity="0.5"/>
        <circle cx="68" cy="132" r="4" fill="#10b981" opacity="0.5"/>
        <circle cx="53" cy="100" r="4" fill="#10b981" opacity="0.5"/>
        <circle cx="68" cy="68" r="4" fill="#10b981" opacity="0.5"/>
      </g>

      <circle cx="100" cy="100" r="6" fill="url(#clockCenter)" stroke="#10b981" stroke-width="1"/>
      <line data-ref="hour-hand" x1="100" y1="100" x2="100" y2="70" stroke="#10b981" stroke-width="4" stroke-linecap="round" style="transform-origin: 100px 100px"/>
      <line data-ref="minute-hand" x1="100" y1="100" x2="125" y2="100" stroke="#10b981" stroke-width="3" stroke-linecap="round" style="transform-origin: 100px 100px"/>

      <path d="M85 75 Q90 70 95 75" stroke="#34d399" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
    </svg>
  `,

  faq: () => `
    <svg viewBox="0 0 200 200" class="w-32 h-32" data-svg="faq">
      <defs>
        <linearGradient id="faqCircle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.4"/>
        </linearGradient>
        <linearGradient id="questionMark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="1"/>
        </linearGradient>
      </defs>

      <circle data-ref="outer-circle" cx="100" cy="100" r="65" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.2" style="transform-origin: 100px 100px"/>

      <g data-ref="rings" style="transform-origin: 100px 100px">
        <circle cx="100" cy="100" r="58" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.15" stroke-dasharray="5,5"/>
      </g>

      <circle cx="103" cy="103" r="52" fill="#f59e0b" opacity="0.08"/>
      <circle cx="100" cy="100" r="52" fill="url(#faqCircle)" stroke="#f59e0b" stroke-width="3"/>
      <circle cx="100" cy="100" r="44" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.2"/>

      <g data-ref="question">
        <path d="M85 82 Q85 70 95 68 Q105 66 110 70 Q115 74 115 82 Q115 88 110 92 Q105 96 100 96 L100 110"
              stroke="url(#questionMark)"
              stroke-width="4"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"/>
      </g>

      <circle data-ref="dot" cx="100" cy="123" r="5" fill="#f59e0b" opacity="0.9"/>

      <circle cx="130" cy="75" r="2.5" fill="#fbbf24" opacity="0.6"/>
      <circle cx="70" cy="125" r="2" fill="#fbbf24" opacity="0.5"/>
      <circle cx="125" cy="120" r="1.5" fill="#fbbf24" opacity="0.4"/>
    </svg>
  `,

  contact: () => `
    <svg viewBox="0 0 200 200" class="w-32 h-32" data-svg="contact">
      <defs>
        <linearGradient id="envelope" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f9a8d4" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#ec4899" stop-opacity="0.4"/>
        </linearGradient>
        <linearGradient id="envelopeFlap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ec4899" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#db2777" stop-opacity="0.6"/>
        </linearGradient>
      </defs>

      <g data-ref="envelope" style="transform-origin: 100px 100px">
        <rect x="53" y="73" width="100" height="70" rx="6" fill="#ec4899" opacity="0.08"/>
        <rect x="48" y="68" width="100" height="70" rx="6" fill="url(#envelope)" stroke="#ec4899" stroke-width="2.5"/>
        <path d="M48 68 L98 108 L148 68" fill="#ec4899" opacity="0.15"/>

        <g data-ref="lines">
          <line x1="60" y1="95" x2="90" y2="95" stroke="#ec4899" stroke-width="1.5" opacity="0.3" stroke-linecap="round"/>
          <line x1="60" y1="105" x2="85" y2="105" stroke="#ec4899" stroke-width="1.5" opacity="0.3" stroke-linecap="round"/>
        </g>

        <g data-ref="flap">
          <path d="M48 68 L98 103 L148 68" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M48 138 L78 108" stroke="#ec4899" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M148 138 L118 108" stroke="#ec4899" stroke-width="2.5" stroke-linecap="round"/>
        </g>

        <g data-ref="heart" style="transform-origin: 125px 85px">
          <path d="M125 88 L127 85 Q128 83 130 83 Q132 83 132 85 Q132 87 125 92 Q118 87 118 85 Q118 83 120 83 Q122 83 123 85 Z"
                fill="#ec4899"
                opacity="0.7"/>
        </g>
      </g>

      <circle cx="155" cy="75" r="2" fill="#f9a8d4" opacity="0.5"/>
      <circle cx="45" cy="130" r="2.5" fill="#f9a8d4" opacity="0.6"/>
    </svg>
  `,

  knowledgeCenter: () => `
    <svg viewBox="0 0 200 200" class="w-32 h-32" data-svg="knowledge-center">
      <defs>
        <linearGradient id="bookLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#0891b2" stop-opacity="0.4"/>
        </linearGradient>
        <linearGradient id="bookRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0891b2" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="bookmark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.8"/>
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="155" rx="50" ry="6" fill="#06b6d4" opacity="0.1"/>
      <rect x="98" y="52" width="4" height="98" fill="#06b6d4" opacity="0.15"/>

      <g data-ref="left-page">
        <path d="M55 55 Q55 50 60 50 L100 50 L100 150 L60 150 Q55 150 55 145 Z"
              fill="url(#bookLeft)"
              stroke="#06b6d4"
              stroke-width="2.5"/>
        <path d="M100 50 Q95 60 95 100 Q95 140 100 150" fill="#06b6d4" opacity="0.1" stroke="none"/>

        <g data-ref="left-lines">
          <line x1="68" y1="75" x2="92" y2="75" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="68" y1="88" x2="88" y2="88" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="68" y1="101" x2="92" y2="101" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="68" y1="114" x2="85" y2="114" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="68" y1="127" x2="90" y2="127" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
        </g>
      </g>

      <g data-ref="right-page">
        <path d="M100 50 L140 50 Q145 50 145 55 L145 145 Q145 150 140 150 L100 150 Z"
              fill="url(#bookRight)"
              stroke="#06b6d4"
              stroke-width="2.5"/>
        <path d="M100 50 Q105 60 105 100 Q105 140 100 150" fill="#06b6d4" opacity="0.1" stroke="none"/>

        <g data-ref="right-lines">
          <line x1="108" y1="75" x2="132" y2="75" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="108" y1="88" x2="128" y2="88" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="108" y1="101" x2="132" y2="101" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="108" y1="114" x2="125" y2="114" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
          <line x1="108" y1="127" x2="130" y2="127" stroke="#06b6d4" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
        </g>
      </g>

      <g data-ref="bookmark">
        <path d="M115 50 L115 85 L120 80 L125 85 L125 50 Z"
              fill="url(#bookmark)"
              stroke="#06b6d4"
              stroke-width="1.5"/>
      </g>

      <circle cx="70" cy="65" r="2" fill="#22d3ee" opacity="0.6"/>
      <circle cx="130" cy="135" r="2.5" fill="#22d3ee" opacity="0.5"/>
    </svg>
  `
};

/* ============================================
   ANIMATION CONFIGURATIONS
   ============================================ */

const ANIMATIONS = {
  initHomeSVG: (svg) => {
    const roof = svg.querySelector('[data-ref="roof"]');
    const windowLeft = svg.querySelector('[data-ref="window-left"]');
    const windowRight = svg.querySelector('[data-ref="window-right"]');

    return [
      animate(roof, {
        translateY: [-2, 2],
        duration: 3000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate([windowLeft, windowRight], {
        scale: [1, 1.05],
        duration: 2000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true,
        delay: stagger(400)
      })
    ];
  },

  initPremiumReportSVG: (svg) => {
    const badge = svg.querySelector('[data-ref="badge"]');
    const check = svg.querySelector('[data-ref="check"]');
    const paper = svg.querySelector('[data-ref="paper"]');

    return [
      animate(badge, {
        rotate: [-3, 3],
        duration: 2500,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate(check, {
        strokeDashoffset: [0, 100],
        duration: 1500,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true,
        loopDelay: 2000
      }),
      animate(paper, {
        translateY: [-1, 1],
        duration: 3500,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      })
    ];
  },

  initMotHistorySVG: (svg) => {
    const hourHand = svg.querySelector('[data-ref="hour-hand"]');
    const minuteHand = svg.querySelector('[data-ref="minute-hand"]');
    const outerRing = svg.querySelector('[data-ref="outer-ring"]');
    const ticks = svg.querySelector('[data-ref="ticks"]');

    return [
      animate(hourHand, {
        rotate: [0, 30],
        duration: 8000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate(minuteHand, {
        rotate: [0, 360],
        duration: 12000,
        easing: 'linear',
        loop: true
      }),
      animate(outerRing, {
        scale: [1, 1.05],
        opacity: [0.3, 0.5],
        duration: 2000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true
      }),
      animate(Array.from(ticks?.children || []), {
        opacity: [0.4, 0.7],
        duration: 1500,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true,
        delay: stagger(200)
      })
    ];
  },

  initFaqSVG: (svg) => {
    const question = svg.querySelector('[data-ref="question"]');
    const dot = svg.querySelector('[data-ref="dot"]');
    const outerCircle = svg.querySelector('[data-ref="outer-circle"]');
    const rings = svg.querySelector('[data-ref="rings"]');

    return [
      animate(question, {
        translateY: [-3, 3],
        duration: 1800,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true
      }),
      animate(dot, {
        scale: [1, 1.3],
        opacity: [0.8, 1],
        duration: 1000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate(outerCircle, {
        scale: [1, 1.1],
        opacity: [0.3, 0.1],
        duration: 2500,
        easing: 'easeOutQuad',
        direction: 'alternate',
        loop: true
      }),
      animate(rings, {
        rotate: 360,
        duration: 20000,
        easing: 'linear',
        loop: true
      })
    ];
  },

  initContactSVG: (svg) => {
    const envelope = svg.querySelector('[data-ref="envelope"]');
    const flap = svg.querySelector('[data-ref="flap"]');
    const heart = svg.querySelector('[data-ref="heart"]');
    const lines = svg.querySelector('[data-ref="lines"]');

    return [
      animate(envelope, {
        rotate: [-2, 2],
        duration: 3000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate(flap, {
        translateY: [-2, 1],
        duration: 2000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true
      }),
      animate(heart, {
        scale: [1, 1.15],
        duration: 1200,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true
      }),
      animate(Array.from(lines?.children || []), {
        translateX: [-5, 0],
        opacity: [0.3, 0.6],
        duration: 1500,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true,
        delay: stagger(200)
      })
    ];
  },

  initKnowledgeCenterSVG: (svg) => {
    const leftPage = svg.querySelector('[data-ref="left-page"]');
    const rightPage = svg.querySelector('[data-ref="right-page"]');
    const bookmark = svg.querySelector('[data-ref="bookmark"]');
    const leftLines = svg.querySelector('[data-ref="left-lines"]');
    const rightLines = svg.querySelector('[data-ref="right-lines"]');

    return [
      animate(leftPage, {
        rotateY: [-2, 2],
        duration: 3500,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate(rightPage, {
        rotateY: [2, -2],
        duration: 3500,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate(bookmark, {
        translateX: [-1, 1],
        duration: 2500,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      }),
      animate(Array.from(leftLines?.children || []), {
        opacity: [0.3, 0.6],
        duration: 2000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true,
        delay: stagger(150)
      }),
      animate(Array.from(rightLines?.children || []), {
        opacity: [0.3, 0.6],
        duration: 2000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true,
        delay: stagger(150, { start: 300 })
      })
    ];
  }
};

/* ============================================
   VANILLA HEADER CLASS
   ============================================ */

class VanillaHeader {
  constructor(container) {
    this.container = container;
    this.state = {
      sidebarExpanded: false,
      moreExpanded: false
    };
    this.animations = new Map();
    this.animationsInitialized = false;
    this.abortController = new AbortController();
    this.refs = {};

    this.init();
  }

  init() {
    this.render();
    this.cacheDOMReferences();
    this.setupEventListeners();
  }

  render() {
    const html = `
      <!-- Skip to main content -->
      <a
        href="#main-content"
        class="fixed -top-10 left-20 bg-blue-600 text-white px-4 py-2 text-sm font-medium z-[1001] transition-all duration-200 focus:top-4 focus:outline-2 focus:outline-white focus:outline-offset-2"
      >
        Skip to main content
      </a>

      <!-- Backdrop Overlay -->
      <div
        data-backdrop
        class="fixed inset-0 bg-black transition-opacity duration-300 z-40 opacity-0 pointer-events-none"
        aria-hidden="true"
      ></div>

      <!-- Collapsed Sidebar - Always Visible -->
      <aside
        data-sidebar
        class="fixed left-0 top-0 h-screen w-[60px] bg-white border-r border-neutral-200 z-50 flex flex-col items-center py-6 gap-6"
        aria-label="Main navigation"
      >
        <!-- Compact Logo -->
        <a
          href="/"
          data-nav-link="/"
          class="flex flex-col items-center justify-center w-10 h-10 transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
          aria-label="motorwise - Vehicle intelligence platform - Home"
        >
          <span class="text-2xl font-bold text-neutral-900 leading-none font-jost"></span>
          <span class="text-lg font-bold text-blue-600 leading-none font-jost relative">
            w
            <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span>
          </span>
        </a>

        <!-- Hamburger Button -->
        <button
          data-hamburger
          class="flex items-center justify-center w-10 h-10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 text-neutral-700 hover:text-neutral-900"
          aria-expanded="false"
          aria-label="Open navigation menu"
        >
          <i class="ph ph-list text-3xl"></i>
        </button>
      </aside>

      <!-- Expanded Panel - Slides Out -->
      <div
        data-sidebar-panel
        class="fixed left-[60px] top-0 h-screen w-[320px] bg-white border-r border-neutral-200 z-40 transform transition-transform duration-300 ease-out overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -translate-x-full"
        aria-hidden="true"
      >
        <!-- Header Section -->
        <div class="px-6 py-6 border-b border-neutral-200 flex items-start justify-between">
          <div>
            <h1 class="text-xl font-medium text-neutral-900 leading-tight tracking-tight m-0 font-jost">
              motor<span class="text-blue-600 relative inline-block">w<span class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></span></span>ise
            </h1>
            <p class="text-xs text-neutral-600 mt-1 font-jost">Clear data. Wise choices</p>
          </div>

          <button
            data-close-sidebar
            class="flex items-center justify-center w-8 h-8 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
            aria-label="Close navigation menu"
          >
            <i class="ph ph-x text-2xl"></i>
          </button>
        </div>

        <!-- Visual Navigation Cards -->
        <div class="px-6 py-6 flex flex-col gap-4" data-nav-cards>
          ${NAV_ITEMS.map((item, index) => `
            <a
              href="${item.href}"
              data-nav-card
              data-href="${item.href}"
              data-svg-key="${item.svgKey}"
              class="relative w-full aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 ${item.borderColor} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 block ${item.bgColor}"
            >
              <!-- SVG Background - Centered -->
              <div class="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300" data-svg-container="${item.svgKey}">
                <!-- SVG will be inserted here -->
              </div>

              <!-- Text Label - Lower Left with Pill Background -->
              <div class="absolute bottom-4 left-4 z-10">
                <span class="inline-block px-4 py-2 ${item.pillColor} ${item.textColor} text-xs font-semibold uppercase tracking-wider rounded-full font-jost shadow-sm">
                  ${item.label}
                </span>
              </div>

              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            </a>
          `).join('')}
        </div>

        <!-- More Section -->
        <div class="px-6 pb-6">
          <button
            data-more-button
            class="w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 hover:bg-neutral-50 rounded-lg"
            aria-expanded="false"
            aria-label="More links"
          >
            <span class="text-sm font-medium text-neutral-900 font-jost">More</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="transition-transform duration-200 rotate-0"
              data-more-icon
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div data-more-content class="transition-all duration-200 ease-out max-h-0 opacity-0 overflow-hidden">
            <ul class="list-none m-0 p-0">
              ${ADDITIONAL_LINKS.map((item, index) => `
                <li class="m-0">
                  <a
                    href="${item.href}"
                    data-nav-link="${item.href}"
                    class="text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 px-4 py-3 block transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded-lg font-jost"
                  >
                    ${item.label}
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- Beta Banner - Adjusted for sidebar -->
      <div class="fixed top-0 left-[60px] right-0 bg-neutral-50 py-3 z-30 border-b border-neutral-200">
        <div class="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
          <strong class="inline-block text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-blue-600 text-white flex-shrink-0 font-jost">BETA</strong>
          <p class="text-xs text-neutral-600 m-0 leading-relaxed font-jost">
            This is a new service – your{' '}
            <a href="/contact" data-nav-link="/contact" class="text-blue-600 underline underline-offset-2 hover:text-neutral-900 hover:decoration-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 focus-visible:bg-neutral-50 focus-visible:no-underline">feedback</a>{' '}
            will help us to improve it.
          </p>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  cacheDOMReferences() {
    this.refs = {
      backdrop: this.container.querySelector('[data-backdrop]'),
      sidebar: this.container.querySelector('[data-sidebar]'),
      panel: this.container.querySelector('[data-sidebar-panel]'),
      hamburger: this.container.querySelector('[data-hamburger]'),
      closeSidebar: this.container.querySelector('[data-close-sidebar]'),
      moreButton: this.container.querySelector('[data-more-button]'),
      moreContent: this.container.querySelector('[data-more-content]'),
      moreIcon: this.container.querySelector('[data-more-icon]'),
      navCards: this.container.querySelectorAll('[data-nav-card]'),
      navLinks: this.container.querySelectorAll('[data-nav-link]')
    };
  }

  setupEventListeners() {
    const signal = this.abortController.signal;

    // Hamburger toggle
    this.refs.hamburger?.addEventListener('click', () => this.toggleSidebar(), { signal });

    // Close sidebar button
    this.refs.closeSidebar?.addEventListener('click', () => this.closeSidebar(), { signal });

    // Backdrop click
    this.refs.backdrop?.addEventListener('click', () => this.closeSidebar(), { signal });

    // More toggle
    this.refs.moreButton?.addEventListener('click', () => this.toggleMore(), { signal });

    // Navigation clicks (event delegation)
    this.refs.navLinks?.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e), { signal });
    });

    // Click outside to close
    document.addEventListener('click', (e) => this.handleClickOutside(e), { signal, passive: true });

    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeydown(e), { signal, passive: false });
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.updateDOM();
  }

  updateDOM() {
    requestAnimationFrame(() => {
      const { sidebarExpanded, moreExpanded } = this.state;

      // Update sidebar
      if (sidebarExpanded) {
        this.refs.panel?.classList.remove('-translate-x-full');
        this.refs.panel?.setAttribute('aria-hidden', 'false');
        this.refs.backdrop?.classList.remove('opacity-0', 'pointer-events-none');
        this.refs.backdrop?.classList.add('opacity-50');
        this.refs.hamburger?.classList.add('text-blue-600');
        this.refs.hamburger?.classList.remove('text-neutral-700');
        this.refs.hamburger?.setAttribute('aria-expanded', 'true');
        this.refs.hamburger?.setAttribute('aria-label', 'Close navigation menu');
        document.body.style.overflow = 'hidden';

        // Initialize animations on first open
        if (!this.animationsInitialized) {
          this.initializeAnimations();
          this.animationsInitialized = true;
        }
      } else {
        this.refs.panel?.classList.add('-translate-x-full');
        this.refs.panel?.setAttribute('aria-hidden', 'true');
        this.refs.backdrop?.classList.add('opacity-0', 'pointer-events-none');
        this.refs.backdrop?.classList.remove('opacity-50');
        this.refs.hamburger?.classList.remove('text-blue-600');
        this.refs.hamburger?.classList.add('text-neutral-700');
        this.refs.hamburger?.setAttribute('aria-expanded', 'false');
        this.refs.hamburger?.setAttribute('aria-label', 'Open navigation menu');
        document.body.style.overflow = 'unset';
      }

      // Update "more" section
      if (moreExpanded) {
        this.refs.moreContent?.classList.remove('max-h-0', 'opacity-0');
        this.refs.moreContent?.classList.add('max-h-96', 'opacity-100');
        this.refs.moreIcon?.classList.add('rotate-180');
        this.refs.moreButton?.setAttribute('aria-expanded', 'true');
      } else {
        this.refs.moreContent?.classList.add('max-h-0', 'opacity-0');
        this.refs.moreContent?.classList.remove('max-h-96', 'opacity-100');
        this.refs.moreIcon?.classList.remove('rotate-180');
        this.refs.moreButton?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  initializeAnimations() {
    // Insert SVGs and initialize animations
    NAV_ITEMS.forEach(item => {
      const container = this.container.querySelector(`[data-svg-container="${item.svgKey}"]`);
      if (!container) return;

      // Insert SVG
      container.innerHTML = SVG_TEMPLATES[item.svgKey]();

      // Get the SVG element
      const svg = container.querySelector('svg');
      if (!svg) return;

      // Initialize animations for this SVG
      const animKey = `init${item.svgKey.charAt(0).toUpperCase() + item.svgKey.slice(1)}SVG`;
      const animationFunc = ANIMATIONS[animKey];

      if (animationFunc) {
        const anims = animationFunc(svg);
        this.animations.set(item.svgKey, anims);
      }
    });
  }

  toggleSidebar() {
    this.setState({ sidebarExpanded: !this.state.sidebarExpanded });
    if (!this.state.sidebarExpanded) {
      this.setState({ moreExpanded: false });
    }
  }

  closeSidebar() {
    this.setState({
      sidebarExpanded: false,
      moreExpanded: false
    });
  }

  toggleMore() {
    this.setState({ moreExpanded: !this.state.moreExpanded });
  }

  handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');

    // For SPA navigation, dispatch custom event
    if (href && href.startsWith('/')) {
      e.preventDefault();
      this.closeSidebar();

      // Dispatch navigation event for React Router
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate', {
          detail: { path: href }
        }));
      }, 300);
    }
  }

  handleClickOutside(e) {
    if (!this.state.sidebarExpanded) return;

    const clickedSidebar = this.refs.sidebar?.contains(e.target);
    const clickedPanel = this.refs.panel?.contains(e.target);

    if (!clickedSidebar && !clickedPanel) {
      this.closeSidebar();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.state.sidebarExpanded) {
      e.preventDefault();
      this.closeSidebar();
      this.refs.hamburger?.focus();
    }

    if (e.key === 'Tab' && this.state.sidebarExpanded) {
      this.trapFocus(e);
    }
  }

  trapFocus(e) {
    const focusableElements = this.refs.panel?.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  }

  destroy() {
    // Stop all animations
    this.animations.forEach(anims => {
      if (Array.isArray(anims)) {
        anims.forEach(anim => anim?.pause && anim.pause());
      }
    });
    this.animations.clear();

    // Remove all event listeners
    this.abortController.abort();

    // Reset body overflow
    document.body.style.overflow = 'unset';

    // Clear DOM references
    this.refs = {};

    // Clear container
    this.container.innerHTML = '';
  }
}

/* ============================================
   REACT COMPATIBILITY WRAPPER
   ============================================ */

export default function Header() {
  const containerRef = useRef(null);
  const headerInstance = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      headerInstance.current = new VanillaHeader(containerRef.current);
    }

    return () => {
      headerInstance.current?.destroy();
    };
  }, []);

  return <div ref={containerRef}></div>;
}
