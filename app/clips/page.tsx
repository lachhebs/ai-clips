import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Scissors, Clock, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClipsPage() {
  const clips = await prisma.clip.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      project: { select: { name: true } },
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
        <h1 className="text-3xl font-bold text-white">AI Clips</h1>
        <p className="text-zinc-400 mt-1">
          {clips.length} clip{clips.length !== 1 ? "s" : ""} generated
        </p>
      </div>

      {clips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No clips generated yet. Create a project and let AI find the best moments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clips.map((clip) => (
            <Link key={clip.id} href={`/clips/${clip.id}`}>
              <Card className="hover:bg-zinc-900 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-base line-clamp-1">
                      {clip.title || "Untitled Clip"}
                    </CardTitle>
                    <Badge variant={clip.status === "COMPLETED" ? "default" : "outline"}>
                      {clip.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                    {clip.hook || clip.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                    </div>
                    {clip.score?.virality && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {Math.round(clip.score.virality * 100)}% viral
                      </div>
                    )}
                    <span className="text-zinc-600">{clip.project.name}</span>
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
