'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  seed: number;
}

export default function SchedulerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get('videoId');

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState(videoIdParam || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [mode, setMode] = useState<'upload_only' | 'direct_post'>('upload_only');
  const [scheduling, setScheduling] = useState(false);

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
        if (data.videos?.length > 0 && !selectedVideoId) {
          setSelectedVideoId(data.videos[0].id);
          setCaption(data.videos[0].title);
        }
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const handleSchedule = async () => {
    if (!selectedVideoId || !scheduledAt || !caption) {
      alert('Please fill all required fields');
      return;
    }

    setScheduling(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: selectedVideoId,
          scheduledAt,
          caption,
          hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
          mode,
        }),
      });

      if (response.ok) {
        router.push('/analytics');
      } else {
        alert('Failed to schedule post');
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      alert('Failed to schedule post');
    } finally {
      setScheduling(false);
    }
  };

  const handlePublishNow = async () => {
    if (!selectedVideoId || !caption) {
      alert('Please select a video and enter a caption');
      return;
    }

    setScheduling(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/publish-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: selectedVideoId,
          caption,
          hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
          mode,
        }),
      });

      if (response.ok) {
        router.push('/analytics');
      } else {
        alert('Failed to publish');
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/library" className="text-dopamine-cyan hover:underline mb-4 inline-block">
            ← Back to Library
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dopamine-purple to-dopamine-pink bg-clip-text text-transparent">
            Schedule Post
          </h1>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Select Video</label>
            <select
              value={selectedVideoId}
              onChange={(e) => {
                setSelectedVideoId(e.target.value);
                const video = videos.find(v => v.id === e.target.value);
                if (video) setCaption(video.title);
              }}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
            >
              <option value="">Select a video</option>
              {videos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.title} (Seed: {video.seed})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Hashtags (comma-separated)</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
              placeholder="#dopamine #satisfying #fyp"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Publish Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'upload_only' | 'direct_post')}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
            >
              <option value="upload_only">Upload Only (user finalizes in TikTok)</option>
              <option value="direct_post">Direct Post (automatic)</option>
            </select>
            {mode === 'upload_only' && (
              <p className="text-gray-400 text-sm mt-2">
                You'll need to finalize the post in TikTok app
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSchedule}
              disabled={scheduling || !scheduledAt}
              className="flex-1 px-8 py-4 bg-dopamine-purple rounded-lg font-semibold hover:bg-dopamine-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scheduling ? 'Scheduling...' : 'Schedule'}
            </button>
            <button
              onClick={handlePublishNow}
              disabled={scheduling}
              className="flex-1 px-8 py-4 bg-dopamine-pink rounded-lg font-semibold hover:bg-dopamine-pink/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scheduling ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
