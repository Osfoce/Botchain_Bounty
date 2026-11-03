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
    <div
      className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading bounty details"
    >
      <div className="mb-7 flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
        <section className="skeleton-surface min-w-0 overflow-hidden rounded-3xl">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="space-y-6 p-5 sm:p-8 lg:p-9">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>

            <Skeleton className="h-10 w-4/5 max-w-2xl" />

            <div className="space-y-4 rounded-2xl border border-[#dedbd1] p-4 dark:border-white/10 sm:p-5">
              <Skeleton className="h-3 w-36" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </div>

            <div className="border-t border-[#dedbd1] pt-6 dark:border-white/10">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="skeleton-surface space-y-5 rounded-3xl p-5 sm:p-6">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </section>
          <section className="skeleton-surface space-y-4 rounded-3xl p-5 sm:p-6">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Skeleton;
