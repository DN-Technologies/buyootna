import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReportTargetType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ModerationAlertService } from './moderation-alert.service';

// The reason a block is filed under (the admin's reports list shows it)
export const BLOCK_REPORT_REASON = 'حظر المستخدم';

function generateReportNumber(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: ModerationAlertService,
  ) {}

  async create(
    reporterUserId: string,
    reporterIdentityId: string | undefined,
    targetId: string,
    dto: CreateReportDto,
  ) {
    const targetIdentity = await this.prisma.identity.findFirst({
      where: {
        OR: [{ id: targetId }, { userId: targetId, isActive: true }],
      },
    });

    const targetUserId = targetIdentity?.userId ?? targetId;
    const targetIdentityId = targetIdentity?.id;

    if (reporterUserId === targetUserId) {
      throw new BadRequestException('لا يمكنك تقديم بلاغ ضد حسابك الشخصي');
    }

    const reportNumber = await this.nextReportNumber();

    const report = await this.prisma.report.create({
      data: {
        reportNumber,
        targetType: ReportTargetType.USER,
        reason: dto.reason,
        description: dto.description,
        reporterUserId,
        reporterIdentityId,
        targetUserId,
        targetIdentityId,
      },
    });
    this.alert(report, 'حساب');

    return {
      message: 'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته',
      data: report,
    };
  }

  /**
   * A report made from a story: a report against its author (as the
   * existing user reports are), linked to the story, with a snapshot of
   * what it showed since the story is deleted within about a day. One per
   * reporting profile and story: repeating it, even at the same moment,
   * returns the first one.
   */
  async createForStory(
    reporter: { userId: string; identityId: string },
    storyId: string,
    dto: CreateReportDto,
    now = new Date(),
  ) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        identityId: true,
        status: true,
        caption: true,
        mediaType: true,
        publishedAt: true,
        expiresAt: true,
        identity: { select: { userId: true } },
        _count: { select: { highlightItems: true } },
      },
    });
    // Only a story the reporter can still see: live, or kept in one of its
    // author's highlights (shown on the profile)
    const visible =
      story?.status === 'ACTIVE' &&
      (story.expiresAt > now || story._count.highlightItems > 0);
    if (!story || !visible) {
      throw new NotFoundException('القصة غير موجودة');
    }
    if (story.identity.userId === reporter.userId) {
      throw new BadRequestException('لا يمكنك تقديم بلاغ ضد حسابك الشخصي');
    }

    const existing = await this.findStoryReport(reporter.identityId, storyId);
    if (existing) return this.reportResult(existing);

    try {
      const report = await this.prisma.report.create({
        data: {
          reportNumber: await this.nextReportNumber(),
          targetType: ReportTargetType.USER,
          reason: dto.reason,
          description: dto.description,
          reporterUserId: reporter.userId,
          reporterIdentityId: reporter.identityId,
          targetUserId: story.identity.userId,
          targetIdentityId: story.identityId,
          targetStoryId: story.id,
          targetStorySnapshot: {
            storyId: story.id,
            authorIdentityId: story.identityId,
            mediaType: story.mediaType,
            caption: story.caption,
            publishedAt: story.publishedAt?.toISOString() ?? null,
          },
        },
      });
      this.alert(report, 'قصة');
      return this.reportResult(report);
    } catch (error) {
      // A simultaneous report by the same profile won the unique key
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const winner = await this.findStoryReport(reporter.identityId, storyId);
        if (winner) return this.reportResult(winner);
      }
      throw error;
    }
  }

  /**
   * A report made from a reel: a report against its author, linked to the
   * reel, with a snapshot including its links, so the admin can watch it.
   * One per reporting profile and reel: repeating it, even at the same
   * moment, returns the first one.
   */
  async createForReel(
    reporter: { userId: string; identityId: string },
    reelId: string,
    dto: CreateReportDto,
    linksFor: (reel: { mediaKey: string; posterKey: string }) => {
      mediaUrl: string;
      posterUrl: string;
    },
  ) {
    const reel = await this.prisma.reel.findUnique({
      where: { id: reelId },
      select: {
        id: true,
        identityId: true,
        status: true,
        caption: true,
        mediaKey: true,
        posterKey: true,
        publishedAt: true,
        identity: { select: { userId: true } },
      },
    });
    if (!reel || reel.status !== 'ACTIVE') {
      throw new NotFoundException('الفيديو غير موجود');
    }
    if (reel.identity.userId === reporter.userId) {
      throw new BadRequestException('لا يمكنك تقديم بلاغ ضد حسابك الشخصي');
    }

    const existing = await this.findReelReport(reporter.identityId, reelId);
    if (existing) return this.reportResult(existing);

    try {
      const report = await this.prisma.report.create({
        data: {
          reportNumber: await this.nextReportNumber(),
          targetType: ReportTargetType.USER,
          reason: dto.reason,
          description: dto.description,
          reporterUserId: reporter.userId,
          reporterIdentityId: reporter.identityId,
          targetUserId: reel.identity.userId,
          targetIdentityId: reel.identityId,
          targetReelId: reel.id,
          targetReelSnapshot: {
            reelId: reel.id,
            authorIdentityId: reel.identityId,
            caption: reel.caption,
            publishedAt: reel.publishedAt?.toISOString() ?? null,
            ...linksFor(reel),
          },
        },
      });
      this.alert(report, 'فيديو');
      return this.reportResult(report);
    } catch (error) {
      // A simultaneous report by the same profile won the unique key
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const winner = await this.findReelReport(reporter.identityId, reelId);
        if (winner) return this.reportResult(winner);
      }
      throw error;
    }
  }

  /**
   * A report made from a listing (إبلاغ عن الإعلان): PROPERTY, against the
   * listing and its owner. A profile's report on a listing still pending
   * review is returned again instead of being filed twice.
   */
  async createForProperty(
    reporter: { userId: string; identityId?: string },
    propertyId: string,
    dto: CreateReportDto,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        identityId: true,
        identity: { select: { userId: true } },
      },
    });
    if (!property) throw new NotFoundException('الإعلان غير موجود');
    if (property.identity?.userId === reporter.userId) {
      throw new BadRequestException('لا يمكنك الإبلاغ عن إعلانك');
    }

    const pending = await this.prisma.report.findFirst({
      where: {
        reporterUserId: reporter.userId,
        targetPropertyId: propertyId,
        status: 'PENDING',
      },
    });
    if (pending) return this.reportResult(pending);

    const report = await this.prisma.report.create({
      data: {
        reportNumber: await this.nextReportNumber(),
        targetType: ReportTargetType.PROPERTY,
        reason: dto.reason,
        description: dto.description,
        reporterUserId: reporter.userId,
        reporterIdentityId: reporter.identityId,
        targetUserId: property.identity?.userId,
        targetIdentityId: property.identityId,
        targetPropertyId: property.id,
      },
    });
    this.alert(report, 'إعلان');
    return this.reportResult(report);
  }

  /**
   * A report made from a review: against its author (USER), linked to the
   * review, with its text kept in case the review is deleted. Returned
   * again while the profile's earlier report on it is still pending.
   */
  async createForReview(
    reporter: { userId: string; identityId?: string },
    reviewId: string,
    dto: CreateReportDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewerId: true,
        reviewerIdentityId: true,
        reviewerIdentity: { select: { userId: true } },
      },
    });
    if (!review) throw new NotFoundException('التقييم غير موجود');
    const authorUserId = review.reviewerIdentity?.userId ?? review.reviewerId;
    if (authorUserId === reporter.userId) {
      throw new BadRequestException('لا يمكنك الإبلاغ عن تقييمك');
    }

    const pending = await this.prisma.report.findFirst({
      where: {
        reporterUserId: reporter.userId,
        targetReviewId: reviewId,
        status: 'PENDING',
      },
    });
    if (pending) return this.reportResult(pending);

    const report = await this.prisma.report.create({
      data: {
        reportNumber: await this.nextReportNumber(),
        targetType: ReportTargetType.USER,
        reason: dto.reason,
        description: dto.description,
        reporterUserId: reporter.userId,
        reporterIdentityId: reporter.identityId,
        targetUserId: authorUserId,
        targetIdentityId: review.reviewerIdentityId,
        targetReviewId: review.id,
        targetReviewSnapshot: {
          reviewId: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
        },
      },
    });
    this.alert(report, 'تقييم');
    return this.reportResult(report);
  }

  /**
   * A block tells the moderators too (Guideline 1.2): it is filed as a
   * report against the blocked account, with the blocker's reason if any.
   */
  async createForBlock(
    blocker: { userId: string; identityId?: string },
    blocked: { userId: string; identityId?: string | null },
    reason?: string,
  ): Promise<void> {
    const report = await this.prisma.report.create({
      data: {
        reportNumber: await this.nextReportNumber(),
        targetType: ReportTargetType.USER,
        reason: BLOCK_REPORT_REASON,
        description: reason?.trim() || null,
        reporterUserId: blocker.userId,
        reporterIdentityId: blocker.identityId,
        targetUserId: blocked.userId,
        targetIdentityId: blocked.identityId ?? undefined,
      },
    });
    this.alert(report, 'حظر مستخدم');
  }

  // The moderation inbox hears of every new report, without holding it up
  private alert(
    report: {
      reportNumber: number;
      reason: string;
      description: string | null;
    },
    kind: string,
  ): void {
    void this.alerts.reportCreated({
      reportNumber: report.reportNumber,
      kind,
      reason: report.reason,
      description: report.description,
    });
  }

  private findStoryReport(reporterIdentityId: string, storyId: string) {
    return this.prisma.report.findUnique({
      where: {
        reporterIdentityId_targetStoryId: {
          reporterIdentityId,
          targetStoryId: storyId,
        },
      },
    });
  }

  private findReelReport(reporterIdentityId: string, reelId: string) {
    return this.prisma.report.findUnique({
      where: {
        reporterIdentityId_targetReelId: {
          reporterIdentityId,
          targetReelId: reelId,
        },
      },
    });
  }

  private reportResult<T>(report: T) {
    return {
      message: 'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته',
      data: report,
    };
  }

  /** A report number no other report has (4 digits, as before). */
  private async nextReportNumber(): Promise<number> {
    for (;;) {
      const reportNumber = generateReportNumber();
      const existing = await this.prisma.report.findUnique({
        where: { reportNumber },
      });
      if (!existing) return reportNumber;
    }
  }
}
