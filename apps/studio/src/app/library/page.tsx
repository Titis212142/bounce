'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Video {
  id: string;
  seed: number;
  filename: string;
  title: string;
  createdAt: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchVideos();
  }, [router]);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/videos?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dopamine-purple to-dopamine-pink bg-clip-text text-transparent">
            Video Library
          </h1>
          <div className="flex gap-4">
            <Link
              href="/generator"
              className="px-6 py-3 bg-dopamine-purple rounded-lg font-semibold hover:bg-dopamine-purple/80 transition"
            >
              Generate
            </Link>
            <Link
              href="/scheduler"
              className="px-6 py-3 bg-dopamine-cyan rounded-lg font-semibold hover:bg-dopamine-cyan/80 transition"
            >
              Scheduler
            </Link>
            <Link
              href="/analytics"
              className="px-6 py-3 bg-dopamine-green rounded-lg font-semibold hover:bg-dopamine-green/80 transition"
            >
              Analytics
            </Link>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-6">No videos yet</p>
            <Link
              href="/generator"
              className="px-8 py-4 bg-gradient-to-r from-dopamine-purple to-dopamine-pink rounded-lg font-semibold inline-block"
            >
              Generate Your First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-dopamine-purple transition"
              >
                <div className="aspect-[9/16] bg-gray-800 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Preview</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                <p className="text-gray-400 text-sm mb-4">Seed: {video.seed}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/scheduler?videoId=${video.id}`}
                    className="flex-1 px-4 py-2 bg-dopamine-purple rounded text-center text-sm hover:bg-dopamine-purple/80 transition"
                  >
                    Schedule
                  </Link>
                  <button className="flex-1 px-4 py-2 bg-dopamine-cyan rounded text-center text-sm hover:bg-dopamine-cyan/80 transition">
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
