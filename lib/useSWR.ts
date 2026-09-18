"use client";

// Minimal SWR-like hook (no extra dependency): caches per URL, revalidates on mount.
import { useCallback, useEffect, useRef, useState } from "react";

const cache = new Map<string, unknown>();

export default function useSWR<T>(key: string, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(() =>
    cache.has(key) ? (cache.get(key) as T) : undefined
  );
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(!cache.has(key));
  const mounted = useRef(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const fresh = await fetcher(key);
      cache.set(key, fresh);
      if (mounted.current) {
        setData(fresh);
        setError(null);
      }
      return fresh;
    } catch (e) {
      if (mounted.current) setError(e);
      throw e;
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    mounted.current = true;
    mutate().catch(() => {});
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, error, isLoading, mutate };
}

export function bustCache(prefix = "/api") {
  for (const k of [...cache.keys()]) if (k.startsWith(prefix)) cache.delete(k);
}
