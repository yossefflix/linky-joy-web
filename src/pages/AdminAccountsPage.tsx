import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'Yossef123$';

interface StreamingAccount {
  id: string;
  username: string;
  password: string;
  is_used: boolean;
  assigned_to: string | null;
  assigned_phone: string | null;
  assigned_email: string | null;
  assigned_plan: string | null;
  created_at: string;
}

export default function AdminAccountsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [accounts, setAccounts] = useState<StreamingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadAccounts();
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-accounts', {
        body: { action: 'list' },
      });
      if (error) throw error;
      setAccounts(data.accounts || []);
    } catch (err) {
      toast.error('فشل تحميل الحسابات');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    setAdding(true);
    try {
      const { error } = await supabase.functions.invoke('manage-accounts', {
        body: { action: 'add', username: newUsername.trim(), password: newPassword.trim(), adminPassword: ADMIN_PASSWORD },
      });
      if (error) throw error;
      toast.success('تم إضافة الحساب');
      setNewUsername('');
      setNewPassword('');
      loadAccounts();
    } catch {
      toast.error('فشل إضافة الحساب');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-accounts', {
        body: { action: 'delete', accountId: id, adminPassword: ADMIN_PASSWORD },
      });
      if (error) throw error;
      toast.success('تم حذف الحساب');
      loadAccounts();
    } catch {
      toast.error('فشل حذف الحساب');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[hsl(220,25%,10%)] text-white flex items-center justify-center px-4" dir="rtl">
        <form onSubmit={handleAdminLogin} className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[hsl(220,25%,18%)] flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-[hsl(45,100%,50%)]" />
            </div>
            <h1 className="text-2xl font-display font-bold">لوحة إدارة الحسابات</h1>
          </div>
          <input
            type="password"
            placeholder="كلمة مرور الأدمن"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[hsl(220,25%,18%)] border border-[hsl(220,20%,28%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:outline-none focus:border-[hsl(45,100%,50%)]"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[hsl(45,100%,50%)] text-[hsl(220,25%,10%)] font-bold hover:bg-[hsl(45,100%,55%)] transition-colors"
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,25%,10%)] text-white px-4 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">إدارة الحسابات</h1>
          <button onClick={() => setAuthenticated(false)} className="text-[hsl(220,15%,55%)] hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="bg-[hsl(220,25%,14%)] rounded-2xl border border-[hsl(220,20%,22%)] p-6">
          <h2 className="text-lg font-bold mb-4">إضافة حساب جديد</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="اليوزر"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-[hsl(220,25%,18%)] border border-[hsl(220,20%,28%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:outline-none focus:border-[hsl(45,100%,50%)]"
              dir="ltr"
            />
            <input
              placeholder="الباسورد"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-[hsl(220,25%,18%)] border border-[hsl(220,20%,28%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:outline-none focus:border-[hsl(45,100%,50%)]"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-3 rounded-xl bg-[hsl(45,100%,50%)] text-[hsl(220,25%,10%)] font-bold hover:bg-[hsl(45,100%,55%)] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              إضافة
            </button>
          </div>
        </form>

        {/* Accounts Table */}
        <div className="bg-[hsl(220,25%,14%)] rounded-2xl border border-[hsl(220,20%,22%)] overflow-hidden">
          <div className="p-4 border-b border-[hsl(220,20%,22%)] flex items-center justify-between">
            <h2 className="font-bold">
              الحسابات ({accounts.length})
            </h2>
            <span className="text-sm text-[hsl(220,15%,55%)]">
              متاح: {accounts.filter(a => !a.is_used).length} | مستخدم: {accounts.filter(a => a.is_used).length}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[hsl(45,100%,50%)]" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center text-[hsl(220,15%,55%)]">
              لا توجد حسابات بعد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                   <tr className="border-b border-[hsl(220,20%,22%)] text-[hsl(220,15%,55%)] text-sm">
                     <th className="px-4 py-3 text-right">اليوزر</th>
                     <th className="px-4 py-3 text-right">الباسورد</th>
                     <th className="px-4 py-3 text-right">الحالة</th>
                     <th className="px-4 py-3 text-right">رقم العميل</th>
                     <th className="px-4 py-3 text-right">الباقة</th>
                     <th className="px-4 py-3 text-right">إجراء</th>
                   </tr>
                 </thead>
                 <tbody>
                   {accounts.map((acc) => (
                     <tr key={acc.id} className="border-b border-[hsl(220,20%,20%)] last:border-0">
                       <td className="px-4 py-3 font-mono" dir="ltr">{acc.username}</td>
                       <td className="px-4 py-3 font-mono" dir="ltr">{acc.password}</td>
                       <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           acc.is_used
                             ? 'bg-[hsl(0,72%,51%,0.15)] text-[hsl(0,72%,60%)]'
                             : 'bg-[hsl(142,72%,42%,0.15)] text-[hsl(142,72%,55%)]'
                         }`}>
                           {acc.is_used ? 'مستخدم' : 'متاح'}
                         </span>
                       </td>
                       <td className="px-4 py-3 font-mono text-sm" dir="ltr">
                         {acc.assigned_phone || (acc.assigned_email && acc.assigned_email !== 'unknown' ? acc.assigned_email : '—')}
                       </td>
                       <td className="px-4 py-3 text-sm text-[hsl(45,100%,50%)]">
                         {acc.assigned_plan || '—'}
                       </td>
                       <td className="px-4 py-3">
                         {!acc.is_used && (
                           <button
                             onClick={() => handleDelete(acc.id)}
                             className="p-1.5 rounded-lg hover:bg-[hsl(0,72%,51%,0.15)] text-[hsl(0,72%,60%)] transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
