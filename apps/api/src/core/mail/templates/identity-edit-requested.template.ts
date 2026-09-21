export interface IdentityEditRequestedTemplateParams {
  userName: string;
  identityLabel: string; // 'الشركة' | 'المكتب'
  notes: string;
}

export function identityEditRequestedTemplate({
  userName,
  identityLabel,
  notes,
}: IdentityEditRequestedTemplateParams): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>مطلوب تعديل بيانات - Buyootna</title>
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
  .notes-box {
    background-color: #fffaeb;
    border: 1px solid #fedf89;
    border-radius: 8px;
    padding: 12px 16px;
    color: #93370d;
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
        <h2 class="title">مطلوب تعديل على بيانات ${identityLabel}</h2>
      </div>
      <div class="content">
        مرحباً <strong>${userName}</strong>،<br>
        يرجى مراجعة وتعديل بيانات هوية ${identityLabel} الخاصة بك قبل استكمال إجراءات التوثيق.
      </div>
      <div class="notes-box"><strong>ملاحظات المراجعة:</strong> ${notes}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} منصة بيوتنا. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
