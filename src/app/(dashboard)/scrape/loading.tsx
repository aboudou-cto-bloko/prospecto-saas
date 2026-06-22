export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 rounded bg-surface-2" />
      <div className="mt-2 h-4 w-72 rounded bg-surface-2" />
      <div className="mt-8 max-w-xl space-y-5">
        <div className="h-10 rounded bg-surface-2" />
        <div className="h-10 rounded bg-surface-2" />
        <div className="h-10 w-24 rounded bg-surface-2" />
        <div className="h-10 w-40 rounded bg-surface-2" />
      </div>
    </div>
  );
}
