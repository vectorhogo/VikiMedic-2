import React, { useState } from 'react';
import {
  X,
  Plus,
  Search,
  Tag,
  DollarSign,
  Shield,
  Edit,
  CheckCircle2,
  Barcode,
  Layers,
  Sparkles,
  PackageCheck,
  TrendingUp,
  Percent,
  History,
  AlertCircle,
  Building2,
  Trash2,
  Clock,
  ShieldCheck,
  Calendar,
  Info,
  Activity,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { CatalogExcelImportWizard } from './CatalogExcelImportWizard';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import {
  CatalogItem,
  CatalogItemType,
  InsuranceCoverageRule,
  CatalogPriceVersion,
  isPurchasePriceRequired,
  calculateCatalogProfit,
  checkCatalogDuplicate,
  runCatalogDiagnosticCheck,
  CatalogDiagnosticReport,
} from '../../../domain/types';

interface CatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_INSURANCE_PROVIDERS = [
  'تأمین اجتماعی',
  'بیمه سلامت',
  'نیروهای مسلح',
  'بیمه ایران',
  'بیمه صادرات',
  'بیمه آتیه‌سازان حافظ',
  'بیمه دانا',
  'بیمه البرز',
  'آزاد (بدون پوشش)',
];

export const CatalogManagerModal: React.FC<CatalogManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { catalogItems, addCatalogItem, updateCatalogItem } = useClinic();
  const { activeUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  // New or Editing Catalog Item Form
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'GENERAL' | 'INSURANCE' | 'HISTORY'>('GENERAL');

  // History Drawer / Modal
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<CatalogItem | null>(null);

  // Diagnostic Integration Check
  const [diagnosticReport, setDiagnosticReport] = useState<CatalogDiagnosticReport | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);

  // Patch 05: Excel Import Wizard State
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

  const handleRunDiagnostic = () => {
    const report = runCatalogDiagnosticCheck(catalogItems);
    setDiagnosticReport(report);
    setShowDiagnosticModal(true);
  };

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    barcode: string;
    name: string;
    category: string;
    type: CatalogItemType;
    price: number;
    purchasePrice: number;
    currency: string;
    effectiveDate: string;
    unit: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    priceChangeNotes: string;
    insuranceRules: InsuranceCoverageRule[];
  }>({
    code: '',
    barcode: '',
    name: '',
    category: 'ویزیت',
    type: 'DOCTOR_VISIT',
    price: 180000,
    purchasePrice: 0,
    currency: 'تومان',
    effectiveDate: new Date().toISOString().split('T')[0],
    unit: 'خدمت',
    description: '',
    status: 'ACTIVE',
    priceChangeNotes: '',
    insuranceRules: [],
  });

  // Insurance Rule Form Sub-state
  const [newRuleProvider, setNewRuleProvider] = useState<string>('تأمین اجتماعی');
  const [customProvider, setCustomProvider] = useState<string>('');
  const [newRulePercentage, setNewRulePercentage] = useState<number>(70);
  const [newRuleMaxCoverage, setNewRuleMaxCoverage] = useState<string>('');
  const [newRuleFixedCoverage, setNewRuleFixedCoverage] = useState<string>('');
  const [newRuleEffectiveDate, setNewRuleEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newRuleExpirationDate, setNewRuleExpirationDate] = useState<string>('');

  // Form Validation Errors
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = Array.from(new Set(catalogItems.map((c) => c.category)));

  const filteredItems = catalogItems.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.barcode && i.barcode.includes(searchTerm));
    const matchesCat = filterCategory === 'ALL' || i.category === filterCategory;
    const matchesType = filterType === 'ALL' || i.type === filterType;
    return matchesSearch && matchesCat && matchesType;
  });

  const handleOpenForm = (item?: CatalogItem) => {
    setFormError(null);
    setActiveFormTab('GENERAL');
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        barcode: item.barcode || '',
        name: item.name,
        category: item.category,
        type: item.type,
        price: item.price,
        purchasePrice: item.purchasePrice || 0,
        currency: item.currency || 'تومان',
        effectiveDate: item.effectiveDate || new Date().toISOString().split('T')[0],
        unit: item.unit,
        description: item.description || '',
        status: item.status,
        priceChangeNotes: '',
        insuranceRules: item.insuranceRules ? [...item.insuranceRules] : [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: `SRV-${Math.floor(100 + Math.random() * 900)}`,
        barcode: `626${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        name: '',
        category: 'خدمات درمانی',
        type: 'MEDICAL_SERVICE',
        price: 150000,
        purchasePrice: 0,
        currency: 'تومان',
        effectiveDate: new Date().toISOString().split('T')[0],
        unit: 'خدمت',
        description: '',
        status: 'ACTIVE',
        priceChangeNotes: 'تعرفه جدید کاتالوگ',
        insuranceRules: [
          {
            id: 'rule-' + Date.now() + '-1',
            providerName: 'تأمین اجتماعی',
            coveragePercentage: 70,
            effectiveDate: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
          },
        ],
      });
    }
    setIsFormOpen(true);
  };

  const isProduct = isPurchasePriceRequired(formData.type);
  const profitStats = calculateCatalogProfit(formData.price, isProduct ? formData.purchasePrice : 0);

  // Add Insurance Coverage Rule
  const handleAddInsuranceRule = () => {
    setFormError(null);
    const providerName = newRuleProvider === 'CUSTOM' ? customProvider.trim() : newRuleProvider;
    if (!providerName) {
      setFormError('لطفاً نام سازمان بیمه‌گر را مشخص کنید.');
      return;
    }

    if (newRulePercentage < 0 || newRulePercentage > 100) {
      setFormError('درصد پوشش بیمه باید بین ۰ تا ۱۰۰ باشد.');
      return;
    }

    // Check duplicate active rule for provider
    const hasDuplicate = formData.insuranceRules.some(
      (r) =>
        r.status === 'ACTIVE' &&
        r.providerName.trim().toLowerCase() === providerName.toLowerCase()
    );

    if (hasDuplicate) {
      setFormError(`یک قانون بیمه‌ای فعال برای «${providerName}» وجود دارد. لطفاً ابتدا قانون قبلی را ویرایش یا غیرفعال کنید.`);
      return;
    }

    const newRule: InsuranceCoverageRule = {
      id: 'rule-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      providerName,
      coveragePercentage: Number(newRulePercentage),
      maxCoverageAmount: newRuleMaxCoverage ? Number(newRuleMaxCoverage) : undefined,
      fixedCoverageAmount: newRuleFixedCoverage ? Number(newRuleFixedCoverage) : undefined,
      effectiveDate: newRuleEffectiveDate || new Date().toISOString().split('T')[0],
      expirationDate: newRuleExpirationDate || undefined,
      status: 'ACTIVE',
    };

    setFormData((prev) => ({
      ...prev,
      insuranceRules: [...prev.insuranceRules, newRule],
    }));

    setNewRuleMaxCoverage('');
    setNewRuleFixedCoverage('');
    if (newRuleProvider === 'CUSTOM') setCustomProvider('');
  };

  const handleRemoveInsuranceRule = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      insuranceRules: prev.insuranceRules.filter((r) => r.id !== id),
    }));
  };

  const handleToggleRuleStatus = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      insuranceRules: prev.insuranceRules.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : r
      ),
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('وارد کردن کد و عنوان کامل الزامی است.');
      return;
    }

    // Duplicate Prevention Rules (Item Code, Barcode, Normalized Item Name)
    const dupResult = checkCatalogDuplicate(
      catalogItems,
      {
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
      },
      editingItem?.id
    );

    if (dupResult.isDuplicate) {
      setFormError(`خطای جلوگیری از ثبت تکراری: ${dupResult.reason}`);
      return;
    }

    const salePrice = Number(formData.price);
    if (isNaN(salePrice) || salePrice < 0) {
      setFormError('تعرفه فروش نباید عدد منفی باشد.');
      return;
    }

    let pPrice: number | undefined = undefined;
    if (isProduct) {
      pPrice = Number(formData.purchasePrice);
      if (isNaN(pPrice) || pPrice < 0) {
        setFormError('قیمت خرید برای دارو و کالا الزامی است و نباید منفی باشد.');
        return;
      }
    }

    // Price Versioning Snapshot
    const nowIso = new Date().toISOString();
    const effectiveDateStr = formData.effectiveDate || nowIso.split('T')[0];

    let updatedHistory: CatalogPriceVersion[] = editingItem?.priceHistory
      ? [...editingItem.priceHistory]
      : [];

    const isPriceChanged =
      !editingItem ||
      editingItem.price !== salePrice ||
      (editingItem.purchasePrice || 0) !== (pPrice || 0) ||
      editingItem.currency !== formData.currency;

    if (isPriceChanged) {
      const newVersion: CatalogPriceVersion = {
        id: 'ph-' + Date.now(),
        salePrice,
        purchasePrice: pPrice,
        currency: formData.currency || 'تومان',
        effectiveDate: effectiveDateStr,
        status: 'ACTIVE',
        createdAt: nowIso,
        createdBy: activeUser?.fullName || 'مدیر سیستم',
        notes: formData.priceChangeNotes.trim() || (editingItem ? 'بروزرسانی تعرفه و قیمت' : 'تعریف اولیه قیمت کاتالوگ'),
      };
      // Set previous price versions to INACTIVE for cleanliness
      updatedHistory = updatedHistory.map((h) => ({ ...h, status: 'INACTIVE' }));
      updatedHistory.unshift(newVersion);
    }

    const defaultRule = formData.insuranceRules.find((r) => r.status === 'ACTIVE') || {
      isCovered: false,
      coveragePercentage: 0,
    };

    if (editingItem) {
      updateCatalogItem({
        ...editingItem,
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        type: formData.type,
        price: salePrice,
        purchasePrice: pPrice,
        currency: formData.currency,
        effectiveDate: effectiveDateStr,
        unit: formData.unit,
        insuranceRule: {
          isCovered: (defaultRule as any).coveragePercentage > 0,
          coveragePercentage: (defaultRule as any).coveragePercentage || 0,
        },
        insuranceRules: formData.insuranceRules,
        priceHistory: updatedHistory,
        status: formData.status,
        description: formData.description,
      });
    } else {
      addCatalogItem({
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        type: formData.type,
        price: salePrice,
        purchasePrice: pPrice,
        currency: formData.currency,
        effectiveDate: effectiveDateStr,
        unit: formData.unit,
        insuranceRule: {
          isCovered: (defaultRule as any).coveragePercentage > 0,
          coveragePercentage: (defaultRule as any).coveragePercentage || 0,
        },
        insuranceRules: formData.insuranceRules,
        priceHistory: updatedHistory,
        taxPercentage: 0,
        status: formData.status,
        description: formData.description,
      });
    }

    setIsFormOpen(false);
  };

  const getItemTypeBadge = (type: CatalogItemType) => {
    switch (type) {
      case 'MEDICINE':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-md">دارویی</span>;
      case 'PRODUCT':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 rounded-md">کالا و تجهیزات</span>;
      case 'CONSUMABLE':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 rounded-md">مصرفی</span>;
      case 'DOCTOR_VISIT':
      case 'VISIT':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 rounded-md">ویزیت پزشک</span>;
      case 'LAB_SERVICE':
      case 'LAB':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 rounded-md">آزمایشگاه</span>;
      case 'RADIOLOGY_SERVICE':
      case 'RADIOLOGY':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-md">رادیولوژی</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 rounded-md">خدمت درمانی</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] z-modal-backdrop bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150 dir-rtl">
      <div className="responsive-modal-container bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-main)] z-[4010] z-modal-dialog animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky-modal-header px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-50">
                کاتالوگ تعرفه‌ها، قیمت خرید/فروش و پوشش بیمه‌ها
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                مدیریت خدمات، دارو، کالا، سود ناخالص، محاسبه مارک‌آپ و قوانین تفکیکی سازمان‌های بیمه‌گر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {/* Top Actions & Filters */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو نام، کد، بارکد..."
                  className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="ALL">همه انواع (دارو/کالا/خدمت)</option>
                <option value="MEDICINE">داروها (Medicine)</option>
                <option value="PRODUCT">کالاها و تجهیزات (Product)</option>
                <option value="CONSUMABLE">اقلام مصرفی (Consumable)</option>
                <option value="MEDICAL_SERVICE">خدمات درمانی (Service)</option>
                <option value="LAB_SERVICE">آزمایشگاه (Lab)</option>
                <option value="RADIOLOGY_SERVICE">رادیولوژی (Radiology)</option>
                <option value="DOCTOR_VISIT">ویزیت پزشک (Visit)</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">همه دسته‌بندی‌ها</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setIsImportWizardOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 justify-center"
                title="واردسازی کاتالوگ از فایل اکسل (xlsx, xls, csv)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>واردسازی از اکسل (Excel Import)</span>
              </button>

              <button
                type="button"
                onClick={handleRunDiagnostic}
                className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 justify-center"
                title="تست همگام‌سازی و سلامت اقلام کاتالوگ با پذیرش و سفارشات"
              >
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>بررسی همگام‌سازی</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenForm()}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-md flex items-center gap-2 justify-center"
              >
                <Plus className="w-4 h-4" />
                تعریف آیتم کاتالوگ (دارو/کالا/خدمت)
              </button>
            </div>
          </div>

          {/* Form Modal Panel (Add / Edit) */}
          {isFormOpen && (
            <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-800/90 border border-sky-300 dark:border-slate-700 rounded-2xl space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-sky-900 dark:text-sky-300">
                  <Tag className="w-4 h-4 text-sky-600" />
                  <span>{editingItem ? `ویرایش آیتم کاتالوگ: ${editingItem.name}` : 'تعریف آیتم جدید در کاتالوگ'}</span>
                </div>

                {/* Form Tabs */}
                <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('GENERAL')}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeFormTab === 'GENERAL'
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    قیمت‌گذاری و مشخصات
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('INSURANCE')}
                    className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                      activeFormTab === 'INSURANCE'
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>قوانین پوشش بیمه‌ها</span>
                    {formData.insuranceRules.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-white/20 text-[10px] rounded-full">
                        {formData.insuranceRules.length}
                      </span>
                    )}
                  </button>
                </div>

                <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* TAB 1: GENERAL & PRICING */}
                {activeFormTab === 'GENERAL' && (
                  <div className="space-y-4 text-xs">
                    
                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">نوع آیتم کاتالوگ *</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as CatalogItemType })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                        >
                          <option value="MEDICINE">دارو (Medicine)</option>
                          <option value="PRODUCT">کالای بهداشتی / پزشکی (Product)</option>
                          <option value="CONSUMABLE">اقلام مصرفی (Consumable)</option>
                          <option value="MEDICAL_SERVICE">خدمت درمانی سرپایی (Service)</option>
                          <option value="LAB_SERVICE">خدمات آزمایشگاهی (Lab)</option>
                          <option value="RADIOLOGY_SERVICE">رادیولوژی و تصویربرداری (Radiology)</option>
                          <option value="DOCTOR_VISIT">ویزیت پزشک (Doctor Visit)</option>
                          <option value="OTHER">سایر خدمات (Other)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">کد اختصاصی آیتم *</label>
                        <input
                          type="text"
                          required
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="w-full px-3 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">بارکد تجاری / IRC</label>
                        <input
                          type="text"
                          value={formData.barcode}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                          placeholder="کد بارکد محصول..."
                          className="w-full px-3 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">دسته‌بندی موضوعی</label>
                        <input
                          type="text"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="مثال: دارویی، خدمات عمومی..."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">عنوان کامل آیتم / خدمت *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="مانند: قرص لوزارتان ۵۰mg / ویزیت متخصص داخلی..."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">واحد سنجش</label>
                        <input
                          type="text"
                          required
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          placeholder="عدد، خدمت، جعبه، جلسه..."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                          <DollarSign className="w-4 h-4" />
                          <span>تنظیمات قیمت خرید، قیمت فروش و تاریخ اجرا</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isProduct ? 'دارو / کالا (نیاز به قیمت خرید دارد)' : 'خدمت درمانی (بدون نیاز به قیمت خرید)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Sale Price */}
                        <div>
                          <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                            قیمت فروش / تعرفه مصوب (تومان) *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm"
                          />
                        </div>

                        {/* Purchase Price (Required ONLY for MEDICINE, PRODUCT, CONSUMABLE) */}
                        {isProduct ? (
                          <div>
                            <label className="block mb-1 font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                              <span>قیمت خرید (تومان) *</span>
                              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 px-1.5 py-0.2 rounded font-normal">
                                الزامی
                              </span>
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={formData.purchasePrice}
                              onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl text-sm"
                            />
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] flex items-center justify-center text-center font-medium">
                            خدمات درمانی نیازمند ثبت قیمت خرید کالا نمی‌باشند.
                          </div>
                        )}

                        {/* Effective Date */}
                        <div>
                          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">تاریخ اجرای تعرفه</label>
                          <input
                            type="date"
                            value={formData.effectiveDate}
                            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                            className="w-full px-3 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      {/* Profit Metrics Box for Products / Medicines */}
                      {isProduct && (
                        <div className="p-3 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border border-sky-200 dark:border-slate-700 rounded-xl">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                            <span>محاسبه خودکار سود ناخالص و شاخص‌های مالی (Automated Profit Analytics):</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                              <span className="text-[10px] text-slate-500 block">سود ناخالص (Gross Profit)</span>
                              <span className={`font-mono font-bold text-xs ${profitStats.grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                {profitStats.grossProfit.toLocaleString('fa-IR')} <span className="text-[9px] font-normal text-slate-400">تومان</span>
                              </span>
                            </div>

                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                              <span className="text-[10px] text-slate-500 block">حاشیه سود (Profit Margin)</span>
                              <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                                ٪{profitStats.profitMarginPct.toLocaleString('fa-IR')}
                              </span>
                            </div>

                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                              <span className="text-[10px] text-slate-500 block">درصد علامت‌گذاری (Markup)</span>
                              <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                                ٪{profitStats.markupPct.toLocaleString('fa-IR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">علت یا توضیحات تغییر قیمت (ثبت در تاریخچه نسخه قیمت)</label>
                        <input
                          type="text"
                          value={formData.priceChangeNotes}
                          onChange={(e) => setFormData({ ...formData, priceChangeNotes: e.target.value })}
                          placeholder="مثال: مصوبه جدید هیئت مدیره / تغییر تعرفه سالانه..."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: MULTI-PROVIDER INSURANCE RULES */}
                {activeFormTab === 'INSURANCE' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                        <p className="font-bold text-sky-900 dark:text-sky-200">قوانین پوشش تفکیکی سازمان‌های بیمه‌گر:</p>
                        <p className="text-[11px]">
                          برای هر سازمان بیمه‌گر (تأمین اجتماعی، بیمه سلامت، نیروهای مسلح و...) قوانین پوشش درصدی، مبلغ ثابت و سقف ریالی را به‌صورت مجزا تعیین کنید.
                        </p>
                      </div>
                    </div>

                    {/* Add New Rule Form */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-sky-600" />
                        <span>افزودن قانون جدید پوشش بیمه</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">سازمان بیمه‌گر *</label>
                          <select
                            value={newRuleProvider}
                            onChange={(e) => setNewRuleProvider(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                          >
                            {COMMON_INSURANCE_PROVIDERS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                            <option value="CUSTOM">+ نام سازمان سفارشی...</option>
                          </select>
                        </div>

                        {newRuleProvider === 'CUSTOM' && (
                          <div>
                            <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">نام بیمه‌گر جدید</label>
                            <input
                              type="text"
                              value={customProvider}
                              onChange={(e) => setCustomProvider(e.target.value)}
                              placeholder="نام بیمه..."
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">درصد پوشش بیمه (۰-۱۰۰٪)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={newRulePercentage}
                              onChange={(e) => setNewRulePercentage(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-center"
                            />
                            <span className="font-bold text-slate-500">٪</span>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">مبلغ ثابت سهم بیمه (اختیاری - تومان)</label>
                          <input
                            type="number"
                            min="0"
                            value={newRuleFixedCoverage}
                            onChange={(e) => setNewRuleFixedCoverage(e.target.value)}
                            placeholder="مثال: ۵۰۰۰۰"
                            className="w-full px-2.5 py-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">حداکثر سقف پوشش ریالی (اختیاری - تومان)</label>
                          <input
                            type="number"
                            min="0"
                            value={newRuleMaxCoverage}
                            onChange={(e) => setNewRuleMaxCoverage(e.target.value)}
                            placeholder="سقف پرداختی..."
                            className="w-full px-2.5 py-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">تاریخ شروع قرارداد</label>
                          <input
                            type="date"
                            value={newRuleEffectiveDate}
                            onChange={(e) => setNewRuleEffectiveDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddInsuranceRule}
                          className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ثبت قانون بیمه‌ای</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Rules List */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300">قوانین ثبت شده برای این خدمت:</h4>
                      {formData.insuranceRules.length === 0 ? (
                        <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-400">
                          هیچ قانون بیمه‌ای ثبت نشده است (این آیتم در حالت آزاد محاسبه خواهد شد).
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {formData.insuranceRules.map((rule) => (
                            <div
                              key={rule.id}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                                rule.status === 'ACTIVE'
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                    {rule.providerName}
                                  </div>
                                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-2 mt-0.5">
                                    <span>پوشش: ٪{rule.coveragePercentage}</span>
                                    {rule.fixedCoverageAmount && (
                                      <span>| مبلغ ثابت: {rule.fixedCoverageAmount.toLocaleString('fa-IR')} تومان</span>
                                    )}
                                    {rule.maxCoverageAmount && (
                                      <span>| سقف: {rule.maxCoverageAmount.toLocaleString('fa-IR')} تومان</span>
                                    )}
                                    <span>| تاریخ: {rule.effectiveDate}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleRuleStatus(rule.id)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                    rule.status === 'ACTIVE'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {rule.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInsuranceRule(rule.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit & Cancel */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">وضعیت آیتم:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        formData.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {formData.status === 'ACTIVE' ? 'فعال در کاتالوگ' : 'غیرفعال (آرشیو)'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingItem ? 'ثبت و بروزرسانی تغییرات' : 'افزودن به کاتالوگ'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Catalog Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-3">کد / نوع آیتم</th>
                    <th className="py-3 px-3">عنوان خدمت / کالا</th>
                    <th className="py-3 px-3">دسته‌بندی</th>
                    <th className="py-3 px-3 text-center">قیمت خرید</th>
                    <th className="py-3 px-3 text-center">قیمت فروش (تعرفه)</th>
                    <th className="py-3 px-3 text-center">سود ناخالص / مارک‌آپ</th>
                    <th className="py-3 px-3 text-center">قوانین پوشش بیمه</th>
                    <th className="py-3 px-3 text-center">وضعیت</th>
                    <th className="py-3 px-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredItems.map((item) => {
                    const isProd = isPurchasePriceRequired(item.type);
                    const profit = calculateCatalogProfit(item.price, isProd ? item.purchasePrice : 0);
                    const activeRulesCount = item.insuranceRules?.filter((r) => r.status === 'ACTIVE').length || 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.code}</div>
                          <div className="mt-0.5">{getItemTypeBadge(item.type)}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.name}
                          </div>
                          {item.barcode && <div className="text-[10px] text-slate-400 font-mono">بارکد: {item.barcode}</div>}
                        </td>

                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                          {item.category}
                        </td>

                        {/* Purchase Price */}
                        <td className="py-2.5 px-3 text-center font-mono font-medium text-amber-700 dark:text-amber-400">
                          {isProd && item.purchasePrice !== undefined ? (
                            <span>{item.purchasePrice.toLocaleString('fa-IR')} <span className="text-[9px] font-normal text-slate-400">تومان</span></span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Sale Price */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {item.price.toLocaleString('fa-IR')} <span className="text-[10px] text-slate-400 font-normal">تومان</span>
                        </td>

                        {/* Profit / Markup */}
                        <td className="py-2.5 px-3 text-center font-mono">
                          {isProd ? (
                            <div className="space-y-0.5">
                              <div className={`font-bold text-[11px] ${profit.grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                {profit.grossProfit.toLocaleString('fa-IR')} تومان
                              </div>
                              <div className="text-[9px] text-slate-400">
                                مارک‌آپ: ٪{profit.markupPct.toLocaleString('fa-IR')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">خدمات درمانی</span>
                          )}
                        </td>

                        {/* Insurance Rules Badge */}
                        <td className="py-2.5 px-3 text-center">
                          {activeRulesCount > 0 ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded-full inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{activeRulesCount} سازمان بیمه</span>
                            </span>
                          ) : item.insuranceRule?.isCovered ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                              پوشش {item.insuranceRule.coveragePercentage}٪
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                              آزاد (بدون بیمه)
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-center">
                          {item.status === 'ACTIVE' ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 rounded-md">
                              فعال
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md">
                              غیرفعال
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenForm(item)}
                              title="ویرایش تعرفه و قوانین"
                              className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedHistoryItem(item)}
                              title="مشاهده سوابق و نسخه های قیمت"
                              className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition"
                            >
                              <History className="w-4 h-4" />
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

      </div>

      {/* PRICE VERSION HISTORY MODAL */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-[4100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)] dir-rtl">
            <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base">
                  تاریخچه سوابق قیمت و تعرفه‌ها: {selectedHistoryItem.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4 text-xs">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-2 text-purple-900 dark:text-purple-300 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>بر اساس قوانین Price Versioning هیچ فاکتور یا صورتحساب تاریخی با تغییر قیمت ویرایش نمی‌شود.</span>
              </div>

              {selectedHistoryItem.priceHistory && selectedHistoryItem.priceHistory.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:inset-0 before:right-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {selectedHistoryItem.priceHistory.map((ver, idx) => (
                    <div key={ver.id || idx} className="relative pr-8 space-y-1">
                      <div className="absolute right-2 top-1 w-4.5 h-4.5 rounded-full border-2 border-white dark:border-slate-900 bg-purple-600 shadow" />
                      
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                            قیمت فروش: {ver.salePrice.toLocaleString('fa-IR')} {ver.currency}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ver.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {ver.status === 'ACTIVE' ? 'نسخه فعال جاری' : 'سوابق قبلی'}
                          </span>
                        </div>

                        {ver.purchasePrice !== undefined && (
                          <div className="text-amber-700 dark:text-amber-400 font-mono font-medium">
                            قیمت خرید: {ver.purchasePrice.toLocaleString('fa-IR')} {ver.currency}
                          </div>
                        )}

                        <div className="flex flex-wrap justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span>تاریخ اجرا: {ver.effectiveDate}</span>
                          <span>ثبت‌کننده: {ver.createdBy || 'سیستم'}</span>
                        </div>

                        {ver.notes && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 mt-1">
                            یادداشت: {ver.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400">
                  هیچ نسخه تاریخی ثبت نشده است. تعرفه اولیه: {selectedHistoryItem.price.toLocaleString('fa-IR')} تومان.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Integration Modal */}
      {showDiagnosticModal && diagnosticReport && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 dir-rtl animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  گزارش تشخیصی همگام‌سازی کاتالوگ با پذیرش و سفارشات
                </h3>
              </div>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  diagnosticReport.status === 'HEALTHY'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : diagnosticReport.status === 'WARNING'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                {diagnosticReport.status === 'HEALTHY' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm mb-1">
                    {diagnosticReport.status === 'HEALTHY'
                      ? 'همگام‌سازی کامل و کاتالوگ ۱۰۰٪ آماده استفاده است'
                      : diagnosticReport.status === 'WARNING'
                      ? 'هشدار همگام‌سازی: مواردی برای اصلاح یافت شد'
                      : 'خطای بحرانی همگام‌سازی کاتالوگ'}
                  </div>
                  <p className="text-[11px] opacity-90">
                    آخرین بررسی: {new Date(diagnosticReport.timestamp).toLocaleTimeString('fa-IR')} - تمام اقلام به صورت لحظه‌ای و مستقیم در پذیرش، سفارشات بالینی و صدور فاکتور قابل دریافت می‌باشند.
                  </p>
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="block text-[10px] text-slate-500 mb-1">کل اقلام کاتالوگ</span>
                  <span className="font-bold text-base font-mono text-slate-900 dark:text-slate-100">
                    {diagnosticReport.totalItems.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-center">
                  <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 mb-1">قابل انتخاب در پذیرش (فعال)</span>
                  <span className="font-bold text-base font-mono text-emerald-800 dark:text-emerald-300">
                    {diagnosticReport.activeItemsCount.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="block text-[10px] text-slate-500 mb-1">دسته‌بندی‌های معتبر</span>
                  <span className="font-bold text-base font-mono text-slate-900 dark:text-slate-100">
                    {diagnosticReport.validCategoriesCount.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div className={`p-3 rounded-2xl border text-center ${
                  diagnosticReport.duplicatesCount > 0 || diagnosticReport.priceIssuesCount > 0
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 text-slate-700 dark:text-slate-200'
                }`}>
                  <span className="block text-[10px] text-slate-500 mb-1">اقلام غیرفعال / هشدار</span>
                  <span className="font-bold text-base font-mono">
                    {diagnosticReport.inactiveItemsCount.toLocaleString('fa-IR')}
                  </span>
                </div>
              </div>

              {/* Check Details List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  جزئیات چک سوابق کاتالوگ و ارجاعات:
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                  {diagnosticReport.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={handleRunDiagnostic}
                className="px-3 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-xl flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>بررسی مجدد کاتالوگ</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDiagnosticModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                تأیید و بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Excel Import Wizard */}
      <CatalogExcelImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
      />
    </div>
  );
};
