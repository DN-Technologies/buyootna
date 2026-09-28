import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminPasswordService } from './admin-password.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../../../core/mail/mail.service';

describe('AdminPasswordService', () => {
  let service: AdminPasswordService;
  let prisma: { user: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };
  let mail: { sendMail: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-reset-token-123'),
    };

    mail = {
      sendMail: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPasswordService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: MailService,
          useValue: mail,
        },
      ],
    }).compile();

    service = module.get<AdminPasswordService>(AdminPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendUserPasswordResetLink', () => {
    it('should throw NotFoundException if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendUserPasswordResetLink('non-existent-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user has no email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-no-email',
        name: 'User Without Email',
        email: null,
      });

      await expect(
        service.sendUserPasswordResetLink('user-no-email'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should send a 60-minute reset link to user email and return success message', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-valid',
        name: 'Mohamed Elgareh',
        email: 'mohamedelgareh@gmail.com',
      });

      const res = await service.sendUserPasswordResetLink('user-valid');

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: 'user-valid',
          email: 'mohamedelgareh@gmail.com',
          purpose: 'password_reset',
        },
        { expiresIn: '60m' },
      );
      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'mohamedelgareh@gmail.com',
          subject: 'إعادة تعيين كلمة المرور - Buyootna',
        }),
      );
      expect(res.message).toContain(
        'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح',
      );
      expect(res.email).toBe('mohamedelgareh@gmail.com');
    });
  });
});
