// hooks/useBusinessIntelligence.js
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

export const useBusinessIntelligence = () => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState({});
  const [supplyChainMetrics, setSupplyChainMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch market data from your market_prices table
  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Process and aggregate market data by market and product
      const processedData = data.reduce((acc, item) => {
        const key = `${item.market_name}_${item.product_type}`;
        if (!acc[key]) {
          acc[key] = {
            current_price: item.price_per_kg,
            currency: item.currency,
            trend: item.price_trend,
            change_percentage: item.change_percentage,
            demand_level: item.demand_level,
            historical: []
          };
        }
        acc[key].historical.push({
          price: item.price_per_kg,
          timestamp: item.timestamp
        });
        return acc;
      }, {});

      setMarketData(processedData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  // Calculate supply chain metrics from your existing shipments table
  const calculateSupplyChainMetrics = async () => {
    try {
      // Get shipments from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const metrics = {
        total_shipments: shipments.length,
        delivered_shipments: shipments.filter(s => s.status === 'delivered').length,
        in_transit_shipments: shipments.filter(s => s.status === 'in_transit').length,
        average_transit_time: 0,
        on_time_delivery_rate: 0
      };

      // Calculate on-time delivery (you might need to adjust based on your shipment schema)
      const onTimeDeliveries = shipments.filter(shipment => {
        if (!shipment.estimated_delivery || !shipment.actual_delivery) return false;
        return new Date(shipment.actual_delivery) <= new Date(shipment.estimated_delivery);
      }).length;

      metrics.on_time_delivery_rate = shipments.length > 0 ? (onTimeDeliveries / shipments.length) * 100 : 0;

      setSupplyChainMetrics(metrics);
    } catch (error) {
      console.error('Error calculating supply chain metrics:', error);
    }
  };

  // AI-powered demand prediction based on your order history
  const predictDemand = async (productType, market, days = 30) => {
    try {
      // Get historical orders for this product
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('product_type', productType)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Simple seasonal demand prediction
      const seasonalFactors = calculateSeasonalFactors();
      const averageMonthlyDemand = calculateAverageDemand(orders);
      const marketFactor = getMarketFactor(market);
      
      const predictedDemand = averageMonthlyDemand * seasonalFactors * marketFactor;
      
      return Math.round(predictedDemand);
    } catch (error) {
      console.error('Error predicting demand:', error);
      return 1000; // Fallback value
    }
  };

  // Optimal price calculation for your products
  const calculateOptimalPrice = (productCost, marketConditions, qualityGrade = 'A+') => {
    const baseCost = productCost;
    const marketMultiplier = getMarketMultiplier(marketConditions);
    const qualityMultiplier = getQualityMultiplier(qualityGrade);
    const shippingCost = estimateShippingCost(marketConditions.destination);
    
    const optimalPrice = (baseCost + shippingCost) * marketMultiplier * qualityMultiplier;
    
    return {
      optimal_price: optimalPrice.toFixed(2),
      profit_margin: ((optimalPrice - baseCost - shippingCost) / optimalPrice * 100).toFixed(1),
      competitive_position: getCompetitivePosition(optimalPrice, marketConditions.competitor_prices)
    };
  };

  // Real-time market data subscription
  useEffect(() => {
    if (!user) return;

    fetchMarketData();
    calculateSupplyChainMetrics();

    // Subscribe to real-time market price updates
    const marketSubscription = supabase
      .channel('market-prices-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'market_prices' },
        (payload) => {
          setMarketData(prev => {
            const newData = { ...prev };
            const key = `${payload.new.market_name}_${payload.new.product_type}`;
            if (!newData[key]) {
              newData[key] = {
                current_price: payload.new.price_per_kg,
                currency: payload.new.currency,
                trend: payload.new.price_trend,
                change_percentage: payload.new.change_percentage,
                demand_level: payload.new.demand_level,
                historical: []
              };
            }
            newData[key].historical.unshift({
              price: payload.new.price_per_kg,
              timestamp: payload.new.timestamp
            });
            return newData;
          });
        }
      )
      .subscribe();

    return () => {
      marketSubscription.unsubscribe();
    };
  }, [user]);

  return {
    marketData,
    supplyChainMetrics,
    predictDemand,
    calculateOptimalPrice,
    loading,
    refreshData: () => {
      fetchMarketData();
      calculateSupplyChainMetrics();
    }
  };
};

// Helper functions
const calculateSeasonalFactors = () => {
  const month = new Date().getMonth();
  // Higher demand during festival seasons (Q4)
  return month >= 9 && month <= 11 ? 1.4 : 
         month >= 3 && month <= 5 ? 1.2 : 1.0;
};

const calculateAverageDemand = (orders) => {
  if (!orders.length) return 1000;
  const totalQuantity = orders.reduce((sum, order) => sum + (order.quantity || 0), 0);
  return totalQuantity / (orders.length || 1);
};

const getMarketFactor = (market) => {
  const factors = {
    'dubai': 1.3,
    'london': 1.2,
    'mumbai': 1.0,
    'singapore': 1.4
  };
  return factors[market] || 1.0;
};

const getMarketMultiplier = (marketConditions) => {
  const { demand_level, competition_level } = marketConditions;
  let multiplier = 1.0;
  
  if (demand_level === 'high') multiplier *= 1.2;
  if (demand_level === 'low') multiplier *= 0.9;
  if (competition_level === 'low') multiplier *= 1.15;
  
  return multiplier;
};

const getQualityMultiplier = (qualityGrade) => {
  const multipliers = {
    'A+': 1.3,
    'A': 1.1,
    'B': 1.0,
    'C': 0.8
  };
  return multipliers[qualityGrade] || 1.0;
};

const estimateShippingCost = (destination) => {
  const costs = {
    'dubai': 0.15,
    'london': 0.25,
    'mumbai': 0.05,
    'singapore': 0.20
  };
  return costs[destination] || 0.10;
};

const getCompetitivePosition = (ourPrice, competitorPrices = []) => {
  if (!competitorPrices.length) return 'unknown';
  const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
  
  if (ourPrice < avgCompetitorPrice * 0.9) return 'highly_competitive';
  if (ourPrice < avgCompetitorPrice) return 'competitive';
  if (ourPrice > avgCompetitorPrice * 1.1) return 'premium';
  return 'market_average';
};