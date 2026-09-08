import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Film, Clock, FileVideo, Scissors } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      clips: { orderBy: { createdAt: "desc" }, take: 20 },
      jobs: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { clips: true, jobs: true } },
    },
  });

  if (!project) {
    notFound();
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <Badge
              variant={
                project.status === "COMPLETED"
                  ? "default"
                  : project.status === "PROCESSING"
                  ? "secondary"
                  : project.status === "FAILED"
                  ? "destructive"
                  : "outline"
              }
            >
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-zinc-400 mt-1">{project.description}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileVideo className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-white">{project._count.clips}</p>
              <p className="text-sm text-zinc-400">Clips</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-white">
                {project.duration ? formatTime(project.duration) : "—"}
              </p>
              <p className="text-sm text-zinc-400">Duration</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Film className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-white">{project._count.jobs}</p>
              <p className="text-sm text-zinc-400">Jobs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {project.clips.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Clips</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.clips.map((clip) => (
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
                    <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                      {clip.hook || clip.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {project.clips.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No clips generated yet. Upload a video and let AI find the best moments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
