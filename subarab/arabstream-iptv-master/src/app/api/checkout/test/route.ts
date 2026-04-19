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
      console.log(`[WhatsApp] Sending message to ${cleanPhone} (Attempt ${attempt})...`);
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
      
      const resData = await res.json();
      console.log(`[WhatsApp] API Response:`, resData);

      if (res.ok) return true;
    } catch (e) {
      console.warn(`[WhatsApp] Attempt ${attempt} failed:`, e);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const { phone, plan } = await request.json();

    if (!phone || !plan) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const mock_tx_id = `TEST_TX_${Date.now()}`;

    // 1. Get or Create Customer
    let customerId;
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone_number', phone)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: custError } = await supabaseAdmin
        .from('customers')
        .insert({ phone_number: phone })
        .select('id')
        .single();
        
      if (custError) throw custError;
      customerId = newCustomer.id;
    }

    // 2. Assign Account
    const { data: accounts, error: accError } = await supabaseAdmin
      .from('iptv_accounts')
      .select('id, username, password')
      .eq('status', 'available')
      .eq('plan_duration', plan)
      .limit(1);

    if (accError || !accounts || accounts.length === 0) {
      return NextResponse.json({ error: "لا يوجد مخزون كافي لهذه الباقة للتجربة" }, { status: 400 });
    }

    const account = accounts[0];

    // Mark used
    await supabaseAdmin
      .from('iptv_accounts')
      .update({ status: 'used', assigned_to: customerId, used_at: new Date().toISOString() })
      .eq('id', account.id);

    // 3. Create mock order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        paddle_transaction_id: mock_tx_id,
        customer_id: customerId,
        iptv_account_id: account.id,
        plan: plan.toString(),
        amount_paid: 0, // Mock amount
        currency: 'USD',
        payment_status: 'completed',
        delivery_status: 'pending' 
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // We do NOT block the frontend callback here natively in serverless,
    // but Next.js Route Handlers require us to either await or use edge waitUntil.
    // For testing, we can await it directly to see if delivery triggers.
    
    // 4. Send Credentials via WASender
    await supabaseAdmin.from('orders').update({ delivery_status: 'retrying' }).eq('id', order.id);
    const delivered = await sendWhatsAppWASender(phone, account.username, account.password, plan.toString());

    const finalStatus = delivered ? 'delivered' : 'failed';
    
    // 5. Update ultimate delivery status
    await supabaseAdmin
      .from('orders')
      .update({ delivery_status: finalStatus })
      .eq('id', order.id);

    return NextResponse.json({ success: true, tx_id: mock_tx_id });

  } catch (err: any) {
    console.error("Test Webhook error:", err);
    return NextResponse.json({ error: `يوجد خطأ: ${err.message || JSON.stringify(err)}` }, { status: 500 });
  }
}
