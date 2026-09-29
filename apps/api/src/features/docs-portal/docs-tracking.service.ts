import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DocsCommentKind,
  DocsReleaseStatus,
  DocsResultStatus,
  DocsRole,
} from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { DocsUser } from './docs-portal.constants';
import {
  CreateCommentDto,
  CreateReleaseDto,
  RecordResultDto,
  UpdateReleaseDto,
} from './dto/tracking.dto';

// Story ids are the kebab-case ids in apps/web/docs/src/data
const STORY_ID = /^[a-z0-9-]{1,100}$/;

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// What each role may record as a story's status
const RESULT_STATUSES: Record<DocsRole, DocsResultStatus[]> = {
  QA: ['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN'],
  ADMIN: ['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN', 'READY_FOR_RETEST'],
  DEVELOPER: ['READY_FOR_RETEST'],
  UIUX: [],
  CLIENT: [],
};

@Injectable()
export class DocsTrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private assertStoryId(storyId: string) {
    if (!STORY_ID.test(storyId)) {
      throw new BadRequestException('معرّف القصة غير صالح');
    }
  }

  private async openRelease(releaseId: string) {
    const release = await this.prisma.docsRelease.findUnique({
      where: { id: releaseId },
    });
    if (!release) throw new NotFoundException('الإصدار غير موجود');
    if (release.status !== DocsReleaseStatus.OPEN) {
      throw new ConflictException('هذا الإصدار مغلق، لا يمكن تسجيل نتائج عليه');
    }
    return release;
  }

  // --- Releases ---

  listReleases() {
    return this.prisma.docsRelease.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  createRelease(dto: CreateReleaseDto, user: DocsUser) {
    return this.prisma.docsRelease.create({
      data: { ...dto, createdBy: user.name },
    });
  }

  async updateRelease(id: string, dto: UpdateReleaseDto) {
    const release = await this.prisma.docsRelease.findUnique({ where: { id } });
    if (!release) throw new NotFoundException('الإصدار غير موجود');
    return this.prisma.docsRelease.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status
          ? { closedAt: dto.status === 'CLOSED' ? new Date() : null }
          : {}),
      },
    });
  }

  // --- Results ---

  /**
   * The current (newest) result of every story recorded in a release. A
   * client sees statuses only -- notes, bug links and screenshots are for
   * the team.
   */
  async latestResults(releaseId: string, user: DocsUser) {
    const rows = await this.prisma.docsStoryResult.findMany({
      where: { releaseId },
      orderBy: [{ storyId: 'asc' }, { createdAt: 'desc' }],
      distinct: ['storyId'],
    });
    if (user.role !== DocsRole.CLIENT) return rows;
    return rows.map((row) => ({
      ...row,
      note: null,
      bugUrl: null,
      attachments: [],
    }));
  }

  async recordResult(
    releaseId: string,
    storyId: string,
    dto: RecordResultDto,
    user: DocsUser,
  ) {
    this.assertStoryId(storyId);
    if (!RESULT_STATUSES[user.role].includes(dto.status)) {
      throw new ForbiddenException('ليس لدورك صلاحية تسجيل هذه الحالة');
    }
    await this.openRelease(releaseId);

    // "Ready to retest" only makes sense on something that failed
    if (dto.status === DocsResultStatus.READY_FOR_RETEST) {
      const current = await this.prisma.docsStoryResult.findFirst({
        where: { releaseId, storyId },
        orderBy: { createdAt: 'desc' },
        select: { status: true },
      });
      if (current?.status !== 'FAIL' && current?.status !== 'BLOCKED') {
        throw new BadRequestException(
          'يمكن تعليم القصة جاهزة لإعادة الاختبار فقط بعد فشلها أو تعثرها',
        );
      }
    }
    if (dto.status === DocsResultStatus.FAIL && !dto.note?.trim()) {
      throw new BadRequestException('يرجى كتابة ما الذي فشل');
    }

    return this.prisma.docsStoryResult.create({
      data: {
        releaseId,
        storyId,
        status: dto.status,
        note: dto.note?.trim() || null,
        bugUrl: dto.bugUrl || null,
        attachments: dto.attachments ?? [],
        authorName: user.name,
        authorRole: user.role,
      },
    });
  }

  /** A story's full result history in a release, plus its comments. */
  async storyHistory(releaseId: string, storyId: string) {
    this.assertStoryId(storyId);
    const [results, comments] = await Promise.all([
      this.prisma.docsStoryResult.findMany({
        where: { releaseId, storyId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.docsComment.findMany({
        where: {
          storyId,
          OR: [{ releaseId }, { releaseId: null }],
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { results, comments };
  }

  /** Counts per status of the stories' current results. */
  async summary(releaseId: string) {
    const release = await this.prisma.docsRelease.findUnique({
      where: { id: releaseId },
    });
    if (!release) throw new NotFoundException('الإصدار غير موجود');
    const latest = await this.prisma.docsStoryResult.findMany({
      where: { releaseId },
      orderBy: [{ storyId: 'asc' }, { createdAt: 'desc' }],
      distinct: ['storyId'],
      select: {
        storyId: true,
        status: true,
        authorName: true,
        createdAt: true,
      },
    });
    const counts: Record<DocsResultStatus, number> = {
      PASS: 0,
      FAIL: 0,
      BLOCKED: 0,
      NOT_RUN: 0,
      READY_FOR_RETEST: 0,
    };
    for (const row of latest) counts[row.status] += 1;
    return { release, counts, stories: latest };
  }

  // --- Comments ---

  async addComment(storyId: string, dto: CreateCommentDto, user: DocsUser) {
    this.assertStoryId(storyId);
    const kind = dto.kind ?? DocsCommentKind.COMMENT;
    if (
      kind === DocsCommentKind.DESIGN_MISMATCH &&
      user.role !== DocsRole.UIUX &&
      user.role !== DocsRole.ADMIN
    ) {
      throw new ForbiddenException('ملاحظات التصميم لمصمم الواجهات فقط');
    }
    if (dto.releaseId) {
      const exists = await this.prisma.docsRelease.findUnique({
        where: { id: dto.releaseId },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('الإصدار غير موجود');
    }
    return this.prisma.docsComment.create({
      data: {
        storyId,
        releaseId: dto.releaseId ?? null,
        kind,
        body: dto.body,
        attachments: dto.attachments ?? [],
        authorName: user.name,
        authorRole: user.role,
      },
    });
  }

  // --- Screenshots ---

  async uploadAttachment(file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException('يرجى إرفاق صورة');
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'يُسمح بالصور فقط (PNG أو JPG أو WEBP أو GIF)',
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
    }
    return { url: await this.storage.uploadFile(file, 'docs-portal') };
  }
}
