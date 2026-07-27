/**
 * VikiMedic v2 - AI Development Rules & Refactoring Guards Explorer Module
 * Clean Architecture Layer: Presentation
 *
 * Interactive module displaying AI Development Rules, Impact Analysis Checklists,
 * Refactoring Guards, Offline Core Independence Guarantee, and Phase 01 Completion Changelog.
 */

import React, { useState } from 'react';
import {
  Bot,
  ShieldAlert,
  Database,
  Sparkles,
  Cpu,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Workflow,
  WifiOff,
  Lock,
  Layers,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';

export const AiRulesModule: React.FC = () => {
  const { addNotification } = useClinic();
  const [activeTab, setActiveTab] = useState<'mission' | 'workflow' | 'guards' | 'offline' | 'changelog'>('mission');

  // Interactive Impact Analysis Simulator State
  const [impactModule, setImpactModule] = useState('RECEPTION');
  const [impactChangeType, setImpactChangeType] = useState('SCHEMA_UPDATE');
  const [simulatedRisk, setSimulatedRisk] = useState<{
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    warnings: string[];
    guarantees: string[];
  }>({
    level: 'MEDIUM',
    warnings: ['احتمال تغییر فرمت داده نوبت‌دهی آفلاین', 'نیازمند به‌روزرسانی کش محلی BaseRepository'],
    guarantees: ['عدم ایجاد وابستگی زمان اجرا به هوش مصنوعی', 'عملکرد کامل پذیرش در حالت قطع اینترنت'],
  });

  const handleSimulateImpact = (module: string, change: string) => {
    setImpactModule(module);
    setImpactChangeType(change);

    if (change === 'ADD_UI_CONTROL') {
      setSimulatedRisk({
        level: 'LOW',
        warnings: ['اطمینان از مصرف DESIGN_TOKENS برای رنگ و فونت'],
        guarantees: ['پشتیبانی کامل از راست‌به‌چپ (RTL)', 'سازگاری با تم‌های سه‌گانه سیستم'],
      });
    } else if (change === 'SCHEMA_UPDATE') {
      setSimulatedRisk({
        level: 'MEDIUM',
        warnings: ['بررسی سازگاری فیلدهای جدید با داده‌های کش‌شده محلی', 'تست متدهای validation در PatientRepository'],
        guarantees: ['عدم حذف جداول یا فیلدهای موجود', 'حفظ کامل داده‌های آفلاین'],
      });
    } else {
      setSimulatedRisk({
        level: 'HIGH',
        warnings: ['هشدار: دستکاری منطق تسویه مالی یا محاسبات تخفیف', 'نیاز به تست کامل محاسبات ریاضی و تایید کاربر'],
        guarantees: ['محاسبات بدون وابستگی به APIهای ابری انجام می‌شود', 'ثبت تمامی تغییرات در Structured Logger'],
      });
    }

    addNotification(`تحلیل اثرات تغییر بر روی ماژول ${module} انجام شد.`, 'info');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
              Phase 01 - Part 04
            </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              AI Development Rules & Refactoring Guard
            </span>
          </div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            <span>قوانین توسعه دستیار هوش مصنوعی و گارد‌های محافظ (AI Rules & Protection Guards)</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            قوانین حاکم بر توسعه با AI: عدم ایجاد وابستگی زمان اجرا، عملکرد ۱۰۰٪ آفلاین نرم‌افزار، تحلیل اثرات تغییرات و محافظت از دیزاین سیستم و دیتابیس.
          </p>
        </div>

        <div className="z-10 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-emerald-400" />
          <span>تضمین عملکرد ۱۰۰٪ آفلاین بدون AI</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'mission' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>ماموریت و نقش AI</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'workflow' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>چرخه توسعه و تحلیل اثرات</span>
        </button>

        <button
          onClick={() => setActiveTab('guards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'guards' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>گاردهای محافظت (Refactoring Guards)</span>
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'offline' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>استقلال ۱۰۰٪ آفلاین</span>
        </button>

        <button
          onClick={() => setActiveTab('changelog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'changelog' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>چنج‌لوگ فاز ۱ (Phase 01 Changelog)</span>
        </button>
      </div>

      {/* Tab 1: AI Role & Mission */}
      {activeTab === 'mission' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">دستیار زمان توسعه (Development Assistant)</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                هوش مصنوعی صرفاً یک دستیار کدنویسی در زمان ساخت (Build-Time) است و هیچ‌گونه کد وابسته به سرویس‌های ابری در زمان اجرا (Runtime) وارد نرم‌افزار نمی‌کند.
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">استقلال مطلق از اینترنت و AI</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                تمام ماژول‌های پذیرش، پرونده بیماران، نوبت‌دهی، صندوق مالی، داروخانه، گزارشات و تنظیمات ۱۰۰٪ بدون نیاز به اینترنت و هوش مصنوعی کار می‌کنند.
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">تفکر معماری قبل از تغییر</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                هوش مصنوعی قبل از ایجاد هر تغییر، معماری ۴ لایه‌ای Clean Architecture، دیزاین سیستم و ساختار دیتابیس را تحلیل و ارزیابی می‌کند.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workflow & Impact Analysis */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          {/* 8 Step Loop */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-400" />
              <span>چرخه ۸ مرحله‌ای اجرای تغییرات توسط AI</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۱: تحلیل (Analyze)</span>
                <p className="text-[var(--text-muted)]">درک دقیق خواسته‌های کاربر و تعیین حدود دامنه تغییر.</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۲: بررسی معماری</span>
                <p className="text-[var(--text-muted)]">تطبیق با مرز لایه‌های Clean Architecture.</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۳: بررسی وابستگی‌ها</span>
                <p className="text-[var(--text-muted)]">جستجو در ثبت کامپوننت‌های عمومی جهت بازاستفاده.</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۴: ارزیابی ریسک</span>
                <p className="text-[var(--text-muted)]">تحلیل اثرات تغییر بر UI، دیتابیس و عملکرد.</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۵: پیاده‌سازی</span>
                <p className="text-[var(--text-muted)]">توسعه ماژولار و دقیق به زبان تایپ‌اسکریپت.</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۶: بازبینی خودکار</span>
                <p className="text-[var(--text-muted)]">تایید صحت RTL، فونت فارسی و تم‌های سیستم.</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۷: تضمین کیفیت (QA)</span>
                <p className="text-[var(--text-muted)]">اجرای کامپایلر و لینتر جهت اطمینان از خطا صفر.</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">گام ۸: مستندسازی</span>
                <p className="text-[var(--text-muted)]">به‌روزرسانی چنج‌لوگ و ثبت ADRهای جدید.</p>
              </div>
            </div>
          </div>

          {/* Impact Analysis Simulator */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>موتور شبیه‌ساز تحلیل اثرات تغییرات (Impact Analysis Simulator)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-bold">انتخاب ماژول هدف:</label>
                  <select
                    value={impactModule}
                    onChange={(e) => handleSimulateImpact(e.target.value, impactChangeType)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-[var(--text-main)]"
                  >
                    <option value="RECEPTION">پذیرش و نوبت‌دهی (Reception)</option>
                    <option value="PATIENT_RECORDS">پرونده بیماران (Patient EMR)</option>
                    <option value="FINANCIAL">صندوق و امور مالی (Financial)</option>
                    <option value="PHARMACY">داروخانه و انبار (Pharmacy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-bold">نوع تغییر درخواستی:</label>
                  <select
                    value={impactChangeType}
                    onChange={(e) => handleSimulateImpact(impactModule, e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-[var(--text-main)]"
                  >
                    <option value="ADD_UI_CONTROL">افزودن کامپوننت جدید UI</option>
                    <option value="SCHEMA_UPDATE">تغییر ساختار داده / Schema دیتابیس</option>
                    <option value="BUSINESS_LOGIC">تغییر محاسبات مالی یا قوانین دسترسی</option>
                  </select>
                </div>
              </div>

              {/* Simulation Result */}
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-main)]">نتیجه ارزیابی ریسک AI:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      simulatedRisk.level === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : simulatedRisk.level === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    سطح ریسک: {simulatedRisk.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-amber-400 block text-[11px]">ملاحظات و هشدارها:</span>
                  {simulatedRisk.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <span className="font-bold text-emerald-400 block text-[11px]">تضمین‌های امنیتی AI:</span>
                  {simulatedRisk.guarantees.map((g, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Refactoring Guards */}
      {activeTab === 'guards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Design System Guard */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                Guard 01
              </span>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">محافظت از دیزاین سیستم (Design Protection)</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              هوش مصنوعی حق تغییر رنگ‌ها، فونت IRANYekanX، فواصل ۴‌پیکسلی، شعاع گوشه‌ها و متغیرهای تم را بدون دستور صریح کاربر ندارد.
            </p>
          </div>

          {/* Database Guard */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full">
                Guard 02
              </span>
              <Database className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">محافظت از دیتابیس (Database Protection)</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              حذف جداول، تغییر نام فیلدهای موجود یا شکستن سازگاری عقب‌رو (Backward Compatibility) توسط AI اکیداً ممنوع است.
            </p>
          </div>

          {/* Module Protection Guard */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">
                Guard 03
              </span>
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">جلوگیری از کد تکراری (Reusability Guard)</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              ایجاد کامپوننت یا مخزن تکراری ممنوع است. AI ابتدا در ثبت کامپوننت‌های عمومی جستجو و سپس اقدام به ساخت می‌کند.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: 100% Offline Independence */}
      {activeTab === 'offline' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base mb-1 text-[var(--text-main)]">ماتریس استقلال آفلاین ماژول‌های پزشکی</h3>
              <p className="text-xs text-[var(--text-muted)]">تضمین کارکرد کامل نرم‌افزار درمانگاه حتی در زمان قطعی کامل اینترنت.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
              ۱۰۰٪ آماده استفاده آفلاین
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">ماژول پذیرش و نوبت‌دهی (Reception & Queue)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> کارکرد آفلاین
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">ماژول پرونده بیماران (Patient EMR)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> کارکرد آفلاین
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">ماژول صندوق و تسویه مالی (Financial)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> کارکرد آفلاین
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">ماژول داروخانه و انبار (Pharmacy)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> کارکرد آفلاین
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">گزارشات و چاپ فاکتور (Printing & Reports)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> کارکرد آفلاین
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">تنظیمات و نقش‌های دسترسی (Settings & Roles)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> کارکرد آفلاین
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Phase 01 Completion Changelog */}
      {activeTab === 'changelog' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-base mb-1 text-[var(--text-main)]">گزارش نهایی چنج‌لوگ فاز اول (Phase 01 Completion)</h3>
            <p className="text-xs text-[var(--text-muted)]">خلاصه تمامی اقدامات، مخازن داده، لایه‌های معماری و استانداردهای پیاده‌سازی شده.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-indigo-400 block text-sm">Part 01: پایه معماری و دیزاین سیستم</span>
              <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1 leading-relaxed">
                <li>ایجاد ساختار ۴ لایه‌ای Clean Architecture (`presentation`, `application`, `domain`, `infrastructure`).</li>
                <li>طراحی موتور متمرکز `DESIGN_TOKENS` همراه با تایپوگرافی فارسی IRANYekanX/Vazirmatn.</li>
                <li>پشتیبانی از ۳ تم اختصاصی: سفید پزشکی (Medical White)، تاریک ضد خستگی (Dark Eyesafe) و رز لوکس (Rose Luxe).</li>
              </ul>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 block text-sm">Part 02: کامپوننت‌های عمومی و ناوبری</span>
              <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1 leading-relaxed">
                <li>ثبت کامپوننت‌های قابل استفاده مجدد در `UNIVERSAL_COMPONENT_REGISTRY`.</li>
                <li>پیاده‌سازی نوار جستجوی سریع هوشمند (`GlobalCommandPalette`) با کلید میانبر Ctrl+K / ⌘K.</li>
                <li>مدیریت سوئیچ درمانگاه‌های متعدد (Multi-Clinic Context Switcher).</li>
              </ul>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-purple-400 block text-sm">Part 03: لایه زیرساخت و مخازن داده (Infrastructure & Repositories)</span>
              <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1 leading-relaxed">
                <li>پیاده‌سازی BaseRepository با قابلیت CRUD، کش محلی و صف همگام‌سازی آفلاین.</li>
                <li>ایجاد مخازن داده اختصاصی: `PatientRepository`, `AppointmentRepository`, `FinancialRepository`, `PharmacyRepository`.</li>
                <li>ارائه سرویس مدیریت خطای متمرکز (`ErrorHandlerService`) و لاگر ساختاریافته (`loggerService`).</li>
                <li>ثبت اسناد تصمیم‌گیری معماری (ADRs 0001-0005) و چک‌لیست DoD.</li>
              </ul>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-amber-400 block text-sm">Part 04: قوانین دستیار AI و گاردهای محافظ</span>
              <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1 leading-relaxed">
                <li>تدوین قوانین توسعه AI و عدم ایجاد وابستگی‌های آنلاین برای عملکرد اصلی برنامه.</li>
                <li>تعریف گاردهای محافظ برای دیزاین سیستم، دیتابیس و جلوگیری از تولید کد تکراری.</li>
                <li>ارائه ماژول تعاملی قوانین AI و چنج‌لوگ تکمیل فاز ۱.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
