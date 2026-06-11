import { create } from 'zustand';

// --- Types & interface ---

export type ListingType = 'sell' | 'rent' | 'exchange';
export type AdLevel = 'normal' | 'premium'; // إعلان عادي vs إعلان مميز

export interface SelectionItem {
  id: string;
  label: string;
}

// State interface containing all possible fields across all tabs
export interface ListingStateData {
  // 1. Core/Shared Fields
  listingType: ListingType;
  governorate: SelectionItem | null;
  area: SelectionItem | null;
  propertyCategory: SelectionItem | null;
  areaSize: string; // المساحة
  automatedNumber: string; // الرقم الالي للعقار
  rooms: number;
  baths: number;
  features: string[]; // المزايا (Array of IDs)
  mapLocation: string | null; // e.g., "Lat, Lng" or a location object
  propertyAge: string;

  showPrice: boolean; // Toggle state
  showIncome: boolean; // Toggle state
  propertyIncome: string; // The text input value

  // 2. Pricing & Financials (Dynamic based on tab)
  price: string; // للبيع
  monthlyRent: string; // للايجار
  additionalExpenses: string; // للايجار

  // 3. Exchange Specific (للبدل)
  requestYear: string;
  requiredYear: string;
  allocationState: string; // حالة التخصيص

  // 4. Details & Contact
  rentConditions: string; // شروط الايجار
  adDetails: string; // تفاصيل الاعلان
  phoneNumber: string;

  // 5. Meta
  adLevel: AdLevel;
  images: string[]; // Array of local image URIs
}

// Interface for the Zustand Store Methods
interface ListingStore extends ListingStateData {
  // Actions
  setListingType: (type: ListingType) => void;
  updateField: <K extends keyof ListingStateData>(
    field: K,
    value: ListingStateData[K],
  ) => void;
  addImages: (uris: string[]) => void;
  removeImage: (index: number) => void;
  resetForm: () => void;

  // Getters
  getPreviewData: () => ListingStateData;
}

// --- Initial State ---
const initialState: Omit<ListingStateData, 'listingType'> = {
  governorate: null,
  area: null,
  propertyCategory: null,
  areaSize: '',
  automatedNumber: '',
  rooms: 1,
  baths: 1,
  features: [],
  mapLocation: null,
  propertyAge: '',
  showPrice: true,
  showIncome: false,
  propertyIncome: '',
  price: '',
  monthlyRent: '',
  additionalExpenses: '',
  requestYear: '',
  requiredYear: '',
  allocationState: '',
  rentConditions: '',
  adDetails: '',
  phoneNumber: '',
  adLevel: 'normal',
  images: [],
};

// --- Store Implementation ---
export const useListingStore = create<ListingStore>((set, get) => ({
  listingType: 'sell', // Default to Sell
  ...initialState,

  // Change the top-level radio button (Sell/Rent/Exchange)
  setListingType: (type) => set({ listingType: type }),

  // Generic field updater ensuring type safety
  updateField: (field, value) => set({ [field]: value }),

  // Image Handlers
  addImages: (uris) => set((state) => ({ images: [...state.images, ...uris] })),
  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),

  // Reset the entire form back to default
  resetForm: () => set({ listingType: 'sell', ...initialState }),

  // Serializer function for the Preview Screen
  getPreviewData: () => {
    return get();
  },
}));
