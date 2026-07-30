import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { InvoiceResponse } from '@/core/api/invoices.service';

export async function exportInvoicesToPdf(invoices: InvoiceResponse[]): Promise<boolean> {
  if (!invoices || invoices.length === 0) {
    return false;
  }

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;

  const rowsHtml = invoices
    .map((inv, idx) => {
      let statusLabel = 'معلقة';
      let statusBg = '#F3F4F6';
      let statusColor = '#4B5563';

      if (inv.status === 'PAID') {
        statusLabel = 'مدفوعة';
        statusBg = '#E5FFE8';
        statusColor = '#018B1B';
      } else if (inv.status === 'OVERDUE') {
        statusLabel = 'منتهية';
        statusBg = '#EEEEEE';
        statusColor = '#6B6A6A';
      } else if (inv.status === 'CANCELLED') {
        statusLabel = 'ملغية';
        statusBg = '#FFEBEB';
        statusColor = '#9C1E28';
      }

      const invDate = inv.createdAt
        ? new Date(inv.createdAt).toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '-';

      return `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px 8px; text-align: center; color: #64748B;">${idx + 1}</td>
          <td style="padding: 12px 8px; font-weight: bold; color: #1E293B;">${inv.invoiceNo}</td>
          <td style="padding: 12px 8px; color: #334155;">${inv.planName}</td>
          <td style="padding: 12px 8px; color: #64748B;">${inv.planDetails || '-'}</td>
          <td style="padding: 12px 8px; font-weight: bold; color: #15304D; text-align: center;">${inv.amount} د.ك</td>
          <td style="padding: 12px 8px; color: #64748B; text-align: center;">${invDate}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; background-color: ${statusBg}; color: ${statusColor}; font-size: 12px; font-weight: bold;">
              ${statusLabel}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>كشف الفواتير - تطبيق بيوتنا</title>
      <style>
        body {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 24px;
          color: #0F172A;
          background-color: #FFFFFF;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #15304D;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .brand {
          font-size: 24px;
          font-weight: 800;
          color: #15304D;
        }
        .subtitle {
          font-size: 13px;
          color: #64748B;
          margin-top: 4px;
        }
        .stats-grid {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          flex: 1;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px;
          text-align: center;
        }
        .stat-title {
          font-size: 12px;
          color: #64748B;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #15304D;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          font-size: 13px;
        }
        th {
          background-color: #15304D;
          color: #FFFFFF;
          padding: 10px 8px;
          font-weight: 600;
          text-align: right;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #E2E8F0;
          padding-top: 16px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">بيوتنا Buyootna</div>
          <div class="subtitle">كشف تفصيلي بجميع الفواتير والاشتراكات</div>
        </div>
        <div style="text-align: left; font-size: 12px; color: #64748B;">
          <div>تاريخ التصدير: ${currentDate}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">إجمالي الفواتير</div>
          <div class="stat-value">${invoices.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">الفواتير المدفوعة</div>
          <div class="stat-value">${paidCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">المبلغ الإجمالي</div>
          <div class="stat-value">${totalAmount} د.ك</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center;">#</th>
            <th>رقم الفاتورة</th>
            <th>الباقة</th>
            <th>التفاصيل</th>
            <th style="text-align: center;">المبلغ</th>
            <th style="text-align: center;">التاريخ</th>
            <th style="text-align: center;">الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        تم إنشاء هذا التقرير تلقائياً بواسطة تطبيق بيوتنا للعقارات • جميع الحقوق محفوظة
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'تصدير كشف الفواتير - تطبيق بيوتنا',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error generating or sharing PDF invoice statement:', error);
    throw error;
  }
}
