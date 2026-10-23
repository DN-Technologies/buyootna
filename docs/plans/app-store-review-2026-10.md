# App Store review — Guideline 2.1 (Information Needed)

Apple asked (new app submission) for a screen recording, a description, access
instructions, external services, regional differences and any regulated-
industry documents. This list gets the app ready, records it, and replies.
Tick each box when it is done.

## 1. Blockers (fix before recording)

### 1.1 Users can block each other (Guideline 1.2)
- [x] API: block / unblock a profile, and list my blocks
- [x] API: a block hides that profile's reviews and stories from me
      (listings in public search/map stay visible — decided; **reversed on
      2026-10-23**, see §6: Apple requires a block to clear their content)
- [x] API: neither side can start a chat or send messages; existing chats stop
- [x] App: «حظر» on provider profiles (company, office), in chat and on stories
- [x] App: «المحظورون» list in settings, with unblock
- [x] Tests (API + app), docs QA story (EN + AR)
- [x] Migration checked on a scratch database, then applied to production
      (scratch: migrations and schema identical; Neon production 61/61 on 2026-10-21)
- [x] Merged (#342), deployed (`cd.yml`), app update published (`5c13728d`)

### 1.2 Stories in the live app without the server
- [x] Decide: release Stories now, or hide them until later — **release**
- [x] If release: fix CI on #336 → merge #336, #338, #340 → deploy (`cd.yml`) → app update
      (API deployed 2026-10-20 14:26; #340 merged; app update `41a6e8ac`)
- [x] ~~If hide: app update with the Stories tray and «قصتك» switched off~~ (not needed)
- [ ] Check on a phone: as a company, posting a story works (or nothing shows)

### 1.3 In-app purchase (Guideline 3.1.1)
- [x] Decide how listing packages, "feature this ad" and company subscriptions are sold on iOS
      (Apple In-App Purchase, or Tap with a written justification) — **keep Tap, justify**
- [x] ~~If In-App Purchase: create the products in App Store Connect and add them to the app~~ (not needed)
- [ ] If Tap: write the justification for the reply

## 2. Demo accounts (production)
- [ ] Individual: email + password
- [ ] Company: approved, with an active subscription, a few listings and a story
- [ ] Office: approved, with a few listings
- [ ] Each one logs in on a phone with the store build

## 3. Confirm the facts in the reply
- [ ] Map provider (Mapbox only, or also Apple / Google maps)
- [ ] Available in every region, or Kuwait only
- [ ] Company commercial registration / licence to attach (if any)

## 4. Screen recording (physical iPhone, latest iOS)
- [ ] Recording starts at app launch
- [ ] Register an individual, log out, log in (also Sign in with Apple / Google)
- [ ] Browse listings, search, map, open a listing
- [ ] Post a listing; buy a package or "feature this ad" (payment screen shown)
- [ ] Chat with a company; report a listing, a user and a story; block a user
- [ ] Switch to the company: requests, send an offer, subscription screen, post a story
- [ ] Settings → «حذف الحساب»: delete the account

## 5. Reply to Apple
- [ ] Fill in the draft reply (device, iOS version, demo accounts, attachments)
- [ ] Reply in App Store Connect with the recording attached
- [ ] Paste the same text into App Review Information → Notes
- [ ] Resubmit for review

## 6. Rejection 2026-10-22 — Guideline 1.2 (user-generated content)

Version 1.5.0 (1), submission fd46064e, reviewed on iPad Air 11-inch (M3).
Apple wants every precaution in place **and** a recording on a physical
device of the terms before sign-in, flagging, and blocking. Branch
`fix/ugc-guideline-1-2`.

### 6.1 What the app now does
- [x] Terms (EULA) at sign-up: unticked «شروط الاستخدام و سياسة الخصوصية»
      box on every sign-up form, required for the form, Apple and Google;
      recorded on the account (`termsAcceptedAt`, `termsVersion`). Not on
      login (decided 2026-10-23), where «تذكري» was removed
- [x] Terms text: «سياسة عدم التسامح مع المحتوى المسيء» (zero tolerance,
      report and block, 24-hour removal and suspension)
- [x] Filter: banned words refuse listings, reviews, story captions,
      requests, offers and profiles; masked as *** in chat
- [x] Flag: listings (flag on the ad) and reviews («إبلاغ»), as well as
      the existing users, companies, offices and stories
- [x] Block notifies us: each new block is filed as a report «حظر المستخدم»
- [x] Block clears their content at once: listings, map pins, search,
      favorites and requests too (stories, reviews and chats already)
- [x] 24 hours: every report and block emails `MODERATION_ALERT_EMAIL`;
      admin › البلاغات › «حذف المحتوى وإيقاف الحساب» removes the content,
      suspends the author and resolves the report

### 6.2 Release (in this order: the API refuses unknown fields)
- [ ] Set `MODERATION_ALERT_EMAIL` (and `DIRECT_URL`) in the server's
      `apps/api/.env`
- [ ] Merge, then deploy the API (`cd.yml`): migration
      `20261023090000_ugc_terms_review_reports`
- [ ] Only after the API is live: app update (`release-ota.js`, production).
      An app sending `acceptTerms` to the old API is refused, so the order
      matters
- [ ] Check that a test report reaches the inbox, and enforce works in the
      admin panel

### 6.3 Recording (physical iPhone, store build + update)
- [ ] Launch → تسجيل جديد: the terms checkbox, unticked; trying إنشاء حساب
      shows «الموافقة على الشروط»; open شروط الاستخدام (the new section)
- [ ] Tick → create the account (or log in with the demo account)
- [ ] Report a listing (flag on the ad), a review («إبلاغ»), a user (chat ⋮)
- [ ] Block a company (profile ⋮) → back home: its ads are gone; Settings ›
      المحظورون
- [ ] Optional: the admin panel receiving the report and «حذف المحتوى
      وإيقاف الحساب»

### 6.4 Reply
- [ ] Reply in App Store Connect with `docs/plans/app-store-review-1.2-reply.md`
      and the recording; put the same in App Review Information → Notes
- [ ] Resubmit

