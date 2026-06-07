import React, { useState, useEffect } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import { Plus, Edit2, Trash2 } from 'lucide-react';

function HiringManagement() {
  const [hiring, setHiring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHiring = async () => {
      try {
        const response = await contentAPI.get('/hiring');
        setHiring(response.data.data);
      } catch (error) {
        console.error('Error fetching hiring posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHiring();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Header title="Hiring Management" />
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus size={18} className="mr-2" /> New Job Post
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading hiring posts...</td></tr>
            ) : hiring.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No job posts found</td></tr>
            ) : hiring.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors mr-2">
                    <Edit2 size={18} />
                  </button>
                  <button className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HiringManagement;
