function Skeleton({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton-block relative block overflow-hidden rounded-lg ${className}`}
    />
  );
}

export function BountyDetailSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12  sm:px-6">
      <section className="skeleton-surface space-y-6 rounded-3xl p-6 sm:p-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-4/5" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-[#dedbd1] pt-6 dark:border-white/10">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </section>
      <aside className="skeleton-surface space-y-5 rounded-3xl p-6">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </aside>
    </div>
  );
}

export default Skeleton;
