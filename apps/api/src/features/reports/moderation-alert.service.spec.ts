import type { MailService } from '../../core/mail/mail.service';
import { ModerationAlertService } from './moderation-alert.service';

describe('ModerationAlertService', () => {
  const mail = { sendMail: jest.fn().mockResolvedValue({ success: true }) };
  const service = new ModerationAlertService(mail as unknown as MailService);
  const alert = {
    reportNumber: 4821,
    kind: 'إعلان',
    reason: 'محتوى مسيء',
    description: '<b>نص</b>',
  };
  const env = process.env.MODERATION_ALERT_EMAIL;

  beforeEach(() => jest.clearAllMocks());
  afterAll(() => {
    process.env.MODERATION_ALERT_EMAIL = env;
  });

  it('emails the moderation inbox, with the 24-hour deadline and the text escaped', async () => {
    process.env.MODERATION_ALERT_EMAIL = 'mod@buyootna.com, ops@buyootna.com';
    await service.reportCreated(alert);
    expect(mail.sendMail).toHaveBeenCalledWith({
      to: ['mod@buyootna.com', 'ops@buyootna.com'],
      subject: expect.stringContaining('RP-4821') as string,
      html: expect.stringContaining('&lt;b&gt;نص&lt;/b&gt;') as string,
    });
    const [[{ html }]] = mail.sendMail.mock.calls as [[{ html: string }]];
    expect(html).toContain('24 ساعة');
  });

  it('sends nothing when no inbox is configured', async () => {
    delete process.env.MODERATION_ALERT_EMAIL;
    await service.reportCreated(alert);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it('never throws when the email fails', async () => {
    process.env.MODERATION_ALERT_EMAIL = 'mod@buyootna.com';
    mail.sendMail.mockRejectedValueOnce(new Error('resend down'));
    await expect(service.reportCreated(alert)).resolves.toBeUndefined();
  });
});
