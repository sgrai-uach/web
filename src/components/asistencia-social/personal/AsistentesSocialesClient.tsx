'use client';

import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { AuthContext } from '@/context/AuthContext';
import { useAsistentesSociales } from '@/hooks/useAsistentesSociales';
import AsistentesSocialesHeader from './AsistentesSocialesHeader';
import AsistentesSocialesFiltros from './AsistentesSocialesFiltros';
import AsistentesSocialesTabla from './AsistentesSocialesTabla';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import { Users, FilterX } from 'lucide-react';
import type {
  FiltrosAsistentesSocialesState,
  EstadoOperativoPersonal,
} from '@/types/asistenteSocialPersonal';

interface AsistentesSocialesClientProps {
  basePath?: string;
}

export default function AsistentesSocialesClient({
  basePath = '/gestion/asistente-social',
}: AsistentesSocialesClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { usuarioActivo, hasPermission } = useSimulatedSession();
  const auth = useContext(AuthContext);

  const esEncargado =
    usuarioActivo.rol === 'Encargado' ||
    auth?.usuario?.rolNombre === 'Encargado' ||
    auth?.usuario?.rolCodigo === 'ENCARGADO';

  const esAdmin =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    auth?.usuario?.rolCodigo === 'ADMIN';

  const tienePermisoLectura =
    esEncargado ||
    esAdmin ||
    usuarioActivo.rol === 'Asistente Social' ||
    auth?.usuario?.rolNombre === 'Asistente Social' ||
    hasPermission('asistencia_social:leer') ||
    Boolean(auth?.tienePermiso && auth.tienePermiso('asistencia_social:leer'));

  // Inicializar estado a partir de URLSearchParams
  const initialBusqueda = searchParams.get('q') || '';
  const initialDelegacion = searchParams.get('delegacionId') || undefined;
  const initialEstado = (searchParams.get('estadoOperativo') as EstadoOperativoPersonal) || undefined;
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [filtros, setFiltros] = useState<FiltrosAsistentesSocialesState>({
    pagina: Number.isNaN(initialPage) ? 1 : initialPage,
    limite: 20,
    busqueda: initialBusqueda,
    delegacionId: initialDelegacion,
    estadoOperativo: initialEstado,
  });

  // Sincronizar URLSearchParams cuando cambien los filtros sin causar re-renders del Router
  const primerRenderRef = useRef(true);
  useEffect(() => {
    if (primerRenderRef.current) {
      primerRenderRef.current = false;
      return;
    }

    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      params.set('q', filtros.busqueda.trim());
    }
    if (filtros.delegacionId) {
      params.set('delegacionId', filtros.delegacionId);
    }
    if (filtros.estadoOperativo) {
      params.set('estadoOperativo', filtros.estadoOperativo);
    }
    if (filtros.pagina && filtros.pagina > 1) {
      params.set('page', String(filtros.pagina));
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    window.history.replaceState(null, '', targetUrl);
  }, [filtros, pathname]);

  const { asistentes, meta, cargando } = useAsistentesSociales(filtros);

  const handleCambiarBusqueda = useCallback((busqueda: string) => {
    setFiltros((prev) => ({ ...prev, busqueda, pagina: 1 }));
  }, []);

  const handleCambiarDelegacion = useCallback((delegacionId?: string) => {
    setFiltros((prev) => ({ ...prev, delegacionId, pagina: 1 }));
  }, []);

  const handleCambiarEstadoOperativo = useCallback((estadoOperativo?: EstadoOperativoPersonal) => {
    setFiltros((prev) => ({ ...prev, estadoOperativo, pagina: 1 }));
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      pagina: 1,
      limite: 20,
      busqueda: '',
      delegacionId: undefined,
      estadoOperativo: undefined,
    });
  }, []);

  const handleCambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltros((prev) => ({ ...prev, pagina: nuevaPagina }));
  }, []);

  if (!tienePermisoLectura) {
    return (
      <AccesoDenegadoState
        rolUsuario={usuarioActivo.rol}
        modulo="el Listado de Disponibilidad de Asistentes Sociales"
        permisoRequerido="asistencia_social:leer"
        mensajePersonalizado="Se requieren credenciales de Encargado, Administrador o Asistente Social para revisar la disponibilidad del personal en terreno."
        botonVolverHref={basePath}
        botonVolverTexto="Volver a Asistencia Social"
      />
    );
  }

  const tieneFiltrosActivos =
    Boolean(filtros.busqueda) ||
    Boolean(filtros.delegacionId) ||
    Boolean(filtros.estadoOperativo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      {/* Header Institucional con Migas de Pan y Botón de Retorno */}
      <AsistentesSocialesHeader
        totalPersonal={meta.total}
        basePath={basePath}
      />

      {/* Barra de Filtros y Búsqueda */}
      <AsistentesSocialesFiltros
        filtros={filtros}
        onCambiarBusqueda={handleCambiarBusqueda}
        onCambiarDelegacion={handleCambiarDelegacion}
        onCambiarEstadoOperativo={handleCambiarEstadoOperativo}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      {/* Tabla de Asistentes Sociales o Estado Vacío */}
      {!cargando && asistentes.length === 0 ? (
        <EmptyState
          icon={tieneFiltrosActivos ? <FilterX size={36} /> : <Users size={36} />}
          title={
            tieneFiltrosActivos
              ? 'No hay asistentes que coincidan con los filtros'
              : 'No hay asistentes sociales registradas'
          }
          description={
            tieneFiltrosActivos
              ? 'Intente modificar los criterios de búsqueda, delegación territorial o estado operativo para encontrar personal disponible.'
              : 'Actualmente no se registran funcionarios con el rol de Asistente Social en el sistema.'
          }
          action={
            tieneFiltrosActivos ? (
              <Button variant="secondary" size="md" onClick={handleLimpiarFiltros}>
                Restablecer Filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <AsistentesSocialesTabla
          asistentes={asistentes}
          meta={meta}
          onCambiarPagina={handleCambiarPagina}
          cargando={cargando}
        />
      )}
    </div>
  );
}
