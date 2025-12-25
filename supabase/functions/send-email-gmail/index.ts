// supabase/functions/send-email-gmail/index.js

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const GMAIL_USER = Deno.env.get('GMAIL_USER')
const GMAIL_PASS = Deno.env.get('GMAIL_PASS')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || GMAIL_USER

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { to, subject, body, html_body } = await req.json()

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: GMAIL_USER,
          password: GMAIL_PASS,
        },
      },
    })

    await client.send({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      content: body,
      html: html_body
    })

    await client.close()

    return new Response(JSON.stringify({
      success: true,
      messageId: `gmail-${Date.now()}`,
      status: 'sent'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})