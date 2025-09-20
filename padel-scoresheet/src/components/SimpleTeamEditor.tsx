'use client';

import { useState } from 'react';

interface Props {
  courtNumber: number;
  leftTeamName: string;
  rightTeamName: string;
}

export default function SimpleTeamEditor({ courtNumber, leftTeamName, rightTeamName }: Props) {
  const [leftName, setLeftName] = useState(leftTeamName);
  const [rightName, setRightName] = useState(rightTeamName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    console.log('SIMPLE EDITOR: Saving names:', { courtNumber, leftName, rightName });

    try {
      const response = await fetch('/api/update-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtNumber,
          leftName,
          rightName
        })
      });

      const result = await response.json();
      console.log('SIMPLE EDITOR: Response:', result);
      console.log('SIMPLE EDITOR: Updated data from DB:', result.data);

      if (result.success) {
        alert('Team names updated successfully! Database now shows: ' + result.data.right_team_name);
        // Force page refresh to show updated data
        window.location.reload();
      } else {
        alert('Failed to update: ' + result.error);
      }
    } catch (error) {
      console.error('SIMPLE EDITOR: Error:', error);
      alert('Error: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Court {courtNumber} - Edit Team Names</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Left Team Name:</label>
          <input
            type="text"
            value={leftName}
            onChange={(e) => setLeftName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Enter left team name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Right Team Name:</label>
          <input
            type="text"
            value={rightName}
            onChange={(e) => setRightName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Enter right team name"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Team Names'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Current database values:</p>
        <p>Left: {leftTeamName}</p>
        <p>Right: {rightTeamName}</p>
      </div>
    </div>
  );
}