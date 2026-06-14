"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { VodFilters } from "./VodFilters";
import { VodGrid } from "./VodGrid";
import { VodPagination } from "./VodPagination";
import type { Vod, FilterType, FilterOptions } from "@/types/vod";

const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL ?? "Quin69";

interface HomeArchiveClientProps {
  initialVods: Vod[];
  initialTotal: number;
  initialError: string | null;
  page: number;
  filter: FilterType;
  filterOptions: FilterOptions;
}

export function HomeArchiveClient({
  initialVods,
  initialTotal,
  initialError,
  page,
  filter,
  filterOptions,
}: HomeArchiveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigatePage = useCallback(
    (next: number) => {
      const p = Math.max(1, next);
      const params = new URLSearchParams(searchParams.toString());
      if (p <= 1) params.delete("page");
      else params.set("page", String(p));
      
      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: true });
      });
    },
    [router, searchParams],
  );

  const handleFilterChange = useCallback(
    (f: FilterType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      
      // Update filter tab type and clean up obsolete filters
      if (f === "Default") {
        params.delete("type");
      } else {
        params.set("type", f);
      }
      params.delete("title");
      params.delete("game");
      params.delete("from");
      params.delete("to");

      startTransition(() => {
        router.replace(params.toString() ? `/?${params.toString()}` : "/", { scroll: false });
      });
    },
    [router, searchParams],
  );

  const handleOptionsChange = useCallback(
    (opts: FilterOptions) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      if (filter === "Title") {
        if (opts.title?.trim()) {
          params.set("title", opts.title.trim());
        } else {
          params.delete("title");
        }
      } else if (filter === "Game") {
        if (opts.game?.trim()) {
          params.set("game", opts.game.trim());
        } else {
          params.delete("game");
        }
      } else if (filter === "Date") {
        if (opts.startDate && opts.endDate) {
          params.set("from", opts.startDate.toISOString().split("T")[0]);
          params.set("to", opts.endDate.toISOString().split("T")[0]);
        } else {
          params.delete("from");
          params.delete("to");
        }
      }

      startTransition(() => {
        router.replace(params.toString() ? `/?${params.toString()}` : "/", { scroll: false });
      });
    },
    [router, filter, searchParams],
  );

  return (
    <main
      className="min-h-screen pt-12 animate-fade-in"
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
            {initialTotal > 0 && (
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
              >
                {initialTotal.toLocaleString()}
              </span>
            )}
          </div>

          <VodFilters
            filter={filter}
            filterOptions={filterOptions}
            totalVods={initialTotal}
            onFilterChange={handleFilterChange}
            onOptionsChange={handleOptionsChange}
          />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <VodGrid
          vods={initialVods}
          loading={isPending}
          isInitialLoad={false}
          error={initialError ? new Error(initialError) : null}
        />
        <VodPagination
          page={page}
          total={initialTotal}
          loading={isPending}
          onPageChange={navigatePage}
        />
      </div>
    </main>
  );
}
