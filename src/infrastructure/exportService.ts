/**
 * VikiMedic v2 - Export & Print Service
 * Clean Architecture Layer: Infrastructure
 */

import { Patient, FinancialTransaction, MedicalRecord } from '../domain/types';

export class ExportService {
  /**
   * Triggers native browser print dialog for current view
   */
  public static printCurrentView(): void {
    window.print();
  }

  /**
   * Export patient records as CSV format (Persian UTF-8 BOM supported)
   */
  public static exportPatientsToCSV(patients: Patient[]): void {
    const headers = [
      'شماره پرونده',
      'کد ملی',
      'نام',
      'نام خانوادگی',
      'نام پدر',
      'جنسیت',
      'تاریخ تولد',
      'شماره همراه',
      'نوع بیمه',
      'گروه خونی',
      'آخرین مراجعه',
    ];

    const rows = patients.map((p) => [
      p.fileNumber,
      p.nationalId,
      p.firstName,
      p.lastName,
      p.fatherName || '-',
      p.gender === 'MALE' ? 'مرد' : 'زن',
      p.birthDate,
      p.phone,
      p.insuranceType,
      p.bloodType || '-',
      p.lastVisitDate || '-',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vikimedic_patients_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export financial transactions as CSV
   */
  public static exportTransactionsToCSV(transactions: FinancialTransaction[]): void {
    const headers = [
      'شماره فاکتور',
      'نام بیمار',
      'مبلغ کل (تومان)',
      'تخفیف',
      'سهم بیمه',
      'مبلغ پرداختی',
      'روش پرداخت',
      'تاریخ و زمان',
      'صندوق‌دار',
    ];

    const rows = transactions.map((t) => [
      t.invoiceNumber,
      t.patientName,
      t.amountGross,
      t.discountAmount,
      t.insuranceCoverage,
      t.amountNet,
      t.paymentMethod,
      t.createdAt,
      t.cashierName,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vikimedic_financials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Format Persian numbers for presentation
   */
  public static toPersianDigits(num: number | string): string {
    if (num === null || num === undefined) return '';
    const latinDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let str = num.toString();
    for (let i = 0; i < 10; i++) {
      str = str.replace(new RegExp(latinDigits[i], 'g'), persianDigits[i]);
    }
    return str;
  }

  /**
   * Format currency (Toman) with Persian digits and commas
   */
  public static formatCurrency(amount: number): string {
    const formatted = amount.toLocaleString('fa-IR');
    return `${formatted} تومان`;
  }
}
