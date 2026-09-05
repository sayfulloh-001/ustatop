import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { DashboardStats } from '../../types';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  ShoppingBag,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboardStats();
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Kutilayotgan arizalar',
      value: stats?.pendingMasters || 0,
      icon: Clock,
      color: 'bg-amber-500 text-white',
      badge: stats?.pendingMasters ? 'Ko\'rib chiqish kutilmoqda' : 'Hammasi ko\'rilgan',
      action: () => navigate('/admin/masters?status=PENDING'),
      highlight: (stats?.pendingMasters || 0) > 0,
    },
    {
      title: 'Tasdiqlangan ustalar',
      value: stats?.approvedMasters || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500 text-white',
      badge: 'Faol ustalar',
      action: () => navigate('/admin/masters?status=APPROVED'),
    },
    {
      title: 'Jami foydalanuvchilar',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500 text-white',
      badge: 'Ro\'yxatdan o\'tganlar',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Jami mahsulotlar',
      value: stats?.totalProducts || 0,
      icon: ShoppingBag,
      color: 'bg-indigo-500 text-white',
      badge: 'Market mollari',
      action: () => navigate('/admin/products'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pending Alert Banner */}
      {(stats?.pendingMasters || 0) > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {stats?.pendingMasters} ta yangi usta arizasi tasdiqlashni kutmoqda!
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Ustalar o'z profillarini e'lon qilishlari uchun arizalarni tekshiring.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/masters?status=PENDING')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 flex-shrink-0"
          >
            <span>Ko'rish</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                card.highlight
                  ? 'border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/20'
                  : 'border-gray-100 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  {card.badge}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-medium block">
                  {card.title}
                </span>
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  {card.value}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Boshqarish</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
