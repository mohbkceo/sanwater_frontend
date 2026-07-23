import { usePermissions } from '@/hooks/usePermissions';
import NoPermission from './NoPermission';

/**
 * Route/page-level permission guard.
 *
 * Usage:
 *   <PermissionGuard permission={PERMISSIONS.PRODUCTS.VIEW}>
 *     <ProductsListPage />
 *   </PermissionGuard>
 *
 * - If the user lacks the required view permission, the exact
 *   "You do not have permission" page is rendered instead.
 * - `permission` may be a single permission string or an array
 *   (any one of them grants access).
 * - Super admins always pass.
 */
export default function PermissionGuard({ permission, children }) {
  const { can, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!can(permission)) {
    return <NoPermission />;
  }

  return children;
}
