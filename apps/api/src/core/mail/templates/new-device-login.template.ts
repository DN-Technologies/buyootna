export interface NewDeviceLoginTemplateParams {
  userName: string;
  deviceName: string;
  loginTime: string;
  ipAddress?: string | null;
}

// Device name and IP come from request headers -- never trust them as HTML
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function newDeviceLoginTemplate({
  userName,
  deviceName,
  loginTime,
  ipAddress,
}: NewDeviceLoginTemplateParams): string {
  const ipRow = ipAddress
    ? `<tr><td class="label">عنوان IP</td><td class="value">${escapeHtml(ipAddress)}</td></tr>`
    : '';

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>تسجيل دخول جديد إلى حسابك - Buyootna</title>
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
  .icon {
    display: inline-block;
    width: 60px;
    height: 60px;
    line-height: 60px;
    background-color: #f9fafe;
    border-radius: 50%;
    margin-bottom: 12px;
    font-size: 28px;
  }
  .title { color: #111111; font-size: 20px; font-weight: 700; margin: 0 0 8px 0; text-align: center; }
  .content { color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
  .details { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .details td { padding: 10px 12px; border-bottom: 1px solid #eef2f6; font-size: 14px; }
  .label { color: #6b7280; width: 35%; }
  .value { color: #15304D; font-weight: 700; }
  .warning {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #9c1e28;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.6;
  }
  .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
</style>
</head>
<body>
<div class="page">
  <div class="container">
    <div class="header">
      <div class="icon">🔐</div>
      <p class="brand">بيوتنا</p>
      <p class="title">تسجيل دخول جديد إلى حسابك</p>
    </div>
    <p class="content">مرحباً ${escapeHtml(userName)}، تم تسجيل الدخول إلى حسابك من جهاز جديد.</p>
    <table class="details">
      <tr><td class="label">الجهاز</td><td class="value">${escapeHtml(deviceName)}</td></tr>
      <tr><td class="label">الوقت</td><td class="value">${escapeHtml(loginTime)}</td></tr>
      ${ipRow}
    </table>
    <div class="warning">
      إذا لم تكن أنت، غيّر كلمة المرور فوراً وأزل هذا الجهاز من قائمة الأجهزة النشطة في إعدادات التطبيق.
    </div>
    <p class="footer">إذا كنت أنت من سجّل الدخول، يمكنك تجاهل هذه الرسالة.</p>
  </div>
</div>
</body>
</html>`;
}
