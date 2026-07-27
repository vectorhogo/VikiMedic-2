/**
 * VikiMedic v2 - Print Infrastructure Framework
 * Clean Architecture Layer: Packages / Shared
 *
 * Universal print engine managing thermal receipts, A5 prescriptions, and A4 official invoices.
 */

export type PrintTemplateType = 'THERMAL_RECEIPT_80MM' | 'PRESCRIPTION_A5' | 'OFFICIAL_INVOICE_A4' | 'MEDICAL_CERTIFICATE_A4';

export interface PrintJobOptions {
  jobId: string;
  templateType: PrintTemplateType;
  patientName: string;
  nationalId?: string;
  documentTitle: string;
  itemDetails: Array<{ label: string; value: string }>;
  totalAmountRial?: number;
  clinicHeaderFA?: string;
  createdDateFA: string;
  autoPrintDirect?: boolean;
}

export interface PrintJobResult {
  success: boolean;
  jobId: string;
  printedAt: string;
  templateUsed: PrintTemplateType;
}

class PrintEngine {
  private activeQueue: PrintJobOptions[] = [];

  /**
   * Enqueue a new print job
   */
  public queueJob(options: PrintJobOptions): PrintJobResult {
    this.activeQueue.push(options);

    // Simulate print trigger
    const result: PrintJobResult = {
      success: true,
      jobId: options.jobId,
      printedAt: new Date().toLocaleTimeString('fa-IR'),
      templateUsed: options.templateType,
    };

    if (options.autoPrintDirect && typeof window !== 'undefined') {
      console.log(`[PrintEngine] Triggering direct hardware print for job ${options.jobId}`);
    }

    return result;
  }

  /**
   * Get pending print jobs in queue
   */
  public getPendingQueue(): PrintJobOptions[] {
    return [...this.activeQueue];
  }

  /**
   * Clear processed print queue
   */
  public clearQueue(): void {
    this.activeQueue = [];
  }
}

export const printEngine = new PrintEngine();
