"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchVods } from "@/lib/api";
import { VODS_PAGE_SIZE } from "@/lib/vodsPagination";
import type { Vod, FilterType, FilterOptions } from "@/types/vod";

export function useVodsList(
  filter: FilterType,
  filterOptions: FilterOptions,
  page: number,
) {
  const [vods, setVods]               = useState<Vod[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const load = useCallback(
    async (pageNum: number) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      setError(null);

      try {
        const res = await fetchVods({
          filter,
          filterOptions,
          page: pageNum,
          limit: VODS_PAGE_SIZE,
          signal: ctrl.signal,
        });
        setTotal(res.total ?? 0);
        setVods(res.data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(e as Error);
      } finally {
        setIsInitialLoad(false);
        setLoading(false);
      }
    },
    [filter, filterOptions],
  );

  useEffect(() => {
    void load(page);
    return () => {
      abortRef.current?.abort();
    };
  }, [load, page]);

  return {
    vods,
    total,
    loading,
    error,
    isInitialLoad,
  };
}
