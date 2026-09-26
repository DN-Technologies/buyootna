import { Test, TestingModule } from '@nestjs/testing';
import { Session } from '@prisma/client';
import { MailService } from '../../core/mail/mail.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LoginAlertService } from './login-alert.service';

describe('LoginAlertService', () => {
  let service: LoginAlertService;

  const prisma = {
    session: { count: jest.fn() },
    user: { findUnique: jest.fn() },
  };
  const notifications = { create: jest.fn() };
  const mail = { sendMail: jest.fn() };

  const newSession = {
    id: 'session-new',
    userId: 'user-1',
    deviceName: 'iPhone 15',
    ipAddress: '10.0.0.7',
    createdAt: new Date('2026-09-26T14:30:00.000Z'),
  } as Session;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.session.count.mockResolvedValue(1);
    prisma.user.findUnique.mockResolvedValue({
      name: 'سارة',
      email: 'owner@example.com',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginAlertService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
        { provide: MailService, useValue: mail },
      ],
    }).compile();
    service = module.get(LoginAlertService);
  });

  it('does nothing when the account has no other active device', async () => {
    prisma.session.count.mockResolvedValue(0);

    await service.notifyNewDeviceLogin('user-1', newSession);

    expect(prisma.session.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', isActive: true, id: { not: 'session-new' } },
    });
    expect(notifications.create).not.toHaveBeenCalled();
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it('notifies in-app with the device and a link to the session', async () => {
    await service.notifyNewDeviceLogin('user-1', newSession);

    expect(notifications.create).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'NEW_DEVICE_LOGIN',
      title: 'تسجيل دخول من جهاز جديد',
      body: expect.stringContaining('iPhone 15'),
      data: { sessionId: 'session-new' },
    });
  });

  it('emails the owner with the device, time and IP', async () => {
    await service.notifyNewDeviceLogin('user-1', newSession);

    expect(mail.sendMail).toHaveBeenCalledTimes(1);
    const { to, subject, html } = mail.sendMail.mock.calls[0][0];
    expect(to).toBe('owner@example.com');
    expect(subject).toBe('تسجيل دخول جديد إلى حسابك في بيوتنا');
    expect(html).toContain('iPhone 15');
    expect(html).toContain('10.0.0.7');
    expect(html).toContain('سارة');
  });

  it('escapes a hostile device name in the email', async () => {
    await service.notifyNewDeviceLogin('user-1', {
      ...newSession,
      deviceName: '<img src=x onerror=alert(1)>',
    });

    const { html } = mail.sendMail.mock.calls[0][0];
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('skips the email when the account has no email address', async () => {
    prisma.user.findUnique.mockResolvedValue({ name: null, email: null });

    await service.notifyNewDeviceLogin('user-1', newSession);

    expect(notifications.create).toHaveBeenCalled();
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it('never throws, so a mail outage cannot break the login', async () => {
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    mail.sendMail.mockRejectedValue(new Error('resend down'));

    await expect(
      service.notifyNewDeviceLogin('user-1', newSession),
    ).resolves.toBeUndefined();
  });
});
