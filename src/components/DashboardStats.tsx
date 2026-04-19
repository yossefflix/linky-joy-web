import { Link2, MousePointerClick, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  totalLinks: number;
  totalClicks: number;
}

export default function DashboardStats({ totalLinks, totalClicks }: DashboardStatsProps) {
  const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

  const stats = [
    { label: 'Total Links', value: totalLinks, icon: Link2, color: 'text-primary' },
    { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick, color: 'text-success' },
    { label: 'Avg Clicks/Link', value: avgClicks, icon: TrendingUp, color: 'text-info' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="stat-card flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
