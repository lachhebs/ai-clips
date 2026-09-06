import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default function TranscriptsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Transcripts</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
        <p className="text-zinc-400">No transcripts yet.</p>
        <p className="text-sm text-zinc-500 mt-2">
          Transcripts will appear here after processing videos with Whisper.
        </p>
      </div>
    </div>
  );
}
