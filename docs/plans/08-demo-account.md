# 08 — Demo Account & App Store Review Notes

## Problem

The reviewer couldn't access authenticated features because no demo account was provided in App Store Connect. Since sign-in isn't required to browse, the reviewer saw an app with browsable listings but no interactive features — making it look like a marketing app.

## Current State

- **App Store Connect → App Information → App Review Information**: No demo credentials provided
- **Review Notes**: Likely empty or minimal

---

## Action Items

### 1. Create a Demo Account

Create a dedicated demo account in the production database that the reviewer can use.

**Credentials** (set in App Store Connect):
```
Email: demo@buyootna.cloud
Password: Demo@2026!
```

**Account Setup** — The demo account should have:

| Data | Details |
|------|---------|
| **User profile** | Name: "حساب تجريبي", Role: INDIVIDUAL |
| **Properties (3-5)** | Mix of SALE, RENT, EXCHANGE listings with real images, locations, and descriptions |
| **Draft listing (1)** | A partially completed listing to show draft management |
| **Favorites (3-4)** | Pre-favorited properties (after Plan 02 is implemented) |
| **Chat conversations (2-3)** | Pre-seeded conversations with messages (after Plan 05 is implemented) |
| **Subscription** | Give the demo account a free subscription or extra free ad slots so the reviewer can test listing creation |

### 2. Create a Seed Script

#### [NEW] `apps/api/prisma/seeds/seed-demo.ts`

Script that:
1. Creates the demo user with known credentials
2. Creates 3-5 properties with real images (uploaded to S3)
3. Creates sample conversations and messages
4. Sets up favorites
5. Is idempotent (can be run multiple times safely)

```bash
pnpm run seed:demo
```

### 3. Write Review Notes

In **App Store Connect → App Review Information → Notes**:

```
Welcome to Buyootna (بيوتنا), a real estate marketplace for Kuwait.

DEMO ACCOUNT:
Email: demo@buyootna.cloud
Password: Demo@2026!

HOW TO TEST THE APP:

1. BROWSE WITHOUT LOGIN:
   - The Home tab shows live property listings
   - Tap any property to see full details
   - Use the Search bar or Explore tab to browse by category
   - Tap the map on any property to see its location

2. LOGIN WITH DEMO ACCOUNT:
   - Go to More tab → "تسجيل الدخول" (Login)
   - Select "فرد" (Individual) → Enter demo credentials
   
3. AUTHENTICATED FEATURES:
   - Activity tab: View your listings, drafts, and manage ads
   - Chat: In-app messaging with property context
   - Add listing: Tap the "+" button to create a new property listing
   - Favorites: Save properties and view them in More → المحفوظات
   - Profile: Edit profile, switch account types, manage settings

4. CONTACT ACTIONS:
   - On any property detail, tap Call, WhatsApp, or Chat to interact
   - Share any property via the share button

The app connects to a live backend at api.buyootna.cloud with real data.
```

### 4. Ensure Demo Data is Production-Ready

The demo account's properties should:
- Have real, high-quality images (not placeholders)
- Have realistic descriptions in Arabic
- Cover different property categories (شقة, فيلا, أرض, عمارة)
- Have phone numbers for Call/WhatsApp testing
- Have lat/lng for map features

---

## App Store Connect Checklist

- [ ] Set demo username in App Review Information
- [ ] Set demo password in App Review Information
- [ ] Write detailed review notes (above)
- [ ] Ensure the production API at `api.buyootna.cloud` is stable
- [ ] Seed demo data in production database
- [ ] Verify demo account works end-to-end before submission
- [ ] Update app version to 1.0.2 (bump from rejected 1.0.1)
- [ ] Consider adding screenshots that showcase interactive features (not just static screens)
- [ ] Update App Store description to emphasize interactive features

---

## Verification

- [ ] Demo credentials successfully log in on production
- [ ] Demo account has visible listings in Activity tab
- [ ] Demo account has pre-existing chat conversations
- [ ] Demo account has favorited properties visible in Saved section
- [ ] Demo account can create a new listing (has free ad quota)
- [ ] All interactive features work when logged in as demo user
- [ ] API at `api.buyootna.cloud` is accessible and responding
- [ ] Review notes are clear and guide the reviewer through the app
