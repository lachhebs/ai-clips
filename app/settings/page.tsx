import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Cloud, Brain, FileText } from "lucide-react";

export default function SettingsPage() {
  const sections = [
    {
      title: "Database",
      icon: Database,
      description: "Neon PostgreSQL for storing projects, clips, and metadata",
      status: "Connected",
    },
    {
      title: "Storage",
      icon: Cloud,
      description: "Vercel Blob for video file storage",
      status: "Active",
    },
    {
      title: "Transcription",
      icon: FileText,
      description: "OpenAI Whisper API for audio transcription",
      status: "Ready",
    },
    {
      title: "AI Analysis",
      icon: Brain,
      description: "Qwen AI for clip discovery and scoring",
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

      <div className="grid gap-4 md:grid-cols-2">
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
          <CardTitle className="text-white">Required Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { name: "DATABASE_URL", desc: "Neon PostgreSQL connection string" },
              { name: "BLOB_READ_WRITE_TOKEN", desc: "Vercel Blob storage token" },
              { name: "OPENAI_API_KEY", desc: "OpenAI API key for Whisper transcription" },
              { name: "QWEN_API_KEY", desc: "DashScope API key for Qwen AI" },
            ].map((env) => (
              <div key={env.name} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                <div>
                  <code className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded">{env.name}</code>
                  <p className="text-xs text-zinc-500 mt-1">{env.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
