import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, ShoppingBag, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/masters', label: t('nav.masters', 'Ustalar'), icon: Users },
    { to: '/market', label: t('nav.market', 'Market'), icon: ShoppingBag },
    { to: '/profile', label: t('nav.profile', 'Profil'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex items-center justify-around h-[58px] max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-all duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-slate-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative p-1.5 rounded-xl transition ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/50' : ''}`}>
                    <Icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
