import { checkWifi } from "@/hooks/useWifiChecker";
import { syncOutbox } from "./useOutboxSynx";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSync(intervalMs = 10000) {
  const syncingRef = useRef(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const hasWifi = await checkWifi();
      if (!hasWifi) return;
      const { synced, failed } = await syncOutbox();
      console.log(`Synced ${synced} out of ${synced + failed} entries`);
      if (synced > 0) {
        setSyncedCount(synced);
        setSnackbarVisible(true);
        setTimeout(() => setSnackbarVisible(false), 3000);
      }
    } finally {
      syncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    sync();
    const interval = setInterval(sync, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs, sync]);

  const hideSyncedSnackbar = useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  return {
    sync,
    syncedSnackbarVisible: snackbarVisible,
    syncedCount,
    hideSyncedSnackbar,
  };
}
