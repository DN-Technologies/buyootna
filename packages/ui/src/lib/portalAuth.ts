import type { SignupFormData } from "../components/SignupForm";

// The part of an axios instance the portals' sign-in needs
interface PostClient {
  post: (url: string, body?: unknown) => Promise<{ data: any }>;
}

interface LoginResponse {
  access_token: string;
  user: unknown;
}

function saveSession(data: LoginResponse) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

const isEmail = (value: string) => value.includes("@");

/**
 * Sign-in and sign-up for the web portals, against the current API:
 * login by `identifier`; individuals register and then confirm the SMS or
 * email code; companies and offices register (with their licence) and are
 * signed in with their email.
 */
export function createPortalAuth(api: PostClient) {
  const login = async (identifier: string, password: string) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    saveSession(data as LoginResponse);
  };

  return {
    login,

    /** Resolves with `codeSentTo` when a verification code was sent. */
    async signup(form: SignupFormData): Promise<void | { codeSentTo: string }> {
      if (form.role === "INDIVIDUAL") {
        const identifier = form.phone || form.email || "";
        await api.post("/users/register/individual", {
          name: form.name,
          identifier,
          password: form.password,
        });
        return { codeSentTo: identifier };
      }

      const kind = form.role === "COMPANY" ? "company" : "office";
      await api.post(`/users/register/${kind}`, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        licenseNumber: form.licenseNumber,
      });
      await login(form.email!, form.password);
    },

    /** Confirms the signup code; the API creates the account and signs in. */
    async verifyCode(code: string, codeSentTo: string) {
      const { data } = isEmail(codeSentTo)
        ? await api.post("/auth/register/verify-email-otp", {
            email: codeSentTo,
            otp: code,
          })
        : await api.post("/auth/register/verify-otp", {
            phone: codeSentTo,
            otp: code,
          });
      saveSession(data as LoginResponse);
    },
  };
}
