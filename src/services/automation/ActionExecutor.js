// FILE 8: src/services/automation/ActionExecutor.js

class ActionExecutor {
  constructor() {
    this.supabase = window.supabase; // Using your existing supabaseClient
    this.actionHandlers = new Map();
    this.initializeActionHandlers();
  }

  // 🎯 INITIALIZE ACTION HANDLERS (REAL)
  initializeActionHandlers() {
    // Register all supported action types
    this.actionHandlers.set('send_whatsapp', this.executeWhatsAppAction.bind(this));
    this.actionHandlers.set('send_email', this.executeEmailAction.bind(this));
    this.actionHandlers.set('send_sms', this.executeSMSAction.bind(this));
    this.actionHandlers.set('create_task', this.executeTaskAction.bind(this));
    this.actionHandlers.set('update_segment', this.executeSegmentAction.bind(this));
    this.actionHandlers.set('update_customer', this.executeCustomerUpdateAction.bind(this));
    this.actionHandlers.set('trigger_webhook', this.executeWebhookAction.bind(this));
    this.actionHandlers.set('create_reminder', this.executeReminderAction.bind(this));
    this.actionHandlers.set('assign_to_team', this.executeTeamAssignmentAction.bind(this));
    this.actionHandlers.set('log_activity', this.executeLoggingAction.bind(this));

    console.log('✅ [ACTION] Action handlers initialized');
  }

  // 🚀 EXECUTE AUTOMATION ACTION (REAL)
  async executeAction(actionType, actionConfig, customerData, contextData = {}) {
    try {
      console.log(`🚀 [ACTION] Executing: ${actionType} for customer ${customerData.id}`);
      
      // Validate action configuration
      const validation = this.validateActionConfig(actionType, actionConfig);
      if (!validation.valid) {
        throw new Error(`Invalid action config: ${validation.errors.join(', ')}`);
      }

      // Get the appropriate handler
      const handler = this.actionHandlers.get(actionType);
      if (!handler) {
        throw new Error(`No handler found for action type: ${actionType}`);
      }

      // Personalize action configuration
      const personalizedConfig = this.personalizeActionConfig(actionConfig, customerData, contextData);
      
      // Execute the action
      const result = await handler(personalizedConfig, customerData, contextData);
      
      console.log(`✅ [ACTION] ${actionType} executed successfully for customer ${customerData.id}`);
      
      return {
        success: true,
        actionType,
        customerId: customerData.id,
        result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [ACTION] Failed to execute ${actionType}:`, error);
      
      return {
        success: false,
        actionType,
        customerId: customerData.id,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📱 EXECUTE WHATSAPP ACTION (REAL)
  async executeWhatsAppAction(config, customerData, contextData) {
    try {
      const { phone } = customerData;
      
      if (!phone) {
        throw new Error('Customer phone number not available');
      }

      // Personalize message content
      const personalizedMessage = this.personalizeContent(config.message_template, customerData, contextData);
      
      // Call WhatsApp Edge Function
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: phone,
          message: personalizedMessage,
          template_name: config.template_name,
          template_variables: config.template_variables,
          profile_id: customerData.id,
          automation_id: contextData.automation_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      // Log the communication
      await this.logCommunication({
        profile_id: customerData.id,
        channel: 'whatsapp',
        direction: 'outbound',
        content: personalizedMessage,
        external_id: result.message_id,
        status: 'sent',
        automation_id: contextData.automation_id
      });

      return {
        channel: 'whatsapp',
        message_id: result.message_id,
        status: result.status,
        content_preview: personalizedMessage.substring(0, 100) + '...'
      };

    } catch (error) {
      console.error('❌ [ACTION] WhatsApp action failed:', error);
      
      // Log failure
      await this.logCommunication({
        profile_id: customerData.id,
        channel: 'whatsapp',
        direction: 'outbound',
        content: config.message_template,
        status: 'failed',
        error_message: error.message,
        automation_id: contextData.automation_id
      });

      throw error;
    }
  }

  // 📧 EXECUTE EMAIL ACTION (REAL)
  async executeEmailAction(config, customerData, contextData) {
    try {
      const { email } = customerData;
      
      if (!email) {
        throw new Error('Customer email not available');
      }

      // Personalize email content
      const personalizedSubject = this.personalizeContent(config.subject_template, customerData, contextData);
      const personalizedBody = this.personalizeContent(config.body_template, customerData, contextData);
      
      // Call Email Edge Function
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: email,
          subject: personalizedSubject,
          body: personalizedBody,
          template_id: config.template_id,
          template_data: config.template_data,
          profile_id: customerData.id,
          automation_id: contextData.automation_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Email API error: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      // Log the communication
      await this.logCommunication({
        profile_id: customerData.id,
        channel: 'email',
        direction: 'outbound',
        content: personalizedSubject,
        external_id: result.message_id,
        status: 'sent',
        automation_id: contextData.automation_id
      });

      return {
        channel: 'email',
        message_id: result.message_id,
        status: result.status,
        subject: personalizedSubject
      };

    } catch (error) {
      console.error('❌ [ACTION] Email action failed:', error);
      
      // Log failure
      await this.logCommunication({
        profile_id: customerData.id,
        channel: 'email',
        direction: 'outbound',
        content: config.subject_template,
        status: 'failed',
        error_message: error.message,
        automation_id: contextData.automation_id
      });

      throw error;
    }
  }

  // 📞 EXECUTE SMS ACTION (REAL)
  async executeSMSAction(config, customerData, contextData) {
    try {
      const { phone } = customerData;
      
      if (!phone) {
        throw new Error('Customer phone number not available');
      }

      // Personalize SMS content
      const personalizedMessage = this.personalizeContent(config.message_template, customerData, contextData);
      
      // Call SMS Edge Function
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: phone,
          message: personalizedMessage,
          profile_id: customerData.id,
          automation_id: contextData.automation_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`SMS API error: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      // Log the communication
      await this.logCommunication({
        profile_id: customerData.id,
        channel: 'sms',
        direction: 'outbound',
        content: personalizedMessage,
        external_id: result.message_id,
        status: 'sent',
        automation_id: contextData.automation_id
      });

      return {
        channel: 'sms',
        message_id: result.message_id,
        status: result.status,
        content_preview: personalizedMessage.substring(0, 50) + '...'
      };

    } catch (error) {
      console.error('❌ [ACTION] SMS action failed:', error);
      
      // Log failure
      await this.logCommunication({
        profile_id: customerData.id,
        channel: 'sms',
        direction: 'outbound',
        content: config.message_template,
        status: 'failed',
        error_message: error.message,
        automation_id: contextData.automation_id
      });

      throw error;
    }
  }

  // 📋 EXECUTE TASK ACTION (REAL)
  async executeTaskAction(config, customerData, contextData) {
    try {
      // Personalize task details
      const personalizedTitle = this.personalizeContent(config.title, customerData, contextData);
      const personalizedDescription = this.personalizeContent(config.description, customerData, contextData);
      
      // Calculate due date
      const dueDate = this.calculateDueDate(config.due_date_offset);
      
      // Create task in database
      const { data: task, error } = await this.supabase
        .from('tasks')
        .insert({
          title: personalizedTitle,
          description: personalizedDescription,
          due_date: dueDate,
          priority: config.priority || 'medium',
          status: 'pending',
          assigned_to: config.assigned_to,
          related_customer: customerData.id,
          automation_id: contextData.automation_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ [ACTION] Task created: ${task.id} for customer ${customerData.id}`);

      return {
        task_id: task.id,
        title: personalizedTitle,
        due_date: dueDate,
        assigned_to: config.assigned_to
      };

    } catch (error) {
      console.error('❌ [ACTION] Task action failed:', error);
      throw error;
    }
  }

  // 👥 EXECUTE SEGMENT ACTION (REAL)
  async executeSegmentAction(config, customerData, contextData) {
    try {
      const { segment_id, action } = config; // action: 'add' or 'remove'
      
      if (!segment_id) {
        throw new Error('Segment ID is required');
      }

      if (action === 'add') {
        // Add customer to segment
        const { data, error } = await this.supabase
          .from('segment_membership')
          .upsert({
            segment_id: segment_id,
            profile_id: customerData.id,
            is_current_member: true,
            joined_at: new Date().toISOString(),
            membership_reason: `Automated: ${contextData.automation_id || 'unknown'}`
          }, {
            onConflict: 'segment_id,profile_id',
            ignoreDuplicates: false
          });

        if (error) throw error;

        console.log(`✅ [ACTION] Customer ${customerData.id} added to segment ${segment_id}`);

        return {
          action: 'added_to_segment',
          segment_id: segment_id,
          profile_id: customerData.id
        };

      } else if (action === 'remove') {
        // Remove customer from segment
        const { data, error } = await this.supabase
          .from('segment_membership')
          .update({
            is_current_member: false,
            left_at: new Date().toISOString(),
            membership_reason: `Automated removal: ${contextData.automation_id || 'unknown'}`
          })
          .eq('segment_id', segment_id)
          .eq('profile_id', customerData.id)
          .eq('is_current_member', true);

        if (error) throw error;

        console.log(`✅ [ACTION] Customer ${customerData.id} removed from segment ${segment_id}`);

        return {
          action: 'removed_from_segment',
          segment_id: segment_id,
          profile_id: customerData.id
        };
      } else {
        throw new Error(`Unknown segment action: ${action}`);
      }

    } catch (error) {
      console.error('❌ [ACTION] Segment action failed:', error);
      throw error;
    }
  }

  // 👤 EXECUTE CUSTOMER UPDATE ACTION (REAL)
  async executeCustomerUpdateAction(config, customerData, contextData) {
    try {
      const updates = {};
      
      // Build update object based on configuration
      if (config.update_fields) {
        for (const [field, valueTemplate] of Object.entries(config.update_fields)) {
          updates[field] = this.personalizeContent(valueTemplate, customerData, contextData);
        }
      }

      if (config.tags && config.tags.action === 'add') {
        // Add tags to customer
        const currentTags = customerData.tags || [];
        const newTags = config.tags.values || [];
        const updatedTags = [...new Set([...currentTags, ...newTags])];
        
        updates.tags = updatedTags;
      } else if (config.tags && config.tags.action === 'remove') {
        // Remove tags from customer
        const currentTags = customerData.tags || [];
        const tagsToRemove = config.tags.values || [];
        const updatedTags = currentTags.filter(tag => !tagsToRemove.includes(tag));
        
        updates.tags = updatedTags;
      }

      if (config.custom_fields) {
        // Update custom fields
        const currentCustomFields = customerData.custom_fields || {};
        updates.custom_fields = { ...currentCustomFields, ...config.custom_fields };
      }

      // Apply updates to customer profile
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerData.id)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ [ACTION] Customer ${customerData.id} updated with fields: ${Object.keys(updates).join(', ')}`);

      return {
        action: 'customer_updated',
        profile_id: customerData.id,
        updated_fields: Object.keys(updates),
        new_data: data
      };

    } catch (error) {
      console.error('❌ [ACTION] Customer update action failed:', error);
      throw error;
    }
  }

  // 🌐 EXECUTE WEBHOOK ACTION (REAL)
  async executeWebhookAction(config, customerData, contextData) {
    try {
      // Personalize webhook payload
      const personalizedPayload = this.personalizeWebhookPayload(config.payload, customerData, contextData);
      
      // Execute webhook
      const response = await fetch(config.url, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify(personalizedPayload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      
      console.log(`✅ [ACTION] Webhook sent to ${config.url} for customer ${customerData.id}`);

      return {
        action: 'webhook_triggered',
        url: config.url,
        status: response.status,
        response: responseData
      };

    } catch (error) {
      console.error('❌ [ACTION] Webhook action failed:', error);
      throw error;
    }
  }

  // ⏰ EXECUTE REMINDER ACTION (REAL)
  async executeReminderAction(config, customerData, contextData) {
    try {
      // Personalize reminder content
      const personalizedMessage = this.personalizeContent(config.message, customerData, contextData);
      
      // Calculate reminder time
      const reminderTime = this.calculateDueDate(config.remind_in_days || 1);
      
      // Create reminder in database
      const { data: reminder, error } = await this.supabase
        .from('reminders')
        .insert({
          profile_id: customerData.id,
          message: personalizedMessage,
          reminder_time: reminderTime,
          priority: config.priority || 'medium',
          related_to: config.related_to,
          automation_id: contextData.automation_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ [ACTION] Reminder created for customer ${customerData.id} at ${reminderTime}`);

      return {
        action: 'reminder_created',
        reminder_id: reminder.id,
        reminder_time: reminderTime,
        message: personalizedMessage
      };

    } catch (error) {
      console.error('❌ [ACTION] Reminder action failed:', error);
      throw error;
    }
  }

  // 👨‍💼 EXECUTE TEAM ASSIGNMENT ACTION (REAL)
  async executeTeamAssignmentAction(config, customerData, contextData) {
    try {
      const { team_member_id, assignment_reason } = config;
      
      if (!team_member_id) {
        throw new Error('Team member ID is required');
      }

      // Assign customer to team member
      const { data, error } = await this.supabase
        .from('customer_assignments')
        .upsert({
          profile_id: customerData.id,
          team_member_id: team_member_id,
          assigned_at: new Date().toISOString(),
          assignment_reason: assignment_reason || `Automated assignment: ${contextData.automation_id || 'unknown'}`,
          assigned_by: 'automation_system'
        }, {
          onConflict: 'profile_id'
        });

      if (error) throw error;

      console.log(`✅ [ACTION] Customer ${customerData.id} assigned to team member ${team_member_id}`);

      return {
        action: 'team_assigned',
        profile_id: customerData.id,
        team_member_id: team_member_id,
        assignment_reason: assignment_reason
      };

    } catch (error) {
      console.error('❌ [ACTION] Team assignment action failed:', error);
      throw error;
    }
  }

  // 📝 EXECUTE LOGGING ACTION (REAL)
  async executeLoggingAction(config, customerData, contextData) {
    try {
      // Personalize log message
      const personalizedMessage = this.personalizeContent(config.message, customerData, contextData);
      
      // Create activity log
      const { data: activity, error } = await this.supabase
        .from('customer_activities')
        .insert({
          profile_id: customerData.id,
          activity_type: config.activity_type || 'automation_log',
          description: personalizedMessage,
          metadata: {
            automation_id: contextData.automation_id,
            trigger_data: contextData,
            log_level: config.log_level || 'info'
          },
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ [ACTION] Activity logged for customer ${customerData.id}: ${personalizedMessage}`);

      return {
        action: 'activity_logged',
        activity_id: activity.id,
        message: personalizedMessage,
        activity_type: config.activity_type
      };

    } catch (error) {
      console.error('❌ [ACTION] Logging action failed:', error);
      throw error;
    }
  }

  // 🛠️ HELPER METHODS (REAL)

  // Validate action configuration
  validateActionConfig(actionType, config) {
    const errors = [];

    switch (actionType) {
      case 'send_whatsapp':
        if (!config.message_template) {
          errors.push('WhatsApp message template is required');
        }
        break;

      case 'send_email':
        if (!config.subject_template) {
          errors.push('Email subject template is required');
        }
        if (!config.body_template) {
          errors.push('Email body template is required');
        }
        break;

      case 'send_sms':
        if (!config.message_template) {
          errors.push('SMS message template is required');
        }
        break;

      case 'create_task':
        if (!config.title) {
          errors.push('Task title is required');
        }
        break;

      case 'update_segment':
        if (!config.segment_id) {
          errors.push('Segment ID is required');
        }
        if (!config.action) {
          errors.push('Segment action (add/remove) is required');
        }
        break;

      case 'trigger_webhook':
        if (!config.url) {
          errors.push('Webhook URL is required');
        }
        break;

      default:
        // No specific validation for other actions
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Personalize content with customer data
  personalizeContent(template, customerData, contextData) {
    if (!template) return '';
    
    let content = template;

    // Replace customer variables
    const customerVariables = {
      '{{customer.name}}': customerData.full_name || 'Valued Customer',
      '{{customer.first_name}}': customerData.first_name || 'Customer',
      '{{customer.last_name}}': customerData.last_name || '',
      '{{customer.company}}': customerData.company_name || '',
      '{{customer.email}}': customerData.email || '',
      '{{customer.phone}}': customerData.phone || '',
      '{{customer.country}}': customerData.country || '',
      '{{customer.city}}': customerData.city || ''
    };

    Object.keys(customerVariables).forEach(variable => {
      content = content.replace(new RegExp(variable, 'g'), customerVariables[variable]);
    });

    // Replace order variables if available
    if (contextData.order) {
      const orderVariables = {
        '{{order.id}}': contextData.order.id || '',
        '{{order.total_amount}}': contextData.order.total_amount || '',
        '{{order.status}}': contextData.order.status || '',
        '{{order.product_name}}': contextData.order.product_name || ''
      };

      Object.keys(orderVariables).forEach(variable => {
        content = content.replace(new RegExp(variable, 'g'), orderVariables[variable]);
      });
    }

    // Replace export order variables if available
    if (contextData.export_order) {
      const exportOrderVariables = {
        '{{export_order.current_phase}}': contextData.export_order.current_phase || '',
        '{{export_order.reference}}': contextData.export_order.export_reference || ''
      };

      Object.keys(exportOrderVariables).forEach(variable => {
        content = content.replace(new RegExp(variable, 'g'), exportOrderVariables[variable]);
      });
    }

    return content;
  }

  // Personalize webhook payload
  personalizeWebhookPayload(payloadTemplate, customerData, contextData) {
    if (typeof payloadTemplate === 'string') {
      return this.personalizeContent(payloadTemplate, customerData, contextData);
    }

    // Recursively personalize object payload
    const personalize = (obj) => {
      if (typeof obj === 'string') {
        return this.personalizeContent(obj, customerData, contextData);
      } else if (Array.isArray(obj)) {
        return obj.map(personalize);
      } else if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = personalize(value);
        }
        return result;
      }
      return obj;
    };

    return personalize(payloadTemplate);
  }

  // Calculate due date based on offset
  calculateDueDate(offsetDays = 1) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + offsetDays);
    return dueDate.toISOString();
  }

  // Log communication to database
  async logCommunication(communicationData) {
    try {
      const { data, error } = await this.supabase
        .from('communication_logs')
        .insert({
          ...communicationData,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log communication:', error);
      }
    } catch (error) {
      console.error('Error logging communication:', error);
    }
  }

  // 📊 GET ACTION STATISTICS (REAL)
  async getActionStats(timeframe = '7d') {
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

      const { data: logs, error } = await this.supabase
        .from('automation_logs')
        .select('action_type, status, executed_at')
        .gte('executed_at', dateFilter.toISOString());

      if (error) throw error;

      return this.calculateActionStats(logs);

    } catch (error) {
      console.error('❌ [ACTION] Error getting action stats:', error);
      return {};
    }
  }

  // Calculate action statistics
  calculateActionStats(logs) {
    const stats = {
      total_actions: logs.length,
      by_action_type: {},
      by_status: {},
      success_rate: 0
    };

    logs.forEach(log => {
      // Count by action type
      stats.by_action_type[log.action_type] = (stats.by_action_type[log.action_type] || 0) + 1;
      
      // Count by status
      stats.by_status[log.status] = (stats.by_status[log.status] || 0) + 1;
    });

    const successCount = stats.by_status.success || 0;
    stats.success_rate = stats.total_actions > 0 ? (successCount / stats.total_actions) * 100 : 0;

    return stats;
  }

  // 🔧 REGISTER CUSTOM ACTION HANDLER (REAL)
  registerActionHandler(actionType, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Action handler must be a function');
    }

    this.actionHandlers.set(actionType, handler);
    console.log(`✅ [ACTION] Custom action handler registered for: ${actionType}`);
  }

  // 📋 GET AVAILABLE ACTIONS (REAL)
  getAvailableActions() {
    return Array.from(this.actionHandlers.keys()).map(actionType => ({
      type: actionType,
      description: this.getActionDescription(actionType)
    }));
  }

  // Get action description
  getActionDescription(actionType) {
    const descriptions = {
      'send_whatsapp': 'Send WhatsApp message to customer',
      'send_email': 'Send email to customer',
      'send_sms': 'Send SMS to customer',
      'create_task': 'Create internal task for team',
      'update_segment': 'Add or remove customer from segment',
      'update_customer': 'Update customer profile data',
      'trigger_webhook': 'Trigger external webhook',
      'create_reminder': 'Create follow-up reminder',
      'assign_to_team': 'Assign customer to team member',
      'log_activity': 'Log customer activity'
    };

    return descriptions[actionType] || 'Custom action';
  }
}

export default ActionExecutor;