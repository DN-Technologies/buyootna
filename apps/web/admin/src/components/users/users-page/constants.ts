import { UserCategoryTab } from '@/components/users/UserTabs'

export interface UserPageCategoryConfig {
  title: string
  subtitle: string
  breadcrumbs: string[]
  addLabel: string
  totalStatTitle: string
  userLabel: string
  entityName: string
  entitySingle: string
}

export const USER_CATEGORY_CONFIGS: Record<UserCategoryTab, UserPageCategoryConfig> = {
  all: {
    title: 'المستخدمين',
    subtitle: 'إدارة جميع حسابات المستخدمين، ومتابعة الاشتراكات والحالة والنشاط.',
    breadcrumbs: ['الرئيسية', 'إدارة الحسابات', 'المستخدمين'],
    addLabel: 'إضافة مستخدم',
    totalStatTitle: 'إجمالي المستخدمين',
    userLabel: 'اسم المستخدم',
    entityName: 'مستخدمين',
    entitySingle: 'مستخدم',
  },
  company: {
    title: 'الشركات',
    subtitle: 'إدارة جميع حسابات الشركات والمطورين العقاريين، ومتابعة الاشتراكات والحالة والنشاط.',
    breadcrumbs: ['الرئيسية', 'إدارة الحسابات', 'الشركات'],
    addLabel: 'إضافة شركة',
    totalStatTitle: 'إجمالي الشركات',
    userLabel: 'اسم الشركة',
    entityName: 'شركات',
    entitySingle: 'شركة',
  },
  office: {
    title: 'المكاتب العقارية',
    subtitle: 'إدارة جميع حسابات المكاتب والوسطاء العقاريين، ومتابعة الاشتراكات والحالة والنشاط.',
    breadcrumbs: ['الرئيسية', 'إدارة الحسابات', 'المكاتب العقارية'],
    addLabel: 'إضافة مكتب عقاري',
    totalStatTitle: 'إجمالي المكاتب',
    userLabel: 'اسم المكتب',
    entityName: 'مكاتب',
    entitySingle: 'مكتب عقاري',
  },
  individual: {
    title: 'الأفراد',
    subtitle: 'إدارة جميع حسابات الأفراد، ومتابعة الاشتراكات والحالة والنشاط.',
    breadcrumbs: ['الرئيسية', 'إدارة الحسابات', 'الأفراد'],
    addLabel: 'إضافة فرد',
    totalStatTitle: 'إجمالي الأفراد',
    userLabel: 'اسم الفرد',
    entityName: 'أفراد',
    entitySingle: 'فرد',
  },
}

export function getUserCategoryConfig(tab: UserCategoryTab): UserPageCategoryConfig {
  return USER_CATEGORY_CONFIGS[tab] || USER_CATEGORY_CONFIGS.individual
}

export function getRoleFromTab(
  tab: UserCategoryTab,
): 'INDIVIDUAL' | 'OFFICE' | 'COMPANY' | undefined {
  if (tab === 'individual') return 'INDIVIDUAL'
  if (tab === 'office') return 'OFFICE'
  if (tab === 'company') return 'COMPANY'
  return undefined
}
