/**
 * VikiMedic v2 - New Patient Registration Modal
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { X, UserPlus, ShieldAlert, Check } from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { Gender, Patient } from '../../../domain/types';

export const NewPatientModal: React.FC = () => {
  const { isNewPatientModalOpen, setIsNewPatientModalOpen, addPatient } = useClinic();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [birthDate, setBirthDate] = useState('۱۳۷۰/۰۱/۰۱');
  const [insuranceType, setInsuranceType] = useState<Patient['insuranceType']>('TAMIN_INJTIMAI');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [bloodType, setBloodType] = useState<Patient['bloodType']>('O+');
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [address, setAddress] = useState('');

  if (!isNewPatientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !nationalId || !phone) {
      alert('لطفاً تمامی فیلدهای ضروری (نام، نام خانوادگی، کد ملی و شماره همراه) را تکمیل فرمائید.');
      return;
    }

    addPatient({
      firstName,
      lastName,
      fatherName,
      nationalId,
      phone,
      gender,
      birthDate,
      insuranceType,
      insuranceNumber,
      bloodType,
      allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
      chronicDiseases: chronicDiseases ? chronicDiseases.split(',').map((s) => s.trim()) : [],
      address,
    });

    setIsNewPatientModalOpen(false);
    // Reset form
    setFirstName('');
    setLastName('');
    setNationalId('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 z-[4000] z-modal-backdrop bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)] z-[4010] z-modal-dialog animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="sticky-modal-header p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span>تشکیل پرونده پزشکی بیمار جدید</span>
          </div>
          <button onClick={() => setIsNewPatientModalOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* First Name */}
            <div>
              <label className="block mb-1 font-bold">نام بیمار *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثال: علیرضا"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block mb-1 font-bold">نام خانوادگی *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="مثال: رضایی پور"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* National ID */}
            <div>
              <label className="block mb-1 font-bold">کد ملی (۱۰ رقمی) *</label>
              <input
                type="text"
                required
                maxLength={10}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="0012345678"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono text-left focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block mb-1 font-bold">شماره تلفن همراه *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono text-left focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Father Name */}
            <div>
              <label className="block mb-1 font-medium">نام پدر</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="مثال: محمد"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 font-medium">جنسیت</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              >
                <option value="MALE">مرد</option>
                <option value="FEMALE">زن</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block mb-1 font-medium">تاریخ تولد (شمسی)</label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="۱۳۷۰/۰۱/۰۱"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono text-left outline-none"
              />
            </div>

            {/* Insurance Type */}
            <div>
              <label className="block mb-1 font-medium">نوع بیمه پایه</label>
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              >
                <option value="TAMIN_INJTIMAI">بیمه تامین اجتماعی</option>
                <option value="SALAMAT">بیمه سلامت / خدمات درمانی</option>
                <option value="NIZAM_LASHKARI">بیمه نیروهای مسلح</option>
                <option value="KOMITEH">کمیته امداد</option>
                <option value="FREE">آزاد (بدون بیمه)</option>
              </select>
            </div>

            {/* Blood Type */}
            <div>
              <label className="block mb-1 font-medium">گروه خونی</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Insurance Number */}
            <div>
              <label className="block mb-1 font-medium">شماره دفترچه / بیمه</label>
              <input
                type="text"
                value={insuranceNumber}
                onChange={(e) => setInsuranceNumber(e.target.value)}
                placeholder="123456789"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono text-left outline-none"
              />
            </div>
          </div>

          {/* Allergies & Medical Warnings */}
          <div className="space-y-2 text-xs pt-2 border-t border-[var(--border-subtle)]">
            <div>
              <label className="block mb-1 font-bold text-amber-600 dark:text-amber-400">حساسیت‌های دارویی و غذایی (با کاما جدا کنید)</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="مثال: پنی‌سیلین، آسپیرین، گرد و غبار"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-rose-600 dark:text-rose-400">بیماری‌های زمینه‌ای (دیابت، فشار خون و ...)</label>
              <input
                type="text"
                value={chronicDiseases}
                onChange={(e) => setChronicDiseases(e.target.value)}
                placeholder="مثال: دیابت نوع ۲، فشار خون بالا"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">آدرس محل سکونت</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="تهران، خیابان..."
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewPatientModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>ثبت پرونده و ذخیره</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
