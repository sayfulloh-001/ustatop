import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../i18n';
import { StatusBadge } from '../components/StatusBadge';
import { AdminPassModal } from '../components/AdminPassModal';
import {
  User as UserIcon, Phone, Edit3, Globe, Moon, Sun,
  Shield, LogOut, ChevronRight, Award, Lock, Wrench,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const langs: { code: Language; label: string }[] = [
    { code: 'uz', label: "O'z" },
    { code: 'ru', label: 'Рус' },
    { code: 'en', label: 'En' },
  ];

  /* ── Not logged in ── */
  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center space-y-5 px-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center">
          <UserIcon className="w-9 h-9 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Tizimga kiring</h2>
          <p className="text-sm text-gray-400 mt-1">Profil ma'lumotlarini ko'rish uchun</p>
        </div>
        <button
          onClick={openAuthModal}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm transition shadow-md shadow-emerald-500/20"
        >
          Kirish / Ro'yxatdan o'tish
        </button>
      </div>
    );
  }

  const masterStatus = user?.masterProfile?.status;
  const initial = user?.firstName?.[0] || 'U';
  const fullName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'Foydalanuvchi';

  return (
    <div className="max-w-lg mx-auto space-y-3 pb-24">

      {/* ── User card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800">
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        <div className="p-5 flex items-center gap-4">
          {/* Gradient avatar */}
          <div className="relative w-[62px] h-[62px] flex-shrink-0">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl font-black text-white">{initial}</span>
              }
            </div>
            {isAdmin && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <Shield className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-white truncate">{fullName}</h2>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{user?.phone}</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-300 dark:text-slate-600">
                <Lock className="w-2.5 h-2.5" />
              </span>
            </div>
            {masterStatus && (
              <div className="mt-2"><StatusBadge status={masterStatus} /></div>
            )}
          </div>

          {/* Edit btn */}
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition flex-shrink-0"
          >
            <Edit3 className="w-[15px] h-[15px]" />
          </button>
        </div>
      </div>

      {/* ── Become Master ── */}
      <div
        onClick={() => navigate('/become-master')}
        className="relative overflow-hidden rounded-2xl cursor-pointer active:scale-[0.99] transition"
        style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
      >
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white/10 translate-y-1/2" />

        <div className="relative flex items-center justify-between gap-4 p-5">
          <div className="text-white space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-100 text-[11px] font-bold">
              <Award className="w-3.5 h-3.5" /> Ustalar uchun
            </div>
            <h3 className="text-sm font-extrabold leading-tight">
              {masterStatus === 'APPROVED'
                ? 'Siz tasdiqlangan ustasiz ✅'
                : masterStatus === 'PENDING'
                ? "Ariza ko'rib chiqilmoqda..."
                : "O'z xizmatlaringizni taklif qiling"}
            </h3>
            {!masterStatus && (
              <p className="text-xs text-emerald-100/80">Yangi mijozlar toping</p>
            )}
          </div>
          <button className="relative flex-shrink-0 px-4 py-2.5 rounded-xl bg-white text-emerald-700 font-extrabold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition whitespace-nowrap">
            {masterStatus ? "Ko'rish" : 'Ariza berish'}
          </button>
        </div>
      </div>

      {/* ── Settings group ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

        {/* === TIL === */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
              <Globe className="w-[15px] h-[15px] text-sky-500" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Til</span>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
            {langs.map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                  language === l.code
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* === TUNGI REJIM === */}
        <div
          onClick={toggleTheme}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isDark ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'bg-amber-50'
            }`}>
              {isDark
                ? <Moon className="w-[15px] h-[15px] text-indigo-400" />
                : <Sun className="w-[15px] h-[15px] text-amber-500" />
              }
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">Tungi rejim</p>
              <p className="text-[11px] text-gray-400">{isDark ? 'Yoqilgan' : "O'chirilgan"}</p>
            </div>
          </div>
          {/* Pill toggle */}
          <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* === ADMIN === */}
        <div
          onClick={() => isAdmin ? navigate('/admin') : setIsAdminModalOpen(true)}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
              <Shield className="w-[15px] h-[15px] text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">Admin paneli</p>
              <p className="text-[11px] text-gray-400">Mahsulotlar va ustalarni boshqarish</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
        </div>

        {/* === CHIQISH === */}
        <div
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-rose-50/60 dark:hover:bg-rose-950/20 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
            <LogOut className="w-[15px] h-[15px] text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 leading-none mb-0.5">Chiqish</p>
            <p className="text-[11px] text-rose-400/80">Tizimdan xavfsiz chiqish</p>
          </div>
        </div>
      </div>

      <AdminPassModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
    </div>
  );
};
