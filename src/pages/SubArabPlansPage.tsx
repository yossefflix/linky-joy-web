import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Diamond, Loader2 } from 'lucide-react';

/* ─────────────── Pricing ─────────────── */
const PRICING_EUR = [
  { title: 'باقة 3 شهور', sub: '3 شهور', duration: 3, price: 15, priceId: 'pri_01kkt8vh213w3fj1dh2at0rjg3', popular: false },
  { title: 'باقة 6 شهور + شهر مجاني', sub: '7 شهور إجمالي', duration: 6, price: 25, priceId: 'pri_01kktcr843ncyveg2rkn6zqyzk', popular: true },
  { title: 'باقة سنة + 3 شهور مجانية', sub: '15 شهر إجمالي', duration: 12, price: 35, priceId: 'pri_01kktcsp7ryyjd8csay49jeshj', popular: false },
  { title: 'باقة سنتين + 3 شهور مجانية', sub: '27 شهر إجمالي', duration: 24, price: 60, priceId: 'pri_01kktcv7a542997m1ah58s9agv', popular: false },
];

const PRICING_SAR = [
  { title: 'باقة 3 شهور', sub: '3 شهور', duration: 3, price: 59, priceId: 'pri_01kkt8vh213w3fj1dh2at0rjg3', popular: false },
  { title: 'باقة 6 شهور + شهر مجاني', sub: '7 شهور إجمالي', duration: 6, price: 99, priceId: 'pri_01kktcr843ncyveg2rkn6zqyzk', popular: true },
  { title: 'باقة سنة + 3 شهور مجانية', sub: '15 شهر إجمالي', duration: 12, price: 139, priceId: 'pri_01kktcsp7ryyjd8csay49jeshj', popular: false },
  { title: 'باقة سنتين + 3 شهور مجانية', sub: '27 شهر إجمالي', duration: 24, price: 249, priceId: 'pri_01kktcv7a542997m1ah58s9agv', popular: false },
];

const PRICING_AED = [
  { title: 'باقة 3 شهور', sub: '3 شهور', duration: 3, price: 58, priceId: 'pri_01kkt8vh213w3fj1dh2at0rjg3', popular: false },
  { title: 'باقة 6 شهور + شهر مجاني', sub: '7 شهور إجمالي', duration: 6, price: 97, priceId: 'pri_01kktcr843ncyveg2rkn6zqyzk', popular: true },
  { title: 'باقة سنة + 3 شهور مجانية', sub: '15 شهر إجمالي', duration: 12, price: 136, priceId: 'pri_01kktcsp7ryyjd8csay49jeshj', popular: false },
  { title: 'باقة سنتين + 3 شهور مجانية', sub: '27 شهر إجمالي', duration: 24, price: 244, priceId: 'pri_01kktcv7a542997m1ah58s9agv', popular: false },
];

const CURRENCY_MAP: Record<string, string> = {
  'Asia/Riyadh': 'SAR', 'Africa/Cairo': 'EUR', 'Asia/Dubai': 'AED',
  'Asia/Kuwait': 'SAR', 'Asia/Qatar': 'EUR', 'Asia/Bahrain': 'EUR',
  'Asia/Muscat': 'EUR', 'Asia/Amman': 'EUR', 'Asia/Baghdad': 'EUR',
};

function detectCurrency(): { currency: string; symbol: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currency = CURRENCY_MAP[tz] || 'EUR';
    const symbol = currency === 'SAR' ? '﷼' : currency === 'AED' ? 'د.إ' : '€';
    return { currency, symbol };
  } catch { return { currency: 'EUR', symbol: '€' }; }
}

function getPricing(currency: string) {
  if (currency === 'SAR') return { plans: PRICING_SAR, symbol: '﷼' };
  if (currency === 'AED') return { plans: PRICING_AED, symbol: 'د.إ' };
  return { plans: PRICING_EUR, symbol: '€' };
}

/* ─────────────── Paddle types ─────────────── */
declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; eventCallback?: (e: { name: string; data?: any }) => void }) => void;
      Checkout: { open: (opts: any) => void };
    };
  }
}

const PADDLE_TOKEN = 'live_9568c0cec8d3913de9236963b39';
const FEATURES = ['9000 قناة', '21,000 فيلم', '8,000 مسلسل', 'دعم فني 24/7', 'سيرفرات بدون تقطيع', 'إمكانية الطلب'];

/* ─────────────── Component ─────────────── */
export default function SubArabPlansPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || localStorage.getItem('subarab_phone') || '';

  const [{ currency, symbol }, setCurrencyInfo] = useState({ currency: 'EUR', symbol: '€' });
  const [paddleReady, setPaddleReady] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const detected = detectCurrency();
    setCurrencyInfo(detected);
  }, []);

  // Load Paddle once
  useEffect(() => {
    if (initialized.current || window.Paddle) {
      setPaddleReady(true);
      return;
    }
    initialized.current = true;
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      window.Paddle?.Initialize({
        token: PADDLE_TOKEN,
        eventCallback: (event) => {
          if (event.name === 'checkout.completed') {
            const txId = event.data?.transaction_id || event.data?.id;
            navigate(`/subarab/success?tx_id=${txId}`);
          }
        },
      });
      setPaddleReady(true);
    };
    document.head.appendChild(script);
  }, [navigate]);

  const handleCheckout = useCallback(async (priceId: string, duration: number) => {
    if (!phone) {
      alert('الرجاء العودة وإدخال رقم الهاتف أولاً');
      navigate('/subarab');
      return;
    }
    if (!window.Paddle) {
      alert('جاري تحميل نظام الدفع، يرجى الانتظار لحظة');
      return;
    }

    setLoadingPlan(duration);
    try {
      const res = await fetch(`/api/subarab/inventory-check?plan=${duration}`);
      const data = await res.json();
      if (!res.ok || data.availableCount === 0) {
        alert('عذراً، الباقة منتهية حالياً. الرجاء المحاولة لاحقاً أو التواصل مع الدعم.');
        setLoadingPlan(null);
        return;
      }
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { phone, plan: duration },
        settings: { displayMode: 'overlay', theme: 'dark', locale: 'ar' },
      });
    } catch {
      alert('خطأ في النظام. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoadingPlan(null);
    }
  }, [phone, navigate]);

  const { plans } = getPricing(currency);

  return (
    <div
      className="min-h-screen py-20 px-4"
      dir="rtl"
      style={{ background: 'hsl(220,25%,10%)' }}
    >
      {/* Header */}
      <div className="text-center mb-16 space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-white">اختر باقتك</h1>
        <p className="text-lg" style={{ color: 'hsl(220,15%,60%)' }}>جميع الباقات تتضمن كل المميزات</p>
      </div>

      {/* Cards */}
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.duration}
              className="flex flex-col p-6 md:p-8 rounded-2xl relative transition-transform duration-300 hover:scale-[1.02]"
              style={{
                background: 'hsl(220,25%,14%)',
                border: plan.popular
                  ? '2px solid hsl(45,100%,50%)'
                  : '1px solid hsl(220,20%,22%)',
                boxShadow: plan.popular ? '0 0 30px hsl(45 100% 50% / 0.1)' : 'none',
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div
                    className="px-5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-lg"
                    style={{ background: 'hsl(45,100%,50%)', color: 'hsl(220,25%,10%)' }}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    الأكثر شهرة
                  </div>
                </div>
              )}

              {/* Plan info */}
              <div className="text-center mb-6 flex-1">
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 mt-2">{plan.title}</h3>
                <p className="text-xs md:text-sm mb-6" style={{ color: 'hsl(220,15%,55%)' }}>{plan.sub}</p>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-bold" style={{ color: 'hsl(45,100%,50%)' }}>{plan.price}</span>
                  <span className="text-2xl font-bold mb-1" style={{ color: 'hsl(45,100%,50%)' }}>{symbol}</span>
                </div>
                <p className="text-xs uppercase tracking-widest" style={{ color: 'hsl(220,15%,40%)' }}>
                  {currency}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center justify-end gap-2.5 text-sm">
                    <span style={{ color: 'hsl(220,15%,75%)' }}>{f}</span>
                    <Diamond className="w-3.5 h-3.5 shrink-0 fill-current" style={{ color: 'hsl(45,100%,50%)' }} />
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                id={`subarab-plan-${plan.duration}`}
                disabled={!paddleReady || loadingPlan === plan.duration}
                onClick={() => handleCheckout(plan.priceId, plan.duration)}
                className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center h-14 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  plan.popular
                    ? {
                        background: 'hsl(45,100%,50%)',
                        color: 'hsl(220,25%,10%)',
                      }
                    : {
                        background: 'hsl(220,25%,20%)',
                        color: 'white',
                        border: '1px solid hsl(220,20%,30%)',
                      }
                }
                onMouseEnter={e => {
                  if (!plan.popular) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(220,25%,25%)';
                  else (e.currentTarget as HTMLButtonElement).style.background = 'hsl(45,100%,55%)';
                }}
                onMouseLeave={e => {
                  if (!plan.popular) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(220,25%,20%)';
                  else (e.currentTarget as HTMLButtonElement).style.background = 'hsl(45,100%,50%)';
                }}
              >
                {loadingPlan === plan.duration ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : paddleReady ? (
                  'اختر الباقة'
                ) : (
                  '...جاري التحميل'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/12723751812"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: 'hsl(142,70%,45%)' }}
        aria-label="تواصل عبر واتساب"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
