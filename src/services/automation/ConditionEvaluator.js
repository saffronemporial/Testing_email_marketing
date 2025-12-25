// FILE 6: src/services/automation/ConditionEvaluator.js

class ConditionEvaluator {
  constructor() {
    this.supabase = window.supabase; // Using your existing supabaseClient
  }

  // 🎯 EVALUATE COMPLEX CONDITIONS FOR AUTOMATIONS (REAL)
  async evaluateConditions(conditions, customerData, contextData = {}) {
    try {
      console.log(`🎯 [CONDITIONS] Evaluating conditions for customer ${customerData.id}`);
      
      if (!conditions || Object.keys(conditions).length === 0) {
        console.log('✅ [CONDITIONS] No conditions to evaluate - returning true');
        return true;
      }

      let allConditionsMet = true;

      // Evaluate each condition group
      for (const [conditionType, conditionConfig] of Object.entries(conditions)) {
        const conditionMet = await this.evaluateConditionType(
          conditionType, 
          conditionConfig, 
          customerData, 
          contextData
        );
        
        if (!conditionMet) {
          allConditionsMet = false;
          break; // Stop evaluation if any condition fails
        }
      }

      console.log(`✅ [CONDITIONS] All conditions met: ${allConditionsMet}`);
      return allConditionsMet;

    } catch (error) {
      console.error('❌ [CONDITIONS] Error evaluating conditions:', error);
      return false; // Fail safe - don't trigger if conditions can't be evaluated
    }
  }

  // 🔍 EVALUATE SPECIFIC CONDITION TYPES (REAL)
  async evaluateConditionType(conditionType, conditionConfig, customerData, contextData) {
    switch (conditionType) {
      case 'segment_membership':
        return await this.evaluateSegmentMembership(conditionConfig, customerData);
        
      case 'order_history':
        return await this.evaluateOrderHistory(conditionConfig, customerData);
        
      case 'customer_attributes':
        return await this.evaluateCustomerAttributes(conditionConfig, customerData);
        
      case 'engagement_score':
        return await this.evaluateEngagementScore(conditionConfig, customerData);
        
      case 'time_based':
        return await this.evaluateTimeBasedConditions(conditionConfig, contextData);
        
      case 'composite_rules':
        return await this.evaluateCompositeRules(conditionConfig, customerData, contextData);
        
      default:
        console.warn(`❌ [CONDITIONS] Unknown condition type: ${conditionType}`);
        return false;
    }
  }

  // 👥 EVALUATE SEGMENT MEMBERSHIP (REAL)
  async evaluateSegmentMembership(conditionConfig, customerData) {
    try {
      const { segment_ids, require_all = false } = conditionConfig;
      
      if (!segment_ids || segment_ids.length === 0) {
        return true; // No segment requirements
      }

      // REAL: Check segment membership in database
      const { data: memberships, error } = await this.supabase
        .from('segment_membership')
        .select('segment_id')
        .eq('profile_id', customerData.id)
        .eq('is_current_member', true)
        .in('segment_id', segment_ids);

      if (error) throw error;

      const memberSegmentIds = memberships.map(m => m.segment_id);
      
      if (require_all) {
        // Customer must be in ALL specified segments
        return segment_ids.every(segmentId => memberSegmentIds.includes(segmentId));
      } else {
        // Customer must be in AT LEAST ONE specified segment
        return segment_ids.some(segmentId => memberSegmentIds.includes(segmentId));
      }

    } catch (error) {
      console.error('❌ [CONDITIONS] Error evaluating segment membership:', error);
      return false;
    }
  }

  // 📦 EVALUATE ORDER HISTORY (REAL)
  async evaluateOrderHistory(conditionConfig, customerData) {
    try {
      const { 
        min_order_count, 
        max_order_count,
        min_total_spent,
        max_total_spent,
        min_average_order_value,
        days_since_last_order,
        order_statuses = []
      } = conditionConfig;

      // REAL: Get customer order statistics from database function
      const { data: orderStats, error } = await this.supabase
        .rpc('get_customer_order_statistics', { 
          profile_id: customerData.id 
        });

      if (error) throw error;

      if (!orderStats || orderStats.length === 0) {
        // No orders found - evaluate based on requirements
        return this.evaluateNoOrderConditions(conditionConfig);
      }

      const stats = orderStats[0];
      let conditionsMet = true;

      // Check order count conditions
      if (min_order_count !== undefined && stats.order_count < min_order_count) {
        conditionsMet = false;
      }
      if (max_order_count !== undefined && stats.order_count > max_order_count) {
        conditionsMet = false;
      }

      // Check total spent conditions
      if (min_total_spent !== undefined && stats.total_spent < min_total_spent) {
        conditionsMet = false;
      }
      if (max_total_spent !== undefined && stats.total_spent > max_total_spent) {
        conditionsMet = false;
      }

      // Check average order value
      if (min_average_order_value !== undefined && stats.average_order_value < min_average_order_value) {
        conditionsMet = false;
      }

      // Check days since last order
      if (days_since_last_order !== undefined && stats.days_since_last_order > days_since_last_order) {
        conditionsMet = false;
      }

      // Check order statuses (if specific statuses required)
      if (order_statuses.length > 0) {
        const hasMatchingStatus = await this.checkOrderStatuses(customerData.id, order_statuses);
        if (!hasMatchingStatus) {
          conditionsMet = false;
        }
      }

      return conditionsMet;

    } catch (error) {
      console.error('❌ [CONDITIONS] Error evaluating order history:', error);
      return false;
    }
  }

  // 👤 EVALUATE CUSTOMER ATTRIBUTES (REAL)
  async evaluateCustomerAttributes(conditionConfig, customerData) {
    try {
      const { 
        countries = [],
        business_types = [],
        import_volumes = [],
        has_phone = null,
        has_email = null,
        company_size
      } = conditionConfig;

      let conditionsMet = true;

      // Check country
      if (countries.length > 0 && !countries.includes(customerData.country)) {
        conditionsMet = false;
      }

      // Check business type
      if (business_types.length > 0 && !business_types.includes(customerData.business_type)) {
        conditionsMet = false;
      }

      // Check import volume
      if (import_volumes.length > 0 && !import_volumes.includes(customerData.import_volume)) {
        conditionsMet = false;
      }

      // Check phone presence
      if (has_phone !== null) {
        const hasPhone = !!customerData.phone && customerData.phone.trim().length > 0;
        if (has_phone !== hasPhone) {
          conditionsMet = false;
        }
      }

      // Check email presence
      if (has_email !== null) {
        const hasEmail = !!customerData.email && customerData.email.trim().length > 0;
        if (has_email !== hasEmail) {
          conditionsMet = false;
        }
      }

      // Check company size (if available in extended client data)
      if (company_size) {
        const companySizeMatch = await this.checkCompanySize(customerData.id, company_size);
        if (!companySizeMatch) {
          conditionsMet = false;
        }
      }

      return conditionsMet;

    } catch (error) {
      console.error('❌ [CONDITIONS] Error evaluating customer attributes:', error);
      return false;
    }
  }

  // 📊 EVALUATE ENGAGEMENT SCORE (REAL)
  async evaluateEngagementScore(conditionConfig, customerData) {
    try {
      const { 
        min_score, 
        max_score,
        score_tier 
      } = conditionConfig;

      // REAL: Get engagement score from database
      const { data: engagementData, error } = await this.supabase
        .from('client_engagement_scores')
        .select('engagement_score, calculated_at')
        .eq('profile_id', customerData.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No engagement score found - treat as 0
          return this.evaluateScoreConditions(0, min_score, max_score, score_tier);
        }
        throw error;
      }

      const score = engagementData.engagement_score || 0;
      return this.evaluateScoreConditions(score, min_score, max_score, score_tier);

    } catch (error) {
      console.error('❌ [CONDITIONS] Error evaluating engagement score:', error);
      return false;
    }
  }

  // ⏰ EVALUATE TIME-BASED CONDITIONS (REAL)
  async evaluateTimeBasedConditions(conditionConfig, contextData) {
    try {
      const {
        time_of_day,
        day_of_week,
        exclude_weekends = false,
        timezone = 'UTC'
      } = conditionConfig;

      const now = new Date();
      const customerTimezone = contextData.customer_timezone || timezone;

      // Convert to customer timezone
      const customerTime = this.convertToTimezone(now, customerTimezone);
      
      let conditionsMet = true;

      // Check time of day
      if (time_of_day) {
        const { start, end } = time_of_day;
        const currentTime = customerTime.getHours() * 60 + customerTime.getMinutes();
        const startTime = this.timeToMinutes(start);
        const endTime = this.timeToMinutes(end);
        
        if (currentTime < startTime || currentTime > endTime) {
          conditionsMet = false;
        }
      }

      // Check day of week
      if (day_of_week && day_of_week.length > 0) {
        const currentDay = customerTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        if (!day_of_week.includes(currentDay)) {
          conditionsMet = false;
        }
      }

      // Check weekends
      if (exclude_weekends) {
        const isWeekend = customerTime.getDay() === 0 || customerTime.getDay() === 6;
        if (isWeekend) {
          conditionsMet = false;
        }
      }

      return conditionsMet;

    } catch (error) {
      console.error('❌ [CONDITIONS] Error evaluating time-based conditions:', error);
      return false;
    }
  }

  // 🧩 EVALUATE COMPOSITE RULES (REAL)
  async evaluateCompositeRules(conditionConfig, customerData, contextData) {
    try {
      const { 
        rules, 
        operator = 'AND' // 'AND' or 'OR'
      } = conditionConfig;

      if (!rules || rules.length === 0) {
        return true;
      }

      const ruleResults = [];

      // Evaluate each rule
      for (const rule of rules) {
        const ruleResult = await this.evaluateConditions(rule.conditions, customerData, contextData);
        ruleResults.push(ruleResult);
      }

      // Apply operator
      if (operator === 'AND') {
        return ruleResults.every(result => result === true);
      } else if (operator === 'OR') {
        return ruleResults.some(result => result === true);
      } else {
        console.warn(`❌ [CONDITIONS] Unknown operator: ${operator}`);
        return false;
      }

    } catch (error) {
      console.error('❌ [CONDITIONS] Error evaluating composite rules:', error);
      return false;
    }
  }

  // 🛠️ HELPER METHODS (REAL)

  // Evaluate conditions when customer has no orders
  evaluateNoOrderConditions(conditionConfig) {
    const { 
      min_order_count = 0, 
      max_order_count,
      min_total_spent = 0,
      allow_no_orders = false
    } = conditionConfig;

    // If no orders allowed and customer has no orders, return true
    if (allow_no_orders && min_order_count === 0 && min_total_spent === 0) {
      return true;
    }

    // Otherwise, customer with no orders doesn't meet minimum requirements
    return false;
  }

  // Check if customer has orders with specific statuses
  async checkOrderStatuses(customerId, requiredStatuses) {
    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select('status')
        .eq('client_id', customerId)
        .in('status', requiredStatuses)
        .limit(1);

      if (error) throw error;

      return orders && orders.length > 0;

    } catch (error) {
      console.error('❌ [CONDITIONS] Error checking order statuses:', error);
      return false;
    }
  }

  // Check company size from extended client data
  async checkCompanySize(customerId, requiredSize) {
    try {
      const { data: clientData, error } = await this.supabase
        .from('clients')
        .select('company_size')
        .eq('profile_id', customerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No client data found
          return false;
        }
        throw error;
      }

      return clientData.company_size === requiredSize;

    } catch (error) {
      console.error('❌ [CONDITIONS] Error checking company size:', error);
      return false;
    }
  }

  // Evaluate score conditions with min, max, and tier
  evaluateScoreConditions(score, minScore, maxScore, scoreTier) {
    let conditionsMet = true;

    if (minScore !== undefined && score < minScore) {
      conditionsMet = false;
    }

    if (maxScore !== undefined && score > maxScore) {
      conditionsMet = false;
    }

    if (scoreTier) {
      const tierMatch = this.evaluateScoreTier(score, scoreTier);
      if (!tierMatch) {
        conditionsMet = false;
      }
    }

    return conditionsMet;
  }

  // Evaluate score tier (VIP, High, Medium, Low)
  evaluateScoreTier(score, requiredTier) {
    const tierRanges = {
      'vip': { min: 80, max: 100 },
      'high': { min: 60, max: 79 },
      'medium': { min: 30, max: 59 },
      'low': { min: 0, max: 29 }
    };

    const tier = tierRanges[requiredTier.toLowerCase()];
    if (!tier) {
      console.warn(`❌ [CONDITIONS] Unknown score tier: ${requiredTier}`);
      return false;
    }

    return score >= tier.min && score <= tier.max;
  }

  // Convert time string (HH:MM) to minutes
  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert date to specific timezone
  convertToTimezone(date, timezone) {
    // Simple timezone conversion - in production, use a library like moment-timezone
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const offset = this.getTimezoneOffset(timezone);
    return new Date(utc + (3600000 * offset));
  }

  // Get timezone offset (simplified)
  getTimezoneOffset(timezone) {
    const offsets = {
      'UTC': 0,
      'IST': 5.5, // India Standard Time
      'EST': -5,  // Eastern Standard Time
      'PST': -8   // Pacific Standard Time
    };
    return offsets[timezone] || 0;
  }

  // 📊 GET CONDITION EVALUATION STATISTICS (REAL)
  async getConditionStats(automationId, days = 30) {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      // REAL: Get logs for this automation
      const { data: logs, error } = await this.supabase
        .from('automation_logs')
        .select('status, metadata, executed_at')
        .eq('automation_id', automationId)
        .gte('executed_at', dateThreshold.toISOString());

      if (error) throw error;

      return this.calculateConditionStats(logs);

    } catch (error) {
      console.error('❌ [CONDITIONS] Error getting condition stats:', error);
      return null;
    }
  }

  // Calculate condition evaluation statistics
  calculateConditionStats(logs) {
    const stats = {
      total_evaluations: logs.length,
      triggered_count: logs.filter(log => log.status === 'success').length,
      skipped_count: logs.filter(log => log.metadata?.conditions_met === false).length,
      condition_success_rate: 0
    };

    // Calculate condition success rate
    const conditionResults = logs.map(log => 
      log.metadata?.conditions_met !== false // If not explicitly false, assume conditions were met
    );

    const successfulConditions = conditionResults.filter(result => result === true).length;
    stats.condition_success_rate = stats.total_evaluations > 0 
      ? (successfulConditions / stats.total_evaluations) * 100 
      : 0;

    return stats;
  }

  // 🔧 VALIDATE CONDITION CONFIGURATION (REAL)
  validateConditionConfig(conditions) {
    const errors = [];

    if (!conditions || typeof conditions !== 'object') {
      errors.push('Conditions must be an object');
      return { valid: false, errors };
    }

    // Validate each condition type
    for (const [conditionType, config] of Object.entries(conditions)) {
      const validation = this.validateConditionType(conditionType, config);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate specific condition type
  validateConditionType(conditionType, config) {
    const errors = [];

    switch (conditionType) {
      case 'segment_membership':
        if (!config.segment_ids || !Array.isArray(config.segment_ids)) {
          errors.push('Segment membership requires segment_ids array');
        }
        break;

      case 'order_history':
        if (config.min_order_count !== undefined && typeof config.min_order_count !== 'number') {
          errors.push('min_order_count must be a number');
        }
        if (config.min_total_spent !== undefined && typeof config.min_total_spent !== 'number') {
          errors.push('min_total_spent must be a number');
        }
        break;

      case 'engagement_score':
        if (config.min_score !== undefined && (config.min_score < 0 || config.min_score > 100)) {
          errors.push('min_score must be between 0 and 100');
        }
        break;

      // Add validation for other condition types as needed
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default ConditionEvaluator;