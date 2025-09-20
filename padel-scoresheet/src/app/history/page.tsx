'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SavedMatchRow } from '@/lib/supabase-server';

export default function HistoryPage() {
  const [savedMatches, setSavedMatches] = useState<SavedMatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedMatches = async () => {
      try {
        const response = await fetch('/api/history');
        const result = await response.json();

        if (result.success) {
          setSavedMatches(result.data);
        } else {
          setError(result.error || 'Failed to fetch saved matches');
        }
      } catch (err) {
        setError('Error loading saved matches');
        console.error('Error fetching saved matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedMatches();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center" style={{backgroundColor: '#04362d'}}>
        <div className="text-white text-xl">Loading match history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center" style={{backgroundColor: '#04362d'}}>
        <div className="text-red-300 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen p-4" style={{backgroundColor: '#04362d'}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Image
              src="/brand-logo.jpg"
              alt="Brand Logo"
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          </div>
          <span className="text-lg font-medium">← Back to Courts</span>
        </Link>

        <h1 className="text-2xl lg:text-3xl font-light text-white tracking-wider uppercase">
          Match History
        </h1>

        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      {/* Match History */}
      <div className="max-w-6xl mx-auto">
        {savedMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4" style={{color: '#04362d'}}>No Saved Matches</h2>
              <p className="text-gray-600">Start playing and save some matches to see them here!</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {savedMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-xl shadow-2xl p-4 md:p-6 border hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-gray-100 rounded-lg px-3 py-1 border-2" style={{borderColor: '#04362d'}}>
                        <span className="font-bold text-sm" style={{color: '#04362d'}}>
                          Court {match.court_number}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(match.saved_at)}
                      </div>
                    </div>

                    {/* Teams and Scores */}
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="flex-1 max-w-xs">
                        <div className="text-center p-3 bg-gray-50 rounded-lg border-2" style={{borderColor: '#04362d'}}>
                          <div className="font-bold text-lg" style={{color: '#04362d'}}>
                            {match.left_team_name || 'Team A'}
                          </div>
                          <div className="text-3xl font-bold mt-2" style={{color: '#04362d'}}>
                            {match.left_team_score}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center px-4">
                        <span className="text-xl font-bold" style={{color: '#04362d'}}>VS</span>
                        <div className="w-12 h-6 rounded-md mt-2 border" style={{backgroundColor: '#04362d', borderColor: '#04362d'}}>
                          <div className="w-full h-0.5 bg-white opacity-80 mt-2.5"></div>
                          <div className="w-0.5 h-full bg-white opacity-80 absolute ml-6 -mt-6"></div>
                        </div>
                      </div>

                      <div className="flex-1 max-w-xs">
                        <div className="text-center p-3 bg-gray-50 rounded-lg border-2" style={{borderColor: '#04362d'}}>
                          <div className="font-bold text-lg" style={{color: '#04362d'}}>
                            {match.right_team_name || 'Team B'}
                          </div>
                          <div className="text-3xl font-bold mt-2" style={{color: '#04362d'}}>
                            {match.right_team_score}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Teams */}
                    {(match.upcoming_left || match.upcoming_right) && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs font-bold mb-2 text-center" style={{color: '#04362d'}}>
                          Next Teams
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <span className="text-gray-600">{match.upcoming_left || 'Next A'}</span>
                          <span className="text-gray-400">vs</span>
                          <span className="text-gray-600">{match.upcoming_right || 'Next B'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}