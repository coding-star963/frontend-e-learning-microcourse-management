import { useEffect, useRef } from 'react';
import api from '../services/api';

const SYNC_INTERVAL_MS = 4000;

/**
 * Calls onChange whenever the server's data changes (e.g. a student enrolls
 * or completes a lesson on the mobile app, or another admin suspends an
 * account). Polls the cheap GET /api/sync marker while the tab is visible.
 */
export function useLiveSync(onChange) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    let version = null;
    let stopped = false;
    let timer;

    const tick = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const response = await api.get('/sync');
          const next = response.data.version;
          if (version !== null && next !== version && !stopped) {
            onChangeRef.current();
          }
          version = next;
        } catch {
          // A missed check is retried on the next tick.
        }
      }
      if (!stopped) timer = setTimeout(tick, SYNC_INTERVAL_MS);
    };

    tick();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);
}
