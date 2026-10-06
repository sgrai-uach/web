'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Table, Map } from 'lucide-react';
import type {
  FiltrosPuntosCriticosState,
  PrioridadPuntoCritico,
  PuntoCriticoItem,
} from '@/types/puntoCritico';
import { usePuntosCriticos } from '@/hooks/usePuntosCriticos';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import {
  eliminarPuntoCritico,
  PuntoCriticoServiceError,
} from '@/services/puntosCriticosService';
import PuntosCriticosHeader from '@/components/admin/puntos-criticos/PuntosCriticosHeader';
import PuntosCriticosFiltros from '@/components/admin/puntos-criticos/PuntosCriticosFiltros';
import PuntosCriticosTabla from '@/components/admin/puntos-criticos/PuntosCriticosTabla';
import PuntosCriticosMapa from '@/components/admin/puntos-criticos/PuntosCriticosMapa';
import PuntoCriticoDetalleModal from '@/components/admin/puntos-criticos/PuntoCriticoDetalleModal';
import PuntoCriticoEliminarModal from '@/components/admin/puntos-criticos/PuntoCriticoEliminarModal';
import PuntoCriticoEditarModal from '@/components/admin/puntos-criticos/PuntoCriticoEditarModal';
import AccesoDenegadoState from '@/components/admin/puntos-criticos/AccesoDenegadoState';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import { toUserFriendlyErrorMessage } from '@/lib/utils/errorUtils';

export default function PuntosCriticosPage() {
  const { showSuccess, showError } = useToast();
  const { usuarioActivo, cambiarUsuarioPorId, hasPermission } = useSimulatedSession();

  // Estados de interfaz y vista
  const [vista, setVista] = useState<'tabla' | 'mapa'>('tabla');
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoCriticoItem | null>(null);
  const [puntoParaEditar, setPuntoParaEditar] = useState<PuntoCriticoItem | null>(null);

  // Estados de eliminación y modal
  const [puntoAEliminar, setPuntoAEliminar] = useState<PuntoCriticoItem | null>(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState<boolean>(false);
  const [eliminando, setEliminando] = useState<boolean>(false);
  const [errorBloqueo, setErrorBloqueo] = useState<string | null>(null);

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
    removerPuntoLocalmente,
    actualizarPuntoCriticoEnLista,
  } = usePuntosCriticos(filtros, usuarioActivo.id);

  const tienePermisoLectura =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('puntos_criticos:leer') ||
    hasPermission('puntos_criticos:crear') ||
    hasPermission('eventos_atp:crear') ||
    hasPermission('puntos_criticos:eliminar');

  const puedeCrear =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('puntos_criticos:crear') ||
    hasPermission('eventos_atp:crear') ||
    hasPermission('puntos_criticos:gestionar');

  const puedeEliminar =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('puntos_criticos:eliminar');

  useEffect(() => {
    if (error && statusCode !== 403) {
      showError(toUserFriendlyErrorMessage(error), 'Error al cargar puntos críticos');
    }
  }, [error, statusCode, showError]);

  const handleCambiarBusqueda = useCallback((busqueda: string) => {
    setFiltros((prev) => ({ ...prev, busqueda, pagina: 1 }));
  }, []);

  const handleCambiarDelegacion = useCallback(
    (delegacionId?: string, delegacionNombre?: string) => {
      setFiltros((prev) => ({ ...prev, delegacionId, delegacionNombre, pagina: 1 }));
    },
    []
  );

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

  // Flujo de solicitud y confirmación de eliminación (HU-56)
  const handleSolicitarEliminar = useCallback((punto: PuntoCriticoItem) => {
    setPuntoAEliminar(punto);
    setErrorBloqueo(null);
    setModalEliminarAbierto(true);
  }, []);

  const handleConfirmarEliminar = async () => {
    if (!puntoAEliminar) return;
    setEliminando(true);
    setErrorBloqueo(null);

    try {
      const res = await eliminarPuntoCritico(puntoAEliminar.id, usuarioActivo.id);
      removerPuntoLocalmente(puntoAEliminar.id);

      showSuccess(
        res.message || `El punto crítico '${puntoAEliminar.nombre}' fue eliminado correctamente.`,
        'Punto crítico eliminado'
      );

      setModalEliminarAbierto(false);
      setPuntoAEliminar(null);
    } catch (err: unknown) {
      if (err instanceof PuntoCriticoServiceError) {
        if (err.apiError.statusCode === 409) {
          // Mantener modal abierto con el mensaje explicativo de bloqueo
          setErrorBloqueo(err.apiError.message);
        } else {
          showError(err.apiError.message, 'No fue posible eliminar el punto crítico');
        }
      } else {
        showError((err as Error)?.message || 'Error inesperado al eliminar el punto crítico');
      }
    } finally {
      setEliminando(false);
    }
  };

  // Flujo de guardado exitoso de edición (HU-55)
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
    statusCode === 403 || (!cargando && !tienePermisoLectura && statusCode !== 200);

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

  // En el catálogo operativo y mapa solo deben verse puntos críticos activos (HU-56)
  const puntosActivos = puntosCriticos.filter((p) => p.activo !== false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <PuntosCriticosHeader
        totalPuntos={puntosActivos.length}
        tieneAcceso={true}
        puedeCrear={puedeCrear}
      />

      <PuntosCriticosFiltros
        busqueda={filtros.busqueda || ''}
        delegacionId={filtros.delegacionId}
        delegacionNombre={filtros.delegacionNombre}
        prioridad={filtros.prioridad}
        onCambiarBusqueda={handleCambiarBusqueda}
        onCambiarDelegacion={handleCambiarDelegacion}
        onCambiarPrioridad={handleCambiarPrioridad}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      {/* Barra de Modos de Visualización (Tabla / Mapa) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '10px 16px',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
          Modo de Visualización:
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="button"
            variant={vista === 'tabla' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVista('tabla')}
            icon={<Table size={14} aria-hidden="true" />}
          >
            Vista Tabla
          </Button>

          <Button
            type="button"
            variant={vista === 'mapa' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVista('mapa')}
            icon={<Map size={14} aria-hidden="true" />}
          >
            Vista Mapa (Cartográfico)
          </Button>
        </div>
      </div>

      {/* Contenido según vista seleccionada */}
      {vista === 'tabla' ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <PuntosCriticosTabla
            puntosCriticos={puntosActivos}
            cargando={cargando}
            esFiltroActivo={esFiltroActivo}
            onLimpiarFiltros={handleLimpiarFiltros}
            onSeleccionarPunto={setPuntoSeleccionado}
            onEditar={setPuntoParaEditar}
            onEliminarPunto={handleSolicitarEliminar}
            puedeEliminar={puedeEliminar}
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PuntosCriticosMapa
            puntos={puntosActivos}
            onEliminarPunto={handleSolicitarEliminar}
            onSeleccionarPunto={setPuntoSeleccionado}
            puedeEliminar={puedeEliminar}
          />
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', paddingLeft: '4px' }}>
            Haga clic en un marcador para desplegar los detalles del punto crítico y acceder a la acción de desactivación.
          </div>
        </div>
      )}

      {/* Modal de Detalle de Atributos del Punto Crítico */}
      <PuntoCriticoDetalleModal
        punto={puntoSeleccionado}
        onCerrar={() => setPuntoSeleccionado(null)}
        onEditar={setPuntoParaEditar}
        onEliminar={handleSolicitarEliminar}
        puedeEliminar={puedeEliminar}
      />

      {/* Modal de Confirmación de Desactivación / Eliminación (HU-56) */}
      <PuntoCriticoEliminarModal
        punto={puntoAEliminar}
        isOpen={modalEliminarAbierto}
        isSubmitting={eliminando}
        errorBloqueo={errorBloqueo}
        onClose={() => {
          if (!eliminando) {
            setModalEliminarAbierto(false);
            setPuntoAEliminar(null);
            setErrorBloqueo(null);
          }
        }}
        onConfirm={handleConfirmarEliminar}
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
