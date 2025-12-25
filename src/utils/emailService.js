/**
 * EMAIL SERVICE - Dual Provider System
 * Supports Resend API and SMTP with automatic failover
 */

import supabase from '../supabaseClient';

class EmailService {
  constructor() {
    this.providers = new Map();
    this.activeProvider = null;
    this.fallbackProvider = null;
    this.initializeProviders();
  }

  /**
   * Initialize email providers from database
   */
  async initializeProviders() {
    try {
      const { data: providers, error } = await supabase
        .from('email_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;

      // Sort providers by priority
      const sortedProviders = providers || [];
      
      // Set active provider (highest priority)
      if (sortedProviders.length > 0) {
        this.activeProvider = sortedProviders[0];
      }

      // Set fallback provider (second highest priority)
      if (sortedProviders.length > 1) {
        this.fallbackProvider = sortedProviders[1];
      }

      console.log('Email providers initialized:', {
        active: this.activeProvider?.name,
        fallback: this.fallbackProvider?.name,
        total: sortedProviders.length
      });

      return sortedProviders;
    } catch (error) {
      console.error('Failed to initialize email providers:', error);
      return [];
    }
  }

  /**
   * Send email using the best available provider
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
    from = null,
    replyTo = null,
    cc = [],
    bcc = [],
    attachments = [],
    tags = [],
    tracking = true
  }) {
    const emailData = {
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || this.extractTextFromHtml(html),
      from: from || this.getDefaultFromAddress(),
      replyTo,
      cc,
      bcc,
      attachments,
      tags,
      tracking
    };

    // Try primary provider first
    let result = await this.trySendWithProvider(this.activeProvider, emailData);
    
    // If primary fails and we have fallback, try it
    if (!result.success && this.fallbackProvider) {
      console.log('Primary provider failed, trying fallback...');
      result = await this.trySendWithProvider(this.fallbackProvider, emailData);
      
      if (result.success) {
        await this.logProviderSwitch(this.activeProvider.id, this.fallbackProvider.id);
      }
    }

    // Log the result
    await this.logEmailAttempt(result);

    return result;
  }

  /**
   * Try sending with a specific provider
   */
  async trySendWithProvider(provider, emailData) {
    if (!provider) {
      return {
        success: false,
        error: 'No email provider available',
        provider: null
      };
    }

    const startTime = Date.now();
    
    try {
      let response;
      
      switch (provider.provider_type) {
        case 'resend':
          response = await this.sendWithResend(provider.config, emailData);
          break;
        case 'smtp':
          response = await this.sendWithSMTP(provider.config, emailData);
          break;
        default:
          throw new Error(`Unsupported provider type: ${provider.provider_type}`);
      }

      const responseTime = Date.now() - startTime;

      // Update provider usage stats
      await this.updateProviderStats(provider.id, {
        success: true,
        responseTime
      });

      return {
        success: true,
        messageId: response.messageId || response.id,
        provider: provider.name,
        providerType: provider.provider_type,
        responseTime,
        data: response
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      console.error(`Email sending failed with ${provider.name}:`, error);

      // Update provider error stats
      await this.updateProviderStats(provider.id, {
        success: false,
        responseTime,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        provider: provider.name,
        providerType: provider.provider_type,
        responseTime
      };
    }
  }

  /**
   * Send email using Resend API
   */
  async sendWithResend(config, emailData) {
    const { api_key, from_email, from_name } = config;
    
    if (!api_key) {
      throw new Error('Resend API key not configured');
    }

    const fromAddress = emailData.from || `${from_name} <${from_email}>`;

    const payload = {
      from: fromAddress,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      reply_to: emailData.replyTo,
      cc: emailData.cc,
      bcc: emailData.bcc,
      attachments: emailData.attachments,
      tags: emailData.tags.map(tag => ({ name: tag, value: 'true' }))
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Resend API error: ${response.status}`);
    }

    return data;
  }

  /**
   * Send email using SMTP
   */
  async sendWithSMTP(config, emailData) {
    // Since we can't use Node.js SMTP client in browser,
    // we'll use a serverless function for SMTP
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-smtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        config,
        emailData
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `SMTP sending failed: ${response.status}`);
    }

    return data;
  }

  /**
   * Log email attempt to database
   */
  async logEmailAttempt(result) {
    try {
      await supabase
        .from('provider_logs')
        .insert({
          provider_id: result.provider,
          action: 'send_email',
          status: result.success ? 'success' : 'failed',
          message: result.error || 'Email sent successfully',
          response_time_ms: result.responseTime,
          details: result
        });
    } catch (error) {
      console.error('Failed to log email attempt:', error);
    }
  }

  /**
   * Log provider switch
   */
  async logProviderSwitch(fromProviderId, toProviderId) {
    try {
      await supabase
        .from('provider_logs')
        .insert({
          provider_id: toProviderId,
          action: 'provider_switch',
          status: 'info',
          message: `Switched from provider ${fromProviderId} to ${toProviderId}`,
          details: { fromProviderId, toProviderId }
        });
    } catch (error) {
      console.error('Failed to log provider switch:', error);
    }
  }

  /**
   * Update provider statistics
   */
  async updateProviderStats(providerId, { success, responseTime, error = null }) {
    try {
      // Get current provider stats
      const { data: provider } = await supabase
        .from('email_providers')
        .select('monthly_usage, success_rate')
        .eq('id', providerId)
        .single();

      if (!provider) return;

      // Calculate new success rate
      const totalRequests = provider.monthly_usage + 1;
      const totalSuccess = Math.floor((provider.success_rate * provider.monthly_usage) / 100);
      const newSuccessRate = success 
        ? ((totalSuccess + 1) / totalRequests) * 100
        : (totalSuccess / totalRequests) * 100;

      // Update provider
      await supabase
        .from('email_providers')
        .update({
          monthly_usage: totalRequests,
          success_rate: newSuccessRate,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId);

    } catch (error) {
      console.error('Failed to update provider stats:', error);
    }
  }

  /**
   * Get default from address
   */
  getDefaultFromAddress() {
    if (this.activeProvider) {
      const config = this.activeProvider.config;
      if (config.from_email && config.from_name) {
        return `${config.from_name} <${config.from_email}>`;
      }
    }
    return 'Saffron Emporial <noreply@saffronemporial.com>';
  }

  /**
   * Extract plain text from HTML
   */
  extractTextFromHtml(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get provider health status
   */
  async getProviderHealth() {
    const providers = await this.initializeProviders();
    
    const healthChecks = await Promise.all(
      providers.map(async (provider) => {
        const startTime = Date.now();
        let healthy = false;
        let latency = 0;

        try {
          // Simple health check based on provider type
          if (provider.provider_type === 'resend') {
            // Check Resend API
            const response = await fetch('https://api.resend.com/emails', {
              method: 'HEAD',
              headers: {
                'Authorization': `Bearer ${provider.config.api_key}`
              }
            });
            healthy = response.status === 200;
          } else {
            // For SMTP, we'll consider it healthy if configured
            healthy = !!provider.config.host && !!provider.config.port;
          }

          latency = Date.now() - startTime;
        } catch (error) {
          healthy = false;
          latency = Date.now() - startTime;
        }

        return {
          id: provider.id,
          name: provider.name,
          type: provider.provider_type,
          healthy,
          latency,
          priority: provider.priority,
          isDefault: provider.is_default,
          successRate: provider.success_rate,
          monthlyUsage: provider.monthly_usage
        };
      })
    );

    return healthChecks;
  }

  /**
   * Switch active provider manually
   */
  async switchProvider(providerId) {
    try {
      // Reset all default flags
      await supabase
        .from('email_providers')
        .update({ is_default: false })
        .eq('provider_type', this.activeProvider.provider_type);

      // Set new default
      await supabase
        .from('email_providers')
        .update({ is_default: true })
        .eq('id', providerId);

      // Reinitialize providers
      await this.initializeProviders();

      return { success: true };
    } catch (error) {
      console.error('Failed to switch provider:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;