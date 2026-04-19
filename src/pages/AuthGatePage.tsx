import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Film, Phone, CheckCircle, Shield, Sparkles, XCircle, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COUNTRIES = [
  // الدول العربية
  { code: '+966', flag: '🇸🇦', name: 'السعودية' },
  { code: '+20', flag: '🇪🇬', name: 'مصر' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت' },
  { code: '+974', flag: '🇶🇦', name: 'قطر' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  { code: '+964', flag: '🇮🇶', name: 'العراق' },
  { code: '+963', flag: '🇸🇾', name: 'سوريا' },
  { code: '+961', flag: '🇱🇧', name: 'لبنان' },
  { code: '+212', flag: '🇲🇦', name: 'المغرب' },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر' },
  { code: '+216', flag: '🇹🇳', name: 'تونس' },
  { code: '+218', flag: '🇱🇾', name: 'ليبيا' },
  { code: '+249', flag: '🇸🇩', name: 'السودان' },
  { code: '+967', flag: '🇾🇪', name: 'اليمن' },
  { code: '+970', flag: '🇵🇸', name: 'فلسطين' },
  // أمريكا وتركيا
  { code: '+1', flag: '🇺🇸', name: 'أمريكا' },
  { code: '+90', flag: '🇹🇷', name: 'تركيا' },
  // أوروبا
  { code: '+44', flag: '🇬🇧', name: 'بريطانيا' },
  { code: '+33', flag: '🇫🇷', name: 'فرنسا' },
  { code: '+49', flag: '🇩🇪', name: 'ألمانيا' },
  { code: '+34', flag: '🇪🇸', name: 'إسبانيا' },
  { code: '+39', flag: '🇮🇹', name: 'إيطاليا' },
  { code: '+31', flag: '🇳🇱', name: 'هولندا' },
  { code: '+32', flag: '🇧🇪', name: 'بلجيكا' },
  { code: '+41', flag: '🇨🇭', name: 'سويسرا' },
  { code: '+43', flag: '🇦🇹', name: 'النمسا' },
  { code: '+46', flag: '🇸🇪', name: 'السويد' },
  { code: '+47', flag: '🇳🇴', name: 'النرويج' },
  { code: '+45', flag: '🇩🇰', name: 'الدنمارك' },
  { code: '+358', flag: '🇫🇮', name: 'فنلندا' },
  { code: '+48', flag: '🇵🇱', name: 'بولندا' },
  { code: '+351', flag: '🇵🇹', name: 'البرتغال' },
  { code: '+30', flag: '🇬🇷', name: 'اليونان' },
  { code: '+353', flag: '🇮🇪', name: 'أيرلندا' },
  { code: '+420', flag: '🇨🇿', name: 'التشيك' },
  { code: '+36', flag: '🇭🇺', name: 'المجر' },
  { code: '+40', flag: '🇷🇴', name: 'رومانيا' },
  { code: '+359', flag: '🇧🇬', name: 'بلغاريا' },
  { code: '+385', flag: '🇭🇷', name: 'كرواتيا' },
  { code: '+421', flag: '🇸🇰', name: 'سلوفاكيا' },
  { code: '+386', flag: '🇸🇮', name: 'سلوفينيا' },
  { code: '+370', flag: '🇱🇹', name: 'ليتوانيا' },
  { code: '+371', flag: '🇱🇻', name: 'لاتفيا' },
  { code: '+372', flag: '🇪🇪', name: 'إستونيا' },
  { code: '+352', flag: '🇱🇺', name: 'لوكسمبورغ' },
  { code: '+356', flag: '🇲🇹', name: 'مالطا' },
  { code: '+357', flag: '🇨🇾', name: 'قبرص' },
  { code: '+354', flag: '🇮🇸', name: 'آيسلندا' },
  { code: '+355', flag: '🇦🇱', name: 'ألبانيا' },
  { code: '+381', flag: '🇷🇸', name: 'صربيا' },
  { code: '+382', flag: '🇲🇪', name: 'الجبل الأسود' },
  { code: '+389', flag: '🇲🇰', name: 'مقدونيا الشمالية' },
  { code: '+387', flag: '🇧🇦', name: 'البوسنة والهرسك' },
  { code: '+373', flag: '🇲🇩', name: 'مولدوفا' },
  { code: '+380', flag: '🇺🇦', name: 'أوكرانيا' },
  { code: '+375', flag: '🇧🇾', name: 'بيلاروسيا' },
];

// Map timezone to likely country code
function detectCountryCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzMap: Record<string, string> = {
      'Asia/Riyadh': '+966',
      'Africa/Cairo': '+20',
      'Asia/Dubai': '+971',
      'Asia/Kuwait': '+965',
      'Asia/Qatar': '+974',
      'Asia/Bahrain': '+973',
      'Asia/Muscat': '+968',
      'Asia/Amman': '+962',
      'Asia/Baghdad': '+964',
      'Asia/Damascus': '+963',
      'Asia/Beirut': '+961',
      'Africa/Casablanca': '+212',
      'Africa/Algiers': '+213',
      'Africa/Tunis': '+216',
      'Africa/Tripoli': '+218',
      'Africa/Khartoum': '+249',
      'Asia/Aden': '+967',
      'Asia/Hebron': '+970',
      'Asia/Gaza': '+970',
      'America/New_York': '+1',
      'America/Chicago': '+1',
      'America/Los_Angeles': '+1',
      'Europe/London': '+44',
      'Europe/Paris': '+33',
      'Europe/Berlin': '+49',
      'Europe/Istanbul': '+90',
    };
    return tzMap[tz] || '+966';
  } catch {
    return '+966';
  }
}

export default function AuthGatePage() {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || '/offers';

  useEffect(() => {
    setCountryCode(detectCountryCode());
  }, []);

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 6 || cleanPhone.length > 12) {
      toast.error('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    const fullPhone = countryCode + cleanPhone;
    setLoading(true);
    try {
      localStorage.setItem('sniplink_user_phone', fullPhone);

      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: { phone: fullPhone, type: 'welcome' },
      });

      if (error) console.error('WhatsApp send error:', error);

      toast.success('مرحباً بك! تم إرسال رسالة ترحيبية على الواتساب');
      navigate(redirectTo);
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(220,25%,10%)] text-white flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[hsl(45,100%,50%)] flex items-center justify-center mb-2">
            <Film className="w-10 h-10 text-[hsl(220,25%,10%)]" />
          </div>
          <h1 className="text-3xl font-display font-bold leading-tight">
            اشترك الآن في عرب ستريم 🎬
          </h1>
          <p className="text-[hsl(220,15%,60%)] text-base">
            أدخل رقم هاتفك وسيتم إرسال بيانات اشتراكك على الواتساب
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-[hsl(220,25%,14%)] p-8 rounded-2xl border border-[hsl(220,20%,22%)]">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-[hsl(220,15%,70%)]">
              رقم الهاتف (واتساب)
            </label>

            {/* Country code + phone input */}
            <div className="flex gap-2" dir="ltr">
              {/* Country selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl bg-[hsl(220,25%,18%)] border border-[hsl(220,20%,28%)] text-white hover:border-[hsl(45,100%,50%)] transition-colors min-w-[110px]"
                >
                  <span className="text-xl">{selectedCountry.flag}</span>
                  <span className="text-sm font-mono">{countryCode}</span>
                  <ChevronDown className="w-4 h-4 text-[hsl(220,15%,50%)]" />
                </button>

                {showDropdown && (
                  <div className="absolute top-full mt-1 left-0 w-56 max-h-64 overflow-y-auto rounded-xl bg-[hsl(220,25%,16%)] border border-[hsl(220,20%,28%)] shadow-xl z-50">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(c.code);
                          setShowDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[hsl(220,25%,22%)] transition-colors ${
                          c.code === countryCode ? 'bg-[hsl(220,25%,22%)] text-[hsl(45,100%,50%)]' : 'text-white'
                        }`}
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span className="flex-1 text-right" dir="rtl">{c.name}</span>
                        <span className="font-mono text-xs text-[hsl(220,15%,50%)]">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone input */}
              <input
                id="phone"
                type="tel"
                placeholder="123 456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="flex-1 px-4 py-3.5 rounded-xl bg-[hsl(220,25%,18%)] border border-[hsl(220,20%,28%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:outline-none focus:border-[hsl(45,100%,50%)] transition-colors text-lg"
              />
            </div>

            <p className="text-xs text-[hsl(220,15%,45%)]">
              المفتاح المختار: {countryCode} ({selectedCountry.name})
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg bg-[hsl(45,100%,50%)] text-[hsl(220,25%,10%)] hover:bg-[hsl(45,100%,55%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              'اشترك الآن 🚀'
            )}
          </button>
        </form>

        {/* Features */}
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-3 text-[hsl(220,15%,70%)]">
            <CheckCircle className="w-5 h-5 text-[hsl(142,72%,42%)] shrink-0" />
            <span>سيتم إرسال بيانات اشتراكك على الواتساب</span>
          </div>
          <div className="flex items-center gap-3 text-[hsl(220,15%,70%)]">
            <Sparkles className="w-5 h-5 text-[hsl(45,100%,50%)] shrink-0" />
            <span>محتوى حصري وبدون إعلانات</span>
          </div>
          <div className="flex items-center gap-3 text-[hsl(220,15%,70%)]">
            <XCircle className="w-5 h-5 text-[hsl(45,100%,50%)] shrink-0" />
            <span>إلغاء مجاني في أي وقت</span>
          </div>
          <div className="flex items-center gap-3 text-[hsl(220,15%,70%)]">
            <Shield className="w-5 h-5 text-[hsl(45,100%,50%)] shrink-0" />
            <span>بيانات آمنة وموثوقة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
