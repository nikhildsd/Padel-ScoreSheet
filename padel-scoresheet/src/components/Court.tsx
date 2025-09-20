'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CourtData } from '@/lib/db-simple';
import {
  incrementScore,
  decrementScore,
  resetCourtScores,
  updateTeamName,
  updateUpcomingTeam
} from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';

interface CourtProps {
  courtData: CourtData;
}

export default function Court({ courtData }: CourtProps) {
  const { courtNumber, leftTeam, rightTeam, upcomingLeft, upcomingRight } = courtData;

  // Local state for inputs to provide immediate feedback
  const [leftTeamName, setLeftTeamName] = useState(leftTeam.name);
  const [rightTeamName, setRightTeamName] = useState(rightTeam.name);
  const [upcomingLeftName, setUpcomingLeftName] = useState(upcomingLeft);
  const [upcomingRightName, setUpcomingRightName] = useState(upcomingRight);

  // Debounced values - only trigger server updates after user stops typing
  const debouncedLeftTeamName = useDebounce(leftTeamName, 800);
  const debouncedRightTeamName = useDebounce(rightTeamName, 800);
  const debouncedUpcomingLeft = useDebounce(upcomingLeftName, 800);
  const debouncedUpcomingRight = useDebounce(upcomingRightName, 800);

  // Define callback functions first
  const handleTeamNameChange = useCallback(async (side: 'left' | 'right', name: string) => {
    const result = await updateTeamName(courtNumber, side, name);
    if (!result.success && result.error) {
      console.error('Failed to update team name:', result.error);
      // You could show a toast notification here
    }
  }, [courtNumber]);

  const handleUpcomingTeamChange = useCallback(async (side: 'left' | 'right', name: string) => {
    const result = await updateUpcomingTeam(courtNumber, side, name);
    if (!result.success && result.error) {
      console.error('Failed to update upcoming team:', result.error);
      // You could show a toast notification here
    }
  }, [courtNumber]);

  // Update server when debounced values change
  useEffect(() => {
    if (debouncedLeftTeamName !== leftTeam.name) {
      handleTeamNameChange('left', debouncedLeftTeamName);
    }
  }, [debouncedLeftTeamName, leftTeam.name, handleTeamNameChange]);

  useEffect(() => {
    if (debouncedRightTeamName !== rightTeam.name) {
      handleTeamNameChange('right', debouncedRightTeamName);
    }
  }, [debouncedRightTeamName, rightTeam.name, handleTeamNameChange]);

  useEffect(() => {
    if (debouncedUpcomingLeft !== upcomingLeft) {
      handleUpcomingTeamChange('left', debouncedUpcomingLeft);
    }
  }, [debouncedUpcomingLeft, upcomingLeft, handleUpcomingTeamChange]);

  useEffect(() => {
    if (debouncedUpcomingRight !== upcomingRight) {
      handleUpcomingTeamChange('right', debouncedUpcomingRight);
    }
  }, [debouncedUpcomingRight, upcomingRight, handleUpcomingTeamChange]);

  // Update local state when props change (from server updates)
  useEffect(() => {
    setLeftTeamName(leftTeam.name);
    setRightTeamName(rightTeam.name);
    setUpcomingLeftName(upcomingLeft);
    setUpcomingRightName(upcomingRight);
  }, [leftTeam.name, rightTeam.name, upcomingLeft, upcomingRight]);

  const handleIncrementScore = async (side: 'left' | 'right') => {
    const result = await incrementScore(courtNumber, side);
    if (!result.success && result.error) {
      console.error('Failed to increment score:', result.error);
    }
  };

  const handleDecrementScore = async (side: 'left' | 'right') => {
    const result = await decrementScore(courtNumber, side);
    if (!result.success && result.error) {
      console.error('Failed to decrement score:', result.error);
    }
  };

  const handleResetScores = async () => {
    const result = await resetCourtScores(courtNumber);
    if (!result.success && result.error) {
      console.error('Failed to reset scores:', result.error);
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
        {/* Team Name Inputs */}
        <div className="flex items-center gap-1 mb-2">
          <input
            type="text"
            value={leftTeamName}
            onChange={(e) => setLeftTeamName(e.target.value)}
            className="flex-1 px-2 py-1 text-xs border-2 rounded-md text-center font-bold bg-white focus:bg-gray-50 transition-all truncate"
            style={{borderColor: '#04362d', color: '#04362d'}}
            placeholder="Team A"
            maxLength={12}
          />
          <span className="text-xs font-bold px-1" style={{color: '#04362d'}}>VS</span>
          <input
            type="text"
            value={rightTeamName}
            onChange={(e) => setRightTeamName(e.target.value)}
            className="flex-1 px-2 py-1 text-xs border-2 rounded-md text-center font-bold bg-white focus:bg-gray-50 transition-all truncate"
            style={{borderColor: '#04362d', color: '#04362d'}}
            placeholder="Team B"
            maxLength={12}
          />
        </div>

        {/* Score Display and Controls */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {/* Left Team Score */}
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 border-2 shadow-md" style={{borderColor: '#04362d'}}>
            <div className="flex gap-1 mb-1">
              <button
                onClick={() => handleDecrementScore('left')}
                className="w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-xs flex items-center justify-center font-bold shadow-md transform active:scale-90"
              >
                −
              </button>
              <button
                onClick={() => handleIncrementScore('left')}
                className="w-5 h-5 text-white rounded-full transition-all text-xs flex items-center justify-center font-bold shadow-md transform active:scale-90"
                style={{backgroundColor: '#04362d'}}
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
                className="w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-xs flex items-center justify-center font-bold shadow-md transform active:scale-90"
              >
                −
              </button>
              <button
                onClick={() => handleIncrementScore('right')}
                className="w-5 h-5 text-white rounded-full transition-all text-xs flex items-center justify-center font-bold shadow-md transform active:scale-90"
                style={{backgroundColor: '#04362d'}}
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
          className="w-full px-2 py-1 text-white text-xs rounded-md transition-all transform active:scale-95 font-bold tracking-wide uppercase shadow-md"
          style={{backgroundColor: '#04362d'}}
        >
          Reset
        </button>
      </div>

      {/* Upcoming Game */}
      <div className="pt-2 border-t flex-shrink-0" style={{borderColor: '#04362d'}}>
        <div className="text-xs font-bold mb-1 text-center tracking-wide uppercase" style={{color: '#04362d'}}>Next</div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={upcomingLeftName}
            onChange={(e) => setUpcomingLeftName(e.target.value)}
            className="flex-1 px-2 py-1 border rounded-md text-center text-xs bg-white focus:bg-gray-50 transition-all truncate font-bold"
            style={{borderColor: '#04362d', color: '#04362d'}}
            placeholder="Next A"
            maxLength={10}
          />
          <span className="text-xs font-bold" style={{color: '#04362d'}}>v</span>
          <input
            type="text"
            value={upcomingRightName}
            onChange={(e) => setUpcomingRightName(e.target.value)}
            className="flex-1 px-2 py-1 border rounded-md text-center text-xs bg-white focus:bg-gray-50 transition-all truncate font-bold"
            style={{borderColor: '#04362d', color: '#04362d'}}
            placeholder="Next B"
            maxLength={10}
          />
        </div>
      </div>
    </div>
  );
}