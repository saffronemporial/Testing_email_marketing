// supabase/functions/whatsapp-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the incoming form data from Twilio
    const formData = await req.formData()
    const messageSid = formData.get('MessageSid') as string
    const messageStatus = formData.get('MessageStatus') as string
    const to = formData.get('To') as string
    const from = formData.get('From') as string
    const errorCode = formData.get('ErrorCode') as string
    const errorMessage = formData.get('ErrorMessage') as string

    console.log('📱 WhatsApp Webhook Received:', {
      messageSid,
      messageStatus,
      to,
      from,
      errorCode,
      errorMessage
    })

    // Validate required fields
    if (!messageSid || !messageStatus) {
      throw new Error('Missing required fields: MessageSid or MessageStatus')
    }

    // Map Twilio status to our status system
    const statusMap: { [key: string]: string } = {
      'queued': 'queued',
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed',
      'undelivered': 'failed'
    }

    const mappedStatus = statusMap[messageStatus] || messageStatus

    // Prepare update data
    const updateData: any = {
      status: mappedStatus,
      updated_at: new Date().toISOString()
    }

    // Set timestamp based on status
    if (mappedStatus === 'sent') {
      updateData.sent_at = new Date().toISOString()
    } else if (mappedStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    } else if (mappedStatus === 'read') {
      updateData.read_at = new Date().toISOString()
    } else if (mappedStatus === 'failed') {
      updateData.error_message = errorMessage || `Twilio error: ${errorCode}`
    }

    // Add delivery data for debugging
    updateData.delivery_data = {
      twilio_message_sid: messageSid,
      twilio_status: messageStatus,
      to: to,
      from: from,
      error_code: errorCode,
      error_message: errorMessage,
      received_at: new Date().toISOString()
    }

    // Update the automation_logs table
    const { data, error } = await supabaseClient
      .from('automation_logs')
      .update(updateData)
      .eq('external_message_id', messageSid)
      .select()

    if (error) {
      console.error('❌ Database update error:', error)
      throw error
    }

    if (data && data.length === 0) {
      console.warn('⚠️ No log entry found for message SID:', messageSid)
    } else {
      console.log('✅ Status updated successfully:', {
        messageSid,
        oldStatus: data?.[0]?.status,
        newStatus: mappedStatus
      })
    }

    // Return success response to Twilio
    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: data?.length || 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Webhook error:', error)

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})