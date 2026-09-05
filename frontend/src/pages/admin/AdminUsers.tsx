import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { User } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Users, Trash2, Shield, UserCheck, AlertTriangle, X } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setConfirmId(user.id);
    setConfirmName(`${user.firstName || ''} ${user.lastName || user.phone}`.trim());
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    try {
      setDeletingId(confirmId);
      await adminApi.deleteUser(confirmId);
      setUsers(prev => prev.filter(u => u.id !== confirmId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const masterCount = users.filter(u => u.masterProfile).length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  return (
    <div className="space-y-5">
      {/* Header + stats */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Foydalanuvchilar</h2>
          <p className="text-xs text-gray-400 mt-0.5">Tizimda ro'yxatdan o'tgan barcha foydalanuvchilar</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
            <p className="text-xl font-black text-blue-600 dark:text-blue-400">{users.length}</p>
            <p className="text-[10px] font-semibold text-blue-400">Jami</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{masterCount}</p>
            <p className="text-[10px] font-semibold text-emerald-400">Ustalar</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{adminCount}</p>
            <p className="text-[10px] font-semibold text-indigo-400">Admin</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Foydalanuvchi</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Roli</th>
                  <th className="p-4">Usta holati</th>
                  <th className="p-4">Sana</th>
                  <th className="p-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            u.firstName?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {u.firstName || 'Foydalanuvchi'} {u.lastName || ''}
                          </p>
                          {u.role === 'ADMIN' && (
                            <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                          {u.masterProfile && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                              <UserCheck className="w-3 h-3" /> Usta
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap">
                      {u.phone}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Foydalanuvchi'}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.masterProfile ? (
                        <StatusBadge status={u.masterProfile.status} size="sm" />
                      ) : (
                        <span className="text-gray-400 text-[11px]">Oddiy mijoz</span>
                      )}
                    </td>

                    <td className="p-4 text-gray-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                    </td>

                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteClick(u)}
                          disabled={deletingId === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition active:scale-95 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          O'chirish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <EmptyState
            icon={Users}
            title="Foydalanuvchilar topilmadi"
            description="Tizimda hali foydalanuvchilar mavjud emas."
          />
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <button onClick={() => setConfirmId(null)} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Foydalanuvchini o'chirasizmi?</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                <span className="font-bold text-gray-800 dark:text-white">{confirmName}</span> hisobi va barcha ma'lumotlari butunlay o'chib ketadi. Bu amalni qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={!!deletingId}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-extrabold transition disabled:opacity-60"
              >
                {deletingId ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
