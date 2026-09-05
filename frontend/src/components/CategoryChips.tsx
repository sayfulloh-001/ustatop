import React, { useState } from 'react';
import {
  Zap, Droplets, Wind, Armchair, Hammer,
  Flame, Paintbrush, Smartphone, Car, Wrench, LayoutGrid,
  SlidersHorizontal, MapPin, X, Check,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'Barchasi', name: 'Barchasi', icon: LayoutGrid },
  { id: 'Elektrik', name: 'Elektrik', icon: Zap },
  { id: 'Santexnik', name: 'Santexnik', icon: Droplets },
  { id: 'Konditsioner ustasi', name: 'Konditsioner', icon: Wind },
  { id: 'Mebel ustasi', name: 'Mebel ustasi', icon: Armchair },
  { id: 'Qurilish ustasi', name: 'Qurilish ustasi', icon: Hammer },
  { id: 'Payvandchi', name: 'Payvandchi', icon: Flame },
  { id: "Bo'yoqchi", name: "Bo'yoqchi", icon: Paintbrush },
  { id: 'Telefon ustasi', name: 'Telefon ustasi', icon: Smartphone },
  { id: 'Avtoservis', name: 'Avtoservis', icon: Car },
  { id: 'Boshqa', name: 'Boshqa', icon: Wrench },
];

export const CITIES = [
  'Barchasi',
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand',
  "Farg'ona",
  'Andijon',
  'Namangan',
  'Buxoro',
  'Qashqadaryo',
  'Surxondaryo',
  'Xorazm',
  'Navoiy',
  'Jizzax',
  'Sirdaryo',
  "Qoraqalpog'iston",
];

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
}) => {
  const [open, setOpen] = useState(false);

  const activeCount = [
    selectedCategory !== 'Barchasi',
    selectedCity && selectedCity !== 'Barchasi',
  ].filter(Boolean).length;

  const activeLabel =
    selectedCategory !== 'Barchasi'
      ? CATEGORIES.find(c => c.id === selectedCategory)?.name
      : selectedCity && selectedCity !== 'Barchasi'
      ? selectedCity
      : null;

  return (
    <>
      {/* Filter trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
          activeCount > 0
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:border-emerald-300'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        {activeLabel ? activeLabel : 'Filtr'}
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-white/30 text-white text-[11px] font-black flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Bottom sheet backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
          onClick={() => setOpen(false)}
        >
          {/* Sheet */}
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-5 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle + header */}
            <div className="flex items-center justify-between">
              <div className="absolute left-1/2 -translate-x-1/2 top-3 w-10 h-1 rounded-full bg-gray-200 dark:bg-slate-700" />
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-2">Filtr</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category section */}
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">
                Qanday usta kerak?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-emerald-500'}`} />
                      <span className="truncate">{cat.name}</span>
                      {active && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City section */}
            {onSelectCity && (
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">
                  Shahar / Viloyat
                </p>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={e => onSelectCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition appearance-none"
                  >
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  onSelectCategory('Barchasi');
                  onSelectCity?.('Barchasi');
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition"
              >
                Tozalash
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold shadow-sm shadow-emerald-500/20 transition"
              >
                Qo'llash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
