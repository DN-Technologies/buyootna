import { create } from 'zustand';

// --- 1. Type Definitions ---
export interface SelectionItem {
  id: string;
  label: string;
}

export interface StandardTabState {
  gov: SelectionItem | null;
  area: SelectionItem | null;
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
  gov: SelectionItem | null;
  area: SelectionItem | null;
  requestYear: string;
  requiredYear: string;
  status: string;
  areaSize: string;
  features: string[];
}

export interface CompaniesTabState {
  specialty: string;
  requestType: string;
  gov: SelectionItem | null;
  area: SelectionItem | null;
}

export interface AuctionsTabState {
  status: string;
  startDate: string;
  endDate: string;
  propertyTypes: string[];
}

export interface DealsTabState {
  gov: SelectionItem | null;
  area: SelectionItem | null;
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
export interface FilterTabState {
  sell: StandardTabState;
  rent: StandardTabState;
  exchange: ExchangeTabState;
  companies: CompaniesTabState;
  auctions: AuctionsTabState;
  deals: DealsTabState;
}

// --- 2. Initial States ---
const initialStandardState: StandardTabState = {
  gov: null,
  area: null,
  category: 'apartment',
  rooms: 1,
  baths: 1,
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
  features: [],
};

const initialExchangeState: ExchangeTabState = {
  gov: null,
  area: null,
  requestYear: '',
  requiredYear: '',
  status: 'building',
  areaSize: '',
  features: [],
};

const initialCompaniesState: CompaniesTabState = {
  specialty: '',
  requestType: '',
  gov: null,
  area: null,
};

const initialAuctionsState: AuctionsTabState = {
  status: 'starts_soon',
  startDate: '',
  endDate: '',
  propertyTypes: [],
};

const initialDealsState: DealsTabState = {
  gov: null,
  area: null,
  salePercentage: '',
  startDate: '',
  endDate: '',
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
  propertyTypes: [],
};

// --- 3. The Zustand Store ---
interface FilterStore extends FilterTabState {
  // A strictly typed generic function to update any field in any tab
  updateField: <
    T extends keyof FilterTabState,
    K extends keyof FilterTabState[T],
  >(
    tab: T,
    field: K,
    value: FilterTabState[T][K],
  ) => void;
  // Reset a specific tab to its initial state
  resetTab: (tab: keyof FilterTabState) => void;
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
