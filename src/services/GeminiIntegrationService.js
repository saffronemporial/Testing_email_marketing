// src/services/GeminiIntegrationService.js
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

class GeminiIntegrationService {
  constructor() {
    this.proxyUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-production-proxy-url.com/api/gemini'
      : 'http://localhost:3001/api/gemini';
  }

  // Generic method to call Gemini API through proxy
  async callGeminiAPI(prompt, contextData = null) {
    try {
      // Call our proxy server instead of the Gemini API directly
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          contextData
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle response from Gemini API
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      logger.error('Error calling Gemini API through proxy:', error);
      throw new Error(`Failed to call Gemini API: ${error.message}`);
    }
  }

  // Test API connection
  async testConnection() {
    try {
      // Test with a simple prompt
      const result = await this.callGeminiAPI("Test connection - please respond with 'API connection successful'");
      logger.log('API connection test successful');
      return result;
    } catch (error) {
      logger.error('API test error:', error);
      throw error;
    }
  }

  // Test API connection
  async testConnection() {
    try {
      // Test with a simple prompt
      const result = await this.callGeminiAPI("Test connection - please respond with 'API connection successful'");
      console.log('API connection test successful:', result);
      return result;
    } catch (error) {
      console.error('API test error:', error);
      throw error;
    }
  }

  // Build context-aware prompts
  buildPrompt(prompt, contextData) {
    const businessContext = `
      You are an AI business analyst for Saffron Emporium, a company that exports:
      1. Pomegranates from Bhinmal, Rajasthan to Dubai
      2. Kids toys from Mumbai to Dubai
      
      Current date: ${new Date().toLocaleDateString()}
      
      Important: Provide specific, actionable insights. Format your response with clear sections, bullet points, and data-driven recommendations.
      Focus on practical business advice that can be implemented immediately.
    `;

    if (contextData) {
      const contextStr = typeof contextData === 'string' ? contextData : JSON.stringify(contextData, null, 2);
      return `${businessContext}\n\nContext data: ${contextStr}\n\n${prompt}`;
    }

    return `${businessContext}\n\n${prompt}`;
  }

  // Sales forecasting using historical data
  async generateSalesForecast(productCategory = null, timeframe = '3 months') {
    try {
      // Get historical sales data
      const { data: salesData, error } = await supabase
        .rpc('get_sales_data_for_forecasting', {
          months_back: 12,
          product_category: productCategory
        });

      if (error) throw error;

      const prompt = `
        Analyze the sales data and provide a detailed forecast for the next ${timeframe}. 
        Include:
        1. Expected revenue projections with confidence intervals
        2. Quantity trends by product category
        3. Seasonal patterns and their impact
        4. Specific recommendations for inventory planning
        5. Risk factors and mitigation strategies
        
        Format the response with clear sections, data tables where appropriate, and actionable recommendations.
        Focus on both pomegranates and toys exports to Dubai.
      `;

      return await this.callGeminiAPI(prompt, salesData);
    } catch (error) {
      logger.error('Error generating sales forecast:', error);
      throw new Error(`Failed to generate sales forecast: ${error.message}`);
    }
  }

  // Anomaly detection in orders
  async detectOrderAnomalies(threshold = 2.0, lookbackDays = 30) {
    try {
      // Get anomaly data
      const { data: anomalies, error } = await supabase
        .rpc('detect_order_anomalies', {
          threshold: threshold,
          lookback_days: lookbackDays
        });

      if (error) {
        logger.error('Error fetching anomalies from Supabase:', error);
        throw error;
      }

      const prompt = `
        Analyze these order anomalies and provide a detailed risk assessment.
        For each significant anomaly, include:
        1. Potential causes (fraud, data error, genuine opportunity, etc.)
        2. Risk level assessment (low, medium, high, critical)
        3. Immediate actions required
        4. Long-term prevention strategies
        5. Impact on business operations and revenue
        
        Create a prioritized list of anomalies that require attention, with the most critical ones first.
        Provide specific contact recommendations for each anomaly type.
      `;

      return await this.callGeminiAPI(prompt, anomalies);
    } catch (error) {
      logger.error('Error detecting order anomalies:', error);
      throw new Error(`Failed to detect order anomalies: ${error.message}`);
    }
  }

  // Shipment performance analysis
  async analyzeShipmentPerformance(startDate = null, endDate = null) {
    try {
      // Get shipment performance data
      const { data: shipmentData, error } = await supabase
        .rpc('get_shipment_performance', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;

      const prompt = `
        Analyze this shipment performance data and provide comprehensive recommendations for improvement.
        Include:
        1. Performance comparison between carriers with detailed metrics
        2. Root cause analysis for delays and issues
        3. Specific suggestions for optimizing shipping routes and carriers
        4. Cost-saving opportunities with estimated impact
        5. Recommendations for contract renegotiation with underperforming carriers
        6. Technology solutions that could improve tracking and efficiency
        
        Create an actionable improvement plan with timelines and responsible parties.
        Focus on both pomegranate shipments from Rajasthan and toy shipments from Mumbai to Dubai.
      `;

      return await this.callGeminiAPI(prompt, shipmentData);
    } catch (error) {
      console.error('Error analyzing shipment performance:', error);
      throw new Error(`Failed to analyze shipment performance: ${error.message}`);
    }
  }

  // Inventory optimization recommendations
  async generateInventoryRecommendations() {
    try {
      // Get current inventory data
      const { data: inventoryData, error } = await supabase
        .from('products')
        .select('name, category, available_quantity, low_stock_threshold, base_price, supplier_id')
        .order('available_quantity', { ascending: true });

      if (error) throw error;

      // Get sales data for context
      const { data: salesData } = await supabase
        .rpc('get_sales_data_for_forecasting', {
          months_back: 6,
          product_category: null
        });

      const prompt = `
        Analyze the current inventory levels and sales history to provide comprehensive inventory optimization recommendations.
        Include:
        1. Detailed analysis of overstocked and understocked products
        2. Specific reorder quantities, timing, and supplier recommendations
        3. Dead stock identification and clearance strategies
        4. Product bundling opportunities for increased sales
        5. Seasonal inventory planning for pomegranates and toys
        6. Warehouse optimization suggestions
        
        Create a prioritized action plan with specific targets and metrics for improvement.
        Consider the unique requirements of perishable pomegranates versus non-perishable toys.
      `;

      return await this.callGeminiAPI(prompt, {
        inventory: inventoryData,
        sales_history: salesData
      });
    } catch (error) {
      console.error('Error generating inventory recommendations:', error);
      throw new Error(`Failed to generate inventory recommendations: ${error.message}`);
    }
  }

  // Market trend analysis
  async analyzeMarketTrends() {
    try {
      // Get product and sales data for trend analysis
      const { data: products } = await supabase
        .from('products')
        .select('name, category, base_price, created_at, origin_country');
      
      const { data: salesData } = await supabase
        .rpc('get_sales_data_for_forecasting', {
          months_back: 12,
          product_category: null
        });

      const prompt = `
        Analyze the product and sales data to identify market trends and opportunities for expansion.
        Include:
        1. Emerging trends in pomegranate and toy exports to Dubai
        2. Seasonal patterns and their implications for business planning
        3. Pricing optimization opportunities with specific recommendations
        4. Potential new markets or product lines to explore
        5. Competitive analysis and differentiation strategies
        6. Impact of economic factors on export business
        
        Provide a comprehensive market analysis with data-driven recommendations for business growth.
        Focus on opportunities specific to Indian exports to the UAE market.
      `;

      return await this.callGeminiAPI(prompt, {
        products: products,
        sales_history: salesData
      });
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      throw new Error(`Failed to analyze market trends: ${error.message}`);
    }
  }

  // Customer behavior analysis
  async analyzeCustomerBehavior() {
    try {
      // Get customer data
      const { data: customers } = await supabase
        .from('profiles')
        .select('id, company, business_type, country, created_at');
      
      // Get order data for customer analysis
      const { data: orders } = await supabase
        .from('orders')
        .select('id, client_id, product_id, quantity, total_amount, created_at, status')
        .order('created_at', { ascending: false })
        .limit(1000);

      const prompt = `
        Analyze customer data and order patterns to provide insights into customer behavior.
        Include:
        1. Customer segmentation analysis with profiles for each segment
        2. Buying patterns and preferences by customer type
        3. Customer lifetime value calculations and implications
        4. Retention strategies for high-value customers
        5. Reactivation strategies for inactive customers
        6. Personalization opportunities for different segments
        
        Provide specific, actionable recommendations for improving customer acquisition, retention, and satisfaction.
        Focus on both pomegranate buyers and toy buyers in the Dubai market.
      `;

      return await this.callGeminiAPI(prompt, {
        customers: customers,
        orders: orders
      });
    } catch (error) {
      console.error('Error analyzing customer behavior:', error);
      throw new Error(`Failed to analyze customer behavior: ${error.message}`);
    }
  }

  // Supplier performance analysis
  async analyzeSupplierPerformance() {
    try {
      // Get supplier data
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('*');
      
      // Get product data for supplier analysis
      const { data: products } = await supabase
        .from('products')
        .select('id, name, supplier_id, base_price, available_quantity');
      
      // Get order data for supplier performance
      const { data: orders } = await supabase
        .from('orders')
        .select('id, product_id, quantity, total_amount, created_at, status');

      const prompt = `
        Analyze supplier data and performance to provide insights into supplier relationships.
        Include:
        1. Supplier performance metrics (reliability, quality, pricing)
        2. Risk assessment for each supplier with mitigation strategies
        3. Cost optimization opportunities through supplier negotiation
        4. Recommendations for supplier diversification
        5. Performance improvement plans for underperforming suppliers
        6. Strategic partnership opportunities with top performers
        
        Provide a comprehensive supplier management strategy with specific action items.
        Consider both pomegranate suppliers from Rajasthan and toy suppliers from Mumbai.
      `;

      return await this.callGeminiAPI(prompt, {
        suppliers: suppliers,
        products: products,
        orders: orders
      });
    } catch (error) {
      console.error('Error analyzing supplier performance:', error);
      throw new Error(`Failed to analyze supplier performance: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const geminiService = new GeminiIntegrationService();
export default geminiService;