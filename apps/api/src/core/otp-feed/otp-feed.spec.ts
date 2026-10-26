import { EmailOtpService } from '../email-otp/email-otp.service';
import { MailService } from '../mail/mail.service';
import { maskOtps } from '../observability/log-buffer';
import { TwilioService } from '../twilio/twilio.service';
import { OtpFeedService } from './otp-feed.service';

const inMinutes = (m: number) => new Date(Date.now() + m * 60_000);

describe('OtpFeedService', () => {
  let feed: OtpFeedService;
  beforeEach(() => {
    feed = new OtpFeedService();
  });

  it('lists sends without their code; reveal gives the code', () => {
    feed.recordSent({
      channel: 'EMAIL',
      purpose: 'SIGNUP',
      recipient: 'a@b.com',
      code: '482913',
      provider: 'resend',
      expiresAt: inMinutes(10),
    });
    const [item] = feed.list();
    expect(item).toMatchObject({
      recipient: 'a@b.com',
      status: 'PENDING',
      hasCode: true,
    });
    expect(JSON.stringify(feed.list())).not.toContain('482913');
    expect(feed.reveal(item.id).code).toBe('482913');
  });

  it('drops the code once used, replaced or expired', () => {
    const send = (code: string, expiresAt = inMinutes(10)) =>
      feed.recordSent({
        channel: 'EMAIL',
        purpose: 'PASSWORD_RESET',
        recipient: 'A@B.com',
        code,
        provider: 'resend',
        expiresAt,
      });
    send('111111');
    send('222222');
    const [newer, older] = feed.list();
    expect(older.status).toBe('REPLACED');
    expect(feed.reveal(older.id).code).toBeNull();

    feed.recordUsed('EMAIL', 'PASSWORD_RESET', 'a@b.com');
    expect(feed.reveal(newer.id)).toMatchObject({
      code: null,
      entry: { status: 'USED' },
    });

    send('333333', new Date(Date.now() - 1000));
    expect(feed.list()[0]).toMatchObject({ status: 'EXPIRED', hasCode: false });
  });

  it('forgets entries after 30 minutes and finds by recipient', () => {
    jest.useFakeTimers({ now: new Date('2026-10-26T10:00:00Z') });
    feed.recordSent({
      channel: 'SMS',
      purpose: 'SIGNUP',
      recipient: '+96555123456',
      code: '123456',
      provider: 'mock-sms',
      expiresAt: inMinutes(10),
    });
    expect(feed.list({ q: '5512' })).toHaveLength(1);
    expect(feed.list({ q: 'nobody' })).toHaveLength(0);
    jest.setSystemTime(new Date('2026-10-26T10:31:00Z'));
    expect(feed.list()).toHaveLength(0);
    jest.useRealTimers();
  });
});

describe('OTP senders feed the feed', () => {
  it('EmailOtpService: a signup code appears, and verifying it uses it up', async () => {
    const feed = new OtpFeedService();
    const mail = {
      isMockMode: false,
      sendMail: jest.fn().mockResolvedValue({ success: true }),
    };
    const service = new EmailOtpService(
      mail as unknown as MailService,
      undefined,
      feed,
    );

    await service.sendRegistrationOtp('new@user.com', 'Ahmed', 'hash');
    const [entry] = feed.list();
    expect(entry).toMatchObject({
      channel: 'EMAIL',
      purpose: 'SIGNUP',
      provider: 'resend',
    });
    const code = feed.reveal(entry.id).code!;

    expect(service.verifyAndConsume('new@user.com', code)).not.toBeNull();
    expect(feed.list()[0]).toMatchObject({ status: 'USED', hasCode: false });
  });

  it('EmailOtpService: an email-change code is tied to its user', async () => {
    const feed = new OtpFeedService();
    const mail = {
      isMockMode: true,
      sendMail: jest.fn().mockResolvedValue({ success: true }),
    };
    const service = new EmailOtpService(
      mail as unknown as MailService,
      undefined,
      feed,
    );

    await service.sendEmailChangeOtp('u1', 'new@mail.com', 'Ahmed');
    const [entry] = feed.list();
    expect(entry).toMatchObject({
      purpose: 'EMAIL_CHANGE',
      provider: 'mock-mail',
    });
    const code = feed.reveal(entry.id).code!;
    expect(service.verifyEmailChangeOtp('u1', 'new@mail.com', code)).toBe(true);
    expect(feed.list()[0].status).toBe('USED');
  });

  it('TwilioService (mock): the code and its purpose appear, and a good check uses it up', async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_VERIFY_SERVICE_SID;
    const feed = new OtpFeedService();
    const twilio = new TwilioService(feed);

    await twilio.sendVerification('55123456', 'SIGNUP');
    const [entry] = feed.list();
    expect(entry).toMatchObject({
      channel: 'SMS',
      purpose: 'SIGNUP',
      recipient: '+96555123456',
      provider: 'mock-sms',
    });
    const code = feed.reveal(entry.id).code!;
    expect(await twilio.checkVerification('55123456', code)).toBe(true);
    expect(feed.list()[0].status).toBe('USED');
  });
});

describe('maskOtps (the portal’s السجلات)', () => {
  it.each([
    [
      '[MOCK MAIL] Resend is disabled or unconfigured. OTP code for a@b.com: 482913',
      'a@b.com: ••••••',
      '482913',
    ],
    [
      '[MOCK SMS] Twilio is disabled or unconfigured. OTP code for +96555123456: 482913',
      '+96555123456: ••••••',
      '482913',
    ],
    [
      'Verification check for +96555123456 with code 654321: valid.',
      'with code ••••••: valid',
      '654321',
    ],
  ])('hides the code in %s', (line, expected, code) => {
    expect(maskOtps(line)).toContain(expected);
    expect(maskOtps(line)).not.toContain(code);
  });

  it('leaves other lines alone', () => {
    expect(maskOtps('Request took: 1234 ms')).toBe('Request took: 1234 ms');
    expect(maskOtps('Mapped {/auth/verify-otp, POST} route')).toBe(
      'Mapped {/auth/verify-otp, POST} route',
    );
  });
});
