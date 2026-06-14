import { create } from 'zustand';

import type { CreatePropertyPayload } from '@/core/api/properties.service';

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
  mapLocationLabel: string | null;
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

  // 6. Submission State
  isSubmitting: boolean;
  submissionError: string | null;
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

  // Submission
  setSubmitting: (value: boolean) => void;
  setSubmissionError: (error: string | null) => void;

  // Getters
  getPreviewData: () => ListingStateData;
  buildApiPayload: (
    isDraft: boolean,
    uploadedImageUrls: string[],
  ) => CreatePropertyPayload;
}

// --- Mapping Helpers ---

/** Maps frontend listingType → backend ListingType enum */
const LISTING_TYPE_MAP: Record<ListingType, 'SALE' | 'RENT' | 'EXCHANGE'> = {
  sell: 'SALE',
  rent: 'RENT',
  exchange: 'EXCHANGE',
};

/** Maps frontend category IDs → backend PropertyCategory enum */
const CATEGORY_MAP: Record<string, string> = {
  apartment: 'APARTMENT',
  house: 'HOUSE',
  villa: 'VILLA',
  commercial: 'COMMERCIAL',
  investment: 'INVESTMENT',
  residential: 'RESIDENTIAL',
  industrial: 'INDUSTRIAL',
  coastal: 'COASTAL',
  office: 'OFFICE',
  private: 'PRIVATE',
  building: 'BUILDING',
  land: 'LAND',
  chalet: 'CHALET',
};

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
  mapLocationLabel: null,
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
  isSubmitting: false,
  submissionError: null,
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

  // Submission state helpers
  setSubmitting: (value) => set({ isSubmitting: value }),
  setSubmissionError: (error) => set({ submissionError: error }),

  // Serializer function for the Preview Screen
  getPreviewData: () => {
    return get();
  },

  /**
   * Transforms the Zustand store state into the exact shape
   * the backend's CreatePropertyDto expects.
   */
  buildApiPayload: (isDraft, uploadedImageUrls) => {
    const state = get();
    const apiType = LISTING_TYPE_MAP[state.listingType];

    // Build the base payload with fields required for all listing types
    const payload: CreatePropertyPayload = {
      isDraft,
      type: apiType,
      category: CATEGORY_MAP[state.propertyCategory?.id ?? ''] ?? 'RESIDENTIAL',
      areaSize: parseFloat(state.areaSize) || 0,
      beds: state.rooms,
      baths: state.baths,
      location: [state.governorate?.label, state.area?.label]
        .filter(Boolean)
        .join(' - '),
      description: state.adDetails,
      images: uploadedImageUrls,
      isFeatured: state.adLevel === 'premium',
    };

    // Optional shared fields
    if (state.propertyAge) {
      payload.propertyAge = parseInt(state.propertyAge, 10);
    }
    if (state.phoneNumber) {
      payload.phoneNumber = state.phoneNumber;
    }
    if (state.automatedNumber) {
      payload.automatedNumber = state.automatedNumber;
    }

    // Map latitude and longitude from mapLocation
    if (state.mapLocation && state.mapLocation.includes(',')) {
      const [latStr, lngStr] = state.mapLocation.split(',');
      payload.latitude = parseFloat(latStr.trim());
      payload.longitude = parseFloat(lngStr.trim());
    }

    // Features (store as full objects for richer data)
    if (state.features.length > 0) {
      payload.features = state.features.map((id) => ({ id, label: id }));
    }

    // Governorate & Area FK (if they come from the database later)
    if (state.governorate?.id) {
      payload.governorateId = state.governorate.id;
    }
    if (state.area?.id) {
      payload.areaId = state.area.id;
    }

    // --- Type-specific fields ---

    // SALE
    if (apiType === 'SALE') {
      if (state.showPrice && state.price) {
        payload.price = parseFloat(state.price);
      }
      if (state.showIncome && state.propertyIncome) {
        payload.propertyIncome = parseFloat(state.propertyIncome);
      }
    }

    // RENT
    if (apiType === 'RENT') {
      if (state.showPrice && state.monthlyRent) {
        payload.price = parseFloat(state.monthlyRent);
      }
      if (state.additionalExpenses) {
        payload.additionalExpenses = state.additionalExpenses;
      }
      if (state.rentConditions) {
        payload.rentConditions = state.rentConditions;
      }
    }

    // EXCHANGE
    if (apiType === 'EXCHANGE') {
      if (state.requestYear) {
        payload.requestYear = parseInt(state.requestYear, 10);
      }
      if (state.requiredYear) {
        payload.requiredYear = parseInt(state.requiredYear, 10);
      }
      // Price is optional for exchange
      if (state.showPrice && state.price) {
        payload.price = parseFloat(state.price);
      }
    }

    return payload;
  },
}));
