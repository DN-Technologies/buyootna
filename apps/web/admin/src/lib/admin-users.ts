import { api } from './api';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'فرد' | 'شركة' | 'مكتب عقاري';
  verificationStatus: 'موثق' | 'غير موثق' | 'قيد الانتظار' | '—';
  subscriptionPlan: string;
  accountStatus: 'نشط' | 'محظور' | 'موقوف';
  registrationDate: string;
}

export interface AdminUsersFilters {
  search?: string;
  role?: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
  status?: 'active' | 'blocked' | 'suspended';
  page?: number;
  limit?: number;
}

export interface AdminUsersResponse {
  data: AdminUserRow[];
  meta: {
    total: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    active: number;
    blocked: number;
    suspended: number;
  };
  counts: {
    all: number;
    individual: number;
    office: number;
    company: number;
  };
}

export async function fetchAdminUsers(
  filters: AdminUsersFilters = {},
): Promise<AdminUsersResponse> {
  const params: Record<string, any> = {};
  if (filters.search) params.search = filters.search;
  if (filters.role) params.role = filters.role;
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const res = await api.get('/admin/users', { params });
  return res.data;
}

export async function updateUserStatus(
  id: string,
  status: 'active' | 'blocked' | 'suspended',
) {
  const res = await api.patch(`/admin/users/${id}/status`, { status });
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}

export interface AdminIdentityData {
  name: string;
  avatarUrl?: string | null;
  logoUrl?: string | null;
}

export interface AdminUserIdentity {
  id: string;
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
  individualData?: AdminIdentityData | null;
  companyData?: AdminIdentityData | null;
  officeData?: AdminIdentityData | null;
}

export interface AdminUserDetail {
  id: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE' | null;
  isBlocked: boolean;
  isDisabled: boolean;
  createdAt: string;
  activePlan?: { name: string } | null;
  identities: AdminUserIdentity[];
}

export async function fetchUserDetails(id: string): Promise<AdminUserDetail> {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
}

export async function updateIdentityStatus(
  identityId: string,
  status: 'APPROVED' | 'REJECTED',
) {
  const res = await api.patch(`/admin/identities/${identityId}/status`, {
    status,
  });
  return res.data;
}
