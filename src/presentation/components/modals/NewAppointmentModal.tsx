/**
 * VikiMedic v2 - Direct Service & Quick Appointment Registration Modal
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, Check, User, Stethoscope, Syringe, Building2, FileText, AlertCircle } from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { VisitCareMode, PatientCareType } from '../../../domain/types';

export const NewAppointmentModal: React.FC = () => {
  const {
    isNewAppointmentModalOpen,
    setIsNewAppointmentModalOpen,
    patients,
    staffList,
    addQueueItem,
    addNotification,
    directServiceConfig,
    activeUser,
  } = useClinic();

  const doctors = staffList.filter((s) => s.role === 'DOCTOR' || s.role === 'ADMIN');

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [visitMode, setVisitMode] = useState<VisitCareMode>('DOCTOR_CONSULTATION');
  const [patientType, setPatientType] = useState<PatientCareType>('INTERNAL_DOCTOR');

  // Doctor selection
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');

  // External Doctor Details
  const [extDoctorName, setExtDoctorName] = useState('');
  const [extClinicName, setExtClinicName] = useState('');
  const [extHospitalName, setExtHospitalName] = useState('');
  const [extPrescriptionNo, setExtPrescriptionNo] = useState('');
  const [extNotes, setExtNotes] = useState('');

  // Direct Services Selected
  const [selectedServices, setSelectedServices] = useState<string[]>(['تزریقات']);

  const [scheduledTime, setScheduledTime] = useState('10:30');
  const [visitType, setVisitType] = useState<any>('SPECIALIST');
  const [notes, setNotes] = useState('');

  if (!isNewAppointmentModalOpen) return null;

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);

    if (!patient) {
      alert('لطفاً بیمار را انتخاب فرمائید.');
      return;
    }

    let doctorId = selectedDoctorId;
    let doctorName = 'بدون ویزیت پزشک (خدمت مستقیم)';

    if (visitMode === 'DOCTOR_CONSULTATION' || patientType === 'INTERNAL_DOCTOR') {
      const doctor = staffList.find((s) => s.id === selectedDoctorId);
      if (!doctor) {
        alert('لطفاً پزشک معالج را انتخاب فرمائید.');
        return;
      }
      doctorId = doctor.id;
      doctorName = doctor.fullName;
    } else if (patientType === 'EXTERNAL_DOCTOR') {
      doctorName = `پزشک خارج کلینیک: ${extDoctorName || 'نامشخص'}`;
    }

    addQueueItem({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      patientNationalId: patient.nationalId,
      fileNumber: patient.fileNumber,
      doctorId,
      doctorName,
      scheduledTime,
      status: 'WAITING',
      visitType: visitMode === 'DIRECT_SERVICE' ? 'DIRECT_SERVICE' : visitType,
      visitMode,
      patientType,
      externalDoctorDetails:
        patientType === 'EXTERNAL_DOCTOR'
          ? {
              doctorName: extDoctorName,
              clinicName: extClinicName,
              hospitalName: extHospitalName,
              prescriptionNumber: extPrescriptionNo,
              notes: extNotes,
            }
          : undefined,
      directServicesList: visitMode === 'DIRECT_SERVICE' || patientType === 'NO_DOCTOR' ? selectedServices : undefined,
      notes: notes || (visitMode === 'DIRECT_SERVICE' ? `خدمات مستقیم: ${selectedServices.join(' - ')}` : ''),
    });

    addNotification(
      `نوبت بیمار ${patient.firstName} ${patient.lastName} (${
        visitMode === 'DIRECT_SERVICE' ? 'خدمت مستقیم پرستاری' : 'ویزیت پزشک'
      }) در صف ثبت شد.`,
      'success'
    );

    setIsNewAppointmentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[4000] z-modal-backdrop bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)] z-[4010] z-modal-dialog animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky-modal-header p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>پذیرش بیمار و ثبت نوبت (Direct Service & Reception)</span>
          </div>
          <button onClick={() => setIsNewAppointmentModalOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Patient Selector */}
          <div>
            <label className="block mb-1 font-bold text-slate-800">انتخاب بیمار *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none font-bold"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} — کد ملی: {p.nationalId} (پرونده: {p.fileNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Visit Care Mode Toggle (Doctor Consultation VS Direct Service Only) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800">حالت پذیرش بیمار (Workflow Mode)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setVisitMode('DOCTOR_CONSULTATION');
                  setPatientType('INTERNAL_DOCTOR');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  visitMode === 'DOCTOR_CONSULTATION'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>نیازمند ویزیت پزشک</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVisitMode('DIRECT_SERVICE');
                  setPatientType('NO_DOCTOR');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  visitMode === 'DIRECT_SERVICE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Syringe className="w-4 h-4" />
                <span>خدمت مستقیم پرستاری (بدون ویزیت)</span>
              </button>
            </div>
          </div>

          {/* Patient Type Radio Selection */}
          <div>
            <label className="block mb-1 font-bold text-slate-800">نوع مراجعه (Patient Type)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'INTERNAL_DOCTOR', label: 'پزشک داخلی' },
                { id: 'EXTERNAL_DOCTOR', label: 'نسخه خارج کلینیک' },
                { id: 'NO_DOCTOR', label: 'بدون نیاز به پزشک' },
                { id: 'EMERGENCY', label: 'اورژانس' },
              ].map((pt) => (
                <button
                  type="button"
                  key={pt.id}
                  onClick={() => {
                    setPatientType(pt.id as PatientCareType);
                    if (pt.id === 'NO_DOCTOR') setVisitMode('DIRECT_SERVICE');
                    else if (pt.id === 'INTERNAL_DOCTOR') setVisitMode('DOCTOR_CONSULTATION');
                  }}
                  className={`p-2 rounded-xl text-[11px] font-bold border transition text-center ${
                    patientType === pt.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Case 1: Internal Doctor Selection */}
          {(patientType === 'INTERNAL_DOCTOR' || visitMode === 'DOCTOR_CONSULTATION') && (
            <div>
              <label className="block mb-1 font-bold text-slate-800">پزشک معالج *</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none font-bold"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.title})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Case 2: External Doctor Fields */}
          {patientType === 'EXTERNAL_DOCTOR' && (
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>اطلاعات پزشک خارج کلینیک / نسخه تجویز شده</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">نام پزشک صادرکننده نسخه *</label>
                  <input
                    type="text"
                    value={extDoctorName}
                    onChange={(e) => setExtDoctorName(e.target.value)}
                    placeholder="مثال: دکتر علیرضا نوری"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">شماره نسخه / پیگیری</label>
                  <input
                    type="text"
                    value={extPrescriptionNo}
                    onChange={(e) => setExtPrescriptionNo(e.target.value)}
                    placeholder="مثال: 9812401"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">مطب / مطب ارجاع‌دهنده</label>
                  <input
                    type="text"
                    value={extClinicName}
                    onChange={(e) => setExtClinicName(e.target.value)}
                    placeholder="مثال: مطب دکتر نوری"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">بیمارستان / مرکز درمانی</label>
                  <input
                    type="text"
                    value={extHospitalName}
                    onChange={(e) => setExtHospitalName(e.target.value)}
                    placeholder="مثال: بیمارستان شریعتی"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Case 3: Direct Services Selector */}
          {(visitMode === 'DIRECT_SERVICE' || patientType === 'NO_DOCTOR' || patientType === 'EXTERNAL_DOCTOR') && (
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
              <label className="block font-bold text-emerald-900 text-xs">انتخاب خدمات مستقیم پذیرش (Direct Services)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {directServiceConfig.enabledServices.map((srv) => {
                  const isChecked = selectedServices.includes(srv);
                  return (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => toggleService(srv)}
                      className={`p-2 rounded-lg text-[11px] font-bold border transition text-right flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{srv}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scheduled Time & Visit Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-slate-800">زمان حضور (ساعت)</label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="10:30"
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-center font-mono outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-800">نوع نوبت</label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
              >
                <option value="SPECIALIST">معاینه تخصصی</option>
                <option value="GENERAL">معاینه عمومی</option>
                <option value="CHECKUP">چکاپ دوره ای</option>
                <option value="EMERGENCY">اورژانس / فوری</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1 font-bold text-slate-800">توضیحات پذیرش</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات تکمیلی نوبت..."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewAppointmentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-100"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>ثبت پذیرش و ورود به صف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
