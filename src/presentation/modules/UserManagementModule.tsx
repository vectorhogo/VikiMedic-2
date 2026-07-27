/**
 * VikiMedic v2 - Dedicated User Management Module (Patch 03.0)
 * Settings -> User Management
 */

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  History,
  ShieldCheck,
  Search,
  Key,
  Lock,
  Building2,
  CheckCircle2,
  Sliders,
  Monitor,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { UserStaff } from '../../domain/types';
import { UserManagementTable } from '../components/users/UserManagementTable';
import { CreateUserForm } from '../components/users/CreateUserForm';
import { UserDetailModal } from '../components/users/UserDetailModal';
import { UserActivityLogsPanel } from '../components/users/UserActivityLogsPanel';
import { SessionMonitorPanel } from '../components/users/SessionMonitorPanel';

interface UserManagementModuleProps {
  initialTab?: 'list' | 'create' | 'sessions' | 'logs';
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  initialTab = 'list',
}) => {
  const { staffList, userManagementLogs } = useClinic();

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'sessions' | 'logs'>(initialTab);
  const [selectedUser, setSelectedUser] = useState<UserStaff | null>(null);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>تنظیمات پیشرفته سیستم &gt; پایه مدیریت کاربران (Patch 03.0)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">مدیریت کاربران و دسترسی‌ها</h2>
          <p className="text-xs text-slate-500 mt-1">
            تعریف کاربران جدید، مدیریت شعب و شیفت‌ها، تغییر وضعیت حساب و تنظیمات امنیتی کادر درمان.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>فهرست کاربران ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>ایجاد کاربر جدید</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'sessions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-600" />
            <span>مدیریت نشست‌ها (Sessions)</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'logs'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>سوابق امنیت ({userManagementLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'list' && (
        <UserManagementTable
          onSelectUser={(u) => setSelectedUser(u)}
          onCreateNewUserClick={() => setActiveTab('create')}
        />
      )}

      {activeTab === 'create' && (
        <CreateUserForm
          onSuccess={() => setActiveTab('list')}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {activeTab === 'sessions' && <SessionMonitorPanel />}

      {activeTab === 'logs' && <UserActivityLogsPanel />}

      {/* Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
