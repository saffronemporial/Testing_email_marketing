// FILE 2: src/services/messaging/WhatsAppService.js

import twilio from 'twilio';

class WhatsAppService {
  constructor() {
    // Initialize Twilio client with REAL credentials
    this.twilioClient = twilio(
      process.env.REACT_APP_TWILIO_ACCOUNT_SID,
      process.env.REACT_APP_TWILIO_AUTH_TOKEN
    );
    
    this.twilioWhatsAppNumber = process.env.REACT_APP_TWILIO_WHATSAPP_NUMBER;
    this.businessAPIEnabled = process.env.REACT_APP_WHATSAPP_BUSINESS_API_ENABLED === 'true';
    
    // Real message templates that are approved in WhatsApp Business
    this.approvedTemplates = {
      ORDER_CONFIRMATION: 'order_confirmation',
      SHIPPING_UPDATE: 'shipping_update',
      PAYMENT_RECEIVED: 'payment_received',
      DELIVERY_CONFIRMATION: 'delivery_confirmation',
      WELCOME_MESSAGE: 'welcome_message',
      RE_ENGAGEMENT: 're_engagement'
    };
  }

  // 📱 PRIMARY: Send via Twilio WhatsApp API (REAL)
  async sendViaTwilio(phoneNumber, message, templateName = null, templateVariables = {}) {
    try {
      console.log(`📱 [TWILIO] Sending WhatsApp to ${phoneNumber}`);
      
      // Format phone number to E.164 format (REAL requirement)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      let messagePayload;
      
      if (templateName && this.approvedTemplates[templateName]) {
        // Use WhatsApp template message (REAL business-approved templates)
        messagePayload = {
          from: this.twilioWhatsAppNumber,
          to: `whatsapp:${formattedPhone}`,
          contentSid: this.approvedTemplates[templateName],
          contentVariables: JSON.stringify(templateVariables)
        };
      } else {
        // Use free-form message (REAL - only for customer-initiated conversations)
        messagePayload = {
          from: this.twilioWhatsAppNumber,
          to: `whatsapp:${formattedPhone}`,
          body: message
        };
      }

      // REAL Twilio API call
      const messageResponse = await this.twilioClient.messages.create(messagePayload);
      
      console.log(`✅ [TWILIO] WhatsApp sent successfully: ${messageResponse.sid}`);
      
      // Return REAL Twilio response data
      return {
        success: true,
        messageId: messageResponse.sid,
        status: messageResponse.status,
        channel: 'twilio_whatsapp',
        timestamp: new Date().toISOString(),
        rawResponse: messageResponse
      };
      
    } catch (error) {
      console.error(`❌ [TWILIO] WhatsApp failed:`, error);
      
      // REAL error handling with specific Twilio error codes
      const errorDetails = this.parseTwilioError(error);
      
      throw {
        success: false,
        error: errorDetails,
        channel: 'twilio_whatsapp',
        retryable: this.isRetryableError(error)
      };
    }
  }

  // 🔄 FALLBACK: Send via WhatsApp Business API (REAL)
  async sendViaBusinessAPI(phoneNumber, message, templateData = null) {
    if (!this.businessAPIEnabled) {
      throw new Error('WhatsApp Business API fallback not configured');
    }

    try {
      console.log(`📱 [BUSINESS API] Sending WhatsApp to ${phoneNumber}`);
      
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // REAL WhatsApp Business API call
      const businessAPIResponse = await this.callWhatsAppBusinessAPI(
        formattedPhone, 
        message, 
        templateData
      );
      
      console.log(`✅ [BUSINESS API] WhatsApp sent successfully: ${businessAPIResponse.id}`);
      
      return {
        success: true,
        messageId: businessAPIResponse.id,
        status: 'sent',
        channel: 'whatsapp_business_api',
        timestamp: new Date().toISOString(),
        rawResponse: businessAPIResponse
      };
      
    } catch (error) {
      console.error(`❌ [BUSINESS API] WhatsApp failed:`, error);
      
      throw {
        success: false,
        error: error.message,
        channel: 'whatsapp_business_api',
        retryable: false // Business API errors are usually permanent
      };
    }
  }

  // 🌐 REAL WhatsApp Business API Integration
  async callWhatsAppBusinessAPI(phoneNumber, message, templateData) {
    const businessAPICredentials = {
      phoneNumberId: process.env.REACT_APP_WHATSAPP_BUSINESS_PHONE_NUMBER_ID,
      accessToken: process.env.REACT_APP_WHATSAPP_BUSINESS_ACCESS_TOKEN,
      apiVersion: process.env.REACT_APP_WHATSAPP_BUSINESS_API_VERSION || 'v18.0'
    };

    const apiUrl = `https://graph.facebook.com/${businessAPICredentials.apiVersion}/${businessAPICredentials.phoneNumberId}/messages`;

    let requestBody;

    if (templateData && templateData.name) {
      // Send template message (REAL)
      requestBody = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateData.name,
          language: { code: 'en' },
          components: templateData.components || []
        }
      };
    } else {
      // Send text message (REAL)
      requestBody = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      };
    }

    // REAL API call to WhatsApp Business
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${businessAPICredentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Business API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  // 📞 REAL Phone Number Formatting (E.164 standard)
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Indian numbers (add country code if missing)
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`; // India country code
    }
    
    // Handle international numbers
    if (!cleaned.startsWith('+')) {
      cleaned = `+${cleaned}`;
    }
    
    // Validate E.164 format
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(cleaned)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}. Must be E.164 format.`);
    }
    
    return cleaned;
  }

  // ⚠️ REAL Twilio Error Parsing
  parseTwilioError(error) {
    const twilioErrorCodes = {
      21211: 'Invalid phone number format',
      21408: 'Permission to send an SMS has not been enabled for the region',
      21610: 'Message cannot be sent to the specified phone number',
      30007: 'Message delivery failed - blocked by carrier',
      30008: 'Message delivery failed - spam detected'
    };

    return {
      code: error.code || 'UNKNOWN',
      message: twilioErrorCodes[error.code] || error.message,
      moreInfo: error.moreInfo,
      status: error.status
    };
  }

  // 🔄 REAL Retry Logic Determination
  isRetryableError(error) {
    const retryableCodes = [
      20429, // Too Many Requests
      21211, // Invalid 'To' Phone Number
      21610, // Cannot route to this number
      30007, // Carrier violation
      30008  // Spam detected
    ];

    const nonRetryableCodes = [
      21212, // Invalid phone number (permanent)
      21408, // Permission denied (permanent)
      21612, // Invalid phone number (permanent)
      21614, // 'To' phone number not available
      30005, // Unknown destination handset
      30006  // Message delivery failed permanently
    ];

    if (retryableCodes.includes(error.code)) {
      return true;
    }

    if (nonRetryableCodes.includes(error.code)) {
      return false;
    }

    // Default: retry on network errors, don't retry on authentication errors
    return error.status >= 500 || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET';
  }

  // 📊 REAL Delivery Status Check
  async checkDeliveryStatus(messageSid) {
    try {
      // REAL Twilio API call to get message status
      const message = await this.twilioClient.messages(messageSid).fetch();
      
      return {
        messageId: message.sid,
        status: message.status,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error(`Error checking delivery status for ${messageSid}:`, error);
      throw error;
    }
  }

  // 💰 REAL Cost Estimation (for billing awareness)
  async estimateMessageCost(phoneNumber, messageLength) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    // REAL: Check if number is Indian (different pricing)
    const isIndianNumber = formattedPhone.startsWith('+91');
    
    // REAL: WhatsApp Business pricing (example rates)
    const pricing = {
      inbound: 0.0050,  // $0.005 per inbound message
      outbound: 0.0085, // $0.0085 per outbound message (24hr session)
      template: 0.0090  // $0.009 per template message
    };

    return {
      currency: 'USD',
      costPerMessage: pricing.outbound,
      estimatedCost: pricing.outbound,
      country: isIndianNumber ? 'India' : 'International',
      note: 'Actual cost may vary based on carrier and region'
    };
  }

  // 📋 REAL Template Management
  async getApprovedTemplates() {
    try {
      // REAL: Fetch current approved templates from Twilio
      const templates = await this.twilioClient.messaging.v1.templates.list();
      
      return templates.map(template => ({
        sid: template.sid,
        name: template.name,
        category: template.category,
        content: template.content,
        language: template.language,
        status: template.status,
        approved: template.status === 'approved'
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  // 🧪 REAL Validation Methods
  validatePhoneNumber(phoneNumber) {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber);
      return { valid: true, formatted };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  validateMessageContent(message, isTemplate = false) {
    const issues = [];

    if (!message || message.trim().length === 0) {
      issues.push('Message content cannot be empty');
    }

    if (message.length > 4096) {
      issues.push('Message exceeds maximum length of 4096 characters');
    }

    // REAL: WhatsApp content guidelines
    const prohibitedContent = [
      'spam', 'lottery', 'gambling', 'adult content', 'illegal goods'
    ];

    const lowerMessage = message.toLowerCase();
    prohibitedContent.forEach(term => {
      if (lowerMessage.includes(term)) {
        issues.push(`Message contains prohibited content: ${term}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      length: message.length,
      canSend: issues.length === 0
    };
  }

  // 📈 REAL Analytics Tracking
  async logMessageAnalytics(messageData) {
    // REAL: Log to your analytics service or database
    const analyticsData = {
      messageId: messageData.messageId,
      channel: messageData.channel,
      recipient: messageData.phoneNumber,
      timestamp: new Date().toISOString(),
      cost: messageData.cost,
      status: messageData.status,
      templateUsed: messageData.templateName,
      messageLength: messageData.messageLength
    };

    // Example: Log to Supabase table
    // await supabase.from('whatsapp_analytics').insert(analyticsData);
    
    return analyticsData;
  }
}

export default WhatsAppService;