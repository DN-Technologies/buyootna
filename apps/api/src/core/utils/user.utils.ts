import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Checks if a string is a valid email address.
 */
export function isEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/**
 * Checks if a string is a valid Kuwait mobile phone number (optional country code +965 / 965 and 8 digits starting with 5, 6, or 9).
 */
export function isPhone(val: string): boolean {
  return /^(?:\+?965)?[569]\d{7}$/.test(val);
}

/**
 * Helper to check for existing users by email or phone.
 * Throws a ConflictException if a conflict is found.
 */
export async function checkUserExists(
  prisma: PrismaService,
  email?: string,
  phone?: string,
): Promise<void> {
  const conditions: Record<string, string>[] = [];
  if (email) conditions.push({ email });
  if (phone) conditions.push({ phone });

  if (conditions.length === 0) return;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: conditions,
    },
  });

  if (existingUser) {
    if (email && existingUser.email === email) {
      throw new ConflictException('البريد الإلكتروني مسجل بالفعل');
    }
    if (phone && existingUser.phone === phone) {
      throw new ConflictException('رقم الهاتف مسجل بالفعل');
    }
  }
}
