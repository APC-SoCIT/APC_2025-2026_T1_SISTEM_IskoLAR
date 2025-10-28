export async function timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[perf] ${label}: ${(performance.now() - t0).toFixed(1)}ms`);
    }
  }
}

export function perfMark(label: string) {
  if (process.env.NODE_ENV !== "production") {
    performance.mark(label);
  }
}

export function perfMeasure(name: string, startMark: string, endMark: string) {
  if (process.env.NODE_ENV !== "production") {
    try {
      const measure = performance.measure(name, startMark, endMark);
      console.log(`[perf] ${name}: ${measure.duration.toFixed(1)}ms`);
    } catch (e) {
      // Marks may not exist
    }
  }
}
