import React, { useState, useEffect, useRef } from 'react';
// import PremiumBackground3D from './PremiumBackground3D';

// Confidence Meter Component
function ConfidenceMeter({ value = 86 }) {
  const barRef = useRef(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    // Start at 0 width until visible
    el.style.width = "0%";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.width = `${value}%`;
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="w-full max-w-md bg-neutral-50 border border-neutral-200 p-4 mt-6">
      <div className="flex justify-between text-xs font-medium text-neutral-600 mb-2">
        <span>Amateur Risk</span>
        <span>Professional Confidence</span>
      </div>
      <div className="h-3 w-full bg-neutral-200 overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-2000 ease-out"
          style={{ width: "0%" }}
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
  
  const calculateRisk = (price) => {
    if (!price) return 0;
    const numPrice = parseInt(price.replace(/[£,]/g, ''));
    if (numPrice < 5000) return 15;
    if (numPrice < 15000) return 35;
    if (numPrice < 30000) return 55;
    return 75;
  };

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 bg-white text-neutral-900 relative overflow-hidden min-h-screen">
      {/* <PremiumBackground3D /> */}
      <div className="relative z-10">
      <header className="mb-12 md:mb-16 lg:mb-20">
        <div className="inline-flex items-center px-3 py-1 mb-4 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          <i className="ph ph-shield-check mr-2"></i>
          Professional Intelligence
        </div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-4">
          Become The Buyer Sellers Fear
        </h1>
        <p className="text-sm md:text-base text-neutral-700 leading-relaxed max-w-3xl mb-4">
          While amateur buyers stumble blindly into costly traps, <strong>you'll possess the same classified intelligence</strong> that 
          government agencies and automotive professionals use to expose hidden dangers and seize unfair advantages.
        </p>
        <div className="inline-flex items-center px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-100">
          <i className="ph ph-warning-circle mr-2"></i>
          £2.3B stolen from innocent buyers annually - don't be next
        </div>
        <div className="mt-3 text-xs text-neutral-500">
          Join the insider circle that profits while others lose
        </div>

        <ConfidenceMeter value={86} />

        <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-800">Smart Buyer Risk Assessment</span>
            <button 
              onClick={() => setShowRiskCalculator(!showRiskCalculator)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
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
                  className="w-full px-3 py-2 text-sm border border-neutral-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              {riskScore > 0 && (
                <div className="p-3 bg-white border border-red-100">
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
      <div className="space-y-8 md:space-y-12 mb-12 md:mb-16">
        {/* Protection Layer - Addresses Primary Fears */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-4 md:p-6 border-l-4 border-blue-600 bg-blue-50 border border-blue-100">
              <div className="flex items-start mb-3">
                <i className="ph ph-shield-check text-lg text-blue-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-semibold text-neutral-900">{premiumFeatures.protection.identityVerification.label}</div>
              </div>
              <div className="text-sm text-neutral-800 leading-relaxed mb-4">{premiumFeatures.protection.identityVerification.description}</div>
              <div className="text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                {premiumFeatures.protection.identityVerification.outcome}
              </div>
              <div className="text-xs text-neutral-500 font-medium mb-2">
                {premiumFeatures.protection.identityVerification.authority}
              </div>
              <div className="text-xs text-blue-600 font-medium italic">
                {premiumFeatures.protection.identityVerification.emotionalHook}
              </div>
            </div>
            <div className="p-4 md:p-6 border-l-4 border-red-600 bg-red-50 border border-red-100">
              <div className="flex items-start mb-3">
                <i className="ph ph-warning-circle text-lg text-red-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-semibold text-neutral-900">{premiumFeatures.protection.fraudProtection.label}</div>
              </div>
              <div className="text-sm text-neutral-800 leading-relaxed mb-4">{premiumFeatures.protection.fraudProtection.description}</div>
              <div className="text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                {premiumFeatures.protection.fraudProtection.outcome}
              </div>
              <div className="text-xs text-neutral-500 font-medium mb-2">
                {premiumFeatures.protection.fraudProtection.authority}
              </div>
              <div className="text-xs text-red-600 font-medium italic">
                {premiumFeatures.protection.fraudProtection.emotionalHook}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Analysis Layer - Builds Credibility */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-4 md:p-6 border-l-4 border-blue-600 bg-blue-50 border border-blue-100">
              <div className="flex items-start mb-3">
                <i className="ph ph-database text-lg text-blue-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-semibold text-neutral-900">{premiumFeatures.professionalAnalysis.technicalIntelligence.label}</div>
              </div>
              <div className="text-sm text-neutral-800 leading-relaxed mb-4">{premiumFeatures.professionalAnalysis.technicalIntelligence.description}</div>
              <div className="text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                {premiumFeatures.professionalAnalysis.technicalIntelligence.outcome}
              </div>
              <div className="text-xs text-neutral-500 font-medium mb-2">
                {premiumFeatures.professionalAnalysis.technicalIntelligence.authority}
              </div>
              <div className="text-xs text-blue-600 font-medium italic">
                {premiumFeatures.professionalAnalysis.technicalIntelligence.emotionalHook}
              </div>
            </div>
            <div className="p-4 md:p-6 border-l-4 border-purple-600 bg-purple-50 border border-purple-100">
              <div className="flex items-start mb-3">
                <i className="ph ph-chart-line text-lg text-purple-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-semibold text-neutral-900">{premiumFeatures.professionalAnalysis.usageInsights.label}</div>
              </div>
              <div className="text-sm text-neutral-800 leading-relaxed mb-4">{premiumFeatures.professionalAnalysis.usageInsights.description}</div>
              <div className="text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                {premiumFeatures.professionalAnalysis.usageInsights.outcome}
              </div>
              <div className="text-xs text-neutral-500 font-medium mb-2">
                {premiumFeatures.professionalAnalysis.usageInsights.authority}
              </div>
              <div className="text-xs text-purple-600 font-medium italic">
                {premiumFeatures.professionalAnalysis.usageInsights.emotionalHook}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12 md:h-16 lg:h-20"></div>

      <header className="mb-12 md:mb-16 lg:mb-20">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          <i className="ph ph-chart-bar text-2xl mr-3 text-green-600"></i>
          Make Informed Decisions
        </h1>
        <p className="text-sm md:text-base text-neutral-600 leading-relaxed max-w-3xl">
          Transform complex vehicle data into clear insights that reveal the true condition, 
          value, and risk profile of any vehicle - giving you the knowledge to buy confidently or walk away strategically.
        </p>
      </header>

      <div className="space-y-8 md:space-y-12 mb-12 md:mb-16">
        {/* Empowerment Layer - Delivers Confidence */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-4 md:p-6 border-l-4 border-green-600 bg-green-50 border border-green-100">
              <div className="flex items-start mb-3">
                <i className="ph ph-target text-lg text-green-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-semibold text-neutral-900">{premiumFeatures.empowerment.marketIntelligence.label}</div>
              </div>
              <div className="text-sm text-neutral-800 leading-relaxed mb-4">{premiumFeatures.empowerment.marketIntelligence.description}</div>
              <div className="text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                {premiumFeatures.empowerment.marketIntelligence.outcome}
              </div>
              <div className="text-xs text-neutral-500 font-medium mb-2">
                {premiumFeatures.empowerment.marketIntelligence.authority}
              </div>
              <div className="text-xs text-green-600 font-medium italic">
                {premiumFeatures.empowerment.marketIntelligence.emotionalHook}
              </div>
            </div>
            <div className="p-4 md:p-6 border-l-4 border-purple-600 bg-purple-50 border border-purple-100">
              <div className="flex items-start mb-3">
                <i className="ph ph-check-circle text-lg text-purple-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-semibold text-neutral-900">{premiumFeatures.empowerment.confidenceScore.label}</div>
              </div>
              <div className="text-sm text-neutral-800 leading-relaxed mb-4">{premiumFeatures.empowerment.confidenceScore.description}</div>
              <div className="text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                {premiumFeatures.empowerment.confidenceScore.outcome}
              </div>
              <div className="text-xs text-neutral-500 font-medium mb-2">
                {premiumFeatures.empowerment.confidenceScore.authority}
              </div>
              <div className="text-xs text-purple-600 font-medium italic">
                {premiumFeatures.empowerment.confidenceScore.emotionalHook}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12 md:h-16 lg:h-20"></div>

      <header className="mb-12 md:mb-16 lg:mb-20">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          <i className="ph ph-database text-2xl mr-3 text-purple-600"></i>
          Professional-Grade Data Sources
        </h1>
        <p className="text-sm md:text-base text-neutral-600 leading-relaxed max-w-3xl">
          Every piece of intelligence sourced from official government databases, professional repair 
          systems, and industry-leading data providers - ensuring accuracy and reliability at the level demanded by automotive professionals.
        </p>
      </header>

      <div className="space-y-8 md:space-y-12 mb-12 md:mb-16">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-shield-check text-lg text-blue-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">DVLA Official Records</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Direct real-time integration with the UK government's official vehicle database - the same authoritative source used by police forces, DVLA enforcement teams, and border agencies for vehicle verification</div>
              <div className="text-xs text-neutral-500 font-medium">
                100% government-verified accuracy
              </div>
            </div>
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-magnifying-glass text-lg text-green-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">Complete MOT Intelligence</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Forensic analysis of 40+ million MOT test records using advanced pattern recognition to identify hidden vehicle issues, usage anomalies, and maintenance red flags that traditional reports miss</div>
              <div className="text-xs text-neutral-500 font-medium">
                20+ years of UK testing data analyzed
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-wrench text-lg text-purple-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">AutoData Professional Database</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Complete access to the comprehensive technical database that powers service departments at BMW, Mercedes, Audi, and 150,000+ professional garages worldwide - including recall information, service bulletins, and known issues for every UK vehicle model</div>
              <div className="text-xs text-neutral-500 font-medium">
                Trusted by automotive manufacturers and professional mechanics globally
              </div>
            </div>
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-detective text-lg text-red-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">Advanced Fraud Detection Engine</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Proprietary algorithms originally developed for financial fraud detection, now adapted for automotive intelligence to identify mileage tampering, identity fraud, and hidden vehicle histories with forensic-level accuracy</div>
              <div className="text-xs text-neutral-500 font-medium">
                Patent-pending technology licensed from fraud prevention specialists
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12 md:h-16 lg:h-20"></div>

      <header className="mb-12 md:mb-16 lg:mb-20">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          <i className="ph ph-lightning text-2xl mr-3 text-yellow-600"></i>
          Professional Intelligence Delivery
        </h1>
        <p className="text-sm md:text-base text-neutral-600 leading-relaxed max-w-3xl">
          Access your comprehensive vehicle intelligence through multiple professional-grade formats 
          designed for different decision-making contexts - from instant web analysis to detailed documentation suitable for legal and financial use.
        </p>
      </header>

      <div className="space-y-8 md:space-y-12 mb-12 md:mb-16">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-clock text-lg text-green-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">Instant Professional Analysis</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Complete vehicle intelligence delivered within 30 seconds through our optimized analysis engine - providing the same depth of insight that typically requires hours of manual research and verification</div>
              <div className="text-sm text-neutral-600 font-medium italic leading-relaxed">
                Arrive at every viewing armed with professional-level knowledge
              </div>
            </div>
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-code text-lg text-blue-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">Enterprise-Grade API Access</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Direct API integration providing the same real-time vehicle intelligence that powers major UK automotive retailers, dealer groups, and fleet management companies</div>
              <div className="text-sm text-neutral-600 font-medium italic leading-relaxed">
                Integrate professional vehicle intelligence directly into your business systems
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-file-pdf text-lg text-red-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">Comprehensive Professional Documentation</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Detailed PDF reports meeting the documentation standards required by banks, insurance companies, and legal professionals for high-value vehicle transactions - providing official verification of vehicle condition and history</div>
              <div className="text-sm text-neutral-600 font-medium italic leading-relaxed">
                Documentation that protects your investment and satisfies professional requirements
              </div>
            </div>
            <div className="p-4 md:p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start mb-3">
                <i className="ph ph-cube text-lg text-purple-600 mr-2 mt-0.5"></i>
                <div className="text-sm font-medium text-neutral-800">Advanced Visualization Technology</div>
              </div>
              <div className="text-sm text-neutral-900 leading-relaxed mb-4">Interactive 3D analysis and dynamic visualizations that transform complex data relationships into immediately understandable insights - revealing patterns and connections that traditional static reports cannot communicate effectively</div>
              <div className="text-sm text-neutral-600 font-medium italic leading-relaxed">
                Understand complex vehicle data with the clarity of visual intelligence
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

    </div>
  );
};

export default PremiumVehicleReports;