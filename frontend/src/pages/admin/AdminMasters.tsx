import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { MasterProfile } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import {
  UserCheck,
  Check,
  X,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const AdminMasters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<MasterProfile | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getMasterApplications(statusFilter !== 'ALL' ? statusFilter : undefined);
      setMasters(res.masters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await adminApi.approveMaster(id);
      setMessage({ text: 'Usta muvaffaqiyatli tasdiqlandi!', type: 'success' });
      // Update local state
      setMasters((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'APPROVED' } : m))
      );
      if (selectedMaster?.id === id) {
        setSelectedMaster((prev: any) => ({ ...prev, status: 'APPROVED' }));
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Xatolik yuz berdi.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await adminApi.rejectMaster(id);
      setMessage({ text: 'Usta arizasi rad etildi.', type: 'success' });
      setMasters((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'REJECTED' } : m))
      );
      if (selectedMaster?.id === id) {
        setSelectedMaster((prev: any) => ({ ...prev, status: 'REJECTED' }));
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Xatolik yuz berdi.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'Barchasi' },
    { id: 'PENDING', label: 'Kutilayotganlar' },
    { id: 'APPROVED', label: 'Tasdiqlanganlar' },
    { id: 'REJECTED', label: 'Rad etilganlar' },
  ];

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setSearchParams({ status: tab.id });
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-sm ${
              statusFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Masters List Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : masters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masters.map((master) => (
            <div
              key={master.id}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-lg text-emerald-600">
                      {master.profileImageUrl ? (
                        <img
                          src={master.profileImageUrl}
                          alt={master.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        master.firstName[0]
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {master.firstName} {master.lastName}
                      </h4>
                      <span className="text-xs font-semibold text-emerald-600">
                        {master.profession}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={master.status} size="sm" />
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-400 py-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{master.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    <span>{master.experienceYears} yil tajriba • {master.age} yosh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{master.city}{master.district ? `, ${master.district}` : ''}</span>
                  </div>
                </div>

                {master.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-xl mt-2">
                    {master.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setSelectedMaster(master)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 transition"
                  title="To'liq ko'rish"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {master.status !== 'APPROVED' && (
                  <button
                    disabled={actionLoading === master.id}
                    onClick={() => handleApprove(master.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition"
                  >
                    {actionLoading === master.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Qabul qilish</span>
                      </>
                    )}
                  </button>
                )}

                {master.status !== 'REJECTED' && (
                  <button
                    disabled={actionLoading === master.id}
                    onClick={() => handleReject(master.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rad etish</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <EmptyState
            icon={UserCheck}
            title="Arizalar topilmadi"
            description="Tanlangan holat bo'yicha usta arizalari mavjud emas."
          />
        </div>
      )}

      {/* Master Detail Modal */}
      {selectedMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedMaster(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-100 flex-shrink-0 flex items-center justify-center font-bold text-2xl text-emerald-600">
                {selectedMaster.profileImageUrl ? (
                  <img
                    src={selectedMaster.profileImageUrl}
                    alt={selectedMaster.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedMaster.firstName[0]
                )}
              </div>
              <div className="space-y-1">
                <StatusBadge status={selectedMaster.status} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedMaster.firstName} {selectedMaster.lastName}
                </h3>
                <span className="text-sm font-semibold text-emerald-600">
                  {selectedMaster.profession}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl">
              <div>
                <span className="text-gray-400 block font-semibold">Telefon:</span>
                <span className="text-gray-900 dark:text-white font-bold">{selectedMaster.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Tajriba:</span>
                <span className="text-gray-900 dark:text-white font-bold">{selectedMaster.experienceYears} yil</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Yosh:</span>
                <span className="text-gray-900 dark:text-white font-bold">{selectedMaster.age} yosh</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Manzil:</span>
                <span className="text-gray-900 dark:text-white font-bold">
                  {selectedMaster.city}{selectedMaster.district ? `, ${selectedMaster.district}` : ''}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase text-gray-400">O'zi haqida:</h4>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                {selectedMaster.description}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => {
                  handleApprove(selectedMaster.id);
                  setSelectedMaster(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Arizani qabul qilish</span>
              </button>

              <button
                onClick={() => {
                  handleReject(selectedMaster.id);
                  setSelectedMaster(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Rad etish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
