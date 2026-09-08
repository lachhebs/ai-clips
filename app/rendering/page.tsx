import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MonitorPlay, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RenderingPage() {
  const renderJobs = await prisma.renderJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      clip: {
        include: {
          project: { select: { id: true, name: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Rendering</h1>
        <p className="text-zinc-400 mt-1">
          {renderJobs.length} render job{renderJobs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {renderJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MonitorPlay className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No rendering jobs yet. Render clips from the clip detail page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {renderJobs.map((job) => (
            <Link key={job.id} href={`/clips/${job.clip.id}`}>
              <Card className="hover:bg-zinc-900 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{job.clip.title}</p>
                      <p className="text-sm text-zinc-400">{job.clip.project.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          job.status === "COMPLETED"
                            ? "default"
                            : job.status === "ACTIVE"
                            ? "secondary"
                            : job.status === "FAILED"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {job.status}
                      </Badge>
                      {job.status === "ACTIVE" && (
                        <span className="text-sm text-zinc-400">{job.progress}%</span>
                      )}
                      {job.completedAt && (
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" />
                          {new Date(job.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {job.error && (
                    <p className="text-sm text-red-400 mt-2">{job.error}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
