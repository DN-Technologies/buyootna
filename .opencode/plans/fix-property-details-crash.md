# Fix: Property details screen crashes app (View Ad / Home card)

## Context
- Tapping "عرض الإعلان" after publishing, or any property card from Home, hits the global error boundary (`حدث خطأ غير متوقع. يرجى إعادة تشغيل التطبيق`, `apps/mobile/src/app/_layout.tsx:65-100`) — a **render-time JS crash**, not an API error.
- Crash happens for ALL properties (user-confirmed) → screen-level cause, not data.
- `property/[id].tsx` is the only main-flow screen importing `MapPreview`, which runs `Mapbox.setAccessToken(...)` at module scope — a binary without the Mapbox native module (old preview build / Expo Go) throws on import → crash. Prime suspect.
- Secondary hazards: unguarded `property.host.*` and unguarded `price.toLocaleString()`.
- No API defect: current tree == org/main, GET /properties/:id is null-safe; Sentry has the real stack if confirmation is needed later.

## Changes (all mobile-only)

### 1. `apps/mobile/src/shared/components/MapPreview.tsx`
- Replace `import Mapbox, { Camera, MapView, PointAnnotation } from '@rnmapbox/maps'` + module-scope `setAccessToken` with a guarded lazy load:
  ```tsx
  let Mapbox: typeof import('@rnmapbox/maps') | null = null;
  try {
    Mapbox = require('@rnmapbox/maps');
    Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '<fallback-pk>');
  } catch (e) {
    console.warn('Mapbox native module unavailable, using static fallback:', e);
  }
  ```
- Render condition becomes `{hasCoords && Mapbox ? (<Mapbox.MapView>…` — when the module is unavailable, the existing static image fallback renders instead of crashing.

### 2. `apps/mobile/src/app/property/[id].tsx`
- `handleChat`: derive `const hostId = property.host?.id;` — early-alert + return when missing; use `hostId` for the self-check and `createConversation(hostId, …)`.
- Lister block: `property.host?.name ?? 'مستخدم'`, `joinedDate ?? ''`, `rating ?? 0`, `avatarUrl ?? ''`, `isVerified={property.host?.isVerified}`; in `onPress` read `hostId = property.host?.id` and return early if missing (also satisfies `ListerProfileSnippet` required-prop types).

### 3. `apps/mobile/src/shared/components/PropertyOverview.tsx`
- `{price.toLocaleString()}` → `{typeof price === 'number' ? price.toLocaleString() : 'السعر غير محدد'}`.

## Verification
- `npx --prefix apps/mobile tsc --noEmit -p apps/mobile`
- `pnpm --filter buyootna test`
- Manual: details screen opens from Home card + post-publish "عرض الإعلان"; map renders on binary with Mapbox; static fallback path harmless.

## Shipping
- Mobile-only → OTA via `pnpm --filter buyootna release:ota -- --channel <preview|production> --message "…"` (requires clean tree → commit first). No API deploy needed.
- Optional follow-ups: check Sentry for the property/[id] stack to confirm; wire `خطأ من السيرفر` dead i18n key / API 500 i18n gap (out of scope).
