import { headers } from "next/headers";
import { PRICING_PLANS } from "@/lib/pricing";
import { Star } from "lucide-react";
import PlanButton from "../components/PlanButton";

export default async function PlansPage() {
  const headersList = await headers();
  const currency = headersList.get("x-user-currency") || "EUR";
  
  // Customizing labels specifically to match the user's second screenshot UI
  // where the title includes free months explicitly
  
  const uiPlans = [
    { title: "باقة 3 شهور", sub: "3 شهور", duration: 3, price: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[0]?.price || 15, priceId: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[0]?.priceId || "", popular: false },
    { title: "باقة 6 شهور + شهر مجاني", sub: "7 شهور إجمالي", duration: 6, price: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[1]?.price || 25, priceId: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[1]?.priceId || "", popular: true },
    { title: "باقة سنة + 3 شهور مجانية", sub: "15 شهر إجمالي", duration: 12, price: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[2]?.price || 35, priceId: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[2]?.priceId || "", popular: false },
    { title: "باقة سنتين + 3 شهور مجانية", sub: "27 شهر إجمالي", duration: 24, price: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[3]?.price || 60, priceId: PRICING_PLANS[currency as keyof typeof PRICING_PLANS]?.[3]?.priceId || "", popular: false },
  ];

  return (
    <main className="min-h-screen bg-[#1a1d24] py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">اختر باقتك</h1>
          <p className="text-zinc-400 text-lg">جميع الباقات تتضمن كل المميزات</p>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 col on tablet (md), 4 col on desktop (lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2" dir="rtl">
          {[...uiPlans].map((plan) => (
            <div 
              key={plan.duration} 
              className={`flex flex-col p-6 md:p-8 rounded-2xl relative transition-transform hover:scale-[1.02] duration-300 ${plan.popular ? 'bg-[#222630] ring-1 ring-[#facc15] shadow-xl shadow-[#facc15]/5' : 'bg-[#222630]'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center w-full z-20">
                  <div className="bg-[#facc15] text-black px-5 py-1 rounded-full text-xs md:text-sm font-bold flex items-center gap-1 shadow-lg whitespace-nowrap">
                    <Star className="w-3 md:w-4 h-3 md:h-4 fill-black" />
                    الأكثر شهرة
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8 flex-1">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{plan.title}</h3>
                <p className="text-zinc-500 text-xs md:text-sm mb-6">{plan.sub}</p>
                
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-[#facc15] leading-none">{plan.price}</span>
                  <span className="text-xl md:text-2xl font-bold text-[#facc15]">{currency === 'EUR' ? '€' : currency}</span>
                </div>
                <p className="text-zinc-600 text-xs uppercase tracking-widest">{currency === 'EUR' ? 'Euro' : 'Currency'}</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {[
                  "9000 قناة",
                  "21,000 فيلم",
                  "8,000 مسلسل",
                  "دعم فني 24/7",
                  "سيرفرات بدون تقطيع",
                  "إمكانية الطلب"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center justify-end gap-3 text-zinc-300 text-sm">
                    <span className="text-right">{feature}</span>
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#facc15] flex-shrink-0"></div>
                  </li>
                ))}
              </ul>

              <PlanButton 
                planDuration={plan.duration} 
                price={plan.price} 
                currency={currency} 
                isPopular={plan.popular} 
                priceId={plan.priceId}
              />
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
