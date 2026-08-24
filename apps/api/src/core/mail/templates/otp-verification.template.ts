export interface OtpVerificationTemplateParams {
  userName: string;
  otp: string;
  verifyUrl?: string;
}

export function otpVerificationTemplate({
  userName,
  otp,
  verifyUrl = '#',
}: OtpVerificationTemplateParams): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Buyootna OTP Verification</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    padding: 0;
    margin: 0;
  }
  .page {
    padding: 30px 16px;
  }
  .container-sec {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin: 0 auto;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    text-align: center;
  }
  .otp-lock {
    font-size: 60px;
  }
  .welcome-section {
    background: #144fa9db;
    padding: 30px;
    border-radius: 4px;
    color: #fff;
    font-size: 20px;
    margin: 20px 0px;
  }
  .app-name {
    font-size: 30px;
    font-weight: 800;
    margin: 7px 0px;
  }
  .welcome-text {
    font-family: monospace;
  }
  .verify-text {
    margin-top: 25px;
    font-size: 25px;
    letter-spacing: 3px;
  }
  .envelope-icon {
    font-size: 35px;
    margin-top: 10px;
  }
  .otp-code {
    font-size: 24px;
    font-weight: bold;
    background-color: #f8f9fa;
    padding: 15px;
    text-align: center;
    border-radius: 8px;
    border: 1px dashed #007bff;
    color: #007bff;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .btn-verify {
    display: inline-block;
    padding: 10px 20px;
    color: #ffffff !important;
    background-color: #007bff;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
  }
  .footer-text {
    color: #6c757d;
    font-size: 14px;
    text-align: center;
    margin-top: 20px;
  }
  .footer-text a {
    color: #007bff;
    text-decoration: none;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="container-sec">
      <div class="otp-lock">&#128274;</div>
      <div class="welcome-section">
        <div class="app-name">Buyootna</div>
        <div class="welcome-text">Thanks for signing up!</div>
        <div class="verify-text">Please Verify Your Email Address</div>
        <div class="envelope-icon">&#128231;</div>
      </div>
      <h2>Hello, ${userName}</h2>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <div class="otp-code">${otp}</div>
      <p class="mt-4">Please use this OTP to complete your verification. The OTP is valid for the next 10 minutes.</p>
      <a href="${verifyUrl}" class="btn-verify">Verify Now</a>
      <div class="footer-text">
        <p>If you did not request this OTP, please <a href="mailto:no-reply@buyootna.com">contact us</a> immediately.</p>
        <p>Thank you,<br>The Buyootna Team</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
