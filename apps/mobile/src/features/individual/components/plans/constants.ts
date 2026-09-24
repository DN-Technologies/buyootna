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
      id: 'basic-2',
      slug: 'regular',
      adsCount: 2,
      label: 'باقة 2 اعلان',
      price: '10 د.ك',
    },
    {
      id: 'basic-5',
      slug: 'regular',
      adsCount: 5,
      label: 'باقة 5 اعلانات',
      price: '22.5 د.ك',
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
      price: '12 د.ك',
    },
    {
      id: 'gold-5',
      slug: 'gold',
      adsCount: 5,
      label: 'باقة 5 اعلانات',
      price: '50 د.ك',
    },
  ],
};

export const PLAN_TIERS: PlanTier[] = [BASIC_TIER, GOLD_TIER];
