/**
 * VikiMedic v2 - User Management List & Filtering Table
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  User,
  Shield,
  Briefcase,
  Key,
  MoreVertical,
  Edit2,
  Lock,
  Unlock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  UserPlus,
  RotateCcw,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { UserStaff, AccountStatus, UserRole } from '../../../domain/types';

interface UserManagementTableProps {
  onSelectUser: (user: UserStaff) => void;
  onCreateNewUserClick: () => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  onSelectUser,
  onCreateNewUserClick,
}) => {
  const { staffList, clinics, setUserStatus, resetUserPassword } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clinicFilter, setClinicFilter] = useState<string>('ALL');

  // Filtered List
  const filteredUsers = staffList.filter((u) => {
    // Search matching
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.nationalId?.includes(q) ||
      u.phone?.includes(q) ||
      u.mobile?.includes(q) ||
      u.title?.toLowerCase().includes(q);

    // Role matching
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

    // Status matching
    const matchStatus = statusFilter === 'ALL' || (u.accountStatus || 'ACTIVE') === statusFilter;

    // Clinic matching
    const matchClinic =
      clinicFilter === 'ALL' || (u.clinicIds && u.clinicIds.includes(clinicFilter));

    return matchSearch && matchRole && matchStatus && matchClinic;
  });

  const getStatusBadge = (st?: AccountStatus) => {
    switch (st) {
      case 'ACTIVE':
      default:
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>فعال</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-1 bg-slate-200 text-slate-800 text-[11px] font-bold rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3 text-slate-600" />
            <span>غیرفعال</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>معلق</span>
          </span>
        );
      case 'LOCKED':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full flex items-center gap-1 w-fit">
            <Lock className="w-3 h-3 text-rose-600" />
            <span>قفل‌شده</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-full w-fit">
            آرشیو
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو بر اساس نام، کدملی، نام‌کاربری یا شماره همراه..."
            className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">تمام نقش‌ها</option>
            <option value="ADMIN">Administrator (مدیر ارشد)</option>
            <option value="CLINIC_MANAGER">Clinic Manager (مدیر کلینیک)</option>
            <option value="DOCTOR">Doctor (پزشک)</option>
            <option value="RECEPTIONIST">Receptionist (پذیرش)</option>
            <option value="NURSE">Nurse (پرستار)</option>
            <option value="ACCOUNTANT">Accountant (حسابدار)</option>
            <option value="LAB_STAFF">Laboratory Staff (آزمایشگاه)</option>
            <option value="RADIOLOGY_STAFF">Radiology Staff (تصویربرداری)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">تمام وضعیت‌ها</option>
            <option value="ACTIVE">فعال (Active)</option>
            <option value="INACTIVE">غیرفعال (Inactive)</option>
            <option value="SUSPENDED">معلق (Suspended)</option>
            <option value="LOCKED">قفل‌شده (Locked)</option>
            <option value="ARCHIVED">آرشیو‌شده (Archived)</option>
          </select>

          {/* Clinic Filter */}
          <select
            value={clinicFilter}
            onChange={(e) => setClinicFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">تمام شعب</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={onCreateNewUserClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>ایجاد کاربر جدید</span>
          </button>
        </div>
      </div>

      {/* Users Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>نمایش {filteredUsers.length} کاربر از مجموع {staffList.length} کاربر ثبت‌شده در سیستم</span>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5">نام و نام خانوادگی</th>
                <th className="p-3.5">شناسه کاربری (Username)</th>
                <th className="p-3.5">کد پرسنلی / کد ملی</th>
                <th className="p-3.5">پست سازمانی و دپارتمان</th>
                <th className="p-3.5">نقش سیستم</th>
                <th className="p-3.5">وضعیت حساب</th>
                <th className="p-3.5 text-center">عملیات مدیریت</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    کاربری با مشخصات فیلترشده یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition group">
                    {/* User Name & Avatar */}
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-black flex items-center justify-center border border-slate-200">
                          {u.firstName?.[0] || u.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.mobile || u.phone || 'بدون همراه'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      {u.username || 'ثبت‌نشده'}
                    </td>

                    {/* Personnel Code / National ID */}
                    <td className="p-3.5 font-mono text-slate-700">
                      <div>کد: {u.personnelCode || '-'}</div>
                      <div className="text-[10px] text-slate-400">ملی: {u.nationalId || '-'}</div>
                    </td>

                    {/* Title & Department */}
                    <td className="p-3.5 text-slate-800">
                      <div className="font-bold">{u.title || 'کارمند'}</div>
                      <div className="text-[10px] text-slate-500">{u.department || 'عمومی'}</div>
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold rounded-lg border border-slate-200">
                        {u.role}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td className="p-3.5">
                      {getStatusBadge(u.accountStatus || 'ACTIVE')}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectUser(u)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>پرونده</span>
                        </button>

                        {u.accountStatus === 'LOCKED' ? (
                          <button
                            onClick={() => setUserStatus(u.id, 'ACTIVE', 'بازکردن قفل توسط مدیر')}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                            title="بازکردن قفل حساب"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setUserStatus(u.id, 'LOCKED', 'قفل حساب توسط مدیر')}
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                            title="قفل کردن حساب"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => resetUserPassword(u.id)}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                          title="بازنشانی رمز عبور"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
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
    </div>
  );
};
