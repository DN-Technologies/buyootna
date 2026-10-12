// The kinds of account a visitor can open, as the sign-up picker lists them
export type AccountType = 'individual' | 'office' | 'company'

export const ACCOUNT_TYPES: {
  id: AccountType
  label: string
  description: string
  icon: string
  iconSize: number
}[] = [
  {
    id: 'individual',
    label: 'فرد',
    description:
      'للاشخاص الراغبين في إضافة إعلان بيع أو إيجار أو بدل لعقارهم الخاص.',
    icon: '/landing/type-individual.svg',
    iconSize: 20,
  },
  {
    id: 'office',
    label: 'مكتب عقاري',
    description: 'للمكاتب العقارية التي تقدم خدمات واستشارات عقارية.',
    icon: '/landing/type-office.svg',
    iconSize: 20,
  },
  {
    id: 'company',
    label: 'شركة',
    description:
      'للمكاتب العقارية والهندسية أو محلات المقاولات التي تقدم خدمات بيع، تسويق، تصميم.',
    icon: '/landing/type-company.svg',
    iconSize: 25,
  },
]

export const isAccountType = (value: unknown): value is AccountType =>
  ACCOUNT_TYPES.some((type) => type.id === value)
