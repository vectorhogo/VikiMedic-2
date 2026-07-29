/**
 * VikiMedic v2 - Enterprise Enhancement 01: Reception Timeline
 * Complete timeline component for patient visits.
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  User,
  UserCheck,
  Stethoscope,
  FileText,
  Pill,
  CreditCard,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  Eye,
  X,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Receipt,
  FileSpreadsheet,
  Download,
  Building2,
  Tag,
  Info,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { PatientOrder, UserRole, Patient } from '../../../domain/types';

export interface TimelineEventItem {
  id: string;
  visitId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientNationalId: string;
  patientFileNumber: string;
  doctorName: string;
  receptionistName: string;
  timestamp: string;
  user: string;
  role: UserRole | 'SYSTEM' | 'CASHIER';
  action: string;
  actionCode:
    | 'PATIENT_REGISTERED'
    | 'RECEPTION_STARTED'
    | 'DOCTOR_ASSIGNED'
    | 'ORDER_CREATED'
    | 'SERVICES_ADDED'
    | 'MEDICINES_ADDED'
    | 'ORDER_UPDATED'
    | 'INSURANCE_CALCULATED'
    | 'DISCOUNT_APPLIED'
    | 'PAYMENT_STARTED'
    | 'PAYMENT_COMPLETED'
    | 'INVOICE_GENERATED'
    | 'PRINTED'
    | 'VISIT_CLOSED';
  description: string;
  category: 'REGISTRATION' | 'CLINICAL' | 'FINANCIAL' | 'OUTPUT' | 'SYSTEM';
  badgeColor: string;
  details?: Record<string, any>;
}

interface PatientTimelineSectionProps {
  initialPatientId?: string;
  initialOrderId?: string;
  onCloseModal?: () => void;
}

export const PatientTimelineSection: React.FC<PatientTimelineSectionProps> = ({
  initialPatientId,
  initialOrderId,
  onCloseModal,
}) => {
  const { patients, patientOrders, activeShiftConfig } = useClinic();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('ALL');
  const [selectedReceptionist, setSelectedReceptionist] = useState<string>('ALL');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || 'ALL');
  const [selectedVisitId, setSelectedVisitId] = useState<string>(initialOrderId || 'ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Event Detail Modal State
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventItem | null>(null);

  // Helper for Persian Date
  const todayFa = useMemo(() => new Date().toLocaleDateString('fa-IR'), []);

  // 1. Build all Timeline Events dynamically from Patient Orders and Patient Records
  const allTimelineEvents = useMemo(() => {
    const events: TimelineEventItem[] = [];

    // Helper to generate events for each patient order / visit
    patientOrders.forEach((order) => {
      const p = patients.find((pat) => pat.id === order.patientId);
      const pName = order.patientName || (p ? `${p.firstName} ${p.lastName}` : 'بیمار عمومی');
      const pNational = order.patientNationalId || p?.nationalId || '---';
      const pFile = order.patientFileNumber || p?.fileNumber || '---';
      const docName = order.doctorName || activeShiftConfig?.assignedStaff.DOCTOR || 'دکتر پیرهادی';
      const recName = order.receptionistName || activeShiftConfig?.assignedStaff.RECEPTIONIST || 'سارا حسینی';

      // Event 1: Patient Registered
      if (p) {
        events.push({
          id: `evt-reg-${p.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: p.id,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: p.createdAt || order.createdAt,
          user: recName,
          role: 'RECEPTIONIST',
          action: 'ثبت پرونده بیمار در سامانه',
          actionCode: 'PATIENT_REGISTERED',
          description: `ثبت پرونده پذیرش بیمار ${pName} با کد ملی ${pNational} و شماره پرونده ${pFile} در سیستم.`,
          category: 'REGISTRATION',
          badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          details: {
            phone: p.phone,
            insuranceType: p.insuranceType,
            registeredBy: recName,
          },
        });
      }

      // Event 2: Reception Started
      events.push({
        id: `evt-rec-start-${order.id}`,
        visitId: order.id,
        orderNumber: order.orderNumber,
        patientId: order.patientId,
        patientName: pName,
        patientNationalId: pNational,
        patientFileNumber: pFile,
        doctorName: docName,
        receptionistName: recName,
        timestamp: order.createdAt,
        user: recName,
        role: 'RECEPTIONIST',
        action: 'شروع فرآیند پذیرش بیمار',
        actionCode: 'RECEPTION_STARTED',
        description: `آغاز فرآیند پذیرش نوبت بالینی با شماره سفارش ${order.orderNumber} در شیفت ${order.shiftNameFa || 'عمومی'}.`,
        category: 'REGISTRATION',
        badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        details: {
          shift: order.shiftNameFa,
          receptionist: recName,
          createdAt: order.createdAt,
        },
      });

      // Event 3: Doctor Assigned
      events.push({
        id: `evt-doc-assign-${order.id}`,
        visitId: order.id,
        orderNumber: order.orderNumber,
        patientId: order.patientId,
        patientName: pName,
        patientNationalId: pNational,
        patientFileNumber: pFile,
        doctorName: docName,
        receptionistName: recName,
        timestamp: order.createdAt,
        user: recName,
        role: 'RECEPTIONIST',
        action: 'تخصیص پزشک معالج',
        actionCode: 'DOCTOR_ASSIGNED',
        description: `ارکستراسیون و تخصیص پرونده جهت معاینه توسط ${docName}.`,
        category: 'CLINICAL',
        badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        details: {
          assignedDoctor: docName,
          receptionist: recName,
        },
      });

      // Event 4: Clinical Order Created
      events.push({
        id: `evt-order-create-${order.id}`,
        visitId: order.id,
        orderNumber: order.orderNumber,
        patientId: order.patientId,
        patientName: pName,
        patientNationalId: pNational,
        patientFileNumber: pFile,
        doctorName: docName,
        receptionistName: recName,
        timestamp: order.createdAt,
        user: docName,
        role: 'DOCTOR',
        action: 'ایجاد اولیه سفارش بالینی',
        actionCode: 'ORDER_CREATED',
        description: `افتتاح پیش‌نویس سفارش درمان شامل ${order.items.length} قلم خدمت و دارو.`,
        category: 'CLINICAL',
        badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        details: {
          initialItemsCount: order.items.length,
          orderStatus: order.status,
        },
      });

      // Event 5: Services Added
      const services = order.items.filter((i) => i.itemType === 'SERVICE');
      if (services.length > 0) {
        events.push({
          id: `evt-srv-added-${order.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: order.patientId,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: order.createdAt,
          user: docName,
          role: 'DOCTOR',
          action: 'ثبت خدمات پزشکی و تشخیصی',
          actionCode: 'SERVICES_ADDED',
          description: `ثبت ${services.length} خدمت درمانی: ${services.map((s) => s.itemName).join('، ')}.`,
          category: 'CLINICAL',
          badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          details: {
            servicesList: services.map((s) => `${s.itemName} (${s.unitPrice.toLocaleString('fa-IR')} تومان)`),
          },
        });
      }

      // Event 6: Medicines Added
      const medicines = order.items.filter((i) => i.itemType === 'MEDICINE');
      if (medicines.length > 0) {
        events.push({
          id: `evt-med-added-${order.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: order.patientId,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: order.createdAt,
          user: docName,
          role: 'DOCTOR',
          action: 'افزودن اقلام دارویی به نسخه',
          actionCode: 'MEDICINES_ADDED',
          description: `افزودن ${medicines.length} قلم دارو به نسخه: ${medicines.map((m) => m.itemName).join('، ')}.`,
          category: 'CLINICAL',
          badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
          details: {
            medicinesList: medicines.map((m) => `${m.itemName} x${m.quantity}`),
          },
        });
      }

      // Event 7: Order Updates / Modifications
      if (order.modificationLogs && order.modificationLogs.length > 0) {
        order.modificationLogs.forEach((log) => {
          events.push({
            id: `evt-mod-${log.id}`,
            visitId: order.id,
            orderNumber: order.orderNumber,
            patientId: order.patientId,
            patientName: pName,
            patientNationalId: pNational,
            patientFileNumber: pFile,
            doctorName: docName,
            receptionistName: recName,
            timestamp: log.timestamp,
            user: log.modifiedBy,
            role: log.userRole,
            action: 'اصلاح و به‌روزرسانی سفارش بالینی',
            actionCode: 'ORDER_UPDATED',
            description: `اصلاح سفارش: ${log.reason} | تغییر: ${log.oldValue} ← ${log.newValue}.`,
            category: 'CLINICAL',
            badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            details: {
              actionType: log.action,
              oldValue: log.oldValue,
              newValue: log.newValue,
              reason: log.reason,
            },
          });
        });
      }

      // Event 8: Insurance Calculated
      if (order.totalInsuranceShare > 0) {
        events.push({
          id: `evt-ins-calc-${order.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: order.patientId,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: order.createdAt,
          user: 'سامانه استعلام و قوانین بیمه',
          role: 'SYSTEM',
          action: 'محاسبه سهم بیمه گر و فرانشیز',
          actionCode: 'INSURANCE_CALCULATED',
          description: `محاسبه پوشش بیمه ${order.insuranceType}: تعهد بیمه‌گر ${order.totalInsuranceShare.toLocaleString('fa-IR')} تومان.`,
          category: 'FINANCIAL',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          details: {
            insuranceType: order.insuranceType,
            insuranceNumber: order.insuranceNumber || 'تأییدشده سیستم',
            insuranceShareAmount: order.totalInsuranceShare,
          },
        });
      }

      // Event 9: Discount Applied
      if (order.totalDiscount > 0) {
        events.push({
          id: `evt-disc-${order.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: order.patientId,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: order.updatedAt || order.createdAt,
          user: recName,
          role: 'RECEPTIONIST',
          action: 'اعمال تخفیف مدیریتی روی فاکتور',
          actionCode: 'DISCOUNT_APPLIED',
          description: `اعمال تخفیف به مبلغ ${order.totalDiscount.toLocaleString('fa-IR')} تومان روی صورتحساب بیمار.`,
          category: 'FINANCIAL',
          badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          details: {
            discountAmount: order.totalDiscount,
            appliedBy: recName,
          },
        });
      }

      // Event 10: Payment Started
      events.push({
        id: `evt-pay-start-${order.id}`,
        visitId: order.id,
        orderNumber: order.orderNumber,
        patientId: order.patientId,
        patientName: pName,
        patientNationalId: pNational,
        patientFileNumber: pFile,
        doctorName: docName,
        receptionistName: recName,
        timestamp: order.createdAt,
        user: recName,
        role: 'RECEPTIONIST',
        action: 'ارسال فاکتور به صندوق جهت تسویه',
        actionCode: 'PAYMENT_STARTED',
        description: `ارسال صورتحساب قابل پرداخت بیمار به مبلغ ${order.totalPatientShare.toLocaleString('fa-IR')} تومان به صندوق کلینیک.`,
        category: 'FINANCIAL',
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        details: {
          payableAmount: order.totalPatientShare,
          grossTotal: order.totalGross,
        },
      });

      // Event 11: Payment Completed
      if (order.status === 'PAID') {
        const payMethodFa =
          order.paymentMethod === 'POS'
            ? 'دستگاه کارتخوان (POS)'
            : order.paymentMethod === 'CASH'
            ? 'نقدی'
            : order.paymentMethod === 'CARD_TO_CARD'
            ? 'کارت به کارت'
            : 'ترکیبی';

        events.push({
          id: `evt-pay-done-${order.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: order.patientId,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: order.paidAt || order.updatedAt,
          user: order.shiftStaffDetails?.cashierName || recName,
          role: 'CASHIER',
          action: 'تکمیلی تسویه حساب و دریافت وجه',
          actionCode: 'PAYMENT_COMPLETED',
          description: `تسویه کامل مبلغ ${order.totalPatientShare.toLocaleString('fa-IR')} تومان از طریق ${payMethodFa}.`,
          category: 'FINANCIAL',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          details: {
            method: payMethodFa,
            amount: order.totalPatientShare,
            paidAt: order.paidAt || order.updatedAt,
            cashier: order.shiftStaffDetails?.cashierName || recName,
          },
        });

        // Event 12: Invoice Generated
        events.push({
          id: `evt-inv-gen-${order.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: order.patientId,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: order.paidAt || order.updatedAt,
          user: 'سامانه حسابداری پذیرش',
          role: 'SYSTEM',
          action: 'صدور رسمی فاکتور صورتحساب',
          actionCode: 'INVOICE_GENERATED',
          description: `ثبت و صدور رسمی شماره فاکتور ${order.orderNumber} در سیستم مالی با قفل سوابق.`,
          category: 'FINANCIAL',
          badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
          details: {
            orderNumber: order.orderNumber,
            totalGross: order.totalGross,
            totalInsuranceShare: order.totalInsuranceShare,
            totalDiscount: order.totalDiscount,
            totalPatientShare: order.totalPatientShare,
          },
        });
      }

      // Event 13 & 14: Printed / PDF
      if (order.printCount > 0 || (order.printHistory && order.printHistory.length > 0)) {
        const pHist = order.printHistory && order.printHistory.length > 0 ? order.printHistory : [{ printedBy: recName, printedAt: order.updatedAt }];
        pHist.forEach((ph, idx) => {
          events.push({
            id: `evt-prt-${order.id}-${idx}`,
            visitId: order.id,
            orderNumber: order.orderNumber,
            patientId: order.patientId,
            patientName: pName,
            patientNationalId: pNational,
            patientFileNumber: pFile,
            doctorName: docName,
            receptionistName: recName,
            timestamp: ph.printedAt || order.updatedAt,
            user: ph.printedBy || recName,
            role: 'RECEPTIONIST',
            action: 'چاپ و استخراج قبض فاکتور',
            actionCode: 'PRINTED',
            description: `چاپ نسخه فیزیکی صورتحساب پذیرش توسط ${ph.printedBy || recName} (تعداد کل چاپ: ${order.printCount}).`,
            category: 'OUTPUT',
            badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
            details: {
              printedBy: ph.printedBy || recName,
              printIndex: idx + 1,
              reason: ph.reason || 'تحویل به بیمار',
            },
          });
        });
      }

      // Event 15: Visit Closed
      if (order.status === 'PAID') {
        events.push({
          id: `evt-close-${order.id}`,
          visitId: order.id,
          orderNumber: order.orderNumber,
          patientId: order.patientId,
          patientName: pName,
          patientNationalId: pNational,
          patientFileNumber: pFile,
          doctorName: docName,
          receptionistName: recName,
          timestamp: order.paidAt || order.updatedAt,
          user: 'مدیریت شیفت پذیرش',
          role: 'ADMIN',
          action: 'خاتمه پرونده پذیرش و بایگانی',
          actionCode: 'VISIT_CLOSED',
          description: `تکمیل تمامی مراحل بالینی و مالی نوبت ${order.orderNumber} و انتقال به آرشیو دائمی.`,
          category: 'SYSTEM',
          badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          details: {
            closedAt: order.paidAt || order.updatedAt,
            orderStatus: order.status,
          },
        });
      }
    });

    // Sort chronologically descending (newest events first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [patientOrders, patients, activeShiftConfig]);

  // Unique Lists for Dropdown Filters
  const doctorList = useMemo(() => {
    const set = new Set<string>();
    allTimelineEvents.forEach((e) => {
      if (e.doctorName) set.add(e.doctorName);
    });
    return Array.from(set);
  }, [allTimelineEvents]);

  const receptionistList = useMemo(() => {
    const set = new Set<string>();
    allTimelineEvents.forEach((e) => {
      if (e.receptionistName) set.add(e.receptionistName);
    });
    return Array.from(set);
  }, [allTimelineEvents]);

  const patientList = useMemo(() => {
    const map = new Map<string, string>();
    allTimelineEvents.forEach((e) => {
      if (e.patientId && e.patientName) {
        map.set(e.patientId, `${e.patientName} (${e.patientNationalId})`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [allTimelineEvents]);

  const visitList = useMemo(() => {
    const set = new Set<string>();
    allTimelineEvents.forEach((e) => {
      if (e.orderNumber) set.add(e.orderNumber);
    });
    return Array.from(set);
  }, [allTimelineEvents]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allTimelineEvents.filter((evt) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const pName = (evt.patientName || '').toLowerCase();
        const pNational = (evt.patientNationalId || '').toLowerCase();
        const pFile = (evt.patientFileNumber || '').toLowerCase();
        const ordNum = (evt.orderNumber || '').toLowerCase();
        const actionText = (evt.action || '').toLowerCase();
        const descText = (evt.description || '').toLowerCase();
        if (
          !pName.includes(q) &&
          !pNational.includes(q) &&
          !pFile.includes(q) &&
          !ordNum.includes(q) &&
          !actionText.includes(q) &&
          !descText.includes(q)
        ) {
          return false;
        }
      }

      // 2. Doctor Filter
      if (selectedDoctor !== 'ALL' && evt.doctorName !== selectedDoctor) {
        return false;
      }

      // 3. Receptionist Filter
      if (selectedReceptionist !== 'ALL' && evt.receptionistName !== selectedReceptionist) {
        return false;
      }

      // 4. Patient Filter
      if (selectedPatientId !== 'ALL' && evt.patientId !== selectedPatientId) {
        return false;
      }

      // 5. Visit Filter
      if (selectedVisitId !== 'ALL' && evt.orderNumber !== selectedVisitId) {
        return false;
      }

      // 6. Category Filter
      if (categoryFilter !== 'ALL' && evt.category !== categoryFilter) {
        return false;
      }

      // 7. Date Filter
      if (dateFilter === 'TODAY') {
        if (!evt.timestamp.includes(todayFa)) return false;
      }

      return true;
    });
  }, [
    allTimelineEvents,
    searchQuery,
    selectedDoctor,
    selectedReceptionist,
    selectedPatientId,
    selectedVisitId,
    categoryFilter,
    dateFilter,
    todayFa,
  ]);

  // Category Icon Resolver
  const getCategoryIcon = (category: TimelineEventItem['category'], code: TimelineEventItem['actionCode']) => {
    switch (code) {
      case 'PATIENT_REGISTERED':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'RECEPTION_STARTED':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      case 'DOCTOR_ASSIGNED':
        return <Stethoscope className="w-4 h-4 text-purple-500" />;
      case 'ORDER_CREATED':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'SERVICES_ADDED':
        return <Activity className="w-4 h-4 text-cyan-500" />;
      case 'MEDICINES_ADDED':
        return <Pill className="w-4 h-4 text-teal-500" />;
      case 'ORDER_UPDATED':
        return <Tag className="w-4 h-4 text-amber-500" />;
      case 'INSURANCE_CALCULATED':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'DISCOUNT_APPLIED':
        return <Tag className="w-4 h-4 text-amber-500" />;
      case 'PAYMENT_STARTED':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'PAYMENT_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'INVOICE_GENERATED':
        return <Receipt className="w-4 h-4 text-teal-500" />;
      case 'PRINTED':
        return <Printer className="w-4 h-4 text-sky-500" />;
      case 'VISIT_CLOSED':
        return <Lock className="w-4 h-4 text-slate-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* HEADER BAR */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <span>زمان‌بندی و سیر کامل پذیرش بیماران (Patient Timeline)</span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
                Enterprise Log
              </span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              ثبتگاه کرونولوژیک تمام وقایع پذیرش، دستورات بالینی، محاسبات بیمه و تسویه صندوق به صورت قفل‌شده
            </p>
          </div>
        </div>

        {onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">رویدادهای ثبت‌شده</div>
            <div className="text-base font-bold font-mono text-[var(--text-main)]">
              {allTimelineEvents.length.toLocaleString('fa-IR')}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">تسویه‌های موفق</div>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {allTimelineEvents.filter((e) => e.actionCode === 'PAYMENT_COMPLETED').length.toLocaleString('fa-IR')}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">سفارشات بالینی</div>
            <div className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
              {allTimelineEvents.filter((e) => e.actionCode === 'ORDER_CREATED').length.toLocaleString('fa-IR')}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">خروجی‌های چاپی</div>
            <div className="text-base font-bold font-mono text-sky-600 dark:text-sky-400">
              {allTimelineEvents.filter((e) => e.actionCode === 'PRINTED').length.toLocaleString('fa-IR')}
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-FILTER PANEL */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold flex items-center gap-2 text-[var(--text-main)]">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>فیلتر و جستجوی پیشرفته رویدادهای سیر پذیرش</span>
          </div>
          {(selectedDoctor !== 'ALL' ||
            selectedReceptionist !== 'ALL' ||
            selectedPatientId !== 'ALL' ||
            selectedVisitId !== 'ALL' ||
            categoryFilter !== 'ALL' ||
            dateFilter !== 'ALL' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedDoctor('ALL');
                setSelectedReceptionist('ALL');
                setSelectedPatientId('ALL');
                setSelectedVisitId('ALL');
                setCategoryFilter('ALL');
                setDateFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-rose-500 hover:underline font-bold"
            >
              پاکسازی فیلترها
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو (نام بیمار، کد ملی، شماره سفارش، اقدام)..."
              className="w-full pr-9 pl-3 py-2 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Doctor Dropdown */}
          <div>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">همه پزشکان معالج</option>
              {doctorList.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Receptionist Dropdown */}
          <div>
            <select
              value={selectedReceptionist}
              onChange={(e) => setSelectedReceptionist(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">همه مسئولین پذیرش / کاربران</option>
              {receptionistList.map((rec) => (
                <option key={rec} value={rec}>
                  {rec}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Dropdown */}
          <div>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">همه بیماران</option>
              {patientList.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Category & Date Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)] text-[11px] font-bold">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-[var(--text-muted)] ml-1">دسته‌بندی:</span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                categoryFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              همه ({allTimelineEvents.length})
            </button>
            <button
              onClick={() => setCategoryFilter('REGISTRATION')}
              className={`px-2.5 py-1 rounded-lg transition ${
                categoryFilter === 'REGISTRATION'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              ثبت و پذیرش اولیه
            </button>
            <button
              onClick={() => setCategoryFilter('CLINICAL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                categoryFilter === 'CLINICAL'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              دستورات بالینی
            </button>
            <button
              onClick={() => setCategoryFilter('FINANCIAL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                categoryFilter === 'FINANCIAL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              مالی و بیمه
            </button>
            <button
              onClick={() => setCategoryFilter('OUTPUT')}
              className={`px-2.5 py-1 rounded-lg transition ${
                categoryFilter === 'OUTPUT'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              چاپ و خروجی‌ها
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[var(--text-muted)] ml-1">بازه زمانی:</span>
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                dateFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              همه تاریخ‌ها
            </button>
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-2.5 py-1 rounded-lg transition ${
                dateFilter === 'TODAY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              امروز ({todayFa})
            </button>
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL TIMELINE STREAM */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <h3 className="font-bold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>جریان زمانی رویدادها ({filteredEvents.length} رویداد)</span>
          </h3>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            مرتب‌سازی: جدیدترین رویدادها در بالا
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-[var(--text-main)]">هیچ رویدادی مطابق با فیلترهای انتخابی یافت نشد.</p>
            <p className="text-[11px] text-[var(--text-muted)]">عبارت جستجو یا فیلترهای پزشکی و زمان را تغییر دهید.</p>
          </div>
        ) : (
          <div className="relative border-r-2 border-slate-200 dark:border-slate-800 pr-6 mr-3 space-y-6">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* TIMELINE ICON BULLET */}
                <div className="absolute -right-[35px] top-1 w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-blue-500 shadow-sm flex items-center justify-center z-10 group-hover:scale-110 transition">
                  {getCategoryIcon(evt.category, evt.actionCode)}
                </div>

                {/* EVENT CARD */}
                <div
                  onClick={() => setSelectedEvent(evt)}
                  className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-blue-500/50 rounded-2xl transition shadow-xs hover:shadow-md cursor-pointer space-y-2"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${evt.badgeColor}`}>
                        {evt.action}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-main)]">{evt.patientName}</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        (کد ملی: {evt.patientNationalId} | شماره سفارش: {evt.orderNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--text-main)] leading-relaxed font-sans">{evt.description}</p>

                  {/* Footer Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                    <div className="flex items-center gap-3 text-[var(--text-muted)]">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>کاربر: <strong className="text-[var(--text-main)]">{evt.user}</strong></span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold">
                        ROLE: {evt.role}
                      </span>
                      {evt.doctorName && (
                        <span className="hidden sm:inline-block text-[10px] text-purple-500 font-medium">
                          پزشک: {evt.doctorName}
                        </span>
                      )}
                    </div>

                    <div className="text-blue-500 hover:underline flex items-center gap-1 font-bold text-[10px]">
                      <Eye className="w-3.5 h-3.5" />
                      <span>مشاهده جزئیات کامل رویداد (Audit Panel)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IMMUTABLE DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 dir-rtl">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 text-[var(--text-main)] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                    <span>جزئیات رویداد زمانی پذیرش بیمار</span>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded font-mono">
                      Read-Only Audit
                    </span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    ثبتگاه غیرقابل تغییر سوابق حسابرسی نوبت کلینیک
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Header Banner */}
            <div className="p-3.5 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedEvent.action}</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{selectedEvent.timestamp}</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-main)]">{selectedEvent.description}</p>
            </div>

            {/* Patient & Staff Audit Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--bg-app)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
              <div>
                <span className="text-[var(--text-muted)] text-[10px] block">نام بیمار:</span>
                <strong className="text-[var(--text-main)]">{selectedEvent.patientName}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-[10px] block">کد ملی بیمار:</span>
                <strong className="font-mono text-[var(--text-main)]">{selectedEvent.patientNationalId}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-[10px] block">شماره سفارش / نوبت:</span>
                <strong className="font-mono text-blue-500">{selectedEvent.orderNumber}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-[10px] block">پزشک معالج:</span>
                <strong className="text-[var(--text-main)]">{selectedEvent.doctorName}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-[10px] block">کاربر ثبت‌کننده:</span>
                <strong className="text-[var(--text-main)]">{selectedEvent.user}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-[10px] block">نقش کاربر (User Role):</span>
                <strong className="font-mono text-purple-500">{selectedEvent.role}</strong>
              </div>
            </div>

            {/* Technical Detail Payload JSON / Key-Values */}
            {selectedEvent.details && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  پارامترها و جزئیات فنی ثبت‌شده (Payload):
                </span>
                <div className="p-3 bg-slate-950 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto space-y-1 border border-slate-800">
                  {Object.entries(selectedEvent.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-emerald-400 font-bold">{Array.isArray(v) ? v.join(' | ') : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Read-Only Notice */}
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-[11px] rounded-xl flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>این رکورد زمانی جهت الزامات بازرسی و حسابرسی غیرقابل تغییر و ویرایش می‌باشد.</span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              بستن پنجره (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
