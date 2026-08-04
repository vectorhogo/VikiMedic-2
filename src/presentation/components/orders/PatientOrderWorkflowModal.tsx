import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Edit3,
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
  Unlock,
  RotateCcw,
  PackageX,
  Info,
  Check,
  UserCog,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import {
  PatientOrder,
  PatientOrderItem,
  CatalogItem,
  PaymentMethod,
  OrderModificationAction,
  calculateInsuranceCoverageForItem,
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
    reopenPatientOrder,
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

  // Permission Checks
  const isAccountant = activeUser.role === 'ACCOUNTANT' || (activeUser.role as string) === 'FINANCIAL_STAFF';
  const isAdmin =
    activeUser.role === 'ADMINISTRATOR' ||
    activeUser.role === 'SUPER_ADMIN' ||
    (activeUser.role as string) === 'ADMIN' ||
    (activeUser.role as string) === 'RECEPTION_LEAD';
  const canEdit = !isPaid && !isAccountant;
  const canReopen = isPaid && isAdmin;

  const [activeOrderId, setActiveOrderId] = useState<string | null>(activeOrder ? activeOrder.id : null);
  const [items, setItems] = useState<PatientOrderItem[]>(activeOrder ? activeOrder.items : []);
  const [overallDiscount, setOverallDiscount] = useState<number>(activeOrder ? activeOrder.totalDiscount : 0);
  const [notes, setNotes] = useState<string>(activeOrder ? activeOrder.notes || '' : '');
  const [modificationReason, setModificationReason] = useState<string>('');
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);

  // Item Removal Confirmation Modal State
  const [itemToRemoveConfirm, setItemToRemoveConfirm] = useState<PatientOrderItem | null>(null);

  // Undo Toast State (10 seconds timer)
  const [removedUndoState, setRemovedUndoState] = useState<{
    item: PatientOrderItem;
    index: number;
    expiresAt: number;
  } | null>(null);
  const [undoSecondsRemaining, setUndoSecondsRemaining] = useState<number>(10);

  // Item Edit Modal State (✎ Action)
  const [editingItem, setEditingItem] = useState<PatientOrderItem | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editInsuranceShare, setEditInsuranceShare] = useState<number>(0);
  const [editInstructions, setEditInstructions] = useState<string>('');

  // Payment Reversal / Reopen Invoice Modal State
  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);
  const [reopenReasonText, setReopenReasonText] = useState<string>('');

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
        if (itemToRemoveConfirm) {
          setItemToRemoveConfirm(null);
        } else if (editingItem) {
          setEditingItem(null);
        } else if (showReopenModal) {
          setShowReopenModal(false);
        } else if (showCheckoutDialog) {
          setShowCheckoutDialog(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, itemToRemoveConfirm, editingItem, showReopenModal, showCheckoutDialog, onClose]);

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

  // Undo Countdown Timer Effect
  useEffect(() => {
    if (!removedUndoState) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((removedUndoState.expiresAt - Date.now()) / 1000));
      setUndoSecondsRemaining(remaining);
      if (remaining <= 0) {
        setRemovedUndoState(null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [removedUndoState]);

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

  // Calculate live totals instantly
  const totals = calculateOrderTotals(items, overallDiscount);

  // Filter Catalog Items
  const categories = Array.from(new Set(catalogItems.map((c) => c.category)));
  const filteredCatalog = catalogItems.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      (item.barcode && item.barcode.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.type && item.type.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchesType = true;
    if (catalogType === 'SERVICE') {
      matchesType =
        item.type === 'SERVICE' ||
        item.type === 'MEDICAL_SERVICE' ||
        item.type === 'LAB_SERVICE' ||
        item.type === 'RADIOLOGY_SERVICE' ||
        item.type === 'DOCTOR_VISIT' ||
        item.type === 'VISIT' ||
        item.type === 'LAB' ||
        item.type === 'RADIOLOGY' ||
        item.type === 'OTHER';
    } else if (catalogType === 'MEDICINE') {
      matchesType =
        item.type === 'MEDICINE' ||
        item.type === 'PRODUCT' ||
        item.type === 'CONSUMABLE';
    } else if (catalogType === 'FAVORITES') {
      matchesType = favorites.includes(item.id);
    }

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
    if (!canEdit) {
      if (isPaid) {
        addNotification('اطلاعات مالی این فاکتور قفل گردیده است.', 'warning');
      } else if (isAccountant) {
        addNotification('حسابدار فقط دسترسی مشاهده دارد.', 'warning');
      }
      return;
    }

    const gross = catItem.price;
    const { coverageAmount } = calculateInsuranceCoverageForItem(
      catItem,
      currentPatient?.insuranceType,
      gross
    );

    const insShare = Math.round(coverageAmount);
    const patShare = Math.max(0, gross - insShare);

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

    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    if (activeOrderId && activeOrder) {
      updatePatientOrder(
        activeOrderId,
        { ...activeOrder, items: updatedItems },
        'ADD_ITEM',
        `افزودن ${catItem.name} به سفارش`
      );
    }

    addNotification(`آیتم ${catItem.name} به سفارش اضافه شد.`, 'info');
  };

  // Prompt Remove Item Confirmation
  const handlePromptRemoveItem = (item: PatientOrderItem) => {
    if (!canEdit) return;
    setItemToRemoveConfirm(item);
  };

  // Confirm Remove Item & Start 10s Undo Timer
  const handleConfirmRemoveItem = () => {
    if (!itemToRemoveConfirm) return;

    const target = itemToRemoveConfirm;
    const targetIndex = items.findIndex((i) => i.id === target.id);
    const updatedItems = items.filter((i) => i.id !== target.id);

    setItems(updatedItems);

    if (activeOrderId && activeOrder) {
      updatePatientOrder(
        activeOrderId,
        { ...activeOrder, items: updatedItems },
        'REMOVE_ITEM',
        `حذف خدمت/دارو: ${target.itemName}`
      );
    }

    // Set 10-second Undo toast
    setRemovedUndoState({
      item: target,
      index: targetIndex >= 0 ? targetIndex : updatedItems.length,
      expiresAt: Date.now() + 10000,
    });
    setUndoSecondsRemaining(10);
    setItemToRemoveConfirm(null);

    addNotification(`آیتم «${target.itemName}» از سفارش حذف شد.`, 'info');
  };

  // Undo Remove Item
  const handleUndoRemove = () => {
    if (!removedUndoState) return;

    const { item, index } = removedUndoState;
    setItems((prev) => {
      const next = [...prev];
      if (index >= 0 && index <= next.length) {
        next.splice(index, 0, item);
      } else {
        next.push(item);
      }
      return next;
    });

    if (activeOrderId && activeOrder) {
      updatePatientOrder(
        activeOrderId,
        { ...activeOrder, items: [...items, item] },
        'ADD_ITEM',
        `بازگردانی (Undo) خدمت/دارو: ${item.itemName}`
      );
    }

    addNotification(`آیتم «${item.itemName}» به سفارش بازگردانده شد.`, 'success');
    setRemovedUndoState(null);
  };

  // Update Item Quantity (➕ / ➖)
  const handleUpdateItemQuantity = (itemId: string, newQty: number) => {
    if (!canEdit) return;
    if (newQty < 1) {
      const target = items.find((i) => i.id === itemId);
      if (target) {
        handlePromptRemoveItem(target);
      }
      return;
    }

    const updatedItems = items.map((i) => {
      if (i.id === itemId) {
        const gross = i.unitPrice * newQty;
        const coveragePct = i.totalGross > 0 && i.insuranceShare > 0
          ? (i.insuranceShare / i.totalGross)
          : 0;
        const insShare = Math.round(gross * coveragePct);
        const patShare = Math.max(0, gross - insShare);
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
    });

    setItems(updatedItems);

    if (activeOrderId && activeOrder) {
      const itemObj = items.find((i) => i.id === itemId);
      updatePatientOrder(
        activeOrderId,
        { ...activeOrder, items: updatedItems },
        'EDIT_QUANTITY',
        `تغییر تعداد ${itemObj?.itemName || ''} به ${newQty}`
      );
    }
  };

  // Open Edit Item Modal (✎ Button)
  const handleOpenEditItemModal = (item: PatientOrderItem) => {
    if (!canEdit) return;
    setEditingItem(item);
    setEditQty(item.quantity);
    setEditUnitPrice(item.unitPrice);
    setEditDiscount(item.discount || 0);
    setEditInsuranceShare(item.insuranceShare);
    setEditInstructions(item.instructions || '');
  };

  // Save Edit Item Changes
  const handleSaveItemEdit = () => {
    if (!editingItem || !canEdit) return;

    const newGross = editUnitPrice * editQty;
    const newInsShare = Math.min(newGross, Math.max(0, editInsuranceShare));
    const newPatShare = Math.max(0, newGross - newInsShare);
    const newNet = Math.max(0, newPatShare - editDiscount + (editingItem.tax || 0));

    const updatedItems = items.map((i) => {
      if (i.id === editingItem.id) {
        return {
          ...i,
          unitPrice: editUnitPrice,
          quantity: editQty,
          totalGross: newGross,
          insuranceShare: newInsShare,
          patientShare: newPatShare,
          discount: editDiscount,
          totalNet: newNet,
          instructions: editInstructions,
        };
      }
      return i;
    });

    setItems(updatedItems);

    if (activeOrderId && activeOrder) {
      updatePatientOrder(
        activeOrderId,
        { ...activeOrder, items: updatedItems },
        'EDIT_PRICE',
        `ویرایش مشخصات، قیمت یا تخفیف آیتم ${editingItem.itemName}`
      );
    }

    addNotification(`مشخصات آیتم «${editingItem.itemName}» با موفقیت ویرایش گردید.`, 'success');
    setEditingItem(null);
  };

  // Update Item Custom Discount directly from table
  const handleUpdateItemDiscount = (itemId: string, discountVal: number) => {
    if (!canEdit) return;
    const safeDiscount = Math.max(0, discountVal);
    const itemObj = items.find((i) => i.id === itemId);
    const updatedItems = items.map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          discount: safeDiscount,
          totalNet: Math.max(0, i.patientShare - safeDiscount + (i.tax || 0)),
        };
      }
      return i;
    });

    setItems(updatedItems);

    if (activeOrderId && activeOrder && itemObj) {
      updatePatientOrder(
        activeOrderId,
        { ...activeOrder, items: updatedItems },
        'EDIT_PRICE',
        `ویرایش تخفیف ${itemObj.itemName} به ${safeDiscount.toLocaleString('fa-IR')} تومان`
      );
    }
  };

  // Update Item Instructions / Dosage
  const handleUpdateItemInstructions = (itemId: string, inst: string) => {
    if (!canEdit) return;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, instructions: inst } : i))
    );
  };

  // Execute Reopen Payment (Payment Reversal)
  const handleExecuteReopenPayment = () => {
    if (!activeOrderId || !canReopen) return;
    const result = reopenPatientOrder(activeOrderId, reopenReasonText || 'ابطال پرداخت و بازگشایی توسط مدیریت');
    if (result) {
      setItems(result.items || []);
      setOverallDiscount(result.totalDiscount || 0);
      setShowReopenModal(false);
      setReopenReasonText('');
    }
  };

  // Save Draft Click
  const handleSaveOrder = () => {
    if (!canEdit) {
      if (isPaid) {
        addNotification('این سفارش تسویه نهایی گردیده و قابل تغییر نیست.', 'warning');
      }
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
    <div className="fixed inset-0 z-[4000] z-modal-backdrop bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150">
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
                  ویرایشگر سفارش بالینی و صورتحساب پذیرش (Reception Order Editor)
                </h2>
                {activeOrder && (
                  <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                    {activeOrder.orderNumber}
                  </span>
                )}
                {isPaid ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> تسویه‌شده (قفل مالی)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-md">
                    پیش‌نویس قابل ویرایش
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                مدیریت اقلام خدمات، داروها، حذف، ویرایش تعداد و محاسبه لحظه‌ای تعرفه و سهم بیمه
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
                <History className="w-3.5 h-3.5 text-amber-400" />
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

        {/* LOCKED BANNER & REOPEN ACTION (IF PAID) */}
        {isPaid && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>فاکتور نهایی‌شده - فقط خواندنی (Invoice Finalized - Read Only)</span>
            </div>

            {canReopen && (
              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="px-3 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition flex items-center gap-1.5 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ابطال پرداخت و بازگشایی فاکتور (Cancel Payment & Reopen)</span>
              </button>
            )}
          </div>
        )}

        {/* ACCOUNTANT READ ONLY BANNER */}
        {isAccountant && !isPaid && (
          <div className="px-6 py-2 bg-blue-500/10 border-b border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="w-4 h-4 text-blue-500" />
              <span>دسترسی حسابداری: فقط خواندنی (Read Only)</span>
            </div>
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
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 relative">
          
          {/* LEFT COLUMN: SELECTED ORDER ITEMS & STICKY SIDE SUMMARY (7 COLS) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col border-b lg:border-b-0 lg:border-l border-[var(--border-subtle)] overflow-y-auto modal-content-scrollable">
            
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>اقلام سفارش و صورتحساب درمان ({items.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">
                {isPaid ? 'اطلاعات قفل شده است' : 'ویرایش تعداد، تخفیف، سهم بیمه و حذف'}
              </span>
            </div>

            {/* Selected Items Table / Cards Container */}
            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden mb-4 bg-[var(--bg-app)] min-h-[180px] max-h-[300px] overflow-y-auto relative">
              {items.length === 0 ? (
                /* EMPTY ORDER STATE */
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                  <PackageX className="w-10 h-10 text-slate-400 stroke-[1.5] animate-bounce" />
                  <p className="text-xs font-bold text-[var(--text-main)]">
                    هیچ خدمت یا دارویی به سفارش اضافه نشده است. (No services or medicines added.)
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] max-w-sm">
                    از مرورگر سمت چپ خدمات یا داروها را جستجو کرده و با کلیک روی آنها، اقلام مورد نیاز بیمار را اضافه نمایید.
                  </p>
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white sticky top-0 border-b border-slate-800 text-[11px] z-10">
                    <tr>
                      <th className="py-2.5 px-3">عنوان خدمت / دارو</th>
                      <th className="py-2.5 px-2 text-center">تعرفه</th>
                      <th className="py-2.5 px-2 text-center">تعداد</th>
                      <th className="py-2.5 px-2 text-center">سهم بیمه</th>
                      <th className="py-2.5 px-2 text-center">تخفیف</th>
                      <th className="py-2.5 px-2 text-center">مبلغ نهایی (بیمار)</th>
                      <th className="py-2.5 px-2 text-center">عملیات (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-[11px]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-500/5 transition">
                        {/* ITEM NAME & CATEGORY & INSTRUCTIONS */}
                        <td className="py-2 px-3 font-sans max-w-[180px]">
                          <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5 flex-wrap">
                            <span>{item.itemName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 font-mono">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            کد: {item.itemCode}
                          </div>
                          <input
                            type="text"
                            value={item.instructions || ''}
                            onChange={(e) => handleUpdateItemInstructions(item.id, e.target.value)}
                            placeholder="دستور مصرف / توضیحات..."
                            disabled={!canEdit}
                            className="w-full mt-1 px-2 py-0.5 text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[var(--text-main)] placeholder-slate-400 disabled:opacity-60"
                          />
                        </td>

                        {/* UNIT PRICE */}
                        <td className="py-2 px-2 text-center font-bold">
                          {item.unitPrice.toLocaleString('fa-IR')}
                        </td>

                        {/* QUANTITY CONTROLS (➕ / ➖) */}
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 font-bold active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              title={canEdit ? 'کاهش تعداد (➖ Decrease)' : 'فاکتور تسویه‌شده (Invoice Finalized - Read Only)'}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold px-1 py-0.5 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 font-bold active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              title={canEdit ? 'افزایش تعداد (➕ Increase)' : 'فاکتور تسویه‌شده (Invoice Finalized - Read Only)'}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* INSURANCE SHARE */}
                        <td className="py-2 px-2 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.insuranceShare.toLocaleString('fa-IR')}
                        </td>

                        {/* CUSTOM DISCOUNT */}
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            value={item.discount || 0}
                            disabled={!canEdit}
                            onChange={(e) => handleUpdateItemDiscount(item.id, Number(e.target.value))}
                            className="w-14 px-1 py-0.5 text-center text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded disabled:opacity-60"
                          />
                        </td>

                        {/* FINAL PRICE (PATIENT SHARE) */}
                        <td className="py-2 px-2 text-center font-black text-blue-600 dark:text-blue-400">
                          {item.patientShare.toLocaleString('fa-IR')}
                        </td>

                        {/* ROW ACTIONS (➕ ➖ ✏ Edit & 🗑 Delete) */}
                        <td className="py-2 px-2 text-center">
                          {canEdit ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition border border-emerald-500/20"
                                title="افزایش تعداد (➕ Increase Qty)"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-lg transition border border-amber-500/20"
                                title="کاهش تعداد (➖ Decrease Qty)"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditItemModal(item)}
                                className="p-1.5 text-sky-500 hover:bg-sky-500/10 rounded-lg transition border border-sky-500/20"
                                title="ویرایش کامل آیتم (✏ Edit)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePromptRemoveItem(item)}
                                className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition border border-rose-500/20"
                                title="حذف آیتم از سفارش (🗑 Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md whitespace-nowrap">
                              <Lock className="w-3 h-3" />
                              <span>فاکتور نهایی (Invoice Finalized - Read Only)</span>
                            </span>
                          )}
                        </td>
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="نکات بالینی یا مالی..."
                  className="w-full px-3 py-1.5 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl disabled:opacity-60"
                />
              </div>
            </div>

            {/* Modification Reason if updating order */}
            {activeOrder && canEdit && (
              <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                <label className="font-bold text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  علت تغییر و اصلاح فاکتور (اختیاری)
                </label>
                <input
                  type="text"
                  value={modificationReason}
                  onChange={(e) => setModificationReason(e.target.value)}
                  placeholder="علت افزودن/حذف یا تغییر تعداد اقلام..."
                  className="w-full px-3 py-1.5 text-xs bg-[var(--bg-surface)] border border-amber-500/40 rounded-lg"
                />
              </div>
            )}

            {/* STICKY SIDE SUMMARY PANEL & CASHBOX PREVIEW */}
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
                  <span className="font-bold text-sm text-white block">پیش‌نمایش مبلغ دریافتی صندوق:</span>
                  <span className="text-[10px] text-slate-400">مبلغ خالص سهم بیمار قابل دریافت در صندوق</span>
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

            {/* CATALOG LIST */}
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
                      !canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/50 cursor-pointer'
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

        {/* 10-SECOND UNDO TOAST NOTIFICATION */}
        {removedUndoState && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[4200] bg-slate-900 text-white border border-slate-700 rounded-2xl p-3 shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-200">
            <RotateCcw className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <div>
              <span className="font-bold text-slate-200">آیتم «{removedUndoState.item.itemName}» حذف شد.</span>
              <span className="text-[10px] text-amber-400 font-mono ml-2">({undoSecondsRemaining} ثانیه)</span>
            </div>
            <button
              type="button"
              onClick={handleUndoRemove}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>لغو حذف (Undo)</span>
            </button>
          </div>
        )}

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

      {/* ============================================================ */}
      {/* REMOVE ITEM CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {itemToRemoveConfirm && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-rose-500/30 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-[var(--text-main)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">آیا از حذف این خدمت/دارو اطمینان دارید؟</h3>
                <p className="text-[11px] text-[var(--text-muted)]">Remove this item?</p>
              </div>
            </div>

            {/* Item details summary */}
            <div className="p-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-sans">عنوان خدمت/دارو:</span>
                <span className="font-bold font-sans text-[var(--text-main)]">{itemToRemoveConfirm.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-sans">دسته‌بندی:</span>
                <span className="font-semibold text-blue-500 font-sans">{itemToRemoveConfirm.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-sans">تعداد:</span>
                <span className="font-bold">{itemToRemoveConfirm.quantity}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-subtle)] pt-1.5">
                <span className="text-[var(--text-muted)] font-sans">مبلغ کل (سهم بیمار):</span>
                <span className="font-bold text-rose-500">{itemToRemoveConfirm.patientShare.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setItemToRemoveConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
              >
                انصراف (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveItem}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف قطعیت (Remove)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT ITEM DETAILS MODAL (✎ Action) */}
      {/* ============================================================ */}
      {editingItem && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 text-[var(--text-main)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 text-sky-500 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">ویرایش مشخصات خدمت / دارو</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{editingItem.itemName} ({editingItem.itemCode})</p>
                </div>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">تعداد (Quantity)</label>
                  <input
                    type="number"
                    min="1"
                    value={editQty}
                    onChange={(e) => setEditQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 font-mono text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">قیمت واحد (تعرفه)</label>
                  <input
                    type="number"
                    min="0"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 font-mono text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">سهم تعهد بیمه (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={editInsuranceShare}
                    onChange={(e) => setEditInsuranceShare(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 font-mono text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">تخفیف اختصاصی (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 font-mono text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">دستور مصرف / توضیحات تکمیلی</label>
                <input
                  type="text"
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="نکات بالینی، دوز مصرفی یا ملاحظات..."
                  className="w-full px-3 py-1.5 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl"
                />
              </div>

              {/* Calculated Summary Preview inside edit modal */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">جمع کل ناخالص:</span>
                  <span>{(editUnitPrice * editQty).toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span className="font-sans">سهم بیمه:</span>
                  <span>- {editInsuranceShare.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-sky-400">
                  <span className="font-sans">مبلغ نهایی دریافتی از بیمار:</span>
                  <span>{Math.max(0, (editUnitPrice * editQty) - editInsuranceShare - editDiscount).toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveItemEdit}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ذخیره تغییرات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REOPEN INVOICE / PAYMENT REVERSAL MODAL (ADMIN ONLY) */}
      {/* ============================================================ */}
      {showReopenModal && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-amber-500/30 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 text-[var(--text-main)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">ابطال پرداخت و بازگشایی فاکتور جهت ویرایش</h3>
                <p className="text-[11px] text-[var(--text-muted)]">Cancel Payment & Reopen Order</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              با تایید این عملیات، وضعیت سفارش به پیش‌نویس (DRAFT) تغییر یافته و تمام اقلام مجدداً قابل اضافه، ویرایش یا حذف خواهند بود. کلیه سوابق در لاگ حسابرسی ثبت می‌شود.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-main)] mb-1">
                علت ابطال پرداخت و بازگشایی فاکتور:
              </label>
              <input
                type="text"
                value={reopenReasonText}
                onChange={(e) => setReopenReasonText(e.target.value)}
                placeholder="مثال: اشتباه در ثبت اقلام توسط پذیرش..."
                className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleExecuteReopenPayment}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تأیید ابطال و بازگشایی</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACTIVITY LOG / MODIFICATION HISTORY DRAWER */}
      {/* ============================================================ */}
      {showHistory && activeOrder && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] h-full p-6 flex flex-col space-y-4 animate-in slide-in-from-right duration-200 text-[var(--text-main)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-[var(--text-main)]">سوابق تغییرات و ردپای حسابرسی</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {(!activeOrder.modificationLogs || activeOrder.modificationLogs.length === 0) ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  هیچ سابقه تغییراتی ثبت نشده است.
                </div>
              ) : (
                activeOrder.modificationLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>

                    <div className="font-semibold text-[var(--text-main)]">{log.reason}</div>

                    <div className="text-[10px] text-slate-400 flex justify-between font-mono pt-1 border-t border-[var(--border-subtle)]">
                      <span>توسط: {log.modifiedBy}</span>
                      <span>نقش: {log.userRole}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
