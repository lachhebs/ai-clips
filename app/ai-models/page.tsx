import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Check, X } from "lucide-react";

export default async function AIModelsPage() {
  const providers = await prisma.aIProvider.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Models</h1>
        <p className="text-zinc-400 mt-1">
          Configure your AI providers for clip discovery and analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{provider.name}</CardTitle>
                    <p className="text-sm text-zinc-400">{provider.type}</p>
                  </div>
                </div>
                {provider.isDefault && (
                  <Badge variant="default">Default</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {provider.model && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Model</span>
                    <span className="text-white">{provider.model}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">API Key</span>
                  <span className="text-white flex items-center gap-1">
                    {provider.apiKey ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        Configured
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-red-500" />
                        Missing
                      </>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {providers.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400 text-center">
                No AI providers configured. Add your API keys in the .env file.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
