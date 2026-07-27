/**
 * VikiMedic v2 - Pharmacy & Inventory Repository
 * Clean Architecture Layer: Infrastructure / Repositories
 */

import { BaseRepository } from './base.repository';
import { InventoryItem } from '../../domain/types';

export class PharmacyRepository extends BaseRepository<InventoryItem> {
  constructor() {
    super('Pharmacy');
  }

  public async getLowStockItems(): Promise<InventoryItem[]> {
    const all = await this.getAll();
    return all.filter((m) => m.stockQuantity <= m.minStockLevel);
  }

  protected override validate(item: InventoryItem): void {
    super.validate(item);
    if (!item.name || item.name.trim().length === 0) {
      throw new Error('نام قلم دارویی/تجهیزات الزامی است.');
    }
  }
}

export const pharmacyRepository = new PharmacyRepository();
