"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertCircle, Copy, HelpCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("tx_id");
  
  const [status, setStatus] = useState<"pending" | "retrying" | "delivered" | "failed">("pending");
  const [credentials, setCredentials] = useState<{username: string, password: string} | null>(null);

  useEffect(() => {
    if (!txId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/status?txId=${txId}`);
        const data = await res.json();
        
        if (data.status) setStatus(data.status);
        if (data.credentials) {
          setCredentials(data.credentials);
          clearInterval(interval);
        }
        
        if (data.status === "delivered") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [txId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-background to-background -z-10"></div>
      
      <div className="glass max-w-lg w-full p-8 md:p-12 rounded-3xl text-center shadow-2xl">
        
        {status === "pending" || status === "retrying" ? (
          <div className="flex flex-col items-center animate-fade-in" dir="rtl">
            <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">جاري استخراج حسابك 🎬</h1>
            <p className="text-zinc-400 text-lg mb-2">لحظات قليلة لتجهيز اشتراكك...</p>
            {status === "retrying" && (
              <p className="text-yellow-500 text-sm mt-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> 
                نحاول إرسال رسالة الواتساب الآن...
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fade-in w-full" dir="rtl">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${status === 'delivered' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {status === 'delivered' ? <CheckCircle2 className="w-10 h-10 text-green-500" /> : <AlertCircle className="w-10 h-10 text-red-500" />}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">تم الاشتراك بنجاح 🎉</h1>
            
            {status === 'delivered' ? (
              <p className="text-green-400 text-base mb-6">تم إرسال بياناتك إلى الواتساب بنجاح ✅</p>
            ) : (
              <p className="text-red-400 text-base mb-6">تعذر الإرسال للواتساب، لكن حسابك جاهز هنا 👇</p>
            )}
            
            {credentials && (
              <div className="bg-[#222630] p-4 md:p-6 rounded-2xl border border-[#facc15]/30 w-full mb-8 shadow-lg shadow-[#facc15]/10">
                <h3 className="text-base md:text-lg text-white font-bold mb-2">تفضل بيانات الحساب الخاص بك 🍿</h3>
                <p className="text-zinc-400 text-xs md:text-sm mb-6">ملحوظة: الاشتراك يعمل على جهاز واحد فقط</p>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[#facc15] font-bold text-base md:text-lg text-right">اليوزر 👈</span>
                    <div className="font-mono text-lg md:text-2xl text-white break-all bg-[#1a1d24] p-3 md:p-4 rounded-xl border border-white/10 flex justify-between items-center gap-2" dir="ltr">
                      <span className="truncate">{credentials.username}</span>
                      <button onClick={() => navigator.clipboard.writeText(credentials.username)} className="shrink-0 p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Copy className="w-4 h-4 md:w-5 md:h-5 text-zinc-300" /></button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <span className="text-[#facc15] font-bold text-base md:text-lg text-right">الباسورد 👈</span>
                    <div className="font-mono text-lg md:text-2xl text-white break-all bg-[#1a1d24] p-3 md:p-4 rounded-xl border border-white/10 flex justify-between items-center gap-2" dir="ltr">
                      <span className="truncate">{credentials.password}</span>
                      <button onClick={() => navigator.clipboard.writeText(credentials.password)} className="shrink-0 p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Copy className="w-4 h-4 md:w-5 md:h-5 text-zinc-300" /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-zinc-300 mb-6 text-center text-lg w-full">شكراً لاختيارك خدمتنا! 🎬</p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <a href="https://arabstream.store/setup-guide" target="_blank" rel="noreferrer" className="flex-1 bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-4 px-4 rounded-xl transition-all text-center text-lg">
                شرح تشغيل الاشتراك
              </a>
              <a href="https://wa.me/12723751812" target="_blank" rel="noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-4 rounded-xl transition-all flex justify-center items-center gap-2 text-lg">
                <HelpCircle className="w-6 h-6" /> الدعم الفني
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
