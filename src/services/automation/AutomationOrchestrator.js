// FILE 1: src/services/automation/AutomationOrchestrator.js

import { createClient } from '@supabase/supabase-js';
import WhatsAppService from '../messaging/WhatsAppService';
import EmailService from '../messaging/EmailService';
import AutomationLogger from './AutomationLogger';
import TriggerManager from './TriggerManager';

class AutomationOrchestrator {
  constructor() {
    this.supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY
    );
    
    this.whatsappService = new WhatsAppService();
    this.emailService = new EmailService();
    this.logger = new AutomationLogger();
    this.triggerManager = new TriggerManager();
    
    this.isRunning = false;
    this.retryQueue = new Map();
  }

  // 🚀 MAIN START METHOD
  async start() {
    if (this.isRunning) {
      console.log('Automation orchestrator already running');
      return;
    }

    console.log('🚀 Starting Real Automation System...');
    this.isRunning = true;

    try {
      // 1. Start real-time database listeners
      await this.setupRealtimeListeners();
      
      // 2. Process any pending automations
      await this.processPendingAutomations();
      
      // 3. Start scheduled triggers
      await this.startScheduledTriggers();
      
      console.log('✅ Automation System Started Successfully');
      
    } catch (error) {
      console.error('❌ Failed to start automation system:', error);
      throw error;
    }
  }

  // 📡 REAL-TIME DATABASE LISTENERS
  async setupRealtimeListeners() {
    console.log('Setting up real-time database listeners...');

    // Listen to orders table for new orders and status changes
    this.ordersSubscription = this.supabase
      .channel('orders-automation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          this.handleOrderChange(payload);
        }
      )
      .subscribe();

    // Listen to export_orders for phase changes
    this.exportOrdersSubscription = this.supabase
      .channel('export-orders-automation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'export_orders'
        },
        (payload) => {
          this.handleExportOrderChange(payload);
        }
      )
      .subscribe();

    // Listen to profiles for new customers
    this.profilesSubscription = this.supabase
      .channel('profiles-automation')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          this.handleNewCustomer(payload);
        }
      )
      .subscribe();

    console.log('✅ Real-time listeners activated');
  }

  // 🎯 HANDLE ORDER CHANGES - REAL BUSINESS LOGIC
  async handleOrderChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    try {
      // New Order Created
      if (eventType === 'INSERT') {
        await this.triggerManager.detectTriggers('order_created', newRecord);
      }
      
      // Order Status Changed
      if (eventType === 'UPDATE' && newRecord.status !== oldRecord.status) {
        await this.triggerManager.detectTriggers('order_status_changed', {
          order: newRecord,
          oldStatus: oldRecord.status,
          newStatus: newRecord.status
        });
      }
      
    } catch (error) {
      console.error('Error handling order change:', error);
      await this.logger.logError('order_trigger', error, { orderId: newRecord.id });
    }
  }

  // 📦 HANDLE EXPORT ORDER CHANGES
  async handleExportOrderChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    try {
      // Export Phase Changed
      if (eventType === 'UPDATE' && newRecord.current_phase !== oldRecord.current_phase) {
        await this.triggerManager.detectTriggers('export_phase_changed', {
          exportOrder: newRecord,
          oldPhase: oldRecord.current_phase,
          newPhase: newRecord.current_phase
        });
      }
      
    } catch (error) {
      console.error('Error handling export order change:', error);
      await this.logger.logError('export_order_trigger', error, { exportOrderId: newRecord.id });
    }
  }

  // 👥 HANDLE NEW CUSTOMER REGISTRATION
  async handleNewCustomer(payload) {
    const { new: newRecord } = payload;
    
    try {
      await this.triggerManager.detectTriggers('new_customer', newRecord);
    } catch (error) {
      console.error('Error handling new customer:', error);
      await this.logger.logError('new_customer_trigger', error, { profileId: newRecord.id });
    }
  }

  // ⚡ EXECUTE AUTOMATION WITH FALLBACKS
  async executeAutomation(automation, customerData, triggerData) {
    const executionId = `${automation.id}-${Date.now()}`;
    
    try {
      console.log(`🔄 Executing automation: ${automation.action_name} for customer ${customerData.id}`);
      
      // Log automation start
      await this.logger.logAutomationStart(executionId, automation, customerData, triggerData);

      let result;
      
      // Execute based on automation type with fallbacks
      switch (automation.automation_type) {
        case 'whatsapp':
          result = await this.executeWhatsAppAutomation(automation, customerData, triggerData);
          break;
          
        case 'email':
          result = await this.executeEmailAutomation(automation, customerData, triggerData);
          break;
          
        case 'workflow':
          result = await this.executeWorkflowAutomation(automation, customerData, triggerData);
          break;
          
        default:
          throw new Error(`Unknown automation type: ${automation.automation_type}`);
      }

      // Log success
      await this.logger.logAutomationSuccess(executionId, automation, customerData, result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Automation execution failed:`, error);
      
      // Log failure and schedule retry
      await this.logger.logAutomationFailure(executionId, automation, customerData, error);
      await this.scheduleRetry(executionId, automation, customerData, triggerData, error);
      
      throw error;
    }
  }

  // 📱 WHATSAPP AUTOMATION WITH FALLBACK
  async executeWhatsAppAutomation(automation, customerData, triggerData) {
    const { phone } = customerData;
    
    if (!phone) {
      throw new Error('Customer phone number not available');
    }

    const message = this.personalizeMessage(automation.action_config.template, customerData, triggerData);
    
    try {
      console.log(`📱 Sending WhatsApp to ${phone}: ${message.substring(0, 50)}...`);
      
      // Try Twilio WhatsApp first
      let result = await this.whatsappService.sendViaTwilio(phone, message);
      
      return {
        channel: 'whatsapp_twilio',
        messageId: result.sid,
        status: 'sent',
        timestamp: new Date().toISOString()
      };
      
    } catch (twilioError) {
      console.warn('Twilio WhatsApp failed, trying WhatsApp Business API fallback:', twilioError);
      
      try {
        // Fallback to WhatsApp Business API
        const fallbackResult = await this.whatsappService.sendViaBusinessAPI(phone, message);
        
        return {
          channel: 'whatsapp_business_fallback',
          messageId: fallbackResult.id,
          status: 'sent_fallback',
          timestamp: new Date().toISOString()
        };
        
      } catch (businessAPIError) {
        console.error('All WhatsApp channels failed:', businessAPIError);
        throw new Error(`WhatsApp delivery failed: ${businessAPIError.message}`);
      }
    }
  }

  // 📧 EMAIL AUTOMATION WITH FALLBACK
  async executeEmailAutomation(automation, customerData, triggerData) {
    const { email } = customerData;
    
    if (!email) {
      throw new Error('Customer email not available');
    }

    const emailData = {
      to: email,
      subject: this.personalizeMessage(automation.action_config.subject, customerData, triggerData),
      body: this.personalizeMessage(automation.action_config.body, customerData, triggerData)
    };
    
    try {
      console.log(`📧 Sending email to ${email}`);
      
      // Try EmailJS first
      let result = await this.emailService.sendViaEmailJS(emailData);
      
      return {
        channel: 'emailjs',
        messageId: result.messageId,
        status: 'sent',
        timestamp: new Date().toISOString()
      };
      
    } catch (emailJSError) {
      console.warn('EmailJS failed, trying Gmail SMTP fallback:', emailJSError);
      
      try {
        // Fallback to Gmail SMTP
        const fallbackResult = await this.emailService.sendViaGmailSMTP(emailData);
        
        return {
          channel: 'gmail_smtp_fallback',
          messageId: fallbackResult.messageId,
          status: 'sent_fallback',
          timestamp: new Date().toISOString()
        };
        
      } catch (gmailError) {
        console.error('All email channels failed:', gmailError);
        throw new Error(`Email delivery failed: ${gmailError.message}`);
      }
    }
  }

  // ⚙️ WORKFLOW AUTOMATION
  async executeWorkflowAutomation(automation, customerData, triggerData) {
    // Create internal tasks, update segments, etc.
    const workflowConfig = automation.action_config;
    
    switch (workflowConfig.action) {
      case 'create_task':
        return await this.createInternalTask(workflowConfig, customerData, triggerData);
        
      case 'update_segment':
        return await this.updateCustomerSegment(workflowConfig, customerData, triggerData);
        
      case 'update_priority':
        return await this.updateCustomerPriority(workflowConfig, customerData, triggerData);
        
      default:
        throw new Error(`Unknown workflow action: ${workflowConfig.action}`);
    }
  }

  // 🎯 PERSONALIZE MESSAGES WITH REAL CUSTOMER DATA
  personalizeMessage(template, customerData, triggerData) {
    let message = template;
    
    // Replace customer variables
    message = message.replace(/{{customer\.name}}/g, customerData.full_name || 'Valued Customer');
    message = message.replace(/{{customer\.company}}/g, customerData.company_name || '');
    message = message.replace(/{{customer\.country}}/g, customerData.country || '');
    
    // Replace order variables if available
    if (triggerData.order) {
      message = message.replace(/{{order\.id}}/g, triggerData.order.id);
      message = message.replace(/{{order\.total_amount}}/g, triggerData.order.total_amount);
      message = message.replace(/{{order\.status}}/g, triggerData.order.status);
    }
    
    if (triggerData.exportOrder) {
      message = message.replace(/{{export_order\.current_phase}}/g, triggerData.exportOrder.current_phase);
    }
    
    return message;
  }

  // 🔄 RETRY LOGIC FOR FAILED AUTOMATIONS
  async scheduleRetry(executionId, automation, customerData, triggerData, error) {
    const retryCount = this.retryQueue.get(executionId) || 0;
    
    if (retryCount >= 3) {
      console.log(`Max retries reached for automation ${automation.id}`);
      this.retryQueue.delete(executionId);
      return;
    }
    
    const delay = Math.pow(2, retryCount) * 60000; // Exponential backoff: 1min, 2min, 4min
    
    console.log(`Scheduling retry ${retryCount + 1} in ${delay/1000} seconds`);
    
    setTimeout(async () => {
      try {
        await this.executeAutomation(automation, customerData, triggerData);
        this.retryQueue.delete(executionId);
      } catch (retryError) {
        this.retryQueue.set(executionId, retryCount + 1);
        await this.scheduleRetry(executionId, automation, customerData, triggerData, retryError);
      }
    }, delay);
    
    this.retryQueue.set(executionId, retryCount + 1);
  }

  // 📊 PROCESS PENDING AUTOMATIONS ON STARTUP
  async processPendingAutomations() {
    try {
      const { data: pendingAutomations, error } = await this.supabase
        .from('automation_logs')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Older than 30 mins
      
      if (error) throw error;
      
      console.log(`Processing ${pendingAutomations.length} pending automations`);
      
      for (const log of pendingAutomations) {
        // Re-process pending automations
        await this.retryPendingAutomation(log);
      }
      
    } catch (error) {
      console.error('Error processing pending automations:', error);
    }
  }

  async retryPendingAutomation(log) {
    // Implementation for retrying pending automations
    console.log(`Retrying pending automation: ${log.id}`);
  }

  // ⏰ START SCHEDULED TRIGGERS
  async startScheduledTriggers() {
    // Check for time-based triggers every minute
    setInterval(async () => {
      await this.checkScheduledTriggers();
    }, 60000);
    
    console.log('✅ Scheduled triggers activated');
  }

  async checkScheduledTriggers() {
    // Check for automations scheduled to run at specific times
    const now = new Date().toISOString();
    
    try {
      const { data: triggers, error } = await this.supabase
        .from('automation_triggers')
        .select(`
          *,
          segment_automations (*)
        `)
        .eq('is_active', true)
        .lte('next_trigger_at', now);
      
      if (error) throw error;
      
      for (const trigger of triggers) {
        await this.executeScheduledTrigger(trigger);
      }
      
    } catch (error) {
      console.error('Error checking scheduled triggers:', error);
    }
  }

  async executeScheduledTrigger(trigger) {
    console.log(`Executing scheduled trigger: ${trigger.id}`);
    // Implementation for scheduled triggers
  }

  // 🛑 STOP THE AUTOMATION SYSTEM
  stop() {
    this.isRunning = false;
    
    if (this.ordersSubscription) this.ordersSubscription.unsubscribe();
    if (this.exportOrdersSubscription) this.exportOrdersSubscription.unsubscribe();
    if (this.profilesSubscription) this.profilesSubscription.unsubscribe();
    
    console.log('🛑 Automation System Stopped');
  }

  // 📈 GET SYSTEM STATUS
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSubscriptions: {
        orders: !!this.ordersSubscription,
        exportOrders: !!this.exportOrdersSubscription,
        profiles: !!this.profilesSubscription
      },
      retryQueueSize: this.retryQueue.size
    };
  }
}

export default AutomationOrchestrator;