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

export const companySignupSchema = z
  .object({
    type: z.enum(['company', 'office']),
    // Step 1: Basic Info
    name: z.string({ message: 'الاسم مطلوب' }).min(2, 'الاسم قصير جداً'),
    email: z
      .string({ message: 'البريد الإلكتروني مطلوب' })
      .email('البريد الإلكتروني غير صالح'),
    phone: z
      .string({ message: 'رقم الهاتف مطلوب' })
      .regex(/^(?:\+?965)?[569]\d{7}$/, 'رقم الهاتف يجب أن يكون رقم كويتي صالح'),
    password: z
      .string({ message: 'كلمة المرور مطلوبة' })
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z.string({ message: 'تأكيد كلمة المرور مطلوب' }),

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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export type CompanySignupFormValues = z.infer<typeof companySignupSchema>;

// Helpers to validate specific steps
export const STEP_1_FIELDS: (keyof CompanySignupFormValues)[] = [
  'name',
  'email',
  'phone',
  'password',
  'confirmPassword',
];
export const STEP_2_FIELDS: (keyof CompanySignupFormValues)[] = [
  'services',
  'hqLocation',
  'about',
  'logo',
];
