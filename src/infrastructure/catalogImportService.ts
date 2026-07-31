/**
 * VikiMedic v2 - Catalog Excel Import Service
 * Patch 05: Smart Excel Import, Mapping, Validation, Preview & Audit Engine
 * Clean Architecture Layer: Infrastructure
 */

import * as XLSX from 'xlsx';
import {
  CatalogItem,
  CatalogItemType,
  CatalogTargetField,
  TargetFieldDefinition,
  CatalogDuplicateStrategy,
  CatalogImportRowValidation,
  ImportRowValidationStatus,
  ImportPlannedAction,
  CatalogImportAuditLog,
  CatalogImportSummaryReport,
  normalizePersianText,
  checkCatalogDuplicate,
} from '../domain/types';
import { LocalStorageManager } from './storage';

export const TARGET_FIELD_DEFINITIONS: TargetFieldDefinition[] = [
  { key: 'name', labelPersian: 'نام کالا / خدمت', labelEnglish: 'Services / Products Name', required: true },
  { key: 'type', labelPersian: 'نوع آیتم', labelEnglish: 'Item Type', required: false },
  { key: 'category', labelPersian: 'دسته‌بندی', labelEnglish: 'Category', required: false },
  { key: 'code', labelPersian: 'کد آیتم', labelEnglish: 'Item Code', required: false },
  { key: 'barcode', labelPersian: 'بارکد تجاری / IRC', labelEnglish: 'Barcode', required: false },
  { key: 'unit', labelPersian: 'واحد سنجش', labelEnglish: 'Unit', required: false },
  { key: 'purchasePrice', labelPersian: 'قیمت خرید (تومان)', labelEnglish: 'Purchase Price', required: false },
  { key: 'price', labelPersian: 'قیمت فروش / تعرفه (تومان)', labelEnglish: 'Sale Price', required: false },
  { key: 'description', labelPersian: 'توضیحات / شرح', labelEnglish: 'Description', required: false },
  { key: 'status', labelPersian: 'وضعیت (فعال/غیرفعال)', labelEnglish: 'Status', required: false },
  { key: 'insuranceSupport', labelPersian: 'مشمول بیمه (بله/خیر)', labelEnglish: 'Insurance Support', required: false },
  { key: 'insuranceProvider', labelPersian: 'سازمان بیمه‌گر', labelEnglish: 'Insurance Provider', required: false },
  { key: 'insurancePercentage', labelPersian: 'درصد پوشش بیمه (۰-۱۰۰)', labelEnglish: 'Insurance Coverage Percentage', required: false },
];

/**
 * Smart Header Matching Dictionary
 * Maps common Persian and English Excel column names to standard catalog fields
 */
const HEADER_SYNONYMS: Record<CatalogTargetField, string[]> = {
  name: [
    'کالا', 'نام کالا', 'محصول', 'نام محصول', 'خدمت', 'نام خدمت',
    'عنوان', 'نام', 'عنوان خدمت', 'عنوان کالا', 'نام کالا / خدمت',
    'services / products name', 'services/products name', 'name', 'title', 'item name', 'product name', 'service name'
  ],
  type: [
    'نوع', 'نوع کالا', 'نوع خدمت', 'نوع آیتم', 'دسته‌بندی نوع', 'نوع محصول',
    'item type', 'type', 'product type'
  ],
  category: [
    'دسته‌بندی', 'دسته', 'گروه', 'گروه کالا', 'دسته بندی', 'گروه خدمت',
    'category', 'cat', 'group'
  ],
  code: [
    'کد', 'کد کالا', 'کد خدمت', 'کد آیتم', 'کد شناسایی', 'کد اختصاصی',
    'item code', 'code', 'id', 'service code'
  ],
  barcode: [
    'بارکد', 'بارکد کالا', 'کد بارکد', 'irc', 'شناسه irc',
    'barcode', 'upc', 'ean'
  ],
  unit: [
    'واحد', 'واحد سنجش', 'واحد شمارش', 'واحد فروش',
    'unit', 'measure', 'uom'
  ],
  purchasePrice: [
    'قیمت خرید', 'بهای خرید', 'هزینه خرید', 'خرید', 'قیمت اولیه', 'بهای تمام شده',
    'purchase price', 'buy price', 'cost', 'cost price', 'purchase_price'
  ],
  price: [
    'قیمت', 'مبلغ', 'قیمت فروش', 'نرخ فروش', 'تعرفه', 'قیمت واحد', 'تعرفه مصوب', 'نرخ',
    'sale price', 'price', 'rate', 'sell price', 'sale_price'
  ],
  description: [
    'توضیحات', 'شرح', 'ملاحظات', 'توضیح',
    'description', 'notes', 'desc', 'remark'
  ],
  status: [
    'وضعیت', 'وضعیت کالا', 'فعال/غیرفعال',
    'status', 'state', 'is_active'
  ],
  insuranceSupport: [
    'پشتیبانی بیمه', 'مشمول بیمه', 'بیمه‌ای', 'تحت پوشش بیمه',
    'insurance support', 'is covered', 'covered', 'insurance_support'
  ],
  insuranceProvider: [
    'بیمه', 'بیمه‌گر', 'سازمان بیمه', 'بیمه اصلی', 'نام بیمه',
    'insurance provider', 'provider', 'insurer', 'insurance_provider'
  ],
  insurancePercentage: [
    'درصد بیمه', 'درصد پوشش', 'درصد پوشش بیمه', 'درصد سهم بیمه', 'سهم بیمه',
    'insurance coverage percentage', 'coverage percentage', 'coverage %', 'insurance %', 'insurance_percentage'
  ],
  IGNORE: []
};

/**
 * Automatically recognizes similar source headers
 */
export function matchHeaderToField(header: string): CatalogTargetField {
  if (!header || typeof header !== 'string') return 'IGNORE';
  
  const cleanHeader = header.trim().toLowerCase().replace(/[\_\-\:]/g, ' ');
  const normHeader = normalizePersianText(cleanHeader);

  for (const [field, synonyms] of Object.entries(HEADER_SYNONYMS)) {
    if (field === 'IGNORE') continue;
    for (const synonym of synonyms) {
      const cleanSyn = synonym.trim().toLowerCase();
      const normSyn = normalizePersianText(cleanSyn);
      
      if (normHeader === normSyn || cleanHeader === cleanSyn) {
        return field as CatalogTargetField;
      }
      if (normHeader.includes(normSyn) || normSyn.includes(normHeader)) {
        // High confidence partial match
        if (normSyn.length >= 3 && normHeader.length >= 3) {
          return field as CatalogTargetField;
        }
      }
    }
  }

  return 'IGNORE';
}

/**
 * Normalizes item type strings into standard CatalogItemType
 */
export function normalizeItemType(typeStr: string, defaultType: CatalogItemType = 'MEDICAL_SERVICE'): CatalogItemType {
  if (!typeStr) return defaultType;
  const norm = normalizePersianText(String(typeStr));

  if (norm.includes('دارو') || norm.includes('medicine') || norm.includes('med')) return 'MEDICINE';
  if (norm.includes('مصرف') || norm.includes('consumable')) return 'CONSUMABLE';
  if (norm.includes('کالا') || norm.includes('تجهیزات') || norm.includes('product') || norm.includes('equipment')) return 'PRODUCT';
  if (norm.includes('آزمایش') || norm.includes('lab')) return 'LAB_SERVICE';
  if (norm.includes('رادیولوژی') || norm.includes('تصویر') || norm.includes('radiology')) return 'RADIOLOGY_SERVICE';
  if (norm.includes('ویزیت') || norm.includes('پزشک') || norm.includes('visit')) return 'DOCTOR_VISIT';
  if (norm.includes('خدمت') || norm.includes('service')) return 'MEDICAL_SERVICE';
  
  return defaultType;
}

/**
 * Reads Excel file (.xlsx, .xls, .csv) and returns raw sheets and headers
 */
export async function parseExcelFile(file: File): Promise<{
  fileName: string;
  headers: string[];
  rawRows: Record<string, any>[];
  sheetNames: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          throw new Error('فایل انتخاب شده خالی است یا هیچ سطر داده‌ای ندارد.');
        }

        // Extract header names
        const headers = Object.keys(jsonRows[0] || {});

        resolve({
          fileName: file.name,
          headers,
          rawRows: jsonRows,
          sheetNames: workbook.SheetNames,
        });
      } catch (err: any) {
        reject(new Error(err.message || 'خطا در خواندن فایل اکسل. لطفاً از فرمت معتبر xlsx, xls یا csv استفاده کنید.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('خطا در بارگذاری فایل از حافظه.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates rows and prepares planned actions according to duplicate strategy
 */
export function validateImportRows(
  rawRows: Record<string, any>[],
  columnMapping: Record<string, CatalogTargetField>,
  defaultItemType: CatalogItemType,
  existingCatalog: CatalogItem[],
  duplicateStrategy: CatalogDuplicateStrategy
): CatalogImportRowValidation[] {
  const validatedRows: CatalogImportRowValidation[] = [];
  const processedCodesInFile = new Set<string>();
  const processedBarcodesInFile = new Set<string>();
  const processedNamesInFile = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowIndex = idx + 1;
    const issues: string[] = [];

    // Map fields from row according to columnMapping
    let name = '';
    let typeRaw = '';
    let category = 'خدمات عمومی';
    let code = '';
    let barcode = '';
    let unit = 'عدد';
    let purchasePriceRaw: any = undefined;
    let priceRaw: any = undefined;
    let description = '';
    let statusRaw = 'ACTIVE';
    let insuranceSupportRaw: any = undefined;
    let insuranceProvider = '';
    let insurancePercentageRaw: any = undefined;

    Object.entries(columnMapping).forEach(([header, targetField]) => {
      const val = row[header] !== undefined && row[header] !== null ? String(row[header]).trim() : '';

      switch (targetField) {
        case 'name':
          name = val;
          break;
        case 'type':
          typeRaw = val;
          break;
        case 'category':
          if (val) category = val;
          break;
        case 'code':
          code = val;
          break;
        case 'barcode':
          barcode = val;
          break;
        case 'unit':
          if (val) unit = val;
          break;
        case 'purchasePrice':
          purchasePriceRaw = val;
          break;
        case 'price':
          priceRaw = val;
          break;
        case 'description':
          description = val;
          break;
        case 'status':
          statusRaw = val;
          break;
        case 'insuranceSupport':
          insuranceSupportRaw = val;
          break;
        case 'insuranceProvider':
          insuranceProvider = val;
          break;
        case 'insurancePercentage':
          insurancePercentageRaw = val;
          break;
      }
    });

    // 1. Required Name Validation
    if (!name) {
      issues.push('عنوان کامل (Services / Products Name) الزامی است.');
    }

    // 2. Parse & Validate Prices
    let price = 0;
    if (priceRaw !== undefined && priceRaw !== '') {
      const parsedPrice = Number(String(priceRaw).replace(/,/g, ''));
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        issues.push('قیمت فروش / تعرفه باید یک عدد معتبر و غیرمنفی باشد.');
      } else {
        price = parsedPrice;
      }
    }

    let purchasePrice = 0;
    if (purchasePriceRaw !== undefined && purchasePriceRaw !== '') {
      const parsedPPrice = Number(String(purchasePriceRaw).replace(/,/g, ''));
      if (isNaN(parsedPPrice) || parsedPPrice < 0) {
        issues.push('قیمت خرید باید یک عدد معتبر و غیرمنفی باشد.');
      } else {
        purchasePrice = parsedPPrice;
      }
    }

    // 3. Normalize Item Type
    const type = normalizeItemType(typeRaw, defaultItemType);

    // 4. Validate Insurance Percentage
    let insurancePercentage: number | undefined = undefined;
    if (insurancePercentageRaw !== undefined && insurancePercentageRaw !== '') {
      const parsedPct = Number(String(insurancePercentageRaw).replace(/,/g, ''));
      if (isNaN(parsedPct) || parsedPct < 0 || parsedPct > 100) {
        issues.push('درصد پوشش بیمه باید عددی بین ۰ تا ۱۰۰ باشد.');
      } else {
        insurancePercentage = parsedPct;
      }
    }

    // Parse Insurance Support
    let insuranceSupport = false;
    if (insuranceSupportRaw !== undefined && insuranceSupportRaw !== '') {
      const normSup = String(insuranceSupportRaw).toLowerCase();
      if (normSup === 'true' || normSup === '1' || normSup.includes('بله') || normSup.includes('دارد')) {
        insuranceSupport = true;
      }
    } else if (insurancePercentage && insurancePercentage > 0) {
      insuranceSupport = true;
    }

    // Status normalization
    let status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
    if (statusRaw) {
      const normStat = normalizePersianText(statusRaw);
      if (normStat.includes('غیرفعال') || normStat.includes('inactive') || normStat === '0') {
        status = 'INACTIVE';
      }
    }

    // Auto Code Generation if empty
    if (!code && name) {
      const prefix = type === 'MEDICINE' ? 'DRG' : type === 'PRODUCT' ? 'PRD' : 'SRV';
      code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Duplicate Detection against Existing Catalog
    const dupCheck = checkCatalogDuplicate(existingCatalog, {
      code,
      barcode,
      name,
    });

    // File Internal Duplicate Detection
    const normCode = code.trim().toLowerCase();
    const normBarcode = barcode ? barcode.trim().toLowerCase() : '';
    const normName = normalizePersianText(name);

    let isDuplicateInFile = false;
    if (processedCodesInFile.has(normCode)) {
      isDuplicateInFile = true;
      issues.push(`کد «${code}» در همین فایل اکسل تکرار شده است.`);
    }
    if (normBarcode && processedBarcodesInFile.has(normBarcode)) {
      isDuplicateInFile = true;
      issues.push(`بارکد «${barcode}» در همین فایل اکسل تکرار شده است.`);
    }

    if (code) processedCodesInFile.add(normCode);
    if (normBarcode) processedBarcodesInFile.add(normBarcode);
    if (normName) processedNamesInFile.add(normName);

    // Determine Validation Status & Planned Action
    let validationStatus: ImportRowValidationStatus = 'VALID';
    let plannedAction: ImportPlannedAction = 'ADD';

    if (issues.length > 0 && !dupCheck.isDuplicate) {
      validationStatus = 'INVALID';
      plannedAction = 'REJECTED';
    } else if (dupCheck.isDuplicate || isDuplicateInFile) {
      if (issues.length > 0) {
        validationStatus = 'INVALID';
        plannedAction = 'REJECTED';
      } else if (duplicateStrategy === 'SKIP') {
        validationStatus = 'WARNING';
        plannedAction = 'SKIP';
        issues.push(dupCheck.reason || 'مورد تکراری شناسایی شد (طبق تنظیمات صرف‌نظر می‌شود).');
      } else if (duplicateStrategy === 'UPDATE') {
        validationStatus = 'WARNING';
        plannedAction = 'UPDATE';
        issues.push(dupCheck.reason || 'مورد تکراری شناسایی شد (اطلاعات آیتم قبلی جایگزین می‌شود).');
      } else if (duplicateStrategy === 'CREATE_COPY') {
        validationStatus = 'WARNING';
        plannedAction = 'CREATE_COPY';
        code = `${code}-COPY${Math.floor(10 + Math.random() * 90)}`;
        issues.push('مورد هم‌نام/تکراری وجود داشت؛ نسخه جدید با کد مجزا ایجاد می‌شود.');
      }
    }

    validatedRows.push({
      rowIndex,
      sourceData: row,
      mappedItem: {
        name,
        type,
        category,
        code,
        barcode,
        unit,
        purchasePrice,
        price,
        description,
        status,
        insuranceSupport,
        insuranceProvider: insuranceProvider || (insuranceSupport ? 'تأمین اجتماعی' : undefined),
        insurancePercentage: insurancePercentage !== undefined ? insurancePercentage : (insuranceSupport ? 70 : 0),
      },
      validationStatus,
      plannedAction,
      issues,
      conflictingItem: dupCheck.conflictingItem,
    });
  });

  return validatedRows;
}

/**
 * Executes the final import inside one safe database/storage transaction batch
 */
export function executeCatalogImport(
  clinicId: string,
  importedBy: string,
  fileName: string,
  validatedRows: CatalogImportRowValidation[],
  existingCatalog: CatalogItem[],
  duplicateStrategy: CatalogDuplicateStrategy
): {
  success: boolean;
  summary: CatalogImportSummaryReport;
  updatedCatalog: CatalogItem[];
  error?: string;
} {
  try {
    // Clone catalog for transaction safety
    let catalogCopy: CatalogItem[] = JSON.parse(JSON.stringify(existingCatalog));

    let itemsAdded = 0;
    let itemsUpdated = 0;
    let rowsSkipped = 0;
    let errorsCount = 0;
    let warningsCount = 0;
    let duplicatesFound = 0;

    const nowIso = new Date().toISOString();

    for (const rowVal of validatedRows) {
      if (rowVal.validationStatus === 'INVALID' || rowVal.plannedAction === 'REJECTED') {
        errorsCount++;
        continue;
      }

      if (rowVal.validationStatus === 'WARNING') {
        warningsCount++;
      }

      const itemData = rowVal.mappedItem;

      if (rowVal.plannedAction === 'SKIP') {
        rowsSkipped++;
        duplicatesFound++;
        continue;
      }

      if (rowVal.plannedAction === 'UPDATE' && rowVal.conflictingItem) {
        duplicatesFound++;
        const targetId = rowVal.conflictingItem.id;
        const targetIdx = catalogCopy.findIndex((c) => c.id === targetId);

        if (targetIdx !== -1) {
          const existing = catalogCopy[targetIdx];
          const updatedItem: CatalogItem = {
            ...existing,
            name: itemData.name || existing.name,
            type: itemData.type || existing.type,
            category: itemData.category || existing.category,
            barcode: itemData.barcode || existing.barcode,
            unit: itemData.unit || existing.unit,
            price: itemData.price > 0 ? itemData.price : existing.price,
            purchasePrice: itemData.purchasePrice > 0 ? itemData.purchasePrice : existing.purchasePrice,
            description: itemData.description || existing.description,
            status: itemData.status,
            insuranceRule: {
              isCovered: itemData.insuranceSupport,
              coveragePercentage: itemData.insurancePercentage || 0,
            },
            insuranceRules: itemData.insuranceProvider ? [
              {
                id: 'rule-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                providerName: itemData.insuranceProvider,
                coveragePercentage: itemData.insurancePercentage || 70,
                effectiveDate: nowIso.split('T')[0],
                status: 'ACTIVE',
              }
            ] : existing.insuranceRules,
            priceHistory: [
              {
                id: 'ph-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                salePrice: itemData.price > 0 ? itemData.price : existing.price,
                purchasePrice: itemData.purchasePrice > 0 ? itemData.purchasePrice : existing.purchasePrice,
                currency: 'تومان',
                effectiveDate: nowIso.split('T')[0],
                status: 'ACTIVE',
                createdAt: nowIso,
                createdBy: importedBy,
                notes: `بروزرسانی از طریق واردسازی فایل اکسل (${fileName})`,
              },
              ...(existing.priceHistory || []).map((p) => ({ ...p, status: 'INACTIVE' as const })),
            ],
          };
          catalogCopy[targetIdx] = updatedItem;
          itemsUpdated++;
        }
      } else if (rowVal.plannedAction === 'ADD' || rowVal.plannedAction === 'CREATE_COPY') {
        if (rowVal.plannedAction === 'CREATE_COPY') duplicatesFound++;

        const newItem: CatalogItem = {
          id: 'cat-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          clinicId,
          code: itemData.code,
          barcode: itemData.barcode,
          name: itemData.name,
          category: itemData.category,
          type: itemData.type,
          price: itemData.price,
          purchasePrice: itemData.purchasePrice,
          currency: 'تومان',
          effectiveDate: nowIso.split('T')[0],
          unit: itemData.unit,
          taxPercentage: 0,
          status: itemData.status,
          description: itemData.description,
          insuranceRule: {
            isCovered: itemData.insuranceSupport,
            coveragePercentage: itemData.insurancePercentage || 0,
          },
          insuranceRules: itemData.insuranceProvider ? [
            {
              id: 'rule-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
              providerName: itemData.insuranceProvider,
              coveragePercentage: itemData.insurancePercentage || 70,
              effectiveDate: nowIso.split('T')[0],
              status: 'ACTIVE',
            }
          ] : [],
          priceHistory: [
            {
              id: 'ph-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
              salePrice: itemData.price,
              purchasePrice: itemData.purchasePrice,
              currency: 'تومان',
              effectiveDate: nowIso.split('T')[0],
              status: 'ACTIVE',
              createdAt: nowIso,
              createdBy: importedBy,
              notes: `تعریف اولیه از فایل اکسل (${fileName})`,
            }
          ]
        };

        catalogCopy.unshift(newItem);
        itemsAdded++;
      }
    }

    // Save atomic update to Storage
    LocalStorageManager.saveCatalogItems(clinicId, catalogCopy);

    // Save Audit Log
    const auditLog: CatalogImportAuditLog = {
      id: 'audit-imp-' + Date.now(),
      importedBy,
      fileName,
      importTime: nowIso,
      result: errorsCount > 0 ? (itemsAdded > 0 || itemsUpdated > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
      rowsRead: validatedRows.length,
      itemsAdded,
      itemsUpdated,
      rowsSkipped,
      errorCount: errorsCount,
      warningCount: warningsCount,
      duplicateStrategy,
      details: `واردسازی موفق ${itemsAdded} کالا/خدمت جدید، بروزرسانی ${itemsUpdated} آیتم و صرف‌نظر از ${rowsSkipped} سطر.`
    };

    LocalStorageManager.saveCatalogImportAuditLog(auditLog);

    const summary: CatalogImportSummaryReport = {
      fileName,
      importedBy,
      timestamp: nowIso,
      rowsRead: validatedRows.length,
      itemsAdded,
      itemsUpdated,
      rowsSkipped,
      duplicatesFound,
      errorsCount,
      warningsCount,
      auditLogId: auditLog.id,
    };

    return {
      success: true,
      summary,
      updatedCatalog: catalogCopy,
    };

  } catch (err: any) {
    // Transaction Failure - Rollback Completely
    return {
      success: false,
      summary: {
        fileName,
        importedBy,
        timestamp: new Date().toISOString(),
        rowsRead: validatedRows.length,
        itemsAdded: 0,
        itemsUpdated: 0,
        rowsSkipped: 0,
        duplicatesFound: 0,
        errorsCount: validatedRows.length,
        warningsCount: 0,
        auditLogId: 'failed',
      },
      updatedCatalog: existingCatalog,
      error: `خطای تراکنش سیستم: ${err.message || 'واردسازی به صورت کامل برگشت داده شد (Rollback).'}`
    };
  }
}

/**
 * Download Standard Excel Template containing Persian and English Headers with sample rows
 */
export function generateExcelTemplate(): void {
  const templateData = [
    {
      'Services / Products Name': 'قرص لوزارتان ۵۰ میلی‌گرم',
      'Item Type': 'Medicine',
      'Category': 'دارویی',
      'Item Code': 'MED-101',
      'Barcode': '6260123456789',
      'Unit': 'جعبه',
      'Purchase Price': 45000,
      'Sale Price': 65000,
      'Description': 'داروی قلبی و فشار خون',
      'Status': 'فعال',
      'Insurance Provider': 'تأمین اجتماعی',
      'Insurance Coverage Percentage': 70,
    },
    {
      'Services / Products Name': 'ویزیت عمومی پزشک',
      'Item Type': 'Service',
      'Category': 'ویزیت',
      'Item Code': 'SRV-201',
      'Barcode': '',
      'Unit': 'خدمت',
      'Purchase Price': 0,
      'Sale Price': 180000,
      'Description': 'تعرفه مصوب هیئت وزیران',
      'Status': 'فعال',
      'Insurance Provider': 'بیمه سلامت',
      'Insurance Coverage Percentage': 70,
    },
    {
      'Services / Products Name': 'سرنگ ۱۰ سی‌سی',
      'Item Type': 'Consumable',
      'Category': 'اقلام مصرفی',
      'Item Code': 'CNS-301',
      'Barcode': '6269876543210',
      'Unit': 'عدد',
      'Purchase Price': 8000,
      'Sale Price': 12000,
      'Description': 'تجهیزات تزریقات سرپایی',
      'Status': 'فعال',
      'Insurance Provider': '',
      'Insurance Coverage Percentage': 0,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Auto-set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Name
    { wch: 15 }, // Type
    { wch: 18 }, // Category
    { wch: 15 }, // Code
    { wch: 18 }, // Barcode
    { wch: 10 }, // Unit
    { wch: 15 }, // Purchase Price
    { wch: 15 }, // Sale Price
    { wch: 25 }, // Description
    { wch: 10 }, // Status
    { wch: 20 }, // Insurance Provider
    { wch: 25 }, // Insurance Percentage
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب استاندارد کاتالوگ');

  XLSX.writeFile(workbook, 'VikiMedic_Catalog_Import_Template.xlsx');
}

/**
 * Export rejected/error rows into downloadable CSV
 */
export function exportRejectedRowsCSV(validatedRows: CatalogImportRowValidation[], fileName: string): void {
  const rejected = validatedRows.filter(
    (r) => r.validationStatus === 'INVALID' || r.plannedAction === 'REJECTED' || r.issues.length > 0
  );

  if (rejected.length === 0) {
    alert('هیچ سطر خطا یا ردی متناظری یافت نشد.');
    return;
  }

  const csvRows = rejected.map((r) => {
    return {
      'شماره سطر اکسل': r.rowIndex,
      'عنوان کالا/خدمت': r.mappedItem.name || '---',
      'کد آیتم': r.mappedItem.code || '---',
      'بارکد': r.mappedItem.barcode || '---',
      'نوع آیتم': r.mappedItem.type,
      'وضعیت اعتبار سنجی': r.validationStatus === 'INVALID' ? 'غیرمجاز (خطا)' : 'هشدار',
      'اقدام برنامه‌ریزی شده': r.plannedAction,
      'علت رد / اشکالات شناسایی شده': r.issues.join(' | '),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(csvRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سطور خطا و رد شده');

  XLSX.writeFile(workbook, `Import_Errors_${fileName.replace(/\.[^/.]+$/, '')}.xlsx`);
}
