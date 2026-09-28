import { Injectable } from '@nestjs/common';
import { AdminUsersService } from '../users/admin-users.service';
import { AdminUsersFilterDto } from '../../dto/admin-users-filter.dto';

@Injectable()
export class AdminExportService {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  async exportUsersCsv(
    filters: AdminUsersFilterDto,
    getUsersFn?: (filters: AdminUsersFilterDto) => Promise<any>,
  ): Promise<string> {
    const res = getUsersFn
      ? await getUsersFn({ ...filters, page: 1, limit: 10000 })
      : await this.adminUsersService.getUsers({
          ...filters,
          page: 1,
          limit: 10000,
        });

    const headers = [
      'معرف الفرد',
      'الاسم',
      'البريد الإلكتروني',
      'رقم الهاتف',
      'نوع الحساب',
      'الاشتراك',
      'عدد الإعلانات',
      'الحالة',
      'تاريخ التسجيل',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = res.data.map((user: any) => [
      escapeCsv(user.id),
      escapeCsv(user.name),
      escapeCsv(user.email),
      escapeCsv(user.phone),
      escapeCsv(user.accountType),
      escapeCsv(user.subscriptionPlan),
      escapeCsv(user.adsCount ?? 0),
      escapeCsv(user.accountStatus),
      escapeCsv(user.registrationDate),
    ]);

    // UTF-8 BOM (\uFEFF) ensures Arabic text renders properly in Excel
    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((r: any) => r.join(','))].join(
        '\r\n',
      );

    return csvContent;
  }
}
