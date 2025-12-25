// src/services/edgeCommunicationService.js
// Lightweight wrapper to call server-side Edge endpoints (bulk send).
// Expected env var: VITE_API_BASE_URL (e.g., https://your-edge-host/api)
// Endpoints used (POST):
//  - {BASE}/bulk/send-email      payload: { recipients: [...], subject, message, initiated_by }
//  - {BASE}/bulk/send-whatsapp   payload: { recipients: [...], message, initiated_by }
//  - {BASE}/health               GET -> returns { ok: true } when edge is healthy
//
// This file preserves exported function names so existing app code continues to work.
// Improvements: robust request parsing, timeouts, retries, normalized errors, input validation.

import {
  sendBulkEmail as sendBulkEmailDirect,
  sendBulkWhatsApp as sendBulkWhatsAppDirect,
  refineWithGemini,
  checkEdgeHealth as directCheckEdgeHealth,
} from './directCommunicationService';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const DEFAULT_TIMEOUT = 20000;
const LONG_TIMEOUT = 120000;
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const MAX_RETRIES = Number(import.meta.env.VITE_EDGE_MAX_RETRIES || 2);

/**
 * requestJson: fetch wrapper with timeout, JSON parsing and normalized errors.
 */
async function requestJson(url, method = 'POST', body = null, timeoutMs = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    clearTimeout(id);

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      json = { raw: text };
    }

    if (!res.ok) {
      const err = new Error(json?.error || json?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.response = json;
      throw err;
    }

    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error('Request timed out');
      e.code = 'ETIMEDOUT';
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

/**
 * requestWithRetries: retry wrapper for transient errors with exponential backoff + jitter.
 */
async function requestWithRetries(url, method, body, timeoutMs = DEFAULT_TIMEOUT, maxRetries = MAX_RETRIES) {
  let attempt = 0;
  let lastErr;
  while (attempt <= maxRetries) {
    try {
      return await requestJson(url, method, body, timeoutMs);
    } catch (err) {
      lastErr = err;
      const status = err.status || null;
      const isRetryable = !status || RETRYABLE_STATUS.has(status) || err.code === 'ETIMEDOUT';
      if (!isRetryable || attempt === maxRetries) break;
      const backoff = Math.min(1000 * 2 ** attempt, 10000);
      const jitter = Math.floor(Math.random() * 300);
      await new Promise(r => setTimeout(r, backoff + jitter));
      attempt++;
    }
  }
  throw lastErr;
}

/**
 * pingEdge
 * - Returns { ok: true, info } when edge health endpoint responds positively.
 * - Returns { ok: false, reason } on failure or when BASE not configured.
 */
export async function pingEdge() {
  if (!BASE) return { ok: false, reason: 'VITE_API_BASE_URL not set' };
  const url = `${BASE}/health`;
  try {
    const json = await requestWithRetries(url, 'GET', null, 5000, 1);
    return { ok: !!(json && (json.ok === true || json.status === 'ok')), info: json };
  } catch (err) {
    return { ok: false, reason: err.message || String(err) };
  }
}

/**
 * sendBulkEmailEdge
 * - Preserved signature: sendBulkEmailEdge(params)
 * - Validates input, calls edge endpoint, returns normalized object or throws.
 */
export async function sendBulkEmailEdge(params) {
  if (!BASE) throw new Error('Edge base URL not configured (VITE_API_BASE_URL).');

  if (!params || typeof params !== 'object') throw new Error('Invalid parameters for sendBulkEmailEdge');
  const { recipients = [], subject = '', message = '', initiated_by = null } = params;
  if (!Array.isArray(recipients)) throw new Error('recipients must be an array');
  if (recipients.length === 0) throw new Error('No recipients provided');

  const url = `${BASE}/bulk/send-email`;
  const payload = { recipients, subject, message, initiated_by };

  try {
    const json = await requestWithRetries(url, 'POST', payload, LONG_TIMEOUT, MAX_RETRIES);
    // Normalize response for callers: try to map common fields
    return {
      status: 'ok',
      provider: 'edge',
      data: json,
      // convenience fields some callers expect
      sent: json?.sent ?? json?.successCount ?? json?.success ?? null,
      successCount: json?.successCount ?? json?.sent ?? null,
      failedRecipients: json?.failedRecipients ?? json?.failed ?? []
    };
  } catch (err) {
    const e = new Error(`Edge sendBulkEmail failed: ${err.message || err}`);
    e.original = err;
    throw e;
  }
}

/**
 * sendBulkWhatsAppEdge
 * - Preserved signature: sendBulkWhatsAppEdge({ recipients = [], message = '', initiated_by = null })
 */
export async function sendBulkWhatsAppEdge({ recipients = [], message = '', initiated_by = null }) {
  if (!BASE) throw new Error('Edge base URL not configured (VITE_API_BASE_URL).');
  if (!Array.isArray(recipients)) throw new Error('recipients must be an array');
  if (recipients.length === 0) throw new Error('No recipients provided');

  const url = `${BASE}/bulk/send-whatsapp`;
  const payload = { recipients, message, initiated_by };

  try {
    const json = await requestWithRetries(url, 'POST', payload, LONG_TIMEOUT, MAX_RETRIES);
    return {
      status: 'ok',
      provider: 'edge',
      data: json,
      sent: json?.sent ?? json?.successCount ?? json?.success ?? null,
      successCount: json?.successCount ?? json?.sent ?? null,
      failedRecipients: json?.failedRecipients ?? json?.failed ?? []
    };
  } catch (err) {
    const e = new Error(`Edge sendBulkWhatsApp failed: ${err.message || err}`);
    e.original = err;
    throw e;
  }
}

/**
 * checkEdgeHealth
 * - Backwards compatible: tries BASE health first, falls back to directCheckEdgeHealth.
 */
export async function checkEdgeHealth() {
  if (BASE) {
    try {
      const res = await pingEdge();
      return res;
    } catch (err) {
      console.error('pingEdge failed inside checkEdgeHealth:', err);
    }
  }
  try {
    return await directCheckEdgeHealth();
  } catch (err) {
    return { ok: false, reason: err.message || String(err) };
  }
}

/**
 * refineWithGeminiEdge
 * - Preserved signature: refineWithGeminiEdge(payload)
 * - Currently delegates to direct refineWithGemini; can be routed through edge later.
 */
export async function refineWithGeminiEdge(payload) {
  try {
    return await refineWithGemini(payload);
  } catch (err) {
    const e = new Error(`refineWithGeminiEdge failed: ${err.message || err}`);
    e.original = err;
    throw e;
  }
}

const EdgeCommunicationService = {
  checkEdgeHealth,
  sendBulkEmailEdge,
  sendBulkWhatsAppEdge,
  refineWithGeminiEdge,
  pingEdge,
  sendBulkEmailDirect,
  sendBulkWhatsAppDirect,
};

export default EdgeCommunicationService;
