import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Clock, Star, Film } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const clip = await prisma.clip.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      score: true,
    },
  });

  if (!clip) {
    notFound();
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clips">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{clip.title || "Untitled Clip"}</h1>
            <Badge variant={clip.status === "COMPLETED" ? "default" : "outline"}>
              {clip.status}
            </Badge>
          </div>
          <p className="text-zinc-400 mt-1">
            From{" "}
            <Link href={`/projects/${clip.project.id}`} className="text-blue-400 hover:underline">
              {clip.project.name}
            </Link>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Time Range</p>
                <p className="text-white">
                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)} ({Math.round(clip.duration)}s)
                </p>
              </div>
            </div>
            {clip.hook && (
              <div>
                <p className="text-sm text-zinc-400 mb-1">Hook</p>
                <p className="text-white">{clip.hook}</p>
              </div>
            )}
            {clip.description && (
              <div>
                <p className="text-sm text-zinc-400 mb-1">Description</p>
                <p className="text-zinc-300">{clip.description}</p>
              </div>
            )}
            {clip.transcript && (
              <div>
                <p className="text-sm text-zinc-400 mb-1">Transcript</p>
                <p className="text-zinc-300 text-sm">{clip.transcript}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {clip.score && (
          <Card>
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                AI Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Virality", value: clip.score.virality },
                  { label: "Hook", value: clip.score.hook },
                  { label: "Emotion", value: clip.score.emotion },
                  { label: "Surprise", value: clip.score.surprise },
                  { label: "Story", value: clip.score.story },
                  { label: "Clarity", value: clip.score.clarity },
                  { label: "Visual", value: clip.score.visual },
                  { label: "Overall", value: clip.score.overall },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">{label}</span>
                    <span className="text-white font-medium">{Math.round(value * 100)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {clip.reasoning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Film className="h-5 w-5 text-purple-500" />
              AI Reasoning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300">{clip.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
