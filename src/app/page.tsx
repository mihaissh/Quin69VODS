import { Suspense } from "react";
import { fetchVods } from "@/lib/api";
import { VODS_PAGE_SIZE } from "@/lib/vodsPagination";
import { HomeArchiveClient } from "@/components/vods/HomeArchiveClient";
import type { FilterType, FilterOptions, Vod } from "@/types/vod";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    title?: string;
    game?: string;
    from?: string;
    to?: string;
  }>;
}

function parsePageParam(raw: string | null | undefined): number {
  if (raw == null || raw === "") return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

async function HomeArchiveServer({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const filter = (params.type as FilterType) || "Default";

  const filterOptions: FilterOptions = {};
  if (filter === "Title" && typeof params.title === "string") {
    filterOptions.title = params.title;
  } else if (filter === "Game" && typeof params.game === "string") {
    filterOptions.game = params.game;
  } else if (filter === "Date" && typeof params.from === "string" && typeof params.to === "string") {
    filterOptions.startDate = new Date(params.from);
    filterOptions.endDate = new Date(params.to + "T23:59:59");
  }

  let vods: Vod[] = [];
  let total = 0;
  let errorMessage: string | null = null;

  try {
    const res = await fetchVods({
      filter,
      filterOptions,
      page,
      limit: VODS_PAGE_SIZE,
    });
    vods = res.data;
    total = res.total;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load VODs";
  }

  return (
    <HomeArchiveClient
      initialVods={vods}
      initialTotal={total}
      initialError={errorMessage}
      page={page}
      filter={filter}
      filterOptions={filterOptions}
    />
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<HomeArchiveSuspenseFallback />}>
      <HomeArchiveServer searchParams={searchParams} />
    </Suspense>
  );
}

function HomeArchiveSuspenseFallback() {
  return (
    <main
      className="min-h-screen pt-12 animate-pulse"
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
