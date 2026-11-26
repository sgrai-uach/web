'use client';

import React, { useCallback, useContext, useRef, useState } from 'react';
import { PackagePlus, RefreshCw, Loader2, Package } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { useOptionalToast } from '@/components/ui/Toast';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { useOperativosRecuperacion } from '@/hooks/useOperativosRecuperacion';
import { usePuedeEditarRecuperacion } from '@/hooks/usePuedeEditarRecuperacion';
import { obtenerDetalleOperativoRecuperacion } from '@/services/recuperacionService';
import type { OperativoRecuperacionDetalle } from '@/types/recuperacion';
import type { DelegacionOpcion } from '@/types/incidentesKpis';
import { OperativosRecuperacionFiltros } from './OperativosRecuperacionFiltros';
import { OperativosRecuperacionTabla } from './OperativosRecuperacionTabla';
import { OperativoRecuperacionDrawer } from './OperativoRecuperacionDrawer';
import { ModalEditarOperativoRecuperacion } from './ModalEditarOperativoRecuperacion';
import styles from './OperativosRecuperacion.module.css';

export interface OperativosRecuperacionViewProps {
  delegaciones: DelegacionOpcion[];
  onCrearRecuperacion?: () => void;
  refreshSignal?: number;
}

export const OperativosRecuperacionView: React.FC<OperativosRecuperacionViewProps> = ({
  delegaciones,
  onCrearRecuperacion,
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
  } = useOperativosRecuperacion({ enabled: true });

  const toast = useOptionalToast();
  const auth = useContext(AuthContext);
  const simulated = useContext(SimulatedSessionContext);
  const activeUserId = auth?.estaAutenticado
    ? auth.usuario?.id
    : simulated?.usuarioActivo?.id;
  const puedeEditar = usePuedeEditarRecuperacion();
  const [operativoSeleccionadoId, setOperativoSeleccionadoId] = useState<string | null>(null);
  const [operativoEditando, setOperativoEditando] =
    useState<OperativoRecuperacionDetalle | null>(null);
  const [cargandoEdicionId, setCargandoEdicionId] = useState<string | null>(null);
  const edicionRequestSeqRef = useRef<number>(0);

  const handleCerrarDrawer = useCallback(() => {
    setOperativoSeleccionadoId(null);
  }, []);

  const handleAbrirEdicionDirecta = async (id: string) => {
    const requestSeq = ++edicionRequestSeqRef.current;
    setCargandoEdicionId(id);
    try {
      const detalle = await obtenerDetalleOperativoRecuperacion(id);
      if (requestSeq !== edicionRequestSeqRef.current) return;
      if (detalle.estado === 'COMPLETADA' || detalle.estado === 'CANCELADA') {
        toast?.showError(
          'No se permite editar un operativo en estado COMPLETADA o CANCELADA.'
        );
        recargar();
        return;
      }
      setOperativoEditando(detalle);
    } catch (err: unknown) {
      if (requestSeq !== edicionRequestSeqRef.current) return;
      toast?.showError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar el operativo para editar.'
      );
    } finally {
      if (requestSeq === edicionRequestSeqRef.current) {
        setCargandoEdicionId(null);
      }
    }
  };

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
            onClick={recargar}
            disabled={cargando}
          >
            <RefreshCw
              size={14}
              style={{ marginRight: '6px' }}
              className={cargando ? styles.spinIcon : undefined}
            />
            <span>Actualizar</span>
          </Button>

          {onCrearRecuperacion && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onCrearRecuperacion}
            >
              <PackagePlus size={14} style={{ marginRight: '6px' }} />
              <span>Nuevo Operativo de Recuperación</span>
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

      {error && !esForbidden && (
        <InlineNotice variant="error">{error}</InlineNotice>
      )}

      {cargando ? (
        <div className={styles.loadingState} role="status" aria-live="polite">
          <Loader2 size={28} className={styles.spinIcon} />
          <span>Cargando operativos de recuperación...</span>
        </div>
      ) : operativos.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No se encontraron operativos de recuperación"
          description="No hay operativos registrados que coincidan con los filtros seleccionados."
          action={
            onCrearRecuperacion ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onCrearRecuperacion}
              >
                <PackagePlus size={14} style={{ marginRight: '6px' }} />
                <span>Registrar Operativo de Recuperación</span>
              </Button>
            ) : undefined
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
            puedeEditar={puedeEditar}
            cargandoEdicionId={cargandoEdicionId}
            onEditarOperativo={handleAbrirEdicionDirecta}
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
        onOperativoActualizado={recargar}
      />

      {operativoEditando && (
        <ModalEditarOperativoRecuperacion
          isOpen={true}
          operativo={operativoEditando}
          userId={activeUserId}
          onClose={() => setOperativoEditando(null)}
          onSuccess={() => {
            setOperativoEditando(null);
            recargar();
          }}
        />
      )}
    </section>
  );
};
