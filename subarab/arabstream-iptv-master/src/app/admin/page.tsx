import { ArrowDown, ArrowUp, AlertTriangle, MonitorPlay } from "lucide-react";

// Mock Data for demonstration
const mockOrders = [
  { id: "#ORD-1029", plan: "12 شهر", target: "+966500000000", amount: "139 SAR", status: "completed", delivery: "delivered", time: "قبل 10 دقائق" },
  { id: "#ORD-1028", plan: "6 أشهر", target: "+971500000000", amount: "99 SAR", status: "completed", delivery: "retrying", time: "قبل 15 دقيقة" },
  { id: "#ORD-1027", plan: "3 أشهر", target: "+96550000000", amount: "59 SAR", status: "completed", delivery: "failed", time: "قبل ساعة" },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#18181b] p-6 rounded-2xl border border-white/10">
          <p className="text-zinc-400 text-sm font-medium mb-1">المبيعات اليوم</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white flex items-baseline gap-1">
              4,250 <span className="text-base text-zinc-500 font-normal">SAR</span>
            </h3>
            <span className="text-green-400 flex items-center text-sm font-medium bg-green-400/10 px-2 py-1 rounded-md">
              <ArrowUp className="w-3 h-3 mr-1" /> +14%
            </span>
          </div>
        </div>
        
        <div className="bg-[#18181b] p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <p className="text-zinc-400 text-sm font-medium mb-1">المخزون المتبقي (شامل)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">
              84 <span className="text-base text-zinc-500 font-normal">حساب</span>
            </h3>
            <span className="text-red-400 flex items-center text-sm font-medium bg-red-400/10 px-2 py-1 rounded-md border border-red-400/20">
              <AlertTriangle className="w-3 h-3 mr-1" /> تنبيه منخفض
            </span>
          </div>
          {/* Warning Bar */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-red-500/20">
            <div className="h-full bg-red-500 w-[15%]"></div>
          </div>
        </div>
        
        <div className="bg-[#18181b] p-6 rounded-2xl border border-white/10">
          <p className="text-zinc-400 text-sm font-medium mb-1">فشل الواتس اب (اخر 24 ساعة)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">
              1 <span className="text-base text-zinc-500 font-normal">حالة</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="xl:col-span-2 bg-[#18181b] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">أحدث الطلبات</h3>
            <button className="text-sm text-brand-500 hover:text-brand-400 font-medium">عرض الكل</button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right" dir="rtl">
              <thead className="bg-[#27272a]/50 text-zinc-400 text-sm border-b border-white/5">
                <tr>
                  <th className="font-medium p-4 whitespace-nowrap">الرقم المرجعي</th>
                  <th className="font-medium p-4 whitespace-nowrap">الهاتف</th>
                  <th className="font-medium p-4 whitespace-nowrap">الباقة</th>
                  <th className="font-medium p-4 whitespace-nowrap">الدفع</th>
                  <th className="font-medium p-4 whitespace-nowrap">حالة الواتس اب</th>
                  <th className="font-medium p-4 whitespace-nowrap text-left">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-white font-mono text-sm">{order.id}</td>
                    <td className="p-4 text-zinc-300 font-mono text-sm" dir="ltr">{order.target}</td>
                    <td className="p-4"><span className="bg-white/10 text-zinc-300 px-2 py-1 rounded-md text-xs font-bold">{order.plan}</span></td>
                    <td className="p-4">
                      {order.status === 'completed' && <span className="text-green-400 text-sm">مكتمل</span>}
                    </td>
                    <td className="p-4">
                      {order.delivery === 'delivered' && <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-md text-xs flex items-center w-fit gap-1"><MonitorPlay className="w-3 h-3"/> Delivered</span>}
                      {order.delivery === 'retrying' && <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-md text-xs flex items-center w-fit gap-1">Retrying...</span>}
                      {order.delivery === 'failed' && <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md text-xs flex items-center w-fit gap-1"><AlertTriangle className="w-3 h-3"/> Failed</span>}
                    </td>
                    <td className="p-4 text-left text-zinc-500 text-sm">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#18181b] rounded-2xl border border-white/10 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">إجراءات سريعة</h3>
          <div className="space-y-4 flex-1">
            <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium p-4 rounded-xl flex flex-col items-start gap-1 transition-colors relative overflow-hidden group">
              <span className="relative z-10">رفع حسابات جديدة (CSV)</span>
              <span className="text-sm text-brand-200 relative z-10">إضافة مخزون لقاعدة البيانات</span>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/20 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform"></div>
            </button>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium p-4 rounded-xl flex flex-col items-start gap-1 transition-colors">
              <span>إرسال تنبيه يدوي</span>
              <span className="text-sm text-zinc-400">مراسلة حساب فشل برمجياً</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
