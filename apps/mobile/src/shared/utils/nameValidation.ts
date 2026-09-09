// Arabic letters, English letters, and plain spaces only -- rejects emojis,
// digits, and symbols (e.g. @, #, $) in a person's name. Mirrored on the
// backend in core/validators/name.regex.ts; keep both in sync.
export const NAME_REGEX = /^[؀-ۿa-zA-Z ]+$/;
export const NAME_REGEX_MESSAGE =
  'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية ومسافات فقط';
