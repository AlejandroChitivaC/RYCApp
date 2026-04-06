import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type LayoutSearchValue = {
  query: string
  setQuery: (q: string) => void
}

const LayoutSearchContext = createContext<LayoutSearchValue | null>(null)

export function LayoutSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  const value = useMemo(() => ({ query, setQuery }), [query])
  return <LayoutSearchContext.Provider value={value}>{children}</LayoutSearchContext.Provider>
}

export function useLayoutSearch() {
  const ctx = useContext(LayoutSearchContext)
  if (!ctx) {
    return { query: '', setQuery: () => {} }
  }
  return ctx
}
