// Minimal shapes of the JSON bodies these e2e specs assert on — supertest's
// `.body` is untyped by default, so these give the assertions real types
// instead of `any`.

export interface UserResponseBody {
  id: string;
  email: string | null;
  phone: string | null;
}

export interface IdentityResponseBody {
  id: string;
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
}

export interface LoginResponseBody {
  access_token: string;
  user: UserResponseBody;
  activeIdentity: IdentityResponseBody;
  identities: IdentityResponseBody[];
}

export interface MessageResponseBody {
  message: string;
}

export interface VerifyRecoveryOtpResponseBody {
  message: string;
  resetToken: string;
}
