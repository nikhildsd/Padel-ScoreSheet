'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CourtData } from '@/lib/db-simple';

interface CourtProps {
  courtData: CourtData;
}

export default function Court({ courtData }: CourtProps) {
  const { courtNumber, leftTeam, rightTeam, upcomingLeft, upcomingRight } = courtData;
  const [leftScoreChanged, setLeftScoreChanged] = useState(false);
  const [rightScoreChanged, setRightScoreChanged] = useState(false);
  const [prevLeftScore, setPrevLeftScore] = useState(leftTeam.score);
  const [prevRightScore, setPrevRightScore] = useState(rightTeam.score);

  // Detect score changes and trigger animations
  useEffect(() => {
    if (leftTeam.score !== prevLeftScore) {
      setLeftScoreChanged(true);
      setPrevLeftScore(leftTeam.score);
      setTimeout(() => setLeftScoreChanged(false), 1000);
    }
  }, [leftTeam.score, prevLeftScore]);

  useEffect(() => {
    if (rightTeam.score !== prevRightScore) {
      setRightScoreChanged(true);
      setPrevRightScore(rightTeam.score);
      setTimeout(() => setRightScoreChanged(false), 1000);
    }
  }, [rightTeam.score, prevRightScore]);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-2 border hover:shadow-3xl transition-all duration-300 border-white h-full flex flex-col overflow-hidden relative">
      <div className="text-center py-1 px-2 rounded-lg mb-2 text-white shadow-lg flex-shrink-0 relative" style={{backgroundColor: '#04362d'}}>
        <Link 
          href={`/court/${courtNumber}`}
          className="block hover:opacity-80 transition-opacity"
          title={`Open Court ${courtNumber} in full screen`}
        >
          <h2 className="text-xs font-medium tracking-wider uppercase">Court {courtNumber}</h2>
          <div className="text-xs opacity-75 mt-1">🔍 Click to open</div>
        </Link>
      </div>
      
      {/* Current Game */}
      <div className="mb-2 flex-1 flex flex-col justify-between">        
        {/* Team Names - Read Only */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex-1 px-2 py-1 text-xs border-2 rounded-md text-center font-bold bg-gray-100 truncate cursor-not-allowed"
               style={{borderColor: '#04362d', color: '#04362d'}}
               title="Edit team names in individual court page">
            {leftTeam.name}
          </div>
          <span className="text-xs font-bold px-1" style={{color: '#04362d'}}>VS</span>
          <div className="flex-1 px-2 py-1 text-xs border-2 rounded-md text-center font-bold bg-gray-100 truncate cursor-not-allowed"
               style={{borderColor: '#04362d', color: '#04362d'}}
               title="Edit team names in individual court page">
            {rightTeam.name}
          </div>
        </div>

        {/* Score Display Only */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Left Team Score */}
          <div className={`flex flex-col items-center bg-gray-50 rounded-xl p-6 border-3 shadow-xl transition-all duration-500 ${leftScoreChanged ? 'scale-110 bg-green-100 shadow-2xl' : ''}`} style={{borderColor: leftScoreChanged ? '#10b981' : '#04362d'}}>
            <div className={`text-6xl font-bold min-w-[64px] text-center transition-all duration-500 ${leftScoreChanged ? 'animate-bounce' : ''}`} style={{color: leftScoreChanged ? '#10b981' : '#04362d'}}>
              {leftTeam.score}
            </div>
          </div>

          {/* Court Rectangle */}
          <div className="w-24 h-16 rounded-xl relative mx-3 shadow-xl border-3 border-white" style={{backgroundColor: '#04362d'}}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-white opacity-80"></div>
              <div className="absolute w-1 h-full bg-white opacity-80"></div>
            </div>
          </div>

          {/* Right Team Score */}
          <div className={`flex flex-col items-center bg-gray-50 rounded-xl p-6 border-3 shadow-xl transition-all duration-500 ${rightScoreChanged ? 'scale-110 bg-green-100 shadow-2xl' : ''}`} style={{borderColor: rightScoreChanged ? '#10b981' : '#04362d'}}>
            <div className={`text-6xl font-bold min-w-[64px] text-center transition-all duration-500 ${rightScoreChanged ? 'animate-bounce' : ''}`} style={{color: rightScoreChanged ? '#10b981' : '#04362d'}}>
              {rightTeam.score}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Game */}
      <div className="pt-2 border-t flex-shrink-0" style={{borderColor: '#04362d'}}>
        <div className="text-xs font-bold mb-1 text-center tracking-wide uppercase" style={{color: '#04362d'}}>Next</div>
        <div className="flex items-center gap-1">
          <div className="flex-1 px-2 py-1 border rounded-md text-center text-xs bg-gray-100 truncate font-bold cursor-not-allowed"
               style={{borderColor: '#04362d', color: '#04362d'}}
               title="Edit upcoming teams in individual court page">
            {upcomingLeft || 'Next A'}
          </div>
          <span className="text-xs font-bold" style={{color: '#04362d'}}>v</span>
          <div className="flex-1 px-2 py-1 border rounded-md text-center text-xs bg-gray-100 truncate font-bold cursor-not-allowed"
               style={{borderColor: '#04362d', color: '#04362d'}}
               title="Edit upcoming teams in individual court page">
            {upcomingRight || 'Next B'}
          </div>
        </div>
      </div>
    </div>
  );
}