// Seeds a fresh, verified, EMAIL-only individual account (no phone on
// file) directly via the API — the exact account shape the reported bug
// affected, since RecoveryService previously only ever sent an OTP over
// SMS and silently sent nothing for email-only accounts. Done via direct
// API calls rather than the signup UI (already covered end-to-end by
// individual-signup-email.yaml) to keep this flow focused on the
// forgot-password steps themselves.
const email = 'maestro-forgot-password@buyootna.test';
const oldPassword = 'MaestroOldPass123!';

const registerRes = http.post(
  'http://localhost:8000/users/register/individual',
  {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maestro Forgot Password Test',
      identifier: email,
      password: oldPassword,
    }),
  },
);

if (registerRes.status !== 201) {
  throw new Error(
    'Failed to seed forgot-password test account: ' +
      registerRes.status +
      ' ' +
      registerRes.body,
  );
}

const otpRes = http.get(
  'http://localhost:8000/auth/register/debug-email-otp?email=' +
    encodeURIComponent(email),
);
const signupOtp = json(otpRes.body).otp;

const verifyRes = http.post('http://localhost:8000/auth/register/verify-email-otp', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, otp: signupOtp }),
});

if (verifyRes.status !== 201) {
  throw new Error(
    'Failed to verify seeded account: ' + verifyRes.status + ' ' + verifyRes.body,
  );
}

output.email = email;
output.oldPassword = oldPassword;
