import { DocSection } from "./types";

export const api: DocSection = {
  slug: "api",
  title: "API",
  summary:
    "NestJS backend (apps/api/src/features + core): auth/identities, properties/search/map/favorites, chat, notifications, plans/payments/invoices, reviews, and core Twilio/S3/Prisma services. These stories focus on cross-cutting correctness that a UI-only pass would miss.",
  stories: [
    {
      id: "api-auth-guards",
      title: "JWT and Admin guards correctly gate every protected endpoint",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify that every non-public endpoint is actually protected by AuthGuard('jwt') (and admin/* endpoints additionally by AdminGuard), so that no authenticated-only or admin-only data (users, favorites, chat, admin/users) is reachable with a missing, expired, or non-admin token.",
      acceptanceCriteria: [
        "Calling any protected endpoint with no Authorization header returns 401, not a 200 with empty/default data.",
        "Calling any protected endpoint with an expired or tampered JWT returns 401.",
        "Calling any admin/* endpoint with a valid JWT for a non-admin user returns 403, not 200.",
        "Public endpoints (GET companies, GET offices, GET company/:id, GET office/:id) remain accessible without a token, as intended.",
      ],
      testScenarios: [
        "Script a pass over the known protected endpoint list with no token and confirm 401 across the board (favorites, chat, notifications, devices, plans, wallet, invoices, settings).",
        "Take a valid non-admin JWT and hit every admin/* endpoint (users, users/:id, PATCH status, DELETE, PATCH identities/:id/status) — confirm 403 on all.",
        "Tamper one character of a valid JWT's signature and confirm 401, not a crash or 500.",
        "Confirm the public company/office listing endpoints still return data with zero auth headers sent.",
      ],
    },
    {
      id: "api-identity-scoping",
      title: "identity-type.guard.ts correctly scopes multi-identity endpoints",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the identity-type guard prevents a user's individual identity from calling company/office-scoped endpoints (and vice versa) even while authenticated with a valid JWT, so that identity-switching (mobile-identity-switch) is enforced server-side, not just hidden client-side.",
      acceptanceCriteria: [
        "Acting as an individual identity, calling an endpoint that requires a company/office identity type returns a clear 403, not partial/empty data.",
        "Switching identity via POST auth/identity/switch and retrying the same call succeeds once the active identity matches.",
        "Data returned always belongs to the currently-active identity, never a different identity owned by the same account.",
      ],
      testScenarios: [
        "As an authenticated individual identity, directly call a company-scoped endpoint (bypassing the mobile UI) and confirm a 403 rather than data leakage.",
        "Switch to a company identity, retry the same call, and confirm it now succeeds and returns only that company identity's data.",
        "Create two identities (individual + company) under one account, fetch data as each, and diff the results to confirm zero overlap where there shouldn't be any.",
      ],
    },
    {
      id: "api-favorites-endpoints",
      title: "Favorites endpoints stay internally consistent",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify POST /favorites/:propertyId (toggle), GET /favorites, GET /favorites/ids, and GET /favorites/check/:propertyId always agree with each other for the same user/property, so that the mobile app (mobile-favorites) never renders a heart icon that contradicts the favorites list.",
      acceptanceCriteria: [
        "After toggling favorite on, GET /favorites/check/:propertyId returns true, the property's ID is present in GET /favorites/ids, and the full property appears in GET /favorites.",
        "After toggling it off, all three reflect false/absent consistently.",
        "Toggling a property that doesn't exist (deleted) returns a sane error, not a 500 or a silently 'successful' favorite of nothing.",
      ],
      testScenarios: [
        "Toggle favorite on a property, then call all three GET endpoints and confirm they agree.",
        "Toggle it off and repeat the check.",
        "Call POST /favorites/:propertyId with a non-existent or already-deleted property ID and confirm a clean error response.",
        "Favorite the same property twice in a row (toggle on, toggle on again — i.e. two calls) and confirm the second call toggles it off rather than erroring or double-favoriting.",
      ],
    },
    {
      id: "api-chat-gateway",
      title: "ChatGateway events stay in sync with the REST chat endpoints",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the WebSocket events (join_conversation, leave_conversation, send_message → new_message/conversation_updated/error) and the REST endpoints (POST conversations, GET conversations, GET conversations/:id/messages, POST conversations/:id/read) never disagree about a conversation's message history or read state, so mobile chat (mobile-chat-realtime) is provably correct at the transport layer, not just in manual UI testing.",
      acceptanceCriteria: [
        "A message sent via the send_message socket event is retrievable immediately after via GET conversations/:id/messages.",
        "join_conversation/leave_conversation correctly scope which sockets receive new_message for a given conversation — a socket that left shouldn't receive further events for it.",
        "Sending a message to a conversation the sender isn't a participant in emits error, not new_message.",
        "POST conversations/:id/read correctly zeroes unread count returned by whatever endpoint mobile uses to badge the chat list.",
      ],
      testScenarios: [
        "Open two socket connections as two different accounts in the same conversation; send from one, confirm the other receives new_message and conversation_updated.",
        "Have one connection call leave_conversation, then send a message from the other — confirm the departed socket receives nothing further for that conversation.",
        "Attempt send_message from an account with no membership in that conversation and confirm an error event, not a silently-accepted message.",
        "Send several messages, call POST conversations/:id/read, then re-fetch unread state and confirm it's zero.",
      ],
    },
    {
      id: "api-payments-webhook",
      title: "Tap payment webhook is idempotent and can't be spoofed",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify POST payments/webhook correctly validates the Tap webhook signature/source and is idempotent under retries, so that a replayed or forged webhook call can't mark an invoice paid without a real payment, and a legitimate retry (Tap's own retry behavior) doesn't double-credit an account.",
      acceptanceCriteria: [
        "A webhook call missing valid Tap signing/auth is rejected, not processed as a real payment event.",
        "Replaying the exact same legitimate webhook payload twice results in the invoice being marked paid once, not double-processed (e.g. double wallet credit).",
        "GET payments/status/:invoiceId reflects the correct final state after webhook processing, matching what POST payments/charge + the redirect flow shows the user (mobile-payments).",
      ],
      testScenarios: [
        "Send a webhook payload with an invalid/missing signature and confirm it's rejected, and no invoice status changes.",
        "Send a valid webhook payload twice in a row (simulating Tap's retry behavior) and confirm the invoice/wallet only reflects the payment once.",
        "Run a full charge → redirect → webhook cycle and cross-check GET payments/status/:invoiceId matches the invoice list shown in mobile more/invoices.",
      ],
    },
    {
      id: "api-search-strategies",
      title: "Each search strategy (standard/exchange/auction/deal/company) returns correctly-scoped results",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify POST search/advanced correctly dispatches to the right strategy (standard/exchange/auction/deal/company) and that each strategy's results only include listings actually matching that category, so that, e.g., an exchange search never returns a plain sale listing just because it matched on keyword/location.",
      acceptanceCriteria: [
        "Each of the 5 strategies returns only listings of its own category, correctly filtered by any additional params (location, price range, etc.) passed for that strategy.",
        "GET search (the quick/simple search) returns results consistent with what an equivalent POST search/advanced standard-strategy call would return for the same query.",
        "An invalid/unrecognized strategy value returns a clear validation error, not a silent fallback to a different strategy.",
      ],
      testScenarios: [
        "Run the same location/keyword query through each of the 5 strategies and confirm result categories never mix (no sale listings in exchange results, etc.).",
        "Compare GET search's quick results against POST search/advanced with strategy: \"standard\" for an identical query string.",
        "Send an unrecognized strategy string and confirm a validation error rather than results from an unintended default strategy.",
      ],
    },
    {
      id: "api-otp-fallback",
      title: "Twilio OTP mock-fallback is safely dev-only",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify twilio.service.ts's mock-SMS fallback (used when Twilio credentials aren't configured) is only ever active in development/test environments and never silently active in production, so that production OTP delivery can never fall back to a logged-but-not-sent 'mock' code that would let anyone log the OTP and take over an account.",
      acceptanceCriteria: [
        "In an environment with valid Twilio credentials configured, OTPs are actually sent via Twilio, and the mock fallback path is never taken.",
        "If Twilio credentials are missing, the mock fallback logs clearly and obviously (so it's caught in review/monitoring) rather than failing silently.",
        "Production deployment configuration is verified to always have valid Twilio credentials present — this should be an explicit deploy-checklist/monitoring item, not just a code-review assumption.",
      ],
      testScenarios: [
        "In a local/dev environment with Twilio env vars unset, trigger an OTP request and confirm the mock fallback logs the code clearly to the console/logs.",
        "In staging/production-like config with real Twilio credentials, trigger an OTP request and confirm it's delivered via actual SMS, not logged as a mock.",
        "Add or confirm existence of a startup check/alert that fires if the production environment ever boots without valid Twilio credentials configured.",
      ],
    },
    {
      id: "api-media-upload",
      title: "Media upload endpoints validate file type/size before hitting S3",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify POST media/upload/avatar and POST media/upload/listings validate file type and size before storing to S3, so that the app can't be used to store arbitrary/oversized files, and so a bad upload fails fast with a clear error instead of partially succeeding.",
      acceptanceCriteria: [
        "Non-image files (or disallowed types) are rejected with a clear error before any S3 write occurs.",
        "Oversized files are rejected with a clear size-limit error rather than timing out or partially uploading.",
        "A successful upload returns a URL that is immediately and correctly usable in the property/profile that referenced it (listing images, avatar).",
      ],
      testScenarios: [
        "Upload a valid small JPEG/PNG as an avatar and confirm it appears correctly on the profile.",
        "Upload a non-image file (e.g. a .txt or .pdf) to both endpoints and confirm rejection with a clear error, not a generic 500.",
        "Upload an oversized image (well beyond the expected limit) and confirm a clean rejection rather than a hung request.",
        "Upload multiple listing images in one add-listing flow and confirm all are correctly associated with that listing, none dropped or mismatched.",
      ],
    },
  ],
};
