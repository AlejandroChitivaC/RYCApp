import { Outlet } from 'react-router-dom'
import { LayoutSearchProvider } from './LayoutSearchContext'
import { RouteSearchReset } from './RouteSearchReset'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <LayoutSearchProvider>
      <RouteSearchReset />
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-brand-page text-brand-dark">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand-yellow/12 blur-3xl" />
          <div className="absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-zinc-300/40 blur-3xl" />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-black/20 bg-brand-sidebar lg:h-full lg:w-[min(18.5rem,22vw)] lg:min-w-[16rem] lg:max-w-[20rem] lg:border-b-0 lg:border-r lg:border-white/10 lg:p-0">
            <Sidebar />
          </aside>

          <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 lg:p-6">
            <div className="shrink-0">
              <Topbar />
            </div>
            <div className="relative mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-soft">
              <div className="scrollbar-none relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain p-4 sm:p-5 lg:p-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </LayoutSearchProvider>
  )
}
