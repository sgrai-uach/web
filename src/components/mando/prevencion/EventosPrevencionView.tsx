'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ShieldPlus, RefreshCw } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { getCatalogos, DELEGACIONES_FALLBACK } from '@/services/catalogosService';
import type { CatalogoItem } from '@/types/catalogos';
import type {
  FiltrosEventosPrevencionState,
  EstadoEventoPrevencion,
  EventoPrevencionListItemDTO,
} from '@/types/evento-prevencion';
import { useEventosPrevencion } from '@/hooks/useEventosPrevencion';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import Pagination from '@/components/common/Pagination';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import EventosPrevencionFiltros from './EventosPrevencionFiltros';
import EventosPrevencionTabla from './EventosPrevencionTabla';
import EventoPrevencionDrawer from './EventoPrevencionDrawer';
import ModalEditarEventoPrevencion from './ModalEditarEventoPrevencion';
import styles from './EventosPrevencion.module.css';

export interface EventosPrevencionViewProps {
  onAbrirCrearPrevencion?: () => void;
}

export const EventosPrevencionView: React.FC<EventosPrevencionViewProps> = ({
  onAbrirCrearPrevencion,
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
      (hasPermission('prevencion:eventos:leer') ||
        hasPermission('incidentes:kanban') ||
        esAdmin)
  );

  const puedeEditar = Boolean(
    isMounted &&
      (hasPermission('prevencion:eventos:crear') || esAdmin)
  );

  const puedeAsignarHook = usePuedeAsignarMision();
  const puedeAsignar = Boolean(
    isMounted && (puedeAsignarHook || hasPermission('misiones:asignar') || esAdmin)
  );

  const [eventoAEditar, setEventoAEditar] = useState<EventoPrevencionListItemDTO | null>(null);

  // Delegaciones para el selector
  const [delegaciones, setDelegaciones] = useState<CatalogoItem[]>(DELEGACIONES_FALLBACK);

  useEffect(() => {
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
  }, []);

  // Extraer filtros iniciales desde URL si existen
  const initialFiltros = React.useMemo<Partial<FiltrosEventosPrevencionState>>(() => {
    const pageUrl = parseInt(searchParams?.get('page') || '1', 10);
    const busquedaUrl = searchParams?.get('q') || '';
    const delegacionUrl = searchParams?.get('delegacionId') || undefined;
    const estadoUrl = (searchParams?.get('estado') as EstadoEventoPrevencion) || undefined;

    return {
      pagina: Number.isNaN(pageUrl) || pageUrl < 1 ? 1 : pageUrl,
      limite: 20,
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
  } = useEventosPrevencion({
    initialFiltros,
    autoLoad: true,
  });

  // Sincronizar URL de forma suave (replaceState) conforme al estándar H34
  const ultimaUrlRef = useRef<string>('');
  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    const nuevoQuery = params.toString();
    const nuevaUrl = nuevoQuery ? `${pathname}?${nuevoQuery}` : pathname;

    if (nuevaUrl !== ultimaUrlRef.current && window.location.pathname + window.location.search !== nuevaUrl) {
      ultimaUrlRef.current = nuevaUrl;
      window.history.replaceState(null, '', nuevaUrl);
    }
  }, [pathname, searchParams, filtros]);

  // Si no tiene permisos, mostrar Acceso Denegado
  if (isMounted && (!puedeLeer || esForbidden)) {
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
    <section className={styles.container} aria-label="Listado de eventos de prevención">
      <div className={styles.toolbarRow}>
        <div className={styles.toolbarTitleGroup}>
          <Heading as="h2" variant="h3" color="teal">
            Eventos y Operativos de Prevención
          </Heading>
        </div>

        <div className={styles.toolbarActions}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void recargar();
            }}
            disabled={cargando}
          >
            <RefreshCw
              size={14}
              style={{ marginRight: '6px' }}
              className={cargando ? styles.spinIcon : undefined}
              aria-hidden="true"
            />
            <span>Actualizar</span>
          </Button>

          {onAbrirCrearPrevencion && puedeEditar && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onAbrirCrearPrevencion}
            >
              <ShieldPlus size={14} style={{ marginRight: '6px' }} aria-hidden="true" />
              <span>Nuevo Evento de Prevención</span>
            </Button>
          )}
        </div>
      </div>

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
      />

      {/* Mensaje de error general si ocurre */}
      {error && !esForbidden && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
            color: 'var(--color-danger, #D32F2F)',
            borderLeft: '4px solid var(--color-danger, #D32F2F)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Tabla Operativa */}
      <EventosPrevencionTabla
        eventos={eventos}
        eventoSeleccionadoId={eventoSeleccionado?.id}
        onSeleccionarEvento={(ev) => setEventoSeleccionado(ev)}
        puedeEditar={puedeEditar}
        puedeAsignar={puedeAsignar}
        onEditarEvento={(ev) => setEventoAEditar(ev)}
        cargando={cargando}
      />

      {/* Paginación H34 */}
      {!cargando && meta.total > 0 && (
        <div className={styles.paginationWrapper}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
            Mostrando {eventos.length} de {meta.total} eventos registrados
          </div>
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
        puedeEditar={puedeEditar}
        puedeAsignar={puedeAsignar}
        onEditarEvento={(ev) => setEventoAEditar(ev)}
      />

      {/* Modal de Edición de Evento Preventivo (H77) */}
      {eventoAEditar && (
        <ModalEditarEventoPrevencion
          key={eventoAEditar.id}
          isOpen={Boolean(eventoAEditar)}
          evento={eventoAEditar}
          onClose={() => setEventoAEditar(null)}
          onSuccess={() => {
            void recargar();
          }}
          userId={usuarioActivo?.id}
        />
      )}
    </section>
  );
};

export default EventosPrevencionView;
