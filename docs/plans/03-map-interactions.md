# 03 — Map Interactions (Full Map, Open in Maps)

## Problem

The `MapPreview` component on the property detail screen shows a static map tile, but tapping it does nothing (`console.log('Open Full Map Modal')`). Users can't interact with the map, navigate to the location, or see it full-screen.

## Current State

```typescript
// property/[id].tsx
<MapPreview
  location={property.location}
  onPress={() => console.log('Open Full Map Modal')}
/>
```

The `MapPickerModal.tsx` component already exists in `core/components/` (used during listing creation), so we can reuse its patterns.

The `Property` model already has `latitude` and `longitude` fields.

---

## Proposed Changes

### 1. Full-Screen Map Modal

#### [NEW] `src/core/components/MapViewModal.tsx`

A full-screen modal that:
- Shows the property location on a `react-native-maps` MapView
- Displays a pin marker at `(latitude, longitude)`
- Shows the property title and address in a bottom card
- Has a "Open in Maps" button to launch native maps
- Has a close button

```typescript
interface MapViewModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}
```

### 2. "Open in Maps" Deep Link

```typescript
import { Linking, Platform } from 'react-native';

const openInMaps = (lat: number, lng: number, label: string) => {
  const encodedLabel = encodeURIComponent(label);
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodedLabel})`,
  });
  if (url) Linking.openURL(url);
};
```

### 3. MapPreview Enhancement

#### [MODIFY] `src/core/components/MapPreview.tsx`

Update to accept `latitude` and `longitude` as optional props. Show a real mini MapView if coordinates are available, fallback to a static image/placeholder if not.

```typescript
interface MapPreviewProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  onPress: () => void;
}
```

---

### Files to Modify

| File | Change |
|------|--------|
| `src/core/components/MapViewModal.tsx` | **[NEW]** Full-screen map modal |
| `src/core/components/MapPreview.tsx` | Accept lat/lng, show real mini map |
| `src/app/property/[id].tsx` | Wire onPress to open MapViewModal, pass lat/lng |

### Backend

No backend changes — `latitude` and `longitude` already exist on the Property model.

---

## Verification

- [ ] Tapping map preview opens full-screen map modal
- [ ] Pin marker shows at correct location
- [ ] "Open in Maps" button launches Apple Maps on iOS
- [ ] Close button dismisses the modal
- [ ] Graceful fallback when lat/lng are null (show location text only)
- [ ] Works on iPad (modal should be full-screen or appropriately sized)
