"use client";

import { useState } from "react";
import { Loader2, Phone } from "lucide-react";

export default function CheckoutButton({ plan, price, currency, title }: { plan: number, price: number, currency: string, title: string }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      setError("الرجاء إدخال رقم هاتف صحيح مع الرمز الدولي");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify Inventory
      const res = await fetch(`/api/inventory/check?plan=${plan}`);
      const data = await res.json();

      if (!res.ok || data.availableCount === 0) {
        setError("عذراً، الباقة غير متوفرة حالياً. الرجاء المحاولة لاحقاً أو التواصل مع الدعم.");
        setLoading(false);
        return;
      }

      // 2. Initialize Paddle (Abstracted for Serverless deployment)
      // window.Paddle.Checkout.open({
      //   items: [{ priceId: `paddle_price_${plan}`, quantity: 1 }],
      //   customData: { phone: phoneNumber, plan: plan }
      // });
      
      // Simulating a redirect to /success since Paddle SDK isn't fully mocked
      alert("Inventory OK. Initializing Paddle...");
      setTimeout(() => {
        window.location.href = `/success?tx_id=test_tx_123&plan=${plan}`;
      }, 1000);

    } catch (err) {
      setError("حدث خطأ في النظام. الرجاء المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      {error && <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded-md border border-red-400/20">{error}</div>}
      
      <div className="relative">
        <Phone className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="tel" 
          placeholder="رقم الواتساب الخاص بك (مع الرمز)" 
          className="w-full bg-black/40 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-right"
          dir="ltr"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] flex justify-center items-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `اشترك بـ ${price} ${currency}`}
      </button>
    </div>
  );
}
