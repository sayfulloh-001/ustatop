import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { masterApi } from '../api/master.api';
import { uploadApi } from '../api/upload.api';
import { paymentApi } from '../api/payment.api';
import { useLanguage } from '../contexts/LanguageContext';
import { StatusBadge } from '../components/StatusBadge';
import { CATEGORIES } from '../components/CategoryChips';
import { CITIES } from './Search';
import {
  Wrench, Camera, RefreshCw, CheckCircle2, Lock,
  ChevronLeft, AlertCircle, Clock, UserCheck,
} from 'lucide-react';

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition placeholder-gray-400';
const labelCls = 'block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5';

export const BecomeMaster: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('Elektrik');
  const [experienceYears, setExperienceYears] = useState<number | string>(1);
  const [age, setAge] = useState<number | string>(25);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Toshkent shahri');
  const [district, setDistrict] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Populate form from existing data
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setProfileImageUrl(user.avatarUrl || '');

      if (user.masterProfile) {
        const mp = user.masterProfile;
        setFirstName(mp.firstName);
        setLastName(mp.lastName);
        setProfession(mp.profession);
        setExperienceYears(mp.experienceYears);
        setAge(mp.age);
        setDescription(mp.description);
        setCity(mp.city);
        setDistrict(mp.district || '');
        setTelegramUsername((mp as any).telegramUsername || '');
        setProfileImageUrl(mp.profileImageUrl || user.avatarUrl || '');
        setApplicationStatus(mp.status);
      }
    }
  }, [user, isAuthenticated]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const res = await uploadApi.uploadImage(file, 'masters');
      if (res.success && res.url) setProfileImageUrl(res.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rasm yuklashda xatolik yuz berdi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Iltimos, ism va familiyangizni kiriting.');
      return;
    }
    if (!description.trim()) {
      setError("O'zingiz va xizmatlaringiz haqida ma'lumot kiriting.");
      return;
    }

    // ── To'lov tekshiruvi ──
    // Agar bu yangi profil bo'lsa — to'lov holatini tekshir
    if (!applicationStatus) {
      try {
        const payStatus = await paymentApi.getStatus();
        if (payStatus.required && !payStatus.paid) {
          // Payme to'lov qilinmagan — payment sahifasiga yo'naltir
          navigate('/payment');
          return;
        }
      } catch {
        // Agar tekshirib bo'lmasa — server o'zi tekshiradi
      }
    }

    try {
      setSubmitting(true);
      const res = await masterApi.applyForMaster({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profession,
        experienceYears: Number(experienceYears),
        age: Number(age),
        description: description.trim(),
        city,
        district: district.trim() || null,
        profileImageUrl: profileImageUrl || null,
      });

      await refreshUser();
      setApplicationStatus(res.masterProfile.status);
      setSuccess(true);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.message ||
        'Ariza yuborishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">

      {/* Back button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Usta bo'lish uchun ariza
        </h1>
      </div>

      {/* ── SUCCESS ── */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-emerald-800 dark:text-emerald-300 text-base">
              Tabriklaymiz! Ustalar ro'yxatiga qo'shildingiz ✅
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Profilingiz hoziroq ustalar ro'yxatida ko'rinmoqda. Boshqa foydalanuvchilar siz bilan bog'lana olishadi!
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
            >
              Profilga o'tish →
            </button>
          </div>
        </div>
      )}

      {/* ── Application status banner ── */}
      {applicationStatus && !success && (
        <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
          applicationStatus === 'APPROVED'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : applicationStatus === 'PENDING'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
        }`}>
          {applicationStatus === 'APPROVED' ? (
            <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : applicationStatus === 'PENDING' ? (
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <div>
            <StatusBadge status={applicationStatus} />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {applicationStatus === 'PENDING'
                ? "Arizangiz admin tomonidan ko'rib chiqilmoqda."
                : applicationStatus === 'APPROVED'
                ? "Profilingiz tasdiqlangan va ustalar ro'yxatida ko'rinmoqda."
                : "Arizangiz rad etilgan. Ma'lumotlarni qayta to'ldirib topshirishingiz mumkin."}
            </p>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5"
      >
        {/* Form title */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 w-[18px] h-[18px]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Usta ma'lumotlari</h2>
            <p className="text-[11px] text-gray-400">Mijozlar ko'radigan ma'lumotlaringizni kiriting</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          </div>
        )}

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center group cursor-pointer">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Camera className="w-7 h-7 mx-auto text-gray-300 mb-1" />
                <span className="text-[10px] text-gray-400 font-semibold">Rasm</span>
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition rounded-2xl">
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">O'zgartirish</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          {uploading && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Rasm yuklanmoqda...
            </div>
          )}
          <p className="text-[11px] text-gray-400">Profil rasmingizni yuklang</p>
        </div>

        {/* Read-only phone */}
        <div>
          <label className={labelCls}>
            Telefon raqam
            <span className="ml-2 text-[10px] font-normal text-gray-400 inline-flex items-center gap-1">
              <Lock className="w-3 h-3" /> Akkauntdan olingan (o'zgarmas)
            </span>
          </label>
          <input
            type="text"
            disabled
            value={user?.phone || ''}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 text-gray-500 text-sm font-bold cursor-not-allowed"
          />
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Ismingiz *</label>
            <input
              type="text"
              required
              placeholder="Safulloh"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Familiyangiz *</label>
            <input
              type="text"
              required
              placeholder="Zokirov"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Profession */}
        <div>
          <label className={labelCls}>Kasb / Mutaxassislik *</label>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.filter((c) => c.id !== 'Barchasi').map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Experience + Age row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Tajriba (yil) *</label>
            <input
              type="number"
              min={0}
              max={60}
              required
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Yoshingiz *</label>
            <input
              type="number"
              min={18}
              max={100}
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className={labelCls}>Shahar / Viloyat *</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputCls}
          >
            {CITIES.filter((c) => c !== 'Barchasi').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className={labelCls}>Tuman (ixtiyoriy)</label>
          <input
            type="text"
            placeholder="Masalan: Chilonzor tumani"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>
            O'zingiz va xizmatlaringiz haqida *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Qanday xizmatlar ko'rsatasiz, qanday tajribangiz bor, mijozlarga qanday kafolat berasiz..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls + ' resize-none'}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2.5"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Serverga yuborilmoqda...</span>
            </>
          ) : (
            <span>
              {applicationStatus ? 'Arizani yangilash' : 'Arizani yuborish'} →
            </span>
          )}
        </button>

        {/* Info note */}
        <p className="text-[11px] text-center text-gray-400">
          Ma'lumotlaringiz to'liq va to'g'ri bo'lsa, ustalar ro'yxatida ko'rinasiz.
        </p>
      </form>
    </div>
  );
};
