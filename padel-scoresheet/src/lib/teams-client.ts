// Simple, dedicated client for team name operations
export async function updateTeamNames(courtNumber: number, leftTeamName: string, rightTeamName: string) {
  console.log('CLIENT: Saving team names for court', courtNumber, ':', { leftTeamName, rightTeamName })

  try {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courtNumber,
        leftTeamName,
        rightTeamName
      }),
    })

    const result = await response.json()
    console.log('CLIENT: API response:', result)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update team names')
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('CLIENT: Error updating team names:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}