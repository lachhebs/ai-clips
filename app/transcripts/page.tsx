import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TranscriptsPage() {
  const transcripts = await prisma.transcript.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { segments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Transcripts</h1>
        <p className="text-zinc-400 mt-1">
          {transcripts.length} transcript{transcripts.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {transcripts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No transcripts yet. Process a video to generate transcripts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {transcripts.map((t) => (
            <Link key={t.id} href={`/projects/${t.project.id}`}>
              <Card className="hover:bg-zinc-900 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="text-white text-base">{t.project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 line-clamp-3 mb-3">{t.fullText}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{t.language}</span>
                    <span>{t._count.segments} segments</span>
                    {t.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
