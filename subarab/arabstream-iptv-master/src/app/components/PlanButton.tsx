"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePaddle } from "@/hooks/usePaddle";

export default function PlanButton({ 
  planDuration, 
  price, 
  currency, 
  isPopular,
  priceId
}: { 
  planDuration: number, 
  price: number, 
  currency: string, 
  isPopular?: boolean,
  priceId: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  
  const [loading, setLoading] = useState(false);

  const { openCheckout } = usePaddle((data: any) => {
    // This runs when checkout is completed successfully
    const transactionId = data.transaction_id || data.id;
    router.push(`/success?tx_id=${transactionId}&plan=${planDuration}`);
  });

  const handleCheckout = async () => {
    if (!phone) {
      alert("الرجاء العودة وإدخال رقم الهاتف أولاً");
      window.location.href = "/";
      return;
    }

    setLoading(true);

    try {
      // 1. Verify Inventory
      const res = await fetch(`/api/inventory/check?plan=${planDuration}`);
      const data = await res.json();

      if (!res.ok || data.availableCount === 0) {
        alert("عذراً، الباقة منتهية في الوقت الحالي. الرجاء المحاولة لاحقاً.");
        setLoading(false);
        return;
      }

      // 2. Open Actual Paddle Checkout
      openCheckout(priceId, { 
        phone: phone, 
        plan: planDuration 
      });
      
      setLoading(false);

    } catch (err) {
      alert("خطأ في النظام. الرجاء المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  if (isPopular) {
    return (
      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-4 px-4 rounded-xl transition-all flex justify-center items-center h-14 mt-6"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "اختر الباقة"}
      </button>
    );
  }

  return (
    <button 
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-[#2a2f3a] hover:bg-[#343a46] border border-white/10 text-white font-bold py-4 px-4 rounded-xl transition-all flex justify-center items-center h-14 mt-6"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "اختر الباقة"}
    </button>
  );
}
