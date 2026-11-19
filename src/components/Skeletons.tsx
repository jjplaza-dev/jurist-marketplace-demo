export function GridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading listings"
      className="grid animate-pulse grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="aspect-square rounded-xl bg-gray-200" />
          <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
        </li>
      ))}
    </ul>
  );
}

export function ItemSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading listing" className="mt-4 grid animate-pulse gap-8 lg:grid-cols-[1fr_380px]">
      <div className="aspect-square rounded-2xl bg-gray-200" />
      <div className="space-y-4">
        <div className="h-7 w-3/4 rounded bg-gray-200" />
        <div className="h-7 w-1/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-24 rounded bg-gray-200" />
        <div className="h-40 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
