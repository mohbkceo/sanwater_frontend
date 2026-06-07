import React, { useState, useEffect } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import MainLayout from '@/layouts/MainLayout';

function HiringPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await contentAPI.get('/hiring?status=published');
        setJobs(response.data.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <MainLayout>
      <div className="py-20 px-6 max-w-6xl mx-auto min-h-[60vh]">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-slate-900">Join Our Team</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            At SanWater, we're always looking for passionate individuals to help us build the future of water management.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading opportunities...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-white/30 shadow-sm">
            <p className="text-slate-500">No open positions at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/50 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
                    <div className="flex gap-4 text-sm font-medium text-slate-500 mt-2">
                      <span className="flex items-center gap-1">📍 {job.location}</span>
                      <span className="flex items-center gap-1">💼 {job.type}</span>
                    </div>
                  </div>
                  <button className="bg-turquoise-600 text-white px-8 py-3 rounded-full font-bold hover:bg-turquoise-700 transition-colors self-start md:self-center shadow-lg shadow-turquoise-200">
                    Apply Now
                  </button>
                </div>
                <div className="prose max-w-none text-slate-700">
                  <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default HiringPage;
