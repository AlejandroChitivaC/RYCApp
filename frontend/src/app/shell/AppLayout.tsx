import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-zinc-100 text-brand-dark">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-brand-yellow/15 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-brand-dark/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(90deg, #2B2B2B 1px, transparent 1px),
              linear-gradient(#2B2B2B 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-zinc-300/90 bg-brand-dark-deep lg:h-full lg:w-[min(18rem,20vw)] lg:min-w-[15rem] lg:max-w-[20rem] lg:border-b-0 lg:border-r lg:border-zinc-700/80 lg:p-0">
          <Sidebar />
        </aside>

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 pb-3 sm:px-4 sm:pb-4 lg:p-5 xl:p-6 2xl:p-8">
          <div className="shrink-0">
            <Topbar />
          </div>
          <div className="relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-soft">
            <div className="scrollbar-none relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain p-4 sm:p-5 xl:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
