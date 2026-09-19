import { PlanDefinition } from './types'

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: 'basic',
    name: 'الباقة الاساسية',
    subTiers: [
      { id: 'basic_2', name: 'باقة 2 اعلان', price: '10 د.ك' },
      { id: 'basic_5', name: 'باقة 5 اعلانات', price: '22.5 د.ك' },
    ],
  },
  {
    id: 'gold',
    name: 'الباقة الذهبية',
    subTiers: [
      { id: 'gold_1', name: 'باقة 1 اعلان', price: '12 د.ك' },
      { id: 'gold_5', name: 'باقة 5 اعلانات', price: '50 د.ك' },
    ],
  },
]
