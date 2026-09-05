// Seeds a fresh, verified, EMAIL-only individual account (no phone on
// file) directly via the API -- the exact account shape the reported bug
// affected: the app always requested a phone OTP before changing a
// password, which the backend always rejected for accounts with no phone
// to send it to. Done via direct API calls rather than the signup UI
// (already covered end-to-end by individual-signup-email.yaml) to keep
// this flow focused on the change-password steps themselves.
const email = 'maestro-change-password@buyootna.test';
const oldPassword = 'MaestroOldPass123!';

const registerRes = http.post(
  'http://localhost:8000/users/register/individual',
  {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maestro Change Password Test',
      identifier: email,
      password: oldPassword,
    }),
  },
);

if (registerRes.status !== 201) {
  throw new Error(
    'Failed to seed change-password test account: ' +
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
output.newPassword = 'MaestroNewPass456!';
