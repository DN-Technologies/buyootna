import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CompanyVerificationRequest,
  IdentityType,
  Prisma,
  VerificationStatus,
} from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import {
  assertLicenseAvailable,
  normalizeLicenseNumber,
} from '../persona-rules';
import {
  SubmitVerificationDto,
  VerificationIssuesDto,
} from './company-verification.dto';

const LICENSE_FOLDER = 'company-licenses';

/** The fields the admin can send back, each with its own reason. */
export const VERIFICATION_FIELDS = [
  'licenseFile',
  'licenseNumber',
  'licenseActivity',
  'licenseExpiry',
] as const;
export type VerificationField = (typeof VERIFICATION_FIELDS)[number];
// The reason per field, plus an optional general `note`
export type VerificationIssues = Partial<
  Record<VerificationField | 'note', string>
>;

const OPEN_STATUSES = [
  VerificationStatus.PENDING,
  VerificationStatus.CHANGES_REQUESTED,
];

export interface VerificationRequestView {
  id: string;
  status: VerificationStatus;
  licenseActivity: string | null;
  licenseNumber: string;
  licenseExpiry: string | null;
  licenseFileUrl: string;
  licenseFileName: string | null;
  licenseFileSize: number | null;
  licenseFileType: string | null;
  issues: VerificationIssues | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  createdAt: Date;
}

export function toVerificationView(
  row: CompanyVerificationRequest,
): VerificationRequestView {
  return {
    id: row.id,
    status: row.status,
    licenseActivity: row.licenseActivity,
    licenseNumber: row.licenseNumber,
    licenseExpiry: row.licenseExpiry,
    licenseFileUrl: row.licenseFileUrl,
    licenseFileName: row.licenseFileName,
    licenseFileSize: row.licenseFileSize,
    licenseFileType: row.licenseFileType,
    issues: (row.issues as VerificationIssues | null) ?? null,
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  };
}

/** Keeps only known fields with a non-empty reason. */
export function cleanIssues(
  raw: VerificationIssuesDto | VerificationIssues | null | undefined,
): VerificationIssues {
  const issues: VerificationIssues = {};
  for (const key of [...VERIFICATION_FIELDS, 'note'] as const) {
    const reason = raw?.[key]?.trim();
    if (reason) issues[key] = reason;
  }
  return issues;
}

const fileMeta = (file: Express.Multer.File) => ({
  licenseFileName: file.originalname || null,
  licenseFileSize: file.size ?? null,
  licenseFileType: file.mimetype || null,
});

/**
 * «طلب التوثيق»: a company sends its licence (number, activity, expiry and
 * image) for the «موثق» badge. The admin approves it -- the licence is then
 * copied onto the company and isVerified set -- or sends chosen fields back
 * with a reason each; the company fixes only those and sends it again.
 */
@Injectable()
export class CompanyVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private async companyOf(userId: string, identityId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: { id: identityId, userId },
      include: { companyData: { select: { isVerified: true } } },
    });
    if (!identity) throw new NotFoundException('الحساب غير موجود');
    if (identity.type !== IdentityType.COMPANY || !identity.companyData) {
      throw new BadRequestException('طلب التوثيق متاح للشركات فقط');
    }
    return identity;
  }

  private latest(identityId: string) {
    return this.prisma.companyVerificationRequest.findFirst({
      where: { identityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private openRequest(identityId: string, status?: VerificationStatus) {
    return this.prisma.companyVerificationRequest.findFirst({
      where: { identityId, status: status ?? { in: OPEN_STATUSES } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** The company's badge and its latest request (null: never sent one). */
  async getMine(userId: string, identityId: string) {
    const identity = await this.companyOf(userId, identityId);
    const request = await this.latest(identityId);
    return {
      isVerified: identity.companyData!.isVerified,
      request: request ? toVerificationView(request) : null,
    };
  }

  async submit(
    userId: string,
    identityId: string,
    dto: SubmitVerificationDto,
    file?: Express.Multer.File,
  ) {
    const identity = await this.companyOf(userId, identityId);
    if (identity.companyData!.isVerified) {
      throw new BadRequestException('حسابك موثق بالفعل');
    }
    const open = await this.openRequest(identityId);
    if (open) {
      throw new ConflictException(
        open.status === VerificationStatus.PENDING
          ? 'طلبك قيد المراجعة'
          : 'أكمل البيانات المطلوبة في طلبك الحالي',
      );
    }
    const licenseNumber = normalizeLicenseNumber(dto.licenseNumber ?? '');
    if (!licenseNumber) throw new BadRequestException('رقم الرخصة مطلوب');
    if (!file) throw new BadRequestException('صورة الرخصة مطلوبة');
    await assertLicenseAvailable(this.prisma, licenseNumber, identityId);

    const licenseFileUrl = await this.storageService.uploadFile(
      file,
      LICENSE_FOLDER,
    );
    try {
      const created = await this.prisma.companyVerificationRequest.create({
        data: {
          identityId,
          licenseNumber,
          licenseActivity: dto.licenseActivity?.trim() || null,
          licenseExpiry: dto.licenseExpiry?.trim() || null,
          licenseFileUrl,
          ...fileMeta(file),
        },
      });
      return toVerificationView(created);
    } catch (error) {
      await this.storageService.deleteFile(licenseFileUrl);
      throw error;
    }
  }

  /** «اعادة ارسال الطلب»: only the fields the admin sent back change. */
  async resubmit(
    userId: string,
    identityId: string,
    dto: SubmitVerificationDto,
    file?: Express.Multer.File,
  ) {
    await this.companyOf(userId, identityId);
    const request = await this.openRequest(
      identityId,
      VerificationStatus.CHANGES_REQUESTED,
    );
    if (!request) {
      throw new BadRequestException('لا يوجد طلب بحاجة إلى استكمال');
    }
    const issues = cleanIssues(request.issues as VerificationIssues | null);
    const data: Prisma.CompanyVerificationRequestUpdateInput = {};

    if (issues.licenseNumber) {
      const licenseNumber = normalizeLicenseNumber(dto.licenseNumber ?? '');
      if (!licenseNumber) throw new BadRequestException('رقم الرخصة مطلوب');
      await assertLicenseAvailable(this.prisma, licenseNumber, identityId);
      data.licenseNumber = licenseNumber;
    }
    if (issues.licenseActivity) {
      const activity = dto.licenseActivity?.trim();
      if (!activity) throw new BadRequestException('النشاط مطلوب');
      data.licenseActivity = activity;
    }
    if (issues.licenseExpiry) {
      const expiry = dto.licenseExpiry?.trim();
      if (!expiry) throw new BadRequestException('تاريخ الانتهاء مطلوب');
      data.licenseExpiry = expiry;
    }
    if (issues.licenseFile && !file) {
      throw new BadRequestException('صورة الرخصة مطلوبة');
    }
    const newFileUrl =
      issues.licenseFile && file
        ? await this.storageService.uploadFile(file, LICENSE_FOLDER)
        : undefined;
    if (newFileUrl && file) {
      data.licenseFileUrl = newFileUrl;
      Object.assign(data, fileMeta(file));
    }

    try {
      const updated = await this.prisma.companyVerificationRequest.update({
        where: { id: request.id },
        data: {
          ...data,
          status: VerificationStatus.PENDING,
          issues: Prisma.DbNull,
          submittedAt: new Date(),
        },
      });
      if (newFileUrl) {
        await this.storageService.deleteFile(request.licenseFileUrl);
      }
      return toVerificationView(updated);
    } catch (error) {
      await this.storageService.deleteFile(newFileUrl);
      throw error;
    }
  }

  // ---- Admin ----

  /** The open request awaiting the admin, if any. */
  pendingFor(identityId: string) {
    return this.openRequest(identityId, VerificationStatus.PENDING);
  }

  /**
   * Approves the company's pending request: its licence goes onto the
   * company and the badge is on. Null when there's no pending request.
   */
  async approve(identityId: string, adminUserId?: string) {
    const request = await this.pendingFor(identityId);
    if (!request) return null;
    return this.prisma.$transaction(async (tx) => {
      await assertLicenseAvailable(tx, request.licenseNumber, identityId);
      await tx.companyIdentityData.update({
        where: { identityId },
        data: {
          licenseNumber: request.licenseNumber,
          licenseActivity: request.licenseActivity,
          licenseExpiry: request.licenseExpiry,
          licenseFileUrl: request.licenseFileUrl,
          isVerified: true,
        },
      });
      return tx.companyVerificationRequest.update({
        where: { id: request.id },
        data: {
          status: VerificationStatus.APPROVED,
          issues: Prisma.DbNull,
          reviewedAt: new Date(),
          reviewedById: adminUserId ?? null,
        },
      });
    });
  }

  /**
   * Sends the open request back to the company with a reason per field
   * (and/or a general note). Null when the company has no open request.
   */
  async requestChanges(
    identityId: string,
    rawIssues: VerificationIssues,
    adminUserId?: string,
  ) {
    const request = await this.openRequest(identityId);
    if (!request) return null;
    const issues = cleanIssues(rawIssues);
    if (!Object.keys(issues).length) {
      throw new BadRequestException('حدد البيانات المطلوب تعديلها');
    }
    // Only a general note: the whole licence is asked again
    const onlyNote = VERIFICATION_FIELDS.every((field) => !issues[field]);
    if (onlyNote) {
      for (const field of VERIFICATION_FIELDS) issues[field] = issues.note;
    }
    await this.prisma.companyIdentityData.update({
      where: { identityId },
      data: { isVerified: false },
    });
    return this.prisma.companyVerificationRequest.update({
      where: { id: request.id },
      data: {
        status: VerificationStatus.CHANGES_REQUESTED,
        issues,
        reviewedAt: new Date(),
        reviewedById: adminUserId ?? null,
      },
    });
  }
}
