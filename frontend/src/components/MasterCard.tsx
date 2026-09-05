import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterProfile } from '../types';
import { MapPin, Briefcase, ChevronRight, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MasterCardProps {
  master: MasterProfile;
}

export const MasterCard: React.FC<MasterCardProps> = ({ master }) => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    navigate(`/masters/${master.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-emerald-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex-shrink-0">
          {master.profileImageUrl ? (
            <img
              src={master.profileImageUrl}
              alt={master.firstName}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-600 font-black text-xl">
              {master.firstName?.[0] || 'U'}
            </div>
          )}
          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
            {master.firstName} {master.lastName}
          </h4>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
            {master.profession}
          </span>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-emerald-500" />
              {master.experienceYears} yil
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="truncate max-w-[100px]">{master.city}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {master.description && (
        <p className="mt-3 text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {master.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
        {isAuthenticated ? (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/masters/${master.id}`); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition active:scale-95"
          >
            Profilni ko'rish
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); openAuthModal(); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition active:scale-95 border border-gray-200 dark:border-slate-700"
          >
            <LogIn className="w-3.5 h-3.5" />
            Kirish kerak
          </button>
        )}
      </div>
    </div>
  );
};
