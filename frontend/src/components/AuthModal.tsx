import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Phone, KeyRound, ArrowRight, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, requestOtp, verifyOtp, devOtpPreview } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('PHONE');
      setPhoneNumber('');
      setOtpCode('');
      setErrorMessage('');
      setResendTimer(0);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Format display phone: +998 (90) 123-45-67
  const formatPhoneInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    let clean = raw;
    if (clean.startsWith('998')) {
      clean = clean.slice(3);
    }
    clean = clean.slice(0, 9);
    setPhoneNumber(clean);
  };

  const fullPhone = `+998${phoneNumber}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (phoneNumber.length !== 9) {
      setErrorMessage('Telefon raqamini to\'liq kiriting (9 ta raqam).');
      return;
    }

    try {
      setLoading(true);
      await requestOtp(fullPhone);
      setStep('OTP');
      setResendTimer(60);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'SMS yuborishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpCode.length !== 6) {
      setErrorMessage('Kodni to\'liq 6 xonali qilib kiriting.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(fullPhone, otpCode);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Tasdiqlash kodi noto\'g\'ri.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      setErrorMessage('');
      await requestOtp(fullPhone);
      setResendTimer(60);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Qayta yuborishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner">
            {step === 'PHONE' ? <Phone className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {step === 'PHONE' ? t('auth.modalTitle', 'Tizimga kirish') : t('auth.enterCode', 'SMS kodni kiriting')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {step === 'PHONE'
              ? t('auth.enterPhone', 'Telefon raqamingizni kiriting')
              : `${t('auth.codeSentTo', 'Kod quyidagi raqamga yuborildi:')} ${fullPhone}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Dev OTP Helper Indicator */}
        {devOtpPreview && (
          <div
            onClick={() => setOtpCode(devOtpPreview)}
            className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100 transition"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>
                {t('auth.devCodeHelper', 'Dev OTP:')} <strong className="font-mono text-sm">{devOtpPreview}</strong>
              </span>
            </div>
            <span className="text-[11px] underline font-semibold">Kodni qo'yish</span>
          </div>
        )}

        {/* Step 1: Phone Form */}
        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {t('profile.phone', 'Telefon raqam')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-semibold text-gray-500 dark:text-slate-400 text-base">
                  +998
                </span>
                <input
                  type="tel"
                  autoFocus
                  placeholder="90 123 45 67"
                  value={phoneNumber}
                  onChange={(e) => formatPhoneInput(e.target.value)}
                  className="w-full pl-16 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 9}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t('auth.sendCode', 'SMS kod yuborish')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-mono font-bold text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <span>{t('auth.verify', 'Tasdiqlash va kirish')}</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold"
              >
                {t('auth.changePhone', 'Raqamni o\'zgartirish')}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || loading}
                className="text-emerald-600 dark:text-emerald-400 font-semibold disabled:text-gray-400"
              >
                {resendTimer > 0 ? `${resendTimer} soniya` : t('auth.resend', 'Qayta yuborish')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
