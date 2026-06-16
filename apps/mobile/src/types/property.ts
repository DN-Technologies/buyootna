export interface PropertyDetailsDto {
  id: string;
  type: 'SALE' | 'RENT' | 'EXCHANGE';
  category: string;
  isFeatured: boolean;
  price: number;
  area: number;
  beds: number;
  baths: number;
  location: string;
  description: string;
  views: number;
  images: string[];
  createdAt: string;
  floors?: number;
  requestYear?: number;
  requiredYear?: number;
  licenseNumber?: string;
  host: {
    id: string;
    name: string;
    avatarUrl: string;
    joinedDate: string;
    isVerified: boolean;
    rating: number;
  };
}
