/**
 * VikiMedic v2 - Comprehensive User Details & Audit History Modal
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Briefcase,
  Key,
  Calendar,
  Phone,
  Mail,
  Lock,
  RefreshCw,
  Clock,
  History,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Sparkles,
  Edit2,
  Save,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import {
  UserStaff,
  AccountStatus,
  UserRole,
  EmploymentType,
  ModulePermissionsMap,
  SystemModuleKey,
  PermissionAction,
} from '../../../domain/types';
import {
  SYSTEM_MODULE_DEFINITIONS,
  ALL_PERMISSION_ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
} from '../../../domain/permissions';

interface UserDetailModalProps {
  user: UserStaff;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const {
    clinics,
    updateUser,
    setUserStatus,
    resetUserPassword,
    setUserCustomPermissions,
    userManagementLogs,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'info' | 'status' | 'permissions' | 'logs'>('info');

  // Edit Mode state for general user info
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [mobile, setMobile] = useState(user.mobile || user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [nationalId, setNationalId] = useState(user.nationalId || '');
  const [personnelCode, setPersonnelCode] = useState(user.personnelCode || '');
  const [title, setTitle] = useState(user.title || '');
  const [department, setDepartment] = useState(user.department || '');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(user.employmentType || 'FULL_TIME');
  const [role, setRole] = useState<UserRole>(user.role || 'RECEPTIONIST');
  const [selectedClinicIds, setSelectedClinicIds] = useState<string[]>(user.clinicIds || []);

  // Status Change State
  const [targetStatus, setTargetStatus] = useState<AccountStatus>(user.accountStatus || 'ACTIVE');
  const [statusReason, setStatusReason] = useState('');

  // Password Reset State
  const [newPasswordCustom, setNewPasswordCustom] = useState('');
  const [generatedTempPass, setGeneratedTempPass] = useState<string | null>(null);
  const [forceChangeToggle, setForceChangeToggle] = useState(true);

  // Custom Permissions State
  const [customModules, setCustomModules] = useState<ModulePermissionsMap>(() => {
    if (user.customModulePermissions) {
      return JSON.parse(JSON.stringify(user.customModulePermissions));
    }
    return DEFAULT_ROLE_PERMISSIONS[user.role]
      ? JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[user.role]))
      : {};
  });

  const handleSaveGeneralInfo = () => {
    updateUser(user.id, {
      firstName,
      lastName,
      mobile,
      phone: mobile,
      email,
      nationalId,
      personnelCode,
      title,
      department,
      employmentType,
      role,
      clinicIds: selectedClinicIds,
    });
    setIsEditing(false);
  };

  const handleApplyStatusChange = () => {
    setUserStatus(user.id, targetStatus, statusReason);
    setStatusReason('');
  };

  const handleExecutePasswordReset = () => {
    const res = resetUserPassword(user.id, newPasswordCustom || undefined, forceChangeToggle);
    setGeneratedTempPass(res);
    setNewPasswordCustom('');
  };

  const handleSavePermissions = () => {
    setUserCustomPermissions(user.id, customModules);
  };

  const toggleModuleAction = (modKey: SystemModuleKey, act: PermissionAction) => {
    setCustomModules((prev) => {
      const currentActions = prev[modKey] || [];
      const hasAction = currentActions.includes(act);
      const newActions = hasAction
        ? currentActions.filter((a) => a !== act)
        : [...currentActions, act];
      return {
        ...prev,
        [modKey]: newActions,
      };
    });
  };

  // Filter logs related to this user
  const userRelatedLogs = userManagementLogs.filter((l) => l.userId === user.id);

  const getStatusBadge = (st: AccountStatus) => {
    switch (st) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>فعال (Active)</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-1 bg-slate-200 text-slate-800 text-xs font-bold rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>غیرفعال (Inactive)</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>معلق (Suspended)</span>
          </span>
        );
      case 'LOCKED':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>قفل‌شده (Locked)</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
            آرشیو‌شده (Archived)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center absolute left-6 top-6 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl font-black shrink-0">
              {user.firstName?.[0] || user.fullName?.[0] || 'U'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{user.fullName}</h3>
                {getStatusBadge(user.accountStatus || 'ACTIVE')}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نام کاربری: <strong className="text-white font-mono">{user.username || 'نامشخص'}</strong></span>
                </span>

                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نقش: <strong className="text-white">{user.role}</strong></span>
                </span>

                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>پست: {user.title}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Modal Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'info'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              اطلاعات کامل پرونده
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'status'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              مدیریت وضعیت و رمز عبور
            </button>

            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'permissions'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              پروفایل دسترسی‌ها
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'logs'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              سوابق و تاریخچه تغییرات ({userRelatedLogs.length})
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: Complete User Info */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">جزئیات شناسنامه‌ای و سازمانی کاربر</h4>

                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSaveGeneralInfo();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  {isEditing ? <Save className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4" />}
                  <span>{isEditing ? 'ذخیره ویرایش‌ها' : 'ویرایش اطلاعات'}</span>
                </button>
              </div>

              {isEditing ? (
                /* Editable View */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">نام</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">نام خانوادگی</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">شماره همراه</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">کد ملی</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">کد پرسنلی</label>
                    <input
                      type="text"
                      value={personnelCode}
                      onChange={(e) => setPersonnelCode(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">عنوان شغلی</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">دپارتمان</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">نقش سیستم</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl bg-white font-bold"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="CLINIC_MANAGER">CLINIC_MANAGER</option>
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="RECEPTIONIST">RECEPTIONIST</option>
                      <option value="NURSE">NURSE</option>
                      <option value="ACCOUNTANT">ACCOUNTANT</option>
                      <option value="LAB_STAFF">LAB_STAFF</option>
                      <option value="RADIOLOGY_STAFF">RADIOLOGY_STAFF</option>
                      <option value="SECURITY_GUARD">SECURITY_GUARD</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* Read-only Detailed Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>اطلاعات فردی و ارتباطی</span>
                    </h5>

                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">کد ملی:</span>
                        <strong className="text-slate-800 font-mono">{user.nationalId || 'ثبت‌نشده'}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">کد پرسنلی:</span>
                        <strong className="text-slate-800 font-mono">{user.personnelCode || 'ثبت‌نشده'}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">شماره همراه:</span>
                        <strong className="text-slate-800 font-mono">{user.mobile || user.phone || 'ثبت‌نشده'}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">ایمیل:</span>
                        <strong className="text-slate-800 font-mono">{user.email || 'ثبت‌نشده'}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">جنسیت:</span>
                        <strong className="text-slate-800">{user.gender === 'MALE' ? 'مرد' : 'زن'}</strong>
                      </div>

                      {user.medicalCouncilNumber && (
                        <div>
                          <span className="text-slate-400 block">شماره نظام پزشکی:</span>
                          <strong className="text-emerald-700 font-mono">{user.medicalCouncilNumber}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employment Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>انتصاب شغلی و اداری</span>
                    </h5>

                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">عنوان شغلی:</span>
                        <strong className="text-slate-800">{user.title}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">دپارتمان:</span>
                        <strong className="text-slate-800">{user.department}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">نوع همکاری:</span>
                        <strong className="text-slate-800">{user.employmentType}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block">تاریخ شروع همکاری:</span>
                        <strong className="text-slate-800">{user.startDate || 'نامشخص'}</strong>
                      </div>

                      <div className="col-span-2">
                        <span className="text-slate-400 block mb-1">شعب مجاز فعالیت:</span>
                        <div className="flex flex-wrap gap-1">
                          {user.clinicIds?.map((cid) => {
                            const cl = clinics.find((c) => c.id === cid);
                            return (
                              <span key={cid} className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md">
                                {cl?.name || cid}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Status & Password Management */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Account Status Box */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>تغییر وضعیت کاربری (Account Status)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">وضعیت جدید</label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as AccountStatus)}
                      className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                    >
                      <option value="ACTIVE">فعال (Active)</option>
                      <option value="INACTIVE">غیرفعال (Inactive)</option>
                      <option value="SUSPENDED">معلق (Suspended)</option>
                      <option value="LOCKED">قفل‌شده (Locked)</option>
                      <option value="ARCHIVED">آرشیو شده (Archived)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">دلیل / توضیحات اداری تغییر وضعیت</label>
                    <input
                      type="text"
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="علت تغییر وضعیت..."
                      className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleApplyStatusChange}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    اعمال و ثبت وضعیت جدید
                  </button>
                </div>
              </div>

              {/* Password Reset Box */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>بازنشانی رمز عبور (Password Reset)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رمز عبور جدید <span className="text-slate-400 font-normal">(در صورت خالی بودن خودکار تولید می‌شود)</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={newPasswordCustom}
                      onChange={(e) => setNewPasswordCustom(e.target.value)}
                      placeholder="Pass123456"
                      className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceChangeToggle}
                        onChange={(e) => setForceChangeToggle(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        اجبار به تغییر رمز عبور در ورود بعدی
                      </span>
                    </label>
                  </div>
                </div>

                {generatedTempPass && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-mono flex items-center justify-between">
                    <span>رمز عبور موقت صادرشده: <strong>{generatedTempPass}</strong></span>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedTempPass)}
                      className="text-[11px] bg-emerald-600 text-white px-2 py-1 rounded"
                    >
                      کپی
                    </button>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleExecutePasswordReset}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    صدور و بازنشانی رمز عبور
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Permissions Matrix */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">ماتریس سفارشی دسترسی‌های ماژول‌ها</h4>
                  <p className="text-[11px] text-slate-500">نوع پروفایل فعلی: {user.permissionProfileType || 'ROLE_DEFAULT'}</p>
                </div>

                <button
                  onClick={handleSavePermissions}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  ذخیره دسترسی‌های جدید
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <th className="p-3">ماژول</th>
                      {ALL_PERMISSION_ACTIONS.map((a) => (
                        <th key={a.key} className="p-3 text-center">{a.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {SYSTEM_MODULE_DEFINITIONS.map((mod) => {
                      const actions = customModules[mod.key] || [];
                      return (
                        <tr key={mod.key} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{mod.label}</td>
                          {ALL_PERMISSION_ACTIONS.map((a) => {
                            const isChecked = actions.includes(a.key);
                            return (
                              <td key={a.key} className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleModuleAction(mod.key, a.key)}
                                  className={`w-6 h-6 rounded text-[10px] font-bold ${
                                    isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  {isChecked ? '✓' : '-'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: User Audit Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900">تراکنش‌ها و سوابق ثبت‌شده در سیستم</h4>

              {userRelatedLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">سابقه‌ای برای این کاربر ثبت نشده است.</div>
              ) : (
                <div className="space-y-3">
                  {userRelatedLogs.map((log) => (
                    <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>توسط: <strong>{log.operatorName}</strong></span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="font-bold text-slate-800">{log.action}</div>
                      <p className="text-slate-600 text-[11px]">{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
