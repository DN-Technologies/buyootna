import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  // Changed from "email" to "identifier" to handle both
  identifier: z
    .string({ message: 'هذا الحقل مطلوب' })
    .min(1, 'هذا الحقل مطلوب')
    .refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^\d+$/.test(val); // Accepts any numeric string for flexibility
      return isEmail || isPhone;
    }, 'أدخل بريد إلكتروني أو رقم هاتف صحيح'),
  password: z
    .string({ message: 'كلمة المرور مطلوبة' })
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Signup Schema
export const signupSchema = z
  .object({
    email: z
      .string({ message: 'البريد الإلكتروني مطلوب' })
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('البريد الإلكتروني غير صالح'),
    phone: z
      .string({ message: 'رقم الهاتف مطلوب' })
      .min(1, 'رقم الهاتف مطلوب')
      .regex(/^\+?\d{8,15}$/, 'رقم الهاتف غير صالح'),
    password: z
      .string({ message: 'كلمة المرور مطلوبة' })
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z
      .string({ message: 'تأكيد كلمة المرور مطلوب' })
      .min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
