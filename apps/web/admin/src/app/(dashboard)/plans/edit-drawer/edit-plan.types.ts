export interface EditPlanDrawerItem {
  id: string
  name: string
  price: string
  title: string
  isGold?: boolean
  features: string[]
  categoryName?: string
  activeAdsCount?: string
  durationText?: string
  photosCountText?: string
  isFeaturedResults?: boolean
  isPinnedAds?: boolean
  isPrioritySearch?: boolean
  pinnedAdsText?: string
  featuredResultsText?: string
  prioritySearchText?: string
}

export interface EditPlanFormState {
  status: 'active' | 'hidden'
  planName: string
  planPrice: string
  validityDuration: string
  adsCount: string
  photosCount: string
  durationDays: string
  searchVisibility: boolean
  featuredResults: boolean
  pinnedAds: boolean
  prioritySearch: boolean
  directContact: boolean
}

export interface EditPlanDrawerProps {
  open: boolean
  onClose: () => void
  plan: EditPlanDrawerItem | null
  onSave?: (updatedPlan: EditPlanDrawerItem) => void
}
