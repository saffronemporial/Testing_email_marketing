// FILE 9: CustomerIntelligence.js
import { supabaseClient } from '../../supabaseClient';

export class CustomerIntelligence {
  constructor() {
    this.supabase = supabaseClient;
  }

  /**
   * Calculate Customer Lifetime Value from real order data
   */
  async calculateCustomerLTV(profileId) {
    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('client_id', profileId)
        .eq('status', 'delivered');

      if (error) throw error;

      let totalLTV = 0;
      let orderCount = 0;
      let firstOrderDate = null;
      let lastOrderDate = null;

      orders.forEach(order => {
        totalLTV += parseFloat(order.total_amount) || 0;
        orderCount++;
        
        const orderDate = new Date(order.created_at);
        if (!firstOrderDate || orderDate < firstOrderDate) {
          firstOrderDate = orderDate;
        }
        if (!lastOrderDate || orderDate > lastOrderDate) {
          lastOrderDate = orderDate;
        }
      });

      // Calculate average order value
      const avgOrderValue = orderCount > 0 ? totalLTV / orderCount : 0;

      // Calculate customer tenure in days
      const tenureDays = firstOrderDate ? 
        Math.ceil((new Date() - firstOrderDate) / (1000 * 60 * 60 * 24)) : 0;

      return {
        profile_id: profileId,
        total_ltv: totalLTV,
        order_count: orderCount,
        avg_order_value: avgOrderValue,
        first_order_date: firstOrderDate,
        last_order_date: lastOrderDate,
        tenure_days: tenureDays,
        calculated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calculating customer LTV:', error);
      throw error;
    }
  }

  /**
   * Predict churn probability based on real customer behavior
   */
  async predictChurnProbability(profileId) {
    try {
      // Get customer engagement data
      const { data: engagement, error } = await this.supabase
        .from('client_engagement_scores')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error) throw error;

      if (!engagement) {
        return { profile_id: profileId, churn_probability: 0.5, reason: 'No engagement data' };
      }

      let churnScore = 0;
      let reasons = [];

      // Factors affecting churn probability
      if (engagement.days_since_last_order > 60) {
        churnScore += 0.4;
        reasons.push(`No orders in ${engagement.days_since_last_order} days`);
      }

      if (engagement.days_since_last_order > 30 && engagement.days_since_last_order <= 60) {
        churnScore += 0.2;
        reasons.push(`Inactive for ${engagement.days_since_last_order} days`);
      }

      if (engagement.order_count <= 1) {
        churnScore += 0.3;
        reasons.push('Only one order placed');
      }

      if (engagement.engagement_score < 25) {
        churnScore += 0.2;
        reasons.push('Low engagement score');
      }

      if (engagement.average_order_value < 1000) {
        churnScore += 0.1;
        reasons.push('Low average order value');
      }

      // Cap at 0.95 (95% probability)
      const churnProbability = Math.min(churnScore, 0.95);

      return {
        profile_id: profileId,
        churn_probability: churnProbability,
        risk_level: this.getRiskLevel(churnProbability),
        reasons: reasons,
        calculated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error predicting churn probability:', error);
      throw error;
    }
  }

  /**
   * Get risk level based on churn probability
   */
  getRiskLevel(probability) {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Identify customer buying patterns
   */
  async analyzeBuyingPatterns(profileId) {
    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select('product_id, quantity, total_amount, created_at, product_name, unit_price')
        .eq('client_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!orders || orders.length === 0) {
        return { profile_id: profileId, patterns: [], recommendation: 'No order history' };
      }

      const patterns = {
        favorite_products: this.getFavoriteProducts(orders),
        seasonal_pattern: this.analyzeSeasonality(orders),
        price_sensitivity: this.analyzePriceSensitivity(orders),
        order_frequency: this.calculateOrderFrequency(orders),
        average_basket_size: this.calculateAverageBasket(orders)
      };

      const recommendation = this.generateRecommendation(patterns, orders);

      return {
        profile_id: profileId,
        patterns: patterns,
        recommendation: recommendation,
        analyzed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error analyzing buying patterns:', error);
      throw error;
    }
  }

  /**
   * Get customer's favorite products
   */
  getFavoriteProducts(orders) {
    const productCount = {};
    
    orders.forEach(order => {
      const productName = order.product_name || 'Unknown Product';
      productCount[productName] = (productCount[productName] || 0) + 1;
    });

    return Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([product, count]) => ({ product, order_count: count }));
  }

  /**
   * Analyze seasonal buying patterns
   */
  analyzeSeasonality(orders) {
    const monthlyOrders = {};
    
    orders.forEach(order => {
      const month = new Date(order.created_at).getMonth();
      monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
    });

    // Find peak buying months
    const peakMonth = Object.entries(monthlyOrders)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      peak_month: peakMonth ? parseInt(peakMonth[0]) : null,
      monthly_distribution: monthlyOrders
    };
  }

  /**
   * Analyze customer price sensitivity
   */
  analyzePriceSensitivity(orders) {
    if (orders.length === 0) return 'unknown';
    
    const avgUnitPrice = orders.reduce((sum, order) => 
      sum + (parseFloat(order.unit_price) || 0), 0) / orders.length;

    if (avgUnitPrice < 50) return 'high'; // Prefers lower prices
    if (avgUnitPrice < 200) return 'medium'; // Moderate price range
    return 'low'; // Premium buyer
  }

  /**
   * Calculate order frequency
   */
  calculateOrderFrequency(orders) {
    if (orders.length < 2) return 'unknown';
    
    const firstOrder = new Date(orders[orders.length - 1].created_at);
    const lastOrder = new Date(orders[0].created_at);
    const daysBetween = (lastOrder - firstOrder) / (1000 * 60 * 60 * 24);
    const avgDaysBetween = daysBetween / (orders.length - 1);

    if (avgDaysBetween <= 30) return 'frequent'; // Monthly or more
    if (avgDaysBetween <= 90) return 'regular'; // Quarterly
    return 'occasional'; // Less frequent
  }

  /**
   * Calculate average basket size
   */
  calculateAverageBasket(orders) {
    const avgOrderValue = orders.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0) / orders.length;

    if (avgOrderValue < 1000) return 'small';
    if (avgOrderValue < 5000) return 'medium';
    return 'large';
  }

  /**
   * Generate personalized recommendation based on patterns
   */
  generateRecommendation(patterns, orders) {
    const latestOrder = orders[0];
    const favoriteProduct = patterns.favorite_products[0]?.product;

    if (patterns.order_frequency === 'frequent' && patterns.average_basket_size === 'large') {
      return `VIP customer - Offer premium products and early access to new arrivals`;
    }

    if (patterns.price_sensitivity === 'high') {
      return `Price-sensitive customer - Highlight value deals and promotions`;
    }

    if (patterns.order_frequency === 'occasional') {
      return `Win-back opportunity - Send special comeback offer and new product updates`;
    }

    if (favoriteProduct) {
      return `Loyal to ${favoriteProduct} - Notify about related products and bulk discounts`;
    }

    return `New customer pattern - Build relationship with educational content and samples`;
  }

  /**
   * Update customer intelligence for all active customers
   */
  async updateAllCustomersIntelligence() {
    try {
      // Get all active clients
      const { data: clients, error } = await this.supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'client');

      if (error) throw error;

      const results = [];
      for (const client of clients) {
        try {
          const intelligence = await this.analyzeBuyingPatterns(client.id);
          const churnPrediction = await this.predictChurnProbability(client.id);
          const ltvData = await this.calculateCustomerLTV(client.id);

          results.push({
            profile_id: client.id,
            intelligence,
            churn_prediction: churnPrediction,
            ltv_data: ltvData
          });

          // Update client_engagement_scores table with new intelligence
          await this.supabase
            .from('client_engagement_scores')
            .upsert({
              profile_id: client.id,
              total_revenue: ltvData.total_ltv,
              order_count: ltvData.order_count,
              average_order_value: ltvData.avg_order_value,
              last_order_date: ltvData.last_order_date,
              days_since_last_order: ltvData.last_order_date ? 
                Math.ceil((new Date() - new Date(ltvData.last_order_date)) / (1000 * 60 * 60 * 24)) : null,
              engagement_score: this.calculateEngagementScore(ltvData, churnPrediction),
              calculated_at: new Date().toISOString()
            });

        } catch (clientError) {
          console.error(`Error processing client ${client.id}:`, clientError);
        }
      }

      return {
        processed: results.length,
        results: results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error updating all customers intelligence:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive engagement score
   */
  calculateEngagementScore(ltvData, churnPrediction) {
    let score = 0;

    // Revenue factor (0-40 points)
    if (ltvData.total_ltv > 10000) score += 40;
    else if (ltvData.total_ltv > 5000) score += 30;
    else if (ltvData.total_ltv > 1000) score += 20;
    else if (ltvData.total_ltv > 0) score += 10;

    // Frequency factor (0-30 points)
    if (ltvData.order_count > 10) score += 30;
    else if (ltvData.order_count > 5) score += 20;
    else if (ltvData.order_count > 2) score += 15;
    else if (ltvData.order_count > 0) score += 5;

    // Recency factor (0-20 points)
    if (ltvData.tenure_days > 0) {
      const daysSinceLastOrder = ltvData.last_order_date ? 
        Math.ceil((new Date() - new Date(ltvData.last_order_date)) / (1000 * 60 * 60 * 24)) : ltvData.tenure_days;
      
      if (daysSinceLastOrder <= 30) score += 20;
      else if (daysSinceLastOrder <= 60) score += 15;
      else if (daysSinceLastOrder <= 90) score += 10;
      else if (daysSinceLastOrder <= 180) score += 5;
    }

    // Churn risk factor (0-10 points)
    if (churnPrediction.churn_probability < 0.2) score += 10;
    else if (churnPrediction.churn_probability < 0.4) score += 7;
    else if (churnPrediction.churn_probability < 0.6) score += 4;

    return Math.min(score, 100);
  }

  /**
   * Get customer intelligence summary for dashboard
   */
  async getCustomerIntelligenceSummary() {
    try {
      const { data: engagementScores, error } = await this.supabase
        .from('client_engagement_scores')
        .select('*')
        .order('engagement_score', { ascending: false });

      if (error) throw error;

      const summary = {
        total_customers: engagementScores.length,
        average_engagement: engagementScores.reduce((sum, score) => sum + score.engagement_score, 0) / engagementScores.length,
        high_engagement: engagementScores.filter(score => score.engagement_score >= 70).length,
        medium_engagement: engagementScores.filter(score => score.engagement_score >= 40 && score.engagement_score < 70).length,
        low_engagement: engagementScores.filter(score => score.engagement_score < 40).length,
        total_revenue: engagementScores.reduce((sum, score) => sum + parseFloat(score.total_revenue), 0),
        top_customers: engagementScores.slice(0, 5),
        calculated_at: new Date().toISOString()
      };

      return summary;

    } catch (error) {
      console.error('Error getting customer intelligence summary:', error);
      throw error;
    }
  }
}

export default CustomerIntelligence;