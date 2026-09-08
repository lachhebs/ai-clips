import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, Clock, Film } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExportsPage() {
  const completedClips = await prisma.clip.findMany({
    where: { status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      project: { select: { id: true, name: true } },
      score: true,
    },
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Exports</h1>
        <p className="text-zinc-400 mt-1">
          {completedClips.length} completed clip{completedClips.length !== 1 ? "s" : ""}
        </p>
      </div>

      {completedClips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No completed exports yet. Process videos to generate clips.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {completedClips.map((clip) => (
            <Card key={clip.id} className="hover:bg-zinc-900 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-base line-clamp-1">
                    {clip.title}
                  </CardTitle>
                  <Badge variant="default">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                  {clip.hook || clip.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Film className="h-3 w-3" />
                      {clip.project.name}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/clips/${clip.id}`}>View</Link>
                    </Button>
                    {clip.outputPath && (
                      <Button size="sm" asChild>
                        <a href={clip.outputPath} download>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
