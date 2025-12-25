// src/services/communicationService.js
import { supabase } from '../supabaseClient';
import { sendEmailViaEmailJS } from './emailService';
import { sendWhatsAppViaProxy, sendSmsViaProxy } from './twilioServiceClient';

/**
 * recipients: [{ profile_id, client_id, email, phone, full_name }]
 * opts: { subject, message, sendEmail, sendWhatsApp, sendSms, current_profile_id }
 */
export async function sendBulkCommunications(recipients = [], opts = {}) {
  const results = [];
  for (const r of recipients) {
    const entry = { recipient: r, emailSent: false, waSent: false, smsSent: false, errors: [] };

    // Email
    if (opts.sendEmail) {
      try {
        if (!r.email) throw new Error('no email');
        await sendEmailViaEmailJS({ to_email: r.email, to_name: r.full_name || r.email, subject: opts.subject, message: opts.message });
        entry.emailSent = true;
        await logCommunication({ client_id: r.client_id, profile_id: r.profile_id, channel: 'email', subject: opts.subject, message: opts.message, status: 'sent', sent_by: opts.current_profile_id });
      } catch (err) {
        entry.errors.push(`email: ${err.message}`);
        await logCommunication({ client_id: r.client_id, profile_id: r.profile_id, channel: 'email', subject: opts.subject, message: opts.message, status: 'failed', provider_response: { error: String(err) }, sent_by: opts.current_profile_id });
      }
    }

    // WhatsApp
    if (opts.sendWhatsApp) {
      try {
        if (!r.phone) throw new Error('no phone');
        await sendWhatsAppViaProxy(r.phone, opts.message);
        entry.waSent = true;
        await logCommunication({ client_id: r.client_id, profile_id: r.profile_id, channel: 'whatsapp', message: opts.message, status: 'sent', sent_by: opts.current_profile_id });
      } catch (err) {
        entry.errors.push(`whatsapp: ${err.message}`);
        await logCommunication({ client_id: r.client_id, profile_id: r.profile_id, channel: 'whatsapp', message: opts.message, status: 'failed', provider_response: { error: String(err) }, sent_by: opts.current_profile_id });
      }
    }

    // SMS
    if (opts.sendSms) {
      try {
        if (!r.phone) throw new Error('no phone');
        await sendSmsViaProxy(r.phone, opts.message);
        entry.smsSent = true;
        await logCommunication({ client_id: r.client_id, profile_id: r.profile_id, channel: 'sms', message: opts.message, status: 'sent', sent_by: opts.current_profile_id });
      } catch (err) {
        entry.errors.push(`sms: ${err.message}`);
        await logCommunication({ client_id: r.client_id, profile_id: r.profile_id, channel: 'sms', message: opts.message, status: 'failed', provider_response: { error: String(err) }, sent_by: opts.current_profile_id });
      }
    }

    results.push(entry);
  }

  return results;
}

/** log communication to supabase table "communication_logs" */
async function logCommunication({ client_id = null, profile_id = null, channel = 'email', subject = null, message = null, status = 'queued', provider_response = {}, provider_message_id = null, sent_by = null }) {
  try {
    const row = {
      client_id,
      profile_id,
      channel,
      subject,
      message,
      provider_response,
      status,
      provider_message_id,
      sent_by,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('communication_logs').insert([row]).select().single();
    if (error) throw error;
    return { ok: true, row: data };
  } catch (err) {
    console.error('[logCommunication] supabase insert error', err);
    return { ok: false, error: String(err) };
  }
}
