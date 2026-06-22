import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-surface-2", className)}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-5">
      <Bone className="mb-3 h-4 w-24" />
      <Bone className="h-8 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1">
      <div className="border-b border-hairline px-4 py-3">
        <Bone className="h-4 w-full max-w-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-hairline px-4 py-3 last:border-0"
        >
          <Bone className="h-4 w-32" />
          <Bone className="h-4 w-24" />
          <Bone className="h-4 w-20" />
          <Bone className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-hairline bg-surface-1 p-5"
        >
          <Bone className="mb-3 h-5 w-32" />
          <Bone className="mb-2 h-3 w-20" />
          <Bone className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <Bone className="mb-2 h-8 w-40" />
      <Bone className="mb-8 h-4 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-8">
        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <Bone className="mb-4 h-5 w-40" />
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <Bone className="mb-2 h-3 w-16" />
                <Bone className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
