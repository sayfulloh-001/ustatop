import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { masterApi } from '../api/master.api';
import { MasterProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Phone, MapPin, Briefcase, Calendar,
  Star, ChevronLeft, MessageSquare, CheckCircle2,
} from 'lucide-react';

export const MasterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [master, setMaster] = useState<MasterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchMasterDetail(id);
  }, [id]);

  const fetchMasterDetail = async (masterId: string) => {
    try {
      setLoading(true);
      const res = await masterApi.getMasterById(masterId);
      setMaster(res.master);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Usta topilmadi.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Yuklanmoqda...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !master) {
    return (
      <div className="max-w-sm mx-auto mt-16 text-center space-y-4">
        <p className="text-gray-500 text-sm">{error || 'Usta topilmadi.'}</p>
        <button
          onClick={() => navigate('/masters')}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold"
        >
          Ustalar ro'yxatiga qaytish
        </button>
      </div>
    );
  }

  const telegramLink = `https://t.me/+${master.phone.replace(/\D/g, '')}`;

  return (
    <div className="max-w-lg mx-auto pb-20 space-y-3">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs font-bold hover:bg-gray-50 transition shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Orqaga
      </button>

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">

        {/* Avatar area */}
        <div className="flex flex-col items-center pt-8 pb-5 px-6 text-center">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-emerald-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm mb-4">
            {master.profileImageUrl ? (
              <img src={master.profileImageUrl} alt={master.firstName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-4xl text-emerald-600 dark:text-emerald-400">
                {master.firstName?.[0]}
              </div>
            )}
            <span className="absolute bottom-1.5 right-1.5 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>

          {/* Verified + Rating */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
              <CheckCircle2 className="w-3 h-3" />
              Tasdiqlangan usta
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {master.rating?.toFixed(1) || '5.0'} ({master.reviewCount || 0})
            </span>
          </div>

          {/* Name + Profession */}
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
            {master.firstName} {master.lastName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {master.profession}
          </p>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-center gap-5 py-4 border-t border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-600 dark:text-slate-300 px-6">
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            {master.experienceYears} yil tajriba
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-500" />
            {master.age} yosh
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-500" />
            {master.city}{master.district ? `, ${master.district}` : ''}
          </span>
        </div>

        {/* Action buttons */}
        <div className="p-5 space-y-3">
          <a
            href={`tel:${master.phone}`}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.99] transition"
          >
            <Phone className="w-5 h-5" />
            <span>Qo'ng'iroq qilish: {master.phone}</span>
          </a>

          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-sm border border-blue-200 dark:border-blue-800 active:scale-[0.99] transition"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Telegram orqali yozish</span>
          </a>
        </div>

        {/* Description */}
        {master.description && (
          <div className="px-5 pb-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Usta haqida
            </h3>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-slate-800/60 rounded-xl p-4 border border-gray-100 dark:border-slate-800">
              {master.description}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
