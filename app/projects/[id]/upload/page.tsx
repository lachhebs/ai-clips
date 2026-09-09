"use client";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileVideo, Upload, X } from "lucide-react";
import Link from "next/link";

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 500 * 1024 * 1024) {
        setError("File size must be less than 500MB");
        return;
      }
      setFile(selected);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", id);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      // Start processing
      await fetch(`/api/projects/${id}/process`, { method: "POST" });

      router.push(`/projects/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Video</h1>
          <p className="text-zinc-400 mt-1">Upload a video to start AI analysis</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Select Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center cursor-pointer hover:border-zinc-500 transition-colors"
            >
              <FileVideo className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
              <p className="text-zinc-300 text-lg">Click to upload a video</p>
              <p className="text-sm text-zinc-500 mt-2">MP4, WebM, MOV, AVI (max 500MB)</p>
            </div>
          ) : (
            <div className="border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileVideo className="h-10 w-10 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{file.name}</p>
                  <p className="text-sm text-zinc-400">{formatFileSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href={`/projects/${id}`}>Cancel</Link>
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload & Process
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
