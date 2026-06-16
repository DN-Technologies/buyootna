import { create } from 'zustand';

// --- 1. Type Definitions ---
export interface SelectionItem {
  id: string;
  label: string;
}

export interface StandardTabState {
  govs: SelectionItem[];
  areas: SelectionItem[];
  category: string;
  rooms: number;
  baths: number;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  features: string[];
}

export interface ExchangeTabState {
  govs: SelectionItem[];
  areas: SelectionItem[];
  requestYear: string;
  requiredYear: string;
  status: string;
  areaSize: string;
  features: string[];
}

export interface CompaniesTabState {
  specialty: string;
  requestType: string;
  govs: SelectionItem[];
  areas: SelectionItem[];
}

export interface AuctionsTabState {
  status: string;
  startDate: string;
  endDate: string;
  propertyTypes: string[];
}

export interface DealsTabState {
  govs: SelectionItem[];
  areas: SelectionItem[];
  salePercentage: string;
  startDate: string;
  endDate: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  propertyTypes: string[];
}

// Group all tabs under one interface
export interface FilterTabsState {
  sell: StandardTabState;
  rent: StandardTabState;
  exchange: ExchangeTabState;
  companies: CompaniesTabState;
  auctions: AuctionsTabState;
  deals: DealsTabState;
}

// --- 2. Initial States ---
export const initialStandardState: StandardTabState = {
  govs: [],
  areas: [],
  category: 'apartment',
  rooms: 1,
  baths: 1,
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
  features: [],
};

export const initialExchangeState: ExchangeTabState = {
  govs: [],
  areas: [],
  requestYear: '',
  requiredYear: '',
  status: 'building',
  areaSize: '',
  features: [],
};

export const initialCompaniesState: CompaniesTabState = {
  specialty: '',
  requestType: '',
  govs: [],
  areas: [],
};

export const initialAuctionsState: AuctionsTabState = {
  status: 'starts_soon',
  startDate: '',
  endDate: '',
  propertyTypes: [],
};

export const initialDealsState: DealsTabState = {
  govs: [],
  areas: [],
  salePercentage: '',
  startDate: '',
  endDate: '',
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
  propertyTypes: [],
};

// Map tab names to their initial states for comparison
const initialStates: Record<keyof FilterTabsState, any> = {
  sell: initialStandardState,
  rent: initialStandardState,
  exchange: initialExchangeState,
  companies: initialCompaniesState,
  auctions: initialAuctionsState,
  deals: initialDealsState,
};

// Helper to check if a tab has been modified from its initial state
export function isTabDirty(
  tab: keyof FilterTabsState,
  currentState: any,
): boolean {
  const initial = initialStates[tab];
  return JSON.stringify(currentState) !== JSON.stringify(initial);
}

// --- 3. The Zustand Store ---
interface FilterStore extends FilterTabsState {
  // A strictly typed generic function to update any field in any tab
  updateField: <
    T extends keyof FilterTabsState,
    K extends keyof FilterTabsState[T],
  >(
    tab: T,
    field: K,
    value: FilterTabsState[T][K],
  ) => void;
  // Reset a specific tab to its initial state
  resetTab: (tab: keyof FilterTabsState) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  sell: { ...initialStandardState },
  rent: { ...initialStandardState },
  exchange: { ...initialExchangeState },
  companies: { ...initialCompaniesState },
  auctions: { ...initialAuctionsState },
  deals: { ...initialDealsState },

  updateField: (tab, field, value) =>
    set((state) => ({
      [tab]: {
        ...state[tab],
        [field]: value,
      },
    })),

  resetTab: (tab) =>
    set(() => {
      switch (tab) {
        case 'sell':
          return { sell: { ...initialStandardState } };
        case 'rent':
          return { rent: { ...initialStandardState } };
        case 'exchange':
          return { exchange: { ...initialExchangeState } };
        case 'companies':
          return { companies: { ...initialCompaniesState } };
        case 'auctions':
          return { auctions: { ...initialAuctionsState } };
        case 'deals':
          return { deals: { ...initialDealsState } };
      }
    }),
}));
