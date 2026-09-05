import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { paymentApi, PaymentStatus } from '../api/payment.api';
import { CreditCard, CheckCircle2, RefreshCw, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  // Payme callback'dan qaytganda — to'lov holatini tekshir
  const fromCallback = searchParams.get('from') === 'payme';

  const fetchStatus = async () => {
    try {
      setChecking(true);
      const data = await paymentApi.getStatus();
      setStatus(data);

      // To'langan bo'lsa — ariza sahifasiga qayt
      if (data.paid) {
        setTimeout(() => navigate('/become-master'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "To'lov holatini tekshirib bo'lmadi.");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    fetchStatus();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-16 flex flex-col items-center gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-gray-500 dark:text-slate-400 text-sm">Tekshirilmoqda...</p>
      </div>
    );
  }

  // To'lov talab qilinmasa — ariza sahifasiga yo'naltir
  if (status && !status.required) {
    navigate('/become-master', { replace: true });
    return null;
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {/* Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Usta bo'lish — To'lov
        </h1>
      </div>

      {/* To'langan holat */}
      {status?.paid && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="font-extrabold text-emerald-800 dark:text-emerald-300 text-base">
            To'lov muvaffaqiyatli! ✅
          </h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Ariza sahifasiga yo'naltirilmoqda...
          </p>
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
        </div>
      )}

      {/* To'lov kerak */}
      {status && !status.paid && (
        <>
          {/* Info karta */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Icon + sarlavha */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Ro'yxatdan o'tish to'lovi
                </h2>
                <p className="text-[11px] text-gray-400">Payme orqali xavfsiz to'lov</p>
              </div>
            </div>

            {/* Miqdor */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 dark:bg-slate-800">
              <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">To'lov miqdori:</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {status.payment?.amount?.toLocaleString('uz-UZ')} so'm
              </span>
            </div>

            {/* Nima uchun */}
            <ul className="space-y-2 text-xs text-gray-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                Ustalar ro'yxatida doimiy ko'rinish
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                Mijozlar bilan to'g'ridan-to'g'ri bog'lanish
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                Profil va baholash tizimi
              </li>
            </ul>

            {/* Xato */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
              </div>
            )}

            {/* Payme tugmasi */}
            {status.paymeUrl ? (
              <a
                href={status.paymeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-[#00AAEE] hover:bg-[#0099DD] text-white font-extrabold text-sm shadow-md shadow-blue-400/20 active:scale-[0.99] transition"
              >
                <CreditCard className="w-4 h-4" />
                Payme orqali to'lash
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            ) : (
              <div className="text-center text-xs text-gray-400 py-2">
                To'lov tizimi hozir mavjud emas.
              </div>
            )}

            {/* To'ladim tugmasi */}
            <button
              onClick={fetchStatus}
              disabled={checking}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              {checking ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              To'lovni tekshirish
            </button>
          </div>

          {/* Qaytish */}
          <button
            onClick={() => navigate('/become-master')}
            className="text-xs text-gray-400 hover:text-gray-600 transition w-full text-center"
          >
            ← Ariza sahifasiga qaytish
          </button>
        </>
      )}
    </div>
  );
};
