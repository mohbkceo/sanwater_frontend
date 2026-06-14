import React, { useEffect, useState } from 'react';
import { userAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import { Shield, Trash2, Loader2, RefreshCw } from 'lucide-react';

const ROLES = [
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRoleChange = async (userId, newRole) => {
    const previousUsers = [...users];

    try {
      setUpdatingRoleId(userId);

      await userAPI.put(`/${userId}/role`, { role: newRole });

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error('Error updating role:', error);
      alert(
        error?.response?.data?.message ||
          'Failed to update role. Only Super Admin can change roles.'
      );
      setUsers(previousUsers);
    } finally {
      setUpdatingRoleId(null);
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
      alert(
        error?.response?.data?.message ||
          'Failed to delete user. Only Super Admin can delete users.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title="User & Role Management" />

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
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isDeleting = deletingId === user._id;
                  const isUpdating = updatingRoleId === user._id;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {user.fullName || '-'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          disabled={isUpdating || isDeleting}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none transition-all disabled:opacity-60"
                        >
                          {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user._id, user.fullName)}
                          disabled={isDeleting || isUpdating}
                          className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                          title="Delete user"
                        >
                          {isDeleting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;