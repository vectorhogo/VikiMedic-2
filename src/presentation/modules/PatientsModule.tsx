/**
 * VikiMedic v2 - Patient Registry Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  FileText,
  Phone,
  Download,
  Filter,
  Eye,
  Stethoscope,
  X,
  Printer,
  Calendar,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { Patient, MedicalRecord } from '../../domain/types';
import { ExportService } from '../../infrastructure/exportService';

export const PatientsModule: React.FC = () => {
  const {
    patients,
    medicalRecords,
    setIsNewPatientModalOpen,
    setActiveModule,
    showContextMenu,
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterInsurance, setFilterInsurance] = useState<string>('ALL');
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.firstName.includes(searchTerm) ||
      p.lastName.includes(searchTerm) ||
      p.nationalId.includes(searchTerm) ||
      p.fileNumber.includes(searchTerm) ||
      p.phone.includes(searchTerm);

    const matchesInsurance = filterInsurance === 'ALL' || p.insuranceType === filterInsurance;

    return matchesSearch && matchesInsurance;
  });

  return (
    <div className="p-6 space-y-6 text-[var(--text-main)] max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Module Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">دفتر کامل پرونده بیماران کلینیک</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              مدیریت و بایگانی الکترونیکی پرونده‌های پزشکی بیماران ({patients.length} پرونده ثبت‌شده)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => ExportService.exportPatientsToCSV(filteredPatients)}
            className="px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>خروجی Excel/CSV</span>
          </button>
          <button
            onClick={() => setIsNewPatientModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت بیمار جدید</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، کد ملی، شماره پرونده یا شماره همراه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Insurance Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <select
            value={filterInsurance}
            onChange={(e) => setFilterInsurance(e.target.value)}
            className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs font-medium outline-none w-full sm:w-auto"
          >
            <option value="ALL">همه بیمه‌ها</option>
            <option value="TAMIN_INJTIMAI">تامین اجتماعی</option>
            <option value="SALAMAT">بیمه سلامت</option>
            <option value="NIZAM_LASHKARI">نیروهای مسلح</option>
            <option value="FREE">آزاد (بدون بیمه)</option>
          </select>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="p-3 font-bold">شماره پرونده</th>
                <th className="p-3 font-bold">نام و نام خانوادگی</th>
                <th className="p-3 font-bold">کد ملی</th>
                <th className="p-3 font-bold">شماره همراه</th>
                <th className="p-3 font-bold">بیمه پایه</th>
                <th className="p-3 font-bold">گروه خونی</th>
                <th className="p-3 font-bold">آخرین مراجعه</th>
                <th className="p-3 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    هیچ پرونده بیماری با مشخصات وارد شده یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      showContextMenu(e.clientX, e.clientY, 'patient', patient);
                    }}
                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition cursor-context-menu"
                  >
                    <td className="p-3 font-bold font-mono text-blue-600">{patient.fileNumber}</td>
                    <td className="p-3 font-bold">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="p-3 font-mono">{patient.nationalId}</td>
                    <td className="p-3 font-mono text-[var(--text-muted)]">{patient.phone}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-[var(--border-subtle)]">
                        {patient.insuranceType === 'TAMIN_INJTIMAI' ? 'تامین اجتماعی' : patient.insuranceType}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-500">{patient.bloodType || '-'}</td>
                    <td className="p-3 text-[var(--text-muted)]">{patient.lastVisitDate || 'جدید'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedPatientForDetail(patient)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg text-blue-600 transition"
                          title="مشاهده کامل پرونده"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveModule('doctor_emr')}
                          className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg text-purple-600 transition"
                          title="ثبت معاینه پزشک"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatientForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)] max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>
                  پرونده کامل پزشکی: {selectedPatientForDetail.firstName} {selectedPatientForDetail.lastName} ({selectedPatientForDetail.fileNumber})
                </span>
              </div>
              <button onClick={() => setSelectedPatientForDetail(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] font-medium">
                <div>کد ملی: <strong className="font-mono">{selectedPatientForDetail.nationalId}</strong></div>
                <div>شماره همراه: <strong className="font-mono">{selectedPatientForDetail.phone}</strong></div>
                <div>نام پدر: <strong>{selectedPatientForDetail.fatherName || '-'}</strong></div>
                <div>تاریخ تولد: <strong>{selectedPatientForDetail.birthDate}</strong></div>
                <div>نوع بیمه: <strong>{selectedPatientForDetail.insuranceType}</strong></div>
                <div>گروه خونی: <strong className="text-rose-500 font-bold">{selectedPatientForDetail.bloodType || '-'}</strong></div>
              </div>

              {/* Warnings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="font-bold text-amber-800 dark:text-amber-300 mb-1">حساسیت‌های دارویی و غذایی:</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    {selectedPatientForDetail.allergies?.join('، ') || 'هیچ حساسیتی ثبت نشده است.'}
                  </div>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl">
                  <div className="font-bold text-rose-800 dark:text-rose-300 mb-1">بیماری‌های زمینه‌ای:</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    {selectedPatientForDetail.chronicDiseases?.join('، ') || 'هیچ سابقه بیماری ثبت نشده است.'}
                  </div>
                </div>
              </div>

              {/* Medical Visits History */}
              <div>
                <h3 className="font-bold text-sm mb-3">سوابق معاینات و نسخه‌های قبلی</h3>
                {medicalRecords.filter((m) => m.patientId === selectedPatientForDetail.id).length === 0 ? (
                  <p className="text-slate-400 italic">هیچ نسخه یا معاینه قبلی برای این بیمار ثبت نشده است.</p>
                ) : (
                  <div className="space-y-3">
                    {medicalRecords
                      .filter((m) => m.patientId === selectedPatientForDetail.id)
                      .map((mr) => (
                        <div key={mr.id} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-2">
                          <div className="flex items-center justify-between font-bold">
                            <span>پزشک: {mr.doctorName}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">{mr.visitDate}</span>
                          </div>
                          <p><strong>تشخیص: </strong>{mr.diagnosis}</p>
                          {mr.prescriptions.length > 0 && (
                            <div className="text-[11px] text-[var(--text-muted)]">
                              داروهای تجویزی: {mr.prescriptions.map((p) => p.drugName).join(' ، ')}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
