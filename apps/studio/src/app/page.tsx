'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      router.push('/library');
    } else if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      router.push('/library');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dopamine Orbs Studio</h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
