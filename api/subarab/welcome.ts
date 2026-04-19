/**
 * POST /api/subarab/welcome
 * Sends a welcome WhatsApp message via WASender API.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_lib/supabase';

async function sendWelcomeWhatsApp(phone: string): Promise<boolean> {
  const url = 'https://www.wasenderapi.com/api/send-message';
  const apiKey = process.env.SUBARAB_WASENDER_API_KEY;

  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone;
  }

  const message = `مرحباً بك في عرب ستريم! 🎬

تم إنشاء حسابك بنجاح ✅

يمكنك الآن:

✓ اختيار خطة اشتراك
✓ الاستمتاع بآلاف الساعات من المحتوى العربي

اضغط هنا للبدء: https://home.arabstream.store/

إذا واجهت أي مشكلة، تواصل معنا فوراً 📞`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ to: cleanPhone, text: message }),
    });
    return res.ok;
  } catch (e) {
    console.error('[SubArab Welcome WhatsApp] Error:', e);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'Phone required' });

    const success = await sendWelcomeWhatsApp(phone);
    return res.status(200).json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
