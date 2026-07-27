/**
 * VikiMedic v2 - File & Attachment Management Infrastructure
 * Clean Architecture Layer: Packages / Shared
 *
 * Categorized storage validation and metadata handler for medical documents, DICOM scans, and receipts.
 */

export type MedicalAttachmentCategory =
  | 'MEDICAL_LAB_RESULTS'
  | 'RADIOLOGY_DICOM_XRAY'
  | 'ID_CARDS_INSURANCE'
  | 'CONSENT_FORMS'
  | 'PRESCRIPTION_SCANS';

export interface FileAttachmentMeta {
  id: string;
  patientId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  category: MedicalAttachmentCategory;
  uploadedAtFA: string;
  checksumSha256: string;
}

export interface FileValidationResult {
  valid: boolean;
  errorMessageFA?: string;
}

class FileManagerService {
  private attachmentsStore: FileAttachmentMeta[] = [];

  /**
   * Validate file upload constraints
   */
  public validateFile(fileName: string, fileSizeBytes: number, category: MedicalAttachmentCategory): FileValidationResult {
    const maxLimits: Record<MedicalAttachmentCategory, number> = {
      MEDICAL_LAB_RESULTS: 10 * 1024 * 1024, // 10MB
      RADIOLOGY_DICOM_XRAY: 50 * 1024 * 1024, // 50MB
      ID_CARDS_INSURANCE: 5 * 1024 * 1024, // 5MB
      CONSENT_FORMS: 5 * 1024 * 1024, // 5MB
      PRESCRIPTION_SCANS: 5 * 1024 * 1024, // 5MB
    };

    const limit = maxLimits[category] || 10 * 1024 * 1024;

    if (fileSizeBytes > limit) {
      const limitMB = Math.round(limit / (1024 * 1024));
      return {
        valid: false,
        errorMessageFA: `حجم فایل انتخاب شده بیش از حد مجاز گروه ${category} است (حداکثر ${limitMB} مگابایت).`,
      };
    }

    return { valid: true };
  }

  /**
   * Register attachment metadata
   */
  public registerAttachment(
    patientId: string,
    fileName: string,
    fileSizeBytes: number,
    mimeType: string,
    category: MedicalAttachmentCategory
  ): FileAttachmentMeta {
    const meta: FileAttachmentMeta = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      patientId,
      fileName,
      fileSizeBytes,
      mimeType,
      category,
      uploadedAtFA: new Date().toLocaleTimeString('fa-IR'),
      checksumSha256: `sha256-${Math.random().toString(36).substr(2, 10)}`,
    };

    this.attachmentsStore.unshift(meta);
    return meta;
  }

  /**
   * Get all registered file attachments
   */
  public getAttachments(): FileAttachmentMeta[] {
    return [...this.attachmentsStore];
  }
}

export const fileManagerService = new FileManagerService();
