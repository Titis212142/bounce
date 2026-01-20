'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/library');
    }
  }, [router]);

  const handleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/auth/tiktok`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <div className="text-center p-8 bg-black/50 rounded-2xl backdrop-blur-lg border border-white/10">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-dopamine-purple via-dopamine-cyan to-dopamine-pink bg-clip-text text-transparent">
          Dopamine Orbs Studio
        </h1>
        <p className="text-gray-300 mb-8 text-lg">
          Generate and publish satisfying TikTok videos automatically
        </p>
        <button
          onClick={handleLogin}
          className="px-8 py-4 bg-gradient-to-r from-dopamine-purple to-dopamine-pink rounded-lg font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-dopamine-purple/50"
        >
          Login with TikTok
        </button>
        <p className="text-gray-400 text-sm mt-6">
          Connect your TikTok account to get started
        </p>
      </div>
    </div>
  );
}
