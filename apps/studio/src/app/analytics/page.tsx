'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  video: { title: string; seed: number };
  scheduledAt: string;
  status: string;
  mode: string;
  error?: string;
}

interface Job {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  error?: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const [postsRes, jobsRes] = await Promise.all([
        fetch(`${apiUrl}/api/posts?token=${token}`),
        fetch(`${apiUrl}/api/jobs?token=${token}`),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'completed':
        return 'text-dopamine-green';
      case 'failed':
        return 'text-red-500';
      case 'action_required':
        return 'text-dopamine-yellow';
      case 'processing':
      case 'uploading':
        return 'text-dopamine-cyan';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/library" className="text-dopamine-cyan hover:underline mb-4 inline-block">
            ← Back to Library
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dopamine-purple to-dopamine-pink bg-clip-text text-transparent">
            Analytics & Status
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Scheduled Posts</h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              {posts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No posts scheduled</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{post.video.title}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(post.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold ${getStatusColor(post.status)}`}>
                          {post.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      {post.error && (
                        <p className="text-sm text-red-500 mt-2">Error: {post.error}</p>
                      )}
                      {post.status === 'action_required' && (
                        <p className="text-sm text-dopamine-yellow mt-2">
                          ⚠️ Action required: Check TikTok app to finalize
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Jobs</h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              {jobs.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No jobs</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{job.type}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold ${getStatusColor(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                      {job.error && (
                        <p className="text-sm text-red-500 mt-2">Error: {job.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
