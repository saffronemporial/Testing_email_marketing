import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clientId = null } = await req.json()

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let clientsToProcess = []

    if (clientId) {
      // Process single client
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (error) throw error
      if (client) clientsToProcess = [client]
    } else {
      // Process all active clients
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')

      if (error) throw error
      clientsToProcess = clients || []
    }

    const results = []

    for (const client of clientsToProcess) {
      try {
        const intelligenceData = await calculateClientIntelligence(supabase, client)
        results.push({
          clientId: client.id,
          success: true,
          data: intelligenceData
        })
      } catch (error) {
        results.push({
          clientId: client.id,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Client intelligence batch processing error:', error)

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function calculateClientIntelligence(supabase, client) {
  // Get client orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('client_id', client.id)

  if (ordersError) throw ordersError

  // Get communications
  const { data: communications, error: commError } = await supabase
    .from('client_communications')
    .select('*')
    .eq('client_id', client.id)

  if (commError) throw commError

  // Calculate scores (same logic as frontend)
  const scores = {
    orderFrequency: calculateOrderFrequencyScore(orders),
    orderValue: calculateOrderValueScore(orders),
    paymentBehavior: calculatePaymentScore([]), // You might need payment data
    engagement: calculateEngagementScore(communications),
    loyalty: calculateLoyaltyScore(client, orders),
    growth: calculateGrowthScore(orders)
  }

  const weights = {
    orderFrequency: 0.25,
    orderValue: 0.20,
    paymentBehavior: 0.20,
    engagement: 0.15,
    loyalty: 0.10,
    growth: 0.10
  }

  const totalScore = Object.keys(scores).reduce((total, key) => {
    return total + (scores[key] * weights[key])
  }, 0)

  const totalOrders = orders?.length || 0
  const totalValue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0

  const intelligenceData = {
    client_id: client.id,
    health_score: Math.round(totalScore),
    lifetime_value: totalValue,
    order_frequency: totalOrders,
    average_order_value: averageOrderValue,
    client_tier: calculateClientTier(totalScore, totalValue),
    calculated_at: new Date().toISOString(),
    breakdown: scores
  }

  // Upsert intelligence data
  const { error: upsertError } = await supabase
    .from('client_intelligence')
    .upsert(intelligenceData, { 
      onConflict: 'client_id'
    })

  if (upsertError) throw upsertError

  return intelligenceData
}

// Scoring functions (same as frontend)
function calculateOrderFrequencyScore(orders) {
  if (!orders || orders.length === 0) return 0
  // ... same implementation as frontend
  return 50 // simplified for example
}

function calculateOrderValueScore(orders) {
  if (!orders || orders.length === 0) return 0
  // ... same implementation as frontend
  return 50 // simplified for example
}

function calculatePaymentScore(payments) {
  return 50 // simplified
}

function calculateEngagementScore(communications) {
  if (!communications || communications.length === 0) return 0
  // ... same implementation as frontend
  return 50 // simplified
}

function calculateLoyaltyScore(client, orders) {
  // ... same implementation as frontend
  return 50 // simplified
}

function calculateGrowthScore(orders) {
  // ... same implementation as frontend
  return 50 // simplified
}

function calculateClientTier(score, lifetimeValue) {
  if (score >= 80 && lifetimeValue > 1000000) return 'vip'
  if (score >= 60 && lifetimeValue > 500000) return 'premium'
  if (score >= 40) return 'regular'
  return 'new'
}