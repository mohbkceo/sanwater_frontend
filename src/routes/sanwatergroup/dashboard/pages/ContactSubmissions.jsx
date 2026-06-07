import React, { useState, useEffect } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import { Mail, CheckCircle, Archive } from 'lucide-react';

function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleStatusUpdate = async (id, status) => {
    try {
      await contentAPI.put(`/contact/submissions/${id}`, { status });
      setSubmissions(submissions.map(s => s._id === id ? { ...s, status } : s));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title="Contact Submissions" />
      <div className="grid gap-6">
        {loading ? (
          <p className="text-gray-500">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400">No submissions found.</p>
          </div>
        ) : submissions.map((sub) => (
          <div key={sub._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{sub.subject || 'No Subject'}</h3>
                  <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-700">{sub.name}</span> ({sub.email})</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusUpdate(sub._id, 'read')}
                  className={`p-2 rounded-lg transition-colors ${sub.status === 'read' ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  title="Mark as Read"
                >
                  <CheckCircle size={18} />
                </button>
                <button 
                  onClick={() => handleStatusUpdate(sub._id, 'archived')}
                  className={`p-2 rounded-lg transition-colors ${sub.status === 'archived' ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  title="Archive"
                >
                  <Archive size={18} />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{sub.message}</p>
            </div>
            <div className="mt-4 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Received on {new Date(sub.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactSubmissions;
