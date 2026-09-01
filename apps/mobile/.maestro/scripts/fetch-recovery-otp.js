// Reads the mock OTP the API logged for the just-submitted password-reset
// request, via GET /auth/recovery/debug-email-otp — a dev/CI-only endpoint
// that 404s unless MailService is in mock mode (never true in production).
// If RecoveryService never sent an email OTP (the reported bug), this
// request 404s and the flow fails here rather than silently proceeding.
const response = http.get(
  'http://localhost:8000/auth/recovery/debug-email-otp?email=' +
    encodeURIComponent(output.email),
);

if (response.status !== 200) {
  throw new Error(
    'No password-reset OTP was found for ' +
      output.email +
      ' (status ' +
      response.status +
      ') -- the OTP was never sent.',
  );
}

output.resetOtp = json(response.body).otp;
