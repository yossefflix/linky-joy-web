import { LayoutDashboard, Users, ShoppingCart, Settings, Link } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 border-l border-white/10 bg-[#09090b] hidden lg:block relative z-20">
        <div className="p-6 border-b border-white/10">
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Arab<span className="text-brand-500">Admin</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin" className="flex items-center gap-3 bg-white/5 text-white p-3 rounded-lg border border-white/5">
            <LayoutDashboard className="w-5 h-5 text-brand-500" />
            <span>لوحة القيادة</span>
          </a>
          <a href="/admin" className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span>الطلبات</span>
          </a>
          <a href="/admin/inventory" className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            <span>المخزون والحسابات</span>
          </a>
          <a href="/admin" className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span>الإعدادات</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/10 bg-[#0ca]/10 backdrop-blur-md flex items-center px-8 z-10 w-full justify-between">
          <h2 className="text-xl font-bold text-white">نظرة عامة</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="p-8 overflow-y-auto z-10 relative flex-1">
          {children}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      </main>
    </div>
  );
}
