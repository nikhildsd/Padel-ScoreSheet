import { notFound } from 'next/navigation';
import { getSingleCourtData } from '@/lib/actions';
import CourtFullScreen from '@/components/CourtFullScreen';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CourtPage({ params }: PageProps) {
  const courtId = parseInt(params.id);
  
  if (isNaN(courtId) || courtId < 1 || courtId > 6) {
    notFound();
  }

  const result = await getSingleCourtData(courtId);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return <CourtFullScreen courtData={result.data} />;
}