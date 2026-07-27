/**
 * VikiMedic v2 - Appointment & Queue Repository
 * Clean Architecture Layer: Infrastructure / Repositories
 */

import { BaseRepository } from './base.repository';
import { QueueItem } from '../../domain/types';

export class AppointmentRepository extends BaseRepository<QueueItem> {
  constructor() {
    super('Appointment');
  }

  public async getTodayQueueByClinic(clinicId: string): Promise<QueueItem[]> {
    const all = await this.getAll();
    return all.filter((item) => item.clinicId === clinicId);
  }

  protected override validate(item: QueueItem): void {
    super.validate(item);
    if (!item.patientId) {
      throw new Error('شناسه بیمار برای نوبت الزامی است.');
    }
    if (!item.doctorName) {
      throw new Error('نام پزشک معالج الزامی است.');
    }
  }
}

export const appointmentRepository = new AppointmentRepository();
