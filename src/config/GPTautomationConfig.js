// src/config/automationConfig.js
export const automationConfig = {
  // Retry settings
  retry: {
    maxRetries: 3,
    initialDelay: 2000, // 2 seconds
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2
  },

  // Rate limiting
  rateLimiting: {
    whatsapp: {
      maxConcurrent: 10,
      delayBetweenMessages: 1000 // 1 second
    },
    email: {
      maxConcurrent: 5,
      delayBetweenEmails: 2000 // 2 seconds
    },
    bulk: {
      batchSize: 50,
      delayBetweenBatches: 5000 // 5 seconds
    }
  },

  // Timeouts
  timeouts: {
    apiCall: 30000, // 30 seconds
    webhook: 10000, // 10 seconds
    database: 15000 // 15 seconds
  },

  // Delivery status tracking
  statusTracking: {
    checkInterval: 60000, // 1 minute
    maxCheckAttempts: 10,
    expirationHours: 72 // 3 days
  },

  // Notification thresholds
  notifications: {
    failureRate: 0.1, // 10%
    consecutiveFailures: 3,
    queueBacklog: 1000
  },

  // Cleanup settings
  cleanup: {
    logRetentionDays: 90,
    runIntervalHours: 24
  }
};

export const channelConfig = {
  whatsapp: {
    enabled: true,
    maxMessageLength: 4096,
    supportedMedia: ['image', 'document', 'audio', 'video'],
    rateLimit: 1 // messages per second
  },
  email: {
    enabled: true,
    maxSubjectLength: 78,
    maxBodyLength: 10000,
    supportedAttachments: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    rateLimit: 10 // emails per minute
  },
  sms: {
    enabled: false, // Disabled by default
    maxMessageLength: 160,
    rateLimit: 1 // messages per second
  }
};

export default automationConfig;