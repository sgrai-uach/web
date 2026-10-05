'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type {
  FiltrosPuntosCriticosState,
  PrioridadPuntoCritico,
} from '@/types/puntoCritico';
import { usePuntosCriticos } from '@/hooks/usePuntosCriticos';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import PuntosCriticosHeader from '@/components/admin/puntos-criticos/PuntosCriticosHeader';
import PuntosCriticosFiltros from '@/components/admin/puntos-criticos/PuntosCriticosFiltros';
import PuntosCriticosTabla from '@/components/admin/puntos-criticos/PuntosCriticosTabla';
import PuntoCriticoDetalleModal from '@/components/admin/puntos-criticos/PuntoCriticoDetalleModal';
import PuntoCriticoEditarModal from '@/components/admin/puntos-criticos/PuntoCriticoEditarModal';
import AccesoDenegadoState from '@/components/admin/puntos-criticos/AccesoDenegadoState';
import Pagination from '@/components/common/Pagination';
import { toUserFriendlyErrorMessage } from '@/lib/utils/errorUtils';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

export default function PuntosCriticosPage() {
  const { showSuccess, showError } = useToast();
  const { usuarioActivo, cambiarUsuarioPorId, hasPermission } = useSimulatedSession();
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoCriticoItem | null>(null);
  const [puntoParaEditar, setPuntoParaEditar] = useState<PuntoCriticoItem | null>(null);

  const [filtros, setFiltros] = useState<FiltrosPuntosCriticosState>({
    pagina: 1,
    limite: 10,
    busqueda: '',
    delegacionId: undefined,
    prioridad: undefined,
    activo: true,
  });

  const {
    puntosCriticos,
    meta,
    cargando,
    error,
    statusCode,
    actualizarPuntoCriticoEnLista,
  } = usePuntosCriticos(filtros, usuarioActivo.id);

  const tienePermiso =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('puntos_criticos:leer');

  useEffect(() => {
    if (error && statusCode !== 403) {
      showError(toUserFriendlyErrorMessage(error), 'Error al cargar puntos críticos');
    }
  }, [error, statusCode, showError]);

  const handleCambiarBusqueda = useCallback((busqueda: string) => {
    setFiltros((prev) => ({ ...prev, busqueda, pagina: 1 }));
  }, []);

  const handleCambiarDelegacion = useCallback((delegacionId?: string) => {
    setFiltros((prev) => ({ ...prev, delegacionId, pagina: 1 }));
  }, []);

  const handleCambiarPrioridad = useCallback(
    (prioridad?: PrioridadPuntoCritico) => {
      setFiltros((prev) => ({ ...prev, prioridad, pagina: 1 }));
    },
    []
  );

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      pagina: 1,
      limite: 10,
      busqueda: '',
      delegacionId: undefined,
      prioridad: undefined,
      activo: true,
    });
  }, []);

  const handleCambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltros((prev) => ({ ...prev, pagina: nuevaPagina }));
  }, []);

  const handleCambiarLimite = useCallback((nuevoLimite: number) => {
    setFiltros((prev) => ({ ...prev, limite: nuevoLimite, pagina: 1 }));
  }, []);

  const handleGuardadoExitoso = useCallback(
    (puntoActualizado: PuntoCriticoItem) => {
      actualizarPuntoCriticoEnLista(puntoActualizado);
      setPuntoSeleccionado((prev) => (prev?.id === puntoActualizado.id ? puntoActualizado : prev));
      setPuntoParaEditar(null);
      showSuccess(
        `El punto crítico ${puntoActualizado.codigo} ha sido actualizado correctamente.`,
        'Actualización Exitosa'
      );
    },
    [actualizarPuntoCriticoEnLista, showSuccess]
  );

  const esFiltroActivo =
    Boolean(filtros.busqueda && filtros.busqueda.trim() !== '') ||
    Boolean(filtros.delegacionId) ||
    Boolean(filtros.prioridad);

  const accesoDenegado =
    statusCode === 403 || (!cargando && !tienePermiso && statusCode !== 200);

  // Control RBAC: Si el usuario recibe 403 o no tiene permiso y no fue autorizado por la API
  if (accesoDenegado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        <PuntosCriticosHeader
          totalPuntos={0}
          tieneAcceso={false}
        />
        <AccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          onCambiarAAdmin={() => cambiarUsuarioPorId(DEFAULT_ADMIN_USER_ID)}
        />
      </div>
    );
  }

  // En el catálogo operativo solo deben verse puntos críticos activos
  const puntosActivos = puntosCriticos.filter((p) => p.activo !== false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <PuntosCriticosHeader
        totalPuntos={puntosActivos.length}
        tieneAcceso={true}
      />

      <PuntosCriticosFiltros
        busqueda={filtros.busqueda || ''}
        delegacionId={filtros.delegacionId}
        prioridad={filtros.prioridad}
        onCambiarBusqueda={handleCambiarBusqueda}
        onCambiarDelegacion={handleCambiarDelegacion}
        onCambiarPrioridad={handleCambiarPrioridad}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <PuntosCriticosTabla
          puntosCriticos={puntosActivos}
          cargando={cargando}
          esFiltroActivo={esFiltroActivo}
          onLimpiarFiltros={handleLimpiarFiltros}
          onSeleccionarPunto={setPuntoSeleccionado}
          onEditar={setPuntoParaEditar}
        />

        <Pagination
          pagina={meta.pagina}
          limite={meta.limite}
          total={puntosActivos.length}
          totalPaginas={Math.max(1, Math.ceil(puntosActivos.length / (meta.limite || 10)))}
          onCambiarPagina={handleCambiarPagina}
          onCambiarLimite={handleCambiarLimite}
          nombreEntidad="puntos críticos"
        />
      </div>

      {/* Modal de Detalle de Atributos del Punto Crítico */}
      <PuntoCriticoDetalleModal
        punto={puntoSeleccionado}
        onCerrar={() => setPuntoSeleccionado(null)}
        onEditar={setPuntoParaEditar}
      />

      {/* Modal de Edición de Características y Ubicación (HU-55) */}
      <PuntoCriticoEditarModal
        isOpen={Boolean(puntoParaEditar)}
        punto={puntoParaEditar}
        usuarioActivoId={usuarioActivo.id}
        onCerrar={() => setPuntoParaEditar(null)}
        onGuardadoExitoso={handleGuardadoExitoso}
      />
    </div>
  );
}
