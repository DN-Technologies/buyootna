import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string()
      .min(6, 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    logoutAllDevices: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمة المرور الجديدة غير متطابقة',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
