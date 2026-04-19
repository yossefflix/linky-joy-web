import { NextResponse } from "next/server";

async function sendWelcomeWhatsApp(phone: string) {
  const url = 'https://www.wasenderapi.com/api/send-message'; 
  const apiKey = process.env.WASENDER_API_KEY;
  
  // Clean phone number
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
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        to: cleanPhone,
        text: message 
      })
    });
    return res.ok;
  } catch (e) {
    console.error("[WhatsApp Welcome] Error:", e);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const success = await sendWelcomeWhatsApp(phone);
    return NextResponse.json({ success });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
