import { z } from 'zod';

export const companyLoginSchema = z.object({
  identifier: z
    .string({ message: 'هذا الحقل مطلوب' })
    .min(1, 'هذا الحقل مطلوب')
    .refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^\+?\d+$/.test(val);
      return isEmail || isPhone;
    }, 'أدخل بريد إلكتروني أو رقم هاتف صحيح'),
  password: z
    .string({ message: 'كلمة المرور مطلوبة' })
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export type CompanyLoginFormValues = z.infer<typeof companyLoginSchema>;

// `includeAccountFields` controls whether email/phone/password are required.
// They're only needed when this form is creating a brand-new user account
// (logged-out signup). When adding an extra identity to an already logged-in
// account, that account already has these fields, so they're skipped.
export function createCompanySignupSchema(includeAccountFields: boolean) {
  const base = z.object({
    type: z.enum(['company', 'office']),
    // Step 1: Basic Info
    name: z.string({ message: 'الاسم مطلوب' }).min(2, 'الاسم قصير جداً'),
    email: includeAccountFields
      ? z
          .string({ message: 'البريد الإلكتروني مطلوب' })
          .email('البريد الإلكتروني غير صالح')
      : z.string().optional(),
    phone: z
      .string()
      .regex(
        /^(?:\+?965)?[569]\d{7}$/,
        'رقم الهاتف يجب أن يكون رقم كويتي صالح',
      )
      .optional()
      .or(z.literal('')),
    password: includeAccountFields
      ? z
          .string({ message: 'كلمة المرور مطلوبة' })
          .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      : z.string().optional(),
    confirmPassword: includeAccountFields
      ? z.string({ message: 'تأكيد كلمة المرور مطلوب' })
      : z.string().optional(),

    // Step 2: Details
    services: z.string().optional(),
    hqLocation: z.string().optional(),
    serviceAreas: z.string().optional(),
    about: z.string().optional(),
    logo: z.any().optional(),

    // Step 3: Licensing
    licenseActivity: z.string().optional(),
    licenseNumber: z
      .string({ message: 'رقم الرخصة مطلوب' })
      .min(1, 'رقم الرخصة مطلوب'),
    licenseExpiry: z.string().optional(),
    licenseFile: z.any().optional(),
  });

  return includeAccountFields
    ? base.refine((data) => data.password === data.confirmPassword, {
        message: 'كلمات المرور غير متطابقة',
        path: ['confirmPassword'],
      })
    : base;
}

export const companySignupSchema = createCompanySignupSchema(true);

export type CompanySignupFormValues = z.infer<typeof companySignupSchema>;

// Helpers to validate specific steps
export function getStep1Fields(
  includeAccountFields: boolean,
): (keyof CompanySignupFormValues)[] {
  return includeAccountFields
    ? ['name', 'email', 'phone', 'password', 'confirmPassword']
    : ['name'];
}
export const STEP_2_FIELDS: (keyof CompanySignupFormValues)[] = [
  'services',
  'hqLocation',
  'about',
  'logo',
];
