export interface OfficeListing {
  id: string;
  title: string;
  price: string | number;
  currency?: string;
  tag?: string;
  images: string[];
  viewsCount: number;
  favoritesCount: number;
  chatsCount: number;
}

export interface OfficeService {
  id: string;
  title: string;
  description: string;
  iconName: 'building' | 'search' | 'repeat';
  requestTag?: string;
  actionLabel?: string;
}

export interface MarketProperty {
  id: string;
  title: string;
  isFeatured?: boolean;
  price: string | number;
  currency?: string;
  space: string;
  location: string;
  propertyIncome?: string | number | null;
  exchangeRequirements?: {
    source: string;
    target: string;
  };
}

export interface OfficeConversation {
  id: string;
  clientName: string;
  avatarUrl?: string;
  categoryTag: string;
  lastMessage: string;
  unreadCount: number;
  timeAgo: string;
}

export interface OfficeGroupActivity {
  id: string;
  groupName: string;
  avatarLetter: string;
  lastMessage: string;
  unreadCount: number;
  timeAgo: string;
}

export interface OfficeStats {
  activeListings: number;
  activeListingsSubtitle?: string;
  activeServices: number;
  activeServicesSubtitle?: string;
  views: string | number;
  viewsSubtitle?: string;
  newMessages: number;
  newMessagesSubtitle?: string;
}
