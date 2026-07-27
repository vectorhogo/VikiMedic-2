/**
 * VikiMedic v2 - Patient Repository
 * Clean Architecture Layer: Infrastructure / Repositories
 */

import { BaseRepository } from './base.repository';
import { Patient } from '../../domain/types';

export class PatientRepository extends BaseRepository<Patient> {
  constructor() {
    super('Patient');
  }

  public async searchByNationalIdOrName(query: string): Promise<Patient[]> {
    const all = await this.getAll();
    const q = query.trim().toLowerCase();
    if (!q) return all;

    return all.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.nationalId.includes(q) ||
        p.fileNumber.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  }

  protected override validate(item: Patient): void {
    super.validate(item);
    if (!item.firstName || item.firstName.trim().length < 1) {
      throw new Error('نام بیمار الزامی است.');
    }
    if (!item.lastName || item.lastName.trim().length < 1) {
      throw new Error('نام خانوادگی بیمار الزامی است.');
    }
    if (!item.nationalId || item.nationalId.trim().length !== 10) {
      throw new Error('کد ملی بیمار باید دقیقاً ۱۰ رقم باشد.');
    }
  }
}

export const patientRepository = new PatientRepository();
