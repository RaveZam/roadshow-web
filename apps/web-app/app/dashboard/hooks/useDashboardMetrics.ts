"use client";

import { useEffect, useState } from "react";
import { fetchDashboardMetrics } from "@/app/dashboard/services/dashboardMetrics";
import type { DashboardMetrics } from "../types/master-types";

export function useDashboardMetrics(enabled: boolean) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState("");

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoadingMetrics(true);
      setMetricsError("");

      const result = await fetchDashboardMetrics();
      setIsLoadingMetrics(false);

      if (result.error) {
        setMetricsError(result.error.message);
        return;
      }

      setMetrics(result.data);
    };

    if (enabled) {
      loadMetrics();
    }
  }, [enabled]);

  return { metrics, isLoadingMetrics, metricsError };
}
