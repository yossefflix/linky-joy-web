export interface Link {
  id: string;
  user_id: string;
  original_url: string;
  short_code: string;
  custom_code?: string;
  title?: string;
  created_at: string;
  expires_at?: string;
  password?: string;
  is_active: boolean;
  total_clicks: number;
}

export interface Click {
  id: string;
  link_id: string;
  ip_address: string;
  country: string;
  device: string;
  browser: string;
  timestamp: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

export interface AnalyticsData {
  clicksOverTime: { date: string; clicks: number }[];
  topCountries: { country: string; clicks: number }[];
  devices: { device: string; clicks: number }[];
  browsers: { browser: string; clicks: number }[];
}

export interface AdminStats {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
}

export interface User {
  id: string;
  email: string;
}
