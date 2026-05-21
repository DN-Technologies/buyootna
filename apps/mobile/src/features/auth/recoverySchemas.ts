import { z } from 'zod';

export const requestOtpSchema = z.object({
  identifier: z
    .string({ message: 'هذا الحقل مطلوب' })
    .min(1, 'هذا الحقل مطلوب'),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ message: 'كلمة المرور مطلوبة' })
      .min(8, 'يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z.string({ message: 'تأكيد كلمة المرور مطلوب' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export type RequestOtpValues = z.infer<typeof requestOtpSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
