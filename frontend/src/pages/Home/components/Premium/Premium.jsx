import React, { useState, useEffect } from 'react';
import './PremiumStyles.css';
import '../../home.css'

const ProfessionalVehicleReport = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [motData, setMotData] = useState([]);
  const [tsbData, setTsbData] = useState({});

  useEffect(() => {
    // MOT history data
    setMotData([
      { year: 2019, issues: 2, mileage: 45000, status: 'pass', advisories: ['Nearside Front Anti-roll bar linkage ball joint has slight play'] },
      { year: 2020, issues: 1, mileage: 52000, status: 'pass', advisories: [] },
      { year: 2021, issues: 4, mileage: 58000, status: 'fail', failures: ['Offside Rear Brake disc significantly worn'], advisories: ['Exhaust has a minor leak of exhaust gases'] },
      { year: 2022, issues: 3, mileage: 65000, status: 'pass', advisories: ['Nearside Front Anti-roll bar linkage ball joint has slight play', 'Front brake disc worn'] },
      { year: 2023, issues: 5, mileage: 72000, status: 'fail', failures: ['Service brake efficiency below requirements'], advisories: ['Battery insecure but not likely to fall from carrier'] },
      { year: 2024, issues: 3, mileage: 78000, status: 'pass', advisories: ['Nearside Front Anti-roll bar linkage ball joint has slight play', 'Underside covers corroded'] }
    ]);

    // Simulated TSB data - in real scenario, this would come from the JSON file
    setTsbData({
      categories: {
        'ABS/Brakes': 4,
        'Steering': 5,
        'Electrical': 14,
        'Suspension': 1,
        'Body': 8,
        'Engine management': 7,
        'Drivetrain': 3
      },
      totalBulletins: 28,
      criticalBulletins: 8
    });
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'ABS/Brakes': 'danger',
      'Steering': 'warning',
      'Electrical': 'success',
      'Suspension': 'danger',
      'Body': 'success',
      'Engine management': 'warning',
      'Drivetrain': 'danger'
    };
    return colors[category] || '';
  };

  const correlatedIssues = [
    {
      motIssue: "Anti-roll bar linkage wear",
      yearObserved: [2019, 2022, 2024],
      tsbMatch: "TSB-SUS2742",
      bulletinTitle: "Rear shudder when cornering",
      correlation: "High",
      remedy: "Modified anti-roll bar linkage",
      partNumber: "51320-SNA-A01"
    },
    {
      motIssue: "Service brake efficiency",
      yearObserved: [2023],
      tsbMatch: "TSB-BR1284",
      bulletinTitle: "Loss of braking efficiency",
      correlation: "High",
      remedy: "AC compressor clutch relay replacement",
      partNumber: "39794-SDA-A05"
    },
    {
      motIssue: "Exhaust leak",
      yearObserved: [2021],
      tsbMatch: "None",
      bulletinTitle: "No direct TSB match",
      correlation: "N/A",
      remedy: "Standard exhaust repair recommended",
      partNumber: "N/A"
    }
  ];

  return (
    <div className="premium-page-wrapper">
      <header className="premium-header">
        <div className="premium-header-content">
          <h1>Vehicle Technical Analysis Report</h1>
          <p className="premium-header-body">
            Comprehensive MOT history correlation with manufacturer technical service bulletins
          </p>
          <p className="premium-header-small">
            Honda Civic R16A2 (2006-2012)
          </p>
        </div>
      </header>

      <main className="premium-main-content">
        {/* Key Statistics */}
        <section className="premium-section">
          <div className="premium-grid premium-grid--stats">
            <div className="premium-stat-card">
              <span className="premium-stat-number">28</span>
              <span className="premium-stat-label">Known TSBs</span>
              <span className="premium-stat-source">Manufacturer database</span>
            </div>
            <div className="premium-stat-card">
              <span className="premium-stat-number">67%</span>
              <span className="premium-stat-label">MOT Pass Rate</span>
              <span className="premium-stat-source">6-year history</span>
            </div>
            <div className="premium-stat-card">
              <span className="premium-stat-number">3</span>
              <span className="premium-stat-label">Critical Systems</span>
              <span className="premium-stat-source">At risk</span>
            </div>
            <div className="premium-stat-card">
              <span className="premium-stat-number">£485</span>
              <span className="premium-stat-label">Est. Repair Cost</span>
              <span className="premium-stat-source">Based on TSBs</span>
            </div>
          </div>
        </section>

        {/* System Risk Analysis Section */}
        <section className="premium-section">
          <h2 className="premium-section-title">System Risk Analysis</h2>
          
          <div className="premium-alert">
            <h3 className="premium-alert-title">3 High-Priority Issues Identified</h3>
            <p className="premium-alert-text">
              Based on recurring MOT failures and manufacturer bulletins, immediate attention 
              recommended for suspension and braking systems.
            </p>
          </div>

          <div className="premium-grid premium-grid--two">
            <div className="premium-system-card premium-system-card--danger">
              <h3 className="premium-system-card-title">Suspension System</h3>
              <span className="premium-tag premium-tag--danger">High Risk</span>
              
              <div className="premium-metrics">
                <div className="premium-metric">
                  <span className="premium-metric-label">MOT Mentions</span>
                  <span className="premium-metric-value">4 times</span>
                </div>
                <div className="premium-metric">
                  <span className="premium-metric-label">Related TSBs</span>
                  <span className="premium-metric-value">1 bulletin</span>
                </div>
                <div className="premium-metric">
                  <span className="premium-metric-label">Pattern</span>
                  <span className="premium-metric-value">Every 2-3 years</span>
                </div>
              </div>
              
              <details className="premium-details">
                <summary className="premium-details-summary">View technical details</summary>
                <div className="premium-details-content">
                  <h4>Recurring Issue</h4>
                  <p>Anti-roll bar linkage ball joint wear detected in 2019, 2022, and 2024.</p>
                  
                  <h4>TSB Correlation</h4>
                  <p>
                    <strong>TSB-SUS2742:</strong> Rear shudder when cornering<br/>
                    <strong>Solution:</strong> Replace anti-roll bar linkage<br/>
                    <strong>Part:</strong> 51320-SNA-A01
                  </p>
                </div>
              </details>
            </div>

            <div className="premium-system-card premium-system-card--warning">
              <h3 className="premium-system-card-title">Braking System</h3>
              <span className="premium-tag premium-tag--warning">Medium Risk</span>
              
              <div className="premium-metrics">
                <div className="premium-metric">
                  <span className="premium-metric-label">MOT Failures</span>
                  <span className="premium-metric-value">2 times</span>
                </div>
                <div className="premium-metric">
                  <span className="premium-metric-label">Related TSBs</span>
                  <span className="premium-metric-value">4 bulletins</span>
                </div>
                <div className="premium-metric">
                  <span className="premium-metric-label">Last Issue</span>
                  <span className="premium-metric-value">2023</span>
                </div>
              </div>
              
              <details className="premium-details">
                <summary className="premium-details-summary">View technical details</summary>
                <div className="premium-details-content">
                  <h4>Recent Failures</h4>
                  <p>Service brake efficiency below requirements in 2023. Brake disc significantly worn in 2021.</p>
                  
                  <h4>TSB Correlation</h4>
                  <p>
                    <strong>Multiple TSBs available:</strong> Front brake judder, ABS warning lamp issues, brake system warning lamp illumination
                  </p>
                </div>
              </details>
            </div>
          </div>

          <div className="premium-grid">
            <div>
              <h3 style={{fontSize: 'var(--text-xl)', fontWeight: '600', color: 'var(--gray-800)', marginBottom: 'var(--space-lg)'}}>System Health Overview</h3>
              {Object.entries(tsbData.categories || {}).map(([category, count]) => (
                <div key={category} style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--gray-700)' }}>
                    <span>{category}</span>
                    <span>{count} TSBs</span>
                  </div>
                  <div className="premium-progress">
                    <div 
                      className={`premium-progress-bar premium-progress-bar--${getCategoryColor(category)}`}
                      style={{ width: `${(count / 14) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MOT History Timeline Section */}
        <section className="premium-section">
          <h2 className="premium-section-title">MOT History Timeline</h2>
          
          <div className="premium-timeline">
            {motData.reverse().map((test, index) => (
              <div key={index} className={`premium-timeline-item premium-timeline-item--${test.status}`}>
                <div className="premium-timeline-date">{test.year} - {test.mileage.toLocaleString()} miles</div>
                <span className={`premium-tag premium-tag--${test.status === 'fail' ? 'danger' : 'success'}`}>
                  {test.status.toUpperCase()}
                </span>
                
                {test.failures && test.failures.length > 0 && (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <strong style={{ color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>Failures:</strong>
                    <ul className="premium-list">
                      {test.failures.map((failure, i) => (
                        <li key={i}>{failure}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {test.advisories && test.advisories.length > 0 && (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <strong style={{ color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>Advisories:</strong>
                    <ul className="premium-list">
                      {test.advisories.map((advisory, i) => (
                        <li key={i}>{advisory}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* TSB Correlation Analysis Section */}
        <section className="premium-section">
          <h2 className="premium-section-title">TSB Correlation Analysis</h2>
          
          <div className="premium-warning">
            <h3 className="premium-warning-title">Critical Correlations Found</h3>
            <p className="premium-warning-text">
              2 MOT issues have direct manufacturer technical service bulletin matches. 
              Following TSB remedies could prevent future MOT failures.
            </p>
          </div>

          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>MOT Issue</th>
                  <th>Years Observed</th>
                  <th>TSB Match</th>
                  <th>Correlation</th>
                  <th>Remedy</th>
                  <th>Part Number</th>
                </tr>
              </thead>
              <tbody>
                {correlatedIssues.map((issue, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{issue.motIssue}</strong>
                    </td>
                    <td>
                      {issue.yearObserved.join(', ')}
                    </td>
                    <td>
                      <code>{issue.tsbMatch}</code><br/>
                      <small style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--text-xs)' }}>{issue.bulletinTitle}</small>
                    </td>
                    <td>
                      <span 
                        className={`premium-tag premium-tag--${
                          issue.correlation === 'High' ? 'success' :
                          issue.correlation === 'Medium' ? 'warning' : ''
                        }`}
                      >
                        {issue.correlation}
                      </span>
                    </td>
                    <td>{issue.remedy}</td>
                    <td>
                      <code>{issue.partNumber}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="premium-highlight">
            <h3 className="premium-highlight-title">Cost Savings Analysis</h3>
            <p className="premium-highlight-text">
              Implementing TSB remedies proactively could save approximately <strong>£485</strong> in 
              MOT failure repairs and retests over the next 3 years.
            </p>
          </div>
        </section>

        {/* Issue Categories Breakdown Section */}
        <section className="premium-section">
          <h2 className="premium-section-title">Issue Categories Breakdown</h2>
          
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            {Object.entries(tsbData.categories || {}).map(([category, count]) => (
              <span 
                key={category} 
                className={`premium-badge premium-badge--${getCategoryColor(category)}`}
                onClick={() => setSelectedCategory(category)}
                role="button"
                tabIndex={0}
              >
                {category} ({count})
              </span>
            ))}
          </div>

          <div className="premium-grid premium-grid--two">
            <div className="premium-bulletin">
              <div className="premium-bulletin-header">
                <div>
                  <h4 className="premium-bulletin-title">Battery Discharge Issues</h4>
                  <span className="premium-badge premium-badge--success">Electrical</span>
                </div>
                <span className="premium-bulletin-id">ID: 26</span>
              </div>
              
              <p className="premium-bulletin-text">Multiple TSBs address battery discharge problems related to AC compressor clutch relay faults.</p>
              
              <details className="premium-details">
                <summary className="premium-details-summary">Technical details</summary>
                <div className="premium-details-content">
                  <strong>Affected:</strong> All models with air conditioning<br/>
                  <strong>Cause:</strong> Faulty AC compressor clutch relay (Omron manufacture)<br/>
                  <strong>Solution:</strong> Replace relay with part 39794-SDA-A05
                </div>
              </details>
            </div>

            <div className="premium-bulletin">
              <div className="premium-bulletin-header">
                <div>
                  <h4 className="premium-bulletin-title">Electric Power Steering</h4>
                  <span className="premium-badge premium-badge--warning">Steering</span>
                </div>
                <span className="premium-bulletin-id">ID: 12</span>
              </div>
              
              <p className="premium-bulletin-text">EPS warning lamp illumination and inoperative power steering commonly caused by connection issues.</p>
              
              <details className="premium-details">
                <summary className="premium-details-summary">Technical details</summary>
                <div className="premium-details-content">
                  <strong>Affected:</strong> All models<br/>
                  <strong>Cause:</strong> Poor connection between EPS pump motor and harness<br/>
                  <strong>Solution:</strong> Check and ensure positive connection to ECM
                </div>
              </details>
            </div>
          </div>

          <div>
            <h3 style={{fontSize: 'var(--text-xl)', fontWeight: '600', color: 'var(--gray-800)', marginBottom: 'var(--space-lg)'}}>Most Common TSB Categories</h3>
            <ol style={{fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--gray-700)', paddingLeft: 'var(--space-lg)'}}>
              <li style={{marginBottom: 'var(--space-sm)'}}><strong style={{color: 'var(--gray-900)'}}>Electrical (14 TSBs):</strong> Battery discharge, warning lamps, mirror issues</li>
              <li style={{marginBottom: 'var(--space-sm)'}}><strong style={{color: 'var(--gray-900)'}}>Body (8 TSBs):</strong> Door mechanisms, mirrors, fuel flap</li>
              <li style={{marginBottom: 'var(--space-sm)'}}><strong style={{color: 'var(--gray-900)'}}>Engine Management (7 TSBs):</strong> MIL illumination, trouble codes</li>
              <li style={{marginBottom: 'var(--space-sm)'}}><strong style={{color: 'var(--gray-900)'}}>Steering (5 TSBs):</strong> EPS failures, ESP warnings</li>
              <li style={{marginBottom: 'var(--space-sm)'}}><strong style={{color: 'var(--gray-900)'}}>ABS/Brakes (4 TSBs):</strong> Brake judder, warning lamps</li>
            </ol>
          </div>
        </section>

        {/* Call to Action */}
        <section className="premium-section" style={{ textAlign: 'center' }}>
          <h2 className="premium-section-title">Generate Full Technical Report</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', marginBottom: 'var(--space-xl)', color: 'var(--gray-600)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)' }}>
            Get a comprehensive PDF report with all TSB details, MOT history analysis, and 
            recommended maintenance schedule based on your vehicle's specific history.
          </p>
          <div className="premium-button-group">
            <button className="premium-button premium-button--primary">
              Download Complete Analysis
            </button>
            <button className="premium-button">
              Schedule Inspection
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessionalVehicleReport;