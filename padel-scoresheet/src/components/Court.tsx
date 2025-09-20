'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CourtData } from '@/lib/db-simple';
import {
  incrementScore,
  decrementScore,
  resetCourtScores
} from '@/lib/api-client';

interface CourtProps {
  courtData: CourtData;
}

export default function Court({ courtData }: CourtProps) {
  const { courtNumber, leftTeam, rightTeam, upcomingLeft, upcomingRight } = courtData;
  const [isUpdating, setIsUpdating] = useState(false);

  // No local state needed - team names are read-only on homepage

  // No team name editing logic needed - homepage is read-only

  const handleIncrementScore = async (side: 'left' | 'right') => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const result = await incrementScore(courtNumber, side);
      if (!result.success && result.error) {
        console.error('Failed to increment score:', result.error);
      }
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  const handleDecrementScore = async (side: 'left' | 'right') => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const result = await decrementScore(courtNumber, side);
      if (!result.success && result.error) {
        console.error('Failed to decrement score:', result.error);
      }
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  const handleResetScores = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const result = await resetCourtScores(courtNumber);
      if (!result.success && result.error) {
        console.error('Failed to reset scores:', result.error);
      }
    } finally {
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

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

        {/* Score Display and Controls */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {/* Left Team Score */}
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 border-2 shadow-md" style={{borderColor: '#04362d'}}>
            <div className="flex gap-1 mb-1">
              <button
                onClick={() => handleDecrementScore('left')}
                disabled={isUpdating}
                className={`w-5 h-5 text-white rounded-full transition-all text-xs flex items-center justify-center font-bold shadow-md transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 active:scale-90'}`}
              >
                −
              </button>
              <button
                onClick={() => handleIncrementScore('left')}
                disabled={isUpdating}
                className={`w-5 h-5 text-white rounded-full transition-all text-xs flex items-center justify-center font-bold shadow-md transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'active:scale-90'}`}
                style={{backgroundColor: isUpdating ? '#9CA3AF' : '#04362d'}}
              >
                +
              </button>
            </div>
            <div className="text-2xl font-bold min-w-[32px] text-center" style={{color: '#04362d'}}>
              {leftTeam.score}
            </div>
          </div>

          {/* Court Rectangle */}
          <div className="w-16 h-10 rounded-lg relative mx-1 shadow-lg border-2 border-white" style={{backgroundColor: '#04362d'}}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-white opacity-80"></div>
              <div className="absolute w-0.5 h-full bg-white opacity-80"></div>
            </div>
          </div>

          {/* Right Team Score */}
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 border-2 shadow-md" style={{borderColor: '#04362d'}}>
            <div className="flex gap-1 mb-1">
              <button
                onClick={() => handleDecrementScore('right')}
                disabled={isUpdating}
                className={`w-5 h-5 text-white rounded-full transition-all text-xs flex items-center justify-center font-bold shadow-md transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 active:scale-90'}`}
              >
                −
              </button>
              <button
                onClick={() => handleIncrementScore('right')}
                disabled={isUpdating}
                className={`w-5 h-5 text-white rounded-full transition-all text-xs flex items-center justify-center font-bold shadow-md transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'active:scale-90'}`}
                style={{backgroundColor: isUpdating ? '#9CA3AF' : '#04362d'}}
              >
                +
              </button>
            </div>
            <div className="text-2xl font-bold min-w-[32px] text-center" style={{color: '#04362d'}}>
              {rightTeam.score}
            </div>
          </div>
        </div>

        <button
          onClick={handleResetScores}
          disabled={isUpdating}
          className={`w-full px-2 py-1 text-white text-xs rounded-md transition-all font-bold tracking-wide uppercase shadow-md ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'transform active:scale-95'}`}
          style={{backgroundColor: isUpdating ? '#9CA3AF' : '#04362d'}}
        >
          {isUpdating ? 'Updating...' : 'Reset'}
        </button>
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