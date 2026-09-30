import {
  MarketProperty,
  OfficeConversation,
  OfficeGroupActivity,
  OfficeListing,
  OfficeService,
  OfficeStats,
} from './types';

export const OFFICE_STATS_MOCK: OfficeStats = {
  activeListings: 3,
  activeListingsSubtitle: '3 هذا الأسبوع',
  activeServices: 3,
  activeServicesSubtitle: '3',
  views: '700+',
  viewsSubtitle: '+700',
  newMessages: 5,
  newMessagesSubtitle: '5 اليوم',
};

export const OFFICE_LISTINGS_MOCK: OfficeListing[] = [
  {
    id: 'listing-1',
    title: 'شقة سكني للبيع',
    price: '150,000',
    currency: 'د.ك',
    tag: 'التمييز نشط حتى 25 مايو',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    ],
    viewsCount: 100,
    favoritesCount: 20,
    chatsCount: 3,
  },
  {
    id: 'listing-2',
    title: 'شقة سكني للبيع',
    price: '150,000',
    currency: 'د.ك',
    tag: 'مميز',
    images: [
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    viewsCount: 100,
    favoritesCount: 20,
    chatsCount: 3,
  },
];

export const OFFICE_SERVICES_MOCK: OfficeService[] = [
  {
    id: 'service-1',
    title: 'عقار للايجار',
    description:
      'هل تبحث عن السكن المثالي وميزانية محددة؟ أخبرنا بطلبك وسنقوم بمسح السوق، معاينة الوحدات، وجلب خيارات الإيجار الأكثر ملاءمة لك فوراً.',
    iconName: 'building',
    requestTag: '12 طلب جديد',
    actionLabel: 'إدارة الخدمة',
  },
  {
    id: 'service-2',
    title: 'البحث عن عقار للشراء',
    description:
      'هل تبحث عن السكن المثالي وميزانية محددة؟ أخبرنا بطلبك وسنقوم بمسح السوق، معاينة الوحدات، وجلب خيارات الإيجار الأكثر ملاءمة لك فوراً.',
    iconName: 'search',
    requestTag: '12 طلب جديد',
    actionLabel: 'إدارة الإعلان',
  },
  {
    id: 'service-3',
    title: 'طلب تنسيق وتبادل عقاري',
    description:
      'إذا كان لديك طلب بدل في منطقة معينة وتبحث عن الطرف الآخر المناسب، سجل داتا عقارك والمنطقة المستهدفة، وسنتولى نحن مطابقة وتسهيل عملية التبادل.',
    iconName: 'repeat',
    requestTag: '12 طلب نشط',
    actionLabel: 'إدارة الإعلان',
  },
];

export const MARKET_PROPERTIES_MOCK: MarketProperty[] = [
  {
    id: 'market-1',
    title: 'عمارة للبيع',
    isFeatured: true,
    price: '150,000',
    currency: 'د.ك',
    space: '200 م2',
    location: 'السالمية',
    propertyIncome: '150,000 د.ك',
  },
  {
    id: 'market-2',
    title: 'أرض للبدل',
    isFeatured: true,
    price: 'السعر غير معلن',
    space: '200 م2',
    location: 'السالمية',
    exchangeRequirements: {
      source: 'طلب 2021',
      target: '2023',
    },
  },
  {
    id: 'market-3',
    title: 'بيت للبيع',
    isFeatured: false,
    price: '150,000',
    currency: 'د.ك',
    space: '200 م2',
    location: 'السالمية',
    propertyIncome: '0 د.ك',
  },
  {
    id: 'market-4',
    title: 'شقة للايجار',
    isFeatured: false,
    price: '150,000',
    currency: 'د.ك',
    space: '200 م2',
    location: 'السالمية',
  },
];

export const OFFICE_CONVERSATIONS_MOCK: OfficeConversation[] = [
  {
    id: 'conv-1',
    clientName: 'عبد العزيز الرشيدي',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    categoryTag: 'عقار للشراء',
    lastMessage: 'هل متاح معاينة الشقة السكنية غدا لل...',
    unreadCount: 3,
    timeAgo: 'منذ ساعتين',
  },
  {
    id: 'conv-2',
    clientName: 'عبد العزيز الرشيدي',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    categoryTag: 'عقار للشراء',
    lastMessage: 'هل متاح معاينة الشقة السكنية غدا لل...',
    unreadCount: 3,
    timeAgo: 'منذ ساعتين',
  },
  {
    id: 'conv-3',
    clientName: 'عبد العزيز الرشيدي',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    categoryTag: 'عقار للشراء',
    lastMessage: 'هل متاح معاينة الشقة السكنية غدا لل...',
    unreadCount: 3,
    timeAgo: 'منذ ساعتين',
  },
];

export const OFFICE_GROUPS_MOCK: OfficeGroupActivity[] = [
  {
    id: 'group-1',
    groupName: 'وسطاء الكويت العقاريين',
    avatarLetter: 'ج',
    lastMessage: 'هل متاح معاينة الشقة السكنية غد...',
    unreadCount: 3,
    timeAgo: 'منذ ساعتين',
  },
  {
    id: 'group-2',
    groupName: 'وسطاء الكويت العقاريين',
    avatarLetter: 'ج',
    lastMessage: 'هل متاح معاينة الشقة السكنية غد...',
    unreadCount: 3,
    timeAgo: 'منذ ساعتين',
  },
  {
    id: 'group-3',
    groupName: 'وسطاء الكويت العقاريين',
    avatarLetter: 'ج',
    lastMessage: 'هل متاح معاينة الشقة السكنية غدا لل...',
    unreadCount: 3,
    timeAgo: 'منذ ساعتين',
  },
];
