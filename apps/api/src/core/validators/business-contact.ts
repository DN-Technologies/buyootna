// A company's or office's sign-up contact: an email, a Kuwaiti mobile, or
// both, and the code goes to the one the app chose («verification»).
// QA asked for one «البريد الإلكتروني أو رقم الهاتف» field, as an
// individual's sign-up has.
export const KUWAIT_PHONE_PATTERN = /^(?:\+?965)?[569]\d{7}$/;

export const KUWAIT_PHONE_MESSAGE = 'رقم الهاتف يجب أن يكون رقم كويتي صالح';

// «verification»: where the sign-up code goes. 'email' is also what apps
// from before phone sign-up send (with an email); without it, an app older
// still, which created the account at once, is asked to update
export const SIGNUP_CHANNELS = ['email', 'phone'] as const;
export type SignupChannel = (typeof SIGNUP_CHANNELS)[number];
