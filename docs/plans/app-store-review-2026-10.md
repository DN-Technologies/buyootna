# App Store review — Guideline 2.1 (Information Needed)

Apple asked (new app submission) for a screen recording, a description, access
instructions, external services, regional differences and any regulated-
industry documents. This list gets the app ready, records it, and replies.
Tick each box when it is done.

## 1. Blockers (fix before recording)

### 1.1 Users can block each other (Guideline 1.2)
- [x] API: block / unblock a profile, and list my blocks
- [x] API: a block hides that profile's reviews and stories from me
      (listings in public search/map stay visible — decided)
- [x] API: neither side can start a chat or send messages; existing chats stop
- [x] App: «حظر» on provider profiles (company, office), in chat and on stories
- [x] App: «المحظورون» list in settings, with unblock
- [x] Tests (API + app), docs QA story (EN + AR)
- [ ] Migration checked on a scratch database, then applied to production
      (scratch check done: migrations and schema identical)
- [ ] Merged, deployed (`cd.yml`), app update published

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
