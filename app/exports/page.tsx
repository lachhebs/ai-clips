import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ExportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Exports</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
        <Download className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
        <p className="text-zinc-400">No exports yet.</p>
        <p className="text-sm text-zinc-500 mt-2">
          Completed video exports will appear here for download.
        </p>
      </div>
    </div>
  );
}
