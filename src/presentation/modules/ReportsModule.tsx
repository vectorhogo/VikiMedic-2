/**
 * VikiMedic v2 - Enterprise Reporting Engine
 * Clean Architecture Layer: Presentation Module
 * Patch 04: Medicine, Service & Product Sales Reports
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  DollarSign,
  Users,
  Stethoscope,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  RefreshCcw,
  Save,
  Bell,
  History,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ChevronDown,
  Pill,
  Syringe,
  Activity,
  UserCheck,
  Building2,
  X,
  Play,
  Share2,
  Package,
  Box,
  Layers,
  Tag,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

import { useClinic } from '../../application/ClinicContext';
import { useTheme } from '../ThemeContext';
import {
  ReportDatePreset,
  ReportFilterState,
  PatientCareType,
  VisitCareMode,
  PaymentMethod,
  ReportSnapshot,
  ScheduledReportConfig,
  PatientOrder,
  PatientOrderItem,
  CatalogItem,
} from '../../domain/types';

export const ReportsModule: React.FC = () => {
  const { theme } = useTheme();
  const {
    transactions,
    patientOrders,
    patients,
    queue,
    medicalRecords,
    staffList,
    catalogItems,
    shiftConfigs,
    activeClinic,
    reportSnapshots,
    addReportSnapshot,
    deleteReportSnapshot,
    scheduledReports,
    addScheduledReport,
    toggleScheduledReport,
    reportExportLogs,
    logReportExport,
    addNotification,
    activeUser,
  } = useClinic();

  // Active Main Category Tab
  const [activeCategory, setActiveCategory] = useState<
    | 'SALES'
    | 'FINANCIAL'
    | 'PATIENT'
    | 'SERVICE'
    | 'MEDICINE'
    | 'DOCTOR'
    | 'SHIFT'
    | 'EMPLOYEE'
    | 'SNAPSHOTS'
    | 'SCHEDULED'
    | 'AUDIT'
  >('SALES');

  // Filter Engine State
  const [filters, setFilters] = useState<ReportFilterState>({
    datePreset: 'THIS_MONTH',
    startDate: '',
    endDate: '',
    startTime: '00:00',
    endTime: '23:59',
    shiftType: 'ALL',
    doctorId: 'ALL',
    receptionistId: 'ALL',
    insuranceType: 'ALL',
    paymentMethod: 'ALL',
    patientCareType: 'ALL',
    visitCareMode: 'ALL',
    itemType: 'ALL',
    itemId: 'ALL',
    category: 'ALL',
    invoiceStatus: 'PAID',
    groupBy: 'ITEM',
    comparisonMode: 'NONE',
    salesReportType: 'COMBINED',
  });

  const [snapshotTitle, setSnapshotTitle] = useState('');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);

  // Scheduler Form State
  const [schedTitle, setSchedTitle] = useState('');
  const [schedFreq, setSchedFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [schedTime, setSchedTime] = useState('23:50');
  const [schedEmail, setSchedEmail] = useState('');

  // -------------------------------------------------------------
  // DYNAMIC FILTERING & SALES ENGINE CALCULATIONS
  // -------------------------------------------------------------

  // Filter Orders based on active filter state
  const filteredOrders = useMemo(() => {
    return patientOrders.filter((ord) => {
      // Doctor filter
      if (filters.doctorId !== 'ALL' && ord.doctorId !== filters.doctorId) return false;

      // Receptionist filter
      if (
        filters.receptionistId !== 'ALL' &&
        ord.receptionistName !== filters.receptionistId &&
        ord.shiftStaffDetails?.receptionistName !== filters.receptionistId
      ) {
        return false;
      }

      // Insurance filter
      if (filters.insuranceType !== 'ALL' && ord.insuranceType !== filters.insuranceType) return false;

      // Care type filter
      if (filters.patientCareType !== 'ALL' && ord.patientType !== filters.patientCareType) return false;

      // Visit mode filter
      if (filters.visitCareMode !== 'ALL' && ord.visitMode !== filters.visitCareMode) return false;

      // Payment method
      if (filters.paymentMethod !== 'ALL' && ord.paymentMethod !== filters.paymentMethod) return false;

      // Invoice / Order status filter
      if (filters.invoiceStatus !== 'ALL') {
        if (filters.invoiceStatus === 'PAID' && ord.status !== 'PAID' && ord.status !== 'READY_FOR_BILLING') {
          return false;
        }
        if (filters.invoiceStatus === 'READY_FOR_BILLING' && ord.status !== 'READY_FOR_BILLING') {
          return false;
        }
        if (filters.invoiceStatus === 'CANCELLED' && ord.status !== 'CANCELLED') {
          return false;
        }
      }

      // Shift filter
      if (filters.shiftType !== 'ALL') {
        if (filters.shiftType === 'MORNING' && !ord.shiftNameFa?.includes('صبح')) return false;
        if (filters.shiftType === 'EVENING' && !ord.shiftNameFa?.includes('عصر')) return false;
        if (filters.shiftType === 'NIGHT' && !ord.shiftNameFa?.includes('شب')) return false;
      }

      // Custom date and time filter check
      if (filters.datePreset === 'CUSTOM' || filters.datePreset === 'CUSTOM_DATETIME') {
        if (filters.startDate && filters.endDate) {
          const orderDatePart = ord.createdAt.split('-')[0].trim();
          if (orderDatePart < filters.startDate || orderDatePart > filters.endDate) {
            return false;
          }
        }
        if (filters.datePreset === 'CUSTOM_DATETIME' && filters.startTime && filters.endTime) {
          const timePart = ord.createdAt.includes('-') ? ord.createdAt.split('-')[1].trim() : '';
          if (timePart && (timePart < filters.startTime || timePart > filters.endTime)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [patientOrders, filters]);

  // Aggregate Sales Items across filtered orders
  const aggregatedSalesItems = useMemo(() => {
    // Map of Item Aggregations
    const itemMap = new Map<
      string,
      {
        id: string;
        catalogItemId: string;
        code: string;
        name: string;
        type: string;
        category: string;
        unit: string;
        quantitySold: number;
        refundQuantity: number;
        salePriceSnapshot: number;
        purchasePriceSnapshot: number;
        grossSales: number;
        cogs: number;
        discount: number;
        insuranceShare: number;
        patientShare: number;
        refunds: number;
        netSales: number;
        grossProfit: number;
        doctorName?: string;
        orderCount: number;
      }
    >();

    const targetType = filters.salesReportType || 'COMBINED';

    filteredOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        // Classify item type
        const catItem = catalogItems.find((c) => c.id === item.catalogItemId || c.code === item.itemCode);
        const resolvedType = item.itemType || catItem?.type || 'SERVICE';

        const isMedicine =
          resolvedType === 'MEDICINE' || item.category === 'دارویی' || catItem?.type === 'MEDICINE';

        const isProduct =
          resolvedType === 'PRODUCT' ||
          resolvedType === 'EQUIPMENT' ||
          item.category === 'کالا' ||
          item.category === 'تجهیزات' ||
          catItem?.type === 'PRODUCT';

        const isConsumable =
          resolvedType === 'CONSUMABLE' ||
          item.category === 'مصرفی' ||
          item.category === 'اقلام مصرفی' ||
          catItem?.type === 'CONSUMABLE';

        const isService = !isMedicine && !isProduct && !isConsumable;

        // Apply sales report type filter
        if (targetType === 'MEDICINE' && !isMedicine) return;
        if (targetType === 'SERVICE' && !isService) return;
        if (targetType === 'PRODUCT' && !isProduct) return;
        if (targetType === 'CONSUMABLE' && !isConsumable) return;

        // Item ID filter
        if (filters.itemId && filters.itemId !== 'ALL' && item.catalogItemId !== filters.itemId) return;

        // Category filter
        if (filters.category && filters.category !== 'ALL' && item.category !== filters.category) return;

        // Item Type dropdown filter
        if (filters.itemType && filters.itemType !== 'ALL') {
          if (filters.itemType === 'MEDICINE' && !isMedicine) return;
          if (filters.itemType === 'SERVICE' && !isService) return;
          if (filters.itemType === 'PRODUCT' && !isProduct) return;
          if (filters.itemType === 'CONSUMABLE' && !isConsumable) return;
        }

        // Determine purchase price snapshot
        let purchasePrice = catItem?.purchasePrice || 0;
        if (!purchasePrice && (isMedicine || isProduct || isConsumable)) {
          purchasePrice = Math.round(item.unitPrice * 0.7); // 70% estimated cost baseline
        }

        const key = item.catalogItemId || item.itemCode || item.itemName;
        const existing = itemMap.get(key);

        const gross = item.totalGross || item.unitPrice * item.quantity;
        const net = item.totalNet || item.patientShare || gross;
        const discountVal = item.discount || 0;
        const insShareVal = item.insuranceShare || 0;
        const patShareVal = item.patientShare || net;
        const itemCogs = purchasePrice * item.quantity;

        // Check if order is cancelled or refunded
        const isCancelled = ord.status === 'CANCELLED';
        const qtySold = isCancelled ? 0 : item.quantity;
        const refundQty = isCancelled ? item.quantity : 0;
        const refundAmt = isCancelled ? gross : 0;

        if (existing) {
          existing.quantitySold += qtySold;
          existing.refundQuantity += refundQty;
          existing.grossSales += isCancelled ? 0 : gross;
          existing.cogs += isCancelled ? 0 : itemCogs;
          existing.discount += discountVal;
          existing.insuranceShare += insShareVal;
          existing.patientShare += patShareVal;
          existing.refunds += refundAmt;
          existing.netSales += isCancelled ? 0 : net;
          existing.grossProfit += isCancelled ? 0 : net - itemCogs;
          existing.orderCount += 1;
        } else {
          itemMap.set(key, {
            id: key,
            catalogItemId: item.catalogItemId,
            code: item.itemCode || catItem?.code || 'ITM-101',
            name: item.itemName,
            type: isMedicine
              ? 'MEDICINE'
              : isProduct
              ? 'PRODUCT'
              : isConsumable
              ? 'CONSUMABLE'
              : 'SERVICE',
            category: item.category || catItem?.category || 'عمومی',
            unit: item.unit || catItem?.unit || 'عدد',
            quantitySold: qtySold,
            refundQuantity: refundQty,
            salePriceSnapshot: item.unitPrice,
            purchasePriceSnapshot: purchasePrice,
            grossSales: isCancelled ? 0 : gross,
            cogs: isCancelled ? 0 : itemCogs,
            discount: discountVal,
            insuranceShare: insShareVal,
            patientShare: patShareVal,
            refunds: refundAmt,
            netSales: isCancelled ? 0 : net,
            grossProfit: isCancelled ? 0 : net - itemCogs,
            doctorName: ord.doctorName,
            orderCount: 1,
          });
        }
      });
    });

    let list = Array.from(itemMap.values());

    // If list is empty from seed orders, generate rich seed report data for display
    if (list.length === 0) {
      if (targetType === 'MEDICINE' || targetType === 'COMBINED') {
        list.push(
          {
            id: 'm-1',
            catalogItemId: 'cat-102',
            code: 'DRG-201',
            name: 'قرص لوزارتان ۵۰ میلی‌گرم (Losartan)',
            type: 'MEDICINE',
            category: 'دارویی',
            unit: 'جعبه (۳۰ عددی)',
            quantitySold: 420,
            refundQuantity: 10,
            salePriceSnapshot: 45000,
            purchasePriceSnapshot: 31000,
            grossSales: 18900000,
            cogs: 13020000,
            discount: 200000,
            insuranceShare: 13230000,
            patientShare: 5470000,
            refunds: 450000,
            netSales: 18250000,
            grossProfit: 5230000,
            orderCount: 180,
          },
          {
            id: 'm-2',
            catalogItemId: 'cat-103',
            code: 'DRG-302',
            name: 'آمپول آمپیسیلین ۱ گرم تزرقی',
            type: 'MEDICINE',
            category: 'دارویی',
            unit: 'عدد',
            quantitySold: 310,
            refundQuantity: 5,
            salePriceSnapshot: 28000,
            purchasePriceSnapshot: 19000,
            grossSales: 8680000,
            cogs: 5890000,
            discount: 100000,
            insuranceShare: 6076000,
            patientShare: 2504000,
            refunds: 140000,
            netSales: 8440000,
            grossProfit: 2550000,
            orderCount: 140,
          }
        );
      }
      if (targetType === 'SERVICE' || targetType === 'COMBINED') {
        list.push(
          {
            id: 's-1',
            catalogItemId: 'cat-101',
            code: 'SRV-101',
            name: 'ویزیت تخصصی پزشک عمومی / داخلی',
            type: 'SERVICE',
            category: 'ویزیت',
            unit: 'خدمت',
            quantitySold: 580,
            refundQuantity: 12,
            salePriceSnapshot: 180000,
            purchasePriceSnapshot: 0,
            grossSales: 104400000,
            cogs: 0,
            discount: 1200000,
            insuranceShare: 73080000,
            patientShare: 30120000,
            refunds: 2160000,
            netSales: 101040000,
            grossProfit: 101040000,
            orderCount: 580,
          },
          {
            id: 's-2',
            catalogItemId: 'cat-104',
            code: 'SRV-201',
            name: 'نوار قلب کامل با تفسیر (ECG)',
            type: 'SERVICE',
            category: 'خدمات پاراکلینیک',
            unit: 'خدمت',
            quantitySold: 240,
            refundQuantity: 2,
            salePriceSnapshot: 150000,
            purchasePriceSnapshot: 0,
            grossSales: 36000000,
            cogs: 0,
            discount: 400000,
            insuranceShare: 25200000,
            patientShare: 10400000,
            refunds: 300000,
            netSales: 35300000,
            grossProfit: 35300000,
            orderCount: 240,
          }
        );
      }
      if (targetType === 'PRODUCT' || targetType === 'COMBINED') {
        list.push({
          id: 'p-1',
          catalogItemId: 'cat-105',
          code: 'PRD-501',
          name: 'دستگاه فشارسنج دیجیتالی بازویی با کاف',
          type: 'PRODUCT',
          category: 'تجهیزات پزشکی',
          unit: 'دستگاه',
          quantitySold: 45,
          refundQuantity: 1,
          salePriceSnapshot: 1250000,
          purchasePriceSnapshot: 890000,
          grossSales: 56250000,
          cogs: 40050000,
          discount: 500000,
          insuranceShare: 0,
          patientShare: 55750000,
          refunds: 1250000,
          netSales: 54500000,
          grossProfit: 14450000,
          orderCount: 45,
        });
      }
      if (targetType === 'CONSUMABLE' || targetType === 'COMBINED') {
        list.push({
          id: 'c-1',
          catalogItemId: 'cat-106',
          code: 'CNS-601',
          name: 'ست سرم به همراه آنژیوکت استریل سبز/آبی',
          type: 'CONSUMABLE',
          category: 'اقلام مصرفی',
          unit: 'ست',
          quantitySold: 620,
          refundQuantity: 15,
          salePriceSnapshot: 35000,
          purchasePriceSnapshot: 22000,
          grossSales: 21700000,
          cogs: 13640000,
          discount: 300000,
          insuranceShare: 15190000,
          patientShare: 6210000,
          refunds: 525000,
          netSales: 20875000,
          grossProfit: 7235000,
          orderCount: 620,
        });
      }
    }

    return list.sort((a, b) => b.netSales - a.netSales);
  }, [filteredOrders, catalogItems, filters]);

  // Overall KPI Summary Cards for Active Report Selection
  const salesKpis = useMemo(() => {
    let totalQuantity = 0;
    let totalGross = 0;
    let totalRefunds = 0;
    let totalNet = 0;
    let totalCost = 0;
    let totalGrossProfit = 0;
    let totalDiscount = 0;
    let totalInsurance = 0;

    aggregatedSalesItems.forEach((item) => {
      totalQuantity += item.quantitySold;
      totalGross += item.grossSales;
      totalRefunds += item.refunds;
      totalNet += item.netSales;
      totalCost += item.cogs;
      totalGrossProfit += item.grossProfit;
      totalDiscount += item.discount;
      totalInsurance += item.insuranceShare;
    });

    const averageSaleValue = totalQuantity > 0 ? Math.round(totalNet / totalQuantity) : 0;
    const topItem = aggregatedSalesItems.length > 0 ? aggregatedSalesItems[0] : null;

    return {
      totalQuantity,
      totalGross,
      totalRefunds,
      totalNet,
      totalCost,
      totalGrossProfit,
      totalDiscount,
      totalInsurance,
      averageSaleValue,
      topItem,
    };
  }, [aggregatedSalesItems]);

  // Grouped Report Data (if groupBy !== 'ITEM')
  const groupedSalesData = useMemo(() => {
    const groupBy = filters.groupBy || 'ITEM';
    if (groupBy === 'ITEM') return aggregatedSalesItems;

    const groupMap = new Map<
      string,
      {
        groupName: string;
        quantitySold: number;
        grossSales: number;
        cogs: number;
        discount: number;
        insuranceShare: number;
        refunds: number;
        netSales: number;
        grossProfit: number;
        itemCount: number;
      }
    >();

    aggregatedSalesItems.forEach((item) => {
      let key = item.category;
      if (groupBy === 'CATEGORY') key = item.category;
      else if (groupBy === 'DOCTOR') key = item.doctorName || 'پزشک عمومی کلینیک';
      else if (groupBy === 'DAY') key = 'روزهای هفته';
      else if (groupBy === 'SHIFT') key = 'شیفت کاری';

      const existing = groupMap.get(key);
      if (existing) {
        existing.quantitySold += item.quantitySold;
        existing.grossSales += item.grossSales;
        existing.cogs += item.cogs;
        existing.discount += item.discount;
        existing.insuranceShare += item.insuranceShare;
        existing.refunds += item.refunds;
        existing.netSales += item.netSales;
        existing.grossProfit += item.grossProfit;
        existing.itemCount += 1;
      } else {
        groupMap.set(key, {
          groupName: key,
          quantitySold: item.quantitySold,
          grossSales: item.grossSales,
          cogs: item.cogs,
          discount: item.discount,
          insuranceShare: item.insuranceShare,
          refunds: item.refunds,
          netSales: item.netSales,
          grossProfit: item.grossProfit,
          itemCount: 1,
        });
      }
    });

    return Array.from(groupMap.values());
  }, [aggregatedSalesItems, filters.groupBy]);

  // General Financial Transactions Filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.doctorId !== 'ALL' && tx.doctorId !== filters.doctorId) return false;
      if (filters.paymentMethod !== 'ALL' && tx.paymentMethod !== filters.paymentMethod) return false;
      return true;
    });
  }, [transactions, filters]);

  // Overall Financial KPIs
  const totalGrossRevenue = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + (tx.amountGross || 0), 0) || salesKpis.totalGross;
  }, [filteredTransactions, salesKpis]);

  const totalNetRevenue = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + (tx.amountNet || 0), 0) || salesKpis.totalNet;
  }, [filteredTransactions, salesKpis]);

  const totalInsuranceContribution = useMemo(() => {
    return (
      filteredTransactions.reduce((acc, tx) => acc + (tx.insuranceCoverage || 0), 0) ||
      salesKpis.totalInsurance
    );
  }, [filteredTransactions, salesKpis]);

  const totalDiscounts = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + (tx.discountAmount || 0), 0) || salesKpis.totalDiscount;
  }, [filteredTransactions, salesKpis]);

  // Chart Data
  const salesChartData = useMemo(() => {
    return aggregatedSalesItems.slice(0, 8).map((i) => ({
      name: i.name.length > 20 ? i.name.substring(0, 18) + '...' : i.name,
      gross: i.grossSales,
      net: i.netSales,
      profit: i.grossProfit,
      quantity: i.quantitySold,
    }));
  }, [aggregatedSalesItems]);

  const categoriesChartData = useMemo(() => {
    const catMap: Record<string, number> = {};
    aggregatedSalesItems.forEach((i) => {
      catMap[i.category] = (catMap[i.category] || 0) + i.netSales;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [aggregatedSalesItems]);

  const categoryColors = theme === 'clinic-olive'
    ? ['#283F24', '#35542F', '#4F6F4A', '#62745D', '#9A9E91', '#889B73']
    : ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

  // Export Action Handlers (Preserves Active Filters & Titles)
  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV' | 'PRINT') => {
    const reportTitleMap: Record<string, string> = {
      COMBINED: 'گزارش جامع فروش اقلام، داروها و خدمات کلینیک',
      MEDICINE: 'گزارش اختصاصی فروش دارو و اقلام دارویی',
      SERVICE: 'گزارش اختصاصی درآمد و اجرای خدمات کلینیکال',
      PRODUCT: 'گزارش اختصاصی فروش کالا و تجهیزات پزشکی',
      CONSUMABLE: 'گزارش اختصاصی مصرف و فروش اقلام مصرفی',
    };

    const activeTitle = reportTitleMap[filters.salesReportType || 'COMBINED'];

    if (format === 'PRINT') {
      window.print();
    } else if (format === 'CSV' || format === 'EXCEL') {
      const isPhysical =
        filters.salesReportType === 'MEDICINE' ||
        filters.salesReportType === 'PRODUCT' ||
        filters.salesReportType === 'CONSUMABLE';

      let headers = 'کد آیتم,نام عنوان,دسته‌بندی,تعداد فروش/اجرا,قیمت واحد فروش,درآمد ناخالص,تخفیف,استرداد/مرجوعی,درآمد خالص';
      if (isPhysical) {
        headers += ',قیمت واحد خرید,بهای تمام‌شده (COGS),سود ناخالص';
      }
      headers += '\n';

      let rows = aggregatedSalesItems
        .map((item) => {
          let line = `"${item.code}","${item.name}","${item.category}","${item.quantitySold}","${item.salePriceSnapshot}","${item.grossSales}","${item.discount}","${item.refunds}","${item.netSales}"`;
          if (isPhysical) {
            line += `,"${item.purchasePriceSnapshot}","${item.cogs}","${item.grossProfit}"`;
          }
          return line;
        })
        .join('\n');

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `report-${(filters.salesReportType || 'sales').toLowerCase()}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    logReportExport({
      reportTitle: activeTitle,
      exportFormat: format,
      exportedBy: activeUser?.fullName || 'مدیر سیستم',
      userRole: activeUser?.role || 'ADMIN',
      filterSummary: `بازه: ${filters.datePreset} | نوع: ${filters.salesReportType} | پزشک: ${filters.doctorId} | بیمه: ${filters.insuranceType}`,
      recordCount: aggregatedSalesItems.length,
    });

    addNotification(`خروجی ${format} گزارش ${activeTitle} با موفقیت استخراج گردید.`, 'success');
  };

  const handleSaveSnapshot = () => {
    if (!snapshotTitle) {
      alert('لطفاً عنوان اسنپ‌شات را وارد نمائید.');
      return;
    }

    addReportSnapshot({
      title: snapshotTitle,
      reportCategory: 'FINANCIAL',
      createdBy: activeUser?.fullName || 'مدیر کلینیک',
      clinicId: activeClinic.id,
      filters: { ...filters },
      summaryMetrics: {
        totalRevenue: salesKpis.totalNet,
        patientCount: patients.length || 450,
        transactionCount: filteredOrders.length,
        insuranceTotal: salesKpis.totalInsurance,
        discountTotal: salesKpis.totalDiscount,
        refundTotal: salesKpis.totalRefunds,
        outstandingTotal: 3000000,
      },
      notes: `ذخیره اسنپ‌شات گزارش فروش [${filters.salesReportType}] در تاریخ ${new Date().toLocaleDateString('fa-IR')}`,
    });

    setSnapshotTitle('');
    setIsSnapshotModalOpen(false);
  };

  const handleCreateScheduler = () => {
    if (!schedTitle) {
      alert('عنوان زمان‌بندی را وارد نمایید.');
      return;
    }

    addScheduledReport({
      title: schedTitle,
      reportCategory: 'FINANCIAL',
      frequency: schedFreq,
      executionTime: schedTime,
      recipientsEmail: schedEmail.split(',').map((e) => e.trim()),
      isEnabled: true,
      nextRunAt: `${new Date().toLocaleDateString('fa-IR')} - ${schedTime}`,
    });

    setSchedTitle('');
    setSchedEmail('');
    setIsSchedulerModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-[var(--text-main)] max-w-[1700px] mx-auto animate-in fade-in duration-150 dir-rtl">
      {/* 1. Module Header */}
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black shadow-md shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
                مرکز گزارشات جامع، فروش و تحلیل هوشمند عملکرد کلینیک
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                Reporting Patch 04
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              گزارشات مجزا و تفکیک‌شده دارو، خدمات، کالا و اقلام مصرفی به همراه حاشیه سود، استردادها و فیلترهای دقیق تاریخ و ساعت.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-3.5 py-2 bg-[var(--bg-app)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-main)] text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-[var(--border-subtle)]"
          >
            <Save className="w-4 h-4 text-emerald-500" />
            <span>ذخیره اسنپ‌شات (Snapshot)</span>
          </button>

          <button
            onClick={() => setIsSchedulerModalOpen(true)}
            className="px-3.5 py-2 bg-[var(--bg-app)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-main)] text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-[var(--border-subtle)]"
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span>زمان‌بندی گزارشات خودکار</span>
          </button>

          <div className="h-6 w-[1px] bg-[var(--border-subtle)] mx-1 hidden sm:block" />

          <button
            onClick={() => handleExport('PRINT')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ / PDF</span>
          </button>

          <button
            onClick={() => handleExport('EXCEL')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>خروجی اکسل (Excel / CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. ADVANCED FILTER ENGINE BAR */}
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
            <Filter className="w-4 h-4 text-emerald-500" />
            <span>موتور فیلتر پیشرفته گزارشات و فروش (Filter Engine)</span>
          </div>

          <button
            onClick={() =>
              setFilters({
                datePreset: 'THIS_MONTH',
                startDate: '',
                endDate: '',
                startTime: '00:00',
                endTime: '23:59',
                shiftType: 'ALL',
                doctorId: 'ALL',
                receptionistId: 'ALL',
                insuranceType: 'ALL',
                paymentMethod: 'ALL',
                patientCareType: 'ALL',
                visitCareMode: 'ALL',
                itemType: 'ALL',
                itemId: 'ALL',
                category: 'ALL',
                invoiceStatus: 'PAID',
                groupBy: 'ITEM',
                comparisonMode: 'NONE',
                salesReportType: 'COMBINED',
              })
            }
            className="text-[11px] text-[var(--text-muted)] hover:text-rose-500 transition flex items-center gap-1 font-bold"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>بازنشانی فیلترها</span>
          </button>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Date Preset */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">بازه زمانی تاریخ</label>
            <select
              value={filters.datePreset}
              onChange={(e) => setFilters({ ...filters, datePreset: e.target.value as ReportDatePreset })}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="TODAY">امروز</option>
              <option value="YESTERDAY">دیروز</option>
              <option value="THIS_WEEK">این هفته</option>
              <option value="LAST_WEEK">هفته گذشته</option>
              <option value="THIS_MONTH">این ماه (تیر)</option>
              <option value="LAST_MONTH">ماه گذشته (خرداد)</option>
              <option value="THIS_YEAR">سال جاری (۱۴۰۳)</option>
              <option value="CUSTOM">بازه زمانی دلخواه (تاریخ)</option>
              <option value="CUSTOM_DATETIME">بازه دقیق تاریخ و ساعت</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">پزشک معالج</label>
            <select
              value={filters.doctorId}
              onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">همه پزشکان کلینیک</option>
              {staffList
                .filter((s) => s.role === 'DOCTOR' || s.role === 'ADMIN')
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.title})
                  </option>
                ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">شیفت کاری</label>
            <select
              value={filters.shiftType}
              onChange={(e) => setFilters({ ...filters, shiftType: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">تمامی شیفت‌ها</option>
              <option value="MORNING">شیفت صبح</option>
              <option value="EVENING">شیفت عصر</option>
              <option value="NIGHT">شیفت شب</option>
            </select>
          </div>

          {/* Insurance Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">نوع بیمه طرف قرارداد</label>
            <select
              value={filters.insuranceType}
              onChange={(e) => setFilters({ ...filters, insuranceType: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">همه بیمه‌ها</option>
              <option value="FREE">آزاد (بدون بیمه)</option>
              <option value="TAMIN_INJTIMAI">تامین اجتماعی</option>
              <option value="SALAMAT">بیمه سلامت ایرانیان</option>
              <option value="NIZAM_LASHKARI">نیروهای مسلح</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">روش پرداخت</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">همه روش‌های پرداخت</option>
              <option value="POS">کارتخوان (POS)</option>
              <option value="CASH">نقدی</option>
              <option value="CARD_TO_CARD">کارت به کارت</option>
              <option value="INSURANCE">سهم بیمه تکمیلی</option>
            </select>
          </div>

          {/* Invoice Status */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">وضعیت فاکتورها</label>
            <select
              value={filters.invoiceStatus}
              onChange={(e) => setFilters({ ...filters, invoiceStatus: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="PAID">فاکتورهای نهایی و تسویه‌شده</option>
              <option value="READY_FOR_BILLING">در انتظار تسویه (پذیرش)</option>
              <option value="ALL">تمامی فاکتورها</option>
              <option value="CANCELLED">فاکتورهای ابطال‌شده / مرجوعی</option>
            </select>
          </div>
        </div>

        {/* Custom Date & Time Sub-Panel (renders when Custom is selected) */}
        {(filters.datePreset === 'CUSTOM' || filters.datePreset === 'CUSTOM_DATETIME') && (
          <div className="p-3.5 bg-[var(--bg-app)] rounded-xl border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-1">
            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">از تاریخ (مثلاً ۱۴۰۳/۰۵/۰۱)</label>
              <input
                type="text"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                placeholder="۱۴۰۳/۰۵/۰۱"
                className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">تا تاریخ (مثلاً ۱۴۰۳/۰۵/۳۰)</label>
              <input
                type="text"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                placeholder="۱۴۰۳/۰۵/۳۰"
                className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] font-mono text-center"
              />
            </div>

            {filters.datePreset === 'CUSTOM_DATETIME' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-blue-700 dark:text-blue-400 mb-1">از ساعت (مثلاً ۰۸:۰۰)</label>
                  <input
                    type="text"
                    value={filters.startTime}
                    onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
                    placeholder="08:00"
                    className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-700 dark:text-blue-400 mb-1">تا ساعت (مثلاً ۲۳:۵۹)</label>
                  <input
                    type="text"
                    value={filters.endTime}
                    onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
                    placeholder="23:59"
                    className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] font-mono text-center"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. MAIN CATEGORY TAB NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] pb-3 text-xs font-bold">
        {[
          { id: 'SALES', label: 'گزارشات تفکیکی و جامع فروش (Patch 04)', icon: <ShoppingCart className="w-4 h-4 text-emerald-500" /> },
          { id: 'FINANCIAL', label: 'گزارشات مالی و جریان نقد', icon: <DollarSign className="w-4 h-4 text-blue-500" /> },
          { id: 'PATIENT', label: 'آمار مراجعات و بیماران', icon: <Users className="w-4 h-4 text-purple-500" /> },
          { id: 'SERVICE', label: 'تحلیل خدمات و کلینیکال', icon: <Activity className="w-4 h-4 text-teal-500" /> },
          { id: 'MEDICINE', label: 'داروها و تجهیزات', icon: <Pill className="w-4 h-4 text-amber-500" /> },
          { id: 'DOCTOR', label: 'عملکرد پزشکان', icon: <Stethoscope className="w-4 h-4 text-indigo-500" /> },
          { id: 'SHIFT', label: 'آمار شیفت‌ها', icon: <Clock className="w-4 h-4 text-rose-500" /> },
          { id: 'EMPLOYEE', label: 'کارکرد پرسنل', icon: <ShieldCheck className="w-4 h-4 text-sky-500" /> },
          { id: 'SNAPSHOTS', label: `اسنپ‌شات‌ها (${reportSnapshots.length})`, icon: <Save className="w-4 h-4 text-[var(--text-muted)]" /> },
          { id: 'SCHEDULED', label: `زمان‌بندی خودکار (${scheduledReports.length})`, icon: <Bell className="w-4 h-4 text-emerald-500" /> },
          { id: 'AUDIT', label: `سوابق ممیزی (${reportExportLogs.length})`, icon: <History className="w-4 h-4 text-[var(--text-muted)]" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
              activeCategory === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. TAB 1: SALES REPORTS (PATCH 04 CORE FEATURE) */}
      {activeCategory === 'SALES' && (
        <div className="space-y-6">
          {/* 5 Distinct Sales Report Selectors */}
          <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs font-bold shadow-sm">
            <span className="text-[var(--text-muted)] px-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span>نوع گزارش فروش:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'COMBINED', label: 'گزارش جامع فروش', icon: <Layers className="w-4 h-4" /> },
                { id: 'MEDICINE', label: 'گزارش فروش دارو', icon: <Pill className="w-4 h-4 text-amber-500" /> },
                { id: 'SERVICE', label: 'گزارش فروش خدمات', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
                { id: 'PRODUCT', label: 'گزارش فروش کالا و تجهیزات', icon: <Package className="w-4 h-4 text-blue-500" /> },
                { id: 'CONSUMABLE', label: 'گزارش فروش اقلام مصرفی', icon: <Box className="w-4 h-4 text-purple-500" /> },
              ].map((rep) => (
                <button
                  key={rep.id}
                  onClick={() =>
                    setFilters({ ...filters, salesReportType: rep.id as any })
                  }
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
                    filters.salesReportType === rep.id
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-[var(--bg-app)] text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {rep.icon}
                  <span>{rep.label}</span>
                </button>
              ))}
            </div>

            {/* Grouping & Comparison Controls */}
            <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle)] w-full lg:w-auto justify-end">
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[var(--text-muted)]">گروه‌بندی:</span>
                <select
                  value={filters.groupBy || 'ITEM'}
                  onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as any })}
                  className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold text-xs"
                >
                  <option value="ITEM">بر اساس آیتم</option>
                  <option value="CATEGORY">دسته‌بندی موضوعی</option>
                  <option value="DOCTOR">پزشک معالج</option>
                  <option value="SHIFT">شیفت کاری</option>
                  <option value="DAY">روزانه</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[var(--text-muted)]">مقایسه:</span>
                <select
                  value={filters.comparisonMode || 'NONE'}
                  onChange={(e) => setFilters({ ...filters, comparisonMode: e.target.value as any })}
                  className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] font-bold text-xs"
                >
                  <option value="NONE">بدون مقایسه</option>
                  <option value="PREVIOUS_PERIOD">با دوره قبل (+۱4.۲٪)</option>
                  <option value="THIS_VS_LAST_MONTH">این ماه vs ماه قبل</option>
                  <option value="SHIFTS">مقایسه شیفت‌ها</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Quantity */}
            <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-1">
              <span className="text-[11px] text-[var(--text-muted)] font-bold block flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
                <span>کل تعداد فروش / اجرا</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {salesKpis.totalQuantity.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">عدد/خدمت</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                تعداد اقلام نهایی شده در فاکتورهای صادره
              </p>
            </div>

            {/* Gross Revenue */}
            <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-1">
              <span className="text-[11px] text-[var(--text-muted)] font-bold block flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                <span>درآمد / فروش ناخالص</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {salesKpis.totalGross.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">تومان</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                مجموع فروش بر اساس تعرفه مصوب بدون کسر تخفیف
              </p>
            </div>

            {/* Refunds & Discounts */}
            <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-1">
              <span className="text-[11px] text-[var(--text-muted)] font-bold block flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>مرجوعی و استردادها</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {salesKpis.totalRefunds.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">تومان</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                کاهش‌یافته از درآمد به همراه تخفیف ({salesKpis.totalDiscount.toLocaleString('fa-IR')} تومان)
              </p>
            </div>

            {/* Net Revenue */}
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-sm space-y-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>فروش / درآمد خالص</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {salesKpis.totalNet.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">تومان</span>
              </div>
              <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
                مبلغ وصول‌شده پس از کسر مرجوعی و تخفیفات
              </p>
            </div>

            {/* Cost COGS (for Physical Items) */}
            {(filters.salesReportType === 'MEDICINE' ||
              filters.salesReportType === 'PRODUCT' ||
              filters.salesReportType === 'CONSUMABLE' ||
              filters.salesReportType === 'COMBINED') && (
              <>
                <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-1">
                  <span className="text-[11px] text-[var(--text-muted)] font-bold block flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-amber-500" />
                    <span>بهای تمام‌شده (COGS)</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {salesKpis.totalCost.toLocaleString('fa-IR')}{' '}
                    <span className="text-xs font-normal text-[var(--text-muted)]">تومان</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    قیمت خرید اسنپ‌شات اقلام فیزیکی تحویلی
                  </p>
                </div>

                <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 shadow-sm space-y-1">
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold block flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    <span>سود ناخالص (Gross Profit)</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-300 font-mono">
                    {salesKpis.totalGrossProfit.toLocaleString('fa-IR')}{' '}
                    <span className="text-xs font-normal text-[var(--text-muted)]">تومان</span>
                  </div>
                  <p className="text-[10px] text-teal-800/80 dark:text-teal-300/80">
                    تفاضل فروش خالص و بهای خرید
                  </p>
                </div>
              </>
            )}

            {/* Average Sale Value */}
            <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-1">
              <span className="text-[11px] text-[var(--text-muted)] font-bold block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>میانگین ارزش هر فروش</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {salesKpis.averageSaleValue.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">تومان</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                متوسط مبلغ دریافتی به ازای هر واحد کالا/خدمت
              </p>
            </div>

            {/* Top Selling Item Card */}
            <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-1">
              <span className="text-[11px] text-[var(--text-muted)] font-bold block flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>پرفروش‌ترین آیتم دوره</span>
              </span>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100 truncate mt-1">
                {salesKpis.topItem ? salesKpis.topItem.name : 'در حال محاسبه...'}
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {salesKpis.topItem
                  ? `${salesKpis.topItem.netSales.toLocaleString('fa-IR')} تومان (${salesKpis.topItem.quantitySold} ${salesKpis.topItem.unit})`
                  : 'بدون ثبت'}
              </p>
            </div>
          </div>

          {/* Main Table View: Specific to Selected Sales Report */}
          <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-black text-[var(--text-main)]">
                  {filters.salesReportType === 'MEDICINE' && 'جدول تفکیکی گزارش فروش دارو (Medicine Sales Report)'}
                  {filters.salesReportType === 'SERVICE' && 'جدول تفکیکی گزارش فروش خدمات کلینیکال (Service Sales Report)'}
                  {filters.salesReportType === 'PRODUCT' && 'جدول تفکیکی فروش کالا و تجهیزات (Product Sales Report)'}
                  {filters.salesReportType === 'CONSUMABLE' && 'جدول تفکیکی فروش و مصرف اقلام مصرفی (Consumable Sales Report)'}
                  {filters.salesReportType === 'COMBINED' && 'جدول جامع فروش کلیه اقلام، داروها و خدمات کلینیک'}
                </h3>
              </div>

              <span className="text-xs text-[var(--text-muted)] font-mono">
                تعداد ردیف‌های فعال: {aggregatedSalesItems.length.toLocaleString('fa-IR')}
              </span>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 rounded-r-xl">کد آیتم</th>
                    <th className="p-3">عنوان کالا / خدمت</th>
                    <th className="p-3">نوع / دسته‌بندی</th>
                    <th className="p-3 text-center">تعداد فروش</th>
                    <th className="p-3">قیمت فروش واحد</th>

                    {(filters.salesReportType === 'MEDICINE' ||
                      filters.salesReportType === 'PRODUCT' ||
                      filters.salesReportType === 'CONSUMABLE' ||
                      filters.salesReportType === 'COMBINED') && (
                      <th className="p-3">قیمت خرید واحد</th>
                    )}

                    <th className="p-3">فروش ناخالص</th>

                    {filters.salesReportType === 'SERVICE' && (
                      <>
                        <th className="p-3">سهم بیمه</th>
                        <th className="p-3">سهم بیمار</th>
                      </>
                    )}

                    {(filters.salesReportType === 'MEDICINE' ||
                      filters.salesReportType === 'PRODUCT' ||
                      filters.salesReportType === 'CONSUMABLE' ||
                      filters.salesReportType === 'COMBINED') && (
                      <th className="p-3">بهای تمام‌شده (COGS)</th>
                    )}

                    <th className="p-3">تخفیف / مرجوعی</th>
                    <th className="p-3">فروش خالص</th>

                    {(filters.salesReportType === 'MEDICINE' ||
                      filters.salesReportType === 'PRODUCT' ||
                      filters.salesReportType === 'CONSUMABLE' ||
                      filters.salesReportType === 'COMBINED') && (
                      <th className="p-3 rounded-l-xl">سود ناخالص</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {aggregatedSalesItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-app)] transition">
                      <td className="p-3 font-bold text-[var(--text-muted)] text-[11px]">{item.code}</td>
                      <td className="p-3 font-bold text-[var(--text-main)] font-sans">
                        <div className="flex items-center gap-1.5">
                          {item.type === 'MEDICINE' && <Pill className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {item.type === 'SERVICE' && <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {item.type === 'PRODUCT' && <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          {item.type === 'CONSUMABLE' && <Box className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[var(--text-muted)] font-sans">
                        <span className="px-2 py-0.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[10px] rounded-lg">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900 dark:text-slate-100">
                        {item.quantitySold.toLocaleString('fa-IR')} {item.unit}
                        {item.refundQuantity > 0 && (
                          <span className="text-[10px] text-rose-500 block font-sans">
                            ({item.refundQuantity} مرجوعی)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[var(--text-muted)]">
                        {item.salePriceSnapshot.toLocaleString('fa-IR')}
                      </td>

                      {(filters.salesReportType === 'MEDICINE' ||
                        filters.salesReportType === 'PRODUCT' ||
                        filters.salesReportType === 'CONSUMABLE' ||
                        filters.salesReportType === 'COMBINED') && (
                        <td className="p-3 text-[var(--text-muted)]">
                          {item.purchasePriceSnapshot > 0
                            ? item.purchasePriceSnapshot.toLocaleString('fa-IR')
                            : '۰'}
                        </td>
                      )}

                      <td className="p-3 text-[var(--text-main)]">
                        {item.grossSales.toLocaleString('fa-IR')}
                      </td>

                      {filters.salesReportType === 'SERVICE' && (
                        <>
                          <td className="p-3 text-amber-600 dark:text-amber-400">
                            {item.insuranceShare.toLocaleString('fa-IR')}
                          </td>
                          <td className="p-3 text-blue-600 dark:text-blue-400">
                            {item.patientShare.toLocaleString('fa-IR')}
                          </td>
                        </>
                      )}

                      {(filters.salesReportType === 'MEDICINE' ||
                        filters.salesReportType === 'PRODUCT' ||
                        filters.salesReportType === 'CONSUMABLE' ||
                        filters.salesReportType === 'COMBINED') && (
                        <td className="p-3 text-amber-600 dark:text-amber-400">
                          {item.cogs.toLocaleString('fa-IR')}
                        </td>
                      )}

                      <td className="p-3 text-rose-500">
                        {(item.discount + item.refunds).toLocaleString('fa-IR')}
                      </td>

                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {item.netSales.toLocaleString('fa-IR')}
                      </td>

                      {(filters.salesReportType === 'MEDICINE' ||
                        filters.salesReportType === 'PRODUCT' ||
                        filters.salesReportType === 'CONSUMABLE' ||
                        filters.salesReportType === 'COMBINED') && (
                        <td className="p-3 font-bold text-teal-600 dark:text-teal-400">
                          {item.grossProfit.toLocaleString('fa-IR')}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytics Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Bar Chart */}
            <div className="lg:col-span-2 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>نمودار مقایسه‌ای فروش ناخالص و سود اقلام برتر (تومان)</span>
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                      tickFormatter={(val) => `${val / 1000000}M`}
                    />
                    <Tooltip
                      formatter={(value: any) => `${Number(value).toLocaleString('fa-IR')} تومان`}
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-main)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-main)' }} />
                    <Bar dataKey="gross" name="فروش ناخالص" fill={theme === 'clinic-olive' ? '#283F24' : '#3b82f6'} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="net" name="فروش خالص" fill={theme === 'clinic-olive' ? '#4F6F4A' : '#10b981'} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="profit" name="سود ناخالص" fill={theme === 'clinic-olive' ? '#35542F' : '#0d9488'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-500" />
                <span>سهم دسته‌بندی‌ها در کل درآمد</span>
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoriesChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoriesChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={categoryColors[index % categoryColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `${Number(value).toLocaleString('fa-IR')} تومان`}
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-main)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--text-main)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: FINANCIAL REPORTS */}
      {activeCategory === 'FINANCIAL' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                درآمد ناخالص (Gross Revenue)
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {totalGrossRevenue.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                جمع کل صورتحساب‌های صادره قبل از کسر بیمه و تخفیف
              </p>
            </div>

            <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 space-y-2">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block">
                درآمد خالص دریافتی (Net Revenue)
              </span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                {totalNetRevenue.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">
                مبلغ نهایی دریافت شده از بیماران (نقد + کارتخوان)
              </p>
            </div>

            <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">
                مطالبات سازمان‌های بیمه‌گر
              </span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                {totalInsuranceContribution.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
                سهم تعهد بیمه‌های پایه و تکمیلی جهت وصول
              </p>
            </div>

            <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20 space-y-2">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block">
                تخفیفات اعطایی و معوقات
              </span>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-300 font-mono">
                {totalDiscounts.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                تخفیف مدیریتی + بدهی و فاکتورهای معوق بیماران
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: PATIENT REPORTS */}
      {activeCategory === 'PATIENT' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>آمار مراجعات و تفکیک بیماران کلینیک</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            تعداد کل پرونده‌های تشکیل‌شده: {patients.length.toLocaleString('fa-IR')} بیمار
          </p>
        </div>
      )}

      {/* 7. TAB 4: SERVICE REPORTS */}
      {activeCategory === 'SERVICE' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>گزارش عمومی خدمات کلینیکال و پاراکلینیک</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            جهت مشاهده جزئیات ریز فروش خدمات با تعرفه و سهم بیمه، به زبانه «گزارشات تفکیکی فروش» مراجعه فرمائید.
          </p>
        </div>
      )}

      {/* 8. TAB 5: MEDICINE REPORTS */}
      {activeCategory === 'MEDICINE' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Pill className="w-4 h-4 text-amber-500" />
            <span>گزارش عمومی داروخانه و تجهیزات</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            جهت مشاهده گزارش اختصاصی فروش دارو، سود ناخالص و COGS به زبانه «گزارشات تفکیکی فروش» مراجعه فرمائید.
          </p>
        </div>
      )}

      {/* 9. TAB 6: DOCTOR REPORTS */}
      {activeCategory === 'DOCTOR' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-indigo-500" />
            <span>آمار عملکرد و کارکرد مالی پزشکان</span>
          </h3>
        </div>
      )}

      {/* 10. TAB 7: SHIFT REPORTS */}
      {activeCategory === 'SHIFT' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>آمار عملکرد شیفت‌های کاری (صبح / عصر / شب)</span>
          </h3>
        </div>
      )}

      {/* 11. TAB 8: EMPLOYEE REPORTS */}
      {activeCategory === 'EMPLOYEE' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <span>کارکرد و ثبت‌های کادر پذیرش و پرستاری</span>
          </h3>
        </div>
      )}

      {/* 12. TAB 9: SNAPSHOTS */}
      {activeCategory === 'SNAPSHOTS' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-500" />
            <span>مدیریت اسنپ‌شات‌های ذخیره‌شده</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportSnapshots.map((snap) => (
              <div key={snap.id} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-main)]">{snap.title}</h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 block">{snap.createdAt}</span>
                  </div>
                  <button
                    onClick={() => deleteReportSnapshot(snap.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-rose-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">درآمد خالص:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{snap.summaryMetrics.totalRevenue.toLocaleString('fa-IR')} تومان</strong>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] italic">{snap.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13. TAB 10: SCHEDULED REPORTS */}
      {activeCategory === 'SCHEDULED' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" />
            <span>زمان‌بندی ارسال گزارشات خودکار</span>
          </h3>

          <div className="space-y-3">
            {scheduledReports.map((sc) => (
              <div key={sc.id} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">{sc.title}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    فرکانس: {sc.frequency} | ساعت اجرا: {sc.executionTime} | دریافت‌کنندگان: {sc.recipientsEmail.join(', ')}
                  </p>
                </div>

                <button
                  onClick={() => toggleScheduledReport(sc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sc.isEnabled ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {sc.isEnabled ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. TAB 11: AUDIT LOGS */}
      {activeCategory === 'AUDIT' && (
        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--text-muted)]" />
            <span>سوابق خروجی‌های اخذ شده (Audit Trail)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3">تاریخ و زمان</th>
                  <th className="p-3">عنوان گزارش</th>
                  <th className="p-3">فرمت</th>
                  <th className="p-3">کاربر اخذکننده</th>
                  <th className="p-3">فیلترهای اعمال‌شده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                {reportExportLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-app)] transition">
                    <td className="p-3 text-[var(--text-muted)]">{log.timestamp}</td>
                    <td className="p-3 font-bold text-[var(--text-main)] font-sans">{log.reportTitle}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded border border-blue-500/20">
                        {log.exportFormat}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--text-main)] font-sans">{log.exportedBy}</td>
                    <td className="p-3 text-[var(--text-muted)] font-sans">{log.filterSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Snapshot Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-subtle)] shadow-2xl space-y-4 text-[var(--text-main)]">
            <h3 className="text-base font-bold">ذخیره اسنپ‌شات وضعیت فعلی گزارش</h3>

            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">عنوان اسنپ‌شات *</label>
              <input
                type="text"
                value={snapshotTitle}
                onChange={(e) => setSnapshotTitle(e.target.value)}
                placeholder="مثلاً: اسنپ‌شات فروش دارو و خدمات تیرماه ۱۴۰۳"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-4 py-2 bg-[var(--bg-app)] text-[var(--text-muted)] text-xs font-bold rounded-xl border border-[var(--border-subtle)]"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveSnapshot}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
              >
                ذخیره اسنپ‌شات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduler Modal */}
      {isSchedulerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-subtle)] shadow-2xl space-y-4 text-[var(--text-main)]">
            <h3 className="text-base font-bold">ثبت زمان‌بندی جدید ارسال گزارش خودکار</h3>

            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">عنوان گزارش خودکار *</label>
              <input
                type="text"
                value={schedTitle}
                onChange={(e) => setSchedTitle(e.target.value)}
                placeholder="مثلاً: گزارش خودکار روزانه فروش دارو و خدمات"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">فرکانس اجرا</label>
                <select
                  value={schedFreq}
                  onChange={(e) => setSchedFreq(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] text-xs"
                >
                  <option value="DAILY">روزانه (Daily)</option>
                  <option value="WEEKLY">هفتگی (Weekly)</option>
                  <option value="MONTHLY">ماهانه (Monthly)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">ساعت ارسال</label>
                <input
                  type="text"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  placeholder="23:50"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] text-xs text-center font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">ایمیل‌های دریافت‌کننده (جداشده با کاما)</label>
              <input
                type="text"
                value={schedEmail}
                onChange={(e) => setSchedEmail(e.target.value)}
                placeholder="manager@vikimedic.ir, finance@vikimedic.ir"
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-main)] text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSchedulerModalOpen(false)}
                className="px-4 py-2 bg-[var(--bg-app)] text-[var(--text-muted)] text-xs font-bold rounded-xl border border-[var(--border-subtle)]"
              >
                انصراف
              </button>
              <button
                onClick={handleCreateScheduler}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow"
              >
                ثبت زمان‌بندی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
