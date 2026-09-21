export interface IdentityVerificationDecisionTemplateParams {
  userName: string;
  identityLabel: string; // 'الشركة' | 'المكتب'
  approved: boolean;
  reason?: string;
}

export function identityVerificationDecisionTemplate({
  userName,
  identityLabel,
  approved,
  reason,
}: IdentityVerificationDecisionTemplateParams): string {
  const title = approved ? 'تمت الموافقة على هويتك' : 'تم رفض هويتك';
  const body = approved
    ? `تمت الموافقة على طلب هوية ${identityLabel} الخاص بك، ويمكنك الآن استخدامه بالكامل.`
    : `للأسف تم رفض طلب هوية ${identityLabel} الخاص بك. يرجى مراجعة بياناتك والمحاولة مرة أخرى أو التواصل مع الدعم.`;

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} - Buyootna</title>
<style>
  body {
    font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    padding: 0;
    margin: 0;
    direction: rtl;
    text-align: right;
  }
  .page { padding: 40px 16px; }
  .container {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 32px;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    max-width: 560px;
    border: 1px solid #e2e8f0;
  }
  .header { text-align: center; margin-bottom: 24px; }
  .brand { color: #15304D; font-size: 26px; font-weight: 800; margin: 0 0 8px 0; }
  .title { color: #111111; font-size: 20px; font-weight: 700; margin: 0 0 8px 0; text-align: center; }
  .content { color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center; }
  .reason-box {
    background-color: ${approved ? '#ecfdf3' : '#fef3f2'};
    border: 1px solid ${approved ? '#abefc6' : '#fecdca'};
    border-radius: 8px;
    padding: 12px 16px;
    color: ${approved ? '#027a48' : '#b42318'};
    font-size: 13px;
    text-align: center;
    margin-top: 16px;
  }
  .footer {
    color: #94a3b8;
    font-size: 13px;
    text-align: center;
    margin-top: 32px;
    border-top: 1px solid #f1f5f9;
    padding-top: 20px;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="container">
      <div class="header">
        <h1 class="brand">Buyootna</h1>
        <h2 class="title">${title}</h2>
      </div>
      <div class="content">
        مرحباً <strong>${userName}</strong>،<br>
        ${body}
      </div>
      ${reason ? `<div class="reason-box"><strong>السبب:</strong> ${reason}</div>` : ''}
      <div class="footer">
        <p>© ${new Date().getFullYear()} منصة بيوتنا. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
