/**
 * VikiMedic v2 - Pharmacy & Inventory Module
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import { Pill, Plus, AlertTriangle, PackageCheck, Search } from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { ExportService } from '../../infrastructure/exportService';

export const PharmacyModule: React.FC = () => {
  const { inventory, addInventoryItem } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('جعبه (۳۰ عددی)');
  const [stockQuantity, setStockQuantity] = useState(50);
  const [minStockLevel, setMinStockLevel] = useState(10);
  const [unitPrice, setUnitPrice] = useState(45000);

  const filteredInventory = inventory.filter(
    (item) => item.name.includes(searchTerm) || item.code.includes(searchTerm)
  );

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    addInventoryItem({
      code,
      name,
      category: 'DRUG',
      unit,
      stockQuantity,
      minStockLevel,
      unitPrice,
    });

    setName('');
    setCode('');
  };

  return (
    <div className="p-6 space-y-6 text-[var(--text-main)] max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Title */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">مدیریت داروخانه، تجهیزات و انبار مصرفی کلینیک</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              کنترل موجودی داروها، قیمت‌گذاری و هشدار کسر موجودی انبار ({inventory.length} قلم کالا)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Inventory Item Form */}
        <form onSubmit={handleAddItem} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-sm flex items-center gap-2 text-blue-600">
            <Plus className="w-4 h-4" />
            <span>ثبت داروی جدید در انبار</span>
          </h2>

          <div>
            <label className="block mb-1 font-bold">کد دارو / کالا *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: DRG-105"
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold">نام کامل دارو یا تجهیزات *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: قرص لوزارتان ۵۰ میلی‌گرم"
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold">موجودی عددی</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">حداقل نقطه سفارش</label>
              <input
                type="number"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold">قیمت واحد (تومان)</label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] font-mono outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن به انبار</span>
          </button>
        </form>

        {/* Inventory List Table */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="جستجو در انبار دارویی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] text-xs outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <th className="p-2.5 font-bold">کد</th>
                  <th className="p-2.5 font-bold">نام دارو</th>
                  <th className="p-2.5 font-bold">موجودی فعلی</th>
                  <th className="p-2.5 font-bold">قیمت واحد</th>
                  <th className="p-2.5 font-bold">وضعیت انبار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredInventory.map((item) => {
                  const isLowStock = item.stockQuantity <= item.minStockLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono text-blue-600 font-bold">{item.code}</td>
                      <td className="p-2.5 font-bold">{item.name}</td>
                      <td className="p-2.5 font-mono font-bold">{item.stockQuantity} {item.unit}</td>
                      <td className="p-2.5 font-mono">{ExportService.formatCurrency(item.unitPrice)}</td>
                      <td className="p-2.5">
                        {isLowStock ? (
                          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>کسری انبار</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                            <PackageCheck className="w-3 h-3" />
                            <span>موجود</span>
                          </span>
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
    </div>
  );
};
