import { useState, useEffect, useCallback } from 'react';
import { ROLES } from '@/configs/permissions';
import { getSecurityInfo } from '@/services/user/userServices';

/**
 * Reads the current user's role and permissions.
 *
 * Strategy:
 *  - Uses localStorage as a fast synchronous cache (set at login).
 *  - Refreshes from the backend (`/user/security/me`) on mount so the UI
 *    always converges to the server-side truth. Backend endpoints enforce
 *    permissions regardless of what the frontend renders.
 */
export function getCachedAuth() {
  const role = localStorage.getItem('role') || null;
  const persona = localStorage.getItem('persona') || 'general_admin';
  let permissions = [];
  try {
    permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    if (!Array.isArray(permissions)) permissions = [];
  } catch {
    permissions = [];
  }
  return { role, persona, permissions };
}

export function setCachedAuth({ role, persona, permissions }) {
  if (role !== undefined) localStorage.setItem('role', role);
  if (permissions !== undefined) localStorage.setItem('permissions', JSON.stringify(permissions || []));
  if (persona !== undefined) localStorage.setItem('persona', persona || 'general_admin');
}

export function hasPermission({ role, permissions }, required) {
  if (role === ROLES.SUPER_ADMIN) return true;
  if (!required) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  const userPermissions = permissions || [];
  const legacyReadFallback = import.meta.env.VITE_ANALYTICS_LEGACY_READ_FALLBACK !== 'false';
  return requiredList.some((p) => userPermissions.includes(p) || (legacyReadFallback && /^analytics\.(?:overview|marketing|products|sales|hiring|content)\.view$/.test(p) && userPermissions.includes('analytics.view')));
}

export function usePermissions() {
  const [auth, setAuth] = useState(() => getCachedAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSecurityInfo();
        const info = res?.data || res?.result || res;
        if (mounted && info && info.role) {
          const fresh = { role: info.role, persona: info.persona || 'general_admin', permissions: info.permissions || [] };
          setCachedAuth(fresh);
          setAuth(fresh);
        }
      } catch {
        // Keep cached values; backend still enforces all permissions.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const can = useCallback((required) => hasPermission(auth, required), [auth]);

  return {
    role: auth.role,
    persona: auth.persona,
    permissions: auth.permissions,
    isSuperAdmin: auth.role === ROLES.SUPER_ADMIN,
    can,
    loading,
  };
}
