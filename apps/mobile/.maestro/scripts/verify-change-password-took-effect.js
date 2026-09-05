// Final assertion for change-password-no-phone.yaml: proves the backend
// password was actually updated, via the same direct-API technique the
// seed script already uses (rather than a fragile extra UI logout/login
// round-trip through an untested bottom sheet). The UI steps already prove
// the reported bug -- submitting with no OTP, no verification sheet, a
// success alert; this proves it wasn't just a UI-only illusion.
const email = output.email;
const newPassword = output.newPassword;

const oldPasswordLogin = http.post('http://localhost:8000/auth/login', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: email, password: output.oldPassword }),
});
if (oldPasswordLogin.status !== 401) {
  throw new Error(
    'Expected the OLD password to be rejected after the change, got status ' +
      oldPasswordLogin.status,
  );
}

const newPasswordLogin = http.post('http://localhost:8000/auth/login', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: email, password: newPassword }),
});
if (newPasswordLogin.status !== 201) {
  throw new Error(
    'Expected the NEW password to log in successfully, got status ' +
      newPasswordLogin.status +
      ' ' +
      newPasswordLogin.body,
  );
}
