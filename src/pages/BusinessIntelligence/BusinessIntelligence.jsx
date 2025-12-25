// pages/BusinessIntelligence/BusinessIntelligence.jsx
import React, { useState } from 'react';
import { useBusinessIntelligence } from './hooks/useBusinessIntelligence';
import LivePricing from './LivePricing';
import SupplyChainAnalytics from './SupplyChainAnalytics';
import MarketInsights from './MarketInsights';

const BusinessIntelligence = () => {
  const { 
    marketData, 
    supplyChainMetrics, 
    predictDemand, 
    calculateOptimalPrice,
    loading 
  } = useBusinessIntelligence();
  
  const [activeTab, setActiveTab] = useState('pricing');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-saffron-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time market analytics and supply chain optimization</p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">💹</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Market Price</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${Object.values(marketData).reduce((acc, market) => acc + parseFloat(market.current_price.replace('$', '')), 0) / Object.values(marketData).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">🚛</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">On-Time Delivery</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supplyChainMetrics.on_time_delivery_rate?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Supply Health</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supplyChainMetrics.health_score?.toFixed(1)}/100
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Quality Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supplyChainMetrics.quality_retention_rate?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'pricing', name: 'Live Pricing', icon: '💹' },
                { id: 'supply-chain', name: 'Supply Chain', icon: '🚛' },
                { id: 'market-insights', name: 'Market Insights', icon: '📊' },
                { id: 'demand-forecast', name: 'Demand Forecast', icon: '🔮' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-saffron-500 text-saffron-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'pricing' && <LivePricing marketData={marketData} />}
          {activeTab === 'supply-chain' && <SupplyChainAnalytics metrics={supplyChainMetrics} />}
          {activeTab === 'market-insights' && <MarketInsights />}
          {activeTab === 'demand-forecast' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Demand Forecasting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Pomegranate Demand (Next 30 days)</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {predictDemand('pomegranate', 'dubai', '30d').toLocaleString()} kg
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Optimal Selling Price</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    ${calculateOptimalPrice(
                      { quality_grade: 'A+', origin: 'Maharashtra' },
                      0.85,
                      { demand_level: 'HIGH', market: 'dubai' }
                    ).toFixed(2)}/kg
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;