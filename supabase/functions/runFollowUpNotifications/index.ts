// supabase/functions/runFollowUpNotifications/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");
const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY");

// Helper: compute next due from recurrence (simple)
function computeNextDue(recurrence: any, currentDueIso: string | null): string | null {
  if (!recurrence || !recurrence.freq) return null;
  const current = currentDueIso ? new Date(currentDueIso) : new Date();
  const interval = recurrence.interval ? Number(recurrence.interval) : 1;
  let next = new Date(current);
  if (recurrence.freq === 'daily') next.setDate(next.getDate() + interval);
  else if (recurrence.freq === 'weekly') next.setDate(next.getDate() + interval * 7);
  else if (recurrence.freq === 'monthly') next.setMonth(next.getMonth() + interval);
  else return null;
  if (recurrence.until) {
    const until = new Date(recurrence.until);
    if (next > until) return null;
  }
  return next.toISOString();
}

// Twilio send helper
async function sendWhatsAppTextServer(toPhone: string, message: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    return { ok: false, error: 'Twilio config missing' };
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const body = new URLSearchParams();
  body.append('From', TWILIO_WHATSAPP_NUMBER);
  body.append('To', `whatsapp:${toPhone}`);
  body.append('Body', message);
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  try {
    const resp = await fetch(url, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    const json = await resp.json();
    return { ok: resp.ok, json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// EmailJS server-side send
async function sendEmailJSServer(toEmail: string, subject: string, message: string) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return { ok: false, error: 'EmailJS config missing' };
  }
  try {
    const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: { to_email: toEmail, subject, message }
      })
    });
    const json = await resp.json();
    return { ok: resp.ok, json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

serve(async (req) => {
  try {
    const nowIso = new Date().toISOString();
    // Query due follow_ups
    const { data: dueItems, error } = await supabase
      .from('follow_ups')
      .select('*')
      .in('status', ['pending','snoozed'])
      .lte('due_at', nowIso)
      .limit(200);
    if (error) throw error;

    const processed = [];

    for (const fu of dueItems || []) {
      // get profile
      const { data: profile, error: profErr } = await supabase.from('profiles').select('id, full_name, email, phone, opt_out').eq('id', fu.profile_id).single();
      if (profErr || !profile) {
        await supabase.from('follow_up_logs').insert([{ follow_up_id: fu.id, action: 'profile_missing', message: String(profErr || 'profile not found'), created_at: new Date().toISOString() }]);
        continue;
      }

      if (profile.opt_out) {
        await supabase.from('follow_up_logs').insert([{ follow_up_id: fu.id, action: 'skipped_opt_out', message: 'Profile opted out', created_at: new Date().toISOString() }]);
        continue;
      }

      const plainMessage = `Reminder: ${fu.title}\n\n${fu.notes || ''}\n\n(Assigned: ${fu.assigned_to || 'Unassigned'})`;
      const subject = `Follow-up: ${fu.title}`;

      // For each notify channel attempt send
      const channels = Array.isArray(fu.notify_channels) ? fu.notify_channels : ['email','whatsapp'];
      for (const ch of channels) {
        try {
          if (ch === 'whatsapp') {
            const phone = profile.phone || fu.metadata?.phone;
            if (!phone) {
              await supabase.from('follow_up_logs').insert([{ follow_up_id: fu.id, action: 'skipped_no_phone', message: 'No phone for whatsapp' }]);
            } else {
              const cleaned = phone.replace(/\D/g, '');
              const sendResp = await sendWhatsAppTextServer(cleaned, plainMessage);
              // write to communication_logs
              await supabase.from('communication_logs').insert([{
                client_id: fu.client_id ?? null,
                profile_id: profile.id,
                channel: 'whatsapp',
                template_id: null,
                subject: null,
                message: plainMessage,
                provider_response: sendResp.json ?? { error: sendResp.error ?? null },
                status: sendResp.ok ? 'sent' : 'failed',
                provider_message_id: sendResp.json?.sid ?? null,
                sent_by: fu.assigned_to ?? fu.created_by ?? null,
                sent_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                follow_up_id: fu.id
              }]);
              // write to client_communications
              await supabase.from('client_communications').insert([{
                client_id: fu.client_id ?? null,
                communication_type: 'whatsapp',
                subject: null,
                message: plainMessage,
                media_url: null,
                sent_at: new Date().toISOString(),
                sent_by: fu.assigned_to ?? fu.created_by ?? null,
                status: sendResp.ok ? 'sent' : 'failed',
                template_used: null,
                ai_enhanced: false,
                response_data: sendResp.json ?? { error: sendResp.error ?? null },
                created_at: new Date().toISOString(),
                follow_up_id: fu.id
              }]);
            }
          } else if (ch === 'email') {
            const to = profile.email || fu.metadata?.email;
            if (!to) {
              await supabase.from('follow_up_logs').insert([{ follow_up_id: fu.id, action: 'skipped_no_email', message: 'No email for send' }]);
            } else {
              const sendResp = await sendEmailJSServer(to, subject, plainMessage);
              await supabase.from('communication_logs').insert([{
                client_id: fu.client_id ?? null,
                profile_id: profile.id,
                channel: 'email',
                template_id: null,
                subject,
                message: plainMessage,
                provider_response: sendResp.json ?? { error: sendResp.error ?? null },
                status: sendResp.ok ? 'sent' : 'failed',
                provider_message_id: null,
                sent_by: fu.assigned_to ?? fu.created_by ?? null,
                sent_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                follow_up_id: fu.id
              }]);
              await supabase.from('client_communications').insert([{
                client_id: fu.client_id ?? null,
                communication_type: 'email',
                subject,
                message: plainMessage,
                media_url: null,
                sent_at: new Date().toISOString(),
                sent_by: fu.assigned_to ?? fu.created_by ?? null,
                status: sendResp.ok ? 'sent' : 'failed',
                template_used: null,
                ai_enhanced: false,
                response_data: sendResp.json ?? { error: sendResp.error ?? null },
                created_at: new Date().toISOString(),
                follow_up_id: fu.id
              }]);
            }
          } else if (ch === 'push' || ch === 'in-app') {
            // placeholder - implement push logic if needed
            await supabase.from('follow_up_logs').insert([{ follow_up_id: fu.id, action: 'notified_inapp', message: 'In-app placeholder', created_at: new Date().toISOString() }]);
          }
        } catch (sendErr) {
          await supabase.from('follow_up_logs').insert([{ follow_up_id: fu.id, action: 'notify_error', message: String(sendErr), provider_response: { error: String(sendErr) }, created_at: new Date().toISOString() }]);
        }
      } // end channels loop

      // Update follow_up: last_notified_at, retry_count, next due or done
      const nextDue = fu.recurrence ? computeNextDue(fu.recurrence, fu.due_at) : null;
      const updates: any = { last_notified_at: new Date().toISOString(), retry_count: (fu.retry_count || 0) + 1 };
      if (nextDue) { updates.due_at = nextDue; updates.status = 'pending'; }
      else { updates.status = 'done'; }
      await supabase.from('follow_ups').update(updates).eq('id', fu.id);

      await supabase.from('follow_up_logs').insert([{ follow_up_id: fu.id, action: 'notified_complete', message: 'Notification executed', metadata: { next_due: nextDue }, created_at: new Date().toISOString() }]);

      processed.push({ follow_up_id: fu.id, next_due: nextDue });
    } // end for

    return new Response(JSON.stringify({ ok: true, processed: processed.length, results: processed }), { status: 200 });
  } catch (err) {
    console.error('runFollowUpNotifications error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
// To test locally, run: npx supabase functions serve runFollowUpNotifications --project-ref your-project-id