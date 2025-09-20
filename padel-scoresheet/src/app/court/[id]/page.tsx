'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getCourtData } from '@/lib/api-client';
import CourtFullScreenNew from '@/components/CourtFullScreenNew';
import { CourtData } from '@/lib/db-simple';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourtPage({ params }: PageProps) {
  const resolvedParams = await params;
  const courtId = parseInt(resolvedParams.id);

  // Validate court ID
  if (isNaN(courtId) || courtId < 1 || courtId > 6) {
    notFound();
  }

  return <CourtPageClient courtId={courtId} />;
}

function CourtPageClient({ courtId }: { courtId: number }) {
  const [allCourts, setAllCourts] = useState<CourtData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

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

  // DISABLED - Real-time subscription disabled to reduce API calls
  useEffect(() => {
    console.log('COURT PAGE: Real-time subscription DISABLED for court', courtId);
    // No subscription - static data only
  }, [courtId]);

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

  return <CourtFullScreenNew courtData={courtData} />;
}