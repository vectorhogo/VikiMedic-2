import React, { useState } from 'react';
import {
  X,
  Printer,
  Building2,
  UserCheck,
  Clock,
  CheckCircle2,
  Barcode,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  FileText,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';

type PageSize = '80mm' | '58mm' | 'A5' | 'A4';
type ZoomMode = 'fit-window' | 'fit-width' | '100%' | 'custom';

const QRCodeSVG: React.FC<{ value: string; size?: number }> = ({ value, size = 64 }) => {
  const modules = 21;
  const cellSize = size / modules;
  const grid: boolean[][] = Array.from({ length: modules }, () => Array(modules).fill(false));

  const addFinder = (startR: number, startC: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startR + r][startC + c] = true;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, 14);
  addFinder(14, 0);

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (!grid[r][c]) {
        if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
        const bit = ((hash ^ (r * 31 + c * 17)) & 1) === 1;
        grid[r][c] = bit;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 border border-slate-200 p-0.5 bg-white">
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const OrderReceiptPrintModal: React.FC = () => {
  const { activeClinic, activePrintOrder, setActivePrintOrder, printOrderReceipt } = useClinic();

  const [pageSize, setPageSize] = useState<PageSize>('A5');
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-window');
  const [customScale, setCustomScale] = useState<number>(1.0);

  if (!activePrintOrder) return null;

  const handlePrint = () => {
    printOrderReceipt(activePrintOrder.id, 'چاپ رسمی صورتحساب بیمار');
    window.print();
  };

  // Get Scale Factor based on mode
  const getScaleFactor = () => {
    if (zoomMode === '100%') return 1.0;
    if (zoomMode === 'fit-window') {
      if (pageSize === 'A4') return 0.75;
      if (pageSize === 'A5') return 0.85;
      return 1.0;
    }
    if (zoomMode === 'fit-width') return 0.95;
    return customScale;
  };

  const scale = getScaleFactor();

  // Width styling based on Page Size
  const getPageWidthClass = () => {
    switch (pageSize) {
      case '58mm':
        return 'w-[230px] max-w-[230px]';
      case '80mm':
        return 'w-[310px] max-w-[310px]';
      case 'A5':
        return 'w-[540px] max-w-[540px]';
      case 'A4':
        return 'w-[760px] max-w-[760px]';
      default:
        return 'w-[540px]';
    }
  };

  const isThermal = pageSize === '58mm' || pageSize === '80mm';

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-950/85 backdrop-blur-md flex flex-col overflow-hidden print:p-0 print:bg-white print:static">
      
      {/* HEADER CONTROL TOOLBAR (Hidden in Print) */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden text-white">
        
        {/* Left: Title */}
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-sky-400">
          <Printer className="w-5 h-5 text-sky-400 shrink-0" />
          <span>پیش‌نمایش چاپ فاکتور و رسید درمان</span>
        </div>

        {/* Middle: Controls (Page Size & Zoom) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 px-1 font-semibold">اندازه کاغذ:</span>
            <button
              type="button"
              onClick={() => { setPageSize('80mm'); setZoomMode('100%'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === '80mm' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              حرارتی 80mm
            </button>
            <button
              type="button"
              onClick={() => { setPageSize('58mm'); setZoomMode('100%'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === '58mm' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              حرارتی 58mm
            </button>
            <button
              type="button"
              onClick={() => { setPageSize('A5'); setZoomMode('fit-window'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === 'A5' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              A5
            </button>
            <button
              type="button"
              onClick={() => { setPageSize('A4'); setZoomMode('fit-window'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === 'A4' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              A4
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setZoomMode('fit-window')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                zoomMode === 'fit-window' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Fit to Window"
            >
              <Maximize2 className="w-3 h-3" />
              <span>فیت پنجره</span>
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('100%')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                zoomMode === '100%' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              100%
            </button>

            <div className="flex items-center border-r border-slate-700 pr-1 mr-1 gap-1">
              <button
                type="button"
                onClick={() => { setZoomMode('custom'); setCustomScale((prev) => Math.max(0.4, prev - 0.1)); }}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
                title="بزرگ‌نمایی کمتر"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-sky-300 px-1">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => { setZoomMode('custom'); setCustomScale((prev) => Math.min(1.6, prev + 0.1)); }}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
                title="بزرگ‌نمایی بیشتر"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>ارسال به چاپگر</span>
          </button>

          <button
            onClick={() => setActivePrintOrder(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* VIEWPORT PRINT CANVAS AREA (Never Overflow Window) */}
      <div className="flex-1 overflow-auto bg-slate-950/70 p-4 sm:p-8 flex justify-center items-start print:p-0 print:bg-white print:block">
        
        <div
          id="printable-order-receipt"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className={`bg-white text-slate-900 font-sans shadow-2xl transition-all duration-200 rounded-2xl overflow-hidden print:shadow-none print:transform-none print:w-full print:rounded-none break-words ${getPageWidthClass()} ${
            isThermal ? 'p-3 space-y-3 text-[11px]' : 'p-6 sm:p-8 space-y-5 text-xs'
          }`}
        >
          
          {/* PRINT HEADER */}
          <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Building2 className={`${isThermal ? 'w-4 h-4' : 'w-6 h-6'} text-sky-700 shrink-0`} />
              <h1 className={`${isThermal ? 'text-sm font-black' : 'text-lg font-black'} text-slate-900 leading-tight`}>
                {activeClinic.name}
              </h1>
            </div>
            <p className="text-[10px] text-slate-600 break-words">{activeClinic.address}</p>
            <p className="text-[10px] text-slate-600">
              تلفن: {activeClinic.phone} | پروانه: {activeClinic.licenseNumber || '۱۰۰/۴۵۶۷۸'}
            </p>
            
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-mono font-bold text-slate-800 border-t border-dashed border-slate-300 mt-2">
              <span>شماره صورتحساب: <strong>{activePrintOrder.orderNumber}</strong></span>
              <span>•</span>
              <span>تاریخ: {activePrintOrder.createdAt}</span>
            </div>
          </div>

          {/* PATIENT & APPOINTMENT INFO */}
          <div className={`bg-slate-50 p-3 rounded-xl border border-slate-300 ${isThermal ? 'space-y-1 text-[10px]' : 'grid grid-cols-2 gap-3 text-xs'}`}>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1 border-b border-slate-200 pb-1">
                <UserCheck className="w-3.5 h-3.5 text-sky-700" />
                <span>مشخصات بیمار</span>
              </div>
              <div className="break-words">نام بیمار: <strong>{activePrintOrder.patientName}</strong></div>
              <div>کد ملی: <span className="font-mono">{activePrintOrder.patientNationalId}</span></div>
              <div>شماره پرونده: <span className="font-mono">{activePrintOrder.patientFileNumber}</span></div>
              <div>پوشش بیمه: <strong>{activePrintOrder.insuranceType}</strong></div>
            </div>

            <div className={`${isThermal ? 'pt-1 border-t border-slate-200 space-y-1' : 'space-y-1 border-r border-slate-200 pr-3'}`}>
              <div className="font-bold text-slate-900 flex items-center gap-1 border-b border-slate-200 pb-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>اطلاعات شیفت و پذیرش</span>
              </div>
              <div>پزشک معالج: <strong>{activePrintOrder.doctorName}</strong></div>
              <div>شیفت: <strong>{activePrintOrder.shiftNameFa}</strong></div>
              <div>پذیرش: <span>{activePrintOrder.receptionistName}</span></div>
            </div>
          </div>

          {/* SERVICES & MEDICINES TABLE (NO OVERFLOW) */}
          <div className="space-y-1.5 overflow-x-auto">
            <h3 className="font-bold text-slate-900 text-[11px] flex items-center justify-between">
              <span>ریز اقلام صورتحساب خدمات و دارو</span>
              <span className="font-mono text-[10px] text-slate-500">تعداد: {activePrintOrder.items.length}</span>
            </h3>

            <table className="w-full text-right text-[11px] border border-slate-300 border-collapse table-fixed">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-1.5 border-r border-slate-300 w-8 text-center">#</th>
                  <th className="p-1.5 border-r border-slate-300">شرح خدمت / کالا</th>
                  <th className="p-1.5 border-r border-slate-300 w-10 text-center">تعداد</th>
                  {!isThermal && <th className="p-1.5 border-r border-slate-300 text-center">تعرفه unit</th>}
                  <th className="p-1.5 text-center">مبلغ خالص</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activePrintOrder.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-center text-[10px]">{index + 1}</td>
                    <td className="p-1.5 border-r border-slate-300 font-semibold break-words leading-tight">
                      {item.itemName}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-center">{item.quantity}</td>
                    {!isThermal && (
                      <td className="p-1.5 border-r border-slate-300 font-mono text-center text-slate-600">
                        {item.unitPrice.toLocaleString('fa-IR')}
                      </td>
                    )}
                    <td className="p-1.5 font-mono text-center font-bold text-slate-900">
                      {item.totalNet.toLocaleString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS BREAKDOWN */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>جمع ناخالص کل:</span>
              <span className="font-mono">{activePrintOrder.totalGross.toLocaleString('fa-IR')} تومان</span>
            </div>

            {activePrintOrder.totalInsuranceShare > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>پوشش تعهد بیمه:</span>
                <span className="font-mono">- {activePrintOrder.totalInsuranceShare.toLocaleString('fa-IR')} تومان</span>
              </div>
            )}

            {activePrintOrder.totalDiscount > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>تخفیفات اعطایی:</span>
                <span className="font-mono">- {activePrintOrder.totalDiscount.toLocaleString('fa-IR')} تومان</span>
              </div>
            )}

            <div className="border-t border-slate-300 pt-1.5 flex justify-between items-center font-bold text-xs text-slate-900">
              <span>مبلغ نهایی قابل پرداخت:</span>
              <span className="font-mono text-sm text-emerald-700">
                {activePrintOrder.totalPatientShare.toLocaleString('fa-IR')} تومان
              </span>
            </div>
          </div>

          {/* PRINT FOOTER (CASHIER, PAYMENT METHOD, QR CODE, THANK YOU MESSAGE) */}
          <div className="pt-3 border-t-2 border-slate-900 space-y-3">
            
            <div className="flex items-center justify-between text-[11px] text-slate-800">
              <div className="space-y-1">
                <div>صندوق‌دار: <strong>{activePrintOrder.shiftStaffDetails?.cashierName || activePrintOrder.receptionistName}</strong></div>
                <div>روش پرداخت: <strong className="text-emerald-700">{activePrintOrder.paymentMethod || 'کارتخوان (POS)'}</strong></div>
                <div className="text-[10px] text-emerald-600 font-bold">وضعیت: تسویه کامل شده است</div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <QRCodeSVG value={`VIKIMEDIC-${activePrintOrder.orderNumber}-${activePrintOrder.totalPatientShare}`} size={isThermal ? 52 : 64} />
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">اسکن و استعلام</span>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center pt-2 border-t border-dashed border-slate-300 space-y-0.5">
              <p className="font-bold text-slate-900 text-[11px]">
                با تشکر از انتخاب کلینیک {activeClinic.name}
              </p>
              <p className="text-[10px] text-slate-500">
                به امید سلامتی و تندرستی کامل شما • سامانه VikiMedic v2
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
