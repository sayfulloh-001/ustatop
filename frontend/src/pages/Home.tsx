import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterApi } from '../api/master.api';
import { MasterProfile } from '../types';
import { MasterCard } from '../components/MasterCard';
import { CategoryChips } from '../components/CategoryChips';
import { MasterCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, X } from 'lucide-react';

const CITIES = [
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

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [selectedCity, setSelectedCity] = useState('Barchasi');
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => fetchMasters(), 300);
    return () => clearTimeout(delay);
  }, [searchQuery, selectedCategory, selectedCity]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const res = await masterApi.getMasters({
        query: searchQuery || undefined,
        profession: selectedCategory !== 'Barchasi' ? selectedCategory : undefined,
        city: selectedCity !== 'Barchasi' ? selectedCity : undefined,
      });
      setMasters(res.masters || []);
    } catch {
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  const hasFilter = searchQuery || selectedCategory !== 'Barchasi' || selectedCity !== 'Barchasi';

  const clearAll = () => {
    setSearchQuery('');
    setSelectedCategory('Barchasi');
    setSelectedCity('Barchasi');
  };

  return (
    <div className="space-y-4 pb-20">

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Usta ismi yoki kasb bo'yicha qidiring..."
          className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category chips + city filter */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {hasFilter && (
        <div className="flex justify-end">
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-500 text-xs font-bold hover:bg-rose-100 transition"
          >
            <X className="w-3.5 h-3.5" />
            Tozalash
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 px-0.5">
        {loading ? 'Qidirilmoqda...' : `${masters.length} ta usta topildi`}
      </p>

      {/* Masters list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <MasterCardSkeleton key={i} />)}
        </div>
      ) : masters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {masters.map((master) => (
            <MasterCard key={master.id} master={master} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-10 shadow-sm">
          <EmptyState
            icon={Search}
            title="Hozircha ustalar mavjud emas"
            description="Boshqa kalit so'z yoki kategoriya bilan qidirib ko'ring."
            actionText="Hammasini ko'rsatish"
            onAction={clearAll}
          />
        </div>
      )}
    </div>
  );
};


