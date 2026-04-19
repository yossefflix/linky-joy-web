import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Film, CheckCircle2, Sparkles, XCircle, Shield, ChevronDown, Search } from 'lucide-react';

/* ─────────────── Country data ─────────────── */
const COUNTRIES = [
  { code: 'EG', dial: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: 'SA', dial: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: 'AE', dial: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'KW', dial: '+965', name: 'الكويت', flag: '🇰🇼' },
  { code: 'QA', dial: '+974', name: 'قطر', flag: '🇶🇦' },
  { code: 'OM', dial: '+968', name: 'عُمان', flag: '🇴🇲' },
  { code: 'BH', dial: '+973', name: 'البحرين', flag: '🇧🇭' },
  { code: 'IQ', dial: '+964', name: 'العراق', flag: '🇮🇶' },
  { code: 'SY', dial: '+963', name: 'سوريا', flag: '🇸🇾' },
  { code: 'JO', dial: '+962', name: 'الأردن', flag: '🇯🇴' },
  { code: 'LB', dial: '+961', name: 'لبنان', flag: '🇱🇧' },
  { code: 'PS', dial: '+970', name: 'فلسطين', flag: '🇵🇸' },
  { code: 'YE', dial: '+967', name: 'اليمن', flag: '🇾🇪' },
  { code: 'SD', dial: '+249', name: 'السودان', flag: '🇸🇩' },
  { code: 'LY', dial: '+218', name: 'ليبيا', flag: '🇱🇾' },
  { code: 'TN', dial: '+216', name: 'تونس', flag: '🇹🇳' },
  { code: 'DZ', dial: '+213', name: 'الجزائر', flag: '🇩🇿' },
  { code: 'MA', dial: '+212', name: 'المغرب', flag: '🇲🇦' },
  { code: 'US', dial: '+1', name: 'أمريكا', flag: '🇺🇸' },
  { code: 'GB', dial: '+44', name: 'بريطانيا', flag: '🇬🇧' },
  { code: 'FR', dial: '+33', name: 'فرنسا', flag: '🇫🇷' },
  { code: 'DE', dial: '+49', name: 'ألمانيا', flag: '🇩🇪' },
  { code: 'IT', dial: '+39', name: 'إيطاليا', flag: '🇮🇹' },
  { code: 'ES', dial: '+34', name: 'إسبانيا', flag: '🇪🇸' },
  { code: 'NL', dial: '+31', name: 'هولندا', flag: '🇳🇱' },
  { code: 'BE', dial: '+32', name: 'بلجيكا', flag: '🇧🇪' },
  { code: 'CH', dial: '+41', name: 'سويسرا', flag: '🇨🇭' },
  { code: 'SE', dial: '+46', name: 'السويد', flag: '🇸🇪' },
  { code: 'NO', dial: '+47', name: 'النرويج', flag: '🇳🇴' },
  { code: 'TR', dial: '+90', name: 'تركيا', flag: '🇹🇷' },
  { code: 'RU', dial: '+7', name: 'روسيا', flag: '🇷🇺' },
  { code: 'CA', dial: '+1', name: 'كندا', flag: '🇨🇦' },
  { code: 'AU', dial: '+61', name: 'أستراليا', flag: '🇦🇺' },
];

/* ─────────────── Detect country from timezone ─────────────── */
function detectDialCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, string> = {
      'Africa/Cairo': '+20',
      'Asia/Riyadh': '+966',
      'Asia/Dubai': '+971',
      'Asia/Kuwait': '+965',
      'Asia/Qatar': '+974',
      'Asia/Muscat': '+968',
      'Asia/Bahrain': '+973',
      'Asia/Baghdad': '+964',
      'Asia/Damascus': '+963',
      'Asia/Amman': '+962',
      'Asia/Beirut': '+961',
      'Asia/Hebron': '+970',
      'Asia/Gaza': '+970',
      'Asia/Aden': '+967',
      'Africa/Khartoum': '+249',
      'Africa/Tripoli': '+218',
      'Africa/Tunis': '+216',
      'Africa/Algiers': '+213',
      'Africa/Casablanca': '+212',
      'America/New_York': '+1',
      'Europe/London': '+44',
      'Europe/Paris': '+33',
      'Europe/Berlin': '+49',
      'Europe/Istanbul': '+90',
    };
    return map[tz] || '+20';
  } catch {
    return '+20';
  }
}

/* ─────────────── Component ─────────────── */
export default function SubArabGatePage() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dialCode, setDialCode] = useState('+20');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const detected = detectDialCode();
    const country = COUNTRIES.find(c => c.dial === detected) || COUNTRIES[0];
    setSelectedCountry(country);
    setDialCode(country.dial);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCountries = COUNTRIES.filter(
    c => c.name.includes(search) || c.dial.includes(search)
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d\+\s]/g, '');
    setPhone(val);
    const clean = val.replace(/\s+/g, '');
    if (clean.length >= 2) {
      const matched = [...COUNTRIES]
        .sort((a, b) => b.dial.length - a.dial.length)
        .find(c => clean.startsWith(c.dial));
      if (matched && matched.dial !== dialCode) {
        setSelectedCountry(matched);
        setDialCode(matched.dial);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone.trim() || dialCode;
    let cleanPhone = rawPhone.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+')) cleanPhone = dialCode + cleanPhone;
    if (cleanPhone.replace(/[^\d]/g, '').length < 7) {
      alert('الرجاء إدخال رقم صحيح');
      return;
    }

    setLoading(true);
    // Send welcome message in background (fire & forget)
    fetch('/api/subarab/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone }),
    }).catch(() => {});

    localStorage.setItem('subarab_phone', cleanPhone);
    navigate(`/subarab/plans?phone=${encodeURIComponent(cleanPhone)}`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden"
      dir="rtl"
      style={{ background: 'hsl(220,25%,10%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'hsl(45,100%,50%)' }}
        />
      </div>

      <div className="w-full max-w-xl mx-auto flex flex-col items-center z-10 space-y-8">
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{ background: 'hsl(45,100%,50%)', boxShadow: '0 0 40px 0 hsl(45 100% 50% / 0.3)' }}
        >
          <Film className="w-10 h-10" style={{ color: 'hsl(220,25%,10%)' }} />
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            اشترك الآن في عرب ستريم 🎬
          </h1>
          <p className="text-base" style={{ color: 'hsl(220,15%,60%)' }}>
            أدخل رقم هاتفك وسيتم إرسال بيانات اشتراكك على الواتساب
          </p>
        </div>

        {/* Form Card */}
        <div
          className="w-full rounded-3xl p-8 shadow-2xl border"
          style={{ background: 'hsl(220,25%,14%)', borderColor: 'hsl(220,20%,22%)' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="text-sm font-medium" style={{ color: 'hsl(220,15%,70%)' }}>
              رقم الهاتف (واتساب)
            </label>

            <div className="flex gap-3" dir="ltr">
              {/* Country dropdown */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  id="subarab-country-selector"
                  onClick={() => { setShowDropdown(!showDropdown); setSearch(''); }}
                  className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl border transition-colors h-full"
                  style={{
                    background: 'hsl(220,25%,18%)',
                    borderColor: showDropdown ? 'hsl(45,100%,50%)' : 'hsl(220,20%,28%)',
                    color: 'white',
                  }}
                >
                  <span className="text-xl">{selectedCountry.flag}</span>
                  <span className="text-sm font-mono">{dialCode}</span>
                  <ChevronDown className="w-4 h-4" style={{ color: 'hsl(220,15%,50%)' }} />
                </button>

                {showDropdown && (
                  <div
                    className="absolute top-full mt-1 left-0 w-64 max-h-64 overflow-y-auto rounded-xl border shadow-2xl z-50"
                    style={{ background: 'hsl(220,25%,16%)', borderColor: 'hsl(220,20%,28%)' }}
                  >
                    {/* Search */}
                    <div className="p-2 sticky top-0" style={{ background: 'hsl(220,25%,16%)' }}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'hsl(220,25%,20%)' }}>
                        <Search className="w-4 h-4" style={{ color: 'hsl(220,15%,50%)' }} />
                        <input
                          type="text"
                          placeholder="بحث..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="bg-transparent outline-none text-white text-sm w-full"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    {filteredCountries.map(c => (
                      <button
                        key={c.code + c.dial}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setDialCode(c.dial);
                          setPhone(c.dial + ' ');
                          setShowDropdown(false);
                          setSearch('');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                        style={{
                          background: c.dial === dialCode ? 'hsl(220,25%,22%)' : 'transparent',
                          color: c.dial === dialCode ? 'hsl(45,100%,50%)' : 'white',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'hsl(220,25%,22%)')}
                        onMouseLeave={e => (e.currentTarget.style.background = c.dial === dialCode ? 'hsl(220,25%,22%)' : 'transparent')}
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span className="flex-1 text-right" dir="rtl">{c.name}</span>
                        <span className="font-mono text-xs" style={{ color: 'hsl(220,15%,50%)' }}>{c.dial}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone input */}
              <input
                id="subarab-phone-input"
                type="tel"
                placeholder="123 456 7890"
                value={phone}
                onChange={handlePhoneChange}
                required
                dir="ltr"
                className="flex-1 px-4 py-3.5 rounded-xl border text-white text-lg font-mono tracking-wider outline-none transition-colors"
                style={{
                  background: 'hsl(220,25%,18%)',
                  borderColor: 'hsl(220,20%,28%)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'hsl(45,100%,50%)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'hsl(220,20%,28%)')}
              />
            </div>

            <p className="text-xs" style={{ color: 'hsl(220,15%,45%)' }}>
              المفتاح المختار: {dialCode} ({selectedCountry.name})
            </p>

            <button
              type="submit"
              id="subarab-subscribe-btn"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'hsl(45,100%,50%)',
                color: 'hsl(220,25%,10%)',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(45,100%,55%)'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(45,100%,50%)'; }}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>اشترك الآن <Rocket className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>

        {/* Features list */}
        <div className="w-full space-y-4 px-2">
          {[
            { icon: CheckCircle2, text: 'سيتم إرسال بيانات اشتراكك على الواتساب', color: 'hsl(142,72%,45%)' },
            { icon: Sparkles, text: 'محتوى حصري وبدون إعلانات', color: 'hsl(45,100%,50%)' },
            { icon: XCircle, text: 'إلغاء مجاني في أي وقت', color: 'hsl(45,100%,50%)' },
            { icon: Shield, text: 'بيانات آمنة وموثوقة', color: 'hsl(45,100%,50%)' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center justify-end gap-3">
              <span className="text-sm md:text-base" style={{ color: 'hsl(220,15%,75%)' }}>{text}</span>
              <Icon className="w-5 h-5 shrink-0" style={{ color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
