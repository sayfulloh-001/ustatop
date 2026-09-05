import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/user.api';
import { uploadApi } from '../api/upload.api';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, Camera, RefreshCw, Check, Lock } from 'lucide-react';

export const EditProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState<string>(user?.firstName || '');
  const [lastName, setLastName] = useState<string>(user?.lastName || '');
  const [age, setAge] = useState<number | string>(user?.age || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const res = await uploadApi.uploadImage(file, 'avatars');
      if (res.success && res.url) {
        setAvatarUrl(res.url);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rasm yuklashda xatolik yuz berdi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      await userApi.updateProfile({
        firstName: firstName || null,
        lastName: lastName || null,
        age: age ? Number(age) : null,
        avatarUrl: avatarUrl || null,
      });

      await refreshUser();
      setSuccess('Profil muvaffaqiyatli saqlandi!');
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Profilni saqlashda xatolik.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 text-xs font-bold transition shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('profile.cancel', 'Bekor qilish')}</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          {t('profile.editProfile', 'Profilni tahrirlash')}
        </h1>
        <div className="w-16" />
      </div>

      {/* Edit Form */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-emerald-100 dark:bg-slate-800 border-2 border-emerald-200 dark:border-slate-700 shadow-inner flex items-center justify-center group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-emerald-600">
                {firstName?.[0] || 'U'}
              </span>
            )}

            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">O'zgartirish</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {uploading && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Rasm yuklanmoqda...</span>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Read-Only Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t('profile.phone', 'Telefon raqam')}</span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> O'zgartirib bo'lmaydi
              </span>
            </label>
            <input
              type="text"
              disabled
              value={user?.phone || ''}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-sm font-semibold cursor-not-allowed"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              {t('profile.firstName', 'Ism')}
            </label>
            <input
              type="text"
              placeholder="Ismingizni kiriting..."
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              {t('profile.lastName', 'Familiya')}
            </label>
            <input
              type="text"
              placeholder="Familiyangizni kiriting..."
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              {t('profile.age', 'Yosh')}
            </label>
            <input
              type="number"
              min={14}
              max={100}
              placeholder="Masalan: 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <span>{t('profile.saveChanges', 'Saqlash')}</span>
          )}
        </button>
      </form>
    </div>
  );
};
