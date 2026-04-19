import Image from "next/image";
import { headers } from "next/headers";
import { CheckCircle2, Sparkles, XCircle, Shield } from "lucide-react";
import PhoneForm from "./components/PhoneForm";

export default async function Home() {
  const headersList = await headers();
  const userCountry = headersList.get("x-user-country") || "EG";

  return (
    <main className="min-h-screen bg-[#1a1d24] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center z-10">
        
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-[#facc15] rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_-10px_#facc15]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
          اشترك الآن في عرب ستريم 🎬
        </h1>
        <p className="text-zinc-400 mb-10 text-center text-lg">
          أدخل رقم هاتفك وسيتم إرسال بيانات اشتراكك على الواتساب
        </p>

        {/* Phone Form Card */}
        <PhoneForm initialCountry={userCountry} />

        {/* Features list exactly like screenshot 1 */}
        <div className="mt-12 space-y-4 w-full max-w-md mx-auto px-2">
          <div className="flex items-center justify-end gap-3 group">
            <span className="text-zinc-300 text-sm md:text-base">سيتم إرسال بيانات اشتراكك على الواتساب</span>
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          </div>
          <div className="flex items-center justify-end gap-3 group">
            <span className="text-zinc-300 text-sm md:text-base">محتوى حصري وبدون إعلانات</span>
            <Sparkles className="w-5 h-5 text-[#facc15] flex-shrink-0" />
          </div>
          <div className="flex items-center justify-end gap-3 group">
            <span className="text-zinc-300 text-sm md:text-base">إلغاء مجاني في أي وقت</span>
            <XCircle className="w-5 h-5 text-[#facc15] flex-shrink-0" />
          </div>
          <div className="flex items-center justify-end gap-3 group">
            <span className="text-zinc-300 text-sm md:text-base">بيانات آمنة وموثوقة</span>
            <Shield className="w-5 h-5 text-[#facc15] flex-shrink-0" />
          </div>
        </div>

      </div>
    </main>
  );
}
