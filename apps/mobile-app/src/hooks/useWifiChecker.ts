import * as Network from "expo-network";
import { useState } from "react";

export async function useWifiChecker() {
  const [hasWifi, setHasWifi] = useState(false);
  const networkState = await Network.getNetworkStateAsync();

  if (networkState.type === Network.NetworkStateType.WIFI) {
    setHasWifi(true);
  } else {
    setHasWifi(false);
  }

  return hasWifi;
}
