import Court from '@/components/Court';
import Image from 'next/image';
import { getCourtData } from '@/lib/actions';

export default async function Home() {
  const courts = await getCourtData();
  return (
    <div className="h-screen w-screen overflow-hidden p-2" style={{backgroundColor: '#04362d'}}>
      <div className="h-full flex flex-col">
        <div className="text-center py-2 mb-2 flex-shrink-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white">
              <Image 
                src="/brand-logo.jpg" 
                alt="Brand Logo" 
                width={32} 
                height={32} 
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-light text-white drop-shadow-lg tracking-[0.2em] uppercase">
              Padel Score Tracker
            </h1>
          </div>
          <div className="w-16 h-0.5 bg-white mx-auto rounded-full opacity-70"></div>
        </div>
        
        <div className="flex-1 grid grid-cols-3 gap-2 h-0">
          {courts.map((courtData) => (
            <Court key={courtData.courtNumber} courtData={courtData} />
          ))}
        </div>
      </div>
    </div>
  );
}
