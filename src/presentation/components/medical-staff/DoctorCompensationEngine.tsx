import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit3,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Building2,
  User,
  Clock,
  DollarSign,
  Layers,
  ArrowUp,
  ArrowDown,
  Info,
  Lock,
  RefreshCw,
  FileText,
  Check,
  X,
  Sparkles,
  Users
} from 'lucide-react';
import {
  StaffContract,
  CommissionTier,
  CommissionCalculationMethod,
  DoctorContractScope,
  ContractAuditLog,
  MedicalStaffMember
} from '../../../domain/types';

export type UserRoleType = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'DOCTOR';

interface DoctorCompensationEngineProps {
  contracts: StaffContract[];
  staffList: MedicalStaffMember[];
  selectedStaffId?: string | null;
  currentUserRole?: UserRoleType;
  currentUserName?: string;
  onSaveContract: (updatedContract: StaffContract) => void;
  onRecordAuditLog?: (log: Omit<ContractAuditLog, 'id'>) => void;
}

// Preset Tiers example from specification
const SAMPLE_PRESET_TIERS: CommissionTier[] = [
  {
    id: 'tier-sample-1',
    tierName: 'پله ۱ - درآمد پایه',
    priority: 1,
    minRevenue: 0,
    maxRevenue: 5750000,
    commissionPercentage: 30,
    clinicPercentage: 70,
    status: 'ACTIVE',
    description: 'سهم ۳۰٪ پزشک و ۷۰٪ کلینیک تا آستانه ۵,۷۵۰,۰۰۰ تومان',
    shiftType: 'ALL'
  },
  {
    id: 'tier-sample-2',
    tierName: 'پله ۲ - تشویقی سطح یک',
    priority: 2,
    minRevenue: 5750001,
    maxRevenue: 10000000,
    commissionPercentage: 40,
    clinicPercentage: 60,
    status: 'ACTIVE',
    description: 'سهم ۴۰٪ پزشک برای درآمد بین ۵.۷۵ تا ۱۰ میلیون تومان',
    shiftType: 'ALL'
  },
  {
    id: 'tier-sample-3',
    tierName: 'پله ۳ - کارانه ویژه',
    priority: 3,
    minRevenue: 10000001,
    maxRevenue: 20000000,
    commissionPercentage: 45,
    clinicPercentage: 55,
    status: 'ACTIVE',
    description: 'سهم ۴۵٪ پزشک برای درآمد بین ۱۰ تا ۲۰ میلیون تومان',
    shiftType: 'ALL'
  },
  {
    id: 'tier-sample-4',
    tierName: 'پله ۴ - بالاترین سهم کارانه',
    priority: 4,
    minRevenue: 20000001,
    maxRevenue: null,
    commissionPercentage: 50,
    clinicPercentage: 50,
    status: 'ACTIVE',
    description: 'سهم ۵۰٪ پزشک برای درآمدهای بالاتر از ۲۰ میلیون تومان',
    shiftType: 'ALL'
  }
];

export const DoctorCompensationEngine: React.FC<DoctorCompensationEngineProps> = ({
  contracts,
  staffList,
  selectedStaffId: initialStaffId,
  currentUserRole = 'ADMIN',
  currentUserName = 'مدیر ارشد کلینیک',
  onSaveContract,
  onRecordAuditLog
}) => {
  // Active Role and Doctor selection
  const [activeRole, setActiveRole] = useState<UserRoleType>(currentUserRole);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    initialStaffId || (staffList[0]?.id || '')
  );

  // Permissions check
  const isReadOnly = activeRole === 'ACCOUNTANT' || activeRole === 'DOCTOR';
  const canManage = activeRole === 'ADMIN' || activeRole === 'MANAGER';

  // Find Doctor & Contract
  const selectedDoctor = useMemo(() => {
    return staffList.find((s) => s.id === selectedStaffId) || staffList[0] || null;
  }, [staffList, selectedStaffId]);

  const activeContract = useMemo(() => {
    if (!selectedDoctor) return null;
    const found = contracts.find((c) => c.staffId === selectedDoctor.id);
    if (found) return found;

    // Fallback default contract if missing
    const fallback: StaffContract = {
      id: `cnt-fallback-${selectedDoctor.id}`,
      staffId: selectedDoctor.id,
      contractNumber: `CNT-DEFAULT-${selectedDoctor.id.substring(0, 4)}`,
      contractScope: 'PERSONAL',
      startDate: '1405/01/01',
      endDate: '1405/12/29',
      visitTariff: 250000,
      morningShiftTariff: 1200000,
      eveningShiftTariff: 1500000,
      nightShiftTariff: 2000000,
      revenueThreshold: 5750000,
      calculationMethod: 'MULTI_LEVEL_PERCENTAGE',
      fixedBaseSalary: 0,
      commissionTiers: [...SAMPLE_PRESET_TIERS],
      insuranceSupport: true,
      contractStatus: 'ACTIVE',
      createdAt: '1405/01/01',
      notes: 'قرارداد پیش‌فرض فرموله شده پزشکان',
      auditLogs: []
    };
    return fallback;
  }, [contracts, selectedDoctor]);

  // Editing Contract State
  const [workingContract, setWorkingContract] = useState<StaffContract | null>(null);

  // Sync working contract on selection change
  React.useEffect(() => {
    if (activeContract) {
      setWorkingContract(JSON.parse(JSON.stringify(activeContract)));
    }
  }, [activeContract]);

  // Selected Shift Filter
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT'>('ALL');

  // Revenue Simulator State
  const [simulatedRevenue, setSimulatedRevenue] = useState<number>(15000000);

  // Tier Modal State
  const [editingTier, setEditingTier] = useState<CommissionTier | null>(null);
  const [isTierModalOpen, setIsTierModalOpen] = useState<boolean>(false);
  const [isNewTier, setIsNewTier] = useState<boolean>(false);

  // Audit Log State
  const [localAuditLogs, setLocalAuditLogs] = useState<ContractAuditLog[]>(
    activeContract?.auditLogs || []
  );

  React.useEffect(() => {
    if (activeContract?.auditLogs) {
      setLocalAuditLogs(activeContract.auditLogs);
    }
  }, [activeContract]);

  // Helper: Log Action
  const logAudit = (
    action: ContractAuditLog['action'],
    details: string
  ) => {
    const newLog: ContractAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractId: workingContract?.id || 'cnt-01',
      action,
      adminName: currentUserName,
      adminRole: activeRole === 'ADMIN' ? 'مدیر ارشد' : activeRole === 'MANAGER' ? 'مدیر کلینیک' : 'کاربر',
      timestamp: new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      details
    };
    setLocalAuditLogs((prev) => [newLog, ...prev]);
    if (onRecordAuditLog) {
      onRecordAuditLog(newLog);
    }
  };

  // ------------------------------------------------------------------
  // TIER VALIDATION ENGINE
  // ------------------------------------------------------------------
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!workingContract) return errors;

    const tiers = (workingContract.commissionTiers || [])
      .filter((t) => selectedShiftFilter === 'ALL' || !t.shiftType || t.shiftType === 'ALL' || t.shiftType === selectedShiftFilter)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.minRevenue - b.minRevenue);

    tiers.forEach((t, idx) => {
      // 1. Negative values
      if (t.minRevenue < 0) {
        errors.push(`پله «${t.tierName || idx + 1}»: حداقل درآمد نباید منفی باشد.`);
      }

      // 2. Doctor Percentage checks
      if (t.commissionPercentage < 0 || t.commissionPercentage > 100) {
        errors.push(`پله «${t.tierName || idx + 1}»: درصد پزشک باید بین ۰ تا ۱۰۰ باشد.`);
      }

      // 3. Clinic Percentage match
      const clinicP = t.clinicPercentage ?? (100 - t.commissionPercentage);
      if (Math.abs(t.commissionPercentage + clinicP - 100) > 0.01) {
        errors.push(`پله «${t.tierName || idx + 1}»: مجموع درصد پزشک (${t.commissionPercentage}٪) و کلینیک (${clinicP}٪) باید دقیقاً ۱۰۰٪ باشد.`);
      }

      // 4. Min >= Max
      if (t.maxRevenue !== null && t.minRevenue >= t.maxRevenue) {
        errors.push(`پله «${t.tierName || idx + 1}»: حداکثر درآمد (${t.maxRevenue.toLocaleString('fa-IR')}) باید بزرگتر از حداقل درآمد (${t.minRevenue.toLocaleString('fa-IR')}) باشد.`);
      }

      // 5. Overlapping ranges with previous tier
      if (idx > 0) {
        const prevTier = tiers[idx - 1];
        if (prevTier.maxRevenue !== null && t.minRevenue < prevTier.maxRevenue) {
          errors.push(
            `هم‌پوشانی بازه: پله «${t.tierName || idx + 1}» از ${t.minRevenue.toLocaleString('fa-IR')} شروع می‌شود اما پله قبل تا ${prevTier.maxRevenue.toLocaleString('fa-IR')} ادامه دارد.`
          );
        }
      }
    });

    return errors;
  }, [workingContract, selectedShiftFilter]);

  // ------------------------------------------------------------------
  // LIVE COMMISSION CALCULATION ENGINE
  // ------------------------------------------------------------------
  const calculationResult = useMemo(() => {
    if (!workingContract || !workingContract.commissionTiers || workingContract.commissionTiers.length === 0) {
      return {
        matchedTier: null,
        doctorShare: 0,
        clinicShare: 0,
        doctorPercentage: 0,
        clinicPercentage: 100,
        remainingToNextTier: null as number | null,
        nextTier: null as CommissionTier | null,
        breakdown: [] as {
          tierLabel: string;
          revenueInTier: number;
          doctorPercent: number;
          clinicPercent: number;
          doctorShare: number;
          clinicShare: number;
        }[]
      };
    }

    const rev = Math.max(0, simulatedRevenue);
    const method = workingContract.calculationMethod || 'MULTI_LEVEL_PERCENTAGE';
    const baseSalary = workingContract.fixedBaseSalary || 0;

    // Active Tiers for selected shift
    const activeTiers = workingContract.commissionTiers
      .filter((t) => (t.status ?? 'ACTIVE') === 'ACTIVE')
      .filter((t) => selectedShiftFilter === 'ALL' || !t.shiftType || t.shiftType === 'ALL' || t.shiftType === selectedShiftFilter)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.minRevenue - b.minRevenue);

    if (activeTiers.length === 0) {
      return {
        matchedTier: null,
        doctorShare: baseSalary,
        clinicShare: rev,
        doctorPercentage: 0,
        clinicPercentage: 100,
        remainingToNextTier: null,
        nextTier: null,
        breakdown: []
      };
    }

    // Determine current matched tier
    let matchedTier: CommissionTier | null = null;
    let nextTier: CommissionTier | null = null;

    for (let i = 0; i < activeTiers.length; i++) {
      const t = activeTiers[i];
      if (t.maxRevenue === null) {
        if (rev >= t.minRevenue) {
          matchedTier = t;
          nextTier = null; // Reached highest tier
          break;
        }
      } else if (rev >= t.minRevenue && rev <= t.maxRevenue) {
        matchedTier = t;
        nextTier = activeTiers[i + 1] || null;
        break;
      }
    }

    // Fallback if below lowest minRevenue
    if (!matchedTier && activeTiers.length > 0) {
      if (rev < activeTiers[0].minRevenue) {
        matchedTier = activeTiers[0];
        nextTier = activeTiers[1] || null;
      } else {
        matchedTier = activeTiers[activeTiers.length - 1];
        nextTier = null;
      }
    }

    // Remaining to next tier calculation
    let remainingToNextTier: number | null = null;
    if (matchedTier && matchedTier.maxRevenue !== null) {
      remainingToNextTier = Math.max(0, matchedTier.maxRevenue + 1 - rev);
    }

    let doctorCommission = 0;
    const breakdown: {
      tierLabel: string;
      revenueInTier: number;
      doctorPercent: number;
      clinicPercent: number;
      doctorShare: number;
      clinicShare: number;
    }[] = [];

    // Method Specific Calculation
    if (method === 'FIXED_PERCENTAGE' || method === 'PERCENTAGE_OF_TOTAL') {
      const docPct = matchedTier ? matchedTier.commissionPercentage : 0;
      const clinicPct = matchedTier ? (matchedTier.clinicPercentage ?? (100 - docPct)) : 100;
      doctorCommission = Math.round((rev * docPct) / 100);

      breakdown.push({
        tierLabel: matchedTier ? `${matchedTier.tierName || 'پله بازه کل'} (${docPct}٪)` : 'بدون پله',
        revenueInTier: rev,
        doctorPercent: docPct,
        clinicPercent: clinicPct,
        doctorShare: doctorCommission,
        clinicShare: rev - doctorCommission
      });
    } else if (method === 'FIXED_AMOUNT') {
      const fixedPerTier = matchedTier?.fixedAmount || 1500000;
      doctorCommission = fixedPerTier;
      breakdown.push({
        tierLabel: matchedTier ? matchedTier.tierName || 'مبلغ ثابت پله' : 'ثابت',
        revenueInTier: rev,
        doctorPercent: 0,
        clinicPercent: 100,
        doctorShare: fixedPerTier,
        clinicShare: Math.max(0, rev - fixedPerTier)
      });
    } else {
      // MULTI_LEVEL_PERCENTAGE (Progressive Tiered) or HYBRID
      activeTiers.forEach((tier) => {
        if (rev > tier.minRevenue) {
          const upper = tier.maxRevenue !== null ? Math.min(rev, tier.maxRevenue) : rev;
          const taxableInTier = upper - tier.minRevenue;
          if (taxableInTier > 0) {
            const docPct = tier.commissionPercentage;
            const clinicPct = tier.clinicPercentage ?? (100 - docPct);
            const docAmt = Math.round((taxableInTier * docPct) / 100);
            const clinicAmt = taxableInTier - docAmt;

            doctorCommission += docAmt;
            breakdown.push({
              tierLabel: `${tier.tierName || 'پله'} (${tier.minRevenue.toLocaleString('fa-IR')} تا ${tier.maxRevenue ? tier.maxRevenue.toLocaleString('fa-IR') : 'بالاتر'})`,
              revenueInTier: taxableInTier,
              doctorPercent: docPct,
              clinicPercent: clinicPct,
              doctorShare: docAmt,
              clinicShare: clinicAmt
            });
          }
        }
      });
    }

    // Add Base Salary for Hybrid
    const totalDoctorShare = doctorCommission + (method === 'HYBRID' ? baseSalary : 0);
    const totalClinicShare = Math.max(0, rev - doctorCommission);

    const effectiveDoctorPct = rev > 0 ? Math.round((totalDoctorShare / rev) * 100) : (matchedTier?.commissionPercentage || 0);
    const effectiveClinicPct = Math.max(0, 100 - effectiveDoctorPct);

    return {
      matchedTier,
      doctorShare: totalDoctorShare,
      clinicShare: totalClinicShare,
      doctorPercentage: effectiveDoctorPct,
      clinicPercentage: effectiveClinicPct,
      remainingToNextTier,
      nextTier,
      breakdown
    };
  }, [workingContract, simulatedRevenue, selectedShiftFilter]);

  // ------------------------------------------------------------------
  // CONTRACT MODIFICATION HANDLERS
  // ------------------------------------------------------------------
  const handleSaveContract = () => {
    if (!workingContract) return;
    if (validationErrors.length > 0) {
      alert('خطا در قوانین پله‌ها! لطفاً موارد هم‌پوشانی یا درصد‌های نامعتبر را برطرف کنید.');
      return;
    }

    onSaveContract(workingContract);
    logAudit(
      'Contract Saved',
      `قرارداد شماره ${workingContract.contractNumber} با ${workingContract.commissionTiers.length} پله کارانه ذخیره گردید.`
    );
    alert('تنظیمات قرارداد و پله‌های پورسانت با موفقیت ذخیره شدند.');
  };

  const handleLoadSamplePreset = () => {
    if (!workingContract) return;
    if (confirm('آیا از بازنشانی پله‌ها به الگوی نمونه استاندارد کلینیک اطمینان دارید؟')) {
      const updated: StaffContract = {
        ...workingContract,
        calculationMethod: 'MULTI_LEVEL_PERCENTAGE',
        commissionTiers: [...SAMPLE_PRESET_TIERS]
      };
      setWorkingContract(updated);
      logAudit('Percentage Changed', 'پله‌های پورسانت به الگوی استاندارد چندسطحی (۴ پله) بازنشانی گردید.');
    }
  };

  const handleAddTierClick = () => {
    if (isReadOnly) return;
    const tiers = workingContract?.commissionTiers || [];
    const maxPriority = tiers.reduce((max, t) => Math.max(max, t.priority || 0), 0);
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier && lastTier.maxRevenue !== null ? lastTier.maxRevenue + 1 : 0;

    const newT: CommissionTier = {
      id: `tier-${Date.now()}`,
      tierName: `پله شماره ${tiers.length + 1}`,
      priority: maxPriority + 1,
      minRevenue: newMin,
      maxRevenue: newMin + 5000000,
      commissionPercentage: 40,
      clinicPercentage: 60,
      status: 'ACTIVE',
      description: 'پله جدید تعریف شده',
      shiftType: selectedShiftFilter
    };

    setEditingTier(newT);
    setIsNewTier(true);
    setIsTierModalOpen(true);
  };

  const handleEditTierClick = (tier: CommissionTier) => {
    setEditingTier({ ...tier, clinicPercentage: tier.clinicPercentage ?? (100 - tier.commissionPercentage) });
    setIsNewTier(false);
    setIsTierModalOpen(true);
  };

  const handleDeleteTier = (tierId: string) => {
    if (isReadOnly || !workingContract) return;
    const target = workingContract.commissionTiers.find((t) => t.id === tierId);
    if (confirm(`آیا از حذف «${target?.tierName || 'این پله'}» اطمینان دارید؟`)) {
      const updatedTiers = workingContract.commissionTiers.filter((t) => t.id !== tierId);
      setWorkingContract({ ...workingContract, commissionTiers: updatedTiers });
      logAudit('Tier Deleted', `پله ${target?.tierName || tierId} حذف گردید.`);
    }
  };

  const handleSaveTierModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier || !workingContract) return;

    let updatedTiers = [...workingContract.commissionTiers];
    if (isNewTier) {
      updatedTiers.push(editingTier);
      logAudit('Tier Created', `پله جدید «${editingTier.tierName}» با سهم ${editingTier.commissionPercentage}٪ تعریف شد.`);
    } else {
      updatedTiers = updatedTiers.map((t) => (t.id === editingTier.id ? editingTier : t));
      logAudit('Tier Edited', `ویرایش پله «${editingTier.tierName}» (سهم پزشک: ${editingTier.commissionPercentage}٪).`);
    }

    // Sort tiers by priority and minRevenue
    updatedTiers.sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.minRevenue - b.minRevenue);

    setWorkingContract({ ...workingContract, commissionTiers: updatedTiers });
    setIsTierModalOpen(false);
    setEditingTier(null);
  };

  if (!workingContract || !selectedDoctor) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
        در حال بارگذاری اطلاعات قراردادهای پزشکان...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* HEADER & ROLE / DOCTOR CONTROLS */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#283F24]/10 text-[#283F24] rounded-xl border border-[#62745D]/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
                <span>موتور محاسبات کارانه و قراردادهای چندسطحی پزشکان</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-500/30">
                  VikiMedic Engine v2.5
                </span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                تعریف و مدیریت پله‌های پورسانت، قوانین شیفت‌بندی، شبیه‌ساز زنده درآمد و فرمول‌های محاسباتی
              </p>
            </div>
          </div>

          {/* Quick Role & Permission Selector */}
          <div className="flex items-center gap-2 bg-[var(--bg-app)] p-1.5 rounded-xl border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)] font-bold text-[11px] px-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>نقش فعال:</span>
            </span>
            {(['ADMIN', 'MANAGER', 'ACCOUNTANT', 'DOCTOR'] as UserRoleType[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  activeRole === r
                    ? 'bg-[#283F24] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {r === 'ADMIN' ? 'مدیر سیستم' : r === 'MANAGER' ? 'مدیر کلینیک' : r === 'ACCOUNTANT' ? 'حسابدار' : 'پزشک'}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor & Scope Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Doctor Selection */}
          <div className="space-y-1">
            <label className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#283F24]" />
              <span>انتخاب پزشک / کادر درمان:</span>
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              disabled={activeRole === 'DOCTOR'}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold outline-none focus:border-[#283F24] disabled:opacity-70"
            >
              {staffList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName} ({doc.specialty}) - نظام: {doc.medicalCouncilNumber || '---'}
                </option>
              ))}
            </select>
          </div>

          {/* Scope Selection */}
          <div className="space-y-1">
            <label className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#283F24]" />
              <span>سطح قرارداد (Contract Scope):</span>
            </label>
            <select
              value={workingContract.contractScope || 'PERSONAL'}
              disabled={isReadOnly}
              onChange={(e) => {
                const scope = e.target.value as DoctorContractScope;
                setWorkingContract({ ...workingContract, contractScope: scope });
                logAudit('Contract Saved', `تغییر سطح قرارداد به ${scope}`);
              }}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold outline-none focus:border-[#283F24] disabled:opacity-70"
            >
              <option value="PERSONAL">قرارداد اختصاصی پزشک (Personal Contract)</option>
              <option value="DEPARTMENT">قرارداد گروه/دپارتمان (Department Contract)</option>
              <option value="CLINIC_DEFAULT">قرارداد پیش‌فرض کلینیک (Clinic Default)</option>
            </select>
          </div>

          {/* Shift Filter Rules */}
          <div className="space-y-1">
            <label className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#283F24]" />
              <span>قانون شیفت کاری (Shift Rule):</span>
            </label>
            <div className="grid grid-cols-4 gap-1 bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-subtle)] font-bold text-[11px]">
              {[
                { id: 'ALL', label: 'مشترک' },
                { id: 'MORNING', label: 'صبح' },
                { id: 'EVENING', label: 'عصر' },
                { id: 'NIGHT', label: 'شب' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedShiftFilter(s.id as any)}
                  className={`py-1.5 rounded-lg text-center transition ${
                    selectedShiftFilter === s.id
                      ? 'bg-[#283F24] text-white shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COMPENSATION MODE CONFIGURATOR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="font-extrabold text-sm text-[var(--text-main)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#283F24]" />
            <span>مدل محاسباتی کارانه (Compensation Calculation Mode)</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            روش فعال: {workingContract.calculationMethod}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            {
              id: 'MULTI_LEVEL_PERCENTAGE',
              title: 'پورسانت چندسطحی (Tiered)',
              desc: 'محاسبه تصاعدی بر اساس بازه‌های درآمدی متوالی (پله به پله)',
              icon: TrendingUp,
              badge: 'پیش‌فرض اصلی'
            },
            {
              id: 'FIXED_PERCENTAGE',
              title: 'درصد ثابت از کل',
              desc: 'تعیین یک درصد ثابت بر تمام درآمد ناخالص بر اساس آخرین پله رسیده‌شده',
              icon: PercentIcon,
              badge: 'درصد کل'
            },
            {
              id: 'FIXED_AMOUNT',
              title: 'مبلغ ثابت (Fixed Amount)',
              desc: 'پرداخت حق‌الزحمه ثابت به ازای هر شیفت یا کارکرد بدون وابستگی درآمدی',
              icon: DollarSign,
              badge: 'مبلغ مقطوع'
            },
            {
              id: 'HYBRID',
              title: 'ترکیبی (Hybrid)',
              desc: 'حقوق ثابت پایه + درصد پورسانت پله‌ای از کارکرد ناخالص',
              icon: Sparkles,
              badge: 'پایه + درصد'
            }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected =
              workingContract.calculationMethod === mode.id ||
              (mode.id === 'MULTI_LEVEL_PERCENTAGE' && workingContract.calculationMethod === 'PERCENTAGE_OF_EXCESS') ||
              (mode.id === 'FIXED_PERCENTAGE' && workingContract.calculationMethod === 'PERCENTAGE_OF_TOTAL');

            return (
              <div
                key={mode.id}
                onClick={() => {
                  if (isReadOnly) return;
                  setWorkingContract({
                    ...workingContract,
                    calculationMethod: mode.id as CommissionCalculationMethod
                  });
                  logAudit('Percentage Changed', `تغییر مدل محاسباتی به ${mode.title}`);
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-[#E4EBE0] border-[#283F24] ring-2 ring-[#283F24]/20'
                    : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-[#62745D]/50'
                } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-[#283F24] flex items-center gap-1.5 text-[12px]">
                      <Icon className="w-4 h-4 text-[#283F24]" />
                      <span>{mode.title}</span>
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-snug">{mode.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#62745D]/20 flex justify-between items-center text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-white/70 text-[#283F24] font-bold border border-[#62745D]/30">
                    {mode.badge}
                  </span>
                  {isSelected && <span className="font-bold text-emerald-800">فعال</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hybrid Base Salary Field if Hybrid is selected */}
        {workingContract.calculationMethod === 'HYBRID' && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-[var(--text-main)]">حقوق ثابت پایه (برای مدل ترکیبی):</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={500000}
                disabled={isReadOnly}
                value={workingContract.fixedBaseSalary || 0}
                onChange={(e) =>
                  setWorkingContract({
                    ...workingContract,
                    fixedBaseSalary: Number(e.target.value)
                  })
                }
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono font-bold w-40 text-left outline-none focus:border-[#283F24]"
              />
              <span className="font-bold text-[var(--text-muted)]">تومان</span>
            </div>
          </div>
        )}
      </div>

      {/* VALIDATION WARNINGS DISPLAY */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-black text-red-600 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>تداخل و خطای اعتبارسنچی در پله‌های پورسانت:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-red-700 font-medium pr-2">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TIER CONFIGURATION TABLE & MANAGER */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#283F24]" />
            <h3 className="font-extrabold text-sm text-[var(--text-main)]">
              پیکربندی پله‌های پورسانت (Compensation Tiers)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#283F24]/10 text-[#283F24] text-[11px] font-bold">
              {workingContract.commissionTiers?.length || 0} پله فعال
            </span>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSamplePreset}
                className="px-3 py-1.5 bg-[var(--bg-app)] hover:bg-[var(--border-subtle)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#283F24]" />
                <span>بارگذاری الگوی نمونه</span>
              </button>

              <button
                onClick={handleAddTierClick}
                className="px-3.5 py-1.5 bg-[#283F24] hover:bg-[#35542F] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن پله جدید</span>
              </button>
            </div>
          )}
        </div>

        {/* Tiers List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                <th className="p-3 text-center">اولولیت</th>
                <th className="p-3">عنوان پله</th>
                <th className="p-3">حداقل درآمد</th>
                <th className="p-3">حداکثر درآمد</th>
                <th className="p-3 text-center">سهم پزشک (٪)</th>
                <th className="p-3 text-center">سهم کلینیک (٪)</th>
                <th className="p-3 text-center">قانون شیفت</th>
                <th className="p-3 text-center">وضعیت</th>
                {canManage && <th className="p-3 text-center">عملیات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {workingContract.commissionTiers
                ?.filter((t) => selectedShiftFilter === 'ALL' || !t.shiftType || t.shiftType === 'ALL' || t.shiftType === selectedShiftFilter)
                .sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.minRevenue - b.minRevenue)
                .map((tier, idx) => {
                  const clinicPct = tier.clinicPercentage ?? (100 - tier.commissionPercentage);
                  const isMatchedInSim = calculationResult.matchedTier?.id === tier.id;

                  return (
                    <tr
                      key={tier.id}
                      className={`transition ${
                        isMatchedInSim
                          ? 'bg-[#E4EBE0]/80 font-bold border-l-4 border-l-[#283F24]'
                          : 'hover:bg-[var(--bg-app)]/50'
                      }`}
                    >
                      <td className="p-3 text-center font-mono font-bold">
                        <span className="px-2 py-0.5 bg-slate-200/80 rounded text-[11px] text-slate-800">
                          #{tier.priority || idx + 1}
                        </span>
                      </td>

                      <td className="p-3 font-extrabold text-[var(--text-main)]">
                        <div className="flex items-center gap-2">
                          <span>{tier.tierName || `پله شماره ${idx + 1}`}</span>
                          {isMatchedInSim && (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md animate-pulse">
                              پله فعلی شبیه‌ساز
                            </span>
                          )}
                        </div>
                        {tier.description && (
                          <span className="text-[10px] text-[var(--text-muted)] font-normal block mt-0.5">
                            {tier.description}
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono font-bold text-[#283F24]">
                        {tier.minRevenue.toLocaleString('fa-IR')} تومان
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-700">
                        {tier.maxRevenue !== null ? `${tier.maxRevenue.toLocaleString('fa-IR')} تومان` : 'بدون سقف (بالاتر)'}
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-800 font-extrabold rounded-lg border border-emerald-500/30">
                          {tier.commissionPercentage}٪
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-800 font-extrabold rounded-lg border border-blue-500/30">
                          {clinicPct}٪
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="text-[11px] font-bold text-[var(--text-muted)]">
                          {!tier.shiftType || tier.shiftType === 'ALL'
                            ? 'همه شیفت‌ها'
                            : tier.shiftType === 'MORNING'
                            ? 'صبح'
                            : tier.shiftType === 'EVENING'
                            ? 'عصر'
                            : 'شب'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            (tier.status ?? 'ACTIVE') === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                          }`}
                        >
                          {(tier.status ?? 'ACTIVE') === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>

                      {canManage && (
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditTierClick(tier)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="ویرایش پله"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTier(tier.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="حذف پله"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Save All Contract Settings Action */}
        {canManage && (
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              <span>پس از اتمام ویرایش‌ها، جهت ثبت نهایی روی دکمه ذخیره تغییرات کلیک کنید.</span>
            </div>

            <button
              onClick={handleSaveContract}
              disabled={validationErrors.length > 0}
              className="px-5 py-2.5 bg-[#283F24] hover:bg-[#35542F] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره نهایی تنظیمات قرارداد</span>
            </button>
          </div>
        )}
      </div>

      {/* LIVE REVENUE SIMULATOR & PREVIEW PANEL */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#283F24]" />
            <h3 className="font-extrabold text-sm text-[var(--text-main)]">
              شبیه‌ساز و پیش‌نمایش زنده کارانه (Revenue Simulator)
            </h3>
          </div>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            محاسبه آنی بر اساس {workingContract.commissionTiers?.length || 0} پله
          </span>
        </div>

        {/* Simulator Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-subtle)]">
          <div className="space-y-2">
            <label className="font-extrabold text-[var(--text-main)] block">
              وارد کردن درآمد ناخالص کارکرد (تومان):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={500000}
                value={simulatedRevenue}
                onChange={(e) => setSimulatedRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono font-bold text-sm text-[#283F24] outline-none focus:border-[#283F24]"
              />
              <span className="font-bold text-[var(--text-muted)] shrink-0">تومان</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[var(--text-muted)] font-bold">مقادیر سریع:</span>
              {[5750000, 8000000, 15000000, 25000000, 50000000].map((val) => (
                <button
                  key={val}
                  onClick={() => setSimulatedRevenue(val)}
                  className="px-2 py-0.5 bg-[var(--bg-surface)] hover:bg-[#E4EBE0] text-[10px] font-mono font-bold rounded border border-[var(--border-subtle)] text-[#283F24] transition"
                >
                  {(val / 1000000).toLocaleString('fa-IR')} میلیون
                </button>
              ))}
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-2 flex flex-col justify-center">
            <div className="flex justify-between font-bold text-[11px] text-[var(--text-muted)]">
              <span>۰ تومان</span>
              <span>۵۰,۰۰۰,۰۰۰ تومان</span>
            </div>
            <input
              type="range"
              min={0}
              max={50000000}
              step={250000}
              value={simulatedRevenue}
              onChange={(e) => setSimulatedRevenue(Number(e.target.value))}
              className="w-full accent-[#283F24] cursor-pointer"
            />
            <p className="text-[10px] text-[var(--text-muted)] text-center">
              برای تغییر آنی کارکرد پزشک، اسلایدر را جابجا کنید.
            </p>
          </div>
        </div>

        {/* SIMULATOR OUTPUT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1: Revenue & Matched Tier */}
          <div className="bg-[#E4EBE0]/60 p-4 rounded-xl border border-[#62745D]/30 space-y-2">
            <div className="text-[11px] font-bold text-[#283F24] flex items-center justify-between">
              <span>درآمد کل و پله تطبيق یافته</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-base font-black font-mono text-[var(--text-main)]">
              {simulatedRevenue.toLocaleString('fa-IR')} تومان
            </div>
            <div className="pt-2 border-t border-[#62745D]/20 flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-muted)] font-bold">پله فعلی:</span>
              <span className="px-2 py-0.5 bg-[#283F24] text-white rounded font-bold">
                {calculationResult.matchedTier?.tierName || 'پله پایه'}
              </span>
            </div>
          </div>

          {/* Card 2: Doctor Share */}
          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 space-y-2">
            <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
              <span>سهم خالص پزشک (Doctor Share)</span>
              <User className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-base font-black font-mono text-emerald-900">
              {calculationResult.doctorShare.toLocaleString('fa-IR')} تومان
            </div>
            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 font-bold">درصد واقعی (مؤثر):</span>
              <span className="font-extrabold text-emerald-800 font-mono">
                {calculationResult.doctorPercentage}٪
              </span>
            </div>
          </div>

          {/* Card 3: Clinic Share */}
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30 space-y-2">
            <div className="text-[11px] font-bold text-blue-800 flex items-center justify-between">
              <span>سهم کلینیک (Clinic Share)</span>
              <Building2 className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-base font-black font-mono text-blue-900">
              {calculationResult.clinicShare.toLocaleString('fa-IR')} تومان
            </div>
            <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-[11px]">
              <span className="text-blue-700 font-bold">درصد سهم کلینیک:</span>
              <span className="font-extrabold text-blue-800 font-mono">
                {calculationResult.clinicPercentage}٪
              </span>
            </div>
          </div>

          {/* Card 4: Remaining to Next Tier */}
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <div className="text-[11px] font-bold text-amber-800 flex items-center justify-between">
              <span>فاصله تا پله بعدی</span>
              <TrendingUp className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-sm font-black font-mono text-amber-900">
              {calculationResult.remainingToNextTier !== null ? (
                `${calculationResult.remainingToNextTier.toLocaleString('fa-IR')} تومان`
              ) : (
                <span className="text-emerald-700 font-bold">بالاترین سطح رسیده‌شده</span>
              )}
            </div>
            <div className="pt-2 border-t border-amber-500/20 text-[10px] text-amber-800 font-bold">
              {calculationResult.nextTier ? (
                <span>ارتقا به «{calculationResult.nextTier.tierName}» ({calculationResult.nextTier.commissionPercentage}٪)</span>
              ) : (
                <span>سهم حداکثری فعال است</span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Table for Current Revenue */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-[var(--text-main)] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#283F24]" />
            <span>جزئیات دقیق تقسیم درآمد ناخالص بین پله‌ها:</span>
          </h4>

          <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[var(--bg-app)] text-[var(--text-muted)] font-bold border-b border-[var(--border-subtle)]">
                  <th className="p-2.5">عنوان پله</th>
                  <th className="p-2.5">مبلغ درآمد در بازه</th>
                  <th className="p-2.5 text-center">نرخ پزشک</th>
                  <th className="p-2.5 text-center">نرخ کلینیک</th>
                  <th className="p-2.5 text-left">مبلغ سهم پزشک</th>
                  <th className="p-2.5 text-left">مبلغ سهم کلینیک</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {calculationResult.breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-app)]/40 font-mono">
                    <td className="p-2.5 font-sans font-extrabold text-[var(--text-main)]">
                      {item.tierLabel}
                    </td>
                    <td className="p-2.5 text-[#283F24] font-bold">
                      {item.revenueInTier.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-2.5 text-center text-emerald-800 font-bold">
                      {item.doctorPercent}٪
                    </td>
                    <td className="p-2.5 text-center text-blue-800 font-bold">
                      {item.clinicPercent}٪
                    </td>
                    <td className="p-2.5 text-left text-emerald-800 font-bold">
                      {item.doctorShare.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-2.5 text-left text-blue-800 font-bold">
                      {item.clinicShare.toLocaleString('fa-IR')} تومان
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AUDIT LOG SECTION */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#283F24]" />
            <h3 className="font-extrabold text-sm text-[var(--text-main)]">
              سوابق و آئودیت تغییرات قرارداد (Audit Log)
            </h3>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            ثبت خودکار تغییرات درصدها، ساختار پله‌ها و بازنگری‌ها
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {localAuditLogs.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] p-4 text-center">
              هنوز هیچ رویداد آئودیتی برای این قرارداد ثبت نشده است.
            </p>
          ) : (
            localAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#283F24]/10 text-[#283F24] font-bold text-[10px] rounded border border-[#62745D]/30 shrink-0">
                    {log.action}
                  </span>
                  <span className="text-[var(--text-main)] font-medium">{log.details}</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                  <span>
                    ثبت‌کننده: <strong className="text-[var(--text-main)]">{log.adminName}</strong> ({log.adminRole})
                  </span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL FOR ADDING / EDITING A TIER */}
      {isTierModalOpen && editingTier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-extrabold text-sm text-[var(--text-main)] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#283F24]" />
                <span>{isNewTier ? 'افزودن پله پورسانت جدید' : 'ویرایش پله پورسانت'}</span>
              </h3>
              <button
                onClick={() => setIsTierModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTierModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)]">عنوان پله:</label>
                  <input
                    type="text"
                    required
                    value={editingTier.tierName || ''}
                    onChange={(e) => setEditingTier({ ...editingTier, tierName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold text-[var(--text-main)] outline-none"
                    placeholder="مثلاً: پله اول - درآمد پایه"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)]">اولویت پله (Priority):</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingTier.priority || 1}
                    onChange={(e) => setEditingTier({ ...editingTier, priority: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)]">حداقل درآمد (تومان):</label>
                  <input
                    type="number"
                    step={100000}
                    min={0}
                    required
                    value={editingTier.minRevenue}
                    onChange={(e) => setEditingTier({ ...editingTier, minRevenue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold text-[#283F24] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)]">
                    حداکثر درآمد (تومان / خالی برای بدون سقف):
                  </label>
                  <input
                    type="number"
                    step={100000}
                    value={editingTier.maxRevenue === null ? '' : editingTier.maxRevenue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingTier({
                        ...editingTier,
                        maxRevenue: val === '' ? null : Number(val)
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none"
                    placeholder="بدون سقف (خالی بگذارید)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-800">درصد سهم پزشک (٪):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={editingTier.commissionPercentage}
                    onChange={(e) => {
                      const docPct = Math.min(100, Math.max(0, Number(e.target.value)));
                      setEditingTier({
                        ...editingTier,
                        commissionPercentage: docPct,
                        clinicPercentage: 100 - docPct
                      });
                    }}
                    className="w-full p-2 rounded-lg border border-emerald-500/30 bg-[var(--bg-surface)] font-mono font-black text-emerald-900 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-blue-800">درصد سهم کلینیک (٪):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={editingTier.clinicPercentage ?? (100 - editingTier.commissionPercentage)}
                    onChange={(e) => {
                      const clinicPct = Math.min(100, Math.max(0, Number(e.target.value)));
                      setEditingTier({
                        ...editingTier,
                        clinicPercentage: clinicPct,
                        commissionPercentage: 100 - clinicPct
                      });
                    }}
                    className="w-full p-2 rounded-lg border border-blue-500/30 bg-[var(--bg-surface)] font-mono font-black text-blue-900 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)]">وضعیت پله:</label>
                  <select
                    value={editingTier.status || 'ACTIVE'}
                    onChange={(e) => setEditingTier({ ...editingTier, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    <option value="ACTIVE">فعال (Active)</option>
                    <option value="INACTIVE">غیرفعال (Inactive)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)]">محدودیت شیفت:</label>
                  <select
                    value={editingTier.shiftType || 'ALL'}
                    onChange={(e) => setEditingTier({ ...editingTier, shiftType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    <option value="ALL">همه شیفت‌ها (مشترک)</option>
                    <option value="MORNING">شیفت صبح</option>
                    <option value="EVENING">شیفت عصر</option>
                    <option value="NIGHT">شیفت شب</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-main)]">توضیحات و یادداشت پله:</label>
                <textarea
                  rows={2}
                  value={editingTier.description || ''}
                  onChange={(e) => setEditingTier({ ...editingTier, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] outline-none"
                  placeholder="مثلاً: پورسانت ویژه عملکرد بالای ۱۰ میلیون"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(false)}
                  className="px-4 py-2 bg-[var(--bg-app)] hover:bg-[var(--border-subtle)] text-[var(--text-main)] rounded-xl font-bold transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#283F24] hover:bg-[#35542F] text-white rounded-xl font-extrabold transition shadow-md"
                >
                  ذخیره پله
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon component helper
const PercentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || 'w-4 h-4'}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
