// src/config/automationConfig.js
export default {
  MAX_ACTION_RETRY: Number(process.env.MAX_ACTION_RETRY || 3),
  ACTION_RETRY_BACKOFF_MS: Number(process.env.ACTION_RETRY_BACKOFF_MS || 2000),
  DEFAULT_FROM_EMAIL: process.env.DEFAULT_FROM_EMAIL || 'trust@saffronemporial.com',
  ADMIN_ROLES: ['admin','superadmin','owner'],
  WORKER_POLL_MS: Number(process.env.WORKER_POLL_MS || 2000),
  FUNCTION_TIMEOUT_MS: Number(process.env.FUNCTION_TIMEOUT_MS || 15000)
};
