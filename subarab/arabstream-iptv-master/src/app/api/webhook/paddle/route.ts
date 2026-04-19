import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function sendWhatsAppWASender(phone: string, username: string, pass: string, plan: string) {
  const url = 'https://www.wasenderapi.com/api/send-message'; 
  const apiKey = process.env.WASENDER_API_KEY;
  
  // Clean phone number - ensure it has country code and starts with +
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone;
  }

  const message = `لمعرفة كيفية تشغيل الاشتراك :
https://arabstream.store/setup-guide

تفضل بيانات الحساب الخاص بك 🍿

اليوزر 👈 ${username}

الباسورد 👈 ${pass}

شكراً لاختيارك خدمتنا! 🎬`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ 
          to: cleanPhone, 
          text: message 
        })
      });
      
      if (res.ok) return true;
    } catch (e) {
      console.warn(`WASender attempt ${attempt} failed:`, e);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Paddle Webhook] Received event:", body.event_type);

    // 1. Verify Event Type
    // Paddle v2 uses event_type (e.g., transaction.completed or transaction.paid)
    if (body.event_type !== "transaction.completed" && body.event_type !== "transaction.paid") {
      return NextResponse.json({ message: "Event ignored" });
    }

    const transaction = body.data;
    const customData = transaction.custom_data || {};
    const { phone, plan } = customData;
    const transactionId = transaction.id;

    if (!phone || !plan) {
      console.error("[Paddle Webhook] Missing custom data in transaction:", transactionId);
      return NextResponse.json({ error: "Missing custom data" }, { status: 400 });
    }

    // 2. Assign Account
    const { data: accounts, error: accError } = await supabaseAdmin
      .from('iptv_accounts')
      .select('id, username, password')
      .eq('status', 'available')
      .eq('plan_duration', plan)
      .limit(1);

    if (accError || !accounts || accounts.length === 0) {
      console.error("[Paddle Webhook] CRITICAL: No inventory matching plan", plan);
      return NextResponse.json({ error: "No inventory" }, { status: 500 });
    }

    const account = accounts[0];

    // Mark used
    await supabaseAdmin
      .from('iptv_accounts')
      .update({ status: 'used' })
      .eq('id', account.id);

    // 3. Create initial order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        paddle_transaction_id: transactionId,
        iptv_account_id: account.id,
        plan: plan.toString(),
        payment_status: 'completed',
        delivery_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Send Credentials via WASender
    await supabaseAdmin.from('orders').update({ delivery_status: 'retrying' }).eq('id', order.id);
    const delivered = await sendWhatsAppWASender(phone, account.username, account.password, plan.toString());

    const finalStatus = delivered ? 'delivered' : 'failed';
    
    // 5. Update ultimate delivery status
    await supabaseAdmin
      .from('orders')
      .update({ delivery_status: finalStatus })
      .eq('id', order.id);

    return NextResponse.json({ success: true, delivered });

  } catch (err: any) {
    console.error("[Paddle Webhook] Processing error:", err);
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}
