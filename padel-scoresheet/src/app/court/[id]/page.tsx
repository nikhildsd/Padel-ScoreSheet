'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getSingleCourtData } from '@/lib/actions';
import CourtFullScreen from '@/components/CourtFullScreen';
import { CourtData } from '@/lib/db-simple';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CourtPage({ params }: PageProps) {
  const [courtData, setCourtData] = useState<CourtData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  const courtId = parseInt(params.id);

  // Fetch court data from server
  const fetchCourtData = async () => {
    try {
      if (isNaN(courtId) || courtId < 1 || courtId > 6) {
        setNotFoundError(true);
        setLoading(false);
        return;
      }

      const result = await getSingleCourtData(courtId);

      if (!result.success || !result.data) {
        setNotFoundError(true);
        setLoading(false);
        return;
      }

      setCourtData(result.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch court data:', error);
      setNotFoundError(true);
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCourtData();
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

  if (!courtData) {
    notFound();
  }

  return <CourtFullScreen courtData={courtData} />;
}