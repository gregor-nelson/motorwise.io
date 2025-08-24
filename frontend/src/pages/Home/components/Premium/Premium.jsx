import React, { useState, useEffect, useRef } from 'react';
import AnalysisPipelineVisualizer from './AnalysisPipelineVisualizer';
import ReportPreviewShowcase from './ReportPreviewShowcase';
// import PremiumBackground3D from './PremiumBackground3D';

// Confidence Meter Component
function ConfidenceMeter({ value = 86 }) {
  const barRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="w-full max-w-md bg-neutral-50 rounded-lg shadow-sm p-4 mt-6">
      <div className="flex justify-between text-xs font-medium text-neutral-600 mb-2">
        <span>Amateur Risk</span>
        <span>Professional Confidence</span>
      </div>
      <div className="h-3 w-full bg-neutral-200 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={`h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-[2000ms] ease-out ${
            isVisible ? `w-[${value}%]` : 'w-0'
          }`}
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-500 mt-2">
        <span>High vulnerability</span>
        <span className="font-medium text-green-600">{value}% protected</span>
      </div>
    </div>
  );
}

const PremiumVehicleReports = () => {
  const [showRiskCalculator, setShowRiskCalculator] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef(null);
  
  const calculateRisk = (price) => {
    if (!price) return 0;
    const numPrice = parseInt(price.replace(/[£,]/g, ''));
    if (numPrice < 5000) return 15;
    if (numPrice < 15000) return 35;
    if (numPrice < 30000) return 55;
    return 75;
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const toggleSection = (sectionId) => {
    setActiveSection(prev => prev === sectionId ? null : sectionId);
  };

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const premiumFeatures = {
    protection: {
      identityVerification: {
        label: "Expose Hidden Vehicle Secrets",
        description: "Uncover what sellers desperately hope you'll never discover. Access the same classified DVLA intelligence that police use to catch criminals - revealing stolen vehicles, insurance write-offs, and illegal modifications before they destroy your investment",
        outcome: "Sleep soundly knowing you'll never fall victim to a £20,000 nightmare that gets seized at your doorstep",
        authority: "Government-grade intelligence • Used by law enforcement",
        emotionalHook: "Smart buyers know what amateurs miss"
      },
      fraudProtection: {
        label: "Outsmart the £800M Mileage Fraud Epidemic", 
        description: "While naive buyers lose thousands to odometer fraud every day, you'll wield the same forensic tools that insurance investigators use to expose the criminals stealing from unsuspecting families",
        outcome: "Watch other buyers get fooled while you confidently walk away from ticking time bombs",
        authority: "Forensic-grade fraud detection • Patent-pending algorithms",
        emotionalHook: "Join the elite who refuse to be victims"
      }
    },
    professionalAnalysis: {
      technicalIntelligence: {
        label: "Think Like a Master Technician",
        description: "Command the same insider knowledge that BMW, Mercedes, and Audi technicians guard jealously - secret service bulletins, hidden recalls, and manufacturer cover-ups that could save or cost you thousands",
        outcome: "Negotiate like a seasoned dealer who knows every weakness and expensive surprise lurking ahead",
        authority: "Professional-grade database • Trusted by 150,000+ elite mechanics",
        emotionalHook: "Knowledge is power - and power is profit"
      },
      usageInsights: {
        label: "See Through the Seller's Lies",
        description: "Piercing through polished stories with military-grade pattern recognition that exposes brutal commercial abuse, hidden taxi use, and punishing driving that sellers pray you'll never suspect",
        outcome: "Become the buyer that sellers fear - the one who sees everything they're trying to hide",
        authority: "Forensic analysis tech • Military-derived algorithms",
        emotionalHook: "Elevate yourself above the deceived masses"
      }
    },
    empowerment: {
      marketIntelligence: {
        label: "Dominate Every Negotiation",
        description: "Arm yourself with the devastating market intelligence that dealers use to crush amateur buyers - 40+ million vehicle records analyzed to reveal exactly when you're being robbed and when you've found hidden gold",
        outcome: "Transform from prey into predator - watch sellers squirm as you expose their inflated prices with surgical precision",
        authority: "Dealer-grade market analysis • 2M+ professional reports annually",
        emotionalHook: "Turn the tables on those who profit from ignorance"
      },
      confidenceScore: {
        label: "Achieve Unstoppable Buying Confidence",
        description: "Eliminate the crushing anxiety and second-guessing that paralyzes ordinary buyers - wield the same multi-layered risk assessment that fleet managers and automotive executives trust with million-pound decisions",
        outcome: "Move with the unshakeable certainty of someone who has insider knowledge while others stumble in the dark",
        authority: "Executive-grade decision framework • Trusted by industry leaders",
        emotionalHook: "Confidence is the ultimate luxury"
      }
    }
  };

  return (
    <div id="services" ref={componentRef} className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 bg-white text-neutral-900 relative overflow-hidden min-h-screen">
      {/* <PremiumBackground3D /> */}
      <div className="relative z-10">
      <header className="mb-16">
        <div className="inline-flex items-center px-3 py-1 mb-4 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
          <i className="ph ph-shield-check mr-2"></i>
          Professional Intelligence
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-4">
          Become The Buyer Sellers Fear
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl mb-4">
          While amateur buyers stumble blindly into costly traps, you'll possess the same classified intelligence that 
          government agencies and automotive professionals use to expose hidden dangers and seize unfair advantages.
        </p>
        <div className="inline-flex items-center px-4 py-2 text-xs font-medium bg-red-50 text-red-700 rounded-lg shadow-sm">
          <i className="ph ph-warning-circle mr-2"></i>
          £2.3B stolen from innocent buyers annually - don't be next
        </div>
        <div className="mt-3 text-xs text-neutral-500">
          Join the insider circle that profits while others lose
        </div>

        <ConfidenceMeter value={86} />

        {/* Analysis Pipeline Visualizer */}
        <div className="mt-12 mb-12">
          <AnalysisPipelineVisualizer />
        </div>

        {/* Report Preview Showcase */}
        <div className="mt-16 mb-12">
          <ReportPreviewShowcase />
        </div>

        <div className="mt-6 p-4 bg-neutral-50 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <i className="ph ph-calculator text-sm text-neutral-600"></i>
              <span className="text-sm font-medium text-neutral-900">Smart Buyer Risk Assessment</span>
            </div>
            <button 
              onClick={() => setShowRiskCalculator(!showRiskCalculator)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              {showRiskCalculator ? 'Hide' : 'Calculate Your Risk'}
            </button>
          </div>
          
          {showRiskCalculator && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Vehicle price you're considering:</label>
                <input 
                  type="text"
                  value={vehiclePrice}
                  onChange={(e) => {
                    setVehiclePrice(e.target.value);
                    setRiskScore(calculateRisk(e.target.value));
                  }}
                  placeholder="£15,000"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                />
              </div>
              
              {riskScore > 0 && (
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-red-700">
                      Without professional intelligence, your fraud risk is:
                    </span>
                    <span className="text-sm font-bold text-red-700">{riskScore}%</span>
                  </div>
                  <div className="text-xs text-red-600 mb-2">
                    Potential loss: £{Math.round(parseInt(vehiclePrice.replace(/[£,]/g, '')) * (riskScore/100)).toLocaleString()}
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    ✓ Our intelligence reduces this risk to &lt;5% - protecting your investment
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <div className="space-y-8 mb-12">
        {/* Protection Layer - Dynamic Heights */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div 
              className="p-6 bg-transparent rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group border border-neutral-100 hover:border-blue-200"
              onClick={() => toggleCard('identity-verification')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                    <i className="ph ph-shield-check text-xl text-blue-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Government Intelligence</div>
                    <div className="text-xs text-neutral-600">DVLA • Police • Border Control</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">99.8%</div>
                  <div className="text-xs text-blue-600">Accuracy</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Vehicle verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-600 font-medium">Theft checked</span>
                </div>
              </div>

              {expandedCards['identity-verification'] && (
                <div className="pt-3 mt-3 space-y-2 text-xs text-neutral-700">
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Real-time DVLA integration exposes write-offs and theft records</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Police database access reveals criminal vehicle history</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Identity verification prevents cloned vehicle fraud</span>
                  </div>
                </div>
              )}
              
              <div className={`text-center mt-3 text-blue-600 transition-transform duration-300 ${expandedCards['identity-verification'] ? 'rotate-180' : 'rotate-0'}`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
            <div 
              className="p-6 bg-transparent rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group border border-neutral-100 hover:border-red-200"
              onClick={() => toggleCard('fraud-protection')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors duration-300">
                    <i className="ph ph-detective text-xl text-red-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Fraud Detection</div>
                    <div className="text-xs text-neutral-600">AI • Pattern Recognition • Forensic</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">£800M</div>
                  <div className="text-xs text-red-600">Annual fraud</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-yellow-600 font-medium">Mileage verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">History validated</span>
                </div>
              </div>

              {expandedCards['fraud-protection'] && (
                <div className="pt-3 mt-3 space-y-2 text-xs text-neutral-700">
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Advanced algorithms detect mileage tampering patterns</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Cross-reference MOT history for inconsistencies</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Identify commercial use hiding as private sales</span>
                  </div>
                </div>
              )}
              
              <div className={`text-center mt-3 text-red-600 transition-transform duration-300 ${expandedCards['fraud-protection'] ? 'rotate-180' : 'rotate-0'}`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Analysis Layer - Dynamic Heights */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div 
              className="p-6 bg-transparent rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group border border-neutral-100 hover:border-blue-200"
              onClick={() => toggleCard('technical-intelligence')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                    <i className="ph ph-wrench text-xl text-blue-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Technical Intelligence</div>
                    <div className="text-xs text-neutral-600">Recalls • Bulletins • Service History</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">150K+</div>
                  <div className="text-xs text-blue-600">Garages</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">4</div>
                  <div className="text-xs text-green-600">Recalls</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">12</div>
                  <div className="text-xs text-yellow-600">Bulletins</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">8</div>
                  <div className="text-xs text-blue-600">Issues</div>
                </div>
              </div>

              {expandedCards['technical-intelligence'] && (
                <div className="pt-3 mt-3 space-y-2 text-xs text-neutral-700">
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-warning-circle text-yellow-600 mt-0.5 flex-shrink-0"></i>
                    <span>DPF regeneration issues - potential expensive repair</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-info text-blue-600 mt-0.5 flex-shrink-0"></i>
                    <span>Brake fluid sensor recall completed in 2022</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-wrench text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Regular service intervals maintained professionally</span>
                  </div>
                </div>
              )}
              
              <div className={`text-center mt-3 text-blue-600 transition-transform duration-300 ${expandedCards['technical-intelligence'] ? 'rotate-180' : 'rotate-0'}`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
            <div 
              className="p-6 bg-transparent rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group border border-neutral-100 hover:border-purple-200"
              onClick={() => toggleCard('usage-insights')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors duration-300">
                    <i className="ph ph-chart-line text-xl text-purple-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Usage Analysis</div>
                    <div className="text-xs text-neutral-600">Behavior • Commercial • Abuse Detection</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">67</div>
                  <div className="text-xs text-purple-600">Risk Score</div>
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-green-600 font-medium">Private Use Likelihood</span>
                    <span className="text-sm font-bold text-green-600">75%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-yellow-600 font-medium">Gentle Driving Score</span>
                    <span className="text-sm font-bold text-yellow-600">52%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-out"></div>
                  </div>
                </div>
              </div>

              {expandedCards['usage-insights'] && (
                <div className="pt-3 mt-3 space-y-2 text-xs text-neutral-700">
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-warning text-yellow-600 mt-0.5 flex-shrink-0"></i>
                    <span>Multiple brake component failures suggest hard driving</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-info text-blue-600 mt-0.5 flex-shrink-0"></i>
                    <span>Consistent MOT intervals indicate responsible ownership</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>No evidence of commercial or taxi usage patterns</span>
                  </div>
                </div>
              )}
              
              <div className={`text-center mt-3 text-purple-600 transition-transform duration-300 ${expandedCards['usage-insights'] ? 'rotate-180' : 'rotate-0'}`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12"></div>

      <header className="mb-16">
        <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          <i className="ph ph-chart-bar text-2xl mr-3 text-green-600"></i>
          Make Informed Decisions
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
          Transform complex vehicle data into clear insights that reveal the true condition, 
          value, and risk profile of any vehicle - giving you the knowledge to buy confidently or walk away strategically.
        </p>
      </header>

      <div className="space-y-8 mb-12">
        {/* Empowerment Layer - Dynamic Heights */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div 
              className="p-6 bg-transparent rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group border border-neutral-100 hover:border-green-200"
              onClick={() => toggleCard('market-intelligence')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-300">
                    <i className="ph ph-chart-bar text-xl text-green-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Market Intelligence</div>
                    <div className="text-xs text-neutral-600">Price Analysis • Market Position</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">£18.5K</div>
                  <div className="text-xs text-green-600">Fair value</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-red-600 font-medium">Above market</span>
                  </div>
                  <div className="text-lg font-bold text-red-600">+£2.3K</div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600 font-medium">Similar vehicles</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">247</div>
                </div>
              </div>

              {expandedCards['market-intelligence'] && (
                <div className="pt-3 mt-3 space-y-2 text-xs text-neutral-700">
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-info text-blue-600 mt-0.5 flex-shrink-0"></i>
                    <span>Price analysis based on 40M+ vehicle transactions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-warning text-yellow-600 mt-0.5 flex-shrink-0"></i>
                    <span>Seller asking 14% above fair market value</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>Good negotiation position with maintenance issues</span>
                  </div>
                </div>
              )}
              
              <div className={`text-center mt-3 text-green-600 transition-transform duration-300 ${expandedCards['market-intelligence'] ? 'rotate-180' : 'rotate-0'}`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
            <div 
              className="p-6 bg-transparent rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group border border-neutral-100 hover:border-purple-200"
              onClick={() => toggleCard('confidence-score')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors duration-300">
                    <i className="ph ph-brain text-xl text-purple-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Confidence Score</div>
                    <div className="text-xs text-neutral-600">Risk Assessment • Decision Support</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">86%</div>
                  <div className="text-xs text-purple-600">Confidence</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-purple-600 font-medium">Confidence Level</span>
                  <span className="text-xs font-bold text-purple-600">High</span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-1000 ease-out ${
                      i < 4 ? 'bg-purple-500' : 'bg-neutral-200'
                    }`}></div>
                  ))}
                </div>
              </div>

              {expandedCards['confidence-score'] && (
                <div className="pt-3 mt-3 space-y-2 text-xs text-neutral-700">
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                    <span>No major red flags in vehicle history</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-info text-blue-600 mt-0.5 flex-shrink-0"></i>
                    <span>Maintenance issues are manageable and expected</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ph ph-warning text-yellow-600 mt-0.5 flex-shrink-0"></i>
                    <span>Price negotiation recommended due to known issues</span>
                  </div>
                </div>
              )}
              
              <div className={`text-center mt-3 text-purple-600 transition-transform duration-300 ${expandedCards['confidence-score'] ? 'rotate-180' : 'rotate-0'}`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12"></div>

      <header className="mb-12">
        <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          <i className="ph ph-database text-2xl mr-3 text-purple-600"></i>
          Professional-Grade Data Sources
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
          Official government databases and professional-grade intelligence systems
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
              <i className="ph ph-shield-check text-2xl text-blue-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-xs text-blue-600">Verified</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">DVLA Official</div>
          <div className="text-xs text-neutral-600 mb-3">Government database access</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600">Real-time integration</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-300">
              <i className="ph ph-chart-pie text-2xl text-green-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">40M+</div>
              <div className="text-xs text-green-600">MOT Records</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">MOT Intelligence</div>
          <div className="text-xs text-neutral-600 mb-3">Forensic pattern analysis</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600">20+ years data</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors duration-300">
              <i className="ph ph-wrench text-2xl text-purple-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">150K+</div>
              <div className="text-xs text-purple-600">Garages</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">AutoData Pro</div>
          <div className="text-xs text-neutral-600 mb-3">Technical service database</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-purple-600">OEM trusted</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors duration-300">
              <i className="ph ph-detective text-2xl text-red-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">AI</div>
              <div className="text-xs text-red-600">Powered</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">Fraud Detection</div>
          <div className="text-xs text-neutral-600 mb-3">Financial-grade algorithms</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-600">Patent pending</span>
          </div>
        </div>
      </div>

      <div className="h-12"></div>

      <header className="mb-12">
        <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          <i className="ph ph-lightning text-2xl mr-3 text-yellow-600"></i>
          Professional Intelligence Delivery
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
          Multiple formats for every decision-making context
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-300">
              <i className="ph ph-clock text-2xl text-green-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">30s</div>
              <div className="text-xs text-green-600">Analysis</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">Instant Analysis</div>
          <div className="text-xs text-neutral-600 mb-3">Complete intelligence delivered fast</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600">Real-time</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
              <i className="ph ph-code text-2xl text-blue-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">API</div>
              <div className="text-xs text-blue-600">Access</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">Enterprise API</div>
          <div className="text-xs text-neutral-600 mb-3">Direct system integration</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-blue-600">Dealer-grade</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors duration-300">
              <i className="ph ph-file-pdf text-2xl text-red-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">PDF</div>
              <div className="text-xs text-red-600">Reports</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">Legal Documentation</div>
          <div className="text-xs text-neutral-600 mb-3">Professional-grade reports</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-600">Bank-compliant</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 ease-out cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors duration-300">
              <i className="ph ph-cube text-2xl text-purple-600"></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">3D</div>
              <div className="text-xs text-purple-600">Visual</div>
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-2">Advanced Visualization</div>
          <div className="text-xs text-neutral-600 mb-3">Interactive data insights</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-purple-600">Interactive</span>
          </div>
        </div>
      </div>
      </div>

    </div>
  );
};

export default PremiumVehicleReports;