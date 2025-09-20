'use client';

import { useState, useEffect } from 'react';
import { CourtData } from '@/lib/db-simple';
import {
  incrementScore,
  decrementScore,
  resetCourtScores,
  saveMatch
} from '@/lib/api-client';
import { updateTeamNames } from '@/lib/teams-client';
import Link from 'next/link';
import Image from 'next/image';

interface CourtFullScreenProps {
  courtData: CourtData;
}

export default function CourtFullScreenNew({ courtData: initialCourtData }: CourtFullScreenProps) {
  console.log('NEW COMPONENT: CourtFullScreenNew loaded for court', initialCourtData.courtNumber);
  console.log('NEW COMPONENT: Initial team names from props:', {
    left: initialCourtData.leftTeam.name,
    right: initialCourtData.rightTeam.name
  });

  const [courtData, setCourtData] = useState(initialCourtData);
  const [isUpdating, setIsUpdating] = useState(false);
  const { courtNumber, leftTeam, rightTeam, upcomingLeft, upcomingRight } = courtData;

  // Simple local state for team names - no complex syncing
  const [leftTeamName, setLeftTeamName] = useState(leftTeam.name);
  const [rightTeamName, setRightTeamName] = useState(rightTeam.name);
  const [upcomingLeftName, setUpcomingLeftName] = useState(upcomingLeft);
  const [upcomingRightName, setUpcomingRightName] = useState(upcomingRight);

  const [isSavingTeams, setIsSavingTeams] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  const [matchNotes, setMatchNotes] = useState('');

  // DISABLED - No automatic sync from server to prevent API calls
  useEffect(() => {
    console.log('SCORE SYNC DISABLED - no automatic updates from server');
  }, []);

  // Simple save function - saves both names at once
  const saveTeamNames = async () => {
    if (isSavingTeams) return;
    setIsSavingTeams(true);

    try {
      console.log('NEW COMPONENT: Starting save for court', courtNumber);
      console.log('NEW COMPONENT: Team names to save:', { leftTeamName, rightTeamName });

      // Use the working simple API
      const response = await fetch('/api/update-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtNumber,
          leftName: leftTeamName,
          rightName: rightTeamName
        })
      });

      const result = await response.json();
      console.log('NEW COMPONENT: Save result:', result);

      if (result.success) {
        console.log('COMPONENT: Team names saved successfully');
        // Add delay before fetching updated data
        setTimeout(async () => {
          // Update local state to reflect database changes
          setCourtData(prevData => ({
            ...prevData,
            leftTeam: { ...prevData.leftTeam, name: leftTeamName },
            rightTeam: { ...prevData.rightTeam, name: rightTeamName }
          }));
        }, 1000);
      } else {
        console.error('COMPONENT: Failed to save team names:', result.error);
        alert('Failed to save team names: ' + result.error);
      }
    } catch (error) {
      console.error('COMPONENT: Error saving team names:', error);
      alert('Error saving team names');
    } finally {
      setIsSavingTeams(false);
    }
  };

  // Save upcoming teams function
  const saveUpcomingTeams = async () => {
    if (isSavingTeams) return;
    setIsSavingTeams(true);

    try {
      console.log('COMPONENT: Saving upcoming teams for court', courtNumber);
      console.log('COMPONENT: Upcoming teams to save:', { upcomingLeftName, upcomingRightName });

      // Update upcoming left team
      const leftResponse = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateUpcomingTeam',
          courtNumber,
          side: 'left',
          name: upcomingLeftName
        })
      });

      const leftResult = await leftResponse.json();

      if (!leftResult.success) {
        throw new Error(`Failed to update left upcoming team: ${leftResult.error}`);
      }

      // Update upcoming right team
      const rightResponse = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateUpcomingTeam',
          courtNumber,
          side: 'right',
          name: upcomingRightName
        })
      });

      const rightResult = await rightResponse.json();

      if (!rightResult.success) {
        throw new Error(`Failed to update right upcoming team: ${rightResult.error}`);
      }

      console.log('COMPONENT: Upcoming teams saved successfully');

      // Update local state to reflect changes
      setTimeout(() => {
        setCourtData(prevData => ({
          ...prevData,
          upcomingLeft: upcomingLeftName,
          upcomingRight: upcomingRightName
        }));
      }, 500);

    } catch (error) {
      console.error('COMPONENT: Error saving upcoming teams:', error);
      alert('Error saving upcoming teams: ' + error.message);
    } finally {
      setIsSavingTeams(false);
    }
  };

  const handleIncrementScore = async (side: 'left' | 'right') => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const result = await incrementScore(courtNumber, side);
      if (result.success) {
        // Update local state immediately with delay for database consistency
        setTimeout(() => {
          setCourtData(prevData => ({
            ...prevData,
            leftTeam: {
              ...prevData.leftTeam,
              score: side === 'left' ? prevData.leftTeam.score + 1 : prevData.leftTeam.score
            },
            rightTeam: {
              ...prevData.rightTeam,
              score: side === 'right' ? prevData.rightTeam.score + 1 : prevData.rightTeam.score
            }
          }));
        }, 500);
      } else {
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
      if (result.success) {
        // Update local state immediately with delay for database consistency
        setTimeout(() => {
          setCourtData(prevData => ({
            ...prevData,
            leftTeam: {
              ...prevData.leftTeam,
              score: side === 'left' ? Math.max(0, prevData.leftTeam.score - 1) : prevData.leftTeam.score
            },
            rightTeam: {
              ...prevData.rightTeam,
              score: side === 'right' ? Math.max(0, prevData.rightTeam.score - 1) : prevData.rightTeam.score
            }
          }));
        }, 500);
      } else {
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
      if (result.success) {
        // Update local state immediately with delay for database consistency
        setTimeout(() => {
          setCourtData(prevData => ({
            ...prevData,
            leftTeam: { ...prevData.leftTeam, score: 0 },
            rightTeam: { ...prevData.rightTeam, score: 0 }
          }));
        }, 500);
      } else {
        console.error('Failed to reset scores:', result.error);
      }
    } finally {
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  const handleSaveMatch = async () => {
    setIsSavingMatch(true);

    try {
      const result = await saveMatch(courtNumber, matchNotes);
      if (result.success) {
        setShowSaveConfirmation(false);
        setMatchNotes(''); // Clear notes after successful save
        console.log('Match saved successfully');
      } else {
        console.error('Failed to save match:', result.error);
      }
    } finally {
      setIsSavingMatch(false);
    }
  };

  // Check if team names have changed
  const teamNamesChanged = leftTeamName !== leftTeam.name || rightTeamName !== rightTeam.name;

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

        <div className="w-16 sm:w-32"></div>
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
              <input
                type="text"
                value={leftTeamName}
                onChange={(e) => setLeftTeamName(e.target.value)}
                className="w-full sm:max-w-xs px-3 sm:px-6 py-2 sm:py-4 text-lg sm:text-2xl border-2 sm:border-4 rounded-xl sm:rounded-2xl text-center font-bold bg-white focus:bg-gray-50 transition-all"
                style={{borderColor: teamNamesChanged ? '#f59e0b' : '#04362d', color: '#04362d'}}
                placeholder="Left Team"
                maxLength={20}
              />

              <span className="text-xl sm:text-3xl font-bold px-2 sm:px-4" style={{color: '#04362d'}}>VS</span>

              <input
                type="text"
                value={rightTeamName}
                onChange={(e) => setRightTeamName(e.target.value)}
                className="w-full sm:max-w-xs px-3 sm:px-6 py-2 sm:py-4 text-lg sm:text-2xl border-2 sm:border-4 rounded-xl sm:rounded-2xl text-center font-bold bg-white focus:bg-gray-50 transition-all"
                style={{borderColor: teamNamesChanged ? '#f59e0b' : '#04362d', color: '#04362d'}}
                placeholder="Right Team"
                maxLength={20}
              />
            </div>

            {teamNamesChanged && (
              <div className="text-center">
                <button
                  onClick={saveTeamNames}
                  disabled={isSavingTeams}
                  className={`px-6 py-2 text-white rounded-lg font-bold transition-colors ${isSavingTeams ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {isSavingTeams ? 'SAVING...' : 'SAVE TEAM NAMES'}
                </button>
              </div>
            )}
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

          {/* Action Buttons */}
          <div className="text-center mb-6 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleResetScores}
                disabled={isUpdating}
                className={`px-6 sm:px-8 py-2 sm:py-3 text-white text-base sm:text-lg rounded-xl transition-all font-bold tracking-wide uppercase shadow-xl ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'transform active:scale-95 hover:shadow-2xl'}`}
                style={{backgroundColor: isUpdating ? '#9CA3AF' : '#04362d'}}
              >
                {isUpdating ? 'Updating...' : 'Reset Scores'}
              </button>
              <button
                onClick={() => setShowSaveConfirmation(true)}
                disabled={isUpdating || isSavingMatch}
                className={`px-6 sm:px-8 py-2 sm:py-3 text-white text-base sm:text-lg rounded-xl transition-all font-bold tracking-wide uppercase shadow-xl ${(isUpdating || isSavingMatch) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 transform active:scale-95 hover:shadow-2xl'}`}
              >
                Save Match
              </button>
            </div>
          </div>

          {/* Upcoming Game - Editable */}
          <div className="border-t-2 sm:border-t-4 pt-4 sm:pt-8" style={{borderColor: '#04362d'}}>
            <div className="text-base sm:text-xl font-bold mb-4 sm:mb-6 text-center tracking-wide uppercase" style={{color: '#04362d'}}>Next Game</div>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <input
                  type="text"
                  value={upcomingLeftName}
                  onChange={(e) => setUpcomingLeftName(e.target.value)}
                  className="w-full sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-center text-base sm:text-lg font-bold bg-white focus:bg-gray-50 transition-all"
                  style={{borderColor: '#04362d', color: '#04362d'}}
                  placeholder="Next Team A"
                />

                <span className="text-lg sm:text-xl font-bold px-2" style={{color: '#04362d'}}>VS</span>

                <input
                  type="text"
                  value={upcomingRightName}
                  onChange={(e) => setUpcomingRightName(e.target.value)}
                  className="w-full sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-center text-base sm:text-lg font-bold bg-white focus:bg-gray-50 transition-all"
                  style={{borderColor: '#04362d', color: '#04362d'}}
                  placeholder="Next Team B"
                />
              </div>

              {/* Save button for upcoming teams */}
              {(upcomingLeftName !== upcomingLeft || upcomingRightName !== upcomingRight) && (
                <div className="text-center">
                  <button
                    onClick={saveUpcomingTeams}
                    disabled={isSavingTeams}
                    className={`px-4 py-2 text-white rounded-lg font-bold transition-colors ${isSavingTeams ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {isSavingTeams ? 'SAVING...' : 'SAVE UPCOMING TEAMS'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center" style={{color: '#04362d'}}>
              Save Match?
            </h3>
            <div className="mb-6 text-center">
              <p className="text-gray-600 mb-4">
                Are you sure you want to save this completed match?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-2 mb-4" style={{borderColor: '#04362d'}}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold" style={{color: '#04362d'}}>{leftTeam.name}</span>
                  <span className="text-2xl font-bold" style={{color: '#04362d'}}>{leftTeam.score}</span>
                </div>
                <div className="text-center text-sm text-gray-500 mb-2">VS</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold" style={{color: '#04362d'}}>{rightTeam.name}</span>
                  <span className="text-2xl font-bold" style={{color: '#04362d'}}>{rightTeam.score}</span>
                </div>
              </div>

              {/* Notes field */}
              <div className="text-left">
                <label className="block text-sm font-bold mb-2" style={{color: '#04362d'}}>
                  Match Notes (Optional)
                </label>
                <textarea
                  value={matchNotes}
                  onChange={(e) => setMatchNotes(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{borderColor: '#04362d'}}
                  placeholder="Add any notes about this match... (e.g., great rallies, weather conditions, special plays)"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {matchNotes.length}/500 characters
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowSaveConfirmation(false);
                  setMatchNotes(''); // Clear notes when canceling
                }}
                disabled={isSavingMatch}
                className="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg font-bold transition-colors hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMatch}
                disabled={isSavingMatch}
                className={`px-6 py-2 text-white rounded-lg font-bold transition-colors ${
                  isSavingMatch
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSavingMatch ? 'Saving...' : 'Save Match'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}