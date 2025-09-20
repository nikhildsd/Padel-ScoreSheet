'use client';

import { useEffect, useRef } from 'react';

export function useKeepAlive(enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const keepAlive = async () => {
      try {
        // Silent fetch to keep the serverless function warm
        await fetch('/api/keep-alive', {
          method: 'GET',
          cache: 'no-cache'
        });
      } catch (error) {
        // Silently fail - we don't want to show errors for keep-alive
        console.debug('Keep-alive request failed:', error);
      }
    };

    // Ping every 60 seconds (1 minute)
    intervalRef.current = setInterval(keepAlive, 60000);

    // Also ping immediately when the hook mounts
    keepAlive();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]);

  // Return a function to manually trigger keep-alive if needed
  const triggerKeepAlive = async () => {
    try {
      await fetch('/api/keep-alive', {
        method: 'GET',
        cache: 'no-cache'
      });
    } catch (error) {
      console.debug('Manual keep-alive failed:', error);
    }
  };

  return { triggerKeepAlive };
}