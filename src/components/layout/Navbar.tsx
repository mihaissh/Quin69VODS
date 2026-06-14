"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL ?? "Quin69";

interface LiveStatus { isLive: boolean; viewers?: number }

function useTwitchStatus(): LiveStatus {
  const [status, setStatus] = useState<LiveStatus>({ isLive: false });
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/twitch/viewercount');
        const text = await res.text();
        const n = parseInt(text, 10);
        setStatus({ isLive: !isNaN(n) && n > 0, viewers: isNaN(n) ? undefined : n });
      } catch { /* ignore */ }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

export default function Navbar() {
  const pathname = usePathname();
  const { isLive, viewers } = useTwitchStatus();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-200"
      style={{
        background: scrolled
          ? "rgba(17,17,16,0.96)"
          : "rgba(17,17,16,0.82)",
        borderBottom: `1px solid ${scrolled ? "var(--color-border)" : "transparent"}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-4"
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 select-none"
          aria-label={`${CHANNEL} VOD archive`}
        >
          {/* Amber square mark */}
          <span
            className="w-7 h-7 flex items-center justify-center rounded font-black text-sm"
            style={{
              background: "var(--color-amber)",
              color: "#111110",
              letterSpacing: "-0.05em",
            }}
          >
            {CHANNEL[0]?.toUpperCase()}
          </span>
          <span
            className="font-semibold text-sm tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {CHANNEL}
            <span
              className="font-normal ml-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              archive
            </span>
          </span>
        </Link>

        {/* Separator */}
        <span
          className="hidden sm:block text-xs"
          style={{ color: "var(--color-border-strong)" }}
        >
          /
        </span>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-0.5">
          <NavLink href="/" active={pathname === "/" || pathname.startsWith("/vods") || pathname === "/vods"}>
            VODs
          </NavLink>
          <NavLink href="/playlist" active={pathname === "/playlist"}>
            Playlist
          </NavLink>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Live badge */}
        {isLive && (
          <a
            href={`https://twitch.tv/${CHANNEL.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold"
            style={{
              background: "var(--color-live-dim)",
              color: "var(--color-live)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inset-0 rounded-full opacity-80"
                style={{
                  background: "var(--color-live)",
                  animation: "live-ping 1.2s ease-out infinite",
                }}
              />
              <span
                className="relative rounded-full h-1.5 w-1.5"
                style={{ background: "var(--color-live)" }}
              />
            </span>
            LIVE
            {viewers !== undefined && (
              <span className="opacity-70">· {viewers.toLocaleString()}</span>
            )}
          </a>
        )}

        {/* Twitch link */}
        <a
          href={`https://twitch.tv/${CHANNEL.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-opacity duration-100 opacity-50 hover:opacity-90"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Twitch channel"
        >
          <Icon icon="simple-icons:twitch" className="w-3.5 h-3.5" style={{ color: "#9146ff" }} />
          <span className="hidden sm:inline">Twitch</span>
        </a>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1 rounded text-sm transition-colors duration-100"
      style={{
        color: active ? "var(--color-amber)" : "var(--color-text-muted)",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </Link>
  );
}
