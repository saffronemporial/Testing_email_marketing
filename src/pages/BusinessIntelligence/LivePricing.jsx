// pages/BusinessIntelligence/LivePricing.jsx
import React from 'react';

const LivePricing = ({ marketData }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Live Global Pricing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(marketData).map(([market, data]) => (
          <div key={market} className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-blue-700 capitalize">{market}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">LIVE</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{data.current_price}</div>
            <div className="text-sm text-gray-600 mt-1">Pomegranate Premium Grade</div>
            <div className="flex items-center mt-2">
              <span className="text-green-600 text-sm font-medium">↗️ +2.3%</span>
              <span className="text-gray-500 text-xs ml-2">vs yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Price Trend Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">30-Day Price Trend</h4>
        <div className="flex items-end space-x-1 h-32">
          {[65, 72, 68, 75, 80, 78, 82, 85, 88, 90, 87, 92].map((height, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-500"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Peak season expected in 2 weeks - +15% premium window
        </div>
      </div>
    </div>
  );
};

export default LivePricing;