"use client";

import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex w-80 items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-lg"
        >
          <div className="flex-1">
            {toast.title && (
              <p className="text-sm font-medium text-white">{toast.title}</p>
            )}
            {toast.description && (
              <p className="mt-1 text-sm text-zinc-400">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-zinc-500 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
