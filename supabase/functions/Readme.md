# Deploy README — Supabase Functions + Frontend Integration

## Prerequisites
- Node + npm (for your frontend dev). Supabase CLI installed: https://supabase.com/docs/guides/cli
- supabase CLI: `npm install -g supabase` or use Homebrew on macOS
- Supabase project with DB + tables already present (you said you have profiles, clients, follow_ups, communication_logs, client_communications)

## Edge Functions to deploy
Functions to deploy:
- send_email
- send_whatsapp
- health
- retries/retry (optional if you already have it)

### 1) Login & link your project
1. `supabase login` (open browser, login)
2. `supabase link --project-ref <PROJECT_REF>` (if you want to link local folder)

### 2) Set function env variables in Supabase Dashboard
Go to Supabase Dashboard → Functions → Settings → Environment variables:
Set the following (server secrets):


### 3) Deploy functions
From repository root where `supabase/` directory exists:
- `supabase functions deploy send_email`
- `supabase functions deploy send_whatsapp`
- `supabase functions deploy health`
- `supabase functions deploy retries/retry` (if present)

### 4) Test health
After deploy, Supabase shows a function URL like:
`https://<project>.functions.supabase.co/health`
Open it in browser — should return JSON `{ ok: true, dbOk: true, ... }`.

### 5) Update frontend env
In your Vite `.env` (development) file set:
VITE_API_BASE_URL=https://<project>.functions.supabase.co



**Important**: In production do not put Twilio or EmailJS secrets in client `.env`. Use Edge functions.

### 6) Frontend integration
The `directCommunicationService.js` checks `VITE_API_BASE_URL` and will attempt to call Edge endpoints:
- POST `${base}/send_email` with payload `{ recipients, subject, message, template_id, initiated_by }`
- POST `${base}/send_whatsapp` with `{ recipients, message, initiated_by }`

When Edge is healthy it will delegate sends to the serverless functions and log results directly in DB.

### 7) Testing flow
1. Create a test profile in Supabase with phone and email.
2. On frontend, select client(s) and use BulkFollowUpEditor to create follow-ups (this will write to follow_ups).
3. Use the Bulk Send UI (or call directCommunicationService) to send a test email/whatsapp. Confirm results in `communication_logs` table.

### 8) Troubleshooting
- If Edge returns 401/403: check Service Role key in function envs.
- If Twilio returns 400: inspect `communication_logs.provider_response` row for Twilio error message (invalid phone format or sandbox join needed).
- If EmailJS returns 422: check template parameter names; update template_params in send_email function to match your template.

---

If you want I can also prepare a small test page that triggers a 3-recipient send (dry-run) so you can test after deploy. Tell me and I’ll paste that as the next small batch.

