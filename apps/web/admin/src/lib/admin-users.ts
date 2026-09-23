import { api } from './api';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'فرد' | 'شركة' | 'مكتب عقاري';
  verificationStatus: 'موثق' | 'غير موثق' | 'قيد الانتظار' | '—';
  subscriptionPlan: string;
  adsCount?: number | string;
  accountStatus: 'نشط' | 'محظور' | 'موقوف';
  registrationDate: string;
}

export interface AdminUsersFilters {
  search?: string;
  role?: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
  status?: 'active' | 'blocked' | 'suspended';
  subscriptionPlan?: string;
  sortOrder?: 'asc' | 'desc';
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
  if (filters.subscriptionPlan) params.subscriptionPlan = filters.subscriptionPlan;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const res = await api.get('/admin/users', { params });
  return res.data;
}

export interface CreateAdminIndividualInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  planId?: string;
}

export async function createAdminIndividual(data: CreateAdminIndividualInput) {
  const res = await api.post('/admin/users/individual', data);
  return res.data;
}

export async function exportUsersCsv(filters: AdminUsersFilters = {}) {
  const params: Record<string, any> = {};
  if (filters.search) params.search = filters.search;
  if (filters.role) params.role = filters.role;
  if (filters.status) params.status = filters.status;
  if (filters.subscriptionPlan) params.subscriptionPlan = filters.subscriptionPlan;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const res = await api.get('/admin/users/export', {
    params,
    responseType: 'blob',
  });
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
  // Only present on companyData/officeData (identity verification status).
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AdminUserProperty {
  id: string;
  referenceNumber: number;
  type: 'SALE' | 'RENT' | 'EXCHANGE' | 'AUCTION' | 'DEAL';
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'CLOSED' | 'DELETED';
  isFeatured: boolean;
  isHidden: boolean;
  price: number | null;
  areaSize: number | null;
  location: string;
  images: string[];
  views: number;
  createdAt: string;
  description: string;
  beds: number | null;
  baths: number | null;
  floors: number | null;
  additionalExpenses: string | null;
  rentConditions: string | null;
  requiredYear: number | null;
  requestYear: number | null;
  features: unknown;
  savesCount?: number;
  contactsCount?: number;
  deletionInfo?: {
    deletedAt: string;
    deletedBy: string;
    reason: string;
  };
}

export interface AdminUserIdentity {
  id: string;
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
  individualData?: AdminIdentityData | null;
  companyData?: AdminIdentityData | null;
  officeData?: AdminIdentityData | null;
  properties?: AdminUserProperty[];
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

export async function sendUserPasswordResetLink(
  userId: string,
): Promise<{ message: string; email: string }> {
  const res = await api.post(`/admin/users/${userId}/reset-password`);
  return res.data;
}

export interface AvailableCoupon {
  id: string;
  name: string;
  code: string;
  discount: string;
}

export interface GrantUserCouponInput {
  couponCode: string;
  couponName?: string;
  notifyEmail?: boolean;
  notifyApp?: boolean;
}

export async function fetchAvailableCoupons(): Promise<AvailableCoupon[]> {
  const res = await api.get('/admin/coupons');
  return res.data;
}

export async function grantUserCoupon(
  userId: string,
  data: GrantUserCouponInput,
): Promise<{ message: string; coupon: { code: string; name: string }; userId: string }> {
  const res = await api.post(`/admin/users/${userId}/coupon`, data);
  return res.data;
}

export interface GrantBulkCouponInput {
  userIds: string[];
  couponCode: string;
  couponName?: string;
  notifyEmail?: boolean;
  notifyApp?: boolean;
}

export async function grantBulkCoupons(
  data: GrantBulkCouponInput,
): Promise<{
  message: string;
  coupon: { code: string; name: string };
  grantedCount: number;
  grantedUserIds: string[];
}> {
  const res = await api.post('/admin/users/bulk/coupon', data);
  return res.data;
}



