import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WASENDER_URL = 'https://www.wasenderapi.com/api/send-message'

async function sendWhatsApp(phone: string, username: string, password: string) {
  const WASENDER_TOKEN = Deno.env.get('WASENDER_API_TOKEN')
  if (!WASENDER_TOKEN) {
    console.error('[WhatsApp] WASENDER_API_TOKEN not configured')
    return
  }

  const message = `لمعرفة كيفية تشغيل الاشتراك :
https://arabstream.store/setup-guide

تفضل بيانات الحساب الخاص بك 🍿

اليوزر 👈 ${username}

الباسورد 👈 ${password}

شكراً لاختيارك خدمتنا! 🎬`

  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone
  }

  try {
    const response = await fetch(WASENDER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WASENDER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: cleanPhone, text: message }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('[WhatsApp] Send failed:', data)
    } else {
      console.log(`[WhatsApp] Credentials sent to ${cleanPhone}`)
    }
  } catch (err) {
    console.error('[WhatsApp] Error sending:', err)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const event = await req.json()
    console.log('[Paddle Webhook] Event:', event.event_type)

    if (event.event_type === 'transaction.completed') {
      const customerEmail = event.data?.customer?.email
      const customerPhone = event.data?.custom_data?.phone
      const transactionId = event.data?.id
      const planName = event.data?.items?.[0]?.price?.name || 'Unknown Plan'

      if (!customerEmail && !customerPhone) {
        console.error('[Paddle] No customer email or phone in event')
        return new Response(JSON.stringify({ error: 'No customer identifier' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log(`[Paddle] Processing payment for: ${customerEmail || customerPhone}, plan: ${planName}`)

      // Find user by email if available
      let userId: string | null = null
      if (customerEmail) {
        const { data: userData } = await supabase.auth.admin.listUsers()
        const user = userData?.users?.find(u => u.email === customerEmail)
        userId = user?.id || null
      }

      // Get an available streaming account
      const { data: account, error: accountError } = await supabase
        .from('streaming_accounts')
        .select('*')
        .eq('is_used', false)
        .limit(1)
        .single()

      if (accountError || !account) {
        console.error('[Paddle] No available streaming accounts!')
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId || '00000000-0000-0000-0000-000000000000',
            email: customerEmail || customerPhone || 'unknown',
            phone: customerPhone || null,
            plan: planName,
            paddle_transaction_id: transactionId,
            status: 'active',
          })

        if (subError) console.error('[Paddle] Sub insert error:', subError)
        return new Response(JSON.stringify({ received: true, warning: 'No accounts available' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Mark account as used
      const { error: updateError } = await supabase
        .from('streaming_accounts')
        .update({ is_used: true, assigned_to: userId, assigned_at: new Date().toISOString() })
        .eq('id', account.id)

      if (updateError) console.error('[Paddle] Account update error:', updateError)

      // Create subscription with linked account
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          email: customerEmail || customerPhone || 'unknown',
          phone: customerPhone || null,
          plan: planName,
          paddle_transaction_id: transactionId,
          status: 'active',
          streaming_account_id: account.id,
        })

      if (subError) console.error('[Paddle] Sub insert error:', subError)

      console.log(`[Paddle] Success! Assigned account ${account.username} to ${customerEmail || customerPhone}`)

      // Send WhatsApp credentials if phone is available
      if (customerPhone) {
        await sendWhatsApp(customerPhone, account.username, account.password)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[Paddle Webhook] Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
