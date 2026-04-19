import { usePaddle } from '@/hooks/use-paddle';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Diamond } from 'lucide-react';

const plans = [
  {
    name: 'باقة شهر',
    duration: 'شهر واحد',
    price: '5',
    features: [
      '9000 قناة',
      '21,000 فيلم',
      '8,000 مسلسل',
      'دعم فني 24/7',
      'سيرفرات بدون تقطيع',
      'إمكانية الطلب',
    ],
    popular: false,
    priceId: 'pri_01kkw88zxnyj0g2kdf0vkd1rqn',
  },
  {
    name: 'باقة 3 شهور',
    duration: '3 شهور',
    price: '15',
    features: [
      '9000 قناة',
      '21,000 فيلم',
      '8,000 مسلسل',
      'دعم فني 24/7',
      'سيرفرات بدون تقطيع',
      'إمكانية الطلب',
    ],
    popular: false,
    priceId: 'pri_01kkt8vh213w3fj1dh2at0rjg3',
  },
  {
    name: 'باقة 6 شهور + شهر مجاني',
    duration: '7 شهور إجمالي',
    price: '25',
    features: [
      '9000 قناة',
      '21,000 فيلم',
      '8,000 مسلسل',
      'دعم فني 24/7',
      'سيرفرات بدون تقطيع',
      'إمكانية الطلب',
    ],
    popular: true,
    priceId: 'pri_01kktcr843ncyveg2rkn6zqyzk',
  },
  {
    name: 'باقة سنة + 3 شهور مجانية',
    duration: '15 شهور إجمالي',
    price: '35',
    features: [
      '9000 قناة',
      '21,000 فيلم',
      '8,000 مسلسل',
      'دعم فني 24/7',
      'سيرفرات بدون تقطيع',
      'إمكانية الطلب',
    ],
    popular: false,
    priceId: 'pri_01kktcsp7ryyjd8csay49jeshj',
  },
  {
    name: 'باقة سنتين + 3 شهور مجانية',
    duration: '27 شهور إجمالي',
    price: '60',
    features: [
      '9000 قناة',
      '21,000 فيلم',
      '8,000 مسلسل',
      'دعم فني 24/7',
      'سيرفرات بدون تقطيع',
      'إمكانية الطلب',
    ],
    popular: false,
    priceId: 'pri_01kktcv7a542997m1ah58s9agv',
  },
];

export default function SaudiOfferPage() {
  const navigate = useNavigate();

  const handleSuccess = useCallback(() => {
    navigate('/subscription');
  }, [navigate]);

  const { ready, openCheckout } = usePaddle(handleSuccess);

  const handleCheckout = (priceId: string) => {
    if (!window.Paddle) return;
    const phone = localStorage.getItem('sniplink_user_phone') || '';
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { phone },
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(220,25%,10%)] text-white" dir="rtl">
      {/* Header */}
      <div className="text-center pt-16 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          اختر باقتك
        </h1>
        <p className="text-lg text-[hsl(220,15%,60%)]">
          جميع الباقات تتضمن كل المميزات
        </p>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'bg-[hsl(220,25%,16%)] border-2 border-[hsl(45,100%,50%)] shadow-[0_0_30px_hsl(45,100%,50%,0.15)]'
                  : 'bg-[hsl(220,25%,14%)] border border-[hsl(220,20%,22%)] hover:border-[hsl(220,20%,30%)]'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[hsl(45,100%,50%)] text-[hsl(220,25%,10%)] px-5 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <Star className="w-4 h-4 fill-current" />
                  الأكثر شهرة
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-display font-bold text-center mt-2 mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-[hsl(220,15%,55%)] text-center mb-6">
                {plan.duration}
              </p>

              {/* Price */}
              <div className="text-center mb-2">
                <span className="text-5xl font-display font-bold text-[hsl(45,100%,50%)]">
                  {plan.price}
                </span>
                <span className="text-2xl font-bold text-[hsl(45,100%,50%)] mr-2">€</span>
              </div>
              <p className="text-sm text-[hsl(220,15%,55%)] text-center mb-8">يورو</p>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Diamond className="w-3.5 h-3.5 text-[hsl(45,100%,50%)] shrink-0 fill-current" />
                    <span className="text-[hsl(220,15%,75%)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                disabled={!ready}
                onClick={() => handleCheckout(plan.priceId)}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                  plan.popular
                    ? 'bg-[hsl(45,100%,50%)] text-[hsl(220,25%,10%)] hover:bg-[hsl(45,100%,55%)] shadow-lg hover:shadow-xl'
                    : 'bg-[hsl(220,25%,20%)] text-white border border-[hsl(220,20%,30%)] hover:bg-[hsl(220,25%,25%)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {ready ? 'اختر الباقة' : '...جاري التحميل'}
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
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[hsl(142,70%,45%)] rounded-full flex items-center justify-center shadow-lg hover:bg-[hsl(142,70%,50%)] transition-colors"
        aria-label="تواصل عبر واتساب"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
