import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminNotesService } from './admin-notes.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('AdminNotesService', () => {
  let service: AdminNotesService;
  let prisma: {
    adminNote: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      adminNote: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'note-1' }),
        create: jest.fn().mockResolvedValue({ id: 'note-1' }),
        update: jest.fn().mockResolvedValue({ id: 'note-1' }),
        delete: jest.fn().mockResolvedValue({ id: 'note-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminNotesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AdminNotesService>(AdminNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotesForUser', () => {
    it('scopes to the target user, newest first', async () => {
      await service.getNotesForUser('user-1');
      expect(prisma.adminNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { targetUserId: 'user-1' },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('createNote', () => {
    it('defaults the title when not provided', async () => {
      await service.createNote('user-1', { content: 'نص' }, 'admin-1');
      expect(prisma.adminNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            targetUserId: 'user-1',
            authorAdminId: 'admin-1',
            title: 'ملاحظة',
            content: 'نص',
          },
        }),
      );
    });

    it('honors an explicit title', async () => {
      await service.createNote(
        'user-1',
        { title: 'عنوان', content: 'نص' },
        'admin-1',
      );
      expect(prisma.adminNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'عنوان' }),
        }),
      );
    });
  });

  describe('updateNote', () => {
    it('throws NotFoundException when the note does not exist', async () => {
      prisma.adminNote.findUnique.mockResolvedValue(null);
      await expect(
        service.updateNote('missing', { content: 'نص' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates only the content field', async () => {
      await service.updateNote('note-1', { content: 'نص جديد' });
      expect(prisma.adminNote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'note-1' },
          data: { content: 'نص جديد' },
        }),
      );
    });
  });

  describe('deleteNote', () => {
    it('throws NotFoundException when the note does not exist', async () => {
      prisma.adminNote.findUnique.mockResolvedValue(null);
      await expect(service.deleteNote('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes the note', async () => {
      const result = await service.deleteNote('note-1');
      expect(prisma.adminNote.delete).toHaveBeenCalledWith({
        where: { id: 'note-1' },
      });
      expect(result).toEqual({ message: 'تم حذف الملاحظة بنجاح' });
    });
  });
});
