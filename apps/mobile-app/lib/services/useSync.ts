import { checkWifi } from "@/hooks/useWifiChecker";
import { syncOutbox } from "./useOutboxSynx";
import { useEffect } from "react";

export function useSync(intervalMs = 10000) {
  useEffect(() => {
    const sync = async () => {
      const hasWifi = await checkWifi();
      console.log("wifi status:", hasWifi);
      if (!hasWifi) return;
      await syncOutbox();
    };

    sync();
    const interval = setInterval(sync, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
}
