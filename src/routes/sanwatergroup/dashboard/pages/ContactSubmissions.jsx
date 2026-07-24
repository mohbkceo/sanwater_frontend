import React, { useState, useEffect, useMemo } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import { Mail, CheckCircle, Archive, Trash2, Square, CheckSquare } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/configs/permissions';

function ContactSubmissions() {
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.SUBMISSIONS.MANAGE);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await contentAPI.get('/contact/submissions');
        setSubmissions(response.data.data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const allSelected = useMemo(
    () => submissions.length > 0 && selectedIds.length === submissions.length,
    [selectedIds, submissions]
  );

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : submissions.map((s) => s._id));
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await contentAPI.put(`/contact/submissions/${id}`, { status });
      setSubmissions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status } : s))
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteOne = async (id) => {
    const ok = window.confirm('Delete this submission?');
    if (!ok) return;

    try {
      await contentAPI.delete(`/contact/submissions/${id}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(`Delete ${selectedIds.length} selected submissions?`);
    if (!ok) return;

    try {
      await contentAPI.delete('/contact/submissions', {
        data: { ids: selectedIds },
      });

      setSubmissions((prev) => prev.filter((s) => !selectedIds.includes(s._id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting selected submissions:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title="Contact Submissions" />

      {canManage && submissions.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
            {allSelected ? 'Unselect all' : 'Select all'}
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete selected ({selectedIds.length})
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          <p className="text-gray-500">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400">No submissions found.</p>
          </div>
        ) : (
          submissions.map((sub) => {
            const isSelected = selectedIds.includes(sub._id);

            return (
              <div
                key={sub._id}
                className={`bg-white p-6 rounded-xl shadow-sm border transition-colors ${
                  isSelected ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex gap-4 items-start">
                    {canManage && (
                      <button
                        onClick={() => toggleSelectOne(sub._id)}
                        className="mt-1 text-gray-500 hover:text-gray-900"
                        title={isSelected ? 'Unselect' : 'Select'}
                      >
                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    )}

                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <Mail size={20} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {sub.subject || 'No Subject'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        From: <span className="font-medium text-gray-700">{sub.name}</span> ({sub.email})
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => handleStatusUpdate(sub._id, 'read')}
                      disabled={!canManage}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        sub.status === 'read'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                      title={!canManage ? 'You do not have permission' : 'Mark as Read'}
                    >
                      <CheckCircle size={18} />
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(sub._id, 'archived')}
                      disabled={!canManage}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        sub.status === 'archived'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                      title={!canManage ? 'You do not have permission' : 'Archive'}
                    >
                      <Archive size={18} />
                    </button>

                    <button
                      onClick={() => handleDeleteOne(sub._id)}
                      disabled={!canManage}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={!canManage ? 'You do not have permission' : 'Delete'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {sub.message}
                  </p>
                </div>

                <div className="mt-4 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Received on {new Date(sub.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ContactSubmissions;