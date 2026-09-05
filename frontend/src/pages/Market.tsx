import React, { useState, useEffect } from 'react';
import { productApi } from '../api/product.api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ShoppingBag, Search, X, SlidersHorizontal, Check } from 'lucide-react';

export const PRODUCT_CATEGORIES = [
  'Barchasi',
  'Asbob-uskunalar',
  'Qurilish mollari',
  'Elektr jihozlari',
  'Santexnika',
  "Bo'yoqlar va laklar",
  'Mebel furniturasi',
  'Boshqa',
];

export const Market: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(delay);
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getProducts({
        category: selectedCategory !== 'Barchasi' ? selectedCategory : undefined,
        query: searchQuery.trim() || undefined,
      });
      setProducts(res.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const hasFilter = searchQuery || selectedCategory !== 'Barchasi';
  const activeLabel = selectedCategory !== 'Barchasi' ? selectedCategory : null;

  return (
    <div className="space-y-4 pb-20">

      {/* Search bar + filter button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mahsulot nomi bo'yicha qidiring..."
            className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-sm ${
            activeLabel
              ? 'bg-indigo-500 text-white shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:border-indigo-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeLabel ? activeLabel : 'Filtr'}
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">
          {loading ? 'Qidirilmoqda...' : `${products.length} ta mahsulot`}
        </p>
        {hasFilter && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('Barchasi'); }}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition"
          >
            <X className="w-3.5 h-3.5" />
            Tozalash
          </button>
        )}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-10 shadow-sm">
          <EmptyState
            icon={ShoppingBag}
            title="Hozircha mahsulotlar mavjud emas"
            description="Tez orada yangi mahsulotlar admin tomonidan qo'shiladi."
          />
        </div>
      )}

      {/* Filter bottom sheet */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle + header */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-10 h-1 rounded-full bg-gray-200 dark:bg-slate-700" />
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-2">Kategoriya</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_CATEGORIES.map(cat => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                      active
                        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {active && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setSelectedCategory('Barchasi'); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition"
              >
                Tozalash
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-extrabold shadow-sm shadow-indigo-500/20 transition"
              >
                Qo'llash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
