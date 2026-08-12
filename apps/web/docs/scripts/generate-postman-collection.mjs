// Regenerates public/buyootna-api.postman_collection.json.
// Run with: node scripts/generate-postman-collection.mjs
// Keep this in sync with apps/api/src/features/**/*.controller.ts + *.dto.ts by hand —
// there's no live introspection here, so re-check routes/DTOs after backend changes.
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function noAuth() {
  return { type: "noauth" };
}

function bearerInherit() {
  return undefined; // omitted => inherits collection-level bearer auth
}

function jsonBody(obj) {
  return {
    mode: "raw",
    raw: JSON.stringify(obj, null, 2),
    options: { raw: { language: "json" } },
  };
}

function req({ name, method, path, query, body, auth, description }) {
  const url = {
    raw: `{{baseUrl}}${path}${query ? "?" + query.map((q) => `${q.key}=${q.value}`).join("&") : ""}`,
    host: ["{{baseUrl}}"],
    path: path.replace(/^\//, "").split("/"),
  };
  if (query) url.query = query;

  const item = {
    name,
    request: {
      method,
      header: body ? [{ key: "Content-Type", value: "application/json" }] : [],
      url,
      description,
    },
  };
  if (body) item.request.body = jsonBody(body);
  if (auth !== undefined) item.request.auth = auth;
  return item;
}

function folder(name, items) {
  return { name, item: items };
}

const collection = {
  info: {
    name: "Buyootna API",
    description:
      "Generated from apps/api controllers + DTOs for QA use. Set {{baseUrl}} (e.g. http://localhost:8000) and {{accessToken}} (from POST /auth/login) in the collection/environment variables. Most requests inherit collection-level Bearer auth; public endpoints are explicitly set to No Auth.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  auth: {
    type: "bearer",
    bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }],
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:8000", type: "string" },
    { key: "accessToken", value: "", type: "string" },
    { key: "propertyId", value: "", type: "string" },
    { key: "userId", value: "", type: "string" },
    { key: "identityId", value: "", type: "string" },
    { key: "conversationId", value: "", type: "string" },
    { key: "invoiceId", value: "", type: "string" },
    { key: "notificationId", value: "", type: "string" },
    { key: "deviceId", value: "", type: "string" },
    { key: "reviewId", value: "", type: "string" },
  ],
  item: [
    folder("Auth", [
      req({
        name: "Login",
        method: "POST",
        path: "/auth/login",
        auth: noAuth(),
        body: { identifier: "user@example.com", password: "password123" },
        description: "Passport local strategy. identifier = email or phone. Response includes the JWT to put in {{accessToken}}.",
      }),
      req({
        name: "Verify Registration OTP",
        method: "POST",
        path: "/auth/register/verify-otp",
        auth: noAuth(),
        body: { identifier: "user@example.com", otp: "123456" },
      }),
      req({
        name: "Switch Identity",
        method: "POST",
        path: "/auth/identity/switch",
        body: { identityId: "{{identityId}}" },
      }),
      req({
        name: "Request Change-Password OTP",
        method: "POST",
        path: "/auth/change-password/request-otp",
      }),
      req({
        name: "Change Password",
        method: "PATCH",
        path: "/auth/change-password",
        body: { otp: "123456", newPassword: "newPassword123" },
      }),
    ]),

    folder("Recovery", [
      req({
        name: "Request OTP",
        method: "POST",
        path: "/auth/recovery/request-otp",
        auth: noAuth(),
        body: { identifier: "user@example.com" },
      }),
      req({
        name: "Verify OTP",
        method: "POST",
        path: "/auth/recovery/verify-otp",
        auth: noAuth(),
        body: { identifier: "user@example.com", otp: "123456" },
        description: "Response contains a short-lived resetToken for Reset Password.",
      }),
      req({
        name: "Reset Password",
        method: "POST",
        path: "/auth/recovery/reset-password",
        auth: noAuth(),
        body: { resetToken: "<from verify-otp response>", newPassword: "newPassword123" },
      }),
    ]),

    folder("Users", [
      req({ name: "Register Individual", method: "POST", path: "/users/register/individual", auth: noAuth(), body: { email: "individual@example.com", phone: "+96599999999", password: "password123" } }),
      req({ name: "Register Company", method: "POST", path: "/users/register/company", auth: noAuth(), body: { name: "Acme Real Estate", email: "company@example.com", password: "password123", licenseNumber: "LIC-12345", hqLocation: "Kuwait City", services: "Brokerage" } }),
      req({ name: "Register Office", method: "POST", path: "/users/register/office", auth: noAuth(), body: { name: "Al Salem Office", email: "office@example.com", password: "password123", licenseNumber: "LIC-67890", hqLocation: "Hawally" } }),
      req({ name: "Get Companies (public)", method: "GET", path: "/users/companies", auth: noAuth(), query: [{ key: "page", value: "1" }, { key: "limit", value: "10" }] }),
      req({ name: "Get Company By Id (public)", method: "GET", path: "/users/company/{{userId}}", auth: noAuth() }),
      req({ name: "Get Offices (public)", method: "GET", path: "/users/offices", auth: noAuth(), query: [{ key: "page", value: "1" }, { key: "limit", value: "10" }] }),
      req({ name: "Get Office By Id (public)", method: "GET", path: "/users/office/{{userId}}", auth: noAuth() }),
      req({ name: "Update Profile", method: "PATCH", path: "/users/profile", body: { name: "Updated Name", about: "Updated bio" } }),
      req({ name: "Update Role", method: "PATCH", path: "/users/role", body: { role: "INDIVIDUAL" } }),
      req({ name: "Delete Account", method: "DELETE", path: "/users/account" }),
      req({ name: "Disable Account", method: "PATCH", path: "/users/account/disable" }),
      req({ name: "Get Me", method: "GET", path: "/users/me" }),
      req({ name: "Get User By Id", method: "GET", path: "/users/{{userId}}" }),
    ]),

    folder("Identities", [
      req({ name: "List My Identities", method: "GET", path: "/identities" }),
      req({ name: "Get Current Identity", method: "GET", path: "/identities/current" }),
      req({ name: "Get Identity By Id", method: "GET", path: "/identities/{{identityId}}" }),
      req({ name: "Create Individual Identity", method: "POST", path: "/identities/individual", body: { name: "New Individual", whatsapp: "+96599999999" } }),
      req({ name: "Create Company Identity", method: "POST", path: "/identities/company", body: { name: "New Company", licenseNumber: "LIC-11111", services: "Maintenance", hqLocation: "Salmiya" } }),
      req({ name: "Create Office Identity", method: "POST", path: "/identities/office", body: { name: "New Office", licenseNumber: "LIC-22222", hqLocation: "Farwaniya" } }),
      req({ name: "Update Identity", method: "PATCH", path: "/identities/{{identityId}}", body: { name: "Renamed Identity" } }),
      req({ name: "Delete Identity", method: "DELETE", path: "/identities/{{identityId}}" }),
      req({ name: "Get Public Profile By Identity Id", method: "GET", path: "/profiles/{{identityId}}" }),
    ]),

    folder("Admin", [
      req({ name: "List Users", method: "GET", path: "/admin/users", query: [{ key: "page", value: "1" }, { key: "limit", value: "10" }] }),
      req({ name: "Get User By Id", method: "GET", path: "/admin/users/{{userId}}" }),
      req({ name: "Update User Status", method: "PATCH", path: "/admin/users/{{userId}}/status", body: { status: "blocked" } }),
      req({ name: "Delete User", method: "DELETE", path: "/admin/users/{{userId}}" }),
      req({ name: "Update Identity Verification Status", method: "PATCH", path: "/admin/identities/{{identityId}}/status", body: { status: "APPROVED" } }),
    ]),

    folder("Properties", [
      req({ name: "Home Feed", method: "GET", path: "/properties/feed/home" }),
      req({ name: "Metadata Features", method: "GET", path: "/properties/metadata/features" }),
      req({ name: "My Activity", method: "GET", path: "/properties/me/activity" }),
      req({ name: "List Properties", method: "GET", path: "/properties", query: [{ key: "page", value: "1" }, { key: "limit", value: "10" }] }),
      req({ name: "Get Property By Id", method: "GET", path: "/properties/{{propertyId}}" }),
      req({ name: "Increment Property View", method: "PATCH", path: "/properties/{{propertyId}}/view" }),
      req({
        name: "Create Property",
        method: "POST",
        path: "/properties",
        body: {
          isDraft: false,
          type: "SALE",
          category: "APARTMENT",
          areaSize: 120,
          beds: 3,
          baths: 2,
          price: 65000,
          images: ["https://example.com/image1.jpg"],
        },
        description: "type/category are Prisma enums (ListingType/PropertyCategory) — check apps/api/prisma/schema for the current valid values before sending.",
      }),
      req({ name: "Update Property", method: "PATCH", path: "/properties/{{propertyId}}", body: { price: 68000 } }),
      req({ name: "Delete Property", method: "DELETE", path: "/properties/{{propertyId}}" }),
    ]),

    folder("Search", [
      req({
        name: "Advanced Search",
        method: "POST",
        path: "/search/advanced",
        auth: noAuth(),
        body: {
          tab: "sell",
          page: 1,
          limit: 10,
          filters: { minPrice: 30000, maxPrice: 100000, rooms: 3 },
        },
        description: "tab: sell | rent | exchange | companies | auctions | deals — each maps to a different strategy/filter shape (see advanced-filters.dto.ts).",
      }),
      req({
        name: "Quick Search",
        method: "GET",
        path: "/search",
        auth: noAuth(),
        query: [{ key: "query", value: "شركة تشطيب" }, { key: "page", value: "1" }, { key: "limit", value: "10" }, { key: "sortBy", value: "recent" }],
      }),
    ]),

    folder("Map", [
      req({
        name: "Discover (map bounds)",
        method: "GET",
        path: "/map/discover",
        auth: noAuth(),
        query: [
          { key: "north", value: "29.45" },
          { key: "south", value: "29.20" },
          { key: "east", value: "48.10" },
          { key: "west", value: "47.85" },
        ],
      }),
    ]),

    folder("Favorites", [
      req({ name: "Toggle Favorite", method: "POST", path: "/favorites/{{propertyId}}" }),
      req({ name: "List Favorites", method: "GET", path: "/favorites" }),
      req({ name: "List Favorite Ids", method: "GET", path: "/favorites/ids" }),
      req({ name: "Check Favorite", method: "GET", path: "/favorites/check/{{propertyId}}" }),
    ]),

    folder("Chat", [
      req({ name: "Create Conversation", method: "POST", path: "/chat/conversations", body: { recipientId: "{{userId}}", propertyId: "{{propertyId}}" } }),
      req({ name: "List Conversations", method: "GET", path: "/chat/conversations" }),
      req({ name: "Get Conversation Messages", method: "GET", path: "/chat/conversations/{{conversationId}}/messages" }),
      req({ name: "Mark Conversation Read", method: "POST", path: "/chat/conversations/{{conversationId}}/read" }),
    ]),

    folder("Notifications", [
      req({ name: "List Notifications", method: "GET", path: "/notifications" }),
      req({ name: "Unread Count", method: "GET", path: "/notifications/unread-count" }),
      req({ name: "Mark All Read", method: "PATCH", path: "/notifications/read-all" }),
      req({ name: "Mark One Read", method: "PATCH", path: "/notifications/{{notificationId}}/read" }),
      req({ name: "Get Preferences", method: "GET", path: "/notifications/preferences" }),
      req({ name: "Update Preferences", method: "PATCH", path: "/notifications/preferences", body: { appEnabled: true, emailEnabled: false, phoneEnabled: true } }),
    ]),

    folder("Devices", [
      req({ name: "List Devices/Sessions", method: "GET", path: "/devices" }),
      req({ name: "Revoke One Device", method: "DELETE", path: "/devices/{{deviceId}}" }),
      req({ name: "Revoke All Devices", method: "DELETE", path: "/devices" }),
    ]),

    folder("Plans", [
      req({ name: "List Plans", method: "GET", path: "/plans" }),
      req({ name: "Wallet", method: "GET", path: "/plans/wallet" }),
      req({ name: "Plan History", method: "GET", path: "/plans/history" }),
      req({ name: "Wallet Publish Options", method: "GET", path: "/plans/wallet/publish-options" }),
    ]),

    folder("Payments", [
      req({
        name: "Create Charge",
        method: "POST",
        path: "/payments/charge",
        body: { planSlug: "gold", appRedirectUrl: "buyootna://payment-callback", sourceId: "src_card" },
        description: "sourceId is optional (Tap-hosted checkout flow when omitted).",
      }),
      req({ name: "Verify & Redirect (browser-hit, not typically called from Postman)", method: "GET", path: "/payments/redirect", auth: noAuth(), query: [{ key: "tap_id", value: "chg_xxx" }, { key: "invoiceId", value: "{{invoiceId}}" }, { key: "appRedirectUrl", value: "buyootna://payment-callback" }] }),
      req({ name: "Webhook (Tap → server, not typically called from Postman)", method: "POST", path: "/payments/webhook", auth: noAuth(), body: { tap_id: "chg_xxx", status: "CAPTURED" } }),
      req({ name: "Payment Status", method: "GET", path: "/payments/status/{{invoiceId}}" }),
    ]),

    folder("Invoices", [req({ name: "List Invoices", method: "GET", path: "/invoices" })]),

    folder("Reviews", [
      req({ name: "Create Review", method: "POST", path: "/users/{{userId}}/reviews", body: { rating: 5, comment: "Great experience" } }),
      req({ name: "List Reviews For User", method: "GET", path: "/users/{{userId}}/reviews" }),
      req({ name: "Reviews Summary For User", method: "GET", path: "/users/{{userId}}/reviews/summary" }),
      req({ name: "Like Review", method: "POST", path: "/reviews/{{reviewId}}/like" }),
      req({ name: "Dislike Review", method: "POST", path: "/reviews/{{reviewId}}/dislike" }),
      req({ name: "Delete Review", method: "DELETE", path: "/reviews/{{reviewId}}" }),
    ]),

    folder("Settings", [
      req({ name: "Get Settings", method: "GET", path: "/settings" }),
      req({ name: "Update Settings", method: "PATCH", path: "/settings", body: { language: "ar" } }),
    ]),

    folder("FAQ", [req({ name: "Get FAQ", method: "GET", path: "/faq", auth: noAuth() })]),

    folder("Media", [
      {
        name: "Upload Avatar",
        request: {
          method: "POST",
          header: [],
          url: { raw: "{{baseUrl}}/media/upload/avatar", host: ["{{baseUrl}}"], path: ["media", "upload", "avatar"] },
          body: { mode: "formdata", formdata: [{ key: "file", type: "file", src: "" }] },
          description: "NOT gated by AuthGuard in current code — verify this is intentional (see api-media-upload QA story) before assuming it needs a token.",
        },
      },
      {
        name: "Upload Listing Images",
        request: {
          method: "POST",
          header: [],
          url: { raw: "{{baseUrl}}/media/upload/listings", host: ["{{baseUrl}}"], path: ["media", "upload", "listings"] },
          body: { mode: "formdata", formdata: [{ key: "files", type: "file", src: "" }] },
          description: "NOT gated by AuthGuard in current code — verify this is intentional (see api-media-upload QA story) before assuming it needs a token.",
        },
      },
    ]),
  ],
};

const outPath = join(__dirname, "..", "public", "buyootna-api.postman_collection.json");
writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log(`Wrote ${outPath}`);
