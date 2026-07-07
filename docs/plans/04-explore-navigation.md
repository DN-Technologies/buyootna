# 04 — Explore Categories → Search Navigation

## Problem

All explore category items in `exploreData.ts` use `console.log()` as their `onPress` handlers. Tapping "بيع" (Sale), "ايجار" (Rent), "بدل" (Exchange), "تصميم داخلي" (Interior Design), etc. does nothing. The "حاسبات ذكية" (Smart Calculators) section has items marked `isSoon: true` but they also have no interaction.

## Current State

```typescript
// constants/exploreData.ts
{
  icon: SaleIcon,
  title: 'بيع',
  onPress: () => console.log('Sale category'),  // ← Does nothing
},
```

The search infrastructure already exists — `searchService.advancedSearch()` supports `tab` and `filters` params, and the search results screen consumes them via route params.

---

## Proposed Changes

### 1. Wire Property Categories to Search Results

#### [MODIFY] `src/constants/exploreData.ts`

Instead of defining `onPress` inline with `console.log`, export the data without `onPress` and let the screen handle navigation. Alternatively, use `router.push()` inside each handler.

**Approach**: The `exploreData.ts` file is a constants file, so it shouldn't import `router`. Instead, we'll refactor the data to include navigation metadata and let the `ExploreScreen` handle the routing.

```typescript
// New shape for exploreData items
export interface ExploreItem {
  icon: React.ComponentType<any>;
  title: string;
  iconSize?: number;
  iconColor?: string;
  isSoon?: boolean;
  // Navigation metadata
  searchTab?: 'properties' | 'companies';
  searchFilters?: Record<string, any>;
}
```

### 2. Update Explore Items

```typescript
// Properties
{ icon: SaleIcon, title: 'بيع', searchTab: 'properties', searchFilters: { type: 'SALE' } },
{ icon: RentIcon, title: 'ايجار', searchTab: 'properties', searchFilters: { type: 'RENT' } },
{ icon: SwapIcon, title: 'بدل', searchTab: 'properties', searchFilters: { type: 'EXCHANGE' } },

// Company Services
{ icon: InterDesignIcon, title: 'تصميم داخلي', searchTab: 'companies', searchFilters: { service: 'interior_design' } },
{ icon: FinishedIcon, title: 'تشطيب', searchTab: 'companies', searchFilters: { service: 'finishing' } },
{ icon: PoolIcon, title: 'حمام سباحة', searchTab: 'companies', searchFilters: { service: 'pool' } },
{ icon: OfficesIcon, title: 'مكاتب هندسية', searchTab: 'companies', searchFilters: { service: 'engineering' } },

// Lists (future — may need dedicated screens)
{ icon: AuctionsIcon, title: 'مزادات', searchTab: 'properties', searchFilters: { type: 'AUCTION' } },
{ icon: DealsIcon, title: 'صفقات', searchTab: 'properties', searchFilters: { type: 'DEAL' } },

// Smart Calculators — keep isSoon: true
{ icon: CalculateIcon, title: 'حاسبة الايجار', isSoon: true },
```

### 3. Update ExploreScreen to Handle Navigation

#### [MODIFY] `src/app/(main)/explore.tsx`

```typescript
const handleExploreItemPress = (item: ExploreItem) => {
  if (item.isSoon) return; // Badge handles visual feedback
  
  if (item.searchTab && item.searchFilters) {
    router.push({
      pathname: '/search/results',
      params: {
        tab: item.searchTab,
        filters: JSON.stringify(item.searchFilters),
      },
    });
  }
};
```

### 4. Update ExploreSection and CategoryItem

#### [MODIFY] `src/components/explore/ExploreSection.tsx`
Pass navigation handler down to category items.

#### [MODIFY] `src/components/explore/CategoryItem.tsx`
Update `CategoryItemProps` to accept the new shape. "Coming Soon" items should show a badge and have no press feedback.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/constants/exploreData.ts` | Replace `console.log` with navigation metadata |
| `src/app/(main)/explore.tsx` | Handle navigation in `onPress` |
| `src/components/explore/ExploreSection.tsx` | Pass down navigation handler |
| `src/components/explore/CategoryItem.tsx` | Accept new props, improve "Coming Soon" visual |

### Backend

No changes needed — the search endpoint already supports the filter params.

---

## Verification

- [ ] Tapping "بيع" navigates to search results showing only SALE properties
- [ ] Tapping "ايجار" shows only RENT properties
- [ ] Tapping "بدل" shows only EXCHANGE properties
- [ ] Tapping company services navigates to search with correct service filter
- [ ] "Coming Soon" items show badge, don't navigate, and have reduced opacity
- [ ] Back navigation from search results returns to Explore
