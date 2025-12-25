// FILE 11: EngagementScorer.js
import { supabaseClient } from '../../supabaseClient';

export class EngagementScorer {
  constructor() {
    this.supabase = supabaseClient;
    this.scoringWeights = {
      revenue: 0.25,
      frequency: 0.20,
      recency: 0.15,
      responsiveness: 0.15,
      product_engagement: 0.15,
      profile_completeness: 0.10
    };
  }

  /**
   * Calculate comprehensive engagement score for a customer
   */
  async calculateEngagementScore(profileId) {
    try {
      // Get all relevant customer data
      const customerData = await this.getCustomerEngagementData(profileId);
      
      if (!customerData) {
        throw new Error(`No customer data found for profile: ${profileId}`);
      }

      // Calculate individual component scores
      const componentScores = {
        revenue: this.calculateRevenueScore(customerData),
        frequency: this.calculateFrequencyScore(customerData),
        recency: this.calculateRecencyScore(customerData),
        responsiveness: await this.calculateResponsivenessScore(profileId, customerData),
        product_engagement: this.calculateProductEngagementScore(customerData),
        profile_completeness: this.calculateProfileCompletenessScore(customerData.profile)
      };

      // Calculate weighted total score
      const totalScore = this.calculateWeightedScore(componentScores);
      
      // Determine engagement tier
      const engagementTier = this.getEngagementTier(totalScore);
      
      // Update engagement score in database
      await this.updateEngagementScore(profileId, totalScore, componentScores, engagementTier);

      return {
        profile_id: profileId,
        total_score: totalScore,
        engagement_tier: engagementTier,
        component_scores: componentScores,
        calculated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calculating engagement score:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive customer data for engagement scoring
   */
  async getCustomerEngagementData(profileId) {
    try {
      // Get profile data
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      // Get order history
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select('*')
        .eq('client_id', profileId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get export orders
      const { data: exportOrders, error: exportError } = await this.supabase
        .from('export_orders')
        .select('*')
        .eq('created_by', profileId)
        .order('created_at', { ascending: false });

      // Get communication logs
      const { data: communications, error: commError } = await this.supabase
        .from('communication_logs')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      // Get client data if exists
      const { data: client, error: clientError } = await this.supabase
        .from('clients')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      return {
        profile,
        client: client || null,
        orders: orders || [],
        export_orders: exportOrders || [],
        communications: communications || [],
        metrics: this.calculateEngagementMetrics(orders, communications, profile.created_at)
      };

    } catch (error) {
      console.error('Error getting customer engagement data:', error);
      throw error;
    }
  }

  /**
   * Calculate engagement metrics from raw data
   */
  calculateEngagementMetrics(orders, communications, profileCreatedAt) {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
    
    // Calculate recency
    const lastOrderDate = orders[0]?.created_at ? new Date(orders[0].created_at) : null;
    const daysSinceLastOrder = lastOrderDate ? 
      Math.ceil((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24)) : null;

    // Calculate communication metrics
    const outboundComms = communications.filter(comm => comm.direction === 'outbound');
    const inboundComms = communications.filter(comm => comm.direction === 'inbound');
    const respondedComms = communications.filter(comm => 
      comm.direction === 'inbound' && comm.status === 'delivered'
    );

    return {
      total_orders: orders.length,
      delivered_orders: deliveredOrders.length,
      total_revenue: totalRevenue,
      average_order_value: avgOrderValue,
      last_order_date: lastOrderDate,
      days_since_last_order: daysSinceLastOrder,
      total_communications: communications.length,
      outbound_communications: outboundComms.length,
      inbound_communications: inboundComms.length,
      response_rate: outboundComms.length > 0 ? (inboundComms.length / outboundComms.length) : 0,
      profile_age_days: Math.ceil((new Date() - new Date(profileCreatedAt)) / (1000 * 60 * 60 * 24))
    };
  }

  /**
   * Calculate revenue-based score (0-100)
   */
  calculateRevenueScore(customerData) {
    const revenue = customerData.metrics.total_revenue;
    
    if (revenue >= 100000) return 100; // ₹1,00,000+
    if (revenue >= 50000) return 90;   // ₹50,000+
    if (revenue >= 25000) return 80;   // ₹25,000+
    if (revenue >= 10000) return 70;   // ₹10,000+
    if (revenue >= 5000) return 60;    // ₹5,000+
    if (revenue >= 1000) return 50;    // ₹1,000+
    if (revenue > 0) return 30;        // Any revenue
    return 0;                          // No revenue
  }

  /**
   * Calculate order frequency score (0-100)
   */
  calculateFrequencyScore(customerData) {
    const orderCount = customerData.metrics.total_orders;
    const profileAgeDays = customerData.metrics.profile_age_days;
    
    if (profileAgeDays === 0) return 50; // New customer
    
    const ordersPerMonth = (orderCount / profileAgeDays) * 30;
    
    if (ordersPerMonth >= 4) return 100;    // 4+ orders per month
    if (ordersPerMonth >= 2) return 80;     // 2-3 orders per month
    if (ordersPerMonth >= 1) return 60;     // 1 order per month
    if (ordersPerMonth >= 0.5) return 40;   // 1 order every 2 months
    if (orderCount > 0) return 20;          // Has orders but very infrequent
    return 0;                               // No orders
  }

  /**
   * Calculate recency score (0-100)
   */
  calculateRecencyScore(customerData) {
    const daysSinceLastOrder = customerData.metrics.days_since_last_order;
    
    if (daysSinceLastOrder === null) return 0; // No orders
    
    if (daysSinceLastOrder <= 7) return 100;   // Ordered in last week
    if (daysSinceLastOrder <= 30) return 80;   // Ordered in last month
    if (daysSinceLastOrder <= 60) return 60;   // Ordered in last 2 months
    if (daysSinceLastOrder <= 90) return 40;   // Ordered in last 3 months
    if (daysSinceLastOrder <= 180) return 20;  // Ordered in last 6 months
    return 10;                                 // Ordered more than 6 months ago
  }

  /**
   * Calculate communication responsiveness score (0-100)
   */
  async calculateResponsivenessScore(profileId, customerData) {
    const metrics = customerData.metrics;
    
    if (metrics.outbound_communications === 0) return 50; // No outbound comms yet
    
    const responseRate = metrics.response_rate;
    
    if (responseRate >= 0.8) return 100;   // 80%+ response rate
    if (responseRate >= 0.6) return 80;    // 60-79% response rate
    if (responseRate >= 0.4) return 60;    // 40-59% response rate
    if (responseRate >= 0.2) return 40;    // 20-39% response rate
    if (responseRate > 0) return 20;       // Some responses
    return 0;                              // No responses
  }

  /**
   * Calculate product engagement score (0-100)
   */
  calculateProductEngagementScore(customerData) {
    const orders = customerData.orders;
    
    if (orders.length === 0) return 0;
    
    // Calculate product variety
    const uniqueProducts = new Set(orders.map(order => order.product_id)).size;
    const productVarietyScore = Math.min((uniqueProducts / orders.length) * 100, 50);
    
    // Calculate order consistency
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return orderDate >= ninetyDaysAgo;
    });
    
    const consistencyScore = recentOrders.length >= 3 ? 50 : 
                           recentOrders.length >= 1 ? 30 : 0;
    
    return productVarietyScore + consistencyScore;
  }

  /**
   * Calculate profile completeness score (0-100)
   */
  calculateProfileCompletenessScore(profile) {
    let completeness = 0;
    const requiredFields = [
      'full_name', 'email', 'phone', 'company', 'country'
    ];
    
    requiredFields.forEach(field => {
      if (profile[field] && String(profile[field]).trim().length > 0) {
        completeness += 15; // 15 points per required field
      }
    });
    
    // Bonus points for additional information
    if (profile.business_type) completeness += 10;
    if (profile.import_volume) completeness += 10;
    if (profile.address) completeness += 10;
    
    return Math.min(completeness, 100);
  }

  /**
   * Calculate weighted total score from component scores
   */
  calculateWeightedScore(componentScores) {
    let totalScore = 0;
    
    for (const [component, score] of Object.entries(componentScores)) {
      totalScore += score * this.scoringWeights[component];
    }
    
    return Math.round(totalScore);
  }

  /**
   * Determine engagement tier based on total score
   */
  getEngagementTier(totalScore) {
    if (totalScore >= 80) return 'VIP';
    if (totalScore >= 60) return 'High';
    if (totalScore >= 40) return 'Medium';
    if (totalScore >= 20) return 'Low';
    return 'Inactive';
  }

  /**
   * Update engagement score in database
   */
  async updateEngagementScore(profileId, totalScore, componentScores, engagementTier) {
    try {
      const { error } = await this.supabase
        .from('client_engagement_scores')
        .upsert({
          profile_id: profileId,
          engagement_score: totalScore,
          engagement_tier: engagementTier,
          revenue_score: componentScores.revenue,
          frequency_score: componentScores.frequency,
          recency_score: componentScores.recency,
          responsiveness_score: componentScores.responsiveness,
          product_engagement_score: componentScores.product_engagement,
          profile_completeness_score: componentScores.profile_completeness,
          component_breakdown: componentScores,
          last_score_calculation: new Date().toISOString(),
          calculated_at: new Date().toISOString()
        }, {
          onConflict: 'profile_id'
        });

      if (error) throw error;

      // Also update profiles table with current tier
      await this.supabase
        .from('profiles')
        .update({
          engagement_tier: engagementTier,
          engagement_score: totalScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

    } catch (error) {
      console.error('Error updating engagement score:', error);
      throw error;
    }
  }

  /**
   * Recalculate engagement scores for all customers
   */
  async recalculateAllEngagementScores() {
    try {
      // Get all active clients
      const { data: clients, error } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('role', 'client');

      if (error) throw error;

      const results = [];
      for (const client of clients) {
        try {
          const score = await this.calculateEngagementScore(client.id);
          results.push(score);
        } catch (clientError) {
          console.error(`Error processing client ${client.id}:`, clientError);
          results.push({
            profile_id: client.id,
            error: clientError.message
          });
        }
      }

      return {
        total_processed: results.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        results: results,
        completed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error recalculating all engagement scores:', error);
      throw error;
    }
  }

  /**
   * Get engagement statistics for dashboard
   */
  async getEngagementStatistics() {
    try {
      const { data: scores, error } = await this.supabase
        .from('client_engagement_scores')
        .select('*')
        .order('engagement_score', { ascending: false });

      if (error) throw error;

      const statistics = {
        total_customers: scores.length,
        average_engagement: scores.reduce((sum, score) => sum + score.engagement_score, 0) / scores.length,
        tier_distribution: {
          VIP: scores.filter(s => s.engagement_tier === 'VIP').length,
          High: scores.filter(s => s.engagement_tier === 'High').length,
          Medium: scores.filter(s => s.engagement_tier === 'Medium').length,
          Low: scores.filter(s => s.engagement_tier === 'Low').length,
          Inactive: scores.filter(s => s.engagement_tier === 'Inactive').length
        },
        top_performers: scores.slice(0, 10),
        needs_attention: scores.filter(s => s.engagement_score < 30).slice(0, 10),
        calculated_at: new Date().toISOString()
      };

      return statistics;

    } catch (error) {
      console.error('Error getting engagement statistics:', error);
      throw error;
    }
  }

  /**
   * Get customers by engagement tier
   */
  async getCustomersByTier(tier) {
    try {
      const { data: scores, error } = await this.supabase
        .from('client_engagement_scores')
        .select(`
          *,
          profiles:profile_id (full_name, email, phone, company, country)
        `)
        .eq('engagement_tier', tier)
        .order('engagement_score', { ascending: false });

      if (error) throw error;

      return {
        tier: tier,
        count: scores.length,
        customers: scores,
        retrieved_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting customers by tier:', error);
      throw error;
    }
  }

  /**
   * Track engagement event (order, communication, etc.)
   */
  async trackEngagementEvent(profileId, eventType, eventData) {
    try {
      const { error } = await this.supabase
        .from('engagement_events')
        .insert({
          profile_id: profileId,
          event_type: eventType,
          event_data: eventData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Trigger score recalculation for significant events
      if (this.shouldTriggerRecalculation(eventType)) {
        setTimeout(() => {
          this.calculateEngagementScore(profileId).catch(console.error);
        }, 5000); // Delay to avoid immediate recalculation
      }

    } catch (error) {
      console.error('Error tracking engagement event:', error);
      throw error;
    }
  }

  /**
   * Determine if event should trigger score recalculation
   */
  shouldTriggerRecalculation(eventType) {
    const significantEvents = [
      'order_created',
      'order_delivered',
      'communication_sent',
      'communication_received',
      'profile_updated'
    ];
    
    return significantEvents.includes(eventType);
  }
}

export default EngagementScorer;