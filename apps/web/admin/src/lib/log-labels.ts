import { BackendAdminActionType } from './admin-logs'

export const LOG_ACTION_LABEL: Record<BackendAdminActionType, string> = {
  PROPERTY_DELETED: 'حذف اعلان',
  PROPERTY_HIDDEN: 'اخفاء اعلان',
  PROPERTY_UNHIDDEN: 'إظهار اعلان',
  PROPERTY_FEATURED: 'تمييز اعلان',
  PROPERTY_REPUBLISHED: 'اعادة نشر اعلان',
  REPORT_RESOLVED: 'حل بلاغ',
  REPORT_DISMISSED: 'رفض بلاغ',
  REPORT_ASSIGNED: 'اسناد بلاغ',
  REPORT_PRIORITY_CHANGED: 'تغيير أولوية بلاغ',
  IDENTITY_APPROVED: 'الموافقة على هوية',
  IDENTITY_REJECTED: 'رفض هوية',
  IDENTITY_EDIT_REQUESTED: 'طلب تعديل هوية',
  COUPON_GRANTED: 'منح كوبون خصم',
  COUPON_BULK_GRANTED: 'منح كوبون خصم جماعي',
  USER_STATUS_CHANGED: 'تغيير حالة حساب',
  USER_NOTIFIED: 'إرسال إشعار',
  PLAN_CHANGED: 'تغيير الباقة',
  EXCEPTIONAL_FEATURE_GRANTED: 'منح مميزات استثنائية',
  COMPANY_PROJECT_DELETED: 'حذف مشروع من المعرض',
  PLAN_UPDATED: 'تعديل باقة',
}

export const LOG_TARGET_TYPE_LABEL: Record<string, string> = {
  PROPERTY: 'اعلان',
  REPORT: 'بلاغ',
  IDENTITY: 'هوية',
  COUPON: 'كوبون',
  USER: 'مستخدم',
  PLAN: 'باقة',
  COMPANY_PROJECT: 'مشروع',
}
