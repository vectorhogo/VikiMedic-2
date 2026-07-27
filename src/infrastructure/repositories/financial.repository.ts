/**
 * VikiMedic v2 - Financial Transactions & Invoice Repository
 * Clean Architecture Layer: Infrastructure / Repositories
 */

import { BaseRepository } from './base.repository';
import { FinancialTransaction } from '../../domain/types';

export class FinancialRepository extends BaseRepository<FinancialTransaction> {
  constructor() {
    super('Financial');
  }

  public async getTransactionsByPatient(patientId: string): Promise<FinancialTransaction[]> {
    const all = await this.getAll();
    return all.filter((t) => t.patientId === patientId);
  }

  protected override validate(item: FinancialTransaction): void {
    super.validate(item);
    if (!item.patientId) {
      throw new Error('شناسه بیمار برای تراکنش مالی الزامی است.');
    }
    if (item.amountGross < 0) {
      throw new Error('مبلغ فاکتور نمی‌تواند منفی باشد.');
    }
  }
}

export const financialRepository = new FinancialRepository();
