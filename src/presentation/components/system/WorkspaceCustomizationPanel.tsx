/**
 * VikiMedic v2 - Workspace Customization Panel (Administrator Only)
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  RotateCcw,
  Save,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  DollarSign,
  Receipt,
  Activity,
  UserPlus,
  Calendar,
  BarChart3,
  Search,
  CreditCard,
  Pin,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';
import {
  WorkspaceService,
  WorkspaceRole,
  RoleWorkspaceConfig,
  SUPPORTED_WORKSPACE_ROLES,
  AVAILABLE_MODULES,
  PRESETS,
  DashboardCardConfig,
  QuickActionConfig,
} from '../../../infrastructure/workspaceService';
import { useClinic } from '../../../application/ClinicContext';

export const WorkspaceCustomizationPanel: React.FC = () => {
  const { activeUser } = useClinic();
  const isAdmin = activeUser?.role === 'ADMIN' || activeUser?.role === 'ADMINISTRATOR';

  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('RECEPTIONIST');
  const [config, setConfig] = useState<RoleWorkspaceConfig>(() =>
    WorkspaceService.getWorkspaceForRole('RECEPTIONIST')
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'actions' | 'landing_pinned' | 'preview'>('cards');

  // Load config when selected role changes
  useEffect(() => {
    const loaded = WorkspaceService.getWorkspaceForRole(selectedRole);
    setConfig(loaded);
  }, [selectedRole]);

  if (!isAdmin) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-3 dir-rtl">
        <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0" />
        <span>دسترسی محدود: بخش سفارشی‌سازی میزهای کار تخصصی فقط مخصوص مدیر ارشد سیستم (Administrator) می‌باشد.</span>
      </div>
    );
  }

  const handleToggleCardVisible = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === id ? { ...c, isVisible: !c.isVisible } : c)),
    }));
  };

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const newCards = [...prev.cards];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newCards.length) return prev;
      const temp = newCards[index];
      newCards[index] = newCards[targetIndex];
      newCards[targetIndex] = temp;
      // update orders
      return {
        ...prev,
        cards: newCards.map((c, i) => ({ ...c, order: i + 1 })),
      };
    });
  };

  const handleToggleActionVisible = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      actions: prev.actions.map((a) => (a.id === id ? { ...a, isVisible: !a.isVisible } : a)),
    }));
  };

  const handleMoveAction = (index: number, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const newActions = [...prev.actions];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newActions.length) return prev;
      const temp = newActions[index];
      newActions[index] = newActions[targetIndex];
      newActions[targetIndex] = temp;
      return {
        ...prev,
        actions: newActions.map((a, i) => ({ ...a, order: i + 1 })),
      };
    });
  };

  const handleTogglePinnedModule = (modId: string) => {
    setConfig((prev) => {
      const exists = prev.pinnedModules.includes(modId);
      const updated = exists ? prev.pinnedModules.filter((m) => m !== modId) : [...prev.pinnedModules, modId];
      return { ...prev, pinnedModules: updated };
    });
  };

  const handleApplyPreset = (presetKey: keyof typeof PRESETS) => {
    const presetConfig = PRESETS[presetKey].config(selectedRole);
    setConfig(presetConfig);
  };

  const handleSave = () => {
    WorkspaceService.saveRoleWorkspaceConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Helper for rendering icons in preview
  const renderCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-sky-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'Receipt':
        return <Receipt className="w-4 h-4 text-rose-500" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Layout className="w-4 h-4 text-blue-500" />;
    }
  };

  const renderActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserPlus':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-emerald-500" />;
      case 'Receipt':
        return <Receipt className="w-5 h-5 text-amber-500" />;
      case 'BarChart3':
        return <BarChart3 className="w-5 h-5 text-purple-500" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'Search':
        return <Search className="w-5 h-5 text-sky-500" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-teal-500" />;
      default:
        return <Zap className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-[var(--text-main)]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 px-3 py-0.5 rounded-full text-xs font-bold border border-purple-400/30 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              سفارشی‌سازی نقش‌محور
            </span>
            <span className="text-xs text-slate-400">System Management → Workspace Customization</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>مدیریت و پیکربندی میزهای کار (Workspace Customization)</span>
          </h2>
          <p className="text-xs text-slate-300">
            سفارشی‌سازی کارت‌های داشبورد، عملیات سریع، صفحه پیش‌فرض و ماژول‌های سنجاق‌شده به تفکیک نقش‌های کاربری.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تغییرات میز کار</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>تنظیمات میز کار نقش «{SUPPORTED_WORKSPACE_ROLES.find((r) => r.role === selectedRole)?.titleFa}» با موفقیت ذخیره شد.</span>
        </div>
      )}

      {/* Role Selection & Preset Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-main)] block">انتخاب نقش جهت سفارشی‌سازی:</label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_WORKSPACE_ROLES.map((item) => (
                <button
                  key={item.role}
                  onClick={() => setSelectedRole(item.role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedRole === item.role
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{item.titleFa}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Presets Quick Apply */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-main)] block">بارگذاری الگوی پیش‌فرض (Presets):</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key as any)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-[var(--border-subtle)] transition flex items-center gap-1"
                  title={preset.descriptionFa}
                >
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>{preset.nameFa.split(' ')[2] || key}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Tabs */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>کارت‌های آمار (Dashboard Cards)</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'actions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>عملیات سریع (Quick Actions)</span>
          </button>

          <button
            onClick={() => setActiveTab('landing_pinned')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'landing_pinned'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Pin className="w-4 h-4 text-purple-400" />
            <span>صفحه فرود و ماژول‌های سنجاق‌شده</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>پیش‌نمایش زنده (Live Preview)</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD CARDS */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              نمایش/مخفی‌سازی و چیدمان ترتیبی کارت‌های بالای داشبورد برای نقش «{SUPPORTED_WORKSPACE_ROLES.find((r) => r.role === selectedRole)?.titleFa}»:
            </div>

            <div className="space-y-2">
              {config.cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    card.isVisible
                      ? 'bg-[var(--bg-app)] border-[var(--border-subtle)]'
                      : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      {renderCardIcon(card.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[var(--text-main)]">{card.titleFa}</h4>
                      <span className="text-[10px] text-[var(--text-muted)]">شناسه: {card.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCardVisible(card.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        card.isVisible
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {card.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{card.isVisible ? 'نمایش داده می‌شود' : 'مخفی است'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveCard(index, 'up')}
                      className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 border border-[var(--border-subtle)]"
                      title="انتقال به بالا"
                    >
                      <MoveUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>

                    <button
                      type="button"
                      disabled={index === config.cards.length - 1}
                      onClick={() => handleMoveCard(index, 'down')}
                      className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 border border-[var(--border-subtle)]"
                      title="انتقال به پایین"
                    >
                      <MoveDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QUICK ACTIONS */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              مدیریت و ترتیب دکمه‌های میانبر عملیات سریع در داشبورد:
            </div>

            <div className="space-y-2">
              {config.actions.map((action, index) => (
                <div
                  key={action.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    action.isVisible
                      ? 'bg-[var(--bg-app)] border-[var(--border-subtle)]'
                      : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      {renderActionIcon(action.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[var(--text-main)] flex items-center gap-2">
                        <span>{action.titleFa}</span>
                        {action.shortcut && (
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
                            {action.shortcut}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{action.descriptionFa}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActionVisible(action.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        action.isVisible
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {action.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{action.isVisible ? 'فعال' : 'غیرفعال'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveAction(index, 'up')}
                      className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 border border-[var(--border-subtle)]"
                    >
                      <MoveUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>

                    <button
                      type="button"
                      disabled={index === config.actions.length - 1}
                      onClick={() => handleMoveAction(index, 'down')}
                      className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 border border-[var(--border-subtle)]"
                    >
                      <MoveDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LANDING PAGE & PINNED MODULES */}
        {activeTab === 'landing_pinned' && (
          <div className="space-y-6">
            {/* Default Landing Page Choice */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-[var(--text-main)] block">
                ۱. انتخاب صفحه فرود پیش‌فرض (Default Landing Page) پس از ورود کاربر:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_MODULES.map((mod) => (
                  <label
                    key={mod.id}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      config.defaultLandingPage === mod.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 font-bold'
                        : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-slate-400'
                    }`}
                  >
                    <span className="text-xs text-[var(--text-main)]">{mod.titleFa}</span>
                    <input
                      type="radio"
                      name="defaultLanding"
                      value={mod.id}
                      checked={config.defaultLandingPage === mod.id}
                      onChange={() => setConfig((prev) => ({ ...prev, defaultLandingPage: mod.id }))}
                      className="accent-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Pinned Favorite Modules */}
            <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
              <label className="font-bold text-xs text-[var(--text-main)] block">
                ۲. سنجاق کردن ماژول‌های محبوب به نوار دسترسی سریع (Pinned Modules):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_MODULES.map((mod) => {
                  const isPinned = config.pinnedModules.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isPinned
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 font-bold'
                          : 'bg-[var(--bg-app)] border-[var(--border-subtle)] opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-purple-600 fill-purple-600' : 'text-slate-400'}`} />
                        <span className="text-xs">{mod.titleFa}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={() => handleTogglePinnedModule(mod.id)}
                        className="accent-purple-600 rounded"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-5 p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-xs text-[var(--text-main)]">
                  پیش‌نمایش زنده میز کار نقش: {SUPPORTED_WORKSPACE_ROLES.find((r) => r.role === selectedRole)?.titleFa}
                </h3>
              </div>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-mono">
                صفحه فرود: {AVAILABLE_MODULES.find((m) => m.id === config.defaultLandingPage)?.titleFa}
              </span>
            </div>

            {/* Preview Cards */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-[var(--text-muted)]">کارت‌های آمار فعال ({config.cards.filter((c) => c.isVisible).length} مورد):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {config.cards
                  .filter((c) => c.isVisible)
                  .map((c) => (
                    <div key={c.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                        <span>{c.titleFa}</span>
                        {renderCardIcon(c.iconName)}
                      </div>
                      <div className="text-2xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">۱۲</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Preview Actions */}
            <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
              <h4 className="text-[11px] font-bold text-[var(--text-muted)]">عملیات سریع فعال ({config.actions.filter((a) => a.isVisible).length} مورد):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {config.actions
                  .filter((a) => a.isVisible)
                  .map((a) => (
                    <div key={a.id} className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                        {renderActionIcon(a.iconName)}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[var(--text-main)]">{a.titleFa}</h5>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{a.descriptionFa}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Preview Pinned Modules */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs">
              <span className="font-bold text-[var(--text-muted)]">ماژول‌های سنجاق‌شده:</span>
              <div className="flex flex-wrap gap-1.5">
                {config.pinnedModules.map((mId) => (
                  <span key={mId} className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold text-[11px] border border-purple-500/20">
                    {AVAILABLE_MODULES.find((m) => m.id === mId)?.titleFa}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
