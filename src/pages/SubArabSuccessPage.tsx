import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle, Copy, HelpCircle, ExternalLink } from 'lucide-react';

interface Credentials {
  username: string;
  password: string;
}

type OrderStatus = 'pending' | 'retrying' | 'delivered' | 'failed';

function SuccessContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txId = searchParams.get('tx_id');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Redirect to gate if no tx_id
  useEffect(() => {
    if (!txId) {
      navigate('/subarab');
    }
  }, [txId, navigate]);

  // Poll for order status every 3 seconds
  useEffect(() => {
    if (!txId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/subarab/order-status?txId=${txId}`);
        const data = await res.json();
        if (data.status) setStatus(data.status as OrderStatus);
        if (data.credentials) {
          setCredentials(data.credentials);
          clearInterval(interval);
        }
        if (data.status === 'delivered' || data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('[SubArab Success] Polling error:', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [txId]);

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback — select text
    }
  }, []);

  const isPending = status === 'pending' || status === 'retrying';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      dir="rtl"
      style={{ background: 'hsl(220,25%,10%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: isPending ? 'hsl(45,100%,50%)' : status === 'delivered' ? 'hsl(142,72%,42%)' : 'hsl(0,72%,51%)' }}
        />
      </div>

      <div
        className="relative max-w-lg w-full rounded-3xl p-8 md:p-12 text-center shadow-2xl border z-10"
        style={{ background: 'hsl(220,25%,14%)', borderColor: 'hsl(220,20%,22%)' }}
      >
        {isPending ? (
          /* ── Pending / Retrying state ── */
          <div className="flex flex-col items-center animate-fade-in space-y-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(45,100%,50%,0.15)' }}
            >
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'hsl(45,100%,50%)' }} />
            </div>
            <h1 className="text-3xl font-bold text-white">جاري استخراج حسابك 🎬</h1>
            <p className="text-lg" style={{ color: 'hsl(220,15%,60%)' }}>
              لحظات قليلة لتجهيز اشتراكك...
            </p>
            {status === 'retrying' && (
              <p className="text-sm flex items-center gap-2" style={{ color: 'hsl(45,100%,60%)' }}>
                <AlertCircle className="w-4 h-4" />
                نحاول إرسال رسالة الواتساب الآن...
              </p>
            )}
          </div>
        ) : (
          /* ── Delivered / Failed state ── */
          <div className="flex flex-col items-center animate-fade-in w-full space-y-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: status === 'delivered'
                  ? 'hsl(142,72%,42%,0.15)'
                  : 'hsl(0,72%,51%,0.15)',
              }}
            >
              {status === 'delivered' ? (
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-500" />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2">تم الاشتراك بنجاح 🎉</h1>
              <p className="text-base" style={{ color: status === 'delivered' ? 'hsl(142,72%,55%)' : 'hsl(0,72%,60%)' }}>
                {status === 'delivered'
                  ? 'تم إرسال بياناتك إلى الواتساب بنجاح ✅'
                  : 'تعذر الإرسال للواتساب، لكن حسابك جاهز هنا 👇'}
              </p>
            </div>

            {/* Credentials card */}
            {credentials && (
              <div
                className="w-full rounded-2xl p-5 md:p-6 space-y-4 text-right border"
                style={{
                  background: 'hsl(220,25%,18%)',
                  borderColor: 'hsl(45,100%,50%,0.3)',
                  boxShadow: '0 0 30px hsl(45 100% 50% / 0.08)',
                }}
              >
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">تفضل بيانات الحساب الخاص بك 🍿</h2>
                  <p className="text-xs" style={{ color: 'hsl(220,15%,50%)' }}>
                    ملحوظة: الاشتراك يعمل على جهاز واحد فقط
                  </p>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <span className="text-base font-bold block" style={{ color: 'hsl(45,100%,50%)' }}>
                    اليوزر 👈
                  </span>
                  <div
                    className="flex items-center gap-2 rounded-xl p-3 md:p-4 border"
                    dir="ltr"
                    style={{ background: 'hsl(220,25%,12%)', borderColor: 'hsl(220,20%,25%)' }}
                  >
                    <span className="flex-1 font-mono text-lg md:text-xl text-white truncate">
                      {credentials.username}
                    </span>
                    <button
                      id="subarab-copy-username"
                      onClick={() => copyToClipboard(credentials.username, 'username')}
                      className="shrink-0 p-2 rounded-lg transition-colors"
                      style={{ background: 'hsl(220,25%,20%)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'hsl(220,25%,28%)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'hsl(220,25%,20%)')}
                    >
                      {copiedField === 'username' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" style={{ color: 'hsl(220,15%,55%)' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <span className="text-base font-bold block" style={{ color: 'hsl(45,100%,50%)' }}>
                    الباسورد 👈
                  </span>
                  <div
                    className="flex items-center gap-2 rounded-xl p-3 md:p-4 border"
                    dir="ltr"
                    style={{ background: 'hsl(220,25%,12%)', borderColor: 'hsl(220,20%,25%)' }}
                  >
                    <span className="flex-1 font-mono text-lg md:text-xl text-white truncate">
                      {credentials.password}
                    </span>
                    <button
                      id="subarab-copy-password"
                      onClick={() => copyToClipboard(credentials.password, 'password')}
                      className="shrink-0 p-2 rounded-lg transition-colors"
                      style={{ background: 'hsl(220,25%,20%)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'hsl(220,25%,28%)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'hsl(220,25%,20%)')}
                    >
                      {copiedField === 'password' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" style={{ color: 'hsl(220,15%,55%)' }} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-white text-lg">شكراً لاختيارك خدمتنا! 🎬</p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <a
                id="subarab-setup-guide"
                href="https://arabstream.store/setup-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors"
                style={{ background: 'hsl(45,100%,50%)', color: 'hsl(220,25%,10%)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'hsl(45,100%,55%)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'hsl(45,100%,50%)')}
              >
                <ExternalLink className="w-5 h-5" />
                📺 شرح تشغيل الاشتراك
              </a>
              <a
                id="subarab-support-btn"
                href="https://wa.me/12723751812"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 border text-white transition-colors"
                style={{ background: 'hsl(220,25%,20%)', borderColor: 'hsl(220,20%,30%)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'hsl(220,25%,26%)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'hsl(220,25%,20%)')}
              >
                <HelpCircle className="w-5 h-5" />
                الدعم الفني
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubArabSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'hsl(220,25%,10%)' }}
        >
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(45,100%,50%)' }} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
