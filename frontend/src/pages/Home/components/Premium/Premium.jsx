import React from 'react';
import './PremiumStyles.css';
// import PremiumBackground3D from './PremiumBackground3D';

const PremiumVehicleReports = () => {

  const premiumFeatures = {
    protection: {
      identityVerification: {
        label: "Verify Vehicle's True Identity",
        description: "Access the same official DVLA records used by police and government enforcement agencies to confirm legitimate ownership and legal status",
        outcome: "Never buy a stolen, written-off, or illegally modified vehicle that could be seized",
        authority: "Direct government database integration"
      },
      fraudProtection: {
        label: "Protect Against Mileage Fraud", 
        description: "Detect odometer tampering using forensic-level analysis - the same techniques used by insurance investigators to identify the £800M annual UK mileage fraud",
        outcome: "Avoid vehicles with falsified mileage that depreciate 15-30% upon discovery",
        authority: "Patent-pending fraud detection algorithms"
      }
    },
    professionalAnalysis: {
      technicalIntelligence: {
        label: "Access Professional Repair Intelligence",
        description: "Tap into the same comprehensive technical database trusted by BMW, Mercedes, and Audi dealerships worldwide - containing detailed service bulletins, recalls, and known issues for every UK vehicle",
        outcome: "Understand potential repair costs and reliability issues before purchase - not after",
        authority: "AutoData professional database used by 150,000+ mechanics"
      },
      usageInsights: {
        label: "Reveal True Vehicle Usage History",
        description: "Advanced 3D visualization technology exposing hidden usage patterns that traditional reports miss - including commercial use, intensive driving periods, and long-term storage",
        outcome: "See exactly how hard the vehicle has been worked throughout its entire life",
        authority: "Proprietary pattern recognition originally developed for forensic analysis"
      }
    },
    empowerment: {
      marketIntelligence: {
        label: "Know Your Market Position",
        description: "Compare against 40+ million UK vehicle records using the same market analysis tools trusted by major dealer groups and automotive finance companies to price vehicles accurately",
        outcome: "Walk away from overpriced vehicles or confidently negotiate knowing you've found genuine value",
        authority: "UK's largest vehicle intelligence platform - processing 2M+ reports annually"
      },
      confidenceScore: {
        label: "Buy With Complete Confidence",
        description: "Multi-layered risk assessment combining government records, professional repair data, and market intelligence into a single, actionable confidence rating that removes guesswork from your decision",
        outcome: "Make your purchase decision with the same confidence level as industry professionals",
        authority: "Decision framework used by fleet managers and automotive professionals"
      }
    }
  };

  return (
    <div className="premium-container" style={{ position: 'relative' }}>
      {/* <PremiumBackground3D /> */}
      <div style={{ position: 'relative', zIndex: 10 }}>
      <header className="premium-section-header">
        <h1>Professional Vehicle Intelligence</h1>
        <p className="premium-section-description">
          Access the same comprehensive vehicle data and analysis tools used by automotive 
          professionals, government agencies, and major dealer groups to make confident purchasing decisions.
        </p>
        <div className="premium-experience-badge">
          Protecting buyers from £2.3B annual UK vehicle fraud
        </div>
      </header>
      <div className="premium-data-grid">
        {/* Protection Layer - Addresses Primary Fears */}
        <div className="premium-feature-group">
          <div className="premium-feature-row">
            <div className="premium-feature-item premium-hero-feature">
              <div className="premium-feature-label highlight">{premiumFeatures.protection.identityVerification.label}</div>
              <div className="premium-feature-value">{premiumFeatures.protection.identityVerification.description}</div>
              <div className="premium-outcome-statement">
                {premiumFeatures.protection.identityVerification.outcome}
              </div>
              <div className="premium-trust-indicator">
                {premiumFeatures.protection.identityVerification.authority}
              </div>
            </div>
            <div className="premium-feature-item critical">
              <div className="premium-feature-label">{premiumFeatures.protection.fraudProtection.label}</div>
              <div className="premium-feature-value">{premiumFeatures.protection.fraudProtection.description}</div>
              <div className="premium-outcome-statement">
                {premiumFeatures.protection.fraudProtection.outcome}
              </div>
              <div className="premium-confidence-builder">
                {premiumFeatures.protection.fraudProtection.authority}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Analysis Layer - Builds Credibility */}
        <div className="premium-feature-group">
          <div className="premium-feature-row">
            <div className="premium-feature-item security">
              <div className="premium-feature-label">{premiumFeatures.professionalAnalysis.technicalIntelligence.label}</div>
              <div className="premium-feature-value">{premiumFeatures.professionalAnalysis.technicalIntelligence.description}</div>
              <div className="premium-outcome-statement">
                {premiumFeatures.professionalAnalysis.technicalIntelligence.outcome}
              </div>
              <div className="premium-authority-indicator">
                {premiumFeatures.professionalAnalysis.technicalIntelligence.authority}
              </div>
            </div>
            <div className="premium-feature-item premium">
              <div className="premium-feature-label">{premiumFeatures.professionalAnalysis.usageInsights.label}</div>
              <div className="premium-feature-value">{premiumFeatures.professionalAnalysis.usageInsights.description}</div>
              <div className="premium-outcome-statement">
                {premiumFeatures.professionalAnalysis.usageInsights.outcome}
              </div>
              <div className="premium-authority-indicator">
                {premiumFeatures.professionalAnalysis.usageInsights.authority}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-section-divider"></div>

      <header className="premium-section-header">
        <h1>Make Informed Decisions</h1>
        <p className="premium-section-description">
          Transform complex vehicle data into clear insights that reveal the true condition, 
          value, and risk profile of any vehicle - giving you the knowledge to buy confidently or walk away strategically.
        </p>
      </header>

      <div className="premium-data-grid">
        {/* Empowerment Layer - Delivers Confidence */}
        <div className="premium-feature-group">
          <div className="premium-feature-row">
            <div className="premium-feature-item trust">
              <div className="premium-feature-label">{premiumFeatures.empowerment.marketIntelligence.label}</div>
              <div className="premium-feature-value">{premiumFeatures.empowerment.marketIntelligence.description}</div>
              <div className="premium-outcome-statement">
                {premiumFeatures.empowerment.marketIntelligence.outcome}
              </div>
              <div className="premium-authority-indicator">
                {premiumFeatures.empowerment.marketIntelligence.authority}
              </div>
            </div>
            <div className="premium-feature-item premium">
              <div className="premium-feature-label">{premiumFeatures.empowerment.confidenceScore.label}</div>
              <div className="premium-feature-value">{premiumFeatures.empowerment.confidenceScore.description}</div>
              <div className="premium-outcome-statement">
                {premiumFeatures.empowerment.confidenceScore.outcome}
              </div>
              <div className="premium-authority-indicator">
                {premiumFeatures.empowerment.confidenceScore.authority}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-section-divider"></div>

      <header className="premium-section-header">
        <h1>Professional-Grade Data Sources</h1>
        <p className="premium-section-description">
          Every piece of intelligence sourced from official government databases, professional repair 
          systems, and industry-leading data providers - ensuring accuracy and reliability at the level demanded by automotive professionals.
        </p>
      </header>

      <div className="premium-data-grid">
        <div className="premium-feature-group">
          <div className="premium-feature-row">
            <div className="premium-feature-item">
              <div className="premium-feature-label">DVLA Official Records</div>
              <div className="premium-feature-value">Direct real-time integration with the UK government's official vehicle database - the same authoritative source used by police forces, DVLA enforcement teams, and border agencies for vehicle verification</div>
              <div className="premium-authority-indicator">
                100% government-verified accuracy
              </div>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-label">Complete MOT Intelligence</div>
              <div className="premium-feature-value">Forensic analysis of 40+ million MOT test records using advanced pattern recognition to identify hidden vehicle issues, usage anomalies, and maintenance red flags that traditional reports miss</div>
              <div className="premium-authority-indicator">
                20+ years of UK testing data analyzed
              </div>
            </div>
          </div>
        </div>

        <div className="premium-feature-group">
          <div className="premium-feature-row">
            <div className="premium-feature-item">
              <div className="premium-feature-label">AutoData Professional Database</div>
              <div className="premium-feature-value">Complete access to the comprehensive technical database that powers service departments at BMW, Mercedes, Audi, and 150,000+ professional garages worldwide - including recall information, service bulletins, and known issues for every UK vehicle model</div>
              <div className="premium-authority-indicator">
                Trusted by automotive manufacturers and professional mechanics globally
              </div>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-label">Advanced Fraud Detection Engine</div>
              <div className="premium-feature-value">Proprietary algorithms originally developed for financial fraud detection, now adapted for automotive intelligence to identify mileage tampering, identity fraud, and hidden vehicle histories with forensic-level accuracy</div>
              <div className="premium-authority-indicator">
                Patent-pending technology licensed from fraud prevention specialists
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-section-divider"></div>

      <header className="premium-section-header">
        <h1>Professional Intelligence Delivery</h1>
        <p className="premium-section-description">
          Access your comprehensive vehicle intelligence through multiple professional-grade formats 
          designed for different decision-making contexts - from instant web analysis to detailed documentation suitable for legal and financial use.
        </p>
      </header>

      <div className="premium-data-grid">
        <div className="premium-feature-group">
          <div className="premium-feature-row">
            <div className="premium-feature-item">
              <div className="premium-feature-label">Instant Professional Analysis</div>
              <div className="premium-feature-value">Complete vehicle intelligence delivered within 30 seconds through our optimized analysis engine - providing the same depth of insight that typically requires hours of manual research and verification</div>
              <div className="premium-outcome-statement">
                Arrive at every viewing armed with professional-level knowledge
              </div>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-label">Enterprise-Grade API Access</div>
              <div className="premium-feature-value">Direct API integration providing the same real-time vehicle intelligence that powers major UK automotive retailers, dealer groups, and fleet management companies</div>
              <div className="premium-outcome-statement">
                Integrate professional vehicle intelligence directly into your business systems
              </div>
            </div>
          </div>
        </div>

        <div className="premium-feature-group">
          <div className="premium-feature-row">
            <div className="premium-feature-item">
              <div className="premium-feature-label">Comprehensive Professional Documentation</div>
              <div className="premium-feature-value">Detailed PDF reports meeting the documentation standards required by banks, insurance companies, and legal professionals for high-value vehicle transactions - providing official verification of vehicle condition and history</div>
              <div className="premium-outcome-statement">
                Documentation that protects your investment and satisfies professional requirements
              </div>
            </div>
            <div className="premium-feature-item">
              <div className="premium-feature-label">Advanced Visualization Technology</div>
              <div className="premium-feature-value">Interactive 3D analysis and dynamic visualizations that transform complex data relationships into immediately understandable insights - revealing patterns and connections that traditional static reports cannot communicate effectively</div>
              <div className="premium-outcome-statement">
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