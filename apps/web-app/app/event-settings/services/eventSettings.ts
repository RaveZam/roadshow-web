import { createClient } from "@/utils/supabase/client";

export type EventSettings = {
  id: string;
  start_date: string;
  end_date: string;
  morning_in: string;
  morning_in_cutoff: string;
  morning_out: string;
  morning_out_cutoff: string;
  afternoon_in: string;
  afternoon_in_cutoff: string;
  afternoon_out: string;
  afternoon_out_cutoff: string;
  created_at: string;
  updated_at: string;
};

export type EventSettingsInput = {
  start_date: string;
  end_date: string;
  morning_in: string;
  morning_in_cutoff: string;
  morning_out: string;
  morning_out_cutoff: string;
  afternoon_in: string;
  afternoon_in_cutoff: string;
  afternoon_out: string;
  afternoon_out_cutoff: string;
};

export async function fetchEventSettings(): Promise<EventSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("event_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertEventSettings(
  input: EventSettingsInput,
  existingId?: string,
): Promise<EventSettings> {
  const supabase = createClient();

  if (existingId) {
    const { data, error } = await supabase
      .from("event_settings")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", existingId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from("event_settings")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
