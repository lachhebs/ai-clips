"use client";

import { useState, useCallback, useEffect } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let globalToasts: Toast[] = [];
let globalListeners: Array<(toasts: Toast[]) => void> = [];

function emitChange() {
  for (const listener of globalListeners) {
    listener([...globalToasts]);
  }
}

export function toast({
  title,
  description,
  variant = "default",
}: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast = { id, title, description, variant };
  globalToasts = [...globalToasts, newToast];
  emitChange();

  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    emitChange();
  }, 5000);

  return { id, dismiss: () => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    emitChange();
  }};
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  useEffect(() => {
    globalListeners.push(setToasts);
    return () => {
      globalListeners = globalListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    emitChange();
  }, []);

  return { toasts, toast, dismiss };
}
