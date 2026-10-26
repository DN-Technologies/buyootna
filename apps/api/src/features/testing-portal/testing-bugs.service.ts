import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TestingBugStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { TestingAuditService } from './testing-audit.service';
import type { Actor } from './testing-accounts.service';
import type {
  TestingBugCommentDto,
  TestingBugQueryDto,
  TestingCreateBugDto,
  TestingUpdateBugDto,
} from './dto/testing-bugs.dto';

const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/heic',
];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** الأخطاء: bugs testers send from their phone, with screenshots and comments. */
@Injectable()
export class TestingBugsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: TestingAuditService,
  ) {}

  async list({ status, q, page = 1, limit = 20 }: TestingBugQueryDto) {
    const text = q?.trim();
    const where: Prisma.TestingBugReportWhereInput = {
      ...(status ? { status } : {}),
      ...(text
        ? {
            OR: [
              { title: { contains: text, mode: 'insensitive' } },
              { steps: { contains: text, mode: 'insensitive' } },
              { reporterName: { contains: text, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total, byStatus] = await Promise.all([
      this.prisma.testingBugReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { comments: true } } },
      }),
      this.prisma.testingBugReport.count({ where }),
      this.prisma.testingBugReport.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);
    return {
      data: rows.map(({ _count, ...bug }) => ({
        ...bug,
        commentsCount: _count.comments,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
      counts: Object.fromEntries(
        byStatus.map((g) => [g.status, g._count._all]),
      ) as Partial<Record<TestingBugStatus, number>>,
    };
  }

  async get(id: string) {
    const bug = await this.prisma.testingBugReport.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    if (!bug) throw new NotFoundException('البلاغ غير موجود');
    return bug;
  }

  async create(dto: TestingCreateBugDto, actor: Actor) {
    const bug = await this.prisma.testingBugReport.create({
      data: {
        ...dto,
        screenshots: dto.screenshots ?? [],
        reporterName: actor.tester.name,
      },
    });
    await this.audit.record({
      actorName: actor.tester.name,
      action: 'BUG_REPORTED',
      target: bug.title,
      metadata: { bugId: bug.id, severity: bug.severity, area: bug.area },
      ip: actor.ip,
    });
    return bug;
  }

  async update(id: string, dto: TestingUpdateBugDto, actor: Actor) {
    const before = await this.prisma.testingBugReport.findUnique({
      where: { id },
    });
    if (!before) throw new NotFoundException('البلاغ غير موجود');
    if (!dto.status && !dto.severity)
      throw new BadRequestException('لا يوجد تعديل');
    const bug = await this.prisma.testingBugReport.update({
      where: { id },
      data: dto,
    });
    await this.audit.record({
      actorName: actor.tester.name,
      action: 'BUG_UPDATED',
      target: bug.title,
      metadata: {
        bugId: id,
        from: { status: before.status, severity: before.severity },
        to: { status: bug.status, severity: bug.severity },
      },
      ip: actor.ip,
    });
    return this.get(id);
  }

  async comment(id: string, dto: TestingBugCommentDto, actor: Actor) {
    const exists = await this.prisma.testingBugReport.count({ where: { id } });
    if (!exists) throw new NotFoundException('البلاغ غير موجود');
    await this.prisma.testingBugComment.create({
      data: { reportId: id, body: dto.body, authorName: actor.tester.name },
    });
    return this.get(id);
  }

  async uploadScreenshot(file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException('يرجى إرفاق صورة');
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'يُسمح بالصور فقط (PNG أو JPG أو WEBP أو HEIC)',
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('حجم الصورة يجب ألا يتجاوز 8 ميجابايت');
    }
    return { url: await this.storage.uploadFile(file, 'testing-bugs') };
  }
}
