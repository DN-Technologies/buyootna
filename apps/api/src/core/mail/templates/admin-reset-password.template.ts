export interface AdminResetPasswordTemplateParams {
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export function adminResetPasswordTemplate({
  userName,
  resetUrl,
  expiresInMinutes = 60,
}: AdminResetPasswordTemplateParams): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>إعادة تعيين كلمة المرور - Buyootna</title>
<style>
  body {
    font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    padding: 0;
    margin: 0;
    direction: rtl;
    text-align: right;
  }
  .page {
    padding: 40px 16px;
  }
  .container {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 32px;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    max-width: 560px;
    border: 1px solid #e2e8f0;
  }
  .header {
    text-align: center;
    margin-bottom: 24px;
  }
  .brand {
    color: #15304D;
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 8px 0;
  }
  .lock-icon {
    display: inline-block;
    width: 60px;
    height: 60px;
    line-height: 60px;
    background-color: #f9fafe;
    border-radius: 50%;
    margin-bottom: 12px;
    font-size: 28px;
  }
  .title {
    color: #111111;
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px 0;
    text-align: center;
  }
  .content {
    color: #4b5563;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 24px;
    text-align: center;
  }
  .btn-container {
    text-align: center;
    margin: 28px 0;
  }
  .action-btn {
    display: inline-block;
    background-color: #15304D;
    color: #ffffff !important;
    text-decoration: none;
    font-size: 15px;
    font-weight: 700;
    padding: 14px 36px;
    border-radius: 24px;
    box-shadow: 0 2px 6px rgba(21, 48, 77, 0.25);
  }
  .alert-box {
    background-color: #fffbeb;
    border: 1px solid #fef3c7;
    border-radius: 8px;
    padding: 12px 16px;
    color: #b45309;
    font-size: 13px;
    text-align: center;
    margin-top: 24px;
  }
  .footer {
    color: #94a3b8;
    font-size: 13px;
    text-align: center;
    margin-top: 32px;
    border-top: 1px solid #f1f5f9;
    padding-top: 20px;
  }
  .url-fallback {
    word-break: break-all;
    direction: ltr;
    font-size: 12px;
    color: #64748b;
    margin-top: 12px;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="container">
      <div class="header">
        <div class="lock-icon">🔒</div>
        <h1 class="brand">Buyootna</h1>
        <h2 class="title">طلب إعادة تعيين كلمة المرور</h2>
      </div>

      <div class="content">
        مرحباً <strong>${userName}</strong>،<br>
        تم طلب إعادة تعيين كلمة المرور لحسابك من قبل إدارة منصة بيوتنا.<br>
        يمكنك تعيين كلمة مرور جديدة لحسابك بالنقر على الزر أدناه:
      </div>

      <div class="btn-container">
        <a href="${resetUrl}" class="action-btn" target="_blank">إعادة تعيين كلمة المرور</a>
      </div>

      <div class="alert-box">
        ⚠️ هذا الرابط صالح لمدة ${expiresInMinutes} دقيقة فقط. إذا لم تطلب هذا الإجراء، يرجى مراجعة إدارة الدعم الفني.
      </div>

      <div class="footer">
        إذا واجهت مشكلة في النقر على الزر، يمكنك نسخ الرابط التالي ولصقه في متصفحك:
        <div class="url-fallback">${resetUrl}</div>
        <p style="margin-top: 16px;">© ${new Date().getFullYear()} منصة بيوتنا. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
