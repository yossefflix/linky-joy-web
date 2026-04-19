import { Link, Click, AnalyticsData, AdminStats } from './types';

export const mockLinks: Link[] = [
  {
    id: '1',
    user_id: 'user-1',
    original_url: 'https://www.example.com/very-long-url-that-needs-shortening/page/1',
    short_code: 'Ab3kL9',
    title: 'Example Page',
    created_at: '2026-03-10T10:00:00Z',
    is_active: true,
    total_clicks: 142,
  },
  {
    id: '2',
    user_id: 'user-1',
    original_url: 'https://docs.google.com/document/d/1234567890/edit',
    short_code: 'Xf7mQ2',
    title: 'Google Doc',
    created_at: '2026-03-12T14:30:00Z',
    is_active: true,
    total_clicks: 87,
  },
  {
    id: '3',
    user_id: 'user-1',
    original_url: 'https://github.com/user/repository/pull/42',
    short_code: 'Gh9pR4',
    custom_code: 'my-pr',
    title: 'GitHub PR',
    created_at: '2026-03-14T09:15:00Z',
    expires_at: '2026-04-14T09:15:00Z',
    is_active: true,
    total_clicks: 23,
  },
  {
    id: '4',
    user_id: 'user-1',
    original_url: 'https://private-docs.company.com/secret-report',
    short_code: 'Pw2sT6',
    title: 'Private Report',
    created_at: '2026-03-15T16:00:00Z',
    password: 'secret123',
    is_active: true,
    total_clicks: 5,
  },
];

export const mockClicksOverTime = [
  { date: 'Mar 10', clicks: 12 },
  { date: 'Mar 11', clicks: 28 },
  { date: 'Mar 12', clicks: 35 },
  { date: 'Mar 13', clicks: 22 },
  { date: 'Mar 14', clicks: 45 },
  { date: 'Mar 15', clicks: 67 },
  { date: 'Mar 16', clicks: 48 },
];

export const mockCountries = [
  { country: 'United States', clicks: 89 },
  { country: 'United Kingdom', clicks: 34 },
  { country: 'Germany', clicks: 28 },
  { country: 'France', clicks: 21 },
  { country: 'Japan', clicks: 15 },
];

export const mockDevices = [
  { device: 'Desktop', clicks: 120 },
  { device: 'Mobile', clicks: 85 },
  { device: 'Tablet', clicks: 22 },
];

export const mockBrowsers = [
  { browser: 'Chrome', clicks: 105 },
  { browser: 'Safari', clicks: 52 },
  { browser: 'Firefox', clicks: 38 },
  { browser: 'Edge', clicks: 22 },
  { browser: 'Other', clicks: 10 },
];

export const mockAnalytics: AnalyticsData = {
  clicksOverTime: mockClicksOverTime,
  topCountries: mockCountries,
  devices: mockDevices,
  browsers: mockBrowsers,
};

export const mockAdminStats: AdminStats = {
  totalUsers: 1247,
  totalLinks: 8934,
  totalClicks: 142567,
};

let linksStore = [...mockLinks];

export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getLinks(): Link[] {
  return linksStore;
}

export function addLink(originalUrl: string, customCode?: string, password?: string, expiresAt?: string): Link {
  const newLink: Link = {
    id: String(linksStore.length + 1),
    user_id: 'user-1',
    original_url: originalUrl,
    short_code: customCode || generateShortCode(),
    custom_code: customCode,
    title: new URL(originalUrl).hostname,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
    password: password,
    is_active: true,
    total_clicks: 0,
  };
  linksStore = [newLink, ...linksStore];
  return newLink;
}

export function deleteLink(id: string): void {
  linksStore = linksStore.filter(l => l.id !== id);
}
