/**
 * VikiMedic v2 - Shared Infrastructure Explorer & Validator Module
 * Clean Architecture Layer: Presentation
 *
 * Interactive module for testing:
 * - Persian Validation Framework (National ID, Mobile, Jalali Date)
 * - Global Event System (Pub/Sub topics, live event dispatcher & history)
 * - Central Service Container (Singletons status & version inspector)
 * - Universal Print Framework (80mm Receipt, A5 Prescription, A4 Invoice triggers)
 * - Medical File Attachment Infrastructure (Categorized upload & limits validator)
 */

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  Printer,
  Radio,
  FileCheck,
  Server,
  UploadCloud,
  FileText,
  Play,
  Send,
  Zap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import {
  validatePersianNationalId,
  validatePersianMobile,
  validateJalaliDate,
  ValidationResult,
  eventBus,
  AppEventType,
  AppEventPayload,
  serviceContainer,
  RegisteredServiceMeta,
  printEngine,
  PrintTemplateType,
  PrintJobOptions,
  fileManagerService,
  MedicalAttachmentCategory,
  FileAttachmentMeta,
} from '../../packages/shared';

export const SharedInfrastructureModule: React.FC = () => {
  const { addNotification } = useClinic();
  const [activeTab, setActiveTab] = useState<'validation' | 'events' | 'container' | 'print' | 'files'>('validation');

  // --- Validation State ---
  const [nationalIdInput, setNationalIdInput] = useState<string>('0012345679'); // Sample valid national ID
  const [nationalIdResult, setNationalIdResult] = useState<ValidationResult | null>(null);

  const [mobileInput, setMobileInput] = useState<string>('09123456789');
  const [mobileResult, setMobileResult] = useState<ValidationResult | null>(null);

  const [jalaliDateInput, setJalaliDateInput] = useState<string>('1403/05/15');
  const [jalaliDateResult, setJalaliDateResult] = useState<ValidationResult | null>(null);

  // --- Event Bus State ---
  const [eventTopic, setEventTopic] = useState<AppEventType>('PATIENT_CREATED');
  const [eventSource, setEventSource] = useState<string>('پذیرش درمانگاه');
  const [eventDataJson, setEventDataJson] = useState<string>('{\n  "patientId": "P-9801",\n  "fullName": "علیرضا احمدی",\n  "nationalId": "0012345679"\n}');
  const [eventLog, setEventLog] = useState<AppEventPayload<any>[]>(eventBus.getHistory());

  // Subscribe to event bus changes
  useEffect(() => {
    const unsub = eventBus.subscribe('PATIENT_CREATED', (e) => {
      setEventLog(eventBus.getHistory());
    });
    return () => unsub();
  }, []);

  const handlePublishEvent = () => {
    try {
      const parsedData = JSON.parse(eventDataJson);
      eventBus.publish(eventTopic, eventSource, parsedData);
      setEventLog(eventBus.getHistory());
      addNotification(`رویداد ${eventTopic} با موفقیت در Global Event Bus منتشر گردید.`, 'success');
    } catch (err) {
      addNotification('فرمت JSON داده‌های رویداد نامعتبر است.', 'error');
    }
  };

  // --- Service Container State ---
  const [servicesList, setServicesList] = useState<RegisteredServiceMeta[]>(serviceContainer.listRegisteredServices());

  // --- Print Engine State ---
  const [printTemplate, setPrintTemplate] = useState<PrintTemplateType>('THERMAL_RECEIPT_80MM');
  const [patientPrintName, setPatientPrintName] = useState<string>('مریم کریمی');
  const [printLogs, setPrintLogs] = useState<Array<{ jobId: string; template: string; printedAt: string }>>([]);

  const handleTriggerPrintJob = () => {
    const jobOptions: PrintJobOptions = {
      jobId: `PRINT-${Date.now()}`,
      templateType: printTemplate,
      patientName: patientPrintName,
      documentTitle: printTemplate === 'THERMAL_RECEIPT_80MM' ? 'رسید پرداخت صندوق' : 'نسخه دارو و دستورات پزشک',
      itemDetails: [
        { label: 'خدمت', value: 'ویزیت پزشک عمومی' },
        { label: 'مبلغ کل', value: '۱,۴۵۰,۰۰۰ ریال' },
      ],
      createdDateFA: '۱۴۰۳/۰۵/۱۵',
    };

    const res = printEngine.queueJob(jobOptions);
    setPrintLogs((prev) => [{ jobId: res.jobId, template: res.templateUsed, printedAt: res.printedAt }, ...prev]);
    addNotification(`دستور پرینت برای ${printTemplate} صادر گردید.`, 'info');
  };

  // --- File Manager State ---
  const [fileCat, setFileCat] = useState<MedicalAttachmentCategory>('RADIOLOGY_DICOM_XRAY');
  const [fileNameInput, setFileNameInput] = useState<string>('chest_xray_scan_01.dcm');
  const [fileSizeMB, setFileSizeMB] = useState<number>(12);
  const [attachmentsList, setAttachmentsList] = useState<FileAttachmentMeta[]>(fileManagerService.getAttachments());

  const handleRegisterFile = () => {
    const sizeBytes = fileSizeMB * 1024 * 1024;
    const valRes = fileManagerService.validateFile(fileNameInput, sizeBytes, fileCat);

    if (!valRes.valid) {
      addNotification(valRes.errorMessageFA || 'حجم فایل غیرمجاز است.', 'error');
      return;
    }

    const newMeta = fileManagerService.registerAttachment('P-9801', fileNameInput, sizeBytes, 'application/dicom', fileCat);
    setAttachmentsList(fileManagerService.getAttachments());
    addNotification(`فایل ${newMeta.fileName} با موفقیت در گروه ${fileCat} ثبت گردید.`, 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
              Phase 01.5 - Part 03
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              Shared Infrastructure Core
            </span>
          </div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-400" />
            <span>زیرساخت مشترک و سرویس‌های مرکزی (Shared Core Infrastructure)</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            کتابخانه عمومی اعتبارسنجی فارسی، گذرگاه رویدادهای عمومی (Event Bus)، کانتاینر سرویس‌ها، معماری خروجی چاپ و مدیریت پیوست‌های پزشکی.
          </p>
        </div>

        <div className="z-10 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-bold text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>۱۰۰٪ قابل استفاده مجدد در تمامی ماژول‌ها</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('validation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'validation' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>اعتبارسنجی فارسی (Validation Rules)</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'events' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>گذرگاه رویدادها (Global Event Bus)</span>
        </button>

        <button
          onClick={() => setActiveTab('container')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'container' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>کانتاینر سرویس‌ها (Service Registry)</span>
        </button>

        <button
          onClick={() => setActiveTab('print')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'print' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>معماری چاپ و فاکتور (Print Engine)</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'files' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>مدیریت فایل و مدارک (File Manager)</span>
        </button>
      </div>

      {/* Tab 1: Persian Validation */}
      {activeTab === 'validation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* National ID Validator */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-2">
              تست اعتبارسنجی کد ملی
            </h3>
            <div className="space-y-2">
              <label className="text-[var(--text-muted)] font-medium block">کد ملی ۱۰ رقمی:</label>
              <input
                type="text"
                maxLength={10}
                value={nationalIdInput}
                onChange={(e) => setNationalIdInput(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => setNationalIdResult(validatePersianNationalId(nationalIdInput))}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>ارزیابی الگوریتم ثبت احوال</span>
              </button>
            </div>

            {nationalIdResult && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2 ${
                  nationalIdResult.isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {nationalIdResult.isValid ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>
                  <span className="font-bold block">{nationalIdResult.isValid ? 'کد ملی معتبر است.' : 'کد ملی نامعتبر است.'}</span>
                  {nationalIdResult.errorMessageFA && <span className="text-[11px] leading-tight block mt-1">{nationalIdResult.errorMessageFA}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Validator */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-2">
              تست اعتبارسنجی شماره موبایل
            </h3>
            <div className="space-y-2">
              <label className="text-[var(--text-muted)] font-medium block">شماره موبایل (۱۱ رقم):</label>
              <input
                type="text"
                maxLength={11}
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => setMobileResult(validatePersianMobile(mobileInput))}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>بررسی فرمت اپراتورها</span>
              </button>
            </div>

            {mobileResult && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2 ${
                  mobileResult.isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {mobileResult.isValid ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>
                  <span className="font-bold block">{mobileResult.isValid ? 'شماره موبایل معتبر است.' : 'شماره موبایل نامعتبر است.'}</span>
                  {mobileResult.errorMessageFA && <span className="text-[11px] leading-tight block mt-1">{mobileResult.errorMessageFA}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Jalali Date Validator */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-2">
              تست اعتبارسنجی تاریخ شمسی
            </h3>
            <div className="space-y-2">
              <label className="text-[var(--text-muted)] font-medium block">تاریخ شمسی (YYYY/MM/DD):</label>
              <input
                type="text"
                value={jalaliDateInput}
                onChange={(e) => setJalaliDateInput(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => setJalaliDateResult(validateJalaliDate(jalaliDateInput))}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>ارزیابی تقویم جلالی</span>
              </button>
            </div>

            {jalaliDateResult && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2 ${
                  jalaliDateResult.isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {jalaliDateResult.isValid ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>
                  <span className="font-bold block">{jalaliDateResult.isValid ? 'تاریخ شمسی معتبر است.' : 'تاریخ شمسی نامعتبر است.'}</span>
                  {jalaliDateResult.errorMessageFA && <span className="text-[11px] leading-tight block mt-1">{jalaliDateResult.errorMessageFA}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Global Event Bus */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Dispatch Event Panel */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              <span>انتشار رویداد جدید (Publish Event)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">موضوع رویداد (Event Topic):</label>
                <select
                  value={eventTopic}
                  onChange={(e) => setEventTopic(e.target.value as AppEventType)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)] focus:outline-none"
                >
                  <option value="PATIENT_CREATED">PATIENT_CREATED (ایجاد بیمار جدید)</option>
                  <option value="PATIENT_UPDATED">PATIENT_UPDATED (ویرایش پرونده)</option>
                  <option value="APPOINTMENT_SCHEDULED">APPOINTMENT_SCHEDULED (ثبت نوبت)</option>
                  <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED (پرداخت وجه)</option>
                  <option value="THEME_CHANGED">THEME_CHANGED (تغییر پوسته)</option>
                  <option value="SETTINGS_UPDATED">SETTINGS_UPDATED (بروزرسانی تنظیمات)</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">ماژول مبدأ (Source Module):</label>
                <input
                  type="text"
                  value={eventSource}
                  onChange={(e) => setEventSource(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">محتوای رویداد (JSON Payload):</label>
                <textarea
                  rows={4}
                  value={eventDataJson}
                  onChange={(e) => setEventDataJson(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)] font-mono"
                />
              </div>

              <button
                onClick={handlePublishEvent}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                <Send className="w-4 h-4" />
                <span>انتشار رویداد در Event Bus</span>
              </button>
            </div>
          </div>

          {/* Event Stream History */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[var(--text-main)]">تاریخچه رویدادهای منتشرشده</h3>
              <span className="font-mono text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg font-bold">
                {eventLog.length} رویداد
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 font-mono max-h-80 overflow-y-auto text-[11px]">
              {eventLog.length === 0 ? (
                <div className="text-slate-500 text-center py-8">هیچ رویدادی صادر نشده است.</div>
              ) : (
                eventLog.map((ev, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-indigo-400 font-bold">{ev.type}</span>
                      <span className="text-slate-500">{new Date(ev.timestamp).toLocaleTimeString('fa-IR')}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">مبدأ: {ev.sourceModule}</div>
                    <pre className="text-[10px] text-emerald-400 overflow-x-auto p-1 bg-slate-950 rounded">
                      {JSON.stringify(ev.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Service Container */}
      {activeTab === 'container' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)]">سرویس‌های ثبت‌شده در Service Container</h3>
              <p className="text-[var(--text-muted)]">سیستم متمرکز Service Locator برای دسترسی یکپارچه به سرویس‌های دامنه‌ای.</p>
            </div>
            <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
              ۶ سرویس سینگلتون فعال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map((srv) => (
              <div key={srv.key} className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-main)]">{srv.nameFA}</span>
                  <span className="font-mono text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold">
                    v{srv.version}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400">کلید کانتینر: {srv.key}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{srv.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Print Infrastructure */}
      {activeTab === 'print' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Print Job Launcher */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-400" />
              <span>ارسال دستور چاپ جدید (Print Engine Trigger)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">قالب چاپ (Print Template):</label>
                <select
                  value={printTemplate}
                  onChange={(e) => setPrintTemplate(e.target.value as PrintTemplateType)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)] focus:outline-none"
                >
                  <option value="THERMAL_RECEIPT_80MM">پرینتر حرارتی صندوق (Thermal 80mm)</option>
                  <option value="PRESCRIPTION_A5">دفترچه و نسخه پزشک (Prescription A5)</option>
                  <option value="OFFICIAL_INVOICE_A4">صورتحساب رسمی بیمه (Official Invoice A4)</option>
                  <option value="MEDICAL_CERTIFICATE_A4">گواهی پزشکی و استعلاجی (Certificate A4)</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">نام بیمار روی قبض/نسخه:</label>
                <input
                  type="text"
                  value={patientPrintName}
                  onChange={(e) => setPatientPrintName(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)]"
                />
              </div>

              <button
                onClick={handleTriggerPrintJob}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>صدور دستور چاپ شبیه‌سازی‌شده</span>
              </button>
            </div>
          </div>

          {/* Print Queue Logs */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-[var(--text-main)]">صف پرینت‌های صادر شده</h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono max-h-72 overflow-y-auto text-[11px]">
              {printLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">صف چاپ خالی است.</div>
              ) : (
                printLogs.map((p, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-indigo-400 font-bold block">{p.jobId}</span>
                      <span className="text-slate-400 text-[10px]">قالب: {p.template}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-bold">{p.printedAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: File Manager */}
      {activeTab === 'files' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-6 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)]">ثبت و رده‌بندی فایل‌ها و مدارک پزشکی</h3>
              <p className="text-[var(--text-muted)]">کنترل حجم مجاز بر اساس گروه فایل و محاسبه الگوریتم چک‌سام SHA256.</p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <div>
              <label className="text-[var(--text-muted)] font-bold block mb-1">رده مدرک پزشکی:</label>
              <select
                value={fileCat}
                onChange={(e) => setFileCat(e.target.value as MedicalAttachmentCategory)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)]"
              >
                <option value="RADIOLOGY_DICOM_XRAY">تصاویر رادیولوژی DICOM (حداکثر ۵۰MB)</option>
                <option value="MEDICAL_LAB_RESULTS">نتایج آزمایشگاه (حداکثر ۱۰MB)</option>
                <option value="ID_CARDS_INSURANCE">کارت ملی و دفترچه بیمه (حداکثر ۵MB)</option>
                <option value="CONSENT_FORMS">رضایت‌نامه بیمار (حداکثر ۵MB)</option>
              </select>
            </div>

            <div>
              <label className="text-[var(--text-muted)] font-bold block mb-1">نام فایل:</label>
              <input
                type="text"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="text-[var(--text-muted)] font-bold block mb-1">حجم فایل (مگابایت):</label>
              <input
                type="number"
                value={fileSizeMB}
                onChange={(e) => setFileSizeMB(Number(e.target.value))}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] p-2 rounded-xl text-xs text-[var(--text-main)]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRegisterFile}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                <UploadCloud className="w-4 h-4" />
                <span>ارزیابی و ثبت فایل</span>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--text-main)]">فهرست پیوست‌های ثبت‌شده:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachmentsList.map((file) => (
                <div key={file.id} className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400">{file.fileName}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {Math.round((file.fileSizeBytes / (1024 * 1024)) * 10) / 10} MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>گروه: {file.category}</span>
                    <span className="font-mono text-[10px] text-emerald-400">{file.checksumSha256}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
