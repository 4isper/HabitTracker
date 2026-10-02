import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { AppStateStatus } from 'react-native';

import { getTodayKey, msUntilNextDay } from '../utils/date';

/**
 * Returns the current date key and keeps it fresh: it rolls over on its own at
 * midnight and re-syncs whenever the app comes back to the foreground, so
 * "today" never goes stale while the screen stays mounted.
 */
export function useTodayKey(): string {
  const [todayKey, setTodayKey] = useState<string>(getTodayKey);

  const sync = useCallback(() => {
    setTodayKey(getTodayKey());
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleRollover = () => {
      timeout = setTimeout(() => {
        sync();
        scheduleRollover();
      }, msUntilNextDay());
    };

    scheduleRollover();

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          sync();
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [sync]);

  return todayKey;
}