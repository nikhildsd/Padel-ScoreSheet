'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getCourtData } from '@/lib/api-client';
import CourtFullScreen from '@/components/CourtFullScreen';
import { CourtData } from '@/lib/db-simple';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CourtPage({ params }: PageProps) {
  const [allCourts, setAllCourts] = useState<CourtData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  const courtId = parseInt(params.id);

  // Validate court ID
  if (isNaN(courtId) || courtId < 1 || courtId > 6) {
    notFound();
  }

  // Fetch ALL court data from server (same as homepage)
  const refreshAllCourtData = async () => {
    try {
      const data = await getCourtData();
      setAllCourts(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch court data:', error);
      setNotFoundError(true);
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    refreshAllCourtData();
  }, []);

  // Set up real-time subscription to Supabase
  useEffect(() => {
    const channel = supabase
      .channel('courts_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'courts'
        },
        () => {
          // Refresh data when any change occurs
          refreshAllCourtData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (notFoundError) {
    notFound();
  }

  if (loading) {
    return (
      <div className="h-screen w-screen overflow-hidden p-2 flex items-center justify-center" style={{backgroundColor: '#04362d'}}>
        <div className="text-white text-xl">Loading court {courtId}...</div>
      </div>
    );
  }

  // Find the specific court data from all courts
  const courtData = allCourts.find(court => court.courtNumber === courtId);

  if (!courtData) {
    notFound();
  }

  return <CourtFullScreen courtData={courtData} />;
}