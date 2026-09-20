export interface AdminCustomMessageTemplateParams {
  userName: string;
  title: string;
  message: string;
}

export function adminCustomMessageTemplate({
  userName,
  title,
  message,
}: AdminCustomMessageTemplateParams): string {
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
  .content {
    color: #4b5563;
    font-size: 15px;
    line-height: 1.6;
    margin-top: 8px;
    white-space: pre-wrap;
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
        مرحباً <strong>${userName}</strong>،<br><br>
        ${message}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} منصة بيوتنا. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
