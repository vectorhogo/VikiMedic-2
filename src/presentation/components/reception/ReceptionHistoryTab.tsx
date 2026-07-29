/**
 * VikiMedic v2 - Reception History Tab
 * Reception Workflow Patch - Reception History
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  User,
  Stethoscope,
  Receipt,
  FileText,
  Printer,
  Pill,
  Activity,
  History,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  X,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { PatientOrder, PatientOrderItem, MedicalRecord } from '../../../domain/types';
import { PatientTimelineSection } from './PatientTimelineSection';

export const ReceptionHistoryTab: React.FC = () => {
  const {
    patientOrders,
    medicalRecords,
    setActivePrintOrder,
    addNotification,
  } = useClinic();

  // Filters State
  const [patientQuery, setPatientQuery] = useState('');
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [receptionistFilter, setReceptionistFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState('');

  // Modals State
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<PatientOrder | null>(null);
  const [activeMedicinesModal, setActiveMedicinesModal] = useState<PatientOrder | null>(null);
  const [activeServicesModal, setActiveServicesModal] = useState<PatientOrder | null>(null);
  const [activeClinicalModal, setActiveClinicalModal] = useState<{ order: PatientOrder; record?: MedicalRecord } | null>(null);
  const [activeAuditModal, setActiveAuditModal] = useState<PatientOrder | null>(null);
  const [activeTimelineModal, setActiveTimelineModal] = useState<PatientOrder | null>(null);

  // Filter completed / paid receptions
  const completedReceptions = useMemo(() => {
    return patientOrders.filter((o) => o.status === 'PAID');
  }, [patientOrders]);

  // Unique list of doctors and receptionists for dropdowns
  const doctorList = useMemo(() => {
    const set = new Set<string>();
    completedReceptions.forEach((o) => {
      if (o.doctorName) set.add(o.doctorName);
    });
    return Array.from(set);
  }, [completedReceptions]);

  const receptionistList = useMemo(() => {
    const set = new Set<string>();
    completedReceptions.forEach((o) => {
      if (o.receptionistName) set.add(o.receptionistName);
      if (o.shiftStaffDetails?.receptionistName) set.add(o.shiftStaffDetails.receptionistName);
    });
    return Array.from(set);
  }, [completedReceptions]);

  // Persian Today Date helper
  const todayFa = useMemo(() => new Date().toLocaleDateString('fa-IR'), []);

  // Filtered List
  const filteredHistory = useMemo(() => {
    return completedReceptions.filter((order) => {
      // 1. Patient Query Filter
      if (patientQuery.trim()) {
        const q = patientQuery.trim().toLowerCase();
        const pName = (order.patientName || '').toLowerCase();
        const pNational = (order.patientNationalId || '').toLowerCase();
        const pFile = (order.patientFileNumber || '').toLowerCase();
        const pPhone = (order.patientPhone || '').toLowerCase();
        if (!pName.includes(q) && !pNational.includes(q) && !pFile.includes(q) && !pPhone.includes(q)) {
          return false;
        }
      }

      // 2. Invoice Query Filter
      if (invoiceQuery.trim()) {
        const iq = invoiceQuery.trim().toLowerCase();
        const oNum = (order.orderNumber || '').toLowerCase();
        const txId = (order.transactionId || '').toLowerCase();
        if (!oNum.includes(iq) && !txId.includes(iq)) {
          return false;
        }
      }

      // 3. Doctor Filter
      if (doctorFilter !== 'ALL') {
        if (order.doctorName !== doctorFilter) return false;
      }

      // 4. Receptionist Filter
      if (receptionistFilter !== 'ALL') {
        const rName = order.receptionistName || order.shiftStaffDetails?.receptionistName;
        if (rName !== receptionistFilter) return false;
      }

      // 5. Date Filter
      if (dateRangeFilter === 'TODAY') {
        if (!order.paidAt?.includes(todayFa) && !order.createdAt?.includes(todayFa)) {
          return false;
        }
      } else if (dateRangeFilter === 'CUSTOM' && customDate.trim()) {
        if (!order.paidAt?.includes(customDate.trim()) && !order.createdAt?.includes(customDate.trim())) {
          return false;
        }
      }

      return true;
    });
  }, [completedReceptions, patientQuery, invoiceQuery, doctorFilter, receptionistFilter, dateRangeFilter, customDate, todayFa]);

  // Totals calculations
  const totalStats = useMemo(() => {
    let gross = 0;
    let insurance = 0;
    let discount = 0;
    let net = 0;

    filteredHistory.forEach((o) => {
      gross += o.totalGross || 0;
      insurance += o.totalInsuranceShare || 0;
      discount += o.totalDiscount || 0;
      net += o.totalPatientShare || 0;
    });

    return {
      count: filteredHistory.length,
      gross,
      insurance,
      discount,
      net,
    };
  }, [filteredHistory]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification(`متن "${text}" در حافظه کپی شد.`, 'info');
  };

  const handleOpenClinicalOrder = (order: PatientOrder) => {
    // Find matching medical record if any
    const record = medicalRecords.find((r) => r.patientId === order.patientId);
    setActiveClinicalModal({ order, record });
  };

  const clearAllFilters = () => {
    setPatientQuery('');
    setInvoiceQuery('');
    setDoctorFilter('ALL');
    setReceptionistFilter('ALL');
    setDateRangeFilter('ALL');
    setCustomDate('');
  };

  return (
    <div className="space-y-6 dir-rtl text-xs animate-in fade-in duration-150">
      {/* Search & Filter Header Toolbar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">فیلترهای پیشرفته جستجوی پذیرش‌ها</h2>
          </div>

          {(patientQuery || invoiceQuery || doctorFilter !== 'ALL' || receptionistFilter !== 'ALL' || dateRangeFilter !== 'ALL') && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold transition flex items-center gap-1 text-[11px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>پاکسازی فیلترها</span>
            </button>
          )}
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Patient Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <User className="w-3 h-3 text-blue-500" />
              <span>جستجوی بیمار</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="نام، کد ملی، پرونده یا تلفن..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-500 font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 2. Invoice / Order Number Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Receipt className="w-3 h-3 text-emerald-500" />
              <span>شماره فاکتور / سفارش</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ORD-1403-1001..."
                value={invoiceQuery}
                onChange={(e) => setInvoiceQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
              />
              <Receipt className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 3. Doctor Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-purple-500" />
              <span>پزشک معالج</span>
            </label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="ALL">همه پزشکان</option>
              {doctorList.map((doc, idx) => (
                <option key={idx} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Receptionist Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span>مسؤول پذیرش</span>
            </label>
            <select
              value={receptionistFilter}
              onChange={(e) => setReceptionistFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="ALL">همه مسئولین پذیرش</option>
              {receptionistList.map((rec, idx) => (
                <option key={idx} value={rec}>
                  {rec}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Date Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-500" />
              <span>بازه زمانی پذیرش</span>
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="ALL">تمام تاریخ‌ها</option>
              <option value="TODAY">امروز ({todayFa})</option>
              <option value="CUSTOM">تاریخ سفارشی...</option>
            </select>
          </div>
        </div>

        {dateRangeFilter === 'CUSTOM' && (
          <div className="pt-2 flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-muted)]">وارد کردن تاریخ شمسی:</span>
            <input
              type="text"
              placeholder="مثال: ۱۴۰۳/۰۵/۰۲"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs font-mono w-48"
            />
          </div>
        )}
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] font-sans font-bold text-blue-700 dark:text-blue-300">تعداد پذیرش‌های تسویه‌شده</span>
          <span className="text-base font-black text-blue-800 dark:text-blue-200">{totalStats.count} مورد</span>
        </div>

        <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] font-sans font-bold text-purple-700 dark:text-purple-300">مجموع کل صورتحساب‌ها</span>
          <span className="text-base font-black text-purple-800 dark:text-purple-200">
            {totalStats.gross.toLocaleString('fa-IR')} ریال
          </span>
        </div>

        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] font-sans font-bold text-emerald-700 dark:text-emerald-300">پوشش سهم بیمه</span>
          <span className="text-base font-black text-emerald-800 dark:text-emerald-200">
            {totalStats.insurance.toLocaleString('fa-IR')} ریال
          </span>
        </div>

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] font-sans font-bold text-amber-700 dark:text-amber-300">دریافتی خالص (سهم بیمار)</span>
          <span className="text-base font-black text-amber-800 dark:text-amber-200">
            {totalStats.net.toLocaleString('fa-IR')} ریال
          </span>
        </div>
      </div>

      {/* Reception History Card Grid */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">هیچ پذیرش تسویه‌شده‌ای مطابق فیلترهای انتخابی یافت نشد.</h3>
            <p className="text-[11px] text-[var(--text-muted)]">لطفاً فیلترهای جستجو را بازنشانی کرده یا عبارات دیگری را وارد نمایید.</p>
          </div>
        ) : (
          filteredHistory.map((order) => {
            const drugsList = order.items.filter((i) => i.itemType === 'DRUG');
            const servicesList = order.items.filter((i) => i.itemType !== 'DRUG');

            return (
              <div
                key={order.id}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-5 shadow-sm space-y-4 transition"
              >
                {/* Header: Invoice Number + Date + Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-black text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{order.orderNumber}</span>
                    </span>

                    <button
                      onClick={() => handleCopy(order.orderNumber)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title="کپی شماره فاکتور"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>زمان تسویه: {order.paidAt || order.createdAt}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                      تسویه کامل (PAID)
                    </span>

                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                      شیفت: {order.shiftNameFa || 'صبح'}
                    </span>
                  </div>
                </div>

                {/* Details Grid: Patient, Doctor, Items Badges, Financials */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Column 1: Patient Information */}
                  <div className="space-y-1 bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] block">مشخصات کامل بیمار</span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{order.patientName}</h3>
                    <div className="space-y-0.5 text-[11px] text-[var(--text-muted)] font-mono">
                      <div>کد ملی: <strong className="text-slate-800 dark:text-slate-200">{order.patientNationalId || '---'}</strong></div>
                      <div>شماره پرونده: <strong className="text-slate-800 dark:text-slate-200">{order.patientFileNumber || '---'}</strong></div>
                      <div>تلفن: <strong className="text-slate-800 dark:text-slate-200">{order.patientPhone || '---'}</strong></div>
                    </div>
                  </div>

                  {/* Column 2: Doctor & Staff */}
                  <div className="space-y-1 bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] block">کادر درمان و پذیرش</span>
                    <div className="font-bold text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                      <span>{order.doctorName || 'پزشک عمومی'}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">
                      مسؤول پذیرش: <strong className="text-slate-800 dark:text-slate-200">{order.receptionistName || 'پذیرش'}</strong>
                    </div>
                    {order.shiftStaffDetails?.cashierName && (
                      <div className="text-[11px] text-[var(--text-muted)]">
                        صندوق‌دار: <strong className="text-slate-800 dark:text-slate-200">{order.shiftStaffDetails.cashierName}</strong>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Medicines & Services Counts */}
                  <div className="space-y-2 bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-subtle)] flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-blue-500" />
                        <span>اقلام دارویی:</span>
                      </span>
                      <button
                        onClick={() => setActiveMedicinesModal(order)}
                        className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-bold text-[11px] transition"
                      >
                        {drugsList.length} قلم دارو (مشاهده)
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>خدمات بالینی:</span>
                      </span>
                      <button
                        onClick={() => setActiveServicesModal(order)}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px] transition"
                      >
                        {servicesList.length} خدمت (مشاهده)
                      </button>
                    </div>
                  </div>

                  {/* Column 4: Financial & Payment Receipt */}
                  <div className="space-y-1 bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-subtle)] font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">مبلغ کل:</span>
                      <span>{(order.totalGross || 0).toLocaleString('fa-IR')} ریال</span>
                    </div>

                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>سهم بیمه:</span>
                      <span>-{(order.totalInsuranceShare || 0).toLocaleString('fa-IR')} ریال</span>
                    </div>

                    <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-[var(--border-subtle)]">
                      <span>خالص پرداختی:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{(order.totalPatientShare || 0).toLocaleString('fa-IR')} ریال</span>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-amber-500" />
                      <span>روش: {order.paymentMethod === 'POS' ? 'کارتخوان' : order.paymentMethod === 'CASH' ? 'نقدی' : 'ترکیبی / آنلاین'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar Required by Prompt */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action 1: View Invoice */}
                    <button
                      onClick={() => setActiveInvoiceModal(order)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>مشاهده فاکتور</span>
                    </button>

                    {/* Action 2: Reprint Invoice */}
                    <button
                      onClick={() => setActivePrintOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>چاپ مجدد فاکتور</span>
                    </button>

                    {/* Action 3: View Medicines */}
                    <button
                      onClick={() => setActiveMedicinesModal(order)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>مشاهده داروها</span>
                    </button>

                    {/* Action 4: View Services */}
                    <button
                      onClick={() => setActiveServicesModal(order)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>مشاهده خدمات</span>
                    </button>

                    {/* Action 5: View Clinical Order */}
                    <button
                      onClick={() => handleOpenClinicalOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>دستورات بالینی EMR</span>
                    </button>
                  </div>

                  {/* Action 6: View Audit Trail */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveAuditModal(order)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <History className="w-3.5 h-3.5 text-amber-500" />
                      <span>ردپای حسابرسی (Audit Trail)</span>
                    </button>

                    <button
                      onClick={() => setActiveTimelineModal(order)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>سیر پذیرش و تایم‌لاین (Timeline)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: VIEW INVOICE MODAL */}
      {/* ============================================================ */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-sm">جزئیات صورتحساب و فاکتور رسمی ({activeInvoiceModal.orderNumber})</h3>
              </div>
              <button
                onClick={() => setActiveInvoiceModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient & Clinic Metadata */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] font-mono text-[11px]">
              <div>بیمار: <strong className="font-sans font-bold">{activeInvoiceModal.patientName}</strong></div>
              <div>کد ملی: <strong>{activeInvoiceModal.patientNationalId || '---'}</strong></div>
              <div>پزشک معالج: <strong className="font-sans font-bold">{activeInvoiceModal.doctorName}</strong></div>
              <div>تاریخ تسویه: <strong>{activeInvoiceModal.paidAt || activeInvoiceModal.createdAt}</strong></div>
            </div>

            {/* Items Table */}
            <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-[var(--bg-app)] border-b border-[var(--border-subtle)] font-bold">
                  <tr>
                    <th className="p-2.5">شرح قلم / خدمت</th>
                    <th className="p-2.5">نوع</th>
                    <th className="p-2.5">تعداد</th>
                    <th className="p-2.5">قیمت واحد</th>
                    <th className="p-2.5">سهم بیمه</th>
                    <th className="p-2.5">سهم بیمار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {activeInvoiceModal.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-app)]">
                      <td className="p-2.5 font-bold">{item.itemName}</td>
                      <td className="p-2.5 text-[10px] text-slate-500">
                        {item.itemType === 'DRUG' ? 'دارو' : 'خدمت'}
                      </td>
                      <td className="p-2.5 font-mono">{item.quantity}</td>
                      <td className="p-2.5 font-mono">{(item.unitPrice || 0).toLocaleString('fa-IR')}</td>
                      <td className="p-2.5 font-mono text-emerald-600">{(item.insuranceShare || 0).toLocaleString('fa-IR')}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {(item.patientShare || 0).toLocaleString('fa-IR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals Footer */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span>مبلغ ناخالص کل:</span>
                <span>{(activeInvoiceModal.totalGross || 0).toLocaleString('fa-IR')} ریال</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>سهم بیمه پایه و تکمیلی:</span>
                <span>-{(activeInvoiceModal.totalInsuranceShare || 0).toLocaleString('fa-IR')} ریال</span>
              </div>
              {activeInvoiceModal.totalDiscount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>تخفیف ویژه:</span>
                  <span>-{(activeInvoiceModal.totalDiscount || 0).toLocaleString('fa-IR')} ریال</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-700 text-amber-300">
                <span>مبلغ خالص دریافتی (تسویه‌شده):</span>
                <span>{(activeInvoiceModal.totalPatientShare || 0).toLocaleString('fa-IR')} ریال</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const order = activeInvoiceModal;
                  setActiveInvoiceModal(null);
                  setActivePrintOrder(order);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ رسمی این فاکتور</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: VIEW MEDICINES MODAL */}
      {/* ============================================================ */}
      {activeMedicinesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-sm">اقلام دارویی پذیرش ({activeMedicinesModal.patientName})</h3>
              </div>
              <button
                onClick={() => setActiveMedicinesModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeMedicinesModal.items.filter((i) => i.itemType === 'DRUG').length === 0 ? (
                <div className="p-6 text-center text-slate-400">هیچ دارویی در این سفارش ثبت نشده است.</div>
              ) : (
                activeMedicinesModal.items
                  .filter((i) => i.itemType === 'DRUG')
                  .map((drug, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{drug.itemName}</h4>
                        {drug.instructions && (
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">دستور مصرف: {drug.instructions}</p>
                        )}
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="font-bold text-purple-600 block">{drug.quantity} عدد</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{(drug.patientShare || 0).toLocaleString('fa-IR')} ریال</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: VIEW SERVICES MODAL */}
      {/* ============================================================ */}
      {activeServicesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm">خدمات بالینی ارائه شده ({activeServicesModal.patientName})</h3>
              </div>
              <button
                onClick={() => setActiveServicesModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeServicesModal.items.filter((i) => i.itemType !== 'DRUG').length === 0 ? (
                <div className="p-6 text-center text-slate-400">هیچ خدمتی در این سفارش ثبت نشده است.</div>
              ) : (
                activeServicesModal.items
                  .filter((i) => i.itemType !== 'DRUG')
                  .map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{srv.itemName}</h4>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">کد خدمت: {srv.itemCode || '---'}</span>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{srv.quantity} خدمت</span>
                        <span className="text-[10px] text-emerald-600 font-bold">{(srv.patientShare || 0).toLocaleString('fa-IR')} ریال</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: VIEW CLINICAL ORDER EMR MODAL */}
      {/* ============================================================ */}
      {activeClinicalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="font-black text-sm">دستورات بالینی و پرونده EMR ({activeClinicalModal.order.patientName})</h3>
              </div>
              <button
                onClick={() => setActiveClinicalModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 block">پزشک معالج / صادرکننده:</span>
                <p className="font-bold text-xs text-sky-900 dark:text-sky-100">{activeClinicalModal.order.doctorName}</p>
              </div>

              {activeClinicalModal.record ? (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-[var(--text-muted)] text-[10px]">تشخیص اولیه پزشک:</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{activeClinicalModal.record.diagnosis || 'معاینه عمومی و بررسی بالینی'}</p>
                  </div>

                  {activeClinicalModal.record.notes && (
                    <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] space-y-1">
                      <span className="font-bold text-[var(--text-muted)] text-[10px]">یادداشت‌های بالینی و ملاحظات:</span>
                      <p className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-200">{activeClinicalModal.record.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-muted)]">
                  نسخه بالینی بر اساس خدمات و اقلام ثبت شده در فاکتور شماره {activeClinicalModal.order.orderNumber} صادر گردیده است.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: VIEW AUDIT TRAIL MODAL */}
      {/* ============================================================ */}
      {activeAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm">ردپای حسابرسی و تاریخچه تغییرات ({activeAuditModal.orderNumber})</h3>
              </div>
              <button
                onClick={() => setActiveAuditModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              {(!activeAuditModal.modificationLogs || activeAuditModal.modificationLogs.length === 0) ? (
                <div className="p-4 text-center text-slate-400">هیچ رویدادی برای این سفارش ثبت نشده است.</div>
              ) : (
                activeAuditModal.modificationLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] space-y-1 font-sans"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-amber-600 dark:text-amber-400">{log.action}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-800 dark:text-slate-200">
                      توسط: <strong>{log.modifiedBy}</strong> ({log.userRole})
                    </div>
                    {log.reason && (
                      <p className="text-[10px] text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                        علت/جزئیات: {log.reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: PATIENT TIMELINE MODAL */}
      {/* ============================================================ */}
      {activeTimelineModal && (
        <div className="fixed inset-0 z-[4000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <PatientTimelineSection
              initialOrderId={activeTimelineModal.orderNumber}
              initialPatientId={activeTimelineModal.patientId}
              onCloseModal={() => setActiveTimelineModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
