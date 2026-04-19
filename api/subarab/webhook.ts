/**
 * POST /api/subarab/webhook
 * Receives Paddle payment events, assigns an IPTV account,
 * creates an order, and sends credentials via WASender WhatsApp.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubarabSupabase, applyCors } from './_lib/supabase';

async function sendWhatsAppCredentials(
  phone: string,
  username: string,
  password: string,
  plan: string
): Promise<boolean> {
  const url = 'https://www.wasenderapi.com/api/send-message';
  const apiKey = process.env.SUBARAB_WASENDER_API_KEY;

  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone;
  }

  const message = `لمعرفة كيفية تشغيل الاشتراك :
https://arabstream.store/setup-guide

تفضل بيانات الحساب الخاص بك 🍿

اليوزر 👈 ${username}

الباسورد 👈 ${password}

شكراً لاختيارك خدمتنا! 🎬`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ to: cleanPhone, text: message }),
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn(`[SubArab Webhook] WASender attempt ${attempt} failed:`, e);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    console.log('[SubArab Webhook] Received event:', body?.event_type);

    // 1. Verify Event Type
    if (body?.event_type !== 'transaction.completed' && body?.event_type !== 'transaction.paid') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const transaction = body.data;
    const customData = transaction.custom_data || {};
    const { phone, plan } = customData;
    const transactionId = transaction.id;

    if (!phone || !plan) {
      console.error('[SubArab Webhook] Missing custom_data for tx:', transactionId);
      return res.status(400).json({ error: 'Missing custom_data (phone or plan)' });
    }

    const supabase = getSubarabSupabase();

    // 2. Find an available account for this plan duration
    const { data: accounts, error: accError } = await supabase
      .from('iptv_accounts')
      .select('id, username, password')
      .eq('status', 'available')
      .eq('plan_duration', plan)
      .limit(1);

    if (accError || !accounts || accounts.length === 0) {
      console.error('[SubArab Webhook] No inventory for plan:', plan);
      return res.status(500).json({ error: 'No inventory available' });
    }

    const account = accounts[0];

    // 3. Mark account as used
    await supabase.from('iptv_accounts').update({ status: 'used' }).eq('id', account.id);

    // 4. Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        paddle_transaction_id: transactionId,
        iptv_account_id: account.id,
        plan: plan.toString(),
        payment_status: 'completed',
        delivery_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. Send credentials via WhatsApp
    await supabase.from('orders').update({ delivery_status: 'retrying' }).eq('id', order.id);
    const delivered = await sendWhatsAppCredentials(phone, account.username, account.password, plan.toString());

    // 6. Update final delivery status
    const finalStatus = delivered ? 'delivered' : 'failed';
    await supabase.from('orders').update({ delivery_status: finalStatus }).eq('id', order.id);

    return res.status(200).json({ success: true, delivered });
  } catch (err: any) {
    console.error('[SubArab Webhook] Processing error:', err);
    return res.status(500).json({ error: 'Server Error', details: err.message });
  }
}
