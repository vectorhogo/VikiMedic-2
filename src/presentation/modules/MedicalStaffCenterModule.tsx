/**
 * VikiMedic v2 - Medical Staff Center (مرکز کادر درمان)
 * Phase 03.8 Enterprise Management Module
 * Clean Architecture Layer: Presentation / Modules
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  UserCheck,
  Users,
  Stethoscope,
  Receipt,
  Calendar,
  TrendingUp,
  BarChart3,
  Plus,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Download,
  Printer,
  Edit3,
  Trash2,
  Eye,
  Award,
  ShieldCheck,
  Calculator,
  Briefcase,
  HeartPulse,
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  ArrowUpRight,
  PieChart as PieChartIcon,
  UserPlus,
  FileCheck,
  Building2,
  Phone,
  CreditCard,
  Percent,
  Check,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import { useClinic } from '../../application/ClinicContext';
import { useTheme } from '../ThemeContext';
import { DoctorCompensationEngine } from '../components/medical-staff/DoctorCompensationEngine';
import {
  MedicalStaffMember,
  StaffCategory,
  EmploymentType,
  StaffMemberStatus,
  StaffContract,
  CommissionTier,
  CommissionCalculationMethod,
  ShiftPerformanceRecord,
  MonthlySettlementRecord,
  StaffScheduleItem,
  StaffAuditLogRecord
} from '../../domain/types';

// ============================================================
// INITIAL MOCK DATA (PERSISTENT / FULLY EXPANDABLE)
// ============================================================

const INITIAL_STAFF_MEMBERS: MedicalStaffMember[] = [
  {
    id: 'staff-doc-01',
    fullName: 'دکتر علیرضا کاظمی',
    medicalCouncilNumber: 'MC-88219',
    nationalId: '0012345678',
    phone: '09121112233',
    specialty: 'پزشک عمومی و پوست',
    subSpecialty: 'زیبایی و لیزر',
    staffCategory: 'DOCTOR',
    employmentType: 'CONTRACT',
    employmentDate: '1401/02/15',
    status: 'ACTIVE',
    workingDays: ['شنبه', 'دوشنبه', 'چهارشنبه'],
    notes: 'سرپرست شیفت عصر - مدرس دوره‌های لیزر'
  },
  {
    id: 'staff-doc-02',
    fullName: 'دکتر مریم سلیمانی',
    medicalCouncilNumber: 'MC-95430',
    nationalId: '0023456789',
    phone: '09123334455',
    specialty: 'متخصص زنان و زایمان',
    subSpecialty: 'ناباروری',
    staffCategory: 'DOCTOR',
    employmentType: 'FULL_TIME',
    employmentDate: '1402/05/10',
    status: 'ACTIVE',
    workingDays: ['یکشنبه', 'سه‌شنبه', 'پنج‌شنبه'],
    notes: 'مسئول فنی بخش زنان'
  },
  {
    id: 'staff-doc-03',
    fullName: 'دکتر حسین رضایی',
    medicalCouncilNumber: 'MC-77112',
    nationalId: '0034567890',
    phone: '09125556677',
    specialty: 'متخصص اطفال و کودکان',
    staffCategory: 'DOCTOR',
    employmentType: 'PART_TIME',
    employmentDate: '1403/01/20',
    status: 'ACTIVE',
    workingDays: ['شنبه', 'یکشنبه', 'دوشنبه'],
    notes: 'پزشک شیفت صبح'
  },
  {
    id: 'staff-physio-01',
    fullName: 'استاد مهدی احمدی',
    medicalCouncilNumber: 'PT-33012',
    nationalId: '0045678901',
    phone: '09127778899',
    specialty: 'فیزیوتراپیست ارشد',
    staffCategory: 'PHYSIOTHERAPIST',
    employmentType: 'CONTRACT',
    employmentDate: '1403/03/01',
    status: 'ACTIVE',
    workingDays: ['همه روزه'],
    notes: 'مسئول کلینیک فیزیوتراپی و توانبخشی'
  },
  {
    id: 'staff-nurse-01',
    fullName: 'سرپرستار زهرا عباسی',
    nationalId: '0056789012',
    phone: '09129990011',
    specialty: 'کارشناس پرستاری و تزریقات',
    staffCategory: 'NURSE',
    employmentType: 'FULL_TIME',
    employmentDate: '1400/09/01',
    status: 'ACTIVE',
    workingDays: ['شنبه تا پنج‌شنبه'],
    notes: 'مسئول سرم‌تراپی و اورژانس'
  },
  {
    id: 'staff-psych-01',
    fullName: 'دکتر سمیرا هاشمی',
    medicalCouncilNumber: 'PSY-1209',
    nationalId: '0067890123',
    phone: '09124445566',
    specialty: 'روانشناس بالینی و مشاور',
    staffCategory: 'PSYCHOLOGIST',
    employmentType: 'ON_CALL',
    employmentDate: '1403/06/15',
    status: 'ACTIVE',
    workingDays: ['دوشنبه', 'پنج‌شنبه'],
    notes: 'مشاوره خانواده و رفتاردرمانی'
  }
];

const INITIAL_CONTRACTS: StaffContract[] = [
  {
    id: 'cnt-01',
    staffId: 'staff-doc-01',
    contractNumber: 'CNT-1405-001',
    startDate: '1405/01/01',
    endDate: '1405/12/29',
    visitTariff: 250000,
    morningShiftTariff: 1200000,
    eveningShiftTariff: 1500000,
    nightShiftTariff: 2000000,
    revenueThreshold: 5750000,
    calculationMethod: 'PERCENTAGE_OF_EXCESS',
    insuranceSupport: true,
    contractStatus: 'ACTIVE',
    createdAt: '1405/01/01',
    commissionTiers: [
      { id: 'tier-1', minRevenue: 0, maxRevenue: 5750000, commissionPercentage: 0 },
      { id: 'tier-2', minRevenue: 5750000, maxRevenue: 8000000, commissionPercentage: 15 },
      { id: 'tier-3', minRevenue: 8000000, maxRevenue: 12000000, commissionPercentage: 18 },
      { id: 'tier-4', minRevenue: 12000000, maxRevenue: null, commissionPercentage: 20 }
    ],
    notes: 'قرارداد پله‌ای پیش‌فرض پزشکان عمومی با آستانه ۵.۷۵ میلیون'
  },
  {
    id: 'cnt-02',
    staffId: 'staff-doc-02',
    contractNumber: 'CNT-1405-002',
    startDate: '1405/01/01',
    endDate: '1405/12/29',
    visitTariff: 350000,
    morningShiftTariff: 2000000,
    eveningShiftTariff: 2500000,
    nightShiftTariff: 3000000,
    revenueThreshold: 0,
    calculationMethod: 'PERCENTAGE_OF_TOTAL',
    insuranceSupport: true,
    contractStatus: 'ACTIVE',
    createdAt: '1405/01/01',
    commissionTiers: [
      { id: 'tier-10', minRevenue: 0, maxRevenue: 10000000, commissionPercentage: 25 },
      { id: 'tier-11', minRevenue: 10000000, maxRevenue: 20000000, commissionPercentage: 30 },
      { id: 'tier-12', minRevenue: 20000000, maxRevenue: null, commissionPercentage: 35 }
    ],
    notes: 'قرارداد کل درآمد ویژه متخصصین زنان'
  },
  {
    id: 'cnt-03',
    staffId: 'staff-physio-01',
    contractNumber: 'CNT-1405-003',
    startDate: '1405/02/01',
    endDate: '1405/12/29',
    visitTariff: 400000,
    morningShiftTariff: 1500000,
    eveningShiftTariff: 1800000,
    nightShiftTariff: 2200000,
    revenueThreshold: 3000000,
    calculationMethod: 'PERCENTAGE_OF_EXCESS',
    insuranceSupport: false,
    contractStatus: 'ACTIVE',
    createdAt: '1405/02/01',
    commissionTiers: [
      { id: 'tier-20', minRevenue: 0, maxRevenue: 3000000, commissionPercentage: 0 },
      { id: 'tier-21', minRevenue: 3000000, maxRevenue: 10000000, commissionPercentage: 40 },
      { id: 'tier-22', minRevenue: 10000000, maxRevenue: null, commissionPercentage: 45 }
    ],
    notes: 'قرارداد فیزیوتراپی با سهم ۴۰ درصد از مازاد'
  }
];

const INITIAL_SHIFT_PERFORMANCES: ShiftPerformanceRecord[] = [
  {
    id: 'shp-01',
    shiftDate: '1405/05/10',
    shiftType: 'EVENING',
    staffId: 'staff-doc-01',
    patientsCount: 28,
    visitCount: 28,
    servicesCount: 12,
    medicinesCount: 18,
    totalRevenue: 14200000,
    insuranceShare: 3200000,
    cashShare: 2000000,
    cardShare: 9000000,
    averageVisitValue: 507142,
    workingHours: 6,
    lateArrivalMinutes: 0,
    extraHours: 1.5
  },
  {
    id: 'shp-02',
    shiftDate: '1405/05/10',
    shiftType: 'MORNING',
    staffId: 'staff-doc-02',
    patientsCount: 34,
    visitCount: 34,
    servicesCount: 20,
    medicinesCount: 25,
    totalRevenue: 22500000,
    insuranceShare: 5500000,
    cashShare: 3000000,
    cardShare: 14000000,
    averageVisitValue: 661764,
    workingHours: 7,
    lateArrivalMinutes: 10,
    extraHours: 2
  },
  {
    id: 'shp-03',
    shiftDate: '1405/05/09',
    shiftType: 'MORNING',
    staffId: 'staff-doc-03',
    patientsCount: 22,
    visitCount: 22,
    servicesCount: 5,
    medicinesCount: 15,
    totalRevenue: 8900000,
    insuranceShare: 2100000,
    cashShare: 1200000,
    cardShare: 5600000,
    averageVisitValue: 404545,
    workingHours: 5,
    lateArrivalMinutes: 0,
    extraHours: 0
  },
  {
    id: 'shp-04',
    shiftDate: '1405/05/09',
    shiftType: 'EVENING',
    staffId: 'staff-physio-01',
    patientsCount: 16,
    visitCount: 16,
    servicesCount: 16,
    medicinesCount: 0,
    totalRevenue: 11200000,
    insuranceShare: 1200000,
    cashShare: 1000000,
    cardShare: 9000000,
    averageVisitValue: 700000,
    workingHours: 6,
    lateArrivalMinutes: 5,
    extraHours: 1
  }
];

const INITIAL_SETTLEMENTS: MonthlySettlementRecord[] = [
  {
    id: 'stl-140504-01',
    staffId: 'staff-doc-01',
    periodJalali: '۱۴۰۵-۰۴',
    totalVisits: 240,
    totalRevenue: 125000000,
    calculatedCommission: 23100000,
    bonusAmount: 1500000,
    penaltyAmount: 0,
    overtimeAmount: 2400000,
    finalSettlementAmount: 27000000,
    paymentStatus: 'PAID',
    paymentDate: '1405/05/02',
    paymentMethod: 'DIRECT_TRANSFER',
    receiptNumber: 'PAY-8830192',
    approvedBy: 'مدیریت مالی',
    notes: 'تسویه حساب تیرماه - کامل پرداخت شد'
  },
  {
    id: 'stl-140504-02',
    staffId: 'staff-doc-02',
    periodJalali: '۱۴۰۵-۰۴',
    totalVisits: 310,
    totalRevenue: 198000000,
    calculatedCommission: 59400000,
    bonusAmount: 3000000,
    penaltyAmount: 200000,
    overtimeAmount: 3800000,
    finalSettlementAmount: 66000000,
    paymentStatus: 'APPROVED',
    approvedBy: 'سرپرست کلینیک',
    notes: 'تأیید شده، آماده واریز پایا'
  },
  {
    id: 'stl-140505-01',
    staffId: 'staff-doc-01',
    periodJalali: '۱۴۰۵-۰۵',
    totalVisits: 185,
    totalRevenue: 98000000,
    calculatedCommission: 17800000,
    bonusAmount: 1000000,
    penaltyAmount: 0,
    overtimeAmount: 1800000,
    finalSettlementAmount: 20600000,
    paymentStatus: 'PENDING',
    notes: 'برآورد اولیه مرداد ماه'
  }
];

const INITIAL_SCHEDULE: StaffScheduleItem[] = [
  { id: 'sch-01', staffId: 'staff-doc-01', date: '1405/05/11', shiftType: 'EVENING', status: 'SCHEDULED' },
  { id: 'sch-02', staffId: 'staff-doc-02', date: '1405/05/11', shiftType: 'MORNING', status: 'SCHEDULED' },
  { id: 'sch-03', staffId: 'staff-doc-03', date: '1405/05/12', shiftType: 'MORNING', status: 'SCHEDULED' },
  { id: 'sch-04', staffId: 'staff-physio-01', date: '1405/05/11', shiftType: 'EVENING', status: 'SCHEDULED' },
  { id: 'sch-05', staffId: 'staff-nurse-01', date: '1405/05/11', shiftType: 'MORNING', status: 'SCHEDULED' }
];

const INITIAL_AUDIT_LOGS: StaffAuditLogRecord[] = [
  {
    id: 'aud-01',
    timestamp: '1405/05/10 14:30',
    userName: 'مدیر سیستم',
    action: 'ویرایش قرارداد',
    entityType: 'CONTRACT',
    details: 'به‌روزرسانی پله‌های کمیسیون برای دکتر علیرضا کاظمی (CNT-1405-001)'
  },
  {
    id: 'aud-02',
    timestamp: '1405/05/02 11:15',
    userName: 'مدیریت مالی',
    action: 'تأیید تسویه حساب',
    entityType: 'SETTLEMENT',
    details: 'پرداخت ۲۷,۰۰۰,۰۰۰ تومان تسویه تیرماه دکتر علیرضا کاظمی ثبت شد'
  },
  {
    id: 'aud-03',
    timestamp: '1405/05/01 09:00',
    userName: 'سرپرست پذیرش',
    action: 'برنامه‌ریزی شیفت',
    entityType: 'SCHEDULE',
    details: 'ثبت شیفت‌های مرداد ماه کادر پزشکی کلینیک'
  }
];

// ============================================================
// COMPONENT DEFINITION
// ============================================================

// Tab Types & Definitions
type StaffCenterTab = 'STAFF_LIST' | 'CONTRACTS' | 'PERFORMANCE' | 'SETTLEMENT' | 'ANALYTICS' | 'SCHEDULE' | 'AUDIT';
type TabGroup = 'ALL' | 'GENERAL' | 'OPERATIONS' | 'FINANCIAL' | 'ANALYTICS';

interface TabDefinition {
  id: StaffCenterTab;
  label: string;
  icon: React.ElementType;
  group: TabGroup;
  badge?: number | string;
  badgeType?: 'default' | 'amber' | 'emerald';
}

export const MedicalStaffCenterModule: React.FC = () => {
  const { theme } = useTheme();
  const { addNotification } = useClinic();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<StaffCenterTab>('STAFF_LIST');
  const [selectedTabGroup, setSelectedTabGroup] = useState<TabGroup>('ALL');

  // Tab Scroll and Focus Refs
  const tabNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  // Core Data States
  const [staffList, setStaffList] = useState<MedicalStaffMember[]>(INITIAL_STAFF_MEMBERS);
  const [contracts, setContracts] = useState<StaffContract[]>(INITIAL_CONTRACTS);
  const [shiftPerformances, setShiftPerformances] = useState<ShiftPerformanceRecord[]>(INITIAL_SHIFT_PERFORMANCES);
  const [settlements, setSettlements] = useState<MonthlySettlementRecord[]>(INITIAL_SETTLEMENTS);
  const [scheduleItems, setScheduleItems] = useState<StaffScheduleItem[]>(INITIAL_SCHEDULE);
  const [auditLogs, setAuditLogs] = useState<StaffAuditLogRecord[]>(INITIAL_AUDIT_LOGS);

  // Check tab container scrollability
  const checkTabScroll = () => {
    if (!tabNavRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabNavRef.current;
    const absScroll = Math.abs(scrollLeft);
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollRight(absScroll > 4);
    setCanScrollLeft(absScroll < maxScroll - 4);
  };

  useEffect(() => {
    const el = tabNavRef.current;
    if (el) {
      checkTabScroll();
      el.addEventListener('scroll', checkTabScroll, { passive: true });
      window.addEventListener('resize', checkTabScroll, { passive: true });
      return () => {
        el.removeEventListener('scroll', checkTabScroll);
        window.removeEventListener('resize', checkTabScroll);
      };
    }
  }, [selectedTabGroup]);

  // Auto-scroll active tab into view when activeTab changes
  useEffect(() => {
    if (!tabNavRef.current) return;
    const activeElement = tabNavRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    checkTabScroll();
  }, [activeTab]);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (!tabNavRef.current) return;
    const delta = direction === 'left' ? -220 : 220;
    tabNavRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const tabDefinitions: TabDefinition[] = useMemo(() => [
    {
      id: 'STAFF_LIST',
      label: 'پزشکان و کادر درمان',
      icon: Stethoscope,
      group: 'GENERAL',
      badge: staffList.length,
      badgeType: 'default'
    },
    {
      id: 'CONTRACTS',
      label: 'قراردادها و تعرفه‌ها',
      icon: FileText,
      group: 'GENERAL',
      badge: contracts.length,
      badgeType: 'default'
    },
    {
      id: 'PERFORMANCE',
      label: 'عملکرد شیفت‌ها',
      icon: Clock,
      group: 'OPERATIONS'
    },
    {
      id: 'SCHEDULE',
      label: 'تقویم شیفت‌بندی',
      icon: Calendar,
      group: 'OPERATIONS'
    },
    {
      id: 'SETTLEMENT',
      label: 'تسویه حساب ماهانه',
      icon: DollarSign,
      group: 'FINANCIAL',
      badge: settlements.filter((s) => s.paymentStatus === 'PENDING').length,
      badgeType: 'amber'
    },
    {
      id: 'ANALYTICS',
      label: 'گزارشات و آنالیز',
      icon: BarChart3,
      group: 'ANALYTICS'
    },
    {
      id: 'AUDIT',
      label: 'سوابق و آئودیت',
      icon: ShieldCheck,
      group: 'ANALYTICS'
    }
  ], [staffList.length, contracts.length, settlements]);

  const visibleTabs = useMemo(() => {
    if (selectedTabGroup === 'ALL') return tabDefinitions;
    return tabDefinitions.filter((tab) => tab.group === selectedTabGroup);
  }, [tabDefinitions, selectedTabGroup]);

  const handleTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowLeft' ? 1 : -1;
      const nextIndex = (currentIndex + direction + visibleTabs.length) % visibleTabs.length;
      const targetTab = visibleTabs[nextIndex];
      setActiveTab(targetTab.id);

      const tabButtons = tabNavRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      if (tabButtons && tabButtons[nextIndex]) {
        tabButtons[nextIndex].focus();
      }
    }
  };

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [employmentFilter, setEmploymentFilter] = useState<string>('ALL');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Modals Open State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [isAddContractOpen, setIsAddContractOpen] = useState<boolean>(false);
  const [isLogShiftOpen, setIsLogShiftOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSlipPrintOpen, setIsSlipPrintOpen] = useState<boolean>(false);

  // Selected Item for Modals
  const [selectedSettlement, setSelectedSettlement] = useState<MonthlySettlementRecord | null>(null);

  // Commission Calculator Test State
  const [testRevenueInput, setTestRevenueInput] = useState<number>(15000000);
  const [selectedContractForTest, setSelectedContractForTest] = useState<string>('cnt-01');

  // Form States
  const [newStaffForm, setNewStaffForm] = useState<Partial<MedicalStaffMember>>({
    fullName: '',
    medicalCouncilNumber: '',
    nationalId: '',
    phone: '',
    specialty: '',
    subSpecialty: '',
    staffCategory: 'DOCTOR',
    employmentType: 'CONTRACT',
    employmentDate: '1405/05/11',
    status: 'ACTIVE',
    workingDays: ['شنبه', 'دوشنبه', 'چهارشنبه'],
    notes: ''
  });

  const [newContractForm, setNewContractForm] = useState<Partial<StaffContract>>({
    staffId: 'staff-doc-01',
    contractNumber: `CNT-1405-${Math.floor(100 + Math.random() * 900)}`,
    startDate: '1405/05/01',
    endDate: '1405/12/29',
    visitTariff: 300000,
    morningShiftTariff: 1500000,
    eveningShiftTariff: 1800000,
    nightShiftTariff: 2200000,
    revenueThreshold: 5750000,
    calculationMethod: 'PERCENTAGE_OF_EXCESS',
    insuranceSupport: true,
    contractStatus: 'ACTIVE',
    commissionTiers: [
      { id: 't-1', minRevenue: 0, maxRevenue: 5750000, commissionPercentage: 0 },
      { id: 't-2', minRevenue: 5750000, maxRevenue: 8000000, commissionPercentage: 15 },
      { id: 't-3', minRevenue: 8000000, maxRevenue: 12000000, commissionPercentage: 18 },
      { id: 't-4', minRevenue: 12000000, maxRevenue: null, commissionPercentage: 20 }
    ]
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: '1405/05/11',
    paymentMethod: 'DIRECT_TRANSFER' as 'DIRECT_TRANSFER' | 'CHEQUE' | 'CASH',
    receiptNumber: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
    approvedBy: 'مدیریت مالی',
    notes: 'واریز پایا از حساب سپهر کلینیک'
  });

  // New Shift Log Form
  const [shiftLogForm, setShiftLogForm] = useState<Partial<ShiftPerformanceRecord>>({
    staffId: 'staff-doc-01',
    shiftDate: '1405/05/11',
    shiftType: 'EVENING',
    patientsCount: 20,
    visitCount: 20,
    servicesCount: 8,
    medicinesCount: 12,
    totalRevenue: 10000000,
    insuranceShare: 2000000,
    cashShare: 1500000,
    cardShare: 6500000,
    workingHours: 6,
    lateArrivalMinutes: 0,
    extraHours: 0
  });

  // ============================================================
  // CALCULATIONS & FILTERED DATA
  // ============================================================

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.fullName.includes(searchQuery) ||
        s.specialty.includes(searchQuery) ||
        (s.medicalCouncilNumber && s.medicalCouncilNumber.includes(searchQuery)) ||
        s.phone.includes(searchQuery);

      const matchesCategory = categoryFilter === 'ALL' || s.staffCategory === categoryFilter;
      const matchesEmployment = employmentFilter === 'ALL' || s.employmentType === employmentFilter;

      return matchesSearch && matchesCategory && matchesEmployment;
    });
  }, [staffList, searchQuery, categoryFilter, employmentFilter]);

  // Dashboard Stats
  const activeDoctorsCount = staffList.filter((s) => s.staffCategory === 'DOCTOR' && s.status === 'ACTIVE').length;
  const totalStaffCount = staffList.length;
  const todayShiftsCount = shiftPerformances.filter((s) => s.shiftDate === '1405/05/10').length;
  const totalTodayVisits = shiftPerformances
    .filter((s) => s.shiftDate === '1405/05/10')
    .reduce((acc, curr) => acc + curr.visitCount, 0);
  const totalTodayRevenue = shiftPerformances
    .filter((s) => s.shiftDate === '1405/05/10')
    .reduce((acc, curr) => acc + curr.totalRevenue, 0);

  const avgRevenuePerVisit = totalTodayVisits > 0 ? Math.round(totalTodayRevenue / totalTodayVisits) : 0;

  // Recharts Data
  const doctorRevenueChartData = useMemo(() => {
    return staffList
      .filter((s) => s.staffCategory === 'DOCTOR')
      .map((doc) => {
        const totalDocRevenue = shiftPerformances
          .filter((p) => p.staffId === doc.id)
          .reduce((acc, p) => acc + p.totalRevenue, 0);
        const totalVisits = shiftPerformances
          .filter((p) => p.staffId === doc.id)
          .reduce((acc, p) => acc + p.visitCount, 0);

        return {
          name: doc.fullName.replace('دکتر ', ''),
          revenue: totalDocRevenue / 1000000, // in Millions
          visits: totalVisits
        };
      });
  }, [staffList, shiftPerformances]);

  const categoryDistributionData = useMemo(() => {
    const map: Record<string, number> = {};
    staffList.forEach((s) => {
      map[s.staffCategory] = (map[s.staffCategory] || 0) + 1;
    });

    const categoryNamesFa: Record<string, string> = {
      DOCTOR: 'پزشکان',
      NURSE: 'پرستاران',
      MIDWIFE: 'مامایی',
      PSYCHOLOGIST: 'روانشناسان',
      NUTRITIONIST: 'تغذیه',
      PHYSIOTHERAPIST: 'فیزیوتراپی',
      TECHNICIAN: 'تکنسین‌ها',
      OTHER: 'سایر'
    };

    return Object.entries(map).map(([cat, count]) => ({
      name: categoryNamesFa[cat] || cat,
      value: count
    }));
  }, [staffList]);

  const chartColors = theme === 'clinic-olive'
    ? ['#283F24', '#35542F', '#4F6F4A', '#62745D', '#9A9E91', '#889B73']
    : ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

  // Multi-level Commission Engine
  const calculateCommissionForRevenue = (contract: StaffContract, grossRevenue: number) => {
    if (!contract || !contract.commissionTiers || contract.commissionTiers.length === 0) {
      return { totalCommission: 0, breakdown: [] };
    }

    let totalCommission = 0;
    const breakdown: { tierLabel: string; revenueInTier: number; percent: number; commission: number }[] = [];
    const method = contract.calculationMethod || 'MULTI_LEVEL_PERCENTAGE';
    const baseSalary = contract.fixedBaseSalary || 0;

    if (method === 'FIXED_PERCENTAGE' || method === 'PERCENTAGE_OF_TOTAL') {
      const matchingTier = contract.commissionTiers.find((t) => {
        if (t.maxRevenue === null) return grossRevenue >= t.minRevenue;
        return grossRevenue >= t.minRevenue && grossRevenue <= t.maxRevenue;
      }) || contract.commissionTiers[contract.commissionTiers.length - 1];

      totalCommission = Math.round((grossRevenue * matchingTier.commissionPercentage) / 100);
      breakdown.push({
        tierLabel: `کل درآمد (نرخ ${matchingTier.commissionPercentage}٪)`,
        revenueInTier: grossRevenue,
        percent: matchingTier.commissionPercentage,
        commission: totalCommission
      });
    } else if (method === 'FIXED_AMOUNT') {
      const matchingTier = contract.commissionTiers.find((t) => {
        if (t.maxRevenue === null) return grossRevenue >= t.minRevenue;
        return grossRevenue >= t.minRevenue && grossRevenue <= t.maxRevenue;
      }) || contract.commissionTiers[0];

      totalCommission = matchingTier?.fixedAmount || 1500000;
      breakdown.push({
        tierLabel: matchingTier?.tierName || 'مبلغ ثابت پله',
        revenueInTier: grossRevenue,
        percent: 0,
        commission: totalCommission
      });
    } else {
      // MULTI_LEVEL_PERCENTAGE / PERCENTAGE_OF_EXCESS / HYBRID
      contract.commissionTiers.forEach((tier) => {
        if (grossRevenue > tier.minRevenue) {
          const upper = tier.maxRevenue !== null ? Math.min(grossRevenue, tier.maxRevenue) : grossRevenue;
          const taxableAmount = upper - tier.minRevenue;
          if (taxableAmount > 0) {
            const tierCommission = Math.round((taxableAmount * tier.commissionPercentage) / 100);
            totalCommission += tierCommission;
            breakdown.push({
              tierLabel: `${tier.tierName || 'پله'} (${tier.minRevenue.toLocaleString('fa-IR')} تا ${
                tier.maxRevenue ? tier.maxRevenue.toLocaleString('fa-IR') : 'بالاتر'
              })`,
              revenueInTier: taxableAmount,
              percent: tier.commissionPercentage,
              commission: tierCommission
            });
          }
        }
      });
      if (method === 'HYBRID') {
        totalCommission += baseSalary;
      }
    }

    return { totalCommission, breakdown };
  };

  // Selected Doctor Details for Profile Drawer
  const selectedStaffMember = useMemo(() => {
    return staffList.find((s) => s.id === selectedStaffId) || null;
  }, [staffList, selectedStaffId]);

  const selectedStaffContract = useMemo(() => {
    return contracts.find((c) => c.staffId === selectedStaffId) || null;
  }, [contracts, selectedStaffId]);

  const selectedStaffShifts = useMemo(() => {
    return shiftPerformances.filter((sp) => sp.staffId === selectedStaffId);
  }, [shiftPerformances, selectedStaffId]);

  const selectedStaffSettlements = useMemo(() => {
    return settlements.filter((s) => s.staffId === selectedStaffId);
  }, [settlements, selectedStaffId]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.fullName || !newStaffForm.nationalId) {
      addNotification({
        id: Date.now().toString(),
        type: 'danger',
        message: 'لطفاً نام و کد ملی کادر درمان را وارد کنید.',
        timestamp: 'هم‌اکنون'
      });
      return;
    }

    const createdMember: MedicalStaffMember = {
      id: `staff-${Date.now().toString(36)}`,
      fullName: newStaffForm.fullName!,
      medicalCouncilNumber: newStaffForm.medicalCouncilNumber || undefined,
      nationalId: newStaffForm.nationalId!,
      phone: newStaffForm.phone || '09120000000',
      specialty: newStaffForm.specialty || 'عمومی',
      subSpecialty: newStaffForm.subSpecialty || undefined,
      staffCategory: (newStaffForm.staffCategory as StaffCategory) || 'DOCTOR',
      employmentType: (newStaffForm.employmentType as EmploymentType) || 'CONTRACT',
      employmentDate: newStaffForm.employmentDate || '1405/05/11',
      status: (newStaffForm.status as StaffMemberStatus) || 'ACTIVE',
      workingDays: newStaffForm.workingDays || ['شنبه', 'دوشنبه'],
      notes: newStaffForm.notes
    };

    setStaffList((prev) => [createdMember, ...prev]);

    // Create a default contract for this member
    const defaultContract: StaffContract = {
      id: `cnt-${Date.now().toString(36)}`,
      staffId: createdMember.id,
      contractNumber: `CNT-1405-${Math.floor(100 + Math.random() * 900)}`,
      startDate: '1405/05/01',
      endDate: '1405/12/29',
      visitTariff: 250000,
      morningShiftTariff: 1200000,
      eveningShiftTariff: 1500000,
      nightShiftTariff: 2000000,
      revenueThreshold: 5750000,
      calculationMethod: 'PERCENTAGE_OF_EXCESS',
      insuranceSupport: true,
      contractStatus: 'ACTIVE',
      createdAt: '1405/05/11',
      commissionTiers: [
        { id: `t-1-${Date.now()}`, minRevenue: 0, maxRevenue: 5750000, commissionPercentage: 0 },
        { id: `t-2-${Date.now()}`, minRevenue: 5750000, maxRevenue: 8000000, commissionPercentage: 15 },
        { id: `t-3-${Date.now()}`, minRevenue: 8000000, maxRevenue: 12000000, commissionPercentage: 18 },
        { id: `t-4-${Date.now()}`, minRevenue: 12000000, maxRevenue: null, commissionPercentage: 20 }
      ]
    };

    setContracts((prev) => [defaultContract, ...prev]);

    // Add Audit Log
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: '1405/05/11 11:40',
        userName: 'مدیر کلینیک',
        action: 'ثبت کادر درمان جدید',
        entityType: 'DOCTOR',
        details: `افزودن ${createdMember.fullName} (${createdMember.specialty}) به کادر پزشکی`
      },
      ...prev
    ]);

    setIsAddStaffOpen(false);
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      message: `عضو جدید ${createdMember.fullName} با موفقیت در مرکز کادر درمان ثبت شد.`,
      timestamp: 'هم‌اکنون'
    });
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractForm.staffId || !newContractForm.contractNumber) {
      return;
    }

    const createdContract: StaffContract = {
      id: `cnt-${Date.now().toString(36)}`,
      staffId: newContractForm.staffId!,
      contractNumber: newContractForm.contractNumber!,
      startDate: newContractForm.startDate || '1405/05/01',
      endDate: newContractForm.endDate || '1405/12/29',
      visitTariff: Number(newContractForm.visitTariff) || 250000,
      morningShiftTariff: Number(newContractForm.morningShiftTariff) || 1200000,
      eveningShiftTariff: Number(newContractForm.eveningShiftTariff) || 1500000,
      nightShiftTariff: Number(newContractForm.nightShiftTariff) || 2000000,
      revenueThreshold: Number(newContractForm.revenueThreshold) || 5750000,
      calculationMethod: (newContractForm.calculationMethod as CommissionCalculationMethod) || 'PERCENTAGE_OF_EXCESS',
      insuranceSupport: newContractForm.insuranceSupport ?? true,
      contractStatus: 'ACTIVE',
      createdAt: '1405/05/11',
      commissionTiers: newContractForm.commissionTiers || []
    };

    setContracts((prev) => [createdContract, ...prev]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: '1405/05/11 11:42',
        userName: 'مدیریت مالی',
        action: 'تنظیم قرارداد جدید',
        entityType: 'CONTRACT',
        details: `ثبت قرارداد ${createdContract.contractNumber} با تعرفه چندسطحی`
      },
      ...prev
    ]);

    setIsAddContractOpen(false);
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      message: `قرارداد جدید ${createdContract.contractNumber} فعال و اعمال شد.`,
      timestamp: 'هم‌اکنون'
    });
  };

  const handleLogShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftLogForm.staffId) return;

    const staffObj = staffList.find((s) => s.id === shiftLogForm.staffId);
    const totalRev = Number(shiftLogForm.totalRevenue) || 0;
    const visits = Number(shiftLogForm.visitCount) || 1;

    const newRecord: ShiftPerformanceRecord = {
      id: `shp-${Date.now().toString(36)}`,
      shiftDate: shiftLogForm.shiftDate || '1405/05/11',
      shiftType: shiftLogForm.shiftType || 'EVENING',
      staffId: shiftLogForm.staffId!,
      patientsCount: Number(shiftLogForm.patientsCount) || visits,
      visitCount: visits,
      servicesCount: Number(shiftLogForm.servicesCount) || 0,
      medicinesCount: Number(shiftLogForm.medicinesCount) || 0,
      totalRevenue: totalRev,
      insuranceShare: Number(shiftLogForm.insuranceShare) || 0,
      cashShare: Number(shiftLogForm.cashShare) || 0,
      cardShare: Number(shiftLogForm.cardShare) || 0,
      averageVisitValue: Math.round(totalRev / visits),
      workingHours: Number(shiftLogForm.workingHours) || 6,
      lateArrivalMinutes: Number(shiftLogForm.lateArrivalMinutes) || 0,
      extraHours: Number(shiftLogForm.extraHours) || 0
    };

    setShiftPerformances((prev) => [newRecord, ...prev]);
    setIsLogShiftOpen(false);

    addNotification({
      id: Date.now().toString(),
      type: 'success',
      message: `عملکرد شیفت ${staffObj?.fullName || ''} ثبت شد.`,
      timestamp: 'هم‌اکنون'
    });
  };

  const handleUpdatePaymentStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlement) return;

    setSettlements((prev) =>
      prev.map((s) =>
        s.id === selectedSettlement.id
          ? {
              ...s,
              paymentStatus: 'PAID',
              paymentDate: paymentForm.paymentDate,
              paymentMethod: paymentForm.paymentMethod,
              receiptNumber: paymentForm.receiptNumber,
              approvedBy: paymentForm.approvedBy,
              notes: paymentForm.notes
            }
          : s
      )
    );

    setIsPaymentModalOpen(false);
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      message: `وضعیت پرداخت تسویه‌حساب به "پرداخت شده" تغییر یافت و فیش صادر شد.`,
      timestamp: 'هم‌اکنون'
    });
  };

  const handleExportData = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      message: `فایل ${format} گزارش جامع مرکز کادر درمان تولید شد.`,
      timestamp: 'هم‌اکنون'
    });
    setIsExportModalOpen(false);
  };

  // ============================================================
  // RENDER UI
  // ============================================================

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-main)] overflow-y-auto p-4 md:p-6 space-y-6 dir-rtl select-none">
      {/* 1. TOP MODULE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#283F24] text-white flex items-center justify-center shadow-lg shadow-[#283F24]/20 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-main)]">
                مرکز کادر درمان (Medical Staff Center)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#283F24]/10 text-[#283F24] border border-[#62745D]/30">
                Phase 03.8 Enterprise
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              مدیریت جامع پزشکان، کادر درمان، قراردادها، محاسبه کمیسیون‌های پله‌ای چندسطحی، تسویه‌حساب ماهانه و شیفت‌بندی
            </p>
          </div>
        </div>

        {/* Quick Action Top Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#283F24] hover:bg-[#35542F] text-white text-xs font-bold transition shadow flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت پزشک/کادر جدید</span>
          </button>
          <button
            onClick={() => setIsAddContractOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] border border-[#62745D] text-[#283F24] text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-[#283F24]" />
            <span>تنظیم قرارداد جدید</span>
          </button>
          <button
            onClick={() => setIsLogShiftOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs font-bold transition flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>ثبت عملکرد شیفت</span>
          </button>
          <button
            onClick={() => setActiveTab('SETTLEMENT')}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs font-bold transition flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>تسویه حساب ماهانه</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2.5 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs font-bold transition"
            title="خروجی گزارش جامع"
          >
            <Printer className="w-4 h-4 text-[#283F24]" />
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* KPI 1 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-bold mb-2">
            <span>پزشکان فعال</span>
            <Stethoscope className="w-4 h-4 text-[#283F24]" />
          </div>
          <div className="text-xl font-black font-mono text-[var(--text-main)]">
            {activeDoctorsCount.toLocaleString('fa-IR')} <span className="text-xs font-normal">نفر</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">از کل {totalStaffCount} کادر کلینیک</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-bold mb-2">
            <span>شیفت‌های امروز</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black font-mono text-[var(--text-main)]">
            {todayShiftsCount.toLocaleString('fa-IR')} <span className="text-xs font-normal">شیفت</span>
          </div>
          <div className="text-[10px] text-blue-600 font-bold mt-1">صبح، عصر و شب</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-bold mb-2">
            <span>ویزیت‌های امروز</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black font-mono text-[var(--text-main)]">
            {totalTodayVisits.toLocaleString('fa-IR')} <span className="text-xs font-normal">بیمار</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold mt-1">مجموع پزشکان شیفت</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-bold mb-2">
            <span>میانگین ویزیت</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-black font-mono text-[#283F24]">
            {avgRevenuePerVisit.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
          </div>
          <div className="text-[10px] text-[#283F24] font-bold mt-1">درآمد به‌ازای هر بیمار</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-bold mb-2">
            <span>درآمد شیفت‌ها</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-600">
            {(totalTodayRevenue / 1000000).toLocaleString('fa-IR')} <span className="text-xs font-normal">م.تومان</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">فروش کل امروز</div>
        </div>

        {/* KPI 6 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-bold mb-2">
            <span>پزشک برتر امروز</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-black text-[var(--text-main)] truncate">
            دکتر مریم سلیمانی
          </div>
          <div className="text-[10px] text-amber-600 font-bold mt-1">۲۲.۵ م.تومان (۳۴ ویزیت)</div>
        </div>
      </div>

      {/* 3. SUB-MODULE NAVIGATION TABS (ENTERPRISE RESPONSIVE CONTAINER) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2 rounded-2xl shadow-sm relative w-full flex flex-col md:flex-row items-stretch md:items-center gap-2 select-none">
        {/* Tab Group Selector Dropdown / Pills */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-b md:border-b-0 md:border-l border-[var(--border-subtle)] pb-2 md:pb-0">
          <div className="flex items-center gap-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] p-1 rounded-xl text-xs">
            <Layers className="w-3.5 h-3.5 text-[#283F24] dark:text-emerald-400 shrink-0 mr-1" />
            <select
              value={selectedTabGroup}
              onChange={(e) => setSelectedTabGroup(e.target.value as TabGroup)}
              className="bg-transparent text-xs font-bold text-[var(--text-main)] focus:outline-none cursor-pointer pr-1"
              aria-label="دسته‌بندی تب‌ها"
            >
              <option value="ALL">همه تب‌ها ({tabDefinitions.length})</option>
              <option value="GENERAL">کادر و قراردادها</option>
              <option value="OPERATIONS">شیفت و کارکرد</option>
              <option value="FINANCIAL">امور مالی و تسویه</option>
              <option value="ANALYTICS">گزارشات و نظارت</option>
            </select>
          </div>
        </div>

        {/* Main Scrollable Tab Bar Container */}
        <div className="relative flex-1 flex items-center min-w-0 overflow-hidden">
          {/* Right Scroll Arrow (RTL start) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScrollTabs('right')}
              className="absolute right-0 z-20 p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[#E4EBE0] dark:hover:bg-neutral-800 border border-[var(--border-subtle)] text-[#283F24] dark:text-emerald-400 shadow-md transition-transform active:scale-95 flex items-center justify-center shrink-0"
              title="اسکرول به راست"
              aria-label="اسکرول تب‌ها به راست"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Right Gradient Fade Indicator */}
          {canScrollRight && (
            <div className="absolute right-7 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-surface)] to-transparent pointer-events-none z-10" />
          )}

          {/* Horizontal Scroll Track */}
          <div
            ref={tabNavRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-none w-full px-1 py-0.5 dir-rtl flex-nowrap"
            role="tablist"
            aria-label="تب‌های مرکز کادر درمان"
          >
            {visibleTabs.map((tab, idx) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`min-w-[120px] max-w-[220px] shrink-0 h-10 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#283F24] ${
                    isActive
                      ? 'bg-[#283F24] text-white shadow-md border-b-2 border-emerald-400 font-bold'
                      : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[#E4EBE0]/70 dark:hover:bg-neutral-800/80 border border-[var(--border-subtle)]'
                  }`}
                  title={tab.label}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-[var(--text-muted)]'}`} />
                    <span className="truncate text-xs font-bold">{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && tab.badge !== 0 && (
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.badgeType === 'amber'
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#283F24]/10 text-[#283F24] dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Gradient Fade Indicator */}
          {canScrollLeft && (
            <div className="absolute left-7 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-surface)] to-transparent pointer-events-none z-10" />
          )}

          {/* Left Scroll Arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScrollTabs('left')}
              className="absolute left-0 z-20 p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[#E4EBE0] dark:hover:bg-neutral-800 border border-[var(--border-subtle)] text-[#283F24] dark:text-emerald-400 shadow-md transition-transform active:scale-95 flex items-center justify-center shrink-0"
              title="اسکرول به چپ"
              aria-label="اسکرول تب‌ها به چپ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: DOCTORS & MEDICAL STAFF LIST */}
      {activeTab === 'STAFF_LIST' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو نام، نظام پزشکی، تخصص، تلفن..."
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs focus:outline-none focus:ring-2 focus:ring-[#283F24]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-[var(--text-muted)] font-bold">رده کادر:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs font-bold outline-none"
              >
                <option value="ALL">همه رده‌ها</option>
                <option value="DOCTOR">پزشکان</option>
                <option value="PHYSIOTHERAPIST">فیزیوتراپیست</option>
                <option value="NURSE">پرستاران</option>
                <option value="PSYCHOLOGIST">روانشناسان</option>
                <option value="NUTRITIONIST">تغذیه</option>
                <option value="MIDWIFE">مامایی</option>
                <option value="TECHNICIAN">تکنسین‌ها</option>
              </select>

              <span className="text-xs text-[var(--text-muted)] font-bold mr-2">نوع قرارداد:</span>
              <select
                value={employmentFilter}
                onChange={(e) => setEmploymentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs font-bold outline-none"
              >
                <option value="ALL">همه انواع</option>
                <option value="FULL_TIME">تمام وقت</option>
                <option value="PART_TIME">پاره وقت</option>
                <option value="CONTRACT">قراردادی / کمیسیونی</option>
                <option value="ON_CALL">آنکال / موردی</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                  <tr>
                    <th className="p-3.5">نام و نام خانوادگی</th>
                    <th className="p-3.5">شماره نظام پزشکی</th>
                    <th className="p-3.5">رده و تخصص</th>
                    <th className="p-3.5">نوع همکاری</th>
                    <th className="p-3.5">روزهای حضور</th>
                    <th className="p-3.5">شماره تماس</th>
                    <th className="p-3.5 text-center">وضعیت</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredStaff.map((staff) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-[#E4EBE0]/50 transition cursor-pointer"
                      onClick={() => {
                        setSelectedStaffId(staff.id);
                        setIsProfileDrawerOpen(true);
                      }}
                    >
                      <td className="p-3.5 font-bold flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#283F24] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {staff.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[var(--text-main)] font-black">{staff.fullName}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">کد ملی: {staff.nationalId}</div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#283F24]">
                        {staff.medicalCouncilNumber || '---'}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold">{staff.specialty}</div>
                        {staff.subSpecialty && (
                          <div className="text-[10px] text-[var(--text-muted)]">{staff.subSpecialty}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-bold">
                        {staff.employmentType === 'FULL_TIME' && <span className="text-emerald-700">تمام وقت</span>}
                        {staff.employmentType === 'PART_TIME' && <span className="text-blue-700">پاره وقت</span>}
                        {staff.employmentType === 'CONTRACT' && <span className="text-purple-700">درصدی/قراردادی</span>}
                        {staff.employmentType === 'ON_CALL' && <span className="text-amber-700">آنکال</span>}
                      </td>
                      <td className="p-3.5 text-[11px] text-[var(--text-muted)]">
                        {staff.workingDays?.join('، ') || 'مشخص نشده'}
                      </td>
                      <td className="p-3.5 font-mono font-bold dir-ltr text-right">{staff.phone}</td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            staff.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                          }`}
                        >
                          {staff.status === 'ACTIVE' ? 'فعال در کلینیک' : 'مرخصی / غیرفعال'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedStaffId(staff.id);
                              setIsProfileDrawerOpen(true);
                            }}
                            className="p-1.5 hover:bg-[#E4EBE0] rounded-lg text-[#283F24] transition"
                            title="شناسنامه کامل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setNewContractForm((prev) => ({ ...prev, staffId: staff.id }));
                              setIsAddContractOpen(true);
                            }}
                            className="p-1.5 hover:bg-[#E4EBE0] rounded-lg text-emerald-700 transition"
                            title="ثبت قرارداد جدید"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACTS & COMPENSATION ENGINE */}
      {activeTab === 'CONTRACTS' && (
        <DoctorCompensationEngine
          contracts={contracts}
          staffList={staffList}
          selectedStaffId={selectedStaffId}
          currentUserRole="ADMIN"
          currentUserName="مدیر ارشد کلینیک"
          onSaveContract={(updatedContract) => {
            setContracts((prev) =>
              prev.map((c) => (c.id === updatedContract.id ? updatedContract : c))
            );
          }}
        />
      )}

      {/* TAB 3: SHIFT PERFORMANCE */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm">
            <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#283F24]" />
              <span>سوابق عملکرد شیفت‌های کاری پزشکان و کادر</span>
            </h3>

            <button
              onClick={() => setIsLogShiftOpen(true)}
              className="px-3.5 py-2 bg-[#283F24] hover:bg-[#35542F] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت شیفت جدید</span>
            </button>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                  <tr>
                    <th className="p-3.5">تاریخ</th>
                    <th className="p-3.5">شیفت</th>
                    <th className="p-3.5">پزشک / کادر</th>
                    <th className="p-3.5 text-center">تعداد ویزیت</th>
                    <th className="p-3.5 text-center">خدمات/دارو</th>
                    <th className="p-3.5">درآمد کل</th>
                    <th className="p-3.5">سهم بیمه/نقد/کارت</th>
                    <th className="p-3.5 text-center">میانگین ویزیت</th>
                    <th className="p-3.5 text-center">ساعات / تاخیر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {shiftPerformances.map((shift) => {
                    const staff = staffList.find((s) => s.id === shift.staffId);
                    return (
                      <tr key={shift.id} className="hover:bg-[#E4EBE0]/50 transition">
                        <td className="p-3.5 font-mono font-bold text-[var(--text-main)]">{shift.shiftDate}</td>
                        <td className="p-3.5 font-bold">
                          {shift.shiftType === 'MORNING' && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 font-bold text-[10px]">
                              صبح
                            </span>
                          )}
                          {shift.shiftType === 'EVENING' && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 font-bold text-[10px]">
                              عصر
                            </span>
                          )}
                          {shift.shiftType === 'NIGHT' && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 font-bold text-[10px]">
                              شب
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-[#283F24]">{staff?.fullName || '---'}</td>
                        <td className="p-3.5 text-center font-mono font-bold">{shift.visitCount.toLocaleString('fa-IR')}</td>
                        <td className="p-3.5 text-center font-mono text-[var(--text-muted)]">
                          {shift.servicesCount} / {shift.medicinesCount}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-700">
                          {shift.totalRevenue.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="p-3.5 text-[10px] font-mono text-[var(--text-muted)]">
                          بیمه: {shift.insuranceShare.toLocaleString('fa-IR')} | کارت: {shift.cardShare.toLocaleString('fa-IR')}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-indigo-700">
                          {shift.averageVisitValue.toLocaleString('fa-IR')}
                        </td>
                        <td className="p-3.5 text-center font-mono text-[11px]">
                          {shift.workingHours} ساعت{' '}
                          {shift.lateArrivalMinutes > 0 && (
                            <span className="text-red-500 font-bold">({shift.lateArrivalMinutes}د تاخیر)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MONTHLY SETTLEMENT */}
      {activeTab === 'SETTLEMENT' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#283F24]" />
                <span>لیست تسویه‌حساب‌های ماهانه و صورت‌حساب مالی پزشکان</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                محاسبه خودکار کارمزد، پاداش، جریمه و صدور فیش تسویه‌حساب
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                  <tr>
                    <th className="p-3.5">پزشک / کادر</th>
                    <th className="p-3.5">دوره مالی</th>
                    <th className="p-3.5 text-center">تعداد ویزیت</th>
                    <th className="p-3.5">درآمد کل</th>
                    <th className="p-3.5">کمیسیون پله‌ای</th>
                    <th className="p-3.5">پاداش / اضافه کاری</th>
                    <th className="p-3.5 font-black">مبلغ نهایی تسویه</th>
                    <th className="p-3.5 text-center">وضعیت پرداخت</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {settlements.map((st) => {
                    const staff = staffList.find((s) => s.id === st.staffId);
                    return (
                      <tr key={st.id} className="hover:bg-[#E4EBE0]/50 transition">
                        <td className="p-3.5 font-bold text-[var(--text-main)]">{staff?.fullName}</td>
                        <td className="p-3.5 font-mono font-bold text-[#283F24]">{st.periodJalali}</td>
                        <td className="p-3.5 text-center font-mono font-bold">{st.totalVisits.toLocaleString('fa-IR')}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-700">
                          {st.totalRevenue.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-700">
                          {st.calculatedCommission.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-indigo-700">
                          +{(st.bonusAmount + st.overtimeAmount).toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="p-3.5 font-mono font-black text-sm text-[#283F24]">
                          {st.finalSettlementAmount.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="p-3.5 text-center">
                          {st.paymentStatus === 'PAID' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                              پرداخت شده
                            </span>
                          )}
                          {st.paymentStatus === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-700 border border-blue-500/30">
                              تأیید شده / آماده واریز
                            </span>
                          )}
                          {st.paymentStatus === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-700 border border-amber-500/30">
                              در انتظار بررسی
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {st.paymentStatus !== 'PAID' && (
                              <button
                                onClick={() => {
                                  setSelectedSettlement(st);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-[#283F24] hover:bg-[#35542F] text-white rounded-lg text-[11px] font-bold transition shadow-sm"
                              >
                                ثبت واریز
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedSettlement(st);
                                setIsSlipPrintOpen(true);
                              }}
                              className="p-1.5 hover:bg-[#E4EBE0] text-[#283F24] rounded-lg transition"
                              title="مشاهده/چاپ فیش تسویه"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Revenue by Doctor */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#283F24]" />
                <span>مقایسه کارکرد مالی پزشکان (میلیون تومان)</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorRevenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-main)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-main)' }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} میلیون تومان`, 'درآمد']}
                      contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill={theme === 'clinic-olive' ? '#283F24' : '#3b82f6'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Distribution */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                <span>توزیع رده‌های کادر درمان در کلینیک</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SCHEDULE & CALENDAR */}
      {activeTab === 'SCHEDULE' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#283F24]" />
              <span>تقویم شیفت‌بندی و برنامه حضور پزشکان (مرداد ۱۴۰۵)</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)]">امروز: ۱۴۰۵/۰۵/۱۱</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {['شنبه (05/10)', 'یکشنبه (05/11)', 'دوشنبه (05/12)', 'سه‌شنبه (05/13)', 'چهارشنبه (05/14)'].map((day, idx) => (
              <div key={idx} className="bg-[var(--bg-app)] border border-[var(--border-subtle)] p-3 rounded-xl space-y-2">
                <div className="text-xs font-black text-[#283F24] border-b border-[var(--border-subtle)] pb-1.5 text-center">
                  {day}
                </div>

                {/* Shift Items */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg font-bold text-amber-800">
                    <div>صبح: دکتر مریم سلیمانی</div>
                    <div className="text-[9px] font-normal text-amber-700">08:00 تا 14:00</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg font-bold text-blue-800">
                    <div>عصر: دکتر علیرضا کاظمی</div>
                    <div className="text-[9px] font-normal text-blue-700">14:00 تا 20:00</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg font-bold text-emerald-800">
                    <div>فیزیوتراپی: استاد مهدی احمدی</div>
                    <div className="text-[9px] font-normal text-emerald-700">عصرها</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#283F24]" />
            <span>سوابق آئودیت و تغییرات حساس کادر درمان</span>
          </h3>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-[var(--bg-app)] border border-[var(--border-subtle)] p-3.5 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#283F24]/10 text-[#283F24] flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[var(--text-main)]">{log.action} ({log.entityType})</span>
                    <span className="text-[var(--text-muted)] font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="text-[var(--text-muted)] mt-1">{log.details}</p>
                  <div className="text-[10px] text-slate-500 mt-0.5">کاربر: {log.userName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS & DRAWERS */}
      {/* ============================================================ */}

      {/* MODAL 1: ADD NEW STAFF */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#283F24]" />
                <span>ثبت عضو جدید کادر درمان و پزشکی</span>
              </h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">نام و نام خانوادگی*:</label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.fullName}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="مثال: دکتر کیوان طاهری"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">شماره نظام پزشکی:</label>
                  <input
                    type="text"
                    value={newStaffForm.medicalCouncilNumber}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, medicalCouncilNumber: e.target.value }))}
                    placeholder="مثال: MC-99120"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">کد ملی*:</label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.nationalId}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, nationalId: e.target.value }))}
                    placeholder="10 رقم"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">شماره همراه:</label>
                  <input
                    type="text"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0912..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">رده کادر درمان:</label>
                  <select
                    value={newStaffForm.staffCategory}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, staffCategory: e.target.value as StaffCategory }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    <option value="DOCTOR">پزشک</option>
                    <option value="PHYSIOTHERAPIST">فیزیوتراپیست</option>
                    <option value="NURSE">پرستار</option>
                    <option value="PSYCHOLOGIST">روانشناس</option>
                    <option value="NUTRITIONIST">تغذیه</option>
                    <option value="MIDWIFE">ماما</option>
                    <option value="TECHNICIAN">تکنسین</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">نوع همکاری:</label>
                  <select
                    value={newStaffForm.employmentType}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, employmentType: e.target.value as EmploymentType }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    <option value="CONTRACT">قراردادی / درصدی</option>
                    <option value="FULL_TIME">تمام وقت</option>
                    <option value="PART_TIME">پاره وقت</option>
                    <option value="ON_CALL">آنکال</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-bold mb-1">تخصص / حیطه فعالیت:</label>
                <input
                  type="text"
                  value={newStaffForm.specialty}
                  onChange={(e) => setNewStaffForm((prev) => ({ ...prev, specialty: e.target.value }))}
                  placeholder="مثال: متخصص قلب و عروق"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] text-[var(--text-main)] font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#283F24] hover:bg-[#35542F] text-white font-bold shadow"
                >
                  ثبت و ایجاد پرونده
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CONTRACT */}
      {isAddContractOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#283F24]" />
                <span>تنظیم قرارداد و تعرفه پله‌ای چندسطحی</span>
              </h3>
              <button onClick={() => setIsAddContractOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">انتخاب کادر/پزشک:</label>
                  <select
                    value={newContractForm.staffId}
                    onChange={(e) => setNewContractForm((prev) => ({ ...prev, staffId: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">شماره قرارداد:</label>
                  <input
                    type="text"
                    value={newContractForm.contractNumber}
                    onChange={(e) => setNewContractForm((prev) => ({ ...prev, contractNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none text-[#283F24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">تعرفه ویزیت (تومان):</label>
                  <input
                    type="number"
                    step={10000}
                    value={newContractForm.visitTariff}
                    onChange={(e) => setNewContractForm((prev) => ({ ...prev, visitTariff: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">آستانه درآمد (تومان):</label>
                  <input
                    type="number"
                    step={250000}
                    value={newContractForm.revenueThreshold}
                    onChange={(e) => setNewContractForm((prev) => ({ ...prev, revenueThreshold: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none text-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">روش محاسبه:</label>
                  <select
                    value={newContractForm.calculationMethod}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        calculationMethod: e.target.value as CommissionCalculationMethod
                      }))
                    }
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    <option value="PERCENTAGE_OF_EXCESS">درصد از مازاد درآمد</option>
                    <option value="PERCENTAGE_OF_TOTAL">درصد از کل درآمد</option>
                  </select>
                </div>
              </div>

              {/* Commission Tiers Builder */}
              <div className="bg-[var(--bg-app)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-[#283F24]">
                  <span>تعریف پله‌های کمیسیون (نامحدود):</span>
                </div>

                {newContractForm.commissionTiers?.map((tier, idx) => (
                  <div key={tier.id} className="grid grid-cols-3 gap-2 items-center bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-bold">پله {idx + 1}:از {tier.minRevenue.toLocaleString('fa-IR')}</span>
                    <span className="text-[10px] font-bold">تا {tier.maxRevenue ? tier.maxRevenue.toLocaleString('fa-IR') : 'بالاتر'}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-700 font-bold">{tier.commissionPercentage}٪</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddContractOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] text-[var(--text-main)] font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#283F24] hover:bg-[#35542F] text-white font-bold shadow"
                >
                  ثبت و فعال‌سازی قرارداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SHIFT LOG */}
      {isLogShiftOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#283F24]" />
                <span>ثبت کارکرد و عملکرد شیفت پزشکی</span>
              </h3>
              <button onClick={() => setIsLogShiftOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogShift} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">انتخاب پزشک/کادر:</label>
                  <select
                    value={shiftLogForm.staffId}
                    onChange={(e) => setShiftLogForm((prev) => ({ ...prev, staffId: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">نوع شیفت:</label>
                  <select
                    value={shiftLogForm.shiftType}
                    onChange={(e) => setShiftLogForm((prev) => ({ ...prev, shiftType: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                  >
                    <option value="MORNING">صبح (08:00 تا 14:00)</option>
                    <option value="EVENING">عصر (14:00 تا 20:00)</option>
                    <option value="NIGHT">شب (20:00 تا 08:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">تعداد بیمار/ویزیت:</label>
                  <input
                    type="number"
                    value={shiftLogForm.visitCount}
                    onChange={(e) => setShiftLogForm((prev) => ({ ...prev, visitCount: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">درآمد کل (تومان):</label>
                  <input
                    type="number"
                    step={100000}
                    value={shiftLogForm.totalRevenue}
                    onChange={(e) => setShiftLogForm((prev) => ({ ...prev, totalRevenue: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold text-[#283F24] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-bold mb-1">ساعات کاری مفید:</label>
                  <input
                    type="number"
                    value={shiftLogForm.workingHours}
                    onChange={(e) => setShiftLogForm((prev) => ({ ...prev, workingHours: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsLogShiftOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] text-[var(--text-main)] font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#283F24] hover:bg-[#35542F] text-white font-bold shadow"
                >
                  ثبت شیفت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAYMENT SETTLEMENT */}
      {isPaymentModalOpen && selectedSettlement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#283F24]" />
                <span>ثبت پرداخت واریزی تسویه حساب</span>
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePaymentStatus} className="space-y-3">
              <div className="bg-[#E4EBE0] border border-[#62745D] p-3.5 rounded-2xl space-y-1">
                <div className="font-bold text-xs text-[#283F24]">
                  پزشک: {staffList.find((s) => s.id === selectedSettlement.staffId)?.fullName}
                </div>
                <div className="font-mono font-black text-sm text-emerald-800">
                  مبلغ قابل پرداخت: {selectedSettlement.finalSettlementAmount.toLocaleString('fa-IR')} تومان
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-bold mb-1">روش پرداخت:</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-bold outline-none"
                >
                  <option value="DIRECT_TRANSFER">حواله مستقیم پایا / ساتنا</option>
                  <option value="CHEQUE">چک صیادی بنام پزشک</option>
                  <option value="CASH">پرداخت نقدی / کارت به کارت</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-bold mb-1">شماره پیگیری / فیش واریز:</label>
                <input
                  type="text"
                  required
                  value={paymentForm.receiptNumber}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, receiptNumber: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono font-bold outline-none text-[#283F24]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-app)] hover:bg-[#E4EBE0] text-[var(--text-main)] font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#283F24] hover:bg-[#35542F] text-white font-bold shadow"
                >
                  تأیید و ثبت واریزی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: DOCTOR PROFILE DETAILS */}
      {isProfileDrawerOpen && selectedStaffMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start">
          <div className="bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] w-full max-w-lg h-full p-6 shadow-2xl space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200 dir-rtl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#283F24] text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {selectedStaffMember.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-black text-base text-[var(--text-main)]">{selectedStaffMember.fullName}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{selectedStaffMember.specialty}</p>
                </div>
              </div>
              <button onClick={() => setIsProfileDrawerOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-[var(--bg-app)] p-4 rounded-2xl border border-[var(--border-subtle)]">
              <div>
                <span className="text-[var(--text-muted)] block">شماره نظام پزشکی:</span>
                <span className="font-mono font-bold text-[#283F24] text-sm">
                  {selectedStaffMember.medicalCouncilNumber || '---'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">کد ملی:</span>
                <span className="font-mono font-bold text-[var(--text-main)]">{selectedStaffMember.nationalId}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">شماره همراه:</span>
                <span className="font-mono font-bold text-[var(--text-main)] dir-ltr text-right">{selectedStaffMember.phone}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">تاریخ شروع همکاری:</span>
                <span className="font-mono font-bold text-[var(--text-main)]">{selectedStaffMember.employmentDate}</span>
              </div>
            </div>

            {/* Active Contract Summary */}
            {selectedStaffContract ? (
              <div className="bg-[#E4EBE0] border border-[#62745D] p-4 rounded-2xl space-y-2">
                <div className="font-bold text-[#283F24] flex items-center justify-between">
                  <span>قرارداد فعال: {selectedStaffContract.contractNumber}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded font-mono font-bold">
                    آستانه: {selectedStaffContract.revenueThreshold.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-main)]">
                  تعرفه ویزیت: {selectedStaffContract.visitTariff.toLocaleString('fa-IR')} تومان
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-[var(--text-muted)] bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)]">
                قرارداد فعالی ثبت نشده است.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRINT SLIP MODAL */}
      {isSlipPrintOpen && selectedSettlement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 dir-rtl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-black text-sm text-[#283F24]">فیش تسویه حساب ماهانه کادر درمان</div>
              <button onClick={() => setIsSlipPrintOpen(false)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs border p-3 rounded-xl bg-slate-50">
              <div>پزشک: {staffList.find((s) => s.id === selectedSettlement.staffId)?.fullName}</div>
              <div>دوره مالی: {selectedSettlement.periodJalali}</div>
              <div>تعداد ویزیت: {selectedSettlement.totalVisits}</div>
              <div>درآمد کل: {selectedSettlement.totalRevenue.toLocaleString('fa-IR')} تومان</div>
              <div>حق‌الزحمه کمیسیون: {selectedSettlement.calculatedCommission.toLocaleString('fa-IR')} تومان</div>
              <div className="font-black text-emerald-800 border-t pt-2">
                مبلغ نهایی: {selectedSettlement.finalSettlementAmount.toLocaleString('fa-IR')} تومان
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#283F24] text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فیش</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-xs text-center animate-in zoom-in-95">
            <h3 className="font-black text-sm text-[var(--text-main)]">خروجی گزارش جامع کادر درمان</h3>
            <p className="text-[var(--text-muted)]">فرمت موردنظر جهت تولید گزارش را انتخاب کنید:</p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => handleExportData('PDF')}
                className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold border border-red-500/30"
              >
                PDF
              </button>
              <button
                onClick={() => handleExportData('EXCEL')}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold border border-emerald-500/30"
              >
                EXCEL
              </button>
              <button
                onClick={() => handleExportData('CSV')}
                className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-bold border border-blue-500/30"
              >
                CSV
              </button>
            </div>

            <button
              onClick={() => setIsExportModalOpen(false)}
              className="mt-4 text-[var(--text-muted)] hover:underline font-bold"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
