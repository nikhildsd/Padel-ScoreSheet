'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CourtData } from '@/lib/db-simple';
import {
  incrementScore,
  decrementScore,
  resetCourtScores,
  updateTeamName,
  updateUpcomingTeam,
  getSingleCourtData
} from '@/lib/actions';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import Image from 'next/image';

interface CourtFullScreenProps {
  courtData: CourtData;
}

export default function CourtFullScreen({ courtData: initialCourtData }: CourtFullScreenProps) {
  const router = useRouter();
  const [courtData, setCourtData] = useState(initialCourtData);
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

  // Refresh court data from server
  const refreshCourtData = async () => {
    try {
      const result = await getSingleCourtData(courtNumber);
      if (result.success && result.data) {
        setCourtData(result.data);
      }
    } catch (error) {
      console.error('Failed to refresh court data:', error);
    }
  };

  // Set up polling for real-time updates every 3 seconds (reduced frequency to avoid conflicts)
  useEffect(() => {
    const interval = setInterval(refreshCourtData, 3000);
    return () => clearInterval(interval);
  }, [courtNumber]);

  // Update server when debounced values change
  useEffect(() => {
    if (debouncedLeftTeamName !== leftTeam.name) {
      handleTeamNameChange('left', debouncedLeftTeamName);
    }
  }, [debouncedLeftTeamName]);

  useEffect(() => {
    if (debouncedRightTeamName !== rightTeam.name) {
      handleTeamNameChange('right', debouncedRightTeamName);
    }
  }, [debouncedRightTeamName]);

  useEffect(() => {
    if (debouncedUpcomingLeft !== upcomingLeft) {
      handleUpcomingTeamChange('left', debouncedUpcomingLeft);
    }
  }, [debouncedUpcomingLeft]);

  useEffect(() => {
    if (debouncedUpcomingRight !== upcomingRight) {
      handleUpcomingTeamChange('right', debouncedUpcomingRight);
    }
  }, [debouncedUpcomingRight]);

  // Update local state when props change (from server updates)
  useEffect(() => {
    setLeftTeamName(leftTeam.name);
    setRightTeamName(rightTeam.name);
    setUpcomingLeftName(upcomingLeft);
    setUpcomingRightName(upcomingRight);
  }, [leftTeam.name, rightTeam.name, upcomingLeft, upcomingRight]);

  const handleIncrementScore = async (side: 'left' | 'right') => {
    // Optimistic update - immediately update local state
    const updatedCourtData = { ...courtData };
    if (side === 'left') {
      updatedCourtData.leftTeam.score = Math.min(99, updatedCourtData.leftTeam.score + 1);
    } else {
      updatedCourtData.rightTeam.score = Math.min(99, updatedCourtData.rightTeam.score + 1);
    }
    setCourtData(updatedCourtData);

    // Then update server
    const result = await incrementScore(courtNumber, side);
    if (!result.success && result.error) {
      console.error('Failed to increment score:', result.error);
      // Revert optimistic update on error
      await refreshCourtData();
    } else {
      // Ensure we have the latest server data
      setTimeout(async () => {
        await refreshCourtData();
        router.refresh();
      }, 100);
    }
  };

  const handleDecrementScore = async (side: 'left' | 'right') => {
    // Optimistic update - immediately update local state
    const updatedCourtData = { ...courtData };
    if (side === 'left') {
      updatedCourtData.leftTeam.score = Math.max(0, updatedCourtData.leftTeam.score - 1);
    } else {
      updatedCourtData.rightTeam.score = Math.max(0, updatedCourtData.rightTeam.score - 1);
    }
    setCourtData(updatedCourtData);

    // Then update server
    const result = await decrementScore(courtNumber, side);
    if (!result.success && result.error) {
      console.error('Failed to decrement score:', result.error);
      // Revert optimistic update on error
      await refreshCourtData();
    } else {
      // Ensure we have the latest server data
      setTimeout(async () => {
        await refreshCourtData();
        router.refresh();
      }, 100);
    }
  };

  const handleResetScores = async () => {
    // Optimistic update - immediately reset scores locally
    const updatedCourtData = {
      ...courtData,
      leftTeam: { ...courtData.leftTeam, score: 0 },
      rightTeam: { ...courtData.rightTeam, score: 0 }
    };
    setCourtData(updatedCourtData);

    // Then update server
    const result = await resetCourtScores(courtNumber);
    if (!result.success && result.error) {
      console.error('Failed to reset scores:', result.error);
      // Revert optimistic update on error
      await refreshCourtData();
    } else {
      // Ensure we have the latest server data
      setTimeout(async () => {
        await refreshCourtData();
        router.refresh();
      }, 100);
    }
  };

  const handleTeamNameChange = async (side: 'left' | 'right', name: string) => {
    const result = await updateTeamName(courtNumber, side, name);
    if (!result.success && result.error) {
      console.error('Failed to update team name:', result.error);
    }
  };

  const handleUpcomingTeamChange = async (side: 'left' | 'right', name: string) => {
    const result = await updateUpcomingTeam(courtNumber, side, name);
    if (!result.success && result.error) {
      console.error('Failed to update upcoming team:', result.error);
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12">
            <input
              type="text"
              value={leftTeamName}
              onChange={(e) => setLeftTeamName(e.target.value)}
              className="w-full sm:flex-1 sm:max-w-xs px-3 sm:px-6 py-2 sm:py-4 text-lg sm:text-2xl border-2 sm:border-4 rounded-xl sm:rounded-2xl text-center font-bold bg-white focus:bg-gray-50 transition-all"
              style={{borderColor: '#04362d', color: '#04362d'}}
              placeholder="Team A"
              maxLength={20}
            />
            <span className="text-xl sm:text-3xl font-bold px-2 sm:px-4" style={{color: '#04362d'}}>VS</span>
            <input
              type="text"
              value={rightTeamName}
              onChange={(e) => setRightTeamName(e.target.value)}
              className="w-full sm:flex-1 sm:max-w-xs px-3 sm:px-6 py-2 sm:py-4 text-lg sm:text-2xl border-2 sm:border-4 rounded-xl sm:rounded-2xl text-center font-bold bg-white focus:bg-gray-50 transition-all"
              style={{borderColor: '#04362d', color: '#04362d'}}
              placeholder="Team B"
              maxLength={20}
            />
          </div>

          {/* Score Display and Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Left Team Score */}
            <div className="flex flex-col items-center bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 sm:border-4 shadow-xl" style={{borderColor: '#04362d'}}>
              <div className="flex gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                <button
                  onClick={() => handleDecrementScore('left')}
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform active:scale-90"
                >
                  −
                </button>
                <button
                  onClick={() => handleIncrementScore('left')}
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white rounded-full transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform active:scale-90"
                  style={{backgroundColor: '#04362d'}}
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
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform active:scale-90"
                >
                  −
                </button>
                <button
                  onClick={() => handleIncrementScore('right')}
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white rounded-full transition-all text-lg sm:text-xl lg:text-2xl flex items-center justify-center font-bold shadow-lg transform active:scale-90"
                  style={{backgroundColor: '#04362d'}}
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
              className="px-6 sm:px-12 py-2 sm:py-4 text-white text-base sm:text-xl rounded-xl sm:rounded-2xl transition-all transform active:scale-95 font-bold tracking-wide uppercase shadow-xl hover:shadow-2xl"
              style={{backgroundColor: '#04362d'}}
            >
              Reset Scores
            </button>
          </div>

          {/* Upcoming Game */}
          <div className="border-t-2 sm:border-t-4 pt-4 sm:pt-8" style={{borderColor: '#04362d'}}>
            <div className="text-base sm:text-xl font-bold mb-4 sm:mb-6 text-center tracking-wide uppercase" style={{color: '#04362d'}}>Next Game</div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <input
                type="text"
                value={upcomingLeftName}
                onChange={(e) => setUpcomingLeftName(e.target.value)}
                className="w-full sm:flex-1 sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-center text-base sm:text-lg bg-white focus:bg-gray-50 transition-all font-bold"
                style={{borderColor: '#04362d', color: '#04362d'}}
                placeholder="Next Team A"
                maxLength={15}
              />
              <span className="text-lg sm:text-xl font-bold px-2" style={{color: '#04362d'}}>VS</span>
              <input
                type="text"
                value={upcomingRightName}
                onChange={(e) => setUpcomingRightName(e.target.value)}
                className="w-full sm:flex-1 sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-center text-base sm:text-lg bg-white focus:bg-gray-50 transition-all font-bold"
                style={{borderColor: '#04362d', color: '#04362d'}}
                placeholder="Next Team B"
                maxLength={15}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}