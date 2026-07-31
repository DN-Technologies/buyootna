import {
  AuctionsIcon,
  BuildCalcIcon,
  CalculateIcon,
  DealsIcon,
  FinishedIcon,
  InterDesignIcon,
  OfficesIcon,
  PoolIcon,
  RentIcon,
  SaleCalcIcon,
  SaleIcon,
  SwapIcon,
} from '@/assets/icons/explore';
import { CategoryItemProps } from '@/features/individual/components/explore/CategoryItem';

export const propertiesData: CategoryItemProps[] = [
  {
    icon: SaleIcon,
    title: 'بيع',
    iconSize: 26,
    searchTab: 'properties',
    searchFilters: { type: 'SALE' },
  },
  {
    icon: RentIcon,
    title: 'ايجار',
    iconSize: 26,
    searchTab: 'properties',
    searchFilters: { type: 'RENT' },
  },
  {
    icon: SwapIcon,
    title: 'بدل',
    iconSize: 22,
    searchTab: 'properties',
    searchFilters: { type: 'EXCHANGE' },
  },
];

export const companyServicesData: CategoryItemProps[] = [
  {
    icon: InterDesignIcon,
    title: 'تصميم داخلي',
    iconColor: '#111111',
    iconSize: 26,
    searchTab: 'companies',
    searchFilters: { service: 'interior_design' },
  },
  {
    icon: FinishedIcon,
    title: 'تشطيب',
    iconColor: '#111111',
    iconSize: 26,
    searchTab: 'companies',
    searchFilters: { service: 'finishing' },
  },
  {
    icon: PoolIcon,
    title: 'حمام سباحة',
    iconColor: '#111111',
    iconSize: 26,
    searchTab: 'companies',
    searchFilters: { service: 'swimming_pool' },
  },
  {
    icon: OfficesIcon,
    title: 'مكاتب هندسية',
    iconColor: '#111111',
    iconSize: 24,
    searchTab: 'companies',
    searchFilters: { service: 'engineering_offices' },
  },
];

export const listsData: CategoryItemProps[] = [
  {
    icon: AuctionsIcon,
    title: 'مزادات',
    iconSize: 26,
    searchTab: 'properties',
    searchFilters: { type: 'AUCTION' },
  },
  {
    icon: DealsIcon,
    title: 'صفقات',
    iconSize: 26,
    searchTab: 'properties',
    searchFilters: { type: 'DEAL' },
  },
];

export const smartCalculatorsData: CategoryItemProps[] = [
  {
    icon: CalculateIcon,
    title: 'حاسبة الايجار',
    isSoon: true,
    iconSize: 26,
  },
  {
    icon: SaleCalcIcon,
    title: 'حاسبة البيع',
    isSoon: true,
    iconSize: 24,
  },
  {
    icon: BuildCalcIcon,
    title: 'حاسبة البنيان',
    isSoon: true,
    iconSize: 24,
  },
];
