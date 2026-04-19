import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Database, ShoppingCart, LogOut, Lock,
  PlusCircle, Loader2, AlertTriangle, CheckCircle2, AlertCircle,
  MonitorPlay, RefreshCw, ArrowUp, Users, Activity,
} from 'lucide-react';

/* ─────────────── Types ─────────────── */
const ADMIN_PASSWORD = 'Yossef123$';

interface Order {
  id: string;
  paddle_transaction_id: string;
  plan: string;
  payment_status: string;
  delivery_status: string;
  created_at: string;
  iptv_accounts?: { username: string } | { username: string }[];
}

interface Stats {
  completedToday: number;
  totalAvailable: number;
  totalUsed: number;
  failedCount: number;
}

type Tab = 'dashboard' | 'inventory';

/* ─────────────── Helpers ─────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} ساعة`;
  return `قبل ${Math.floor(hrs / 24)} يوم`;
}

function DeliveryBadge({ status }: { status: string }) {
  if (status === 'delivered')
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 w-fit">
        <MonitorPlay className="w-3 h-3" /> مُسلَّم
      </span>
    );
  if (status === 'retrying')
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 w-fit">
        <RefreshCw className="w-3 h-3" /> يعيد المحاولة
      </span>
    );
  if (status === 'failed')
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 w-fit">
        <AlertTriangle className="w-3 h-3" /> فشل
      </span>
    );
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 w-fit">
      <Loader2 className="w-3 h-3 animate-spin" /> جاري
    </span>
  );
}

/* ─────────────── Login Screen ─────────────── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem('subarab_admin_auth', 'true');
      onLogin();
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" dir="rtl"
      style={{ background: 'hsl(220,25%,8%)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: 'hsl(220,25%,16%)' }}>
            <Lock className="w-8 h-8" style={{ color: 'hsl(45,100%,50%)' }} />
          </div>
          <h1 className="text-2xl font-bold text-white">إدارة عرب ستريم</h1>
          <p className="text-sm" style={{ color: 'hsl(220,15%,55%)' }}>ادخل كلمة مرور الأدمن للوصول</p>
        </div>

        <input
          type="password"
          placeholder="كلمة مرور الأدمن"
          value={pass}
          onChange={e => { setPass(e.target.value); setError(''); }}
          className="w-full px-4 py-3.5 rounded-xl text-white outline-none border transition-colors"
          style={{ background: 'hsl(220,25%,14%)', borderColor: error ? 'hsl(0,72%,51%)' : 'hsl(220,20%,28%)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'hsl(45,100%,50%)')}
          onBlur={e => (e.currentTarget.style.borderColor = error ? 'hsl(0,72%,51%)' : 'hsl(220,20%,28%)')}
        />
        {error && <p className="text-sm" style={{ color: 'hsl(0,72%,60%)' }}>{error}</p>}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold text-lg transition-colors"
          style={{ background: 'hsl(45,100%,50%)', color: 'hsl(220,25%,10%)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'hsl(45,100%,55%)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'hsl(45,100%,50%)')}
        >
          دخول
        </button>
      </form>
    </div>
  );
}

/* ─────────────── Dashboard Tab ─────────────── */
function DashboardTab({ orders, stats, loading }: { orders: Order[]; stats: Stats | null; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(45,100%,50%)' }} />
    </div>
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'طلبات اليوم', value: stats?.completedToday ?? 0, unit: 'طلب', icon: ShoppingCart, color: 'hsl(142,72%,42%)' },
          { label: 'حسابات متاحة', value: stats?.totalAvailable ?? 0, unit: 'حساب', icon: Database, color: 'hsl(45,100%,50%)' },
          { label: 'حسابات مستخدمة', value: stats?.totalUsed ?? 0, unit: 'حساب', icon: Users, color: 'hsl(220,80%,60%)' },
          { label: 'فشل واتساب (24h)', value: stats?.failedCount ?? 0, unit: 'حالة', icon: AlertTriangle, color: 'hsl(0,72%,51%)' },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="p-6 rounded-2xl border"
            style={{ background: 'hsl(220,25%,14%)', borderColor: 'hsl(220,20%,22%)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'hsl(220,15%,55%)' }}>{label}</p>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-3xl font-bold text-white">
              {value} <span className="text-base font-normal" style={{ color: 'hsl(220,15%,50%)' }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'hsl(220,25%,14%)', borderColor: 'hsl(220,20%,22%)' }}>
        <div className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: 'hsl(220,20%,22%)' }}>
          <h3 className="font-bold text-white text-lg">أحدث الطلبات</h3>
          <span className="text-sm px-3 py-1 rounded-full"
            style={{ background: 'hsl(220,25%,20%)', color: 'hsl(220,15%,60%)' }}>
            {orders.length} طلب
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead style={{ background: 'hsl(220,25%,12%)' }}>
              <tr>
                {['المرجع', 'اليوزر', 'الباقة', 'الدفع', 'التسليم', 'الوقت'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-medium"
                    style={{ color: 'hsl(220,15%,50%)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center" style={{ color: 'hsl(220,15%,45%)' }}>
                    لا توجد طلبات بعد
                  </td>
                </tr>
              ) : orders.map(order => {
                const accountData = order.iptv_accounts;
                const username = Array.isArray(accountData) ? accountData[0]?.username : (accountData as any)?.username;
                return (
                  <tr key={order.id} className="border-t transition-colors"
                    style={{ borderColor: 'hsl(220,20%,20%)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'hsl(220,25%,18%)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-white">
                      {order.paddle_transaction_id?.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: 'hsl(45,100%,60%)' }} dir="ltr">
                      {username || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-md text-xs font-bold"
                        style={{ background: 'hsl(220,25%,20%)', color: 'hsl(220,15%,70%)' }}>
                        {order.plan} شهر
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.payment_status === 'completed'
                        ? <span className="text-sm" style={{ color: 'hsl(142,72%,55%)' }}>مكتمل</span>
                        : <span className="text-sm text-zinc-400">{order.payment_status}</span>}
                    </td>
                    <td className="px-4 py-3"><DeliveryBadge status={order.delivery_status} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'hsl(220,15%,50%)' }}>
                      {timeAgo(order.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Inventory Tab ─────────────── */
function InventoryTab() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [planDuration, setPlanDuration] = useState('6');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/subarab/add-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: ADMIN_PASSWORD,
          username: username.trim(),
          password: password.trim(),
          plan_duration: planDuration,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);
      setMessage({ text: 'تمت إضافة الحساب بنجاح! ✅', type: 'success' });
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setMessage({ text: `فشل في الإضافة: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'hsl(45,100%,50%,0.15)' }}>
          <Database className="w-6 h-6" style={{ color: 'hsl(45,100%,50%)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">إضافة حسابات IPTV</h1>
          <p className="text-sm" style={{ color: 'hsl(220,15%,55%)' }}>إضافة حساب جديد إلى مخزون قاعدة البيانات</p>
        </div>
      </div>

      <div className="rounded-2xl border p-8 space-y-6"
        style={{ background: 'hsl(220,25%,14%)', borderColor: 'hsl(220,20%,22%)' }}>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
            {message.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 shrink-0" />
              : <AlertCircle className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'hsl(220,15%,70%)' }}>
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                dir="ltr"
                placeholder="user1234"
                className="w-full px-4 py-3.5 rounded-xl text-white font-mono outline-none border transition-colors"
                style={{ background: 'hsl(220,25%,18%)', borderColor: 'hsl(220,20%,28%)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'hsl(45,100%,50%)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'hsl(220,20%,28%)')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'hsl(220,15%,70%)' }}>
                كلمة المرور (Password)
              </label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                dir="ltr"
                placeholder="pass5678"
                className="w-full px-4 py-3.5 rounded-xl text-white font-mono outline-none border transition-colors"
                style={{ background: 'hsl(220,25%,18%)', borderColor: 'hsl(220,20%,28%)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'hsl(45,100%,50%)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'hsl(220,20%,28%)')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'hsl(220,15%,70%)' }}>
              الباقة المخصصة للحساب
            </label>
            <select
              value={planDuration}
              onChange={e => setPlanDuration(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-white outline-none border transition-colors"
              style={{ background: 'hsl(220,25%,18%)', borderColor: 'hsl(220,20%,28%)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'hsl(45,100%,50%)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'hsl(220,20%,28%)')}
            >
              <option value="3">باقة 3 أشهر</option>
              <option value="6">باقة 6 أشهر (+ شهر مجاني)</option>
              <option value="12">باقة 12 شهر (+ 3 شهور مجانية)</option>
              <option value="24">باقة 24 شهر (+ 3 شهور مجانية)</option>
            </select>
          </div>

          <button
            type="submit"
            id="subarab-add-account-btn"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{ background: 'hsl(45,100%,50%)', color: 'hsl(220,25%,10%)' }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(45,100%,55%)'; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(45,100%,50%)'; }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlusCircle className="w-5 h-5" /> إضافة الحساب</>}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────── Main Admin Page ─────────────── */
export default function SubArabAdminPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('subarab_admin_auth') === 'true'
  );
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subarab/admin-stats?adminPassword=${encodeURIComponent(ADMIN_PASSWORD)}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('[SubArabAdmin] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated && tab === 'dashboard') loadData();
  }, [authenticated, tab, loadData]);

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
    { id: 'inventory', label: 'المخزون والحسابات', icon: Database },
  ];

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: 'hsl(220,25%,8%)' }}>
      {/* ── Sidebar ── */}
      <aside className="w-64 border-l hidden lg:flex flex-col"
        style={{ background: 'hsl(220,25%,10%)', borderColor: 'hsl(220,20%,18%)' }}>
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'hsl(220,20%,18%)' }}>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span style={{ color: 'hsl(45,100%,50%)' }}>عرب</span>Admin
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right"
              style={
                tab === id
                  ? { background: 'hsl(45,100%,50%,0.12)', color: 'hsl(45,100%,60%)', border: '1px solid hsl(45,100%,50%,0.2)' }
                  : { color: 'hsl(220,15%,55%)', border: '1px solid transparent' }
              }
              onMouseEnter={e => { if (tab !== id) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(220,25%,15%)'; }}
              onMouseLeave={e => { if (tab !== id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'hsl(220,20%,18%)' }}>
          <button
            onClick={() => { sessionStorage.removeItem('subarab_admin_auth'); setAuthenticated(false); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right"
            style={{ color: 'hsl(0,72%,60%)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'hsl(0,72%,51%,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 z-10"
          style={{ background: 'hsl(220,25%,10%)', borderColor: 'hsl(220,20%,18%)' }}>
          <div className="flex items-center gap-3">
            {/* Mobile tab switcher */}
            <div className="flex lg:hidden gap-2">
              {navItems.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={
                    tab === id
                      ? { background: 'hsl(45,100%,50%)', color: 'hsl(220,25%,10%)' }
                      : { color: 'hsl(220,15%,55%)', background: 'hsl(220,25%,14%)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <h2 className="font-bold text-white hidden lg:block">
              {tab === 'dashboard' ? 'لوحة القيادة' : 'إدارة المخزون'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {tab === 'dashboard' && (
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{ background: 'hsl(220,25%,18%)', color: 'hsl(220,15%,70%)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'hsl(220,25%,22%)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'hsl(220,25%,18%)')}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            )}
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'hsl(45,100%,50%)', color: 'hsl(220,25%,10%)' }}>
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {tab === 'dashboard' && <DashboardTab orders={orders} stats={stats} loading={loading} />}
          {tab === 'inventory' && <InventoryTab />}
        </div>
      </main>
    </div>
  );
}
