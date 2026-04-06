import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLayoutSearch } from './LayoutSearchContext'

/** Limpia el buscador del topbar al cambiar de ruta. */
export function RouteSearchReset() {
  const { pathname } = useLocation()
  const { setQuery } = useLayoutSearch()

  useEffect(() => {
    setQuery('')
  }, [pathname, setQuery])

  return null
}
