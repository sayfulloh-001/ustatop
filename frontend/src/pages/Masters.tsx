import React, { useState, useEffect } from 'react';
import { masterApi } from '../api/master.api';
import { MasterProfile } from '../types';
import { MasterCard } from '../components/MasterCard';
import { CategoryChips } from '../components/CategoryChips';
import { MasterCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Masters: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [selectedCity, setSelectedCity] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApprovedMasters(); }, [selectedCategory, selectedCity, searchQuery]);

  const fetchApprovedMasters = async () => {
    try {
      setLoading(true);
      const res = await masterApi.getMasters({
        profession: selectedCategory !== 'Barchasi' ? selectedCategory : undefined,
        city: selectedCity !== 'Barchasi' ? selectedCity : undefined,
        query: searchQuery || undefined,
      });
      setMasters(res.masters || []);
    } catch { setMasters([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Ustalar</h1>
            <p className="text-xs text-gray-400 dark:text-slate-500">Barcha tasdiqlangan va ishonchli ustalar katalogi</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Usta yoki mutaxassislik..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm transition"
          />
        </div>
      </div>

      {/* Category Chips + city filter */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <MasterCardSkeleton key={i} />)}
        </div>
      ) : masters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {masters.map(m => <MasterCard key={m.id} master={m} />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-10 shadow-sm">
          <EmptyState
            icon={Users}
            title="Hozircha ustalar mavjud emas"
            description="Ushbu sohada tasdiqlangan ustalar topilmadi. Siz birinchi usta bo'lishingiz mumkin!"
            actionText="Usta bo'lish"
            onAction={() => navigate('/become-master')}
          />
        </div>
      )}
    </div>
  );
};

