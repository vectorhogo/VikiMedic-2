/**
 * VikiMedic v2 - Financials & Invoicing Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  Download,
  DollarSign,
  Printer,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Shield,
  UserCheck,
  FileText,
  PackageCheck,
  History,
  Eye,
  Tag,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { PaymentMethod, PatientOrder } from '../../domain/types';
import { ExportService } from '../../infrastructure/exportService';
import { PatientOrderWorkflowModal } from '../components/orders/PatientOrderWorkflowModal';
import { CatalogManagerModal } from '../components/orders/CatalogManagerModal';

export const FinancialsModule: React.FC = () => {
  const {
    transactions,
    patientOrders,
    patients,
    activeUser,
    addTransaction,
    setActivePrintInvoice,
    setActivePrintOrder,
    showContextMenu,
    activeShiftConfig,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'PATIENT_ORDERS'>('PATIENT_ORDERS');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [description, setDescription] = useState('ویزیت عمومی + نوار قلب');
  const [amountGross, setAmountGross] = useState<number>(350000);
  const [discountAmount, setDiscountAmount] = useState<number>(30000);
  const [insuranceCoverage, setInsuranceCoverage] = useState<number>(120000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('POS');

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedOrderPatientId, setSelectedOrderPatientId] = useState<string | null>(null);

  const amountNet = Math.max(0, amountGross - discountAmount - insuranceCoverage);

  const totalGrossSum = transactions.reduce((acc, t) => acc + t.amountGross, 0);
  const totalNetSum = transactions.reduce((acc, t) => acc + t.amountNet, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const newTx = addTransaction({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      amountGross,
      discountAmount,
      insuranceCoverage,
      amountNet,
      paymentMethod,
      paymentStatus: 'PAID',
      description,
      cashierName: activeUser.fullName,
    });

    setActivePrintInvoice(newTx);
  };

  return (
    <div className="p-6 space-y-6 text-[var(--text-main)] max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">حسابداری کلینیک، صندوق و بستن مالی شیفت</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              مدیریت تراکنش‌های مالی، دستگاه پوز، بیمه، صدور فاکتور رسمی و بستن صندوق شیفت فعال
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow transition"
          >
            <PackageCheck className="w-4 h-4" />
            <span>کاتالوگ خدمات و قیمت‌ها</span>
          </button>

          <button
            onClick={() => ExportService.exportTransactionsToCSV(transactions)}
            className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>خروجی CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PATIENT_ORDERS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'PATIENT_ORDERS'
              ? 'bg-sky-600 text-white shadow'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>سفارشات بیماران و صورتحساب یکپارچه ({patientOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-emerald-600 text-white shadow'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>رسیدها و تراکنش‌های مستقیم ({transactions.length})</span>
        </button>
      </div>

      {/* Active Shift Cashbox Banner */}
      {activeShiftConfig && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>صندوق و مسئولین مالی شیفت جاری ({activeShiftConfig.shiftNameFa} — {activeShiftConfig.startTime} الی {activeShiftConfig.endTime}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
            <span className="bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              صندوق‌دار شیفت: <strong className="text-emerald-600 dark:text-emerald-400">{activeShiftConfig.assignedStaff.CASHIER || activeShiftConfig.assignedStaff.RECEPTIONIST}</strong>
            </span>
            <span className="bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              مسئول پذیرش: <strong className="text-emerald-600 dark:text-emerald-400">{activeShiftConfig.assignedStaff.RECEPTIONIST}</strong>
            </span>
            <span className="bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              پزشک مقیم شیفت: <strong className="text-emerald-600 dark:text-emerald-400">{activeShiftConfig.assignedStaff.DOCTOR}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <span className="text-xs font-bold text-[var(--text-muted)]">کل درآمد دریافتی امروز</span>
          <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {ExportService.formatCurrency(totalNetSum)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <span className="text-xs font-bold text-[var(--text-muted)]">مجموع تخفیف‌های اعطایی</span>
          <div className="text-xl font-black font-mono text-rose-500 mt-2">
            {ExportService.formatCurrency(transactions.reduce((acc, t) => acc + t.discountAmount, 0))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <span className="text-xs font-bold text-[var(--text-muted)]">سهم بازپرداخت بیمه‌ها</span>
          <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-2">
            {ExportService.formatCurrency(transactions.reduce((acc, t) => acc + t.insuranceCoverage, 0))}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      {activeTab === 'PATIENT_ORDERS' ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                مدیریت سفارشات متمرکز بیماران (Patient Orders)
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                لیست تمام سفارشات بالینی صادرشده توسط پزشکان و پذیرش همراه با وضعیت پرداختی و ریز اقلام
              </p>
            </div>

            <button
              onClick={() => {
                if (patients.length > 0) setSelectedOrderPatientId(patients[0].id);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              ایجاد سفارش جدید بیمار
            </button>
          </div>

          <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-[var(--text-muted)] font-bold border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="p-3">شماره سفارش</th>
                  <th className="p-3">بیمار / پرونده</th>
                  <th className="p-3">شیفت و کادر درمانی</th>
                  <th className="p-3 text-center">تعداد اقلام</th>
                  <th className="p-3 text-center">مبلغ کل (تومان)</th>
                  <th className="p-3 text-center">سهم بیمه</th>
                  <th className="p-3 text-center">پرداختی بیمار</th>
                  <th className="p-3 text-center">وضعیت</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {patientOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                      هیچ سفارشی هنوز در سیستم ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  patientOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-sky-600">{order.orderNumber}</td>
                      <td className="p-3 font-semibold">
                        <div>{order.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">پرونده: {order.patientFileNumber} | {order.insuranceType}</div>
                      </td>
                      <td className="p-3 text-[11px] text-slate-500">
                        <div>پزشک: {order.doctorName}</div>
                        <div>شیفت: {order.shiftNameFa}</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{order.items.length}</td>
                      <td className="p-3 text-center font-mono">{order.totalGross.toLocaleString('fa-IR')}</td>
                      <td className="p-3 text-center font-mono text-emerald-600">{order.totalInsuranceShare.toLocaleString('fa-IR')}</td>
                      <td className="p-3 text-center font-mono font-bold text-sky-600">{order.totalPatientShare.toLocaleString('fa-IR')}</td>
                      <td className="p-3 text-center">
                        {order.status === 'PAID' && (
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                            تسویه شده (پرداخت شده)
                          </span>
                        )}
                        {order.status === 'READY_FOR_BILLING' && (
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full animate-pulse">
                            آماده تسویه صندوق
                          </span>
                        )}
                        {order.status === 'UNDER_REVIEW' && (
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-full">
                            در حال بررسی پذیرش
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedOrderPatientId(order.patientId)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition"
                            title="بررسی، ویرایش یا پرداخت سفارش"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status === 'PAID' && (
                            <button
                              onClick={() => setActivePrintOrder(order)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                              title="چاپ رسید رسمی بابت این سفارش"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Creation Form (1 Column) */}
          <form onSubmit={handleCreateInvoice} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="font-bold text-sm flex items-center gap-2 text-emerald-600">
              <PlusCircle className="w-4 h-4" />
              <span>صدور فاکتور جدید برای بیمار</span>
            </h2>

            <div>
              <label className="block mb-1 font-bold">انتخاب بیمار *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-medium outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.fileNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-bold">شرح خدمات / ویزیت *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-medium outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold">مبلغ کل (تومان)</label>
                <input
                  type="number"
                  value={amountGross}
                  onChange={(e) => setAmountGross(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">میزان تخفیف (تومان)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono text-rose-500 font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-bold">سهم پوشش بیمه (تومان)</label>
              <input
                type="number"
                value={insuranceCoverage}
                onChange={(e) => setInsuranceCoverage(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono text-blue-500 font-bold outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">روش دریافت</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-medium outline-none"
              >
                <option value="POS">دستگاه کارتخوان (POS)</option>
                <option value="CASH">نقدی</option>
                <option value="CARD_TO_CARD">کارت به کارت</option>
              </select>
            </div>

            {/* Amount Net Display Box */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">مبلغ قابل پرداخت:</span>
              <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                {ExportService.formatCurrency(amountNet)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>ثبت فاکتور و چاپ رسيد</span>
            </button>
          </form>

          {/* Transactions Table (2 Columns) */}
          <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">لیست فاکتورها و صورتحساب‌های صادرشده</h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">{transactions.length} فاکتور</span>
            </div>

            <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                    <th className="p-2.5 font-bold">شماره فاکتور</th>
                    <th className="p-2.5 font-bold">نام بیمار</th>
                    <th className="p-2.5 font-bold">مبلغ دریافتی</th>
                    <th className="p-2.5 font-bold">روش</th>
                    <th className="p-2.5 font-bold">تاریخ و زمان</th>
                    <th className="p-2.5 font-bold text-center">چاپ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        showContextMenu(e.clientX, e.clientY, 'transaction', tx);
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-context-menu"
                    >
                      <td className="p-2.5 font-bold font-mono text-blue-600">{tx.invoiceNumber}</td>
                      <td className="p-2.5 font-bold">{tx.patientName}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {ExportService.formatCurrency(tx.amountNet)}
                      </td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium border border-[var(--border-subtle)]">
                          {tx.paymentMethod === 'POS' ? 'کارتخوان' : 'نقدی'}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[var(--text-muted)]">{tx.createdAt}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => setActivePrintInvoice(tx)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg text-blue-600 transition"
                          title="چاپ فاکتور رسمی"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Manager Modal */}
      <CatalogManagerModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />

      {/* Patient Order Workflow Modal */}
      <PatientOrderWorkflowModal
        patientId={selectedOrderPatientId || undefined}
        isOpen={!!selectedOrderPatientId}
        onClose={() => setSelectedOrderPatientId(null)}
      />
    </div>
  );
};
