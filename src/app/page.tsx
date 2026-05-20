"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { VodFilters } from "@/components/vods/VodFilters";
import { VodGrid } from "@/components/vods/VodGrid";
import { VodPagination } from "@/components/vods/VodPagination";
import { useVodsList } from "@/hooks/useVods";
import { vodsTotalPages } from "@/lib/vodsPagination";
import type { FilterType, FilterOptions } from "@/types/vod";

const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL ?? "Quin69";

function parsePageParam(raw: string | null): number {
  if (raw == null || raw === "") return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function HomeArchiveBody() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filter, setFilter]               = useState<FilterType>("Default");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  const pageFromUrl = useMemo(
    () => parsePageParam(searchParams.get("page")),
    [searchParams],
  );

  const { vods, total, loading, error, isInitialLoad } = useVodsList(
    filter,
    filterOptions,
    pageFromUrl,
  );

  const totalPages = vodsTotalPages(total);

  useEffect(() => {
    if (total > 0 && pageFromUrl > totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      if (totalPages <= 1) params.delete("page");
      else params.set("page", String(totalPages));
      const q = params.toString();
      router.replace(q ? `/?${q}` : "/", { scroll: false });
    }
  }, [total, totalPages, pageFromUrl, router, searchParams]);

  const navigatePage = useCallback(
    (next: number) => {
      const p = Math.max(1, next);
      const params = new URLSearchParams(searchParams.toString());
      if (p <= 1) params.delete("page");
      else params.set("page", String(p));
      const q = params.toString();
      router.push(q ? `/?${q}` : "/", { scroll: true });
    },
    [router, searchParams],
  );

  const handleFilterChange = useCallback(
    (f: FilterType) => {
      setFilter(f);
      setFilterOptions({});
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      const q = params.toString();
      router.replace(q ? `/?${q}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  const handleOptionsChange = useCallback(
    (opts: FilterOptions) => {
      setFilterOptions(opts);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      const q = params.toString();
      router.replace(q ? `/?${q}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <main
      className="min-h-screen pt-12"
      style={{ background: "var(--color-bg-base)" }}
    >
      <div>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1
              className="text-2xl font-black tracking-tight mb-1"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}
            >
              {CHANNEL}
              <span style={{ color: "var(--color-amber)" }}> /</span>
              {" "}
              archive
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
            >
              VOD archive with chat replay · game chapters · timestamp sharing
            </p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}
            >
              All VODs
            </span>
            {total > 0 && (
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
              >
                {total.toLocaleString()}
              </span>
            )}
          </div>

          <VodFilters
            filter={filter}
            filterOptions={filterOptions}
            totalVods={total}
            onFilterChange={handleFilterChange}
            onOptionsChange={handleOptionsChange}
          />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <VodGrid
          vods={vods}
          loading={loading}
          isInitialLoad={isInitialLoad}
          error={error}
        />
        <VodPagination
          page={pageFromUrl}
          total={total}
          loading={loading}
          onPageChange={navigatePage}
        />
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<HomeArchiveSuspenseFallback />}>
        <HomeArchiveBody />
      </Suspense>
    </>
  );
}

function HomeArchiveSuspenseFallback() {
  return (
    <main
      className="min-h-screen pt-12"
      style={{ background: "var(--color-bg-base)" }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-amber)", borderTopColor: "transparent" }}
        />
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Loading archive…</p>
      </div>
    </main>
  );
}
