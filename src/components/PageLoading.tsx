// src/components/PageLoading.tsx

/* Shared loading state for the data-heavy routes (globe, history, news).
   Next renders the matching loading.tsx instantly while the server
   component fetches, so the user sees the page's shape immediately
   instead of a blank black screen. Server component on purpose - it is
   static markup and should not ship any JS. */
export default function PageLoading({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 pb-12 pt-28 text-white sm:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div
        className="relative z-10 mx-auto max-w-5xl text-center"
        role="status"
        aria-live="polite"
      >
        <h1 className="text-4xl text-white sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/50">{message}</p>

        {/* Skeleton blocks, sized roughly like the real content so the
            layout does not jump when the data lands. */}
        <div className="mt-14 animate-pulse space-y-4">
          <div className="mx-auto h-11 w-full max-w-md rounded-full bg-white/10" />
          <div className="h-[380px] w-full rounded-3xl border border-white/10 bg-white/5" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-2xl border border-white/10 bg-white/5" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/5" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/5" />
          </div>
        </div>

        <span className="sr-only">Loading</span>
      </div>
    </main>
  );
}
