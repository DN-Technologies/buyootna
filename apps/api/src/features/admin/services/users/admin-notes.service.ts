import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminCreateNoteDto, AdminUpdateNoteDto } from '../../dto/admin-note.dto';

const AUTHOR_INCLUDE = {
  authorAdmin: { select: { id: true, name: true, email: true } },
} as const;

@Injectable()
export class AdminNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotesForUser(userId: string) {
    return this.prisma.adminNote.findMany({
      where: { targetUserId: userId },
      include: AUTHOR_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(
    userId: string,
    dto: AdminCreateNoteDto,
    authorAdminId: string,
  ) {
    return this.prisma.adminNote.create({
      data: {
        targetUserId: userId,
        authorAdminId,
        title: dto.title ?? 'ملاحظة',
        content: dto.content,
      },
      include: AUTHOR_INCLUDE,
    });
  }

  async updateNote(noteId: string, dto: AdminUpdateNoteDto) {
    const existing = await this.prisma.adminNote.findUnique({
      where: { id: noteId },
    });
    if (!existing) throw new NotFoundException('الملاحظة غير موجودة');

    return this.prisma.adminNote.update({
      where: { id: noteId },
      data: { content: dto.content },
      include: AUTHOR_INCLUDE,
    });
  }

  async deleteNote(noteId: string) {
    const existing = await this.prisma.adminNote.findUnique({
      where: { id: noteId },
    });
    if (!existing) throw new NotFoundException('الملاحظة غير موجودة');

    await this.prisma.adminNote.delete({ where: { id: noteId } });
    return { message: 'تم حذف الملاحظة بنجاح' };
  }
}
