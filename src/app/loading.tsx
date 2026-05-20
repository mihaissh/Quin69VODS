export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--color-bg-base)" }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--color-amber)", borderTopColor: "transparent" }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
