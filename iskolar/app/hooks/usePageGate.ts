"use client";

import { useMemo, useRef, useState } from "react";

type TaskMap = Record<string, boolean>;

export function usePageGate(initial: TaskMap) {
  const tasksRef = useRef<TaskMap>({ ...initial });
  const [, force] = useState(0);

  const api = useMemo(() => ({
    setTaskLoading(task: string, loading: boolean) {
      if (tasksRef.current[task] === loading) return;
      tasksRef.current[task] = loading;
      force((n) => n + 1);
    },
    allDone(): boolean {
      return Object.values(tasksRef.current).every((v) => v === false);
    },
    state: tasksRef.current,
  }), []);

  return api;
}
