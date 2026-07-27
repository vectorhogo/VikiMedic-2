/**
 * VikiMedic v2 - User Management Audit Logs & History Panel
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  User,
  Clock,
  Key,
  Lock,
  UserCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';

export const UserActivityLogsPanel: React.FC = () => {
  const { userManagementLogs } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = userManagementLogs.filter((log) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      log.userName?.toLowerCase().includes(q) ||
      log.operatorName?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q);

    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchSearch && matchAction;
  });

  const getActionBadge = (act: string) => {
    switch (act) {
      case 'USER_CREATED':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">ایجاد کاربر</span>;
      case 'USER_EDITED':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">ویرایش پروفایل</span>;
      case 'STATUS_CHANGED':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">تغییر وضعیت</span>;
      case 'PASSWORD_RESET':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">بازنشانی رمز</span>;
      case 'ROLE_CHANGED':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md">تغییر نقش</span>;
      case 'PERMISSION_CHANGED':
        return <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md">تغییر دسترسی</span>;
      case 'ACCOUNT_LOCKED':
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">قفل حساب</span>;
      case 'ACCOUNT_UNLOCKED':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">رفع قفل حساب</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-md">{act}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span>سوابق و لوگ‌های امنیت و مدیریت کاربران (Audit History)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            گزارش کامل تمام عملیات‌های تعریف کاربر، تغییر نقش، بازنشانی رمز عبور و تغییر وضعیت توسط مدیران سیستم.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در سوابق..."
              className="h-10 pr-9 pl-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="ALL">همه عملیات‌ها</option>
            <option value="USER_CREATED">ایجاد کاربر</option>
            <option value="USER_EDITED">ویرایش اطلاعات</option>
            <option value="STATUS_CHANGED">تغییر وضعیت</option>
            <option value="PASSWORD_RESET">بازنشانی رمز عبور</option>
            <option value="ROLE_CHANGED">تغییر نقش</option>
            <option value="PERMISSION_CHANGED">تغییر دسترسی‌ها</option>
            <option value="ACCOUNT_LOCKED">قفل حساب</option>
            <option value="ACCOUNT_UNLOCKED">رفع قفل حساب</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="p-3">زمان ثبت</th>
              <th className="p-3">نوع اقدام</th>
              <th className="p-3">کاربر هدف</th>
              <th className="p-3">مدیر / اپراتور اقدام‌کننده</th>
              <th className="p-3">جزییات و شرح تراکنش</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  هیچ سابقه‌ای ثبت نشده است.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3">{getActionBadge(log.action)}</td>
                  <td className="p-3 font-bold text-slate-900">{log.userName}</td>
                  <td className="p-3 text-slate-700">{log.operatorName}</td>
                  <td className="p-3 text-slate-600">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
