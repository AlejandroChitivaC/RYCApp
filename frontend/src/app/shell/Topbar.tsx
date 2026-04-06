import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store";
import { Button } from "../../shared/ui/Button";
import { BrandCornerDecor } from "./BrandCornerDecor";
import { NAV_ITEMS } from "./nav";

function getTitle(pathname: string) {
  const item = NAV_ITEMS.find((i) => i.to === pathname);
  return item?.label ?? "Módulo";
}

export function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const title = getTitle(pathname);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-soft">
      <div className="pointer-events-none absolute right-3 top-3 z-[1] h-[4.85rem] w-[4.35rem] sm:right-4 sm:top-3.5 sm:h-[5.35rem] sm:w-[4.75rem]">
        <BrandCornerDecor className="h-full w-full" />
      </div>

      <div className="relative border-l-4 border-brand-yellow px-5 py-4 pr-[7.25rem] sm:pr-32">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted">
              R&amp;C Transportes
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-dark">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-brand-muted">
              Gestión operativa: catálogos y registro de operaciones.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-brand-dark">
                <span className="font-semibold">
                  {user.nombre} {user.apellido}
                </span>
                <span className="text-brand-muted"> · {user.rol}</span>
              </div>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Cerrar sesión
            </Button>
            <div className="rounded-xl bg-brand-dark px-3 py-2 text-xs font-bold text-brand-yellow shadow-sm">
              Sistema en línea
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
