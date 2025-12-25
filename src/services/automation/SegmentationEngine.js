// FILE 10: SegmentationEngine.js
import { supabaseClient } from '../../supabaseClient';

export class SegmentationEngine {
  constructor() {
    this.supabase = supabaseClient;
    this.segmentCache = new Map();
  }

  /**
   * Evaluate customer against segment rules and assign to segments
   */
  async evaluateCustomerSegments(profileId) {
    try {
      // Get customer data
      const customerData = await this.getCustomerData(profileId);
      if (!customerData) {
        throw new Error(`Customer data not found for profile: ${profileId}`);
      }

      // Get all active segments
      const segments = await this.getActiveSegments();
      const segmentResults = [];

      // Evaluate each segment
      for (const segment of segments) {
        const isMember = await this.evaluateSegmentRules(segment, customerData);
        
        if (isMember) {
          await this.addToSegment(profileId, segment.id, customerData);
          segmentResults.push({
            segment_id: segment.id,
            segment_name: segment.name,
            matched: true,
            reason: this.getMatchReason(segment, customerData)
          });
        } else {
          await this.removeFromSegment(profileId, segment.id);
          segmentResults.push({
            segment_id: segment.id,
            segment_name: segment.name,
            matched: false,
            reason: 'Rules not satisfied'
          });
        }
      }

      // Update customer's segment summary
      await this.updateCustomerSegmentSummary(profileId, segmentResults);

      return {
        profile_id: profileId,
        segments: segmentResults,
        evaluated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error evaluating customer segments:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive customer data for segmentation
   */
  async getCustomerData(profileId) {
    try {
      // Get basic profile data
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      // Get engagement scores
      const { data: engagement, error: engagementError } = await this.supabase
        .from('client_engagement_scores')
        .select('*')
        .eq('profile_id', profileId)
        .single();

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

      // Calculate additional metrics
      const orderMetrics = this.calculateOrderMetrics(orders);
      const customerTenure = this.calculateCustomerTenure(profile.created_at, orders);
      const productPreferences = this.analyzeProductPreferences(orders);

      return {
        profile,
        engagement: engagement || {},
        orders: orders || [],
        export_orders: exportOrders || [],
        metrics: {
          ...orderMetrics,
          ...customerTenure,
          product_preferences: productPreferences
        },
        calculated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting customer data:', error);
      throw error;
    }
  }

  /**
   * Calculate order-based metrics
   */
  calculateOrderMetrics(orders) {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
    
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    });

    return {
      total_orders: orders.length,
      delivered_orders: deliveredOrders.length,
      total_revenue: totalRevenue,
      average_order_value: avgOrderValue,
      recent_order_count: recentOrders.length,
      last_order_date: orders[0]?.created_at || null
    };
  }

  /**
   * Calculate customer tenure metrics
   */
  calculateCustomerTenure(profileCreatedAt, orders) {
    const signupDate = new Date(profileCreatedAt);
    const now = new Date();
    const tenureDays = Math.ceil((now - signupDate) / (1000 * 60 * 60 * 24));
    
    const firstOrder = orders[orders.length - 1];
    const lastOrder = orders[0];
    
    const daysSinceFirstOrder = firstOrder ? 
      Math.ceil((now - new Date(firstOrder.created_at)) / (1000 * 60 * 60 * 24)) : null;
    
    const daysSinceLastOrder = lastOrder ? 
      Math.ceil((now - new Date(lastOrder.created_at)) / (1000 * 60 * 60 * 24)) : null;

    return {
      tenure_days: tenureDays,
      days_since_first_order: daysSinceFirstOrder,
      days_since_last_order: daysSinceLastOrder,
      is_new_customer: tenureDays <= 30 && orders.length <= 1
    };
  }

  /**
   * Analyze product preferences
   */
  analyzeProductPreferences(orders) {
    const productCount = {};
    const categoryCount = {};
    
    orders.forEach(order => {
      const productName = order.product_name || 'Unknown';
      productCount[productName] = (productCount[productName] || 0) + 1;
      
      // Extract category from product name or use default
      const category = this.extractCategory(productName);
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const favoriteProduct = Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)[0];

    const favoriteCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      favorite_product: favoriteProduct ? { name: favoriteProduct[0], count: favoriteProduct[1] } : null,
      favorite_category: favoriteCategory ? { name: favoriteCategory[0], count: favoriteCategory[1] } : null,
      product_variety: Object.keys(productCount).length,
      total_products_ordered: orders.length
    };
  }

  /**
   * Extract category from product name (basic implementation)
   */
  extractCategory(productName) {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('saffron')) return 'Saffron';
    if (lowerName.includes('spice') || lowerName.includes('masala')) return 'Spices';
    if (lowerName.includes('tea')) return 'Tea';
    if (lowerName.includes('rice')) return 'Rice';
    if (lowerName.includes('dry fruit') || lowerName.includes('nut')) return 'Dry Fruits';
    return 'Other';
  }

  /**
   * Get all active segments with their rules
   */
  async getActiveSegments() {
    // Check cache first
    if (this.segmentCache.has('active_segments')) {
      const cached = this.segmentCache.get('active_segments');
      // Cache for 5 minutes
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    try {
      const { data: segments, error } = await this.supabase
        .from('client_segments')
        .select(`
          *,
          segment_rules (*)
        `)
        .eq('is_active', true)
        .eq('segment_rules.is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Cache the results
      this.segmentCache.set('active_segments', {
        data: segments || [],
        timestamp: Date.now()
      });

      return segments || [];

    } catch (error) {
      console.error('Error getting active segments:', error);
      return [];
    }
  }

  /**
   * Evaluate segment rules against customer data
   */
  async evaluateSegmentRules(segment, customerData) {
    if (!segment.segment_rules || segment.segment_rules.length === 0) {
      return false;
    }

    // Group rules by condition type (AND/OR)
    const rules = segment.segment_rules;
    
    // For now, we'll use AND logic (all rules must pass)
    for (const rule of rules) {
      const rulePassed = await this.evaluateSingleRule(rule, customerData);
      if (!rulePassed) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a single segmentation rule
   */
  async evaluateSingleRule(rule, customerData) {
    const { field_name, operator, value, rule_type } = rule;
    
    try {
      let actualValue;

      // Get value based on field name and data source
      switch (field_name) {
        // Revenue fields
        case 'total_revenue':
          actualValue = customerData.metrics.total_revenue;
          break;
        case 'average_order_value':
          actualValue = customerData.metrics.average_order_value;
          break;
        
        // Order frequency fields
        case 'order_count':
          actualValue = customerData.metrics.total_orders;
          break;
        case 'recent_order_count':
          actualValue = customerData.metrics.recent_order_count;
          break;
        
        // Time-based fields
        case 'tenure_days':
          actualValue = customerData.metrics.tenure_days;
          break;
        case 'days_since_last_order':
          actualValue = customerData.metrics.days_since_last_order;
          break;
        
        // Engagement fields
        case 'engagement_score':
          actualValue = customerData.engagement.engagement_score || 0;
          break;
        
        // Product preference fields
        case 'favorite_product':
          actualValue = customerData.metrics.product_preferences.favorite_product?.name;
          break;
        case 'favorite_category':
          actualValue = customerData.metrics.product_preferences.favorite_category?.name;
          break;
        
        // Profile fields
        case 'country':
          actualValue = customerData.profile.country;
          break;
        case 'business_type':
          actualValue = customerData.profile.business_type;
          break;
        case 'import_volume':
          actualValue = customerData.profile.import_volume;
          break;
        
        default:
          console.warn(`Unknown field name: ${field_name}`);
          return false;
      }

      // Evaluate based on operator
      return this.compareValues(actualValue, operator, value);

    } catch (error) {
      console.error('Error evaluating single rule:', error);
      return false;
    }
  }

  /**
   * Compare values based on operator
   */
  compareValues(actualValue, operator, expectedValue) {
    if (actualValue === null || actualValue === undefined) {
      return false;
    }

    switch (operator) {
      case 'equals':
        return actualValue == expectedValue;
      
      case 'not_equals':
        return actualValue != expectedValue;
      
      case 'greater_than':
        return parseFloat(actualValue) > parseFloat(expectedValue);
      
      case 'less_than':
        return parseFloat(actualValue) < parseFloat(expectedValue);
      
      case 'greater_than_equal':
        return parseFloat(actualValue) >= parseFloat(expectedValue);
      
      case 'less_than_equal':
        return parseFloat(actualValue) <= parseFloat(expectedValue);
      
      case 'contains':
        return String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      
      case 'not_contains':
        return !String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      
      case 'in':
        return expectedValue.includes(actualValue);
      
      case 'not_in':
        return !expectedValue.includes(actualValue);
      
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Add customer to segment
   */
  async addToSegment(profileId, segmentId, customerData) {
    try {
      // Check if already in segment
      const { data: existing, error: checkError } = await this.supabase
        .from('segment_membership')
        .select('*')
        .eq('segment_id', segmentId)
        .eq('profile_id', profileId)
        .eq('is_current_member', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        throw checkError;
      }

      if (existing) {
        // Already in segment, update timestamp
        await this.supabase
          .from('segment_membership')
          .update({
            last_updated: new Date().toISOString(),
            membership_reason: this.getMatchReason(
              { id: segmentId, name: '' }, 
              customerData
            )
          })
          .eq('id', existing.id);
      } else {
        // Add to segment
        const { error } = await this.supabase
          .from('segment_membership')
          .insert({
            segment_id: segmentId,
            profile_id: profileId,
            is_current_member: true,
            joined_at: new Date().toISOString(),
            left_at: null,
            membership_reason: this.getMatchReason(
              { id: segmentId, name: '' }, 
              customerData
            ),
            metadata: {
              added_via: 'automated_segmentation',
              customer_data_snapshot: {
                revenue: customerData.metrics.total_revenue,
                order_count: customerData.metrics.total_orders,
                engagement_score: customerData.engagement.engagement_score
              }
            }
          });

        if (error) throw error;

        // Trigger segment automation if exists
        await this.triggerSegmentAutomation(profileId, segmentId, 'on_join');
      }

      return true;

    } catch (error) {
      console.error('Error adding customer to segment:', error);
      throw error;
    }
  }

  /**
   * Remove customer from segment
   */
  async removeFromSegment(profileId, segmentId) {
    try {
      const { error } = await this.supabase
        .from('segment_membership')
        .update({
          is_current_member: false,
          left_at: new Date().toISOString(),
          membership_reason: 'No longer meets segment criteria'
        })
        .eq('segment_id', segmentId)
        .eq('profile_id', profileId)
        .eq('is_current_member', true);

      if (error) throw error;

      // Trigger segment automation for leaving
      await this.triggerSegmentAutomation(profileId, segmentId, 'on_leave');

      return true;

    } catch (error) {
      console.error('Error removing customer from segment:', error);
      throw error;
    }
  }

  /**
   * Trigger automations when segment membership changes
   */
  async triggerSegmentAutomation(profileId, segmentId, triggerType) {
    try {
      // Get automations for this segment and trigger type
      const { data: automations, error } = await this.supabase
        .from('segment_automations')
        .select('*')
        .eq('segment_id', segmentId)
        .eq('trigger_condition', triggerType)
        .eq('is_active', true);

      if (error) throw error;

      if (!automations || automations.length === 0) {
        return;
      }

      // Execute each automation
      for (const automation of automations) {
        await this.executeAutomation(automation, profileId);
      }

    } catch (error) {
      console.error('Error triggering segment automation:', error);
      // Don't throw to avoid breaking the segmentation process
    }
  }

  /**
   * Execute a segment automation
   */
  async executeAutomation(automation, profileId) {
    try {
      console.log(`Executing automation: ${automation.action_name} for profile: ${profileId}`);

      // Update execution count
      await this.supabase
        .from('segment_automations')
        .update({
          execution_count: (automation.execution_count || 0) + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', automation.id);

      // Here you would integrate with your ActionExecutor from File 4
      // For now, we'll log the automation details
      console.log('Automation details:', {
        automation_id: automation.id,
        profile_id: profileId,
        action_name: automation.action_name,
        action_config: automation.action_config
      });

      // You can call your existing ActionExecutor like:
      // const actionExecutor = new ActionExecutor();
      // await actionExecutor.execute(automation.action_config, profileId);

    } catch (error) {
      console.error('Error executing automation:', error);
      throw error;
    }
  }

  /**
   * Get human-readable match reason
   */
  getMatchReason(segment, customerData) {
    const segmentName = segment.name.toLowerCase();
    
    if (segmentName.includes('vip')) {
      return `High revenue customer (₹${customerData.metrics.total_revenue}) with ${customerData.metrics.total_orders} orders`;
    }
    
    if (segmentName.includes('new')) {
      return `New customer with ${customerData.metrics.tenure_days} days tenure`;
    }
    
    if (segmentName.includes('at risk') || segmentName.includes('inactive')) {
      return `No orders in ${customerData.metrics.days_since_last_order} days`;
    }
    
    if (segmentName.includes('high potential')) {
      return `Medium revenue with high engagement (score: ${customerData.engagement.engagement_score})`;
    }
    
    return 'Meets segment criteria based on customer behavior and metrics';
  }

  /**
   * Update customer segment summary
   */
  async updateCustomerSegmentSummary(profileId, segmentResults) {
    try {
      const currentSegments = segmentResults.filter(s => s.matched);
      
      const { error } = await this.supabase
        .from('profiles')
        .update({
          segment_summary: {
            total_segments: currentSegments.length,
            segment_names: currentSegments.map(s => s.segment_name),
            last_segmented_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating customer segment summary:', error);
      // Don't throw to avoid breaking main process
    }
  }

  /**
   * Recalculate segments for all customers
   */
  async recalculateAllSegments() {
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
          const result = await this.evaluateCustomerSegments(client.id);
          results.push(result);
        } catch (clientError) {
          console.error(`Error processing client ${client.id}:`, clientError);
          results.push({
            profile_id: client.id,
            error: clientError.message,
            segments: []
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
      console.error('Error recalculating all segments:', error);
      throw error;
    }
  }

  /**
   * Get segment statistics
   */
  async getSegmentStatistics() {
    try {
      const { data: segments, error } = await this.supabase
        .from('client_segments')
        .select(`
          *,
          segment_membership!inner (profile_id)
        `)
        .eq('is_active', true)
        .eq('segment_membership.is_current_member', true);

      if (error) throw error;

      const statistics = segments.map(segment => ({
        segment_id: segment.id,
        segment_name: segment.name,
        member_count: segment.segment_membership.length,
        description: segment.description,
        segment_type: segment.segment_type,
        automation_enabled: segment.automation_enabled
      }));

      return {
        total_segments: statistics.length,
        total_members: statistics.reduce((sum, seg) => sum + seg.member_count, 0),
        segments: statistics,
        calculated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting segment statistics:', error);
      throw error;
    }
  }

  /**
   * Find customers by segment criteria (ad-hoc segmentation)
   */
  async findCustomersByCriteria(criteria) {
    try {
      // This is a simplified version - in production you'd build dynamic queries
      let query = this.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client');

      // Add criteria filters (simplified example)
      if (critriteria.country) {
        query = query.eq('country', criteria.country);
      }

      if (criteria.min_orders) {
        // This would require a subquery or join in a real implementation
        console.log('Complex criteria filtering would be implemented here');
      }

      const { data: customers, error } = await query;
      if (error) throw error;

      return {
        criteria: criteria,
        match_count: customers.length,
        customers: customers,
        searched_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error finding customers by criteria:', error);
      throw error;
    }
  }
}

export default SegmentationEngine;