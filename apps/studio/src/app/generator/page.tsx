'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GeneratorPage() {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [theme, setTheme] = useState('default');
  const [intensity, setIntensity] = useState(0.5);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          count,
          theme,
          intensity,
        }),
      });

      if (response.ok) {
        router.push('/library');
      } else {
        alert('Failed to generate videos');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate videos');
    } finally {
      setGenerating(false);
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
            Generate Videos
          </h1>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Number of Videos</label>
              <input
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
              >
                <option value="default">Default</option>
                <option value="neon">Neon</option>
                <option value="pastel">Pastel</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Intensity: {intensity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full px-8 py-4 bg-gradient-to-r from-dopamine-purple to-dopamine-pink rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : `Generate ${count} Video${count > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
