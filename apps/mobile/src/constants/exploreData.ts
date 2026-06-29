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
import { CategoryItemProps } from '@/components/explore/CategoryItem';

export const propertiesData: CategoryItemProps[] = [
  {
    icon: SaleIcon,
    title: 'بيع',
    onPress: () => console.log('Sale category'),
    iconSize: 26,
  },
  {
    icon: RentIcon,
    title: 'ايجار',
    onPress: () => console.log('Rent category'),
    iconSize: 26,
  },
  {
    icon: SwapIcon,
    title: 'بدل',
    onPress: () => console.log('Swap category'),
    iconSize: 22,
  },
];

export const companyServicesData: CategoryItemProps[] = [
  {
    icon: InterDesignIcon,
    title: 'تصميم داخلي',
    onPress: () => console.log('Interior design'),
    iconColor: '#111111',
    iconSize: 26,
  },
  {
    icon: FinishedIcon,
    title: 'تشطيب',
    onPress: () => console.log('Finishing'),
    iconColor: '#111111',
    iconSize: 26,
  },
  {
    icon: PoolIcon,
    title: 'حمام سباحة',
    onPress: () => console.log('Swimming pool'),
    iconColor: '#111111',
    iconSize: 26,
  },
  {
    icon: OfficesIcon,
    title: 'مكاتب هندسية',
    onPress: () => console.log('Engineering offices'),
    iconColor: '#111111',
    iconSize: 24,
  },
];

export const listsData: CategoryItemProps[] = [
  {
    icon: AuctionsIcon,
    title: 'مزادات',
    onPress: () => console.log('Auctions'),
    iconSize: 26,
  },
  {
    icon: DealsIcon,
    title: 'صفقات',
    onPress: () => console.log('Deals'),
    iconSize: 24,
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
