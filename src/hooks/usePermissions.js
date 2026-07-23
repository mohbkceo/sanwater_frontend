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
  let permissions = [];
  try {
    permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    if (!Array.isArray(permissions)) permissions = [];
  } catch {
    permissions = [];
  }
  return { role, permissions };
}

export function setCachedAuth({ role, permissions }) {
  if (role !== undefined) localStorage.setItem('role', role);
  if (permissions !== undefined) localStorage.setItem('permissions', JSON.stringify(permissions || []));
}

export function hasPermission({ role, permissions }, required) {
  if (role === ROLES.SUPER_ADMIN) return true;
  if (!required) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  const userPermissions = permissions || [];
  return requiredList.some((p) => userPermissions.includes(p));
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
          const fresh = { role: info.role, permissions: info.permissions || [] };
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
    permissions: auth.permissions,
    isSuperAdmin: auth.role === ROLES.SUPER_ADMIN,
    can,
    loading,
  };
}
