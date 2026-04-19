"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

export default function PhoneForm({ initialCountry = "EG" }: { initialCountry?: string }) {
  const defaultCountry = COUNTRIES.find(c => c.code === initialCountry) || COUNTRIES[0];
  const [country, setCountry] = useState(defaultCountry);
  const [phone, setPhone] = useState(defaultCountry.dial + " ");
  const router = useRouter();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = COUNTRIES.find(x => x.code === e.target.value) || COUNTRIES[0];
    setCountry(c);
    setPhone(c.dial + " ");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, plus sign and spaces
    const val = e.target.value.replace(/[^\d\+\s]/g, '');
    setPhone(val);

    // Try to auto-detect country from user typing
    const cleanVal = val.replace(/\s+/g, '');
    if (cleanVal.length >= 2) {
      // Find longest matching dial code
      const matched = [...COUNTRIES]
        .sort((a, b) => b.dial.length - a.dial.length)
        .find(c => cleanVal.startsWith(c.dial));
        
      if (matched && matched.code !== country.code) {
        setCountry(matched);
      }
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length < 7) {
      alert("الرجاء إدخال رقم صحيح");
      return;
    }

    setLoading(true);

    try {
      // Send welcome message in background
      fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      }).catch(err => console.error("Welcome message failed:", err));

      // Proceed to plans
      router.push(`/plans?phone=${encodeURIComponent(cleanPhone)}`);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#222630] border border-white/5 p-8 rounded-3xl w-full max-w-md mx-auto shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="text-zinc-300 text-sm mb-2 text-right">رقم الهاتف (واتساب)</label>
        
        <div className="flex gap-2 relative">
          <input
            type="tel"
            placeholder="+20 123 456 7890"
            value={phone}
            onChange={handlePhoneChange}
            className="flex-1 w-full bg-[#1a1d24] border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-brand-500 text-left font-mono text-lg tracking-wider"
            dir="ltr"
            required
          />
          <div className="relative shrink-0">
            <select
              className="appearance-none bg-[#1a1d24] border border-white/5 rounded-xl w-[90px] px-3 py-4 text-white focus:outline-none focus:border-brand-500 h-full font-mono cursor-pointer"
              value={country.code}
              onChange={handleSelect}
              dir="ltr"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        
        <p className="text-zinc-500 text-xs mt-3 mb-8 text-right">
          المفتاح المختار: {country.dial} ({country.name})
        </p>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-4 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 text-lg disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>اشترك الآن <Rocket className="w-5 h-5" /></>
          )}
        </button>
      </form>
    </div>
  );
}
