import { z } from 'zod';

import { NAME_REGEX, NAME_REGEX_MESSAGE } from '@/shared/utils/nameValidation';

// Shared identifier (email or Kuwait phone) shape checks.
// Kept in one place so the signup schema's validation and the signup
// screen's OTP-vs-immediate-login branching never drift out of sync.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KUWAIT_PHONE_REGEX = /^(?:\+?965)?[569]\d{7}$/;

export const isEmailIdentifier = (value: string) => EMAIL_REGEX.test(value);
export const isPhoneIdentifier = (value: string) => KUWAIT_PHONE_REGEX.test(value);

// Login Schema
export const loginSchema = z.object({
  // Changed from "email" to "identifier" to handle both
  identifier: z
    .string({ message: 'هذا الحقل مطلوب' })
    .min(1, 'هذا الحقل مطلوب')
    .refine((val) => {
      const isEmail = EMAIL_REGEX.test(val);
      const isPhone = /^\+?\d+$/.test(val); // Accepts any numeric string with optional + for flexibility
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
    name: z
      .string({ message: 'الاسم مطلوب' })
      .trim()
      .min(1, 'الاسم مطلوب')
      .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
      .max(32, 'الاسم يجب ألا يتجاوز 32 حرفاً')
      .regex(NAME_REGEX, NAME_REGEX_MESSAGE),
    identifier: z
      .string({ message: 'هذا الحقل مطلوب' })
      .min(1, 'هذا الحقل مطلوب')
      .refine(
        (val) => isEmailIdentifier(val) || isPhoneIdentifier(val),
        'أدخل بريد إلكتروني أو رقم هاتف كويتي صحيح',
      ),
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
