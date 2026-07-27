/**
 * VikiMedic v2 - Global Command Palette (Ctrl+K)
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { Search, User, Calendar, Receipt, Stethoscope, ArrowLeft, X, Boxes, Bot, Award, FolderTree, Code, Database } from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';

export const GlobalCommandPalette: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    patients,
    setActiveModule,
    setIsNewPatientModalOpen,
    setIsNewAppointmentModalOpen,
  } = useClinic();

  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredPatients = query.trim()
    ? patients.filter(
        (p) =>
          p.firstName.includes(query) ||
          p.lastName.includes(query) ||
          p.nationalId.includes(query) ||
          p.fileNumber.includes(query) ||
          p.phone.includes(query)
      )
    : patients.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)]">
        {/* Search Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="جستجوی بیمار (نام، کد ملی، شماره پرونده) یا دستورات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[var(--text-muted)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Patients Section */}
          <div>
            <div className="px-3 py-1 text-[11px] font-bold text-[var(--text-muted)]">
              {query ? 'نتایج جستجوی بیماران' : 'آخرین بیماران مراجعه‌کننده'}
            </div>
            {filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                هیچ بیمار با مشخصات "{query}" یافت نشد.
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setActiveModule('patients');
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-right p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                      {patient.firstName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                        <span>کد ملی: {patient.nationalId}</span>
                        <span>•</span>
                        <span>پرونده: {patient.fileNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition">
                    <span>مشاهده پرونده</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Quick Actions & Navigation */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="px-3 py-1 text-[11px] font-bold text-[var(--text-muted)]">میانبرهای عملیاتی</div>
            <div className="grid grid-cols-2 gap-1.5 p-1">
              <button
                onClick={() => {
                  setIsNewPatientModalOpen(true);
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right"
              >
                <User className="w-4 h-4 text-blue-500" />
                <span>ثبت بیمار جدید (Ctrl + N)</span>
              </button>
              <button
                onClick={() => {
                  setIsNewAppointmentModalOpen(true);
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right"
              >
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>ثبت نوبت سریع (F2)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('doctor_emr');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right"
              >
                <Stethoscope className="w-4 h-4 text-purple-500" />
                <span>انتقال به میز کار پزشک</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('financials');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right"
              >
                <Receipt className="w-4 h-4 text-amber-500" />
                <span>مشاهده گزارشات مالی و فاکتورها</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('design_system');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-purple-500/20"
              >
                <Search className="w-4 h-4 text-purple-400" />
                <span>سیستم طراحی VikiMedic (Design System)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('architecture');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-emerald-500/20"
              >
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>معماری و استانداردهای نرم‌افزار (Clean Architecture)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('ai_rules');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-indigo-500/20"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>قوانین دستیار AI و گارد‌های محافظ (Refactoring Guards)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('quality_assurance');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-emerald-500/20"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>ارزیابی کیفیت و پایداری سیستم (QA & Stability)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('app_bootstrap');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-indigo-500/20"
              >
                <FolderTree className="w-4 h-4 text-indigo-400" />
                <span>پیکربندی زیرساخت و بوتاسترپ فضای‌کاری (Workspace Bootstrap)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('dev_environment');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-sky-500/20"
              >
                <Code className="w-4 h-4 text-sky-400" />
                <span>محیط توسعه، لاگر و اعتبارسنجی پیش از کامپایل (Dev Environment)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('shared_infrastructure');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-purple-500/20"
              >
                <Boxes className="w-4 h-4 text-purple-400" />
                <span>زیرساخت مشترک، اعتبارسنجی و موتور پرینت (Shared Infrastructure)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule('database_architecture');
                  setIsSearchOpen(false);
                }}
                className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-medium flex items-center gap-2 text-right border border-emerald-500/20"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>معماری دیتابیس، جدول موجودیت‌ها و مایگریشن Supabase (Database Schema)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-900/80 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] flex items-center justify-between">
          <span>برای خروج کلید Esc را فشار دهید.</span>
          <span className="font-mono">VikiMedic v2 Search Engine</span>
        </div>
      </div>
    </div>
  );
};
