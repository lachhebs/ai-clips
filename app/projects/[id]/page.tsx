import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Film, Clock, FileVideo, Scissors, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      clips: { orderBy: { createdAt: "desc" }, take: 20, include: { score: true } },
      jobs: { orderBy: { createdAt: "desc" }, take: 10 },
      transcript: { include: { segments: true } },
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

      {/* Video Player */}
      {project.videoUrl && (
        <Card>
          <CardContent className="p-0">
            <video
              src={project.videoUrl}
              controls
              className="w-full rounded-lg max-h-[500px]"
            />
          </CardContent>
        </Card>
      )}

      {/* No video uploaded yet */}
      {!project.videoUrl && project.status === "UPLOADING" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileVideo className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center mb-4">
              No video uploaded yet.
            </p>
            <Button asChild>
              <Link href={`/projects/${project.id}/upload`}>
                Upload Video
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {project.status === "PROCESSING" && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="text-white">Processing video...</p>
            </div>
            {project.jobs[0] && (
              <p className="text-sm text-zinc-400 mt-2">{project.jobs[0].message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Scissors className="h-8 w-8 text-blue-500" />
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

      {/* Clips */}
      {project.clips.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">AI-Generated Clips</h2>
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
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                      </div>
                      {clip.score && (
                        <span className="text-yellow-500">
                          {Math.round(clip.score.overall * 100)}%
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {project.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white text-lg">Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300 text-sm max-h-60 overflow-y-auto">
              {project.transcript.fullText}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {project.clips.length === 0 && project.status === "COMPLETED" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No clips found. The AI analysis may not have found suitable moments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
