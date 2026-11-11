export type PlanTierId = 'basic' | 'gold';

export interface PlanOption {
  id: string;
  slug: string;
  adsCount: number;
  label: string;
  price: string;
}

export interface PlanTier {
  id: PlanTierId;
  title: string;
  features: string[];
  options: PlanOption[];
  recommended: boolean;
}

export const BASIC_TIER: PlanTier = {
  id: 'basic',
  title: 'الباقة الاساسية',
  recommended: false,
  features: [
    'مدة النشر 30 يوم.',
    'حتى 5 صورة للعقار.',
    'ظهور في نتائج البحث.',
    'تواصل مباشر مع المهتمين.',
  ],
  options: [
    {
      id: 'basic-1',
      slug: 'regular',
      adsCount: 1,
      label: 'باقة 1 اعلان',
      price: '2 د.ك',
    },
    {
      id: 'basic-3',
      slug: 'regular',
      adsCount: 3,
      label: 'باقة 3 اعلانات',
      price: '6 د.ك',
    },
  ],
};

export const GOLD_TIER: PlanTier = {
  id: 'gold',
  title: 'الباقة الذهبية',
  recommended: true,
  features: [
    'تمييز الاعلانات.',
    'حتى 15 صورة للعقار.',
    'مدة النشر 30 يوم.',
    'ظهور في أعلى نتائج البحث.',
    'اولوية الظهور في البحث الجغرافي.',
  ],
  options: [
    {
      id: 'gold-1',
      slug: 'gold',
      adsCount: 1,
      label: 'باقة 1 اعلان',
      price: '7 د.ك',
    },
    {
      id: 'gold-3',
      slug: 'gold',
      adsCount: 3,
      label: 'باقة 3 اعلانات',
      price: '17.5 د.ك',
    },
  ],
};

export const PLAN_TIERS: PlanTier[] = [BASIC_TIER, GOLD_TIER];
