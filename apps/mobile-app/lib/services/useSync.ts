import { checkWifi } from "@/hooks/useWifiChecker";
import { syncOutbox } from "./useOutboxSynx";
import { useEffect, useRef } from "react";

export function useSync(intervalMs = 10000) {
  const syncingRef = useRef(false);
  useEffect(() => {
    const sync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      console.log("Syncing...");
      try {
        const hasWifi = await checkWifi();

        if (!hasWifi) {
          console.log("No wifi connection");
          return;
        }
        await syncOutbox();
        console.log("Synced");
      } finally {
        syncingRef.current = false;
      }
    };

    sync();
    const interval = setInterval(sync, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
}
