// Reads the mock OTP the API logged for the just-submitted email signup, via
// GET /auth/register/debug-email-otp — a dev/CI-only endpoint that 404s
// unless MailService is in mock mode (never true in production). Needed
// because this flow drives the app as a black box from a separate process,
// unlike the Jest e2e specs which can read the OTP straight out of server
// memory (see test/utils/otp.ts's getMockEmailOtpCode).
const email = 'maestro-signup@buyootna.test';
const response = http.get(
  'http://localhost:8000/auth/register/debug-email-otp?email=' +
    encodeURIComponent(email),
);
const body = json(response.body);
output.otp = body.otp;
