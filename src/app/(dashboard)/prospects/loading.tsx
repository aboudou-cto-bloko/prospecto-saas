import { TableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-32 rounded bg-surface-2" />
        <div className="mt-2 h-4 w-48 rounded bg-surface-2" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
