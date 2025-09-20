'use client';

import { useState, useEffect } from 'react';
import { CourtData } from '@/lib/db-simple';
import {
  incrementScore,
  decrementScore,
  resetCourtScores,
  updateTeamName,
  updateUpcomingTeam
} from '@/lib/api-client';
import Link from 'next/link';
import Image from 'next/image';

interface CourtFullScreenProps {
  courtData: CourtData;
}

export default function CourtFullScreen({ courtData: initialCourtData }: CourtFullScreenProps) {
  const [courtData, setCourtData] = useState(initialCourtData);
  const [isUpdating, setIsUpdating] = useState(false);
  const { courtNumber, leftTeam, rightTeam, upcomingLeft, upcomingRight } = courtData;

  // Update local state when props change (from parent component)
  useEffect(() => {
    setCourtData(initialCourtData);
  }, [initialCourtData]);

  // Local state for inputs - no auto-saving, manual save buttons
  const [leftTeamName, setLeftTeamName] = useState(leftTeam.name);
  const [rightTeamName, setRightTeamName] = useState(rightTeam.name);
  const [upcomingLeftName, setUpcomingLeftName] = useState(upcomingLeft);
  const [upcomingRightName, setUpcomingRightName] = useState(upcomingRight);

  // Track if names have been modified
  const [leftTeamNameChanged, setLeftTeamNameChanged] = useState(false);
  const [rightTeamNameChanged, setRightTeamNameChanged] = useState(false);
  const [upcomingLeftChanged, setUpcomingLeftChanged] = useState(false);
  const [upcomingRightChanged, setUpcomingRightChanged] = useState(false);


  // Manual save functions
  const saveLeftTeamName = async () => {
    if (leftTeamName.trim() === '') return;
    const result = await updateTeamName(courtNumber, 'left', leftTeamName);
    if (result.success) {
      setLeftTeamNameChanged(false);
    }
  };

  const saveRightTeamName = async () => {
    if (rightTeamName.trim() === '') return;
    const result = await updateTeamName(courtNumber, 'right', rightTeamName);
    if (result.success) {
      setRightTeamNameChanged(false);
    }
  };

  const saveUpcomingLeft = async () => {
    const result = await updateUpcomingTeam(courtNumber, 'left', upcomingLeftName);
    if (result.success) {
      setUpcomingLeftChanged(false);
    }
  };

  const saveUpcomingRight = async () => {
    const result = await updateUpcomingTeam(courtNumber, 'right', upcomingRightName);
    if (result.success) {
      setUpcomingRightChanged(false);
    }
  };

  // Update local state when props change (from server updates) and reset change flags
  useEffect(() => {
    setLeftTeamName(leftTeam.name);
    setRightTeamName(rightTeam.name);
    setUpcomingLeftName(upcomingLeft);
    setUpcomingRightName(upcomingRight);
    setLeftTeamNameChanged(false);
    setRightTeamNameChanged(false);
    setUpcomingLeftChanged(false);
    setUpcomingRightChanged(false);
  }, [leftTeam.name, rightTeam.name, upcomingLeft, upcomingRight]);

  const handleIncrementScore = async (side: 'left' | 'right') => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      // Update server first, no optimistic updates to avoid conflicts
      const result = await incrementScore(courtNumber, side);

      if (!result.success && result.error) {
        console.error('Failed to increment score:', result.error);
      }

      // Real-time subscriptions will handle data refresh automatically
    } finally {
      // Add small delay to prevent rapid clicking
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  const handleDecrementScore = async (side: 'left' | 'right') => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      // Update server first, no optimistic updates to avoid conflicts
      const result = await decrementScore(courtNumber, side);

      if (!result.success && result.error) {
        console.error('Failed to decrement score:', result.error);
      }

      // Real-time subscriptions will handle data refresh automatically
    } finally {
      // Add small delay to prevent rapid clicking
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  const handleResetScores = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      // Update server first, no optimistic updates to avoid conflicts
      const result = await resetCourtScores(courtNumber);

      if (!result.success && result.error) {
        console.error('Failed to reset scores:', result.error);
      }

      // Real-time subscriptions will handle data refresh automatically
    } finally {
      // Add small delay to prevent rapid clicking
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-hidden flex flex-col p-2 sm:p-4" style={{backgroundColor: '#04362d'}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <Link 
          href="/" 
          className="flex items-center gap-2 sm:gap-3 text-white hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
            <Image 
              src="/brand-logo.jpg" 
              alt="Brand Logo" 
              width={20} 
              height={20} 
              className="rounded-full object-cover sm:w-6 sm:h-6"
            />
          </div>
          <span className="text-sm sm:text-lg font-medium">← Back</span>
        </Link>
        
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-light text-white tracking-wider uppercase">
          Court {courtNumber}
        </h1>
        
        <div className="w-16 sm:w-32"></div> {/* Spacer for centering */}
      </div>

      {/* Main Court Interface */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 lg:p-12 w-full max-w-5xl border-2 sm:border-4 border-white">
          
          {/* Current Game Header */}
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4" style={{color: '#04362d'}}>CURRENT GAME</h2>
          </div>
          
          {/* Team Names */}
          <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={leftTeamName}
                  onChange={(e) => {
                    setLeftTeamName(e.target.value);
                    setLeftTeamNameChanged(e.target.value !== leftTeam.name);
                  }}
                  className="w-full sm:max-w-xs px-3 sm:px-6 py-2 sm:py-4 text-lg sm:text-2xl border-2 sm:border-4 rounded-xl sm:rounded-2xl text-center font-bold bg-white focus:bg-gray-50 transition-all"
                  style={{borderColor: leftTeamNameChanged ? '#f59e0b' : '#04362d', color: '#04362d'}}
                  placeholder="Team A"
                  maxLength={20}
                />
                {leftTeamNameChanged && (
                  <button
                    onClick={saveLeftTeamName}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-bold"
                  >
                    SAVE
                  </button>
                )}
              </div>

              <span className="text-xl sm:text-3xl font-bold px-2 sm:px-4" style={{color: '#04362d'}}>VS</span>

              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={rightTeamName}
                  onChange={(e) => {
                    setRightTeamName(e.target.value);
                    setRightTeamNameChanged(e.target.value !== rightTeam.name);
                  }}
                  className="w-full sm:max-w-xs px-3 sm:px-6 py-2 sm:py-4 text-lg sm:text-2xl border-2 sm:border-4 rounded-xl sm:rounded-2xl text-center font-bold bg-white focus:bg-gray-50 transition-all"
                  style={{borderColor: rightTeamNameChanged ? '#f59e0b' : '#04362d', color: '#04362d'}}
                  placeholder="Team B"
                  maxLength={20}
                />
                {rightTeamNameChanged && (
                  <button
                    onClick={saveRightTeamName}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-bold"
                  >
                    SAVE
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Score Display and Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Left Team Score */}
            <div className="flex flex-col items-center bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 sm:border-4 shadow-xl" style={{borderColor: '#04362d'}}>
              <div className="flex gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                <button
                  onClick={() => handleDecrementScore('left')}
                  disabled={isUpdating}
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white rounded-full transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 active:scale-90'}`}
                >
                  −
                </button>
                <button
                  onClick={() => handleIncrementScore('left')}
                  disabled={isUpdating}
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white rounded-full transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'active:scale-90'}`}
                  style={{backgroundColor: isUpdating ? '#9CA3AF' : '#04362d'}}
                >
                  +
                </button>
              </div>
              <div className="text-4xl sm:text-6xl lg:text-8xl font-bold min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] text-center" style={{color: '#04362d'}}>
                {leftTeam.score}
              </div>
            </div>

            {/* Court Rectangle */}
            <div className="w-32 h-20 sm:w-40 sm:h-24 lg:w-48 lg:h-32 rounded-xl sm:rounded-2xl relative shadow-2xl border-2 sm:border-4 border-white" style={{backgroundColor: '#04362d'}}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 sm:h-1 bg-white opacity-80"></div>
                <div className="absolute w-0.5 sm:w-1 h-full bg-white opacity-80"></div>
              </div>
              <div className="absolute inset-2 sm:inset-4 border border-white sm:border-2 rounded-md sm:rounded-lg opacity-60"></div>
            </div>

            {/* Right Team Score */}
            <div className="flex flex-col items-center bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 sm:border-4 shadow-xl" style={{borderColor: '#04362d'}}>
              <div className="flex gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                <button
                  onClick={() => handleDecrementScore('right')}
                  disabled={isUpdating}
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white rounded-full transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 active:scale-90'}`}
                >
                  −
                </button>
                <button
                  onClick={() => handleIncrementScore('right')}
                  disabled={isUpdating}
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white rounded-full transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'active:scale-90'}`}
                  style={{backgroundColor: isUpdating ? '#9CA3AF' : '#04362d'}}
                >
                  +
                </button>
              </div>
              <div className="text-4xl sm:text-6xl lg:text-8xl font-bold min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] text-center" style={{color: '#04362d'}}>
                {rightTeam.score}
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center mb-6 sm:mb-12">
            <button
              onClick={handleResetScores}
              disabled={isUpdating}
              className={`px-6 sm:px-12 py-2 sm:py-4 text-white text-base sm:text-xl rounded-xl sm:rounded-2xl transition-all font-bold tracking-wide uppercase shadow-xl ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'transform active:scale-95 hover:shadow-2xl'}`}
              style={{backgroundColor: isUpdating ? '#9CA3AF' : '#04362d'}}
            >
              {isUpdating ? 'Updating...' : 'Reset Scores'}
            </button>
          </div>

          {/* Upcoming Game */}
          <div className="border-t-2 sm:border-t-4 pt-4 sm:pt-8" style={{borderColor: '#04362d'}}>
            <div className="text-base sm:text-xl font-bold mb-4 sm:mb-6 text-center tracking-wide uppercase" style={{color: '#04362d'}}>Next Game</div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={upcomingLeftName}
                  onChange={(e) => {
                    setUpcomingLeftName(e.target.value);
                    setUpcomingLeftChanged(e.target.value !== upcomingLeft);
                  }}
                  className="w-full sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-center text-base sm:text-lg bg-white focus:bg-gray-50 transition-all font-bold"
                  style={{borderColor: upcomingLeftChanged ? '#f59e0b' : '#04362d', color: '#04362d'}}
                  placeholder="Next Team A"
                  maxLength={15}
                />
                {upcomingLeftChanged && (
                  <button
                    onClick={saveUpcomingLeft}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-bold"
                  >
                    SAVE
                  </button>
                )}
              </div>

              <span className="text-lg sm:text-xl font-bold px-2" style={{color: '#04362d'}}>VS</span>

              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={upcomingRightName}
                  onChange={(e) => {
                    setUpcomingRightName(e.target.value);
                    setUpcomingRightChanged(e.target.value !== upcomingRight);
                  }}
                  className="w-full sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-center text-base sm:text-lg bg-white focus:bg-gray-50 transition-all font-bold"
                  style={{borderColor: upcomingRightChanged ? '#f59e0b' : '#04362d', color: '#04362d'}}
                  placeholder="Next Team B"
                  maxLength={15}
                />
                {upcomingRightChanged && (
                  <button
                    onClick={saveUpcomingRight}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-bold"
                  >
                    SAVE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}