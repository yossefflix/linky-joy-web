import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_PASSWORD = 'Yossef123$'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { action, username, password, accountId, adminPassword } = await req.json()

    if (action === 'list') {
      // Get accounts with linked subscription phone
      const { data: accounts, error } = await supabase
        .from('streaming_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get subscriptions to map phone numbers
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('streaming_account_id, phone, email, plan')
        .not('streaming_account_id', 'is', null)

      const subMap: Record<string, { phone: string | null; email: string; plan: string }> = {}
      for (const s of (subs || [])) {
        if (s.streaming_account_id) {
          subMap[s.streaming_account_id] = { phone: s.phone, email: s.email, plan: s.plan }
        }
      }

      const enriched = (accounts || []).map(a => ({
        ...a,
        assigned_phone: subMap[a.id]?.phone || null,
        assigned_email: subMap[a.id]?.email || null,
        assigned_plan: subMap[a.id]?.plan || null,
      }))

      return new Response(JSON.stringify({ accounts: enriched }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // All other actions require admin password
    if (adminPassword !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'add') {
      const { error } = await supabase
        .from('streaming_accounts')
        .insert({ username, password, is_used: false })

      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('streaming_accounts')
        .delete()
        .eq('id', accountId)
        .eq('is_used', false)

      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
