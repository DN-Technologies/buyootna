import { create } from 'zustand';

import { CreatePropertyPayload, propertiesService } from '@/shared/api/properties.service';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';
import type { PropertyDetailsDto } from '@/types/property';

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
  floors: number;
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

  // 7. Edit State
  // 7. Edit State
  isEdit: boolean;

  // 8. Backend Features list
  backendFeatures: {
    sell: SelectionItem[];
    rent: SelectionItem[];
    exchange: SelectionItem[];
  } | null;
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
  fetchFeatures: () => Promise<void>;

  // Submission
  setSubmitting: (value: boolean) => void;
  setSubmissionError: (error: string | null) => void;

  // Getters
  getPreviewData: () => ListingStateData;
  buildApiPayload: (
    isDraft: boolean,
    uploadedImageUrls: string[],
    planSlotId?: string,
  ) => CreatePropertyPayload;
  populateFromProperty: (property: PropertyDetailsDto) => void;
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
  rooms: 0,
  baths: 0,
  floors: 0,
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
  adLevel: 'premium',
  images: [],
  isSubmitting: false,
  submissionError: null,
  isEdit: false,
  backendFeatures: null,
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
  // Defensive cap -- MAX_IMAGES (10) is enforced by the picker UI itself,
  // but never let the store silently exceed it regardless of caller.
  addImages: (uris) =>
    set((state) => ({
      images: [...state.images, ...uris].slice(0, 10),
    })),
  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),

  // Reset the entire form back to default
  resetForm: () => set({ listingType: 'sell', ...initialState }),

  fetchFeatures: async () => {
    try {
      const data = await propertiesService.getFeaturesMetadata();
      set({ backendFeatures: data });
    } catch (e) {
      console.error('Failed to fetch features metadata:', e);
    }
  },

  // Submission state helpers
  setSubmitting: (value) => set({ isSubmitting: value }),
  setSubmissionError: (error) => set({ submissionError: error }),

  populateFromProperty: (property) => {
    // Reverse map CATEGORY
    const categoryId = Object.keys(CATEGORY_MAP).find(
      (key) => CATEGORY_MAP[key] === property.category,
    ) || 'residential';
    
    const categoryLabel = {
      apartment: 'شقة',
      house: 'بيت',
      villa: 'فيلا',
      commercial: 'تجاري',
      investment: 'استثماري',
      residential: 'سكني',
      industrial: 'صناعي',
      coastal: 'ساحلي',
      office: 'مكتب',
      private: 'خاص',
      building: 'عمارة',
      land: 'أرض',
      chalet: 'شاليه',
    }[categoryId] || 'سكني';

    // Lookup governorate and area from locations
    let governorate = GOVERNORATES.find(g => g.id === property.governorateId) || null;
    let area = property.governorateId && property.areaId 
      ? (AREAS[property.governorateId]?.find(a => a.id === property.areaId) || null) 
      : null;

    // Fallback: if governorate or area is not found, look up based on the location text
    if ((!governorate || !area) && property.location) {
      const cleanLoc = property.location.replace(/،/g, ' ').replace(/\s+/g, ' ').trim();
      let foundGovId: string | null = null;
      let foundArea: any = null;

      for (const [govId, areaList] of Object.entries(AREAS)) {
        const matchingArea = areaList.find(
          a => cleanLoc.includes(a.label) || a.label.includes(cleanLoc)
        );
        if (matchingArea) {
          foundGovId = govId;
          foundArea = matchingArea;
          break;
        }
      }

      if (foundGovId && foundArea) {
        governorate = GOVERNORATES.find(g => g.id === foundGovId) || null;
        area = foundArea;
      }
    }

    set({
      isEdit: true,
      listingType: property.type === 'SALE' ? 'sell' : property.type === 'RENT' ? 'rent' : 'exchange',
      governorate,
      area,
      propertyCategory: { id: categoryId, label: categoryLabel },
      areaSize: property.areaSize ? property.areaSize.toString() : '',
      automatedNumber: property.automatedNumber || '',
      rooms: property.beds ?? 0,
      baths: property.baths ?? 0,
      floors: property.floors || 0,
      features: property.features
        ? (property.features as any[]).map((f: any) => f.label || f)
        : [],
      propertyAge: property.propertyAge ? property.propertyAge.toString() : '',
      showPrice: property.price !== null && property.price !== undefined,
      price: property.price ? property.price.toString() : '',
      monthlyRent: property.price ? property.price.toString() : '',
      requestYear: property.requestYear ? property.requestYear.toString() : '',
      requiredYear: property.requiredYear ? property.requiredYear.toString() : '',
      adDetails: property.description || '',
      phoneNumber: property.phoneNumber || '',
      images: property.images || [],
      adLevel: property.isFeatured ? 'premium' : 'normal',
    });
  },

  // Serializer function for the Preview Screen
  getPreviewData: () => {
    return get();
  },

  /**
   * Transforms the Zustand store state into the exact shape
   * the backend's CreatePropertyDto expects.
   */
  buildApiPayload: (isDraft, uploadedImageUrls, planSlotId) => {
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
      planSlotId,
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
    if (state.propertyCategory?.id !== 'apartment') {
      payload.floors = state.floors;
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
