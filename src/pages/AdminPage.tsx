import { useState, useEffect } from 'react';
import { getAdminStats } from '@/services/adminService';
import { AdminStats } from '@/lib/types';
import { Users, Link2, MousePointerClick } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Total Links', value: stats.totalLinks, icon: Link2, color: 'text-success' },
    { label: 'Total Clicks', value: stats.totalClicks, icon: MousePointerClick, color: 'text-info' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-accent flex items-center justify-center ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{card.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">
          Connect your Vercel API backend to enable full admin functionality including user management and link moderation.
        </p>
      </div>
    </div>
  );
}
