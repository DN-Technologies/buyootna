import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Checks if a string is a valid email address.
 */
export function isEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/**
 * Checks if a string is a valid phone number (accepting Kuwait or Egypt).
 */
export function isPhone(val: string): boolean {
  return /^[569]\d{7}$|^01[0125][0-9]{8}$/.test(val);
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
