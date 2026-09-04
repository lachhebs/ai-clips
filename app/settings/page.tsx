import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, HardDrive, Cpu } from "lucide-react";

export default function SettingsPage() {
  const sections = [
    {
      title: "Database",
      icon: Database,
      description: "PostgreSQL database for storing projects, clips, and metadata",
      status: "Connected",
    },
    {
      title: "Storage",
      icon: HardDrive,
      description: "Local file storage for uploaded videos and generated clips",
      status: "Active",
    },
    {
      title: "Processing",
      icon: Cpu,
      description: "FFmpeg for video processing, Whisper for transcription",
      status: "Ready",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">
          System configuration and status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-white">{section.title}</CardTitle>
                  <p className="text-sm text-green-500">{section.status}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">{section.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400">DATABASE_URL</span>
              <code className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded">
                postgresql://***@localhost:5432/ai_clips
              </code>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400">REDIS_URL</span>
              <code className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded">
                redis://localhost:6379
              </code>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400">WHISPER_MODEL</span>
              <code className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded">
                small
              </code>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-400">STORAGE_PATH</span>
              <code className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded">
                ./storage
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
