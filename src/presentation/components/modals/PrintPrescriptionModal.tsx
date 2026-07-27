/**
 * VikiMedic v2 - Official Persian Prescription Print Modal
 * Clean Architecture Layer: Presentation
 */

import React from 'react';
import { X, Printer, Stethoscope, FileCheck } from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';

export const PrintPrescriptionModal: React.FC = () => {
  const { activePrintPrescription, setActivePrintPrescription, activeClinic, patients } = useClinic();

  if (!activePrintPrescription) return null;

  const mr = activePrintPrescription;
  const patient = patients.find((p) => p.id === mr.patientId);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white text-slate-900 border border-slate-300 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Controls */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <span className="font-bold text-xs flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span>پیش‌نمایش چاپ نسخه پزشکی و دستورات دارویی</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ نسخه</span>
            </button>
            <button
              onClick={() => setActivePrintPrescription(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Sheet */}
        <div className="p-8 space-y-6 text-xs bg-white text-slate-900 font-sans overflow-y-auto">
          {/* Header Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-base font-black text-slate-900">{mr.doctorName}</h1>
              <p className="text-xs text-blue-800 font-bold mt-0.5">شماره نظام پزشکی: {mr.medicalCouncilNumber}</p>
              <p className="text-[11px] text-slate-600">{activeClinic.name}</p>
            </div>
            <div className="text-left font-mono space-y-1 text-[11px]">
              <div className="font-bold text-slate-800">برگه نسخه الکترونیک پزشکی (Rx)</div>
              <div>تاریخ مراجعه: {mr.visitDate}</div>
              <div>کد پیگیری نسخه: <strong className="text-blue-700">{mr.id.substring(0, 10)}</strong></div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium">
            <div>نام بیمار: <strong>{patient ? `${patient.firstName} ${patient.lastName}` : 'بیمار'}</strong></div>
            <div>کد ملی: <strong className="font-mono">{patient?.nationalId}</strong></div>
            <div>شماره پرونده: <strong className="font-mono">{patient?.fileNumber}</strong></div>
            <div>بیمه پایه: <strong>{patient?.insuranceType || 'آزاد'}</strong></div>
            <div>فشار خون: <strong>{mr.systolicBP ? `${mr.systolicBP}/${mr.diastolicBP} mmHg` : '-'}</strong></div>
            <div>وزن: <strong>{mr.weight ? `${mr.weight} kg` : '-'}</strong></div>
          </div>

          {/* Diagnosis & Chief Complaint */}
          <div className="space-y-1 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div><span className="font-bold text-slate-700">شرح حال بیمار: </span><span>{mr.chiefComplaint}</span></div>
            <div><span className="font-bold text-blue-900">تشخیص اولیه پزشک: </span><span className="font-bold text-blue-900">{mr.diagnosis}</span></div>
          </div>

          {/* Rx Drugs List */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm border-b pb-1 text-slate-800 flex items-center gap-1.5">
              <span className="text-base font-serif italic text-blue-700">Rx</span>
              <span>اقلام دارویی تجویز شده:</span>
            </h3>
            {mr.prescriptions.length === 0 ? (
              <p className="text-slate-500 italic">هیچ دارویی ثبت نشده است.</p>
            ) : (
              <div className="space-y-2">
                {mr.prescriptions.map((p, idx) => (
                  <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {idx + 1}. {p.drugName}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        دستور مصرف: <strong className="text-blue-800">{p.dosage}</strong>
                      </div>
                      {p.instructions && (
                        <div className="text-[10px] text-slate-500">توضیحات: {p.instructions}</div>
                      )}
                    </div>
                    <div className="font-mono font-bold text-slate-800 text-xs bg-slate-200 px-2 py-1 rounded">
                      تعداد: {p.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Treatment Notes */}
          {mr.treatmentNotes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold mb-1">توصیه‌های بهداشتی و درمانی:</div>
              <p className="text-[11px] leading-relaxed text-slate-700">{mr.treatmentNotes}</p>
            </div>
          )}

          {/* Next Visit Date */}
          {mr.nextVisitDate && (
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              تاریخ مراجعه بعدی: {mr.nextVisitDate}
            </div>
          )}

          {/* Signature Zone */}
          <div className="pt-12 flex justify-between items-end text-center text-xs text-slate-500 font-medium">
            <div>آدرس کلینیک: {activeClinic.address}</div>
            <div className="border border-slate-300 p-4 rounded-xl min-w-[180px] space-y-1">
              <div className="font-bold text-slate-900">{mr.doctorName}</div>
              <div className="text-[10px] text-slate-400">مهر و امضاء پزشک معالج</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
