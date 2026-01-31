/**
 * usePolling Hook
 * Generic polling hook for periodic data fetching
 */

import { useEffect, useRef } from "react";

interface UsePollingOptions {
  interval: number; // Polling interval in milliseconds
  enabled: boolean; // Whether polling is enabled
}

/**
 * Hook for polling a callback function at regular intervals
 * @param callback - Function to call periodically
 * @param options - Polling options (interval, enabled)
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions
): void {
  const { interval, enabled } = options;
  const savedCallback = useRef<() => void | Promise<void>>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const tick = async (): Promise<void> => {
      if (savedCallback.current) {
        await savedCallback.current();
      }
    };

    // Call immediately on mount
    tick();

    // Then set up interval
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
}
