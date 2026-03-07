import { createClient } from "@/utils/supabase/client";

export type Section = {
  id: string;
  name: string;
  created_at: string;
};

export async function fetchSections() {
  const supabase = createClient();

  return supabase
    .from("sections")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });
}

export async function createSection(name: string) {
  const supabase = createClient();

  return supabase
    .from("sections")
    .insert([{ name }])
    .select("id, name, created_at")
    .single();
}

export async function updateSection(id: string, name: string) {
  const supabase = createClient();

  return supabase
    .from("sections")
    .update({ name })
    .eq("id", id)
    .select("id, name, created_at")
    .single();
}

export async function deleteSection(id: string) {
  const supabase = createClient();

  return supabase.from("sections").delete().eq("id", id);
}
