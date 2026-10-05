'use client';

import React, { useState, useCallback } from 'react';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { useEventosAsistenciaSocial } from '@/hooks/useEventosAsistenciaSocial';
import AsistenciaSocialHeader from './AsistenciaSocialHeader';
import AsistenciaSocialFiltros from './AsistenciaSocialFiltros';
import AsistenciaSocialTabla from './AsistenciaSocialTabla';
import AsistenciaSocialEmptyState from './AsistenciaSocialEmptyState';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import type {
  FiltrosEventosAsistenciaSocialState,
  PrioridadEventoSocial,
  EstadoEventoSocial,
} from '@/types/asistenciaSocial';

interface AsistenciaSocialClientProps {
  basePath?: string;
}

export default function AsistenciaSocialClient({
  basePath = '/gestion/asistente-social',
}: AsistenciaSocialClientProps) {
  const { usuarioActivo, hasPermission } = useSimulatedSession();

  const puedeCrear =
    usuarioActivo.rol === 'Administrador' ||
    usuarioActivo.rol === 'Encargado' ||
    Boolean(usuarioActivo.esAdmin) ||
    hasPermission('asistencia_social:crear');

  const tienePermisoLectura =
    puedeCrear ||
    usuarioActivo.rol === 'Asistente Social' ||
    hasPermission('asistencia_social:leer');

  const [filtros, setFiltros] = useState<FiltrosEventosAsistenciaSocialState>({
    pagina: 1,
    limite: 10,
    busqueda: '',
    delegacionId: undefined,
    prioridad: undefined,
    estado: 'PENDIENTE',
  });

  const { eventos, meta, cargando } = useEventosAsistenciaSocial(
    filtros,
    usuarioActivo.id
  );

  const handleCambiarBusqueda = useCallback((busqueda: string) => {
    setFiltros((prev) => ({ ...prev, busqueda, pagina: 1 }));
  }, []);

  const handleCambiarDelegacion = useCallback((delegacionId?: string) => {
    setFiltros((prev) => ({ ...prev, delegacionId, pagina: 1 }));
  }, []);

  const handleCambiarPrioridad = useCallback((prioridad?: PrioridadEventoSocial) => {
    setFiltros((prev) => ({ ...prev, prioridad, pagina: 1 }));
  }, []);

  const handleCambiarEstado = useCallback((estado?: EstadoEventoSocial) => {
    setFiltros((prev) => ({ ...prev, estado, pagina: 1 }));
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      pagina: 1,
      limite: 10,
      busqueda: '',
      delegacionId: undefined,
      prioridad: undefined,
      estado: 'PENDIENTE',
    });
  }, []);

  const handleCambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltros((prev) => ({ ...prev, pagina: nuevaPagina }));
  }, []);

  if (!tienePermisoLectura) {
    return (
      <AccesoDenegadoState
        rolUsuario={usuarioActivo.rol}
        modulo="el Módulo de Asistencia Social"
        permisoRequerido="asistencia_social:leer"
        mensajePersonalizado="Se requieren credenciales de Encargado, Administrador o Asistente Social para revisar la bandeja de casos sociales."
        botonVolverHref="/gestion"
        botonVolverTexto="Volver a Operaciones"
      />
    );
  }

  const tieneFiltrosActivos =
    Boolean(filtros.busqueda) ||
    Boolean(filtros.delegacionId) ||
    Boolean(filtros.prioridad) ||
    (Boolean(filtros.estado) && filtros.estado !== 'PENDIENTE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      {/* Header Institucional con Título y Acción Crear */}
      <AsistenciaSocialHeader
        totalCasos={meta.total}
        puedeCrear={puedeCrear}
        basePath={basePath}
      />

      {/* Barra de Filtros y Búsqueda */}
      <AsistenciaSocialFiltros
        filtros={filtros}
        onCambiarBusqueda={handleCambiarBusqueda}
        onCambiarDelegacion={handleCambiarDelegacion}
        onCambiarPrioridad={handleCambiarPrioridad}
        onCambiarEstado={handleCambiarEstado}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      {/* Tabla de Eventos o Estado Vacío */}
      {!cargando && eventos.length === 0 ? (
        <AsistenciaSocialEmptyState
          tieneFiltros={tieneFiltrosActivos}
          onLimpiarFiltros={handleLimpiarFiltros}
          puedeCrear={puedeCrear}
          basePath={basePath}
        />
      ) : (
        <AsistenciaSocialTabla
          eventos={eventos}
          meta={meta}
          onCambiarPagina={handleCambiarPagina}
          cargando={cargando}
        />
      )}
    </div>
  );
}
