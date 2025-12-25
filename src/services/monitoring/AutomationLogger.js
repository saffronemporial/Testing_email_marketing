// FILE 4: src/services/monitoring/AutomationLogger.js

class AutomationLogger {
  constructor() {
    this.supabase = window.supabase; // Using your existing supabaseClient
  }

  // 📝 LOG AUTOMATION START (REAL)
  async logAutomationStart(executionId, automation, customerData, triggerData) {
    try {
      console.log(`📝 [LOGGER] Starting automation: ${automation.action_name} for customer ${customerData.id}`);
      
      const logEntry = {
        id: executionId,
        automation_id: automation.id,
        segment_id: automation.segment_id,
        profile_id: customerData.id,
        trigger_type: triggerData.trigger_type || 'unknown',
        action_type: automation.automation_type,
        status: 'pending',
        message_content: this.extractMessageContent(automation, customerData, triggerData),
        channel: automation.automation_type === 'whatsapp' ? 'whatsapp' : 
                automation.automation_type === 'email' ? 'email' : 'internal',
        recipient_info: this.getRecipientInfo(customerData),
        executed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        metadata: {
          automation_name: automation.action_name,
          customer_name: customerData.full_name,
          trigger_details: triggerData,
          execution_phase: 'started'
        }
      };

      // REAL: Insert into automation_logs table
      const { data, error } = await this.supabase
        .from('automation_logs')
        .insert(logEntry)
        .select()
        .single();

      if (error) {
        console.error('❌ [LOGGER] Failed to log automation start:', error);
        throw error;
      }

      console.log(`✅ [LOGGER] Automation start logged: ${executionId}`);
      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Critical error logging automation start:', error);
      // Even if logging fails, we don't want to break the automation
      return null;
    }
  }

  // ✅ LOG AUTOMATION SUCCESS (REAL)
  async logAutomationSuccess(executionId, automation, customerData, result) {
    try {
      console.log(`✅ [LOGGER] Automation success: ${executionId}`);
      
      const updateData = {
        status: 'success',
        external_id: result.messageId || result.id,
        delivered_at: result.timestamp || new Date().toISOString(),
        metadata: this.supabase.raw(`
          metadata || '{
            "execution_phase": "completed",
            "channel_used": "${result.channel}",
            "final_status": "${result.status}",
            "completion_time": "${new Date().toISOString()}"
          }'::jsonb
        `)
      };

      // REAL: Update the log entry
      const { data, error } = await this.supabase
        .from('automation_logs')
        .update(updateData)
        .eq('id', executionId)
        .select()
        .single();

      if (error) throw error;

      // REAL: Also update automation execution count
      await this.incrementAutomationExecutionCount(automation.id);

      console.log(`✅ [LOGGER] Automation success logged: ${executionId}`);
      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to log automation success:', error);
      return null;
    }
  }

  // ❌ LOG AUTOMATION FAILURE (REAL)
  async logAutomationFailure(executionId, automation, customerData, error) {
    try {
      console.error(`❌ [LOGGER] Automation failed: ${executionId}`, error);
      
      const updateData = {
        status: 'failed',
        error_message: this.sanitizeErrorMessage(error),
        retry_count: this.supabase.raw('retry_count + 1'),
        metadata: this.supabase.raw(`
          metadata || '{
            "execution_phase": "failed",
            "error_type": "${error.name || 'Unknown'}",
            "failed_at": "${new Date().toISOString()}",
            "retry_scheduled": "true"
          }'::jsonb
        `)
      };

      // REAL: Update the log entry
      const { data, error: updateError } = await this.supabase
        .from('automation_logs')
        .update(updateData)
        .eq('id', executionId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log(`✅ [LOGGER] Automation failure logged: ${executionId}`);
      return data;

    } catch (logError) {
      console.error('❌ [LOGGER] Critical error logging automation failure:', logError);
      return null;
    }
  }

  // 🔄 LOG AUTOMATION RETRY (REAL)
  async logAutomationRetry(executionId, retryCount, nextRetryTime) {
    try {
      console.log(`🔄 [LOGGER] Logging retry ${retryCount} for: ${executionId}`);
      
      const { data, error } = await this.supabase
        .from('automation_logs')
        .update({
          status: 'retrying',
          retry_count: retryCount,
          metadata: this.supabase.raw(`
            metadata || '{
              "retry_attempt": ${retryCount},
              "next_retry_time": "${nextRetryTime}",
              "last_retry_logged": "${new Date().toISOString()}"
            }'::jsonb
          `)
        })
        .eq('id', executionId)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to log automation retry:', error);
      return null;
    }
  }

  // 📊 LOG DELIVERY STATUS UPDATE (REAL)
  async logDeliveryStatus(executionId, deliveryStatus) {
    try {
      console.log(`📊 [LOGGER] Updating delivery status for: ${executionId}`, deliveryStatus);
      
      const updateData = {
        status: deliveryStatus.status,
        external_id: deliveryStatus.messageId,
        metadata: this.supabase.raw(`
          metadata || '{
            "delivery_status": "${deliveryStatus.status}",
            "delivery_updated": "${new Date().toISOString()}",
            "channel_status": "${deliveryStatus.channelStatus || 'unknown'}"
          }'::jsonb
        `)
      };

      // Add timestamp based on status
      if (deliveryStatus.status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (deliveryStatus.status === 'read') {
        updateData.read_at = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('automation_logs')
        .update(updateData)
        .eq('id', executionId)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to log delivery status:', error);
      return null;
    }
  }

  // ⚠️ LOG SYSTEM ERRORS (REAL)
  async logError(context, error, additionalData = {}) {
    try {
      console.error(`⚠️ [LOGGER] System error in ${context}:`, error);
      
      const errorLog = {
        context: context,
        error_message: this.sanitizeErrorMessage(error),
        error_stack: error.stack || 'No stack trace',
        additional_data: additionalData,
        occurred_at: new Date().toISOString(),
        severity: this.determineErrorSeverity(error),
        resolved: false
      };

      // REAL: Insert into system_errors table (you might need to create this)
      const { data, error: insertError } = await this.supabase
        .from('system_errors')
        .insert(errorLog)
        .select()
        .single();

      if (insertError) {
        console.error('❌ [LOGGER] Failed to insert system error:', insertError);
        return null;
      }

      return data;

    } catch (logError) {
      console.error('❌ [LOGGER] Critical error logging system error:', logError);
      return null;
    }
  }

  // 📈 INCREMENT AUTOMATION EXECUTION COUNT (REAL)
  async incrementAutomationExecutionCount(automationId) {
    try {
      const { data, error } = await this.supabase
        .from('segment_automations')
        .update({
          execution_count: this.supabase.raw('execution_count + 1'),
          last_executed_at: new Date().toISOString()
        })
        .eq('id', automationId)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to increment execution count:', error);
      return null;
    }
  }

  // 🔍 GET AUTOMATION LOGS (REAL)
  async getAutomationLogs(filters = {}) {
    try {
      let query = this.supabase
        .from('automation_logs')
        .select(`
          *,
          segment_automations:automation_id (
            action_name,
            automation_type
          ),
          profiles:profile_id (
            full_name,
            email,
            phone
          )
        `)
        .order('executed_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.automation_id) {
        query = query.eq('automation_id', filters.automation_id);
      }
      if (filters.profile_id) {
        query = query.eq('profile_id', filters.profile_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('executed_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('executed_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to fetch automation logs:', error);
      return [];
    }
  }

  // 📊 GET AUTOMATION PERFORMANCE STATS (REAL)
  async getAutomationPerformance(automationId, days = 30) {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const { data, error } = await this.supabase
        .from('automation_logs')
        .select('status, executed_at')
        .eq('automation_id', automationId)
        .gte('executed_at', dateThreshold.toISOString());

      if (error) throw error;

      const stats = this.calculatePerformanceStats(data);
      return stats;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to fetch performance stats:', error);
      return null;
    }
  }

  // 🛡️ HELPER METHODS (REAL)

  extractMessageContent(automation, customerData, triggerData) {
    try {
      if (automation.automation_type === 'whatsapp' || automation.automation_type === 'email') {
        const template = automation.action_config.template || automation.action_config.body;
        return this.personalizeMessage(template, customerData, triggerData);
      }
      return `Workflow action: ${automation.action_name}`;
    } catch (error) {
      return `Error extracting message: ${error.message}`;
    }
  }

  getRecipientInfo(customerData) {
    return {
      phone: customerData.phone,
      email: customerData.email,
      name: customerData.full_name,
      company: customerData.company_name
    };
  }

  personalizeMessage(template, customerData, triggerData) {
    let message = template || '';
    
    // REAL customer data replacement
    const replacements = {
      '{{customer.name}}': customerData.full_name || 'Valued Customer',
      '{{customer.first_name}}': customerData.first_name || 'Customer',
      '{{customer.company}}': customerData.company_name || '',
      '{{customer.country}}': customerData.country || '',
      '{{customer.email}}': customerData.email || ''
    };

    Object.keys(replacements).forEach(key => {
      message = message.replace(new RegExp(key, 'g'), replacements[key]);
    });

    return message.substring(0, 500); // Limit length for logging
  }

  sanitizeErrorMessage(error) {
    if (typeof error === 'string') return error.substring(0, 1000);
    if (error.message) return error.message.substring(0, 1000);
    return 'Unknown error occurred';
  }

  determineErrorSeverity(error) {
    const severeKeywords = ['network', 'timeout', 'database', 'authentication'];
    const message = error.message?.toLowerCase() || '';
    
    if (severeKeywords.some(keyword => message.includes(keyword))) {
      return 'high';
    }
    
    return 'medium';
  }

  calculatePerformanceStats(logs) {
    const total = logs.length;
    const success = logs.filter(log => log.status === 'success').length;
    const failed = logs.filter(log => log.status === 'failed').length;
    const pending = logs.filter(log => log.status === 'pending').length;

    return {
      total_executions: total,
      success_count: success,
      failed_count: failed,
      pending_count: pending,
      success_rate: total > 0 ? (success / total) * 100 : 0,
      failure_rate: total > 0 ? (failed / total) * 100 : 0
    };
  }

  // 🧹 CLEAN UP OLD LOGS (REAL - for maintenance)
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await this.supabase
        .from('automation_logs')
        .delete()
        .lt('executed_at', cutoffDate.toISOString())
        .select();

      if (error) throw error;

      console.log(`🧹 [LOGGER] Cleaned up ${data.length} old logs`);
      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to cleanup old logs:', error);
      return null;
    }
  }

  // 📡 REAL-TIME LOG SUBSCRIPTION (REAL)
  subscribeToLogs(callback) {
    return this.supabase
      .channel('automation-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automation_logs'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
  }

  // 🎯 GET CUSTOMER AUTOMATION HISTORY (REAL)
  async getCustomerAutomationHistory(profileId, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('automation_logs')
        .select(`
          *,
          segment_automations:automation_id (
            action_name,
            automation_type
          )
        `)
        .eq('profile_id', profileId)
        .order('executed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ [LOGGER] Failed to fetch customer automation history:', error);
      return [];
    }
  }
}

export default AutomationLogger;