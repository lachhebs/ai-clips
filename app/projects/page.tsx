import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Film, Clock, FileVideo } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { clips: true, jobs: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Upload className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Film className="h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center">
              No projects yet. Upload a video to get started.
            </p>
            <Button asChild className="mt-4">
              <Link href="/projects/new">Create Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:bg-zinc-900 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg">
                      {project.name}
                    </CardTitle>
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
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-1">
                      <FileVideo className="h-4 w-4" />
                      {project._count.clips} clips
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {project.description && (
                    <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                      {project.description}
                    </p>
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
