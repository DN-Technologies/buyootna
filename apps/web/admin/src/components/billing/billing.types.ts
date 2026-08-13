export interface SubscriptionRecord {
  id: string
  userName: string
  userEmail: string
  userRole: 'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
  packageName: 'العادية' | 'الفضية' | 'الذهبية'
  price: string
  status: 'نشط' | 'منتهي' | 'ملغي'
  startDate: string
  endDate: string
}

export interface BillingFilterState {
  searchQuery: string
  userRoleFilter: string
  packageFilter: string
  statusFilter: string
}
