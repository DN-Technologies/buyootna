import { z } from 'zod';

export const companyLoginSchema = z.object({
  identifier: z
    .string({ message: 'هذا الحقل مطلوب' })
    .min(1, 'هذا الحقل مطلوب')
    .refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^\d+$/.test(val);
      return isEmail || isPhone;
    }, 'أدخل بريد إلكتروني أو رقم هاتف صحيح'),
  password: z
    .string({ message: 'كلمة المرور مطلوبة' })
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export type CompanyLoginFormValues = z.infer<typeof companyLoginSchema>;

// Full Multi-step Signup Schema
export const companySignupSchema = z
  .object({
    // Step 1: Basic Info
    name: z.string({ message: 'اسم الشركة مطلوب' }).min(2, 'الاسم قصير جداً'),
    email: z
      .string({ message: 'البريد الإلكتروني مطلوب' })
      .email('البريد الإلكتروني غير صالح'),
    phone: z
      .string({ message: 'رقم الهاتف مطلوب' })
      .regex(/^[569]\d{7}$/, 'رقم هاتف كويتي غير صالح'),
    password: z
      .string({ message: 'كلمة المرور مطلوبة' })
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z.string({ message: 'تأكيد كلمة المرور مطلوب' }),

    // Step 2: Details
    services: z.string({ message: 'الخدمات مطلوبة' }).min(1, 'الخدمات مطلوبة'),
    hqLocation: z
      .string({ message: 'المقر الرئيسي مطلوب' })
      .min(1, 'المقر الرئيسي مطلوب'),
    serviceAreas: z
      .string({ message: 'مناطق تقديم الخدمة مطلوبة' })
      .min(1, 'مناطق تقديم الخدمة مطلوبة'),
    about: z
      .string({ message: 'نبذة عن الشركة مطلوبة' })
      .min(10, 'يرجى كتابة نبذة كافية'),
    logo: z.any().optional(),

    // Step 3: Licensing
    licenseActivity: z.string().optional(),
    licenseExpiry: z.string().optional(),
    // File upload is often handled separately or as a string URI in forms
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
  'serviceAreas',
  'about',
  'logo',
];
