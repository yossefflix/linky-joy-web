import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  created_at: string;
  streaming_accounts: {
    username: string;
    password: string;
  } | null;
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, plan, status, created_at, streaming_accounts(username, password)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data as any);
    } catch (err) {
      console.error('Error loading subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('تم النسخ!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(220,25%,10%)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[hsl(45,100%,50%)] animate-spin" />
      </div>
    );
  }

  if (!subscription || !subscription.streaming_accounts) {
    return (
      <div className="min-h-screen bg-[hsl(220,25%,10%)] text-white flex items-center justify-center px-4" dir="rtl">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-2xl font-display font-bold">لا يوجد اشتراك نشط</h1>
          <p className="text-[hsl(220,15%,60%)]">لم يتم العثور على اشتراك نشط لحسابك</p>
          <a
            href="/offers"
            className="inline-block px-6 py-3 rounded-xl bg-[hsl(45,100%,50%)] text-[hsl(220,25%,10%)] font-bold hover:bg-[hsl(45,100%,55%)] transition-colors"
          >
            تصفح الباقات
          </a>
        </div>
      </div>
    );
  }

  const { streaming_accounts: account } = subscription;

  return (
    <div className="min-h-screen bg-[hsl(220,25%,10%)] text-white flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(142,72%,42%,0.15)] flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[hsl(142,72%,42%)]" />
          </div>
          <h1 className="text-3xl font-display font-bold">🎬 تم تفعيل اشتراكك بنجاح</h1>
          <p className="text-[hsl(220,15%,60%)]">
            الباقة: <span className="text-[hsl(45,100%,50%)] font-medium">{subscription.plan}</span>
          </p>
        </div>

        {/* Credentials Card */}
        <div className="bg-[hsl(220,25%,14%)] rounded-2xl border border-[hsl(220,20%,22%)] p-6 space-y-5">
          <h2 className="text-lg font-bold text-center">تفضل بيانات الحساب الخاص بك 🍿</h2>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm text-[hsl(220,15%,55%)]">اليوزر 👈</label>
            <div className="flex items-center gap-2 bg-[hsl(220,25%,18%)] rounded-xl p-3 border border-[hsl(220,20%,28%)]">
              <span className="flex-1 font-mono text-lg" dir="ltr">{account.username}</span>
              <button
                onClick={() => copyToClipboard(account.username, 'username')}
                className="p-2 rounded-lg hover:bg-[hsl(220,25%,25%)] transition-colors"
              >
                {copiedField === 'username' ? (
                  <CheckCircle className="w-5 h-5 text-[hsl(142,72%,42%)]" />
                ) : (
                  <Copy className="w-5 h-5 text-[hsl(220,15%,55%)]" />
                )}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm text-[hsl(220,15%,55%)]">الباسورد 👈</label>
            <div className="flex items-center gap-2 bg-[hsl(220,25%,18%)] rounded-xl p-3 border border-[hsl(220,20%,28%)]">
              <span className="flex-1 font-mono text-lg" dir="ltr">{account.password}</span>
              <button
                onClick={() => copyToClipboard(account.password, 'password')}
                className="p-2 rounded-lg hover:bg-[hsl(220,25%,25%)] transition-colors"
              >
                {copiedField === 'password' ? (
                  <CheckCircle className="w-5 h-5 text-[hsl(142,72%,42%)]" />
                ) : (
                  <Copy className="w-5 h-5 text-[hsl(220,15%,55%)]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Setup Guide Link */}
        <a
          href="https://arabstream.store/setup-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[hsl(45,100%,50%)] text-[hsl(220,25%,10%)] font-bold hover:bg-[hsl(45,100%,55%)] transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          📺 شرح تشغيل الاشتراك
        </a>
      </div>
    </div>
  );
}
