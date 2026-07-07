# 02 — Favorites / Saved Properties System

## Problem

The "Saved" (المحفوظات) menu item in the More tab has `onPress={() => {}}`. The favorite toggle on the property detail screen is hardcoded to `isFavorite={true}` with no actual toggle logic. There is no backend endpoint for favorites.

## Current State

- **Property Detail**: `isFavorite={true}` (hardcoded), `onFavorite={() => console.log('Toggle Favorite')}`
- **More Tab**: "المحفوظات" → `onPress={() => {}}`
- **Backend**: No `Favorite` model in Prisma schema
- **Mobile**: No favorites API service, no favorites store

---

## Architecture

### Data Model

```
User ←──── Favorite ────→ Property
          (many-to-many
           join table)
```

### Prisma Schema Addition

```prisma
// prisma/schema.prisma — add to User model
model User {
  // ... existing fields
  favorites Favorite[]
}

// New model
model Favorite {
  id         String   @id @default(uuid())
  userId     String
  propertyId String
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([userId, propertyId])  // Prevent duplicate favorites
  @@index([userId])
  @@index([propertyId])
}
```

Also add `favorites Favorite[]` to the `Property` model.

---

## Proposed Changes

### Backend (NestJS)

#### [NEW] `src/features/favorites/favorites.module.ts`
Standard NestJS module registering the controller and service.

#### [NEW] `src/features/favorites/favorites.controller.ts`
```
POST   /favorites/:propertyId   → Toggle favorite (add or remove)
GET    /favorites                → List user's favorited properties (paginated)
GET    /favorites/check/:id      → Check if a specific property is favorited
GET    /favorites/ids            → Return list of favorited property IDs (for bulk checking on feed)
```

All endpoints require `@UseGuards(AuthGuard('jwt'))`.

#### [NEW] `src/features/favorites/favorites.service.ts`
- `toggle(userId, propertyId)` → Upsert/delete pattern using `@@unique` constraint
- `findAll(userId, page, limit)` → Paginated list with property includes
- `check(userId, propertyId)` → Boolean check
- `getIds(userId)` → Return `string[]` of property IDs for client-side checking

#### [MODIFY] `src/app.module.ts`
Import `FavoritesModule`.

---

### Mobile (React Native)

#### [NEW] `src/core/api/favorites.service.ts`
```typescript
export const favoritesService = {
  toggle: (propertyId: string) => apiClient.post(`/favorites/${propertyId}`),
  getAll: (page = 1, limit = 20) => apiClient.get('/favorites', { params: { page, limit } }),
  check: (propertyId: string) => apiClient.get(`/favorites/check/${propertyId}`),
  getIds: () => apiClient.get<{ ids: string[] }>('/favorites/ids'),
};
```

#### [NEW] `src/store/useFavoritesStore.ts`
Zustand store that:
- Holds a `Set<string>` of favorited property IDs (loaded on app boot if authenticated)
- Provides `isFavorited(id)` → boolean
- Provides `toggle(id)` → optimistic update + API call
- Syncs with backend via `getIds()` on login/boot

```typescript
interface FavoritesState {
  ids: Set<string>;
  isLoaded: boolean;
  loadFavorites: () => Promise<void>;
  toggle: (propertyId: string) => Promise<void>;
  isFavorited: (propertyId: string) => boolean;
}
```

#### [NEW] `src/app/(more)/favorites.tsx`
New screen that displays the user's saved properties in a list. Uses the same `PropertyCard` or `PropertyListItem` components. Supports pull-to-refresh and pagination.

#### [MODIFY] `src/app/property/[id].tsx`
- Import `useFavoritesStore`
- Replace `isFavorite={true}` with `isFavorite={isFavorited(property.id)}`
- Replace `onFavorite` console.log with `toggle(property.id)`
- Add haptic feedback on toggle (`expo-haptics`)

#### [MODIFY] `src/core/components/PropertyCard.tsx`
- Add favorite heart icon with toggle functionality
- Use `useFavoritesStore` for state

#### [MODIFY] `src/app/(main)/more.tsx`
- Wire "المحفوظات" to `router.push('/(more)/favorites')`

---

## Verification

- [ ] Tapping heart toggles favorite state with animation
- [ ] Favorite state persists across app restarts
- [ ] Favorites screen shows all saved properties
- [ ] Unfavoriting from the favorites screen removes the item with animation
- [ ] Works for guest users: show auth guard when tapping heart
- [ ] Pagination works when user has many favorites
- [ ] Optimistic update: heart toggles instantly, reverts on API error
