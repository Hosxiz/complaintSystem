export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans animate-pulse">
      {/* Top Navbar Skeleton */}
      <div className="h-16 bg-white border-b border-slate-200/80 px-4 max-w-6xl mx-auto flex items-center justify-between" />

      {/* Main Skeleton */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Skeleton */}
        <div className="h-28 bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-md w-36" />
            <div className="h-7 bg-slate-300 rounded-lg w-72" />
          </div>
          <div className="w-40 h-12 bg-slate-100 rounded-2xl" />
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-slate-200 rounded w-16" />
                <div className="w-8 h-8 rounded-xl bg-slate-100" />
              </div>
              <div className="h-8 bg-slate-200 rounded-lg w-12" />
            </div>
          ))}
        </div>

        {/* Big Queue Card Skeleton */}
        <div className="h-[450px] bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl w-64" />
          <div className="space-y-2 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
