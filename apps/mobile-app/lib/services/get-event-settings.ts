import { supabase } from "../supabase";
import {
  clearEventSettings,
  getLocalUpdatedAt,
  upsertEventSettings,
  type EventSettings,
} from "../sqlite/dao/event-settings-dao";

export async function syncEventSettingsFromApi() {
  // First, check remote updated_at against local
  const { data: remoteRow, error: checkError } = await supabase
    .from("event_settings")
    .select("updated_at")
    .limit(1)
    .single();

  if (checkError || !remoteRow) {
    console.warn("Failed to check event_settings updated_at:", checkError?.message);
    return null;
  }

  const localUpdatedAt = getLocalUpdatedAt();
  const remoteUpdatedAt = remoteRow.updated_at as string;

  // Skip sync if local data is already up to date
  if (localUpdatedAt && localUpdatedAt >= remoteUpdatedAt) {
    console.log("[sync] event_settings already up to date");
    return null;
  }

  // Fetch full row and replace local data
  const { data, error } = await supabase
    .from("event_settings")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    console.warn("Failed to sync event_settings:", error?.message);
    return null;
  }

  const settings = data as EventSettings;

  clearEventSettings();
  upsertEventSettings(settings);

  console.log("[sync] event_settings synced, updated_at:", settings.updated_at);
  return settings;
}
