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
- SUPABASE_URL = https://<your-project>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY = <your service_role_key>
- EMAILJS_SERVICE_ID = <your_emailjs_service_id>
- EMAILJS_TEMPLATE_ID = <your_emailjs_template_id>
- EMAILJS_USER_ID = <your_emailjs_user_id>
- TWILIO_ACCOUNT_SID = <AC...>
- TWILIO_AUTH_TOKEN = <your_auth_token>
- TWILIO_WHATSAPP_NUMBER = +1415... (your Twilio WhatsApp number)

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

Also (client-side, for testing only):
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
(VITE_TWILIO... can be left empty if you rely on Edge sends)

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


npx supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bHFpaHduZnRibWt4dXlzZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzY4MjAsImV4cCI6MjA3MTQ1MjgyMH0.s6YLFNTUJowCdQnxMwdwpvoC-4PNx80DnVG2Tw0Yk_c

npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bHFpaHduZnRibWt4dXlzZ2tvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg3NjgyMCwiZXhwIjoyMDcxNDUyODIwfQ.4axqKUmHk1KCgyu8iVEC9za0GXvr_AQGCXZQWK_76HA

npx supabase secrets set SUPABASE_URL=https://nylqihwnftbmkxuysgko.supabase.co



npx supabase secrets set RESEND_API_KEY=re_8yh6GjmC_Pdr72hxW1UUXtW5L4AFbHNwy
npx supabase secrets set GEMINI_API_KEY=AIzaSyBXmsoQQdrPiLvmoyhQx-nQlfpFqztN06w

#for subscriber features

npx supabase secrets set ADMIN_EMAIL=trust@saffronemporial.com

npx supabase secrets set VITE_SMTP_HOST="smtp.gmail.com"

npx supabase secrets set VITE_SMTP_PORT="587"

npx supabase secrets set VITE_SMTP_USER="saffronemporial@gmail.com"

npx supabase secrets set VITE_SMTP_PASS="guphhjvfclsbiazx"

npx supabase secrets set VITE_APP_URL=http://localhost:3000

npx supabase secrets set VITE_ADMIN_EMAIL=trust@saffronemporial.com

npx supabase secrets set VITE_ENABLE_AI=true

npx supabase secrets set VITE_ENABLE_TRACKING=true

npx supabase secrets set VITE_ENABLE_SCHEDULING=true

curl -X POST https://nylqihwnftbmkxuysgko.supabase.co/functions/v1/generate-ai-draft \
  - "Content-Type: application/json" \
  - "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bHFpaHduZnRibWt4dXlzZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzY4MjAsImV4cCI6MjA3MTQ1MjgyMH0.s6YLFNTUJowCdQnxMwdwpvoC-4PNx80DnVG2Tw0Yk_c" \
  - '{"prompt": "Weekly export update"}'