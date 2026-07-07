# 07 — iPad Layout Optimization

## Problem

Apple reviewed the app on an **iPad Air 11-inch (M3)**. The app currently uses `supportsTablet: true` in `app.json`, meaning it claims iPad support — but there's no evidence of iPad-specific layout work. The app likely renders as a stretched phone layout, which contributes to the "marketing material" impression.

## Current State

```json
// app.json
"ios": {
  "supportsTablet": true,
}
```

All screens use fixed `px-5` padding (20px) and phone-width assumptions. On an 11-inch iPad (2388×1668 points), content will stretch to fill the full width, making cards extremely wide and the UI sparse.

---

## Strategy

### Approach: Responsive Constraints (Not Separate iPad UI)

Rather than building entirely separate iPad layouts, we apply **max-width constraints** and **responsive grid adjustments** using NativeWind/TailwindCSS breakpoints. This is the standard React Native approach for universal apps.

NativeWind supports responsive prefixes via `Dimensions`:
- Default: Phone layout
- `md:` (768px+): iPad portrait
- `lg:` (1024px+): iPad landscape

---

## Proposed Changes

### 1. Global Content Container

Create a reusable wrapper that constrains content width on larger screens:

#### [NEW] `src/core/components/ContentContainer.tsx`

```typescript
import { View, ViewProps } from 'react-native';

interface ContentContainerProps extends ViewProps {
  children: React.ReactNode;
}

export default function ContentContainer({ children, className, ...props }: ContentContainerProps) {
  return (
    <View 
      className={`mx-auto w-full max-w-[680px] ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
```

> **Note**: NativeWind 4 supports `max-w-*` utilities. If it doesn't work in all contexts, fall back to `useWindowDimensions()` + inline style.

### 2. Alternative: `useResponsiveLayout` Hook

If NativeWind max-width doesn't work reliably:

#### [NEW] `src/hooks/useResponsiveLayout.ts`

```typescript
import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isLandscape = width >= 1024;
  
  // Constrained content width for iPad
  const contentWidth = isTablet ? Math.min(width * 0.75, 680) : width;
  const contentPadding = isTablet ? (width - contentWidth) / 2 : 20;
  
  // Grid columns
  const cardColumns = isLandscape ? 3 : isTablet ? 2 : 1;
  
  return { isTablet, isLandscape, contentWidth, contentPadding, cardColumns };
}
```

### 3. Screen-by-Screen Adjustments

#### Home Screen
- **Feed cards**: Show 2 columns in iPad portrait, 3 in landscape
- **Search bar**: Constrain max-width
- **Filter pills**: Center-align on wider screens

#### Explore Screen
- **Category grid**: 4-5 items per row on iPad (currently 3)
- **Content area**: Constrain max-width

#### Property Detail
- **Image carousel**: Full-width is fine, but constrain body content
- **Specs grid**: Can show more columns on iPad
- **Action bar**: Constrain width, center it

#### Chat Screens
- **Chat list**: Constrain width, center content
- **Chat detail**: Constrain width, messages look odd at full iPad width
- On iPad landscape, consider a **split-view** pattern (list on left, chat on right) — but this is a stretch goal

#### Activity Screen
- **Ad cards**: 2-column grid on iPad
- **Filter pills**: Centered

#### More/Profile Screen
- **Profile card**: Constrain max-width
- **Menu items**: Constrain max-width

#### Add Listing
- **Form**: Constrain max-width (forms should never be full iPad width)
- **Image upload zone**: Constrain width

#### Auth Screens
- **Form cards**: Center and constrain width
- Should look like a centered card on iPad

---

### 4. Tab Bar on iPad

#### [MODIFY] `src/core/components/CustomTabBar.tsx`

The custom tab bar should either:
- Stay full-width but constrain the inner content
- Or use a floating tab bar style on iPad (stretch goal)

```typescript
const { isTablet } = useResponsiveLayout();

<View className={`${isTablet ? 'mx-auto max-w-[500px]' : 'w-full'}`}>
  {/* Tab bar content */}
</View>
```

### 5. Bottom Sheets on iPad

`@gorhom/bottom-sheet` on iPad can look odd (very wide). Apply max-width:

```typescript
// In each BottomSheetModal
<BottomSheetModal
  style={{
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  }}
>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/core/components/ContentContainer.tsx` | **[NEW]** Responsive content wrapper |
| `src/hooks/useResponsiveLayout.ts` | **[NEW]** Responsive layout hook |
| `src/app/(main)/home.tsx` | Wrap content, 2-col grid on iPad |
| `src/app/(main)/explore.tsx` | Constrain width |
| `src/app/(main)/activity.tsx` | Constrain width, 2-col grid |
| `src/app/(main)/more.tsx` | Constrain width |
| `src/app/property/[id].tsx` | Constrain body content |
| `src/app/chat/index.tsx` | Constrain width |
| `src/app/chat/[id].tsx` | Constrain width |
| `src/app/add-listing/index.tsx` | Constrain form width |
| `src/app/add-listing/preview.tsx` | Constrain width |
| `src/app/(auth)/*.tsx` | Center forms |
| `src/core/components/CustomTabBar.tsx` | Constrain inner content |
| `src/app/search/results.tsx` | 2-col grid on iPad |

---

## Testing

Must test on all iPad variants in the Xcode Simulator:

```bash
# Run on iPad Air simulator
expo run:ios -d "iPad Air 11-inch (M3)"
```

---

## Verification

- [ ] App looks intentionally designed on iPad Air 11-inch (M3) — not stretched
- [ ] Content is centered with appropriate max-width on all screens
- [ ] Property cards show in 2-column grid on iPad portrait
- [ ] Forms are centered and don't stretch to full width
- [ ] Bottom sheets are constrained in width
- [ ] Tab bar looks appropriate on iPad
- [ ] No text is uncomfortably wide (reading comfort ~65-80 chars per line)
- [ ] App still looks correct on iPhone (no regressions)
- [ ] Test in both portrait and landscape orientations
