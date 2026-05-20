import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-12 flex items-center justify-center"
        style={{ background: "var(--color-bg-base)" }}
      >
        <div className="text-center px-4">
          <p
            className="text-7xl font-black mb-3"
            style={{ color: "var(--color-amber)", letterSpacing: "-0.05em", fontFamily: "var(--font-mono)" }}
          >
            404
          </p>
          <h1
            className="text-lg font-bold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Not found
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
            That VOD or page doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold"
            style={{ background: "var(--color-amber)", color: "#111110" }}
          >
            ← Back to archive
          </Link>
        </div>
      </main>
    </>
  );
}
