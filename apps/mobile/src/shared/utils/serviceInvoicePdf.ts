import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  formatDay,
  formatDayTime,
  formatMoney,
  formatWarranty,
  paymentLine,
} from '@/features/service-invoices/format';
import type { ServiceInvoice } from '@/shared/api/serviceInvoices.service';

// Values come from users (service names, client names): never raw into HTML
const esc = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const STYLE = `
  body { font-family: -apple-system, 'Segoe UI', Tahoma, sans-serif; direction: rtl; color: #111111; padding: 28px; }
  .header { text-align: center; margin-bottom: 18px; }
  .logo { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; }
  .company { font-size: 18px; font-weight: bold; margin-top: 8px; }
  .muted { color: #6B6A6A; font-size: 12px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .sep { border-top: 1px dashed #D7D7D7; margin: 10px 0; }
  .total { font-size: 15px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #15304D; color: #FFFFFF; padding: 10px 8px; text-align: right; }
  td { padding: 10px 8px; border-bottom: 1px solid #E2E8F0; }
  .footer { margin-top: 28px; text-align: center; color: #94A3B8; font-size: 11px; }
`;

const page = (body: string) => `
  <html dir="rtl" lang="ar"><head><meta charset="utf-8" /><style>${STYLE}</style></head>
  <body>${body}<div class="footer">بيوتنا • فواتير الخدمات</div></body></html>`;

async function share(html: string, dialogTitle: string): Promise<boolean> {
  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, {
    UTI: '.pdf',
    mimeType: 'application/pdf',
    dialogTitle,
  });
  return true;
}

const row = (label: string, value: string) =>
  `<div class="row"><span class="muted">${esc(label)}</span><span>${esc(value)}</span></div>`;

/** One invoice as a receipt-style PDF, handed to the share sheet. */
export function exportServiceInvoicePdf(invoice: ServiceInvoice) {
  const warranty = formatWarranty(invoice.warrantyMonths);
  const items = invoice.items
    .map((item) =>
      row(
        item.qty > 1 ? `${item.qty} ${item.name}` : item.name,
        formatMoney(item.price * item.qty),
      ),
    )
    .join('');
  const html = page(`
    <div class="header">
      ${invoice.company.logoUrl ? `<img class="logo" src="${esc(invoice.company.logoUrl)}" />` : ''}
      <div class="company">${esc(invoice.company.name)}</div>
      ${invoice.company.specialty ? `<div class="muted">${esc(invoice.company.specialty)}</div>` : ''}
    </div>
    ${row('رقم الفاتورة', invoice.invoiceNo)}
    ${row('تاريخ الاصدار', formatDayTime(invoice.issueDate))}
    ${row('موجهة الى', invoice.clientName)}
    <div class="sep"></div>
    ${row('الخدمة', invoice.title)}
    ${warranty ? row('كفالة الخدمة (ضمان)', warranty) : ''}
    <div class="sep"></div>
    ${items}
    ${row('الخصم', formatMoney(invoice.discount))}
    <div class="sep"></div>
    <div class="row total"><span>الاجمالي</span><span>${esc(formatMoney(invoice.total))}</span></div>
    <div class="row"><span class="muted">${esc(paymentLine(invoice.paidAt))}</span><span></span></div>
  `);
  return share(html, `فاتورة ${invoice.invoiceNo}`);
}

/** Every invoice in the current list as one table PDF. */
export function exportServiceInvoicesPdf(invoices: ServiceInvoice[]) {
  const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const rows = invoices
    .map(
      (inv, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(inv.invoiceNo)}</td>
        <td>${esc(inv.title)}</td>
        <td>${esc(inv.company.name)}</td>
        <td>${esc(formatDay(inv.issueDate))}</td>
        <td>${esc(inv.paidAt ? formatDay(inv.paidAt) : 'بانتظار الدفع')}</td>
        <td>${esc(formatMoney(inv.total))}</td>
      </tr>`,
    )
    .join('');
  const html = page(`
    <div class="header">
      <div class="company">فواتير الخدمات</div>
      <div class="muted">${invoices.length} فاتورة • الإجمالي ${esc(formatMoney(total))} • ${esc(formatDay(new Date()))}</div>
    </div>
    <table>
      <thead><tr><th>#</th><th>رقم الفاتورة</th><th>الخدمة</th><th>الشركة</th><th>تاريخ الاصدار</th><th>الدفع</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `);
  return share(html, 'فواتير الخدمات');
}
