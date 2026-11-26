export default function StaffLoading() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex animate-pulse">
      {/* Skeleton Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 p-4 flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-200" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded-md w-1/2" />
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
            <div className="h-9 bg-slate-200 rounded-xl" />
            <div className="h-9 bg-slate-100 rounded-xl" />
            <div className="h-9 bg-slate-100 rounded-xl" />
          </div>

          <div className="space-y-2 pt-4">
            <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
            <div className="h-9 bg-slate-100 rounded-xl" />
            <div className="h-9 bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="h-12 bg-slate-100 rounded-2xl" />
      </aside>

      {/* Main Skeleton */}
      <div className="flex-1 p-4 sm:p-8 space-y-6">
        {/* Topbar Skeleton */}
        <div className="h-16 bg-white rounded-3xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div className="h-6 bg-slate-200 rounded-lg w-48" />
          <div className="flex gap-2">
            <div className="h-8 bg-slate-100 rounded-xl w-24" />
            <div className="h-8 bg-slate-100 rounded-xl w-20" />
          </div>
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

        {/* Main Content Area Skeleton */}
        <div className="h-96 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded-lg w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-50 rounded-2xl border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
