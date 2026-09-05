import React from 'react';
import { MasterStatus } from '../types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatusBadgeProps {
  status: MasterStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useLanguage();

  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  switch (status) {
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 ${sizeClasses}`}
        >
          <CheckCircle2 className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{t('profile.statusApproved', 'Tasdiqlangan')}</span>
        </span>
      );
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 ${sizeClasses}`}
        >
          <Clock className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{t('profile.statusPending', 'Ko\'rib chiqilmoqda')}</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 ${sizeClasses}`}
        >
          <XCircle className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{t('profile.statusRejected', 'Rad etildi')}</span>
        </span>
      );
    default:
      return null;
  }
};
