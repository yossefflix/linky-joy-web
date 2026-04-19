const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WASENDER_URL = 'https://www.wasenderapi.com/api/send-message'

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
    const WASENDER_TOKEN = Deno.env.get('WASENDER_API_TOKEN')
    if (!WASENDER_TOKEN) {
      throw new Error('WASENDER_API_TOKEN not configured')
    }

    const { phone, type, username, password } = await req.json()

    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Clean phone number - ensure it has country code
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone
    }

    let message = ''

    if (type === 'welcome') {
      message = `مرحباً بك في عرب ستريم! 🎬

تم إنشاء حسابك بنجاح ✅

يمكنك الآن:

✓ اختيار خطة اشتراك
✓ الاستمتاع بآلاف الساعات من المحتوى العربي

اضغط هنا للبدء: https://www.sniplink.site/offers

إذا واجهت أي مشكلة، تواصل معنا فوراً 📞`
    } else if (type === 'credentials') {
      message = `لمعرفة كيفية تشغيل الاشتراك :
https://arabstream.store/setup-guide

تفضل بيانات الحساب الخاص بك 🍿

اليوزر 👈 ${username}

الباسورد 👈 ${password}

شكراً لاختيارك خدمتنا! 🎬`
    } else {
      return new Response(JSON.stringify({ error: 'Invalid message type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[WhatsApp] Sending ${type} message to ${cleanPhone}`)

    const response = await fetch(WASENDER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WASENDER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: cleanPhone,
        text: message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`[WhatsApp] API error:`, data)
      return new Response(JSON.stringify({ error: 'Failed to send WhatsApp message', details: data }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[WhatsApp] Message sent successfully to ${cleanPhone}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[WhatsApp] Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
