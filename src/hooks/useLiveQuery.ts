import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

export function useLiveQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = [],
): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    const observable = liveQuery(queryFn);
    const sub = observable.subscribe({
      next: (value) => setData(value),
      error: (err) => console.error("Live query error:", err),
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}