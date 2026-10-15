import { create } from 'zustand';

import { CreatePropertyPayload, propertiesService } from '@/shared/api/properties.service';
import { formatDetails } from '@/shared/components/map/picker/addressParsing';
import type { AddressDetails } from '@/shared/components/map/picker/addressTypes';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';
import {
  findCategory,
  findCategoryByApiValue,
  getCategoryFields,
  isCategoryOffered,
} from '@/shared/utils/data/propertyCategories';
import { newSubmissionKey } from '@/shared/utils/submissionKey';
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
  // القطعة / الشارع / الجادة / المنزل / علامة مميزة from the map picker
  addressDetails: AddressDetails | null;
  propertyAge: string;

  // Per-category fields (requirements doc); which category has which is
  // getCategoryFields
  floorNumber: number; // شقة: رقم الدور
  apartmentsCount: number; // عمارة: عدد الشقق
  rentalStatus: string; // عمارة: حالة التأجير
  landUse: string | null; // أرض: نوع التخصيص (LandUse)
  unitsCount: number; // تجاري / استثماري: عدد الوحدات أو المحلات
  monthlyIncome: string; // تجاري / استثماري: الدخل الشهري
  isCultivated: boolean; // مزرعة: مزروعة
  isBuilt: boolean; // مزرعة: مبنية
  // «أنا مالك العقار» (an individual's ad, Ministry of Commerce rule)
  isOwner: boolean;

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
  // Each contact number is sent only while its toggle is on
  showPhone: boolean;
  phoneNumber: string;
  showWhatsapp: boolean;
  whatsappNumber: string;

  // 5. Meta
  adLevel: AdLevel;
  images: string[]; // Array of local image URIs

  // 6. Submission State
  isSubmitting: boolean;
  submissionError: string | null;
  // Names the current publish attempt; kept across retries so a repeat
  // returns the ad already created instead of spending the package again
  submissionKey: string | null;

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
  /** Clears the per-category fields (a form that keeps its own state). */
  resetCategoryDetails: () => void;
  fetchFeatures: () => Promise<void>;

  // Submission
  setSubmitting: (value: boolean) => void;
  setSubmissionError: (error: string | null) => void;
  ensureSubmissionKey: () => string;
  clearSubmissionKey: () => void;

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

// --- Initial State ---
const initialState: Omit<ListingStateData, 'listingType'> = {
  governorate: null,
  area: null,
  propertyCategory: null,
  areaSize: '',
  automatedNumber: '',
  rooms: 1,
  baths: 1,
  floors: 0,
  features: [],
  mapLocation: null,
  mapLocationLabel: null,
  addressDetails: null,
  propertyAge: '',
  floorNumber: 0,
  apartmentsCount: 0,
  rentalStatus: '',
  landUse: null,
  unitsCount: 0,
  monthlyIncome: '',
  isCultivated: false,
  isBuilt: false,
  isOwner: false,
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
  showPhone: true,
  phoneNumber: '',
  showWhatsapp: false,
  whatsappNumber: '',
  adLevel: 'normal',
  images: [],
  isSubmitting: false,
  submissionError: null,
  submissionKey: null,
  isEdit: false,
  backendFeatures: null,
};

// --- Store Implementation ---
export const useListingStore = create<ListingStore>((set, get) => ({
  listingType: 'sell', // Default to Sell
  ...initialState,

  // Change the top-level radio button (Sell/Rent/Exchange)
  // A category the new type doesn't offer (e.g. شقة under بدل) is dropped
  setListingType: (type) =>
    set((state) => ({
      listingType: type,
      propertyCategory: isCategoryOffered(state.propertyCategory?.id, type)
        ? state.propertyCategory
        : null,
    })),

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

  resetCategoryDetails: () =>
    set({
      floorNumber: initialState.floorNumber,
      apartmentsCount: initialState.apartmentsCount,
      rentalStatus: initialState.rentalStatus,
      landUse: initialState.landUse,
      unitsCount: initialState.unitsCount,
      monthlyIncome: initialState.monthlyIncome,
      isCultivated: initialState.isCultivated,
      isBuilt: initialState.isBuilt,
      propertyIncome: initialState.propertyIncome,
      allocationState: initialState.allocationState,
    }),

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
  ensureSubmissionKey: () => {
    const existing = get().submissionKey;
    if (existing) return existing;
    const key = newSubmissionKey();
    set({ submissionKey: key });
    return key;
  },
  clearSubmissionKey: () => set({ submissionKey: null }),

  populateFromProperty: (property) => {
    const category =
      findCategoryByApiValue(property.category) ?? findCategory('residential')!;

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

    // The pin and the address details the ad was published with
    const hasPin =
      typeof property.latitude === 'number' &&
      typeof property.longitude === 'number';

    set({
      isEdit: true,
      mapLocation: hasPin ? `${property.latitude},${property.longitude}` : null,
      mapLocationLabel: hasPin
        ? formatDetails(property.addressDetails) || property.location || null
        : null,
      addressDetails: property.addressDetails ?? null,
      listingType: property.type === 'SALE' ? 'sell' : property.type === 'RENT' ? 'rent' : 'exchange',
      governorate,
      area,
      propertyCategory: { id: category.id, label: category.label },
      areaSize: property.areaSize ? property.areaSize.toString() : '',
      automatedNumber: property.automatedNumber || '',
      rooms: property.beds ?? 0,
      baths: property.baths ?? 0,
      floors: property.floors || 0,
      features: property.features
        ? (property.features as any[]).map((f: any) => f.label || f)
        : [],
      propertyAge: property.propertyAge ? property.propertyAge.toString() : '',
      floorNumber: property.floorNumber ?? 0,
      apartmentsCount: property.apartmentsCount ?? 0,
      rentalStatus: property.rentalStatus || '',
      landUse: property.landUse ?? null,
      unitsCount: property.unitsCount ?? 0,
      monthlyIncome: property.monthlyIncome
        ? property.monthlyIncome.toString()
        : '',
      isCultivated: !!property.isCultivated,
      isBuilt: !!property.isBuilt,
      isOwner: !!property.isOwner,
      showPrice: property.price !== null && property.price !== undefined,
      price: property.price ? property.price.toString() : '',
      monthlyRent: property.price ? property.price.toString() : '',
      showIncome: !!property.propertyIncome,
      propertyIncome: property.propertyIncome
        ? property.propertyIncome.toString()
        : '',
      requestYear: property.requestYear ? property.requestYear.toString() : '',
      requiredYear: property.requiredYear ? property.requiredYear.toString() : '',
      allocationState: property.allocationStatus || '',
      adDetails: property.description || '',
      showPhone: !!property.phoneNumber,
      phoneNumber: property.phoneNumber || '',
      showWhatsapp: !!property.whatsappNumber,
      whatsappNumber: property.whatsappNumber || '',
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
      category:
        findCategory(state.propertyCategory?.id)?.apiValue ?? 'RESIDENTIAL',
      areaSize: parseFloat(state.areaSize) || 0,
      location: [state.governorate?.label, state.area?.label]
        .filter(Boolean)
        .join(' - '),
      description: state.adDetails,
      images: uploadedImageUrls,
      isFeatured: state.adLevel === 'premium',
      planSlotId,
    };
    // Only a publish spends a package; a draft save never sends the key
    if (!isDraft && state.submissionKey) {
      payload.submissionKey = state.submissionKey;
    }

    // Counts the category has; land and farms send none of them
    const fields = getCategoryFields(state.propertyCategory?.id);
    if (fields.rooms) payload.beds = state.rooms;
    if (fields.baths) payload.baths = state.baths;
    if (fields.floors) payload.floors = state.floors;
    if (fields.propertyAge && state.propertyAge) {
      payload.propertyAge = parseInt(state.propertyAge, 10);
    }
    if (fields.floorNumber) payload.floorNumber = state.floorNumber;
    if (fields.apartments) {
      payload.apartmentsCount = state.apartmentsCount;
      if (state.rentalStatus) payload.rentalStatus = state.rentalStatus;
      // مدخول العقار on a building, whatever the deal (a sale also has the
      // income toggle below)
      if (apiType !== 'SALE' && state.propertyIncome) {
        payload.propertyIncome = parseFloat(state.propertyIncome);
      }
    }
    if (fields.landUse) {
      if (state.landUse) payload.landUse = state.landUse;
      if (state.allocationState) {
        payload.allocationStatus = state.allocationState;
      }
    }
    if (fields.units) {
      payload.unitsCount = state.unitsCount;
      if (state.monthlyIncome) {
        payload.monthlyIncome = parseFloat(state.monthlyIncome);
      }
    }
    if (fields.farm) {
      payload.isCultivated = state.isCultivated;
      payload.isBuilt = state.isBuilt;
    }
    if (state.isOwner) payload.isOwner = true;

    // A contact number is sent while its toggle is on; an edit that turns
    // one off has to clear what the ad was published with
    if (state.showPhone && state.phoneNumber) {
      payload.phoneNumber = state.phoneNumber;
    } else if (state.isEdit) {
      payload.phoneNumber = null;
    }
    if (state.showWhatsapp && state.whatsappNumber) {
      payload.whatsappNumber = state.whatsappNumber;
    } else if (state.isEdit) {
      payload.whatsappNumber = null;
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
    if (state.addressDetails) {
      payload.addressDetails = state.addressDetails;
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
      if (state.allocationState) {
        payload.allocationStatus = state.allocationState;
      }
      // Price is optional for exchange
      if (state.showPrice && state.price) {
        payload.price = parseFloat(state.price);
      }
    }

    return payload;
  },
}));

/**
 * Whether the add/edit form can go on to preview or save: every field the
 * form currently shows as required is filled.
 */
export function isListingFormValid(state: ListingStateData): boolean {
  const fields = getCategoryFields(state.propertyCategory?.id);
  const isExchange = state.listingType === 'exchange';

  if (
    !state.governorate ||
    !state.area ||
    !state.propertyCategory ||
    !state.areaSize ||
    !state.adDetails
  ) {
    return false;
  }
  if (state.showPhone && !state.phoneNumber) return false;
  if (state.showWhatsapp && !state.whatsappNumber) return false;

  if (isExchange) {
    if (!state.requestYear || !state.requiredYear) return false;
  } else if (!state.isEdit) {
    // Ads published before these became required can still be edited
    if (!state.automatedNumber) return false;
    if (fields.propertyAge && !state.propertyAge) return false;
  }

  const shownPrice =
    state.listingType === 'rent' ? state.monthlyRent : state.price;
  if (state.showPrice && !shownPrice) return false;
  if (state.listingType === 'sell' && state.showIncome && !state.propertyIncome)
    return false;

  return true;
}
