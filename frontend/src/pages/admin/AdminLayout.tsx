import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  UserCheck,
  ChevronLeft,
  Shield,
  LogOut,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Ruxsat berilmagan
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Ushbu sahifaga kirish uchun sizda Admin huquqi bo'lishi kerak.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const navLinks = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/masters', label: 'Usta arizalari', icon: UserCheck },
    { to: '/admin/products', label: 'Mahsulotlar', icon: ShoppingBag },
    { to: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Admin Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                UstaTop Admin Boshqaruvi
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Admin: {user?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Ilovaga qaytish</span>
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition"
            title="Chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar border-b border-gray-200 dark:border-slate-800 pb-3">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Admin Child Outlet */}
      <Outlet />
    </div>
  );
};
