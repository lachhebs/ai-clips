import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Film, Scissors, Brain } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [projectCount, clipCount, recentProjects] = await Promise.all([
    prisma.project.count(),
    prisma.clip.count(),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { clips: true } } },
    }),
  ]);

  const completedProjects = await prisma.project.count({
    where: { status: "COMPLETED" },
  });

  const stats = [
    { label: "Total Projects", value: projectCount, icon: Film },
    { label: "Total Clips", value: clipCount, icon: Scissors },
    { label: "Completed", value: completedProjects, icon: Brain },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Manage your video projects and AI-generated clips
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Upload className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <p className="text-zinc-400 text-sm">
              No projects yet.{" "}
              <Link href="/projects/new" className="text-blue-500 hover:underline">
                Create your first project
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Film className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-zinc-400">
                        {project._count.clips} clips
                      </p>
                    </div>
                  </div>
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
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
