# 06 — Stub Cleanup & Non-Functional Feature Handling

## Problem

Many menu items and interactive elements across the app are wired to empty handlers (`() => {}`) or `console.log()`. This creates a poor user experience and signals to the App Store reviewer that features are incomplete.

## Strategy

For each stub, we take one of three actions:
1. **Wire** — Connect to a real implementation (if one exists or is simple)
2. **Hide** — Remove the UI element entirely until it's ready
3. **Coming Soon** — Show a clear "قريباً" badge/toast so users know it's intentional

---

## Stub Inventory & Resolution

### More Tab (`more.tsx`)

| Menu Item | Arabic | Current | Resolution |
|-----------|--------|---------|------------|
| المحادثات (Chats) | ✅ | Navigates to `/chat` | ✅ Already works |
| المحفوظات (Saved) | `() => {}` | **Wire** → Navigate to `/favorites` (after Plan 02) |
| التقييمات والمراجعات (Reviews) | `() => {}` | **Hide** — No backend support, remove from menu |
| الباقات (Packages) | ✅ | Navigates to `/packages` | ✅ Already works |
| رصيد الحساب (Balance) | `() => {}` | **Hide** — No backend support |
| الفواتير (Invoices) | `() => {}` | **Hide** — No backend support |
| اعدادات الحساب (Settings) | ✅ | Navigates to `/settings` | ✅ Already works |

### Explore Tab (`exploreData.ts`)

| Item | Current | Resolution |
|------|---------|------------|
| Property categories | `console.log` | **Wire** → Search navigation (Plan 04) |
| Company services | `console.log` | **Wire** → Search navigation (Plan 04) |
| مزادات (Auctions) | `console.log` | **Wire** → Search with AUCTION type filter |
| صفقات (Deals) | `console.log` | **Wire** → Search with DEAL type filter |
| حاسبة الايجار | `isSoon: true` | **Coming Soon** — Keep with visible badge |
| حاسبة البيع | `isSoon: true` | **Coming Soon** — Keep with visible badge |
| حاسبة البنيان | `isSoon: true` | **Coming Soon** — Keep with visible badge |

### Property Detail (`property/[id].tsx`)

| Feature | Current | Resolution |
|---------|---------|------------|
| WhatsApp | `console.log` | **Wire** — Plan 01 |
| Call | `console.log` | **Wire** — Plan 01 |
| Chat | `console.log` | **Wire** — Plan 05 |
| Share | `console.log` | **Wire** — Plan 01 |
| Favorite | `console.log` | **Wire** — Plan 02 |
| Open Map | `console.log` | **Wire** — Plan 03 |
| Host Profile | `console.log` | **Coming Soon** → Navigate to search by host (simple) |

### Activity Tab (`activity.tsx`)

| Feature | Current | Resolution |
|---------|---------|------------|
| Filter button | `console.log('Filter Pressed')` | **Wire** → Open existing filter sheet |
| Sort button | `console.log('Sort Pressed')` | **Wire** → Sort bottom sheet |
| Options button on cards | `console.log('Open options')` | **Wire** → Options bottom sheet (Edit, Delete, Promote) |
| Edit draft | `console.log('Edit draft')` | **Wire** → Navigate to `/edit-listing/${id}` |

### Chat Detail (`chat/[id].tsx`)

| Feature | Current | Resolution |
|---------|---------|------------|
| Send message | `console.log` | **Wire** — Plan 05 |
| Attach image | `console.log` | **Wire** — Plan 05 |
| Attach file | `console.log` | **Hide** — Files not supported in v1 |
| Report user | `console.log` | **Wire** → Simple `Alert.alert` confirmation |
| Navigate to property | `console.log` | **Wire** → `router.push(/property/${id})` |
| Dismiss pinned | `console.log` | **Wire** → Local state toggle |

### Guest More Tab

| Feature | Current | Resolution |
|---------|---------|------------|
| الأسئلة الشائعة (FAQ) | `() => {}` | **Wire** → Create simple FAQ screen or **Hide** |

---

## Implementation

### [MODIFY] `src/app/(main)/more.tsx`
- Remove hidden items: Reviews, Balance, Invoices
- Wire "المحفوظات" to favorites screen (after Plan 02 is done)

### [MODIFY] `src/app/(main)/activity.tsx`
- Wire filter → present existing filter bottom sheet
- Wire sort → create simple sort bottom sheet (newest first, price, etc.)
- Wire options → create options bottom sheet
- Wire edit draft → `router.push(`/edit-listing/${id}`)`

### [MODIFY] `src/app/chat/[id].tsx`
- Wire "Report user" → `Alert.alert` with confirmation
- Wire "Navigate to property" → `router.push(/property/${id})`
- Wire "Dismiss pinned" → local state `showPinnedContext` toggle
- Hide "Attach file" button

### [NEW] `src/app/(more)/faq.tsx` (Optional)
Simple FAQ screen with expandable accordion items. Can use hardcoded Q&A data for now.

---

## "Coming Soon" Pattern

For features we keep visible but aren't ready, implement a consistent pattern:

```typescript
import { Alert } from 'react-native';

const showComingSoon = () => {
  Alert.alert('قريباً', 'هذه الميزة قيد التطوير وستكون متاحة قريباً', [
    { text: 'حسناً' },
  ]);
};
```

This is better than a dead tap — it shows intentionality.

---

## Verification

- [ ] No `console.log` remains as a tap handler in any user-facing screen
- [ ] No empty `() => {}` handlers remain
- [ ] Hidden items are cleanly removed (no empty spaces or broken layouts)
- [ ] "Coming Soon" toast appears for future features
- [ ] All menu items either navigate somewhere or show Coming Soon
