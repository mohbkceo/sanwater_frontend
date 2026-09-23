import { useTranslation } from "@/lib/i18n";
import React, { useEffect, useState } from 'react';
import { userAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import { PERMISSIONS, ROLES } from '@/configs/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield, Trash2, Loader2, RefreshCw, KeyRound, X, Lock } from 'lucide-react';

// Permission groups displayed in the permission editor modal
const PERMISSION_GROUPS = [
  {
    labelKey: 'admin.users.permission_group_analytics',
    permissions: [
      { value: PERMISSIONS.ANALYTICS.VIEW, labelKey: 'admin.users.permission_view_analytics' },
      { value: PERMISSIONS.ANALYTICS.MANAGE, labelKey: 'admin.users.permission_manage_analytics' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_products',
    permissions: [
      { value: PERMISSIONS.PRODUCTS.VIEW, labelKey: 'admin.users.permission_view_products' },
      { value: PERMISSIONS.PRODUCTS.MANAGE, labelKey: 'admin.users.permission_manage_products' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_quotations',
    permissions: [
      { value: PERMISSIONS.QUOTATIONS.VIEW, labelKey: 'admin.users.permission_view_quotations' },
      { value: PERMISSIONS.QUOTATIONS.MANAGE, labelKey: 'admin.users.permission_manage_quotations' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_hiring',
    permissions: [
      { value: PERMISSIONS.HIRING.VIEW, labelKey: 'admin.users.permission_view_hiring' },
      { value: PERMISSIONS.HIRING.MANAGE, labelKey: 'admin.users.permission_manage_hiring' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_submissions',
    permissions: [
      { value: PERMISSIONS.SUBMISSIONS.VIEW, labelKey: 'admin.users.permission_view_submissions' },
      { value: PERMISSIONS.SUBMISSIONS.MANAGE, labelKey: 'admin.users.permission_manage_submissions' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_content',
    permissions: [
      { value: PERMISSIONS.CONTENT.VIEW, labelKey: 'admin.users.permission_view_content' },
      { value: PERMISSIONS.CONTENT.MANAGE, labelKey: 'admin.users.permission_manage_content' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_leads',
    permissions: [
      { value: PERMISSIONS.LEADS.VIEW, labelKey: 'admin.users.permission_view_leads' },
      { value: PERMISSIONS.LEADS.MANAGE, labelKey: 'admin.users.permission_manage_leads' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_activity',
    permissions: [
      { value: PERMISSIONS.LOGS.VIEW, labelKey: 'admin.users.permission_view_activity' },
    ],
  },
  {
    labelKey: 'admin.users.permission_group_users',
    permissions: [
      { value: PERMISSIONS.USERS.VIEW, labelKey: 'admin.users.permission_view_users' },
      { value: PERMISSIONS.USERS.CREATE, labelKey: 'admin.users.permission_create_users' },
      { value: PERMISSIONS.USERS.DELETE, labelKey: 'admin.users.permission_delete_users' },
      { value: PERMISSIONS.USERS.MANAGE_PERMISSIONS, labelKey: 'admin.users.permission_manage_user_permissions' },
    ],
  },
];

function PermissionEditorModal({ user, onClose, onSave, saving }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(user.permissions || []);

  const togglePermission = (perm) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2 font-medium text-gray-800">
            <KeyRound size={18} />
            <span>{t("admin.users.permissions")} {user.fullName || user.email}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.labelKey} className="border border-gray-100 rounded-lg p-4">
              <div className="font-semibold text-sm text-gray-700 mb-3">{t(group.labelKey)}</div>
              <div className="flex flex-col gap-2">
                {group.permissions.map((perm) => (
                  <label key={perm.value} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(perm.value)}
                      onChange={() => togglePermission(perm.value)}
                      className="rounded border-gray-300"
                    />
                    {t(perm.labelKey)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            {t("admin.users.cancel")}
          </button>
          <button
            onClick={() => onSave(selected)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {t("admin.users.save_permissions")}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const canDelete = can(PERMISSIONS.USERS.DELETE);
  const canManagePermissions = can(PERMISSIONS.USERS.MANAGE_PERMISSIONS);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const response = await userAPI.get('/');
      setUsers(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(error?.response?.data?.message || t("admin.users.failed_to_fetch_users"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSavePermissions = async (permissions) => {
    if (!editingUser) return;
    try {
      setSavingPermissions(true);
      await userAPI.put(`/${editingUser._id}/permissions`, { permissions });
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? { ...u, permissions } : u))
      );
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert(error?.response?.data?.message || t("admin.users.failed_to_update_permissions"));
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleDeleteUser = async (userId, fullName) => {
    const confirmed = window.confirm(
      `Delete ${fullName || t("admin.users.this_user")}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(userId);

      await userAPI.delete(`/${userId}`);

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error?.response?.data?.message || t("admin.users.failed_to_delete_user"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title={t("admin.users.user_permission_management")} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Shield size={18} />
            <span>{t("admin.users.users")}</span>
          </div>

          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {t("admin.users.refresh")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("admin.users.name")}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("admin.users.email")}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("admin.users.role")}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("admin.users.permissions_column")}
                </th>
                <th className="px-6 py-4 text-end text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("admin.users.actions")}
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {t("admin.users.loading_users")}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {t("admin.users.no_users_found")}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isDeleting = deletingId === user._id;
                  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {user.fullName || '-'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            <Lock size={12} />
                            {t("admin.users.super_admin")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {t("admin.users.admin")}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {isSuperAdmin ? (
                          <span className="text-purple-700 font-medium">{t("admin.users.all_permissions_immutable")}</span>
                        ) : (
                          <span>{(user.permissions || []).length} {t("admin.users.permission_s")}</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            disabled={isSuperAdmin || isDeleting || !canManagePermissions}
                            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={
                              isSuperAdmin
                                ? t("admin.users.super_admin_permissions_immutable")
                                : !canManagePermissions
                                  ? t("admin.common.permission_denied")
                                  : t("admin.users.edit_permissions")
                            }
                          >
                            <KeyRound size={18} />
                            <span>{t("admin.users.permissions_column")}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user._id, user.fullName)}
                            disabled={isSuperAdmin || isDeleting || !canDelete}
                            className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={
                              isSuperAdmin
                                ? t("admin.users.super_admin_cannot_be_deleted")
                                : !canDelete
                                  ? t("admin.common.permission_denied")
                                  : t("admin.users.delete_user")
                            }
                          >
                            {isDeleting ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                            <span>{t("admin.users.delete")}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <PermissionEditorModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSavePermissions}
          saving={savingPermissions}
        />
      )}
    </div>
  );
}

export default UserManagement;
