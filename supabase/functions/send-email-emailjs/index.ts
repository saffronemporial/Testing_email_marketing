// supabase/functions/send-email-emailjs/index.js

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID')
const EMAILJS_TEMPLATE_ID = Deno.env.get('EMAILJS_TEMPLATE_ID')
const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY')

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { to, subject, body, template_id, template_data } = await req.json()

    const emailjsData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: template_id || EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: to,
        subject: subject,
        message: body,
        ...template_data
      }
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailjsData)
    })

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.statusText}`)
    }

    const result = await response.json()

    return new Response(JSON.stringify({
      success: true,
      messageId: `emailjs-${Date.now()}`,
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