import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "videos";

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseKey);
}

export async function uploadToSupabase(
  filePath: string,
  file: File | Buffer,
  contentType?: string
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, path: data.path };
}

export async function deleteFromSupabase(filePath: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw error;
}
