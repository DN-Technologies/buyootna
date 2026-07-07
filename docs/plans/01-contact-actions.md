# 01 — Property Contact Actions (Call, WhatsApp, Share)

## Problem

The three action buttons on the property detail screen (`PropertyActionBar`) — **Call**, **WhatsApp**, and **Chat** — are all wired to `console.log()`. The **Share** and **Favorite** buttons in `PropertyMediaHeader` are also stubs. This means the core user interaction on the most important screen in the app does nothing.

## Current State

```typescript
// property/[id].tsx
onWhatsapp={() => console.log('WhatsApp Clicked')}
onCall={() => console.log('Call Clicked')}
onChat={() => console.log('Chat Clicked')}
onFavorite={() => console.log('Toggle Favorite')}
onShare={() => console.log('Share Clicked')}
```

The `phoneNumber` field already exists on the `Property` model in Prisma and is returned by the API, so we have the data — we just need to wire it up.

---

## Proposed Changes

### 1. WhatsApp Button → `Linking.openURL`

```typescript
import { Linking } from 'react-native';

const handleWhatsApp = (phone: string) => {
  // Strip non-digits, ensure country code prefix
  const cleanPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}`;
  Linking.openURL(url);
};
```

### 2. Call Button → `Linking.openURL`

```typescript
const handleCall = (phone: string) => {
  Linking.openURL(`tel:${phone}`);
};
```

### 3. Share Button → React Native `Share` API

```typescript
import { Share } from 'react-native';

const handleShare = async (property: PropertyDetailsDto) => {
  try {
    await Share.share({
      message: `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)} - ${property.location}\n\nhttps://buyootna.cloud/property/${property.id}`,
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};
```

### 4. Chat Button → Navigate to Chat (or Auth Guard)

The chat button should either:
- If **authenticated**: Navigate to `/chat` with the property + host context
- If **not authenticated**: Open the `AuthGuardSheet`

This will be fully connected once the Chat feature (Plan 05) is implemented. For now, show the auth guard or a "coming soon" alert.

---

## Files to Modify

### Mobile

| File | Change |
|------|--------|
| `src/app/property/[id].tsx` | Wire all 5 action handlers with real logic |
| `src/core/components/PropertyActionBar.tsx` | Add `phone` prop, pass it to handlers |
| `src/core/components/PropertyMediaHeader.tsx` | Wire share & favorite with real callbacks |
| `src/core/components/PropertyCard.tsx` | Wire call/whatsapp/share on card-level actions if present |
| `src/core/components/PropertyListItem.tsx` | Same for list item variant |

### Backend

No backend changes needed — `phoneNumber` is already on the `Property` model and returned by `findOne()`.

---

## Verification

- [ ] Tapping WhatsApp opens WhatsApp with the correct phone number
- [ ] Tapping Call opens the phone dialer with the correct number
- [ ] Tapping Share opens the iOS share sheet with property details + deep link
- [ ] If no phone number exists on a property, buttons show appropriate fallback (disable or hide)
- [ ] Works on iPad (Share sheet presents as popover)
