import { useEffect, useMemo, useState } from 'react';
import { http } from '../../../app/http/httpClient';
import { getApiErrorMessage } from '../../../app/http/apiError';
import { EmptyState } from '../../../shared/ui/EmptyState';

type Stat = {
  label: string;
  value: number;
  hint: string;
  tone: 'yellow' | 'dark' | 'amber' | 'gold' | 'steel';
};

async function safeCount<T>(path: string): Promise<number> {
  const res = await http.get<T[]>(path);
  return Array.isArray(res.data) ? res.data.length : 0;
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    lineas: 0,
    usuarios: 0,
    vehiculos: 0,
    materiales: 0,
    proveedores: 0,
    operaciones: 0,
    tiposCosto: 0,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [
          lineas,
          usuarios,
          vehiculos,
          materiales,
          proveedores,
          operaciones,
          tiposCosto,
        ] = await Promise.all([
          safeCount('/api/lineas-negocio'),
          safeCount('/api/usuarios'),
          safeCount('/api/vehiculos'),
          safeCount('/api/materiales'),
          safeCount('/api/proveedores'),
          safeCount('/api/operaciones'),
          safeCount('/api/tipos-costo'),
        ]);
        if (!active) return;
        setCounts({
          lineas,
          usuarios,
          vehiculos,
          materiales,
          proveedores,
          operaciones,
          tiposCosto,
        });
      } catch (e) {
        if (!active) return;
        setError(getApiErrorMessage(e));
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo<Stat[]>(
    () => [
      {
        label: 'Líneas de negocio',
        value: counts.lineas,
        hint: 'Linea_Negocio',
        tone: 'yellow',
      },
      {
        label: 'Usuarios',
        value: counts.usuarios,
        hint: 'Usuario · Rol',
        tone: 'dark',
      },
      {
        label: 'Vehículos',
        value: counts.vehiculos,
        hint: 'Vehiculo',
        tone: 'amber',
      },
      {
        label: 'Materiales',
        value: counts.materiales,
        hint: 'Material',
        tone: 'steel',
      },
      {
        label: 'Proveedores',
        value: counts.proveedores,
        hint: 'Proveedor',
        tone: 'gold',
      },
      {
        label: 'Operaciones',
        value: counts.operaciones,
        hint: 'Operaciones_Lineas_Negocio',
        tone: 'yellow',
      },
      {
        label: 'Tipos de costo',
        value: counts.tiposCosto,
        hint: 'Tipo_Costo',
        tone: 'dark',
      },
    ],
    [counts],
  );

  const blob = (t: Stat['tone']) => {
    switch (t) {
      case 'yellow':
        return 'bg-brand-yellow/40';
      case 'dark':
        return 'bg-brand-dark/25';
      case 'amber':
        return 'bg-amber-400/35';
      case 'gold':
        return 'bg-brand-yellow-bright/45';
      case 'steel':
        return 'bg-zinc-400/30';
      default:
        return 'bg-brand-yellow/30';
    }
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-gradient-to-r from-white via-brand-yellow/10 to-white p-5 shadow-soft">
        <div className="relative flex flex-col gap-4 border-l-4 border-brand-yellow pl-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-muted">
              Resumen operativo
            </div>
            <div className="mt-1 text-lg font-extrabold text-brand-dark">
              Panel R&amp;C Transportes
            </div>
            <div className="text-sm text-brand-muted">
              Modelo ER: catálogos y operaciones alineados a la base de datos.
            </div>
          </div>
          <div className="rounded-xl border-2 border-brand-dark bg-brand-dark px-4 py-2 text-xs font-bold text-brand-yellow">
            Actualizado: ahora
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-soft"
          >
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-70 transition group-hover:opacity-100 ${blob(s.tone)}`}
            />

            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                {s.hint}
              </div>
              <div className="mt-1 text-sm font-extrabold text-brand-dark">
                {s.label}
              </div>
            </div>

            <div className="relative mt-3 text-4xl font-extrabold tracking-tight text-brand-dark xl:text-5xl">
              {loading ? (
                <span className="inline-block h-9 w-20 animate-pulse rounded-xl bg-zinc-200" />
              ) : (
                s.value
              )}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="mt-6">
          <EmptyState
            title="No se pudo cargar el dashboard"
            description={error}
          />
        </div>
      ) : null}
    </div>
  );
}
