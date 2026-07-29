import React, { useState } from 'react';
import {
  X,
  Printer,
  Building2,
  CheckCircle,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { ExportService } from '../../../infrastructure/exportService';

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

export const PrintInvoiceModal: React.FC = () => {
  const { activePrintInvoice, setActivePrintInvoice, activeClinic } = useClinic();

  const [pageSize, setPageSize] = useState<PageSize>('A5');
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-window');
  const [customScale, setCustomScale] = useState<number>(1.0);

  if (!activePrintInvoice) return null;

  const tx = activePrintInvoice;

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
      
      {/* TOOLBAR CONTROLS (Hidden in Print) */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden text-white">
        
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-sky-400">
          <Printer className="w-5 h-5 text-blue-400 shrink-0" />
          <span>پیش‌نمایش فاکتور رسمی کلینیک جهت چاپ</span>
        </div>

        {/* Page Size & Zoom Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 px-1 font-semibold">کاغذ:</span>
            <button
              type="button"
              onClick={() => { setPageSize('80mm'); setZoomMode('100%'); }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === '80mm' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              80mm
            </button>
            <button
              type="button"
              onClick={() => { setPageSize('58mm'); setZoomMode('100%'); }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === '58mm' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              58mm
            </button>
            <button
              type="button"
              onClick={() => { setPageSize('A5'); setZoomMode('fit-window'); }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === 'A5' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              A5
            </button>
            <button
              type="button"
              onClick={() => { setPageSize('A4'); setZoomMode('fit-window'); }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                pageSize === 'A4' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              A4
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setZoomMode('fit-window')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                zoomMode === 'fit-window' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>فیت</span>
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
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ فاکتور</span>
          </button>
          <button
            onClick={() => setActivePrintInvoice(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* VIEWPORT CANVAS (FITS WINDOW ALWAYS) */}
      <div className="flex-1 overflow-auto bg-slate-950/70 p-4 sm:p-8 flex justify-center items-start print:p-0 print:bg-white print:block">
        
        <div
          id="printable-official-invoice"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className={`bg-white text-slate-900 font-sans shadow-2xl transition-all duration-200 rounded-2xl overflow-hidden print:shadow-none print:transform-none print:w-full print:rounded-none break-words print-paper-${pageSize} ${getPageWidthClass()} ${
            isThermal ? 'p-3 space-y-3 text-[11px]' : 'p-6 sm:p-8 space-y-5 text-xs'
          }`}
        >
          
          {/* Header Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-5 h-5 text-blue-800 shrink-0" />
                <h1 className="text-base font-black text-slate-900">{activeClinic.name}</h1>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 break-words">{activeClinic.address}</p>
              <p className="text-[10px] text-slate-600">تلفن: {activeClinic.phone} | پروانه: {activeClinic.licenseNumber}</p>
            </div>
            
            <div className="text-left font-mono space-y-1 text-[11px] shrink-0">
              <div className="font-bold text-slate-900 border-b border-slate-300 pb-0.5">صورتحساب رسمی</div>
              <div>شماره: <strong className="text-blue-700">{tx.invoiceNumber}</strong></div>
              <div>تاریخ: {tx.createdAt}</div>
            </div>
          </div>

          {/* Patient & Transaction Details */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500">نام بیمار: </span>
              <strong className="text-slate-900 font-bold">{tx.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-500">پزشک معالج: </span>
              <strong>{tx.doctorName || 'عمومی کلینیک'}</strong>
            </div>
            <div>
              <span className="text-slate-500">روش پرداخت: </span>
              <strong className="text-emerald-700">{tx.paymentMethod === 'POS' ? 'کارتخوان (POS)' : 'نقدی'}</strong>
            </div>
            <div>
              <span className="text-slate-500">صندوق‌دار: </span>
              <span>{tx.cashierName}</span>
            </div>
          </div>

          {/* Service Items Table */}
          <table className="w-full border-collapse text-right text-[11px] border border-slate-300 table-fixed">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                <th className="p-2">شرح خدمات / ویزیت</th>
                <th className="p-2 text-left w-24">مبلغ ناخالص</th>
                <th className="p-2 text-left w-20">تخفیف</th>
                <th className="p-2 text-left w-24">مبلغ خالص</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-medium break-words">{tx.description}</td>
                <td className="p-2 text-left font-mono">{ExportService.formatCurrency(tx.amountGross)}</td>
                <td className="p-2 text-left font-mono text-rose-600">{ExportService.formatCurrency(tx.discountAmount)}</td>
                <td className="p-2 text-left font-mono font-bold text-slate-900">{ExportService.formatCurrency(tx.amountNet)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals & QR Code Footer */}
          <div className="flex justify-between items-end pt-3 border-t-2 border-slate-900">
            <div className="text-[10px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>وضعیت: تسویه حساب کامل انجام شد.</span>
              </div>
              <p>این فاکتور الکترونیکی صادر شده و معتبر می‌باشد.</p>
            </div>

            <div className="flex items-center gap-3">
              <QRCodeSVG value={`INV-${tx.invoiceNumber}-${tx.amountNet}`} size={56} />
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-left min-w-[160px]">
                <div className="text-[10px] text-slate-600">مبلغ نهایی پرداختی:</div>
                <div className="text-sm font-black text-blue-900 font-mono mt-0.5">
                  {ExportService.formatCurrency(tx.amountNet)}
                </div>
              </div>
            </div>
          </div>

          {/* Stamp & Thank You */}
          <div className="pt-4 text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300">
            با تشکر از انتخاب کلینیک {activeClinic.name} • به امید سلامتی و تندرستی شما
          </div>

        </div>

      </div>

    </div>
  );
};
