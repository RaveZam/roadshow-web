import * as Network from "expo-network";

export async function checkWifi(): Promise<boolean> {
  const networkState = await Network.getNetworkStateAsync();
  return networkState.type === Network.NetworkStateType.WIFI;
}
