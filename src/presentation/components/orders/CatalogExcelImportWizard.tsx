/**
 * VikiMedic v2 - Catalog Excel Import Wizard Modal
 * Patch 05: Excel Import, Column Mapping, Validation, Preview & Audit Log
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Settings,
  HelpCircle,
  FileCheck,
  RefreshCw,
  ShieldCheck,
  FileText,
  History,
  Info,
  ListFilter,
  Check,
  Layers,
  Copy,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import {
  CatalogItemType,
  CatalogTargetField,
  CatalogDuplicateStrategy,
  CatalogImportRowValidation,
  CatalogImportSummaryReport,
  CatalogImportAuditLog,
} from '../../../domain/types';
import { LocalStorageManager } from '../../../infrastructure/storage';
import {
  TARGET_FIELD_DEFINITIONS,
  matchHeaderToField,
  parseExcelFile,
  validateImportRows,
  executeCatalogImport,
  generateExcelTemplate,
  exportRejectedRowsCSV,
} from '../../../infrastructure/catalogImportService';

interface CatalogExcelImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted?: () => void;
}

type WizardStep = 'FILE' | 'MAPPING' | 'VALIDATION_CONFIG' | 'PREVIEW' | 'REPORT' | 'AUDIT_LOGS';

export const CatalogExcelImportWizard: React.FC<CatalogExcelImportWizardProps> = ({
  isOpen,
  onClose,
  onImportCompleted,
}) => {
  const { catalogItems, activeClinicId, addNotification, refreshClinicData } = useClinic();
  const { activeUser } = useAuth();

  const [currentStep, setCurrentStep] = useState<WizardStep>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // File Parse Result State
  const [sourceHeaders, setSourceHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // Step 2 & 3: Mapping & Item Type State
  const [columnMapping, setColumnMapping] = useState<Record<string, CatalogTargetField>>({});
  const [defaultItemType, setDefaultItemType] = useState<CatalogItemType>('MEDICAL_SERVICE');

  // Step 4: Duplicate Strategy
  const [duplicateStrategy, setDuplicateStrategy] = useState<CatalogDuplicateStrategy>('SKIP');

  // Step 5: Validation Results State
  const [validatedRows, setValidatedRows] = useState<CatalogImportRowValidation[]>([]);
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'VALID' | 'WARNING' | 'INVALID'>('ALL');

  // Step 6 & 7: Final Execution & Report
  const [isExecuting, setIsExecuting] = useState(false);
  const [importSummary, setImportSummary] = useState<CatalogImportSummaryReport | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);

  // Audit Logs Modal Sub-view
  const [auditLogs, setAuditLogs] = useState<CatalogImportAuditLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAuditLogs(LocalStorageManager.getCatalogImportAuditLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handler for File Selection
  const handleFileChange = async (file: File) => {
    setParseError(null);
    setSelectedFile(file);
    setIsParsing(true);

    try {
      const result = await parseExcelFile(file);
      setSourceHeaders(result.headers);
      setRawRows(result.rawRows);

      // Smart Header Matching
      const initialMapping: Record<string, CatalogTargetField> = {};
      result.headers.forEach((hdr) => {
        initialMapping[hdr] = matchHeaderToField(hdr);
      });

      setColumnMapping(initialMapping);
      setIsParsing(false);
      setCurrentStep('MAPPING');
    } catch (err: any) {
      setIsParsing(false);
      setParseError(err.message || 'خطا در پردازش فایل اکسل.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Check if Required Target Field is Mapped
  const isNameMapped = Object.values(columnMapping).includes('name');

  const handleProceedToValidation = () => {
    if (!isNameMapped) {
      setParseError('نگاشت «نام کالا / خدمت (Services / Products Name)» الزامی است. لطفاً حداقل یک ستون را به عنوان نام انتخاب کنید.');
      return;
    }
    setParseError(null);
    setCurrentStep('VALIDATION_CONFIG');
  };

  // Run Data Validation & Prepare Preview
  const handleRunValidation = () => {
    const validations = validateImportRows(
      rawRows,
      columnMapping,
      defaultItemType,
      catalogItems,
      duplicateStrategy
    );
    setValidatedRows(validations);
    setCurrentStep('PREVIEW');
  };

  // Execute Final Import Transaction
  const handleConfirmImport = () => {
    setIsExecuting(true);
    setImportErrorMessage(null);

    const userName = activeUser?.fullName || 'مدیر سیستم (کاربر مجاز)';
    const fileName = selectedFile?.name || 'کاتالوگ_اکسل.xlsx';

    const result = executeCatalogImport(
      activeClinicId,
      userName,
      fileName,
      validatedRows,
      catalogItems,
      duplicateStrategy
    );

    setIsExecuting(false);

    if (result.success) {
      setImportSummary(result.summary);
      setCurrentStep('REPORT');
      refreshClinicData();
      if (onImportCompleted) onImportCompleted();
      addNotification(`واردسازی کاتالوگ با موفقیت انجام شد: ${result.summary.itemsAdded} اضافه، ${result.summary.itemsUpdated} بروزرسانی.`, 'success');
    } else {
      setImportErrorMessage(result.error || 'خطای تراکنش واردسازی. هیچ تغییری اعمال نشد.');
    }
  };

  // Stats for Validation Preview
  const totalRowsCount = validatedRows.length;
  const validRowsCount = validatedRows.filter((r) => r.validationStatus === 'VALID').length;
  const warningRowsCount = validatedRows.filter((r) => r.validationStatus === 'WARNING').length;
  const invalidRowsCount = validatedRows.filter((r) => r.validationStatus === 'INVALID').length;

  const filteredPreviewRows = validatedRows.filter((r) => {
    if (previewFilter === 'VALID') return r.validationStatus === 'VALID';
    if (previewFilter === 'WARNING') return r.validationStatus === 'WARNING';
    if (previewFilter === 'INVALID') return r.validationStatus === 'INVALID';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[5000] z-modal-backdrop bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200 dir-rtl">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col w-full max-w-5xl max-h-[90vh] overflow-hidden text-[var(--text-main)] z-[5010] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-slate-50">
                  سامانه هوشمند واردسازی کاتالوگ از اکسل (Excel Import Wizard)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Patch 05 - آفلاین
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تأیید صلاحیت، نگاشت هوشمند ستون‌ها، بررسی هم‌نامی و تکراری، پیش‌نمایش و ثبت در یک تراکنش امن
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAuditLogs(LocalStorageManager.getCatalogImportAuditLogs());
                setCurrentStep('AUDIT_LOGS');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>سوابق واردسازی (Audit Log)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs overflow-x-auto shrink-0">
          <div className={`flex items-center gap-2 ${currentStep === 'FILE' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">۱</span>
            <span>انتخاب فایل</span>
          </div>
          <ArrowLeft className="w-3.5 h-3.5 text-slate-700 shrink-0" />

          <div className={`flex items-center gap-2 ${currentStep === 'MAPPING' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">۲</span>
            <span>نگاشت ستون‌ها</span>
          </div>
          <ArrowLeft className="w-3.5 h-3.5 text-slate-700 shrink-0" />

          <div className={`flex items-center gap-2 ${currentStep === 'VALIDATION_CONFIG' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">۳</span>
            <span>استراتژی تکرار</span>
          </div>
          <ArrowLeft className="w-3.5 h-3.5 text-slate-700 shrink-0" />

          <div className={`flex items-center gap-2 ${currentStep === 'PREVIEW' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">۴</span>
            <span>پیش‌نمایش تغییرات</span>
          </div>
          <ArrowLeft className="w-3.5 h-3.5 text-slate-700 shrink-0" />

          <div className={`flex items-center gap-2 ${currentStep === 'REPORT' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">۵</span>
            <span>گزارش نهایی</span>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">

          {parseError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs flex items-start gap-2.5 font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{parseError}</div>
            </div>
          )}

          {/* STEP 1: SELECT FILE */}
          {currentStep === 'FILE' && (
            <div className="space-y-6">
              
              {/* Authorized User Alert */}
              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>کاربر مجاز ثبت: <strong className="font-bold">{activeUser?.fullName || 'کاربر سیستم'}</strong> ({activeUser?.role || 'دسترسی مدیریت کاتالوگ'})</span>
                </div>
                <button
                  type="button"
                  onClick={generateExcelTemplate}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود قالب استاندارد اکسل (Template)</span>
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 bg-sky-50/40 dark:bg-slate-900/40 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all space-y-4 group"
              >
                <div className="p-4 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                    فایل اکسل یا CSV کاتالوگ را اینجا رها کنید
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    پشتیبانی از فرمت‌های معتبر <strong className="font-mono text-sky-600 dark:text-sky-400">.xlsx</strong>, <strong className="font-mono text-sky-600 dark:text-sky-400">.xls</strong> و <strong className="font-mono text-sky-600 dark:text-sky-400">.csv</strong>
                  </p>
                </div>

                <label className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all">
                  <span>انتخاب فایل از رایانه</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Instructions Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>راهنمای ساختار فایل اکسل واردسازی:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>سطر اول فایل باید حاوی عناوین ستون‌ها (Headers) باشد.</li>
                  <li>عناوین فارسی متداول مانند «کالا»، «قیمت فروش»، «قیمت خرید»، «نوع»، «بارکد» به صورت خودکار شناسایی می‌شوند.</li>
                  <li>اقلام تکراری بر اساس کد، بارکد یا عنوان در مراحل بعدی کنترل می‌شوند.</li>
                  <li>عملیات به صورت کاملاً آفلاین در مرورگر شما انجام می‌شود و اطلاعات ایمن باقی می‌ماند.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {currentStep === 'MAPPING' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-sky-900 dark:text-sky-200 block">
                    فایل شناسایی شد: {selectedFile?.name} ({rawRows.length.toLocaleString('fa-IR')} سطر داده)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    سیستم به صورت خودکار سرستون‌های مشابه را نگاشت کرده است. در صورت نیاز تغییر دهید.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    نوع پیش‌فرض (در صورت عدم درج در سطر):
                  </label>
                  <select
                    value={defaultItemType}
                    onChange={(e) => setDefaultItemType(e.target.value as CatalogItemType)}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="MEDICAL_SERVICE">خدمت درمانی (Service)</option>
                    <option value="MEDICINE">دارو (Medicine)</option>
                    <option value="PRODUCT">کالا / تجهیزات (Product)</option>
                    <option value="CONSUMABLE">اقلام مصرفی (Consumable)</option>
                    <option value="DOCTOR_VISIT">ویزیت پزشک (Doctor Visit)</option>
                    <option value="LAB_SERVICE">آزمایشگاه (Lab)</option>
                    <option value="RADIOLOGY_SERVICE">رادیولوژی (Radiology)</option>
                  </select>
                </div>
              </div>

              {/* Column Mapping Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">عنوان ستون در فایل اکسل شما</th>
                      <th className="p-3">نمونه مقدار در سطر اول</th>
                      <th className="p-3">فیلد مقصد متناظر در کاتالوگ VikiMedic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {sourceHeaders.map((header, idx) => {
                      const sampleVal = rawRows[0] ? String(rawRows[0][header] || '') : '---';
                      const currentMappedField = columnMapping[header] || 'IGNORE';
                      const targetDef = TARGET_FIELD_DEFINITIONS.find((t) => t.key === currentMappedField);

                      return (
                        <tr key={header} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{header}</td>
                          <td className="p-3 font-mono text-slate-500 truncate max-w-xs">{sampleVal || '---'}</td>
                          <td className="p-3">
                            <select
                              value={currentMappedField}
                              onChange={(e) => {
                                const newTarget = e.target.value as CatalogTargetField;
                                setColumnMapping((prev) => ({ ...prev, [header]: newTarget }));
                              }}
                              className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                targetDef?.required
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                                  : currentMappedField !== 'IGNORE'
                                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 text-sky-900 dark:text-sky-200'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                              }`}
                            >
                              <option value="IGNORE">--- نادیده گرفتن ستون (Do Not Import) ---</option>
                              {TARGET_FIELD_DEFINITIONS.map((def) => (
                                <option key={def.key} value={def.key}>
                                  {def.labelPersian} ({def.labelEnglish}) {def.required ? ' * الزامی' : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: DUPLICATE STRATEGY CONFIGURATION */}
          {currentStep === 'VALIDATION_CONFIG' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold block text-sm">تعیین استراتژی برخورد با اقلام تکراری (Duplicate Strategy):</span>
                  <p>
                    در صورتی که کد اختصاصی، بارکد IRC یا عنوان مشابه با اقلام فعلی کاتالوگ در فایل اکسل یافت شود، نحوه اقدام سیستم را انتخاب کنید:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* STRATEGY 1: SKIP */}
                <div
                  onClick={() => setDuplicateStrategy('SKIP')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                    duplicateStrategy === 'SKIP'
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">۱. صرف‌نظر کردن (Skip)</span>
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'SKIP'}
                      onChange={() => setDuplicateStrategy('SKIP')}
                      className="w-4 h-4 text-sky-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    اطلاعات آیتم تکراری در فایل اکسل نادیده گرفته شده و آیتم موجود در کاتالوگ دست‌نخورده باقی می‌ماند.
                  </p>
                </div>

                {/* STRATEGY 2: UPDATE */}
                <div
                  onClick={() => setDuplicateStrategy('UPDATE')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                    duplicateStrategy === 'UPDATE'
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">۲. بروزرسانی قبلی (Update Existing)</span>
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'UPDATE'}
                      onChange={() => setDuplicateStrategy('UPDATE')}
                      className="w-4 h-4 text-sky-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    مقادیر جدید تعرفه، قیمت خرید و مشخصات از اکسل جایگزین آیتم تکراری فعلی کاتالوگ می‌گردد.
                  </p>
                </div>

                {/* STRATEGY 3: CREATE COPY */}
                <div
                  onClick={() => setDuplicateStrategy('CREATE_COPY')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                    duplicateStrategy === 'CREATE_COPY'
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">۳. ایجاد نسخه جدید (Create Copy)</span>
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'CREATE_COPY'}
                      onChange={() => setDuplicateStrategy('CREATE_COPY')}
                      className="w-4 h-4 text-sky-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    یک پسوند مجزا به کد اختصاصی اضافه شده و آیتم به عنوان یک کالا/خدمت جدید در کاتالوگ درج می‌شود.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW CHANGES */}
          {currentStep === 'PREVIEW' && (
            <div className="space-y-4">
              
              {/* Stats Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-slate-500 block text-[10px]">کل سطور فایل</span>
                  <span className="font-bold text-base font-mono">{totalRowsCount.toLocaleString('fa-IR')}</span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-center">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[10px]">سطور معتبر (Valid)</span>
                  <span className="font-bold text-base font-mono text-emerald-800 dark:text-emerald-300">{validRowsCount.toLocaleString('fa-IR')}</span>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl text-center">
                  <span className="text-amber-700 dark:text-amber-400 block text-[10px]">هشدار / تکراری (Warning)</span>
                  <span className="font-bold text-base font-mono text-amber-800 dark:text-amber-300">{warningRowsCount.toLocaleString('fa-IR')}</span>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-center">
                  <span className="text-rose-700 dark:text-rose-400 block text-[10px]">خطا و غیرمجاز (Invalid)</span>
                  <span className="font-bold text-base font-mono text-rose-800 dark:text-rose-300">{invalidRowsCount.toLocaleString('fa-IR')}</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('ALL')}
                    className={`px-3 py-1 rounded-xl transition ${previewFilter === 'ALL' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    همه ({validatedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('VALID')}
                    className={`px-3 py-1 rounded-xl transition ${previewFilter === 'VALID' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    معتبر ({validRowsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('WARNING')}
                    className={`px-3 py-1 rounded-xl transition ${previewFilter === 'WARNING' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    هشدار ({warningRowsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('INVALID')}
                    className={`px-3 py-1 rounded-xl transition ${previewFilter === 'INVALID' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    غیرمجاز ({invalidRowsCount})
                  </button>
                </div>

                {invalidRowsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => exportRejectedRowsCSV(validatedRows, selectedFile?.name || 'کاتالوگ.xlsx')}
                    className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>خروجی فایل سطور خطا</span>
                  </button>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5 text-center w-12">سطر</th>
                      <th className="p-2.5">عنوان نهایی</th>
                      <th className="p-2.5">نوع</th>
                      <th className="p-2.5">کد اختصاصی</th>
                      <th className="p-2.5">تعرفه فروش</th>
                      <th className="p-2.5">قیمت خرید</th>
                      <th className="p-2.5">اقدام برنامه‌ریزی شده</th>
                      <th className="p-2.5">وضعیت و توضیحات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredPreviewRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          هیچ سطری متناظر با فیلتر انتخابی یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      filteredPreviewRows.map((r) => {
                        const m = r.mappedItem;
                        return (
                          <tr key={r.rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-center font-mono text-slate-400">{r.rowIndex}</td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{m.name || '---'}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 rounded">
                                {m.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono">{m.code}</td>
                            <td className="p-2.5 font-mono text-emerald-600 font-bold">{m.price.toLocaleString('fa-IR')}</td>
                            <td className="p-2.5 font-mono text-amber-600">{m.purchasePrice ? m.purchasePrice.toLocaleString('fa-IR') : '---'}</td>
                            <td className="p-2.5">
                              {r.plannedAction === 'ADD' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">افزودن جدید</span>
                              )}
                              {r.plannedAction === 'UPDATE' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-md">بروزرسانی</span>
                              )}
                              {r.plannedAction === 'SKIP' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-md">صرف‌نظر</span>
                              )}
                              {r.plannedAction === 'CREATE_COPY' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-md">نسخه جدید</span>
                              )}
                              {r.plannedAction === 'REJECTED' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-md">رد شده</span>
                              )}
                            </td>
                            <td className="p-2.5 text-[11px]">
                              {r.issues.length > 0 ? (
                                <span className={r.validationStatus === 'INVALID' ? 'text-rose-600 font-medium' : 'text-amber-600'}>
                                  {r.issues.join(' | ')}
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-medium">آماده ثبت کامل</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: FINAL REPORT */}
          {currentStep === 'REPORT' && importSummary && (
            <div className="space-y-6 text-xs">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-emerald-900 dark:text-emerald-200">
                  <h3 className="font-bold text-sm">واردسازی کاتالوگ با موفقیت به پایان رسید</h3>
                  <p className="text-xs opacity-90">
                    تغییرات به صورت یکپارچه در پایگاه داده کاتالوگ ثبت گردید و تمام آیتم‌های جدید بلافاصله در سیستم پذیرش، سفارشات درمانی و صدور فاکتور قابل انتخاب می‌باشند.
                  </p>
                </div>
              </div>

              {/* Summary Dashboard Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <span className="text-slate-500 block text-[11px] mb-1">سطور خوانده شده</span>
                  <span className="font-bold text-lg font-mono text-slate-900 dark:text-slate-100">{importSummary.rowsRead.toLocaleString('fa-IR')}</span>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] mb-1">آیتم‌های جدید افزوده شده</span>
                  <span className="font-bold text-lg font-mono text-emerald-800 dark:text-emerald-200">{importSummary.itemsAdded.toLocaleString('fa-IR')}</span>
                </div>

                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl text-center">
                  <span className="text-sky-700 dark:text-sky-400 block text-[11px] mb-1">آیتم‌های بروزرسانی شده</span>
                  <span className="font-bold text-lg font-mono text-sky-800 dark:text-sky-200">{importSummary.itemsUpdated.toLocaleString('fa-IR')}</span>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                  <span className="text-slate-500 block text-[11px] mb-1">سطور صرف‌نظر شده</span>
                  <span className="font-bold text-lg font-mono text-slate-700 dark:text-slate-300">{importSummary.rowsSkipped.toLocaleString('fa-IR')}</span>
                </div>
              </div>

              {/* Audit Details Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">اطلاعات حسابرسی و ثبت سیستم (Audit Log):</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400">
                  <span>ثبت‌کننده: <strong>{importSummary.importedBy}</strong></span>
                  <span>نام فایل: <strong>{importSummary.fileName}</strong></span>
                  <span>زمان ثبت: <strong>{new Date(importSummary.timestamp).toLocaleString('fa-IR')}</strong></span>
                </div>
              </div>

              {importSummary.errorsCount > 0 && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 rounded-2xl flex items-center justify-between">
                  <span className="text-rose-800 font-medium">تعداد {importSummary.errorsCount} سطر به دلیل اشکال ساختاری رد شدند.</span>
                  <button
                    type="button"
                    onClick={() => exportRejectedRowsCSV(validatedRows, selectedFile?.name || 'کاتالوگ.xlsx')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود گزارش سطور رد شده</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AUDIT LOGS SUB-VIEW */}
          {currentStep === 'AUDIT_LOGS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-600" />
                  <span>تاریخچه حسابرسی واردسازی کاتالوگ (Import Audit Trail)</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setCurrentStep('FILE')}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl"
                >
                  بازگشت به واردسازی جدید
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b">
                    <tr>
                      <th className="p-3">زمان ثبت</th>
                      <th className="p-3">ثبت‌کننده</th>
                      <th className="p-3">نام فایل</th>
                      <th className="p-3">افزوده شده</th>
                      <th className="p-3">بروزرسانی</th>
                      <th className="p-3">صرف‌نظر</th>
                      <th className="p-3">نتیجه</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          هیچ سابقه واردسازی در سیستم ثبت نشده است.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-slate-500">{new Date(log.importTime).toLocaleString('fa-IR')}</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{log.importedBy}</td>
                          <td className="p-3 font-mono">{log.fileName}</td>
                          <td className="p-3 font-bold text-emerald-600">{log.itemsAdded}</td>
                          <td className="p-3 font-bold text-sky-600">{log.itemsUpdated}</td>
                          <td className="p-3 font-mono text-slate-500">{log.rowsSkipped}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                              log.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {log.result === 'SUCCESS' ? 'موفق' : 'جزئی / با خطا'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          
          {currentStep === 'FILE' && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
            >
              انصراف
            </button>
          )}

          {currentStep === 'MAPPING' && (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('FILE')}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
              >
                بازگشت
              </button>

              <button
                type="button"
                onClick={handleProceedToValidation}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <span>مرحله بعدی (استراتژی تکراری)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </>
          )}

          {currentStep === 'VALIDATION_CONFIG' && (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('MAPPING')}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
              >
                بازگشت
              </button>

              <button
                type="button"
                onClick={handleRunValidation}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <span>بررسی اعتبار و ساخت پیش‌نمایش</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </>
          )}

          {currentStep === 'PREVIEW' && (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('VALIDATION_CONFIG')}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
              >
                بازگشت
              </button>

              <button
                type="button"
                disabled={isExecuting || (validRowsCount === 0 && warningRowsCount === 0)}
                onClick={handleConfirmImport}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال واردسازی در پایگاه داده...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأیید نهایی و واردسازی به کاتالوگ</span>
                  </>
                )}
              </button>
            </>
          )}

          {currentStep === 'REPORT' && (
            <div className="flex items-center justify-end w-full">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow transition"
              >
                بستن و مشاهده در کاتالوگ
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
