import { api } from './api';

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalUsersChangePct: number;
  trialAccounts: number;
  trialAccountsChangePct: number;
  revenueTotal: number;
  revenueChangePct: number;
  newReportsCount: number;
}

export interface AdminDashboardUsersByType {
  individual: number;
  company: number;
  office: number;
}

export interface AdminDashboardRevenueMonth {
  month: string;
  year: number;
  amount: number;
}

export interface AdminDashboardRecentRegistration {
  id: string;
  name: string;
  email: string;
  accountType: 'فرد' | 'شركة' | 'مكتب عقاري';
  planName: string | null;
  createdAt: string;
}

export interface AdminDashboardPendingVerification {
  identityId: string;
  name: string;
  type: 'شركة' | 'مكتب عقاري';
  licenseNumber: string | null;
  licenseActivity: string | null;
  licenseExpiry: string | null;
  logoUrl: string | null;
  createdAt: string;
  status?: string | null;
  sentAt?: string | null;
}

export interface AdminDashboardResponse {
  metrics: AdminDashboardMetrics;
  usersByType: AdminDashboardUsersByType;
  revenueByMonth: AdminDashboardRevenueMonth[];
  recentRegistrations: AdminDashboardRecentRegistration[];
  pendingVerifications: AdminDashboardPendingVerification[];
}

export async function fetchAdminDashboard(): Promise<AdminDashboardResponse> {
  const res = await api.get('/admin/dashboard');
  return res.data;
}

export interface UpdateIdentityStatusOptions {
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
  notifyEmail?: boolean;
  notifyInApp?: boolean;
}

export async function updateIdentityStatus(
  identityId: string,
  options: UpdateIdentityStatusOptions,
) {
  const res = await api.patch(`/admin/identities/${identityId}/status`, options);
  return res.data;
}

export interface RequestIdentityEditOptions {
  notes: string;
  notifyEmail?: boolean;
  notifyInApp?: boolean;
}

export async function requestIdentityEdit(
  identityId: string,
  options: RequestIdentityEditOptions,
) {
  const res = await api.post(
    `/admin/identities/${identityId}/request-edit`,
    options,
  );
  return res.data;
}

// Formats an ISO timestamp as a short Arabic relative time string, e.g.
// "منذ ساعتين" -- matches apps/mobile's formatTimeAgo convention.
export function formatRelativeArabicTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'الآن';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? 'منذ دقيقة' : `منذ ${minutes} دقيقة`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'منذ ساعة' : `منذ ${hours} ساعة`;

  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? 'منذ يوم' : `منذ ${days} يوم`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? 'منذ شهر' : `منذ ${months} شهر`;

  const years = Math.floor(months / 12);
  return years === 1 ? 'منذ سنة' : `منذ ${years} سنة`;
}
