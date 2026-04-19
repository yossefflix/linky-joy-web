"use client";

import { useState } from "react";
import { PlusCircle, Loader2, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { addAccountAction } from "./actions";

export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    const result = await addAccountAction(formData);
    
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: "تمت إضافة الحساب بنجاح!", type: "success" });
      // clear the form roughly
      (document.getElementById("addForm") as HTMLFormElement).reset();
    }
    
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center">
          <Database className="text-brand-500 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">إضافة حسابات</h1>
          <p className="text-zinc-400">نظام إدخال الحسابات يدوياً إلى قاعدة بيانات Supabase</p>
        </div>
      </div>

      <div className="bg-[#18181b] rounded-2xl border border-white/10 p-8 shadow-xl">
        <form id="addForm" action={handleSubmit} className="space-y-6">
          
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">اسم المستخدم (Username)</label>
              <input 
                type="text" 
                name="username" 
                required
                dir="ltr"
                className="w-full bg-[#27272a]/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 font-mono focus:outline-none" 
                placeholder="Ex: user1234"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">كلمة المرور (Password)</label>
              <input 
                type="text" 
                name="password" 
                required
                dir="ltr"
                className="w-full bg-[#27272a]/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 font-mono focus:outline-none" 
                placeholder="Ex: pass5678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">الباقة المخصصة للحساب</label>
            <select 
              name="plan_duration"
              className="w-full bg-[#27272a]/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="3">باقة 3 أشهر</option>
              <option value="6">باقة 6 أشهر (+ شهر مجاني)</option>
              <option value="12">باقة 12 شهر (+ 3 شهور مجانية)</option>
              <option value="24">باقة 24 شهر (+ 3 شهور مجانية)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlusCircle className="w-5 h-5" /> إضافة الحساب للقاعدة</>}
          </button>
          
        </form>
      </div>

    </div>
  );
}
