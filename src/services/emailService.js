// src/services/emailService.js - UPDATED FOR EDGE FUNCTIONS
import { supabase } from '../supabaseClient.js' ;

class EmailService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  /**
   * Send email via Edge Function
   */
  async sendEmail(to, subject, body, templateParams = {}, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`📧 Attempt ${attempt}/${this.maxRetries} to send email to ${to}`);

        if (!this.validateEmail(to)) {
          throw new Error(`Invalid email format: ${to}`);
        }

        // Call Edge Function instead of direct EmailJS
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: { 
            to, 
            subject,
            body,
            templateParams,
            ...options 
          }
        });

        if (error) throw error;

        console.log('✅ Email sent successfully via Edge Function');

        return {
          success: true,
          messageId: data.messageId,
          status: data.status,
          timestamp: data.timestamp,
          rawResponse: data,
          attempt: attempt
        };

      } catch (error) {
        lastError = error;
        console.error(`❌ Email send attempt ${attempt} failed:`, error.message);

        // Don't retry for these error types
        if (this.isFatalError(error)) {
          console.log('🛑 Fatal error, not retrying:', error.message);
          break;
        }

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      status: 'failed',
      attempt: this.maxRetries
    };
  }

  /**
   * Send template email via Edge Function
   */
  async sendTemplateEmail(to, templateId, templateData = {}, options = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-template', {
        body: { 
          to, 
          templateId, 
          templateData,
          ...options 
        }
      });

      if (error) throw error;

      return {
        success: true,
        messageId: data.messageId,
        status: data.status,
        timestamp: data.timestamp,
        rawResponse: data,
        templateUsed: templateId
      };

    } catch (error) {
      console.error('❌ Template email send error:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed',
        templateUsed: templateId
      };
    }
  }

  /**
   * Send automation email via Edge Function
   */
  async sendAutomationEmail(automationType, recipient, templateData) {
    try {
      const { data, error } = await supabase.functions.invoke('send-automation-email', {
        body: {
          automationType,
          recipient,
          templateData
        }
      });

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ Automation email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk emails via Edge Function
   */
  async sendBulkEmails(recipients, emailConfig, options = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-email', {
        body: {
          recipients,
          emailConfig,
          options
        }
      });

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Bulk email send error:', error);
      return {
        total: recipients.length,
        successful: 0,
        failed: recipients.length,
        error: error.message
      };
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Check if error is fatal (should not retry)
   */
  isFatalError(error) {
    const fatalMessages = [
      'invalid email',
      'invalid template',
      'invalid service',
      'permission denied',
      'quota exceeded',
      'payment required'
    ];

    return fatalMessages.some(msg => 
      error.message?.toLowerCase().includes(msg)
    );
  }

  /**
   * Build template data from member data
   */
  buildTemplateData(memberData) {
    return {
      client_name: memberData.full_name || memberData.first_name || 'Valued Client',
      first_name: memberData.first_name || '',
      last_name: memberData.last_name || '',
      company: memberData.company || memberData.company_name || '',
      email: memberData.email || '',
      phone: memberData.phone || '',
      business_type: memberData.business_type || '',
      country: memberData.country || '',
      segment_name: memberData.segment_name || '',
      order_count: memberData.order_count || 0,
      total_revenue: memberData.total_revenue || 0,
      engagement_score: memberData.engagement_score || 0
    };
  }

  /**
   * Replace template variables in text
   */
  replaceTemplateVariables(text, data) {
    if (!text) return '';
    
    const variables = {
      '{{client_name}}': data.full_name || data.first_name || 'Valued Client',
      '{{first_name}}': data.first_name || '',
      '{{last_name}}': data.last_name || '',
      '{{company}}': data.company || data.company_name || '',
      '{{email}}': data.email || '',
      '{{phone}}': data.phone || '',
      '{{business_type}}': data.business_type || '',
      '{{country}}': data.country || '',
      '{{segment_name}}': data.segment_name || '',
      '{{order_count}}': data.order_count || '0',
      '{{total_revenue}}': this.formatCurrency(data.total_revenue),
      '{{engagement_score}}': data.engagement_score || '0'
    };

    return text.replace(
      /{{(.*?)}}/g, 
      (match, variable) => variables[match] || match
    );
  }

  /**
   * Test email configuration via Edge Function
   */
  async testConfiguration() {
    try {
      const { data, error } = await supabase.functions.invoke('test-email-config', {
        body: {}
      });

      if (error) throw error;

      return data;

    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get email sending statistics via Edge Function
   */
  async getSendingStats(timeframe = '30d') {
    try {
      const { data, error } = await supabase.functions.invoke('email-stats', {
        body: { timeframe }
      });

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error getting email stats:', error);
      return null;
    }
  }

  /**
   * Format currency for templates
   */
  formatCurrency(amount) {
    if (!amount) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date for templates
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Delay function for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const emailService = new EmailService();
export default emailService;