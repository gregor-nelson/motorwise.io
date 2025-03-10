import React, { useState } from 'react';

const VehicleInfo = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVehicleData(null);

    try {
      const response = await fetch('http://localhost:8004/api/vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch vehicle data');
      }

      const data = await response.json();
      setVehicleData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Vehicle Information Service</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <label htmlFor="registrationNumber" className="block text-gray-700 font-semibold mb-2">
            Registration Number:
          </label>
          <input
            id="registrationNumber"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
            placeholder="e.g., AB12CDE"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          Error: {error}
        </div>
      )}

      {vehicleData && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">
            Vehicle Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <span className="block text-sm font-semibold text-gray-600">Registration Number</span>
              <span className="text-lg text-gray-800">{vehicleData.registrationNumber}</span>
            </div>
            
            {vehicleData.make && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Make</span>
                <span className="text-lg text-gray-800">{vehicleData.make}</span>
              </div>
            )}
            
            {vehicleData.colour && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Colour</span>
                <span className="text-lg text-gray-800">{vehicleData.colour}</span>
              </div>
            )}
            
            {vehicleData.yearOfManufacture && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Year of Manufacture</span>
                <span className="text-lg text-gray-800">{vehicleData.yearOfManufacture}</span>
              </div>
            )}
            
            {vehicleData.engineCapacity && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Engine Capacity</span>
                <span className="text-lg text-gray-800">{vehicleData.engineCapacity} cc</span>
              </div>
            )}
            
            {vehicleData.fuelType && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Fuel Type</span>
                <span className="text-lg text-gray-800">{vehicleData.fuelType}</span>
              </div>
            )}
            
            {vehicleData.taxStatus && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Tax Status</span>
                <span className="text-lg text-gray-800">{vehicleData.taxStatus}</span>
              </div>
            )}
            
            {vehicleData.taxDueDate && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Tax Due Date</span>
                <span className="text-lg text-gray-800">{vehicleData.taxDueDate}</span>
              </div>
            )}
            
            {vehicleData.motStatus && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">MOT Status</span>
                <span className="text-lg text-gray-800">{vehicleData.motStatus}</span>
              </div>
            )}
            
            {vehicleData.motExpiryDate && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">MOT Expiry Date</span>
                <span className="text-lg text-gray-800">{vehicleData.motExpiryDate}</span>
              </div>
            )}
            
            {vehicleData.co2Emissions !== undefined && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">CO2 Emissions</span>
                <span className="text-lg text-gray-800">{vehicleData.co2Emissions} g/km</span>
              </div>
            )}
            
            {vehicleData.monthOfFirstRegistration && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">First Registered</span>
                <span className="text-lg text-gray-800">{vehicleData.monthOfFirstRegistration}</span>
              </div>
            )}
            
            {vehicleData.monthOfFirstDvlaRegistration && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">First DVLA Registration</span>
                <span className="text-lg text-gray-800">{vehicleData.monthOfFirstDvlaRegistration}</span>
              </div>
            )}
            
            {vehicleData.wheelplan && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Wheel Plan</span>
                <span className="text-lg text-gray-800">{vehicleData.wheelplan}</span>
              </div>
            )}
            
            {vehicleData.typeApproval && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Type Approval</span>
                <span className="text-lg text-gray-800">{vehicleData.typeApproval}</span>
              </div>
            )}
            
            {vehicleData.revenueWeight && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Revenue Weight</span>
                <span className="text-lg text-gray-800">{vehicleData.revenueWeight} kg</span>
              </div>
            )}
            
            {vehicleData.euroStatus && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Euro Status</span>
                <span className="text-lg text-gray-800">{vehicleData.euroStatus}</span>
              </div>
            )}
            
            {vehicleData.realDrivingEmissions && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Real Driving Emissions</span>
                <span className="text-lg text-gray-800">{vehicleData.realDrivingEmissions}</span>
              </div>
            )}
            
            {vehicleData.dateOfLastV5CIssued && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Last V5C Issued</span>
                <span className="text-lg text-gray-800">{vehicleData.dateOfLastV5CIssued}</span>
              </div>
            )}
            
            {vehicleData.markedForExport !== undefined && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Marked for Export</span>
                <span className="text-lg text-gray-800">{vehicleData.markedForExport ? 'Yes' : 'No'}</span>
              </div>
            )}
            
            {vehicleData.automatedVehicle !== undefined && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">Automated Vehicle</span>
                <span className="text-lg text-gray-800">{vehicleData.automatedVehicle ? 'Yes' : 'No'}</span>
              </div>
            )}
            
            {vehicleData.artEndDate && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <span className="block text-sm font-semibold text-gray-600">ART End Date</span>
                <span className="text-lg text-gray-800">{vehicleData.artEndDate}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleInfo;