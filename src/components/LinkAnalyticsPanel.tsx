import { useState, useEffect } from 'react';
import { getLinkAnalytics } from '@/services/analyticsService';
import { AnalyticsData } from '@/lib/types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['hsl(250, 80%, 58%)', 'hsl(280, 80%, 60%)', 'hsl(320, 70%, 55%)', 'hsl(200, 80%, 50%)', 'hsl(142, 72%, 42%)'];

interface LinkAnalyticsPanelProps {
  linkId: string;
}

export default function LinkAnalyticsPanel({ linkId }: LinkAnalyticsPanelProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    getLinkAnalytics(linkId).then(setData).catch(() => {});
  }, [linkId]);

  if (!data) return null;

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-display font-bold">Link Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks Over Time */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Clicks Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.clicksOverTime}>
              <defs>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(250, 80%, 58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(250, 80%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(220, 16%, 90%)', fontSize: '14px' }} />
              <Area type="monotone" dataKey="clicks" stroke="hsl(250, 80%, 58%)" fill="url(#clicksGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Countries */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Countries</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topCountries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis dataKey="country" type="category" width={100} tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(220, 16%, 90%)' }} />
              <Bar dataKey="clicks" fill="hsl(250, 80%, 58%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Devices</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.devices} dataKey="clicks" nameKey="device" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.devices.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(220, 16%, 90%)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Browser Distribution */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Browsers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.browsers} dataKey="clicks" nameKey="browser" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.browsers.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(220, 16%, 90%)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
