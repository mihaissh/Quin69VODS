"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import type { FilterType, FilterOptions } from "@/types/vod";

interface VodFiltersProps {
  filter: FilterType;
  filterOptions: FilterOptions;
  totalVods: number;
  onFilterChange: (f: FilterType) => void;
  onOptionsChange: (o: FilterOptions) => void;
}

const TABS: { id: FilterType; label: string; icon: string }[] = [
  { id: "Default", label: "Recent",  icon: "mdi:clock-outline"    },
  { id: "Title",   label: "Search",  icon: "mdi:magnify"          },
  { id: "Game",    label: "Game",    icon: "mdi:controller"       },
  { id: "Date",    label: "Date",    icon: "mdi:calendar-range"   },
];

const INPUT_STYLE: React.CSSProperties = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  borderRadius: "var(--radius-md)",
  padding: "8px 12px",
  fontSize: "0.875rem",
  outline: "none",
  width: "100%",
};

export function VodFilters({
  filter,
  filterOptions,
  totalVods,
  onFilterChange,
  onOptionsChange,
}: VodFiltersProps) {
  const [search, setSearch] = useState(filterOptions.title ?? "");
  const [game, setGame]     = useState(filterOptions.game ?? "");
  const [start, setStart]   = useState(filterOptions.startDate ? toDateStr(filterOptions.startDate) : "");
  const [end, setEnd]       = useState(filterOptions.endDate   ? toDateStr(filterOptions.endDate)   : "");

  function changeTab(id: FilterType) {
    // No-op if the tab is already active — prevents a new {} reference from
    // being passed to filterOptions which would otherwise trigger a redundant fetch.
    if (id === filter) return;
    setSearch(""); setGame(""); setStart(""); setEnd("");
    onFilterChange(id);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tab row + count */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="flex items-center gap-0 rounded overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
          role="tablist"
        >
          {TABS.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => changeTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors duration-100"
                style={{
                  background: active ? "var(--color-amber)" : "var(--color-bg-elevated)",
                  color: active ? "#111110" : "var(--color-text-muted)",
                  fontWeight: active ? 600 : 400,
                  borderRight: "1px solid var(--color-border)",
                }}
              >
                <Icon icon={tab.icon} className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {totalVods > 0 && (
          <span
            className="ml-auto text-xs font-tabular"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {totalVods.toLocaleString()} VODs
          </span>
        )}
      </div>

      {/* Input area */}
      {filter === "Title" && (
        <form
          onSubmit={(e) => { e.preventDefault(); onOptionsChange({ title: search }); }}
        >
          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value === "") onOptionsChange({ title: "" });
              }}
              placeholder="Search by title…"
              style={{ ...INPUT_STYLE, paddingLeft: 36 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-amber)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
              autoFocus
            />
          </div>
        </form>
      )}

      {filter === "Game" && (
        <form
          onSubmit={(e) => { e.preventDefault(); onOptionsChange({ game }); }}
        >
          <div className="relative">
            <Icon
              icon="mdi:controller"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              type="search"
              value={game}
              onChange={(e) => {
                setGame(e.target.value);
                if (e.target.value === "") onOptionsChange({ game: "" });
              }}
              placeholder="Filter by game name…"
              style={{ ...INPUT_STYLE, paddingLeft: 36 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-amber)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
              autoFocus
            />
          </div>
        </form>
      )}

      {filter === "Date" && (
        <form
          className="flex flex-wrap gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!start || !end) return;
            onOptionsChange({
              startDate: new Date(start),
              endDate:   new Date(end + "T23:59:59"),
            });
          }}
        >
          {(["From", "To"] as const).map((label, i) => {
            const val   = i === 0 ? start : end;
            const setFn = i === 0 ? setStart : setEnd;
            return (
              <div key={label} className="flex-1 min-w-[160px]">
                <label
                  className="block text-xs mb-1"
                  style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
                >
                  {label}
                </label>
                <input
                  type="date"
                  value={val}
                  onChange={(e) => setFn(e.target.value)}
                  style={{ ...INPUT_STYLE, colorScheme: "dark" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-amber)")}
                  onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
                />
              </div>
            );
          })}
          <button
            type="submit"
            disabled={!start || !end}
            className="px-4 py-2 rounded text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--color-amber)", color: "#111110" }}
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}

function toDateStr(d: Date) { return d.toISOString().split("T")[0] ?? ""; }
