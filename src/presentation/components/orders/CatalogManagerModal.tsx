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
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { CatalogItem, CatalogItemType } from '../../../domain/types';

interface CatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogManagerModal: React.FC<CatalogManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { catalogItems, addCatalogItem, updateCatalogItem } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // New or Editing Catalog Item Form
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState<{
    code: string;
    barcode: string;
    name: string;
    category: string;
    type: CatalogItemType;
    price: number;
    unit: string;
    isCoveredByInsurance: boolean;
    coveragePercentage: number;
    description: string;
  }>({
    code: '',
    barcode: '',
    name: '',
    category: 'ویزیت',
    type: 'VISIT',
    price: 100000,
    unit: 'خدمت',
    isCoveredByInsurance: true,
    coveragePercentage: 70,
    description: '',
  });

  if (!isOpen) return null;

  const categories = Array.from(new Set(catalogItems.map((c) => c.category)));

  const filteredItems = catalogItems.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.barcode && i.barcode.includes(searchTerm));
    const matchesCat = filterCategory === 'ALL' || i.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenForm = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        barcode: item.barcode || '',
        name: item.name,
        category: item.category,
        type: item.type,
        price: item.price,
        unit: item.unit,
        isCoveredByInsurance: item.insuranceRule.isCovered,
        coveragePercentage: item.insuranceRule.coveragePercentage,
        description: item.description || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: `SRV-${Math.floor(100 + Math.random() * 900)}`,
        barcode: `626${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        name: '',
        category: 'خدمات پاراکلینیک',
        type: 'SERVICE',
        price: 150000,
        unit: 'خدمت',
        isCoveredByInsurance: true,
        coveragePercentage: 70,
        description: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingItem) {
      updateCatalogItem({
        ...editingItem,
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        type: formData.type,
        price: Number(formData.price),
        unit: formData.unit,
        insuranceRule: {
          isCovered: formData.isCoveredByInsurance,
          coveragePercentage: formData.isCoveredByInsurance ? Number(formData.coveragePercentage) : 0,
        },
        description: formData.description,
      });
    } else {
      addCatalogItem({
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        type: formData.type,
        price: Number(formData.price),
        unit: formData.unit,
        insuranceRule: {
          isCovered: formData.isCoveredByInsurance,
          coveragePercentage: formData.isCoveredByInsurance ? Number(formData.coveragePercentage) : 0,
        },
        taxPercentage: 0,
        status: 'ACTIVE',
        description: formData.description,
      });
    }

    setIsFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[4000] z-modal-backdrop bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="responsive-modal-container bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-main)] z-[4010] z-modal-dialog animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky-modal-header px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-500/20">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-50">
                کاتالوگ مرکز خدمات، تعرفه‌ها و قیمت‌ها
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مدیریت واحد خدمات بالینی، داروها، آزمایشات، گرافی‌ها و قوانین بیمه‌ای پایه
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {/* Top Actions & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو بر اساس نام، کد، بارکد..."
                  className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

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

            <button
              onClick={() => handleOpenForm()}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              تعریف خدمت / کالا جدید
            </button>
          </div>

          {/* Add / Edit Form Modal inside */}
          {isFormOpen && (
            <form onSubmit={handleSubmitForm} className="p-4 bg-sky-50/70 dark:bg-slate-800/90 border border-sky-200 dark:border-slate-700 rounded-2xl space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-sky-900 dark:text-sky-200">
                <span>{editingItem ? 'ویرایش خدمت / کالا' : 'افزودن خدمت / کالا جدید به کاتالوگ'}</span>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">کد خدمت / کالا</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">بارکد کالا</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">عنوان کامل خدمت / کالا</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مانند: ویزیت عمومی / نوار قلب..."
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">دسته‌بندی</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">تعرفه پایه (تومان)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">واحد سنجش</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="خدمت، نوبت، جعبه..."
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isCoveredByInsurance}
                    onChange={(e) => setFormData({ ...formData, isCoveredByInsurance: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  مشمول پوشش بیمه پایه
                </label>

                {formData.isCoveredByInsurance && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">درصد سهم بیمه:</span>
                    <input
                      type="number"
                      value={formData.coveragePercentage}
                      onChange={(e) => setFormData({ ...formData, coveragePercentage: Number(e.target.value) })}
                      className="w-16 px-2 py-1 text-center font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                    <span>٪</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow"
                >
                  ذخیره اطلاعات
                </button>
              </div>
            </form>
          )}

          {/* Catalog Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3">کد / بارکد</th>
                  <th className="py-3 px-3">عنوان خدمت / کالا</th>
                  <th className="py-3 px-3">دسته‌بندی</th>
                  <th className="py-3 px-3 text-center">تعرفه پایه</th>
                  <th className="py-3 px-3 text-center">پوشش بیمه</th>
                  <th className="py-3 px-3 text-center">وضعیت</th>
                  <th className="py-3 px-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                      <div>{item.code}</div>
                      {item.barcode && <div className="text-[10px] text-slate-400">{item.barcode}</div>}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.price.toLocaleString('fa-IR')} <span className="text-[10px] text-slate-400 font-normal">تومان</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.insuranceRule.isCovered ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                          پوشش {item.insuranceRule.coveragePercentage}٪
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                          آزاد (صفر٪)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-md">
                        فعال
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleOpenForm(item)}
                        className="p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};
