'use client';

import React, { useState, useCallback } from 'react';
import { PackagePlus, RefreshCw, Loader2, Package, RotateCcw } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { useOperativosRecuperacion } from '@/hooks/useOperativosRecuperacion';
import type { DelegacionOpcion } from '@/types/incidentesKpis';
import { OperativosRecuperacionFiltros } from './OperativosRecuperacionFiltros';
import { OperativosRecuperacionTabla } from './OperativosRecuperacionTabla';
import { OperativoRecuperacionDrawer } from './OperativoRecuperacionDrawer';
import styles from './OperativosRecuperacion.module.css';

export interface OperativosRecuperacionViewProps {
  delegaciones: DelegacionOpcion[];
  onCrearRecuperacion?: () => void;
  refreshSignal?: number;
}

export const OperativosRecuperacionView: React.FC<OperativosRecuperacionViewProps> = ({
  delegaciones,
  onCrearRecuperacion,
  refreshSignal = 0,
}) => {
  const {
    operativos,
    meta,
    filtros,
    setFiltros,
    limpiarFiltros,
    page,
    setPage,
    limit,
    setLimit,
    ordenarPor,
    orden,
    toggleOrden,
    cargando,
    error,
    esForbidden,
    recargar,
  } = useOperativosRecuperacion({ enabled: true, refreshSignal });

  const [operativoSeleccionadoId, setOperativoSeleccionadoId] = useState<string | null>(null);

  const handleCerrarDrawer = useCallback(() => {
    setOperativoSeleccionadoId(null);
  }, []);

  const hayFiltrosActivos = Boolean(
    filtros.delegacionId ||
      filtros.estado ||
      filtros.prioridad ||
      filtros.busqueda.trim() ||
      filtros.fechaDesde ||
      filtros.fechaHasta
  );

  if (esForbidden) {
    return (
      <AccesoDenegadoState
        modulo="los Operativos de Recuperación"
        mensajePersonalizado="No posee el permiso requerido (recuperacion:leer) para consultar los operativos de recuperación. Esta vista está habilitada para los roles Administrador, Encargado y Supervisor."
        botonVolverHref="/gestion"
        botonVolverTexto="Volver al Inicio"
      />
    );
  }

  return (
    <section className={styles.container} aria-label="Listado de operativos de recuperación">
      <div className={styles.toolbarRow}>
        <div className={styles.toolbarTitleGroup}>
          <Heading as="h2" variant="h3" color="teal">
            Operativos de Recuperación Post-Desastre
          </Heading>
        </div>

        <div className={styles.toolbarActions}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={
              <RefreshCw
                size={14}
                className={cargando ? styles.spinIcon : undefined}
              />
            }
            onClick={recargar}
            disabled={cargando}
          >
            Actualizar
          </Button>

          {onCrearRecuperacion && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<PackagePlus size={14} />}
              onClick={onCrearRecuperacion}
            >
              Nuevo Operativo de Recuperación
            </Button>
          )}
        </div>
      </div>

      <OperativosRecuperacionFiltros
        filtros={filtros}
        delegaciones={delegaciones}
        onFiltrosChange={setFiltros}
        onLimpiarFiltros={limpiarFiltros}
      />

      {cargando ? (
        <div className={styles.loadingState} role="status" aria-live="polite">
          <Loader2 size={28} className={styles.spinIcon} />
          <span>Cargando operativos de recuperación...</span>
        </div>
      ) : error ? (
        <div className={styles.errorState} role="alert">
          <InlineNotice variant="error">{error}</InlineNotice>
          <div className={styles.errorActions}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={recargar}
            >
              Reintentar
            </Button>
          </div>
        </div>
      ) : operativos.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No se encontraron operativos de recuperación"
          description={
            hayFiltrosActivos
              ? 'No hay operativos registrados que coincidan con los filtros seleccionados.'
              : 'Aún no se han registrado operativos de recuperación en el sistema.'
          }
          action={
            <div className={styles.emptyActions}>
              {hayFiltrosActivos && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw size={14} />}
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </Button>
              )}
              {onCrearRecuperacion && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={<PackagePlus size={14} />}
                  onClick={onCrearRecuperacion}
                >
                  Registrar Operativo de Recuperación
                </Button>
              )}
            </div>
          }
        />
      ) : (
        <>
          <OperativosRecuperacionTabla
            operativos={operativos}
            selectedId={operativoSeleccionadoId}
            ordenarPor={ordenarPor}
            orden={orden}
            onToggleOrden={toggleOrden}
            onSelectOperativo={(id) => setOperativoSeleccionadoId(id)}
          />

          <Pagination
            paginaActual={meta.page || page}
            totalPaginas={meta.totalPages}
            totalItems={meta.total}
            limite={meta.limit || limit}
            opcionesLimite={[10, 25, 50]}
            nombreEntidad="operativos"
            onCambiarPagina={setPage}
            onCambiarLimite={setLimit}
          />
        </>
      )}

      <OperativoRecuperacionDrawer
        operativoId={operativoSeleccionadoId}
        onCerrar={handleCerrarDrawer}
      />
    </section>
  );
};
