import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../i18n';
import { Wrench, Sun, Moon, Globe, User as UserIcon, Shield, Search } from 'lucide-react';
import { AdminPassModal } from './AdminPassModal';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, openAuthModal } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const langs: { code: Language; label: string }[] = [
    { code: 'uz', label: "O'zbek" },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[62px] flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition">
              <Wrench className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </div>
            <span className="text-[18px] font-black tracking-tight text-gray-900 dark:text-white">
              Usta<span className="text-emerald-500">Top</span>
            </span>
          </Link>

          {/* Desktop search bar */}
          <div
            className="hidden md:flex flex-1 max-w-sm mx-4 items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 cursor-pointer hover:border-emerald-400 transition"
            onClick={() => navigate('/search')}
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 font-medium">Usta yoki xizmat...</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-slate-200 transition"
              >
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="uppercase">{language}</span>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg py-1 z-50" onClick={() => setIsLangOpen(false)}>
                  {langs.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition hover:bg-gray-50 dark:hover:bg-slate-800 ${language === l.code ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin */}
            {isAdmin ? (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            ) : (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="hidden sm:flex p-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 border border-gray-200 dark:border-slate-700 text-gray-400 hover:text-indigo-600 transition"
                title="Admin login"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            {/* User / Login */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName?.[0] || <UserIcon className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden sm:block text-xs font-bold text-gray-800 dark:text-slate-200">
                  {user?.firstName || user?.phone?.slice(-4)}
                </span>
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-95 transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t('profile.login', 'Kirish')}</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <AdminPassModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
    </>
  );
};
