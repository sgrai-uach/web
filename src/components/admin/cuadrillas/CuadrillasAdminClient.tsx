'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { AlertCircle, Plus } from 'lucide-react';
import type {
  CuadrillaItem,
  FiltrosCuadrillasState,
  DelegacionResumen,
} from '@/types/cuadrilla';
import { useCuadrillas } from '@/hooks/useCuadrillas';
import { cuadrillasService } from '@/services/cuadrillasService';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Pagination from '@/components/common/Pagination';
import CuadrillasFiltros from '@/components/admin/cuadrillas/CuadrillasFiltros';
import CuadrillasTabla from '@/components/admin/cuadrillas/CuadrillasTabla';
import CuadrillaDetalleDrawer from '@/components/admin/cuadrillas/CuadrillaDetalleDrawer';
import CuadrillaEditarModal from '@/components/admin/cuadrillas/CuadrillaEditarModal';
import CuadrillaDesactivarModal from '@/components/admin/cuadrillas/CuadrillaDesactivarModal';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';

export default function CuadrillasAdminClient() {
  const { showSuccess, showError } = useToast();
  const { usuarioActivo, hasPermission, isMounted } = useSimulatedSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const esAdmin = Boolean(
    usuarioActivo?.rol === 'Administrador' ||
      usuarioActivo?.esAdmin
  );

  // Bloqueo perimetral RBAC (H80) con bypass de administrador (HU-82)
  const puedeLeer = Boolean(isMounted && (hasPermission('recursos:leer') || esAdmin));
  const puedeCrear = Boolean(isMounted && (hasPermission('recursos:crear') || esAdmin));
  const puedeEditar = Boolean(isMounted && (hasPermission('recursos:editar') || esAdmin));
  const puedeEliminar = Boolean(
    isMounted && (hasPermission('cuadrillas:eliminar') || esAdmin)
  );

  // Estados de modales
  const [cuadrillaAEditar, setCuadrillaAEditar] = useState<CuadrillaItem | null>(null);
  const [cuadrillaADesactivar, setCuadrillaADesactivar] = useState<CuadrillaItem | null>(null);
  const [cuadrillaDetalle, setCuadrillaDetalle] = useState<CuadrillaItem | null>(null);
  const [desactivando, setDesactivando] = useState<boolean>(false);

  // Delegaciones para selector de filtro
  const [delegaciones, setDelegaciones] = useState<DelegacionResumen[]>([]);

  // Filtros de listado (inicializados desde la URL para respetar el contrato H34)
  const [filtros, setFiltros] = useState<FiltrosCuadrillasState>(() => {
    const paginaUrl = parseInt(searchParams?.get('page') || '1', 10);
    return {
      pagina: Number.isNaN(paginaUrl) || paginaUrl < 1 ? 1 : paginaUrl,
      limite: 10,
      busqueda: searchParams?.get('q') || '',
      delegacionId: searchParams?.get('delegacionId') || undefined,
      estado: searchParams?.get('estado') || undefined,
    };
  });

  const {
    cuadrillas,
    meta,
    cargando,
    error,
    errorStatus,
    recargar,
    actualizarCuadrillaEnLista,
    removerCuadrillaDeLista,
  } = useCuadrillas(filtros);

  // Sincronización de filtros con URLSearchParams sin recargar la vista
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
    if (filtros.estado) {
      params.set('estado', filtros.estado);
    }
    if (filtros.pagina > 1) {
      params.set('page', String(filtros.pagina));
    }

    const queryString = params.toString();
    const rutaActual = pathname ?? '';
    window.history.replaceState(null, '', queryString ? `${rutaActual}?${queryString}` : rutaActual);
  }, [filtros, pathname]);

  // Carga de delegaciones
  useEffect(() => {
    if (!puedeLeer) return;
    let activo = true;
    cuadrillasService.obtenerDelegaciones().then((res) => {
      if (activo) setDelegaciones(res);
    });
    return () => {
      activo = false;
    };
  }, [puedeLeer]);

  const handleBusquedaChange = useCallback((busqueda: string) => {
    setFiltros((prev) => ({ ...prev, busqueda, pagina: 1 }));
  }, []);

  const handleDelegacionChange = useCallback((delegacionId?: string) => {
    setFiltros((prev) => ({ ...prev, delegacionId, pagina: 1 }));
  }, []);

  const handleEstadoChange = useCallback((estado?: string) => {
    setFiltros((prev) => ({ ...prev, estado, pagina: 1 }));
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      pagina: 1,
      limite: 10,
      busqueda: '',
      delegacionId: undefined,
      estado: undefined,
    });
  }, []);

  const handleGuardadoExitoso = useCallback(
    (cuadrillaActualizada: CuadrillaItem) => {
      actualizarCuadrillaEnLista(cuadrillaActualizada);
      if (cuadrillaDetalle && cuadrillaDetalle.id === cuadrillaActualizada.id) {
        setCuadrillaDetalle(cuadrillaActualizada);
      }
      showSuccess(
        `La cuadrilla "${cuadrillaActualizada.nombre}" ha sido actualizada exitosamente.`,
        'Cuadrilla Actualizada'
      );
    },
    [actualizarCuadrillaEnLista, cuadrillaDetalle, showSuccess]
  );

  const tieneFiltrosActivos = Boolean(
    filtros.busqueda?.trim() || filtros.delegacionId || filtros.estado
  );

  const handleConfirmarDesactivar = useCallback(async () => {
    if (!cuadrillaADesactivar) return;
    try {
      setDesactivando(true);
      const res = await cuadrillasService.desactivarCuadrilla(cuadrillaADesactivar.id);

      // Si el filtro no incluye inactivas, remover de la lista local
      if (!filtros.estado || filtros.estado === 'ACTIVAS' || filtros.estado === 'DISPONIBLE') {
        removerCuadrillaDeLista(cuadrillaADesactivar.id);
      } else {
        actualizarCuadrillaEnLista({
          ...cuadrillaADesactivar,
          activo: false,
          estado: 'NO_DISPONIBLE',
          recursos: [],
          trabajadores: [],
          totalRecursos: 0,
          totalTrabajadores: 0,
          eliminadoEn: res.eliminadoEn || new Date().toISOString(),
          eliminadoPorId: res.eliminadoPorId,
        });
      }

      if (cuadrillaDetalle && cuadrillaDetalle.id === cuadrillaADesactivar.id) {
        setCuadrillaDetalle(null);
      }

      showSuccess(
        `La cuadrilla "${cuadrillaADesactivar.nombre}" ha sido desactivada exitosamente. Se desvincularon ${res.recursosDesvinculados} recursos y ${res.trabajadoresDesvinculados} trabajadores.`,
        'Cuadrilla Desactivada'
      );
      setCuadrillaADesactivar(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al intentar desactivar la cuadrilla.';
      showError(msg, 'No se pudo desactivar');
    } finally {
      setDesactivando(false);
    }
  }, [
    cuadrillaADesactivar,
    filtros.estado,
    removerCuadrillaDeLista,
    actualizarCuadrillaEnLista,
    cuadrillaDetalle,
    showSuccess,
    showError,
  ]);

  if (!isMounted) {
    return null;
  }

  // Bloqueo perimetral RBAC: sin recursos:leer no se expone ningún dato municipal.
  if (!puedeLeer || errorStatus === 401 || errorStatus === 403) {
    return (
      <AccesoDenegadoState
        rolUsuario={usuarioActivo.rol}
        modulo="el Listado de Cuadrillas Operativas"
        permisoRequerido="recursos:leer"
        mensajePersonalizado="Se requieren credenciales de Administrador o Encargado con permiso recursos:leer para consultar la dotación de cuadrillas operativas."
        botonVolverHref="/gestion"
        botonVolverTexto="Volver al Inicio"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Miga de Pan (Breadcrumb) */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--color-charcoal)',
        }}
      >
        <Link href="/gestion" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
          Inicio
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Cuadrillas Operativas</span>
      </nav>

      {/* Cabecera Principal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-white)',
          padding: '24px',
          borderLeft: '5px solid var(--color-primary-teal)',
          borderBottom: '1px solid var(--color-bg-light)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <Heading as="h1" variant="h1" color="teal-dark" noMargin>
            Cuadrillas Operativas
          </Heading>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              color: 'var(--color-charcoal)',
            }}
          >
            Gestión y dotación de unidades pesadas para despeje, vialidad y mitigación ante emergencias comunales.
          </p>
        </div>

        {puedeCrear && (
          <Link href="/gestion/admin/cuadrillas/nuevo" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={<Plus size={16} />}>
              Registrar Nueva Cuadrilla
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <CuadrillasFiltros
        busqueda={filtros.busqueda || ''}
        delegacionId={filtros.delegacionId}
        estado={filtros.estado}
        delegaciones={delegaciones}
        onBusquedaChange={handleBusquedaChange}
        onDelegacionChange={handleDelegacionChange}
        onEstadoChange={handleEstadoChange}
        onLimpiar={handleLimpiarFiltros}
      />

      {/* Alerta de error con reintento */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '14px 18px',
            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
            borderLeft: '4px solid var(--color-danger, #D32F2F)',
            color: 'var(--color-text-dark)',
            fontSize: '13px',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ color: 'var(--color-danger, #D32F2F)', flexShrink: 0 }} />
            <span>
              <strong>No fue posible cargar las cuadrillas operativas.</strong> {error}
            </span>
          </span>
          <Button variant="outline" size="sm" onClick={() => void recargar()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla de Cuadrillas */}
      {!error && (
        <CuadrillasTabla
          cuadrillas={cuadrillas}
          cargando={cargando}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          tieneFiltrosActivos={tieneFiltrosActivos}
          onLimpiarFiltros={handleLimpiarFiltros}
          onEditarCuadrilla={(c) => setCuadrillaAEditar(c)}
          onVerDetalle={(c) => setCuadrillaDetalle(c)}
          onDesactivarCuadrilla={(c) => setCuadrillaADesactivar(c)}
        />
      )}

      {/* Paginación */}
      {!error && (
        <Pagination
          paginaActual={filtros.pagina}
          totalPaginas={meta.paginasTotales}
          totalItems={meta.total}
          limite={filtros.limite}
          nombreEntidad="cuadrillas"
          onCambiarPagina={(nuevaPagina) => setFiltros((prev) => ({ ...prev, pagina: nuevaPagina }))}
          onCambiarLimite={(nuevoLimite) => setFiltros((prev) => ({ ...prev, limite: nuevoLimite, pagina: 1 }))}
        />
      )}

      {/* Drawer de Detalle */}
      <CuadrillaDetalleDrawer
        cuadrilla={cuadrillaDetalle}
        isOpen={Boolean(cuadrillaDetalle)}
        puedeEditar={puedeEditar}
        puedeEliminar={puedeEliminar}
        onCerrar={() => setCuadrillaDetalle(null)}
        onEditar={(c) => {
          setCuadrillaDetalle(null);
          setCuadrillaAEditar(c);
        }}
        onDesactivar={(c) => {
          setCuadrillaDetalle(null);
          setCuadrillaADesactivar(c);
        }}
      />

      {/* Modal de Edición (H81) */}
      <CuadrillaEditarModal
        cuadrilla={cuadrillaAEditar}
        isOpen={Boolean(cuadrillaAEditar)}
        onCerrar={() => setCuadrillaAEditar(null)}
        onGuardadoExitoso={handleGuardadoExitoso}
      />

      {/* Modal de Desactivación (HU-82) */}
      <CuadrillaDesactivarModal
        cuadrilla={cuadrillaADesactivar}
        desactivando={desactivando}
        onConfirmar={handleConfirmarDesactivar}
        onCancelar={() => setCuadrillaADesactivar(null)}
      />
    </div>
  );
}
