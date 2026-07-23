import React, { useEffect, useState } from 'react';
import { userAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import { PERMISSIONS, ROLES } from '@/configs/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield, Trash2, Loader2, RefreshCw, KeyRound, X, Lock } from 'lucide-react';

// Permission groups displayed in the permission editor modal
const PERMISSION_GROUPS = [
  {
    label: 'Analytics',
    permissions: [
      { value: PERMISSIONS.ANALYTICS.VIEW, label: 'View analytics' },
      { value: PERMISSIONS.ANALYTICS.MANAGE, label: 'Manage analytics' },
    ],
  },
  {
    label: 'Products',
    permissions: [
      { value: PERMISSIONS.PRODUCTS.VIEW, label: 'View products' },
      { value: PERMISSIONS.PRODUCTS.MANAGE, label: 'Manage products' },
    ],
  },
  {
    label: 'Orders',
    permissions: [
      { value: PERMISSIONS.ORDERS.VIEW, label: 'View orders' },
      { value: PERMISSIONS.ORDERS.MANAGE, label: 'Manage orders' },
    ],
  },
  {
    label: 'Hiring',
    permissions: [
      { value: PERMISSIONS.HIRING.VIEW, label: 'View hiring' },
      { value: PERMISSIONS.HIRING.MANAGE, label: 'Manage hiring' },
    ],
  },
  {
    label: 'Submissions',
    permissions: [
      { value: PERMISSIONS.SUBMISSIONS.VIEW, label: 'View submissions' },
      { value: PERMISSIONS.SUBMISSIONS.MANAGE, label: 'Manage submissions' },
    ],
  },
  {
    label: 'Content Management',
    permissions: [
      { value: PERMISSIONS.CONTENT.VIEW, label: 'View content' },
      { value: PERMISSIONS.CONTENT.MANAGE, label: 'Manage content' },
    ],
  },
  {
    label: 'Activity Logs',
    permissions: [
      { value: PERMISSIONS.LOGS.VIEW, label: 'View activity logs' },
    ],
  },
  {
    label: 'User Management',
    permissions: [
      { value: PERMISSIONS.USERS.VIEW, label: 'View users' },
      { value: PERMISSIONS.USERS.CREATE, label: 'Create users' },
      { value: PERMISSIONS.USERS.DELETE, label: 'Delete users' },
      { value: PERMISSIONS.USERS.MANAGE_PERMISSIONS, label: 'Manage user permissions' },
    ],
  },
];

function PermissionEditorModal({ user, onClose, onSave, saving }) {
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
            <span>Permissions — {user.fullName || user.email}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.label} className="border border-gray-100 rounded-lg p-4">
              <div className="font-semibold text-sm text-gray-700 mb-3">{group.label}</div>
              <div className="flex flex-col gap-2">
                {group.permissions.map((perm) => (
                  <label key={perm.value} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(perm.value)}
                      onChange={() => togglePermission(perm.value)}
                      className="rounded border-gray-300"
                    />
                    {perm.label}
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
            Cancel
          </button>
          <button
            onClick={() => onSave(selected)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save permissions
          </button>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
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
      alert(error?.response?.data?.message || 'Failed to fetch users');
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
      alert(error?.response?.data?.message || 'Failed to update permissions.');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleDeleteUser = async (userId, fullName) => {
    const confirmed = window.confirm(
      `Delete ${fullName || 'this user'}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(userId);

      await userAPI.delete(`/${userId}`);

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title="User & Permission Management" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Shield size={18} />
            <span>Users</span>
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
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No users found.
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
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            Admin
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {isSuperAdmin ? (
                          <span className="text-purple-700 font-medium">All permissions (immutable)</span>
                        ) : (
                          <span>{(user.permissions || []).length} permission(s)</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            disabled={isSuperAdmin || isDeleting || !canManagePermissions}
                            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={
                              isSuperAdmin
                                ? 'Super admin permissions are immutable'
                                : !canManagePermissions
                                  ? 'You do not have permission'
                                  : 'Edit permissions'
                            }
                          >
                            <KeyRound size={18} />
                            <span>Permissions</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user._id, user.fullName)}
                            disabled={isSuperAdmin || isDeleting || !canDelete}
                            className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={
                              isSuperAdmin
                                ? 'Super admin can never be deleted'
                                : !canDelete
                                  ? 'You do not have permission'
                                  : 'Delete user'
                            }
                          >
                            {isDeleting ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                            <span>Delete</span>
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
