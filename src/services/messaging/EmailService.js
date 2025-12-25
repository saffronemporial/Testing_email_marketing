// FILE 3: src/services/messaging/EmailService.js

class EmailService {
  constructor() {
    this.supabase = window.supabase; // Using your existing supabaseClient
    this.edgeFunctionBaseUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1`;
  }

  // 📧 PRIMARY: Send via EmailJS using Edge Function (REAL)
  async sendViaEmailJS(emailData) {
    try {
      console.log(`📧 [EMAILJS] Sending email to ${emailData.to}`);
      
      // REAL: Call Supabase Edge Function for EmailJS
      const response = await fetch(`${this.edgeFunctionBaseUrl}/send-email-emailjs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          template_id: emailData.template_id,
          template_data: emailData.template_data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`EmailJS Edge Function error: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`✅ [EMAILJS] Email sent successfully: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        status: 'sent',
        channel: 'emailjs_edge_function',
        timestamp: new Date().toISOString(),
        rawResponse: result
      };
      
    } catch (error) {
      console.error(`❌ [EMAILJS] Email failed:`, error);
      
      throw {
        success: false,
        error: error.message,
        channel: 'emailjs_edge_function',
        retryable: this.isRetryableEmailError(error)
      };
    }
  }

  // 🔄 FALLBACK: Send via Gmail SMTP using Edge Function (REAL)
  async sendViaGmailSMTP(emailData) {
    try {
      console.log(`📧 [GMAIL SMTP] Sending email to ${emailData.to}`);
      
      // REAL: Call Supabase Edge Function for Gmail SMTP
      const response = await fetch(`${this.edgeFunctionBaseUrl}/send-email-gmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          html_body: emailData.html_body
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gmail Edge Function error: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`✅ [GMAIL SMTP] Email sent successfully: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        status: 'sent',
        channel: 'gmail_smtp_edge_function',
        timestamp: new Date().toISOString(),
        rawResponse: result
      };
      
    } catch (error) {
      console.error(`❌ [GMAIL SMTP] Email failed:`, error);
      
      throw {
        success: false,
        error: error.message,
        channel: 'gmail_smtp_edge_function',
        retryable: this.isRetryableEmailError(error)
      };
    }
  }

  // ✉️ MAIN EMAIL SEND METHOD WITH FALLBACK (REAL)
  async sendEmail(emailData) {
    const { to, subject, body, html_body, template_id, template_data } = emailData;
    
    // REAL: Validate email data
    const validation = this.validateEmailData(emailData);
    if (!validation.valid) {
      throw new Error(`Email validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Try EmailJS first
      return await this.sendViaEmailJS({
        to,
        subject,
        body,
        template_id,
        template_data
      });
      
    } catch (emailJSError) {
      console.warn('EmailJS failed, trying Gmail SMTP fallback:', emailJSError);
      
      try {
        // Fallback to Gmail SMTP
        return await this.sendViaGmailSMTP({
          to,
          subject,
          body,
          html_body: html_body || this.convertToHTML(body)
        });
        
      } catch (gmailError) {
        console.error('All email channels failed:', gmailError);
        throw new Error(`Email delivery failed: ${gmailError.message}`);
      }
    }
  }

  // 🎯 REAL Email Validation
  validateEmailData(emailData) {
    const errors = [];
    
    if (!emailData.to) {
      errors.push('Recipient email is required');
    } else if (!this.isValidEmail(emailData.to)) {
      errors.push('Invalid recipient email format');
    }
    
    if (!emailData.subject || emailData.subject.trim().length === 0) {
      errors.push('Email subject is required');
    }
    
    if (!emailData.body || emailData.body.trim().length === 0) {
      errors.push('Email body is required');
    }
    
    if (emailData.subject && emailData.subject.length > 998) {
      errors.push('Email subject too long (max 998 characters)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 📧 REAL Email Format Validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 🔄 REAL Retry Logic for Email Errors
  isRetryableEmailError(error) {
    const retryableMessages = [
      'timeout',
      'network',
      'temporarily',
      'rate limit',
      'quota',
      'busy',
      'unavailable'
    ];
    
    const nonRetryableMessages = [
      'invalid email',
      'rejected',
      'bounced',
      'spam',
      'blacklisted',
      'permanent failure'
    ];
    
    const errorMessage = error.message.toLowerCase();
    
    // Check for non-retryable errors first
    if (nonRetryableMessages.some(msg => errorMessage.includes(msg))) {
      return false;
    }
    
    // Check for retryable errors
    if (retryableMessages.some(msg => errorMessage.includes(msg))) {
      return true;
    }
    
    // Default: retry on unknown errors (might be temporary)
    return true;
  }

  // 🎨 REAL HTML Conversion for Plain Text
  convertToHTML(plainText) {
    if (!plainText) return '';
    
    // Basic plain text to HTML conversion
    let html = plainText
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      .replace(/  /g, '&nbsp;&nbsp;');
    
    // Wrap in basic HTML structure
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${html}
          </div>
        </body>
      </html>
    `;
  }

  // 📊 REAL Email Analytics Tracking
  async logEmailAnalytics(emailData, result) {
    try {
      // REAL: Log to your Supabase analytics table
      const { data, error } = await this.supabase
        .from('email_analytics')
        .insert({
          recipient_email: emailData.to,
          subject: emailData.subject,
          channel: result.channel,
          message_id: result.messageId,
          status: result.status,
          sent_at: new Date().toISOString(),
          template_used: emailData.template_id,
          body_length: emailData.body?.length || 0
        });

      if (error) {
        console.error('Failed to log email analytics:', error);
      }

      return data;
    } catch (error) {
      console.error('Error logging email analytics:', error);
    }
  }

  // 📋 REAL Template Management
  async getEmailTemplates() {
    try {
      // REAL: Fetch templates from your Supabase table
      const { data, error } = await this.supabase
        .from('communication_templates')
        .select('*')
        .eq('template_type', 'email')
        .eq('is_active', true);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  }

  // 🎭 REAL Personalization Engine
  personalizeEmailTemplate(template, customerData, orderData = null) {
    let personalizedTemplate = { ...template };
    
    // Replace customer variables
    const customerVariables = {
      '{{customer.name}}': customerData.full_name || 'Valued Customer',
      '{{customer.first_name}}': customerData.first_name || 'Customer',
      '{{customer.company}}': customerData.company_name || '',
      '{{customer.country}}': customerData.country || '',
      '{{customer.email}}': customerData.email || ''
    };
    
    // Replace template subject and body
    Object.keys(customerVariables).forEach(variable => {
      const value = customerVariables[variable];
      personalizedTemplate.subject = personalizedTemplate.subject?.replace(
        new RegExp(variable, 'g'), 
        value
      );
      personalizedTemplate.body = personalizedTemplate.body?.replace(
        new RegExp(variable, 'g'), 
        value
      );
    });
    
    // Replace order variables if available
    if (orderData) {
      const orderVariables = {
        '{{order.id}}': orderData.id || '',
        '{{order.total_amount}}': orderData.total_amount || '',
        '{{order.status}}': orderData.status || '',
        '{{order.expected_delivery}}': orderData.expected_delivery || ''
      };
      
      Object.keys(orderVariables).forEach(variable => {
        const value = orderVariables[variable];
        personalizedTemplate.subject = personalizedTemplate.subject?.replace(
          new RegExp(variable, 'g'), 
          value
        );
        personalizedTemplate.body = personalizedTemplate.body?.replace(
          new RegExp(variable, 'g'), 
          value
        );
      });
    }
    
    return personalizedTemplate;
  }

  // 📈 REAL Email Performance Tracking
  async trackEmailOpen(messageId) {
    // REAL: This would be called when tracking pixel is loaded
    try {
      const { data, error } = await this.supabase
        .from('email_analytics')
        .update({ 
          opened_at: new Date().toISOString(),
          open_count: this.supabase.raw('open_count + 1')
        })
        .eq('message_id', messageId);

      if (error) {
        console.error('Error tracking email open:', error);
      }
    } catch (error) {
      console.error('Error tracking email open:', error);
    }
  }

  // 🔍 REAL Email Bounce Handling
  async handleBouncedEmail(messageId, bounceData) {
    try {
      // REAL: Update analytics and potentially mark email as invalid
      const { data, error } = await this.supabase
        .from('email_analytics')
        .update({ 
          bounced_at: new Date().toISOString(),
          bounce_reason: bounceData.reason,
          bounce_type: bounceData.type
        })
        .eq('message_id', messageId);

      if (error) {
        console.error('Error handling bounced email:', error);
      }
    } catch (error) {
      console.error('Error handling bounced email:', error);
    }
  }

  // 🛡️ REAL Spam Check
  checkSpamScore(content) {
    const spamKeywords = [
      'buy now', 'limited time', 'act now', 'click here', 'discount', 
      'free', 'winner', 'prize', 'urgent', 'cash', 'income', 'money'
    ];
    
    let spamScore = 0;
    const lowerContent = content.toLowerCase();
    
    spamKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        spamScore += 1;
      }
    });
    
    // Check for excessive capitalization
    const capitalRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capitalRatio > 0.5) {
      spamScore += 2;
    }
    
    // Check for excessive exclamation
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      spamScore += 1;
    }
    
    return {
      score: spamScore,
      risk: spamScore >= 5 ? 'high' : spamScore >= 3 ? 'medium' : 'low',
      warnings: spamScore > 0 ? ['Content may trigger spam filters'] : []
    };
  }
}

export default EmailService;