/**
 * Global loading fallback (App Router convention). Shown instantly while a
 * route segment is loading, so users never see a blank frame.
 */
export default function Loading() {
  return (
    <div className="container-edge py-28">
      <div className="skeleton mb-8 h-16 w-72 rounded" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] rounded-2xl" />
            <div className="skeleton mt-4 h-3 w-1/4 rounded" />
            <div className="skeleton mt-2 h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
