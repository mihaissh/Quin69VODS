export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function VodCardSkeleton() {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--color-bg-surface)" }}
    >
      <Skeleton style={{ aspectRatio: "16/9", borderRadius: 0 }} />
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2">
        <Skeleton style={{ height: 16, width: "90%" }} />
        <Skeleton style={{ height: 14, width: "55%" }} />
        <div className="flex gap-1.5">
          <Skeleton style={{ height: 20, width: 64 }} />
          <Skeleton style={{ height: 20, width: 56 }} />
        </div>
      </div>
    </div>
  );
}
