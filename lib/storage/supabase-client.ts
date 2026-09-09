"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getSupabaseBrowser() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function uploadVideoFromBrowser(
  file: File,
  projectId: string
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseBrowser();

  const ext = file.name.split(".").pop() || "mp4";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `videos/${uniqueName}`;

  const { error } = await supabase.storage
    .from("videos")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("videos")
    .getPublicUrl(filePath);

  // Update project record via API
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId,
      url: urlData.publicUrl,
      path: filePath,
      size: file.size,
      name: file.name,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update project");
  }

  return { url: urlData.publicUrl, path: filePath };
}
