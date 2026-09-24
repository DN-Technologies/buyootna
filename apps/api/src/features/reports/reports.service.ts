import { BadRequestException, Injectable } from '@nestjs/common';
import { ReportTargetType } from '@prisma/client';
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

    let reportNumber = 0;
    let isUnique = false;
    while (!isUnique) {
      reportNumber = generateReportNumber();
      const existing = await this.prisma.report.findUnique({
        where: { reportNumber },
      });
      if (!existing) isUnique = true;
    }

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
}
