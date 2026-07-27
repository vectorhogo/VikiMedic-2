/**
 * VikiMedic v2 - Queue & Reception Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Phone,
  Stethoscope,
  Volume2,
  Receipt,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { QueueItem } from '../../domain/types';
import { PatientOrderWorkflowModal } from '../components/orders/PatientOrderWorkflowModal';

export const QueueModule: React.FC = () => {
  const {
    queue,
    updateQueueStatus,
    setIsNewAppointmentModalOpen,
    setActiveModule,
    showContextMenu,
    addNotification,
    activeShiftConfig,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'ALL' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED'>('ALL');
  const [selectedOrderPatientId, setSelectedOrderPatientId] = useState<string | null>(null);

  const filteredQueue = queue.filter((q) => {
    if (activeTab === 'ALL') return true;
    return q.status === activeTab;
  });

  const handleCallPatient = (item: QueueItem) => {
    updateQueueStatus(item.id, 'IN_CONSULTATION');
    addNotification(`اعلام فراخوان شماره ${item.queueNumber} — بیمار ${item.patientName} به اتاق پزشک.`, 'success');
  };

  return (
    <div className="p-6 space-y-6 text-[var(--text-main)] max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">صف انتظار و نوبت‌دهی پذیرش سالن کلینیک</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              مدیریت و فراخوان نوبت‌های حضوری بیماران در انتظار معاینه
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewAppointmentModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ثبت نوبت جدید (F2)</span>
        </button>
      </div>

      {/* Active Shift & Responsible Staff Banner */}
      {activeShiftConfig && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>مسئولین شیفت فعال ({activeShiftConfig.shiftNameFa} — {activeShiftConfig.startTime} الی {activeShiftConfig.endTime}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
            <span className="bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              پزشک شیفت: <strong className="text-blue-600 dark:text-blue-400">{activeShiftConfig.assignedStaff.DOCTOR}</strong>
            </span>
            <span className="bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              مسئول پذیرش: <strong className="text-blue-600 dark:text-blue-400">{activeShiftConfig.assignedStaff.RECEPTIONIST}</strong>
            </span>
            <span className="bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              پرستار شیفت: <strong className="text-blue-600 dark:text-blue-400">{activeShiftConfig.assignedStaff.NURSE}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Queue Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          همه نوبت‌ها ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('WAITING')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'WAITING'
              ? 'bg-amber-500 text-white shadow'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          در انتظار ({queue.filter((q) => q.status === 'WAITING').length})
        </button>
        <button
          onClick={() => setActiveTab('IN_CONSULTATION')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'IN_CONSULTATION'
              ? 'bg-blue-600 text-white shadow'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          در حال معاینه ({queue.filter((q) => q.status === 'IN_CONSULTATION').length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          تکمیل شده ({queue.filter((q) => q.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Queue Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQueue.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
            هیچ نوبتی در این بخش وجود ندارد.
          </div>
        ) : (
          filteredQueue.map((item) => (
            <div
              key={item.id}
              onContextMenu={(e) => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, 'queue', item);
              }}
              className={`p-5 rounded-2xl border bg-[var(--bg-surface)] shadow-sm space-y-3 transition relative overflow-hidden ${
                item.status === 'IN_CONSULTATION'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-[var(--border-subtle)]'
              }`}
            >
              {/* Queue Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black font-mono text-sm shadow">
                    #{item.queueNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">{item.patientName}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">پرونده: {item.fileNumber}</p>
                  </div>
                </div>

                <span className="font-mono text-xs text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {item.scheduledTime}
                </span>
              </div>

              {/* Doctor and Visit Notes */}
              <div className="text-xs space-y-1.5 p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[var(--text-muted)]">پزشک / سرویس: </span>
                    <span className="font-bold">{item.doctorName}</span>
                  </div>

                  {item.patientType === 'EXTERNAL_DOCTOR' ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-bold rounded-md">
                      نسخه خارج کلینیک
                    </span>
                  ) : item.visitMode === 'DIRECT_SERVICE' || item.patientType === 'NO_DOCTOR' ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold rounded-md">
                      خدمت مستقیم پرستاری
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] font-bold rounded-md">
                      ویزیت پزشک
                    </span>
                  )}
                </div>

                {item.externalDoctorDetails && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/60">
                    پزشک صادرکننده: {item.externalDoctorDetails.doctorName || 'نامشخص'} | مرکز: {item.externalDoctorDetails.clinicName || 'سایر'}
                  </div>
                )}

                {item.directServicesList && item.directServicesList.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.directServicesList.map((srv, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold rounded">
                        {srv}
                      </span>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <div className="text-[11px] text-[var(--text-muted)] truncate pt-0.5">
                    ملاحظات: {item.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrderPatientId(item.patientId)}
                    className="w-full py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>سفارش و صورتحساب بیمار</span>
                  </button>
                </div>

                {item.status === 'WAITING' && (
                  <button
                    onClick={() => handleCallPatient(item)}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>فراخوان به اتاق پزشک</span>
                  </button>
                )}

                {item.status === 'IN_CONSULTATION' && (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => setActiveModule('doctor_emr')}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>ثبت نسخه در EMR</span>
                    </button>
                    <button
                      onClick={() => updateQueueStatus(item.id, 'COMPLETED')}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow transition"
                      title="اتمام معاینه"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {item.status === 'COMPLETED' && (
                  <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ویزیت این بیمار تکمیل گردید</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <PatientOrderWorkflowModal
        patientId={selectedOrderPatientId || undefined}
        isOpen={!!selectedOrderPatientId}
        onClose={() => setSelectedOrderPatientId(null)}
      />
    </div>
  );
};
