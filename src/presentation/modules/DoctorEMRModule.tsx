/**
 * VikiMedic v2 - Doctor EMR Workspace & Prescription Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Trash2,
  Printer,
  Save,
  User,
  HeartPulse,
  Pill,
  FileText,
  Activity,
  CheckCircle,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { PrescriptionItem, Patient, PatientOrderItem } from '../../domain/types';
import { PatientOrderWorkflowModal } from '../components/orders/PatientOrderWorkflowModal';

// Sample Persian Drug Database
const COMMON_DRUGS = [
  'قرص لوزارتان ۵۰ میلی‌گرم (Losartan 50mg)',
  'قرص متفورمین ۵۰۰ میلی‌گرم (Metformin 500mg)',
  'کپسول آموکسی‌سیلین ۵۰۰ میلی‌گرم (Amoxicillin 500mg)',
  'قرص آتورواستاتین ۲۰ میلی‌گرم (Atorvastatin 20mg)',
  'قرص آسپیرین ۸۰ میلی‌گرم (Aspirin 80mg)',
  'شربت دیفن‌هیدرامین کامپاند (Diphenhydramine Compound)',
  'آمپول نوروبیون (Neurobion Injectable)',
  'قرص مفنامیک اسید ۲۵۰ میلی‌گرم (Mefenamic Acid 250mg)',
  'قرص فاموتیدین ۴۰ میلی‌گرم (Famotidine 40mg)',
  'اسپری سالبوتامول (Salbutamol Inhaler)',
];

export const DoctorEMRModule: React.FC = () => {
  const {
    patients,
    activeUser,
    addMedicalRecord,
    setActivePrintPrescription,
    addNotification,
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [systolicBP, setSystolicBP] = useState<number>(120);
  const [diastolicBP, setDiastolicBP] = useState<number>(80);
  const [pulseRate, setPulseRate] = useState<number>(75);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [weight, setWeight] = useState<number>(75);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('۱۴۰۳/۰۶/۰۱');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Prescription Items
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'p-1',
      drugName: 'قرص لوزارتان ۵۰ میلی‌گرم (Losartan 50mg)',
      dosage: 'روزانه ۱ عدد صبح‌ها بعد از غذا',
      quantity: 30,
      instructions: 'همراه با یک لیوان کامل آب',
    },
  ]);

  const [customDrugName, setCustomDrugName] = useState('');
  const [customDosage, setCustomDosage] = useState('هر ۸ ساعت ۱ عدد');
  const [customQty, setCustomQty] = useState(30);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleAddDrug = () => {
    if (!customDrugName) return;
    const newItem: PrescriptionItem = {
      id: 'p-' + Date.now(),
      drugName: customDrugName,
      dosage: customDosage,
      quantity: customQty,
    };
    setPrescriptions((prev) => [...prev, newItem]);
    setCustomDrugName('');
  };

  const handleRemoveDrug = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveAndPrint = () => {
    if (!activePatient) {
      alert('لطفاً بیمار را انتخاب کنید.');
      return;
    }
    if (!diagnosis) {
      alert('لطفاً تشخیص پزشکی اولیه را وارد کنید.');
      return;
    }

    const newRecord = addMedicalRecord({
      patientId: activePatient.id,
      doctorId: activeUser.id,
      doctorName: activeUser.fullName,
      medicalCouncilNumber: activeUser.medicalCouncilNumber || '۱۰۴۵۸۲',
      chiefComplaint,
      diagnosis,
      systolicBP,
      diastolicBP,
      pulseRate,
      temperature,
      weight,
      treatmentNotes,
      prescriptions,
      nextVisitDate,
    });

    setActivePrintPrescription(newRecord);
  };

  return (
    <div className="p-6 space-y-6 text-[var(--text-main)] max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">میز کار تخصصی پزشک و ثبت نسخه الکترونیک (EMR)</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              پزشک معالج: {activeUser.fullName} (کد نظام پزشکی: {activeUser.medicalCouncilNumber || '۱۰۴۵۸۲'})
            </p>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs font-bold outline-none w-full sm:w-80"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                بیمار: {p.firstName} {p.lastName} — پرونده: {p.fileNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Vitals & Info Banner */}
      {activePatient && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {activePatient.firstName[0]}
              </div>
              <div>
                <h2 className="font-bold text-sm">
                  {activePatient.firstName} {activePatient.lastName} ({activePatient.gender === 'MALE' ? 'مرد' : 'زن'})
                </h2>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3 mt-0.5">
                  <span>کد ملی: {activePatient.nationalId}</span>
                  <span>•</span>
                  <span>تلفن: {activePatient.phone}</span>
                  <span>•</span>
                  <span>بیمه: {activePatient.insuranceType}</span>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              گروه خونی: {activePatient.bloodType || 'نامشخص'}
            </span>
          </div>

          {/* Vitals Inputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">فشار سیستولیک (mmHg)</span>
              <input
                type="number"
                value={systolicBP}
                onChange={(e) => setSystolicBP(Number(e.target.value))}
                className="w-full bg-slate-950 text-emerald-400 font-mono font-bold px-2 py-1 rounded outline-none text-center"
              />
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">فشار دیاستولیک (mmHg)</span>
              <input
                type="number"
                value={diastolicBP}
                onChange={(e) => setDiastolicBP(Number(e.target.value))}
                className="w-full bg-slate-950 text-emerald-400 font-mono font-bold px-2 py-1 rounded outline-none text-center"
              />
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">ضربان قلب (bpm)</span>
              <input
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(Number(e.target.value))}
                className="w-full bg-slate-950 text-blue-400 font-mono font-bold px-2 py-1 rounded outline-none text-center"
              />
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">درجه حرارت (°C)</span>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full bg-slate-950 text-amber-400 font-mono font-bold px-2 py-1 rounded outline-none text-center"
              />
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block mb-1">وزن بیمار (kg)</span>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-slate-950 text-purple-400 font-mono font-bold px-2 py-1 rounded outline-none text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Form: Chief Complaint & Prescription Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Complaint & Diagnosis */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-sm flex items-center gap-2 text-blue-600">
            <FileText className="w-4 h-4" />
            <span>شرح حال بیمار و تشخیص اولیه</span>
          </h2>

          <div>
            <label className="block mb-1 font-bold">شرح حال اولیه (Chief Complaint) *</label>
            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="علامت‌های بیمار، سردرد، سرگیجه، تب..."
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold">تشخیص نهایی / اولیه پزشک (Diagnosis) *</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="مثال: فشار خون بالا (Hypertension)"
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold">توصیه‌های درمانی و بهداشتی</label>
            <textarea
              rows={3}
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="تغذیه، ورزش، زمان مراجعه بعدی..."
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold">تاریخ ویزیت بعدی</label>
            <input
              type="text"
              value={nextVisitDate}
              onChange={(e) => setNextVisitDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
            />
          </div>
        </div>

        {/* Right Column: Prescription Builder */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-sm flex items-center gap-2 text-emerald-600">
            <Pill className="w-4 h-4" />
            <span>تجویز داروها (Rx)</span>
          </h2>

          {/* Quick Drug Adder */}
          <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] space-y-2">
            <div className="font-bold text-[11px] text-[var(--text-muted)]">افزودن دارو از بانک داروخانه</div>
            
            <input
              type="text"
              list="drug-suggestions"
              value={customDrugName}
              onChange={(e) => setCustomDrugName(e.target.value)}
              placeholder="نام دارو (فارسی یا انگلیسی)..."
              className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] outline-none"
            />
            <datalist id="drug-suggestions">
              {COMMON_DRUGS.map((d, i) => (
                <option key={i} value={d} />
              ))}
            </datalist>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={customDosage}
                  onChange={(e) => setCustomDosage(e.target.value)}
                  placeholder="دستور مصرف (مثلا: هر ۸ ساعت ۱ عدد)"
                  className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] outline-none"
                />
              </div>
              <input
                type="number"
                value={customQty}
                onChange={(e) => setCustomQty(Number(e.target.value))}
                placeholder="تعداد"
                className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] outline-none font-mono text-center"
              />
            </div>

            <button
              onClick={handleAddDrug}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن دارو به نسخه</span>
            </button>
          </div>

          {/* Added Drugs List */}
          <div className="space-y-2">
            <div className="font-bold text-[11px] text-[var(--text-muted)]">اقلام موجود در نسخه فعلی:</div>
            {prescriptions.length === 0 ? (
              <p className="p-4 text-center text-slate-400 italic">هیچ دارویی اضافه نشده است.</p>
            ) : (
              prescriptions.map((p, idx) => (
                <div key={p.id} className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs">{idx + 1}. {p.drugName}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">دستور: {p.dosage} — تعداد: {p.quantity}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveDrug(p.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action Button: Save & Print */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
            <button
              onClick={handleSaveAndPrint}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition"
            >
              <Printer className="w-4 h-4" />
              <span>ثبت در پرونده و چاپ نسخه چاپی (Rx)</span>
            </button>

            <button
              onClick={() => {
                if (!activePatient) return;
                setIsOrderModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition"
            >
              <Receipt className="w-4 h-4" />
              <span>ارسال سفارش کامل به پذیرش و صندوق (Patient Order)</span>
            </button>
          </div>
        </div>
      </div>

      <PatientOrderWorkflowModal
        patientId={selectedPatientId}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
};
