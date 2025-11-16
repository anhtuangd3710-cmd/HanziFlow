'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AudioPlayer from '@/components/AudioPlayer';
import { AppContext } from '@/context/AppContext';
import Spinner from '@/components/Spinner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    // If context is not ready yet, wait
    if (!context) return;
    
    // If user is not logged in, redirect to login
    if (!context.state.isHydrated) return; // Wait for hydration
    if (!context.state.user) {
      router.push('/login');
    }
  }, [context, router]);

  // Show loading spinner while checking auth
  if (!context || !context.state.isHydrated || !context.state.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-5 pb-10">
        {children}
      </main>
      <AudioPlayer />
    </>
  );
}
