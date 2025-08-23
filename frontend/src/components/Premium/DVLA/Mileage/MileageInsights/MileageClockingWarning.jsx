import React from 'react';

/**
 * MileageClockingWarning Component
 * Displays a warning banner for vehicles with detected clocking
 * Styled with Tailwind CSS following the Universal Component Design System
 */
const MileageClockingWarning = ({ anomalies, mileageStats }) => {
  if (!anomalies || anomalies.length === 0 || !anomalies.some(a => a.type === 'decrease')) {
    return null;
  }

  // Calculate the total amount of clocking (sum of all decreases)
  const totalClocking = anomalies
    .filter(a => a.type === 'decrease')
    .reduce((sum, anomaly) => sum + Math.abs(anomaly.details.diff), 0);

  // Get the largest single clocking incident
  const largestClocking = Math.max(
    ...anomalies
      .filter(a => a.type === 'decrease')
      .map(anomaly => Math.abs(anomaly.details.diff))
  );

  return (
    <section className="space-y-12 mb-16">
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-red-600 leading-tight tracking-tight mb-3 flex items-center gap-2">
          <i className="ph ph-warning-circle text-lg"></i> Mileage Inconsistency Detected
        </h3>
        <p className="text-sm text-neutral-600 mb-8">
          Critical issue requiring immediate attention - potential odometer tampering detected
        </p>
      </div>
      
      {/* Alert Summary Card */}
      <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-start gap-3 mb-4">
          <i className="ph ph-x-circle text-lg text-red-600 mt-0.5"></i>
          <div>
            <div className="text-sm font-medium text-red-900 mb-2">Critical Alert</div>
            <p className="text-xs text-red-700 leading-relaxed">
              This vehicle has <span className="font-semibold text-red-600">
                {anomalies.filter(a => a.type === 'decrease').length > 1 ? 
                  `${anomalies.filter(a => a.type === 'decrease').length} instances` : 
                  'an instance'}
              </span> where the recorded mileage has decreased between MOT tests. 
              This could indicate <span className="font-semibold">odometer tampering (clocking)</span>, instrument cluster replacement, or MOT data entry errors.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-start">
              <i className="ph ph-x-circle text-lg text-red-600 mr-3 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">Total Discrepancy</div>
                <div className="text-xs text-neutral-600">Combined decreases</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-red-600">{totalClocking.toLocaleString()}</div>
              <div className="text-xs text-red-600">miles</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-start">
              <i className="ph ph-warning-circle text-lg text-red-600 mr-3 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">Largest Instance</div>
                <div className="text-xs text-neutral-600">Single biggest decrease</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-red-600">{largestClocking.toLocaleString()}</div>
              <div className="text-xs text-red-600">miles</div>
            </div>
          </div>
        </div>
        
        {mileageStats && mileageStats.adjustedValues && (
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start">
                <i className="ph ph-chart-line text-lg text-blue-600 mr-3 mt-0.5"></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Adjusted Average</div>
                  <div className="text-xs text-neutral-600">Excluding inconsistencies</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-blue-600">
                  {mileageStats.averageAnnualMileage?.toLocaleString() || 'Unknown'}
                </div>
                <div className="text-xs text-blue-600">miles/year</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legal Notice Card */}
      <div className="bg-neutral-50 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-2">
          <i className="ph ph-scales text-lg text-neutral-600 mt-0.5 flex-shrink-0"></i>
          <div>
            <div className="text-sm font-medium text-neutral-900 mb-2">Legal Notice</div>
            <div className="text-xs text-neutral-700 leading-relaxed">
              Selling a vehicle with incorrect mileage is illegal under the Consumer Protection from Unfair Trading Regulations. 
              Buyers should verify mileage independently and sellers must disclose any known discrepancies.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MileageClockingWarning;