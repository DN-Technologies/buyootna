import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReportTargetType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

function generateReportNumber(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });
    // Only a story the reporter can still see
    if (!story || story.status !== 'ACTIVE' || story.expiresAt <= now) {
      throw new NotFoundException('القصة غير موجودة');
    }
    if (story.identity.userId === reporter.userId) {
      throw new BadRequestException('لا يمكنك تقديم بلاغ ضد حسابك الشخصي');
    }

    const existing = await this.findStoryReport(reporter.identityId, storyId);
    if (existing) return this.storyReportResult(existing);

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
      return this.storyReportResult(report);
    } catch (error) {
      // A simultaneous report by the same profile won the unique key
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const winner = await this.findStoryReport(reporter.identityId, storyId);
        if (winner) return this.storyReportResult(winner);
      }
      throw error;
    }
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

  private storyReportResult<T>(report: T) {
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
