'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Plus, HardHat } from 'lucide-react';
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

export default function CuadrillasAdminClient() {
  const { showSuccess } = useToast();
  const { hasPermission, isMounted } = useSimulatedSession();

  const puedeCrear = Boolean(isMounted && hasPermission('recursos:crear'));
  const puedeEditar = Boolean(isMounted && hasPermission('recursos:editar'));

  // Estados de modales
  const [cuadrillaAEditar, setCuadrillaAEditar] = useState<CuadrillaItem | null>(null);
  const [cuadrillaDetalle, setCuadrillaDetalle] = useState<CuadrillaItem | null>(null);

  // Delegaciones para selector de filtro
  const [delegaciones, setDelegaciones] = useState<DelegacionResumen[]>([]);

  // Filtros de listado
  const [filtros, setFiltros] = useState<FiltrosCuadrillasState>({
    pagina: 1,
    limite: 10,
    busqueda: '',
    delegacionId: undefined,
    estado: undefined,
  });

  const {
    cuadrillas,
    meta,
    cargando,
    recargar,
    actualizarCuadrillaEnLista,
  } = useCuadrillas(filtros);

  // Carga de delegaciones
  useEffect(() => {
    let activo = true;
    cuadrillasService.obtenerDelegaciones().then((res) => {
      if (activo) setDelegaciones(res);
    });
    return () => {
      activo = false;
    };
  }, []);

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

        <Link href="/gestion/admin/cuadrillas/nuevo" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={16} />}>
            Registrar Nueva Cuadrilla
          </Button>
        </Link>
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

      {/* Tabla de Cuadrillas */}
      <CuadrillasTabla
        cuadrillas={cuadrillas}
        cargando={cargando}
        puedeEditar={puedeEditar}
        onEditarCuadrilla={(c) => setCuadrillaAEditar(c)}
        onVerDetalle={(c) => setCuadrillaDetalle(c)}
      />

      {/* Paginación */}
      <Pagination
        paginaActual={filtros.pagina}
        totalPaginas={meta.paginasTotales}
        totalItems={meta.total}
        limite={filtros.limite}
        nombreEntidad="cuadrillas"
        onCambiarPagina={(nuevaPagina) => setFiltros((prev) => ({ ...prev, pagina: nuevaPagina }))}
        onCambiarLimite={(nuevoLimite) => setFiltros((prev) => ({ ...prev, limite: nuevoLimite, pagina: 1 }))}
      />

      {/* Drawer de Detalle */}
      <CuadrillaDetalleDrawer
        cuadrilla={cuadrillaDetalle}
        isOpen={Boolean(cuadrillaDetalle)}
        puedeEditar={puedeEditar}
        onCerrar={() => setCuadrillaDetalle(null)}
        onEditar={(c) => {
          setCuadrillaDetalle(null);
          setCuadrillaAEditar(c);
        }}
      />

      {/* Modal de Edición (H81) */}
      <CuadrillaEditarModal
        cuadrilla={cuadrillaAEditar}
        isOpen={Boolean(cuadrillaAEditar)}
        onCerrar={() => setCuadrillaAEditar(null)}
        onGuardadoExitoso={handleGuardadoExitoso}
      />
    </div>
  );
}
