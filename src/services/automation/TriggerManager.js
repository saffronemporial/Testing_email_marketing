// FILE 5: src/services/automation/TriggerManager.js

class TriggerManager {
  constructor() {
    this.supabase = window.supabase; // Using your existing supabaseClient
    this.activeTriggers = new Map();
  }

  // 🎯 DETECT TRIGGERS FROM REAL EVENTS
  async detectTriggers(triggerType, eventData) {
    try {
      console.log(`🎯 [TRIGGER] Detecting: ${triggerType}`, eventData);
      
      switch (triggerType) {
        case 'order_created':
          return await this.handleOrderCreated(eventData);
          
        case 'order_status_changed':
          return await this.handleOrderStatusChanged(eventData);
          
        case 'export_phase_changed':
          return await this.handleExportPhaseChanged(eventData);
          
        case 'new_customer':
          return await this.handleNewCustomer(eventData);
          
        case 'customer_inactive':
          return await this.handleCustomerInactive(eventData);
          
        case 'payment_received':
          return await this.handlePaymentReceived(eventData);
          
        default:
          console.warn(`Unknown trigger type: ${triggerType}`);
          return [];
      }
    } catch (error) {
      console.error(`❌ [TRIGGER] Error detecting triggers for ${triggerType}:`, error);
      throw error;
    }
  }

  // 📦 HANDLE NEW ORDER CREATED (REAL)
  async handleOrderCreated(orderData) {
    const triggers = [];
    
    try {
      // REAL: Get customer data
      const customer = await this.getCustomerData(orderData.client_id);
      if (!customer) {
        console.warn(`Customer not found for order: ${orderData.id}`);
        return triggers;
      }

      // REAL: Check for order-based automations
      const orderAutomations = await this.getAutomationsByTrigger('order_created');
      
      for (const automation of orderAutomations) {
        // REAL: Check if automation conditions are met
        const conditionsMet = await this.evaluateAutomationConditions(automation, customer, {
          order: orderData,
          trigger_type: 'order_created'
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer,
            triggerData: {
              order: orderData,
              trigger_type: 'order_created'
            }
          });
        }
      }

      console.log(`✅ [TRIGGER] Found ${triggers.length} automations for new order ${orderData.id}`);
      return triggers;

    } catch (error) {
      console.error('❌ [TRIGGER] Error handling order created:', error);
      throw error;
    }
  }

  // 🔄 HANDLE ORDER STATUS CHANGED (REAL)
  async handleOrderStatusChanged(statusData) {
    const triggers = [];
    
    try {
      const { order, oldStatus, newStatus } = statusData;
      
      // REAL: Get customer data
      const customer = await this.getCustomerData(order.client_id);
      if (!customer) return triggers;

      // REAL: Get automations for status changes
      const statusAutomations = await this.getAutomationsByTrigger('order_status_changed');
      
      for (const automation of statusAutomations) {
        const conditionsMet = await this.evaluateAutomationConditions(automation, customer, {
          order: order,
          oldStatus,
          newStatus,
          trigger_type: 'order_status_changed'
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer,
            triggerData: {
              order,
              oldStatus,
              newStatus,
              trigger_type: 'order_status_changed'
            }
          });
        }
      }

      // REAL: Specific status automations (shipped, delivered, etc.)
      const specificAutomations = await this.getAutomationsByTrigger(`order_status_${newStatus}`);
      for (const automation of specificAutomations) {
        const conditionsMet = await this.evaluateAutomationConditions(automation, customer, {
          order: order,
          status: newStatus,
          trigger_type: `order_status_${newStatus}`
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer,
            triggerData: {
              order,
              status: newStatus,
              trigger_type: `order_status_${newStatus}`
            }
          });
        }
      }

      console.log(`✅ [TRIGGER] Found ${triggers.length} automations for order status change: ${oldStatus} → ${newStatus}`);
      return triggers;

    } catch (error) {
      console.error('❌ [TRIGGER] Error handling order status change:', error);
      throw error;
    }
  }

  // 🚢 HANDLE EXPORT PHASE CHANGED (REAL)
  async handleExportPhaseChanged(phaseData) {
    const triggers = [];
    
    try {
      const { exportOrder, oldPhase, newPhase } = phaseData;
      
      // REAL: Get customer from export order (via original order)
      const order = await this.getOrderData(exportOrder.order_id);
      if (!order) return triggers;

      const customer = await this.getCustomerData(order.client_id);
      if (!customer) return triggers;

      // REAL: Get automations for export phase changes
      const phaseAutomations = await this.getAutomationsByTrigger('export_phase_changed');
      
      for (const automation of phaseAutomations) {
        const conditionsMet = await this.evaluateAutomationConditions(automation, customer, {
          exportOrder,
          oldPhase,
          newPhase,
          trigger_type: 'export_phase_changed'
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer,
            triggerData: {
              exportOrder,
              oldPhase,
              newPhase,
              trigger_type: 'export_phase_changed'
            }
          });
        }
      }

      // REAL: Specific phase automations
      const specificAutomations = await this.getAutomationsByTrigger(`export_phase_${newPhase}`);
      for (const automation of specificAutomations) {
        const conditionsMet = await this.evaluateAutomationConditions(automation, customer, {
          exportOrder,
          phase: newPhase,
          trigger_type: `export_phase_${newPhase}`
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer,
            triggerData: {
              exportOrder,
              phase: newPhase,
              trigger_type: `export_phase_${newPhase}`
            }
          });
        }
      }

      console.log(`✅ [TRIGGER] Found ${triggers.length} automations for export phase: ${oldPhase} → ${newPhase}`);
      return triggers;

    } catch (error) {
      console.error('❌ [TRIGGER] Error handling export phase change:', error);
      throw error;
    }
  }

  // 👥 HANDLE NEW CUSTOMER (REAL)
  async handleNewCustomer(customerData) {
    const triggers = [];
    
    try {
      // REAL: Get automations for new customers
      const newCustomerAutomations = await this.getAutomationsByTrigger('new_customer');
      
      for (const automation of newCustomerAutomations) {
        const conditionsMet = await this.evaluateAutomationConditions(automation, customerData, {
          trigger_type: 'new_customer'
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer: customerData,
            triggerData: {
              trigger_type: 'new_customer'
            }
          });
        }
      }

      console.log(`✅ [TRIGGER] Found ${triggers.length} automations for new customer ${customerData.id}`);
      return triggers;

    } catch (error) {
      console.error('❌ [TRIGGER] Error handling new customer:', error);
      throw error;
    }
  }

  // ⏰ HANDLE CUSTOMER INACTIVITY (REAL)
  async handleCustomerInactive(inactivityData) {
    const triggers = [];
    
    try {
      const { customer, daysInactive, lastOrderDate } = inactivityData;
      
      // REAL: Get automations for inactive customers
      const inactivityAutomations = await this.getAutomationsByTrigger('customer_inactive');
      
      for (const automation of inactivityAutomations) {
        const conditionsMet = await this.evaluateAutomationConditions(automation, customer, {
          daysInactive,
          lastOrderDate,
          trigger_type: 'customer_inactive'
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer,
            triggerData: {
              daysInactive,
              lastOrderDate,
              trigger_type: 'customer_inactive'
            }
          });
        }
      }

      console.log(`✅ [TRIGGER] Found ${triggers.length} automations for inactive customer ${customer.id} (${daysInactive} days)`);
      return triggers;

    } catch (error) {
      console.error('❌ [TRIGGER] Error handling customer inactivity:', error);
      throw error;
    }
  }

  // 💰 HANDLE PAYMENT RECEIVED (REAL)
  async handlePaymentReceived(paymentData) {
    const triggers = [];
    
    try {
      const { payment, order } = paymentData;
      
      // REAL: Get customer data
      const customer = await this.getCustomerData(order.client_id);
      if (!customer) return triggers;

      // REAL: Get automations for payments
      const paymentAutomations = await this.getAutomationsByTrigger('payment_received');
      
      for (const automation of paymentAutomations) {
        const conditionsMet = await this.evaluateAutomationConditions(automation, customer, {
          payment,
          order,
          trigger_type: 'payment_received'
        });
        
        if (conditionsMet) {
          triggers.push({
            automation,
            customer,
            triggerData: {
              payment,
              order,
              trigger_type: 'payment_received'
            }
          });
        }
      }

      console.log(`✅ [TRIGGER] Found ${triggers.length} automations for payment received: ${payment.amount}`);
      return triggers;

    } catch (error) {
      console.error('❌ [TRIGGER] Error handling payment received:', error);
      throw error;
    }
  }

  // 🔍 GET AUTOMATIONS BY TRIGGER TYPE (REAL)
  async getAutomationsByTrigger(triggerType) {
    try {
      // REAL: Query automations table for active automations with this trigger
      const { data, error } = await this.supabase
        .from('segment_automations')
        .select(`
          *,
          client_segments:segment_id (
            name,
            segment_type
          )
        `)
        .eq('is_active', true)
        .eq('trigger_condition', triggerType)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('❌ [TRIGGER] Error fetching automations:', error);
      return [];
    }
  }

  // ✅ EVALUATE AUTOMATION CONDITIONS (REAL)
  async evaluateAutomationConditions(automation, customer, triggerData) {
    try {
      // If no specific conditions, return true
      if (!automation.conditions || Object.keys(automation.conditions).length === 0) {
        return true;
      }

      // REAL: Evaluate each condition
      const conditions = automation.conditions;
      let allConditionsMet = true;

      // Check segment conditions
      if (conditions.segment_id) {
        const inSegment = await this.isCustomerInSegment(customer.id, conditions.segment_id);
        if (!inSegment) allConditionsMet = false;
      }

      // Check order value conditions
      if (conditions.min_order_value && triggerData.order) {
        if (triggerData.order.total_amount < conditions.min_order_value) {
          allConditionsMet = false;
        }
      }

      // Check customer country conditions
      if (conditions.allowed_countries && conditions.allowed_countries.length > 0) {
        if (!conditions.allowed_countries.includes(customer.country)) {
          allConditionsMet = false;
        }
      }

      // Check business type conditions
      if (conditions.business_types && conditions.business_types.length > 0) {
        if (!conditions.business_types.includes(customer.business_type)) {
          allConditionsMet = false;
        }
      }

      return allConditionsMet;

    } catch (error) {
      console.error('❌ [TRIGGER] Error evaluating conditions:', error);
      return false; // Fail safe - don't trigger if conditions can't be evaluated
    }
  }

  // 👥 CHECK SEGMENT MEMBERSHIP (REAL)
  async isCustomerInSegment(customerId, segmentId) {
    try {
      const { data, error } = await this.supabase
        .from('segment_membership')
        .select('id')
        .eq('profile_id', customerId)
        .eq('segment_id', segmentId)
        .eq('is_current_member', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;

    } catch (error) {
      console.error('❌ [TRIGGER] Error checking segment membership:', error);
      return false;
    }
  }

  // 📋 GET CUSTOMER DATA (REAL)
  async getCustomerData(customerId) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ [TRIGGER] Error fetching customer data:', error);
      return null;
    }
  }

  // 📦 GET ORDER DATA (REAL)
  async getOrderData(orderId) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ [TRIGGER] Error fetching order data:', error);
      return null;
    }
  }

  // ⏰ START SCHEDULED TRIGGER CHECKS (REAL)
  startScheduledChecks() {
    // Check for inactive customers daily
    setInterval(() => {
      this.checkInactiveCustomers();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Check for scheduled automations every minute
    setInterval(() => {
      this.checkScheduledAutomations();
    }, 60 * 1000); // 1 minute

    console.log('✅ [TRIGGER] Scheduled checks started');
  }

  // 🔍 CHECK INACTIVE CUSTOMERS (REAL)
  async checkInactiveCustomers() {
    try {
      console.log('🔍 [TRIGGER] Checking for inactive customers...');
      
      // REAL: Get customers with no orders in last 60 days
      const { data: inactiveCustomers, error } = await this.supabase
        .rpc('get_inactive_customers', { inactive_days: 60 });

      if (error) throw error;

      for (const customer of inactiveCustomers) {
        await this.detectTriggers('customer_inactive', {
          customer: customer,
          daysInactive: customer.days_since_last_order,
          lastOrderDate: customer.last_order_date
        });
      }

      console.log(`✅ [TRIGGER] Processed ${inactiveCustomers.length} inactive customers`);

    } catch (error) {
      console.error('❌ [TRIGGER] Error checking inactive customers:', error);
    }
  }

  // ⏰ CHECK SCHEDULED AUTOMATIONS (REAL)
  async checkScheduledAutomations() {
    try {
      const now = new Date().toISOString();
      
      // REAL: Get scheduled triggers that are due
      const { data: dueTriggers, error } = await this.supabase
        .from('automation_triggers')
        .select(`
          *,
          segment_automations:automation_id (*)
        `)
        .eq('is_active', true)
        .lte('next_trigger_at', now);

      if (error) throw error;

      for (const trigger of dueTriggers) {
        await this.executeScheduledTrigger(trigger);
      }

    } catch (error) {
      console.error('❌ [TRIGGER] Error checking scheduled automations:', error);
    }
  }

  // 🚀 EXECUTE SCHEDULED TRIGGER (REAL)
  async executeScheduledTrigger(trigger) {
    try {
      console.log(`⏰ [TRIGGER] Executing scheduled trigger: ${trigger.id}`);
      
      const automation = trigger.segment_automations;
      const triggerConfig = trigger.trigger_config;
      
      // Get customers for this automation
      const customers = await this.getCustomersForAutomation(automation);
      
      for (const customer of customers) {
        await this.detectTriggers('scheduled', {
          automation,
          customer,
          triggerData: {
            trigger_type: 'scheduled',
            schedule_config: triggerConfig
          }
        });
      }
      
      // Update next trigger time
      await this.updateNextTriggerTime(trigger);

    } catch (error) {
      console.error('❌ [TRIGGER] Error executing scheduled trigger:', error);
    }
  }

  // 👥 GET CUSTOMERS FOR AUTOMATION (REAL)
  async getCustomersForAutomation(automation) {
    try {
      if (automation.segment_id) {
        // Get customers from segment
        const { data, error } = await this.supabase
          .from('segment_membership')
          .select(`
            profiles:profile_id (*)
          `)
          .eq('segment_id', automation.segment_id)
          .eq('is_current_member', true);

        if (error) throw error;

        return data.map(item => item.profiles);
      } else {
        // Get all customers (if no segment specified)
        const { data, error } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client');

        if (error) throw error;

        return data;
      }

    } catch (error) {
      console.error('❌ [TRIGGER] Error getting customers for automation:', error);
      return [];
    }
  }

  // 🔄 UPDATE NEXT TRIGGER TIME (REAL)
  async updateNextTriggerTime(trigger) {
    try {
      const triggerConfig = trigger.trigger_config;
      let nextTriggerAt = new Date();
      
      // Calculate next trigger time based on interval
      if (triggerConfig.interval_days) {
        nextTriggerAt.setDate(nextTriggerAt.getDate() + triggerConfig.interval_days);
      } else if (triggerConfig.interval_hours) {
        nextTriggerAt.setHours(nextTriggerAt.getHours() + triggerConfig.interval_hours);
      } else {
        // If no interval, deactivate the trigger
        await this.supabase
          .from('automation_triggers')
          .update({ is_active: false })
          .eq('id', trigger.id);
        
        return;
      }
      
      // Update next trigger time
      const { error } = await this.supabase
        .from('automation_triggers')
        .update({ 
          next_trigger_at: nextTriggerAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', trigger.id);

      if (error) throw error;

    } catch (error) {
      console.error('❌ [TRIGGER] Error updating next trigger time:', error);
    }
  }

  // 📊 GET TRIGGER STATISTICS (REAL)
  async getTriggerStats(timeframe = '7d') {
    try {
      let dateFilter = new Date();
      
      switch (timeframe) {
        case '24h':
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        default:
          dateFilter.setDate(dateFilter.getDate() - 7);
      }

      const { data, error } = await this.supabase
        .from('automation_logs')
        .select('trigger_type, status, executed_at')
        .gte('executed_at', dateFilter.toISOString());

      if (error) throw error;

      return this.calculateTriggerStats(data);

    } catch (error) {
      console.error('❌ [TRIGGER] Error getting trigger stats:', error);
      return {};
    }
  }

  // 📈 CALCULATE TRIGGER STATISTICS
  calculateTriggerStats(logs) {
    const stats = {
      total: logs.length,
      by_trigger_type: {},
      by_status: {},
      success_rate: 0
    };

    logs.forEach(log => {
      // Count by trigger type
      stats.by_trigger_type[log.trigger_type] = (stats.by_trigger_type[log.trigger_type] || 0) + 1;
      
      // Count by status
      stats.by_status[log.status] = (stats.by_status[log.status] || 0) + 1;
    });

    const successCount = stats.by_status.success || 0;
    stats.success_rate = stats.total > 0 ? (successCount / stats.total) * 100 : 0;

    return stats;
  }
}

export default TriggerManager;