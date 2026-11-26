'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { getCatalogos, DELEGACIONES_FALLBACK } from '@/services/catalogosService';
import type { CatalogoItem } from '@/types/catalogos';
import type {
  FiltrosEventosPrevencionState,
  EstadoEventoPrevencion,
} from '@/types/evento-prevencion';
import { useEventosPrevencion } from '@/hooks/useEventosPrevencion';
import Pagination from '@/components/common/Pagination';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import Button from '@/components/ui/Button';
import EventosPrevencionFiltros from './EventosPrevencionFiltros';
import EventosPrevencionTabla from './EventosPrevencionTabla';
import EventoPrevencionDrawer from './EventoPrevencionDrawer';
import styles from './EventosPrevencion.module.css';

export interface EventosPrevencionViewProps {
  onAbrirCrearPrevencion?: () => void;
  refreshKey?: number;
}

const ESTADOS_VALIDOS: EstadoEventoPrevencion[] = ['PLANIFICADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const EventosPrevencionView: React.FC<EventosPrevencionViewProps> = ({
  onAbrirCrearPrevencion,
  refreshKey,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { usuarioActivo, hasPermission, isMounted } = useSimulatedSession();

  const esAdmin = Boolean(
    usuarioActivo?.rol === 'Administrador' ||
      usuarioActivo?.esAdmin
  );

  const puedeLeer = Boolean(
    isMounted &&
      (hasPermission('prevencion:eventos:leer') || esAdmin)
  );

  // Delegaciones para el selector
  const [delegaciones, setDelegaciones] = useState<CatalogoItem[]>(DELEGACIONES_FALLBACK);

  useEffect(() => {
    if (!isMounted || !puedeLeer) return;

    let activo = true;
    async function cargarDelegaciones() {
      try {
        const cat = await getCatalogos();
        if (activo && cat.delegaciones && cat.delegaciones.length > 0) {
          setDelegaciones(cat.delegaciones);
        }
      } catch {
        // Mantiene fallback si falla
      }
    }
    cargarDelegaciones();
    return () => {
      activo = false;
    };
  }, [isMounted, puedeLeer]);

  // Extraer filtros iniciales desde URL con validación estricta
  const initialFiltros = React.useMemo<Partial<FiltrosEventosPrevencionState>>(() => {
    const pageUrl = parseInt(searchParams?.get('page') || '1', 10);
    const limitUrl = parseInt(searchParams?.get('limit') || '20', 10);
    const busquedaUrl = searchParams?.get('q') || '';
    const rawDelegacion = searchParams?.get('delegacionId') || undefined;
    const delegacionUrl = rawDelegacion && UUID_REGEX.test(rawDelegacion) ? rawDelegacion : undefined;
    const rawEstado = searchParams?.get('estado') as EstadoEventoPrevencion;
    const estadoUrl = rawEstado && ESTADOS_VALIDOS.includes(rawEstado) ? rawEstado : undefined;

    return {
      pagina: Number.isNaN(pageUrl) || pageUrl < 1 ? 1 : pageUrl,
      limite: Number.isNaN(limitUrl) || limitUrl < 1 ? 20 : Math.min(limitUrl, 100),
      busqueda: busquedaUrl,
      delegacionId: delegacionUrl,
      estado: estadoUrl,
    };
  }, [searchParams]);

  const {
    eventos,
    meta,
    cargando,
    error,
    esForbidden,
    eventoSeleccionado,
    setEventoSeleccionado,
    filtros,
    cambiarBusqueda,
    cambiarDelegacion,
    cambiarEstado,
    cambiarPagina,
    cambiarLimite,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  } = useEventosPrevencion({
    initialFiltros,
    autoLoad: Boolean(isMounted && puedeLeer),
  });

  // Reaccionar a refreshKey del padre si se gatilla una actualización
  const refreshKeyPrevRef = useRef<number | undefined>(refreshKey);
  useEffect(() => {
    if (refreshKey !== undefined && refreshKeyPrevRef.current !== undefined && refreshKey > refreshKeyPrevRef.current) {
      recargar();
    }
    refreshKeyPrevRef.current = refreshKey;
  }, [refreshKey, recargar]);

  // Sincronizar URL de forma suave (replaceState) conforme al estándar H34
  const ultimaUrlRef = useRef<string>('');
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted || !puedeLeer) return;

    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', 'prevencion');

    if (filtros.busqueda.trim()) {
      params.set('q', filtros.busqueda.trim());
    } else {
      params.delete('q');
    }

    if (filtros.delegacionId) {
      params.set('delegacionId', filtros.delegacionId);
    } else {
      params.delete('delegacionId');
    }

    if (filtros.estado) {
      params.set('estado', filtros.estado);
    } else {
      params.delete('estado');
    }

    if (filtros.pagina > 1) {
      params.set('page', String(filtros.pagina));
    } else {
      params.delete('page');
    }

    if (filtros.limite !== 20) {
      params.set('limit', String(filtros.limite));
    } else {
      params.delete('limit');
    }

    const nuevoQuery = params.toString();
    const nuevaUrl = nuevoQuery ? `${pathname}?${nuevoQuery}` : pathname;

    if (nuevaUrl !== ultimaUrlRef.current && window.location.pathname + window.location.search !== nuevaUrl) {
      ultimaUrlRef.current = nuevaUrl;
      window.history.replaceState(null, '', nuevaUrl);
    }
  }, [pathname, searchParams, filtros, isMounted, puedeLeer]);

  // Renderizar estado neutro mientras el contexto de sesión no esté montado
  if (!isMounted) {
    return null;
  }

  // Si no tiene permisos, mostrar Acceso Denegado
  if (!puedeLeer || esForbidden) {
    return (
      <div className={styles.container}>
        <AccesoDenegadoState
          modulo="Eventos Preventivos de Mitigación"
          permisoRequerido="prevencion:eventos:leer"
          rolUsuario={usuarioActivo?.rol}
          mensajePersonalizado="No posee permisos suficientes para supervisar los eventos preventivos en puntos críticos comunales."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Barra de Filtros H34 */}
      <EventosPrevencionFiltros
        busqueda={filtros.busqueda}
        delegacionId={filtros.delegacionId}
        estado={filtros.estado}
        delegaciones={delegaciones}
        onBusquedaChange={cambiarBusqueda}
        onDelegacionChange={cambiarDelegacion}
        onEstadoChange={cambiarEstado}
        onLimpiar={limpiarFiltros}
        totalResultados={meta.total}
        onCrearNuevo={onAbrirCrearPrevencion}
      />

      {/* Mensaje de error con reintento si ocurre */}
      {error && !esForbidden && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
            color: 'var(--color-danger, #D32F2F)',
            borderLeft: '4px solid var(--color-danger, #D32F2F)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span>{error}</span>
          <Button variant="destructive" size="sm" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla Operativa (no renderizar estado vacío debajo de un error de carga) */}
      {(!error || esForbidden) && (
        <EventosPrevencionTabla
          eventos={eventos}
          eventoSeleccionadoId={eventoSeleccionado?.id}
          onSeleccionarEvento={(ev) => setEventoSeleccionado(ev)}
          cargando={cargando}
          tieneFiltrosActivos={hayFiltrosActivos}
          onLimpiarFiltros={limpiarFiltros}
        />
      )}

      {/* Paginación H34 */}
      {!cargando && !error && meta.total > 0 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            pagina={meta.page}
            totalPaginas={meta.totalPages}
            total={meta.total}
            limite={meta.limit}
            onCambiarPagina={cambiarPagina}
            onCambiarLimite={cambiarLimite}
            opcionesLimite={[10, 20, 50]}
            nombreEntidad="eventos preventivos"
          />
        </div>
      )}

      {/* Drawer Lateral Desplegable PostGIS */}
      <EventoPrevencionDrawer
        evento={eventoSeleccionado}
        isOpen={Boolean(eventoSeleccionado)}
        onClose={() => setEventoSeleccionado(null)}
      />
    </div>
  );
};

export default EventosPrevencionView;
