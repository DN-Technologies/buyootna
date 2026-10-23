import { Injectable, Logger } from '@nestjs/common';

import { MailService } from '../../core/mail/mail.service';

export interface ReportAlert {
  reportNumber: number;
  // What was reported, shown in the subject: «إعلان», «تقييم», «قصة»…
  kind: string;
  reason: string;
  description?: string | null;
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ] ?? c,
  );

/**
 * Emails the moderation inbox about every new report and block (Guideline
 * 1.2: reports are acted on within 24 hours). The inbox is
 * MODERATION_ALERT_EMAIL (comma-separated for several); unset, nothing is
 * sent. Never throws: a failed email must not fail the report.
 */
@Injectable()
export class ModerationAlertService {
  private readonly logger = new Logger(ModerationAlertService.name);

  constructor(private readonly mail: MailService) {}

  async reportCreated(alert: ReportAlert): Promise<void> {
    const to = (process.env.MODERATION_ALERT_EMAIL ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (to.length === 0) {
      this.logger.warn(
        `MODERATION_ALERT_EMAIL unset: no alert for report RP-${alert.reportNumber}`,
      );
      return;
    }
    const adminUrl =
      process.env.ADMIN_PANEL_URL ?? 'https://admin.buyootna.cloud';
    const description = alert.description?.trim();
    try {
      await this.mail.sendMail({
        to,
        subject: `بلاغ جديد RP-${alert.reportNumber} (${alert.kind}) — يُراجع خلال 24 ساعة`,
        html: `<div dir="rtl" style="font-family:sans-serif">
  <p>بلاغ جديد <b>RP-${alert.reportNumber}</b> عن ${escapeHtml(alert.kind)}.</p>
  <p>السبب: ${escapeHtml(alert.reason)}</p>
  ${description ? `<p>التفاصيل: ${escapeHtml(description)}</p>` : ''}
  <p>يجب مراجعته واتخاذ الإجراء (حذف المحتوى وإيقاف الحساب) خلال 24 ساعة.</p>
  <p><a href="${adminUrl}/reports">فتح البلاغات في لوحة الإدارة</a></p>
</div>`,
      });
    } catch (error) {
      this.logger.error(
        `Moderation alert for RP-${alert.reportNumber} failed: ${String(error)}`,
      );
    }
  }
}
