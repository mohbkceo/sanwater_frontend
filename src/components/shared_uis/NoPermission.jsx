import { ShieldOff } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

/**
 * Rendered whenever the current user lacks the view permission
 * required for a dashboard page.
 */
export default function NoPermission() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <ShieldOff className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800">{t('admin.common.permission_denied')}</h1>
    </div>
  );
}
