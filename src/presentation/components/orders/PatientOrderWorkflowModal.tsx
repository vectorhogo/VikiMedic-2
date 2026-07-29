import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  UserCheck,
  CreditCard,
  Building2,
  ShieldCheck,
  History,
  FileText,
  Printer,
  DollarSign,
  Barcode,
  Sparkles,
  Clock,
  Star,
  Layers,
  Pill,
  Stethoscope,
  Lock,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import {
  PatientOrder,
  PatientOrderItem,
  CatalogItem,
  PaymentMethod,
  OrderModificationAction,
} from '../../../domain/types';

interface PatientOrderWorkflowModalProps {
  order?: PatientOrder | null;
  patientId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientOrderWorkflowModal: React.FC<PatientOrderWorkflowModalProps> = ({
  order,
  patientId,
  isOpen,
  onClose,
}) => {
  const {
    activeUser,
    activeShiftConfig,
    catalogItems,
    patients,
    patientOrders,
    createPatientOrder,
    updatePatientOrder,
    finalizeOrderAndPay,
    calculateOrderTotals,
    addNotification,
  } = useClinic();

  // Find target patient
  const targetPatientId = order ? order.patientId : patientId || patients[0]?.id || '';
  const currentPatient = patients.find((p) => p.id === targetPatientId);

  // Find existing draft/unpaid order for this patient if not passed directly
  const existingDraft = useMemo(() => {
    if (order) return order;
    if (!targetPatientId) return null;
    return (
      patientOrders.find(
        (o) =>
          o.patientId === targetPatientId &&
          o.status !== 'PAID' &&
          o.status !== 'CANCELLED' &&
          o.status !== 'ARCHIVED'
      ) || null
    );
  }, [order, targetPatientId, patientOrders]);

  const activeOrder = order || existingDraft;
  const isPaid = activeOrder?.status === 'PAID';

  const [activeOrderId, setActiveOrderId] = useState<string | null>(activeOrder ? activeOrder.id : null);
  const [items, setItems] = useState<PatientOrderItem[]>(activeOrder ? activeOrder.items : []);
  const [overallDiscount, setOverallDiscount] = useState<number>(activeOrder ? activeOrder.totalDiscount : 0);
  const [notes, setNotes] = useState<string>(activeOrder ? activeOrder.notes || '' : '');
  const [modificationReason, setModificationReason] = useState<string>('');
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);

  // Search & Catalog Filter UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [catalogType, setCatalogType] = useState<'ALL' | 'SERVICE' | 'MEDICINE' | 'FAVORITES'>('ALL');
  const [favorites, setFavorites] = useState<string[]>(['cat-1', 'cat-3']);

  // Payment UI State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'MIXED'>('POS');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [posAmount, setPosAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);

  // Show modification history drawer & checkout confirmation
  const [showHistory, setShowHistory] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state when modal opens or active order changes
  useEffect(() => {
    if (isOpen) {
      if (activeOrder) {
        setItems(activeOrder.items || []);
        setOverallDiscount(activeOrder.totalDiscount || 0);
        setNotes(activeOrder.notes || '');
        setActiveOrderId(activeOrder.id);
      } else {
        setItems([]);
        setOverallDiscount(0);
        setNotes('');
        setActiveOrderId(null);
      }
    }
  }, [isOpen, activeOrder?.id]);

  // Auto-Save Draft logic (every 10 seconds)
  const saveDraft = (isSilent: boolean = false): PatientOrder | null => {
    if (items.length === 0) {
      if (!isSilent) {
        addNotification('لطفاً حداقل یک خدمت یا دارو به سفارش اضافه کنید.', 'warning');
      }
      return null;
    }

    const nowTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (activeOrderId) {
      const existingObj = patientOrders.find((o) => o.id === activeOrderId) || activeOrder;
      if (existingObj) {
        const updatedOrderObj: PatientOrder = {
          ...existingObj,
          items,
          notes,
          totalDiscount: overallDiscount,
          status: existingObj.status === 'PAID' ? 'PAID' : 'DRAFT',
        };
        updatePatientOrder(activeOrderId, updatedOrderObj, 'EDIT_PRICE', 'به‌روزرسانی پیش‌نویس سفارش');
        setLastAutoSaveTime(nowTime);
        if (!isSilent) {
          addNotification(`پیش‌نویس سفارش ${existingObj.orderNumber} با موفقیت بروزرسانی شد.`, 'success');
        }
        return updatedOrderObj;
      }
    }

    // Create new draft
    const created = createPatientOrder(targetPatientId, items, notes, 'DRAFT');
    if (created) {
      setActiveOrderId(created.id);
      setLastAutoSaveTime(nowTime);
      if (!isSilent) {
        addNotification(`پیش‌نویس سفارش جدید با شماره ${created.orderNumber} ذخیره گردید.`, 'success');
      }
      return created;
    }
    return null;
  };

  // Interval for 10s Auto-Save
  useEffect(() => {
    if (!isOpen || isPaid) return;

    const interval = setInterval(() => {
      if (items.length > 0) {
        saveDraft(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen, isPaid, items, overallDiscount, notes, activeOrderId, targetPatientId]);

  if (!isOpen) return null;

  // Calculate live totals
  const totals = calculateOrderTotals(items, overallDiscount);

  // Filter Catalog Items
  const categories = Array.from(new Set(catalogItems.map((c) => c.category)));
  const filteredCatalog = catalogItems.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchTerm));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchesType = true;
    if (catalogType === 'SERVICE') matchesType = item.type === 'SERVICE';
    if (catalogType === 'MEDICINE') matchesType = item.type === 'MEDICINE';
    if (catalogType === 'FAVORITES') matchesType = favorites.includes(item.id);

    return matchesSearch && matchesCategory && matchesType && item.status === 'ACTIVE';
  });

  // Toggle Favorite Status
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Add Item from Catalog
  const handleAddItemFromCatalog = (catItem: CatalogItem) => {
    if (isPaid) {
      addNotification('اطلاعات مالی این فاکتور قفل گردیده است.', 'warning');
      return;
    }

    const isCovered = catItem.insuranceRule.isCovered && currentPatient?.insuranceType !== 'FREE';
    const coveragePct = isCovered ? catItem.insuranceRule.coveragePercentage : 0;
    
    const gross = catItem.price;
    const insShare = Math.round((gross * coveragePct) / 100);
    const patShare = gross - insShare;

    const newItem: PatientOrderItem = {
      id: 'poi-' + Date.now() + Math.random().toString(36).substring(2, 5),
      catalogItemId: catItem.id,
      itemCode: catItem.code,
      itemName: catItem.name,
      itemType: catItem.type,
      category: catItem.category,
      unitPrice: catItem.price,
      quantity: 1,
      unit: catItem.unit,
      totalGross: gross,
      insuranceShare: insShare,
      patientShare: patShare,
      discount: 0,
      tax: catItem.taxPercentage ? Math.round((gross * catItem.taxPercentage) / 100) : 0,
      totalNet: patShare,
      addedByRole: activeUser.role,
      addedByName: activeUser.fullName,
      createdAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setItems((prev) => [...prev, newItem]);
    addNotification(`آیتم ${catItem.name} به پیش‌نویس سفارش اضافه شد.`, 'info');
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    if (isPaid) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Update Item Quantity
  const handleUpdateItemQuantity = (itemId: string, newQty: number) => {
    if (isPaid || newQty < 1) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const gross = i.unitPrice * newQty;
          const coveragePct = i.insuranceShare > 0 ? Math.round((i.insuranceShare / i.totalGross) * 100) : 0;
          const insShare = Math.round((gross * coveragePct) / 100);
          const patShare = gross - insShare;
          return {
            ...i,
            quantity: newQty,
            totalGross: gross,
            insuranceShare: insShare,
            patientShare: patShare,
            totalNet: Math.max(0, patShare - (i.discount || 0)),
          };
        }
        return i;
      })
    );
  };

  // Update Item Custom Discount
  const handleUpdateItemDiscount = (itemId: string, discountVal: number) => {
    if (isPaid) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            discount: discountVal,
            totalNet: Math.max(0, i.patientShare - discountVal + (i.tax || 0)),
          };
        }
        return i;
      })
    );
  };

  // Update Item Instructions / Dosage
  const handleUpdateItemInstructions = (itemId: string, inst: string) => {
    if (isPaid) return;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, instructions: inst } : i))
    );
  };

  // Save Draft Click
  const handleSaveOrder = () => {
    if (isPaid) {
      addNotification('این سفارش تسویه نهایی گردیده و قابل تغییر نیست.', 'warning');
      return;
    }
    const saved = saveDraft(false);
    if (saved) {
      onClose();
    }
  };

  // Trigger Checkout Confirmation Dialog
  const handleProcessPayment = () => {
    if (isPaid) {
      addNotification('این سفارش قبلاً تسویه نهایی گردیده است.', 'info');
      return;
    }
    if (items.length === 0) {
      addNotification('لطفاً حداقل یک خدمت یا دارو جهت تسویه حساب اضافه کنید.', 'warning');
      return;
    }
    setShowCheckoutDialog(true);
  };

  // Print Invoice Execution
  const executePrintInvoice = () => {
    let targetOrd = patientOrders.find((o) => o.id === activeOrderId) || activeOrder;
    if (!targetOrd) {
      targetOrd = saveDraft(true);
    }
    if (!targetOrd) return;

    finalizeOrderAndPay(
      targetOrd.id,
      paymentMethod,
      {
        cashAmount: paymentMethod === 'CASH' ? totals.totalPatientShare : cashAmount,
        posAmount: paymentMethod === 'POS' ? totals.totalPatientShare : posAmount,
        cardAmount: paymentMethod === 'CARD_TO_CARD' ? totals.totalPatientShare : cardAmount,
        insuranceAmount: totals.totalInsuranceShare,
      },
      targetOrd,
      { openPrintModal: true }
    );
    window.print();
    setShowCheckoutDialog(false);
    onClose();
  };

  // Finish Without Printing Execution
  const executeFinishWithoutPrinting = () => {
    let targetOrd = patientOrders.find((o) => o.id === activeOrderId) || activeOrder;
    if (!targetOrd) {
      targetOrd = saveDraft(true);
    }
    if (!targetOrd) return;

    finalizeOrderAndPay(
      targetOrd.id,
      paymentMethod,
      {
        cashAmount: paymentMethod === 'CASH' ? totals.totalPatientShare : cashAmount,
        posAmount: paymentMethod === 'POS' ? totals.totalPatientShare : posAmount,
        cardAmount: paymentMethod === 'CARD_TO_CARD' ? totals.totalPatientShare : cardAmount,
        insuranceAmount: totals.totalInsuranceShare,
      },
      targetOrd,
      { openPrintModal: false }
    );
    addNotification('فاکتور با موفقیت تسویه، صادر و اطلاعات مالی قفل گردید.', 'success');
    setShowCheckoutDialog(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[4000] z-modal-backdrop bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="responsive-modal-container bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-main)] z-[4010] z-modal-dialog animate-in zoom-in-95 duration-200">
        
        {/* STICKY HEADER */}
        <div className="sticky-modal-header px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl shadow-inner">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white">
                  سفارش بالینی و صورتحساب درمان بیمار
                </h2>
                {activeOrder && (
                  <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                    {activeOrder.orderNumber}
                  </span>
                )}
                {isPaid ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" /> تسویه‌شده (قفل مالی)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-md">
                    پیش‌نویس فعال
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                مدیریت اقلام خدمات، داروها، فرانشیز بیمه و ذخیره خودمختار تا تسویه نهایی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isPaid && (
              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-800/60 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>ذخیره خودکار ۱۰ ثانیه‌ای</span>
                {lastAutoSaveTime && <span className="text-emerald-300 font-bold">({lastAutoSaveTime})</span>}
              </div>
            )}

            {activeOrder && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1.5 transition border border-slate-700"
              >
                <History className="w-3.5 h-3.5" />
                <span>سوابق تغییرات ({activeOrder.modificationLogs?.length || 0})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition"
              title="بستن (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCKED BANNER IF PAID */}
        {isPaid && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>این سفارش تسویه نهایی گردیده و اطلاعات مالی آن قفل می‌باشد.</span>
            </div>
            <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono">STATUS: PAID</span>
          </div>
        )}

        {/* PATIENT & SHIFT STICKY CONTEXT BAR */}
        <div className="px-6 py-2.5 bg-sky-500/10 dark:bg-sky-950/30 border-b border-sky-500/20 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap font-medium">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-sky-500" />
              <span className="text-slate-400">بیمار:</span>
              <strong className="text-[var(--text-main)]">
                {currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'تعیین‌نشده'}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400">کد ملی:</span>
              <span>{currentPatient?.nationalId || '---'}</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400">شماره پرونده:</span>
              <span>{currentPatient?.fileNumber || '---'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-400">پوشش بیمه:</span>
              <strong className="text-emerald-500">
                {currentPatient?.insuranceType === 'TAMIN_INJTIMAI'
                  ? 'تأمین اجتماعی (۷۰٪)'
                  : currentPatient?.insuranceType === 'SALAMAT'
                  ? 'بیمه سلامت (۷۰٪)'
                  : currentPatient?.insuranceType === 'KHADAMAT_DARMANI'
                  ? 'خدمات درمانی (۷۰٪)'
                  : 'آزاد (بدون پوشش)'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] bg-[var(--bg-app)] px-3 py-1 rounded-xl border border-[var(--border-subtle)] font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>شیفت: {activeShiftConfig?.shiftNameFa || 'صبح'}</span>
            </div>
            <span>|</span>
            <span>پزشک: {activeShiftConfig?.assignedStaff.DOCTOR || 'دکتر پیرهادی'}</span>
          </div>
        </div>

        {/* MAIN BODY (RESPONSIVE GRID) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* LEFT COLUMN: SELECTED ORDER ITEMS & STICKY SIDE SUMMARY (7 COLS) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col border-b lg:border-b-0 lg:border-l border-[var(--border-subtle)] overflow-y-auto modal-content-scrollable">
            
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>لیست اقلام پیش‌نویس صورتحساب ({items.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">
                {isPaid ? 'اطلاعات قفل شده است' : 'امکان تغییر تعداد، دستور مصرف و تخفیف'}
              </span>
            </div>

            {/* Selected Items Table Container */}
            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden mb-4 bg-[var(--bg-app)] min-h-[160px] max-h-[260px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-1">
                  <Sparkles className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                  <p className="text-xs font-bold text-[var(--text-main)]">هیچ خدمت یا دارویی انتخاب نشده است</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    از پنل سمت چپ کاتالوگ خدمات را جستجو و روی آن کلیک کنید.
                  </p>
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white sticky top-0 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">عنوان خدمت / دارو</th>
                      <th className="py-2.5 px-2 text-center">تعداد</th>
                      <th className="py-2.5 px-2 text-center">تعرفه</th>
                      <th className="py-2.5 px-2 text-center">سهم بیمه</th>
                      <th className="py-2.5 px-2 text-center">سهم بیمار</th>
                      <th className="py-2.5 px-2 text-center">تخفیف</th>
                      {!isPaid && <th className="py-2.5 px-2 text-center">حذف</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-[11px]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-500/5 transition">
                        <td className="py-2 px-3 font-sans">
                          <div className="font-bold text-[var(--text-main)]">{item.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">کد: {item.itemCode}</div>
                          <input
                            type="text"
                            value={item.instructions || ''}
                            onChange={(e) => handleUpdateItemInstructions(item.id, e.target.value)}
                            placeholder="دستور مصرف / توضیحات..."
                            disabled={isPaid}
                            className="w-full mt-1 px-2 py-0.5 text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[var(--text-main)] placeholder-slate-400"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 font-bold"
                              >
                                -
                              </button>
                            )}
                            <span className="w-5 text-center font-bold">{item.quantity}</span>
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 font-bold"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center font-bold">{item.unitPrice.toLocaleString('fa-IR')}</td>
                        <td className="py-2 px-2 text-center text-emerald-500 font-bold">
                          {item.insuranceShare.toLocaleString('fa-IR')}
                        </td>
                        <td className="py-2 px-2 text-center font-black text-blue-600 dark:text-blue-400">
                          {item.patientShare.toLocaleString('fa-IR')}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            value={item.discount || 0}
                            disabled={isPaid}
                            onChange={(e) => handleUpdateItemDiscount(item.id, Number(e.target.value))}
                            className="w-14 px-1 py-0.5 text-center text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded disabled:opacity-60"
                          />
                        </td>
                        {!isPaid && (
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Discount & Clinical Notes Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">
                  تخفیف کلی بر روی صورتحساب (تومان)
                </label>
                <input
                  type="number"
                  value={overallDiscount}
                  disabled={isPaid}
                  onChange={(e) => setOverallDiscount(Number(e.target.value))}
                  placeholder="مبلغ تخفیف..."
                  className="w-full px-3 py-1.5 font-mono text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">
                  دستورات ویژه یا نکات فاکتور
                </label>
                <input
                  type="text"
                  value={notes}
                  disabled={isPaid}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="نکات بالینی یا مالی..."
                  className="w-full px-3 py-1.5 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl disabled:opacity-60"
                />
              </div>
            </div>

            {/* Modification Reason if updating order */}
            {activeOrder && !isPaid && (
              <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                <label className="font-bold text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  علت تغییر و اصلاح فاکتور (اختیاری)
                </label>
                <input
                  type="text"
                  value={modificationReason}
                  onChange={(e) => setModificationReason(e.target.value)}
                  placeholder="علت افزودن/حذف خدمات..."
                  className="w-full px-3 py-1.5 text-xs bg-[var(--bg-surface)] border border-amber-500/40 rounded-lg"
                />
              </div>
            )}

            {/* STICKY SIDE SUMMARY PANEL */}
            <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-2 border border-blue-500/30">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>جمع کل تعرفه (ناخالص):</span>
                <span className="font-mono tabular-nums font-bold">{totals.totalGross.toLocaleString('fa-IR')} تومان</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-400 font-medium">
                <span>سهم تعهد بیمه گر:</span>
                <span className="font-mono tabular-nums font-bold">- {totals.totalInsuranceShare.toLocaleString('fa-IR')} تومان</span>
              </div>

              <div className="flex justify-between text-xs text-amber-400 font-medium">
                <span>تخفیفات اعمال شده:</span>
                <span className="font-mono tabular-nums font-bold">- {totals.totalDiscount.toLocaleString('fa-IR')} تومان</span>
              </div>

              <div className="border-t border-slate-700/80 pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-white block">مبلغ قابل پرداخت بیمار:</span>
                  <span className="text-[10px] text-slate-400">تسویه نهایی مستقیم با صندوق کلینیک</span>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-sky-400 tabular-nums">
                  {totals.totalPatientShare.toLocaleString('fa-IR')}{' '}
                  <span className="text-xs font-normal text-slate-300">تومان</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SERVICE & MEDICINE SELECTOR BROWSER (5 COLS) */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-[var(--bg-app)] flex flex-col overflow-y-auto modal-content-scrollable">
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2 text-[var(--text-main)]">
                <Search className="w-4 h-4 text-blue-500" />
                <span>مرورگر خدمات و داروها</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredCatalog.length} آیتم آماده
              </span>
            </div>

            {/* Quick Filter Type Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-xs font-bold mb-2.5">
              <button
                type="button"
                onClick={() => setCatalogType('ALL')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  catalogType === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>همه</span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogType('SERVICE')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  catalogType === 'SERVICE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>خدمات</span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogType('MEDICINE')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  catalogType === 'MEDICINE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>داروها</span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogType('FAVORITES')}
                className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 ${
                  catalogType === 'FAVORITES'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="علاقه‌مندی‌ها"
              >
                <Star className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی آنی (نام، کد یا بارکد)..."
                className="w-full pr-9 pl-8 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                  selectedCategory === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                }`}
              >
                همه دسته‌ها
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* RESPONSIVE MEDICINE / SERVICE CATALOG TABLE */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
              {filteredCatalog.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                  هیچ آیتمی یافت نشد.
                </div>
              ) : (
                filteredCatalog.map((catItem) => (
                  <div
                    key={catItem.id}
                    onClick={() => handleAddItemFromCatalog(catItem)}
                    className={`p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl transition shadow-sm flex items-center justify-between group ${
                      isPaid ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/50 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs group-hover:text-blue-500 transition">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(catItem.id, e)}
                          className="text-slate-400 hover:text-amber-400 transition"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              favorites.includes(catItem.id) ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                        <span>{catItem.name}</span>
                        {catItem.insuranceRule.isCovered && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.2 rounded font-mono">
                            {catItem.insuranceRule.coveragePercentage}٪ بیمه
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 font-mono">
                        <span>کد: {catItem.code}</span>
                        <span>•</span>
                        <span>دسته‌بندی: {catItem.category}</span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <div className="font-bold text-xs text-[var(--text-main)]">
                        {catItem.price.toLocaleString('fa-IR')}
                      </div>
                      <div className="text-[10px] text-blue-500 flex items-center justify-end gap-0.5 font-bold mt-0.5">
                        <Plus className="w-3 h-3" /> انتخاب
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <label className="block text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>روش پرداخت صندوق:</span>
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  disabled={isPaid}
                  onClick={() => setPaymentMethod('POS')}
                  className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'POS'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>کارتخوان</span>
                </button>

                <button
                  type="button"
                  disabled={isPaid}
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>نقدی</span>
                </button>

                <button
                  type="button"
                  disabled={isPaid}
                  onClick={() => setPaymentMethod('CARD_TO_CARD')}
                  className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'CARD_TO_CARD'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>کارت به کارت</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* STICKY FOOTER */}
        <div className="sticky-modal-footer px-6 py-3.5 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              انصراف (Esc)
            </button>

            <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
              تعداد اقلام: <strong className="text-white">{items.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isPaid && (
              <button
                type="button"
                onClick={handleSaveOrder}
                className="px-4 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>ذخیره پیش‌نویس</span>
              </button>
            )}

            {isPaid ? (
              <button
                type="button"
                disabled
                className="px-6 py-2.5 text-xs font-black text-amber-300 bg-slate-800/80 rounded-xl transition border border-amber-500/40 flex items-center gap-2 opacity-80 cursor-not-allowed"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>فاکتور تسویه‌شده (اطلاعات مالی قفل)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProcessPayment}
                className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسویه نهایی و صدور فاکتور</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* SMART CHECKOUT CONFIRMATION DIALOG */}
      {showCheckoutDialog && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 text-[var(--text-main)] animate-in zoom-in-95 duration-200">
            
            {/* Header / Success Icon */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-main)]">
                پرداخت با موفقیت انجام شد.
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                آیا مایل به چاپ فاکتور هستید؟
              </p>
            </div>

            {/* Invoice Summary Box */}
            <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">بیمار:</span>
                <span className="font-bold">{currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'بیمار عمومی'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">مبلغ پرداختی:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {totals.totalPatientShare.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">روش پرداخت:</span>
                <span className="font-semibold">
                  {paymentMethod === 'POS'
                    ? 'دستگاه کارتخوان (POS)'
                    : paymentMethod === 'CASH'
                    ? 'نقدی'
                    : 'کارت به کارت'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              {/* Print Invoice Button */}
              <button
                type="button"
                onClick={executePrintInvoice}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فاکتور (Print Invoice)</span>
              </button>

              {/* Finish Without Printing Button */}
              <button
                type="button"
                onClick={executeFinishWithoutPrinting}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-600/50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تکمیل بدون چاپ (Finish Without Printing)</span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowCheckoutDialog(false)}
                className="w-full py-2.5 px-4 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
              >
                <span>انصراف و بازگشت به صفحه پرداخت (Cancel)</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
